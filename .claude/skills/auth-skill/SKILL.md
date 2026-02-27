---
name: Auth Skill
description: >
  Provides secure authentication capabilities including signup, signin,
  password hashing, Better Auth integration, and JWT-based identity verification
  for a multi-user web application.
version: 1.0.0
---

# Auth Skill

## Purpose
The Auth Skill encapsulates all authentication-related logic for the system.
It ensures secure user identity handling, token-based authentication, and
proper integration with Better Auth across frontend and backend services.

This skill is security-critical and must be used whenever user identity,
authentication, or authorization is involved.

---

## When to Use This Skill

Use the **Auth Skill** when:
- Implementing user signup or signin flows
- Integrating Better Auth for authentication
- Issuing JWT tokens after successful login
- Verifying JWT tokens on backend API requests
- Extracting authenticated user identity (user ID, email, claims)
- Enforcing access control to user-owned resources

Do **NOT** use this skill for:
- UI rendering
- Database schema design unrelated to authentication
- Business logic unrelated to user identity

---

## Process Steps (Authentication Flow)

1. **Signup**
   - Receive user credentials from frontend
   - Hash password using industry-standard hashing
   - Register user via Better Auth

2. **Signin**
   - Validate user credentials
   - Authenticate user through Better Auth
   - Establish authenticated session

3. **JWT Issuance**
   - Configure Better Auth to issue a JWT
   - Embed user ID, email, and required claims in the token
   - Sign JWT using shared secret

4. **Frontend Usage**
   - Return JWT to frontend
   - Frontend stores token securely
   - Frontend sends JWT in `Authorization: Bearer <token>` header

5. **Backend Verification**
   - Extract JWT from request headers
   - Verify token signature and expiration
   - Decode token to retrieve user identity

6. **Authorization Enforcement**
   - Match authenticated user ID with request context
   - Allow access only to resources owned by that user

---

## Output Format

When this skill is applied, the output should include:

- Authentication flow specification
- JWT token structure (claims included)
- Token verification steps
- Error cases (invalid token, expired token, unauthenticated user)
- Clear handoff instructions for Backend and Frontend Agents

Outputs must be:
- Deterministic
- Secure
- Compatible with FastAPI and Next.js
- Explicit about trust boundaries

---



