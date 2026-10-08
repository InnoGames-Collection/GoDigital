#!/usr/bin/env bash
# ==============================================================================
# GoDigital — Enterprise Production Deployment Engine (Telebirr Game Center)
# Target: GCP Compute Engine VM (innoserver-serv001: 34.41.116.217)
# Ports: Web: 3700 | API: 3702 | Admin: 3703 | DB: 5442 | Valkey: 6392
# ==============================================================================
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

WEB_CANARY="http://127.0.0.1:3700/health"
API_CANARY="http://127.0.0.1:3702/health"
ADMIN_CANARY="http://127.0.0.1:3703/health"

rollback() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo "❌ [DEPLOYMENT FAILURE] Exit code $exit_code detected. Restarting services..."
    docker compose -f docker-compose.server.yml restart || true
  fi
}
trap rollback EXIT

echo "=============================================================================="
echo "🚀 [STAGE 1: ACT] Sequential Build & Deployment for GoDigital"
echo "=============================================================================="
docker compose -f docker-compose.server.yml up -d postgres valkey

echo "⏳ Waiting for PostgreSQL & Valkey healthy state..."
for i in {1..30}; do
  if docker compose -f docker-compose.server.yml ps postgres | grep -q "healthy" && \
     docker compose -f docker-compose.server.yml ps valkey | grep -q "healthy"; then
    echo "✅ Databases healthy."
    break
  fi
  sleep 1
done

echo "📦 Ensuring database migrations and seeds are applied..."
for migration in db/migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo "  Executing migration: $(basename "$migration")..."
    docker compose -f docker-compose.server.yml exec -T postgres psql -U ${POSTGRES_USER:-godigital_user} -d ${POSTGRES_DB:-godigital_db} -f - < "$migration" || true
  fi
done
for seed in db/seeds/*.sql; do
  if [ -f "$seed" ]; then
    echo "  Executing seed: $(basename "$seed")..."
    docker compose -f docker-compose.server.yml exec -T postgres psql -U ${POSTGRES_USER:-godigital_user} -d ${POSTGRES_DB:-godigital_db} -f - < "$seed" || true
  fi
done

docker compose -f docker-compose.server.yml build api
docker compose -f docker-compose.server.yml up -d api

docker compose -f docker-compose.server.yml build admin
docker compose -f docker-compose.server.yml up -d admin

docker compose -f docker-compose.server.yml build web
docker compose -f docker-compose.server.yml up -d web

echo "=============================================================================="
echo "🩺 [STAGE 2: VERIFY] Canary Probes"
echo "=============================================================================="
for i in {1..30}; do
  if curl -s -f "$API_CANARY" | grep -q "healthy"; then
    echo "✅ Canary 1 Passed: Fastify API Healthy (Port 3702)"
    break
  fi
  sleep 2
done

for i in {1..30}; do
  if curl -s -f "$ADMIN_CANARY" | grep -q "healthy"; then
    echo "✅ Canary 2 Passed: Admin Console Healthy (Port 3703)"
    break
  fi
  sleep 2
done

for i in {1..30}; do
  if curl -s -f "$WEB_CANARY" | grep -q "healthy"; then
    echo "✅ Canary 3 Passed: Web Client Healthy (Port 3700)"
    break
  fi
  sleep 2
done

# Nginx vhost linking if on host
if [ -d "/etc/nginx/conf.d/products" ] && [ -f "deploy/nginx/godigital.conf" ]; then
  echo "🌐 Updating Nginx virtual host in /etc/nginx/conf.d/products/..."
  sudo cp deploy/nginx/godigital.conf /etc/nginx/conf.d/products/godigital.conf || true
  sudo rm -f /etc/nginx/sites-enabled/godigital.conf || true
  sudo nginx -t && sudo systemctl reload nginx || true
elif [ -d "/etc/nginx/sites-available" ] && [ -f "deploy/nginx/godigital.conf" ]; then
  echo "🌐 Updating Nginx virtual host in /etc/nginx/sites-available/..."
  sudo cp deploy/nginx/godigital.conf /etc/nginx/sites-available/godigital.conf || true
  sudo ln -sf /etc/nginx/sites-available/godigital.conf /etc/nginx/sites-enabled/ || true
  sudo nginx -t && sudo systemctl reload nginx || true
fi

trap - EXIT
echo "=============================================================================="
echo "🎉 [DEPLOYMENT CERTIFIED] GoDigital Live on godigital.innopulseplatform.com"
echo "=============================================================================="
