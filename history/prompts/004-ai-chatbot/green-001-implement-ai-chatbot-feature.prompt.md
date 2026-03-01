---
id: green-001
title: implement-ai-chatbot-feature
stage: green
date: 2026-03-01
surface: claude-code
model: claude-sonnet-4-6
feature: 004-ai-chatbot
branch: main
user: Techno
command: /sp.implement specs/004-ai-chatbot
labels: [implementation, ai-chatbot, mcp, sse, fastapi, nextjs, groq]
links:
  spec: specs/004-ai-chatbot/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - backend/requirements.txt
  - backend/models/conversation.py
  - backend/models/message.py
  - backend/services/chat_service.py
  - backend/mcp_server.py
  - backend/routes/chat.py
  - backend/main.py
  - frontend/package.json
  - frontend/components/chat/ChatInterface.tsx
  - frontend/app/chat/page.tsx
  - frontend/components/dashboard/DashboardHeader.tsx
  - frontend/lib/api.ts
  - specs/004-ai-chatbot/tasks.md
tests:
  - Manual integration via quickstart.md scenarios
  - TypeScript check: PASS (npx tsc --noEmit)
  - Python syntax check: PASS (ast.parse all files)
---

## Prompt

/sp.implement specs/004-ai-chatbot

Implement the AI chatbot feature for the Taskify todo app as specified in specs/004-ai-chatbot/. Follow the tasks.md execution plan across 6 phases.

## Response snapshot

Full implementation of the 004-ai-chatbot feature across all phases:

**Phase 1 (Setup)**: Added `openai-agents>=0.0.14`, `mcp>=1.0.0`, `openai>=1.56.0`, `sse-starlette>=2.1.0` to `backend/requirements.txt`. Added `@openai/chatkit` to `frontend/package.json` (types-only package for web component). Created `backend/models/conversation.py` and `backend/models/message.py` SQLModel tables. Registered both in `main.py` lifespan for auto-creation.

**Phase 2 (Foundational)**: Created `backend/services/chat_service.py` with `load_or_create_conversation()`, `load_history()`, and `save_message()`. Created `backend/mcp_server.py` skeleton with FastMCP and 5 tool stubs.

**Phase 3 (US1 — Core Chat)**: Implemented all 5 MCP tools in `mcp_server.py` (add_task, list_tasks, complete_task, delete_task, update_task). Created `backend/routes/chat.py` with POST /chat SSE endpoint using openai-agents + Groq (llama-3.3-70b-versatile), plus GET /conversations/latest and GET /conversations/{id}/messages. Registered chat router in main.py. Built custom `ChatInterface.tsx` component with SSE handling, message history loading, bounce-dot loading indicator, and "New Chat" button. Created auth-gated `frontend/app/chat/page.tsx` that loads latest conversation on mount.

**Phase 4 (US2 — Persistence)**: All persistence wired in Phase 3 implementation — POST /chat saves user+assistant messages, GET /latest loads latest conversation, GET /messages loads history, frontend calls these on mount.

**Phase 5 (US3 — Auth Security)**: Auth guard in chat/page.tsx redirects unauthenticated users to /auth/login. `_enforce_user()` in all 3 backend endpoints raises 403 on user_id mismatch. Added "AI Chat" nav link (with chat icon) to DashboardHeader with active state highlighting.

**Key architectural decision**: `@openai/chatkit` is a CDN web component package (types-only npm package). Built custom React chat UI instead, which matches our SSE-based backend and dark brand theme perfectly. The ChatKit web component requires their hosted infrastructure and doesn't support custom backends directly.

## Outcome

- ✅ Impact: Full AI chatbot feature implemented — users can manage tasks via natural language, conversation history persists to DB, /chat is auth-gated with nav link from dashboard
- 🧪 Tests: TypeScript check PASS, Python syntax check PASS. Manual integration tests via quickstart.md scenarios required with GROQ_API_KEY set.
- 📁 Files: 12 files created/modified across backend models, services, routes, MCP server, and frontend components
- 🔁 Next prompts: Set GROQ_API_KEY on Render (T025), add NEXT_PUBLIC_OPENAI_DOMAIN_KEY to Vercel (T026 — optional with custom UI), verify production (T028), ensure mcp_server.py deploys on Render (T029)
- 🧠 Reflection: The @openai/chatkit npm package turned out to be a type-declarations-only package for a CDN web component, not a React component. Building a custom chat UI was the correct pragmatic choice — it gave full control over SSE parsing and brand theming.

## Evaluation notes (flywheel)

- Failure modes observed: @openai/chatkit is not a React component — it's a CDN web component with type declarations. The domainKey approach is for OpenAI's hosted infrastructure. Addressed by building a custom SSE-capable chat UI.
- Graders run and results (PASS/FAIL): TypeScript PASS, Python syntax PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test with actual GROQ_API_KEY to verify full agent loop + MCP subprocess works end-to-end
