---
id: spec-002
title: maintenance-fixes-clarifications
stage: spec
date: 2026-03-02
surface: claude-code
model: claude-sonnet-4-6
feature: 005-maintenance-fixes
branch: main
user: Techno
command: /sp.clarify
labels: [spec, clarify, maintenance, ux, dashboard-sync, chat, session]
links:
  spec: specs/005-maintenance-fixes/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/005-maintenance-fixes/spec.md
tests:
  - none
---

## Prompt

/sp.clarify (no additional input)

## Response snapshot

Ran structured ambiguity scan across 11 taxonomy categories. 5 were Partial/Missing with material impact. Asked 4 questions sequentially:

1. Dashboard sync mechanism (FR-005) → A: Refetch on page visibility/focus; no polling
2. New Chat server-side lifecycle (FR-009) → A: Preserve archived; not deleted
3. Error type differentiation (FR-003/004) → A: Differentiated — warm-up, rate-limit, generic
4. Session UX during token refresh (FR-001) → A: Full-page spinner until confirmed

All 4 answers applied incrementally to spec: FR-001, FR-003, FR-004, FR-005, FR-009 updated; Acceptance Scenarios updated; Assumptions aligned; Clarifications section created.

## Outcome

- ✅ Impact: 4 material ambiguities resolved; spec is now unambiguous on cross-page sync, conversation lifecycle, error differentiation, and session load UX
- 🧪 Tests: No tests at spec stage
- 📁 Files: specs/005-maintenance-fixes/spec.md (sections updated: FR, Acceptance Scenarios, Assumptions, Clarifications)
- 🔁 Next prompts: /sp.plan — generate implementation plan
- 🧠 Reflection: Dashboard sync choice (visibility refetch) avoids complex shared state. Spinner over skeleton for session check keeps it simple and consistent with existing auth loading pattern.

## Evaluation notes (flywheel)

- Failure modes observed: Prerequisites script returned wrong feature (based on git branch, not spec dir); used spec path directly
- Graders run and results (PASS/FAIL): All 4 clarifications integrated cleanly; no contradictory text remains
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): /sp.plan to generate architecture and tasks
