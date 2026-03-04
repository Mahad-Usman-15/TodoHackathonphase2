---
description: "Tasks for 005-maintenance-fixes — Maintenance Fixes & Quality Improvements"
---

# Tasks: Maintenance Fixes & Quality Improvements

**Input**: Design documents from `/specs/005-maintenance-fixes/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/api-changes.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story. US1 and US2 are both P1 — implement US1 first (unblocks all other pages), then US2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US6)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies and add the health endpoint before any story work begins.

- [X] T001 Install react-markdown, remark-gfm, and @tailwindcss/typography in frontend/ (`npm install react-markdown remark-gfm @tailwindcss/typography`). Then verify `tailwind.config.js` includes `require('@tailwindcss/typography')` in the `plugins` array — add it if missing.
- [X] T002 [P] Add `GET /api/health` route to `backend/main.py` (no auth, returns `{"status": "ok"}`)

**Checkpoint**: `GET http://localhost:8000/api/health` returns 200; react-markdown is importable; `prose` Tailwind classes apply correctly in a test element.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the API client with methods all user stories depend on.

**⚠️ CRITICAL**: No frontend story work begins until this phase is complete.

- [X] T003 Add `api.refreshToken()` (POST `/api/auth/refresh`) and `api.healthPing()` (GET `/api/health`) methods to `frontend/lib/api.ts`

**Checkpoint**: Both methods are importable from `api.ts` and return the correct response shapes.

---

## Phase 3: User Story 1 — Stable Session on Page Refresh (Priority: P1) 🎯 MVP

**Goal**: Users stay logged in across page refreshes when their session is valid. A full-page spinner is shown during the validation check.

**Independent Test**: Log in → hard refresh (Ctrl+Shift+R) → verify spinner appears briefly then dashboard loads without redirect to `/auth/login`. Let session expire → refresh → verify redirect to login with expired-session message.

### Implementation for User Story 1

- [X] T004 [US1] Update `frontend/contexts/auth_context.tsx` initAuth(): try `api.getMe()` → if 401 catch → call `api.refreshToken()` → retry `api.getMe()` → set user; only dispatch logout if both calls fail. When dispatching logout after both fail, set a `sessionExpired: true` flag in context state so consuming components can show "Your session has expired — please log in again." on the login page redirect. Also add `setInterval(() => api.healthPing(), 14 * 60 * 1000)` keep-alive when user is authenticated (clear interval on logout/unmount). In `frontend/app/auth/login/page.tsx`, read the `sessionExpired` flag (via context or URL param) and render the expiry message when present.
- [X] T005 [P] [US1] Add full-page loading spinner in `frontend/app/layout.tsx`: when `isLoading === true` (from `useAuth()`), render a centered full-page spinner overlay instead of `{children}`. Protected content renders only after isLoading is false.

**Checkpoint**: US1 complete — page refresh no longer logs out users with valid sessions. Spinner visible during auth check.

---

## Phase 4: User Story 2 — Reliable AI Agent Responses (Priority: P1)

**Goal**: AI chat errors are differentiated (cold start / rate limit / service error). Dashboard task list refreshes automatically when user returns from chat.

**Independent Test**: Stop backend → open chat → send message → verify "warming up" indicator (not raw error). Return to dashboard after AI creates a task → verify new task appears without manual refresh.

### Implementation for User Story 2

