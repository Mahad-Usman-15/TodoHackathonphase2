# Data Model: 004 — AI Chatbot for Task Management

**Phase**: 1 — Design
**Date**: 2026-02-28

---

## Existing Tables (Phase II — Unchanged)

### `user`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| email | TEXT | UNIQUE, NOT NULL, INDEX |
| username | TEXT | NOT NULL |
| hashed_password | TEXT | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT NOW() |

### `task`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| user_id | INTEGER | FK → user.id CASCADE, NOT NULL, INDEX |
| title | TEXT | NOT NULL, MAX 200 |
| description | TEXT | NULLABLE, MAX 1000 |
| completed | BOOLEAN | DEFAULT FALSE, INDEX |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

### `refreshtoken`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| user_id | INTEGER | FK → user.id, NOT NULL |
| token | TEXT | UNIQUE, INDEX |
| expires_at | TIMESTAMP | NOT NULL |
| revoked | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |

---

## New Tables (Phase III — Additive)

### `conversation`

Represents a single chat session between a user and the AI assistant. Each user can have multiple conversations. The most recent conversation is auto-loaded when the user opens /chat.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| user_id | INTEGER | FK → user.id CASCADE, NOT NULL, INDEX |
| title | TEXT | NULLABLE (auto-generated from first message if empty) |
| created_at | TIMESTAMP | DEFAULT NOW() |
| updated_at | TIMESTAMP | DEFAULT NOW() |

**Indexes**: `user_id` (for fetching latest conversation per user)
**Relationships**: One user → many conversations; One conversation → many messages

---

### `message`

Represents a single turn in a conversation. Stores both user messages and AI assistant responses. The ordered list of messages for a conversation is loaded and passed to the AI agent as context on every request.

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTO_INCREMENT |
| conversation_id | INTEGER | FK → conversation.id CASCADE, NOT NULL, INDEX |
| user_id | INTEGER | FK → user.id CASCADE, NOT NULL, INDEX |
| role | TEXT | NOT NULL, CHECK IN ('user', 'assistant') |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMP | DEFAULT NOW() |

**Indexes**: `conversation_id` (for loading history), `user_id` (for security validation)
**Relationships**: One conversation → many messages (ordered by created_at ASC)
**History window**: Last 20 messages per conversation are passed to the AI agent

---

## SQLModel Implementation (New Models)

```python
# backend/models/conversation.py
from sqlmodel import SQLModel, Field, Column, Integer, ForeignKey
from typing import Optional
from datetime import datetime

class Conversation(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"),
                         nullable=False, index=True)
    )
    title: Optional[str] = Field(default=None, max_length=200)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class ConversationRead(SQLModel):
    id: int
    user_id: int
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
```

```python
# backend/models/message.py
from sqlmodel import SQLModel, Field, Column, Integer, ForeignKey
from typing import Optional
from datetime import datetime

class Message(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(
        sa_column=Column(Integer, ForeignKey("conversation.id", ondelete="CASCADE"),
                         nullable=False, index=True)
    )
    user_id: int = Field(
        sa_column=Column(Integer, ForeignKey("user.id", ondelete="CASCADE"),
                         nullable=False, index=True)
    )
    role: str = Field(nullable=False)           # 'user' | 'assistant'
    content: str = Field(nullable=False)
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class MessageRead(SQLModel):
    id: int
    conversation_id: int
    role: str
    content: str
    created_at: datetime
```

---

## Entity Relationships

```
user (1) ──── (many) conversation
user (1) ──── (many) message
conversation (1) ──── (many) message
user (1) ──── (many) task        [Phase II — unchanged]
```

---

## Table Creation (via SQLModel)

Tables are auto-created on startup via `SQLModel.metadata.create_all(engine)` in `main.py` lifespan. Add imports for Conversation and Message alongside User and Task:

```python
# main.py lifespan — add these imports:
from models.conversation import Conversation
from models.message import Message
```

No migration scripts needed — SQLModel creates tables if they do not exist. For production safety, schema additions are additive only (new tables, no column drops).

---

## Query Patterns

### Load latest conversation for user
```sql
SELECT * FROM conversation
WHERE user_id = :user_id
ORDER BY updated_at DESC
LIMIT 1;
```

### Load conversation history (last 20 messages)
```sql
SELECT role, content FROM message
WHERE conversation_id = :conversation_id
ORDER BY created_at ASC
LIMIT 20;
```

### Create new conversation
```sql
INSERT INTO conversation (user_id, title, created_at, updated_at)
VALUES (:user_id, :title, NOW(), NOW())
RETURNING id;
```

### Save message
```sql
INSERT INTO message (conversation_id, user_id, role, content, created_at)
VALUES (:conversation_id, :user_id, :role, :content, NOW());
```
