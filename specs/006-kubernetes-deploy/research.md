# Phase 0 Research — Phase IV Kubernetes Deployment

**Feature**: 006-kubernetes-deploy | **Date**: 2026-03-05

All decisions below were resolved through official documentation research (Docker, Next.js, FastAPI,
Kubernetes, Helm, Minikube) and through the `/sp.clarify` session with user input.

---

## Decision 1: Frontend API URL Strategy in Container

**Decision**: Build frontend with `NEXT_PUBLIC_API_BASE_URL=/api` as a Docker build arg. Add
`next.config.ts` rewrites proxy mapping `/api/:path*` → `${BACKEND_URL}/api/:path*`.

**Rationale**:
- `NEXT_PUBLIC_*` vars are baked into the JS bundle at build time (official Next.js docs). Cannot
  change at runtime.
- In Kubernetes, the backend ClusterIP hostname is only reachable from the Next.js server process,
  not from the browser.
- Using a relative `/api` URL causes the browser to call the Next.js server (same host). The
  Next.js rewrites proxy then forwards the request server-side to the backend ClusterIP service.
- The image remains environment-agnostic (no backend URL baked in).

**Alternatives considered**:
- Pass backend URL as `NEXT_PUBLIC_BACKEND_URL` build arg — rejected: bakes a cluster-specific
  URL into the image, making it non-portable.
- Use a separate Nginx sidecar for proxying — rejected: adds operational complexity; Next.js
  rewrites is the official mechanism.
- Change `frontend/lib/api.ts` to use a non-public env var — rejected: would break local dev
  without `.env.local` changes; requires code change in the data layer.

**Source**: nextjs.org/docs/app/guides/environment-variables, nextjs.org/docs/app/api-reference/config/next-config-js/rewrites

---

## Decision 2: Backend Base Image

**Decision**: `python:3.11-slim` — single-stage build.

**Rationale**:
- Official FastAPI Docker deployment docs use `python:3.11-slim` explicitly.
- No native C extension dependencies in this project (FastAPI, SQLModel, uvicorn, openai-agents,
  mcp, sse-starlette all have pure-Python or pre-compiled wheels).
- Multi-stage Python build is only needed when compiler tools (gcc, musl-dev) are required for
  build but should not be in the final image — not applicable here.
- `slim` variant is smaller than full `python:3.11` and includes enough for pip installs.

**Alternatives considered**:
- `python:3.11-alpine` — rejected: Alpine uses musl libc; some Python packages have
  compatibility issues and require compilation; `slim` is safer.
- Multi-stage build — rejected: unnecessary complexity per FastAPI official docs.

**Source**: fastapi.tiangolo.com/deployment/docker/

---

## Decision 3: Frontend Base Image

**Decision**: `node:18-alpine` — 3-stage multi-stage build (deps → builder → runner).

**Rationale**:
- Node.js 18 is LTS; confirmed on host (v20.20.0 host, 18 in container per constitution §Tech Stack).
- Alpine is the smallest official variant for Node.js.
- 3-stage build: Stage 1 installs deps (cached), Stage 2 builds (standalone output), Stage 3
  copies only standalone output (no full node_modules).
- Official Next.js Docker example uses this exact pattern.

**Source**: nextjs.org/docs/app/api-reference/config/next-config-js/output,
github.com/vercel/next.js/tree/canary/examples/with-docker

---

## Decision 4: `imagePullPolicy` Setting

**Decision**: `pullPolicy: Never` for both frontend and backend images.

**Rationale**:
- Images are built locally and loaded into Minikube via `minikube image load`.
- Minikube's internal registry is separate from Docker Hub.
- Without `imagePullPolicy: Never`, kubelet will attempt to pull from an external registry
  and fail with `ImagePullBackOff` because the image doesn't exist there.
- Official Minikube docs explicitly require `imagePullPolicy: Never` for locally loaded images.

**Source**: minikube.sigs.k8s.io/docs/handbook/pushing/#1-pushing-directly-to-the-in-cluster-docker-daemon-docker-env

---

## Decision 5: Secrets Injection Strategy

**Decision**: `helm install --set-string secret.<key>="<value>"` at deploy time; K8s Secret
with `stringData`; pods use `envFrom.secretRef`.

**Rationale**:
- Constitution §Security: "K8s Secrets for all sensitive values; no secrets in images or values.yaml"
- `--set-string` forces Helm to treat the value as a string even if it looks like a number,
  preventing YAML type coercion bugs on long secrets.
- `stringData` in K8s Secret: Kubernetes auto-encodes to base64; no manual encoding needed.
- `envFrom.secretRef` is the official K8s pattern for injecting a whole Secret as env vars.
- Secrets never appear in committed files (values.yaml, Dockerfiles, .env).

