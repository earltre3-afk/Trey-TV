# Tradio Unified Radio Builder Suite + Real-Time Live Console — Design

**Date:** 2026-06-02
**Status:** Approved (design); pending implementation plan
**Scope:** Points 1 & 2 of the broader Tradio request (unify the builder; build the live "manage show" console). Point 3 (desktop "Now on Tradio" player + Chrome extension) is a **separate project**, not covered here.

---

## Problem

Tradio currently has **two parallel, duplicated broadcast paths**:

1. **DJ Studio** (`src/tradio/components/tradio/screens/DJStudio.tsx`) — a DJ-role dashboard with its _own_ "Go Live" flow. It uses the real backend (`goLive`/`endLive`, `useTradioLiveRoom`, `useTradioLiveInteraction`) and renders a **basic** manage panel, `LiveShowDashboard.tsx` (stat tiles, a mic slider, a non-functional soundboard, a request queue).

2. **Tradio Broadcast Suite** (`src/tradio/components/tradio/screens/BroadcastStudioGateway.tsx`) — the role gateway + show-type picker + the `ShowBuilder` AI builder. Going live _here_ renders a **much richer** but **entirely mock/local** console, `LiveShowDirectorConsole` (soundboard, take-callers queue, "keep host on point" cues, VU meters, per-segment teleprompter).

Every other role surface (Artist Hub, Producer Hub, Stations Hub, Schedule, Role Profile) already deep-links into the Broadcast Suite via `onOpenBroadcastStudio`. So the Suite is effectively already the shared hub — but DJ Studio runs a competing builder + live panel, and the good console is unreachable from the primary "Go Live" button and is not wired to real data.

**Goals:**

- One radio builder suite (no second builder module).
- One live "manage show" console that loads after Go Live, wired to **real-time** data and audio: soundboard, real callers, and a "keep the host on time with programming" rundown.

## Clarified decisions (from brainstorming)

- **Start with** the Unified Builder + Live Console (this spec). Desktop player/extension is deferred.
- **Real-time depth:** "Full real-time everything" — real callers (two-way audio) and a real audio mix. _(Note: an early misread treated "keep on key" as pitch correction; that is NOT in scope — see below.)_
- **Suite structure:** the Broadcast Suite is the one home; role dashboards keep their landing pages but deep-link into the Suite.
- **"Keep host on key" means keep the host on time / on-program**, i.e. a show-clock / rundown assistant — NOT audio pitch correction. No autotune / AudioWorklet DSP.
- **Pacing behavior:** **Auto-pilot the rundown** — segments auto-advance when their timer expires and can auto-trigger the AI host to fill/transition, with host override.

## Existing infrastructure this builds on

- **LiveKit** is already wired for live audio. Host publishes mic to a `tradio-show` room (`roomKind: 'tradio-show'`), listeners subscribe. See `useTradioLiveRoom.ts` and `src/lib/livekit-token.server.ts`.
- The token server already gates publish per session via `resolveTradioShowPublish` (host publishes; listeners are subscribe-only) and imports `RoomServiceClient` (server SDK) — so runtime publish grants are available.
- **AI voice host** already mixes a second audio track in via Web Audio (`AudioContext` → `MediaStreamDestination` → `LocalAudioTrack`) — the exact pattern we generalize into a host broadcast bus. See `useTradioLiveRoom.aiSpeak` and `aiVoiceHost`/`treyITts`.
- **Control plane** is Supabase realtime over `tradio_live_chat`, `tradio_live_requests`, `tradio_live_polls`, `tradio_live_poll_votes` (`useTradioLiveInteraction.ts`, `tradioLiveInteractionService`).
- `liveSessionPolicy.ts` (+ `.test.ts`) holds the publish-resolution logic and is already unit-tested.

## Architecture

### Approach chosen

**One unified host "broadcast bus" + LiveKit runtime permissions** (chosen over per-source LiveKit tracks and over a server-side mixing agent). It extends the existing AI-voice mixing pattern, gives the host one master broadcast mix with real level/duck control, and keeps callers to a small, well-bounded addition.

