# Feature Specification: Phase IV — Local Kubernetes Deployment

**Feature Branch**: `006-kubernetes-deploy`
**Created**: 2026-03-05
**Status**: Draft
**Input**: User description: "Generate a spec.md for phase4. All installations will be managed by you."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Automated Tool Installation (Priority: P1)

A developer starts Phase IV with missing tools (Minikube, Helm, Go, kubectl-ai, kagent).
Claude Code detects what is missing and installs every required tool automatically without
any manual steps from the developer.

**Why this priority**: Nothing in Phase IV works until all tools are present. This is the
foundational blocker for every other story. Automating it removes human error and aligns
with the "zero manual steps" hackathon requirement.

**Independent Test**: Can be fully tested by running the installation sequence on a machine
that has only Docker Desktop and kubectl, and verifying all tools respond correctly afterward.

**Acceptance Scenarios**:

1. **Given** Minikube is not installed, **When** Claude Code runs the install sequence,
   **Then** Minikube is available and responds to version checks.
2. **Given** Helm is not installed, **When** Claude Code runs the install sequence,
   **Then** Helm is available and responds to version checks.
3. **Given** Go is not installed, **When** Claude Code installs Go,
   **Then** `go version` returns successfully and kubectl-ai can be installed via Go.
4. **Given** kubectl-ai is not installed, **When** Claude Code installs it via Go,
   **Then** kubectl-ai is available and can accept natural language commands.
5. **Given** kagent is not installed, **When** Claude Code installs it,
   **Then** kagent is available and can connect to a running cluster.
6. **Given** Gordon is not enabled, **When** Claude Code provides instructions,
   **Then** the developer can enable it in Docker Desktop with a single toggle.

---

### User Story 2 — Application Containerization (Priority: P2)

A developer needs both the frontend (Next.js) and backend (FastAPI) packaged as container
images so they can run identically in any environment without local language runtimes.

**Why this priority**: Container images are the prerequisite artifact for Kubernetes
deployment. Without working images, the Helm deployment cannot proceed.

**Independent Test**: Can be fully tested by building both images and running them locally
with environment variables injected, confirming the app functions the same as in development.

**Acceptance Scenarios**:

1. **Given** the frontend source code, **When** the frontend container image is built,
   **Then** the image starts successfully and serves the Next.js application on port 3000.
2. **Given** the backend source code, **When** the backend container image is built,
   **Then** the image starts successfully and the FastAPI server responds to health checks
   on port 8000.
3. **Given** both images are built, **When** they are run with correct environment variables,
   **Then** the full app flow works (login → tasks → chat) in the containerized environment.
4. **Given** the frontend image, **When** it is built without secrets,
   **Then** no sensitive values (API keys, secrets) are embedded in the image layers.

---

### User Story 3 — Helm Chart Creation (Priority: P3)

A developer needs a reusable, parameterized Helm chart that describes the entire application
stack so it can be deployed, upgraded, and torn down with single commands.

**Why this priority**: Helm is the required packaging format for Phase IV. The chart must
exist before any Kubernetes deployment can be attempted.

**Independent Test**: Can be tested independently by running `helm template` to render the
chart manifests and verifying they are syntactically valid and contain all expected resources.

**Acceptance Scenarios**:

1. **Given** the Helm chart exists, **When** `helm template` is run,
   **Then** it renders valid Kubernetes manifests for backend deployment, backend service,
   frontend deployment, frontend service, and a Kubernetes Secret.
2. **Given** the Helm chart's `values.yaml`, **When** inspected,
   **Then** it contains no secret values — only image names, replica counts, and port numbers.
3. **Given** different replica values passed at install time, **When** the chart is rendered,
   **Then** the deployment manifests reflect the correct replica counts.
4. **Given** the secret template, **When** the chart is installed with `--set-string` flags,
   **Then** sensitive values are injected as a Kubernetes Secret and mounted as environment
   variables in the relevant pods.

---

### User Story 4 — Minikube Deployment via Helm (Priority: P4)

A developer deploys the full Todo Chatbot stack onto a local Minikube cluster using a single
Helm install command, and accesses the running application from their browser.

**Why this priority**: This is the primary deliverable of Phase IV — a working local
Kubernetes deployment is what the hackathon evaluates.

**Independent Test**: Fully tested when a developer runs `helm install` on a fresh Minikube
cluster and can open the app in a browser and complete a full user journey.

**Acceptance Scenarios**:

1. **Given** Minikube is running and images are loaded, **When** `helm install` is executed,
   **Then** all pods reach Running state within a reasonable time.
2. **Given** all pods are running, **When** the frontend service is accessed via browser,
   **Then** the Taskify login page renders correctly.
3. **Given** the app is deployed, **When** a user logs in and navigates to the dashboard,
   **Then** task CRUD operations work correctly against the external Neon database.
4. **Given** the app is deployed, **When** a user navigates to the AI chat page,
   **Then** the chatbot responds to natural language task management requests.
5. **Given** the backend service, **When** it is accessed from within the cluster by the
   frontend pod, **Then** API requests resolve correctly via Kubernetes service discovery.

