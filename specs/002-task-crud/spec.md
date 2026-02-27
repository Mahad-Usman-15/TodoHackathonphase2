# Feature Specification: Phase 2 — Task CRUD (Real Product Integration)

**Feature Branch**: `002-task-crud`
**Created**: 2026-02-26
**Status**: Draft
**Input**: User description: "Phase 2 — Task CRUD (Real Product Integration)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and View Tasks (Priority: P1)

An authenticated user logs into the dashboard and creates a new task by entering a title and optional description. After submitting, the task appears immediately in their task list. On page refresh, the task is still visible, confirming it was persisted to the database — not held in memory.

**Why this priority**: This is the core value of the product. Without the ability to create and retrieve tasks, no other functionality has meaning.

**Independent Test**: Can be tested by logging in, creating a task, refreshing the page, and confirming the task still appears with the correct data.

**Acceptance Scenarios**:

1. **Given** an authenticated user is on the dashboard, **When** they submit a new task with a title, **Then** the task appears in their task list and persists after page refresh.
2. **Given** an authenticated user submits a task with no title, **When** the form is submitted, **Then** the system rejects the request with a clear validation error.
3. **Given** an authenticated user has no tasks, **When** they view the dashboard, **Then** an empty state is shown (no mock or placeholder tasks).

---

### User Story 2 - Edit a Task (Priority: P2)

An authenticated user selects an existing task and updates its title or description. The change is saved to the backend and reflected in the UI. After refreshing, the updated content persists.

**Why this priority**: Editing is essential for a real task manager. Users must be able to correct mistakes or update progress.

**Independent Test**: Can be tested by creating a task, editing it, refreshing, and confirming the updated content is shown.

**Acceptance Scenarios**:

1. **Given** an authenticated user has an existing task, **When** they update the title and save, **Then** the task list shows the updated title and it persists after refresh.
2. **Given** an authenticated user attempts to edit a task that belongs to another user, **When** the request reaches the backend, **Then** the system returns a 404 error and no data is modified.
3. **Given** an authenticated user submits an edit with an empty title, **When** the form is submitted, **Then** the system rejects the request with a validation error.

---

### User Story 3 - Toggle Task Completion (Priority: P3)

An authenticated user marks a task as complete or incomplete. The UI reflects the new state immediately, and the change is confirmed by a successful backend response. After refresh, the completion state is preserved.

**Why this priority**: Completion toggling is the defining interaction of a Todo app. It closes the loop on the user's primary workflow.

**Independent Test**: Can be tested by creating a task, toggling it complete, refreshing, and confirming the completion state is retained.

**Acceptance Scenarios**:

1. **Given** an authenticated user has a pending task, **When** they click the complete button, **Then** the task is marked as completed and the UI updates accordingly.
2. **Given** an authenticated user has a completed task, **When** they toggle it again, **Then** the task returns to pending state and the change persists after refresh.
3. **Given** a task completion toggle request is sent for a task not owned by the user, **When** processed by the backend, **Then** a 404 is returned and no state changes.

---

### User Story 4 - Delete a Task (Priority: P4)

An authenticated user deletes a task they no longer need. Before deletion, the system presents a confirmation prompt. Upon confirmation, the task is permanently removed from the UI and no longer retrievable after a page refresh.

**Why this priority**: Deletion is necessary for users to manage their list, but it provides no net new value on its own — dependent on creation being complete.

**Independent Test**: Can be tested by creating a task, clicking delete, confirming the prompt, refreshing, and confirming the task is gone.

**Acceptance Scenarios**:

1. **Given** an authenticated user has a task, **When** they click delete, **Then** a confirmation prompt appears asking them to confirm the deletion.
2. **Given** the confirmation prompt is shown, **When** the user confirms, **Then** the task is permanently removed from the list and does not reappear after refresh.
3. **Given** the confirmation prompt is shown, **When** the user cancels, **Then** no deletion occurs and the task remains in the list unchanged.
4. **Given** an authenticated user tries to delete a task belonging to another user, **When** the request is processed, **Then** the backend returns 404 and no task is deleted.
5. **Given** an authenticated user deletes all tasks, **When** the dashboard reloads, **Then** an empty state is displayed.

---

### Edge Cases

