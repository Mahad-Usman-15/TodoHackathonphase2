# Taskify — AI-Powered Todo App

A multi-user task management SaaS with a dark-theme UI, JWT authentication, an AI chatbot
that manages tasks through natural language via MCP tools, and a local Kubernetes deployment
on Minikube with Helm charts and AI DevOps tooling.

> **Built entirely with Claude Code — zero manual coding. All code generated through spec-driven prompts.**

## Live

| Service | URL |
|---------|-----|
| Frontend | https://taskify-ainative.vercel.app |
| Backend API | https://todo-hackathon-backend-17q8.onrender.com |
| Local (Phase IV) | http://192.168.49.2:30507 (Minikube NodePort) |

## Tech Stack

| Layer | Phase II | Phase III (AI) | Phase IV (K8s) |
|-------|----------|----------------|----------------|
| Frontend | Next.js 16+, TypeScript, Tailwind CSS | OpenAI ChatKit | + Dockerfile (multi-stage) |
| Backend | Python FastAPI, SQLModel | + OpenAI Agents SDK, MCP SDK | + Dockerfile |
| LLM | — | Groq (llama-3.3-70b-versatile) | Same |
| Database | Neon Serverless PostgreSQL | + conversations, messages tables | External (unchanged) |
| Auth | JWT HS256 + bcrypt + HTTP-only cookies | Same | Via Kubernetes Secret |
| Orchestration | Docker Compose (local) | Docker Compose (local) | Minikube + Helm 3.x |
| AI DevOps | — | — | Gordon + kubectl-ai + kagent |

## Project Structure

```
phase2/
├── frontend/
│   ├── Dockerfile         # Phase IV — multi-stage Next.js build
│   ├── app/
│   │   ├── dashboard/     # Task CRUD UI
│   │   ├── chat/          # AI chatbot UI (Phase III)
│   │   └── auth/          # Login / Register
│   └── components/
├── backend/
│   ├── Dockerfile         # Phase IV — FastAPI container
│   ├── main.py
│   ├── models.py          # User, Task, RefreshToken, Conversation, Message
│   ├── routes/
│   │   ├── tasks.py
│   │   ├── auth.py
│   │   └── chat.py        # SSE streaming chat (Phase III)
│   └── mcp_server.py      # MCP stdio server (Phase III)
├── helm/                  # Phase IV — Helm chart
│   └── todo-chatbot/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── secret.yaml
│           ├── backend-deployment.yaml
│           ├── backend-service.yaml
│           ├── frontend-deployment.yaml
│           └── frontend-service.yaml
├── specs/                 # Spec-Kit feature specifications
└── docker-compose.yml
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

**Phase II/III:**
- Node.js 18+, Python 3.11+, Neon PostgreSQL database

**Phase IV (additional):**
- Docker Desktop 4.53+ (enable Gordon: Settings > Beta features)
- Minikube: `winget install Kubernetes.minikube`
- kubectl: `winget install Kubernetes.kubectl`
- Helm 3.x: `winget install Helm.Helm`
- kubectl-ai: `go install github.com/sozercan/kubectl-ai@latest`
- kagent: see [kagent.dev](https://kagent.dev)

### Environment Variables

**Backend** (`.env` in `/backend`):
```
DATABASE_URL=postgresql://...
AUTH_SECRET=your-secret-key
CORS_ALLOWED_ORIGINS=http://localhost:3000
GROQ_API_KEY=your-groq-key
```

**Frontend** (`.env.local` in `/frontend`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run Locally (Phase II/III)

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Both via Docker Compose
docker-compose up
```

### Run on Minikube (Phase IV)

```bash
# 1. Start cluster
minikube start --driver=docker

# 2. Build images (Gordon primary, Docker CLI fallback)
docker ai "build the frontend image from frontend/Dockerfile and tag it todo-frontend:latest"
# fallback:
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# 3. Load images into Minikube (no registry needed)
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# 4. Deploy with Helm (secrets injected at install time — never in values.yaml)
helm install todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="your-auth-secret" \
  --set-string secret.databaseUrl="postgresql://..." \
  --set-string secret.groqApiKey="gsk_..."

# 5. Get app URL
minikube service todo-chatbot-frontend --url
# → http://192.168.49.2:30507

# 6. Teardown / redeploy
helm uninstall todo-chatbot
helm install todo-chatbot ./helm/todo-chatbot ...  # same as step 4

# 7. AI-assisted operations
# Gordon (Docker Desktop Beta):
docker ai "show me all running containers"
# kubectl-ai (set OPENAI_API_KEY=<groq-key>, OPENAI_BASE_URL=https://api.groq.com/openai/v1):
kubectl-ai "show me the status of all pods in the cluster"
# kagent (after: kagent install --profile minimal):
kagent invoke --agent k8s-health-agent --task "Analyze the cluster health"
```

**Minikube NodePort URL**: `http://192.168.49.2:30507`
> Note: The NodePort may change on redeploy. Run `minikube service todo-chatbot-frontend --url` to get the current URL.

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

## AI DevOps Tooling (Phase IV)

| Tool | Role |
|------|------|
| **Gordon** | Docker AI Agent — natural language Docker build/run operations |
| **kubectl-ai** | Natural language → kubectl commands (deploy, scale, debug) |
| **kagent** | AI-assisted cluster health analysis and optimization |

---

*Built with Claude Code + Spec-Kit Plus — Hackathon Phases II, III & IV*
