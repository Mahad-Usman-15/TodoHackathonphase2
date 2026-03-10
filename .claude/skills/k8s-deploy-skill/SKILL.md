---
name: k8s-deploy-skill
description: >
  Deploys containerized applications to a local Minikube Kubernetes cluster
  using Helm charts. Covers Helm chart authoring (Chart.yaml, values.yaml,
  templates), Minikube cluster setup, image loading, helm install/upgrade/
  rollback, pod verification, NodePort service access, and debugging.
  Use when deploying to Minikube for Phase IV Kubernetes deployment.
version: 1.0.0
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash, Glob
---

# k8s-deploy-skill

## Purpose

This skill covers the full local Kubernetes deployment lifecycle:

1. **Helm chart authoring** — `Chart.yaml`, `values.yaml`, all templates
2. **Minikube cluster setup** — start, driver, image loading
3. **Helm deployment** — install, verify, upgrade, rollback, uninstall
4. **Kubernetes verification** — pod status, logs, service access
5. **Secrets management** — inject at install time, never in committed files
6. **Debugging** — CrashLoopBackOff, ImagePullBackOff, service unreachable

All patterns sourced from official Kubernetes, Helm, and Minikube documentation.

---

## Sources (Official Documentation Used)

- Helm chart structure: https://helm.sh/docs/topics/charts
- Helm install/upgrade: https://helm.sh/docs/intro/using_helm
- Helm template rendering: https://helm.sh/docs/chart_template_guide/getting_started
- Helm --set-string: https://helm.sh/docs/helm/helm_install
- Kubernetes Deployment: https://kubernetes.io/docs/concepts/workloads/controllers/deployment
- Kubernetes Service (NodePort/ClusterIP): https://kubernetes.io/docs/concepts/services-networking/service
- Kubernetes Secret (env injection): https://kubernetes.io/docs/concepts/configuration/secret
- Minikube: https://minikube.sigs.k8s.io/docs/

---

## When to Use This Skill

Use **k8s-deploy-skill** when:
- Creating the `helm/todo-chatbot/` chart directory and all its files
- Starting Minikube and loading Docker images
- Running `helm install` / `helm upgrade` / `helm rollback`
- Verifying pods, services, and logs with `kubectl`
- Getting the NodePort URL to access the app in a browser
- Debugging pod failures, image errors, or service connectivity issues

Do **NOT** use this skill for:
- Writing Dockerfiles (use docker-skill)
- Application source code changes (use frontend/backend-skill)
- AI DevOps tool operations (Gordon, kubectl-ai, kagent — use aiops-skill)
- Cloud Kubernetes (EKS, GKE, AKS) — Minikube only per constitution

---

## Process Steps

---

### Step 1 — Create Helm Chart Structure

**From official Helm docs:**
> "A typical chart includes a `Chart.yaml` file for chart information, a `values.yaml`
> file for default configuration values, and a `templates/` directory for template files."
> — helm.sh/docs/chart_template_guide/getting_started

Create this directory layout:

```
helm/
└── todo-chatbot/
    ├── Chart.yaml
    ├── values.yaml
    └── templates/
        ├── secret.yaml
        ├── backend-deployment.yaml
        ├── backend-service.yaml
        ├── frontend-deployment.yaml
        └── frontend-service.yaml
```

---

### Step 2 — Write `helm/todo-chatbot/Chart.yaml`

```yaml
apiVersion: v2
name: todo-chatbot
description: Taskify AI-powered Todo Chatbot — Phase IV Kubernetes deployment
type: application
version: 1.0.0
appVersion: "phase4"
```

Fields (from official Helm docs):
- `apiVersion: v2` — required for Helm 3 charts
- `version` — chart version (SemVer)
- `appVersion` — the application version being deployed (informational)

---

### Step 3 — Write `helm/todo-chatbot/values.yaml`

**Critical rule from constitution and Helm docs:**
> "Values provide a way to override template defaults with your own information."
> "Secret values MUST NOT be in values.yaml — inject via --set-string at install time."