- [X] T006 [US2] Add typed SSE error classification to `backend/routes/chat.py`: first verify `import logging; logger = logging.getLogger(__name__)` is present at the top of the file — add it if missing. Then wrap the agent runner in try/except — catch `subprocess.SubprocessError | ConnectionError | asyncio.TimeoutError` → call `logger.exception("cold_start error")` then yield `event: error` with `{"type": "cold_start", "message": "Starting up, please wait…", "retry_after": null}`; catch Groq `RateLimitError` (status 429) → `logger.exception("rate_limit error")` then `{"type": "rate_limit", "message": "Too many requests — try again shortly.", "retry_after": 30}`; catch all other `Exception` → `logger.exception("service_error")` then `{"type": "service_error", "message": "Something went wrong — please try again.", "retry_after": null}`.
- [X] T007 [P] [US2] Add `visibilitychange` refetch to `frontend/app/dashboard/page.tsx`: in a `useEffect`, register `document.addEventListener('visibilitychange', handler)` where handler calls `loadTasks()` when `document.visibilityState === 'visible'`. Clean up listener on unmount.
- [X] T008 [US2] Add typed SSE error routing in `frontend/components/chat/ChatInterface.tsx`: on `event: error`, parse `data.type` — `cold_start` → render animated "Starting up, please wait…" indicator in chat; `rate_limit` → render "Too many requests — try again shortly"; `service_error` → render "Something went wrong — please try again." All three keep the input field enabled for retry.

**Checkpoint**: US2 complete — differentiated chat errors and dashboard auto-refresh on return from chat.

---

## Phase 5: User Story 3 — Rich Chat Experience (Priority: P2)

**Goal**: AI responses render as formatted text. Input auto-expands. Character limit is enforced. Messages show timestamps. New Chat clears state cleanly.

**Independent Test**: Ask AI for a numbered list → verify it renders as `<ol>` not raw text. Paste 5 lines into input → verify it expands. Paste 2001 chars → verify submit is blocked. Click New Chat → verify chat clears completely.

### Implementation for User Story 3

- [X] T009 [US3] Add markdown rendering in `frontend/components/chat/ChatInterface.tsx`: import `ReactMarkdown` from `react-markdown` and `remarkGfm` from `remark-gfm`. Wrap assistant message `content` in `<ReactMarkdown remarkPlugins={[remarkGfm]} className="prose prose-invert prose-sm max-w-none">`. Apply Tailwind typography `prose` classes to the message bubble container.
- [X] T010 [US3] Add textarea auto-resize in `frontend/components/chat/ChatInterface.tsx`: add `ref={textareaRef}` to the input element. In a `useEffect` on `inputValue`, set `el.style.height = 'auto'` then `el.style.height = el.scrollHeight + 'px'`. Apply `max-h-32 overflow-y-auto` classes to cap expansion at ~4 lines.
- [X] T011 [US3] Add character counter in `frontend/components/chat/ChatInterface.tsx`: show `<span className="text-xs text-gray-400">{inputValue.length} / 2000</span>` when `inputValue.length > 1800`. Set `disabled={inputValue.length > 2000}` on the submit button and add `maxLength={2000}` as safety net on the textarea.
- [X] T012 [US3] Add message timestamps in `frontend/components/chat/ChatInterface.tsx`: each message object has `created_at`. Below each message bubble, render `<span className="text-xs text-gray-500">{new Intl.DateTimeFormat('en-US', {hour: 'numeric', minute: '2-digit'}).format(new Date(message.created_at))}</span>`. If `created_at` is missing, use `new Date()` at message creation time.
- [X] T013 [P] [US3] Add New Chat button and reset handler in `frontend/app/chat/page.tsx`: add a "New Chat" button in the page header. `handleNewChat()` sets `activeConvId` to `null` and clears the messages array in local state. Pass `conversationId={activeConvId}` to `ChatInterface` — when null, ChatInterface renders with empty messages and the next sent message auto-creates a new server-side conversation.

**Checkpoint**: US3 complete — markdown renders, input expands, counter shows, timestamps visible, New Chat clears state.

---

## Phase 6: User Story 4 — Task Management Quality (Priority: P2)

**Goal**: Dashboard has filter tabs (All/Pending/Completed). Empty states shown when no tasks match. Toast notifications confirm every CRUD action.

**Independent Test**: Create 2 tasks, complete 1 → click "Completed" → verify only completed task shown. Click "Pending" with no tasks → verify empty state message. Delete a task → verify "Task deleted" toast appears and auto-dismisses.

### Implementation for User Story 4

