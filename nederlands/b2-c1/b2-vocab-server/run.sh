#!/usr/bin/env bash
# Dev launcher: starts uvicorn with auto-reload. Use `./run.sh prod` for
# the no-reload variant matching the systemd unit on Hetzner.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it before serving on a public host."
fi

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

if [ "${1:-}" = "prod" ]; then
  exec .venv/bin/uvicorn server.main:app --host "$HOST" --port "$PORT" --workers 1
else
  exec .venv/bin/uvicorn server.main:app --host "$HOST" --port "$PORT" --reload --reload-dir server --reload-dir static
fi