### Component 1 — Suite consolidation ("one home")

- **Delete** `LiveShowDashboard.tsx` (basic panel) and remove DJ Studio's parallel go-live machinery (`goLive`/`endLive` wiring, `liveSessionId`, the inline broadcast/AI/room/poll JSX in the `broadcast` tab).
- `DJStudio.tsx` keeps its role-landing identity (profile header, my-shows, mixes, requests, archive lists) but its **Go Live / Open Broadcast Studio / Build With AI / Rebuild With AI** buttons deep-link into the Suite.
- Extend the `onOpenBroadcastStudio` deep-link contract beyond `'builder'` to include a `'golive'` target so dashboards can route straight to the live console.
- **Remove the "Mock Gateway Portal Switcher"** in `BroadcastStudioGateway`; derive role/access from the real auth capability the `AccessGate` already enforces instead of the mock role toggle.
- `ShowBuilder.tsx` remains the single builder (already in the Suite). No second builder anywhere.

### Component 2 — Unified Live Console

Extract `LiveShowDirectorConsole` from `BroadcastStudioGateway.tsx` into its own file (`screens/LiveShowConsole.tsx`, replacing both the inline console and the deleted `LiveShowDashboard`) and wire it to real data:

- **Listeners, connection, mic state, AI-host-read** ← `useTradioLiveRoom`.
- **Chat, song requests, polls** ← `useTradioLiveInteraction` (replaces the mock chat simulator, fake listener counts, and hardcoded requests).
- **VU meters** ← a real `AnalyserNode` reading the broadcast mix level (replaces `Math.random` spikes).
- Preserves the existing rich layout: active-segment panel + teleprompter, master mix deck, soundboard, caller queue, live fan feed.

### Component 3 — Host Broadcast Bus (`useTradioHostMix`, new hook)

A single Web Audio graph on the host device:

```
mic ─────────┐
SFX players ─┤
music beds ──┼─► master gain ─► MediaStreamDestination ─► ONE published LiveKit track
AI voice ────┤
caller monitor ┘
```

- **Refactors** the AI-voice publish logic currently inline in `useTradioLiveRoom.ts` so mic + AI + SFX + beds share **one** published track.
- Exposes: `toggleMic`, `playSfx(id)`, `playBed(id)` / `stopBed`, `setMasterVolume`, `setBedVolume` (duck), and the `AnalyserNode` for VU.
- **Assets:** bundle a small royalty-free SFX + music-bed set under `/public` (exact list enumerated in the plan). Soundboard buttons and bed controls play these through the bus.
- Graceful when no `AudioContext`/LiveKit: controls render an "audio offline" state; the rest of the console still works.

### Component 4 — Real callers

- **New table** `tradio_live_call_requests`: `id`, `session_id`, caller `identity` + `name`, `status` (`pending|on_air|ended`), optional `line_note`, timestamps. Realtime-subscribed like the other interaction tables. Migration applied via the linked Supabase CLI (`supabase db push --linked`), not MCP.
- **Listener side:** a "Call in / raise hand" control in the listener's live-show view inserts a `pending` request. _(Exact listener live screen to be confirmed in planning — see Open Items.)_
- **Host side:** the caller queue reads real `pending` requests; **Take call** calls a new server fn `grantCallerPublish(sessionId, identity)` that uses `RoomServiceClient.updateParticipant({ permission: { canPublish: true, canSubscribe: true } })`, then marks the request `on_air`. The caller's client detects the permission change and enables its mic; host + audience hear the caller (LiveKit mixes for listeners; host auto-attaches the remote track as it already does). **Disconnect** revokes publish (`canPublish: false` + server mute) and marks `ended`.
- New `src/lib/tradio/tradioCaller.server.ts` (+ route wired into `src/server.ts` alongside the LiveKit token handler) holds the grant/revoke handlers. Permission resolution logic added to / mirrored from `liveSessionPolicy.ts` for testability.

