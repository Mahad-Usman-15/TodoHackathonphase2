# Data Model — Phase IV Kubernetes Deployment

**Feature**: 006-kubernetes-deploy | **Date**: 2026-03-05

This feature adds no new database tables or application data models. Phase IV is a pure
infrastructure/DevOps layer on top of the existing Phase III application.

---

## Infrastructure Entities

### 1. Docker Images

| Artifact | Build Context | Tag | Base Image |
|----------|--------------|-----|------------|
| `todo-frontend:latest` | `./frontend` | `latest` | `node:18-alpine` |
| `todo-backend:latest` | `./backend` | `latest` | `python:3.11-slim` |

**Build args (frontend only)**:
- `NEXT_PUBLIC_API_BASE_URL=/api` — baked into JS bundle at build time; makes browser use
  relative URLs so the Next.js rewrites proxy can intercept them.

**Runtime env vars (injected by Kubernetes, NOT baked in)**:
- Frontend pod: `BACKEND_URL`, `AUTH_SECRET`, `DATABASE_URL`, `GROQ_API_KEY`
- Backend pod: `AUTH_SECRET`, `DATABASE_URL`, `GROQ_API_KEY`

---

### 2. Kubernetes Secret (`todo-chatbot-secrets`)

| Field | K8s Key | Source | How Injected |
|-------|---------|--------|--------------|
| JWT signing secret | `AUTH_SECRET` | Existing env var | `--set-string secret.authSecret` |
| Neon DB connection string | `DATABASE_URL` | Existing env var | `--set-string secret.databaseUrl` |
| Groq API key | `GROQ_API_KEY` | Existing env var | `--set-string secret.groqApiKey` |

All three keys are injected into BOTH frontend and backend pods via `envFrom.secretRef`.

---

### 3. Helm Release (`todo-chatbot`)

| Field | Value |
|-------|-------|
| Release name | `todo-chatbot` |
| Chart path | `./helm/todo-chatbot` |
| Namespace | `default` |
| Chart version | `1.0.0` |
| App version | `phase4` |

---

### 4. Kubernetes Resources

| Resource Name | Kind | Type | Namespace | Created By |
|--------------|------|------|-----------|------------|
| `todo-chatbot-secrets` | Secret | Opaque | default | `templates/secret.yaml` |
| `todo-chatbot-backend` | Deployment | — | default | `templates/backend-deployment.yaml` |
| `todo-chatbot-backend` | Service | ClusterIP | default | `templates/backend-service.yaml` |
| `todo-chatbot-frontend` | Deployment | — | default | `templates/frontend-deployment.yaml` |
| `todo-chatbot-frontend` | Service | NodePort | default | `templates/frontend-service.yaml` |

**Naming convention**: `{{ .Release.Name }}-frontend` / `{{ .Release.Name }}-backend`
With release name `todo-chatbot`, this produces `todo-chatbot-frontend` and `todo-chatbot-backend`.

**Exception**: The backend Service is named via `{{ .Values.backendServiceName }}` = `todo-chatbot-backend`
(fixed name required so the frontend's `BACKEND_URL` env var can reference it by DNS name).

---

### 5. Pod Environment Variables

#### Frontend Pod

| Variable | Source | Value / Template |
|----------|--------|-----------------|
| `BACKEND_URL` | Helm template (plain env) | `http://todo-chatbot-backend:8000` |
| `AUTH_SECRET` | K8s Secret (`envFrom`) | From `todo-chatbot-secrets` |
| `DATABASE_URL` | K8s Secret (`envFrom`) | From `todo-chatbot-secrets` |
| `GROQ_API_KEY` | K8s Secret (`envFrom`) | From `todo-chatbot-secrets` |
| `NODE_ENV` | Dockerfile `ENV` | `production` |
| `HOSTNAME` | Dockerfile `ENV` | `0.0.0.0` |
| `PORT` | Dockerfile `ENV` | `3000` |

#### Backend Pod

| Variable | Source | Value / Template |
|----------|--------|-----------------|
| `AUTH_SECRET` | K8s Secret (`envFrom`) | From `todo-chatbot-secrets` |
| `DATABASE_URL` | K8s Secret (`envFrom`) | From `todo-chatbot-secrets` |
| `GROQ_API_KEY` | K8s Secret (`envFrom`) | From `todo-chatbot-secrets` |

---

### 6. Service Port Mapping

#### Frontend Service (NodePort)

| Field | Value |
|-------|-------|
| Service port | 3000 |
| Target port | 3000 (container) |
| Node port | Auto-assigned by Minikube |
| Access URL | `minikube service todo-chatbot-frontend --url` |

#### Backend Service (ClusterIP)

| Field | Value |
|-------|-------|
| Service port | 8000 |
| Target port | 8000 (container) |
| Internal DNS | `http://todo-chatbot-backend:8000` |
| External access | None (internal only) |

---

### 7. Helm Values Structure

```
values.yaml
├── replicaCount
│   ├── frontend: 1
│   └── backend: 1
├── image
│   ├── frontend
│   │   ├── repository: todo-frontend
│   │   ├── tag: latest
│   │   └── pullPolicy: Never
│   └── backend
│       ├── repository: todo-backend
│       ├── tag: latest
│       └── pullPolicy: Never
├── service
│   ├── frontend
│   │   ├── type: NodePort
│   │   ├── port: 3000
│   │   └── targetPort: 3000
│   └── backend
│       ├── type: ClusterIP
│       ├── port: 8000
│       └── targetPort: 8000
├── backendServiceName: todo-chatbot-backend
└── secretName: todo-chatbot-secrets
```

**No secret values in values.yaml** — injected at install time via `--set-string`.

---

## File Tree (New Files Only)

```
phase2/
├── frontend/
│   ├── Dockerfile            NEW — multi-stage: deps → builder → runner
│   ├── .dockerignore         NEW
│   └── next.config.ts        MODIFIED — add output:'standalone' + rewrites proxy
├── backend/
│   ├── Dockerfile            NEW — single-stage python:3.11-slim
│   └── .dockerignore         NEW
└── helm/
    └── todo-chatbot/
        ├── Chart.yaml        NEW
        ├── values.yaml       NEW (no secrets)
        └── templates/
            ├── secret.yaml              NEW
            ├── backend-deployment.yaml  NEW
            ├── backend-service.yaml     NEW
            ├── frontend-deployment.yaml NEW
            └── frontend-service.yaml    NEW
```

Total new files: 11 (2 Dockerfiles + 2 .dockerignore + 1 next.config.ts modification + 6 Helm files)
