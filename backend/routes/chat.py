import json
import logging
import os
import subprocess
import asyncio
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select
from sse_starlette.sse import EventSourceResponse

logger = logging.getLogger(__name__)

from db import get_session
from middleware.auth_middleware import get_current_user
from models.conversation import Conversation
from models.user import User
from services.chat_service import load_or_create_conversation, load_history, save_message

router = APIRouter()

SYSTEM_PROMPT_TEMPLATE = (
    "You are a helpful task management assistant for user {user_id}.\n"
    "You help users manage their to-do list through natural language conversation.\n\n"
    "Rules:\n"
    '- Always use user_id="{user_id}" in every tool call. Never use any other user_id.\n'
    "- When a user references a task by name (not ID), call list_tasks first to find the ID.\n"
    "- Always confirm actions with a friendly, concise message.\n"
    "- If a task is not found, say so clearly and offer to list existing tasks.\n"
    "- If multiple tasks match a name, list them and ask which one the user means.\n"
    "- Never fabricate task IDs — only use IDs from tool results.\n"
    "- Handle errors gracefully without exposing technical details."
)

# Absolute path to mcp_server.py so subprocess works from any working directory
_MCP_SERVER_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "mcp_server.py"
)


class ChatRequest(BaseModel):
    conversation_id: Optional[int] = None
    message: str


def _enforce_user(user_id: int, current_user: User) -> None:
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")


@router.post("/{user_id}/chat")
async def chat(
    user_id: int,
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _enforce_user(user_id, current_user)

    async def event_stream():
        try:
            from openai import AsyncOpenAI
            from agents import Agent, Runner, OpenAIChatCompletionsModel
            from agents.mcp import MCPServerStdio
            from agents.stream_events import RawResponsesStreamEvent, RunItemStreamEvent

            conv = load_or_create_conversation(session, user_id, req.conversation_id)
            history = load_history(session, conv.id)
            save_message(session, conv.id, user_id, "user", req.message)

            # Build message list: history + new user message
            messages = history + [{"role": "user", "content": req.message}]

            groq_client = AsyncOpenAI(
                api_key=os.getenv("GROQ_API_KEY"),
                base_url="https://api.groq.com/openai/v1",
            )
            model = OpenAIChatCompletionsModel(
                model="llama-3.3-70b-versatile",
                openai_client=groq_client,
            )

            tool_calls: list[str] = []
            full_response = ""

            async with MCPServerStdio(
                params={"command": "python", "args": [_MCP_SERVER_PATH], "env": os.environ.copy()},
                cache_tools_list=True,
                client_session_timeout_seconds=30.0,
            ) as mcp:
                agent = Agent(
                    name="taskify",
                    instructions=SYSTEM_PROMPT_TEMPLATE.format(user_id=str(user_id)),
                    model=model,
                    mcp_servers=[mcp],
                )
                streamed = Runner.run_streamed(agent, messages)

                async for event in streamed.stream_events():
                    if isinstance(event, RawResponsesStreamEvent):
                        data = event.data
                        if getattr(data, "type", None) == "response.output_text.delta":
                            delta = getattr(data, "delta", "")
                            if delta:
                                full_response += delta
                                yield {
                                    "data": json.dumps({
                                        "type": "delta",
                                        "delta": delta,
                                    })
                                }
                    elif isinstance(event, RunItemStreamEvent):
                        if event.name == "tool_called":
                            try:
                                raw = getattr(event.item, "raw_item", None)
                                tool_name = getattr(raw, "name", None) or "tool"
                                tool_calls.append(tool_name)
                                yield {
                                    "data": json.dumps({
                                        "type": "tool_called",
                                        "tool": tool_name,
                                    })
                                }
                            except Exception:
                                pass

            response_text = streamed.final_output or full_response

            save_message(session, conv.id, user_id, "assistant", response_text)
            conv.updated_at = datetime.utcnow()
            session.add(conv)
            session.commit()

            yield {
                "data": json.dumps({
                    "type": "done",
                    "conversation_id": conv.id,
                    "response": response_text,
                    "tool_calls": tool_calls,
                })
            }

        except (subprocess.SubprocessError, ConnectionError, asyncio.TimeoutError) as e:
            logger.exception("cold_start error: %s", e)
            yield {
                "data": json.dumps({
                    "type": "error",
                    "error_type": "cold_start",
                    "error": "Starting up, please wait…",
                    "retry_after": None,
                })
            }
        except Exception as e:
            # Check for Groq rate limit (HTTP 429 from openai SDK)
            status_code = getattr(e, "status_code", None) or getattr(getattr(e, "response", None), "status_code", None)
            if status_code == 429:
                logger.exception("rate_limit error: %s", e)
                yield {
                    "data": json.dumps({
                        "type": "error",
                        "error_type": "rate_limit",
                        "error": "Too many requests — try again shortly.",
                        "retry_after": 30,
                    })
                }
            else:
                logger.exception("service_error: %s", e)
                yield {
                    "data": json.dumps({
                        "type": "error",
                        "error_type": "service_error",
                        "error": "Something went wrong — please try again.",
                        "retry_after": None,
                    })
                }

    return EventSourceResponse(event_stream())


@router.get("/{user_id}/conversations/latest")
def get_latest_conversation(
    user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _enforce_user(user_id, current_user)
    conv = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    ).first()
    if conv is None:
        return {"conversation_id": None}
    return {
        "conversation_id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat(),
    }


@router.get("/{user_id}/conversations/{conversation_id}/messages")
def get_conversation_messages(
    user_id: int,
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _enforce_user(user_id, current_user)
    from models.message import Message

    conv = session.exec(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user_id,
        )
    ).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(20)
    ).all()
    return messages
