# 📘 LUFF. Technical Manual

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Microservices-6366f1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Pattern-Monorepo-34d399?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Auth-Stateless_JWT-f59e0b?style=for-the-badge" />
</p>

> A comprehensive deep-dive into every architectural decision, data flow, and service boundary in the LUFF. ecosystem.

---

## 🧬 1. System Architecture

```mermaid
graph TB
  subgraph "Client Layer"
    U["👤 User"] --> FE["🖥️ Next.js 14 Frontend<br/><i>:3000 • React Query • Tailwind</i>"]
  end

  subgraph "Orchestration Layer"
    FE -->|"All API traffic"| GW["🛡️ API Gateway<br/><i>:4000 • CORS • Rate Limit</i>"]
  end

  subgraph "Domain Services"
    GW -->|"/auth/*"| AUTH["🔐 Auth Service<br/><i>:4001</i>"]
    GW -->|"/posts/*"| POSTS["📝 Posts Service<br/><i>:4002</i>"]
    GW -->|"/payments/*"| PAY["💳 Payment Service<br/><i>:4003</i>"]
    GW -->|"/ai/*"| AI["🧠 AI Service<br/><i>:4004</i>"]
  end

  subgraph "Data Layer"
    AUTH --> DB1[("🗄️ auth_db<br/>:5433")]
    POSTS --> DB2[("🗄️ posts_db<br/>:5434")]
    PAY --> DB3[("🗄️ payment_db<br/>:5435")]
    AI --> VS["🔮 Upstash Vector"]
    AI --> GM["✨ Gemini 2.5 Flash"]
  end

  style AI fill:#4c1d95,stroke:#c084fc,color:#e2e8f0
  style GM fill:#7c3aed,stroke:#a78bfa,color:#e2e8f0
  style GW fill:#1e1b4b,stroke:#818cf8,color:#e2e8f0
```

### Key Principles

| Principle | Implementation |
|:---|:---|
| **Service Isolation** | Each microservice has its own DB, Prisma schema, and deployment unit |
| **Single Entry Point** | All traffic flows through the API Gateway — no direct service access |
| **Stateless Auth** | JWT tokens with no server-side sessions |
| **Domain Boundaries** | Auth, Content, Payments, and Intelligence are separate domains |

---

## 🧠 2. AI Service — Deep Dive

The AI domain is the most architecturally significant service — providing production-ready intelligence.

### RAG Pipeline Flow

```mermaid
flowchart LR
  subgraph "Ingestion Pipeline"
    A["📄 PDF Upload"] --> B["📦 pdfjs-dist<br/><i>Text Extraction</i>"]
    B --> C["✂️ Recursive<br/>Text Splitter"]
    C --> D["🔢 768-dim<br/>Embeddings"]
    D --> E["☁️ Upstash<br/>Vector Store"]
  end

  subgraph "Query Pipeline"
    F["💬 User Question"] --> G["🔍 Semantic<br/>Search"]
    E -.->|"Top-K Results"| G
    G --> H["📋 Context<br/>Assembly"]
    H --> I["✨ Gemini 2.5<br/>Flash"]
    I --> J["💬 Grounded<br/>Response"]
  end

  style I fill:#4c1d95,stroke:#c084fc,color:#e2e8f0
  style E fill:#065f46,stroke:#34d399,color:#e2e8f0
```

### AI Capabilities

| Feature | Technology | Details |
|:---|:---|:---|
| **Chat** | Gemini 2.5 Flash | Direct conversational AI with low latency |
| **RAG** | Upstash Vector | PDF-grounded answers using semantic retrieval |
| **Embeddings** | 768-dimensional | Optimized for Gemini's embedding model |
| **PDF Parsing** | pdfjs-dist | Multi-page document extraction |

### AI Routes

| Route | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `POST /ai/ask` | POST | ✅ | Send a message, get AI response (generic or RAG) |
| `POST /ai/upload-pdf` | POST | ✅ | Upload PDF for RAG indexing |

---

## 🔐 3. Authentication — End-to-End Flow

