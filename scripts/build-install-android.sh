#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT_DIR/web-editor"
echo "==> Building the embedded web editor bundle..."
npm run build

cd "$ROOT_DIR"
echo "==> Installing the Android app with the new bundle..."
npx react-native run-android

echo
echo "==> Done. The Android app was rebuilt and installed."
