# Todo App — Backend Service

A RESTful API server built with **FastAPI** and **SQLModel**, providing secure multi-user task management with JWT-based authentication.

---

## Project Scope

This service is responsible for:

- **User authentication** — registration, login, logout, and session management via HTTP-only cookies
- **JWT token issuance and validation** — HS256-signed tokens using `AUTH_SECRET`
- **Task CRUD operations** — create, read, update, delete, and toggle completion state
- **User data isolation** — every task endpoint is scoped to the authenticated user; cross-user access returns 404
- **Database management** — schema creation and migrations via SQLModel against Neon Serverless PostgreSQL

This service does **not** contain any UI or frontend logic. All business rules and data access live here.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Framework    | FastAPI 0.115                     |
| ORM          | SQLModel 0.0.22+                  |
| Database     | Neon Serverless PostgreSQL        |
| Auth         | python-jose (JWT HS256), bcrypt   |
| Server       | Uvicorn                           |
| Testing      | Pytest + HTTPX                    |

---

## Project Structure

```
backend/
├── main.py                  # FastAPI app entry point, CORS, lifespan
├── db.py                    # Database engine and session dependency
├── requirements.txt         # Python dependencies
├── models/
│   ├── user.py              # User SQLModel table and schemas
│   └── task.py              # Task SQLModel table and schemas
├── routes/
│   ├── auth.py              # /api/auth/* endpoints
│   └── tasks.py             # /api/{user_id}/tasks/* endpoints
├── services/
│   ├── auth_service.py      # User creation and credential verification
│   └── task_service.py      # Task business logic
├── middleware/
│   └── auth_middleware.py   # JWT cookie extraction and user injection
├── utils/
│   └── security.py          # Token creation helpers
└── tests/
    └── integration/         # Pytest integration tests
```

---

## Database Schema

### `users`
| Column            | Type      | Notes                        |
|-------------------|-----------|------------------------------|
| id                | integer   | PK, auto-increment           |
| email             | string    | unique, indexed              |
| username          | string    | not null                     |
| hashed_password   | string    | bcrypt hashed                |
| is_active         | boolean   | default true                 |
| created_at        | timestamp |                              |

### `tasks`
| Column      | Type      | Notes                              |
|-------------|-----------|------------------------------------|
| id          | integer   | PK, auto-increment                 |
| user_id     | integer   | FK → users.id, indexed             |
| title       | string    | not null, max 200 chars            |
| description | text      | nullable, max 1000 chars           |
| completed   | boolean   | default false, indexed             |
| created_at  | timestamp |                                    |
| updated_at  | timestamp |                                    |

---

## API Endpoints

All routes are prefixed with `/api`.

### Authentication

| Method | Path               | Description              | Auth required |
|--------|--------------------|--------------------------|---------------|
| POST   | /auth/register     | Create a new user        | No            |
| POST   | /auth/login        | Sign in, set cookie      | No            |
| POST   | /auth/logout       | Clear session cookie     | No            |
| GET    | /me                | Return current user info | Yes           |

### Tasks

All task routes require a valid session cookie. `{user_id}` must match the authenticated user.

| Method | Path                                  | Description              |
|--------|---------------------------------------|--------------------------|
| GET    | /{user_id}/tasks                      | List all tasks           |
| POST   | /{user_id}/tasks                      | Create a task            |
| GET    | /{user_id}/tasks/{id}                 | Get a single task        |
| PUT    | /{user_id}/tasks/{id}                 | Update a task            |
| DELETE | /{user_id}/tasks/{id}                 | Delete a task            |
| PATCH  | /{user_id}/tasks/{id}/complete        | Toggle completion state  |

---

## Environment Variables

Create a `.env` file in this directory:

```env
DATABASE_URL=postgresql+psycopg2://user:password@host/dbname
AUTH_SECRET=your-secret-key-here
```

---

## Getting Started

### Prerequisites
- Python 3.9+
- A PostgreSQL-compatible database (Neon Serverless recommended)

### Installation

```bash
pip install -r requirements.txt
```

### Run the server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.
Interactive docs are at `http://localhost:8000/docs`.

### Run tests

```bash
pytest tests/
```

---

## Security Notes

- Passwords are hashed with bcrypt; plaintext passwords are never stored
- JWT tokens use HS256 signed with `AUTH_SECRET`
- Session cookies are set with `HttpOnly=true` and `SameSite=lax`
- User isolation is enforced server-side; the path `user_id` is always validated against the authenticated user
- Raw SQL is never constructed from user input — all queries go through SQLModel ORM
