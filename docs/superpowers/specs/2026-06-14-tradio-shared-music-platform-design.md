# Tradio Shared Music Platform Design

**Date:** 2026-06-14
**Status:** Approved design
**Delivery order:** Release 3 of 3

## Purpose

Make Tradio the canonical music service and player across Trey TV profiles, posts, the web app, and
the native TV APK. Remove separate hardcoded song lists and use stable Tradio IDs everywhere.

Related designs:

- `2026-06-14-native-trey-tv-fire-tv-design.md`
- `2026-06-14-tradio-approved-dj-show-builder-design.md`

## Current State

Music is fragmented:

- Tradio has a new platform provider and player, but production data can still fall back to mocks.
- Profile music uses `SELECTABLE_SONGS` and direct audio elements.
- The post composer uses a separate hardcoded `TRADIO_TRACKS` list.
- `profile_song_id` and `music_order` exist, but their values are not backed by a guaranteed
  canonical catalog.
- `src/tradio/api.ts` queries `tradio_tracks`, `tradio_stations`, `tradio_playlists`, and
  `tradio_playlist_tracks`, but this repository does not contain a complete migration that defines
  those catalog tables.
- The native TV app does not yet expose the shared Tradio catalog/player.

## Canonical Catalog

One production migration defines and secures:

- `tradio_artists`
- `tradio_albums`
- `tradio_tracks`
- `tradio_playlists`
- `tradio_playlist_tracks`
- `tradio_stations`
- `tradio_station_tracks`
- `tradio_user_library`
- `tradio_recent_plays`

Tracks use UUID primary keys and include:

- Artist and album references
- Title and clean display metadata
- Artwork URL
- Stream/storage URL
- Duration
- Genre and mood tags
- Explicit-content flag
- Visibility and publishing status
- Rights/clearance status
- Created and updated timestamps

Only published, cleared catalog items are available to public listeners. Owners and authorized
creators can manage their own draft catalog records through protected paths.

## Shared Domain Contract

Web and native clients consume the same API model:

```text
TradioTrack
  id
  title
  artistId
  artistName
  albumId
  artworkUrl
  streamUrl
  durationMs
  explicit
  genres
  moods
  availability
```

All consumers store only stable IDs plus optional display snapshots. A renamed song or updated
artwork does not break profile or post references.

## Playback Contract

The player contract supports:

- Play track
- Play queue
- Play station
- Pause/resume
- Seek
- Previous/next
- Like/save
- Recently played
- Current item metadata
- Media interruption and ducking

The web Tradio player remains the browser implementation. Native TV uses Media3 ExoPlayer. Both
implement the same domain operations and report playback activity to the same service.

Playback must begin from an explicit user/remote action where required by the platform. Profiles do
not force autoplay on Safari, mobile browsers, or TV startup.

## Profile Integration

`profiles.profile_song_id` references a published Tradio track ID. The profile preference
`music_order` stores up to five published Tradio track IDs.

Profile edit:

- Searches the Tradio catalog
- Previews through the shared player
- Selects a profile song
- Orders up to five featured tracks
- Rejects unavailable or uncleared tracks

Profile display:

- Resolves track IDs through the catalog API
- Uses the shared player
- Shows a safe unavailable state if a track is removed
- Does not create its own `<audio>` ownership or hidden autoplay timer

Existing legacy string IDs are mapped to canonical tracks through a migration/alias table. Unknown
legacy IDs are left unset rather than silently mapped to the wrong song.

## Post Integration

`user_feed_posts` gains:

- `tradio_track_id uuid null`
- `tradio_track_snapshot jsonb null`
- `tradio_clip_start_ms integer null`
- `tradio_clip_duration_ms integer null`

The composer:

- Searches the real Tradio catalog
- Previews through the shared player
- Attaches a track by ID
- Optionally selects a permitted clip window
- Sends the ID and snapshot with the post

The feed card:

- Displays track attribution and artwork
- Starts playback through the shared player
- Handles unavailable tracks without breaking the post

Appending plain "attached sound" text to a caption is not the data model.

## Tradio Web Integration

The remounted structure under `src/tradio/platform`, `src/tradio/mobile`, `src/tradio/tv`, and
`src/components/tradio` becomes the supported Tradio frontend.

Production behavior:

- Synchronous cached data can render first.
- Catalog refresh occurs after first paint.
- Mock data is allowed in development and explicit fallback mode only.
- Mobile and TV presentations share providers and domain data without importing each other's UI.
- Tradio continues to open inside the Trey TV router without a welcome or cover screen.

## Native TV Tradio

The native APK adds Compose screens for:

- Tradio home
- Browse
- Live stations
- Search
- Library
- Artist
- Album/playlist
- Now playing
- Queue
- DJ show and replay discovery

Media3 plays tracks, stations, and replay streams. D-pad focus and back behavior follow the native TV
design. The native app does not load the Tradio web page in a WebView.

## Cross-Device State

Authenticated state synchronizes:

- Saved tracks, albums, playlists, and stations
- Recently played
- Profile song and featured music
- Playback activity

Playback handoff or live casting may be added through the existing TV cast session contract after
basic sync is reliable. It is not required to complete this release.

## Error Handling

- Catalog unavailable: show cached data and retry.
- Track unavailable: preserve the profile/post but disable playback with an explanation.
- Stream failure: retain queue and offer retry/next.
- Authentication unavailable: allow public listening but do not persist private library changes.
- Rights not cleared: exclude the item from public search and playback.

## Migration

1. Create the canonical catalog tables and RLS.
2. Seed or import verified current Tradio tracks.
3. Create aliases for known legacy profile and composer IDs.
4. Add post music-reference columns.
5. Update web data and player services.
6. Migrate profile selection and post composer.
7. Add native TV Tradio screens and Media3 playback.
8. Remove production hardcoded song arrays after migration verification.

## Testing

Database:

- Public reads only published/cleared tracks
- Creator cannot mutate another creator's catalog
- Profile and post references preserve integrity
- Legacy aliases map only known tracks

Web:

- Search and attach a real Tradio track to a post
- Profile song and top five persist after reload
- Feed/profile playback uses the shared player
- Mobile Safari receives no forced autoplay
- Tradio route remains responsive

Native TV:

- Browse catalog with D-pad
- Play/pause/seek/next/back
- Live station playback
- Background/resume behavior
- Firestick and Chromecast playback

Cross-platform:

- The same track ID resolves to the same metadata on web and TV
- Saves and recent plays synchronize for the signed-in user

## Acceptance Criteria

Release 3 is complete only when:

1. Profiles, posts, Tradio web, and native TV resolve music from one catalog.
2. Hardcoded production track arrays are removed from profile and composer flows.
3. Profile music and post sounds store canonical Tradio track IDs.
4. Web and native TV playback use their shared domain contract.
5. Tradio browse and playback pass on Firestick and Chromecast.
6. Unavailable or uncleared tracks fail safely without breaking content.

## Out of Scope

- A separate phone APK
- Full Spotify-style cross-device handoff
- Third-party licensed catalog ingestion without verified rights
- DJ show authoring on TV
