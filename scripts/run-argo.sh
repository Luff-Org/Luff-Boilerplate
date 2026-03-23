#!/usr/bin/env bash
set -e

echo "📡 Connecting to Argo CD..."

# 1. Kill any existing Argo port-forwards to avoid conflicts
pkill -f "kubectl port-forward svc/argocd-server" || true

# 2. Check if Argo CD namespace exists
if ! kubectl get namespace argocd > /dev/null 2>&1; then
    echo "❌ Error: Argo CD namespace not found. Is it installed?"
    exit 1
fi

# 3. Start Port Forward in background
echo "🚀 Opening tunnel to Argo CD UI..."
kubectl port-forward svc/argocd-server -n argocd 8080:443 > /dev/null 2>&1 &

echo "-----------------------------------------------------------"
echo "🌐 Argo CD Dashboard: http://localhost:8080"
echo "👤 Username: admin"
echo "🔑 Password: WRzR2klB9NwZADOe"
echo "-----------------------------------------------------------"
echo "✅ Tunnel active. Keep this terminal open or run in background."
