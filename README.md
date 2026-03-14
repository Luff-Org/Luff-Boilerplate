# 💨 Luff Microservices Boilerplate

[![NPM Version](https://img.shields.io/npm/v/create-luff-app?color=blue&style=flat-square)](https://www.npmjs.com/package/create-luff-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

A **production-grade microservices monorepo** designed for speed, scalability, and developer experience. Built with Turborepo, Next.js, Express, Prisma, and PostgreSQL.

---

## 🚀 Quick Start with CLI

The fastest way to scaffold a new project using this boilerplate is with our official CLI:

```bash
npx create-luff-app <your-app-name>
```

> [!TIP]
> This command will clone the repository, install dependencies, and set up your project structure automatically.

---

## 🏗️ Architecture

```text
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

---

## 🛠️ Tech Stack

| Layer        | Technology                                        |
| :----------- | :------------------------------------------------ |
| **Frontend** | Next.js 14 (App Router), TailwindCSS, React Query |
| **Backend**  | Node.js, Express, TypeScript                      |
| **Database** | PostgreSQL, Prisma ORM                            |
| **Auth**     | Google OAuth (PostMessage flow), JWT              |
| **Monorepo** | Turborepo, npm workspaces                         |
| **Infra**    | Docker, Kubernetes (ArgoCD ready)                 |
| **Quality**  | ESLint, Prettier, Husky, Commitlint               |

---

## ⚡ Local Development Setup

Follow these steps to get your environment running from scratch.

### 1. Prerequisites

Ensure you have the following installed:

- **Node.js**: `v20.x` or higher
- **Docker**: For running databases locally

### 2. Installation

If you didn't use the CLI, clone and install manually:

```bash
git clone https://github.com/Luff-Org/Luff-Boilerplate.git
cd Luff-Boilerplate
npm install
```

### 3. Environment & Databases

We provide a setup script to automate `.env` creation:

```bash
# Automatically creates .env files from .env.example
npm run setup

# Spin up PostgreSQL instances via Docker
docker compose -f docker/docker-compose.yml up auth-db posts-db -d
```

### 4. Database Initialization

Generate Prisma clients and push schemas to your local databases:

```bash
# Auth service
cd backend/auth && npm run db:push && npm run db:generate && cd ../..

# Posts service
cd backend/posts && npm run db:push && npm run db:generate && cd ../..
```

### 5. Start Developing

```bash
npm run dev
```

Your services will be available at:

- **Web Interface**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:4000](http://localhost:4000)
- **Auth Service**: [http://localhost:4001](http://localhost:4001)
- **Posts Service**: [http://localhost:4002](http://localhost:4002)

---

## 📂 Project Structure

```text
├── frontend/              # Unified Next.js application
├── backend/
│   ├── auth/              # Auth microservice (Google OAuth + JWT)
│   ├── posts/             # Posts microservice (CRUD)
│   └── api-gateway/       # Express Proxy & Rate Limiting
├── shared/                # Shared internal packages (Types, Logger, Config)
├── docker/                # Docker Compose configurations
├── k8s/                   # Kubernetes manifests
└── scripts/               # Automation & Setup scripts
```

---

## 🔐 Google OAuth Configuration

To enable authentication:

1. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Set authorized origin to `http://localhost:3000`.
3. Update `GOOGLE_CLIENT_ID` in `backend/auth/.env` and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in `frontend/.env`.

---

## 🐳 Deployment

### Docker Compose

```bash
docker compose -f docker/docker-compose.yml up --build
```

### Kubernetes

```bash
kubectl apply -f k8s/
```

---

## 📜 Scripts

| Command         | Description                             |
| :-------------- | :-------------------------------------- |
| `npm run dev`   | Starts all services in development mode |
| `npm run build` | Builds all apps and packages            |
| `npm run setup` | Initializes environment files           |
| `npm run lint`  | Runs linting across the monorepo        |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
