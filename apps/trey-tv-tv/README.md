# Trey TV Streaming Box App

Native Android TV foundation for Trey TV on:

- Android TV / Google TV
- Chromecast with Google TV
- Amazon Fire TV / Fire Stick

This app is intentionally isolated from the existing Trey TV web app. It does not modify Trey-I onboarding, Supabase migrations, or web production flows.

## What Works

- Android TV project structure with Kotlin and Jetpack Compose.
- Leanback launcher manifest for TV home screens.
- Splash screen.
- Sign-in screen with:
  - Device-code login through `/api/tv/device/start`.
  - Polling through `/api/tv/device/status`.
  - Mobile/browser activation at `/tv/activate`.
  - Email/password fallback placeholder.
- Main TV navigation:
  - Watch Now.
  - Guide.
  - Games.
  - My Profile.
  - Settings.
- Watch Now rows:
  - Featured hero.
  - Continue Watching.
  - New Episodes.
  - Creator Channels.
  - Music Videos.
- Video detail screen.
- Full-screen Media3/ExoPlayer screen for HLS/MP4 placeholder playback.
- Watch progress hook via `TreyTvApiService.saveWatchProgress`.
- Games tab with:
  - Truno.
  - Spades.
  - Blackjack.
  - Bullshit/Cheat.
  - Interactive Stories.
  - RPG placeholder.
- Reusable `GameHostScreen` for web-based game wrappers.
- Android TV remote key mapping:
  - D-pad up/down/left/right.
  - Select/confirm.
  - Back.
  - Menu.
- Live API layer for device login, profile, home rows, games, and watch progress, with dev fallback content if endpoints are unavailable.

## Project Layout

```text
apps/trey-tv-tv/
  settings.gradle.kts
  build.gradle.kts
  app/
    build.gradle.kts
    src/main/AndroidManifest.xml
    src/main/java/com/treytv/tv/
      MainActivity.kt
      TreyTvApplication.kt
      data/
      ui/
```

## Configuration

The default config uses safe placeholders in `app/build.gradle.kts`:

```kotlin
buildConfigField("String", "TREY_TV_API_BASE_URL", "\"https://treytv.com\"")
buildConfigField("String", "TREY_TV_WEB_BASE_URL", "\"https://treytv.com\"")
buildConfigField("String", "TREY_TV_SUPABASE_URL", "\"\"")
buildConfigField("String", "TREY_TV_SUPABASE_ANON_KEY", "\"\"")
```

Replace these with live environment-specific values using Gradle product flavors, CI secrets, or local Gradle properties. Do not hardcode service role keys or private credentials in the Android app.

For real-device testing, set the Android app base URLs to the same deployed Trey TV web/API origin that serves `/tv/activate` and `/api/tv/*`. The current defaults point at `https://treytv.com`; use local-only hosts such as `10.0.2.2`, LAN IPs, or tunnels only for explicitly local testing because physical TV devices cannot reach `localhost` on the development machine.

Backend environment required for TV device auth and TV APIs:

```bash
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only service role key>
TV_DEVICE_SESSION_SECRET=<32+ random chars>
TREY_TV_PUBLIC_ORIGIN=https://tv.treytrizzy.com
VITE_SITE_URL=https://tv.treytrizzy.com
NEXT_PUBLIC_SITE_URL=https://tv.treytrizzy.com
```