### Component 5 — Auto-pilot rundown engine (`useShowRundown`, new hook)

Driven by the live show's `segments[]` + per-segment `duration`:

- Tracks `currentIndex`, `elapsedInSegment`, `remainingInSegment`; **auto-advances** to the next segment when the timer expires.
- On each transition, optionally **auto-triggers the AI host** (`live.aiSpeak(segment.script ?? hostNotes, segment.title)`) and surfaces that segment's cues (`getSegmentCues`) + teleprompter notes.
- **Pacing bar:** on-time / behind, from real elapsed vs. planned cumulative duration.
- **Host overrides:** pause auto-pilot, manually advance, extend current segment. Pausing stops auto-advance but keeps timers/cues visible.

## Data flow

1. Host builds/loads a show in `ShowBuilder` → "Go Live" → `goLive()` creates a `tradio_live_session` → Suite routes to the Live Console with that `sessionId` and the show plan.
2. Console mounts `useTradioLiveRoom` (LiveKit join + host bus), `useTradioLiveInteraction` (chat/requests/polls), `useShowRundown` (segments), and subscribes to `tradio_live_call_requests`.
3. Listeners join the same room (subscribe-only) and the realtime channels; they can chat, request songs, vote, and **raise hand to call in**.
4. Host drives the show: soundboard/beds play through the bus; auto-pilot advances segments and triggers AI host; host takes/declines callers (server permission grants); ends broadcast → `endLive()` + teardown.

## Error handling & fallbacks

- LiveKit unconfigured/unavailable → console loads; audio controls show "audio offline"; interaction/rundown still function.
- Supabase unavailable → existing local fallbacks (consistent with current services).
- Caller-grant failure → toast; request stays `pending`.
- AI voice failure during auto-pilot → segment advances silently; never hard-breaks the show.

## Testing

- **Unit (pure logic):** rundown timing/pacing math (`useShowRundown` core), caller status transitions, and caller publish-permission resolution (extend `liveSessionPolicy.test.ts`).
- **Manual:** end-to-end live flow (go live → soundboard/beds → take a caller → auto-pilot through segments → end), verified in the running app.

## Build sequence (one project, phased)

1. **Consolidation** + wire the extracted console to real backend (chat/requests/polls/listeners/AI, real VU). Remove `LiveShowDashboard` and the mock role switcher.
2. **Broadcast bus** (`useTradioHostMix`): unified mic + SFX + beds + AI track; bundle real audio assets.
3. **Real callers**: table + listener call-in + grant/revoke server fn + host take/disconnect.
4. **Auto-pilot rundown** (`useShowRundown`): timers, pacing, auto-advance, AI-host triggers, host overrides.

## Files (high level)

- Modify: `BroadcastStudioGateway.tsx` (remove mock switcher, host the unified console, `'golive'` deep-link), `DJStudio.tsx` (remove parallel go-live; deep-link buttons), `useTradioLiveRoom.ts` (delegate audio publish to the bus), `src/server.ts` (caller route), `liveSessionPolicy.ts`/`.test.ts` (caller permission).
- Add: `screens/LiveShowConsole.tsx`, `useTradioHostMix.ts`, `useShowRundown.ts`, `src/lib/tradio/tradioCaller.server.ts`, Supabase migration for `tradio_live_call_requests`, `/public` SFX + bed assets, listener "call in" control in the live-show view.
- Delete: `screens/LiveShowDashboard.tsx`.

## Open items to resolve during planning

- Confirm the exact **listener live-show screen** (likely `NowPlaying.tsx` or the mini-player) to place the "Call in" control.
- Finalize the bundled **SFX/music-bed asset list** and their sources/licensing.
- Confirm whether callers should also be reflected in the listener UI (e.g., "Caller on air" indicator).

## Out of scope

- Desktop "Now on Tradio" persistent player and Chrome extension (separate project).
- Audio pitch correction / autotune (explicitly not what "keep on key" meant).
- Multi-host / co-host broadcasting.
