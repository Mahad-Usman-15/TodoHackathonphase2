# Tasks: Phase IV — Local Kubernetes Deployment

**Input**: Design documents from `/specs/006-kubernetes-deploy/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tech Stack**: Docker Desktop 4.53+, Minikube (Docker driver), Helm 3.x, kubectl-ai (Groq),
kagent, Gordon | Next.js 16+ (node:18-alpine) | FastAPI (python:3.11-slim)

**User Stories**:
- US1: Automated Tool Installation (P1) — FOUNDATIONAL — blocks all others
- US2: Application Containerization (P2) — can run parallel with US3 (Helm)
- US3: Helm Chart Creation (P3) — can run parallel with US2 (Containerization)
- US4: Minikube Deployment (P4) — depends on US2 + US3 complete
- US5: AI DevOps Operations (P5) — depends on US4 (cluster must be running)

---

## Phase 1: Setup (Repository Structure)

**Purpose**: Create the directory scaffold for new files before authoring them.

- [x] T001 Create Helm chart directory structure: `helm/todo-chatbot/templates/` (6 nested dirs/files go here; create parent dirs now)

---

## Phase 2: Tool Installation (US1 — P1) — FOUNDATIONAL

**Goal**: All Phase IV tools installed, verified functional, and configured. Zero manual steps from developer.

**Independent Test**: Run `minikube version && helm version && go version && kubectl-ai --version && kagent version` — all return version strings without error.

**⚠️ CRITICAL**: All user story phases (US2–US5) depend on this phase completing successfully. Tool installs are sequential — each depends on the prior.

- [x] T002 [US1] Check and install Minikube via winget: run `minikube version`; if missing, run `winget install Kubernetes.minikube` then re-verify
- [x] T003 [US1] Check and install Helm 3.x via winget: run `helm version`; if missing, run `winget install Helm.Helm` then re-verify
- [x] T004 [US1] Check and install Go via winget: run `go version`; if missing, run `winget install GoLang.Go`; after install add `$env:PATH += ";$env:USERPROFILE\go\bin"` and re-verify
- [x] T005 [US1] Install kubectl-ai via Go: run `go install github.com/sozercan/kubectl-ai@latest`; verify with `kubectl-ai --version` (depends on T004)
- [x] T006 [US1] Install kagent binary: check `https://github.com/kagent-dev/kagent/releases/latest` for the Windows binary (filename: `kagent_windows_amd64.exe` or similar); download it; rename to `kagent.exe`; move to `$env:USERPROFILE\go\bin\` (already on PATH after T004); verify with `kagent version`
- [x] T007 [US1] Configure kubectl-ai for Groq: set `OPENAI_API_KEY=$GROQ_API_KEY`, `OPENAI_BASE_URL=https://api.groq.com/openai/v1`, `OPENAI_DEPLOYMENT_NAME=llama3-8b-8192` (document as session env vars — not committed)
- [x] T008 [US1] Verify all tools: run full version check sequence — `minikube version`, `helm version`, `go version`, `kubectl-ai --version`, `kagent version` — confirm all succeed
- [x] T009 [US1] Document Gordon status: check Docker Desktop Settings > Beta features > Docker AI toggle; if available, enable it; document availability/unavailability in PHR

**Checkpoint**: All 5 tools respond to version checks. kubectl-ai configured with Groq. Proceed to US2+US3 in parallel.

---

## Phase 3: Application Containerization (US2 — P2)

**Goal**: Both frontend and backend packaged as self-contained Docker images with no secrets embedded.

**Independent Test**: `docker run -p 3000:3000 -e BACKEND_URL=http://host.docker.internal:8000 todo-frontend:latest` serves app on port 3000. `docker run -p 8000:8000 -e AUTH_SECRET=x -e DATABASE_URL=$DATABASE_URL -e GROQ_API_KEY=$GROQ_API_KEY todo-backend:latest` returns 200 on `/docs`.

### Files (T010–T014 fully parallel — different files)

