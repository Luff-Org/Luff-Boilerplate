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

           ┌──────────────┐    ┌──────────────┐
           │  Auth App    │    │  Posts App   │
           │  (Next.js)   │    │  (Next.js)   │
           │    :3001     │    │    :3002     │
           └──────────────┘    └──────────────┘
```

## Tech Stack

| Layer        | Technology                         |
| ------------ | ---------------------------------- |
| Frontend     | Next.js 14, React, TailwindCSS     |
| API Client   | Axios, React Query                 |
| Backend      | Node.js, Express, TypeScript       |
| Database     | PostgreSQL, Prisma ORM             |
| Auth         | Google OAuth, JWT                  |
| Gateway      | http-proxy-middleware, rate-limit  |
| Monorepo     | Turborepo, npm workspaces          |
| Logging      | Pino                               |
| Config       | Zod validation, dotenv             |
| Docker       | Multi-stage builds                 |
| Orchestrator | Kubernetes                         |
| Code Quality | ESLint, Prettier, Husky, Commitlint|

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd microservices-boilerplate
npm install

# 2. Copy environment files
bash scripts/setup.sh

# 3. Start databases (requires Docker)
docker compose -f docker/docker-compose.yml up auth-db posts-db -d

# 4. Push database schemas
npm run db:push --workspace=@backend/auth
npm run db:push --workspace=@backend/posts

# 5. Start all services
npm run dev
```

This starts:

| Service        | URL                     |
| -------------- | ----------------------  |
| API Gateway    | http://localhost:4000   |
| Auth Service   | http://localhost:4001   |
| Posts Service  | http://localhost:4002   |
| Auth Frontend  | http://localhost:3001   |
| Posts Frontend | http://localhost:3002   |

## Project Structure

```
├── frontend/
│   ├── apps/
│   │   ├── auth/          # Next.js auth app (login)
│   │   └── posts/         # Next.js posts app
│   └── packages/
│       ├── ui/            # Shared React components
│       ├── hooks/         # Shared React Query hooks
│       ├── api-client/    # Axios API client
│       └── types/         # Frontend TypeScript types
├── backend/
│   ├── auth/              # Auth microservice (Google OAuth, JWT)
│   ├── posts/             # Posts microservice (CRUD)
│   └── api-gateway/       # API Gateway (proxy, rate-limit)
├── shared/
│   ├── types/             # Shared backend TypeScript types
│   ├── logger/            # Pino logger
│   ├── config/            # Zod env validation
│   └── eslint-config/     # Shared ESLint config
├── docker/                # Docker Compose
├── k8s/                   # Kubernetes manifests
└── scripts/               # Shell scripts
```

## API Endpoints

### Auth Service

| Method | Endpoint       | Auth | Description          |
| ------ | -------------- | ---- | -------------------- |
| POST   | /auth/google   | No   | Google OAuth login   |
| GET    | /auth/me       | Yes  | Get current user     |
| POST   | /auth/logout   | Yes  | Logout               |

### Posts Service

| Method | Endpoint       | Auth | Description          |
| ------ | -------------- | ---- | -------------------- |
| GET    | /posts         | No   | List all posts       |
| GET    | /posts/:id     | No   | Get post by ID       |
| POST   | /posts         | Yes  | Create a post        |
| DELETE | /posts/:id     | Yes  | Delete a post        |

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
```

## Kubernetes

```bash
# Apply manifests
kubectl apply -f k8s/

# Create secrets first
kubectl create secret generic auth-secrets \
  --from-literal=database-url='...' \
  --from-literal=jwt-secret='...' \
  --from-literal=google-client-id='...' \
  --from-literal=google-client-secret='...'

kubectl create secret generic posts-secrets \
  --from-literal=database-url='...' \
  --from-literal=jwt-secret='...'
```

## Environment Variables

### Auth Service

| Variable              | Description              |
| --------------------- | ------------------------ |
| `PORT`                | Service port (4001)      |
| `DATABASE_URL`        | PostgreSQL connection    |
| `JWT_SECRET`          | JWT signing secret       |
| `GOOGLE_CLIENT_ID`    | Google OAuth client ID   |
| `GOOGLE_CLIENT_SECRET`| Google OAuth secret      |

### Posts Service

| Variable       | Description              |
| -------------- | ------------------------ |
| `PORT`         | Service port (4002)      |
| `DATABASE_URL` | PostgreSQL connection    |
| `JWT_SECRET`   | JWT signing secret       |

### API Gateway

| Variable            | Description              |
| ------------------- | ------------------------ |
| `PORT`              | Gateway port (4000)      |
| `AUTH_SERVICE_URL`  | Auth service URL         |
| `POSTS_SERVICE_URL` | Posts service URL        |

## Scripts

```bash
npm run dev       # Start all services (Turborepo)
npm run build     # Build all services
npm run lint      # Lint all services
npm run format    # Format all files with Prettier
```

## License

MIT
