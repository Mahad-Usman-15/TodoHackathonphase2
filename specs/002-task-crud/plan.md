# Implementation Plan: Phase 2 — Task CRUD

**Branch**: `master` | **Date**: 2026-02-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-task-crud/spec.md`

## Summary

Implement full task management (CRUD + completion toggle) on top of the existing Phase 1 authentication system. Users can create, view, edit, delete, and mark tasks complete from the dashboard. All data is persisted in Neon PostgreSQL, all operations are user-scoped via the authenticated cookie session, and the UI derives its state exclusively from backend responses.

## Technical Context

**Language/Version**: Python 3.9+ (backend), TypeScript / Next.js 16+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, python-jose (backend — all existing); React, Tailwind CSS (frontend — all existing)
**Storage**: Neon Serverless PostgreSQL — new `task` table via SQLModel auto-create
**Testing**: Manual E2E via browser + backend curl verification; pytest integration tests (backend)
**Target Platform**: Local development (localhost:8000 backend, localhost:3000 frontend)
**Performance Goals**: Task list loads within 1 second; all mutations complete within 2 seconds
**Constraints**: No new dependencies; cookie-based auth only; no pagination; no mock data anywhere
**Scale/Scope**: Single user's task list; basic hackathon level (no enterprise concerns)

## Constitution Check

| Gate | Status | Notes |
|---|---|---|
| Spec-first development | PASS | spec.md created and clarified before this plan |
| Approved tech stack only | PASS | No new libraries; FastAPI + SQLModel + Next.js + Tailwind |
| JWT with HS256 | PASS | Inherited from Phase 1; no changes to auth |
| HTTP-only cookie for tokens | PASS | `access_token` cookie; `get_current_user` dependency reused |
| Integer primary keys | PASS | `id: Optional[int]`, `user_id: int` |
| No localStorage for tokens | PASS | Cookie-based auth; no token stored in frontend |
| All routes under `/api/` | PASS | Pattern: `/api/{user_id}/tasks` |
| No raw SQL | PASS | All queries via SQLModel ORM |
| User data isolation | PASS | URL `user_id` validated against `current_user.id` on every request |
| No manual coding | PASS | Generated via Claude Code from this plan |
| Frontend calls only via `lib/api.ts` | PASS | No direct fetch in components |

**GATE RESULT: ALL PASS** — No violations. Proceed to Phase 1 design.

## Project Structure

### Documentation (this feature)

```text
specs/002-task-crud/
├── plan.md              ← This file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── tasks-api.md     ← Phase 1 output
├── checklists/
│   └── requirements.md  ← Spec quality checklist
└── tasks.md             ← Phase 2 output (/sp.tasks — not yet created)
```

### Source Code Layout

```text
backend/
├── main.py                          ← UPDATE: import Task, register tasks router
├── models/
│   ├── user.py                      ← existing (no changes)
│   └── task.py                      ← NEW: Task model + schemas
├── services/
│   ├── auth_service.py              ← existing (no changes)
│   └── task_service.py             ← NEW: CRUD business logic
├── routes/
│   ├── auth.py                      ← existing (no changes)
│   └── tasks.py                     ← NEW: thin route handlers
└── middleware/
    └── auth_middleware.py           ← existing (no changes)

frontend/
├── lib/
│   └── api.ts                       ← UPDATE: add task CRUD methods + Task types
├── types/
│   └── index.ts                     ← UPDATE: add Task, TaskCreate, TaskUpdate interfaces
├── components/
│   ├── tasks/
│   │   ├── TaskList.tsx             ← NEW: renders task list
│   │   ├── TaskItem.tsx             ← NEW: single task row with actions
│   │   ├── TaskForm.tsx             ← NEW: create task form
│   │   ├── EditTaskModal.tsx        ← NEW: edit task form/modal
│   │   └── DeleteConfirmDialog.tsx  ← NEW: confirmation before delete
│   └── ui/
│       └── Toast.tsx                ← NEW: auto-dismissing notification
└── app/
    └── dashboard/
        └── page.tsx                 ← UPDATE: integrate task components, replace placeholder
