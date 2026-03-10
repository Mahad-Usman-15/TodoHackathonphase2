---
id: tasks-004
title: phase4-kubernetes-tasks
stage: tasks
date: 2026-03-07
surface: claude-code
model: claude-sonnet-4-6
feature: 006-kubernetes-deploy
branch: main
user: Techno
command: /sp.tasks
labels: [kubernetes, helm, docker, minikube, phase4, devops, tasks]
links:
  spec: specs/006-kubernetes-deploy/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/006-kubernetes-deploy/tasks.md
tests:
  - N/A (DevOps tasks — manual verification via helm lint + browser smoke test)
---

## Prompt

```
/sp.tasks
```

Generate an actionable, dependency-ordered tasks.md for 006-kubernetes-deploy based on all
available design artifacts (spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md).

## Response snapshot

Generated `specs/006-kubernetes-deploy/tasks.md` with 50 tasks across 7 phases:

**Phase 1 — Setup (1 task)**: Create helm/todo-chatbot/templates/ directory structure.

**Phase 2 — US1 Tool Installation (8 tasks, sequential)**: Minikube install + verify, Helm install
+ verify, Go install + PATH setup, kubectl-ai via Go install, kagent binary download, kubectl-ai
Groq env var config, full verification sweep, Gordon enable/document.

**Phase 3 — US2 Containerization (10 tasks, 5 parallel)**: frontend .dockerignore, backend
.dockerignore, next.config.ts update (output:standalone + rewrites), frontend Dockerfile (3-stage),
backend Dockerfile (single-stage), docker build x2, smoke-test x2, security audit.

**Phase 4 — US3 Helm Chart (10 tasks, 7 parallel)**: Chart.yaml, values.yaml (no secrets),
secret.yaml (stringData), backend-deployment.yaml (readinessProbe /docs:8000), backend-service.yaml
(ClusterIP), frontend-deployment.yaml (BACKEND_URL env + readinessProbe /:3000), frontend-service.yaml
(NodePort), helm lint, helm dry-run, values.yaml secret audit.

**Phase 5 — US4 Minikube Deploy (10 tasks, sequential)**: minikube start --driver=docker, image
load x2, helm install with --set-string secrets, kubectl get pods --watch, kubectl get all, get
NodePort URL, browser smoke test (login + tasks + AI chat), K8s service discovery verification.

**Phase 6 — US5 AI DevOps (7 tasks, 4 parallel)**: Gordon op x2, kubectl-ai op x2, kagent health
x2, PHR capture with all 6 interaction logs.

**Phase 7 — Polish (4 tasks, 2 parallel)**: helm uninstall teardown test, git secret audit, helm
re-install after teardown, README update.

**Dependency order**:
```
Setup → US1 Tools → [US2 Containers ∥ US3 Helm] → US4 Deploy → US5 AI DevOps → Polish
```

**18 of 50 tasks** are parallelizable. US2 and US3 can run simultaneously (touch different files).

## Outcome

- ✅ Impact: 50 fully-specified, immediately-executable tasks covering all 5 user stories and all 7 success criteria from spec.md.
- 🧪 Tests: helm lint + helm template --dry-run (US3); docker run smoke tests (US2); full browser journey (US4); AI tool output capture (US5).
- 📁 Files: 1 file — specs/006-kubernetes-deploy/tasks.md
- 🔁 Next prompts: `/sp.implement specs/006-kubernetes-deploy` to begin execution
- 🧠 Reflection: This feature's task structure differs from typical app features — no DB models/services/routes, only infra files. The parallel opportunities (US2+US3 running simultaneously) are the key efficiency gain. Tool installation must be strictly sequential (each tool depends on the prior).

## Evaluation notes (flywheel)

- Failure modes observed: `check-prerequisites.ps1` still picks up `1-seo-optimization` (wrong feature) when run on main branch — worked around by using direct artifact paths.
- Graders run and results (PASS/FAIL): All 7 success criteria (SC-001 to SC-007) from spec.md are covered by tasks. All 26 functional requirements (FR-001 to FR-026) are addressed.
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Pass explicit `--feature 006-kubernetes-deploy` flag to check-prerequisites.ps1 to fix feature detection on main branch
