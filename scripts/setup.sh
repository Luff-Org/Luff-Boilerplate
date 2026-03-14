#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Setting up microservices boilerplate..."

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Copy env files
echo "📋 Copying environment files..."
for env_example in $(find . -name '.env.example' -not -path './node_modules/*'); do
  env_file="${env_example%.example}"
  if [ ! -f "$env_file" ]; then
    cp "$env_example" "$env_file"
    echo "  Created $env_file"
  fi
done

# Setup Husky
echo "🐶 Setting up Husky..."
npx husky init 2>/dev/null || true

echo "✅ Setup complete! Run 'npm run dev' to start all services."
