#!/usr/bin/env bash
# Build the Trey TV TV-app APK with the React/Vite cinematic shell bundled in.
#
# Usage:
#   ./scripts/build-tv-skin.sh                # full rebuild
#   SKIP_WEB=1 ./scripts/build-tv-skin.sh     # reuse existing dist/
#   SKIP_APK=1 ./scripts/build-tv-skin.sh     # sync assets only, no APK build
#   REPO_ROOT=/path ./scripts/build-tv-skin.sh
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
WEB_APP="$REPO_ROOT/apps/trey-tv-web"
NATIVE_APP="$REPO_ROOT/apps/trey-tv-tv"
ASSETS_DIR="$NATIVE_APP/app/src/main/assets/trey-tv-web"
APK_SRC="$NATIVE_APP/app/build/outputs/apk/debug/app-debug.apk"
APK_DST="$REPO_ROOT/public/downloads/trey-tv-box-debug.apk"

say() { printf "\033[36m[build-tv-skin]\033[0m %s\n" "$*"; }

[[ -d "$WEB_APP"    ]] || { echo "Vite TV shell not found at $WEB_APP" >&2; exit 1; }
[[ -d "$NATIVE_APP" ]] || { echo "Android TV app not found at $NATIVE_APP" >&2; exit 1; }

# 1) Vite build
if [[ "${SKIP_WEB:-0}" == "1" ]]; then
  say "Skipping Vite build (SKIP_WEB=1)."
else
  say "Building React/Vite TV shell..."
  pushd "$WEB_APP" >/dev/null
  if [[ ! -d "node_modules" ]]; then
    say "node_modules missing — running npm ci first."
    npm ci
  fi
  npm run build
  popd >/dev/null
fi

DIST="$WEB_APP/dist"
[[ -d "$DIST" ]] || { echo "Expected $DIST after Vite build, missing." >&2; exit 1; }

# 2) Sync dist → Android assets
say "Syncing dist → app/src/main/assets/trey-tv-web/"
rm -rf "$ASSETS_DIR"
mkdir -p "$ASSETS_DIR"
cp -r "$DIST"/* "$ASSETS_DIR/"

# 3) Gradle build
if [[ "${SKIP_APK:-0}" == "1" ]]; then
  say "Skipping Gradle build (SKIP_APK=1). Assets are in place."
  exit 0
fi

say "Running ./gradlew assembleDebug (this takes a few minutes)..."
pushd "$NATIVE_APP" >/dev/null
./gradlew assembleDebug --no-daemon
popd >/dev/null

# 4) Copy APK
[[ -f "$APK_SRC" ]] || { echo "Expected APK at $APK_SRC, missing." >&2; exit 1; }
mkdir -p "$(dirname "$APK_DST")"
cp -f "$APK_SRC" "$APK_DST"

size_bytes=$(stat -c%s "$APK_DST" 2>/dev/null || stat -f%z "$APK_DST")
size_mb=$(awk "BEGIN {printf \"%.2f\", $size_bytes / 1048576}")
say "Done. APK ready at $APK_DST (${size_mb} MB)."
say "Sideload: adb install -r \"$APK_DST\""
