# Official Documentation Sources

All rules in SKILL.md trace back to one of these sources. No assumed knowledge.

---

## 1. Helm — Chart Structure
Source: https://helm.sh/docs/topics/charts
Source: https://helm.sh/docs/chart_template_guide/getting_started

> "A typical chart includes a Chart.yaml file for chart information, a values.yaml
> file for default configuration values, a charts/ directory for subcharts, and a
> templates/ directory for template files. When Helm processes a chart, it renders
> the files in the templates/ directory using a template engine and then sends the
> resulting Kubernetes manifests to the cluster."

Chart.yaml required fields: `apiVersion`, `name`, `version`.
`apiVersion: v2` is required for Helm 3.

---

## 2. Helm — Values and Overrides
Source: https://helm.sh/docs/glossary (Values)

> "Values provide a way to override template defaults with your own information.
> Helm Charts are 'parameterized', which means the chart developer may expose
> configuration that can be overridden at installation time."

Values set in values.yaml are defaults. They can be overridden with:
- `--set key=value` (string may be reinterpreted as number)
- `--set-string key=value` (always treated as string — safer for secrets/URLs)
- `-f custom-values.yaml`

---

## 3. Helm — --set-string
Source: https://helm.sh/docs/helm/helm_install

> "Installs a Helm chart, forcing a specific value to be treated as a string,
> even if it appears numeric."

```bash
helm install --set-string long_int=1234567890 myredis ./redis
```

Use `--set-string` for all secrets and URL values to prevent type coercion.

---

## 4. Helm — Dry Run for Testing
Source: https://helm.sh/docs/chart_template_guide/getting_started

> "The --debug and --dry-run flags allow you to preview the generated Kubernetes
> manifests, including dynamically rendered values, facilitating iterative
> development and debugging of your Helm charts."

```bash
helm install --debug --dry-run goodly-guppy ./mychart
```

---

## 5. Helm — upgrade --install (idempotent)
Source: https://helm.sh/docs/howto/charts_tips_and_tricks

```bash
helm upgrade --install <release name> --values <values file> <chart directory>
```

Installs if release doesn't exist, upgrades if it does. Safe for re-runs.

---

## 6. Kubernetes — Secret (envFrom pattern)
Source: https://kubernetes.io/docs/concepts/configuration/secret

Official pattern for injecting a whole Secret as environment variables:

```yaml
envFrom:
  - secretRef:
      name: mysecret
```

All keys in the Secret become environment variables in the container.
`stringData` in the Secret spec: Kubernetes automatically base64-encodes values.

---

## 7. Kubernetes — Deployment
Source: https://kubernetes.io/docs/concepts/workloads/controllers/deployment

Canonical Deployment manifest structure:
```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: N
  selector:
    matchLabels:
      app: <name>
  template:
    metadata:
      labels:
        app: <name>
    spec:
      containers:
        - name: <name>
          image: <repo>:<tag>
          imagePullPolicy: Never | IfNotPresent | Always
```

`selector.matchLabels` MUST match `template.metadata.labels` — Kubernetes uses
this to know which pods belong to this Deployment.

---

## 8. Kubernetes — Service (ClusterIP and NodePort)
Source: https://kubernetes.io/docs/concepts/services-networking/service

ClusterIP (default): exposes service on a cluster-internal IP only.
Reachable by DNS name: `<service-name>.<namespace>.svc.cluster.local`
Short form within same namespace: `<service-name>` (e.g., `todo-chatbot-backend`)

NodePort: exposes service on each Node's IP at a static port.
Accessible from outside the cluster at `<NodeIP>:<NodePort>`.
In Minikube: use `minikube service <name> --url` to get the correct URL.

---

## 9. Minikube — imagePullPolicy: Never
Source: https://minikube.sigs.k8s.io/docs/handbook/pushing/#1-pushing-directly-to-the-in-cluster-docker-daemon-docker-env

When using `minikube image load`, images are stored in Minikube's internal registry.
`imagePullPolicy: Never` tells the kubelet to use the local image and never attempt
a pull from an external registry. Required for locally built images.

Without `imagePullPolicy: Never`, Kubernetes will attempt to pull the image from
Docker Hub or another registry and fail with `ImagePullBackOff`.

---

## 10. Kubernetes — readinessProbe
Source: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/

> "The kubelet uses readiness probes to know when a container is ready to start
> accepting traffic. A Pod is considered ready when all of its containers are ready."

`httpGet` probe: Kubernetes sends HTTP GET to the specified path and port.
A 2xx or 3xx response = ready. 4xx or 5xx or no response = not ready.

`initialDelaySeconds`: time to wait before first probe (give app time to start).
`periodSeconds`: how often to probe.

FastAPI `/docs` endpoint: always returns 200 at startup — safe readiness probe target.
Next.js `/`: returns 200 when SSR is ready — safe readiness probe target.
