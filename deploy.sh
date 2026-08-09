#!/bin/bash
# NicheMaster 2026 - One-click Deployment Script
# Usage: ./deploy.sh [pages|worker|all|preview]

set -e

PROJECT_NAME="nichemaster-2026"
BRANCH="main"

echo "NicheMaster 2026 Deployment"
echo "============================"

if ! command -v npx >/dev/null 2>&1; then
  echo "Error: npx not found. Please install Node.js."
  exit 1
fi

if [ ! -f "wrangler.toml" ]; then
  echo "Error: Run this script from the NicheMaster repository root."
  exit 1
fi

MODE=${1:-all}

case "$MODE" in
  pages|deploy)
    npx wrangler pages deploy . --project-name="$PROJECT_NAME" --branch="$BRANCH" --commit-dirty=true
    ;;
  worker)
    npx wrangler deploy
    ;;
  preview)
    npx wrangler pages deploy . --project-name="$PROJECT_NAME" --branch="preview"
    ;;
  all|full)
    npx wrangler deploy
    npx wrangler pages deploy . --project-name="$PROJECT_NAME" --branch="$BRANCH"
    ;;
  *)
    echo "Usage: $0 [pages|worker|all|preview]"
    exit 1
    ;;
esac

echo "Deployment command completed."
