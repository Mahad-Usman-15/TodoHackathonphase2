# Quickstart: Phase 2 — Task CRUD

**Feature**: 002-task-crud | **Date**: 2026-02-26

## Prerequisites

- Phase 1 (authentication) fully implemented and working
- Backend running: `cd backend && uvicorn main:app --reload --port 8000`
- Frontend running: `cd frontend && npm run dev`
- `.env` configured with `DATABASE_URL` and `AUTH_SECRET`

## What Gets Built

### Backend (3 new files, 1 updated)

| File | Action | Purpose |
|---|---|---|
| `backend/models/task.py` | Create | Task SQLModel + request/response schemas |
| `backend/services/task_service.py` | Create | Business logic (CRUD + ownership validation) |
| `backend/routes/tasks.py` | Create | Thin route handlers (delegate to service) |
| `backend/main.py` | Update | Import Task model, register tasks router |

### Frontend (5–6 new files, 2 updated)

| File | Action | Purpose |
|---|---|---|
| `frontend/components/tasks/TaskList.tsx` | Create | Renders list of tasks |
| `frontend/components/tasks/TaskItem.tsx` | Create | Single task row with actions |
| `frontend/components/tasks/TaskForm.tsx` | Create | Create new task form |
| `frontend/components/tasks/EditTaskModal.tsx` | Create | Edit task inline or modal |
| `frontend/components/tasks/DeleteConfirmDialog.tsx` | Create | Confirmation dialog before delete |
| `frontend/components/ui/Toast.tsx` | Create | Auto-dismissing error/success notification |
| `frontend/lib/api.ts` | Update | Add 6 task CRUD methods |
| `frontend/app/dashboard/page.tsx` | Update | Replace placeholder with task components |

## Development Order

1. **Backend first** — creates the data layer and API
   - `models/task.py` → `services/task_service.py` → `routes/tasks.py` → update `main.py`
   - Verify with: `curl -b "access_token=<token>" http://localhost:8000/api/{user_id}/tasks`

2. **Frontend types & API client** — wire up the HTTP layer
   - Update `@/types` with Task interfaces
   - Add task methods to `lib/api.ts`

3. **Frontend components** — build UI top-down
   - Toast → TaskForm → TaskList → TaskItem → EditTaskModal → DeleteConfirmDialog

4. **Dashboard integration** — replace placeholder
   - Update `app/dashboard/page.tsx` to render `<TaskForm>` + `<TaskList>`

## Verification Checklist

```
□ POST /api/{user_id}/tasks creates and returns task
□ GET /api/{user_id}/tasks returns tasks sorted newest-first
□ PUT /api/{user_id}/tasks/{id} updates task title/description
□ PATCH /api/{user_id}/tasks/{id}/complete toggles completed boolean
□ DELETE /api/{user_id}/tasks/{id} removes task
□ Cross-user access returns 404 on all operations
□ Unauthenticated requests return 401
□ Dashboard loads tasks on mount
□ Create form adds task to list (no mock data)
□ Edit saves and reflects in list
□ Delete shows confirm dialog; confirms removes task
□ Toggle updates completed state in list
□ Page refresh retains all task state from database
□ Error toast appears on failed operations
□ Empty state shown when no tasks exist
```

## Environment Variables Required

```
DATABASE_URL=postgresql+psycopg2://...   # Neon connection string
AUTH_SECRET=...                           # JWT signing secret (same as Phase 1)
```

Frontend:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```
