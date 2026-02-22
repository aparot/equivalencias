#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADMIN_DIR="$ROOT_DIR/admin"
MOBILE_DIR="$ROOT_DIR/mobile"

cd "$ROOT_DIR"
npm install

cd "$MOBILE_DIR"
npx expo export --platform web

rm -rf "$ADMIN_DIR/public/portal"
mkdir -p "$ADMIN_DIR/public/portal"
cp -R "$MOBILE_DIR/dist/"* "$ADMIN_DIR/public/portal/"
