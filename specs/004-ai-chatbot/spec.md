# Feature Specification: Phase 3 — AI Chatbot for Task Management

**Feature Branch**: `main`
**Created**: 2026-02-28
**Status**: Draft
**Feature ID**: 004-ai-chatbot

## Overview

Authenticated Taskify users can manage their tasks through a natural language chat interface. Instead of clicking through a UI, users type messages like "Add a task to buy groceries" or "What's still pending?" and the system responds with confirmations and results. Conversation history is stored in the database so it survives server restarts and page refreshes.

---

## Clarifications

### Session 2026-02-28

- Q: When a user opens /chat, what is the default experience? → A: Auto-load the user's most recent conversation on page open.
- Q: When the AI service (Groq) is down or unreachable, what does the user see? → A: A friendly error message in the chat (e.g., "I'm having trouble responding right now. Please try again in a moment.").

---

## User Scenarios & Testing

### User Story 1 — Natural Language Task Management (Priority: P1)

A logged-in user opens the Chat page and types conversational messages to create, list, complete, delete, and update tasks. The AI assistant understands intent, performs the action using the user's task data, and replies with a friendly confirmation.

**Why this priority**: This is the core feature — everything else is built around this capability. Without it there is no Phase 3.

**Independent Test**: Open the chat page as an authenticated user, type "Add a task to buy groceries", and verify a task is created and the assistant confirms it. Then type "Show me all my tasks" and verify the task appears.

**Acceptance Scenarios**:

1. **Given** a logged-in user on /chat, **When** they type "Add a task to buy groceries", **Then** a new task titled "Buy groceries" is created in their task list and the assistant confirms the creation.
2. **Given** a logged-in user on /chat, **When** they type "Show me all my tasks", **Then** the assistant lists all tasks belonging to that user.
3. **Given** a logged-in user on /chat, **When** they type "Mark task 3 as done", **Then** task ID 3 is marked complete and the assistant confirms.
4. **Given** a logged-in user on /chat, **When** they type "Delete the meeting task", **Then** the assistant finds and deletes the task and confirms deletion.
5. **Given** a logged-in user on /chat, **When** they type "Change task 1 to Call mom tonight", **Then** task 1's title is updated and the assistant confirms.
6. **Given** a logged-in user on /chat, **When** they type "What's still pending?", **Then** the assistant lists only incomplete tasks.
7. **Given** a logged-in user on /chat, **When** they type "What have I completed?", **Then** the assistant lists only completed tasks.

---

### User Story 2 — Persistent Conversation History (Priority: P2)

A logged-in user can close the browser, return to /chat, and see their previous conversation intact. The server does not hold state — all history is read from the database on each request.

**Why this priority**: Without persistence, every session starts blank — the chatbot feels broken and stateless from the user's perspective.

**Independent Test**: Send two messages in a chat session, close and reopen the browser, navigate to /chat, and verify both previous messages and responses are still visible.

**Acceptance Scenarios**:

1. **Given** a user who sent messages in a previous session, **When** they open /chat again, **Then** all previous messages and AI responses are visible in the conversation.
2. **Given** a backend restart, **When** a user opens /chat, **Then** previous conversation history is fully intact (loaded from database, not server memory).
3. **Given** a user with an existing conversation, **When** they send a new message, **Then** the AI response takes prior context into account.

---

### User Story 3 — Secure, Auth-Gated Chat Access (Priority: P3)

Only authenticated users can access the chat interface. Unauthenticated visitors are redirected to login. The AI only operates on tasks belonging to the authenticated user — no cross-user data access is possible.

**Why this priority**: Security is non-negotiable. Without user isolation the chatbot is a data breach vector.

**Independent Test**: Visit /chat without being logged in and verify redirection to /auth/login. Log in as two different users and verify each only sees their own tasks via chat.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** they navigate to /chat, **Then** they are redirected to /auth/login.
2. **Given** a logged-in user on /chat, **When** the AI performs any task operation, **Then** it only reads and modifies tasks belonging to that user.
3. **Given** user A is logged in, **When** the AI lists tasks, **Then** tasks belonging to user B never appear.

---

### Edge Cases

