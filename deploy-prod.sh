#!/usr/bin/env bash
set -euo pipefail

# deploy-prod.sh
# One-shot production deployment script for Ubuntu server

REPO_URL="https://github.com/Richmediarts/finance-tracker.git"
REPO_DIR="/opt/finance-tracker"  # adjust if your deployment dir differs
BRANCH="${BRANCH:-main}"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

echo "Starting production deploy: branch=${BRANCH} to ${REPO_DIR}"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "Cloning repo into $REPO_DIR"
  sudo mkdir -p "$REPO_DIR"
  sudo chown -R "$USER:$USER" "$REPO_DIR"
  git clone "$REPO_URL" "$REPO_DIR"
fi

cd "$REPO_DIR"
git fetch --all
git reset --hard "origin/${BRANCH}"

# Use docker-compose to pull and recreate containers
COMPOSE="docker-compose -f ${DOCKER_COMPOSE_FILE}"

echo "Pulling latest images..."
$COMPOSE pull

echo "Restarting services..."
$COMPOSE up -d --build

echo "Deployment complete. Services status:"
$COMPOSE ps

if command -v prisma >/dev/null; then
  echo "Attempting Prisma migrate (if configured)"
  $COMPOSE exec app sh -c 'npx prisma migrate deploy' || true
fi
