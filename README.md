# Todo Full-Stack Web Application - Phase II

A modern multi-user web application built with Next.js, FastAPI, and Neon Serverless PostgreSQL, featuring secure authentication and comprehensive task management capabilities.

### 🤖 Development Constraint
**This project is built entirely using Claude Code with NO manual coding.**
- All code generated through Claude Code
- Spec-driven development workflow
- Prompts and iterations documented for judging
- Agentic Dev Stack: Spec → Plan → Tasks → Implement

## 🚀 Project Overview

This project transforms a console application into a full-stack web application using the Agentic Dev Stack workflow: Write spec → Generate plan → Break into tasks → Implement via Claude Code. The application follows Spec-Driven Development (SDD) principles with comprehensive documentation and automated implementation.

## ✨ Features

- **Multi-User Support**: Individual user accounts with isolated data
- **Task Management**: Complete CRUD operations for tasks
- **Responsive UI**: Modern interface built with Next.js App Router
- **Secure Authentication**: HTTP-only cookies and JWT-based authentication
- **RESTful API**: Comprehensive API endpoints for all operations
- **Persistent Storage**: Neon Serverless PostgreSQL database
- **Real-time Updates**: Interactive task management experience

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16+ (App Router), TypeScript, Tailwind CSS |
| Backend | Python FastAPI, SQLModel ORM |
| Database | Neon Serverless PostgreSQL |
| Authentication | HTTP-only cookies, JWT tokens |

## 📋 Requirements

### Basic Level Functionality
1. Implement all 5 Basic Level features as a web application
2. Create RESTful API endpoints
3. Build responsive frontend interface
4. Store data in Neon Serverless PostgreSQL database
5. Authentication – Implement user signup/signin using http-only cookies

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks for a user |
| POST | `/api/{user_id}/tasks` | Create a new task |
| GET | `/api/{user_id}/tasks/{id}` | Get task details |
| PUT | `/api/{user_id}/tasks/{id}` | Update a task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete a task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle task completion |

### Securing the REST API

- **User Identification**: Backend identifies user by decoding JWT token to get user ID, email, etc., and matches it with the user ID in the URL
- **Data Filtering**: Backend filters data to return only tasks belonging to that user
- **Frontend Integration**: JWT token attached to every API request header
- **Backend Middleware**: Middleware verifies JWT and extracts user information
- **Route Protection**: All API routes filter queries by the authenticated user's ID

### Security Benefits

| Benefit | Description |
|---------|-------------|
| User Isolation | Each user only sees their own tasks |
| Stateless Auth | Backend doesn't need to call frontend to verify users |
| Token Expiry | JWTs expire automatically (e.g., after 7 days) |

### API Behavior After Authentication

- All endpoints require valid JWT token
- Requests without token receive 401 Unauthorized
- Each user only sees/modifies their own tasks
- Task ownership is enforced on every operation

## 🗂️ Project Structure

```
phaseII/
├── .spec-kit/                    # Spec-Kit configuration
│   └── config.yaml
├── specs/                        # Spec-Kit managed specifications
│   ├── overview.md               # Project overview
│   ├── architecture.md           # System architecture
│   ├── features/                 # Feature specifications
│   │   ├── task-crud.md
│   │   ├── authentication.md
│   │   └── chatbot.md
│   ├── api/                      # API specifications
│   │   ├── rest-endpoints.md
│   │   └── mcp-tools.md
│   ├── database/                 # Database specifications
│   │   └── schema.md
│   └── ui/                       # UI specifications
│       ├── components.md
│       └── pages.md
├── CLAUDE.md                     # Root Claude Code instructions
├── frontend/                     # Next.js application
│   ├── CLAUDE.md                 # Frontend-specific guidelines
│   ├── app/                      # App Router pages
│   ├── components/               # Reusable UI components
│   ├── lib/                      # Utility functions and API client
│   ├── public/                   # Static assets
│   ├── package.json              # Node.js dependencies
│   └── ...
├── backend/                      # FastAPI application
│   ├── CLAUDE.md                 # Backend-specific guidelines
│   ├── main.py                   # FastAPI app entry point
│   ├── models.py                 # SQLModel database models
│   ├── routes/                   # API route handlers
│   ├── db.py                     # Database connection
│   └── ...
├── .env                          # Environment variables
├── docker-compose.yml            # Docker configuration
└── README.md                     # This file
```

