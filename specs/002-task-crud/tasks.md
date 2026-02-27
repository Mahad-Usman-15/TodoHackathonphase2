# Tasks: Phase 2 — Task CRUD (Real Product Integration)

**Input**: Design documents from `/specs/002-task-crud/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/tasks-api.md ✅

**Tests**: Included — spec.md explicitly requests backend integration tests and frontend E2E tests.

**Organization**: Tasks are grouped by user story. Each story delivers an independently testable increment. Backend methods and routes grow incrementally story-by-story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to (US1–US4)
- Exact file paths included in all descriptions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Task data model — the single shared entity required by ALL user stories. No user story work begins until this is complete.

**⚠️ CRITICAL**: All user story phases depend on this phase.

- [x] T001 Create Task SQLModel with all 7 fields (id, title, description, completed, created_at, updated_at, user_id) and TaskCreate, TaskUpdate, TaskRead schemas in `backend/models/task.py`

**Checkpoint**: Task model exists — user story implementation can now begin.

---

## Phase 3: User Story 1 — Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Authenticated user can create tasks and see their full list on the dashboard. Data persists after page refresh. No mock data.

**Independent Test**: Log in → create a task with title and description → refresh page → task still appears with correct data.

### Backend — US1

- [x] T002 [US1] Implement `get_tasks(session, user_id)`, `create_task(session, user_id, data)`, and `get_task(session, user_id, task_id)` in `backend/services/task_service.py` — get_tasks returns tasks ordered by created_at DESC; create_task sets user_id from parameter, not from request body; get_task fetches a single task filtered by both id AND user_id, returns None if not found
- [x] T003 [US1] Create `backend/routes/tasks.py` with `GET /api/{user_id}/tasks` (returns task list), `POST /api/{user_id}/tasks` (returns 201 + created task), and `GET /api/{user_id}/tasks/{task_id}` (returns single task or 404); all endpoints use `Depends(get_current_user)` and validate `user_id == current_user.id` → 404 on mismatch
- [x] T004 [US1] Update `backend/main.py`: add `from models.task import Task` inside the lifespan function (before `SQLModel.metadata.create_all`) and add `from routes.tasks import router as tasks_router` + `app.include_router(tasks_router, prefix="/api", tags=["tasks"])` after the existing auth router

### Tests — US1

- [x] T005 [P] [US1] Write pytest integration tests for US1 in `backend/tests/test_tasks.py`: test create task returns 201 with correct fields; test list tasks returns array sorted newest-first; test list tasks for wrong user_id returns 404; test create with empty title returns 422; test unauthenticated request returns 401

### Frontend — US1

- [x] T006 [P] [US1] Add `Task`, `TaskCreate`, `TaskUpdate` TypeScript interfaces and `getTasks(userId)`, `createTask(userId, data)`, `getTask(userId, taskId)` methods to `frontend/lib/api.ts` — getTasks calls `GET /api/{userId}/tasks`, createTask calls `POST /api/{userId}/tasks` with 201 expected, getTask calls `GET /api/{userId}/tasks/{taskId}`
- [x] T007 [US1] Create `frontend/components/ui/Toast.tsx` as a client component — props: `message: string`, `type: "error" | "success"`, `onDismiss: () => void`; auto-dismisses after 3000ms using useEffect; positioned fixed bottom-right; red background for error, green for success; Tailwind CSS only
- [x] T008 [US1] Create `frontend/components/tasks/TaskForm.tsx` as a client component — controlled form with title input (required, max 200 chars) and description textarea (optional, max 1000 chars); on submit calls `api.createTask(userId, {title, description})`; calls `onTaskCreated(newTask)` prop on success; calls `onError(message)` prop on failure; clears form on success; shows submit loading state
- [x] T009 [US1] Create `frontend/components/tasks/TaskList.tsx` as a client component — props: `tasks: Task[]`, `userId: number`, callbacks for edit/toggle/delete; renders empty state ("No tasks yet. Create your first task above.") when tasks array is empty; maps tasks to `TaskItem` components
- [x] T010 [US1] Create `frontend/components/tasks/TaskItem.tsx` as a client component — props: `task: Task`, `onEdit`, `onToggle`, `onDelete`; displays task title (strikethrough when completed), optional description, created date; completed tasks have muted/gray styling; action buttons placeholder (empty for now — buttons added in US2–US4)
- [x] T011 [US1] Update `frontend/app/dashboard/page.tsx` — add `useState<Task[]>([])` for tasks, `useState` for toast message/type; on mount (useEffect after auth check) call `api.getTasks(user.id)` and set task state; render `<TaskForm userId={user.id} onTaskCreated={...} onError={...} />` and `<TaskList tasks={tasks} userId={user.id} onEdit={...} onToggle={...} onDelete={...} />`; render `<Toast>` when message is set; replace "Task management features coming soon" placeholder entirely; **preserve** the existing `useEffect(() => { if (!isLoading && !isAuthenticated) router.replace('/auth/login') })` redirect guard from Phase 1 — do not remove it

**Checkpoint**: US1 fully functional. User can create tasks, see them sorted newest-first, refresh and see persisted data. Empty state shows for new users.

---

## Phase 4: User Story 2 — Edit a Task (Priority: P2)

**Goal**: Authenticated user can update the title and/or description of any of their own tasks. Change persists after refresh. Cross-user edit returns 404.

**Independent Test**: Create a task → click Edit → change title → save → refresh → updated title is shown.

### Backend — US2

- [x] T012 [US2] Add `update_task(session, user_id, task_id, data)` method to `backend/services/task_service.py` — fetches task filtered by both id AND user_id; returns None if not found; updates title, description, and updated_at; commits and refreshes
- [x] T013 [US2] Add `PUT /api/{user_id}/tasks/{task_id}` route to `backend/routes/tasks.py` — calls task_service.update_task; raises HTTPException(404) if result is None; returns updated TaskRead

### Tests — US2

- [x] T014 [P] [US2] Add integration tests for US2 to `backend/tests/test_tasks.py`: test update own task returns 200 with updated fields and new updated_at; test update task belonging to another user returns 404; test update with empty title returns 422

### Frontend — US2

- [x] T015 [P] [US2] Add `updateTask(userId, taskId, data)` method to `frontend/lib/api.ts` — calls `PUT /api/{userId}/tasks/{taskId}` with TaskUpdate body; returns updated Task
- [x] T016 [US2] Create `frontend/components/tasks/EditTaskModal.tsx` as a client component — props: `task: Task`, `userId: number`, `onSave: (updated: Task) => void`, `onClose: () => void`; modal overlay with form pre-filled from task.title and task.description; on submit calls `api.updateTask(userId, task.id, data)`; calls onSave with updated task on success; calls onClose on cancel or success; shows loading state during save; error displayed as toast or inline if save fails
- [x] T017 [US2] Update `frontend/components/tasks/TaskItem.tsx` — add Edit button that calls `onEdit(task)` prop; button styled with Tailwind (e.g., pencil icon text or "Edit" label)
- [x] T018 [US2] Update `frontend/app/dashboard/page.tsx` — add `useState<Task | null>(null)` for editingTask; implement `handleEdit(task)` that sets editingTask; implement `handleSave(updated)` that replaces task in tasks array and clears editingTask; render `{editingTask && <EditTaskModal task={editingTask} userId={user.id} onSave={handleSave} onClose={() => setEditingTask(null)} />}`

**Checkpoint**: US2 fully functional. User can edit any of their tasks. Modal opens with pre-filled data, saves, and list reflects the update. Edit button visible on each task.

---

## Phase 5: User Story 3 — Toggle Task Completion (Priority: P3)

**Goal**: Authenticated user can mark any of their tasks complete or incomplete. State persists after refresh. Toggle flips the current completed boolean.

**Independent Test**: Create a task → click complete toggle → task shows as completed (strikethrough) → refresh → completed state preserved → toggle again → task back to pending.

### Backend — US3

- [x] T019 [US3] Add `toggle_task(session, user_id, task_id)` method to `backend/services/task_service.py` — fetches task filtered by id AND user_id; returns None if not found; flips task.completed (not_completed → True, completed → False); updates updated_at; commits and refreshes
- [x] T020 [US3] Add `PATCH /api/{user_id}/tasks/{task_id}/complete` route to `backend/routes/tasks.py` — no request body; calls task_service.toggle_task; raises HTTPException(404) if None; returns updated TaskRead

### Tests — US3

- [x] T021 [P] [US3] Add integration test for US3 to `backend/tests/test_tasks.py`: test toggle pending task → returns completed=True; test toggle completed task → returns completed=False; test toggle task belonging to another user returns 404

### Frontend — US3

- [x] T022 [P] [US3] Add `toggleTask(userId, taskId)` method to `frontend/lib/api.ts` — calls `PATCH /api/{userId}/tasks/{taskId}/complete` with no body; returns updated Task
- [x] T023 [US3] Update `frontend/components/tasks/TaskItem.tsx` — add completion toggle button (checkbox or checkmark icon) that calls `onToggle(task)` prop; completed tasks show title with strikethrough (`line-through`) and muted text color; button visually distinguishes pending vs complete state
- [x] T024 [US3] Update `frontend/app/dashboard/page.tsx` — implement `handleToggle(task)` that calls `api.toggleTask(user.id, task.id)` and replaces the task in tasks array with the returned updated task; shows error toast on failure

**Checkpoint**: US3 fully functional. Toggle button marks tasks complete/incomplete. Visual distinction between states. Persists after refresh.

---

## Phase 6: User Story 4 — Delete a Task (Priority: P4)

**Goal**: Authenticated user can permanently delete any of their own tasks. Confirmation dialog shown before deletion. Deleted tasks do not reappear after refresh.

**Independent Test**: Create a task → click Delete → confirmation dialog appears → click Cancel → task remains → click Delete again → click Confirm → task removed → refresh → task gone.

### Backend — US4

- [x] T025 [US4] Add `delete_task(session, user_id, task_id)` method to `backend/services/task_service.py` — fetches task filtered by id AND user_id; returns False if not found; deletes task; commits; returns True
- [x] T026 [US4] Add `DELETE /api/{user_id}/tasks/{task_id}` route to `backend/routes/tasks.py` — calls task_service.delete_task; raises HTTPException(404) if False; returns `{"message": "Task deleted successfully"}` with 200

### Tests — US4

- [x] T027 [P] [US4] Add integration tests for US4 to `backend/tests/test_tasks.py`: test delete own task returns 200 with success message; test task no longer appears in list after deletion; test delete task belonging to another user returns 404; test delete non-existent task returns 404

### Frontend — US4

- [x] T028 [P] [US4] Add `deleteTask(userId, taskId)` method to `frontend/lib/api.ts` — calls `DELETE /api/{userId}/tasks/{taskId}`; returns `{ message: string }`
- [x] T029 [US4] Create `frontend/components/tasks/DeleteConfirmDialog.tsx` as a client component — props: `taskTitle: string`, `onConfirm: () => void`, `onCancel: () => void`, `isDeleting: boolean`; modal overlay with message "Are you sure you want to delete \"{taskTitle}\"? This cannot be undone."; Confirm button (red, shows loading when isDeleting=true) and Cancel button; clicking overlay background calls onCancel
- [x] T030 [US4] Update `frontend/components/tasks/TaskItem.tsx` — add Delete button that calls `onDelete(task)` prop; button styled red or with trash icon; does NOT call API directly (confirmation handled by parent)
- [x] T031 [US4] Update `frontend/app/dashboard/page.tsx` — add `useState<Task | null>(null)` for deletingTask and `useState<boolean>(false)` for isDeleting; implement `handleDeleteRequest(task)` that sets deletingTask; implement `handleDeleteConfirm()` that sets isDeleting=true, calls `api.deleteTask(user.id, deletingTask.id)`, removes task from tasks array, clears deletingTask; implement `handleDeleteCancel()` that clears deletingTask; render `{deletingTask && <DeleteConfirmDialog taskTitle={deletingTask.title} onConfirm={handleDeleteConfirm} onCancel={handleDeleteCancel} isDeleting={isDeleting} />}`

**Checkpoint**: US4 fully functional. All 4 user stories working. Full CRUD operational.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Loading states, security verification, and end-to-end validation.

- [x] T032 Add loading state to `frontend/app/dashboard/page.tsx` — add `useState<boolean>(true)` for isLoadingTasks; set to true before getTasks call, false after (success or error); render spinner or skeleton in TaskList area while loading; prevents flash of empty state on initial load
- [x] T033 [P] Add cross-user security integration test to `backend/tests/test_tasks.py` — create two users (user A and user B), create a task as user A, attempt GET/PUT/PATCH/DELETE on that task as user B; verify all return 404
- [ ] T034 Run quickstart.md end-to-end verification checklist — manually verify all 16 checklist items pass in the running application (backend on :8000, frontend on :3000)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 2 (Foundational)
  └── T001: Task model
        ├── Phase 3 (US1): Backend service → routes → main.py → frontend → dashboard
        │     ├── Phase 4 (US2): Edit service method → route → frontend modal
        │     │     ├── Phase 5 (US3): Toggle service method → route → frontend toggle
        │     │     │     └── Phase 6 (US4): Delete service method → route → frontend confirm
        │     │     │           └── Phase 7 (Polish): loading state, security test, E2E check
```