- [X] T014 [US4] Add filter tabs to `frontend/app/dashboard/page.tsx`: add `activeFilter: 'all' | 'pending' | 'completed'` state (default `'all'`). Render 3 tab buttons with active styling (e.g., `border-b-2 border-indigo-500`). Derive `filteredTasks = tasks.filter(t => activeFilter === 'all' ? true : activeFilter === 'completed' ? t.completed : !t.completed)`. Pass `filteredTasks` to `<TaskList />` instead of `tasks`.
- [X] T015 [US4] Add empty state per filter in `frontend/app/dashboard/page.tsx`: when `filteredTasks.length === 0`, render a descriptive empty state instead of an empty list — for `all`: "No tasks yet — create your first one!", for `pending`: "All caught up! No pending tasks.", for `completed`: "No completed tasks yet — mark one done!". Use the existing `<EmptyState />` component if available, otherwise render inline.
- [X] T016 [US4] Wire toast notifications to task CRUD in `frontend/app/dashboard/page.tsx`: after each successful API call, call `showToast()` (or the equivalent from the existing Toast component) — create → "Task created ✓", update → "Task updated ✓", delete → "Task deleted ✓", complete/uncomplete → "Task marked complete ✓" / "Task unmarked ✓". Wire error cases too: failed create/update/delete → "Action failed — please try again".

**Checkpoint**: US4 complete — filter tabs work, empty states show, toasts appear after every CRUD action.

---

## Phase 7: User Story 5 — Performance & Error Resilience (Priority: P3)

**Goal**: Skeleton placeholders appear during page load. Error boundaries contain failures and offer retry. Skeleton screens already partially implemented — verify integration is correct.

**Independent Test**: Throttle network to Slow 3G → navigate to dashboard → verify skeleton cards appear. Break `api.getTasks()` → navigate to dashboard → verify error boundary shows "Retry" button instead of crashing.

### Implementation for User Story 5

- [X] T017 [US5] Create `frontend/components/ui/ErrorBoundary.tsx` as a React class component: `state = { hasError: false, error: null }`. `static getDerivedStateFromError(error)` returns `{ hasError: true, error }`. `componentDidCatch(error, info)` logs to console. `render()` returns either a fallback UI with a "Retry" button (`onClick={() => this.setState({ hasError: false })`) and friendly message "Something went wrong. Please try again.", or `this.props.children` when no error.
- [X] T018 [P] [US5] Wrap task list section in `frontend/app/dashboard/page.tsx` with `<ErrorBoundary>`. Import `ErrorBoundary` from `@/components/ui/ErrorBoundary`. The boundary should wrap the `<TaskList />` and filter tabs area, not the entire page.
- [X] T019 [P] [US5] Wrap chat interface in `frontend/app/chat/page.tsx` with `<ErrorBoundary>`. Import `ErrorBoundary` from `@/components/ui/ErrorBoundary`. The boundary wraps `<ChatInterface />`.
- [X] T020 [US5] Ensure `frontend/app/dashboard/page.tsx` renders `<SkeletonCard />` (×3) when `isLoadingTasks === true`. Replace any blank/null/empty render in the tasks list area with `<div className="space-y-3">{[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}</div>` during the loading state. This must be a definitive implementation — do not conditionally skip if a skeleton already partially exists; replace the loading path entirely to ensure consistent behavior.

**Checkpoint**: US5 complete — skeleton cards visible on slow load, error boundary catches failures and shows retry.

---

## Phase 8: User Story 6 — Mobile & Accessibility Improvements (Priority: P3)

**Goal**: Mobile users have a bottom navigation bar. All interactive elements have ARIA labels and visible keyboard focus rings. Task list supports pull-to-refresh.

**Independent Test**: Open app at 375px viewport → verify bottom nav bar with Tasks + AI Chat links is visible. Tab through all interactive elements → verify focus ring appears on each. Pull down on task list on mobile → verify tasks reload.

### Implementation for User Story 6

