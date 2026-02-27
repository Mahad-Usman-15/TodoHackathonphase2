---
name: Backend Skill
description: >
  Implements backend RESTful APIs, business logic, and data access
  using FastAPI and SQLModel. Handles route definitions, request validation,
  database interaction, and integration with Auth and DB skills.
version: 1.0.0
---

# Backend Skill

## Purpose
The Backend Skill encapsulates all server-side responsibilities, including:
- RESTful API creation
- Business logic implementation
- Database interaction through SQLModel
- Authentication and authorization enforcement
- Response formatting and error handling

It ensures that backend logic is spec-driven, secure, and aligned with
frontend requirements.

---

## When to Use This Skill

Use the **Backend Skill** when:
- Creating RESTful API endpoints for application features
- Validating requests and user input
- Querying or updating the database via SQLModel
- Enforcing authentication and authorization
- Formatting JSON responses for the frontend

Do **NOT** use this skill for:
- Frontend UI implementation
- Database schema design (handled by DB Skill)
- Authentication logic (handled by Auth Skill)
- Migration management (handled by DB Skill)

---

## Process Steps (Backend Flow)

1. **Route Definition**
   - Define endpoints per spec (e.g., `/todos`, `/users`)
   - Use appropriate HTTP methods (GET, POST, PUT, DELETE)

2. **Request Validation**
   - Validate incoming JSON or query parameters
   - Apply Pydantic models to ensure type safety
   - Reject invalid requests with proper error codes

3. **Authentication & Authorization**
   - Extract JWT from `Authorization` header
   - Use Auth Skill to validate token and retrieve user ID
   - Enforce access control (e.g., users can only access their own todos)

4. **Database Interaction**
   - Use SQLModel models for querying and updating Neon PostgreSQL
   - Apply filtering by user ID for multi-user isolation
   - Handle transactional operations safely

5. **Response Construction**
   - Format responses as JSON
   - Include relevant metadata (timestamps, status codes)
   - Handle errors gracefully

6. **Integration**
   - Coordinate with Frontend Agent for input/output contracts
   - Coordinate with DB Agent for model usage and migrations
   - Coordinate with Auth Agent for secure access enforcement

---

## Output Format

When this skill is applied, the output should include:

- Route specifications (URL, HTTP method, expected request/response)
- SQLModel query examples
- Request validation logic
- Authentication/authorization steps
- Error handling and response formats

Outputs must be:
- Deterministic and secure
- Fully spec-aligned with the frontend
- Compatible with multi-user data isolation
- Ready for automatic code generation via Claude Code

---

## Example

### Example Input
```text
Create API endpoints for managing todos.
Each authenticated user can create, read, update, and delete their own todos.
Endpoint: GET /todos
- Validate JWT token from Authorization header
- Decode user_id from token
- Query todos table where todos.user_id == user_id
- Return list of todos as JSON

Endpoint: POST /todos
- Validate JWT token and request body (title, completed)
- Decode user_id from token
- Insert new todo with user_id
- Return created todo with status code 201

Endpoint: PUT /todos/{id}
- Validate JWT token and request body
- Check todo belongs to user_id
- Update todo fields
- Return updated todo

Endpoint: DELETE /todos/{id}
- Validate JWT token
- Check todo belongs to user_id
- Delete todo
- Return status code 204
