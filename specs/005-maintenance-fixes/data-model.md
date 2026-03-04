# Data Model: Maintenance Fixes & Quality Improvements

**Feature**: `005-maintenance-fixes` | **Date**: 2026-03-02

---

## Schema Changes

### No New Tables Required

All required data is already persisted via existing Phase III tables (`conversations`, `messages`, `tasks`, `users`). This feature is primarily a UI/UX and reliability improvement — no new entities are introduced.

---

## Existing Tables (Reference)

### `conversations`
| Field | Type | Notes |
|-------|------|-------|
| id | INTEGER PK | Auto-increment |
| user_id | INTEGER FK → users.id | Indexed |
| created_at | TIMESTAMP | Set on creation |
| updated_at | TIMESTAMP | Updated on message |

**Lifecycle after this feature**: When a user clicks "New Chat", the existing conversation row is left intact (archived). A new conversation is created automatically on the next chat message. No `status` or `archived` flag is needed — the frontend simply tracks which `conversation_id` is active.

### `messages`
| Field | Type | Notes |
|-------|------|-------|
| id | INTEGER PK | Auto-increment |
| user_id | INTEGER FK → users.id | Indexed |
| conversation_id | INTEGER FK → conversations.id | Indexed |
| role | TEXT | `'user'` or `'assistant'` |
| content | TEXT | Full message content |
| created_at | TIMESTAMP | Used for timestamp display in UI |

**Note**: `created_at` is already persisted and will be used by FR-011 (message timestamps) — no schema change needed.

### `tasks`
No changes. Task filtering (FR-012) is done client-side against the already-fetched task list.

---

## Deferred Schema Changes

The following were considered and explicitly deferred to a future feature:

| Change | Reason Deferred |
|--------|----------------|
| `conversations.title` (auto-generated from first message) | History sidebar is Out of Scope for this sprint |
| `conversations.archived_at` (explicit archive flag) | Not needed — preserved-by-default is sufficient |
