# Implementation Plan: Authentication & Live Integration

**Branch**: `001-auth-integration` | **Date**: 2026-02-19 | **Spec**: [specs/001-auth-integration/spec.md](specs/001-auth-integration/spec.md)
**Input**: Feature specification from `/specs/001-auth-integration/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This plan outlines the implementation roadmap for Phase 1: Authentication & Live Integration. The primary goal is to establish a fully integrated authentication foundation for the Todo Full-Stack Web Application, ensuring end-to-end functionality from Day 1. This involves setting up secure JWT-based authentication using HTTP-only cookies, configuring FastAPI for backend services, and integrating a Next.js frontend, all connecting to a Neon Serverless PostgreSQL database.

## Technical Context

**Language/Version**: Python 3.9+ (Backend), Node.js 18+ (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Next.js, React, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL
**Testing**: Pytest (Backend), Playwright MCP (E2E/Integration)
**Target Platform**: Linux server (Docker), Web Browser
**Project Type**: Monorepo (Backend + Frontend)
**Performance Goals**: Sub-200ms latency for authentication requests, responsive UI
**Constraints**: No third-party auth, no task CRUD in Phase 1, no advanced UI styling, fully functional E2E by end of phase.
**Scale/Scope**: Minimal SaaS authentication system with persistent login and protected dashboard. Single user type.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All guidelines in `CLAUDE.md` related to agentic development, no manual coding, spec-kit structure, and architectural layers will be followed. Specific emphasis on JWT security, user isolation, and RESTful API conventions will be maintained.

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-integration/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification
├── checklists/
│   └── plan-quality.md  # Plan quality checklist
└── (other future docs like research.md, data-model.md, contracts/)
```

### Source Code (repository root)

```text
backend/
├── main.py              # FastAPI app entry point
├── models/
│   ├── __init__.py
│   ├── user.py          # SQLModel User definition
│   └── (other models for auth, e.g., token.py if needed for refresh tokens later)
├── routes/
│   ├── __init__.py
│   ├── auth.py          # Auth routes (register, login, /api/me)
│   └── (other route modules if needed for future phases)
├── services/
│   ├── __init__.py
│   ├── auth_service.py  # Business logic for auth
│   └── (other service modules)
├── middleware/
│   ├── __init__.py
│   └── auth_middleware.py # JWT validation middleware
├── db.py                # Database connection and session management
├── utils/               # Utility functions (e.g., password hashing, JWT encoding/decoding)
├── requirements.txt
└── tests/               # Backend tests (unit, integration)
    ├── unit/
    └── integration/

frontend/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Landing page (can be public)
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx # Login page
│   │   ├── register/
│   │   │   └── page.tsx # Register page
│   │   └── layout.tsx   # Auth specific layout
│   └── dashboard/
│       └── page.tsx     # Protected dashboard page
├── components/
│   ├── ui/              # Shadcn/ui or simple UI components
│   └── auth/            # Auth-related UI components (forms)
├── lib/
│   ├── api.ts           # Centralized API client
│   └── auth.ts          # Frontend auth utilities (e.g., redirect logic)
├── contexts/
│   └── auth_context.tsx # React Context for global auth state
├── types/               # Shared TypeScript types for API contracts
├── public/
├── package.json
└── tests/               # Frontend tests (E2E with Playwright)
```

**Structure Decision**: The chosen structure is a monorepo with separate `backend` and `frontend` directories, aligning with the project's technical stack (FastAPI and Next.js). This promotes clear separation of concerns, independent development, and ease of deployment. The layered architecture within both backend (models, services, routes, middleware) and frontend (app router, components, lib, contexts) ensures scalability and maintainability.

## High-Level Architecture Plan

This plan follows the layered architecture defined in the initial system design and focuses on continuous integration between frontend and backend.

1.  **Shared Types & Environment Configuration**:
    *   Define common TypeScript types in `frontend/types` for API request/response consistency.
    *   Establish `.env.example` and initial `.env` files with `DATABASE_URL` and `AUTH_SECRET`.
    *   Implement environment variable loading in both frontend and backend.

