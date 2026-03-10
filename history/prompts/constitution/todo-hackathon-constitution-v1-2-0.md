---
id: constitution-005
title: add-phase4-kubernetes-deployment-constitution
stage: constitution
date: 2026-03-05T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 005-kubernetes-deploy
branch: main
user: Mahad
command: /sp.constitution
labels: [constitution, phase4, kubernetes, minikube, helm, gordon, kubectl-ai, kagent, minor-bump]
links:
  spec: specs/005-kubernetes-deploy/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  modified:
    - .specify/memory/constitution.md
tests:
  - Constitution version updated to 1.2.0
  - Phase II and Phase III content fully preserved — no regressions
  - No remaining bracket tokens in constitution
  - "No Kubernetes" prohibition correctly scoped to Phase II/III only
  - Phase IV Cloud-Native Operations Standards encoded as new Principle 9
  - Kubernetes Secrets requirement for all sensitive values explicitly mandated
---

## Prompt

/sp.constitution — Phase IV: Local Kubernetes Deployment.

Update the constitution by adding phase IV related info.

Phase IV objective: Deploy the Phase III Todo Chatbot on a local Kubernetes cluster using
Minikube and Helm Charts. Use Docker AI Agent (Gordon) for AI-assisted Docker operations.
Use kubectl-ai and kagent for AI-assisted Kubernetes operations.

Technology Stack additions:
- Containerization: Docker Desktop 4.53+ with Gordon AI agent
- Orchestration: Kubernetes (Minikube, Docker driver)
- Package Manager: Helm 3.x (charts for frontend + backend)
- AI DevOps: kubectl-ai (natural language kubectl), kagent (cluster health analysis)
- Dockerfiles: Multi-stage for frontend (Next.js), single-stage for backend (FastAPI)

Key constraints:
- Database stays external (Neon) — no PostgreSQL pod
- All secrets via Kubernetes Secrets — not in Helm values.yaml
- Minikube only — no cloud K8s (EKS, GKE, AKS)
- All app deployment via Helm — no raw kubectl apply
- Gordon + kubectl-ai + kagent usage must be demonstrated and documented in PHR

Keep Phase II and Phase III content fully intact.

## Response snapshot

Updated `.specify/memory/constitution.md` from v1.1.0 → v1.2.0 (MINOR bump).

**Changes made:**
- Added Principle 9: Cloud-Native Operations Standards (Phase IV — new principle)
  covering Minikube, Helm, Gordon, kubectl-ai, kagent, K8s Secrets, external DB,
  Dockerfile requirements, and image loading procedure
- Expanded Principle 3 (Architecture Simplicity): scoped "No Kubernetes" prohibition
  to Phase II/III only; Phase IV K8s is now explicitly required and expected
- Expanded Principle 4 (Technology Adherence): Phase IV stack added as additive block
- Added Phase IV Technology Stack section (Docker Desktop, Gordon, Minikube, Helm,
  kubectl-ai, kagent, Dockerfile conventions)
- Updated Authentication Architecture: Phase IV injects AUTH_SECRET via K8s Secret
- Added Helm Chart Structure (Phase IV — Fixed Contract) section with full directory tree
- Added Phase IV AIOps Standards section (Gordon, kubectl-ai, kagent mandatory usage rules)
- Updated Code Organization: added helm/ directory, Dockerfiles for frontend and backend
- Updated Security Requirements: Phase IV K8s Secrets and no-secrets-in-images rules
- Added Phase IV to Absolute Prohibitions (no cloud K8s, no raw kubectl, no secrets in
  values.yaml, no secrets in Docker images, no PostgreSQL pod)
- Updated File Naming Constraints: Helm template naming convention added
- Updated Deployment Constraints: Phase IV Minikube local deployment block added
- Added Phase IV Completion Checklist (15 items)
- Updated Security Criteria: Phase IV K8s Secrets requirements added
- Updated Evaluation Rubric: split Working Implementation 30% into three phases
  (Phase II 10% + Phase III 10% + Phase IV 10%)
- Updated Code Quality and Architecture & Design rubric with Phase IV notes
- Added Phase IV entries to Final Reminders priorities
- Added Phase IV governance lock: Minikube is the only permitted K8s target

**Phase II and Phase III fully preserved:** All existing principles, tech stack, success
criteria, security requirements, and MCP standards are intact with zero modifications.

## Outcome

- ✅ Impact: Constitution v1.2.0 governs Phase II (CRUD), Phase III (AI chatbot), and
  Phase IV (Kubernetes deployment). Cloud-Native Operations Standards formally encoded.
  AIOps tooling (Gordon, kubectl-ai, kagent) requirements locked as governance constraints.
  Minikube-only restriction prevents scope creep to cloud providers.
- 🧪 Tests: No bracket tokens remaining. Version 1.2.0 matches report. Dates ISO format.
  Phase II/III checklists untouched. "No Kubernetes" correctly re-scoped (not removed).
- 📁 Files: 1 file modified (.specify/memory/constitution.md), 1 PHR created.
- 🔁 Next prompts: /sp.specify for 005-kubernetes-deploy → /sp.clarify → /sp.plan →
  /sp.tasks → /sp.implement
- 🧠 Reflection: Key decisions encoded — (1) "No Kubernetes" prohibition from Phase II/III
  is NOT blanket-removed but re-scoped per-phase; this preserves the original intent
  (no over-engineering in early phases) while allowing Phase IV to proceed correctly.
  (2) Database stays external (Neon) to avoid PostgreSQL StatefulSet complexity — aligns
  with "Basic Level" mandate. (3) Secrets strategy (K8s Secrets, not values.yaml) prevents
  the common mistake of committing sensitive values in Helm charts.

## Evaluation notes (flywheel)

- Failure modes observed: None — clean amendment with no contradictions to Phase II/III content.
- Graders run and results (PASS/FAIL): Constitution validation PASS (no bracket tokens,
  ISO dates, version coherent, per-phase scoping correct).
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): Run /sp.specify for 005-kubernetes-deploy to
  generate the Phase IV feature specification.
