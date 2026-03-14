# Microservices Boilerplate

A **production-grade microservices monorepo** built with Turborepo, TypeScript, Next.js, Express, Prisma, and PostgreSQL.

## Architecture

```
                    ┌─────────────┐
                    │  API Gateway│  :4000
                    │  (Express)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │                         │
        ┌─────┴─────┐           ┌──────┴─────┐
        │   Auth    │           │   Posts    │
        │  Service  │  :4001    │  Service   │  :4002
        │ (Express) │           │  (Express) │
        └─────┬─────┘           └──────┬─────┘
              │                         │
        ┌─────┴─────┐           ┌──────┴─────┐
        │  Auth DB  │           │  Posts DB  │
        │ (Postgres)│           │ (Postgres) │
        └───────────┘           └────────────┘

            ┌─────────────────────────────┐
            │        Frontend App         │
            │          (Next.js)          │
            │            :3000            │
            └─────────────────────────────┘
```

## Tech Stack

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Frontend     | Next.js 14, React, TailwindCSS, React Query |
| API Client   | Axios                                       |
| Backend      | Node.js, Express, TypeScript                |
| Database     | PostgreSQL, Prisma ORM                      |
| Auth         | Google OAuth (PostMessage flow), JWT        |
| Gateway      | http-proxy-middleware, rate-limit           |
| Monorepo     | Turborepo, npm workspaces                   |
| Logging      | Pino                                        |
| Config       | Zod validation, dotenv                      |
| Docker       | Multi-stage builds                          |
| Orchestrator | Kubernetes                                  |
| Code Quality | ESLint, Prettier, Husky, Commitlint         |

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd Luff-Boilerplate
npm install

# 2. Copy environment files
bash scripts/setup.sh

# 3. Start databases (requires Docker)
docker compose -f docker/docker-compose.yml up auth-db posts-db -d

# 4. Generate Prisma clients and push schemas
cd backend/auth && npm run db:push && npm run db:generate && cd ../..
cd backend/posts && npm run db:push && npm run db:generate && cd ../..

# 5. Start all services
npm run dev
```

This starts:

| Service       | URL                   |
| ------------- | --------------------- |
| API Gateway   | http://localhost:4000 |
| Auth Service  | http://localhost:4001 |
| Posts Service | http://localhost:4002 |
| Web Frontend  | http://localhost:3000 |

## Project Structure

```text
├── frontend/              # Unified Next.js application (Auth + Posts)
├── backend/
│   ├── auth/              # Auth microservice (Google OAuth postmessage, JWT)
│   ├── posts/             # Posts microservice (CRUD)
│   └── api-gateway/       # API Gateway (Express proxy, rate-limit)
├── shared/
│   ├── types/             # Shared TypeScript types
│   ├── logger/            # Shared Pino logger setup
│   ├── config/            # Zod env validation schema
│   └── eslint-config/     # Default ESLint rules
├── docker/                # Docker Compose Definitions
├── k8s/                   # Kubernetes Manifests
└── scripts/               # CI/CD and Local Setup Scripts
```

## API Endpoints

### Auth Service (Proxied via Gateway `:4000`)

| Method | Endpoint     | Auth | Description                    |
| ------ | ------------ | ---- | ------------------------------ |
| POST   | /auth/login  | No   | Google OAuth postmessage login |
| GET    | /auth/me     | Yes  | Get current user profile       |
| POST   | /auth/logout | Yes  | Logout (clear session)         |

### Posts Service (Proxied via Gateway `:4000`)

| Method | Endpoint   | Auth | Description    |
| ------ | ---------- | ---- | -------------- |
| GET    | /posts     | No   | List all posts |
| GET    | /posts/:id | No   | Get post by ID |
| POST   | /posts     | Yes  | Create a post  |
| DELETE | /posts/:id | Yes  | Delete a post  |

## Docker

### Run with Docker Compose

```bash
docker compose -f docker/docker-compose.yml up --build
```

### Build individual images

```bash
docker build -f backend/auth/Dockerfile -t auth-service .
docker build -f backend/posts/Dockerfile -t posts-service .
docker build -f backend/api-gateway/Dockerfile -t api-gateway .
docker build -f frontend/Dockerfile -t frontend-app .
```

## Kubernetes

```bash
# Apply all manifests
kubectl apply -f k8s/

# Note: You must manually deploy secrets in your cluster:
# - auth-secrets (database-url, jwt-secret, google auth credentials)
# - posts-secrets (database-url, jwt-secret)
```

## Scripts

```bash
npm run dev       # Start all services (Turborepo)
npm run build     # Build all TypeScript packages & apps
npm run lint      # Lint across the monorepo
```

## License

MIT
