# Trey-I Phase 4 — ElevenLabs Mic Wiring
## Requirements

### Context

Phase 1 implemented text-first onboarding via `intake.server.ts` + `onboarding.server.ts`.
Phase 2 implemented non-blocking Gemini TTS playback via `tts.server.ts`.
Phase 3 implemented the ElevenLabs signed URL server function via `elevenlabs-session.server.ts`.

Phase 4 wires the existing mic button in `onboarding.voice.tsx` to real-time ElevenLabs
voice using the Phase 3 signed URL. Text input remains the permanent fallback at all times.

Phase 4 is additive and reversible. The text-first stage machine (`profileSetupTurn`) is
not replaced — voice transcripts feed into it exactly as typed text does.

---

### Goal

Wire the mic button in `onboarding.voice.tsx` to ElevenLabs real-time voice via
`useConversation` from `@elevenlabs/react`. When ElevenLabs is unavailable or fails,
the page falls back silently to text input. Phase 2 TTS continues to play assistant
responses regardless of whether ElevenLabs voice is active.

---

### Scope

**In scope — Phase 4:**
- `pnpm add @elevenlabs/react@1.3.0` (exact version matching RESTORE)
- `src/routes/onboarding.voice.tsx` — mic button wiring, voice state machine, fallback
- Spec files in `.kiro/specs/trey-i-phase-4-elevenlabs-mic/`
- Steering map update in `.kiro/steering/file-map.md`
- Checkpoint update in `.kiro/checkpoints/lovable-backend-migration-current-state.md`

**Explicitly out of scope — Phase 4:**
- Gemini Live — not implemented in any phase
- TreyIWidget — separate future lane, not touched
- Watch Now / Guide — not touched
- Creator/admin publishing pipeline — not touched
- `intake.server.ts`, `onboarding.server.ts`, `tts.server.ts`, `elevenlabs-session.server.ts` — not modified
- Any new server functions
- Any new Supabase tables or columns
- Any new env vars (Phase 3 already introduced `ELEVENLABS_API_KEY` + `ELEVENLABS_AGENT_ID`)
- `.claude/` — not touched, not committed

---

### Dependency Requirement

**DR-1 — `@elevenlabs/react` version**
Add `@elevenlabs/react` at exactly `1.3.0` — the version confirmed in RESTORE's
`package.json`. This is the version whose `useConversation` API is known to work
with the signed URL pattern used in Phase 3.

```bash
pnpm add @elevenlabs/react@1.3.0
```

The `useConversation` hook from `@elevenlabs/react` provides:
- `startSession({ signedUrl, connectionType })` — opens the WebSocket
- `endSession()` — closes the WebSocket
- `setMuted(boolean)` — mutes/unmutes the mic
- `status` — `"connected" | "connecting" | "disconnected"`
- Callbacks: `onConnect`, `onDisconnect`, `onError`, `onMessage`, `onModeChange`

`ConversationProvider` must wrap the component that calls `useConversation`.
In RESTORE, this is done by wrapping the inner component in a thin outer component.
The same pattern is used in Phase 4.

---

### Functional Requirements

**FR-1 — Mic button activates ElevenLabs session**
When the user taps the mic button (currently visual-only), the component must:
1. Call `treyIElevenLabsSession({ data: { accessToken } })` to obtain a signed URL.
2. If `result.ok`, call `conversation.startSession({ signedUrl: result.signedUrl, connectionType: "websocket" })`.
3. If `result.ok === false`, set `voiceUnavailable = true` and keep text input active.
The mic button must not activate if `accessToken` is null or `sessionId` is null.

**FR-2 — Mic button deactivates ElevenLabs session**
When the user taps the mic button while a session is active, the component must:
1. Call `conversation.endSession()`.
2. Reset voice state to idle.
3. Keep text input active.

**FR-3 — Voice state machine**
The component must track a `voiceStatus` state with values:
`"idle" | "connecting" | "connected" | "listening" | "speaking" | "error" | "unavailable"`