- **Title exceeding max length**: System returns 422 Unprocessable Entity; frontend form enforces 200-char limit client-side to prevent the request; no data is created or modified.
- **Session expiry mid-operation**: The HTTP-only cookie expires; the next API call returns 401; the frontend dispatches an `auth:unauthorized` event, clears user state, and redirects to the login page automatically.
- **Concurrent toggle requests on same task**: Last write wins — no explicit locking; PostgreSQL serializes writes at the row level; the final state reflects whichever request committed last.
- **Backend unreachable**: The API client receives a network error; the UI displays an error toast ("Something went wrong. Please try again."); no local state is changed; the user may retry.
- **Empty task list on first load**: A friendly empty state message is shown ("No tasks yet. Create your first task above."); no spinner or placeholder task data is displayed after the initial load completes.
- **Manually crafted cross-user request**: Backend verifies URL `user_id` against the authenticated user's id from the cookie token; any mismatch returns 404 regardless of whether the task exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require a valid authenticated session for all task-related operations (create, read, update, delete, toggle).
- **FR-002**: System MUST allow authenticated users to create a task with a required title and an optional description.
- **FR-003**: System MUST retrieve and display only the tasks belonging to the currently authenticated user, sorted by creation date with the most recently created tasks shown first.
- **FR-004**: System MUST allow authenticated users to update the title and/or description of their own tasks.
- **FR-005**: System MUST require explicit user confirmation before permanently deleting a task, and must cancel the operation if the user dismisses the confirmation.
- **FR-006**: System MUST allow authenticated users to toggle the completion status of their own tasks.
- **FR-007**: System MUST reject any request to read, update, delete, or toggle a task that does not belong to the authenticated user, returning a 404 response.
- **FR-008**: System MUST persist all task data to the database — no in-memory or mock data at any layer.
- **FR-009**: System MUST redirect unauthenticated users to the login page when they attempt to access the dashboard.
- **FR-010**: System MUST validate all task input fields and return descriptive errors for invalid submissions.
- **FR-011**: UI MUST display all operation errors (network failures, validation errors, server errors) as toast/snackbar notifications that auto-dismiss without blocking the user's workflow.
- **FR-012**: UI MUST derive its state entirely from backend API responses — no locally fabricated state.
- **FR-013**: UI MUST reflect the correct task state after a full page refresh.
- **FR-014**: All task data returned by the backend MUST be scoped exclusively to the requesting user.

### Key Entities

- **Task**: Represents a unit of work owned by a user. Has a title (required), optional description, a completion status, a creation timestamp, and a link to the owning user. Tasks are private to their owner.
- **User**: An authenticated account. Owns zero or more tasks. Identity is verified on every request; tasks are filtered by this identity at the data layer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authenticated users can create a task in under 10 seconds from landing on the dashboard.
- **SC-002**: All task operations (create, edit, delete, toggle) complete and reflect the correct state after a page refresh — 100% of the time.
- **SC-003**: No task created by User A is ever visible or accessible to User B — verified across all five operations.
- **SC-004**: Users attempting any task operation without a valid session are redirected to login within 1 second.
- **SC-005**: 100% of task operations reach the backend and are persisted — zero operations rely on mock or in-memory data.
- **SC-006**: The full user flow (login → create → refresh → edit → mark complete → delete) completes successfully without manual intervention.

## Clarifications

### Session 2026-02-26

- Q: When a user clicks "Delete" on a task, should the system require confirmation before permanently removing it? → A: Yes — show a confirmation prompt ("Are you sure?") before deleting.
- Q: When a task operation fails (network error, validation error, server error), how should the UI present the error? → A: Toast/snackbar — brief pop-up notification that auto-dismisses.
- Q: What should be the default sort order for a user's task list? → A: Newest first — tasks sorted by creation date, most recent at top.

## Assumptions

- Authentication from Phase 1 is already implemented and working. This feature builds directly on top of it.
- The JWT token storage strategy from Phase 1 (in-memory access token + HTTP-only refresh cookie) is already established and will be reused without modification.
- The User model and authentication middleware are already defined; only the Task model and task routes are new.
- No pagination is required — all tasks for the user are returned in a single response.
- Task titles are limited to 200 characters; descriptions are limited to 1000 characters. Both limits are enforced at the backend (422 on violation) and reflected in frontend form constraints.
- Deletion is permanent and immediate — no soft delete, trash, or undo mechanism.
- Optimistic UI is not required; state updates occur only after a confirmed backend response.
- The frontend dashboard is a protected route — users must be logged in to access it.

## Out of Scope

- Task categories, labels, or tags
- Due dates or reminders
- File attachments
- Pagination or infinite scroll
- Search or filtering
- Real-time updates (WebSockets / SSE)
- Multi-user task collaboration or sharing
- Admin dashboard or moderation tools
- Role-based access control
- Task ordering or prioritization controls