```yaml
# ── Replica counts ────────────────────────────────────────────────────────────
replicaCount:
  frontend: 1
  backend: 1

# ── Container images ──────────────────────────────────────────────────────────
image:
  frontend:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never       # Never = use local Minikube image, never pull from registry
  backend:
    repository: todo-backend
    tag: latest
    pullPolicy: Never

# ── Service ports ─────────────────────────────────────────────────────────────
service:
  frontend:
    type: NodePort          # NodePort: access via minikube service --url (no tunnel needed)
    port: 3000
    targetPort: 3000
  backend:
    type: ClusterIP         # ClusterIP: internal only — frontend proxies to it server-side
    port: 8000
    targetPort: 8000

# ── Backend service name (used by frontend rewrites proxy) ────────────────────
backendServiceName: todo-chatbot-backend

# ── Secret name (referenced by deployment envFrom) ────────────────────────────
secretName: todo-chatbot-secrets

# NOTE: No secret VALUES here. AUTH_SECRET, DATABASE_URL, GROQ_API_KEY
# are injected at helm install time via --set-string flags.
```

**`pullPolicy: Never`** is critical for Minikube with locally loaded images.
If set to `Always` or `IfNotPresent`, Kubernetes will try to pull from a registry
that doesn't have the image, causing `ImagePullBackOff`.

---

### Step 4 — Write `helm/todo-chatbot/templates/secret.yaml`

From official K8s docs — Secret with `envFrom` pattern:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ .Values.secretName }}
  labels:
    app: todo-chatbot
type: Opaque
stringData:
  AUTH_SECRET: {{ .Values.secret.authSecret | quote }}
  DATABASE_URL: {{ .Values.secret.databaseUrl | quote }}
  GROQ_API_KEY: {{ .Values.secret.groqApiKey | quote }}
```

`stringData` — Kubernetes automatically base64-encodes values (no manual encoding needed).
`| quote` — Helm template function that wraps value in quotes, preventing YAML injection.

These values are supplied ONLY at install time:
```bash
helm install todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="..." \
  --set-string secret.databaseUrl="..." \
  --set-string secret.groqApiKey="..."
```

---

### Step 5 — Write `helm/todo-chatbot/templates/backend-deployment.yaml`

From official Kubernetes Deployment docs (kubernetes.io/docs/concepts/workloads/controllers/deployment):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-backend
  labels:
    app: {{ .Release.Name }}-backend
spec:
  replicas: {{ .Values.replicaCount.backend }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-backend
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-backend
    spec:
      containers:
        - name: backend
          image: "{{ .Values.image.backend.repository }}:{{ .Values.image.backend.tag }}"
          imagePullPolicy: {{ .Values.image.backend.pullPolicy }}
          ports:
            - containerPort: {{ .Values.service.backend.targetPort }}
          envFrom:
            - secretRef:
                name: {{ .Values.secretName }}
          readinessProbe:
            httpGet:
              path: /docs
              port: {{ .Values.service.backend.targetPort }}
            initialDelaySeconds: 10
            periodSeconds: 5
```

**`envFrom.secretRef`** — injects ALL keys from the Secret as environment variables.
This is the official K8s pattern for consuming secrets as env vars.

**`readinessProbe`** — Kubernetes will not route traffic to the pod until this probe passes.
FastAPI's `/docs` endpoint is available at startup with no auth — safe to use as health check.

---

### Step 6 — Write `helm/todo-chatbot/templates/backend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.backendServiceName }}
  labels:
    app: {{ .Release.Name }}-backend
spec:
  type: {{ .Values.service.backend.type }}
  selector:
    app: {{ .Release.Name }}-backend
  ports:
    - protocol: TCP
      port: {{ .Values.service.backend.port }}
      targetPort: {{ .Values.service.backend.targetPort }}
```

`type: ClusterIP` — internal only. The service name `todo-chatbot-backend` becomes
the DNS hostname inside the cluster (e.g., `http://todo-chatbot-backend:8000`).
This is the URL used by `BACKEND_URL` in the frontend rewrites proxy.

---

