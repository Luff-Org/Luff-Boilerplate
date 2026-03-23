#!/usr/bin/env bash
set -e

echo "🚀 Switching to Local Native Development Mode..."

# 1. Clear Kubernetes & Port Conflicts
echo "🛑 Releasing host ports from Kubernetes (Freeing 4000, 3000)..."
# Force-delete services to release host ports
kubectl delete service api-gateway frontend-service --ignore-not-found --wait=true > /dev/null 2>&1 || true
kubectl scale deployment --all --replicas=0 -n default > /dev/null 2>&1 || true
pkill -f "kubectl port-forward" || true

# Verification Loop for Port 4000
echo "⌛ Waiting for port 4000 to be released..."
for i in {1..10}; do
    # Use || true to prevent set -e from killing the script if port is already free
    BLOCKER=$(lsof -ti :4000 || true)
    if [ -z "$BLOCKER" ]; then
        echo "✅ Port 4000 is now free."
        break
    else
        echo "🧹 Kicking process $BLOCKER off port 4000..."
        kill -9 $BLOCKER > /dev/null 2>&1 || true
        sleep 1
    fi
    if [ $i -eq 10 ]; then
        echo "⚠️  Warning: Port 4000 still seems busy."
    fi
done

# Hard kill any remaining process on 3000
echo "🧹 Clearing port 3000..."
lsof -ti :3000 | xargs kill -9 > /dev/null 2>&1 || true

# 2. Ensure databases are running in Docker (Backend needs them)
echo "📂 Starting databases via Docker Compose..."
docker compose -f docker/docker-compose.yml up -d auth-db posts-db

# 3. Clean environment setup for local
# Some services might need to point to 'localhost' instead of 'host.docker.internal' when running natively
export DATABASE_URL_AUTH="postgresql://postgres:postgres@localhost:5433/auth_db"
export DATABASE_URL_POSTS="postgresql://postgres:postgres@localhost:5434/posts_db"

echo "-----------------------------------------------------------"
echo "✨ Launching all services in Dev Mode (Turbo)..."
echo "-----------------------------------------------------------"

# 4. Run the app
npm run dev
