# Android TV Working Baseline Pass 4I

Date: 2026-05-28

## A. Working TV Confirmation

The current Trey TV Android TV APK baseline is confirmed working on Google TV.

- User confirmed: the app opens and functions on TV.
- No APK rebuild was performed during this pass.
- No route changes, auth changes, Trey-I onboarding changes, or Spades sync work were performed during this pass.

## B. Correct Source-Of-Truth Repo

- APK source repo: `TREY-TV-ANTIGRAVITY`
- This repository is the baseline source of truth for the currently working TV APK state before new feature work continues.

## C. APK Wrapper Path

- Android wrapper: `apps/trey-tv-tv`
- Package id: `com.treytv.streamingbox`
- Public APK artifact path in this repo: `public/downloads/trey-tv-streamingbox-debug.apk`
- Current local APK filename: `trey-tv-streamingbox-debug.apk`
- Current local APK SHA256: `727C3BC9D17FA20E1DCFA174C181E5D5B0B01961D55D16C9578603B39A29628F`
- Current local APK size: `31,678,061` bytes
- Current local APK last modified: `2026-05-28 07:13:48` local time

## D. Visual Shell Path

- Visual shell: `apps/trey-tv-web`
- The TV visual shell is the web experience wrapped by the Android TV application.

## E. Download Route

- Live download page: `https://tv.treytrizzy.com/apk`
- Do not change the live download route.
- Do not change the public APK download path unless a later pass explicitly scopes and verifies a migration.

## F. What Not To Touch

Do not modify these areas while preserving this baseline:

- Do not rebuild the APK.
- Do not change routes.
- Do not change download paths.
- Do not touch auth.
- Do not touch Trey-I onboarding.
- Do not start Spades sync yet.
- Do not replace the current working package id: `com.treytv.streamingbox`.
- Do not move the Android wrapper from `apps/trey-tv-tv`.
- Do not move the visual shell from `apps/trey-tv-web`.

## G. Known Remaining Limitations

- This is a working debug APK baseline, not a production-signed release baseline.
- The current baseline records the locally available APK artifact and hash; any future APK replacement must record a new filename, size, hash, build source, and on-device verification result.
- TV functionality is confirmed at the app-open-and-functions level by user report; this pass did not perform a new on-device QA sweep.
- Cross-app game state sync is not implemented in this baseline.
- Spades sync has not started and remains intentionally out of scope for this pass.

## H. Next Recommended Pass

Next recommended pass: `SPADES-1` cross-app sync.

Start `SPADES-1` only after preserving this Android TV working APK baseline. That pass should treat the current TV APK state as stable and avoid destabilizing the wrapper, download route, auth, Trey-I onboarding, or APK distribution path.
