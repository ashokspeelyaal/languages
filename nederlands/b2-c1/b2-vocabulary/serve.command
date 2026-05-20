#!/usr/bin/env bash
# Double-click to launch the Studeerkamer app over http://localhost.
# Required because Safari (and Chrome, Firefox) refuse to grant microphone
# and webcam access on file:// URLs — no amount of clicking "Allow" will help.
#
# This script starts a tiny Python HTTP server in the app's directory and
# opens the page in your default browser. Close the Terminal window to stop.

set -euo pipefail

# Walk to this script's directory regardless of where it's launched from.
HERE="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$HERE"

PORT=8765
URL="http://localhost:${PORT}/index.html"

# Try to find Python 3 (preinstalled on modern macOS).
if command -v python3 >/dev/null 2>&1; then
  PY=python3
elif command -v python >/dev/null 2>&1; then
  PY=python
else
  echo "Geen Python gevonden. Installeer met: xcode-select --install"
  read -n 1 -s -r -p "Druk een toets om te sluiten…"
  exit 1
fi

echo "── Studeerkamer ──────────────────────────────────"
echo "  Map:     $HERE"
echo "  Adres:   $URL"
echo "  Stoppen: sluit dit Terminal-venster (Cmd+W)"
echo "──────────────────────────────────────────────────"
echo

# Open the page after a short delay so the server is up.
( sleep 0.7 && open "$URL" ) &

# --bind 127.0.0.1 keeps the server private to your Mac.
exec "$PY" -m http.server "$PORT" --bind 127.0.0.1
