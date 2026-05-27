# Trey TV Box Device Test Handoff

## What This APK Is

This is the Trey TV Box native Android TV debug APK for real-device QA.

Test on:

- Chromecast with Google TV / Google TV
- Android TV
- Fire Stick / Fire TV

APK path:

```text
apps/trey-tv-tv/app/build/outputs/apk/debug/app-debug.apk
```

Android package:

```text
com.treytv.tv
```

## Supabase Migration Status

Required migration:

```text
supabase/migrations/20260520235620_tv_device_sessions.sql
```

This migration must be applied before TV device-code login can work. It creates `public.tv_device_sessions` for durable TV login state, unique device/user codes, expiration timestamps, status constraints, user binding, indexes, and RLS. It should be applied once to the linked Trey TV Supabase project before testing.

## Backend / Env Setup

The deployed Trey TV backend used by the APK must have:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TV_DEVICE_SESSION_SECRET
TREY_TV_PUBLIC_ORIGIN or VITE_SITE_URL or NEXT_PUBLIC_SITE_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_PUBLISHABLE_KEY
```

`TV_DEVICE_SESSION_SECRET` must be 32+ random characters. Keep `SUPABASE_SERVICE_ROLE_KEY` and `TV_DEVICE_SESSION_SECRET` server-side only. Do not put either value in Android `BuildConfig`.

## API Base URL

Android public base URLs are configured in:

```text
apps/trey-tv-tv/app/build.gradle.kts
```

Current defaults:

```text
TREY_TV_API_BASE_URL=https://treytv.com
TREY_TV_WEB_BASE_URL=https://treytv.com
```

To build for staging or production without editing source:

```powershell
cd apps/trey-tv-tv
& 'C:\Users\info\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\bin\gradle.bat' --no-daemon --console plain :app:assembleDebug -PTREY_TV_API_BASE_URL=https://staging.example.com -PTREY_TV_WEB_BASE_URL=https://staging.example.com
```

Use the same origin that serves `/tv/activate` and `/api/tv/*`.

## Install Commands

From `apps/trey-tv-tv`:

```powershell
& 'C:\Users\info\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\bin\gradle.bat' --no-daemon --console plain :app:assembleDebug
```

Install:

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

Reinstall / update:

```bash
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

Uninstall:

```bash
adb uninstall com.treytv.tv
```

Launch:

```bash
adb shell monkey -p com.treytv.tv 1
```

Logs:

```bash
adb logcat | grep -i "treytv"
```

PowerShell logs:

```powershell
adb logcat | Select-String -Pattern "treytv","Trey TV","AndroidRuntime"
```

Save a filtered log if something breaks:

```powershell
adb logcat -d | Select-String -Pattern "treytv","Trey TV","AndroidRuntime" > trey-tv-device-log.txt
```

## First Launch Expectations

1. Trey TV appears in the TV app launcher.
2. Splash screen appears.
3. Sign-in screen appears.
4. Starting TV sign-in shows a user code.
5. Errors show a retry state, not a crash.

## Login Steps

1. On the TV, start TV sign-in.
2. Confirm a user code appears.
3. On a phone or browser, open `/tv/activate` on the same backend origin used by the APK.
4. Sign in to Trey TV if prompted.
5. Enter the TV code.
6. Approve the device.
7. Confirm the TV app exits pending state.
8. Restart the app and confirm the session persists.
9. Sign out, relaunch, and confirm the session is cleared.

## Video Test Steps

1. Open Watch Now.
2. Confirm rows load.
3. Open a video detail page.
4. Play a video.
5. Pause and resume with the remote.
6. Seek, rewind, or fast-forward if available.
7. Press Back to exit video.

## Watch Progress Test Steps

1. Play at least 30 seconds of a video.
2. Exit the video.
3. Relaunch the app.
4. Confirm the resume position appears.
5. Confirm no sensitive token appears in logs.

## Game Remote Test Steps

For each game, confirm D-pad focus moves only through playable controls:

- Truno
- Spades
- Blackjack
- Bullshit / Cheat
- Interactive Stories

Basic pass:

1. Launch the game from Games.
2. Move with D-pad.
3. Press Select on the active playable control.
4. Press Back and confirm it exits cleanly.

## Pass / Fail Notes

Record:

- Device type.
- Install result.
- Login pass/fail.
- Profile load pass/fail.
- Watch Now load pass/fail.
- Video playback pass/fail.
- Watch progress pass/fail.
- Each game remote test pass/fail.
- Any crash, blank screen, stuck loading state, or token shown in logs.

## Bug Report Template

```text
Device type:
OS/build if visible:
APK version/build:
Screen/page:
Steps to reproduce:
Expected behavior:
Actual behavior:
Happens every time:
Remote button used:
Log snippet if available:
Video/photo note if captured manually:
```
