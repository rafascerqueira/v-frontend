#!/bin/bash
set -e

# Vendinhas Frontend Deploy Script
# Usage: ./scripts/deploy.sh

APP_DIR="/var/www/vendinhas/frontend"
BRANCH="${1:-main}"

echo "🚀 Deploying Vendinhas Frontend..."

cd $APP_DIR

# Pull latest changes
echo "📥 Pulling latest changes from $BRANCH..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Build application
echo "🏗️ Building application..."
pnpm build

# Create logs directory
mkdir -p logs

# Restart PM2
echo "♻️ Restarting PM2..."
pm2 reload ecosystem.config.js --env production

echo "✅ Frontend deploy completed!"
pm2 status
