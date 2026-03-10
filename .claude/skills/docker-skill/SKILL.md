---
name: docker-skill
description: >
  Containerizes Python/FastAPI and Next.js applications using official Docker
  best practices. Writes production-ready Dockerfiles, .dockerignore files,
  configures Next.js standalone output and rewrites proxy, and verifies images.
  Use when containerizing the frontend or backend for Kubernetes or any Docker deployment.
version: 1.0.0
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Docker Skill

## Purpose

This skill produces production-ready Docker artifacts for:
- **Next.js** (App Router) — multi-stage build using `output: 'standalone'`
  with runtime environment variable support and optional rewrites proxy
- **Python FastAPI** — single-stage slim build with layer-cached dependency
  installation and uvicorn/fastapi runner

All patterns are sourced directly from official Docker and framework documentation.
No assumed knowledge — every decision references an official source.

---

## Sources (Official Documentation Used)

- Docker best practices: https://docs.docker.com/build/building/best-practices
- Next.js Docker deployment: https://nextjs.org/docs/app/api-reference/config/next-config-js/output
- Next.js environment variables: https://nextjs.org/docs/app/guides/environment-variables
- Next.js rewrites: https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites
- FastAPI Docker: https://fastapi.tiangolo.com/deployment/docker/

---

## When to Use This Skill

Use **docker-skill** when:
- Writing `frontend/Dockerfile` for a Next.js application
- Writing `backend/Dockerfile` for a FastAPI application
- Creating `.dockerignore` for either service
- Configuring `next.config.js` for standalone output + rewrites proxy
- Building and smoke-testing container images locally
- Preparing images for `minikube image load`

Do **NOT** use this skill for:
- Helm chart creation (use helm-skill)
- Kubernetes deployment (use k8s-deploy-skill)
- Application source code changes unrelated to containerization
- Docker Compose orchestration (use docker-compose directly)

---

## Process Steps

### Step 1 — Read Existing Source Structure

Before writing any Dockerfile, read the target application to understand:

**For Next.js:**
- `frontend/package.json` — check Node version, build script, dependencies
- `frontend/next.config.js` (or `.ts`) — existing config to extend, not overwrite
- `frontend/app/` — confirm App Router structure
- Check if `NEXT_PUBLIC_*` env vars exist — these are build-time only

**For FastAPI:**
- `backend/requirements.txt` — must exist; all deps must be listed
- `backend/main.py` — confirm entry point and app variable name
- Check port used in `uvicorn main:app --port XXXX`

---

### Step 2 — Write `frontend/Dockerfile` (Next.js)

**Official pattern**: Multi-stage build using `output: 'standalone'`
Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output

The standalone output traces all required files and creates a self-contained
`server.js` that starts Next.js without `next start` or the full `node_modules`.

```dockerfile
# syntax=docker/dockerfile:1

# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

# Copy lockfiles first — Docker caches this layer if deps haven't changed
COPY package.json package-lock.json* ./

# npm ci: reproducible, faster, fails on lockfile mismatch
RUN npm ci

# ── Stage 2: Build the application ────────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# next.config.js MUST have output: 'standalone' set before this build
# Build-time env vars (NEXT_PUBLIC_*) must be passed here if any exist
RUN npm run build

# ── Stage 3: Production runner ─────────────────────────────────────────────────
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Non-root user — security best practice (Docker official docs)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy only the standalone output — no full node_modules needed
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# Runtime env vars (non-NEXT_PUBLIC_) are read here at startup — NOT baked in
# This allows the same image to run in any environment
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

CMD ["node", "server.js"]
```

**Critical rule from official docs:**
> "Runtime environment variables that need to be evaluated at request time rather than
> build time can be read safely on the server during dynamic rendering, allowing you to
> use a single Docker image that can be promoted through multiple environments."
> — nextjs.org/docs/app/guides/environment-variables

This means `BACKEND_URL` (the in-cluster backend service URL) is passed at
`docker run -e` or via Kubernetes env injection — **not** as a `NEXT_PUBLIC_` var
and **not** baked into the image at build time.

---

### Step 3 — Update `frontend/next.config.js`

Two changes MUST be made before building the frontend image:

**a) Add `output: 'standalone'`** (required for the Dockerfile above to work)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',   // ← ADD THIS
  // ... existing config preserved
}

module.exports = nextConfig
```

**b) Add rewrites proxy** (for Kubernetes: routes /api/* to backend service)

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_URL}/api/:path*`,
      },
    ]
  },
  // ... existing config preserved
}

module.exports = nextConfig
```

`BACKEND_URL` is injected at runtime (e.g., `http://todo-chatbot-backend:8000`
in Kubernetes). The browser always calls `/api/...` — the Next.js server proxies
the request to the backend service. The backend URL never reaches the browser.

