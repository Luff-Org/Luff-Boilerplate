#!/usr/bin/env bash
set -euo pipefail

echo "==========================================================="
echo "🐳 Building & Deploying Images for Local Kubernetes Cluster"
echo "==========================================================="

# Ensure variables from frontend/.env and backend/auth/.env are used
source frontend/.env || echo "WARNING: frontend/.env not found"
source backend/auth/.env || echo "WARNING: backend/auth/.env not found"

# Determine the Git SHA for tagging
SHA=$(git rev-parse HEAD 2>/dev/null || echo "latest")

# Customization: Set your Docker registry organization/user
REGISTRY_ORG="${REGISTRY_ORG:-luff-org}"

echo "🏷️  Using Tag: $SHA"
echo "🏢 Registry Org: $REGISTRY_ORG"
echo "🌐 Next API URL: ${NEXT_PUBLIC_API_URL:-http://localhost:4000}"
echo "🔑 Google Client ID: ${NEXT_PUBLIC_GOOGLE_CLIENT_ID:-''}"

echo ""
echo "📦 Building Frontend Image..."
docker build \
    --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID}" \
    --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
    -t ghcr.io/$REGISTRY_ORG/frontend:$SHA -f frontend/Dockerfile .

echo "📦 Building API Gateway Image..."
docker build -t ghcr.io/$REGISTRY_ORG/api-gateway:$SHA -f backend/api-gateway/Dockerfile .

echo "📦 Building Auth Service Image..."
docker build -t ghcr.io/$REGISTRY_ORG/auth-service:$SHA -f backend/auth/Dockerfile .

echo "📦 Building Posts Service Image..."
docker build -t ghcr.io/$REGISTRY_ORG/posts-service:$SHA -f backend/posts/Dockerfile .

# Since our K8s manifests use `IfNotPresent`, and Docker Desktop / Minikube
# share the local image cache or require pushing to local registry,
# we need to force a restart of the pods to pull/use the new image immediately.
echo ""
echo "♻️  Restarting Kubernetes Pods..."
kubectl delete pods -l app=frontend || true
kubectl delete pods -l app=auth-service || true
kubectl delete pods -l app=posts-service || true
kubectl delete pods -l app=api-gateway || true

echo ""
echo "✅ Local Deployment Triggered! Run 'kubectl get pods' to see the new pods spin up."
echo "==========================================================="
