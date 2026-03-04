# Implementation Plan: Maintenance Fixes & Quality Improvements

**Branch**: `005-maintenance-fixes` | **Date**: 2026-03-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-maintenance-fixes/spec.md`

---

## Summary

Addresses 20 functional requirements across 6 user stories: session persistence, AI agent reliability, rich chat experience, task dashboard quality, performance/stability, and mobile accessibility. All changes are additive — no breaking changes to existing endpoints or data model. Two new frontend components (`ErrorBoundary`, `BottomNav`) and two new npm packages (`react-markdown`, `remark-gfm`) are the only structural additions.

---

## Technical Context

**Language/Version**: Python 3.11 (backend), TypeScript / Node 18+ (frontend)
**Primary Dependencies**: FastAPI + SQLModel (backend); Next.js 16+ App Router + Tailwind CSS (frontend); `react-markdown` + `remark-gfm` (new frontend deps)
**Storage**: Neon Serverless PostgreSQL — no schema changes required
**Testing**: Manual Playwright E2E per quickstart.md; no automated test suite changes
**Target Platform**: Vercel (frontend) + Render free tier (backend)
**Performance Goals**: Token refresh < 800ms on page load; task filter update < 500ms; toast visible < 1s after CRUD; skeleton visible within 300ms of navigation
**Constraints**: No new tables; no WebSockets; no global state library; Render free tier (single worker, cold starts)
**Scale/Scope**: Single-tenant per user; low traffic hackathon app

---

## Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| Spec-driven: spec.md exists before plan | ✅ PASS | `specs/005-maintenance-fixes/spec.md` created first |
| Tech stack: only approved dependencies | ✅ PASS | `react-markdown` + `remark-gfm` are UI libs, no backend stack change |
| Auth: JWT/bcrypt unchanged | ✅ PASS | Only adding silent refresh logic — no auth method change |
| No SSE outside `/api/{user_id}/chat` | ✅ PASS | Health endpoint is plain JSON GET |
| No global state library (Redux etc.) | ✅ PASS | Page Visibility API (native), no Zustand/Redux added |
| Integer PKs on all tables | ✅ PASS | No new tables; existing schema unchanged |
| Secrets in env vars only | ✅ PASS | No new secrets introduced |
| MCP tools unchanged | ✅ PASS | Backend error handling change only, no tool signature changes |

**Constitution Check Result: PASS** — No violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/005-maintenance-fixes/
├── spec.md              ✅ Created by /sp.specify
├── plan.md              ✅ This file
├── research.md          ✅ Phase 0 output
├── data-model.md        ✅ Phase 1 output
├── quickstart.md        ✅ Phase 1 output
├── contracts/
│   └── api-changes.md  ✅ Phase 1 output
└── tasks.md             ⏳ Phase 2 output (/sp.tasks)
```

### Source Code Changes (repository root)

```text
backend/
├── main.py                     MODIFY: add GET /api/health endpoint
└── routes/
    └── chat.py                 MODIFY: typed SSE error events

frontend/
├── app/
│   ├── layout.tsx              MODIFY: add BottomNav + auth loading spinner
│   ├── dashboard/
│   │   └── page.tsx            MODIFY: visibility refetch + filter tabs + toast
│   └── chat/
│       └── page.tsx            MODIFY: New Chat button handler
├── components/
│   ├── chat/
│   │   └── ChatInterface.tsx   MODIFY: markdown + textarea + char counter + timestamps + typed errors
│   ├── ui/
│   │   └── ErrorBoundary.tsx   NEW: React error boundary class component
│   └── layout/
│       └── BottomNav.tsx       NEW: mobile bottom navigation bar
├── contexts/
│   └── auth_context.tsx        MODIFY: silent token refresh on mount
└── lib/
    └── api.ts                  MODIFY: health ping + typed error propagation
```

**Structure Decision**: Web application (Option 2) — existing `backend/` + `frontend/` layout; no new top-level directories.

---

## Phase 0: Research Summary

