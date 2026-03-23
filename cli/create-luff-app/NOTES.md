# 📘 LUFF. Operational Manual

<p align="center">
  <img src="https://img.shields.io/badge/Mode-Local_Dev-6366f1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Mode-Kubernetes-34d399?style=for-the-badge" />
  <img src="https://img.shields.io/badge/CI/CD-GitHub_Actions-f59e0b?style=for-the-badge" />
</p>

> Everything you need to run, deploy, and maintain the LUFF. ecosystem — from local dev to production Kubernetes.

---

## 🚀 1. Initial Setup

### Prerequisites

| Tool | Version | Purpose |
|:---:|:---:|:---|
| Node.js | `≥ 20.x` | Runtime for all services |
| Docker Desktop | `≥ 24.x` | Database containers |
| kubectl | Latest | Kubernetes management |
| ArgoCD | Latest | GitOps agent (K8s mode only) |

### One-Time Setup

```bash
npm run setup    # Installs packages + copies .env files
```

---

## ⚙️ 2. Environment Variables

You **must** configure these `.env` files before the app will fully function:

<details>
<summary><b>frontend/.env</b></summary>

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_id
```
</details>

<details>
<summary><b>backend/auth/.env</b></summary>

```env
PORT=4001
JWT_SECRET="your-jwt-secret-change-in-production"
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/auth_db"
NODE_ENV=development
```
</details>

<details>
<summary><b>backend/posts/.env</b></summary>

```env
PORT=4002
JWT_SECRET="your-jwt-secret"
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/posts_db"
NODE_ENV=development
```
</details>

<details>
<summary><b>backend/payment/.env</b></summary>

```env
PORT=4003
RAZORPAY_KEY_ID=rzp_test_your_id
RAZORPAY_KEY_SECRET=your_secret_key
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/payment_db"
JWT_SECRET="your-jwt-secret"
NODE_ENV=development
```
</details>

<details>
<summary><b>backend/ai-service/.env</b></summary>

```env
PORT=4004
GEMINI_API_KEY=your_gemini_api_key
UPSTASH_VECTOR_REST_URL=https://your-index.upstash.io
UPSTASH_VECTOR_REST_TOKEN=your_token
JWT_SECRET="your-jwt-secret"
NODE_ENV=development
```
</details>

---

## 🖥️ 3. Running the Project

### Option A: Native Mode (Recommended for Dev)

```bash
npm run run-local
```

Handles everything: clears port conflicts, starts Docker DBs, launches all services.

### Option B: Kubernetes Mode (Production)

```mermaid
flowchart LR
  A[Build] --> B[Tag]
  B --> C[ArgoCD]
  C --> D[Deploy]
  D --> E[Forward]
```

```bash
# 1. Tell ArgoCD to watch your repo
kubectl apply -f argocd/application.yaml

# 2. Build & deploy locally
./scripts/deploy-local.sh

# 3. Forward ports to localhost
kubectl port-forward svc/frontend-service 3000:3000
kubectl port-forward svc/api-gateway 4000:4000
```

### Kubernetes Secrets

```bash
# Auth secrets
kubectl create secret generic auth-secrets \
  --from-literal=database-url="postgresql://postgres:postgres@auth-db-service:5432/auth_db" \
  --from-literal=google-client-id="your_id" \
  --from-literal=google-client-secret="your_secret" \
  --from-literal=jwt-secret="your-jwt-secret"

# Payment secrets
kubectl create secret generic payment-secrets \
  --from-literal=database-url="postgresql://postgres:postgres@payment-db-service:5432/payment_db" \
  --from-literal=razorpay-key-id="your_key" \
  --from-literal=razorpay-key-secret="your_secret" \
  --from-literal=jwt-secret="your-jwt-secret"

# AI secrets
kubectl create secret generic ai-secrets \
  --from-literal=gemini-api-key="your_gemini_key" \
  --from-literal=upstash-vector-rest-url="your_url" \
  --from-literal=upstash-vector-rest-token="your_token" \
  --from-literal=jwt-secret="your-jwt-secret"
```

---

## 🔄 4. Daily Development Workflow

> After initial setup, you **don't** need to reconfigure secrets or ArgoCD.

| Mode | Daily Steps |
|:---|:---|
| **Native** | Just run `npm run run-local` |
| **K8s** | `./scripts/deploy-local.sh` → Port forward |

---

## 🤖 5. CI/CD Pipeline

```mermaid
flowchart LR
  Push --> CI[Actions]
  CI --> Lint
  Lint --> Build
  Build --> GHCR
  GHCR --> Argo[ArgoCD]
  Argo --> K8s
```

> **⚠️ Important**: Add `GOOGLE_CLIENT_ID` to GitHub Repository Secrets. Next.js `NEXT_PUBLIC_` variables are baked into the Docker image at build time.

### Adding the GitHub Secret

1. Repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `GOOGLE_CLIENT_ID` → Value: `your_client_id.apps.googleusercontent.com`

---

## 🎨 6. Customization Guide

When forking for your own project, search and replace these values:

| Find | Replace With | Affects |
|:---|:---|:---|
| `luff-org` | Your GitHub org (lowercase) | K8s images, Docker tags, CI/CD |
| `Luff-Org` | Your GitHub org | Git URLs, ArgoCD config |
| `Luff-Boilerplate` | Your repo name | Clone URLs, package names |

### Key Files to Update

| File | What to Change |
|:---|:---|
| `argocd/application.yaml` | `repoURL` → your repository |
| `.github/workflows/pipeline.yml` | `NEXT_PUBLIC_API_URL` → your domain |
| `k8s/*.yaml` | Image paths → your registry |
| All `DATABASE_URL` strings | If you rename databases |
