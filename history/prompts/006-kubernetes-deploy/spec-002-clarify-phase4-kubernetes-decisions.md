---
id: spec-006-002
title: clarify-phase4-kubernetes-decisions
stage: spec
date: 2026-03-05T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 006-kubernetes-deploy
branch: main
user: Mahad
command: /sp.clarify
labels: [clarify, phase4, kubernetes, kubectl-ai, ollama, nextjs-proxy, nodeport]
links:
  spec: specs/006-kubernetes-deploy/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  modified:
    - specs/006-kubernetes-deploy/spec.md
    - specs/006-kubernetes-deploy/checklists/requirements.md
tests:
  - 3 questions asked, 3 answered, 0 deferred
  - No NEEDS CLARIFICATION markers remain
  - FR-004 updated with Ollama requirement
  - FR-016 updated to NodePort (removed LoadBalancer ambiguity)
  - FR-020 updated to reference minikube service --url
  - FR-021 updated with Next.js rewrites proxy pattern
  - SC-004 updated to reference NodePort URL
  - Assumptions updated with Ollama entry
  - Key Entities updated with Next.js Rewrites Proxy entity
---

## Prompt

/sp.clarify — Phase IV: Local Kubernetes Deployment (006-kubernetes-deploy).

Clarify remaining ambiguities in spec.md before proceeding to /sp.plan.

## Response snapshot

3 questions asked and answered. All critical ambiguities resolved.

**Q1: kubectl-ai LLM provider**
- Options presented: OpenAI API key / Ollama (local) / Groq reuse / dry-run only
- Recommendation: Ollama (local, free, no API key)
- Answer: B — Ollama
- Impact: FR-004 updated to require Ollama installation + model pull; Assumptions updated.
  Ollama is now an additional tool Claude Code must install as part of US1 (P1).

**Q2: Frontend→backend URL inside Kubernetes**
- Options: Bake URL at build time / Next.js rewrites proxy / NEXT_PUBLIC_ cluster DNS / Nginx sidecar
- Recommendation: Next.js rewrites proxy (environment-agnostic image)
- Answer: B — Next.js rewrites proxy
- Impact: FR-021 fully rewritten — frontend calls `/api/*`, Next.js server proxies to
  backend service URL injected at runtime as server-side env var (not NEXT_PUBLIC_).
  New Key Entity added: "Next.js Rewrites Proxy". This is architecturally significant —
  prevents image rebuild per environment and keeps backend URL out of the browser.

**Q3: Frontend service type for browser access**
- Options: NodePort (`minikube service --url`) / LoadBalancer (`minikube tunnel`)
- Recommendation: NodePort (simpler, no background process)
- Answer: A — NodePort
- Impact: FR-016 updated to NodePort only. FR-020 updated to reference
  `minikube service todo-chatbot-frontend --url`. SC-004 updated with NodePort URL reference.
  "minikube tunnel" removed as a requirement from all sections.

## Outcome

- ✅ Impact: All 3 blocking ambiguities resolved. Spec is now fully unambiguous and ready
  for /sp.plan. Key architectural decision locked: Next.js rewrites proxy keeps the frontend
  image reusable across environments without rebuild. Ollama keeps kubectl-ai free and offline.
  NodePort removes the need for a background tunnel process.
- 🧪 Tests: 3/3 questions resolved. Checklist 14/14 items passing. No remaining vague language.
- 📁 Files: specs/006-kubernetes-deploy/spec.md (modified — Clarifications section added,
  FR-004/016/020/021 updated, SC-004 updated, Assumptions + Key Entities updated).
  checklists/requirements.md updated with clarification results.
- 🔁 Next prompts: /sp.plan for 006-kubernetes-deploy
- 🧠 Reflection: The most architecturally impactful clarification was Q2 (frontend→backend URL).
  NEXT_PUBLIC_ env vars are baked at build time in Next.js, which means a naive containerization
  would produce an image that only works for one environment. The rewrites proxy pattern solves
  this cleanly — the image is environment-agnostic, and the backend URL is supplied at pod
  startup via a regular (non-NEXT_PUBLIC_) env var. This is the correct pattern for containerized
  Next.js apps and would have caused debugging pain if left unresolved until implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None — all 3 questions had clear winning options.
- Graders run and results (PASS/FAIL): Spec quality checklist PASS (14/14 post-clarification).
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): Run /sp.plan to generate the implementation plan.
