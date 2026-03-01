# Tasks: 004 — AI Chatbot for Task Management

**Input**: Design documents from `specs/004-ai-chatbot/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ ✅ | quickstart.md ✅

**Organization**: Tasks grouped by user story (US1=Natural Language Chat, US2=Conversation Persistence, US3=Auth Security)

**No test tasks** — not requested in spec; manual integration scenarios in quickstart.md serve as acceptance tests.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Maps to user story (US1, US2, US3)

---

## Phase 1: Setup (Chunk 0 — Blocking Foundation)

**Purpose**: New dependencies + new DB models. MUST complete before any user story work.

**⚠️ CRITICAL**: All user story phases depend on these tasks completing first.

- [X] T001 Add `openai-agents>=0.0.14`, `mcp>=1.0.0`, `openai>=1.56.0`, `sse-starlette>=2.1.0` to `backend/requirements.txt`
- [X] T002 Add `"@openai/chatkit": "latest"` to `frontend/package.json` and run `npm install` in `frontend/`
- [X] T003 [P] Create `backend/models/conversation.py` with `Conversation` (id int PK, user_id int FK→user.id CASCADE, title Optional[str] max 200, created_at, updated_at) and `ConversationRead` SQLModel classes — follow exact pattern from `backend/models/task.py`
- [X] T004 [P] Create `backend/models/message.py` with `Message` (id int PK, conversation_id int FK→conversation.id CASCADE index, user_id int FK→user.id CASCADE index, role str NOT NULL, content str NOT NULL, created_at) and `MessageRead` SQLModel classes — follow pattern from `backend/models/task.py`
- [X] T005 Update `backend/main.py` lifespan context manager to import `Conversation` from `models.conversation` and `Message` from `models.message` alongside existing User and Task imports, so `SQLModel.metadata.create_all(engine)` auto-creates the new tables on startup

**Checkpoint**: New DB tables created. Backend starts without errors. `GET /health` still returns `{"status": "ok"}`.

---

## Phase 2: Foundational (Shared Services — Blocking All User Stories)

**Purpose**: Shared service layer and MCP server skeleton that all user story phases depend on.

**⚠️ CRITICAL**: Phases 3–5 cannot begin until Phase 2 is complete.

- [X] T006 Create `backend/services/chat_service.py` with three functions: `load_or_create_conversation(session, user_id, conversation_id=None) -> Conversation` (loads existing by id if provided, else fetches latest by user_id ordered by updated_at DESC, else creates new Conversation row), `load_history(session, conversation_id, limit=20) -> list[dict]` (queries last `limit` Message rows for conversation_id ordered by created_at ASC, returns list of `{"role": msg.role, "content": msg.content}` dicts), `save_message(session, conversation_id, user_id, role, content) -> Message` (inserts new Message row and commits)
- [X] T007 Create `backend/mcp_server.py` with `FastMCP("taskify-mcp")` server skeleton: import `FastMCP` from `mcp.server.fastmcp`, import `Session` + `select` from `sqlmodel`, import `engine` from `db`, import `Task` from `models.task`, define a `get_db_session()` context helper, add `if __name__ == "__main__": mcp.run()` at the bottom — leave 5 tool function stubs (`add_task`, `list_tasks`, `complete_task`, `delete_task`, `update_task`) decorated with `@mcp.tool()` that each raise `NotImplementedError` until implemented in Phase 3

**Checkpoint**: `python backend/mcp_server.py` starts without import errors and exits cleanly.

---

## Phase 3: User Story 1 — Natural Language Task Management (Priority: P1) 🎯 MVP

**Goal**: User sends a chat message, the AI agent calls the appropriate MCP tool, and the user receives a friendly confirmation response streamed back in real time.

**Independent Test**: Run `POST /api/{user_id}/chat` with `{"message": "Add a task to buy groceries"}`. Verify: (a) SSE stream returns a done event with a friendly response text, (b) task "Buy groceries" appears in `GET /api/{user_id}/tasks`, (c) message and response are saved in the `message` table.

### MCP Tool Implementations (T008–T012 — same file, implement one at a time)

- [X] T008 [US1] Implement `add_task(user_id: str, title: str, description: str = "") -> dict` tool in `backend/mcp_server.py`: cast `int(user_id)`, open DB session, create and commit new `Task(user_id=uid, title=title, description=description or None)`, return `{"task_id": task.id, "status": "created", "title": task.title}` — raise `ValueError("Unauthorized")` if user_id is invalid
- [X] T009 [US1] Implement `list_tasks(user_id: str, status: str = "all") -> list` tool in `backend/mcp_server.py`: cast `int(user_id)`, open DB session, query `Task` rows filtered by `user_id`; if `status=="pending"` add `where completed==False`; if `status=="completed"` add `where completed==True`; return list of `{"id": t.id, "title": t.title, "description": t.description, "completed": t.completed}` dicts
- [X] T010 [US1] Implement `complete_task(user_id: str, task_id: int) -> dict` tool in `backend/mcp_server.py`: cast `int(user_id)`, open DB session, fetch Task by id AND user_id, raise `ValueError(f"Task {task_id} not found")` if missing, set `task.completed = True` + `task.updated_at = datetime.utcnow()`, commit, return `{"task_id": task.id, "status": "completed", "title": task.title}`
- [X] T011 [US1] Implement `delete_task(user_id: str, task_id: int) -> dict` tool in `backend/mcp_server.py`: cast `int(user_id)`, open DB session, fetch Task by id AND user_id, store title, raise `ValueError(f"Task {task_id} not found")` if missing, `session.delete(task)`, commit, return `{"task_id": task_id, "status": "deleted", "title": stored_title}`
- [X] T012 [US1] Implement `update_task(user_id: str, task_id: int, title: str = None, description: str = None) -> dict` tool in `backend/mcp_server.py`: cast `int(user_id)`, open DB session, fetch Task by id AND user_id, raise `ValueError(f"Task {task_id} not found")` if missing, raise `ValueError("At least one field required")` if both title and description are None, update provided fields + `task.updated_at = datetime.utcnow()`, commit, return `{"task_id": task.id, "status": "updated", "title": task.title}`

### Chat Endpoint + Agent Integration

- [X] T013 [US1] Create `backend/routes/chat.py` with: (1) `ChatRequest` Pydantic model `{conversation_id: Optional[int], message: str}`, (2) `SYSTEM_PROMPT` constant with the template from `contracts/mcp-tools.yaml` (includes `user_id` placeholder), (3) configure Groq client `AsyncOpenAI(api_key=os.getenv("GROQ_API_KEY"), base_url="https://api.groq.com/openai/v1")`, (4) `POST /{user_id}/chat` endpoint with `Depends(get_current_user)` that builds an `Agent` with `model="groq/llama-3.3-70b-versatile"` (or equivalent openai-agents Groq model string), connects `MCPServerStdio(params={"command": "python", "args": ["backend/mcp_server.py"]})`, runs agent with message history, streams response via `EventSourceResponse` from `sse_starlette.sse`, emits `{"type": "done", "conversation_id": conv_id, "response": text, "tool_calls": [...]}` as final SSE event; wrap entire agent call in try/except to emit `{"type": "error", "error": "I'm having trouble responding right now. Please try again in a moment."}` on failure
- [X] T014 [US1] Register the chat router in `backend/main.py`: add `from routes.chat import router as chat_router` and `app.include_router(chat_router, prefix="/api")` after the existing tasks router registration
- [X] T015 [US1] Create `frontend/components/chat/ChatInterface.tsx` as a `"use client"` component: import `ChatKit` (or the equivalent main component) from `@openai/chatkit`, configure it with `domainKey={process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY}`, pass a custom `onSend` handler that calls `POST /api/{user_id}/chat` via the existing `api` client (or fetch with Authorization header), render the ChatKit component with `className` matching the dark brand theme (bg-brand-bg border-brand-primary/20)
- [X] T016 [US1] Create `frontend/app/chat/page.tsx` as a server component (no `"use client"`): export default `ChatPage` that renders `<ChatInterface />` inside a full-height dark container matching the dashboard layout; add `export const metadata = { title: "AI Chat | Taskify", description: "Manage your tasks through natural language" }` — **scaffold only**: T020 converts this to a client component (or adds a client wrapper) when wiring up conversation persistence

**Checkpoint**: `POST /api/{user_id}/chat {"message": "Add buy groceries"}` returns SSE stream. Task is created. Response confirms creation. Chat page renders at `/chat`.

---

## Phase 4: User Story 2 — Persistent Conversation History (Priority: P2)

**Goal**: User opens /chat and sees their previous conversation intact. Message history loads from DB. Server restart does not lose any messages.

**Independent Test**: Send 3 messages via POST /chat, kill and restart the backend, open /chat, verify all 3 user messages and AI responses are visible.

- [X] T017 [US2] Add `GET /{user_id}/conversations/latest` endpoint in `backend/routes/chat.py`: requires `Depends(get_current_user)`, validates `current_user.id == user_id`, queries `Conversation` table for `user_id` ordered by `updated_at DESC LIMIT 1`, returns `{"conversation_id": conv.id, "title": conv.title, "created_at": conv.created_at.isoformat()}` or `{"conversation_id": null}` if none exists
- [X] T018 [US2] Add `GET /{user_id}/conversations/{conversation_id}/messages` endpoint in `backend/routes/chat.py`: requires `Depends(get_current_user)`, validates `current_user.id == user_id`, fetches Conversation by id + user_id (404 if not found), queries last 20 Message rows for `conversation_id` ordered by `created_at ASC`, returns list of `MessageRead` objects (id, role, content, created_at)
- [X] T019 [US2] Update `backend/routes/chat.py` POST chat handler to: (a) call `load_or_create_conversation(session, user_id, req.conversation_id)` from chat_service before running agent, (b) call `save_message(session, conv.id, user_id, "user", req.message)` before agent run, (c) call `save_message(session, conv.id, user_id, "assistant", response_text)` after agent run, (d) update `conv.updated_at = datetime.utcnow()` and commit
- [X] T020 [US2] Update `frontend/app/chat/page.tsx` to call `GET /api/{user_id}/conversations/latest` on component mount (use `useEffect` — convert page to client component or create a `ChatPageClient.tsx` client wrapper), store `conversationId` in state, pass it as `conversationId` prop to `ChatInterface`, include it in every subsequent `POST /api/{user_id}/chat` request body as `conversation_id`
- [X] T021 [US2] Update `frontend/components/chat/ChatInterface.tsx` to: (a) accept `conversationId?: number` prop, (b) call `GET /api/{user_id}/conversations/{conversationId}/messages` on mount when conversationId is set, (c) display returned messages in the chat history before any new messages, (d) show a loading skeleton while history is fetching

**Checkpoint**: Close browser after 3 messages. Reopen /chat. All previous messages visible. New message continues the same conversation.

---

## Phase 5: User Story 3 — Secure Auth-Gated Access (Priority: P3)

**Goal**: Unauthenticated users are redirected to /auth/login. AI only touches the authenticated user's data. /chat is accessible from the dashboard navigation.

**Independent Test**: (a) Open /chat in a private window (no cookies) — verify redirect to /auth/login. (b) Log in as two different users and verify each sees only their own tasks via chat. (c) Dashboard shows a working /chat navigation link.

- [X] T022 [US3] Add auth guard to `frontend/app/chat/page.tsx` (or the client wrapper from T020): check for the access token in memory (use the same auth check pattern as `frontend/app/dashboard/page.tsx`); if not authenticated, call `router.push("/auth/login")`; show a loading state while auth is being verified to prevent flash of chat UI
- [X] T023 [US3] Add user_id path-param authorization check in `backend/routes/chat.py` for ALL three endpoints (POST /chat, GET /latest, GET /messages): after `Depends(get_current_user)`, verify `current_user.id == user_id`; raise `HTTPException(status_code=403, detail="Access forbidden")` if they differ — this prevents one user from accessing another user's chat via URL manipulation
- [X] T024 [US3] Add a "Chat" navigation link to the dashboard header or sidebar in `frontend/app/dashboard/` layout or page component: find the existing nav element (check `frontend/app/dashboard/page.tsx` and `frontend/components/` for the header), add an `<Link href="/chat">` with an appropriate chat icon or label, styled consistently with the existing dark brand theme (use `brand-primary` accent on hover)
- [X] T030 [US1] Add "New Conversation" button to `frontend/components/chat/ChatInterface.tsx`: render a visible "New Chat" icon-button in the chat header area; on click, call an `onNewConversation()` callback prop; in `frontend/app/chat/page.tsx` (or the ChatPageClient.tsx client wrapper from T020), implement `onNewConversation` to clear `conversationId` state and reset the displayed message list — the next `POST /api/{user_id}/chat` sent without `conversation_id` will auto-create a new conversation via the existing `load_or_create_conversation` backend logic (no new endpoint required)

**Checkpoint**: Unauthenticated visit to /chat → redirected to /auth/login. Authenticated user sees /chat from dashboard nav. 403 returned for mismatched user_id. "New Chat" button starts a fresh conversation without page reload.

---

## Phase 6: Polish & Deployment

**Purpose**: Environment configuration and cross-cutting quality concerns.

- [ ] T025 Add `GROQ_API_KEY` environment variable to the Render backend service (obtain free key from console.groq.com): navigate to Render dashboard → todo-hackathon-backend → Environment → add `GROQ_API_KEY=gsk_...` → save (triggers auto-redeploy)
- [ ] T026 Add `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` environment variable to the Vercel frontend project: navigate to Vercel dashboard → taskify-ainative → Settings → Environment Variables → add `NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-...` → redeploy
- [ ] T027 Add `taskify-ainative.vercel.app` to OpenAI platform domain allowlist: navigate to `https://platform.openai.com/settings/organization/security/domain-allowlist` → Add domain → enter `https://taskify-ainative.vercel.app` → save → copy the domain key for T026
- [ ] T028 Verify all 9 integration scenarios from `specs/004-ai-chatbot/quickstart.md` pass against the production deployment (frontend at taskify-ainative.vercel.app, backend at todo-hackathon-backend-17q8.onrender.com)
- [ ] T029 Add `backend/mcp_server.py` to Render deployment: ensure the file is committed to `main` branch and the Render service has access to it; verify MCP subprocess spawning works in the Render environment by checking backend logs after first chat message

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Requires Phase 1 complete (T001–T005 done)
- **Phase 3 (US1 — P1)**: Requires Phase 2 complete (T006–T007 done)
- **Phase 4 (US2 — P2)**: Requires Phase 3 complete — adds persistence layer on top of working chat
- **Phase 5 (US3 — P3)**: Requires Phase 3 complete — adds security layer; can run in parallel with Phase 4
- **Phase 6 (Polish)**: Requires Phases 3–5 complete

