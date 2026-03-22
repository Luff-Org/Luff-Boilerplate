#!/usr/bin/env bash
set -euo pipefail

# --- Configuration ---
REGISTRY_ORG="luff-org"
TAG="latest"

echo "🚀 Starting Local Kubernetes Deployment Flow..."

# 1. Start Database Infrastructure (Docker)
echo "📂 Step 1: Starting Database Containers..."
docker compose -f docker/docker-compose.yml up auth-db posts-db -d

# 2. Build Microservice Images
echo "📦 Step 2: Building Microservice Images..."

echo "   -> Building API Gateway..."
docker build -t ghcr.io/$REGISTRY_ORG/api-gateway:$TAG -f backend/api-gateway/Dockerfile .

echo "   -> Building Auth Service..."
docker build -t ghcr.io/$REGISTRY_ORG/auth-service:$TAG -f backend/auth/Dockerfile .

echo "   -> Building Posts Service..."
docker build -t ghcr.io/$REGISTRY_ORG/posts-service:$TAG -f backend/posts/Dockerfile .

echo "   -> Building Payment Service..."
docker build -t ghcr.io/$REGISTRY_ORG/payment-service:$TAG -f backend/payment/Dockerfile .

echo "   -> Building Frontend..."
# Note: Re-using the build args from deploy-local.sh for consistent local dev
source frontend/.env || true
docker build \
    --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID:-''}" \
    --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:4000}" \
    --build-arg NEXT_PUBLIC_RAZORPAY_KEY_ID="${NEXT_PUBLIC_RAZORPAY_KEY_ID:-'rzp_test_placeholder'}" \
    -t ghcr.io/$REGISTRY_ORG/frontend:$TAG -f frontend/Dockerfile .

# 3. Apply K8s Manifests
echo "☸️  Step 3: Applying Kubernetes Manifests..."

# Ensure we have the necessary secrets (simple literals for local dev)
# Check if secrets exist or create them
kubectl create secret generic auth-secrets \
    --from-literal=database-url="postgresql://postgres:postgres@auth-db:5432/auth_db" \
    --from-literal=jwt-secret="local-jwt-secret-key" \
    --from-literal=google-client-id="dummy" \
    --from-literal=google-client-secret="dummy" \
    --dry-run=client -o yaml | kubectl apply -f -

kubectl apply -f k8s/

# 4. Ensure Deployments are Scaled Up
echo "📈 Step 4: Scaling up Deployments..."
kubectl scale deployment api-gateway auth-service frontend-deployment posts-service payment-service --replicas=1

# 5. Helper: Port Forwarding (Optional, if LoadBalancer isn't used)
echo ""
echo "✅ Deployment Complete!"
echo "-----------------------------------------------------------"
echo "Monitor status with: kubectl get pods"
echo "Access the app at:    http://localhost:3000"
echo "-----------------------------------------------------------"
echo "Tip: Run 'kubectl logs -l app=api-gateway -f' to see gateway logs."
