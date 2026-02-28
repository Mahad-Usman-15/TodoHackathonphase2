---
id: constitution-004
title: add-phase3-ai-chatbot-constitution
stage: constitution
date: 2026-02-28T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 004-ai-chatbot
branch: main
user: Mahad
command: /sp.constitution
labels: [constitution, phase3, ai-chatbot, mcp, openai-agents, groq, chatkit, minor-bump]
links:
  spec: specs/004-ai-chatbot/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  modified:
    - .specify/memory/constitution.md
tests:
  - Constitution version updated to 1.1.0
  - Phase II content fully preserved — no regressions
  - No remaining bracket tokens in constitution
  - Auth lock (no Better Auth) explicitly encoded as governance constraint
---

## Prompt

/sp.constitution — Phase III: Todo AI Chatbot. Basic Level Functionality.

Objective: Create an AI-powered chatbot interface for managing todos through natural language
using MCP (Model Context Protocol) server architecture and using Claude Code and Spec-Kit Plus.

Technology Stack:
- Frontend: OpenAI ChatKit
- Backend: Python FastAPI
- AI Framework: OpenAI Agents SDK
- MCP Server: Official MCP SDK
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: (confirmed by user — keep existing JWT/bcrypt, no Better Auth)

New DB entities: Conversation (user_id, id, created_at, updated_at),
Message (user_id, id, conversation_id, role, content, created_at).

Chat API: POST /api/{user_id}/chat — stateless endpoint, loads history from DB,
runs OpenAI Agent with MCP tools, streams response via SSE.

MCP Tools: add_task, list_tasks, complete_task, delete_task, update_task.

Update the constitution with Phase III features. Keep Phase II intact.

## Response snapshot

Updated `.specify/memory/constitution.md` from v1.0.2 → v1.1.0 (MINOR bump).

**Changes made:**
- Added Principle 7: MCP Server Standards (5 tools, stateless, stdio transport, user_id validation)
- Added Principle 8: AI Agent Behavior Standards (confirmation, error handling, tool selection rules)
- Expanded Technology Stack with Phase III entries (ChatKit, Agents SDK, Groq, MCP SDK)
- Updated API Conventions: SSE now permitted exclusively for /api/{user_id}/chat
- Added Phase III DB tables to Database Schema Standards (conversations, messages — integer PKs maintained)
- Updated Code Organization with mcp_server.py, chat route, chat UI directories
- Added Phase III MCP Tools Specification table (fixed contract)
- Added Conversation Flow — Stateless Request Cycle section
- Added Phase III Completion Checklist
- Encoded auth lock as governance-level constraint: "Authentication is permanently locked — JWT/bcrypt, no Better Auth"
- Updated Evaluation Rubric: split Working Implementation 30% into Phase II 15% + Phase III 15%
- Added MCP-specific prohibitions to Absolute Prohibitions list
- Updated Deployment Constraints: MCP runs as subprocess in Render backend (no separate service)

**Phase II preserved:** All existing principles, tech stack, success criteria, and security
requirements are fully intact with zero modifications.

## Outcome

- ✅ Impact: Constitution v1.1.0 governs both Phase II (CRUD app) and Phase III (AI chatbot).
  Auth lock permanently encoded. MCP standards, agent behavior, and stateless chat pattern
  all formally specified.
- 🧪 Tests: No bracket tokens remaining. Version 1.1.0 matches report. Dates ISO format. Phase II checklist untouched.
- 📁 Files: 1 file modified (.specify/memory/constitution.md), 1 PHR created.
- 🔁 Next prompts: /sp.specify for 004-ai-chatbot → /sp.clarify → /sp.plan → /sp.tasks → /sp.implement
- 🧠 Reflection: Key insight — SSE prohibition had to be relaxed specifically for the chat endpoint
  while keeping it blocked everywhere else. Auth lock encoded at governance level (not just
  constraints) to prevent future accidental reversal. MCP stdio transport avoids a second Render
  service, keeping Phase III deployable on free tier.

## Evaluation notes (flywheel)

- Failure modes observed: None — clean amendment with no contradictions to Phase II content.
- Graders run and results (PASS/FAIL): Constitution validation PASS (no bracket tokens, ISO dates, version coherent).
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): Run /sp.specify for 004-ai-chatbot to generate the feature spec.
