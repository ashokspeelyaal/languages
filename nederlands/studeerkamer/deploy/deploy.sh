#!/usr/bin/env bash
# Sync the app to a Hetzner box and restart it.
#
# Usage:
#   HOST=root@1.2.3.4 ./deploy/deploy.sh
#
# First-run on the server (manual):
#   adduser --system --group --home /opt/studeerkamer studeerkamer
#   apt install python3 python3-venv caddy
#   cp deploy/studeerkamer.service /etc/systemd/system/
#   cp deploy/Caddyfile /etc/caddy/Caddyfile  (and edit the hostname)
#   systemctl daemon-reload && systemctl enable --now studeerkamer caddy
set -euo pipefail
: "${HOST:?HOST=root@your.server required}"
APP_DIR="/opt/studeerkamer"

cd "$(dirname "$0")/.."

rsync -av --delete \
  --exclude '.venv' --exclude '__pycache__' --exclude '.git' \
  --exclude 'data/' --exclude '.env' \
  ./ "$HOST:$APP_DIR/"

ssh "$HOST" "cd $APP_DIR && \
  if [ ! -d .venv ]; then python3 -m venv .venv && .venv/bin/pip install -U pip; fi && \
  .venv/bin/pip install -r requirements.txt && \
  systemctl restart studeerkamer && \
  echo 'OK: deployed'"
