# API Contract: Task CRUD Endpoints

**Feature**: 002-task-crud | **Date**: 2026-02-26
**Base URL**: `http://localhost:8000/api`
**Auth**: HTTP-only cookie `access_token` (set by login/register). Sent automatically by browser via `credentials: "include"`.

---

## Common Conventions

**Ownership check** (applied to all endpoints except GET list and POST):
If `user_id` in URL ≠ `current_user.id` from cookie token → `404 Not Found` (never 403; prevents enumeration).

**Error format** (all errors):
```json
{ "detail": "Human-readable error message" }
```

**Task object** (standard response shape for all task endpoints):
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-02-26T10:00:00Z",
  "updated_at": "2026-02-26T10:00:00Z",
  "user_id": 42
}
```

---

## Endpoints

### 1. List Tasks

```
GET /api/{user_id}/tasks
```

**Auth required**: Yes (cookie)
**Path params**: `user_id` (integer) — must match authenticated user
**Query params**: None (Phase 2 — no filtering or pagination)

**Success response** `200 OK`:
```json
[
  {
    "id": 2,
    "title": "Study for exam",
    "description": null,
    "completed": false,
    "created_at": "2026-02-26T11:00:00Z",
    "updated_at": "2026-02-26T11:00:00Z",
    "user_id": 42
  },
  {
    "id": 1,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": true,
    "created_at": "2026-02-26T10:00:00Z",
    "updated_at": "2026-02-26T10:30:00Z",
    "user_id": 42
  }
]
```

**Sort order**: `created_at` DESC (newest first).
**Empty state**: Returns `[]` when user has no tasks.

**Error responses**:
| Status | Condition |
|---|---|
| `401` | Missing or invalid `access_token` cookie |
| `404` | `user_id` in URL ≠ authenticated user id |

---

### 2. Create Task

```
POST /api/{user_id}/tasks
```

**Auth required**: Yes (cookie)
**Path params**: `user_id` (integer) — must match authenticated user

**Request body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```
- `title`: required, string, max 200 chars
- `description`: optional, string, max 1000 chars (omit or set to `null`)

**Success response** `201 Created`:
```json
{
  "id": 1,
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2026-02-26T10:00:00Z",
  "updated_at": "2026-02-26T10:00:00Z",
  "user_id": 42
}
```

**Error responses**:
| Status | Condition |
|---|---|
| `401` | Missing or invalid `access_token` cookie |
| `404` | `user_id` in URL ≠ authenticated user id |
| `422` | Missing title, title > 200 chars, description > 1000 chars |

---

### 3. Get Task

```
GET /api/{user_id}/tasks/{task_id}
```

**Auth required**: Yes (cookie)
**Path params**: `user_id` (integer), `task_id` (integer)

**Success response** `200 OK`: Standard task object (see above).

**Error responses**:
| Status | Condition |
|---|---|
| `401` | Missing or invalid `access_token` cookie |
| `404` | Task not found OR does not belong to authenticated user |

---

### 4. Update Task

```
PUT /api/{user_id}/tasks/{task_id}
```

**Auth required**: Yes (cookie)
**Path params**: `user_id` (integer), `task_id` (integer)

**Request body**:
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Updated description"
}
```
- `title`: required, string, max 200 chars
- `description`: optional, string, max 1000 chars

**Success response** `200 OK`: Updated task object (with new `updated_at` timestamp).

**Error responses**:
| Status | Condition |
|---|---|
| `401` | Missing or invalid `access_token` cookie |
| `404` | Task not found OR does not belong to authenticated user |
| `422` | Missing title, title > 200 chars, description > 1000 chars |

---

### 5. Delete Task

```
DELETE /api/{user_id}/tasks/{task_id}
```

**Auth required**: Yes (cookie)
**Path params**: `user_id` (integer), `task_id` (integer)

**Success response** `200 OK`:
```json
{ "message": "Task deleted successfully" }
```

**Note**: Frontend must show confirmation dialog BEFORE calling this endpoint. Backend performs the deletion unconditionally once called.

**Error responses**:
| Status | Condition |
|---|---|
| `401` | Missing or invalid `access_token` cookie |
| `404` | Task not found OR does not belong to authenticated user |

---

### 6. Toggle Task Completion

```
PATCH /api/{user_id}/tasks/{task_id}/complete
```

**Auth required**: Yes (cookie)
**Path params**: `user_id` (integer), `task_id` (integer)
**Request body**: None

**Behavior**: Flips `completed` boolean (False → True, True → False). Updates `updated_at`.

**Success response** `200 OK`: Updated task object with new `completed` value and `updated_at`.

**Error responses**:
| Status | Condition |
|---|---|
| `401` | Missing or invalid `access_token` cookie |
| `404` | Task not found OR does not belong to authenticated user |

---

## Frontend API Client Extensions (`frontend/lib/api.ts`)

```typescript
// Types to add to @/types
interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  user_id: number;
}

interface TaskCreate {
  title: string;
  description?: string;
}

interface TaskUpdate {
  title: string;
  description?: string;
}

// Methods to add to api object
getTasks(userId: number): Promise<Task[]>
createTask(userId: number, data: TaskCreate): Promise<Task>
getTask(userId: number, taskId: number): Promise<Task>
updateTask(userId: number, taskId: number, data: TaskUpdate): Promise<Task>
deleteTask(userId: number, taskId: number): Promise<{ message: string }>
toggleTask(userId: number, taskId: number): Promise<Task>
```
