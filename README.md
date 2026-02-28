# Taskify — AI-Powered Todo App

A multi-user task management SaaS with a dark-theme UI, JWT authentication, and an AI chatbot
that manages tasks through natural language via MCP tools.

> **Built entirely with Claude Code — zero manual coding. All code generated through spec-driven prompts.**

## Live

| Service | URL |
|---------|-----|
| Frontend | https://taskify-ainative.vercel.app |
| Backend API | https://todo-hackathon-backend-17q8.onrender.com |

## Tech Stack

| Layer | Phase II | Phase III (AI) |
|-------|----------|----------------|
| Frontend | Next.js 16+, TypeScript, Tailwind CSS | OpenAI ChatKit |
| Backend | Python FastAPI, SQLModel | + OpenAI Agents SDK, MCP SDK |
| LLM | — | Groq (llama-3.3-70b-versatile) |
| Database | Neon Serverless PostgreSQL | + conversations, messages tables |
| Auth | JWT HS256 + bcrypt + HTTP-only cookies | Same (unchanged) |

## Project Structure

```
phase2/
├── frontend/          # Next.js App Router
│   ├── app/
│   │   ├── dashboard/ # Task CRUD UI
│   │   ├── chat/      # AI chatbot UI (Phase III)
│   │   └── auth/      # Login / Register
│   └── components/
├── backend/           # FastAPI
│   ├── main.py
│   ├── models.py      # SQLModel: User, Task, RefreshToken, Conversation, Message
│   ├── routes/
│   │   ├── tasks.py
│   │   ├── auth.py
│   │   └── chat.py    # SSE streaming chat (Phase III)
│   └── mcp_server.py  # MCP stdio server (Phase III)
└── specs/             # Spec-Kit feature specifications
```

## Agentic Dev Workflow

```
Write Spec → /sp.plan → /sp.tasks → /sp.implement (via Claude Code)
```

All specs live in `/specs/`. All prompts and PHR records in `history/prompts/`.
No feature exists without a spec. No code written manually.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in, set refresh cookie |
| POST | `/api/auth/refresh` | Rotate access token |
| POST | `/api/auth/logout` | Revoke refresh token |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List tasks |
| POST | `/api/{user_id}/tasks` | Create task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle completion |

### Chat (Phase III)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/{user_id}/chat` | Send message, stream AI response (SSE) |

## Setup

### Prerequisites
- Node.js 18+, Python 3.11+, Neon PostgreSQL database

### Environment Variables

**Backend** (`.env` in `/backend`):
```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key
CORS_ALLOWED_ORIGINS=http://localhost:3000
GROQ_API_KEY=your-groq-key   # Phase III
```

**Frontend** (`.env.local` in `/frontend`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key   # Phase III
```

### Run Locally

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Both
docker-compose up
```

## MCP Tools (Phase III)

The AI agent uses 5 MCP tools to manage tasks:

| Tool | Action |
|------|--------|
| `add_task` | Create a new task |
| `list_tasks` | List tasks (all / pending / completed) |
| `complete_task` | Mark a task done |
| `delete_task` | Remove a task |
| `update_task` | Edit title or description |

Each tool validates `user_id` against the authenticated JWT user.

---

*Built with Claude Code + Spec-Kit Plus — Hackathon Phase II & III*
