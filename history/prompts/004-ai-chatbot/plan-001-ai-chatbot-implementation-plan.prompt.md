---
id: plan-001
title: ai-chatbot-implementation-plan
stage: plan
date: 2026-02-28T00:00:00Z
surface: claude-code
model: claude-sonnet-4-6
feature: 004-ai-chatbot
branch: main
user: Mahad
command: /sp.plan
labels: [plan, phase3, ai-chatbot, mcp, groq, openai-agents, chatkit, sse, sqlite]
links:
  spec: specs/004-ai-chatbot/spec.md
  ticket: ~
  adr: ~
  pr: ~
files:
  created:
    - specs/004-ai-chatbot/plan.md
    - specs/004-ai-chatbot/research.md
    - specs/004-ai-chatbot/data-model.md
    - specs/004-ai-chatbot/quickstart.md
    - specs/004-ai-chatbot/contracts/chat-endpoint.yaml
    - specs/004-ai-chatbot/contracts/mcp-tools.yaml
tests:
  - Constitution Check: all 11 gates PASS
  - Research: 8 decisions documented and justified
  - Data model: 2 new tables with correct integer PKs and FK references
  - API contract: 3 endpoints specified (chat, latest-conversation, message-history)
  - MCP contract: 5 tools with parameters, returns, error cases, and agent behavior rules
  - Quickstart: 9 integration scenarios + deployment checklist
---

## Prompt

/sp.plan

Execute the implementation planning workflow for specs/004-ai-chatbot. Generate research.md,
data-model.md, API contracts, quickstart scenarios, and plan.md. Verify constitution compliance.

## Response snapshot

**Phase 0 — Research** (8 decisions documented in research.md):
1. Groq + llama-3.3-70b-versatile as LLM (OpenAI-compatible API, free tier)
2. MCP stdio subprocess transport (no separate deployment)
3. openai-agents SDK with Runner.run() + MCPServerStdio
4. SSE via sse-starlette EventSourceResponse in FastAPI
5. Last 20 messages history window to stay within Groq token limits
6. GET /conversations/latest on page load (clarified Option A: auto-load most recent)
7. Friendly error message in chat on AI failure (clarified Option A)
8. user_id in system prompt to enforce agent tool-call isolation

**Phase 1 — Design** (5 artifacts generated):
- data-model.md: Conversation + Message tables, query patterns, SQLModel code snippets
- contracts/chat-endpoint.yaml: OpenAPI 3.0.3 for POST /chat, GET /latest, GET /messages
- contracts/mcp-tools.yaml: 5 tool definitions with examples, agent system prompt template,
  tool selection intent rules
- quickstart.md: 9 integration test scenarios + production deployment checklist
- plan.md: Implementation plan with 3-chunk parallel execution strategy

**Constitution check**: 11/11 gates PASS.

**New dependencies**:
- Backend: openai-agents, mcp, openai, sse-starlette
- Frontend: @openai/chatkit

## Outcome

- ✅ Impact: Full implementation plan ready for /sp.tasks. All design decisions locked and
  documented. 3-chunk parallel execution strategy defined: DB models (Chunk 0), MCP server
  (Chunk 1), Chat route (Chunk 2), Frontend UI (Chunk 3). Chunks 1+2 run in parallel.
- 🧪 Tests: Constitution check 11/11 PASS. No NEEDS CLARIFICATION remaining. All research
  decisions justified with alternatives considered.
- 📁 Files: 6 files created across plan, research, data-model, quickstart, 2 contracts.
- 🔁 Next prompts: /sp.tasks → generate tasks.md with [P] parallel markers → /sp.implement
- 🧠 Reflection: The biggest implementation risk is MCP subprocess spawning on Render —
  the Python path must be correct. Using absolute path to mcp_server.py in the Render
  environment is critical. The user_id-in-system-prompt pattern is the key security mechanism
  that prevents the agent from calling tools with wrong user_ids.

## Evaluation notes (flywheel)

- Failure modes observed: update-agent-context.ps1 detected wrong branch (1-seo-optimization
  instead of main/004-ai-chatbot) — script is branch-aware but we're on main. CLAUDE.md
  was unchanged (no harmful modification). Deferred agent context update as not blocking.
- Graders run and results (PASS/FAIL): Constitution check PASS (11/11).
- Prompt variant (if applicable): ~
- Next experiment (smallest change to try): Run /sp.tasks to generate the parallel task list.
