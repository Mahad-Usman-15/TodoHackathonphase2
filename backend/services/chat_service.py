from sqlmodel import Session, select
from datetime import datetime
from typing import Optional

from models.conversation import Conversation
from models.message import Message


def load_or_create_conversation(
    session: Session,
    user_id: int,
    conversation_id: Optional[int] = None
) -> Conversation:
    if conversation_id is not None:
        conv = session.exec(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            )
        ).first()
        if conv:
            return conv

    # Fetch latest conversation for this user
    conv = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    ).first()

    if conv:
        return conv

    # Create new conversation
    conv = Conversation(user_id=user_id)
    session.add(conv)
    session.commit()
    session.refresh(conv)
    return conv


def load_history(session: Session, conversation_id: int, limit: int = 20) -> list[dict]:
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    ).all()
    return [{"role": msg.role, "content": msg.content} for msg in messages]


def save_message(
    session: Session,
    conversation_id: int,
    user_id: int,
    role: str,
    content: str
) -> Message:
    msg = Message(
        conversation_id=conversation_id,
        user_id=user_id,
        role=role,
        content=content
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)
    return msg