```mermaid
sequenceDiagram
  participant U as 👤 User
  participant F as 🖥️ Frontend
  participant G as 🔑 Google OAuth
  participant A as 🔐 Auth Service
  participant DB as 🗄️ Auth DB

  rect rgb(30, 27, 75)
    Note over U,DB: Login Flow
    U->>F: Click "Login with Google"
    F->>G: Open OAuth Popup
    G-->>F: credential (ID Token)
    F->>A: POST /auth/google
    A->>G: Verify token with Google servers
    G-->>A: { email, name, picture }
    A->>DB: Upsert user record
    A->>A: Sign JWT { userId, email }
    A-->>F: { token, user }
    F->>F: Store JWT in localStorage
  end

  rect rgb(6, 95, 70)
    Note over U,DB: Authenticated Request
    U->>F: Navigate to protected page
    F->>A: GET /auth/me (Bearer token)
    A->>A: Verify JWT signature
    A->>DB: Fetch user by ID
    A-->>F: { user profile }
  end
```

### How JWT Flows Across Services

```mermaid
flowchart LR
  A["🖥️ Frontend<br/><i>Attaches JWT</i>"] --> B["🛡️ Gateway<br/><i>Passes through</i>"]
  B --> C["🔐 Auth Middleware<br/><i>In every service</i>"]
  C -->|"Valid"| D["✅ req.user attached"]
  C -->|"Invalid"| E["❌ 401 Unauthorized"]

  style C fill:#92400e,stroke:#f59e0b,color:#e2e8f0
```

> Every backend service shares the same `JWT_SECRET` and runs identical middleware. The Gateway does **not** validate tokens — each service handles its own auth.

### Auth Routes

| Route | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `POST /auth/google` | POST | ❌ | Exchange Google token for JWT |
| `GET /auth/me` | GET | ✅ | Get current user profile |

---

## 💳 4. Payment Service — Transaction Architecture

```mermaid
sequenceDiagram
  participant U as 👤 User
  participant F as 🖥️ Frontend
  participant P as 💳 Payment Service
  participant R as 🏦 Razorpay API
  participant DB as 🗄️ Payment DB

  rect rgb(59, 31, 43)
    Note over U,DB: Purchase Flow
    U->>F: Click "Buy" on Store page
    F->>P: POST /payments/create-order { amount }
    P->>R: razorpay.orders.create()
    R-->>P: { order_id, amount, currency }
    P-->>F: Return order details

    F->>R: Open Razorpay Checkout Modal
    U->>R: Enter card / UPI details
    R-->>F: { razorpay_payment_id, razorpay_signature }

    F->>P: POST /payments/verify
    P->>P: HMAC-SHA256 signature verification
    P->>DB: INSERT transaction record ✅
    P-->>F: { success: true }
  end
```

### Payment Routes

| Route | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `POST /payments/create-order` | POST | ✅ | Generate Razorpay order ID |
| `POST /payments/verify` | POST | ✅ | Verify payment signature (HMAC-SHA256) |
| `GET /payments/my-purchases` | GET | ✅ | Fetch user's transaction history |

### Security Model

| Layer | Implementation |
|:---|:---|
| **Server-side orders** | Orders are created on the backend — amount cannot be tampered |
| **Signature verification** | HMAC-SHA256 using Razorpay secret prevents forged payments |
| **Transaction ledger** | Every verified payment is stored in isolated `payment_db` |

---

## 📝 5. Posts Service — Community Engine

| Route | Method | Auth | Description |
|:---|:---:|:---:|:---|
| `GET /posts` | GET | ❌ | List all posts (public) |
| `POST /posts` | POST | ✅ | Create post (authenticated) |
| `DELETE /posts/:id` | DELETE | ✅ | Delete own post (owner enforcement) |

- **Owner Enforcement**: Users can only delete their own posts — the service compares `req.user.id` with the post's `authorId`
- **Database**: Isolated PostgreSQL (`posts_db`) with Prisma ORM

---

## 🛡️ 6. API Gateway — Orchestration Hub

```mermaid
flowchart LR
  subgraph "Incoming Request"
    A["🌐 Client Request"]
  end

  subgraph "Gateway :4000"
    B["CORS Check"] --> C["Rate Limiter"]
    C --> D{"Route Matcher"}
  end

  D -->|"/auth/*"| E["→ :4001"]
  D -->|"/posts/*"| F["→ :4002"]
  D -->|"/payments/*"| G["→ :4003"]
  D -->|"/ai/*"| H["→ :4004"]

  A --> B

  style D fill:#1e1b4b,stroke:#818cf8,color:#e2e8f0
```

