#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/albertoparot/equivalencias"
cd "$ROOT_DIR"

ADMIN_PORT=3000
MOBILE_PORT=8081

check_port() {
  local port="$1"
  if lsof -ti TCP:"$port" >/dev/null 2>&1; then
    echo "Port $port is already in use."
    lsof -nP -i TCP:"$port" || true
    exit 1
  fi
}

check_port "$ADMIN_PORT"
check_port "$MOBILE_PORT"

cleanup() {
  if [ -n "${ADMIN_PID:-}" ] && kill -0 "$ADMIN_PID" 2>/dev/null; then
    kill "$ADMIN_PID"
  fi
  if [ -n "${MOBILE_PID:-}" ] && kill -0 "$MOBILE_PID" 2>/dev/null; then
    kill "$MOBILE_PID"
  fi
}
trap cleanup EXIT

echo "Starting Admin on http://localhost:$ADMIN_PORT"
npm run dev --workspace admin >/tmp/ecoequivalencias-admin.log 2>&1 &
ADMIN_PID=$!

echo "Starting Mobile Web on http://localhost:$MOBILE_PORT"
EXPO_DEV_SERVER_PORT="$MOBILE_PORT" EXPO_WEB_PORT="$MOBILE_PORT" npm run web --workspace mobile >/tmp/ecoequivalencias-mobile.log 2>&1 &
MOBILE_PID=$!

echo "Logs:"
echo "  /tmp/ecoequivalencias-admin.log"
echo "  /tmp/ecoequivalencias-mobile.log"
echo "Press Ctrl+C to stop."

wait
