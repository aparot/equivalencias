#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/albertoparot/equivalencias"

# Load nvm if present
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  # shellcheck disable=SC1090
  source "$HOME/.nvm/nvm.sh"
  nvm use 20 >/dev/null || nvm install 20
else
  echo "nvm not found. Please install nvm or ensure Node 20 is active." >&2
  exit 1
fi

cd "$ROOT_DIR"

npm install >/dev/null

cleanup() {
  if [ -n "${ADMIN_PID:-}" ] && kill -0 "$ADMIN_PID" 2>/dev/null; then
    kill "$ADMIN_PID"
  fi
  if [ -n "${MOBILE_PID:-}" ] && kill -0 "$MOBILE_PID" 2>/dev/null; then
    kill "$MOBILE_PID"
  fi
}
trap cleanup EXIT

# Start admin and mobile web
npm run dev --workspace admin >/tmp/ecoequivalencias-admin.log 2>&1 &
ADMIN_PID=$!

npm run web --workspace mobile >/tmp/ecoequivalencias-mobile.log 2>&1 &
MOBILE_PID=$!

# Wait for ports
wait_for_port() {
  local url="$1"
  local max=60
  local count=0
  while ! curl -s -o /dev/null "$url"; do
    sleep 1
    count=$((count + 1))
    if [ "$count" -ge "$max" ]; then
      echo "Timed out waiting for $url" >&2
      return 1
    fi
  done
}

wait_for_port "http://localhost:3000" || true
wait_for_port "http://localhost:8081" || true

# Open tabs
open "http://localhost:3000" || true
open "http://localhost:8081" || true

echo "Admin: http://localhost:3000"
echo "Mobile Web: http://localhost:8081"
echo "Logs: /tmp/ecoequivalencias-admin.log and /tmp/ecoequivalencias-mobile.log"

# Keep running to keep processes alive
wait
