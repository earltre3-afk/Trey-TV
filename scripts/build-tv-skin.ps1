<#
.SYNOPSIS
  Rebuild the Trey TV TV-app APK with the React/Vite cinematic shell bundled in.

.DESCRIPTION
  One-shot pipeline:
    1. Build the React/Vite TV shell in apps/trey-tv-web/ (writes dist/).
    2. Sync dist/ into apps/trey-tv-tv/app/src/main/assets/trey-tv-web/.
    3. Build the debug Android APK with the Gradle wrapper.
    4. Copy the APK to public/downloads/trey-tv-box-debug.apk so the web
       download link serves the new build.

  Skipping a stage:
    -SkipWeb         Skip the npm install + Vite build (use the existing dist/).
    -SkipApk         Skip the Gradle build; only sync assets.
    -RepoRoot <p>    Override the repo root (default: script dir's parent).

.EXAMPLE
  .\scripts\build-tv-skin.ps1
  Full rebuild end-to-end.

.EXAMPLE
  .\scripts\build-tv-skin.ps1 -SkipWeb
  Reuse an existing apps/trey-tv-web/dist; rebuild only the APK.
#>
param(
  [string]$RepoRoot,
  [switch]$SkipWeb,
  [switch]$SkipApk
)

$ErrorActionPreference = "Stop"

if (-not $RepoRoot) {
  $RepoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
}

$WebApp     = Join-Path $RepoRoot "apps\trey-tv-web"
$NativeApp  = Join-Path $RepoRoot "apps\trey-tv-tv"
$AssetsDir  = Join-Path $NativeApp "app\src\main\assets\trey-tv-web"
$ApkSrc     = Join-Path $NativeApp "app\build\outputs\apk\debug\app-debug.apk"
$ApkDst     = Join-Path $RepoRoot "public\downloads\trey-tv-box-debug.apk"
$StreamingApkDst = Join-Path $RepoRoot "public\downloads\trey-tv-streamingbox-debug.apk"

function Say($message) {
  Write-Host "[build-tv-skin] $message" -ForegroundColor Cyan
}

if (-not (Test-Path $WebApp))    { throw "Vite TV shell not found at $WebApp" }
if (-not (Test-Path $NativeApp)) { throw "Android TV app not found at $NativeApp" }

# 1) Vite build
if ($SkipWeb) {
  Say "Skipping Vite build (--SkipWeb)."
} else {
  Say "Building React/Vite TV shell..."
  Push-Location $WebApp
  try {
    if (-not (Test-Path (Join-Path $WebApp "node_modules"))) {
      Say "node_modules missing - running npm ci first."
      npm ci
      if ($LASTEXITCODE -ne 0) { throw "npm ci failed." }
    }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Vite build failed." }
  } finally {
    Pop-Location
  }
}

$Dist = Join-Path $WebApp "dist"
if (-not (Test-Path $Dist)) {
  throw "Expected $Dist after Vite build but it's missing. Did the build write to a different folder?"
}

# 2) Sync dist -> Android assets
Say "Syncing dist -> app/src/main/assets/trey-tv-web/"
if (Test-Path $AssetsDir) {
  Remove-Item -Recurse -Force $AssetsDir
}
New-Item -ItemType Directory -Force -Path $AssetsDir | Out-Null
Copy-Item -Recurse -Force (Join-Path $Dist "*") $AssetsDir

# 3) Gradle build
if ($SkipApk) {
  Say "Skipping Gradle build (--SkipApk). Assets are in place - open Android Studio or run ./gradlew manually."
  exit 0
}

Say "Running ./gradlew assembleDebug (this takes a few minutes)..."
Push-Location $NativeApp
try {
  if ($IsWindows -or $env:OS -like "*Windows*") {
    & ".\gradlew.bat" assembleDebug --no-daemon
  } else {
    & "./gradlew" assembleDebug --no-daemon
  }
  if ($LASTEXITCODE -ne 0) { throw "Gradle build failed." }
} finally {
  Pop-Location
}

# 4) Copy APK to public/downloads
if (-not (Test-Path $ApkSrc)) {
  throw "Expected APK at $ApkSrc but it's missing."
}
$DownloadsDir = Split-Path -Parent $ApkDst
if (-not (Test-Path $DownloadsDir)) {
  New-Item -ItemType Directory -Force -Path $DownloadsDir | Out-Null
}
Copy-Item -Force $ApkSrc $ApkDst
Copy-Item -Force $ApkSrc $StreamingApkDst

$size = (Get-Item $ApkDst).Length
Say "Done. APK ready at $ApkDst ($([math]::Round($size / 1MB, 2)) MB)."
Say "StreamingBox download refreshed at $StreamingApkDst."
Say "Sideload: adb install -r `"$ApkDst`""
