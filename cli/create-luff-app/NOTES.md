# Luff Boilerplate

This repository contains a full-stack Next.js + Node.js Microservices architecture boilerplate, ready for local execution and seamless Kubernetes (K8s) deployment via ArgoCD.

Everything is containerized, fully configured for Google OAuth authentication, and automatically validated with CI/CD.

---

## 🚀 1. Initial Setup Required

Before running this project for the first time, you must configure your environment locally.

### Prerequisites:

- **Node.js** (v20+)
- **Docker** and **Docker Desktop / Minikube**
- **kubectl** (connected to your local Kubernetes cluster)
- **ArgoCD** (must be installed on your local Kubernetes cluster)

### Step 1: Install Dependencies & Setup Env Files

We have an automated setup script that installs NPM packages and copies the required `.env.example` files to `.env`.

```bash
npm run setup
```

Wait for `npm install` and Husky to finish.

### Step 2: Configure Environment Variables

You MUST explicitly provide Google OAuth credentials and URLs for the frontend build and backend authentication to work. Check these three `.env` files and verify their values.

**1. `frontend/.env`**

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**2. `backend/auth/.env`**

```env
PORT=4001
JWT_SECRET="your-jwt-secret-change-in-production"
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**3. `backend/posts/.env`**

```env
PORT=4002
JWT_SECRET="your-jwt-secret"
NODE_ENV=development
```

**4. `backend/payment/.env`**

```env
PORT=4003
RAZORPAY_KEY_ID=rzp_test_your_id
RAZORPAY_KEY_SECRET=your_secret_key
DATABASE_URL="postgresql://postgres:postgres@localhost:5435/payment_db"
JWT_SECRET="your-jwt-secret"
NODE_ENV=development
```

### Step 3: Kubernetes Secrets

```bash
# App, Auth & Posts Secrets (...)

# Create Payment Secrets
kubectl create secret generic payment-secrets \
  --from-literal=database-url="postgresql://postgres:postgres@payment-db-service:5432/payment_db" \
  --from-literal=razorpay-key-id="your_key" \
  --from-literal=razorpay-key-secret="your_secret" \
  --from-literal=jwt-secret="your-jwt-secret"
```

---

## 🌟 2. How To Run Locally

We support two modes of development:

### 1. Native Mode (Recommended)

This is the fastest loop. Run everything directly on your machine:

```bash
npm run run-local
```

This script handles:

- Stopping K8s port conflicts
- Starting local Docker DBs
- Running all services via `npm run dev`

### 2. Kubernetes Mode (GitOps)

Follow this if you want to test the full K8s stack:

1. **Build & Deploy**: `npm run run-k8s build`
2. **Access Dashboard**: `npm run argo`
3. **Connect Ports**: `npm run access`

We utilize ArgoCD as the GitOps agent. It constantly monitors your main branch's `k8s/` folder and applies the configuration locally.

### Step 1: Tell ArgoCD to watch your directory

Apply the custom Application configuration directly:

```bash
kubectl apply -f argocd/application.yaml
```

### Step 2: Build the Local Images (Automated)

Your Kubernetes `Deployment` manifests are configured to pull from `ghcr.io/luff-org/...` with an `IfNotPresent` pull policy. To run the images locally exactly as they are configured in your manifests, **we have created an automation script**.

This script pulls your `.env` Client ID, tags images according to your current commit SHA (what ArgoCD expects), and restarts the Kubernetes pods.

```bash
./scripts/deploy-local.sh
```

### Step 3: Port Forwarding

Because we are working locally, we must manually expose K8s services to `localhost`:

```bash
# Terminal 1 - For the Frontend Application
kubectl port-forward svc/frontend-service 3000:3000

# Terminal 2 - For the API Gateway (Backend)
kubectl port-forward svc/api-gateway 4000:4000
```

Visit `http://localhost:3000` — Your Google OAuth login will be functioning seamlessly.

---

## 🔄 3. What To Do Whenever You Run This Afterwards

When returning to development on a new day, you **DO NOT** need to repeat the secret configuration or ArgoCD setup. You just have to build any new changes and run your port-forwards.

1. **Commit your code to Git**: Or ArgoCD will desync!
2. **Run the Automation Script**: To push the newest changes directly to your local cluster:
   ```bash
   ./scripts/deploy-local.sh
   ```
3. **Start your tunnels**:
   ```bash
   kubectl port-forward svc/frontend-service 3000:3000
   kubectl port-forward svc/api-gateway 4000:4000
   ```

_(Alternatively, if you only want to develop quickly on your host machine WITHOUT Kubernetes, you can bypass Docker altogether by running `npm run dev` in the root folder!)_

---

## 🤖 4. Ensuring Automation Works (GitHub Actions CI/CD)

Whenever you push to `main` on GitHub, our unified pipeline (`.github/workflows/pipeline.yml`) runs automatically.

**To ensure this workflow succeeds on the cloud:**
You MUST add your `GOOGLE_CLIENT_ID` to GitHub Secrets. Failure to do so means the Cloud-built Docker image will have an empty Google Client ID baked into its statically-generated frontend!

**Go to GitHub**:

1. Open Repository > `Settings`
2. Navigate to `Secrets and variables` > `Actions`
3. Click `New repository secret`
4. **Name**: `GOOGLE_CLIENT_ID`
5. **Secret**: `your_client_id.apps.googleusercontent.com`
6. Click **Add secret**.

_(The frontend URL and other runtime variables are dynamically passed, but Next.js `NEXT_PUBLIC_` variables are physically built into the Docker image, so this is strictly required!)\_

---

## 🎨 5. Personalization & Customization (For New Users)

If you are cloning this boilerplate to start your own project, you need to update a few hardcoded values to point to your own GitHub Organization and Repository.

### Step 1: Search and Replace

Search the entire repository for `luff-org` and replace it with your own **GitHub Username** or **Organization Name** (in lowercase).

- **Impacts**: K8s image paths, Docker tags, and CI/CD registry paths.

### Step 2: Update ArgoCD Repo URL

Open `argocd/application.yaml` and update the `repoURL` to point to your new fork or repository:

```yaml
repoURL: https://github.com/YOUR_ORG/YOUR_REPO.git
```

### Step 3: Update Production API URL

Open `.github/workflows/pipeline.yml` and update the `NEXT_PUBLIC_API_URL` under the `Build & Push` job to your actual production domain:

```yaml
build-args: |
  NEXT_PUBLIC_API_URL=https://api.your-actual-domain.com
```

### Step 4: Database Names & Secrets

If you change the service names or database names in the `k8s/` manifests, remember to update the corresponding `DATABASE_URL` strings in your **Kubernetes Secrets** (Step 1.3 above).
