#!/usr/bin/env bash
# Dev launcher: starts uvicorn with auto-reload. Use `./run.sh prod` for
# the no-reload variant matching the systemd unit on Hetzner.
set -euo pipefail
cd "$(dirname "$0")"

venv_ok() {
  # The python symlink survives a directory move, but pip-installed
  # scripts (uvicorn, pip itself) bake in the absolute install path as
  # their shebang. So check uvicorn — that's what actually has to run.
  [ -d .venv ] && .venv/bin/python -c "import uvicorn" >/dev/null 2>&1
}
if ! venv_ok; then
  rm -rf .venv
  python3 -m venv .venv
  .venv/bin/python -m pip install --quiet -r requirements.txt
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it before serving on a public host."
fi

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

if [ "${1:-}" = "prod" ]; then
  exec .venv/bin/python -m uvicorn server.main:app --host "$HOST" --port "$PORT" --workers 1
else
  exec .venv/bin/python -m uvicorn server.main:app --host "$HOST" --port "$PORT" --reload --reload-dir server --reload-dir static
fi
