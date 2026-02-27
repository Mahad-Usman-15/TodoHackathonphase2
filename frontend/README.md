# Todo App — Frontend Service

A multi-user task management interface built with **Next.js 16+** (App Router), **TypeScript**, and **Tailwind CSS**.

---

## Project Scope

This service is responsible for:

- **User-facing UI** — pages and components for authentication and task management
- **Authentication flows** — sign-up, sign-in, and sign-out interactions that communicate with the backend
- **Task management interface** — creating, viewing, editing, deleting, and toggling tasks
- **Secure API communication** — all backend calls go through a single API client (`/lib/api.ts`) with credentials sent via HTTP-only cookies
- **Access token management** — access tokens are stored in-memory (never in localStorage); the backend session cookie handles persistence

This service contains **no business logic and no database access**. All data operations are delegated to the backend API.

---

## Tech Stack

| Layer       | Technology                   |
|-------------|------------------------------|
| Framework   | Next.js 16.1 (App Router)    |
| Language    | TypeScript 5                 |
| Styling     | Tailwind CSS 4               |
| Runtime     | React 19                     |
| Linting     | ESLint 9 + eslint-config-next|

---

## Project Structure

```
frontend/
├── app/                     # Next.js App Router pages and layouts
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home / landing page
│   └── globals.css          # Global styles (Tailwind base)
├── components/              # Reusable UI components
├── lib/
│   └── api.ts               # Centralised API client for all backend calls
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## Key Conventions

### Server vs Client Components
- Use **server components** by default for all pages and layouts
- Add `"use client"` only when interactivity is required (forms, event handlers, hooks)

### API Client
Every backend request must go through the shared API client:

```ts
import { api } from '@/lib/api'

const tasks = await api.getTasks()
```

Direct `fetch` calls outside of `lib/api.ts` are not permitted.

### Styling
- All styles use **Tailwind CSS utility classes**
- No inline `style` attributes
- No CSS-in-JS libraries

---

## Authentication Flow

1. User submits sign-in or sign-up form
2. Frontend sends credentials to `POST /api/auth/login` or `POST /api/auth/register`
3. Backend sets an HTTP-only session cookie on the response
4. Frontend stores the returned access token **in-memory only**
5. Subsequent API requests include the cookie automatically (`credentials: 'include'`)
6. On logout, frontend calls `POST /api/auth/logout` and clears in-memory state

---

## Environment Variables

Create a `.env.local` file in this directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend service running on `http://localhost:8000`

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## Backend Dependency

This service requires the backend API to be running. See [`../backend/README.md`](../backend/README.md) for setup instructions.

The base URL defaults to `http://localhost:8000` in development. All API routes are under `/api/`.
