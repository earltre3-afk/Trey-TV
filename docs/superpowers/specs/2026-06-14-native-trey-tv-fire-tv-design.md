# Native Trey TV and Fire TV Design

**Date:** 2026-06-14
**Status:** Approved design
**Delivery order:** Release 1 of 3

## Purpose

Replace the WebView-first Trey TV APK with a native Kotlin and Jetpack Compose TV application that
always opens the purple Trey TV interface and works with Fire TV, Chromecast with Google TV, Google
TV, and Android TV remotes.

The React application in `apps/trey-tv-web` remains a visual reference during the rewrite. It is not
the runtime shell of the finished APK.

Related designs:

- `2026-06-14-tradio-approved-dj-show-builder-design.md`
- `2026-06-14-tradio-shared-music-platform-design.md`

## Confirmed Problems

The current APK does not meet the product contract:

1. `WebShellScreen.kt` boots `https://tv.treytrizzy.com/tv`, so the APK shows the live Trey TV
   website instead of the purple TV interface.
2. The purple shell is configured only as
   `file:///android_asset/trey-tv-web/index.html`, an offline fallback.
3. The current source tree does not contain
   `apps/trey-tv-tv/app/src/main/assets/trey-tv-web`, so the fallback cannot work in a new build.
4. The public APK response is served with `Content-Disposition: inline`; Downloader on Fire TV
   needs a direct file response that is explicitly downloadable.
5. The current download page relies on the browser `download` attribute, which is not a sufficient
   server contract for Downloader.

## Product Contract

- The APK always boots a native purple Trey TV interface.
- Remote content and API failures never replace the interface with a website.
- Internet access supplies authentication, profile data, media catalogs, Tradio data, schedules,
  images, music, and video streams.
- The app remains navigable when services fail and shows cached content or explicit retry states.
- WebView is allowed only for web-native games that cannot be delivered reasonably in Compose.
- One universal package, `com.treytv.streamingbox`, supports all target TV devices.

## Architecture

### Application shell

`TreyTvApp.kt` becomes the only top-level navigation owner. Its initial screen is the native home
screen after the native splash. `AppScreen.WebShell` is removed from the normal startup path.

The app uses:

- Kotlin
- Jetpack Compose
- AndroidX TV Material and TV Foundation
- Media3 ExoPlayer for video, HLS, live radio, and music
- OkHttp for API requests
- `TreySessionStore` for device session persistence

### Native screens

Release 1 delivers native versions of:

- Splash
- Home / Watch Now
- Guide
- Search
- Browse
- My List
- Profile
- Games
- Settings
- Activation / device login
- Video detail
- Video player
- Music entry surface

The native Music entry surface initially links into the shared Tradio repository contract. Full
native Tradio browse, station, library, and player screens are completed in Release 3.

### Visual system

The purple React shell is the visual specification:

- Midnight black base
- Fuchsia and purple ambient lighting
- Purple focus borders and glow
- Gold secondary highlights
- Large TV-safe typography
- Consistent 10-foot spacing

These values move into a native Compose theme and reusable primitives. Native screens do not embed
the React shell.

### Navigation and remote input

All primary actions are native focus targets. The app supports:

- D-pad up, down, left, and right
- Center/select
- Back
- Menu where a screen defines a menu action
- Predictable initial focus
- Focus restoration after returning from detail or player screens
- No touch requirement

The manifest retains both `LEANBACK_LAUNCHER` and standard `LAUNCHER` categories and declares the
touchscreen optional.

### Data and offline behavior

Repositories expose cached state before network refresh:

- `TreyTvRepository`
- `ProfileRepository`
- `GuideRepository`
- `GameRepository`
- `TradioRepository`

Each repository returns a typed result with data, freshness, and recoverable error information.
Network errors render retry states inside the native shell. They do not navigate to the website.

### Web game boundary

`GameHostScreen` remains the only general WebView host. It accepts allowlisted Trey TV game URLs,
maps remote back behavior, and displays native loading and error chrome. The WebView cannot become
the application home screen.

## Distribution

### APK artifacts

The build produces:

- `app-debug.apk` for internal device testing
- `app-release.apk` when release signing is configured
- `public/downloads/trey-tv-streamingbox-debug.apk`
- `public/downloads/trey-tv-firestick-debug.apk`

The two public debug names may contain the same universal APK bytes. They exist so each installation
path is explicit and testable.

### HTTP contract

Both public APK paths return:

- `Content-Type: application/vnd.android.package-archive`
- `Content-Disposition: attachment; filename="<artifact-name>.apk"`
- `Accept-Ranges: bytes`
- A cache policy tied to a versioned file or content hash

`/apk` presents plain absolute direct links. It does not depend on JavaScript or only on the HTML
`download` attribute. The page includes current size, version, SHA256, package ID, and Fire TV
unknown-app installation instructions.

### Versioning

Each published APK increments `versionCode` and `versionName`. The download page metadata is
generated or verified from the built artifact so stale sizes and hashes cannot remain visible.

## Fire TV Compatibility

The universal APK must be tested on Fire OS for:

- Downloader direct URL response
- Package installation
- Launcher visibility
- Native purple startup
- D-pad focus across all primary navigation
- Back behavior
- Media playback
- Resume after backgrounding
- Network-loss retry behavior

Fire TV user-agent detection is not a navigation dependency in the native app. Device differences
may tune capabilities, but they never select a different web shell.

## Error Handling

- API unavailable: retain native shell, show cached rows and retry action.
- Authentication unavailable: remain in guest mode and keep activation reachable.
- Media failure: show an error inside the native player and allow retry/back.
- Game WebView failure: exit to the native Games screen with an error message.
- Missing Tradio data: show an empty native Music surface, not mock production content.

## Migration Strategy

1. Preserve the current working Chromecast APK and checksum as a rollback artifact.
2. Build native screens behind the existing package ID.
3. Change startup only after home, activation, settings, player, and remote navigation pass tests.
4. Remove the WebView startup path after native parity is proven.
5. Publish a new versioned debug APK and test Firestick before replacing the public default link.

## Verification

Automated:

- Gradle unit tests for navigation reducers and repository mappings
- Compose UI tests for focus order, select, and back behavior
- Manifest tests for TV launch categories and optional touchscreen
- HTTP tests for attachment headers and direct APK paths
- Build verification for debug and release variants

Manual device matrix:

| Test | Chromecast / Google TV | Firestick |
|---|---:|---:|
| Download direct APK | Pass required | Pass required |
| Install / update | Pass required | Pass required |
| Launcher icon visible | Pass required | Pass required |
| Purple native shell opens | Pass required | Pass required |
| D-pad navigation | Pass required | Pass required |
| Back navigation | Pass required | Pass required |
| Video playback | Pass required | Pass required |
| Tradio playback | Release 3 | Release 3 |

## Acceptance Criteria

Release 1 is complete only when:

1. The APK never opens the regular Trey TV site as its home interface.
2. The purple native shell opens on Chromecast and Firestick.
3. Downloader can fetch the Firestick APK from a direct URL.
4. Install, launch, D-pad navigation, back, and video playback pass on both device families.
5. The existing package ID and user update path are preserved.

## Out of Scope

- Rewriting web-native games in Kotlin
- Approved-DJ authoring tools on the TV remote
- A separate phone APK
- Device-specific forks unless a verified platform incompatibility requires one
