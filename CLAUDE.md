# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Todo App - Hackathon II

## Project Overview
This is a monorepo using GitHub Spec-Kit for spec-driven development.

## 🤖 CRITICAL: No Manual Coding Allowed

**⚠️ THIS IS A JUDGING REQUIREMENT ⚠️**

This entire project MUST be built using Claude Code with ZERO manual coding:

### What This Means
- ✅ All code generated via Claude Code prompts
- ✅ All implementations driven by specifications in `/specs/`
- ✅ Process, prompts, and iterations will be judged
- ❌ No manual editing of generated code
- ❌ No copying code from external sources
- ❌ No direct file editing outside Claude Code

### Agentic Dev Stack Workflow
```
1. Write Spec        → Create/update file in /specs/features/
2. Prompt Claude     → "Implement @specs/features/[feature].md"
3. Claude Reads      → Specs + CLAUDE.md files
4. Claude Generates  → Complete implementation
5. Test              → Verify functionality
6. Iterate           → Update spec if needed, regenerate
```

### Example Prompt Pattern
```
"Implement user authentication as specified in @specs/features/authentication.md
Follow patterns in @backend/CLAUDE.md
Use SQLModel and FastAPI
Include HTTP-only cookies and JWT tokens"
```

**This development approach is a core evaluation criteria for the hackathon.**

## Spec-Kit Structure
Specifications are organized in /specs:
- /specs/overview.md - Project overview
- /specs/features/ - Feature specs (what to build)
- /specs/api/ - API endpoint and MCP tool specs
- /specs/database/ - Schema and model specs
- /specs/ui/ - Component and page specs

## Architecture & Technology Stack

### Layers
- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Python FastAPI, SQLModel ORM
- **Database**: Neon Serverless PostgreSQL
- **Authentication**: HTTP-only cookies, JWT tokens

### Key Components
- **Multi-User System**: Each user has isolated data space
- **RESTful API**: Comprehensive endpoints with user-specific data filtering
- **Secure Authentication**: JWT-based with user isolation
- **Task Management**: Full CRUD operations with completion toggling

## The Shared Secret
Backend (FastAPI) must use the secret key for JWT signing and verification. This is typically set via environment variable AUTH_SECRET.

## Frontend Guidelines

### Stack
- Next.js 16+ (App Router)
- TypeScript
- Tailwind CSS

### Patterns
- Use server components by default
- Client components only when needed (interactivity)
- API calls go through `/lib/api.ts`

### Component Structure
- `/components` - Reusable UI components
- `/app` - Pages and layouts

### API Client
All backend calls should use the api client:

```
import { api } from '@/lib/api'
const tasks = await api.getTasks()
```

### Styling
- Use Tailwind CSS classes
- No inline styles
- Follow existing component patterns

## Backend Guidelines

### Stack
- FastAPI
- SQLModel (ORM)
- Neon PostgreSQL

### Project Structure
- `main.py` - FastAPI app entry point
- `models.py` - SQLModel database models
- `routes/` - API route handlers
- `db.py` - Database connection

### API Conventions
- All routes under `/api/`
- Return JSON responses
- Use Pydantic models for request/response
- Handle errors with HTTPException

### Database
- Use SQLModel for all database operations
- Connection string from environment variable: DATABASE_URL

### Running
```
uvicorn main:app --reload --port 8000
```

## How to Use Specs
1. Always read relevant spec before implementing
2. Reference specs with: @specs/features/task-crud.md
3. Update specs if requirements change

## Project Structure
- /frontend - Next.js 16 app
- /backend - Python FastAPI server

## Development Workflow
1. Read spec: @specs/features/[feature].md
2. Implement backend: @backend/CLAUDE.md
3. Implement frontend: @frontend/CLAUDE.md
4. Test and iterate

## Commands
- Frontend: cd frontend && npm run dev
- Backend: cd backend && uvicorn main:app --reload
- Both: docker-compose up

## Base URL
- Development: http://localhost:8000
- Production: https://api.example.com

## Authentication
All endpoints require JWT token in header:
Authorization: Bearer <token>

## Endpoints

### GET /api/{user_id}/tasks
List all tasks for authenticated user.

Query Parameters:
- status: "all" | "pending" | "completed"
- sort: "created" | "title" | "due_date"

Response: Array of Task objects

### POST /api/{user_id}/tasks
Create a new task.

Request Body:
- title: string (required)
- description: string (optional)

Response: Created Task object

### GET /api/{user_id}/tasks/{id}
Get task details.

Response: Task object

### PUT /api/{user_id}/tasks/{id}
Update a task.

Request Body:
- title: string (required)
- description: string (optional)

Response: Updated Task object

### DELETE /api/{user_id}/tasks/{id}
Delete a task.

Response: Success confirmation

### PATCH /api/{user_id}/tasks/{id}/complete
Toggle task completion.

Response: Updated Task object

## Database Schema

### Tables

#### users
- `id`: integer (primary key, auto-increment)
- `email`: string (unique, indexed)
- `username`: string (not null)
- `hashed_password`: string (not null, bcrypt hashed)
- `is_active`: boolean (default true)
- `created_at`: timestamp