Mapping:
- `"idle"` — mic button not yet tapped; no session
- `"connecting"` — `treyIElevenLabsSession` call in flight or WebSocket opening
- `"connected"` — `onConnect` fired; agent is active
- `"listening"` — `onModeChange` fires `{ mode: "listening" }`
- `"speaking"` — `onModeChange` fires `{ mode: "speaking" }`
- `"error"` — `onError` fired or `onDisconnect` with `reason === "error"`
- `"unavailable"` — `treyIElevenLabsSession` returned `ok: false`

**FR-4 — Orb visual state**
The existing orb in `onboarding.voice.tsx` already uses `listening` state to drive
animation. Phase 4 must map `voiceStatus` to the existing orb props:
- `listening` prop: `voiceStatus === "connected" || voiceStatus === "listening"`
- `thinking` prop: `voiceStatus === "connecting" || thinking`
The orb JSX must not be redesigned.

**FR-5 — Transcript feeds `profileSetupTurn`**
When ElevenLabs fires `onMessage` with `role === "user"`, the transcript text must be
passed to the existing `submit()` function (which calls `profileSetupTurn`).
The `submit()` function must not be duplicated — the same function used for typed text
must be reused for voice transcripts.

**FR-6 — Duplicate transcript prevention**
A `processingTranscriptRef = useRef(false)` guard must prevent concurrent calls to
`submit()` from overlapping ElevenLabs transcript events. If `processingTranscriptRef.current`
is true when a new transcript arrives, the new transcript is dropped silently.
The guard is reset in the `finally` block of `submit()`.

**FR-7 — Agent messages displayed, not submitted**
When ElevenLabs fires `onMessage` with `role !== "user"` (i.e., `role === "agent"`),
the message text must be displayed in `assistantMessage` state (same as text-first flow).
It must NOT be passed to `profileSetupTurn`. Agent messages are display-only.

**FR-8 — Phase 2 TTS while ElevenLabs is active**
`playAssistantAudio` (Phase 2 TTS) must NOT fire while ElevenLabs voice is active
(`voiceStatus === "connected" || voiceStatus === "listening" || voiceStatus === "speaking"`).
When ElevenLabs is active, the agent speaks directly via the WebSocket — TTS would
create duplicate audio. TTS resumes normally after ElevenLabs disconnects.

**FR-9 — Text input always active**
The text `<input>` and Send button must remain enabled regardless of `voiceStatus`.
The user can type and submit at any time, even while ElevenLabs is connected.
Typed submissions call `submit()` directly, bypassing the voice path.

**FR-10 — Fallback on `ok: false`**
If `treyIElevenLabsSession` returns `ok: false`, the component must:
1. Set `voiceStatus = "unavailable"`.
2. Display the `result.message` string in the existing `error` state display area.
3. Keep text input active and focused.
4. Not throw or crash.

**FR-11 — Fallback on `onError` / `onDisconnect` with error**
If the WebSocket errors or disconnects unexpectedly after connecting:
1. Set `voiceStatus = "error"`.
2. Display a safe inline message: `"Voice disconnected. Type to continue or tap mic to retry."`.
3. Keep text input active.
4. Allow the user to tap the mic button again to retry (which calls `startElevenLabsSession` again).

**FR-12 — Normal disconnect**
If ElevenLabs disconnects normally (agent ended the session, not an error):
1. Set `voiceStatus = "idle"`.
2. Clear any voice error message.
3. Keep text input active.

**FR-13 — Cleanup on unmount**
On component unmount, `conversation.endSession()` must be called inside a cleanup
function to prevent WebSocket leaks. This must be wrapped in try/catch since the
session may already be closed.

**FR-14 — Connection watchdog**
A 12-second timeout must be set after `startSession()` is called. If `onConnect` has
not fired within 12 seconds, the session is considered failed:
1. Call `conversation.endSession()`.
2. Set `voiceStatus = "error"`.
3. Display: `"Voice connection timed out. Type to continue or tap mic to retry."`.
The timeout must be cleared in `onConnect` and `onError`/`onDisconnect`.