### Step 7 — Write `helm/todo-chatbot/templates/frontend-deployment.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Release.Name }}-frontend
  labels:
    app: {{ .Release.Name }}-frontend
spec:
  replicas: {{ .Values.replicaCount.frontend }}
  selector:
    matchLabels:
      app: {{ .Release.Name }}-frontend
  template:
    metadata:
      labels:
        app: {{ .Release.Name }}-frontend
    spec:
      containers:
        - name: frontend
          image: "{{ .Values.image.frontend.repository }}:{{ .Values.image.frontend.tag }}"
          imagePullPolicy: {{ .Values.image.frontend.pullPolicy }}
          ports:
            - containerPort: {{ .Values.service.frontend.targetPort }}
          env:
            - name: BACKEND_URL
              value: "http://{{ .Values.backendServiceName }}:{{ .Values.service.backend.port }}"
          envFrom:
            - secretRef:
                name: {{ .Values.secretName }}
          readinessProbe:
            httpGet:
              path: /
              port: {{ .Values.service.frontend.targetPort }}
            initialDelaySeconds: 15
            periodSeconds: 5
```

`BACKEND_URL` — injected as a plain (non-secret) env var pointing to the backend
ClusterIP service. The Next.js rewrites proxy reads this at runtime to forward API calls.
This is the server-side runtime variable confirmed in clarification Q2.

---

### Step 8 — Write `helm/todo-chatbot/templates/frontend-service.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .Release.Name }}-frontend
  labels:
    app: {{ .Release.Name }}-frontend
spec:
  type: {{ .Values.service.frontend.type }}
  selector:
    app: {{ .Release.Name }}-frontend
  ports:
    - protocol: TCP
      port: {{ .Values.service.frontend.port }}
      targetPort: {{ .Values.service.frontend.targetPort }}
```

`type: NodePort` — exposes the service on a port of the Minikube node IP.
Access the URL via: `minikube service todo-chatbot-frontend --url`
No `minikube tunnel` background process required (confirmed in clarification Q3).

---

### Step 9 — Validate Chart Before Deploying

**From official Helm docs:**
> "The `--debug` and `--dry-run` flags allow you to preview the generated
> Kubernetes manifests without actually installing the chart."

```bash
# Lint — check for YAML errors and Helm best practices
helm lint ./helm/todo-chatbot \
  --set-string secret.authSecret="test" \
  --set-string secret.databaseUrl="test" \
  --set-string secret.groqApiKey="test"

# Dry-run — render full manifests without deploying
helm install --debug --dry-run todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="test" \
  --set-string secret.databaseUrl="test" \
  --set-string secret.groqApiKey="test"
```

Verify dry-run output shows:
- `kind: Secret` with correct name
- `kind: Deployment` × 2 (frontend, backend)
- `kind: Service` × 2 (frontend NodePort, backend ClusterIP)
- `envFrom.secretRef.name` matches secret name
- `BACKEND_URL` in frontend deployment env

---

### Step 10 — Start Minikube

```bash
# Start with Docker driver (Docker Desktop must be running)
minikube start --driver=docker

# Verify cluster is ready
kubectl cluster-info
kubectl get nodes
```

Expected output: one node with status `Ready`.

---

### Step 11 — Load Images into Minikube

Docker images built locally are NOT automatically available in Minikube.
They must be loaded into Minikube's internal image store:

```bash
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Verify images are available inside Minikube
minikube image ls | grep todo
```

This is why `imagePullPolicy: Never` is set in values.yaml — it tells Kubernetes
to use the locally loaded image and never attempt a registry pull.

---

### Step 12 — Helm Install

```bash
helm install todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="<AUTH_SECRET_VALUE>" \
  --set-string secret.databaseUrl="<DATABASE_URL_VALUE>" \
  --set-string secret.groqApiKey="<GROQ_API_KEY_VALUE>"
```

`--set-string` — forces values to be treated as strings (from official Helm docs).
Prevents numeric-looking values (like long secrets) from being mistyped as integers.

---

### Step 13 — Verify Deployment

```bash
# Watch all pods reach Running state
kubectl get pods --watch

# Check all resources created
kubectl get all

