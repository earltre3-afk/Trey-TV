# Handoff: Tradio Hybrid Live Radio — Sub-projects #5 & #6

**Audience:** the next coding AI assistant picking up the "Tradio hybrid live radio show" initiative.
**Date:** 2026-06-01
**Branch:** `preview/smooth-nav-and-signal-test` (NOT `main`).

This document gives you (a) the working context + conventions, (b) everything already built (#1–#4),
and (c) a full breakdown of the two remaining sub-projects (#5 AI live co-pilot, #6 music-in-broadcast
+ replays) so you can pick up immediately.

---

## 0. How work is done here (follow this exactly)

**Workflow per sub-project:** `superpowers:brainstorming` → write spec to
`docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` (commit) → `superpowers:writing-plans` → write
plan to `docs/superpowers/plans/YYYY-MM-DD-<feature>.md` (commit) → execute as a **hybrid**:
- **DB migration tasks: run inline yourself** (dry-run then apply to prod), because they touch the
  live database.
- **Coupled code tasks: delegate to one implementer subagent** (give it the committed plan path +
  guardrails), then **review its diff inline** (diffstat scoped, tests, typecheck) before finishing.
- **Verification: inline.**

**Repo conventions (critical):**
- Unit tests use Node's built-in runner but must run via **`npx tsx --test <file>`** (NOT `node --test`;
  `.ts` needs tsx). There is no `npm test` script. Pattern: `import test from 'node:test'; import assert from 'node:assert/strict'`.
- Typecheck touched files: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep "<fragment>" || echo clean`.
  The project has **pre-existing unrelated tsc errors in other files** — only files YOU touch must be
  clean. (`vertex.server.ts` had 2 pre-existing errors earlier; one was since fixed externally.)
- **Migrations** go to the live **Trizzy Hub** Supabase project (ref `wcdwlqnfcsuaacbvdmgx`) via the
  linked CLI: `supabase db push --dry-run --linked` then `printf 'y\n' | supabase db push --linked`.
  After DDL, **poll REST for ~30–60s** for the PostgREST schema cache (`GET /rest/v1/<table>?select=id&limit=1`
  → 200). Service-role key is in `.env` as `SUPABASE_SERVICE_ROLE_KEY`.
- **Commit per task.** End every commit message body with:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- **Staging discipline:** `git add` ONLY the files a task touches. NEVER `git add -A`/`.` — the branch
  has unrelated concurrent working-tree edits (layout/style WIP) you must not bundle.
- **Deploy rules (hard):** never commit/push/deploy unless GitHub identity = `earltre3@gmail.com`,
  Supabase = Trizzy Hub, workspace = `C:\Users\info\TREY-TV-ANTIGRAVITY`. Push only when the user asks.
- **UI rule:** don't restyle/restructure app UI beyond what the approved spec needs.

**Env caveats (features ship without these, but degrade gracefully):**
- Gemini key (`GEMINI_API_KEY` / `GOOGLE_GENAI_API_KEY`) — empty locally; AI falls back / shows
  "unavailable". Needed for real generation + TTS.
- LiveKit (`LIVEKIT_URL`/`LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET`) — needed to actually broadcast.
- Supabase (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`) — configured; powers auth + Realtime.

---

## 1. What already exists (reuse these — do not rebuild)

**Specs/plans** live in `docs/superpowers/specs|plans/2026-06-01-tradio-*`. Read them for detail.

### #1 Show foundation + AI builder (DONE)
- Table `tradio_radio_shows` (owner-scoped RLS + `is_template` public read). Columns incl.
  `segments jsonb`, `settings jsonb`, `status('draft'|'template'|'scheduled'|'live'|'archived')`.
- `src/lib/trey-i/vertex.server.ts` → `generateRadioShow` (Gemini `aiGenerateJson` with a
  **`responseSchema` enum**; validates/coerces; falls back to local `generateShowPlan`).
- `src/tradio/components/tradio/showPlan.ts` — pure `generateShowPlan`, `validateGeneratedShow`,
  `SHOW_SEGMENT_TYPES`, segment coercion.
- `src/tradio/components/tradio/radioShowService.ts` — `generateShow`, `saveShow`, `listMyShows`,
  `listTemplates`, `deleteShow` (supabase-or-local fallback).
