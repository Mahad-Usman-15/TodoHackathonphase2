# Implementation Plan: Phase IV — Local Kubernetes Deployment

**Branch**: `main` | **Date**: 2026-03-05 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/006-kubernetes-deploy/spec.md`

## Summary

Deploy the Phase III Todo Chatbot (Next.js frontend + FastAPI backend) onto a local
Minikube Kubernetes cluster. All required tools (Minikube, Helm, Go, kubectl-ai, kagent)
are installed automatically by Claude Code. The frontend is containerized using a
multi-stage Next.js standalone build; the backend uses a single-stage python:3.11-slim
image. A Helm chart packages both services with secrets injected at install time via
`--set-string`. Frontend-to-backend communication uses a Next.js rewrites proxy so the
backend's in-cluster service URL never reaches the browser. The frontend service is
exposed via NodePort, accessed with `minikube service --url`. Gordon, kubectl-ai
(Groq-backed), and kagent demonstrate AI DevOps operations throughout the workflow.

---

## Technical Context

**Language/Version**:
- Frontend: TypeScript / Node.js 18 (LTS, confirmed: v20.20.0 on host, node:18-alpine in container)
- Backend: Python 3.11-slim (container base; host runs 3.14 — slim image pins 3.11 per constitution)

**Primary Dependencies**:
- Frontend: Next.js 16+ App Router, Tailwind CSS, TypeScript
- Backend: FastAPI 0.115.0, uvicorn 0.32.0, SQLModel, openai-agents, mcp, sse-starlette
- Container: Docker Desktop 4.53+, Docker CLI
- Orchestration: Minikube (Docker driver), kubectl v1.34.1 (confirmed installed)
- Packaging: Helm 3.x
- AI DevOps: kubectl-ai (via Go install), kagent, Gordon (Docker AI)
- kubectl-ai LLM: Groq API (llama3-8b-8192 via OpenAI-compatible endpoint, GROQ_API_KEY reused)

**Storage**: External Neon PostgreSQL (no in-cluster DB — constitution constraint)

**Testing**: Manual smoke tests via browser + curl; `helm lint` + `helm template --dry-run`

**Target Platform**: Minikube single-node cluster on Docker Desktop (Windows 10 Pro)

**Performance Goals**: Pods reach Running state; full user journey completes in browser

**Constraints**:
- No cloud K8s (Minikube only — constitution §Principle 9)
- No secrets in values.yaml or Docker images (constitution §Security)
- `pullPolicy: Never` — locally loaded images, no registry pull
- Frontend API calls must use relative `/api` path so rewrites proxy intercepts them
- `next.config.ts` must be extended (TypeScript), not replaced

**Scale/Scope**: 1 replica each (frontend + backend), single Minikube node, local dev only

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Spec-Driven Development | ✅ PASS | spec.md written before any implementation |
| Agentic Workflow | ✅ PASS | All code via Claude Code; skills: docker-skill, k8s-deploy-skill |
| Architecture Simplicity (Phase IV) | ✅ PASS | Minikube required for Phase IV; external DB only; 1 replica |
| Technology Adherence | ✅ PASS | Approved stack: Docker, Minikube, Helm, kubectl-ai, kagent, Gordon |
| Security-First | ✅ PASS | K8s Secrets for all sensitive values; no secrets in images or values.yaml |
| MCP Server (Phase III) | ✅ PASS | Unchanged — mcp_server.py containerized as-is |
| No Cloud K8s | ✅ PASS | Minikube only; EKS/GKE/AKS explicitly out of scope |
| No Postgres Pod | ✅ PASS | Neon external DB — DATABASE_URL injected via K8s Secret |
| Helm-only deploys | ✅ PASS | No raw `kubectl apply` for app resources |
| No Better Auth | ✅ PASS | Auth untouched — JWT/bcrypt system unchanged |

**Gate result: ALL PASS → Proceed to Phase 0**

---

## Project Structure

### Documentation (this feature)

```text
specs/006-kubernetes-deploy/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── helm-values.yaml
│   └── kubernetes-manifests.md
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
frontend/
├── Dockerfile                    # NEW — multi-stage Next.js standalone build
├── .dockerignore                 # NEW
└── next.config.ts                # MODIFIED — add output:'standalone' + rewrites

backend/
├── Dockerfile                    # NEW — single-stage python:3.11-slim
└── .dockerignore                 # NEW

helm/
└── todo-chatbot/                 # NEW — complete Helm chart
    ├── Chart.yaml
    ├── values.yaml               # NO secrets
    └── templates/
        ├── secret.yaml
        ├── backend-deployment.yaml
        ├── backend-service.yaml
        ├── frontend-deployment.yaml
        └── frontend-service.yaml
