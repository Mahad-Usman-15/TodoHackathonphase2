# ADR-003: Frontend State Management Strategy

> **Scope**: Covers the cluster of frontend state decisions — state library selection, update timing (optimistic vs confirmed), error feedback mechanism, and component ownership of state — as an integrated approach applied across all four user story components.

- **Status:** Accepted
- **Date:** 2026-02-26
- **Feature:** 002-task-crud
- **Context:** The dashboard page must manage a task list that changes through four operations (create, edit, toggle, delete). A decision was needed on: where task state lives, when state updates relative to API responses, what library (if any) manages remote state, and how errors are surfaced to the user. This cluster of decisions shapes how all four user story components are written and how they interact.

## Decision

Use **React built-in state management** with **confirmed-only updates** and **toast-based error feedback**:

- **State location**: `useState<Task[]>` in `frontend/app/dashboard/page.tsx` — single source of truth for the task list; passed down as props
- **No external state library**: No Redux, Zustand, React Query, SWR, or similar — only React's `useState` and `useEffect`
- **Update timing**: State is updated **only after a confirmed successful API response** — no optimistic updates; UI reflects backend truth at all times
- **Error display**: Failed operations display an auto-dismissing toast/snackbar notification (3-second timeout); no operation is silently swallowed
- **Loading state**: A boolean `isLoadingTasks` state controls a spinner shown during initial task fetch; prevents empty-state flash on load
- **Component architecture**: Dashboard page owns all handlers (`handleEdit`, `handleToggle`, `handleDelete`, `handleCreate`) and passes callbacks to presentational child components

## Consequences

### Positive

- Zero additional npm dependencies — no external library to learn, configure, or maintain
- State is always consistent with the backend — no divergence between UI and database
- Predictable debugging — if UI shows X, the database contains X (no optimistic state that may be rolled back)
- Simple component contracts — child components are purely presentational (receive tasks + callbacks, emit events)
- Fast to implement — no boilerplate for stores, reducers, or query keys
- Aligns with constitution's "Architecture Simplicity" principle (no premature abstraction)

### Negative

- Page-level `useState` will accumulate multiple state variables as stories are implemented (tasks, editingTask, deletingTask, isDeleting, isLoadingTasks, toastMessage) — can become complex
- No background refetching — stale data if another session modifies tasks (acceptable for single-user, single-tab hackathon scope)
- Confirmed-only updates mean perceived latency on slow connections — user sees no feedback until server responds
- Prop drilling from dashboard → TaskList → TaskItem for callbacks; becomes unwieldy at deeper nesting levels
- No built-in cache invalidation or deduplication — duplicate API calls possible if components re-mount

## Alternatives Considered

### Alternative A: React Query / TanStack Query (Rejected)

Manage all server state (task list, mutations) with React Query — handles caching, background refetch, loading/error states, and optimistic updates automatically.

- **Pros**: Significantly reduces boilerplate for loading/error states; built-in cache invalidation; background refetch keeps data fresh; optimistic updates with rollback built in; industry standard for server-state management in React
- **Cons**: Adds a dependency (`@tanstack/react-query`); requires wrapping app in `QueryClientProvider`; learning curve for query keys and invalidation patterns; constitution prefers minimal dependencies
- **Rejected because**: Over-engineered for a single-page, single-user hackathon dashboard; constitution mandates simplicity; no new dependencies without justification

### Alternative B: Zustand Global Store (Rejected)

Store task list in a Zustand global store; components subscribe directly without prop drilling.

- **Pros**: Eliminates prop drilling; cleaner component interfaces; easy to share state between distant components
- **Cons**: Adds a dependency; global state makes data flow less explicit; overkill for a single page with shallow component hierarchy; constitution prohibits unapproved libraries
- **Rejected because**: Dashboard is a single page — prop drilling depth is at most two levels (dashboard → list → item); global store is unnecessary complexity

### Alternative C: Optimistic UI Updates (Rejected for Phase 2)

Update the UI immediately on user action, then confirm/rollback based on API response.

- **Pros**: Perceived performance is better — UI responds instantly; industry-standard UX pattern for CRUD apps
- **Cons**: Requires rollback logic for every operation; rollback on error can be confusing UX; adds complexity to state management; spec explicitly states "Optimistic UI is not required" (Assumption in spec.md)
- **Rejected because**: Spec assumption explicitly rules it out; adds implementation complexity without hackathon-level justification; confirmed-only updates meet all acceptance criteria

## References

- Feature Spec: `specs/002-task-crud/spec.md` — Assumptions ("Optimistic UI is not required"), FR-011, FR-012
- Implementation Plan: `specs/002-task-crud/plan.md` — Frontend Steps F6–F8, Research decisions
- Research: `specs/002-task-crud/research.md` — State Management and Toast Error Display sections
- Constitution: `.specify/memory/constitution.md` — Architecture Simplicity, Frontend Patterns sections
- Implementation: `frontend/app/dashboard/page.tsx` (T011, T018, T024, T031, T032), `frontend/components/ui/Toast.tsx` (T007)
- Related ADRs: ADR-001 (Authentication Token Storage Strategy)
