#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/albertoparot/equivalencias"
cd "$ROOT_DIR"

PORT=8081
if lsof -ti TCP:"$PORT" >/dev/null 2>&1; then
  echo "Port $PORT is already in use. Stop the process or choose another port." >&2
  lsof -nP -i TCP:"$PORT" >&2 || true
  exit 1
fi

echo "Starting Mobile Web (Expo) on http://localhost:$PORT"
EXPO_DEV_SERVER_PORT="$PORT" EXPO_WEB_PORT="$PORT" npm run web --workspace mobile