2.  **Backend Foundation (FastAPI, SQLModel, DB)**:
    *   Initialize FastAPI app (`backend/main.py`).
    *   Configure SQLModel and database connection (`backend/db.py`).
    *   Define `User` SQLModel (`backend/models/user.py`) with `id` (UUID), `email` (unique), `hashed_password`, `created_at`.
    *   Implement password hashing utility (`backend/utils/security.py` using `bcrypt`).

3.  **Backend Authentication Endpoints & Logic**:
    *   Develop `POST /api/auth/register` route (`backend/routes/auth.py`):
        *   Accepts email and password.
        *   Hashes password.
        *   Creates new `User` in DB.
        *   Generates JWT.
        *   Sets JWT in HTTP-only cookie.
        *   Returns success.
    *   Develop `POST /api/auth/login` route (`backend/routes/auth.py`):
        *   Accepts email and password.
        *   Verifies password.
        *   Generates JWT.
        *   Sets JWT in HTTP-only cookie.
        *   Returns success.
    *   Implement `AuthService` (`backend/services/auth_service.py`) for business logic (user creation, password verification, JWT generation).

4.  **Backend JWT Middleware Protection**:
    *   Create JWT utility functions (`backend/utils/security.py`): encode, decode, verify JWT.
    *   Develop authentication middleware (`backend/middleware/auth_middleware.py`) to:
        *   Extract JWT from HTTP-only cookie.
        *   Validate token using `AUTH_SECRET`.
        *   Inject authenticated `User` object into request context.
        *   Handle 401 for invalid/missing tokens.
    *   Apply middleware globally or to protected routes.
    *   Implement `GET /api/me` route (`backend/routes/auth.py`) which is protected by middleware and returns the authenticated user's details.

5.  **Frontend Auth Integration (Next.js)**:
    *   Set up Next.js App Router (`frontend/app`).
    *   Create login page (`frontend/app/auth/login/page.tsx`).
    *   Create registration page (`frontend/app/auth/register/page.tsx`).
    *   Implement centralized API client (`frontend/lib/api.ts`) for making requests to backend.
    *   Implement authentication context (`frontend/contexts/auth_context.tsx`) to manage user session state.
    *   Handle successful login/registration by storing user info in context (not JWT) and redirecting to dashboard.
    *   Implement automatic redirection to login on unauthorized access (e.g., 401 response from API client).

6.  **Full Integration Testing**:
    *   Develop backend integration tests (`backend/tests/integration`) for auth endpoints.
    *   Develop frontend E2E tests (`frontend/tests/e2e`) using Playwright MCP to simulate user flows:
        *   Register → Login → Access protected dashboard.
        *   Verify page refresh preserves authentication.
        *   Test unauthorized access to protected routes results in redirection.

## API Structure Outline

-   **Base URL**: `/api`
-   **Authentication Endpoints**:
    -   `POST /api/auth/register`
        -   **Request**: `{"email": "string", "password": "string"}`
        -   **Response**: `{"message": "User registered successfully"}` (or `{"id": "uuid", "email": "string"}` for user details)
        -   **Errors**: `400 Bad Request` (invalid input, email already exists), `500 Internal Server Error`
    -   `POST /api/auth/login`
        -   **Request**: `{"email": "string", "password": "string"}`
        -   **Response**: `{"message": "Logged in successfully"}` (JWT set in HttpOnly cookie)
        -   **Errors**: `400 Bad Request` (invalid input), `401 Unauthorized` (incorrect credentials), `500 Internal Server Error`
    -   `GET /api/me` (Protected)
        -   **Request**: (Requires valid JWT in HttpOnly cookie)
        -   **Response**: `{"id": "uuid", "email": "string", "created_at": "datetime"}`
        -   **Errors**: `401 Unauthorized` (invalid/missing token)

## Database Schema Definition

**Table**: `users`
-   `id`: `UUID` (Primary Key, automatically generated)
-   `email`: `VARCHAR(255)` (Unique, Indexed, NOT NULL)
-   `hashed_password`: `VARCHAR(255)` (NOT NULL)
-   `created_at`: `TIMESTAMP WITH TIME ZONE` (Default CURRENT_TIMESTAMP, NOT NULL)

