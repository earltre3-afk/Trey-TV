# Tradio AI Co-Pilot Spec

Date: 2026-06-01
Based on: HANDOFF-tradio-live-radio-5-6.md
Branch: preview/smooth-nav-and-signal-test

## Goals
- Provide on-demand host assistant: "Read the room", "Suggest a line", "Suggest songs".
- Use existing live chat (`tradio_live_chat`) feed, current show + segment context, and AI TTS (`aiSpeak`) for one-tap speaking.
- Degrade gracefully without Gemini keys (show "Co-pilot unavailable").

## Decisions (answers to open questions)
- Refresh model calls: On-demand only (button-press). No automatic polling.
- Suggest line behavior: Display suggestion with an explicit "Speak it" button that calls `live.aiSpeak(line)`; do not auto-speak.
- Song suggestions: Provide free-text picks for now (no real catalog). Wire to #6 in future.

## Server functions (add to `src/lib/trey-i/vertex.server.ts`)
- `coPilotReadRoom({ sessionId, recentChatLimit = 20 })`
  - Reads latest chat via DB, truncates to `recentChatLimit`, calls `aiGenerateJson` with schema: { energy: 'low'|'building'|'hot', mood: string, highlights: string[], suggestedTopic: string }
  - Validates & returns parsed JSON. Falls back to summary stub if Gemini unavailable.

- `coPilotSuggestLine({ showId, segmentId, hostTone = 'casual', recentChatLimit = 20 })`
  - Loads show + segment script, recent chat, calls `aiGenerateText` to produce 1–3 sentence host line.
  - Returns `{ line: string, confidence?: number }`.

- `coPilotSuggestSongs({ mood, recentRequests })`
  - Calls `aiGenerateJson` returning `{ picks: [{ title, artist, why }] }` (placeholder schema).

## Client: Co-Pilot Panel (DJStudio Broadcast tab)
- Host-only panel rendered when liveSessionId exists.
- Elements: "Read the room" button (shows energy/mood/highlights), "Suggest a line" (renders line + "Speak it"), "Suggest songs" (list).
- Error states: show clear messages when Gemini or TTS unavailable.
- Rate limiting: disable buttons for 10s after press to prevent spamming.

## Implementation tasks
1. Server fns: implement and unit-test JSON coercion/validation. (1–2 commits)
2. Client panel: UI + hooks calling server fns; wire `live.aiSpeak(line)` for Speak action. (1 commit)
3. Tests & typechecks: add minimal tests for prompt shapers and server validation. (1 commit)
4. Review & deploy migration: none required.

## Testing
- Unit tests for prompt shaping & response-schema validation.
- Manual host flow: start a local show, open DJStudio, press each button, assert responses and `aiSpeak` playback.

## Notes / Gotchas
- Truncate chat input to ~20 messages to limit prompt size and cost.
- Persist no logs unless user requests; keep ephemeral.
- Ensure all AI outputs are validated/coerced before client use.

---
Files to create/modify:
- `src/lib/trey-i/vertex.server.ts` (server fns)
- `src/tradio/components/tradio/CoPilotPanel.tsx` (component)
- tests in `src/tradio/components/tradio/__tests__/copilot.test.ts`

