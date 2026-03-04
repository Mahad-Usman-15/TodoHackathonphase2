# Research: Maintenance Fixes & Quality Improvements

**Feature**: `005-maintenance-fixes` | **Date**: 2026-03-02

---

## Decision 1 — Token Refresh on Page Load (Addresses FR-001)

**Problem**: Access tokens are in-memory (lost on refresh). `auth_context.tsx` calls `api.getMe()` on mount, which fails immediately with 401, causing logout instead of silently refreshing.

**Decision**: Add a silent refresh attempt inside the auth context `init()` flow:
1. Try `api.getMe()` with the current in-memory access token
2. If 401, call `api.refreshToken()` → `/api/auth/refresh` (uses HTTP-only cookie)
3. Store the new access token in memory, retry `api.getMe()`
4. Only dispatch logout if both attempts fail

**Rationale**: Prevents false-positive logouts when the access token simply expired but the refresh token is still valid. No architecture change — uses the existing `/api/auth/refresh` endpoint.

**Alternatives considered**:
- Storing access token in sessionStorage (rejected: XSS risk)
- Increasing access token lifetime (rejected: security trade-off, not in scope)
- Optimistic render + redirect on failure (rejected: user selected full-page spinner)

---

## Decision 2 — Dashboard Task Sync After Chat (Addresses FR-005)

**Decision**: Use the native Page Visibility API — `document.addEventListener('visibilitychange', handler)` in `dashboard/page.tsx`. When `document.visibilityState === 'visible'`, call `loadTasks()`.

**Rationale**: Zero dependencies, reliable across all major browsers, fires exactly when the user tabs back or navigates back to dashboard. Satisfies SC-003 (within 3 seconds of returning to dashboard).

**Alternatives considered**:
- Global state (Zustand/Context) shared between pages: rejected — overkill for a two-page app
- WebSocket push: rejected — out of scope (no WebSockets allowed per constitution)
- Polling every 5s: rejected — wasted requests, spec says no continuous polling

---

## Decision 3 — Markdown Rendering in Chat (Addresses FR-007)

**Decision**: Add `react-markdown` + `remark-gfm` to the frontend.

**Rationale**: Most widely-used React markdown library, SSR-safe, tree-shakeable, supports GitHub Flavored Markdown (tables, task lists, code blocks), minimal bundle impact (~20kb gzipped).

**Alternatives considered**:
- `marked` + `dangerouslySetInnerHTML`: rejected — XSS risk
- Manual regex parsing: rejected — fragile, incomplete
- `@mdxjs/mdx`: rejected — overkill, requires server-side compilation

---

## Decision 4 — Cold Start vs Rate Limit Detection (Addresses FR-003, FR-004)

**Decision**:
- Frontend: Wrap chat SSE fetch in an `AbortController` with 30-second timeout. If the connection times out entirely → show warm-up indicator.
- Backend: Catch specific exceptions in `routes/chat.py` and emit a typed SSE `error` event: `{ "type": "cold_start" | "rate_limit" | "service_error", "message": "..." }`.
- Groq 429 → `rate_limit`; connection/subprocess errors → `cold_start`; all others → `service_error`.

**Rationale**: Frontend can't distinguish failure types from a generic 500. Typed SSE errors let the frontend display the correct message without extra round-trips.

**Alternatives considered**:
- Custom HTTP status codes (503 for cold start, 429 for rate limit): rejected — SSE stream is already open, mid-stream errors can't change status code
- Retry logic on frontend only: rejected — doesn't distinguish cold start from permanent errors

---

## Decision 5 — MCPServerStdio: Keep Per-Request (Addresses FR-003)

**Decision**: Keep `MCPServerStdio` spawned per-request. Do NOT move to app lifespan.

**Rationale**: On a single-worker Render free-tier deployment, lifespan MCP initialization would fail if the subprocess crashes mid-request (no restart without full app restart). Per-request is more resilient, and performance impact is acceptable for a low-traffic hackathon app. The real cold-start problem is the Render HTTP server sleeping, not MCPServerStdio spawn time.

**Alternatives considered**:
- App lifespan singleton: rejected — subprocess crash kills entire lifespan; concurrency on single worker causes conflicts
- Connection pool: rejected — premature optimization for this scale

---

## Decision 6 — New Chat Lifecycle (Addresses FR-009)

**Decision**: "New Chat" is a pure client-side reset. Set `conversationId` state to `null` in `ChatInterface`. The next sent message will auto-create a new conversation server-side (existing behavior). No API call needed to "close" the old conversation — it remains archived by default.

**Rationale**: The backend already creates a new conversation when `conversation_id` is omitted from the POST body. Old conversations are naturally preserved. Zero backend change required.

---

## Decision 7 — Textarea Auto-Resize (Addresses FR-008)

**Decision**: CSS + `useEffect` pattern: set `height: 'auto'` then `height: scrollHeight + 'px'` on every `onChange`. Cap at `max-height: 8rem` (≈ 4 lines) with `overflow-y: auto` beyond cap.

**Rationale**: No library needed. Pure React ref + CSS, works identically in all browsers, no layout thrash with the `auto` reset trick.

---

## Decision 8 — Pull-to-Refresh (Addresses FR-020)

**Decision**: Custom hook `usePullToRefresh(onRefresh, ref)` using `touchstart`/`touchmove`/`touchend` events. Trigger `onRefresh` when pull distance > 60px and content is at scroll top. Show a subtle spinner during refresh.

**Rationale**: No library needed for this simple use case. Libraries like `react-pull-to-refresh` add ~15kb for minimal benefit.

---

## Summary of New Dependencies

| Package | Version | Use | Side |
|---------|---------|-----|------|
| `react-markdown` | ^9.0 | Markdown rendering in chat | Frontend |
| `remark-gfm` | ^4.0 | GFM tables/lists/code in markdown | Frontend |

All other changes use existing patterns, native browser APIs, or Tailwind CSS.
