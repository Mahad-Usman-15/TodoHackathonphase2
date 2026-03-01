# Research: 004 — AI Chatbot for Task Management

**Phase**: 0 — Research
**Date**: 2026-02-28
**Feature**: 004-ai-chatbot

---

## Decision 1: LLM Provider

**Decision**: Groq (free tier) with `llama-3.3-70b-versatile` model via OpenAI-compatible API.

**Rationale**: Groq provides a free API with OpenAI-compatible endpoints (`base_url=https://api.groq.com/openai/v1`). This means the OpenAI Agents SDK works without any code changes — only `base_url` and `model` need to differ from a standard OpenAI setup. `llama-3.3-70b-versatile` is a strong instruction-following model with excellent tool-calling capabilities. Free tier limits: ~30 req/min, 6000 tokens/min — sufficient for a hackathon demo.

**Alternatives considered**:
- OpenAI GPT-4o: Requires paid API key, not free-tier compatible.
- Anthropic Claude: Different SDK, would require rewriting agent logic.
- Ollama local: Not suitable for Render cloud deployment.

---

## Decision 2: MCP Transport — stdio (subprocess)

**Decision**: MCP server runs as a Python subprocess invoked by `MCPServerStdio` from the OpenAI Agents SDK. No separate HTTP service or network port.

**Rationale**: The `mcp` Python SDK supports `stdio` transport natively. The OpenAI Agents SDK's `MCPServerStdio` class spawns `mcp_server.py` as a subprocess and communicates via stdin/stdout. This runs entirely within the single Render web service process — no separate deployment, no Render service fee, no network latency. The subprocess is spawned fresh per request (or kept alive in agent context — either works for hackathon).

**Alternatives considered**:
- MCP over HTTP (SSE transport): Requires a second Render service, costs money, adds network hop.
- FastAPI endpoint calling tools directly: Bypasses MCP entirely, misses the hackathon evaluation criterion.

---

## Decision 3: OpenAI Agents SDK Integration Pattern

**Decision**: Use `openai-agents` Python package with `Runner.run_sync()` (not async) inside FastAPI's `run_in_executor` for SSE streaming. Agent receives message history + new message as input.

**Rationale**: `openai-agents` provides `Runner` class with sync and async run modes. Since FastAPI is async and the MCP subprocess can block, we use `asyncio.get_event_loop().run_in_executor(None, runner.run_sync, ...)` or the async `Runner.run()`. SSE is implemented via FastAPI's `StreamingResponse` with `EventSourceResponse` (or manual SSE format). Each request: build agent → attach MCP server → run with history → return text events.

**Groq API configuration**:
```python
from openai import AsyncOpenAI
client = AsyncOpenAI(
    api_key=os.getenv("GROQ_API_KEY"),
    base_url="https://api.groq.com/openai/v1"
)
```
The `openai-agents` SDK accepts a custom `OpenAI` client, which supports Groq transparently.

**Alternatives considered**:
- LangChain: Heavy dependency, not in approved stack.
- Direct OpenAI API calls: Loses the agent loop / tool-calling abstraction.

---

## Decision 4: SSE Streaming Pattern in FastAPI

**Decision**: Use `fastapi-sse` or manual SSE with `StreamingResponse` + `text/event-stream` content type. Stream individual text chunks as they arrive from the agent.

**Rationale**: FastAPI `StreamingResponse` with `media_type="text/event-stream"` is the standard pattern. Each chunk is formatted as `data: {json}\n\n`. The final event includes `conversation_id`, `response` (full text), and `tool_calls` array. The ChatKit frontend consumes this stream natively.

**SSE event format**:
```
data: {"delta": "I've ", "type": "text"}\n\n
data: {"delta": "added", "type": "text"}\n\n
data: {"conversation_id": 42, "response": "I've added the task!", "tool_calls": [...], "type": "done"}\n\n
```

---

## Decision 5: Conversation History Loading Strategy

**Decision**: Load the last 20 messages for a given conversation from the `messages` table, ordered by `created_at ASC`. Pass them to the agent as the message history array.

**Rationale**: 20 messages ≈ 10 turns of back-and-forth. At ~200 tokens/message average, that's ~4000 tokens of history — well within Groq's 6000 token/min limit and llama's 128k context window. Truncating at 20 prevents runaway context accumulation on long conversations. The most recent messages are the most contextually relevant.

**Alternatives considered**:
- Full history: Risk hitting token limits on long conversations.
- Summarization: Too complex for hackathon scope.
- 10 messages: Too short for meaningful context retention.

---

## Decision 6: New Conversation Default Load Behavior

**Decision**: When user opens `/chat`, the frontend calls `GET /api/{user_id}/conversations/latest` to retrieve the most recent conversation_id. If none exists, a new conversation is created on the first message send.

**Rationale**: Clarified in `/sp.clarify` session: Option A — auto-load most recent conversation. The frontend needs to know the conversation_id to show history. A dedicated endpoint avoids loading the full message list on initial page load (lazy-load messages separately).

---

## Decision 7: New Dependencies Required

**Backend additions** (add to `requirements.txt`):
```
openai-agents>=0.0.14      # OpenAI Agents SDK
mcp>=1.0.0                 # Official MCP SDK
openai>=1.0.0              # OpenAI client (for Groq compat)
sse-starlette>=2.1.0       # SSE streaming for FastAPI
```

**Frontend additions** (add to `package.json`):
```
@openai/chatkit            # OpenAI ChatKit component
```

**Environment variables**:
- Backend: `GROQ_API_KEY` (from console.groq.com)
- Frontend: `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` (from OpenAI platform domain allowlist)

---

## Decision 8: MCP Tool user_id Validation

**Decision**: MCP tools accept `user_id` as a string parameter (matching the hackathon spec), but internally cast to `int` for DB queries. The chat endpoint passes the JWT-authenticated `current_user.id` to the agent system prompt — the agent must include this in every tool call. The MCP server validates that the passed `user_id` resolves to a real user in the DB before executing any operation.

**Rationale**: The spec mandates that tools accept `user_id` as string. Internally the DB uses integer PKs. Casting on entry is cleaner than changing the contract. The system prompt ensures the agent always knows the correct user_id.

**System prompt pattern**:
```
You are a task management assistant for user {user_id}.
Always use user_id="{user_id}" in every tool call.
Never use any other user_id.
```

---

## Constitution Check: All Gates PASS

| Gate | Status | Notes |
|------|--------|-------|
| Spec-driven development | ✅ PASS | spec.md exists, clarified |
| No manual coding | ✅ PASS | Implementation via Claude Code only |
| Technology adherence | ✅ PASS | Groq+Agents SDK+MCP+ChatKit — all in constitution |
| No Better Auth | ✅ PASS | Existing JWT reused, no changes |
| MCP = exactly 5 tools | ✅ PASS | add/list/complete/delete/update |
| SSE only on /chat endpoint | ✅ PASS | No other SSE endpoints |
| Integer PKs | ✅ PASS | Both new tables use int PK |
| User isolation | ✅ PASS | All tools validate user_id |
| Stateless server | ✅ PASS | All state in DB |