## Auth Flow Diagram (Request → Validation → Response)

```mermaid
graph TD
    A[Frontend: User Input (Register/Login)] --> B{API Client: POST /api/auth/<endpoint>}
    B --> C{Backend: Auth Middleware}
    C -- Valid JWT in Cookie? --> D{Backend: Route Handler (auth.py)}
    C -- No/Invalid JWT --> E[Backend: 401 Unauthorized]
    D -- Register --> F{Backend: AuthService.register_user()}
    D -- Login --> G{Backend: AuthService.authenticate_user()}
    F -- Hash Password & Create User in DB --> H[DB: users table]
    G -- Verify Password & Retrieve User from DB --> H
    H --> I{Backend: Generate JWT}
    I --> J[Backend: Set JWT in HttpOnly Cookie]
    J --> K{Backend: Return Success Response}
    K --> L[Frontend: Update Auth State & Redirect]

    M[Frontend: Access Protected Route] --> N{API Client: GET /api/me (with Cookie)}
    N --> C
    C -- Valid JWT in Cookie? --> O{Backend: Route Handler (auth.py) /api/me}
    O -- Extract User from Request Context --> P[Backend: Return User Data]
    P --> Q[Frontend: Display User Data]
    C -- No/Invalid JWT --> E
    E --> R[Frontend: Redirect to Login Page]
```

## Integration Strategy Between Backend and Frontend

The core strategy is **parallel development with continuous integration**.
1.  **Shared Types**: Backend and frontend will use shared TypeScript type definitions (e.g., for User, LoginRequest, RegisterRequest) to ensure API contract consistency.
2.  **API Client Abstraction**: Frontend interacts solely through `frontend/lib/api.ts`, which handles credential inclusion and basic error handling (e.g., 401 redirection).
3.  **HTTP-only Cookies**: The backend is responsible for setting and clearing the JWT within HTTP-only cookies. The frontend *never* directly accesses or manipulates these cookies for security.
4.  **Auth Context**: Frontend uses a React Context to manage the authenticated user's state, derived from successful API responses (not by decoding JWT).
5.  **Sequential Feature Rollout**: Each backend authentication endpoint (`register`, `login`, `/me`) will be implemented and immediately integrated with its corresponding frontend UI component and API client call before moving to the next. This ensures continuous end-to-end functionality.
6.  **Mock Data Avoidance**: No mock data will be used. All frontend interactions will target the live backend from the start.

## Environment Configuration Plan

-   **`.env.example`**: Located at the monorepo root, documenting all necessary environment variables.
    ```
    DATABASE_URL="postgresql+asyncpg://user:password@host:port/database"
    AUTH_SECRET="super-secret-jwt-key"
    NEXT_PUBLIC_API_BASE_URL="http://localhost:8000/api"
    ```
-   **`.env`**: Local instance of `.env.example` with actual values, not committed to VCS.
-   **Backend (FastAPI)**: Uses `python-dotenv` or similar to load variables into `os.environ`.
    -   `DATABASE_URL` for SQLModel engine.
    -   `AUTH_SECRET` for JWT signing and verification.
-   **Frontend (Next.js)**: Accesses `NEXT_PUBLIC_` prefixed variables at build time and runtime.
    -   `NEXT_PUBLIC_API_BASE_URL` to configure the API client.

## Documented Decisions with Tradeoffs

1.  **JWT Strategy (HS256 vs RS256)**
    *   **Decision**: HS256 (symmetric key)
    *   **Reasoning**: Simpler to implement and manage for a single backend service in a hackathon context. Only one secret (`AUTH_SECRET`) needs to be shared and secured.
    *   **Tradeoff**: Less suitable for distributed microservices architecture where multiple services need to verify tokens without sharing the signing secret. RS256 (asymmetric key) would be preferred for larger, more complex systems.

2.  **Token Storage Method (HTTP-only cookie vs localStorage)**
    *   **Decision**: HTTP-only cookie
    *   **Reasoning**: Provides strong protection against Cross-Site Scripting (XSS) attacks, as client-side JavaScript cannot access the cookie. This aligns with the "secure authentication" constraint.
    *   **Tradeoff**: Requires backend to manage cookie setting (more overhead than simply returning a token to frontend localStorage). Cannot be easily inspected by frontend JavaScript for debugging. Might require specific CORS configurations for credentialed requests.

