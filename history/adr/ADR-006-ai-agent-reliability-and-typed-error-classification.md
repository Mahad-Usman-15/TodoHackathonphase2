# ADR-006: AI Agent Reliability and Typed SSE Error Classification

> **Scope**: Covers the integrated cluster of decisions for reliable AI chat — per-request MCPServerStdio lifecycle, backend exception taxonomy mapped to typed SSE error events, and frontend error routing by type to produce differentiated user messages.

- **Status:** Accepted
- **Date:** 2026-03-02
- **Feature:** 005-maintenance-fixes
- **Context:** The AI chat endpoint (`POST /api/{user_id}/chat`) streams responses via SSE. Three distinct failure conditions produce identical user-facing errors ("I'm having trouble responding right now"): (1) the Render backend is warming up after idle (cold start — recoverable with patience), (2) the Groq API rate limiter is active (recoverable after ~30 seconds), and (3) a genuine service error (requires retry or developer action). When all three show the same error, users cannot know whether to wait, retry immediately, or give up. Separately, a question arose about whether `MCPServerStdio` (which spawns `mcp_server.py` as a subprocess) should be initialized once at app lifespan or per-request — a decision that also affects which failure modes are observable.

## Decision

Adopt a **per-request MCPServerStdio + typed SSE error classification** cluster:

**Backend — MCPServerStdio lifecycle:**
- Keep `MCPServerStdio` spawned per-request inside `event_stream()` (not moved to app lifespan)
- Rationale: Single-worker Render deployment — a lifespan subprocess crash takes down the entire app until restart; per-request is self-healing (next request spawns fresh)

**Backend — Exception taxonomy in `routes/chat.py`:**
```
subprocess.SubprocessError | ConnectionError | asyncio.TimeoutError
  → SSE error type: "cold_start"

openai.RateLimitError (status_code == 429)
  → SSE error type: "rate_limit", retry_after: 30

Exception (all others)
  → SSE error type: "service_error"
```

**SSE error event format (enhanced):**
```
event: error
data: {"type": "cold_start"|"rate_limit"|"service_error", "message": "...", "retry_after": null|int}
```

**Frontend — `ChatInterface.tsx` routing by `data.type`:**
- `cold_start` → animated "warming up" indicator; input stays enabled
- `rate_limit` → "Too many requests — try again shortly"; input stays enabled
- `service_error` → "Something went wrong — please try again."; input stays enabled

All cases: chat input remains enabled for immediate retry.

## Consequences

### Positive

- Users receive actionable guidance rather than a generic error — "please wait" vs "try again shortly" vs "something went wrong" are meaningfully different instructions
- Per-request MCPServerStdio is resilient: a subprocess crash on one request does not affect subsequent requests
- The error taxonomy is defined at the backend exception boundary — frontend has no knowledge of Groq, subprocess mechanics, or timeout durations; it only consumes `type`
- `retry_after` field enables future rate-limit countdown UI without protocol change
- SSE format is additive — existing `delta`, `tool_called`, `done` events are unchanged; only the `error` event gains structure
- All errors leave the input enabled — prevents users from being stuck in a broken state

### Negative

- Exception taxonomy requires keeping the mapping up-to-date as new failure modes emerge (e.g., a new Groq error type)
- `asyncio.TimeoutError` catching in a streaming context requires careful placement — must not swallow legitimate stream completion
- Per-request MCPServerStdio spawns a Python subprocess per chat message — higher latency per message (~100–300ms subprocess init) vs a persistent connection
- Frontend must handle `type` field being absent (backward compatibility with any untyped error) — requires fallback to `service_error` behavior
- Cold start detection by exception type is heuristic — a real connection failure mid-stream could be misclassified as cold start

## Alternatives Considered

### Alternative A: Single Generic Error Message for All Failures (Rejected)

Keep the current behavior — all failures show "I'm having trouble responding right now"; no error type differentiation.

- **Pros**: Zero implementation complexity; no backend/frontend protocol change needed
- **Cons**: Users cannot distinguish a 30-second wait (cold start) from a permanent failure; user trust erodes when they don't know what to do; the issue was explicitly raised by users as a pain point
- **Rejected because**: Spec clarification Q3 explicitly chose differentiated messages; generic error is the status quo being fixed

### Alternative B: HTTP Status Codes for Error Differentiation (Rejected)

Return 503 for cold start, 429 for rate limit, 500 for service error — let frontend read status code.

- **Pros**: Standard HTTP semantics; no SSE protocol change
- **Cons**: SSE stream begins with a `200 OK` header; once the stream is open, the status code cannot be changed mid-stream; error must be communicated in-band as a stream event
- **Rejected because**: Technically incompatible with the SSE streaming architecture — status code is set before the stream begins, cannot reflect mid-stream failures

### Alternative C: Move MCPServerStdio to App Lifespan (Rejected)

Initialize one `MCPServerStdio` instance at app startup (FastAPI lifespan); share it across all requests.

- **Pros**: Subprocess initialized once — lower per-request latency; warm connection to `mcp_server.py` at all times
- **Cons**: On Render free tier (single worker), a subprocess crash in the lifespan context requires full app restart; concurrent requests sharing one MCP subprocess can cause state conflicts; lifespan failure prevents app from starting at all
- **Rejected because**: Single-worker resilience is the priority; per-request is self-healing and the latency cost (~200ms) is acceptable at hackathon traffic levels

### Alternative D: Frontend-Only Timeout for Cold Start Detection (Rejected)

Use `AbortController` with a 30-second timeout on the frontend — classify as cold start if the connection times out before any event arrives.

- **Pros**: No backend change needed; simple client-side pattern
- **Cons**: Timeout is a blunt instrument — a slow AI response (model thinking) would be misclassified as cold start; 30 seconds is an arbitrary threshold that may not match actual warm-up time; cannot distinguish rate limit from cold start (both produce silence before an event)
- **Rejected because**: Backend exception classification is more precise and eliminates the false-positive risk of timeout-based detection; both approaches are needed anyway (timeout as a final safety net, typed events as the primary signal)

## References

- Feature Spec: `specs/005-maintenance-fixes/spec.md` — FR-003, FR-004, FR-006, SC-002
- Implementation Plan: `specs/005-maintenance-fixes/plan.md` — 1A Backend Changes (chat.py section), 1B (ChatInterface section)
- Research: `specs/005-maintenance-fixes/research.md` — Decision 4 (Cold Start vs Rate Limit Detection), Decision 5 (MCPServerStdio: Keep Per-Request)
- API Contract: `specs/005-maintenance-fixes/contracts/api-changes.md` — Modified SSE Error Event Format
- Spec Clarification: `specs/005-maintenance-fixes/spec.md` — Clarifications Session 2026-03-02, Q3
- Related ADRs: None (first AI agent architecture ADR)
- Evaluator Evidence: `history/prompts/005-maintenance-fixes/plan-001-maintenance-fixes-implementation-plan.prompt.md`