## 🏗️ Development Workflow

### Agentic Dev Stack Workflow
1. **Write Spec** → Define requirements in `/specs/features/`
2. **Generate Plan** → Create architectural plan using Claude Code
3. **Break into Tasks** → Decompose implementation into testable tasks
4. **Implement** → Use Claude Code for automated implementation

### CLAUDE.md Files
Multiple CLAUDE.md files provide context at different levels:

#### Root CLAUDE.md
Provides project overview, spec organization, and development workflow.

#### Frontend CLAUDE.md
Guidelines for Next.js 16+ development with TypeScript and Tailwind CSS, including:
- Use server components by default
- Client components only when needed
- API calls through `/lib/api.ts`
- Component structure and styling patterns

#### Backend CLAUDE.md
Guidelines for FastAPI development with SQLModel, including:
- Project structure and API conventions
- Database operations using SQLModel
- Error handling with HTTPException
- Development server setup

## 📊 Database Schema

### Tables

#### users
- `id`: integer (primary key, auto-increment)
- `email`: string (unique, indexed)
- `username`: string (not null)
- `hashed_password`: string (not null, bcrypt hashed)
- `is_active`: boolean (default true)
- `created_at`: timestamp

#### tasks
- `id`: integer (primary key)
- `user_id`: integer (foreign key → users.id, indexed)
- `title`: string (not null)
- `description`: text (nullable)
- `completed`: boolean (default false)
- `created_at`: timestamp
- `updated_at`: timestamp

### Indexes
- `tasks.user_id` (for filtering by user)
- `tasks.completed` (for status filtering)

### RefreshToken Table
For managing refresh tokens:

- `id`: integer (primary key)
- `user_id`: integer (foreign key → users.id)
- `token`: string (unique, indexed) - Cryptographically secure random token (secrets.token_urlsafe)
- `expires_at`: timestamp (token expiration)
- `revoked`: boolean (default false, whether token has been revoked)
- `created_at`: timestamp

## 🔐 Authentication System

The application implements secure authentication using HTTP-only cookies and JWT tokens:

### Frontend Authentication
- Automatic attachment of JWT tokens to API requests
- Secure cookie management
- Session handling and user state management

### Backend Authentication
- JWT token verification and user identification
- User isolation through ID matching
- Token expiry enforcement
- Secure secret key management via environment variables

## 🧪 Testing Strategy

The application follows comprehensive testing practices:
- Unit tests for individual components and functions
- Integration tests for API endpoints
- End-to-end tests for user flows
- Security testing for authentication mechanisms

## 🚨 Error Handling

### Error Handling Strategies
The application implements consistent error handling across all layers:

**Backend Error Handling:**
- Custom exception classes for different error types (ValidationError, AuthorizationError, etc.)
- Centralized exception handler using FastAPI's exception middleware
- Structured error responses with consistent format: `{error: {message, code, details}}`
- Logging of all errors with appropriate severity levels
- Graceful degradation for non-critical failures

**Frontend Error Handling:**
- Global error boundary for catching unexpected errors
- API error response parsing with user-friendly messages
- Network error handling with retry mechanisms
- Loading states and error states for all asynchronous operations
- Client-side validation with immediate user feedback

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ for frontend
- Python 3.9+ for backend
- PostgreSQL-compatible database (Neon Serverless recommended)
- Docker (optional, for containerized deployment)

### Basic Architecture
Simple architecture for hackathon basic level functionality:

```
Internet
   ↓
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │
│   (Next.js)     │    │   (FastAPI)     │
│                 │    │                 │
│ - Static files  │    │ - API endpoints │
│ - SSR/CSR       │    │ - JWT auth      │
│ - API proxy     │    │ - Business logic│
└─────────────────┘    └─────────────────┘
         ↓                      ↓
┌─────────────────────────────────────────┐
│           PostgreSQL Database           │
│    (Neon Serverless)                  │
└─────────────────────────────────────────┘
```