**FR-15 — Mic button disabled states**
The mic button must be disabled (not just visually) when:
- `accessToken` is null
- `sessionId` is null (intake session not yet started)
- `voiceStatus === "connecting"`
- `thinking` is true (a `profileSetupTurn` call is in flight)

**FR-16 — `ConversationProvider` wrapper**
`useConversation` requires `ConversationProvider` in the React tree above it.
The existing `VoiceOnboarding` function must be split into:
- `VoiceOnboarding` — thin wrapper that renders `<ConversationProvider><VoiceOnboardingInner /></ConversationProvider>`
- `VoiceOnboardingInner` — the existing component body, now calling `useConversation`

This matches the RESTORE pattern exactly.

---

### Security Requirements

**SEC-1** — `ELEVENLABS_API_KEY` must never appear in any browser-side code, response,
or log. It stays in `elevenlabs-session.server.ts` only.

**SEC-2** — The browser receives only `signedUrl` from `treyIElevenLabsSession`.
The `signedUrl` is a WSS URL with a short-lived token embedded by ElevenLabs.
It is not a secret — it is self-authenticating and expires in 900 seconds.

**SEC-3** — No `VITE_ELEVENLABS_*` or `NEXT_PUBLIC_ELEVENLABS_*` env vars may be
introduced in Phase 4 or any future phase.

**SEC-4** — `profiles.is_creator`, `profiles.age`, and `date_of_birth` must not be
read or referenced in any Phase 4 file.

**SEC-5** — Error messages shown to the user must not contain API key values, raw
upstream error bodies, internal file paths, or WebSocket URLs.

**SEC-6** — `.claude/` must not be touched or committed.

**SEC-7** — `.env.local` must not be committed.

**SEC-8** — After `pnpm build`, the client bundle must not contain the string
`ELEVENLABS_API_KEY`. Build validation:
```bash
grep -r "ELEVENLABS_API_KEY" dist/client 2>/dev/null | wc -l
# expected: 0
```

---

### Env Vars

No new env vars are introduced in Phase 4.
`ELEVENLABS_API_KEY` and `ELEVENLABS_AGENT_ID` were introduced in Phase 3.
Both remain server-only (no `VITE_` prefix).

---

### What the Browser Receives vs Does Not Receive

| Item                    | Browser receives? | Notes                                      |
|-------------------------|-------------------|--------------------------------------------|
| `signedUrl`             | Yes               | WSS URL; short-lived, self-authenticating  |
| `ELEVENLABS_API_KEY`    | **No**            | Server-only                                |
| `ELEVENLABS_AGENT_ID`   | **No**            | Server-only                                |
| Voice transcript text   | Yes               | User's own speech, displayed locally       |
| Agent message text      | Yes               | Displayed in `assistantMessage`            |
| Error code string       | Yes               | Safe diagnostic, no secret content         |
| User-facing message     | Yes               | Safe, always fallback-friendly             |

---

### Permanent Fallback Guarantee

Text input is the permanent fallback. At no point in Phase 4 does the component
require ElevenLabs to be available. If ElevenLabs is:
- Not configured (`ELEVENLABS_NOT_CONFIGURED`) → text input, no error shown
- Unavailable (any `ok: false`) → text input, safe message shown
- Connected then disconnected → text input, reconnect option shown
- Timed out → text input, safe message shown

The onboarding flow completes successfully via text input alone.

---

### Out-of-Scope Notes

**Gemini Live** — Not implemented in any phase. No Gemini Live code is added.

**TreyIWidget** — `src/components/ai/TreyIWidget.tsx` remains a visual-only mock.
It is not wired to ElevenLabs, Gemini, or any AI in Phase 4.

**Text input as permanent fallback** — The `<input>` field and Send button in
`onboarding.voice.tsx` remain active at all times. Voice is an enhancement, not
a replacement for text input.
