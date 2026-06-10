#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

venv_ok() {
  [ -d .venv ] && .venv/bin/python -c "import uvicorn" >/dev/null 2>&1
}
if ! venv_ok; then
  rm -rf .venv
  python3 -m venv .venv
  .venv/bin/python -m pip install --quiet -r requirements.txt
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it (add OPENAI_API_KEY) before generating."
fi

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-15193}"

if [ "${1:-}" = "prod" ]; then
  exec .venv/bin/python -m uvicorn server.main:app --host "$HOST" --port "$PORT" --workers 1
else
  exec .venv/bin/python -m uvicorn server.main:app --host "$HOST" --port "$PORT" --reload --reload-dir server --reload-dir static
fi