| Feature | Implementation |
|:---|:---|
| **Proxy** | `http-proxy-middleware` for transparent request forwarding |
| **CORS** | Whitelist `localhost:3000` (configurable) |
| **Rate Limiting** | Prevents abuse on all endpoints |
| **Health Check** | `GET /health` returns service status |

---

## 🔑 7. Credentials Matrix

| Platform | Secrets Needed | Target `.env` File(s) | Console Link |
|:---|:---|:---|:---:|
| **Google AI Studio** | `GEMINI_API_KEY` | `backend/ai-service/.env` | [↗](https://aistudio.google.com/app/apikey) |
| **Upstash** | `REST_URL`, `TOKEN` | `backend/ai-service/.env` | [↗](https://console.upstash.com/vector) |
| **Google Cloud** | `CLIENT_ID`, `CLIENT_SECRET` | `backend/auth/.env`, `frontend/.env` | [↗](https://console.cloud.google.com/apis/credentials) |
| **Razorpay** | `KEY_ID`, `KEY_SECRET` | `backend/payment/.env`, `frontend/.env` | [↗](https://dashboard.razorpay.com/) |
| **Shared** | `JWT_SECRET` | All backend `.env` files | — |

---

## 📦 8. Shared Packages (`/shared`)

| Package | Purpose |
|:---|:---|
| `@shared/config` | Centralized environment variable validation |
| `@shared/logger` | Unified `pino`-based structured logging |
| `@shared/types` | Shared TypeScript interfaces (`User`, `Post`, etc.) |

---

## 🎨 9. Frontend Architecture

```mermaid
flowchart TD
  subgraph "Next.js 14 App Router"
    A["Layout + Providers"] --> B["Navbar<br/><i>Theme Toggle</i>"]
    A --> C["Pages"]
    C --> D["Dashboard"]
    C --> E["Posts"]
    C --> F["Store"]
    C --> G["Chat (AI)"]
    C --> H["Profile"]
    C --> I["Purchases"]
  end

  subgraph "State Management"
    J["React Query<br/><i>Server State</i>"]
    K["ThemeContext<br/><i>Dark/Light Mode</i>"]
    L["useAuth Hook<br/><i>JWT Management</i>"]
  end

  C --> J
  A --> K
  C --> L

  style G fill:#4c1d95,stroke:#c084fc,color:#e2e8f0
```

| Layer | Technology | Purpose |
|:---|:---|:---|
| **Framework** | Next.js 14 (App Router) | SSR, routing, layouts |
| **Styling** | TailwindCSS | Utility-first CSS with dark/light theme |
| **Data** | React Query | Server state caching & mutations |
| **Notifications** | Sonner | Premium animated toasts |
| **Icons** | Lucide React | Consistent icon system |
| **Auth State** | Custom `useAuth` hook | JWT storage, login/logout, user context |

---

## ⚙️ 10. DevOps & CI/CD

```mermaid
flowchart LR
  A["📝 git push main"] --> B["🔄 GitHub Actions"]
  B --> C["Lint & Type Check"]
  C --> D["Docker Build"]
  D --> E["Push to GHCR"]
  E --> F["🔁 ArgoCD Sync"]
  F --> G["☸️ K8s Deploy"]

  style F fill:#065f46,stroke:#34d399,color:#e2e8f0
```

| Stage | Tool | What Happens |
|:---|:---|:---|
| **CI** | GitHub Actions | Lint → Build → Docker Build → Push to `ghcr.io` |
| **CD** | ArgoCD | Watches `/k8s` folder, auto-deploys on manifest changes |
| **Local Dev** | `npm run run-local` | Clears ports, starts DBs, runs all services |
| **K8s Dev** | `npm run run-k8s build` | Builds images tagged with Git SHA, deploys locally |

---

## 💡 11. Pro Tips

| Tip | Command / Action |
|:---|:---|
| Add a new DB field | Edit `schema.prisma` → `npm run db:push` in that service |
| Tune AI context | Adjust `topK` in the AI controller for more/fewer RAG results |
| Debug a service | Logs are prefixed with service name (via Turborepo) |
| Reset databases | `docker compose -f docker/docker-compose.yml down -v` |
| Check all health | `curl localhost:400{0,1,2,3}/health` |