- [X] T021 [US6] Create `frontend/components/layout/BottomNav.tsx` as a client component: `'use client'`. Use `usePathname()` from `next/navigation` to determine active route. Render a `<nav>` with `fixed bottom-0 left-0 right-0 sm:hidden bg-gray-900 border-t border-gray-800 flex` containing two links: Tasks (→ `/dashboard`, tasks icon) and AI Chat (→ `/chat`, chat icon). Active link gets `text-indigo-400`, inactive gets `text-gray-500`. Height: `h-16`.
- [X] T022 [US6] Integrate BottomNav in `frontend/app/layout.tsx`: import `BottomNav` from `@/components/layout/BottomNav`. Add `<BottomNav />` just before the closing `</body>` tag. Add `pb-16 sm:pb-0` padding to the main content wrapper so content isn't hidden behind the nav on mobile.
- [X] T023 [P] [US6] Add `aria-label` to all icon-only buttons across `frontend/components/dashboard/` (TaskItem delete, edit, toggle buttons) and `frontend/components/chat/ChatInterface.tsx` (send button, new chat button). Each button must have a descriptive `aria-label` attribute (e.g., `aria-label="Delete task"`, `aria-label="Send message"`).
- [X] T024 [P] [US6] Add `focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none` Tailwind classes to all interactive elements (buttons, links, inputs) in `frontend/components/dashboard/`, `frontend/components/chat/`, and `frontend/components/landing/LandingNav.tsx` that currently lack explicit focus styles.
- [X] T025 [US6] Create `frontend/hooks/usePullToRefresh.ts`: a custom hook that accepts `(onRefresh: () => void, containerRef: RefObject<HTMLElement>)`. Tracks `touchstart` (record `startY`) and `touchend` (compute `deltaY`). When `deltaY > 60` and container is at scroll top (`scrollTop === 0`), calls `onRefresh()` and shows a brief loading indicator. Returns `{ isPulling, pullProgress }` for optional UI feedback.
- [X] T026 [US6] Integrate `usePullToRefresh` in `frontend/app/dashboard/page.tsx`: add a `containerRef` to the task list wrapper div. Call `usePullToRefresh(loadTasks, containerRef)`. Show a small spinner or "Refreshing…" text at the top of the list when `isPulling` is true.

**Checkpoint**: US6 complete — bottom nav visible on mobile, focus rings present on keyboard nav, pull-to-refresh works on task list.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation against all spec acceptance criteria.