Client/browser Supabase environment remains public-key only:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
SUPABASE_PUBLISHABLE_KEY=<publishable or anon key>
```

`SUPABASE_SERVICE_ROLE_KEY` and `TV_DEVICE_SESSION_SECRET` must stay server-side. Do not add either value to Android `BuildConfig`, Vite `VITE_*` variables, checked-in Gradle files, or client bundles.

## Supabase Migration Readiness

The durable TV device login migration is:

```text
supabase/migrations/20260520235620_tv_device_sessions.sql
```

Review result for the current migration:

- Creates only `public.tv_device_sessions`.
- Uses unique `device_code` and `user_code` values.
- Constrains `status` to `pending`, `approved`, `expired`, or `denied`.
- Adds indexes for active user-code lookup, device-code polling, and recent user sessions.
- Enables RLS and revokes direct `anon`/`authenticated` table access.
- Leaves TV start, status, and approval flows to trusted server endpoints using the service-role client.
- Requires approval through `POST /api/tv/device/approve` with an authenticated Trey TV bearer token.
- Marks expired pending sessions from the backend when a device polls or a user tries to approve an expired code.
- Does not include unrelated table changes.

Apply it to the target linked Supabase project from the repo root:

```bash
supabase link --project-ref <project-ref>
supabase db push --dry-run
supabase db push
```

For CI or an unlinked environment, use a percent-encoded database URL:

```bash
supabase db push --db-url "$SUPABASE_DB_URL" --dry-run
supabase db push --db-url "$SUPABASE_DB_URL"
```

## Running Locally

Open `apps/trey-tv-tv` in Android Studio.

Recommended setup:

1. Install Android Studio.
2. Install Android SDK Platform 35.
3. Install Android TV emulator images.
4. Open the `apps/trey-tv-tv` folder as its own Gradle project.
5. Let Android Studio sync Gradle.
6. Run the `app` configuration on a TV emulator or device.

If Gradle is available on your path:

```bash
cd apps/trey-tv-tv
gradle :app:assembleDebug
```

The debug APK is written to:

```text
apps/trey-tv-tv/app/build/outputs/apk/debug/app-debug.apk
```

The Android package name is:

```text
com.treytv.tv
```

## Debug APK Install Workflow

### Android TV Emulator

1. Android Studio > Device Manager.
2. Create Device.
3. Choose a TV profile, such as Android TV 1080p.
4. Use a recent Google TV / Android TV system image.
5. Start the emulator.
6. Build the APK:

```bash
cd apps/trey-tv-tv
gradle :app:assembleDebug
```

7. Confirm ADB sees the emulator:

```bash
adb devices
```

8. Install or update:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

9. Reinstall from clean state if needed:

```bash
adb uninstall com.treytv.tv
adb install app/build/outputs/apk/debug/app-debug.apk
```

10. Launch from the TV launcher or with ADB:

```bash
adb shell monkey -p com.treytv.tv 1
```

11. Read logs:

```bash
adb logcat | grep -i "treytv"
```

PowerShell alternative:

```powershell
adb logcat | Select-String -Pattern "treytv","Trey TV","AndroidRuntime"
```

Use emulator D-pad controls:

- Arrow keys for navigation.
- Enter for Select.
- Escape or Back for Back.

Check:

- Every nav item focuses.
- Cards show obvious focus state.
- Select opens details or launches a game.
- Back returns to the previous screen.
- Video player responds to Select, Left, Right, and Back.

### Chromecast With Google TV / Google TV Device

1. On the TV, go to Settings > System > About.
2. Select Android TV OS build repeatedly until developer options are enabled.
3. Go to Settings > System > Developer options.
4. Enable USB debugging or Wireless debugging / Network debugging, depending on the device OS.
5. Find the TV IP address under Settings > Network & Internet.
6. Connect from the development machine:

```bash
adb connect <google-tv-ip-address>:5555
adb devices
```

Some newer Google TV builds show a pairing code first:

```bash
adb pair <google-tv-ip-address>:<pairing-port>
adb connect <google-tv-ip-address>:<adb-port>
```

7. Build and install:

```bash
cd apps/trey-tv-tv
gradle :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

8. Launch Trey TV from the Google TV app launcher or with ADB:

```bash
adb shell monkey -p com.treytv.tv 1
```

9. Update/reinstall:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

10. Uninstall if needed:

```bash
adb uninstall com.treytv.tv
```

11. Read logs:

```bash
adb logcat | grep -i "treytv"
```

PowerShell alternative:

```powershell
adb logcat | Select-String -Pattern "treytv","Trey TV","AndroidRuntime"
```

Test with the physical remote after install.

### Fire Stick / Fire TV

1. On Fire TV, go to Settings > My Fire TV > About.
2. Select the device name repeatedly until developer options are enabled.
3. Go to Settings > My Fire TV > Developer Options.
4. Enable ADB Debugging.
5. Enable Apps from Unknown Sources or Install unknown apps for the installer path you use.
6. Find the Fire TV IP address under Settings > My Fire TV > About > Network.
7. Connect over the local network:

```bash
adb connect <fire-tv-ip-address>
adb devices
```

8. Build and install:

