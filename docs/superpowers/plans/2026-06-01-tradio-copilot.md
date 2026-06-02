# Tradio AI Co-Pilot Plan

Date: 2026-06-01
Based on: docs/superpowers/HANDOFF-tradio-live-radio-5-6.md
Spec: docs/superpowers/specs/2026-06-01-tradio-copilot-spec.md
Branch: preview/smooth-nav-and-signal-test

## Objective

Deliver the #5 AI Live Co-Pilot for Tradio: an on-demand host assistant in DJStudio that can read the room, suggest a line, and suggest songs using existing live chat, show context, and AI TTS.

## Scope

- Implement server functions in `src/lib/trey-i/vertex.server.ts` for:
  - `coPilotReadRoom`
  - `coPilotSuggestLine`
  - `coPilotSuggestSongs`
- Build the DJStudio Co-Pilot panel in `src/tradio/components/tradio/CoPilotPanel.tsx`.
- Wire `live.aiSpeak(line)` so the host can speak suggested lines through the existing AI voice host audio graph.
- Keep the experience on-demand only, with buttons that call AI only when pressed.
- Degrade gracefully when Gemini keys / TTS are unavailable.

## Deliverables

- `src/lib/trey-i/vertex.server.ts`
- `src/tradio/components/tradio/CoPilotPanel.tsx`
- Updated `src/tradio/components/tradio/screens/DJStudio.tsx`
- Optional minimal tests for AI prompt shaping / response validation
- No DB migration required

## Task breakdown

### 1. Review existing context

- Read `docs/superpowers/specs/2026-06-01-tradio-copilot-spec.md`.
- Confirm `useTradioLiveInteraction` provides live `chat[]` and `requests[]`.
- Confirm `useTradioLiveRoom.aiSpeak` is available for the current host flow.

### 2. Server fns

- Add the three server functions in `src/lib/trey-i/vertex.server.ts`.
- Use `aiGenerateJson` for structured outputs and validate/enforce the response schema.
- Add fallback values/messages for Gemini unavailable or JSON parse failure.
- Keep prompts concise by truncating to the latest ~20 chat messages.

### 3. Client integration

- Ensure `CoPilotPanel` only renders when the host is live (`liveSessionId` exists).
- Button actions:
  - `Read the room` → call `coPilotReadRoom` and display mood/energy/highlights/topic.
  - `Suggest a line` → call `coPilotSuggestLine`, show the line, and expose `Speak it`.
  - `Suggest songs` → call `coPilotSuggestSongs` and render placeholder picks.
- `Speak it` should call `live.aiSpeak(line)` and not auto-play without explicit host action.
- Add a small cooldown or disabled state after pressing a button to prevent spam.

### 4. Testing & verification

- Add minimal tests in `src/tradio/components/tradio/copilot.test.ts` or similar.
- Verify touched files compile cleanly with `npx tsc --noEmit -p tsconfig.json`.
- Manual verification path:
  1. Start DJStudio live session.
  2. Open Co-Pilot controls.
  3. Click “Read the room”, “Suggest a line”, “Suggest songs”.
  4. Confirm the line can be spoken via `aiSpeak`.

### 5. Next handoff step after #5

- Surface #6 prerequisites before implementing music or replays:
  - Does the product want a real music catalog now or a placeholder song suggestion flow?
  - Is LiveKit egress available for recording replays, or should we fall back to browser `MediaRecorder`?
  - What are the licensing and content rights requirements for on-air music playback?

## Notes

- This plan is intentionally narrow: finish #5 cleanly, then validate #6 prerequisites.
- Do not add new DB tables for #5.
- Keep the Co-Pilot experience ephemeral; do not persist a new activity log unless explicitly requested.
