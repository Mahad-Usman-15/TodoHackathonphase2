---
id: plan-001
title: task-crud-implementation-plan
stage: plan
date: 2026-02-26
surface: claude-code
model: claude-sonnet-4-6
feature: 002-task-crud
branch: master
user: Techno
command: /sp.plan
labels: [plan, task-crud, phase-2, fastapi, nextjs, sqlmodel]
links:
  spec: specs/002-task-crud/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/002-task-crud/plan.md
  - specs/002-task-crud/research.md
  - specs/002-task-crud/data-model.md
  - specs/002-task-crud/quickstart.md
  - specs/002-task-crud/contracts/tasks-api.md
tests:
  - N/A
---

## Prompt

/sp.plan — Generate implementation plan for 002-task-crud (Phase 2 Task CRUD Real Product Integration) based on spec.md and clarifications.

## Response snapshot

Inspected existing codebase (backend/main.py, models/user.py, middleware/auth_middleware.py, routes/auth.py, frontend/lib/api.ts, frontend/app/dashboard/page.tsx) to understand Phase 1 foundation.

Key findings:
- Auth uses HTTP-only cookie (`access_token`), NOT Bearer header — get_current_user reads from cookie
- Dashboard page is a placeholder ready for task integration
- URL pattern: /api/{user_id}/tasks (integer user_id)
- No new dependencies needed

Phase 0 (Research): Resolved all unknowns — cookie auth inheritance, 404 for cross-user (not 403), newest-first sort, toast errors, confirm dialog for delete, no new libraries.

Phase 1 (Design):
- data-model.md: Task entity with 7 fields (id, title, description, completed, created_at, updated_at, user_id), TaskCreate/Update/Read schemas, cascade delete on user_id FK
- contracts/tasks-api.md: 6 endpoints (GET list, POST, GET single, PUT, DELETE, PATCH toggle) with full request/response examples
- quickstart.md: development order, verification checklist, env vars
- plan.md: 4 backend steps (model → service → routes → main.py), 8 frontend steps (api.ts → Toast → TaskForm → DeleteConfirm → EditModal → TaskItem → TaskList → dashboard)

Constitution check: All 11 gates PASS.

## Outcome

- ✅ Impact: Complete implementation blueprint ready; no clarifications needed; all architecture decisions documented
- 🧪 Tests: N/A (planning phase)
- 📁 Files: specs/002-task-crud/plan.md, research.md, data-model.md, quickstart.md, contracts/tasks-api.md
- 🔁 Next prompts: `/sp.tasks` to generate task breakdown, then implement
- 🧠 Reflection: Phase 1 codebase inspection was essential — auth uses cookies not Bearer, which directly affects how task routes are protected. Plan aligns with existing patterns exactly.

## Evaluation notes (flywheel)

- Failure modes observed: setup-plan.ps1 resolves feature from branch name (picks wrong feature on master); worked around by using direct paths
- Graders run and results (PASS/FAIL): Constitution check — 11/11 PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.tasks to generate ordered task list
