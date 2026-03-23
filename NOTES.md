# 📘 Luff Boilerplate Technical Manual

This document provides an end-to-end technical deep-dive into the architecture, implementation, and operational flows of the Luff Microservices Boilerplate.

---

## 🏗️ 1. High-Level Architecture

The boilerplate is a **Monorepo** using **NPM Workspaces** and **Turborepo** to manage multiple independent services and shared code.

### The Flow:

1. **User** accesses the **Frontend (Next.js)**.
2. The Frontend communicates ONLY with the **API Gateway**.
3. The **API Gateway** acts as a Reverse Proxy, forwarding requests to the appropriate microservice (Auth, Posts, or Payment).
4. Each microservice has its own **isolated PostgreSQL database** managed by **Prisma**.

---

## 🛡️ 2. Authentication & Security (End-to-End)

We use a **Stateless JWT-based Authentication** system.

### A. The Login Flow:

1. **Frontend**: The user clicks "Login with Google". We use `@react-oauth/google` to get a `postMessage` token.
2. **Auth Service**: The backend receives the Google credential, validates it with Google servers, and checks if the user exists in the `Auth DB`.
3. **JWT Generation**: The Auth Service signs a JWT containing the `userId`.
4. **JWT Storage**: The Frontend stores this JWT in `localStorage`.

### B. Authenticated Requests:

1. For every protected request (e.g., `POST /posts`), the Frontend attaches the JWT to the `Authorization: Bearer <token>` header.
2. **Gateway**: Passes the request through to the target service.
3. **Auth Middleware**: Every service (Posts, Payment) has an `authMiddleware`. It parses the JWT using the shared `JWT_SECRET`. If valid, it attaches `req.user` to the request object. If invalid/missing, it returns `401 Unauthorized`.

---

## 📡 3. Microservices Directory

### 🟢 API Gateway (Port 4000)

- **Role**: Entry point for all backend traffic.
- **Tech**: Express + `http-proxy-middleware`.
- **Logic**: Routes `/auth/*` → Port 4001, `/posts/*` → Port 4002, `/payment/*` → Port 4003.
- **Security**: Implements CORS (allowing `localhost:3000`) and basic rate limiting.

### 🔐 Auth Service (Port 4001)

- **Database**: `auth_db` (Postgres).
- **Key Logic**: Manages User profiles and Google OAuth integration.
- **Routes**:
  - `POST /auth/google`: Handles OAuth login/signup.
  - `GET /auth/me`: Returns the current user's profile.

### 📝 Posts Service (Port 4002)

- **Database**: `posts_db` (Postgres).
- **Key Logic**: CRUD operations for user posts.
- **Routes**:
  - `GET /posts`: Publicly list all posts.
  - `POST /posts`: (Protected) Create a new post.
  - `DELETE /posts/:id`: (Protected) Delete a post (owner only).

### 💳 Payment Service (Port 4003)

- **Role**: Razorpay Gateway Wrapper.
- **Key Logic**: Handles server-side order creation and payment verification via Razorpay SDK.
- **Routes**:
  - `POST /payments/create-order`: Generates a Razorpay `order_id`.
  - `POST /payments/verify`: Validates the payment signature using your secret key.

---

## 🗄️ 4. Shared Packages (`/shared`)

To maintain "DRY" (Don't Repeat Yourself) code, we use internal packages:

- **`@shared/config`**: Centralized environment variable management.
- **`@shared/logger`**: Unified pino-based logging across all services.
- **`@shared/types`**: Shared TypeScript interfaces (e.g., `User`, `Post`).

---

## ⚙️ 5. DevOps & Automation

### A. Local Development Workflow

We built `scripts/run-local.sh` to solve the "Kubernetes vs. Local" port conflict.

- **Native Dev**: Runs `npm run dev` in the root. Services talk to each other directly on `localhost`.
- **K8s Dev**: Uses `run-on-k8s.sh`. Images are built, tagged with the current Git SHA, and deployed to your local cluster.

### B. CI/CD Pipeline

- **GitHub Actions**: Every push to `main` triggers `.github/workflows/pipeline.yml`.
- **Lint & Build**: Validates code quality and type safety.
- **Docker Build**: Builds production-ready Alpine images.
- **ArgoCD**: Monitors the `/k8s` folder. As soon as CI pushes new image tags to the manifests, ArgoCD "Syncs" and redeploys your local cluster!

---

## 🎨 6. Frontend Architecture

### A. State Management

- **React Query**: Handles all server-state (fetching posts, user data).
- **Global Context**: `providers.tsx` wraps the app with the necessary providers (QueryClient, Toaster).

### B. UI & Feedback

- **Sonner**: Used for premium, animated notifications. Every server action (Success/Error) triggers a toast.
- **TailwindCSS**: Used for all styling (no generic CSS).

---

## 💡 7. Pro-Tips for Extending

1. **Add a new service**: Use `npm run create-service`.
2. **Add a DB field**: Update `schema.prisma` in the service, then run `npm run db:push --workspace=@backend/yourservice`.
3. **Debug a Service**: Look for logs prefixed with the service name in your terminal (thanks to Turborepo!).