- [x] T010 [P] [US2] Create frontend/.dockerignore — exclude `node_modules/`, `.next/`, `.env*`, `*.log` from Docker build context
- [x] T011 [P] [US2] Create backend/.dockerignore — exclude `__pycache__/`, `.env*`, `.venv/`, `*.pyc`, `*.log` from Docker build context
- [x] T012 [P] [US2] Update frontend/next.config.ts — add `output: 'standalone'` and `rewrites()` proxy block mapping `/api/:path*` to `${process.env.BACKEND_URL}/api/:path*` (extend existing config, do not replace)
- [x] T013 [P] [US2] Create frontend/Dockerfile — 3-stage (deps→builder→runner) using node:18-alpine; builder stage sets `ARG NEXT_PUBLIC_API_BASE_URL=/api` and `ENV NEXT_PUBLIC_API_BASE_URL`; runner stage copies standalone output, sets `NODE_ENV=production`, non-root nextjs user, `CMD ["node", "server.js"]`
- [x] T014 [P] [US2] Create backend/Dockerfile — single-stage python:3.11-slim; WORKDIR /code; `COPY requirements.txt`; `RUN pip install --no-cache-dir --upgrade -r requirements.txt`; `COPY . /code/`; `CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`

### Build & Verify (sequential — must complete file authoring first)

- [x] T015 [US2] Build frontend image via Gordon: run `docker ai "build the frontend image from frontend/Dockerfile and tag it todo-frontend:latest"`; if Gordon unavailable, fall back to `docker build -t todo-frontend:latest ./frontend`; verify with `docker images | grep todo-frontend`
- [x] T016 [US2] Build backend image via Gordon: run `docker ai "build the backend image from backend/Dockerfile and tag it todo-backend:latest"`; if Gordon unavailable, fall back to `docker build -t todo-backend:latest ./backend`; verify with `docker images | grep todo-backend`
- [x] T017 [US2] Smoke-test frontend container: `docker run --rm -p 3000:3000 -e BACKEND_URL=http://host.docker.internal:8000 todo-frontend:latest`; open http://localhost:3000 and confirm app loads
- [x] T018 [US2] Smoke-test backend container: `docker run --rm -p 8000:8000 -e AUTH_SECRET=test -e DATABASE_URL=$DATABASE_URL -e GROQ_API_KEY=$GROQ_API_KEY todo-backend:latest`; curl http://localhost:8000/docs and confirm 200
- [x] T019 [US2] Security audit: `docker history todo-frontend:latest` and `docker history todo-backend:latest` — confirm no layer contains secret values; `docker inspect` confirms no ENV with AUTH_SECRET or DATABASE_URL values baked in

**Checkpoint**: Both images build and run. No secrets in image layers. App functional in containers.

---

## Phase 4: Helm Chart Creation (US3 — P3)

**Goal**: Helm chart at `helm/todo-chatbot/` renders valid K8s manifests for all 5 resources. `helm lint` passes. values.yaml has no secrets.

**Independent Test**: `helm template todo-chatbot ./helm/todo-chatbot --set-string secret.authSecret=test --set-string secret.databaseUrl=test --set-string secret.groqApiKey=test` renders Secret, 2 Deployments, 2 Services without error.

### Chart files (T020–T026 fully parallel — different files)

