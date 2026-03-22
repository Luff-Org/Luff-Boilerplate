#!/usr/bin/env bash
set -euo pipefail

# 1. Configuration & Sources
REGISTRY_ORG="luff-org"
TAG="latest"

echo "⚙️  Loading Environment Secrets..."
# Load from individual .env files if present
[ -f backend/auth/.env ] && source backend/auth/.env || echo "⚠️ auth .env missing"
[ -f backend/payment/.env ] && source backend/payment/.env || echo "⚠️ payment .env missing"
[ -f frontend/.env ] && source frontend/.env || echo "⚠️ frontend .env missing"

# 2. Infra Initialization
echo "📂 Ensuring Database containers are running..."
docker compose -f docker/docker-compose.yml up -d auth-db posts-db

# 3. K8s Secrets Setup (The "relevant" part - ensuring K8s knows our IDs)
echo "🔑 Syncing K8s Secrets..."
kubectl create secret generic auth-secrets \
  --from-literal=database-url="postgresql://postgres:postgres@host.docker.internal:5433/auth_db" \
  --from-literal=jwt-secret="${JWT_SECRET:-local-secret}" \
  --from-literal=google-client-id="${GOOGLE_CLIENT_ID:-dummy}" \
  --from-literal=google-client-secret="${GOOGLE_CLIENT_SECRET:-dummy}" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic posts-secrets \
  --from-literal=database-url="postgresql://postgres:postgres@host.docker.internal:5434/posts_db" \
  --from-literal=jwt-secret="${JWT_SECRET:-local-secret}" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic payment-secrets \
  --from-literal=razorpay-id="${RAZORPAY_KEY_ID:-rzp_test_placeholder}" \
  --from-literal=razorpay-secret="${RAZORPAY_KEY_SECRET:-placeholder_secret}" \
  --dry-run=client -o yaml | kubectl apply -f -

# 4. Selective Build
BUILD_ALL=${1:-""}
if [ "$BUILD_ALL" == "build" ] || [ "$BUILD_ALL" == "build-clean" ]; then
    CACHE_FLAG=""
    if [ "$BUILD_ALL" == "build-clean" ]; then
        echo "🧹 Performing Clean Build (No Cache)..."
        CACHE_FLAG="--no-cache"
    else
        echo "📦 Building images..."
    fi
    
    docker build $CACHE_FLAG -t ghcr.io/$REGISTRY_ORG/api-gateway:$TAG -f backend/api-gateway/Dockerfile .
    docker build $CACHE_FLAG -t ghcr.io/$REGISTRY_ORG/auth-service:$TAG -f backend/auth/Dockerfile .
    docker build $CACHE_FLAG -t ghcr.io/$REGISTRY_ORG/posts-service:$TAG -f backend/posts/Dockerfile .
    docker build $CACHE_FLAG -t ghcr.io/$REGISTRY_ORG/payment-service:$TAG -f backend/payment/Dockerfile .
    docker build $CACHE_FLAG \
      --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID:-}" \
      --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000}" \
      --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID="${NEXT_PUBLIC_RAZORPAY_KEY_ID:-}" \
      -t ghcr.io/$REGISTRY_ORG/frontend:$TAG -f frontend/Dockerfile .
else
    echo "⏭️ Skipping build. To rebuild, run: ./scripts/run-on-k8s.sh build"
fi

# 5. Apply Manifests & Scale
echo "☸️ Applying Kubernetes Manifests..."
# Update images in manifests to use the locally built ones
echo "🖼️  Updating deployment images to locally built ones..."
kubectl apply -f k8s/

kubectl set image deployment/api-gateway api-gateway=ghcr.io/$REGISTRY_ORG/api-gateway:$TAG
kubectl set image deployment/auth-service auth-service=ghcr.io/$REGISTRY_ORG/auth-service:$TAG
kubectl set image deployment/posts-service posts-service=ghcr.io/$REGISTRY_ORG/posts-service:$TAG
kubectl set image deployment/payment-service payment-service=ghcr.io/$REGISTRY_ORG/payment-service:$TAG
kubectl set image deployment/frontend-deployment frontend=ghcr.io/$REGISTRY_ORG/frontend:$TAG

# Ensure everything is scaled up
kubectl scale deployment --all --replicas=1 -n default

echo "✅ App is launching! Access at: http://localhost:3000"
