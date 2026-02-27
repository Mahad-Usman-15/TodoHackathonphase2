# ADR-002: User Data Isolation and Cross-User Access Response Pattern

> **Scope**: Covers the full cluster of user isolation enforcement decisions — URL parameter design, ownership validation strategy, HTTP response code for unauthorized resource access, and service-layer filtering approach.

- **Status:** Accepted
- **Date:** 2026-02-26
- **Feature:** 002-task-crud (applies to all resource endpoints)
- **Context:** A multi-user Todo application must ensure that User A can never read, modify, or delete User B's tasks — even if they know the task's integer ID. Since task IDs are sequential integers (not UUIDs), a user can trivially enumerate potential task IDs. Three layered decisions had to be made together: (1) how to encode user ownership in the URL, (2) where and how to enforce ownership validation, and (3) what HTTP status code to return when a user accesses a resource that doesn't belong to them.

## Decision

Enforce user data isolation through three integrated mechanisms:

- **URL Design**: User-scoped routes encode `user_id` as a path parameter — `GET /api/{user_id}/tasks`, `DELETE /api/{user_id}/tasks/{task_id}`, etc. The `user_id` is an integer matching `users.id`.
- **Ownership Validation**: Every route handler performs an explicit comparison: `if user_id != current_user.id → raise HTTPException(404)`. This check occurs before any database query on task-specific endpoints.
- **Service-layer Filtering**: All database queries filter by `user_id` — e.g., `select(Task).where(Task.user_id == user_id)`. The task must belong to the authenticated user to be returned by any query.
- **Response Code**: Cross-user access returns **404 Not Found** (not 403 Forbidden). This prevents resource enumeration — an attacker cannot distinguish "this task doesn't exist" from "this task belongs to someone else."

## Consequences

### Positive

- Dual enforcement (route-level + query-level) makes accidental data leakage structurally impossible — both layers must fail simultaneously for a breach to occur
- 404 for cross-user access prevents task ID enumeration — attacker learns nothing about whether a task at a given ID exists
- URL-encoded user_id makes ownership explicit in every request — easy to audit, log, and trace
- Service functions are safe to call from any context because they always filter by user_id — no risk of accidentally returning all tasks
- Aligns with the OWASP recommendation to not distinguish "not found" from "forbidden" for resources an unauthenticated/unauthorized user should not know exist

### Negative

- Returning 404 instead of 403 can be confusing during development and debugging — it masks authorization failures as "missing resource"
- URL-encoded user_id is redundant with the JWT claim — the user_id could be derived entirely from the cookie, making the URL parameter a potential attack surface if validation is accidentally skipped
- Adding a new resource type (e.g., comments, attachments) requires remembering to replicate both the URL pattern and the ownership check — no automatic enforcement
- Integration tests must create a second user to verify cross-user isolation — slightly more complex test setup

## Alternatives Considered

### Alternative A: Middleware-Level Enforcement Only (Rejected)

Move ownership validation entirely into middleware — middleware reads the task from DB and verifies ownership before the route handler runs.

- **Pros**: Route handlers are simpler (no ownership check code); DRY principle; easier to ensure all routes are covered
- **Cons**: Middleware must know about all resource types and URL patterns — tightly couples middleware to business logic; FastAPI's dependency injection system makes this awkward; constitution mandates "middleware handles authentication only"
- **Rejected because**: Constitution explicitly states "Middleware handles authentication only"; business logic belongs in the service layer

### Alternative B: Return 403 Forbidden for Cross-User Access (Rejected)

Return 403 when the authenticated user tries to access a resource belonging to another user.

- **Pros**: Semantically correct — the resource exists but the user is forbidden; better developer experience during debugging
- **Cons**: Confirms that a resource with a given ID exists — enables enumeration attacks where an attacker can map all valid task IDs by observing 403 vs 404 responses; leaks information about the dataset
- **Rejected because**: 404 is the security-correct choice for multi-tenant APIs where resource existence itself is sensitive information

### Alternative C: Remove user_id from URL; Derive Entirely from JWT (Rejected)

Use routes like `GET /api/tasks` with no user_id in URL; backend derives user_id entirely from the JWT cookie.

- **Pros**: Eliminates the validation step entirely — no URL/JWT mismatch possible; simpler client code (no user_id needed in requests)
- **Cons**: Deviates from the CLAUDE.md and constitution-specified URL pattern (`/api/{user_id}/tasks`); harder to read logs and traces (no user context in URL); changing the URL pattern mid-project requires spec amendment
- **Rejected because**: CLAUDE.md and constitution explicitly specify `/api/{user_id}/tasks` pattern; architectural consistency with the agreed spec takes priority

## References

- Feature Spec: `specs/002-task-crud/spec.md` — FR-007, FR-013, FR-014
- Implementation Plan: `specs/002-task-crud/plan.md` — Ownership rule section
- Research: `specs/002-task-crud/research.md` — URL Pattern and Error Response Pattern sections
- API Contract: `specs/002-task-crud/contracts/tasks-api.md` — Ownership check note
- Constitution: `.specify/memory/constitution.md` — Security Requirements, API Conventions sections
- Implementation: `backend/routes/tasks.py` (T003), `backend/services/task_service.py` (T002), `backend/tests/test_tasks.py` (T033)
- Related ADRs: ADR-001 (Authentication Token Storage Strategy)