#### tasks
- `id`: integer (primary key, auto-increment)
- `user_id`: integer (foreign key → users.id, indexed)
- `title`: string (not null, max 200 characters)
- `description`: text (nullable, max 1000 characters)
- `completed`: boolean (default false, indexed)
- `created_at`: timestamp
- `updated_at`: timestamp

#### RefreshToken
- `id`: integer (primary key)
- `user_id`: integer (foreign key → users.id)
- `token`: string (unique, indexed) - Cryptographically secure random token (secrets.token_urlsafe)
- `expires_at`: timestamp (token expiration)
- `revoked`: boolean (default false, whether token has been revoked)
- `created_at`: timestamp

### Indexes
- `tasks.user_id` (for filtering by user)
- `tasks.completed` (for status filtering)

## Development Commands

### Prerequisites
- Node.js 18+ for frontend
- Python 3.9+ for backend
- PostgreSQL-compatible database (Neon Serverless recommended)
- Docker (optional, for containerized deployment)

### JWT Token Refresh Mechanism
- Access tokens: 15 minutes (stored in-memory on frontend)
- Refresh tokens: 7 days (HTTP-only cookie + stored in PostgreSQL RefreshToken table)
- No token rotation (basic level functionality)
- No blacklisting (keep it simple)
- Token refresh endpoint: `POST /api/auth/refresh`

### Security Audit Procedures
- Dependency vulnerability scanning: `npm audit` and `pip-audit`
- Static code analysis: ESLint, Pylint, Bandit

### Testing with Playwright MCP

The project includes Playwright MCP server for browser automation and testing:

**Start Playwright MCP server:**
```bash
npx @playwright/mcp@latest --config playwright-mcp.config
```

**Or run directly with options:**
```bash
npx @playwright/mcp@latest --port 9322 --browser chromium --headless
```

The Playwright MCP server enables:
- Browser automation for end-to-end testing
- Visual testing capabilities
- Integration testing of the full stack application
- Automated UI interaction testing

### Running Applications

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Both (using Docker):**
```bash
docker-compose up
```

### Installation
1. Set up environment variables:
```bash
cp .env.example .env
# Configure your environment variables
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

## Workflow with Spec-KitPlus + Claude Code
Write/Update Spec → @specs/features/new-feature.md
Ask Claude Code to Implement → "Implement @specs/features/new-feature.md"
Claude Code reads: Root CLAUDE.md, Feature spec, API spec, Database spec, Relevant CLAUDE.md
Claude Code implements in both frontend and backend
Test and iterate on spec if needed
Referencing Specs in Claude Code

## Security Considerations

- HTTP-only cookies prevent XSS attacks
- JWT token validation and expiration (HS256 with AUTH_SECRET environment variable)
- User isolation through ID matching
- Input validation and sanitization
- SQL injection prevention through ORM
- Secure password hashing
- Secrets stored in environment variables only
- Cookie SameSite: 'lax' (better compatibility with authentication flows)
- The backend uses a single AUTH_SECRET for JWT signing and verification

## Basic Risk Considerations

### High Priority Risks
- **JWT token security**: Use HS256 algorithm with AUTH_SECRET; no asymmetric encryption
- **SQL injection prevention**: Always use SQLModel ORM queries; never construct raw SQL from user input
- **Cookie security**: Ensure HttpOnly=true, Secure=true, SameSite='lax' in production

### Medium Priority Risks
- **Database connection pooling**: Basic connection management for development
- **Race condition prevention**: Use database transactions with appropriate isolation levels for concurrent operations

## Development Best Practices

### Authentication Architecture
1. User signs up or signs in via frontend form
2. Backend validates credentials
3. Backend creates JWT tokens (HS256 with AUTH_SECRET)
4. Backend sets refresh token in HTTP-only cookie with HttpOnly=true, Secure=true, SameSite=Lax
5. Frontend stores access token in-memory
6. Backend validates JWT on every protected request
7. Backend extracts user identity from validated JWT
8. Backend enforces data access only for authenticated user

### Basic Deployment Setup
- Local development with hot reloading
- Docker Compose for containerized local development
- Environment-specific configuration via .env files
- Simple production deployment

### Basic Security Headers
- Strict-Transport-Security for HTTPS enforcement
- X-Content-Type-Options to prevent MIME-type sniffing
- X-Frame-Options for clickjacking protection
- Content-Security-Policy for XSS prevention

### Strict Rules
- Never trust user-supplied user IDs
- Session cookie must be validated on every API request
- Authentication logic must not leak into business logic
- Secrets must come from environment variables only
- Cookies must be HttpOnly and Secure in production
- Expired or invalid sessions must immediately revoke access
- All routes must be under `/api`
- JWT required for every request
- Filter all data by authenticated user ID
- No frontend or UI logic in backend
- No direct fetch outside API client
- No backend logic in frontend
- Schema changes must be documented in database specs first
- Use Claude Code for all implementations (no manual coding)
- Follow Agentic Dev Stack: Write spec → Generate plan → Break into tasks → Implement
