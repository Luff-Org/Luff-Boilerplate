# 📝 Operational Notes & Fixes

This file contains important notes on how to run, debug, and fix common issues encountered during development and deployment of this boilerplate.

---

## ☸️ Running in Kubernetes (Local)

To run the full stack in your local Kubernetes cluster (Docker Desktop):

### 1. Build Local Images

Kubernetes is configured to use local images (`imagePullPolicy: Never`). Build them first:

```bash
docker compose -f docker/docker-compose.yml build
```

### 2. Start Databases

Backend services in K8s currently connect to the Docker Compose databases via `host.docker.internal`:

```bash
docker compose -f docker/docker-compose.yml up auth-db posts-db -d
```

### 3. Deploy

```bash
kubectl apply -f k8s/
```

### 4. Access the App

The API Gateway is exposed via LoadBalancer at `:4000`. The frontend requires port-forwarding:

```bash
kubectl port-forward svc/frontend-service 3000:3000
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🛠️ Common Fixes & Troubleshooting

### 1. Database Connection Refused (Mac/Node 18+)

**Issue**: `npm run dev` fails with `PrismaClientInitializationError: Can't reach database server at localhost:5433`.
**Cause**: Node.js 18+ resolves `localhost` to IPv6 `::1`, but Docker Desktop maps ports to IPv4 `127.0.0.1`.
**Fix**: Update `.env` files to use `127.0.0.1` explicitly:

```text
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5433/auth_db"
```

### 2. Google OAuth "Invalid Client" (Docker/K8s)

**Issue**: Logging in via Docker or K8s results in an "invalid client" error from Google.
**Cause**: Missing or mismatched `GOOGLE_CLIENT_ID` during build/runtime.
**Fixes**:

- **Root .env**: Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in the root `.env` for `docker compose` to pick them up.
- **Frontend Build**: Next.js bakes `NEXT_PUBLIC_` variables at **build time**. If you change your client ID, you **must rebuild** the frontend:
  ```bash
  docker compose -f docker/docker-compose.yml build frontend
  ```

### 3. Prisma Engine Errors in Alpine Docker

**Issue**: `Error: libssl.so.1.1: No such file or directory`.
**Cause**: Prisma engine requires OpenSSL, which is missing in minimal Alpine images.
**Fix**:

1. Add `RUN apk add --no-cache openssl` to the `runner` stage of your Dockerfile.
2. Ensure `binaryTargets` in `schema.prisma` includes `linux-musl-arm64-openssl-3.0.x`.

---

## 📜 Key Commands Summary

| Task                    | Command                                                                                 |
| :---------------------- | :-------------------------------------------------------------------------------------- | ------------------- |
| **Clean Restart Dev**   | `docker compose -f docker/docker-compose.yml up auth-db posts-db -d && npm run dev`     |
| **Full Build (Docker)** | `docker compose -f docker/docker-compose.yml build`                                     |
| **Check K8s Pods**      | `kubectl get pods`                                                                      |
| **K8s Log Tail**        | `kubectl logs <pod-name> -f`                                                            |
| **K8s Secret Update**   | `kubectl create secret generic auth-secrets --from-literal=... --dry-run=client -o yaml | kubectl apply -f -` |