### User Story Dependencies

- **US1 (P1)**: Depends only on T001 (Task model). All other US1 tasks can start after T001.
- **US2 (P2)**: Depends on US1 backend (routes file exists) + US1 frontend (TaskItem, dashboard wired). Adds to existing files.
- **US3 (P3)**: Depends on US1 backend (routes file exists) + US1 frontend. Adds to existing files.
- **US4 (P4)**: Depends on US1 backend (routes file exists) + US1 frontend. Adds to existing files.

### Within Each User Story

- Backend service → backend routes → main.py update (US1 only) → backend tests (parallel with frontend)
- Frontend api.ts → UI components → dashboard wiring

### Parallel Opportunities

Within US1 after T004 (main.py updated):
- T005 (backend tests) can run in parallel with T006–T011 (frontend work)
- T006 (api.ts) can run in parallel with T007 (Toast component)

Within US2–US4:
- Backend test tasks [P] can run in parallel with frontend api.ts additions [P]
- Service method and route additions must precede tests

---

## Parallel Execution Examples

### US1 Parallel Opportunities

```bash
# After T001–T004 complete, these can run in parallel:
Task A: "Write integration tests for list and create in backend/tests/test_tasks.py" (T005)
Task B: "Add Task types and getTasks/createTask to frontend/lib/api.ts" (T006)
Task C: "Create Toast component in frontend/components/ui/Toast.tsx" (T007)
```

