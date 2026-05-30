# Android TV APK Launch + Route Fix Pass 4H.3

Date: 2026-05-27

## Scope

Emergency stabilization pass for the Trey TV Android TV debug APK and TV shell route wiring. This pass did not add backend features, production signing, payment flows, Trey-I onboarding changes, auth changes, or RLS changes.

## APK Source

- Source folder: `apps/trey-tv-tv`
- Android wrapper: native Kotlin/Gradle TV wrapper, not Capacitor
- Public download path: `public/downloads/trey-tv-streamingbox-debug.apk`
- Built APK path: `apps/trey-tv-tv/app/build/outputs/apk/debug/app-debug.apk`
- Package id after fix: `com.treytv.streamingbox`
- Main activity: `com.treytv.tv.MainActivity`
- Debug APK size after rebuild: `28,893,774` bytes
- SHA256: `58EB86DB712E4B31F45DF865D776AA6199C179292890BECF274E20A61096FD7A`

## Launch Failure Root Cause

Live Google TV crash capture was blocked because `adb` is not available in PATH on this workstation. The evidence found locally showed likely launch blockers:

- Public docs and test commands expected package id `com.treytv.streamingbox`, but the previous debug APK was built as `com.treytv.tv.debug` because the app used `applicationId = "com.treytv.tv"` plus a debug `applicationIdSuffix = ".debug"`.
- The public download APK matched the stale May 24 debug build before this pass.
- The bundled Android WebView assets were stale relative to the current TV web shell build.
- The manifest only exposed `LEANBACK_LAUNCHER`; this pass also added the standard `LAUNCHER` category for launcher compatibility.
- The WebView shell loads `file:///android_asset/trey-tv-web/index.html`; file access for that local shell path is now explicitly allowed while keeping file URL cross-access disabled.

## Launch Stabilization Fixes

- Changed Android debug package id to `com.treytv.streamingbox`.
- Removed the debug package suffix so install/open commands target the documented package.
- Added `android.intent.category.LAUNCHER` alongside `LEANBACK_LAUNCHER`.
- Allowed WebView access to local Android asset files while preserving stricter `allowFileAccessFromFileURLs = false` and `allowUniversalAccessFromFileURLs = false`.
- Added a TV shell error boundary with a visible safe-mode fallback and dev-only startup error logging.
- Updated TV build scripts to refresh both public debug APK names after successful Gradle build:
  - `public/downloads/trey-tv-streamingbox-debug.apk`
  - `public/downloads/trey-tv-box-debug.apk`

## Route Wiring Fixes

The side navigation now routes to visible screens instead of only moving focus:

- Watch Now
- Search
- Browse
- My List
- Music
- Premium
- Games
- Watch Parties
- Source Hub
- Settings

Placeholder sections are TV-friendly, focusable, and explicit about coming-soon limitations where a backend feature is not available.

## Screens Added Or Repaired

- Search: search controls, suggested searches, result slots.
- Browse: category rails and content tiles.
- My List: Favorites, Watch Later, Continue Watching empty-state content.
- Music: music/video/channel placeholder modules.
- Premium: coming-soon membership panel with no fake payment flow.
- Watch Parties: placeholder party controls.
- Source Hub: placeholder source/status tiles.

## Games Fix

Games now shows five focusable tiles:

- Spades: `Ready`, opens existing Spades route.
- Blackjack: `Coming Soon`, opens an in-page status panel.
- Bullshit: `Coming Soon`, opens an in-page status panel.
- TRUNO: `In Development`, opens an in-page status panel.
- Interactive Stories: `Ready`, opens the stories route.

No game tile is a dead no-op.

## Settings Fix

Settings now has working tab state and distinct panels for:

- Account
- Device
- Playback
- Captions
- Audio
- Privacy
- Parental Controls
- Diagnostics
- About Trey

Each tab responds to click/Enter and updates the visible panel.

## Visual And Focus QA

Browser QA was run against the local TV web shell. Verified:

- Search, Browse, My List, Music, and Premium render visible screens.
- Games renders all five required tiles.
- Blackjack click/OK path renders a status panel instead of a blank screen.
- Settings tabs switch to distinct visible panels.
- Keyboard focus/Enter smoke test did not crash or trap focus.

Observed non-blocking limitation:

- The guide schedule request can return a local dev `404` for `/api/free-tv/schedule`; the shell remains usable with fallback content.

## Build And Validation

- `npm test`: failed because the root package has no `test` script.
- `npm run build`: passed at the root; app build also completed during TV APK packaging.
- `npm run lint`: passed with existing warnings, no lint errors.
- `npx tsc --noEmit --pretty false`: app package passed; root package still has unrelated existing TypeScript errors in feed/onboarding routes.
- `npx cap sync android`: failed because this repo root is not a Capacitor project and npm could not determine a `cap` executable.
- Native APK build: completed via `apps/trey-tv-tv/gradlew.bat assembleDebug` through the repo TV build script.

## APK Refresh Result

- Built APK: `apps/trey-tv-tv/app/build/outputs/apk/debug/app-debug.apk`
- Copied APK: `public/downloads/trey-tv-streamingbox-debug.apk`
- Size: `28,893,774` bytes
- SHA256: `58EB86DB712E4B31F45DF865D776AA6199C179292890BECF274E20A61096FD7A`
- Expected download URL: `/downloads/trey-tv-streamingbox-debug.apk`
- Signing: Android debug certificate (`CN=Android Debug`)
- Bundled web asset confirmed: `apps/trey-tv-tv/app/src/main/assets/trey-tv-web/index.html`

## Google TV QA

Live Google TV verification remains pending because `adb` is not installed or not available in PATH on this machine. Do not treat this debug APK as production-ready until it has been installed and launched on the target Google TV device.

Suggested device command when ADB is available:

```powershell
adb install -r public/downloads/trey-tv-streamingbox-debug.apk
adb shell am start -n com.treytv.streamingbox/com.treytv.tv.MainActivity
adb logcat -d | findstr /i "treytv streamingbox chromium fatal exception crash"
```

## Remaining Limitations

- Google TV launch verification is pending due missing `adb`.
- Non-Spades games are placeholder/status flows only.
- Premium is a coming-soon panel with no payment flow.
- Watch Parties and Source Hub are placeholder panels.
- Root TypeScript still has unrelated pre-existing feed/onboarding errors; Trey-I onboarding/auth internals were intentionally not changed.
