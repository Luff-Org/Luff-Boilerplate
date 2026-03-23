#!/usr/bin/env bash
set -e

echo "🚀 Switching to Local Native Development Mode..."

# 1. Releasing host ports from Kubernetes (LoadBalancer ports)
echo "🛑 Releasing host ports from Kubernetes (Freeing 4000, 3000)..."
kubectl delete service api-gateway frontend-service 2>/dev/null || true
kubectl scale deployment api-gateway frontend-app --replicas=0 2>/dev/null || true
pkill -f "kubectl port-forward" || true

# Forcefully kill any process on ports 4000, 4001, 4002, 4003 and 3000
for port in 4000 4001 4002 4003 3000; do
    echo "🧹 Clearing port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
done

# Verification loop for port 4000
echo "⌛ Waiting for port 4000 to be released..."
while lsof -i:4000 >/dev/null 2>&1; do
    lsof -ti:4000 | xargs kill -9 2>/dev/null || true
    sleep 1
done
echo "✅ Port 4000 is now free."

# 2. Start Databases
echo "📂 Starting databases via Docker Compose..."
docker compose -f docker/docker-compose.yml up auth-db posts-db payment-db -d

# 3. Refresh dependencies & Generate Prisma Clients
echo "🛠️ Refreshing dependencies and generating Prisma Clients..."
npm install
npm run db:generate --workspaces --if-present

# 4. Run Application in Native Mode
echo "🚀 Launching all services (Native Mode)..."
npm run dev