---

### User Story 5 — AI DevOps Operations (Priority: P5)

A developer uses Gordon, kubectl-ai, and kagent to perform cluster operations through
natural language instead of writing raw Docker or kubectl commands manually.

**Why this priority**: Demonstrating AI DevOps tooling is an explicit hackathon judging
requirement. All three tools must be used and their interactions documented.

**Independent Test**: Tested by executing at least one operation with each tool (Gordon,
kubectl-ai, kagent) and verifying correct output, with interactions captured in the PHR.

**Acceptance Scenarios**:

1. **Given** Docker Desktop with Gordon enabled, **When** a natural language Docker command
   is issued via `docker ai`, **Then** Gordon executes the correct Docker operation.
2. **Given** a running Minikube cluster, **When** a natural language request is sent to
   kubectl-ai (e.g., "check why pods are failing"), **Then** kubectl-ai generates and runs
   the correct kubectl command and returns meaningful output.
3. **Given** a running Minikube cluster, **When** kagent is asked to analyze cluster health,
   **Then** kagent returns a health report covering pod status, resource usage, and any issues.
4. **Given** all three tools have been used, **When** the PHR is written,
   **Then** all interactions are documented with the exact prompts and responses captured.

---

### Edge Cases

- What happens when Minikube fails to start due to insufficient system resources?
- What happens if an image fails to load into Minikube (e.g., disk space exceeded)?
- How does the frontend pod reach the backend if the backend service is not yet ready?
- What happens when `helm install` is run but a release with the same name already exists?
- What happens if Gordon is unavailable (region/tier restriction)?
- What happens when a pod enters CrashLoopBackOff — how is it diagnosed and resolved?
- What happens if `go install kubectl-ai` fails due to PATH not including `~/go/bin`?

---

## Clarifications

### Session 2026-03-05

- Q: What LLM provider should kubectl-ai use? → A: Groq (reuse existing GROQ_API_KEY via OpenAI-compatible endpoint, model: llama3-8b-8192) — free tier, zero additional installation, separate rate limit pool from the Todo AI chatbot.
- Q: How should the frontend reach the backend inside Kubernetes? → A: Next.js rewrites proxy — frontend calls its own `/api` path; `next.config.js` rewrites to backend service URL injected at runtime via server-side env var (not NEXT_PUBLIC_).
- Q: What Kubernetes service type should the frontend use for browser access? → A: NodePort — accessed via `minikube service <name> --url`, no tunnel process required.

---

## Requirements *(mandatory)*

### Functional Requirements

