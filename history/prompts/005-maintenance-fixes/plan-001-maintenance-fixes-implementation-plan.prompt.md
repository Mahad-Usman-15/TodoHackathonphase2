---
id: plan-001
title: maintenance-fixes-implementation-plan
stage: plan
date: 2026-03-02
surface: claude-code
model: claude-sonnet-4-6
feature: 005-maintenance-fixes
branch: main
user: Techno
command: /sp.plan
labels: [plan, maintenance, session, chat, dashboard, accessibility, mobile]
links:
  spec: specs/005-maintenance-fixes/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - specs/005-maintenance-fixes/plan.md
  - specs/005-maintenance-fixes/research.md
  - specs/005-maintenance-fixes/data-model.md
  - specs/005-maintenance-fixes/quickstart.md
  - specs/005-maintenance-fixes/contracts/api-changes.md
tests:
  - none (manual checklist in quickstart.md)
---

## Prompt

/sp.plan (no additional input — planning 005-maintenance-fixes spec)

## Response snapshot

Explored codebase to ground plan in real file paths. Created 5 plan artifacts:

**research.md**: 8 decisions — silent token refresh, Page Visibility API for dashboard sync, react-markdown for chat, typed SSE error events (cold_start/rate_limit/service_error), MCPServerStdio stays per-request, New Chat is client-side reset only, textarea auto-resize via CSS trick, pull-to-refresh custom hook.

**data-model.md**: No schema changes required. conversations.created_at already exists for timestamps.

**contracts/api-changes.md**: 2 changes — new GET /api/health endpoint + enhanced SSE error event with `type` field.

**quickstart.md**: Manual test checklist for all 20 FRs.

**plan.md**: 16 implementation tasks (T1–T16) across backend (2) + frontend core (3) + dashboard (2) + chat (5) + polish (4). Constitution check PASS. 2 new npm packages (react-markdown, remark-gfm). 2 new components (ErrorBoundary, BottomNav).

## Outcome

- ✅ Impact: Full implementation plan for 20 FRs covering session fix, AI reliability, chat UX, dashboard quality, error boundaries, mobile nav, accessibility
- 🧪 Tests: Manual checklist in quickstart.md (16 test scenarios)
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/api-changes.md
- 🔁 Next prompts: /sp.tasks — generate dependency-ordered tasks.md; /sp.implement — execute implementation
- 🧠 Reflection: Key insight: refresh logout is a silent-refresh gap, not an auth architecture issue. Dashboard sync via Page Visibility API avoids all state management complexity. MCPServerStdio stays per-request for resilience.

## Evaluation notes (flywheel)

- Failure modes observed: setup-plan.ps1 uses git branch for feature detection — wrong on main branch; worked around by using spec paths directly
- Graders run and results (PASS/FAIL): Constitution check PASS pre- and post-design; 0 violations
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): /sp.tasks to generate actionable task list
