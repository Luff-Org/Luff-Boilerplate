# Getting Started

Complete guide for a new developer to set up and run this project from scratch.

---

## Prerequisites

Install the following before starting:

| Tool       | Minimum Version | Install Link                                      |
| ---------- | --------------- | ------------------------------------------------- |
| Node.js    | 20.x            | https://nodejs.org                                |
| npm        | 10.x            | Comes with Node.js                                |
| Docker     | 24.x            | https://docs.docker.com/get-docker                |
| Git        | 2.x             | https://git-scm.com                               |

Verify installation:

```bash
node -v    # Should print v20.x.x or higher
npm -v     # Should print 10.x.x or higher
docker -v  # Should print Docker version 24.x or higher
```

---

## Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd Luff-Boilerplate
```

---

## Step 2 — Install Dependencies

```bash
npm install
```

This installs dependencies for **all** workspaces (frontend apps, backend services, shared packages) in one command via npm workspaces + Turborepo.

---

## Step 3 — Set Up Environment Variables

Copy all `.env.example` files to `.env`:

```bash
# Backend
cp backend/auth/.env.example backend/auth/.env
cp backend/posts/.env.example backend/posts/.env
cp backend/api-gateway/.env.example backend/api-gateway/.env

# Frontend
cp frontend/apps/auth/.env.example frontend/apps/auth/.env
cp frontend/apps/posts/.env.example frontend/apps/posts/.env
```

**Or use the setup script** (does the same thing automatically):

```bash
bash scripts/setup.sh
```

---

## Step 4 — Start the Databases

Both backend services need PostgreSQL. Start them with Docker:

```bash
docker compose -f docker/docker-compose.yml up auth-db posts-db -d
```

This starts:

| Database | Port  | Credentials                    |
| -------- | ----- | ------------------------------ |
| Auth DB  | 5433  | `postgres:postgres` / `auth_db`  |
| Posts DB | 5434  | `postgres:postgres` / `posts_db` |

Verify databases are running:

```bash
docker ps
```

You should see two `postgres:16-alpine` containers with status `Up` and `(healthy)`.

---

## Step 5 — Set Up Prisma (Database Schemas)

Generate the Prisma client and push schemas to the databases:

```bash
# Auth service
npx --workspace=@backend/auth prisma generate
npx --workspace=@backend/auth prisma db push

# Posts service
npx --workspace=@backend/posts prisma generate
npx --workspace=@backend/posts prisma db push
```

---

## Step 6 — Configure Google OAuth

> **Skip this step** if you just want to test the Posts service without authentication.

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Set Application Type to **Web application**
4. Add `http://localhost:3001` under **Authorized JavaScript origins**
5. Add `http://localhost:3001` under **Authorized redirect URIs**
6. Copy the **Client ID** and **Client Secret**

Update these files with your credentials:

**`backend/auth/.env`:**
```
GOOGLE_CLIENT_ID=your-actual-google-client-id
GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
```

**`frontend/apps/auth/.env`:**
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-actual-google-client-id
```

---

## Step 7 — Start All Services

```bash
npm run dev
```

Turborepo starts everything in parallel. Wait until you see all services logging their startup messages.

---

## Step 8 — Verify Everything Works

### Health Checks

Open these URLs in your browser or use `curl`:

```bash
curl http://localhost:4000/health   # → {"status":"ok","service":"api-gateway"}
curl http://localhost:4001/health   # → {"status":"ok","service":"auth"}
curl http://localhost:4002/health   # → {"status":"ok","service":"posts"}
```

### Frontend Apps

| App            | URL                      |
| -------------- | ------------------------ |
| Auth (Login)   | http://localhost:3001     |
| Posts           | http://localhost:3002     |

### Test the Posts API

```bash
# Get all posts (no auth required)
curl http://localhost:4000/posts

# Create a post (requires JWT token)
curl -X POST http://localhost:4000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{"title": "Hello World", "content": "My first post"}'
```

---

## Service Map

| Service         | Port | Description                    |
| --------------- | ---- | ------------------------------ |
| API Gateway     | 4000 | Routes requests to services    |
| Auth Service    | 4001 | Google OAuth + JWT             |
| Posts Service   | 4002 | Posts CRUD                     |
| Auth Frontend   | 3001 | Next.js login UI               |
| Posts Frontend  | 3002 | Next.js posts UI               |
| Auth DB         | 5433 | PostgreSQL for auth            |
| Posts DB        | 5434 | PostgreSQL for posts           |

---

## Common Issues

### `Cannot find module '@prisma/client'`
Run Prisma generate:
```bash
npx --workspace=@backend/auth prisma generate
npx --workspace=@backend/posts prisma generate
```

### `ECONNREFUSED` on database connection
Make sure Docker databases are running:
```bash
docker compose -f docker/docker-compose.yml up auth-db posts-db -d
```

### Port already in use
Check if another process is using the port:
```bash
lsof -i :4000   # Replace with the conflicting port
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

To also delete database data:
```bash
docker compose -f docker/docker-compose.yml down -v
```
