---
id: tasks-001
title: maintenance-fixes-task-list
stage: tasks
date: 2026-03-02
surface: claude-code
model: claude-sonnet-4-6
feature: 005-maintenance-fixes
branch: main
user: Techno
command: /sp.tasks
labels: [tasks, maintenance, session, chat, dashboard, mobile, accessibility]
links:
  spec: specs/005-maintenance-fixes/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/005-maintenance-fixes/tasks.md
tests:
  - none (manual checklist in quickstart.md)
---

## Prompt

/sp.tasks (no additional input — generating tasks for 005-maintenance-fixes)

## Response snapshot

Generated 28 tasks across 9 phases (2 setup + 1 foundational + 6 user story + 1 polish). No test tasks (not requested). Mapped all 20 FRs to 6 user stories. Identified parallel opportunities within US1, US2, US5, US6. Key ordering constraint: T007 (US2, dashboard/page.tsx visibilitychange) must complete before T014 (US4, filter tabs in same file). `SkeletonCard.tsx` and `Toast.tsx` already exist — reuse confirmed.

## Outcome

- ✅ Impact: 28 tasks covering all 20 FRs across 6 user stories; MVP = Phase 1+2+3 (US1 session fix)
- 🧪 Tests: None generated (not in spec)
- 📁 Files: specs/005-maintenance-fixes/tasks.md
- 🔁 Next prompts: /sp.implement — execute tasks
- 🧠 Reflection: Key insight: T007 (visibilitychange for US2) and T014-T016 (filters/toasts for US4) all touch dashboard/page.tsx — sequential ordering prevents merge conflicts. Noted @tailwindcss/typography dependency check needed for react-markdown prose classes.

## Evaluation notes (flywheel)

- Failure modes observed: prerequisites script wrong feature (branch-based); used spec paths directly
- Graders run and results (PASS/FAIL): All tasks have checkbox + ID + story label + file path — format PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): /sp.implement to execute the task list
