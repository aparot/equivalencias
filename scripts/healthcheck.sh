#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="/Users/albertoparot/equivalencias"
cd "$ROOT_DIR"

fail=0

echo "== EcoEquivalencias Health Check =="

if ! command -v node >/dev/null 2>&1; then
  echo "Missing: node (required)"
  fail=1
else
  echo "Node: $(node -v)"
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Missing: npm (required)"
  fail=1
else
  echo "NPM: $(npm -v)"
fi

echo
echo "Checking env files..."
if [ ! -f "mobile/.env" ]; then
  echo "Missing: mobile/.env"
  fail=1
else
  echo "Found: mobile/.env"
fi

if [ ! -f "admin/.env.local" ]; then
  echo "Missing: admin/.env.local"
  fail=1
else
  echo "Found: admin/.env.local"
fi

echo
echo "Checking required env vars (by presence in files)..."
if [ -f "mobile/.env" ]; then
  rg -q "EXPO_PUBLIC_SUPABASE_URL" mobile/.env || { echo "Missing in mobile/.env: EXPO_PUBLIC_SUPABASE_URL"; fail=1; }
  rg -q "EXPO_PUBLIC_SUPABASE_ANON_KEY|EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY" mobile/.env || { echo "Missing in mobile/.env: EXPO_PUBLIC_SUPABASE_ANON_KEY or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"; fail=1; }
fi

if [ -f "admin/.env.local" ]; then
  rg -q "NEXT_PUBLIC_SUPABASE_URL" admin/.env.local || { echo "Missing in admin/.env.local: NEXT_PUBLIC_SUPABASE_URL"; fail=1; }
  rg -q "NEXT_PUBLIC_SUPABASE_ANON_KEY|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" admin/.env.local || { echo "Missing in admin/.env.local: NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"; fail=1; }
  rg -q "SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY" admin/.env.local || { echo "Missing in admin/.env.local: SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"; fail=1; }
fi

echo
echo "Checking ports..."
for port in 3000 8081; do
  if lsof -ti TCP:"$port" >/dev/null 2>&1; then
    echo "Port $port is in use."
  else
    echo "Port $port is free."
  fi
done

echo
if [ "$fail" -eq 1 ]; then
  echo "Health check failed. Fix the issues above."
  exit 1
fi

echo "Health check passed."