### US2 Parallel Opportunities

```bash
# After T012–T013 complete, these can run in parallel:
Task A: "Write integration tests for update in backend/tests/test_tasks.py" (T014)
Task B: "Add updateTask method to frontend/lib/api.ts" (T015)
```

### US3 + US4 follow same pattern

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (Task model) — Phase 2
2. Complete T002–T004 (backend routes) — Phase 3 backend
3. Complete T006–T011 (frontend) — Phase 3 frontend
4. **STOP and VALIDATE**: Create task → refresh → still there. Empty state shows for new user.
5. Add T005 (tests) in parallel if needed

### Incremental Delivery

1. Complete Phase 2 + Phase 3 (US1) → **MVP: Create and view tasks**
2. Add Phase 4 (US2) → **Edit tasks**
3. Add Phase 5 (US3) → **Toggle completion**
4. Add Phase 6 (US4) → **Delete tasks with confirmation**
5. Complete Phase 7 → **Full polish and verification**

Each increment is independently demoable without breaking previous stories.

---

## Task Summary

| Phase | Story | Tasks | Notes |
|---|---|---|---|
| Phase 2 | Foundational | T001 | Task model — blocks everything |
| Phase 3 | US1 (P1) | T002–T011 | Full create + view (backend + frontend + tests) |
| Phase 4 | US2 (P2) | T012–T018 | Edit tasks |
| Phase 5 | US3 (P3) | T019–T024 | Toggle completion |
| Phase 6 | US4 (P4) | T025–T031 | Delete with confirmation |
| Phase 7 | Polish | T032–T034 | Loading, security test, E2E checklist |

**Total**: 34 tasks | **Parallelizable**: 13 tasks marked [P] | **MVP scope**: T001–T011 (11 tasks)

---

## Notes

- [P] tasks modify different files — safe to run in parallel
- US2–US4 backend tasks ADD to existing `task_service.py` and `routes/tasks.py` files
- US2–US4 frontend tasks ADD to existing `TaskItem.tsx`, `api.ts`, and `dashboard/page.tsx` files
- Validate each story checkpoint before proceeding to next
- All task API calls go through `frontend/lib/api.ts` — no direct fetch in components
- Backend uses cookie-based auth (`access_token` HTTP-only cookie) — no Bearer header needed in frontend
