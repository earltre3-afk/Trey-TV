# Requirements — Trey-I Phase 2 TTS

## Feature Goal

After `profileSetupTurn` returns `assistant.message`, optionally speak that message
using Gemini TTS so the onboarding flow has a voice. TTS is additive and non-blocking:
if it fails for any reason, the text response still displays and the user can continue.

---

## Current State

| Item | Status |
|------|--------|
| `src/lib/trey-i/intake.server.ts` | Real — `startIntakeSession` + `profileSetupTurn` |
| `src/lib/trey-i/onboarding.server.ts` | Real — `saveProfileFieldsForUser` + helpers |
| `src/routes/onboarding.voice.tsx` | Real — wired to text-first server flow |
| Mic button | Visual-only |
| TTS | Not implemented |
| ElevenLabs | Not implemented |
| Gemini Live | Not implemented |
| `@google/genai` package | **Not in package.json** — must be added |

---

## Scope

**In scope:**
- New server function `treyITts` in `src/lib/trey-i/tts.server.ts`
- `@google/genai` dependency added to `package.json`
- `onboarding.voice.tsx` calls `treyITts` after each `profileSetupTurn` response and plays the audio
- TTS failure is silent and non-fatal — text flow continues unaffected

**Out of scope:**
- ElevenLabs real-time voice
- Gemini Live bidirectional session
- Mic input / speech-to-text
- TreyIWidget wiring
- Any redesign
- Watch Now / Guide
- Creator/admin publishing pipeline

---

## Security Requirements

1. `GOOGLE_GENAI_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_API_KEY` must stay in `process.env` server-side only.
2. No `VITE_` or `NEXT_PUBLIC_` prefix on any Google credential.
3. The browser must never receive a Google API key — only the audio bytes.
4. TTS failure must not block the onboarding flow or surface a hard error to the user.
5. Do not touch Watch Now / Guide.
6. Do not touch Creator/admin publishing pipeline.
7. Do not use `profiles.is_creator`, `profiles.age`, or `date_of_birth`.

---

## Gemini TTS API — Confirmed Pattern (from RESTORE reference)

Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\trey-i\tts\route.ts`

- Package: `@google/genai` (Google GenAI SDK)
- Model: `process.env.GEMINI_TREYI_TTS_MODEL` || `"gemini-2.5-flash-preview-tts"`
- Voice: `process.env.GEMINI_TREYI_VOICE_NAME` || `"Algieba"`
- Auth: `GOOGLE_GENAI_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_API_KEY` from `process.env`
- Input: plain text string (max 700 chars after cleaning)
- Output: `audio/wav` binary (PCM → WAV conversion if needed)
- Prompt prefix: `"Say in a warm, smooth, confident, premium, emotionally intelligent, and conversational voice: {text}"`

**ANTIGRAVITY stack difference:** RESTORE uses Next.js API routes returning `NextResponse`.
ANTIGRAVITY uses `createServerFn` from `@tanstack/react-start`. The server function
cannot return a raw binary `Response` — it must return a base64-encoded string that
the browser decodes into an `ArrayBuffer` and plays via the Web Audio API or `Audio`.

---

## TTS Response Format

Because `createServerFn` serializes return values as JSON, the server function returns:

```typescript
{ audioBase64: string; mimeType: "audio/wav" }
```

The browser decodes `audioBase64` → `Uint8Array` → `Blob` → `URL.createObjectURL` →
`new Audio(url).play()`.

On any error (API key missing, Gemini unavailable, empty audio), the server function
returns `{ audioBase64: null }` instead of throwing. The browser silently skips playback.

---

## Text Cleaning (server-side)

Before sending to Gemini TTS, clean the assistant message:
- Collapse whitespace
- Strip trailing "Next steps:…" and "If it still fails…" sections
- Truncate to 700 characters

---

## Non-Fatal Failure Contract

The browser must treat TTS as fire-and-forget:
- Call `treyITts` after `profileSetupTurn` resolves
- Do not `await` it in the critical path — use `.then().catch()` or a separate `useEffect`
- If `treyITts` throws or returns `{ audioBase64: null }`, log silently and continue
- Never show a TTS error to the user

---

## Dependency: @google/genai

`@google/genai` is not currently in `package.json`. It must be added before the server
function can be written. Pinned version from RESTORE reference: check the installed
version in RESTORE and pin the same major.

---

## Validation

Terminal-only:
```
pnpm tsc --noEmit   — must pass with zero errors
pnpm build          — must produce a clean build
```

No browser validation, no Playwright, no screenshots.