- [X] T027 [P] Run the quickstart.md manual test checklist for all 16 scenarios and verify each passes (session persistence, AI warm-up, error types, dashboard sync, markdown, textarea, new chat, char counter, filter tabs, empty states, toast, skeleton, error boundary, mobile nav, health endpoint). Additional checks: (a) after clicking New Chat and sending a new message, open DevTools Network and call `GET /api/{user_id}/conversations` — verify the previous conversation row still exists server-side (FR-009 server preservation); (b) check backend logs after 5+ chat submissions and verify error events are being logged via `logger.exception()` entries (FR-006).
- [X] T028 [P] Verify all 8 success criteria: SC-001 (hard refresh stays logged in), SC-002 (send 10 chat messages — at least 9 succeed or show warm-up; SC-002 is a production log metric — document measurement method: count `logger.exception` entries vs total chat requests in Render logs), SC-003 (navigate back to dashboard after AI task creation — task appears within 3s of landing on dashboard), SC-004 (click filter tab — list updates under 500ms in DevTools Performance), SC-005 (CRUD action — toast visible within 1s), SC-006 (throttle to Fast 3G in DevTools — page interactive within 2s; skeleton fills gap), SC-007 (run axe DevTools or browser accessibility checker — 0 missing-label violations), SC-008 (paste 2001 chars into chat input — submit button disabled).

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)       → No dependencies — start immediately
Phase 2 (Foundational) → Depends on Phase 1 — BLOCKS all user stories
Phase 3 (US1)         → Depends on Phase 2 — highest priority, do first
Phase 4 (US2)         → Depends on Phase 2 + US1 (auth must work)
Phase 5 (US3)         → Depends on Phase 1 (react-markdown installed) + Phase 2
Phase 6 (US4)         → Depends on Phase 2 (dashboard/page.tsx baseline)
Phase 7 (US5)         → Depends on Phase 2 (ErrorBoundary wraps US1/US3 output)
Phase 8 (US6)         → Depends on Phase 2 (layout.tsx baseline)
Phase 9 (Polish)      → Depends on all stories complete
```

### User Story Dependencies

- **US1 (Session)**: Must complete before US2 — chat and dashboard rely on auth working
- **US2 (AI Reliability)**: Can start after US1 is done
- **US3 (Chat UX)**: Can start after Phase 1+2 — independent of US1/US2 code changes (different ChatInterface.tsx sections)
- **US4 (Dashboard)**: Can start after Phase 2 — T014 builds on T007 (both in dashboard/page.tsx — coordinate edit order)
- **US5 (Performance)**: Can start after US1+US3 are done (wraps their output in error boundaries)
- **US6 (Mobile/A11y)**: Can start after Phase 2 — independent of other stories

### Within Each User Story

- T006 (backend SSE errors) MUST complete before T008 (frontend typed error routing)
- **T007 (US2, `dashboard/page.tsx`) MUST complete before T014 (US4)** — both modify the same file; sequential edit required to avoid conflicts
- T017 (ErrorBoundary component) MUST complete before T018 and T019
- T021 (BottomNav component) MUST complete before T022 (layout integration)
- T025 (usePullToRefresh hook) MUST complete before T026 (integration)
- All other tasks within a story are sequential due to same-file edits

---

## Parallel Opportunities

### US1 (can run in parallel after Phase 2)

```
T004 — auth_context.tsx (silent refresh + keep-alive)
T005 — layout.tsx (auth loading spinner)     ← parallel with T004 (different file)
```

### US2 (after US1)

```
T006 — backend/routes/chat.py (typed SSE errors)
T007 — dashboard/page.tsx (visibility refetch)   ← parallel with T006 (different file)
T008 — ChatInterface.tsx (error routing)         ← after T006
```

### US3 (after Phase 1+2)

```
T009 → T010 → T011 → T012  (all ChatInterface.tsx — sequential)
T013 — chat/page.tsx (New Chat button)           ← parallel with T009–T012
```

### US5 (after US1+US3)

```
T017 — ErrorBoundary.tsx (component)
T018 — dashboard/page.tsx wrap    ← parallel after T017
T019 — chat/page.tsx wrap         ← parallel after T017
T020 — skeleton verification      ← parallel with T018/T019
```

### US6 (after Phase 2)

```
T023 — ARIA labels (dashboard + chat components)  ← parallel with T024
T024 — focus rings (all components)               ← parallel with T023
```

---

## Implementation Strategy

### MVP (User Story 1 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational)
3. Complete Phase 3 (US1 — session fix)
4. **VALIDATE**: Hard-refresh no longer logs users out
5. Deploy — immediate user-visible improvement

### Incremental Delivery

1. Setup + Foundational → Health endpoint + api.ts ready
2. **US1** → Session persistence fixed (most impactful fix)
3. **US2** → AI reliability fixed (second most impactful)
4. **US3** → Rich chat UX (markdown, resize, counter, timestamps, New Chat)
5. **US4** → Dashboard quality (filters, empty states, toasts)
6. **US5** → Error resilience (boundaries + skeletons)
7. **US6** → Mobile + accessibility (bottom nav, ARIA, pull-to-refresh)

---

## Notes

- [P] = different files, no shared dependencies — can run simultaneously
- Tasks T009–T012 all modify `ChatInterface.tsx` — implement sequentially to avoid merge conflicts
- Tasks T014–T016 all modify `dashboard/page.tsx` — implement sequentially; T007 (US2) also touches this file, so complete T007 before starting T014
- `SkeletonCard.tsx` and `Toast.tsx` already exist — use them, do not recreate
- `@tailwindcss/typography` is handled in T001 — do not repeat in T009
- Commit after each user story phase completes for clean rollback points
