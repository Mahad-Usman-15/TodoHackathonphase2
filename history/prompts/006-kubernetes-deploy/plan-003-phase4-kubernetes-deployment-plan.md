---
id: plan-003
title: phase4-kubernetes-deployment-plan
stage: plan
date: 2026-03-05
surface: claude-code
model: claude-sonnet-4-6
feature: 006-kubernetes-deploy
branch: main
user: Techno
command: /sp.plan specs/006-kubernetes-deploy
labels: [kubernetes, helm, docker, minikube, phase4, devops]
links:
  spec: specs/006-kubernetes-deploy/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/006-kubernetes-deploy/plan.md
  - specs/006-kubernetes-deploy/research.md
  - specs/006-kubernetes-deploy/data-model.md
  - specs/006-kubernetes-deploy/contracts/helm-values.yaml
  - specs/006-kubernetes-deploy/contracts/kubernetes-manifests.md
  - specs/006-kubernetes-deploy/quickstart.md
tests:
  - N/A (design artifacts — no code tests)
---

## Prompt

```
/sp.plan specs/006-kubernetes-deploy
```

Execute the implementation planning workflow for Phase IV Local Kubernetes Deployment. Generate all
design artifacts: research.md, data-model.md, contracts/, quickstart.md, plan.md.

## Response snapshot

Generated the full Phase IV implementation plan across 6 design artifacts:

**plan.md** — Summary, Technical Context, Constitution Check (all 10 gates PASS), Project Structure,
Phase 0 research decisions, Phase 1 design with critical `next.config.ts` rewrites implementation
note (two-part solution: `NEXT_PUBLIC_API_BASE_URL=/api` build arg + server-side `BACKEND_URL`
rewrites proxy), Helm values contract, Kubernetes resource summary, tool installation sequence,
and implementation phases for `/sp.tasks`.

**research.md** — 12 decisions resolved from official docs + user clarification:
- Frontend API URL: relative `/api` + Next.js rewrites proxy (BACKEND_URL runtime env var)
- Base images: `node:18-alpine` (frontend) + `python:3.11-slim` (backend)
- `imagePullPolicy: Never` for locally loaded Minikube images
- Secrets via `helm install --set-string` + K8s Secret `stringData` + `envFrom.secretRef`
- Frontend: NodePort; Backend: ClusterIP
- kubectl-ai: Groq `llama3-8b-8192` via OpenAI-compatible endpoint (reuses GROQ_API_KEY)
- Readiness probes: `/docs:8000` (FastAPI) and `/:3000` (Next.js)

**data-model.md** — Infrastructure entities: Docker images, K8s Secret schema, Helm release,
K8s resource table, pod env var tables (frontend + backend), service port mapping, Helm values
tree, file tree of new files (11 total).

**contracts/helm-values.yaml** — Complete values.yaml design contract with comments explaining
all values and the `--set-string` secret injection pattern.

**contracts/kubernetes-manifests.md** — Exact YAML for all 5 K8s resources with rendered values
and rules. Includes request flow diagram: Browser → NodePort → frontend pod → ClusterIP → backend pod → Neon.

**quickstart.md** — End-to-end 12-step guide: tool install → next.config.ts update → Dockerfiles
→ docker build → minikube start → image load → helm chart → helm lint → helm install → verify →
browser open → smoke test. Plus AI DevOps ops (Gordon, kubectl-ai, kagent) and Helm lifecycle commands.

## Outcome

- ✅ Impact: Full implementation plan for Phase IV — all 5 user stories (US1-US5) have clear design artifacts. Tasks can now be generated via `/sp.tasks`.
- 🧪 Tests: helm lint + helm template --dry-run defined in quickstart. Manual smoke test: login → tasks → AI chat.
- 📁 Files: 6 new design artifacts created; plan.md is the master document.
- 🔁 Next prompts: `/sp.tasks` to generate tasks.md with dependency-ordered implementation tasks
- 🧠 Reflection: The two-part NEXT_PUBLIC_ / rewrites solution is the key architectural insight for this phase. Local dev is unaffected because it uses a full URL with host, not a relative `/api` path.

## Evaluation notes (flywheel)

- Failure modes observed: setup-plan.ps1 always picks up the wrong feature (1-seo-optimization) because we're on main branch without a feature branch. Workaround: use direct paths instead of script output.
- Graders run and results (PASS/FAIL): Constitution check — all 10 gates PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Update setup-plan.ps1 to accept explicit feature path arg when on main branch