**Source**: helm.sh/docs/helm/helm_install, kubernetes.io/docs/concepts/configuration/secret

---

## Decision 6: Frontend Service Type

**Decision**: `NodePort` — accessed via `minikube service todo-chatbot-frontend --url`.

**Rationale**:
- User confirmed NodePort in clarification Q3 ("A: NodePort, accessed via `minikube service --url`").
- No `minikube tunnel` background process required (tunnel is for LoadBalancer type).
- `minikube service --url` returns the exact NodePort URL to open in a browser.
- Simpler than LoadBalancer for local dev.

**Source**: kubernetes.io/docs/concepts/services-networking/service,
minikube.sigs.k8s.io/docs/

---

## Decision 7: Backend Service Type

**Decision**: `ClusterIP` — internal-only DNS at `http://todo-chatbot-backend:8000`.

**Rationale**:
- Backend must not be directly exposed to the browser (security: auth bypass risk).
- All browser API calls go through the Next.js rewrites proxy which runs server-side.
- ClusterIP creates a stable DNS name within the cluster (`<service-name>` in same namespace).
- The frontend pod's `BACKEND_URL` env var is set to `http://todo-chatbot-backend:8000`.

**Source**: kubernetes.io/docs/concepts/services-networking/service

---

## Decision 8: kubectl-ai LLM Provider

**Decision**: Groq `llama3-8b-8192` via OpenAI-compatible endpoint.
- `OPENAI_API_KEY=$GROQ_API_KEY`
- `OPENAI_BASE_URL=https://api.groq.com/openai/v1`
- `OPENAI_DEPLOYMENT_NAME=llama3-8b-8192`

**Rationale**:
- User decision in clarification Q1: reuse existing `GROQ_API_KEY`, no new API key needed.
- Avoids 4-7GB Ollama model download and Ollama server process.
- `llama3-8b-8192` is a different model from the chatbot (`llama-3.3-70b-versatile`), so rate
  limits are in a separate pool — no interference.
- kubectl-ai supports OpenAI-compatible endpoints via env var override.

**Source**: User decision (clarify session), github.com/sozercan/kubectl-ai

---

## Decision 9: Health Probe Endpoints

**Decision**:
- Backend: `httpGet /docs :8000` with `initialDelaySeconds: 10, periodSeconds: 5`
- Frontend: `httpGet / :3000` with `initialDelaySeconds: 15, periodSeconds: 5`

**Rationale**:
- FastAPI `/docs` (Swagger UI) is always available at startup without authentication.
  Returns 200 immediately after app loads. Safe and deterministic.
- Next.js root `/` returns 200 when SSR is initialized and ready to serve.
- `initialDelaySeconds` gives app time to start before first probe.
- Backend gets shorter delay (10s) vs frontend (15s) since Node.js startup is slower than Python.

**Source**: kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

---

## Decision 10: Helm Deployment Pattern

**Decision**: `helm install` (first deploy), `helm upgrade --install` (idempotent re-deploys).

**Rationale**:
- `helm upgrade --install` is the official idempotent pattern: installs if not present, upgrades
  if already installed. Safe to run multiple times without error.
- `helm rollback todo-chatbot 1` rolls back to any previous revision by number.
- `helm history todo-chatbot` shows all revisions.

**Source**: helm.sh/docs/howto/charts_tips_and_tricks

---

## Decision 11: Minikube Driver

**Decision**: `--driver=docker` (Docker Desktop).

**Rationale**:
- Docker Desktop is confirmed installed (4.53+).
- Docker driver is the recommended driver when Docker Desktop is available.
- No Hyper-V or VirtualBox dependency.

**Source**: minikube.sigs.k8s.io/docs/

---

## Decision 12: kagent Installation

**Decision**: Binary download from kagent.dev releases (no Go/brew dependency).

**Rationale**:
- Direct binary download is simpler and avoids Go build chain for kagent.
- kubectl-ai uses Go install (separate Go dependency already required).
- Windows binary available from official kagent.dev releases.

**Source**: kagent.dev (official)

---

## Confirmed Tool Versions / Installation Status

| Tool | Status | Install Method |
|------|--------|----------------|
| Docker Desktop 4.53+ | Confirmed installed | Already present |
| kubectl v1.34.1 | Confirmed installed | Already present |
| minikube | NOT installed | `winget install Kubernetes.minikube` |
| helm | NOT installed | `winget install Helm.Helm` |
| Go | NOT installed | `winget install GoLang.Go` + PATH reload |
| kubectl-ai | NOT installed | `go install github.com/sozercan/kubectl-ai@latest` |
| kagent | NOT installed | Binary download from kagent.dev |
| Gordon (Docker AI) | Available | Docker Desktop Beta features toggle |