- [x] T020 [P] [US3] Create helm/todo-chatbot/Chart.yaml — `name: todo-chatbot`, `version: 1.0.0`, `appVersion: "phase4"`, `description: "Todo Chatbot Phase IV — Minikube deployment"`
- [x] T021 [P] [US3] Create helm/todo-chatbot/values.yaml — replicaCount (frontend:1, backend:1), image repos with `pullPolicy: Never`, service types/ports, `backendServiceName: todo-chatbot-backend`, `secretName: todo-chatbot-secrets` (NO secrets in this file)
- [x] T022 [P] [US3] Create helm/todo-chatbot/templates/secret.yaml — `kind: Secret`, `type: Opaque`, `stringData` with AUTH_SECRET/DATABASE_URL/GROQ_API_KEY from `.Values.secret.*` using `| quote` Helm filter
- [x] T023 [P] [US3] Create helm/todo-chatbot/templates/backend-deployment.yaml — `replicas: {{ .Values.replicaCount.backend }}`, `image: todo-backend:latest`, `imagePullPolicy: Never`, `envFrom.secretRef`, readinessProbe `httpGet /docs :8000` initialDelaySeconds:10 periodSeconds:5
- [x] T024 [P] [US3] Create helm/todo-chatbot/templates/backend-service.yaml — `name: {{ .Values.backendServiceName }}` (fixed as `todo-chatbot-backend`), `type: ClusterIP`, port 8000
- [x] T025 [P] [US3] Create helm/todo-chatbot/templates/frontend-deployment.yaml — `replicas: {{ .Values.replicaCount.frontend }}`, `image: todo-frontend:latest`, `imagePullPolicy: Never`, plain env `BACKEND_URL: http://todo-chatbot-backend:8000`, `envFrom.secretRef`, readinessProbe `httpGet / :3000` initialDelaySeconds:15 periodSeconds:5
- [x] T026 [P] [US3] Create helm/todo-chatbot/templates/frontend-service.yaml — `type: NodePort`, port 3000, no explicit nodePort (auto-assigned)

### Validate (sequential — must complete file authoring first)

- [x] T027 [US3] Lint chart: `helm lint ./helm/todo-chatbot --set-string secret.authSecret=test --set-string secret.databaseUrl=test --set-string secret.groqApiKey=test` — fix any errors until lint passes with 0 warnings
- [x] T028 [US3] Dry-run: `helm install --debug --dry-run todo-chatbot ./helm/todo-chatbot --set-string secret.authSecret=test --set-string secret.databaseUrl=test --set-string secret.groqApiKey=test` — confirm 5 resources rendered: 1 Secret, 2 Deployments, 2 Services
- [x] T029 [US3] Verify secrets not in values.yaml: visually inspect `helm/todo-chatbot/values.yaml` and confirm every value is a non-sensitive string (image name, number, bool, or service name); run `grep -iE ":\s+['\"]?[A-Za-z0-9+/]{32,}" helm/todo-chatbot/values.yaml` — must return nothing (catches base64/API-key-length values); confirm `secretName` and `backendServiceName` fields contain only config references, not secret values

**Checkpoint**: `helm lint` passes. Dry-run shows all 5 resources. values.yaml clean of secrets.

---

## Phase 5: Minikube Deployment (US4 — P4)

**Goal**: Full Todo Chatbot stack running on Minikube; accessible in browser via NodePort URL; full user journey functional.

**Independent Test**: Open NodePort URL → register → login → create task → AI chat works → task updates visible.

**Depends on**: Phase 3 (US2) and Phase 4 (US3) both complete.

