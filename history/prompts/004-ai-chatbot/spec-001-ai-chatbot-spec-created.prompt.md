---
id: spec-001
title: ai-chatbot-spec-created
stage: spec
date: 2026-02-28T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 004-ai-chatbot
branch: main
user: Mahad
command: /sp.specify
labels: [spec, phase3, ai-chatbot, mcp, groq, openai-agents, chatkit, natural-language]
links:
  spec: specs/004-ai-chatbot/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  created:
    - specs/004-ai-chatbot/spec.md
    - specs/004-ai-chatbot/checklists/requirements.md
tests:
  - All 16 functional requirements are testable
  - 3 user stories with acceptance scenarios defined
  - 7 success criteria are measurable and technology-agnostic
  - No [NEEDS CLARIFICATION] markers remain
  - Checklist: all 12 items PASS
---

## Prompt

/sp.specify Feature: 004 — Phase 3 AI Chatbot (Todo Manager via Natural Language)

Objective: Add an AI-powered chatbot interface to the existing Taskify SaaS app. Users can manage
their todos through natural language. The chatbot uses MCP tools to perform task operations and
persists conversation history to the database. The server remains stateless — no in-memory session
state.

Technology Stack (LOCKED): OpenAI ChatKit, Python FastAPI (existing), OpenAI Agents SDK, Groq
(llama-3.3-70b-versatile), Official MCP SDK (stdio transport), SQLModel, Neon PostgreSQL, existing
JWT/bcrypt auth (NO CHANGES).

New DB entities: Conversation (id, user_id, title, created_at, updated_at), Message (id,
conversation_id, user_id, role, content, created_at).

Chat API: POST /api/{user_id}/chat — stateless, loads history from DB, runs OpenAI Agent with MCP
tools, streams response via SSE. 5 MCP tools: add_task, list_tasks, complete_task, delete_task,
update_task. All validate user_id.

Frontend: /chat route, OpenAI ChatKit, auth-gated, matches dark theme, nav link from dashboard.

## Response snapshot

Created `specs/004-ai-chatbot/spec.md` with:
- 3 prioritized user stories: P1 (natural language task management), P2 (persistent conversation
  history), P3 (secure auth-gated access)
- 7 acceptance scenarios for P1, 3 for P2, 3 for P3
- 7 edge cases covering: task not found, ambiguous match, empty message, no history on first message
- 16 functional requirements (FR-001 to FR-016) — all testable
- Key entities: Conversation, Message, Task (existing)
- 7 success criteria — all technology-agnostic and measurable
- Assumptions section: auth lock, Groq API key, ChatKit domain key, 20-message history window cap,
  MCP subprocess model
- Out of Scope: voice input, multi-user conversations, chat export, admin analytics

Created `specs/004-ai-chatbot/checklists/requirements.md` — all 12 checklist items PASS.

## Outcome

- ✅ Impact: Single source of truth spec for all Phase 3 AI chatbot work. Covers 3 parallel
  implementation tracks: DB+backend, MCP server, frontend chat UI. Ready for /sp.plan.
- 🧪 Tests: All 12 checklist items PASS. No NEEDS CLARIFICATION markers. All FR testable. All SC
  technology-agnostic.
- 📁 Files: 2 files created (spec.md, checklists/requirements.md). Working on main branch.
- 🔁 Next prompts: /sp.plan → /sp.tasks → /sp.implement (chunks: DB schema, MCP server, chat
  endpoint, frontend chat UI)
- 🧠 Reflection: Spec written as single source of truth — chunks are an execution strategy at the
  tasks level, not separate specs. The 20-message history window cap is a key assumption to document
  to prevent token limit issues with Groq. Auth lock correctly not referenced in spec (it's a
  governance constraint, not a feature requirement).

## Evaluation notes (flywheel)

- Failure modes observed: None — spec generation clean with no ambiguities requiring user input.
- Graders run and results (PASS/FAIL): Checklist validation PASS (all 12 items checked).
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): Run /sp.plan for 004-ai-chatbot to generate research.md,
  data-model.md, and API contracts.
