# Tradio: In-Show Interaction (Chat / Requests / Polls) — Design

Date: 2026-06-01
Status: Approved (design) — pending implementation plan
**Sub-project 3 of 6** in the "Tradio hybrid live radio show" initiative.
(#1 show foundation + AI builder, #2 live broadcast core are done.)

## Context

A host can now broadcast live audio (#2: `tradio_live_sessions`, LiveKit room, `useTradioLiveRoom`,
`TradioLiveNowBar`, DJStudio Go Live). But interaction is still mock: DJStudio's "Requests" tab uses
`LISTENER_REQUESTS` from `data.ts`, and ShowBuilder's "fan chat" is canned templates.

The app has a mature **Supabase Realtime** pattern — `supabase.channel(name).on('postgres_changes',
{ event, schema, table, filter }, cb).subscribe()` — used in games (`RoomLobby`), `watch-party.$id`,
and especially `src/features/music-review/components/public/LiveRoom.tsx` (live chat
`music_review_comments` + reactions + queue + energy meter), which is the direct analog for this work.

This sub-project makes in-show interaction real for a live session: **fan chat, song requests, and
host-run polls**, delivered live to everyone tuned in.

## Goals

- Listeners tuned into a live show can: send **chat**, submit a **song request**, and **vote** in the
  host's active **poll** — all updating live for everyone.
- The **host** sees the live chat, manages the **request queue** (queue / played / decline), and runs
  **polls** (create question+options, watch live tallies, close).
- Everything persists (host can review; basis for future replay) and is delivered via Supabase Realtime.

## Non-goals (later)

- AI moderation of chat (a `moderate_chat` Vertex task exists; wiring it is deferred).
- AI co-pilot reading the room (#5). Chat replay / transcripts. Reactions/emoji bursts (chat only).
- Anonymous (signed-out) participation — sending requires a signed-in Trey TV account.

## Approach

Approach **A** (approved): Supabase Realtime on session-scoped tables (mirrors `music-review/LiveRoom`),
a `tradioLiveInteractionService`, a `useTradioLiveInteraction` subscription hook, a listener
`LiveRoomModal`, and host controls in DJStudio's Broadcast tab. Reuses the proven realtime pattern;
no new transport.

## Data model — migration (all FK `tradio_live_sessions.id ON DELETE CASCADE`)

- `tradio_live_chat`: `id uuid pk`, `session_id uuid not null`, `user_id uuid not null references
auth.users(id)`, `author_name text`, `body text not null`, `created_at timestamptz default now()`.
- `tradio_live_requests`: `id`, `session_id not null`, `user_id not null`, `requester_name text`,
  `song_title text not null`, `artist text`, `message text`,
  `status text not null default 'pending' check (status in ('pending','queued','played','declined'))`,
  `created_at`.
- `tradio_live_polls`: `id`, `session_id not null`, `host_user_id uuid not null references auth.users(id)`,
  `question text not null`, `options jsonb not null default '[]'` (array of `{ id, label }`),
  `status text not null default 'open' check (status in ('open','closed'))`, `created_at`, `closed_at`.
- `tradio_live_poll_votes`: `id`, `poll_id uuid not null references tradio_live_polls(id) on delete
cascade`, `user_id uuid not null references auth.users(id)`, `option_id text not null`,
  `created_at`, `unique(poll_id, user_id)` (one vote per user; vote change = upsert on the constraint).

Indexes on `session_id` (chat/requests/polls) and `poll_id` (votes).

RLS:

- **SELECT**: public on all four (live interactions are public to anyone viewing the room).
- **INSERT**: chat / requests / poll_votes — authenticated, `auth.uid() = user_id`.
- **UPDATE** `tradio_live_requests.status` — only the session host:
  `exists (select 1 from tradio_live_sessions s where s.id = session_id and s.host_user_id = auth.uid())`.
- **INSERT/UPDATE** `tradio_live_polls` — only the session host (same subquery) and `host_user_id = auth.uid()`.
- **UPDATE** own `poll_votes` (change vote) — `auth.uid() = user_id`.

## Realtime

One channel per session: `tradio-live:<sessionId>`, subscribing to `postgres_changes` on
`tradio_live_chat`, `tradio_live_requests`, `tradio_live_polls` (filtered `session_id=eq.<id>`) and
`tradio_live_poll_votes` (reload tallies for the active poll). INSERTs append; status/poll/vote
changes re-render. Channel torn down on unmount (`supabase.removeChannel`). Mirrors `LiveRoom.tsx`.

## Service — `src/tradio/components/tradio/tradioLiveInteractionService.ts`

Supabase-or-fallback (mirrors `tradioLiveService`):

- `sendChat({ sessionId, body })`, `listChat(sessionId)`
- `submitRequest({ sessionId, songTitle, artist, message })`, `listRequests(sessionId)`,
  `setRequestStatus({ requestId, status })` (host)
- `createPoll({ sessionId, question, options })` (host), `closePoll(pollId)` (host),
  `getActivePoll(sessionId)`, `votePoll({ pollId, optionId })`, `listVotes(pollId)`
- pure helper `computePollTallies(options, votes)` → `[{ optionId, label, count, pct }]`
- pure helper `nextRequestStatus(current, action)` validating allowed transitions
  All never throw; classify errors via `handleMissingTradioTables`.

## Hook — `useTradioLiveInteraction({ sessionId, isHost })`

Owns the `tradio-live:<sessionId>` channel lifecycle; loads initial data then keeps it live. Exposes
`chat[]`, `requests[]`, `activePoll`, `tallies`, `myVote`, and actions (`sendChat`, `submitRequest`,
`setRequestStatus`, `createPoll`, `closePoll`, `votePoll`).

## UI

- **Listener `LiveRoomModal`** (new — mirrors `NowPlayingScreen` full-screen modal), opened from
  `TradioLiveNowBar` "Listen Live" (which currently just connects audio). Audio keeps playing via the
  existing `useTradioLiveRoom` listener connection; the modal renders: header (title / host / ON AIR /
  listener count), a **chat feed + input**, a **"Request a song"** form, and the **active poll**
  (vote buttons → live tally bars). Leave/close tears down audio + channel.
- **Host — DJStudio Broadcast tab** (`tab === 'broadcast'`): add a live **chat feed**, the real
  **request queue** (replaces `LISTENER_REQUESTS`; each row has Queue / Played / Decline), and **poll
  controls** (create with question + 2–4 options, live tallies, Close). Only renders the interaction
  panel when the host is live (`liveSessionId` from #2).

## Error handling

- Channel subscribe error → service `list*` reload on an interval as a fallback; surface a subtle
  "reconnecting" note, never a crash.
- Unauthenticated send → toast + sign-in prompt (no insert attempted).
- DB unavailable / RLS / missing table → service returns a warning, UI shows empty state.
- Vote when a poll is closed → ignored (poll status checked before insert).

## Verification

- **`node:test`**: `computePollTallies` (counts + percentages, empty poll = 0%) and `nextRequestStatus`
  (valid transitions: pending→queued/declined, queued→played/declined; invalid rejected).
- **`tsc --noEmit`** clean for touched files.
- **Manual two-client smoke** (LiveKit + Supabase): host live; listener opens Live Room → sends chat
  (host sees live), submits a request (appears in host queue → host marks Played), host opens a poll →
  listener votes → both see the tally update live.

## Decisions / defaults

- Signed-in users only may send (RLS requires `user_id = auth.uid()`); anyone may read.
- One active poll per session at a time (host closes before opening another); UI enforces, not the DB.
- One vote per user per poll (DB unique constraint); changing the vote upserts.
- Chat is unmoderated for now (AI `moderate_chat` wiring deferred).
- Migration applied to the live **Trizzy Hub** project via the linked Supabase CLI.
