# Quickstart & Integration Scenarios: 004 — AI Chatbot

**Phase**: 1 — Design
**Date**: 2026-02-28

---

## Environment Setup

### Backend
```bash
# Add to backend/.env
GROQ_API_KEY=gsk_...          # From console.groq.com
DATABASE_URL=postgresql://...  # Existing (unchanged)
AUTH_SECRET=...                # Existing (unchanged)
CORS_ALLOWED_ORIGINS=https://taskify-ainative.vercel.app,http://localhost:3000
```

### Frontend
```bash
# Add to frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000           # Existing
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=dk-...               # From OpenAI platform allowlist
```

### Install new dependencies
```bash
# Backend
cd backend
pip install openai-agents mcp sse-starlette openai

# Frontend
cd frontend
npm install @openai/chatkit
```

---

## Integration Scenarios (Manual Test Plan)

### Scenario 1: First-Time Chat User

**Setup**: A registered user has never used /chat before.

**Steps**:
1. Log in → navigate to /chat
2. GET `/api/{user_id}/conversations/latest` returns `{"conversation_id": null}`
3. User types: "Add a task to buy groceries"
4. POST `/api/{user_id}/chat` with `{message: "Add a task to buy groceries"}`
5. A new conversation is created (conversation_id = X)
6. SSE stream returns incremental text, then done event
7. Task "Buy groceries" appears in dashboard

**Expected**: Conversation created, task created, AI confirms with friendly message.

---

### Scenario 2: Continue Existing Conversation

**Setup**: User has an existing conversation with 5 messages.

**Steps**:
1. User opens /chat → GET latest returns `conversation_id: 7`
2. GET `/api/{user_id}/conversations/7/messages` → 5 messages displayed
3. User types: "What's still pending?"
4. POST `/api/{user_id}/chat` with `{conversation_id: 7, message: "What's still pending?"}`
5. AI loads history (5 msgs), calls `list_tasks(user_id="42", status="pending")`
6. SSE stream returns list of pending tasks

**Expected**: History preserved, agent has context of prior conversation.

---

### Scenario 3: Delete Task by Name

**Setup**: User has tasks including "Buy groceries" (id=15) and "Buy milk" (id=16).

**Steps**:
1. User types: "Delete the buy task"
2. Agent calls `list_tasks` first (gets all tasks)
3. Agent sees two tasks starting with "buy" — responds listing both and asks which one
4. User types: "Delete the groceries one"
5. Agent calls `delete_task(user_id="42", task_id=15)`
6. AI confirms deletion

**Expected**: Agent does not guess — lists matches and confirms before deleting.

---

### Scenario 4: Complete Task by ID

**Setup**: User knows task ID 3 should be marked done.

**Steps**:
1. User types: "Mark task 3 as done"
2. Agent calls `complete_task(user_id="42", task_id=3)`
3. SSE stream: "I've marked 'Call mom' as complete!"

**Expected**: Direct tool call, no list_tasks needed when ID is explicit.

---

### Scenario 5: Update Task Title

**Steps**:
1. User types: "Change task 1 to Call mom tonight"
2. Agent calls `update_task(user_id="42", task_id=1, title="Call mom tonight")`
3. SSE stream: "Done! I've updated the task to 'Call mom tonight'."

**Expected**: Task title updated, confirmed with new title.

---

### Scenario 6: Unauthenticated Access

**Steps**:
1. Clear cookies / open private window
2. Navigate to /chat
3. Expect immediate redirect to /auth/login (no flash of chat UI)

**Expected**: 100% redirect, no chat content visible without auth.

---

### Scenario 7: AI Service Down (Groq Unavailable)

**Steps**:
1. Set `GROQ_API_KEY` to an invalid value
2. User types a message
3. Backend catches the Groq API error
4. SSE stream returns: `data: {"error": "I'm having trouble responding right now. Please try again in a moment.", "type": "error"}`
5. Frontend displays error message in chat UI

**Expected**: Friendly error shown, app does not crash, user can retry.

---

### Scenario 8: Server Restart — History Preserved

**Steps**:
1. Send 3 messages in a conversation
2. Restart the backend server (`uvicorn` restart)
3. User refreshes /chat
4. GET latest conversation → same conversation_id
5. GET messages → all 3 messages + responses visible

**Expected**: 100% persistence — server memory loss has zero impact.

---

### Scenario 9: Cross-User Isolation

**Setup**: User A (id=1), User B (id=2), each logged in separately.

**Steps**:
1. User A creates task "Secret project"
2. User B types: "Show me all tasks" (authenticated as user_id=2)
3. `list_tasks(user_id="2")` returns only user B's tasks
4. "Secret project" never appears

**Expected**: 0% cross-user data leakage.

---

## Local Development Flow

```bash
# Terminal 1: Backend
cd backend
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: http://localhost:3000
# 1. Register/login
# 2. Navigate to /chat
# 3. Send a message
# 4. Verify task appears in /dashboard
```

---

## Production Deployment Checklist

- [ ] `GROQ_API_KEY` added to Render environment variables
- [ ] `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` added to Vercel environment variables
- [ ] `taskify-ainative.vercel.app` added to OpenAI platform domain allowlist
  - URL: https://platform.openai.com/settings/organization/security/domain-allowlist
- [ ] Backend `requirements.txt` updated with `openai-agents`, `mcp`, `sse-starlette`, `openai`
- [ ] Frontend `package.json` updated with `@openai/chatkit`
- [ ] Render auto-deploys on `main` branch push
- [ ] Vercel auto-deploys on `main` branch push
- [ ] Test all 9 integration scenarios after deploy