### User Story Dependencies

- **US1 (P1)**: Foundational → US1 (core feature, enables everything else)
- **US2 (P2)**: US1 → US2 (chat must work before persistence UI can be tested)
- **US3 (P3)**: US1 → US3 (chat must exist before auth guard can be applied); can parallelize with US2

### Within Phase 3 (US1)

- T008–T012 [P]: MCP tools are independent functions in the same file — write all 5 before testing any (they're stubs replaced from T007)
- T013 depends on: T006 (chat_service), T007 (mcp_server skeleton), T008–T012 (all 5 tools implemented)
- T014 depends on: T013
- T015 and T016 depend on: T002 (npm install done) — can run in parallel with T013

### Parallel Opportunities

- **T003 + T004**: Both model files are independent — run in parallel
- **T008 → T009 → T010 → T011 → T012**: All 5 MCP tools are logically independent functions but MUST be implemented one at a time (same `mcp_server.py` file) — complete each function before starting the next
- **T013 (backend) + T015+T016 (frontend)**: Backend chat endpoint and frontend UI can be built in parallel; test together after both done
- **T017 + T018**: Both new GET endpoints in the same router file — independent implementations
- **T022 + T023 + T024 (US3)**: Can run in parallel with T020 + T021 (US2) after US1 is complete

---

## Parallel Execution Examples

```bash
# Phase 1 — run these together:
Task T003: "Create backend/models/conversation.py"
Task T004: "Create backend/models/message.py"

# Phase 3 — MCP tools: implement sequentially (same file, no parallelism):
Task T008 → T009 → T010 → T011 → T012  (one at a time in backend/mcp_server.py)

# Phase 3 — backend + frontend together (after T008–T012 done):
Task T013: "Create backend/routes/chat.py chat endpoint"
Task T015: "Create frontend/components/chat/ChatInterface.tsx"
Task T016: "Create frontend/app/chat/page.tsx"

# Phases 4 + 5 — after Phase 3 complete, these can all run together:
Task T017: "GET /conversations/latest endpoint"
Task T018: "GET /conversations/{id}/messages endpoint"
Task T022: "Auth guard on /chat page"
Task T023: "User_id authorization check in all chat endpoints"
Task T024: "Dashboard nav link to /chat"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T007)
3. Complete Phase 3: US1 (T008–T016)
4. **STOP and VALIDATE**: `POST /api/{user_id}/chat {"message": "Add a task to buy milk"}` works end-to-end
5. Demo the core chatbot — task created, AI responds, SSE streams correctly

### Incremental Delivery

1. Phases 1–2: Foundation → `python mcp_server.py` works, DB tables created
2. Phase 3 (US1): Core chat → MVP demo-able. Send any natural language message, AI responds with tool action.
3. Phase 4 (US2): Persistence → Conversations survive restarts. History loads on page open.
4. Phase 5 (US3): Security → Auth guard, user isolation, nav link.
5. Phase 6: Polish → GROQ_API_KEY on Render, ChatKit domain key on Vercel, production verified.

### Parallel Team Strategy (if splitting work)

With two developers after Phase 2 complete:
- **Dev A**: US1 backend (T008–T015) — MCP tools + chat endpoint
- **Dev B**: US1 frontend + US3 (T015–T016, T022–T024) — ChatKit UI + auth guard
- Sync: Integrate after T013 and T015 are both done to test end-to-end

---

## Task Summary

| Phase | Tasks | Count | Parallelizable |
|-------|-------|-------|---------------|
| Phase 1: Setup | T001–T005 | 5 | T003, T004 [P] |
| Phase 2: Foundational | T006–T007 | 2 | — |
| Phase 3: US1 (P1) | T008–T016 | 9 | T015–T016 [P] (T008–T012 sequential — same file) |
| Phase 4: US2 (P2) | T017–T021 | 5 | T017–T018 [P] |
| Phase 5: US3 (P3) | T022–T024, T030 | 4 | T022–T024 [P] |
| Phase 6: Polish | T025–T029 | 5 | T025–T027 [P] |
| **Total** | | **30** | **9 parallelizable** |

### MVP Scope: Phases 1–3 (T001–T016, 16 tasks)

---

## Notes

- [P] tasks = different files or independent functions, no dependencies on incomplete tasks
- [Story] label maps each task to its user story for traceability
- Each task description is self-contained — an LLM can execute it without additional context
- Commit after each phase checkpoint (or after each logical task group)
- T008–T012 all modify the same `mcp_server.py` file — implement strictly sequentially; the [P] marker was removed from these tasks
- The MCP subprocess path `["python", "backend/mcp_server.py"]` assumes execution from repo root — adjust if running from `backend/` directory
- openai-agents model string for Groq: use `"groq/llama-3.3-70b-versatile"` if using the built-in provider, or configure custom `AsyncOpenAI` client per research.md Decision 3
