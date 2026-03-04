# Quickstart: Testing Maintenance Fixes

**Feature**: `005-maintenance-fixes`

---

## Prerequisites

```bash
# Frontend
cd frontend && npm install   # installs react-markdown, remark-gfm

# Backend
cd backend && pip install -r requirements.txt   # no new deps
```

## Running Locally

```bash
# Terminal 1 — Backend
cd backend && uvicorn main:app --reload --port 8000

# Terminal 2 — Frontend
cd frontend && npm run dev
```

---

## Manual Test Checklist

### Session Persistence (FR-001)
1. Open `http://localhost:3000`, log in
2. Hard-refresh the page (Ctrl+Shift+R)
3. **Expected**: Full-page spinner shown briefly, then dashboard loads without redirect to login
4. Let session expire (wait 15+ min or manually clear access token from memory via DevTools)
5. Refresh again
6. **Expected**: Redirected to `/auth/login` with session-expired message

### AI Warm-Up UX (FR-003, FR-004)
1. Stop the backend (`Ctrl+C`) and wait 5 seconds to simulate cold start
2. Open chat, send a message
3. **Expected**: "warming up" indicator appears in chat (not a raw error)
4. Restart backend, wait for it to be up
5. **Expected**: Next message succeeds within 60 seconds

### Error Type Differentiation (FR-004)
1. Open `backend/routes/chat.py`, temporarily raise `Exception("test")` in `event_stream()`
2. Send a chat message
3. **Expected**: "Something went wrong — please try again." shown; input stays enabled
4. Revert the test exception

### Dashboard Sync After Chat (FR-005)
1. Log in, open dashboard (note current task count)
2. Navigate to `/chat`
3. Ask AI: "Add a new task called Sync Test"
4. Navigate back to `/dashboard`
5. **Expected**: "Sync Test" task appears without manual refresh (triggered by page visibility)

### Markdown Rendering (FR-007)
1. In chat, ask "List my tasks" (AI returns a numbered list)
2. **Expected**: Numbered list renders as `<ol>` HTML, not raw `1. Task name` text

### Textarea Auto-Resize (FR-008)
1. In chat input, paste 5+ lines of text
2. **Expected**: Input box expands vertically to show all lines (up to ~4 lines), then scrolls internally

### New Chat (FR-009)
1. Have a conversation with the AI
2. Click "New Chat"
3. **Expected**: Chat window clears; next message starts fresh (no old messages visible)
4. Verify old conversation still exists via `GET /api/{user_id}/conversations` in DevTools

### Character Counter (FR-010)
1. Paste 1850 characters into chat input
2. **Expected**: Counter shows "1850 / 2000"
3. Continue to 2001 characters
4. **Expected**: Submit button disabled / blocked

### Task Filter Tabs (FR-012)
1. On dashboard, create 2 tasks; complete 1
2. Click "Completed" filter tab
3. **Expected**: Only the completed task shown
4. Click "Pending"
5. **Expected**: Only the incomplete task shown

### Empty State (FR-013)
1. On dashboard, click "Completed" when no tasks are completed
2. **Expected**: Friendly empty state message shown (not a blank list)

### Toast Notifications (FR-014)
1. Create a task → **Expected**: "Task created" toast appears and disappears after ~3s
2. Delete a task → **Expected**: "Task deleted" toast

### Skeleton Screens (FR-015)
1. Throttle network to "Slow 3G" in DevTools
2. Navigate to dashboard
3. **Expected**: Skeleton placeholder cards appear while tasks load

### Error Boundary (FR-016)
1. Temporarily break `api.getTasks()` to throw
2. Navigate to dashboard
3. **Expected**: Error boundary UI shown with "Retry" button; page doesn't crash

### Mobile Bottom Nav (FR-017)
1. Open DevTools, set viewport to 375px (iPhone)
2. **Expected**: Bottom navigation bar visible with Tasks and AI Chat links

### Health Endpoint (keep-alive)
1. `GET http://localhost:8000/api/health`
2. **Expected**: `{ "status": "ok" }` response

---

## Key Files Modified

| File | Change |
|------|--------|
| `frontend/contexts/auth_context.tsx` | Silent token refresh on mount |
| `frontend/app/dashboard/page.tsx` | Visibility refetch, filter tabs, toast wiring |
| `frontend/components/chat/ChatInterface.tsx` | Markdown, textarea resize, char counter, timestamps, typed errors, New Chat |
| `frontend/app/chat/page.tsx` | New Chat button handler |
| `frontend/components/ui/ErrorBoundary.tsx` | New: React error boundary class component |
| `frontend/components/layout/BottomNav.tsx` | New: mobile bottom navigation |
| `frontend/app/layout.tsx` | Add BottomNav, auth loading spinner |
| `frontend/lib/api.ts` | Health ping, typed error propagation |
| `backend/main.py` | `GET /api/health` endpoint, keep-alive interval |
| `backend/routes/chat.py` | Typed SSE error events (cold_start, rate_limit, service_error) |
