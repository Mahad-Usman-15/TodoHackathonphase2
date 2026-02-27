# Data Model: Phase 2 — Task CRUD

**Phase**: 1 | **Date**: 2026-02-26 | **Feature**: 002-task-crud

## Entities

### Task

Represents a unit of work owned by an authenticated user.

| Field | Type | Constraints | Notes |
|---|---|---|---|
| `id` | `int` | Primary key, auto-increment, NOT NULL | Auto-generated |
| `title` | `str` | NOT NULL, max 200 chars | Required; validated on create and update |
| `description` | `Optional[str]` | Nullable, max 1000 chars | Optional on create and update |
| `completed` | `bool` | NOT NULL, DEFAULT False | Toggled via PATCH endpoint |
| `created_at` | `datetime` | NOT NULL, DEFAULT utcnow | Set on insert; used for sort order |
| `updated_at` | `datetime` | NOT NULL, DEFAULT utcnow | Set on insert and update |
| `user_id` | `int` | NOT NULL, FK → users.id, INDEX | Ownership; filtered on every query |

**Table name**: `task` (SQLModel convention; lowercase singular)

**Indexes**:
- `task.user_id` — for filtering by owner (primary query pattern)
- `task.completed` — for status filtering (future extension; add now per CLAUDE.md)

**Cascade**: If user is deleted, their tasks should be deleted (ON DELETE CASCADE on `user_id` FK). SQLModel: `sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"))`.

---

### User (Existing — Reference Only)

Already implemented in `backend/models/user.py`. No changes needed.

| Field | Type | Notes |
|---|---|---|
| `id` | `int` | PK; referenced by `task.user_id` |
| `email` | `str` | Unique |
| `username` | `str` | Display name |
| `hashed_password` | `str` | bcrypt |
| `is_active` | `bool` | Default True |
| `created_at` | `datetime` | Auto |

---

## Pydantic/SQLModel Schemas

### TaskCreate (Request — Create)
```
title: str          # required, max 200 chars
description: str    # optional, max 1000 chars
```

### TaskUpdate (Request — Update)
```
title: str          # required, max 200 chars
description: str    # optional, max 1000 chars
```

### TaskRead (Response — All Task Endpoints)
```
id: int
title: str
description: Optional[str]
completed: bool
created_at: datetime
updated_at: datetime
user_id: int
```

---

## Relationships

```
users (1) ──────────< tasks (many)
  users.id ←── tasks.user_id (FK, indexed, CASCADE DELETE)
```

**Relationship rule**: Every task belongs to exactly one user. A user owns zero or more tasks. Tasks are never shared.

---

## Validation Rules

| Rule | Field | Behavior on Violation |
|---|---|---|
| Title required | `title` | 422 Unprocessable Entity |
| Title max 200 chars | `title` | 422 Unprocessable Entity |
| Description max 1000 chars | `description` | 422 Unprocessable Entity |
| user_id must match authenticated user | `user_id` in URL | 404 Not Found |
| Task must exist for update/delete/toggle | `id` in URL | 404 Not Found |

---

## State Transitions

```
[CREATED] → completed=False
     │
     ▼
[TOGGLE] → completed=True  ←→  completed=False
     │
     ▼
[DELETED] → permanent removal
```

Toggle is bidirectional: PATCH `/complete` flips the current `completed` value.

---

## Database Migration Notes

- New `task` table; no changes to existing `user` table.
- `main.py` lifespan must import `Task` model so `SQLModel.metadata.create_all(engine)` picks it up.
- No Alembic (constitution prohibits it); table created on app startup if not exists.