**Tool Installation**
- **FR-001**: Claude Code MUST install Minikube if not already present on the system.
- **FR-002**: Claude Code MUST install Helm 3.x if not already present on the system.
- **FR-003**: Claude Code MUST install Go if not already present (required for kubectl-ai).
- **FR-004**: Claude Code MUST install kubectl-ai after Go is available. kubectl-ai MUST be
  configured to use Groq as its LLM backend via the OpenAI-compatible endpoint, reusing the
  existing GROQ_API_KEY. The model MUST be set to `llama3-8b-8192` (a separate rate limit
  pool from the Todo AI chatbot's `llama-3.3-70b-versatile`). No additional installation
  beyond setting environment variables is required.
- **FR-005**: Claude Code MUST install kagent if not already present.
- **FR-006**: Claude Code MUST verify each tool is functional after installation by running
  its version or health check command before proceeding.
- **FR-007**: If Gordon is unavailable, Claude Code MUST fall back to standard Docker CLI
  commands and document this in the PHR.

**Containerization**
- **FR-008**: The frontend application MUST have a Dockerfile that produces a working,
  self-contained image requiring no host-installed Node.js runtime.
- **FR-009**: The backend application MUST have a Dockerfile that produces a working,
  self-contained image requiring no host-installed Python runtime.
- **FR-010**: Container images MUST NOT embed secret values of any kind.
- **FR-011**: The frontend Dockerfile MUST use a multi-stage build to minimize final image size.

**Helm Chart**
- **FR-012**: A Helm chart MUST be created at `helm/todo-chatbot/` covering both frontend
  and backend deployments, their services, and a shared Kubernetes Secret.
- **FR-013**: The chart's `values.yaml` MUST contain only non-sensitive configuration
  (image names, replica counts, port numbers). It MUST NOT contain secrets.
- **FR-014**: Secrets (AUTH_SECRET, DATABASE_URL, GROQ_API_KEY) MUST be injected at
  `helm install` time via `--set-string` and stored as a Kubernetes Secret resource.
- **FR-015**: The backend service MUST be of type ClusterIP (internal access only).
- **FR-016**: The frontend service MUST be of type NodePort. The browser URL MUST be
  obtained via `minikube service todo-chatbot-frontend --url`. No `minikube tunnel`
  background process is required.

**Kubernetes Deployment**
- **FR-017**: Minikube MUST be started using the Docker driver.
- **FR-018**: Container images MUST be loaded into Minikube's internal registry before
  Helm installation (`minikube image load`).
- **FR-019**: The full stack MUST be deployable with a single `helm install` command.
- **FR-020**: The deployed application MUST be accessible from a browser via the NodePort
  URL returned by `minikube service todo-chatbot-frontend --url`.
- **FR-021**: The frontend MUST communicate with the backend using a Next.js rewrites proxy.
  `next.config.ts` MUST define a rewrite so all `/api/*` requests from the browser are
  proxied server-side to the backend Kubernetes service URL. The backend service URL MUST
  be injected as a server-side environment variable (not a `NEXT_PUBLIC_` variable) so the
  image remains environment-agnostic and does not require a rebuild per environment.
- **FR-022**: The database connection MUST point to the external Neon PostgreSQL instance
  — no in-cluster database pod is permitted.

**AI DevOps**
- **FR-023**: Gordon MUST be used for at least one Docker operation during the workflow.
- **FR-024**: kubectl-ai MUST be used for at least one Kubernetes operation during deployment.
- **FR-025**: kagent MUST be used for cluster health analysis after deployment.
- **FR-026**: All AI tool interactions (prompts + responses) MUST be documented in the PHR.

### Key Entities

- **Container Image**: A self-contained, portable package of an application and its
  dependencies. Two images are produced: one for the frontend, one for the backend.
- **Helm Chart**: A versioned, parameterized package of Kubernetes resource definitions
  for the entire Todo Chatbot stack. Stored at `helm/todo-chatbot/`.
- **Kubernetes Secret**: A cluster-scoped resource holding sensitive configuration values
  (AUTH_SECRET, DATABASE_URL, GROQ_API_KEY), injected at deploy time.
- **Kubernetes Service**: A stable network endpoint inside the cluster. Backend uses
  ClusterIP (internal only — reachable by frontend via Next.js server-side proxy);
  frontend uses NodePort or LoadBalancer (external browser access).
- **Next.js Rewrites Proxy**: A `next.config.js` rewrite rule that forwards all browser
  `/api/*` requests to the backend service URL on the server side, keeping the backend
  URL out of the browser and the built image.
- **Minikube Cluster**: A single-node local Kubernetes environment running on Docker Desktop.
  Acts as the deployment target for Phase IV.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All required Phase IV tools are installed and verified functional before
  any deployment step begins — zero manual installation steps required from the developer.
- **SC-002**: Both frontend and backend container images build successfully and the
  containerized application passes the same functional checks as the local dev version.
- **SC-003**: The entire application stack deploys to Minikube with a single command and
  all pods reach healthy running state.
- **SC-004**: A developer can complete the full user journey (register → login → create task
  → chat with AI → task updated) through the Minikube-hosted application accessed via the
  NodePort URL from `minikube service todo-chatbot-frontend --url`.
- **SC-005**: No secret values appear in any committed file (Dockerfiles, Helm values.yaml,
  source code, or git history).
- **SC-006**: All three AI DevOps tools (Gordon, kubectl-ai, kagent) are demonstrably used
  during Phase IV and their interactions are captured in the PHR record.
- **SC-007**: The deployment can be fully torn down and re-deployed cleanly with Helm
  commands — no residual state causes failures on re-deploy.

---

## Assumptions

- Docker Desktop 4.53+ is already installed and running (confirmed from installation checks).
- kubectl is already installed (confirmed from installation checks: v1.34.1).
- The developer machine has internet access for downloading tools and container base images.
- The external Neon PostgreSQL database from Phase II/III remains available and accessible.
- Gordon availability will be verified at implementation time; standard Docker CLI is the
  documented fallback if Gordon is unavailable in the developer's region/tier.
- `winget` is available as the package manager for Windows tool installations.
- `~/go/bin` will be added to PATH after Go installation so kubectl-ai is globally accessible.
- kubectl-ai will use Groq as its LLM backend via OpenAI-compatible endpoint, reusing GROQ_API_KEY.
- kubectl-ai will use model `llama3-8b-8192` — a separate Groq rate limit pool from the
  Todo AI chatbot (`llama-3.3-70b-versatile`), preventing any rate limit contention.
- No Ollama installation is required.
- Minikube will use the Docker driver (Docker Desktop is already running).
- The Phase III GROQ_API_KEY, AUTH_SECRET, and DATABASE_URL values are available as
  environment variables on the developer machine for use at `helm install` time.

---

## Out of Scope

- Cloud Kubernetes deployments (EKS, GKE, AKS, DigitalOcean) — Minikube only.
- In-cluster PostgreSQL — external Neon database only.
- CI/CD pipelines or automated deployment workflows.
- Kubernetes Ingress controller setup (NodePort or minikube tunnel suffices).
- Horizontal Pod Autoscaler or any auto-scaling configuration.
- Persistent Volumes or StatefulSets.
- Multi-environment Helm value overrides (single `values.yaml` for local dev only).
- TLS/HTTPS on the Minikube cluster.
- Modifying the application source code (frontend or backend) for containerization
  beyond environment variable configuration.