```bash
cd apps/trey-tv-tv
gradle :app:assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

9. Launch:

```bash
adb shell monkey -p com.treytv.tv 1
```

10. Update/reinstall:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

11. Uninstall if needed:

```bash
adb uninstall com.treytv.tv
```

12. Read logs:

```bash
adb logcat | grep -i "treytv"
```

PowerShell alternative:

```powershell
adb logcat | Select-String -Pattern "treytv","Trey TV","AndroidRuntime"
```

Test D-pad, Select, Back, and Menu from the Fire TV remote.

## Real-Device QA Checklist

Use this before submitting to Google Play TV or Amazon Appstore review:

1. Install APK.
2. Launch Trey TV.
3. Confirm splash loads.
4. Start TV sign-in.
5. Confirm user code appears.
6. Open `/tv/activate` on phone/browser.
7. Enter code.
8. Approve while logged into Trey TV.
9. Confirm TV app exits pending state.
10. Confirm session survives app restart.
11. Confirm My Profile loads display name, avatar if available, `public_profile_uid`, and rewards / 423 UID if available.
12. Confirm Watch Now rows load.
13. Open video detail page.
14. Play a video.
15. Pause/resume with remote.
16. Seek/rewind/fast-forward if supported.
17. Exit video.
18. Confirm watch progress saves.
19. Relaunch app and confirm resume position appears.
20. Open Games tab.
21. Launch Truno.
22. Confirm D-pad selects the card, not decorative UI.
23. Confirm SELECT plays/draws.
24. Confirm BACK works.
25. Repeat basic D-pad test for Spades, Blackjack, Bullshit/Cheat, and Interactive Stories.
26. Confirm normal mobile/desktop web gameplay was not broken.
27. Sign out.
28. Relaunch app and confirm session is cleared.
29. Confirm no sensitive token appears in logs.
30. Confirm errors show clean retry states, not crashes.

## Live Trey TV API Contract

The native app now calls Trey TV backend endpoints through `LiveTreyTvApiService`:

- `POST /api/tv/device/start`
- `GET /api/tv/device/status?device_code=...`
- `GET /api/tv/profile`
- `GET /api/tv/content/home`
- `GET /api/tv/games`
- `GET /api/tv/watch-progress`
- `POST /api/tv/watch-progress`

The web activation route is:

- `/tv/activate`

The app stores the returned bearer token with AndroidX encrypted shared preferences when available, and clears it on sign-out. Configure `TREY_TV_API_BASE_URL` and `TREY_TV_WEB_BASE_URL` per environment using Gradle/CI values. Do not hardcode service role keys or private credentials in the Android app.

Device-code sessions are stored server-side in `tv_device_sessions`. Token handoff is encrypted with the backend-only `TV_DEVICE_SESSION_SECRET`; set this to at least 32 random characters in every deployed environment.

For production, keep Cloudflare Stream signed playback URLs generated by the backend and returned as `playback_url`/`stream_url` from `/api/tv/content/home`.

## Game Host Contract

`GameHostScreen` dispatches this browser event into the loaded game:

```js
window.addEventListener("treytv-remote-input", (event) => {
  const action = event.detail.action;
  const source = event.detail.source; // "android-tv-remote"
  // "UP", "DOWN", "LEFT", "RIGHT", "SELECT", "MENU"
});
```

Games should route these actions to the active playable target or focused game control only. Do not move decorative UI, icons, suits, or menu badges in response to directional input.

## Release Candidate Build Notes

Current Android configuration:

- App id / package name: `com.treytv.tv`.
- App label: `Trey TV`.
- Version: `versionCode = 1`, `versionName = "0.1.0"`.
- SDK: `minSdk = 23`, `targetSdk = 35`, `compileSdk = 35`.
- Permission: `android.permission.INTERNET`.
- TV launcher: `android.intent.category.LEANBACK_LAUNCHER`.
- TV requirement: `android.software.leanback` is required and touchscreen is not required.
- Launcher icon: placeholder adaptive icon resources.
- TV banner: placeholder `@drawable/ic_banner`.
- ProGuard/R8: release minification is currently disabled.
- Release signing: not configured in this repo.
- Debug-only settings: debug APK uses normal debug signing; base URLs are configurable through Gradle `BuildConfig` fields.

Ready for real-device RC testing:

- Debug APK builds from the isolated Android TV project.
- Device-code auth endpoints and `/tv/activate` route exist.
- Durable TV device sessions are backed by the Supabase migration listed above.
- Android API and web base URLs are centralized in `BuildConfig`.
- TV launcher manifest, landscape activity, Internet permission, and TV remote input path are present.

Placeholder before public submission:

- Replace launcher icon and TV banner with final Trey TV store/launcher assets.
- Replace placeholder/fallback video content with production Cloudflare Stream playback fields where required.
- Decide whether release minification should be enabled and test R8 rules before store upload.
- Bump `versionCode` and `versionName` for the release candidate submitted to stores.

Credentials and assets needed before Play Store / Fire TV release:

- Android release keystore, key alias, and signing passwords stored only in CI or local secure storage.
- Google Play Console app access and Android TV listing assets.
- Amazon Developer Console access and Fire TV listing assets.
- Final 320 x 180 TV banner, launcher icon, screenshots, feature graphic, privacy policy URL, and content rating questionnaire inputs.
- Production `SUPABASE_URL`, server-only `SUPABASE_SERVICE_ROLE_KEY`, and `TV_DEVICE_SESSION_SECRET`.
- Production Android `TREY_TV_API_BASE_URL` and `TREY_TV_WEB_BASE_URL`.

Remaining blockers before public submission:

- Real hardware QA checklist above must pass on Android TV / Google TV and Fire TV.
- Release signing must be configured outside the repo without committing secrets.
- Store-ready launcher/banner/listing assets must replace placeholders.
- Production playback URLs and any entitlement rules must be verified with real content.