3.  **Password Hashing Library (bcrypt vs argon2)**
    *   **Decision**: `bcrypt`
    *   **Reasoning**: Widely adopted, robust, and industry-standard for password hashing. Offers good balance of security and performance for typical applications. Python's `passlib` provides a convenient interface.
    *   **Tradeoff**: `argon2` is considered more resistant to certain advanced attacks (e.g., GPU-based cracking), but `bcrypt` is perfectly adequate and simpler for this project's scope.

4.  **User Identification Strategy (/api/me vs user_id in URL)**
    *   **Decision**: Primarily `/api/me` for current user, with user ID derived from token for protected resource access.
    *   **Reasoning**: `/api/me` provides a clear, secure endpoint for the authenticated user to retrieve their own profile without needing to provide an ID. For accessing user-specific resources, the `user_id` should always be *derived from the authenticated JWT* in the backend, never trusted from the frontend URL or request body. This strictly enforces user isolation.
    *   **Tradeoff**: Always deriving user ID from the token adds a small processing overhead to each protected request, but it's a critical security measure.

5.  **Error Handling Format (Standardized JSON error response)**
    *   **Decision**: Standardized JSON error response (e.g., `{"detail": "Error message"}`)
    *   **Reasoning**: Consistent error structure simplifies frontend error parsing and display. FastAPI's `HTTPException` aligns well with this.
    *   **Tradeoff**: Requires frontend to implement consistent parsing logic for this format.

6.  **CORS Configuration Approach**
    *   **Decision**: FastAPI's `CORSMiddleware` with explicit `allow_origins`, `allow_credentials`, `allow_methods`, `allow_headers`.
    *   **Reasoning**: Provides fine-grained control over CORS policies, essential for allowing frontend to make credentialed requests to the backend while restricting other origins.
    *   **Tradeoff**: Incorrect configuration can lead to security vulnerabilities or block legitimate requests. Requires careful setup.

7.  **Environment Variable Management Strategy**
    *   **Decision**: `.env` files for local development, system environment variables for deployment.
    *   **Reasoning**: Standard practice for separating configuration from code, improving security and deployability.
    *   **Tradeoff**: Requires developers to manage `.env` files locally and ensure deployment environments are correctly configured.

8.  **Dev vs Production Configuration Differences**
    *   **Decision**: Use environment variables for all critical differences (e.g., `DATABASE_URL`, `AUTH_SECRET`, logging level, `DEBUG` flag if implemented later).
    *   **Reasoning**: Allows easy switching between development and production settings without code changes.
    *   **Tradeoff**: Requires careful management of environment variables in each deployment target.

## Testing Strategy

The testing strategy emphasizes end-to-end integration and security.

### **Backend Testing (Pytest)**
-   **Unit Tests**:
    -   `backend/tests/unit/test_security.py`: Password hashing/verification, JWT encoding/decoding.
    -   `backend/tests/unit/test_models.py`: SQLModel `User` definition.
    -   `backend/tests/unit/test_auth_service.py`: `AuthService` logic (user creation, password verification).
