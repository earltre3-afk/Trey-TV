# Tradio: Live Broadcast Core — Design

Date: 2026-06-01
Status: Approved (design) — pending implementation plan
**Sub-project 2 of 6** in the "Tradio hybrid live radio show" initiative. (Sub-project #1 — show
foundation + real AI builder — is done.)

## Context

A Tradio show can now be created + AI-generated + persisted (`tradio_radio_shows`, sub-project #1),
but "going live" is still a **simulation**: `DJStudio.tsx` "Go Live" toggles a local flag and plays
a mock item; there is no real audio and no real listeners.

The repo already runs **LiveKit** in production:

- `src/lib/livekit-token.server.ts` issues access tokens per **room kind**
  (`interactive-story | story-maker | game | inbox | watch-party`) with per-kind publish
  permissions (watch-party even checks mute/kick via `party_members`), and exposes
  `RoomServiceClient.listParticipants` for live counts.
- The client connects with `livekit-client` (watch-party's pattern); `PlayerContext` already has a
  `live_show` playback source type + `isLive`.
- Config comes from `src/lib/livekit-config.server.ts` (`loadLiveKitConfig`).

This sub-project makes a show actually broadcast live: a host talks on mic and listeners hear it
live, with a real live listener count.

## Goals

- A DJ/host can take a saved show **live**: tap Go Live → a real LiveKit audio room → publishes mic.
- **Listeners** tune in and hear the live audio, and see a real **live listener count**.
- Real **on-air / ended** state, persisted, so listeners can discover what's live and the host can
  end the broadcast.
- Reuse the existing LiveKit token server + client patterns and the existing `PlayerContext`.

## Non-goals (later sub-projects)

- In-show chat / requests / polls (#3), AI voice host + TTS (#4), live AI co-pilot (#5),
  music-in-broadcast + replays (#6).
- A dedicated full live-listen page/route (listeners use existing surfaces + the player).
- Multi-host / co-host rooms (single host publishes for now).

## Approach

Approach **A** (approved): extend the existing LiveKit token server with a `tradio-show` room kind,
add a `tradio_live_sessions` table, a small server service, and a `useTradioLiveRoom` client hook;
wire DJStudio "Go Live" (host) and a "Listen Live" affordance (listener) through the existing
`PlayerContext`. Reuses all proven LiveKit infra (no new realtime stack).

## Token server — new `tradio-show` room kind (`livekit-token.server.ts`)

- Add `"tradio-show"` to `RoomKind` and `roomKindFrom` (accept `roomKind: 'tradio-show'`).
- `resolveRoom` for `tradio-show`: `roomName = \`tradio-show:${cleanPart(body.sessionId, 'session')}\``,
`dispatchAgent: false`, `metadata.mode: 'voice-room'`.
- **Role-based publish** (mirrors the watch-party block): look up the `tradio_live_sessions` row by
  `sessionId`; if the authenticated user's id equals `host_user_id` → `canPublish = true` (host);
  otherwise `canPublish = false`, `canSubscribe = true` (listener). If the session is missing or
  `ended` → `403` for hosts trying to publish; listeners may still subscribe to an active session
  only. Reuse `getTreyIServiceClient()` + bearer-token user resolution already in the file.

## Persistence — migration `tradio_live_sessions`

Columns: `id uuid pk default gen_random_uuid()`, `show_id uuid references public.tradio_radio_shows(id)
on delete set null`, `host_user_id uuid not null references auth.users(id) on delete cascade`,
`room_name text not null`, `status text not null default 'live' check (status in ('live','ended'))`,
`title text`, `host_name text`, `started_at timestamptz not null default now()`,
`ended_at timestamptz`, `peak_listeners integer not null default 0`,
`created_at timestamptz not null default now()`.

RLS:

- public `SELECT` where `status = 'live'` (listeners discover what's on air);
- host `SELECT`/`INSERT`/`UPDATE` of own rows (`auth.uid() = host_user_id`).

Going live also sets the show's `status='live'`; ending sets it back to `'draft'` (or `'archived'`
if the host chooses — out of scope here, default `'draft'`).

## Server service — `tradioLiveService` (server fns in a new `src/lib/tradio/live.server.ts` or

extend an existing tradio server module)

- `goLive({ showId })` → verify the caller owns the show + has host capability; insert a
  `tradio_live_sessions` row (`status='live'`, `room_name='tradio-show:<id>'`); set the show
  `status='live'`; return `{ sessionId, roomName }`. (The room itself is created lazily by LiveKit
  on first join; the token is fetched via the existing `/api/livekit/token` with
  `roomKind: 'tradio-show', sessionId`.)
- `endLive({ sessionId })` → host-only; set `status='ended'`, `ended_at=now()`, persist
  `peak_listeners`; set the show back to `status='draft'`.
- `getLiveSession({ showId })` and `listLiveNow()` → for listener discovery (active sessions).
- `updatePeakListeners({ sessionId, count })` → best-effort max update (called from the host client).

## Client hook — `useTradioLiveRoom({ role, sessionId, roomName })`

Wraps `livekit-client` `Room`:

- Fetch a token from `/api/livekit/token` (`roomKind: 'tradio-show', sessionId`, bearer = Supabase
  access token), `room.connect(livekitUrl, token)`.
- **Host** (`role: 'host'`): `createLocalAudioTrack()` + `room.localParticipant.publishTrack(...)`;
  expose `toggleMute()`.
- **Listener** (`role: 'listener'`): subscribe-only; on `RoomEvent.TrackSubscribed` attach the
  remote audio track to a hidden `<audio>` element and play.
- Expose `connectionState`, `listenerCount` (derive from `room.remoteParticipants` / presence
  events; for the host this is the audience size), `isOnAir`, `leave()`.
- Listener count: host pushes `peak_listeners` via `updatePeakListeners` on change (best-effort).

## UI wiring (reuse — no new page)

- **Host — `DJStudio.tsx`:** "Go Live" calls `goLive(show)` → connects via `useTradioLiveRoom` as
  host → publishes mic → header shows real **ON AIR** + live listener count; "End Broadcast" calls
  `endLive` + disconnects. The legal-acceptance gate already present stays.
- **Listener:** a **LIVE** badge + "Listen Live" action on the host's show surfaces (Tradio Home
  live indicator and/or show card, sourced from `listLiveNow()`) connects the user as a listener via
  `useTradioLiveRoom` and reflects it in `PlayerContext` (`sourceType: 'live_show'`, `isLive: true`)
  as "ON AIR." Tune out = leave the room.

## Error handling

- LiveKit unconfigured → `/api/livekit/token` returns 503 → UI shows "Live isn't available right
  now" (no crash; Go Live disabled).
- Mic permission denied → toast + remain off-air (session not created, or created then ended).
- Host disconnect / tab close → `endLive` on unload (best-effort) + a `started_at` staleness guard
  in `listLiveNow()` (treat sessions with no recent heartbeat as ended) so the UI doesn't show ghost
  live shows. (Heartbeat = the host's periodic `updatePeakListeners`.)
- Listener network drop → `livekit-client` auto-reconnect; on terminal failure, leave + clear player.

## Verification

- **Unit test** (`node:test`) for the token server's `tradio-show` room resolution + role→publish
  mapping (host id → `canPublish:true`; other id → `canPublish:false, canSubscribe:true`; ended/missing
  session → listener-only / 403 for host publish). Factor the pure resolution into a testable helper.
- **`tsc --noEmit`** clean for touched files.
- **Manual two-client smoke** (LiveKit env creds required): host goes live in one browser → ON AIR;
  a second browser tunes in as a listener → hears audio, host's listener count increments; host ends
  → both tear down and the show leaves "live".

## Decisions / defaults

- Single host per session (no co-hosts yet).
- Listener count derived from LiveKit room presence; `peak_listeners` persisted best-effort.
- Room name keyed by `sessionId` (`tradio-show:<id>`), not show id, so re-going-live makes a fresh room.
- Ending a broadcast returns the show to `status='draft'`.
- Migration applied to the live **Trizzy Hub** project via the linked Supabase CLI.
- Requires LiveKit env (`LIVEKIT_URL`/key/secret) to actually broadcast — same env caveat as Gemini.