Components:
- **Frontend**: Handles static files and server-side rendering
- **Backend**: Processes API requests and business logic
- **PostgreSQL**: Primary database for all data storage

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd phaseII
```

2. Set up environment variables:
```bash
cp .env.example .env
# Configure your environment variables
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Install backend dependencies:
```bash
cd ../backend
pip install -r requirements.txt
```

### Running the Application

#### Development Mode

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

## 📚 Spec-Driven Development (Core Workflow)

This project is fundamentally built around Spec-Driven Development as the core workflow:

### Core Process
1. **Write Spec** → Define requirements in `/specs/features/`
2. **Generate Plan** → Create architectural plan using Claude Code
3. **Break into Tasks** → Decompose implementation into testable tasks
4. **Implement** → Use Claude Code for automated implementation

### Referencing Specs in Claude Code
- Always read relevant spec before implementing: `@specs/features/task-crud.md`
- Update specs if requirements change
- Use the pattern: Write/Update Spec → Ask Claude Code to Implement → Iterate on spec if needed

### How to Prompt Claude Code
- Reference specs directly: "Implement according to @specs/features/task-crud.md"
- Specify technology constraints: "Use Next.js 16+ App Router only"
- Mention Claude Code constraint: "Remember, no manual coding allowed"

### Key Spec Files
- `/specs/features/task-crud.md` - Task management features
- `/specs/features/authentication.md` - Authentication system
- `/specs/api/rest-endpoints.md` - API endpoint specifications
- `/specs/database/schema.md` - Database schema specifications
- `/specs/ui/components.md` - UI component specifications

## 🔌 MCP Servers Used

This project integrates with the following MCP servers for enhanced Claude Code capabilities:

- **PostgreSQL MCP**: Direct database access for Claude Code
- **GitHub MCP**: Version control integration
- **Memory MCP**: Context persistence across sessions

### Authentication Flow
1. User registers/signs up
2. Backend creates JWT token
3. Token stored in HTTP-only cookie
4. Frontend includes token in all subsequent requests
5. Backend validates token and extracts user ID

## 📈 API Documentation

All API endpoints follow RESTful conventions and require JWT authentication:

### Authentication Flow
1. User registers/signs up
2. Backend creates JWT token using HS256 with AUTH_SECRET
3. Refresh token stored in HTTP-only cookie
4. Access token stored in-memory on frontend
5. Frontend includes access token in all subsequent requests
6. Backend validates JWT and extracts user ID

### Base URL
- Development: http://localhost:8000
- Production: https://api.example.com

### Error Handling
- Standard HTTP status codes (200, 401, 404, 500)
- Consistent error response format
- Detailed error messages for debugging

## 🚢 Deployment

### Development Deployment
- Local development with hot reloading
- Docker Compose for containerized local development
- Environment-specific configurations via .env files

### Production Deployment
- Containerized deployment with Docker
- Environment-specific configurations
- SSL termination and security headers

### Basic Performance Guidelines
Simple performance considerations for basic level functionality:

- API Response Time: < 500ms for typical operations
- Page Load Time: < 5 seconds for initial render
- Concurrent Users: Support for basic user load during development/testing

## 🛡️ Security Considerations

- HTTP-only cookies prevent XSS attacks
- JWT token validation and expiration
- Input validation and sanitization
- SQL injection prevention through ORM
- Secure password hashing

### Cookie Security Configuration
- HttpOnly: true (prevents XSS attacks)
- Secure: true (HTTPS only in production)
- SameSite: 'lax' (better compatibility with authentication flows)
- Max-Age: 7 days (automatic expiration)
- Path: '/' (available across entire application)

### JWT Token Security
- Algorithm: HS256 (AUTH_SECRET based symmetric encryption)
- Access token: 15 minutes (stored in-memory on frontend)
- Refresh token: 7 days (HTTP-only cookie + stored in PostgreSQL RefreshToken table)
- No token rotation (basic level functionality)
- No blacklisting (keep it simple)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Write specs for new features
4. Use Claude Code for implementation
5. Submit a pull request with comprehensive testing

## 📞 Support

For support, please refer to the project specifications in the `/specs/` directory or contact the development team.

---

*Built with ❤️ using Claude Code and Spec-Kit Plus*