-   **Integration Tests**:
    -   `backend/tests/integration/test_auth_routes.py`:
        -   **Endpoint Validation**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/me`.
        -   **User Registration**: Verify new user creation in DB.
        -   **User Login**: Verify successful JWT generation and cookie setting.
        -   **Protected Route Access**: Test `GET /api/me` with valid/invalid/missing tokens, verifying 200/401 responses.
        -   **Password Hashing Verification**: Test that stored passwords are not plaintext.
        -   **Duplicate Email**: Attempt to register with an existing email and verify rejection.
    -   **Manual Backend Testing**: Use Postman/curl to manually verify endpoints and JWT in cookies during development.

### **Frontend Testing (Playwright MCP for E2E)**
-   **Setup**: Start Playwright MCP server with Chromium.
-   **Authentication Flow Validation**:
    -   Navigate to `/auth/register`.
    -   Register a new user (simulate form submission).
    -   Verify redirection to dashboard.
    -   Navigate to `/auth/login`.
    -   Login with registered user.
    -   Verify redirection to dashboard.
    -   **Access Protected Route**: Navigate to `/dashboard`, verify content (e.g., display of `/api/me` data).
    -   **Page Refresh**: Refresh the browser page on `/dashboard`, verify user remains authenticated.
-   **Invalid Token Rejection**:
    -   Manually clear/tamper with cookies (simulated via Playwright API).
    -   Attempt to access `/dashboard`.
    -   Verify automatic redirection to `/auth/login` and a 401 response in network logs.
-   **Build Verification**:
    -   Ensure `npm run build` succeeds without errors.
    -   Run `npm run dev` for frontend and `uvicorn main:app --reload` for backend.
    -   Execute E2E tests to confirm frontend successfully communicates with the backend across all authentication flows.

## Implementation Stages

This phased approach ensures continuous integration and a working system at each step.

1.  **Stage 1: Backend Auth Foundation (FastAPI, SQLModel, User Model, Hashing)**
    *   Initialize FastAPI app (`backend/main.py`).
    *   Configure DB connection (`backend/db.py`).
    *   Define `User` SQLModel (`backend/models/user.py`).
    *   Implement password hashing (`backend/utils/security.py`).
    *   Initial migration (if using Alembic later).
    *   **Verification**: Backend starts, connects to DB, User model can be created (manually or via test).

2.  **Stage 2: Backend Auth Endpoints & JWT (Register, Login, JWT Gen)**
    *   Implement `AuthService` (`backend/services/auth_service.py`).
    *   Implement `POST /api/auth/register` route.
    *   Implement `POST /api/auth/login` route.
    *   Add JWT encoding/decoding utilities (`backend/utils/security.py`).
    *   **Verification**: Backend integration tests pass for register/login. Manual Postman tests work.

3.  **Stage 3: Backend JWT Middleware Protection (/api/me)**
    *   Implement authentication middleware (`backend/middleware/auth_middleware.py`).
    *   Apply middleware to relevant routes.
    *   Implement `GET /api/me` endpoint.
    *   **Verification**: Backend integration tests pass for `/api/me` (both success and 401).

4.  **Stage 4: Frontend Auth Integration (Next.js UI & API Client)**
    *   Setup Next.js App Router, basic layouts (`frontend/app`).
    *   Create Login and Register UI pages (`frontend/app/auth`).
    *   Implement `frontend/lib/api.ts` with base URL and error handling.
    *   Integrate UI forms with API client calls to backend register/login endpoints.
    *   Implement `AuthContext` (`frontend/contexts/auth_context.tsx`) for global state.
    *   **Verification**: Frontend builds. User can register and log in via UI, and be redirected.

5.  **Stage 5: Protected Route Validation & Full Integration Testing**
    *   Create a simple protected Dashboard page (`frontend/app/dashboard/page.tsx`).
    *   Modify frontend API client to automatically redirect on 401.
    *   Implement E2E tests using Playwright for the full flow (register → login → protected access → refresh → unauthorized access).
    *   **Verification**: All success criteria met. System is demo-ready.

## Completion Benchmark

Phase 1 is complete when:
-   The application builds without errors, and both frontend and backend start successfully.
-   The backend successfully connects to Neon PostgreSQL, and the `users` table is managed by SQLModel.
-   Users can successfully register with email and password, and log in to receive a JWT in an HTTP-only cookie.
-   The JWT is securely validated by backend middleware on protected routes.
-   The `/api/me` endpoint correctly returns authenticated user information.
-   Frontend login and registration pages are fully functional, successfully call backend APIs, and handle authentication state.
-   Page refresh preserves the authenticated state in the frontend.
-   Unauthorized requests to protected routes consistently return 401, leading to frontend redirection.
-   The entire system runs successfully and is fully integrated via `uvicorn` for backend and `npm run dev` for frontend, or via `docker-compose up`.
-   All environment variables are documented in `.env.example`.
-   No runtime crashes, type errors, or 500 internal errors during normal login flow.
