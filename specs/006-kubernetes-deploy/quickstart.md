# Quickstart — Phase IV Kubernetes Deployment

**Feature**: 006-kubernetes-deploy | **Date**: 2026-03-05

Complete end-to-end guide to deploy the Todo Chatbot on a local Minikube cluster.

---

## Prerequisites

Before starting, ensure:
- Docker Desktop 4.53+ is running
- Terminal has access to: `docker`, `kubectl` (already installed v1.34.1)
- Environment variables set in shell: `AUTH_SECRET`, `DATABASE_URL`, `GROQ_API_KEY`

---

## Step 1 — Install Required Tools

Run in order. Each command checks if the tool is missing before installing.

```bash
# Check + install Minikube
minikube version || winget install Kubernetes.minikube

# Check + install Helm
helm version || winget install Helm.Helm

# Check + install Go (required for kubectl-ai)
go version || winget install GoLang.Go
# After Go install, reload PATH in new terminal or:
# $env:PATH += ";$env:USERPROFILE\go\bin"

# Install kubectl-ai (requires Go)
kubectl-ai --version || go install github.com/sozercan/kubectl-ai@latest

# Install kagent (binary download from kagent.dev)
# Check kagent.dev/releases for latest Windows binary and download to PATH
```

**Configure kubectl-ai to use Groq:**

```bash
export OPENAI_API_KEY=$GROQ_API_KEY
export OPENAI_BASE_URL=https://api.groq.com/openai/v1
export OPENAI_DEPLOYMENT_NAME=llama3-8b-8192
```

---

## Step 2 — Update `frontend/next.config.ts`

Add `output: 'standalone'` and the rewrites proxy block to the existing config:

```typescript
// frontend/next.config.ts — EXTEND, do not replace
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ];
  },
  // ... preserve any existing config
};

export default nextConfig;
```

**Why**: `output: 'standalone'` produces a minimal self-contained `server.js`.
The rewrites proxy forwards `/api/*` calls from the Next.js server to the backend ClusterIP service.
Local dev is unaffected (browser calls `http://localhost:8000/api` directly; rewrites only fire
for relative `/api` paths).

---

## Step 3 — Write Dockerfiles

Create `frontend/Dockerfile` (3-stage multi-stage build):

```dockerfile
# syntax=docker/dockerfile:1

FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_BASE_URL=/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000
CMD ["node", "server.js"]
```

Create `backend/Dockerfile` (single-stage):

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.11-slim
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY . /code/
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## Step 4 — Build Docker Images

```bash
# Build from repo root
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend

# Verify images built
docker images | grep todo
```

---

## Step 5 — Start Minikube

```bash
# Start with Docker driver (Docker Desktop must be running)
minikube start --driver=docker

# Verify cluster is ready
kubectl cluster-info
kubectl get nodes
# Expected: 1 node, STATUS=Ready
```

---

## Step 6 — Load Images into Minikube

```bash
# Load both images into Minikube's internal registry
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Verify images are available
minikube image ls | grep todo
```

---

## Step 7 — Create Helm Chart

Create the directory structure:

```
helm/todo-chatbot/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── secret.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── frontend-deployment.yaml
    └── frontend-service.yaml
```

See `contracts/helm-values.yaml` for the values.yaml content and
`contracts/kubernetes-manifests.md` for all template content.

---

## Step 8 — Validate Chart

```bash
# Lint (catches YAML errors and Helm best practices violations)
helm lint ./helm/todo-chatbot \
  --set-string secret.authSecret="test" \
  --set-string secret.databaseUrl="test" \
  --set-string secret.groqApiKey="test"

# Dry-run (renders all manifests without deploying)
helm install --debug --dry-run todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="test" \
  --set-string secret.databaseUrl="test" \
  --set-string secret.groqApiKey="test"

# Verify dry-run output contains all 5 resource kinds:
# Secret, Deployment (x2), Service (x2)
```

---

## Step 9 — Deploy with Helm

```bash
helm install todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="$AUTH_SECRET" \
  --set-string secret.databaseUrl="$DATABASE_URL" \
  --set-string secret.groqApiKey="$GROQ_API_KEY"
```

---

## Step 10 — Verify Deployment

```bash
# Watch pods reach Running state
kubectl get pods --watch

# Expected:
# todo-chatbot-backend-<hash>   1/1   Running   0   <time>
# todo-chatbot-frontend-<hash>  1/1   Running   0   <time>

# Check all resources
kubectl get all

# Check services
kubectl get services
```

---

## Step 11 — Open in Browser

```bash
# Get the NodePort URL for the frontend
minikube service todo-chatbot-frontend --url

# Copy the URL (e.g., http://192.168.49.2:31234) and open in browser
# Expected: Login page renders
```

---

## Step 12 — Smoke Test

1. Open the URL in browser
2. Register a new user account
3. Create a few tasks
4. Open AI Chat and send a message
5. Verify tasks persist (Neon DB is used — external, same as dev)

---

## AI DevOps Operations (Gordon + kubectl-ai + kagent)

### Gordon (Docker AI)

```bash
docker ai "build the backend image from backend/Dockerfile"
docker ai "show me running containers"
docker ai "what images do I have locally?"
```

### kubectl-ai (Natural Language kubectl — requires Groq env vars set in Step 1)

```bash
kubectl-ai "show me all running pods"
kubectl-ai "check why pods are failing"
kubectl-ai "show me logs for the backend pod"
kubectl-ai "describe the frontend service"
```

### kagent (Cluster Health)

```bash
kagent "analyze the cluster health"
kagent "why is the frontend pod not starting?"
kagent "show me resource usage for all pods"
```

---

## Helm Lifecycle Commands

```bash
# Re-deploy after chart or source changes
docker build -t todo-frontend:latest ./frontend
minikube image load todo-frontend:latest
helm upgrade todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="$AUTH_SECRET" \
  --set-string secret.databaseUrl="$DATABASE_URL" \
  --set-string secret.groqApiKey="$GROQ_API_KEY"

# View revision history
helm history todo-chatbot

# Roll back to previous revision
helm rollback todo-chatbot 1

# Tear down completely
helm uninstall todo-chatbot
kubectl get all  # verify clean

# Stop Minikube
minikube stop
```

---

## Debugging Reference

| Symptom | Diagnosis Command | Fix |
|---------|------------------|-----|
| Pod `ImagePullBackOff` | `kubectl describe pod <name>` | `minikube image load todo-backend:latest` |
| Pod `CrashLoopBackOff` | `kubectl logs <name> --previous` | Check secret was created; read Python traceback |
| API calls return 502 | `kubectl describe pod <frontend-pod>` | Verify `BACKEND_URL=http://todo-chatbot-backend:8000` |
| Service unreachable | `minikube service todo-chatbot-frontend --url` | Re-run; confirm pod is `Running` and `Ready` |
| `release already exists` | `helm uninstall todo-chatbot` | Then re-run `helm install` |
| Pod stuck `Pending` | `kubectl describe pod <name>` → Events | Check node resources: `kubectl describe node` |

---

## Full Teardown

```bash
helm uninstall todo-chatbot
minikube stop
minikube delete   # optional: destroys cluster entirely
```
