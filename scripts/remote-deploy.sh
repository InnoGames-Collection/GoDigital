#!/usr/bin/env bash
# ==============================================================================
# Workstation Remote Trigger for GoDigital on GCP VM (innoserver-serv001)
# ==============================================================================
set -Eeuo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

TARGET_INSTANCE="innoserver-serv001"
TARGET_ZONE="us-central1-a"
TARGET_IP="35.223.254.218"
TARGET_USER="yasabneh"
REMOTE_PATH="/home/${TARGET_USER}/InnoGames/GoDigital"

SSH_OPTS=(-o StrictHostKeyChecking=no)
if [ -f "${HOME}/.ssh/google_compute_engine" ]; then
  SSH_OPTS+=(-i "${HOME}/.ssh/google_compute_engine")
fi

echo "Connecting to GCP VM ${TARGET_INSTANCE} (${TARGET_IP}) for GoDigital..."

echo "📤 Syncing local GoDigital code to remote server..."
rsync -avz --delete \
  -e "ssh ${SSH_OPTS[*]}" \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.git' \
  --exclude '.DS_Store' \
  --exclude '._*' \
  --exclude '*.log' \
  --exclude '.system_generated' \
  "${REPO_DIR}/" \
  "${TARGET_USER}@${TARGET_IP}:${REMOTE_PATH}/"

echo "✅ Code synced. Triggering remote build & deployment..."
if ssh -o BatchMode=yes -o ConnectTimeout=5 "${SSH_OPTS[@]}" "${TARGET_USER}@${TARGET_IP}" "true" 2>/dev/null; then
  echo "Executing deployment via direct SSH..."
  ssh "${SSH_OPTS[@]}" "${TARGET_USER}@${TARGET_IP}" "cd ${REMOTE_PATH} && chmod +x scripts/*.sh && ./scripts/server-deploy.sh"
elif command -v gcloud &>/dev/null; then
  echo "Executing deployment via gcloud OS Login..."
  gcloud compute ssh "${TARGET_USER}@${TARGET_INSTANCE}" --zone="${TARGET_ZONE}" --command="sudo -u ${TARGET_USER} -H bash -c 'cd ${REMOTE_PATH} && chmod +x scripts/*.sh && ./scripts/server-deploy.sh'"
else
  echo "Falling back to direct SSH..."
  ssh "${SSH_OPTS[@]}" "${TARGET_USER}@${TARGET_IP}" "cd ${REMOTE_PATH} && chmod +x scripts/*.sh && ./scripts/server-deploy.sh"
fi