```

**Structure Decision**: Web application (Option 2) — separate `backend/` and `frontend/` directories, matching existing Phase 1 layout exactly.

## Phase 0: Research

*Complete. See [research.md](./research.md).*

**Key decisions resolved**:
- Auth via cookie (`access_token`) — inherited from Phase 1, no changes
- URL pattern: `/api/{user_id}/tasks` with integer `user_id`; validated against `current_user.id`
- Cross-user access → 404 (not 403) to prevent enumeration
- Sort order: `created_at` DESC (newest first)
- Error display: toast/snackbar (React state, no external library)
- Deletion: requires confirmation dialog before API call
- No new npm or Python packages

## Phase 1: Design & Contracts

*Complete. See artifacts below.*

### Data Model → [data-model.md](./data-model.md)

**New entity: Task**

| Field | Type | Constraints |
|---|---|---|
| `id` | int | PK, auto-increment |
| `title` | str | NOT NULL, max 200 chars |
| `description` | Optional[str] | Nullable, max 1000 chars |
| `completed` | bool | NOT NULL, DEFAULT False |
| `created_at` | datetime | NOT NULL, DEFAULT utcnow |
| `updated_at` | datetime | NOT NULL, DEFAULT utcnow, updated on write |
| `user_id` | int | NOT NULL, FK → users.id, INDEX, CASCADE DELETE |

**Schemas**: `TaskCreate` (title + description), `TaskUpdate` (title + description), `TaskRead` (all fields).

### API Contracts → [contracts/tasks-api.md](./contracts/tasks-api.md)

| Method | Path | Description | Auth | Success |
|---|---|---|---|---|
| GET | `/api/{user_id}/tasks` | List all user tasks (newest first) | Cookie | 200 + array |
| POST | `/api/{user_id}/tasks` | Create new task | Cookie | 201 + task |
| GET | `/api/{user_id}/tasks/{id}` | Get single task | Cookie | 200 + task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task title/description | Cookie | 200 + task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task permanently | Cookie | 200 + message |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completed boolean | Cookie | 200 + task |

**Ownership rule**: All task-specific endpoints (not POST/GET list) verify `user_id` URL param == `current_user.id`. Mismatch → 404.

### Quickstart → [quickstart.md](./quickstart.md)

Development order: backend models → service → routes → main.py update → frontend types → api.ts → components → dashboard.

## Implementation Sequence

### Backend (implement in order)

**Step B1**: `backend/models/task.py`
- `Task(SQLModel, table=True)` with all 7 fields
- `TaskCreate(SQLModel)` — title (required, max 200), description (optional, max 1000)
- `TaskUpdate(SQLModel)` — same as TaskCreate
- `TaskRead(SQLModel)` — all fields including id, created_at, updated_at, user_id

**Step B2**: `backend/services/task_service.py`
- `get_tasks(session, user_id) → list[Task]` — query filtered by user_id, ordered by created_at DESC
- `create_task(session, user_id, data: TaskCreate) → Task`
- `get_task(session, user_id, task_id) → Task | None` — filtered by both id AND user_id
- `update_task(session, user_id, task_id, data: TaskUpdate) → Task | None`
- `delete_task(session, user_id, task_id) → bool`
- `toggle_task(session, user_id, task_id) → Task | None`

**Step B3**: `backend/routes/tasks.py`
- `router = APIRouter()`
- Each endpoint calls service function; raises `HTTPException(404)` if service returns None
- All endpoints have `current_user: User = Depends(get_current_user)`
- Ownership: if `user_id != current_user.id` → `HTTPException(404)`

**Step B4**: Update `backend/main.py`
- Add `from models.task import Task` inside lifespan (so table is created)
- Add `from routes.tasks import router as tasks_router`
- Add `app.include_router(tasks_router, prefix="/api", tags=["tasks"])`

### Frontend (implement in order)

**Step F1**: Update `frontend/lib/api.ts` + types
- Add `Task`, `TaskCreate`, `TaskUpdate` interfaces (or to `@/types`)
- Add 6 task methods to `api` object: `getTasks`, `createTask`, `getTask`, `updateTask`, `deleteTask`, `toggleTask`
- Note: `getTasks`, `createTask`, `getTask` added in T006 (US1); `updateTask` in T015 (US2); `toggleTask` in T022 (US3); `deleteTask` in T028 (US4)

**Step F2**: `frontend/components/ui/Toast.tsx`
- Props: `message: string`, `type: "error" | "success"`, `onDismiss: () => void`
- Auto-dismisses after 3 seconds
- Styled with Tailwind (red for error, green for success)

**Step F3**: `frontend/components/tasks/TaskForm.tsx`
- Controlled form: title (required) + description (optional textarea)
- On submit: calls `api.createTask(userId, data)` → adds to task list
- Shows error toast on failure; clears form on success

**Step F4**: `frontend/components/tasks/DeleteConfirmDialog.tsx`
- Props: `taskTitle: string`, `onConfirm: () => void`, `onCancel: () => void`
- Renders modal overlay with "Are you sure?" text, Confirm + Cancel buttons

**Step F5**: `frontend/components/tasks/EditTaskModal.tsx`
- Props: `task: Task`, `onSave: (task: Task) => void`, `onClose: () => void`
- Pre-fills form with existing title/description
- On save: calls `api.updateTask(userId, taskId, data)` → calls `onSave` with updated task

**Step F6**: `frontend/components/tasks/TaskItem.tsx`
- Props: `task: Task`, `onToggle`, `onEdit`, `onDelete`
- Displays title, description, completed state
- Toggle button, Edit button, Delete button (Delete opens `DeleteConfirmDialog`)
- Completed tasks visually distinguished (strikethrough or muted color)

**Step F7**: `frontend/components/tasks/TaskList.tsx`
- Props: `tasks: Task[]`, `userId: number`, `onUpdate: (tasks: Task[]) => void`
- Renders empty state or list of `<TaskItem>`
- Handles toggle, edit, delete callbacks; calls API then updates parent state

**Step F8**: Update `frontend/app/dashboard/page.tsx`
- Load tasks on mount: `api.getTasks(user.id)`
- Manage `tasks` state with `useState<Task[]>`
- Manage `toast` state for error/success messages
- Render `<TaskForm>` + `<TaskList>` + `<Toast>` (if message set)
- Replace "Task management features coming soon" placeholder entirely

## Post-Design Constitution Re-Check

All constitution gates remain PASS after Phase 1 design:
- No new technologies introduced
- Integer PKs and FKs maintained throughout
- Cookie auth unchanged
- All frontend calls route through `lib/api.ts`
- No business logic in frontend components (service layer handles it)
- User isolation enforced at both route and service level

## Artifacts

| Artifact | Path | Status |
|---|---|---|
| Specification | `specs/002-task-crud/spec.md` | Complete |
| Research | `specs/002-task-crud/research.md` | Complete |
| Data Model | `specs/002-task-crud/data-model.md` | Complete |
| API Contracts | `specs/002-task-crud/contracts/tasks-api.md` | Complete |
| Quickstart | `specs/002-task-crud/quickstart.md` | Complete |
| Tasks | `specs/002-task-crud/tasks.md` | Complete |