All NEEDS CLARIFICATION items resolved. See [research.md](./research.md) for full rationale.

| Decision | Chosen Approach |
|----------|----------------|
| Token refresh race condition | Silent refresh in `auth_context` init: try `getMe()` → if 401, call `refreshToken()` → retry `getMe()` |
| Dashboard task sync | Page Visibility API — refetch on `visibilityState === 'visible'` |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| Cold start detection | Typed SSE `error` event: `cold_start` / `rate_limit` / `service_error` |
| MCPServerStdio | Stay per-request (resilient on single-worker Render) |
| New Chat lifecycle | Client-side reset only — backend auto-creates on next message; old conv preserved |
| Textarea resize | CSS `auto` height trick via `useEffect` + `useRef` |
| Pull-to-refresh | Custom `usePullToRefresh` hook — no library |

---

## Phase 1: Design

### 1A — Backend Changes

#### `backend/main.py`
- Add `GET /api/health` route (no auth, returns `{"status": "ok"}`)
- Keep keep-alive ping as frontend responsibility (not backend cron)

#### `backend/routes/chat.py`
- In `event_stream()`, wrap the agent runner in try/except blocks
- Catch `subprocess.SubprocessError`, `ConnectionError`, `asyncio.TimeoutError` → emit `type: "cold_start"`
- Catch Groq `RateLimitError` (openai `status_code == 429`) → emit `type: "rate_limit"` with `retry_after: 30`
- Catch all other `Exception` → emit `type: "service_error"`
- SSE error payload: `{"type": "...", "message": "...", "retry_after": null | int}`

---

### 1B — Frontend Changes

#### `frontend/contexts/auth_context.tsx` — Silent Token Refresh
**Current flow**: `getMe()` → if 401 → set user null → logout
**New flow**: `getMe()` → if 401 → call `refreshToken()` → if success → retry `getMe()` → set user; if both fail → set user null

Implementation:
```
async function initAuth() {
  setIsLoading(true)
  try {
    const user = await api.getMe()          // try with existing token
    setUser(user)
  } catch {
    try {
      await api.refreshToken()              // attempt silent refresh
      const user = await api.getMe()        // retry after refresh
      setUser(user)
    } catch {
      setUser(null)                         // both failed → truly unauthenticated
    }
  } finally {
    setIsLoading(false)
  }
}
```

New `api.refreshToken()` method → `POST /api/auth/refresh` (existing endpoint, just not called from context currently).

#### `frontend/app/layout.tsx` — Auth Loading Spinner
- When `isLoading === true`, render a full-page centered spinner overlay instead of children
- BottomNav component added to layout, visible only on `sm:hidden` mobile viewports

#### `frontend/app/dashboard/page.tsx` — 3 Additions
1. **Visibility refetch**: `useEffect` registers `visibilitychange` → calls `loadTasks()` when page becomes visible
2. **Filter tabs**: Local state `activeFilter: 'all' | 'pending' | 'completed'`; filter `tasks` array before rendering; 3 tab buttons with active styling
3. **Toast wiring**: Call `showToast("Task created")` etc. after each successful CRUD operation

#### `frontend/components/chat/ChatInterface.tsx` — 5 Additions
1. **Markdown**: Wrap assistant message content in `<ReactMarkdown remarkPlugins={[remarkGfm]}>` with Tailwind `prose` styling
2. **Textarea auto-resize**: `useRef` on textarea; `useEffect` → `el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'` on every value change; `max-h-32 overflow-y-auto`
3. **Character counter**: Show `<span>{value.length} / 2000</span>` when `value.length > 1800`; disable submit button when `value.length > 2000`
4. **Timestamps**: Each message bubble shows `message.created_at` formatted as `"h:mm a"` (e.g., "3:42 PM") — always visible, small text
5. **Typed error handling**: On SSE `error` event, check `data.type`:
   - `cold_start` → render warm-up indicator component
   - `rate_limit` → render "Too many requests — try again shortly"
   - `service_error` → render "Something went wrong — please try again"

