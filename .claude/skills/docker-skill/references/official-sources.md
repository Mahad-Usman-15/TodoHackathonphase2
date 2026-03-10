# Official Documentation Sources

This file records the exact official documentation excerpts used to build docker-skill.
No knowledge in SKILL.md is assumed — every rule traces back to one of these sources.

---

## 1. Docker — Dockerfile Best Practices
Source: https://docs.docker.com/build/building/best-practices

- Use multi-stage builds to separate build environment from runtime image.
- Copy dependency manifests (package.json, requirements.txt) BEFORE source code
  to maximize Docker layer cache hits.
- Use `--no-cache-dir` with pip to avoid storing pip cache in the image.
- Use `npm ci` (not `npm install`) for reproducible, clean installs in CI/containers.
- Run containers as a non-root user (create with `addgroup` / `adduser`).

---

## 2. Next.js — `output: 'standalone'`
Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/output

> "Next.js can automatically create a standalone folder that copies only the
> necessary files for a production deployment including select files in
> node_modules."

- Set `output: 'standalone'` in `next.config.js`.
- The standalone folder contains a minimal `server.js` that runs the app
  without `next start` or the full `node_modules`.
- Start with: `node .next/standalone/server.js`
- Or with custom port: `PORT=3000 HOSTNAME=0.0.0.0 node server.js`
- Official Docker templates at: https://github.com/vercel/next.js/tree/canary/examples/with-docker

---

## 3. Next.js — Environment Variables
Source: https://nextjs.org/docs/app/guides/environment-variables

> "By default, environment variables are only available on the server.
> To expose an environment variable to the browser, it must be prefixed
> with NEXT_PUBLIC_, but these public variables will be inlined into the
> JavaScript bundle during the build."

> "For runtime environment variables that need to be evaluated at request
> time rather than build time, you can read them safely on the server
> during dynamic rendering, allowing you to use a single Docker image
> that can be promoted through multiple environments with different values."

Key rule: `NEXT_PUBLIC_*` = baked at BUILD time (into JS bundle).
Non-prefixed server env vars = read at RUNTIME (safe for Docker/K8s).

---

## 4. Next.js — Rewrites (Proxy)
Source: https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites

Rewrites map incoming request paths to different destination paths.
The rewrite is processed server-side — the destination URL is never exposed to the browser.

```js
async rewrites() {
  return [
    {
      source: '/api/:path*',
      destination: `${process.env.BACKEND_URL}/api/:path*`,
    },
  ]
}
```

`process.env.BACKEND_URL` is a server-side runtime env var — not NEXT_PUBLIC_.
It is injected at container startup (e.g., via Kubernetes env in pod spec).

---

## 5. FastAPI — Docker Deployment
Source: https://fastapi.tiangolo.com/deployment/docker/

Official Dockerfile pattern (adapted from docs):

```dockerfile
FROM python:3.11-slim
WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
COPY . /code/
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

> "If you are running in a container, you would usually have a mechanism to
> handle replication at the cluster level. In that case, you would want a
> single process per container."

In Kubernetes: use 1 uvicorn worker per container. Let Kubernetes Deployment
replicas handle horizontal scaling.

`--host 0.0.0.0` is required so uvicorn listens on all network interfaces
inside the container (not just localhost).

---

## 6. Docker — Multi-Stage Build for Python
Source: https://docs.docker.com/dhi/migration/examples/python

Pattern for separating build (with compiler tools) from runtime (slim):

```dockerfile
FROM python:3.13-alpine AS builder
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
RUN python -m venv /app/venv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.13-alpine
COPY --from=builder /app/venv /app/venv
COPY app.py ./
ENTRYPOINT ["python", "/app/app.py"]
```

Note: For our FastAPI use case (python:3.11-slim, no compiler deps needed),
a single-stage build is sufficient and simpler per the official FastAPI docs.
Multi-stage Python is only needed when build tools (gcc, musl-dev) are
required for native extensions but should not be in the final image.
