# Tradio: AI Voice Host (per-segment read) — Design

Date: 2026-06-01
Status: Approved (design) — pending implementation plan
**Sub-project 4 of 6** in the "Tradio hybrid live radio show" initiative.
(#1 show foundation + AI builder, #2 live broadcast core, #3 in-show interaction are done.)

## Context

Shows carry AI-written host `script`s per talk segment (#1). A host can broadcast live on mic
(#2: `useTradioLiveRoom` publishes the host mic into a `tradio-show` LiveKit room; listeners
subscribe). The "hybrid" model promises the host can hand the desk to an **AI voice host**.

The repo already has a TTS engine: `treyITts` (`src/lib/trey-i/tts.server.ts`), a TanStack server fn
using Gemini `gemini-2.5-flash-preview-tts` that takes text and returns `{ audioBase64, mimeType:
'audio/wav' }` (24 kHz mono PCM as WAV, truncated to ~700 chars). The deployed `Hayden` LiveKit
narrator agent is external and story-only, so a new server agent is **not** buildable in this repo —
the viable approach is **browser-side**: synthesize a segment's script and publish it as an audio
track into the host's existing room.

This sub-project lets the host trigger the AI voice to read a show's talk-segment scripts into the
live broadcast, one segment at a time.

## Goals

- While live, the host selects a show and taps **"AI read"** on a talk segment; the AI voice reads
  that segment's `script` into the broadcast (listeners hear it), then hands back to the host.
- The host mic auto-mutes while the AI speaks and restores afterward; the host can **Stop** mid-read.
- Reuse `treyITts` + the existing host room connection. No new server agent, no new tables.

## Non-goals (later / chosen against)

- Full auto-pilot sequencing through a whole show (chosen against — per-segment only).
- Pre-rendered/cached segment audio (live synthesis for now).
- Voice cloning or an in-app voice picker (uses the default Gemini TTS voice, env-configurable).
- AI live co-pilot reading chat (#5); music-in-broadcast + replays (#6).

## Approach

Approach **A** (approved): browser-side TTS publish. `treyITts` → WAV → Web Audio → a published
LiveKit `LocalAudioTrack`. Per-segment, host-triggered. Extends `useTradioLiveRoom` (which already
owns the host's room) with an AI-voice capability; adds host UI in DJStudio's Broadcast panel.

## Audio pipeline — extend `useTradioLiveRoom` (`src/tradio/components/tradio/useTradioLiveRoom.ts`)

Add to the hook's return: `aiSpeak(text: string): Promise<void>`, `aiSpeaking: boolean`,
`aiSegmentLabel: string | null`, `stopAi(): void`. Internals (host role only):

- Lazily, on first `aiSpeak`: create a shared `AudioContext` and `MediaStreamAudioDestinationNode`;
  wrap `dest.stream.getAudioTracks()[0]` in a `livekit-client` `LocalAudioTrack`; publish it once via
  `room.localParticipant.publishTrack(track)` (a persistent "ai-host" track kept until leave).
- Each `aiSpeak(text)`: call the `treyITts` server fn → decode base64 WAV via
  `audioContext.decodeAudioData` → create a `BufferSource` → connect to the destination → `start()`.
  Set `aiSpeaking = true`, mute the host mic (`setMicrophoneEnabled(false)`); on the source's `ended`
  event (or `stopAi()`), set `aiSpeaking = false` and re-enable the mic.
- `stopAi()` stops the current `BufferSource` and restores mic state.
- Cleanup: stop/close the `AudioContext`, unpublish the AI track on room teardown (extend the existing
  cleanup in the hook).

## Pure helper — `src/tradio/components/tradio/aiVoiceHost.ts`

`talkSegmentsWithScript(show: RadioShow): ShowSegment[]` → returns segments whose `type` is a talk
type (`intro | host-talk | closing | producer-spotlight | artist-premiere`) **and** have a non-empty
`script`. Unit-tested. (Keeps the "which segments are readable" rule pure + testable.)

## Host UI — DJStudio Broadcast panel (`screens/DJStudio.tsx`, the `tab === 'broadcast'` block, when `liveSessionId`)

- A **"Show on air" picker**: load the host's shows via `listMyShows()` (from #1's `radioShowService`);
  a `<select>` chooses the on-air show (local state, independent of the session row).
- For the chosen show, render `talkSegmentsWithScript(show)`: each row shows the segment title + a
  **"▶ AI read"** button → `live.aiSpeak(segment.script!)`. While `live.aiSpeaking`, show an
  **"AI speaking: <aiSegmentLabel> · Stop"** banner wired to `live.stopAi()`; disable other AI-read
  buttons during a read.
- Empty states: no show selected → prompt to pick one; selected show has no scripted talk segments →
  "This show has no AI host scripts."

## Error handling

- `treyITts` returns `{ audioBase64: null }` (no Gemini key / failure) → toast "AI voice isn't
  available right now"; do not mute the mic (or restore immediately).
- `publishTrack` / `decodeAudioData` failure → toast + restore mic + clear `aiSpeaking`.
- Leaving/ending the broadcast while AI is speaking → `stopAi()` + teardown in the hook cleanup.

## Verification

- **`node:test`** for `talkSegmentsWithScript` (includes only talk types with non-empty script;
  excludes music-block/commercial/poll and empty scripts).
- **`tsc --noEmit`** clean for touched files.
- **Manual smoke** (Gemini TTS key + LiveKit env, two browsers): host goes live, picks a show, taps
  "AI read" on a talk segment → a listener in the other browser hears the AI voice read the script,
  the host mic is muted during the read and restored after; **Stop** halts it mid-read.

## Decisions / defaults

- Per-segment, host-triggered (no auto-pilot).
- Single persistent published "ai-host" track per session; mic muted only during a read.
- Live synthesis via `treyITts` (default Gemini voice; `GEMINI_TREYI_VOICE_NAME` overrides).
- On-air show chosen locally in the Broadcast panel (no change to #2's `goLive`/session row).
- Requires the Gemini TTS key + LiveKit env to actually voice (graceful "unavailable" otherwise).