- [x] T030 [US4] Start Minikube cluster: `minikube start --driver=docker`; verify with `kubectl cluster-info` and `kubectl get nodes` — confirm node STATUS=Ready
- [x] T031 [US4] Load images into Minikube via Gordon: run `docker ai "load todo-frontend:latest and todo-backend:latest into the minikube cluster"`; if Gordon unavailable, fall back to `minikube image load todo-frontend:latest && minikube image load todo-backend:latest`; verify with `minikube image ls | grep todo`
- [x] T032 [US4] Deploy with Helm: `helm install todo-chatbot ./helm/todo-chatbot --set-string secret.authSecret=$AUTH_SECRET --set-string secret.databaseUrl=$DATABASE_URL --set-string secret.groqApiKey=$GROQ_API_KEY`; confirm output shows STATUS: deployed
- [x] T033 [US4] Monitor pod readiness: `kubectl get pods --watch`; wait until both pods show `Running` and `1/1` READY; if any pod fails, run `kubectl describe pod <name>` and `kubectl logs <name>` to diagnose
- [x] T034 [US4] Verify all K8s resources: `kubectl get all` — confirm Secret, 2 Deployments, 2 Services present; `kubectl get services` shows backend ClusterIP and frontend NodePort
- [x] T035 [US4] Get browser URL: `minikube service todo-chatbot-frontend --url`; record the URL (e.g., http://192.168.49.2:XXXXX)
- [x] T036 [US4] Browser smoke test — step 1: open NodePort URL; confirm Taskify login page renders with no JS errors in DevTools console
- [x] T037 [US4] Browser smoke test — step 2: register new account → login → create 3 tasks → verify tasks appear in dashboard → confirm data persists in Neon (same data as dev/production)
- [x] T038 [US4] Browser smoke test — step 3: navigate to AI chat → send "List my tasks" → confirm chatbot responds with the tasks just created
- [x] T039 [US4] Verify K8s service discovery from host: `kubectl port-forward svc/todo-chatbot-backend 18000:8000 &`; wait 2 seconds; `curl http://localhost:18000/docs`; confirm 200 HTML response; kill the port-forward process after (proves ClusterIP service is reachable and DNS resolves correctly within the cluster)

**Checkpoint**: Full user journey completes. Service discovery verified. App indistinguishable from dev version.

---

## Phase 6: AI DevOps Operations (US5 — P5)

**Goal**: Gordon, kubectl-ai, and kagent each used for at least one cluster operation. All interactions documented for PHR.

**Independent Test**: Three distinct tool outputs captured in notes — one each from Gordon, kubectl-ai, kagent.

**Depends on**: Phase 5 (US4) — cluster must be running with pods in Running state.

### Gordon Operations (T040–T041 parallel — independent Docker AI calls)

- [x] T040 [P] [US5] Gordon op 1: `docker ai "show me all running containers"` — capture exact prompt + full response text for PHR (FR-023, FR-026)
- [x] T041 [P] [US5] Gordon op 2: `docker ai "what images do I have available locally?"` — capture exact prompt + full response text for PHR

### kubectl-ai Operations (T042–T043 parallel — independent kubectl-ai calls)

- [x] T042 [P] [US5] kubectl-ai op 1: ensure OPENAI_API_KEY/OPENAI_BASE_URL/OPENAI_DEPLOYMENT_NAME env vars are set (T007); run `kubectl-ai "show me the status of all pods in the cluster"` — capture exact prompt + response for PHR (FR-024, FR-026)
- [x] T043 [P] [US5] kubectl-ai op 2: `kubectl-ai "show me logs for the backend pod"` — capture exact prompt + response for PHR

### kagent Health Analysis

- [x] T044 [US5] kagent cluster health: `kagent "analyze the cluster health"` — capture full health report output for PHR (FR-025, FR-026)
- [x] T045 [US5] kagent follow-up: `kagent "show me resource usage for all pods"` — capture output for PHR

### PHR Capture

- [x] T046 [US5] Write AI DevOps PHR: create `history/prompts/006-kubernetes-deploy/us5-ai-devops-operations.md` recording all 6 AI tool interactions (T040–T045) with exact prompts + responses, tool versions, and any fallback notes for Gordon if unavailable (FR-026, SC-006)

**Checkpoint**: All 3 AI tools used and documented. PHR written with full interaction logs.

---

## Phase 7: Polish & Verification

**Purpose**: Clean teardown/redeploy cycle verified; security audit complete; README updated.

- [x] T047 [P] Test teardown: `helm uninstall todo-chatbot`; run `kubectl get all` — confirm pods and services removed; run `kubectl get secrets` — confirm secret removed (SC-007)
- [x] T048 [P] Security audit: run `git log -p | grep -iE "(AUTH_SECRET|DATABASE_URL|GROQ_API_KEY)=[^$]"` — must return empty; confirm no secrets leaked in git history
- [x] T049 Re-deploy after teardown: reload images if needed, run `helm install todo-chatbot...` — confirm clean re-deploy with no residual state errors (SC-007)
- [x] T050 Update README.md: add Minikube URL to Live table, confirm Phase IV prerequisites and Run on Minikube section reflect actual commands used

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─► Phase 2 (US1: Tools — P1) — FOUNDATIONAL, blocks all
        ├─► Phase 3 (US2: Containerize — P2) ─┐
        └─► Phase 4 (US3: Helm Chart — P3)   ─┤ both complete
                                               └─► Phase 5 (US4: Deploy — P4)
                                                     └─► Phase 6 (US5: AI DevOps — P5)
                                                           └─► Phase 7 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|-------|-----------|---------------------|
| US1 (Tools) | Phase 1 only | Nothing |
| US2 (Containers) | US1 complete | US3 (different files) |
| US3 (Helm) | US1 complete | US2 (different files) |
| US4 (Deploy) | US2 + US3 both complete | Nothing |
| US5 (AI DevOps) | US4 complete | Nothing |

### Within Each Phase

- T010–T014 (US2 files): fully parallel — different files, no conflicts
- T020–T026 (US3 files): fully parallel — different Helm template files
- T040–T041 (Gordon ops): parallel — independent AI calls
- T042–T043 (kubectl-ai ops): parallel — independent AI calls
- T047–T048 (Polish): parallel — different files/commands

---

## Parallel Execution Examples

### US2 Containerization (run simultaneously)

```bash
# Terminal 1
Task: "Create frontend/.dockerignore" (T010)
Task: "Update frontend/next.config.ts — add standalone + rewrites" (T012)
Task: "Create frontend/Dockerfile" (T013)

# Terminal 2
Task: "Create backend/.dockerignore" (T011)
Task: "Create backend/Dockerfile" (T014)
```

### US3 Helm Chart (run simultaneously)

```bash
# All 7 files (T020–T026) can be authored in parallel:
Task: "Create Chart.yaml" (T020)
Task: "Create values.yaml" (T021)
Task: "Create templates/secret.yaml" (T022)
Task: "Create templates/backend-deployment.yaml" (T023)
Task: "Create templates/backend-service.yaml" (T024)
Task: "Create templates/frontend-deployment.yaml" (T025)
Task: "Create templates/frontend-service.yaml" (T026)
```

### US5 AI DevOps (run simultaneously after cluster is up)

```bash
# All tool ops independent:
Task: "Gordon op 1 — running containers" (T040)
Task: "Gordon op 2 — local images" (T041)
Task: "kubectl-ai op 1 — pod status" (T042)
Task: "kubectl-ai op 2 — backend logs" (T043)
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 + US4 — minimum for judging)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: US1 Tool Installation (T002–T009)
3. Complete Phase 3 + Phase 4 in parallel: US2 Containerization + US3 Helm Chart
4. Complete Phase 5: US4 Minikube Deploy (T030–T039)
5. **STOP and VALIDATE**: Full user journey works in browser
6. Demo-ready at this point

### Full Delivery (add US5)

6. Complete Phase 6: US5 AI DevOps (T040–T046)
7. Complete Phase 7: Polish (T047–T050)
8. All 7 success criteria from spec.md satisfied

---

## Task Count Summary

| Phase | Story | Tasks | Parallel |
|-------|-------|-------|---------|
| 1: Setup | — | 1 | — |
| 2: Tool Installation | US1 | 8 | 0 (sequential) |
| 3: Containerization | US2 | 10 | 5 (T010–T014) |
| 4: Helm Chart | US3 | 10 | 7 (T020–T026) |
| 5: Minikube Deploy | US4 | 10 | 0 (sequential ops) |
| 6: AI DevOps | US5 | 7 | 4 (T040–T043) |
| 7: Polish | — | 4 | 2 (T047–T048) |
| **Total** | | **50** | **18** |

---

## Notes

- [P] tasks = different files or independent operations, no shared state conflicts
- [Story] label maps each task to its user story for traceability and independent testing
- Tools must be in PATH before kubectl-ai/kagent commands run — verify after install (T008)
- `NEXT_PUBLIC_API_BASE_URL=/api` must be set as Docker build arg, not as ENV in Dockerfile
- `BACKEND_URL` must NOT be in the K8s Secret — it's a plain (non-secret) env var in the Deployment
- If Gordon is unavailable, use standard Docker CLI and document fallback in PHR (FR-007)
- `helm lint` must pass before `helm install` — never skip lint
- Never commit `.env` files or files containing actual secret values
