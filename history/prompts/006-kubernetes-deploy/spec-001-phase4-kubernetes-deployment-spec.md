---
id: spec-006-001
title: phase4-kubernetes-deployment-spec
stage: spec
date: 2026-03-05T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 006-kubernetes-deploy
branch: main
user: Mahad
command: /sp.specify
labels: [spec, phase4, kubernetes, minikube, helm, gordon, kubectl-ai, kagent, containerization]
links:
  spec: specs/006-kubernetes-deploy/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  created:
    - specs/006-kubernetes-deploy/spec.md
    - specs/006-kubernetes-deploy/checklists/requirements.md
tests:
  - No [NEEDS CLARIFICATION] markers in spec
  - All mandatory spec sections completed
  - Success criteria are measurable and technology-agnostic
  - Installation automation requirement explicitly captured (FR-001 to FR-007)
  - Gordon fallback documented
  - Secrets strategy explicitly stated
  - Quality checklist all items passing
---

## Prompt

/sp.specify — Phase IV: Local Kubernetes Deployment.

Now generate a spec.md for phase4. Note: all installations will be managed by you.

Context from constitution v1.2.0:
- Containerize frontend (Next.js) and backend (FastAPI) with Dockerfiles
- Deploy on Minikube (local K8s, Docker driver)
- Helm charts for all deployments (no raw kubectl apply)
- Gordon (Docker AI Agent) for container operations
- kubectl-ai for AI-assisted kubectl commands
- kagent for cluster health analysis
- Kubernetes Secrets for AUTH_SECRET, DATABASE_URL, GROQ_API_KEY
- External Neon DB only — no PostgreSQL pod
- Installation checks confirmed: Docker 29.1.3 ✅, kubectl v1.34.1 ✅,
  Minikube ❌, Helm ❌, Go ❌, kubectl-ai ❌, kagent ❌

## Response snapshot

Created `specs/006-kubernetes-deploy/spec.md` with 5 user stories and 26 functional requirements.

**User Stories:**
- US1 (P1): Automated Tool Installation — Claude Code installs Minikube, Helm, Go,
  kubectl-ai, kagent without any manual developer steps
- US2 (P2): Application Containerization — frontend (multi-stage) and backend (single-stage)
  Dockerfiles producing working images with no embedded secrets
- US3 (P3): Helm Chart Creation — parameterized chart at helm/todo-chatbot/ with
  values.yaml (no secrets) + secret.yaml template
- US4 (P4): Minikube Deployment via Helm — full stack deployable in one helm install command,
  accessible from browser via minikube tunnel or NodePort
- US5 (P5): AI DevOps Operations — Gordon, kubectl-ai, kagent each used for at least one
  operation, all interactions documented in PHR

**Key decisions encoded:**
- FR-007: Gordon fallback to standard Docker CLI if unavailable in region/tier
- FR-013/FR-014: Secrets injected via --set-string at install time, never in values.yaml
- FR-022: External Neon DB only — no in-cluster database pod
- FR-026: All AI tool interactions documented in PHR (judging requirement)
- SC-001 directly addresses "all installations managed by Claude Code"

**Quality checklist:** All 14 items passing. No NEEDS CLARIFICATION markers.

## Outcome

- ✅ Impact: spec.md fully captures Phase IV scope — tool installation automation,
  containerization, Helm packaging, Minikube deployment, and AI DevOps tooling.
  User's explicit note ("installations managed by you") encoded as P1 user story
  with 6 acceptance scenarios and FR-001 through FR-007.
- 🧪 Tests: No bracket tokens. No NEEDS CLARIFICATION markers. All checklist items pass.
  Success criteria are measurable and technology-agnostic.
- 📁 Files: specs/006-kubernetes-deploy/spec.md (created),
  specs/006-kubernetes-deploy/checklists/requirements.md (created),
  history/prompts/006-kubernetes-deploy/spec-001-... (this PHR).
- 🔁 Next prompts: /sp.plan for 006-kubernetes-deploy → /sp.tasks → /sp.implement
- 🧠 Reflection: The most important framing decision — treating "all installations managed
  by Claude Code" as a P1 user story rather than a footnote. This ensures tool setup is a
  first-class deliverable that gets its own tasks and acceptance criteria. Gordon fallback
  must be handled gracefully since Docker Desktop may not be running or Gordon may not be
  available in all regions.

## Evaluation notes (flywheel)

- Failure modes observed: None — clean spec with all items passing on first validation.
- Graders run and results (PASS/FAIL): Quality checklist PASS (14/14 items).
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): Run /sp.plan to generate the implementation
  plan for 006-kubernetes-deploy.