# Confirm services
kubectl get services
```

Expected pod states:
- `todo-chatbot-backend-*` → `Running` (readiness probe passes on `/docs`)
- `todo-chatbot-frontend-*` → `Running` (readiness probe passes on `/`)

---

### Step 14 — Get Browser URL

```bash
# Get NodePort URL for frontend (confirmed pattern from clarification Q3)
minikube service todo-chatbot-frontend --url
```

Returns a URL like `http://192.168.49.2:31234`. Open in browser to access the app.

---

### Step 15 — Helm Lifecycle Commands

```bash
# Upgrade after chart or values change
helm upgrade todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="..." \
  --set-string secret.databaseUrl="..." \
  --set-string secret.groqApiKey="..."

# View release history
helm history todo-chatbot

# Roll back to previous revision
helm rollback todo-chatbot 1

# Tear down completely
helm uninstall todo-chatbot

# Verify clean teardown
kubectl get all
```

---

## Debugging Guide

### Pod in `Pending` state
```bash
kubectl describe pod <pod-name>
# Look for: "Events" section — "FailedScheduling" or resource shortage
```

### Pod in `ImagePullBackOff`
```bash
kubectl describe pod <pod-name>
# Cause: image not found in Minikube registry
# Fix:
minikube image load todo-frontend:latest   # or todo-backend:latest
# Also confirm imagePullPolicy: Never in values.yaml
```

### Pod in `CrashLoopBackOff`
```bash
# View crash logs
kubectl logs <pod-name>
kubectl logs <pod-name> --previous   # logs from the previous crashed container

# Common causes:
# 1. Missing env var (DATABASE_URL, AUTH_SECRET) — check secret was created
kubectl get secret todo-chatbot-secrets -o yaml

# 2. App startup error — read logs carefully for Python traceback or Node error
# 3. Wrong port in CMD — confirm backend listens on 0.0.0.0:8000
```

### Service unreachable from browser
```bash
# Confirm NodePort service exists
kubectl get service todo-chatbot-frontend

# Re-fetch URL
minikube service todo-chatbot-frontend --url

# Confirm frontend pod is Running and Ready
kubectl get pods
```

### Frontend API calls returning 502/failed
```bash
# Frontend rewrites proxy can't reach backend
# Check BACKEND_URL is correct in frontend pod
kubectl describe pod <frontend-pod-name>
# Look for: BACKEND_URL = http://todo-chatbot-backend:8000

# Confirm backend service is reachable inside cluster
kubectl exec -it <frontend-pod-name> -- wget -qO- http://todo-chatbot-backend:8000/docs
```

### `helm install` fails — release already exists
```bash
helm uninstall todo-chatbot
# Then re-run helm install
# Or use upgrade --install for idempotent deploys:
helm upgrade --install todo-chatbot ./helm/todo-chatbot \
  --set-string secret.authSecret="..." \
  --set-string secret.databaseUrl="..." \
  --set-string secret.groqApiKey="..."
```

---

## Output Checklist

After applying this skill, confirm:

- [ ] `helm/todo-chatbot/Chart.yaml` exists with `apiVersion: v2`
- [ ] `helm/todo-chatbot/values.yaml` has NO secret values
- [ ] `templates/secret.yaml` uses `stringData` with Helm template vars
- [ ] `templates/backend-deployment.yaml` uses `envFrom.secretRef`
- [ ] `templates/backend-service.yaml` type is `ClusterIP`
- [ ] `templates/frontend-deployment.yaml` has `BACKEND_URL` env var
- [ ] `templates/frontend-service.yaml` type is `NodePort`
- [ ] `helm lint` passes with no errors
- [ ] `helm install --dry-run` renders all 5 resource kinds
- [ ] Minikube started with Docker driver
- [ ] Both images loaded via `minikube image load`
- [ ] `helm install` completes without errors
- [ ] Both pods reach `Running` and `Ready` state
- [ ] `minikube service todo-chatbot-frontend --url` returns a valid URL
- [ ] Login page renders in browser
- [ ] Full user journey works: login → tasks → chat
