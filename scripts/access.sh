#!/usr/bin/env bash

# This script keeps your local ports connected to your Kubernetes cluster.
# It runs in the foreground. Press Ctrl+C to stop.

echo "🔗 Connecting Local Ports to Kubernetes..."

# 1. Kill any existing port-forwards to avoid conflicts
pkill -f "port-forward" || true

echo "-----------------------------------------------------------"
echo "🚀 App Frontend: http://localhost:3000"
echo "🛡️  Argo CD UI:   http://localhost:8080 (User: admin)"
echo "📡 API Gateway:  http://localhost:4000 (Native LoadBalancer)"
echo "-----------------------------------------------------------"

# 2. Start port-forwarding in the background
# Forward Frontend
kubectl port-forward svc/frontend-service 3000:3000 > /dev/null 2>&1 &

# Forward Argo CD (Wait a few seconds for it to restart first)
echo "⏳ Waiting for Argo CD to initialize..."
sleep 5
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &

echo "✅ Connections Active. Keep this terminal open."
echo "Press Ctrl+C to close all connections."

# 3. Wait for interrupts
wait