- What happens when the user asks about a task that does not exist? — Assistant responds with a friendly "task not found" message, does not crash.
- What happens when the user's message does not map to any task action? — Assistant responds conversationally and asks for clarification.
- What happens when the AI needs to identify a task by name but multiple tasks match? — Assistant lists the matches and asks the user to specify.
- What happens when a task operation fails (e.g., database error)? — Assistant informs the user the action failed and suggests trying again.
- What happens on the very first message (no conversation history)? — A new conversation is created automatically; no error occurs.
- What happens if the user types only whitespace or an empty message? — The system does not submit or shows a validation hint.
- What happens when the AI service (Groq) is down or rate-limited? — A friendly error message is shown in the chat: "I'm having trouble responding right now. Please try again in a moment." The message the user typed is preserved so they can retry.

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a chat interface at `/chat` accessible only to authenticated users.
- **FR-002**: System MUST redirect unauthenticated users from `/chat` to the login page.
- **FR-003**: System MUST allow users to create a new task by expressing intent in natural language (e.g., "add", "create", "remember").
- **FR-004**: System MUST allow users to list all tasks, pending tasks, or completed tasks by asking in natural language (e.g., "show", "list", "what").
- **FR-005**: System MUST allow users to mark a task as complete by expressing intent in natural language (e.g., "done", "complete", "finished").
- **FR-006**: System MUST allow users to delete a task by expressing intent in natural language (e.g., "delete", "remove", "cancel").
- **FR-007**: System MUST allow users to update a task's title or description by expressing intent in natural language (e.g., "change", "update", "rename").
- **FR-008**: System MUST always respond with a friendly confirmation after performing a task action.
- **FR-009**: System MUST handle errors gracefully — "task not found", DB failures, and AI service unavailability — without crashing or exposing internals. When the AI service is unreachable or returns an error, the system MUST display a friendly message in the chat (e.g., "I'm having trouble responding right now. Please try again in a moment.") instead of a blank response or technical error.
- **FR-010**: System MUST persist every user message and every AI response to the database.
- **FR-011**: System MUST load full conversation history from the database on each chat request so the AI has prior context.
- **FR-012**: System MUST support multiple independent conversations per user. When the user opens /chat, the most recent conversation is loaded automatically. A new conversation is created only when the user has no prior conversations or when the user clicks the "New Conversation" control in the chat interface (which sends the next message without a conversation_id, causing the backend to auto-create a new conversation).
- **FR-013**: System MUST NOT hold any conversation state in server memory — state lives exclusively in the database.
- **FR-014**: System MUST only allow an authenticated user to access their own conversation and task data — no cross-user access.
- **FR-015**: Navigation from the task dashboard to the chat interface MUST be available without requiring logout/login.
- **FR-016**: Chat interface MUST match the existing dark brand theme of the application.

### Key Entities

- **Conversation**: Represents a single chat session. Belongs to one user. Has a created timestamp and optional title. Holds many messages.
- **Message**: A single turn in the conversation. Belongs to one conversation and one user. Has a role (user or assistant), text content, and a timestamp.
- **Task** (existing): The items managed via the chatbot. Each task belongs to one user. The chatbot reads and mutates tasks on the user's behalf.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can send a chat message and receive a task-related response in under 5 seconds.
- **SC-002**: All 5 task operations (create, list, complete, delete, update) are achievable through conversational messages without using the dashboard UI.
- **SC-003**: Conversation history is visible after closing and reopening the browser — 100% of messages persist across sessions.
- **SC-004**: An unauthenticated request to the chat page is redirected to login in 100% of attempts.
- **SC-005**: User A cannot access, see, or modify User B's tasks or conversations via the chat interface — 0% cross-user data leakage.
- **SC-006**: The AI correctly interprets and acts on each of the 8 natural language command patterns defined in the Agent Behavior Specification.
- **SC-007**: The chat interface renders correctly on desktop and mobile screen sizes.

---

## Assumptions

- Users are already registered and logged in via the existing JWT/bcrypt authentication system. No auth changes are made.
- The Groq API key will be obtained from console.groq.com and configured as a backend environment variable before deployment.
- The OpenAI ChatKit domain key will be configured in Vercel environment variables after the frontend domain is added to OpenAI's allowlist.
- Conversation title is optional; if not provided, the system auto-generates one from the first message (or leaves blank).
- Message history sent to the AI is capped at a reasonable recent window (last 20 messages) to avoid exceeding token limits on long conversations.
- The MCP server runs as a subprocess within the backend process — it does not require a separate deployment or network service.
- Task operations performed via chat are identical in effect to those performed via the dashboard UI (same data, same validation rules).

---

## Out of Scope

- Voice input or speech-to-text
- Image or file uploads in chat
- Multi-user or shared conversations
- Real-time collaborative chat
- Push notifications for AI responses
- Admin dashboard for conversation analytics
- Chat export or download
- Deleting or archiving conversations from the UI
- Creating custom AI personas or prompt customization by users
