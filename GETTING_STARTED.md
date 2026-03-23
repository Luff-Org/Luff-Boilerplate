# Getting Started

Complete guide for a new developer to set up and run this project from scratch.

---

## Prerequisites

Install the following before starting:

| Tool    | Minimum Version | Install Link                       |
| ------- | --------------- | ---------------------------------- |
| Node.js | 20.x            | https://nodejs.org                 |
| npm     | 10.x            | Comes with Node.js                 |
| Docker  | 24.x            | https://docs.docker.com/get-docker |
| Git     | 2.x             | https://git-scm.com                |

Verify installation:

```bash
node -v    # Should print v20.x.x or higher
npm -v     # Should print 10.x.x or higher
docker -v  # Should print Docker version 24.x or higher
```

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/Luff-Org/Luff-Boilerplate.git
cd Luff-Boilerplate
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This installs dependencies for **all** workspaces (frontend, backend services, shared packages) in one command via npm workspaces + Turborepo.

---

## Step 3 — Set Up Environment Variables

Copy `.env.example` files to their respective `.env` files:

```bash
# Backend
cp backend/auth/.env.example backend/auth/.env
cp backend/posts/.env.example backend/posts/.env
cp backend/api-gateway/.env.example backend/api-gateway/.env

# Frontend
cp frontend/.env.example frontend/.env
```

**Or use the setup script** (does this automatically):

```bash
bash scripts/setup.sh
```

---

## Step 4 — Start the Databases

Both backend services need their own PostgreSQL instance. Start them via Docker:

```bash
docker compose -f docker/docker-compose.yml up auth-db posts-db -d
```

This starts:

| Database | Port | Credentials                      |
| -------- | ---- | -------------------------------- |
| Auth DB  | 5433 | `postgres:postgres` / `auth_db`  |
| Posts DB | 5434 | `postgres:postgres` / `posts_db` |

Verify databases are healthy:

```bash
docker ps
```

You should see three `postgres:16-alpine` containers.

---

## Step 5 — Set Up Prisma (Database Schemas)

Generate the custom isolated Prisma clients and push schemas to the databases:

```bash
# Auth service
cd backend/auth && npm run db:push && npm run db:generate && cd ../..

# Posts service
cd backend/posts && npm run db:push && npm run db:generate && cd ../..
```

_(Note: These services use isolated local Prisma generated folders to avoid monorepo type collisions)._

---

## Step 6 — Configure Google OAuth

... (Step 6 remains the same)

---

## Step 7 — Start All Services

There are two ways to run the project locally:

### 1. Native Mode (Fastest for Dev)

If you just want to code on your host machine without Kubernetes:

```bash
npm run run-local
```

_(This script will clear any port conflicts, start your Docker databases, and run all services in watch mode.)_

### 2. Kubernetes Mode (Production Test)

If you want to test the full production-like environment:

```bash
npm run run-k8s build
npm run access
```

---

## Step 8 — Verify Everything Works

### Health Checks

Open these URLs in your browser or with `curl`:

```bash
curl http://localhost:4000/health   # → {"status":"ok","service":"api-gateway"}
curl http://localhost:4001/health   # → {"status":"ok","service":"auth"}
curl http://localhost:4002/health   # → {"status":"ok","service":"posts"}
curl http://localhost:4003/health   # → {"status":"ok","service":"payment"}
```

### The Application

| App            | URL                   |
| -------------- | --------------------- |
| Unified Web UI | http://localhost:3000 |

Navigate to the UI to test the layout. Click **"Login"** to start the Google `@react-oauth/google` popup flow. Once logged in, head over to **"Posts"** or **"Store"** to try out the microservices!

---

## Service Map

| Service         | Port | Description                 |
| --------------- | ---- | --------------------------- |
| API Gateway     | 4000 | Routes requests to services |
| Auth Service    | 4001 | Google OAuth + JWT          |
| Posts Service   | 4002 | Posts CRUD                  |
| Payment Service | 4003 | Razorpay Gateway Wrapper    |
| Next.js App     | 3000 | Unified Web Interface       |
| Auth DB         | 5433 | PostgreSQL for auth         |
| Posts DB        | 5434 | PostgreSQL for posts        |

---

## Common Issues

### `Cannot find module '../../prisma/generated/client'`

If your app complains about a missing Prisma generated client, or `findUnique` is undefined:

```bash
cd backend/<problematic-service>
npm run db:generate
```

### `ECONNREFUSED` on database connection

Make sure Docker databases are running:

```bash
docker compose -f docker/docker-compose.yml up auth-db posts-db -d
```

### `Invalid environment variables`

Make sure you copied `.env.example` to `.env` for every service (Step 3).

---

## Stopping Everything

```bash
# Stop Node.js services
# Press Ctrl+C in the terminal running `npm run dev`

# Stop databases
docker compose -f docker/docker-compose.yml down
```

To also delete database data (wipe clean):

```bash
docker compose -f docker/docker-compose.yml down -v
```
