# Kubernetes Manifests Contract

**Feature**: 006-kubernetes-deploy | **Date**: 2026-03-05

This document specifies the exact Kubernetes resources produced by the Helm chart templates.
All template values shown with their rendered values (using release name `todo-chatbot`).

---

## 1. Secret — `todo-chatbot-secrets`

**File**: `helm/todo-chatbot/templates/secret.yaml`

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-chatbot-secrets      # = {{ .Values.secretName }}
  labels:
    app: todo-chatbot
type: Opaque
stringData:
  AUTH_SECRET: "{{ .Values.secret.authSecret }}"    # supplied via --set-string
  DATABASE_URL: "{{ .Values.secret.databaseUrl }}"  # supplied via --set-string
  GROQ_API_KEY: "{{ .Values.secret.groqApiKey }}"   # supplied via --set-string
```

**Rules**:
- `stringData`: Kubernetes auto-base64-encodes values. No manual encoding needed.
- `| quote`: Helm filter wraps value in quotes, preventing YAML injection.
- Values are NEVER in values.yaml or committed files.

---

## 2. Deployment — `todo-chatbot-backend`

**File**: `helm/todo-chatbot/templates/backend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-chatbot-backend       # = {{ .Release.Name }}-backend
  labels:
    app: todo-chatbot-backend
spec:
  replicas: 1                      # = {{ .Values.replicaCount.backend }}
  selector:
    matchLabels:
      app: todo-chatbot-backend    # MUST match template.metadata.labels
  template:
    metadata:
      labels:
        app: todo-chatbot-backend
    spec:
      containers:
        - name: backend
          image: "todo-backend:latest"           # = repository:tag
          imagePullPolicy: Never                 # = {{ .Values.image.backend.pullPolicy }}
          ports:
            - containerPort: 8000               # = {{ .Values.service.backend.targetPort }}
          envFrom:
            - secretRef:
                name: todo-chatbot-secrets       # = {{ .Values.secretName }}
          readinessProbe:
            httpGet:
              path: /docs
              port: 8000
            initialDelaySeconds: 10
            periodSeconds: 5
```

**Rules**:
- `selector.matchLabels` MUST equal `template.metadata.labels` (K8s requirement).
- `envFrom.secretRef` injects all keys from the Secret as env vars.
- `/docs` readiness probe: FastAPI Swagger UI, always 200 at startup.

---

## 3. Service — `todo-chatbot-backend` (ClusterIP)

**File**: `helm/todo-chatbot/templates/backend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-chatbot-backend       # = {{ .Values.backendServiceName }} (fixed name)
  labels:
    app: todo-chatbot-backend
spec:
  type: ClusterIP
  selector:
    app: todo-chatbot-backend      # routes to backend pods
  ports:
    - protocol: TCP
      port: 8000                   # = {{ .Values.service.backend.port }}
      targetPort: 8000             # = {{ .Values.service.backend.targetPort }}
```

**Rules**:
- Name is `todo-chatbot-backend` (from `Values.backendServiceName`, not `Release.Name`).
  This is CRITICAL — the frontend's `BACKEND_URL` must match this exact name.
- Internal cluster DNS: `http://todo-chatbot-backend:8000`
- Not reachable from outside the cluster.

---

## 4. Deployment — `todo-chatbot-frontend`

**File**: `helm/todo-chatbot/templates/frontend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-chatbot-frontend      # = {{ .Release.Name }}-frontend
  labels:
    app: todo-chatbot-frontend
spec:
  replicas: 1                      # = {{ .Values.replicaCount.frontend }}
  selector:
    matchLabels:
      app: todo-chatbot-frontend
  template:
    metadata:
      labels:
        app: todo-chatbot-frontend
    spec:
      containers:
        - name: frontend
          image: "todo-frontend:latest"          # = repository:tag
          imagePullPolicy: Never
          ports:
            - containerPort: 3000
          env:
            - name: BACKEND_URL
              value: "http://todo-chatbot-backend:8000"
              # = "http://{{ .Values.backendServiceName }}:{{ .Values.service.backend.port }}"
          envFrom:
            - secretRef:
                name: todo-chatbot-secrets
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 5
```

**Rules**:
- `BACKEND_URL` is a plain (non-secret) env var — not in the Secret.
  It points to the ClusterIP service DNS name.
- `envFrom.secretRef` also injects AUTH_SECRET, DATABASE_URL, GROQ_API_KEY.
- `/` readiness probe: Next.js root returns 200 when SSR is ready.
- `initialDelaySeconds: 15` — Next.js takes longer to start than Python.

---

## 5. Service — `todo-chatbot-frontend` (NodePort)

**File**: `helm/todo-chatbot/templates/frontend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-chatbot-frontend      # = {{ .Release.Name }}-frontend
  labels:
    app: todo-chatbot-frontend
spec:
  type: NodePort
  selector:
    app: todo-chatbot-frontend
  ports:
    - protocol: TCP
      port: 3000                   # = {{ .Values.service.frontend.port }}
      targetPort: 3000             # = {{ .Values.service.frontend.targetPort }}
```

**Rules**:
- `type: NodePort` — assigns a port on the Minikube node IP.
- Access URL: `minikube service todo-chatbot-frontend --url`
- Returns something like `http://192.168.49.2:31234`.
- No `nodePort` field specified — Minikube auto-assigns from range 30000–32767.

---

## Resource Summary

| Resource | Name | Kind | Service Type | Port |
|----------|------|------|-------------|------|
| K8s Secret | `todo-chatbot-secrets` | Secret | — | — |
| Backend app | `todo-chatbot-backend` | Deployment | — | 8000 |
| Backend network | `todo-chatbot-backend` | Service | ClusterIP | 8000 |
| Frontend app | `todo-chatbot-frontend` | Deployment | — | 3000 |
| Frontend network | `todo-chatbot-frontend` | Service | NodePort | 3000 |

**Total resources**: 5 (1 Secret + 2 Deployments + 2 Services)

---

## Request Flow Diagram

```
Browser
  │
  │  GET http://<minikube-node-ip>:<nodeport>/
  ▼
todo-chatbot-frontend (NodePort Service)
  │
  ▼
frontend pod (Next.js standalone, port 3000)
  │  GET /api/auth/login  → rewrite: http://todo-chatbot-backend:8000/api/auth/login
  ▼
todo-chatbot-backend (ClusterIP Service)
  │
  ▼
backend pod (FastAPI + uvicorn, port 8000)
  │
  ▼
Neon PostgreSQL (external — not in cluster)
```