#### `frontend/app/chat/page.tsx` — New Chat
- Add "New Chat" button in header area
- `handleNewChat()`: set `activeConvId` to `null` → `ChatInterface` receives `null` conversationId → clears messages on render

#### `frontend/components/ui/ErrorBoundary.tsx` — New Component
```typescript
class ErrorBoundary extends React.Component<{children, fallback?}> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <FallbackUI onRetry={() => this.setState({hasError: false})} />
    return this.props.children
  }
}
```
Wrap `<TaskList />` and `<ChatInterface />` in their respective pages.

#### `frontend/components/layout/BottomNav.tsx` — New Component
Mobile-only bottom nav bar with:
- Tasks link → `/dashboard`
- AI Chat link → `/chat`
- Active state highlighting based on `usePathname()`
- `fixed bottom-0 left-0 right-0 sm:hidden` positioning

#### `frontend/lib/api.ts` — 2 Additions
1. `api.refreshToken()` → `POST /api/auth/refresh`
2. `api.healthPing()` → `GET /api/health`
3. Keep-alive: `setInterval(() => api.healthPing(), 14 * 60 * 1000)` in `auth_context.tsx` when user is authenticated

---

### 1C — Accessibility & Mobile Polish

| Requirement | Implementation |
|-------------|---------------|
| FR-018: ARIA labels | Add `aria-label` to all icon-only buttons (delete, edit, toggle, send, new chat) |
| FR-019: Focus indicators | Ensure Tailwind `focus-visible:ring-2 focus-visible:ring-indigo-500` on all interactive elements |
| FR-020: Pull-to-refresh | Custom `usePullToRefresh(onRefresh, containerRef)` hook in `dashboard/page.tsx`; 60px threshold; spinner during pull |

---

## Post-Design Constitution Check

| Gate | Status | Notes |
|------|--------|-------|
| No new tables | ✅ PASS | data-model.md confirms no schema changes |
| 2 new npm packages only | ✅ PASS | `react-markdown`, `remark-gfm` — UI rendering only |
| No SSE on new endpoint | ✅ PASS | `/api/health` is plain JSON |
| Auth architecture unchanged | ✅ PASS | Silent refresh uses existing `/api/auth/refresh` endpoint |
| All API calls via `api.ts` | ✅ PASS | `api.refreshToken()` and `api.healthPing()` added to `api.ts` |
| No business logic in frontend | ✅ PASS | Error type routing is display logic only |

**Post-Design Result: PASS**

---

## Implementation Order (for `/sp.tasks`)

Tasks should be ordered by dependency and risk:

1. **Backend** (no frontend dependency):
   - T1: Add `GET /api/health` to `main.py`
   - T2: Add typed SSE error events to `routes/chat.py`

2. **Frontend Core** (unblocks everything else):
   - T3: Add `api.refreshToken()` + `api.healthPing()` to `api.ts`
   - T4: Fix silent token refresh in `auth_context.tsx`
   - T5: Add full-page loading spinner + `BottomNav` to `layout.tsx`

3. **Dashboard**:
   - T6: Add visibility refetch + filter tabs + empty states to `dashboard/page.tsx`
   - T7: Wire toast notifications to task CRUD in `dashboard/page.tsx`

4. **Chat**:
   - T8: Add `react-markdown` + render AI responses as markdown in `ChatInterface.tsx`
   - T9: Textarea auto-resize + character counter in `ChatInterface.tsx`
   - T10: Message timestamps in `ChatInterface.tsx`
   - T11: Typed error handling (cold_start/rate_limit/service_error) in `ChatInterface.tsx`
   - T12: New Chat button in `chat/page.tsx` + reset handler

5. **Polish**:
   - T13: Create `ErrorBoundary.tsx` and wrap `TaskList` + `ChatInterface`
   - T14: Create `BottomNav.tsx` mobile navigation component
   - T15: Add ARIA labels to all icon-only buttons + focus ring classes
   - T16: Implement `usePullToRefresh` hook in `dashboard/page.tsx`
