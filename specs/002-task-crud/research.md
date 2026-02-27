# Research: Phase 2 — Task CRUD

**Phase**: 0 | **Date**: 2026-02-26 | **Feature**: 002-task-crud

## Existing Codebase Findings

### Authentication Layer (Inherited)

**Decision**: Cookie-based auth using HTTP-only `access_token` cookie — NOT Bearer header.
**Rationale**: Phase 1 implemented `get_current_user` dependency that reads from `request.cookies.get("access_token")`. The middleware is already working and tested.
**Impact on tasks**: All task routes use `Depends(get_current_user)` to obtain the authenticated user. No changes to auth middleware needed.

**Key file**: `backend/middleware/auth_middleware.py` — `get_current_user(request, session)` returns a `User` object.

---

### URL Pattern

**Decision**: `/api/{user_id}/tasks` with integer `user_id` in path.
**Rationale**: Matches CLAUDE.md and constitution. URL user_id must be validated against `current_user.id` (from JWT) to enforce isolation.
**Security rule**: If `user_id` in URL ≠ `current_user.id` from cookie → return 404 immediately (no enumeration leakage).

---

### Task Model Fields

**Decision**:
- `id`: int, primary key, auto-increment
- `title`: str, required, max 200 chars
- `description`: Optional[str], max 1000 chars
- `completed`: bool, default False
- `created_at`: datetime, auto-set on insert
- `updated_at`: datetime, auto-set on update
- `user_id`: int, FK → users.id, indexed

**Rationale**: Matches CLAUDE.md schema spec and constitution database standards (integer PKs, indexed FK). `updated_at` is added for proper update tracking.

---

### Sort Order

**Decision**: Tasks returned sorted by `created_at` DESC (newest first).
**Rationale**: User clarification Q3 answer. Most recently created tasks appear at top of list.

---

### Error Response Pattern

**Decision**: 404 for cross-user task access, 422 for validation errors, 401 for missing/invalid token.
**Rationale**: 404 prevents task ID enumeration (attacker cannot distinguish "not found" from "belongs to someone else"). Matches CLAUDE.md status code conventions.

---

### Frontend Error Display

**Decision**: Toast/snackbar notifications that auto-dismiss.
**Rationale**: User clarification Q2 answer. Non-blocking, standard pattern for CRUD feedback. Implementation: lightweight toast state in dashboard component (no external library needed).

---

### Deletion Confirmation

**Decision**: Confirmation dialog before permanent deletion.
**Rationale**: User clarification Q1 answer. Prevents accidental data loss.

---

### Frontend API Client Pattern

**Decision**: Extend existing `frontend/lib/api.ts` with task methods. All calls use existing `request<T>()` helper which already handles 401 → auth event dispatch.
**Rationale**: Existing pattern already handles credentials, error propagation, and unauthorized redirect. No new HTTP client needed.

---

### State Management

**Decision**: Local React state in dashboard component (`useState` for task list). No external state library.
**Rationale**: Constitution mandates simplicity. Task list is per-user and dashboard-scoped. `useState` + re-fetch after mutations is sufficient.

---

### No New Dependencies

**Decision**: No new npm packages or Python packages for task CRUD.
**Rationale**: All needed primitives already available: SQLModel (backend), React state (frontend), Tailwind (styling), existing fetch wrapper (API client).

---

## Technology Decisions Summary

| Decision | Choice | Alternatives Rejected |
|---|---|---|
| Auth method | Cookie (`access_token`) | Bearer header (not how Phase 1 built it) |
| Task sort | `created_at` DESC | Alphabetical, manual ordering |
| Error display | Toast (React state) | External toast library (over-engineering) |
| Deletion guard | Confirm dialog (inline modal) | Browser `window.confirm` (poor UX) |
| State management | `useState` in dashboard | Redux/Zustand (overkill) |
| Task model backend | SQLModel `table=True` | Separate Pydantic + SQLAlchemy (redundant) |
| URL ownership check | Compare URL `user_id` to `current_user.id` | Middleware-level enforcement (less explicit) |
