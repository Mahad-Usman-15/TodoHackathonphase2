---
name: Frontend Skill
description: >
  Implements the frontend interface using Next.js 16+ App Router.
  Handles user interactions, API calls, JWT token storage, and
  authentication flows for a multi-user Todo application.
version: 1.0.0
---

# Frontend Skill

## Purpose
The Frontend Skill encapsulates all responsibilities for building
a responsive, secure, and user-friendly interface. It manages:
- User interface for Todo app features
- Authentication flows (signup/signin)
- API calls to backend endpoints
- JWT token handling
- Input validation and error display

It ensures that frontend components integrate seamlessly with
Backend and Auth Agents, following spec-driven development.

---

## When to Use This Skill

Use the **Frontend Skill** when:
- Building pages, layouts, and components for the application
- Creating signup/signin forms and login flows
- Sending API requests to the backend
- Storing and including JWT tokens in requests
- Displaying user-specific data (todos, profile info)
- Handling input validation and error messages

Do **NOT** use this skill for:
- Authentication logic (handled by Auth Skill/Agent)
- Database queries or migrations (handled by DB Skill)
- Backend route definitions (handled by Backend Skill)

---

## Process Steps (Frontend Flow)

1. **Authentication Flow**
   - Display signup/signin forms
   - Submit credentials to Auth Agent
   - Receive JWT token upon successful login
   - Store JWT securely (localStorage or HttpOnly cookies)

2. **API Requests**
   - Include JWT in `Authorization: Bearer <token>` header
   - Call backend endpoints via fetch/axios
   - Handle loading states, errors, and responses

3. **Rendering Data**
   - Fetch user-specific todos from backend
   - Render todos in a responsive list
   - Allow user to create, update, and delete todos
   - Ensure UI updates match backend state

4. **Input Validation & Error Handling**
   - Validate form inputs before submission
   - Show clear error messages from backend
   - Prevent unauthorized actions

5. **Integration**
   - Coordinate with Backend Agent for API contract compliance
   - Coordinate with Auth Agent for authentication flows
   - Ensure all UI flows are spec-driven and testable

---

## Output Format

When this skill is applied, the output should include:

- Pages, components, and layouts
- Authentication forms (signup/signin)
- API call logic with JWT token handling
- Error and success handling mechanisms
- Frontend spec aligned with backend API

Outputs must be:
- Deterministic and user-friendly
- Compatible with Next.js 16+ App Router
- Secure (JWT token never exposed improperly)
- Fully aligned with Backend and Auth Agents

---

## Example

### Example Input
```text
Implement the dashboard page where the authenticated user can view and manage their todos.
1. On page load, fetch todos from GET /todos endpoint
   - Include JWT token in Authorization header
2. Display todos in a responsive list with checkboxes and delete buttons
3. Provide form to create new todos
   - Validate input before sending POST /todos request
4. Handle PUT /todos/{id} and DELETE /todos/{id} actions
   - Update UI optimistically or on backend response
5. Show error messages if JWT is invalid or API returns error
6. If JWT is expired, redirect to signin page
