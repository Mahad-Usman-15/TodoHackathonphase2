# ADR-005: Cross-Page Data Synchronization via Page Visibility API

> **Scope**: Covers the mechanism for keeping the task dashboard fresh when the AI chat agent modifies tasks on a separate page — including the sync trigger, timing contract, and the explicit rejection of shared global state.

- **Status:** Accepted
- **Date:** 2026-03-02
- **Feature:** 005-maintenance-fixes
- **Context:** The AI chat page (`/chat`) and the task dashboard (`/dashboard`) are separate Next.js pages. When a user asks the AI agent to create, complete, or delete a task from the chat page and then navigates back to the dashboard, the task list is stale — it reflects the state from when the dashboard was last loaded, not the current database state. A mechanism is needed to synchronize the dashboard's task list after AI-triggered mutations. The choice of sync mechanism determines whether a shared state library is introduced, whether continuous network requests are made, and what the latency contract is.

## Decision

Use the **native Page Visibility API** (`document.visibilitychange` event) to trigger a task list refetch in `dashboard/page.tsx` when the page becomes visible:

- **Trigger**: `document.addEventListener('visibilitychange', handler)` registered in a `useEffect` in `dashboard/page.tsx`
- **Condition**: When `document.visibilityState === 'visible'`, call the existing `loadTasks()` function
- **Timing contract**: Tasks are refreshed when the user navigates back to the dashboard — satisfying SC-003 ("within 3 seconds of returning to dashboard"), since navigation itself is the trigger
- **No global state**: Dashboard and chat pages do not share state. Dashboard owns `Task[]` state exclusively (per ADR-003). Chat page has no knowledge of the task list.
- **Cleanup**: Event listener removed in `useEffect` cleanup function to prevent memory leaks on unmount

## Consequences

### Positive

- Zero new dependencies — Page Visibility API is a native browser API, universally supported
- No continuous network requests — refetch only fires on user navigation, not on a timer
- Exactly satisfies SC-003: user navigating back to dashboard is the natural moment to refresh; latency is negligible compared to the navigation itself
- No architectural complexity — no stores, reducers, providers, or pub/sub patterns introduced
- Works correctly even if the user was away for a long time — always reflects current database state on return
- Composable — other data (e.g., user profile) could use the same pattern without new infrastructure

### Negative

- Refetch fires on every tab focus, not just after AI chat actions — minor unnecessary network call when user switches between browser tabs without visiting chat
- Users won't see task changes in real-time while both pages are open side-by-side (two windows) — only on navigation/focus
- If `loadTasks()` fails on refetch, the stale task list remains with no user notification (requires error boundary for recovery)
- Does not scale to a multi-tab or collaborative scenario where two users modify the same task list

## Alternatives Considered

### Alternative A: Shared Global State (Zustand / React Context) (Rejected)

Store the task list in a global Zustand store or React Context; both pages read from and write to the same store. AI chat page updates the store when the AI agent reports a successful task operation.

- **Pros**: Truly real-time — dashboard reflects changes instantly without any refetch; no duplicate API call on navigation
- **Cons**: Adds a dependency (Zustand) or significant React Context complexity; ADR-003 explicitly rejected global state libraries; chat page would need to know about tasks, violating separation of concerns; AI agent response is text — determining exactly which task was modified requires parsing or additional API calls
- **Rejected because**: ADR-003 already established no global state library; complexity cost far exceeds the benefit for a two-page hackathon app

### Alternative B: Polling (Dashboard Refreshes Every N Seconds) (Rejected)

Run a `setInterval` in `dashboard/page.tsx` that calls `loadTasks()` every 5–10 seconds while the page is mounted.

- **Pros**: Dashboard stays fresh continuously; no user action required
- **Cons**: Continuous network requests even when nothing has changed; spec explicitly states "no continuous polling" (clarification Q1); adds unnecessary load on Render free-tier backend; wakes the backend from idle if user is on the dashboard but not using chat
- **Rejected because**: Spec clarification explicitly rejected this approach (Q1 answer: "no continuous polling")

### Alternative C: Chat Page Pushes Update to Dashboard via localStorage Event (Rejected)

When AI chat confirms a task operation, the chat page writes a flag to `localStorage`; the dashboard listens for the `storage` event and refetches.

- **Pros**: Precise — only triggers refetch after an actual AI task operation; cross-tab compatible
- **Cons**: Hacky pattern; `localStorage` is generally avoided (ADR-001 prohibits token storage there, creates a precedent); requires parsing AI response to detect task operations — fragile; constitution flags localStorage storage as a concern
- **Rejected because**: Over-engineered for a two-page app where the Page Visibility approach meets all success criteria with zero complexity

## References

- Feature Spec: `specs/005-maintenance-fixes/spec.md` — FR-005, SC-003
- Implementation Plan: `specs/005-maintenance-fixes/plan.md` — 1B Frontend Changes (dashboard section)
- Research: `specs/005-maintenance-fixes/research.md` — Decision 2 (Dashboard Task Sync After Chat)
- Spec Clarification: `specs/005-maintenance-fixes/spec.md` — Clarifications Session 2026-03-02, Q1
- Related ADRs: ADR-003 (Frontend State Management Strategy — this ADR extends the "no global state" principle to cross-page sync)
- Evaluator Evidence: `history/prompts/005-maintenance-fixes/plan-001-maintenance-fixes-implementation-plan.prompt.md`