```

**Structure Decision**: Web application with new DevOps layer (helm/). Existing
`frontend/` and `backend/` source is preserved — only Dockerfiles, .dockerignore,
and `next.config.ts` are new/modified in the source tree.

---

## Complexity Tracking

No constitution violations requiring justification. All gates pass.

---

## Phase 0: Research

*See [research.md](research.md) for full findings.*

### Key Decisions Resolved

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend API URL in container | Build arg `NEXT_PUBLIC_API_BASE_URL=/api` | Relative URL → rewrites proxy intercepts; image is env-agnostic |
| next.config.ts rewrites | `/api/:path*` → `${BACKEND_URL}/api/:path*` | BACKEND_URL is server-side runtime var; browser never sees it |
| Backend base image | `python:3.11-slim` | Matches constitution spec; no compiler tools needed |
| Frontend base image | `node:18-alpine` | LTS, smallest Alpine variant; Next.js supported |
| imagePullPolicy | `Never` | Locally loaded images via `minikube image load`; no registry |
| kubectl-ai LLM | Groq `llama3-8b-8192` via OPENAI_BASE_URL override | Reuses GROQ_API_KEY; separate rate limit pool from chatbot |
| kagent install | Binary download from kagent.dev | No Go/brew dependency; direct binary for Windows |
| Minikube driver | Docker | Docker Desktop already confirmed installed |
| Frontend service | NodePort | Access via `minikube service --url`; no tunnel needed |
| Backend service | ClusterIP | Internal only; reachable by frontend Next.js server |
| Secret injection | `helm install --set-string` | Never committed; injected at deploy time |
| Health probe (backend) | `httpGet /docs :8000` | FastAPI /docs always returns 200 at startup |
| Health probe (frontend) | `httpGet / :3000` | Next.js root returns 200 when SSR ready |

---

## Phase 1: Design & Contracts

*See [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md).*

### Critical Implementation Note: `next.config.ts` Rewrites

**Problem**: `frontend/lib/api.ts` uses `NEXT_PUBLIC_API_BASE_URL` (baked at build time).
In Kubernetes, the backend's ClusterIP hostname (`todo-chatbot-backend`) is not reachable
by the browser — only by the Next.js server process.

**Solution (two-part)**:

1. **Build with relative base URL**: Pass `NEXT_PUBLIC_API_BASE_URL=/api` as build arg in
   the frontend Dockerfile. This bakes `/api` into the JS bundle. Browser calls
   `fetch('/api/auth/login')` → goes to the Next.js server (same host), not directly to backend.

2. **Add rewrites proxy in `next.config.ts`**:
   ```typescript
   async rewrites() {
     return [
       {
         source: '/api/:path*',
         destination: `${process.env.BACKEND_URL}/api/:path*`,
       },
     ];
   }
   ```
   `BACKEND_URL` is injected at pod startup as a server-side env var
   (`http://todo-chatbot-backend:8000`). Not baked in — image stays reusable.

**Local dev unaffected**: In `.env.local`, `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`
(full URL). Browser fetches directly to backend. Rewrites rule only fires for relative `/api/*`
paths, so local dev continues working with no changes to `.env.local`.

### Helm Values Contract Summary

```yaml
# values.yaml (no secrets)
replicaCount: { frontend: 1, backend: 1 }
image:
  frontend: { repository: todo-frontend, tag: latest, pullPolicy: Never }
  backend:  { repository: todo-backend,  tag: latest, pullPolicy: Never }
service:
  frontend: { type: NodePort,   port: 3000 }
  backend:  { type: ClusterIP,  port: 8000 }
backendServiceName: todo-chatbot-backend
secretName: todo-chatbot-secrets

# Injected at install time (NOT in values.yaml):
# secret.authSecret  = AUTH_SECRET
# secret.databaseUrl = DATABASE_URL
# secret.groqApiKey  = GROQ_API_KEY
```

### Kubernetes Resource Summary

| Resource | Kind | Type | Purpose |
|----------|------|------|---------|
| `todo-chatbot-secrets` | Secret | Opaque | AUTH_SECRET, DATABASE_URL, GROQ_API_KEY |
| `todo-chatbot-backend` | Deployment | — | FastAPI pods |
| `todo-chatbot-backend` | Service | ClusterIP | Internal backend DNS |
| `todo-chatbot-frontend` | Deployment | — | Next.js pods |
| `todo-chatbot-frontend` | Service | NodePort | Browser access |

### Tool Installation Sequence

```
1. Check: minikube version     → if missing: winget install Kubernetes.minikube
2. Check: helm version         → if missing: winget install Helm.Helm
3. Check: go version           → if missing: winget install GoLang.Go + reload PATH
4. Check: kubectl-ai --version → if missing: go install github.com/sozercan/kubectl-ai@latest
5. Check: kagent version       → if missing: binary download from kagent.dev releases
6. Verify all tools respond after install
7. Configure kubectl-ai env vars:
   OPENAI_API_KEY=$GROQ_API_KEY
   OPENAI_BASE_URL=https://api.groq.com/openai/v1
   OPENAI_DEPLOYMENT_NAME=llama3-8b-8192
```

### Implementation Phases (for /sp.tasks)

```
Phase 1 — Tool Installation (US1, P1, blocking all else)
  Sequential: install in order; each depends on prior succeeding

Phase 2 — Containerization (US2, P2) — PARALLEL
  Task A: frontend/Dockerfile + .dockerignore + next.config.ts update
  Task B: backend/Dockerfile + .dockerignore
  (A and B touch different files — fully parallel)

Phase 3 — Helm Chart (US3, P3) — PARALLEL with Phase 2
  All 7 Helm files (Chart.yaml, values.yaml, 5 templates)
  Can be written while images are building

Phase 4 — Minikube Deploy (US4, P4) — depends on Phase 2 + 3
  Sequential: start → load images → helm lint → helm install → verify → browser test

Phase 5 — AI DevOps Operations (US5, P5) — depends on Phase 4
  Gordon + kubectl-ai + kagent operations + PHR capture
```