- `ShowSegment` (in `data.ts`) has a `script?: string` field (AI host lines for talk segments).

### #2 Live broadcast core (DONE)
- Table `tradio_live_sessions` (`host_user_id`, `room_name`, `status('live'|'ended')`, `peak_listeners`,
  public read of live rows). Helper fn `public.tradio_is_session_host(p_session_id)` (SECURITY DEFINER).
- Token server `src/lib/livekit-token.server.ts` — room kind **`tradio-show`** (host publishes,
  listeners subscribe), permission via `src/lib/tradio/liveSessionPolicy.ts` (`resolveTradioShowPublish`,
  `tradioShowRoomName`).
- `src/tradio/components/tradio/tradioLiveService.ts` — `goLive`, `endLive`, `listLiveNow`,
  `updatePeakListeners`.
- `src/tradio/components/tradio/useTradioLiveRoom.ts` — client hook (host mic / listener audio +
  presence). **Now also exposes `aiSpeak(text,label?)`, `stopAi()`, `aiSpeaking`, `aiSegmentLabel`
  (see #4) and owns a shared Web Audio graph + a published "ai-host" `LocalAudioTrack`.**
- `src/tradio/components/tradio/TradioLiveNowBar.tsx` — listener "LIVE / Listen Live" bar (mounted in
  `Shell.tsx`), owns the listener audio connection + opens the Live Room modal.
- DJStudio "Go Live"/"End Broadcast" wired (`screens/DJStudio.tsx`); `liveSessionId` + `live` (the host
  `useTradioLiveRoom` instance) live in that component.

### #3 In-show interaction (DONE)
- Tables `tradio_live_chat`, `tradio_live_requests`, `tradio_live_polls`, `tradio_live_poll_votes`
  (public read; inserts by `auth.uid()`; host-only request-status + poll writes via
  `tradio_is_session_host`).
- `src/tradio/components/tradio/liveInteractionLogic.ts` — pure `computePollTallies`, `nextRequestStatus`.
- `src/tradio/components/tradio/tradioLiveInteractionService.ts` — chat/request/poll data ops.
- `src/tradio/components/tradio/useTradioLiveInteraction.ts` — **Supabase Realtime hook** (one channel
  `tradio-live:<sessionId>` over the 4 tables); exposes `chat[]`, `requests[]`, `activePoll`, `tallies`
  + action fns. **This is your live chat/requests feed for #5.**
- `src/tradio/components/tradio/LiveRoomModal.tsx` (listener) + host panel in DJStudio Broadcast tab.

### #4 AI voice host (DONE)
- `src/tradio/components/tradio/aiVoiceHost.ts` — pure `talkSegmentsWithScript(show)`.
- `useTradioLiveRoom.aiSpeak(text, label?)` — calls `treyITts` (Gemini `gemini-2.5-flash-preview-tts`,
  `src/lib/trey-i/tts.server.ts`, returns WAV base64), decodes via Web Audio, plays through the shared
  `MediaStreamAudioDestinationNode` published as the "ai-host" track; mutes mic during the read.
  **The shared audio graph is the key reuse point for #6 music-in-broadcast.**
- DJStudio Broadcast "AI Voice Host" panel: show picker + per-segment "▶ AI read".

### Cross-cutting patterns to copy
- **Supabase Realtime:** `supabase.channel(name).on('postgres_changes',{event,schema,table,filter},cb).subscribe()`
  + `supabase.removeChannel(ch)`. Canonical example: `src/features/music-review/components/public/{LiveRoom,ChatPanel}.tsx`.
- **AI JSON with enum validation:** `aiGenerateJson({ prompt, responseSchema })` in
  `src/lib/trey-i/aiProvider.server.ts` + coerce/validate the result server-side, fall back on failure
  (see `judgeSignalTest`/`generateRadioShow` in `vertex.server.ts`). **Always validate AI output.**
- **AI text:** `aiGenerateText({ prompt, systemInstruction, temperature, maxTokens })`.
- **Storage upload:** `src/lib/supabase-storage.ts` (`uploadFeedMedia`/`uploadProfileMedia` → public
  bucket + `getPublicUrl`); bucket created in a migration via `insert into storage.buckets`.
- **Server fn from client:** import the `createServerFn` export and call `fn({ data: {...} })`.

---

## 2. Sub-project #5 — AI Live Co-Pilot

**One-liner (from the initiative):** real-time co-pilot for the **human** host during a live show —
script prompts ("what to say next"), song suggestions, and chat-sentiment reads ("read the room").

**Why it's well-positioned now:** #3 gives you the live `chat[]`/`requests[]` feed; #1 gives the show
+ segment scripts; #4 gives `aiSpeak` (so a suggested line can be spoken by the AI voice in one tap);
Gemini text is available via `aiGenerateText`/`aiGenerateJson`.

**Proposed scope (confirm with the user in brainstorming):**
1. **Read the room** — summarize the live chat's mood/energy + surface highlights/question to address.
2. **Suggest a line** — given the show context + current segment + recent chat, produce a short host
   line the host can read aloud or one-tap send to `aiSpeak` (#4).
3. **Suggest songs/segments** — given mood + recent requests, suggest what to play/do next (free-text
   until #6's catalog exists).

**Likely no new tables** (reads existing `tradio_live_chat` + the loaded show). YAGNI: skip a
`copilot_log` table unless the user wants history.

**Server fns to add** (in `src/lib/trey-i/vertex.server.ts`, all Gemini, validate output):
- `coPilotReadRoom({ messages })` → `aiGenerateJson` with `responseSchema`
  `{ energy: 'low'|'building'|'hot', mood: string, highlights: string[], suggestedTopic: string }`.
- `coPilotSuggestLine({ showTitle, segmentTitle, hostTone, recentChat })` → `aiGenerateText` → one
  2–3 sentence host line in the show's tone.
- `coPilotSuggestSongs({ mood, recentRequests })` → `aiGenerateJson` → `{ picks: [{ title, artist, why }] }`
  (placeholder catalog for now; wire to a real catalog in #6).

**Client:**
- A pure helper module + tests if any logic is non-trivial (e.g. shaping recent chat → prompt input);
  most is server-side.
- A **co-pilot panel** in DJStudio's Broadcast tab (host-only, when `liveSessionId`). Inputs come from
  the existing `useTradioLiveInteraction({ sessionId })` `chat`/`requests`. Buttons: "Read the room",
  "Suggest a line" (renders the line + a "Speak it" button → `live.aiSpeak(line)`), "Suggest songs".
- **Rate-limit / on-demand:** call the AI on button press (and optionally a manual "refresh"), NOT on
  every chat message — Gemini calls are not free and chat is high-volume.

**Open questions to clarify with the user (do this in brainstorming):**
- On-demand only, or auto-refresh the room read every N seconds?
- Should "Suggest a line" auto-speak via the AI voice host (#4) or only display for the human to read?
- Song suggestions now (no real catalog → free-text/placeholder) or defer entirely to #6?

**Decomposition:** small-to-medium, one plan (~4–5 tasks): server fns (1–2 tasks) → co-pilot panel
(1 task) → optional pure prompt-shaper + tests → verification. No migration likely.

**Gotchas:** Gemini key (degrade to "co-pilot unavailable"); keep prompts small (truncate recent chat
to ~20 messages); validate/coerce all JSON output (enum the `energy` field).

---

## 3. Sub-project #6 — Music-in-Broadcast + Replays

**This is the largest, most complex remaining piece, and it has real prerequisites/blockers. Treat #6
as its own mini-initiative and decompose it.** Two distinct halves:

### 6A. Music in the broadcast (playing tracks into the live stream)
**The hard prerequisite:** there is **no real music catalog** — everything in
`src/tradio/components/tradio/data.ts` (tracks, stations, DJ_MIXES, releases) is **mock with no real
audio files**, and Trey TV has **no licensed-music catalog or audio storage** yet. Real
music-in-broadcast needs:
- A catalog of playable tracks with **audio file URLs** (a `tradio_tracks` table + a Storage bucket for
  audio, or an external licensed source) — **and licensing/rights clearance** (loop in the existing
  Tradio **legal-acceptance** flow; this is a legal, not just technical, gate).
- **Surface this blocker to the user first.** Options to offer: (a) build a minimal
  artist-uploaded-track catalog (artists upload their own audio — rights are clean), (b) use the
  Instant Release / producer-beat content as the catalog, (c) defer music entirely and ship replays
  only.

**Technical approach once audio URLs exist (reuses #4's audio graph — this is the elegant part):**
- Extend `useTradioLiveRoom` with `playTrack(url)`, `stopTrack()`, `setMusicGain(level)` that route an
  `<audio>`/`AudioBufferSource` through the **same shared `MediaStreamAudioDestinationNode`** the AI
  voice already publishes. Result: music + host mic + AI voice are mixed into the one published track
  listeners already subscribe to. Add **ducking** (lower music gain while `aiSpeaking` or mic active).
- **Integration win:** #3's request queue "Played" action can call `playTrack(requestAudioUrl)` so
  approving a listener request actually plays it on air.
- Host UI: a now-playing/queue control in the DJStudio Broadcast tab.

### 6B. Replays (record live shows for on-demand playback)
**Approach — LiveKit Egress (server-side recording):**
- `livekit-server-sdk` includes `EgressClient`. On `goLive`, start an **audio/room-composite egress**
  to file output (S3-compatible storage / Supabase Storage bucket); on `endLive`, stop egress and
  record the output URL + duration.
- New table `tradio_replays` (`session_id`, `show_id`, `host_user_id`, `audio_url`, `duration_sec`,
  `created_at`; public read) written when egress completes (egress webhook → a server route, or poll
  egress status on `endLive`).
- **Prerequisite:** LiveKit **Egress must be enabled** on the LiveKit deployment + storage creds
  configured. Confirm this with the user (LiveKit Cloud egress or self-hosted egress).
- **Fallback (no egress):** host-side `MediaRecorder` capturing the mixed `MediaStreamDestination`
  output → upload the blob to Storage on `endLive`. Simpler, but recording dies if the host's tab
  closes; egress is the robust path.
- **Replay playback surface:** DJStudio "Archive" tab currently renders mock `REPLAY_ITEMS` — swap to
  `tradio_replays`; add a listener replay player (reuse `PlayerContext`, `sourceType: 'live_show'`/a new
  `'replay'`). The `tradio_radio_shows.status='archived'` value already exists for this.

**Decomposition of #6 (recommend separate specs/plans):**
1. **6-pre: Music catalog foundation** (only if doing music) — `tradio_tracks` + audio Storage bucket +
   upload/ingest; or pick an existing content source. *Has a legal/licensing gate.*
2. **6A: Music-in-broadcast playback** — extend the `useTradioLiveRoom` audio graph + ducking + host
   queue UI + wire #3 "Played" → playback.
3. **6B: Replay recording** — egress (or MediaRecorder) on go/end-live + `tradio_replays` + webhook/poll.
4. **6C: Replay playback** — Archive tab + listener replay player from `tradio_replays`.

**Gotchas/risks:** licensing (legal) is the gating risk for music; egress requires infra/config;
browser autoplay policies for listener replay; mixing/ducking needs careful Web Audio gain nodes;
egress output storage + signed URLs.

---

## 4. Quick-start checklist for the next assistant

1. `git log --oneline -25` and read `docs/superpowers/specs|plans/2026-06-01-tradio-*` to absorb #1–#4.
2. Confirm you're on `preview/smooth-nav-and-signal-test` and the deploy identity is `earltre3@gmail.com`.
3. For #5: run `superpowers:brainstorming`, resolve the 3 open questions above, spec → plan → hybrid build.
4. For #6: **first** surface the music-catalog/licensing + egress prerequisites to the user and decide the
   decomposition (catalog? music? replays-only?), then spec → plan → hybrid build each piece.
5. Reuse the audio graph in `useTradioLiveRoom` (don't create a second AudioContext), the Realtime hook
   from #3 for live chat, and the AI-JSON-with-enum-validation pattern for any new Gemini calls.
6. Migrations: inline dry-run → apply to Trizzy Hub → poll REST. Code: implementer subagent + inline review.
7. Remember: features must degrade gracefully without Gemini/LiveKit/egress creds.