**Important**: Only add the rewrites block if the project uses this proxy pattern.
If the app already has a working API URL strategy, preserve it.

---

### Step 4 — Write `frontend/.dockerignore`

```
node_modules
.next
.git
.gitignore
*.md
.env*
.dockerignore
Dockerfile
```

---

### Step 5 — Write `backend/Dockerfile` (FastAPI)

**Official pattern**: Single-stage slim build with layer-cached pip install
Source: https://fastapi.tiangolo.com/deployment/docker/

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.11-slim

WORKDIR /code

# Copy requirements first — Docker caches this layer if requirements haven't changed
# (Official FastAPI docs pattern)
COPY ./requirements.txt /code/requirements.txt

# --no-cache-dir: don't store pip cache in image (smaller image)
# --upgrade: ensure latest compatible versions
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy application code AFTER deps — cache miss only when code changes
COPY . /code/

# Expose the application port
EXPOSE 8000

# For Kubernetes: 1 worker per pod (replicas handle scaling, not workers)
# --host 0.0.0.0: listen on all interfaces (required in containers)
# --port 8000: match EXPOSE above
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Worker count rule (from FastAPI official docs):**
> "If you are running in a container, you would usually have a mechanism to
> handle replication at the cluster level. In that case, you would want a
> single process per container."
> — fastapi.tiangolo.com/deployment/docker/

In Kubernetes, replicas are managed by the Deployment spec — not by uvicorn workers.
Use `--workers 1` (default) per container.

---

### Step 6 — Write `backend/.dockerignore`

```
__pycache__
*.pyc
*.pyo
*.pyd
.env
.env.*
.git
.gitignore
*.md
.dockerignore
Dockerfile
venv
.venv
```

---

### Step 7 — Build and Verify Images

After writing Dockerfiles and updating next.config.js, build and smoke-test both images.

**Build:**
```bash
docker build -t todo-frontend:latest ./frontend
docker build -t todo-backend:latest ./backend
```

**Smoke test — Backend:**
```bash
docker run --rm -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e AUTH_SECRET="test-secret" \
  -e GROQ_API_KEY="test-key" \
  todo-backend:latest
# Verify: curl http://localhost:8000/docs returns 200
```

**Smoke test — Frontend:**
```bash
docker run --rm -p 3000:3000 \
  -e BACKEND_URL="http://localhost:8000" \
  todo-frontend:latest
# Verify: browser opens http://localhost:3000 and login page renders
```

**Verify no secrets in layers:**
```bash
docker history todo-frontend:latest
docker history todo-backend:latest
# Confirm no secret values appear in any layer command
```

---

### Step 8 — Verify Image Sizes

```bash
docker images todo-frontend:latest
docker images todo-backend:latest
```

Expected ranges (from official patterns):
- Frontend: 150–300 MB (standalone output is much smaller than full node_modules)
- Backend: 200–400 MB (python:3.11-slim base)

If frontend image is >500MB, confirm `output: 'standalone'` is set in next.config.js
and the runner stage only copies from `.next/standalone`, not full `node_modules`.

---

## Output Checklist

After applying this skill, confirm:

- [ ] `frontend/Dockerfile` exists with 3 stages (deps, builder, runner)
- [ ] `frontend/.dockerignore` exists
- [ ] `next.config.js` has `output: 'standalone'`
- [ ] `next.config.js` rewrites block present (if proxy pattern required)
- [ ] `backend/Dockerfile` exists with layer-cached pip install
- [ ] `backend/.dockerignore` exists
- [ ] Both images build without errors
- [ ] Backend smoke test: `/docs` endpoint responds
- [ ] Frontend smoke test: login page renders
- [ ] No `NEXT_PUBLIC_*` vars used for runtime-only config (e.g., backend URL)
- [ ] No secret values embedded in Dockerfiles or build args
- [ ] Image sizes within expected ranges

---

## Common Errors and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module 'server.js'` | `output: 'standalone'` missing in next.config.js | Add `output: 'standalone'` and rebuild |
| Frontend image >500MB | Runner stage copies full node_modules | Ensure runner only copies `.next/standalone`, `.next/static`, `public` |
| Backend `ModuleNotFoundError` | requirements.txt missing a package | Add missing package, rebuild |
| `address already in use` in container | Port not exposed correctly | Confirm `--host 0.0.0.0` in CMD |
| API calls fail in container | Using `localhost` for backend URL | Use `BACKEND_URL` env var via rewrites proxy |
| `COPY failed: no such file` in frontend | `.dockerignore` excludes required file | Review `.dockerignore` — never exclude `app/`, `components/`, `public/` |
