#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/albertoparot/equivalencias"
cd "$ROOT_DIR"

PORT=3000
if lsof -ti TCP:"$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Stop the process or choose another port." >&2
  lsof -nP -i TCP:"$PORT" >&2 || true
  exit 1
fi

echo "Starting Admin (Next.js) on http://localhost:$PORT"
npm run dev --workspace admin
