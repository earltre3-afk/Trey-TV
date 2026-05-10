# Trey-I Phase 3 — ElevenLabs Real-Time Voice Token/Session Wiring
## Requirements

### Context

Phase 1 implemented text-first onboarding via `intake.server.ts`.
Phase 2 implemented non-blocking TTS playback via `tts.server.ts`.
Phase 3 adds the server-only token/session layer that lets a future Phase 4
wire the mic button to real-time ElevenLabs voice — without ever exposing
the ElevenLabs API key to the browser.

Phase 3 is purely additive. No existing files are modified. No mic wiring
is implemented. No new npm package is added yet.

---

### Goal

Expose a single TanStack Start server function that an authenticated browser
client can call to receive a safe, time-limited ElevenLabs signed URL.
The browser uses the signed URL in Phase 4 to open a real-time voice session
via the `@elevenlabs/react` SDK — without the API key ever leaving the server.

---

### Scope

**In scope — Phase 3:**
- `src/lib/trey-i/elevenlabs-session.server.ts` (new file)
- Spec files in `.kiro/specs/trey-i-phase-3-elevenlabs/`

**Explicitly out of scope — Phase 3:**
- Mic button wiring in `onboarding.voice.tsx`
- `@elevenlabs/react` browser SDK
- `package.json` changes
- Gemini Live
- TreyIWidget
- Watch Now / Guide
- Creator/admin publishing pipeline
- Any modification to `intake.server.ts`, `onboarding.server.ts`, `tts.server.ts`, or `onboarding.voice.tsx`

---

### Functional Requirements

**FR-1 — Server function shape**
A new exported server function `treyIElevenLabsSession` must be created
using `createServerFn({ method: "POST" })` in
`src/lib/trey-i/elevenlabs-session.server.ts`.

**FR-2 — Input**
Input: `{ accessToken: string }` — the Supabase access token obtained from
the browser session (same pattern as `intake.server.ts` and `tts.server.ts`).
Input must be validated: `accessToken` must be a non-empty string.

**FR-3 — Auth gate**
Before any ElevenLabs API call, the server function must call
`verifyTreyIUser(accessToken)` from `@/lib/trey-i/onboarding.server`.
If the user is not authenticated, the function must return
`{ ok: false, code: "AUTH_REQUIRED", message: "Sign in to use Trey-I voice." }`.
It must not throw to the browser.

**FR-4 — Env check**
If `process.env.ELEVENLABS_API_KEY` or `process.env.ELEVENLABS_AGENT_ID`
is absent or empty, the function must return
`{ ok: false, code: "ELEVENLABS_NOT_CONFIGURED", message: "Voice is unavailable. Type to continue." }`.
It must not throw.

**FR-5 — Endpoint resolution**
The ElevenLabs API has had the signed URL endpoint under two paths.
Try canonical underscore form first; fall back to legacy hyphen form:
1. `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=<id>`
2. `https://api.elevenlabs.io/v1/convai/conversation/get-signed-url?agent_id=<id>`

If the first returns 404, silently try the second.

**FR-6 — Success response**
On success, return:
```ts
{
  ok: true,
  provider: "elevenlabs",
  signedUrl: string,       // wss:// URL with embedded time-limited token
  expiresInSeconds: 900,
  conversationId?: string, // if returned by ElevenLabs
}
```

**FR-7 — Error responses**
All error paths return typed `{ ok: false; code: string; message: string }`.
The function must never throw to the browser. The `message` field is always
safe to display to the user. Error codes follow the RESTORE pattern:
- `AUTH_REQUIRED`
- `ELEVENLABS_NOT_CONFIGURED`
- `ELEVENLABS_API_KEY_INVALID` (401)
- `ELEVENLABS_API_KEY_FORBIDDEN` (403)
- `ELEVENLABS_SESSION_CREATE_FAILED` (all paths exhausted)
- `ELEVENLABS_RESPONSE_SHAPE_INVALID` (JSON parse failed or field missing)
- `UNKNOWN_ELEVENLABS_ERROR` (catch-all)

**FR-8 — Non-blocking guarantee**
If ElevenLabs is unconfigured or unavailable, the calling component must be
able to gracefully degrade to text-first mode. The server function never
throws; the browser checks `result.ok` and falls back silently.

**FR-9 — TTS and text-first unaffected**
`tts.server.ts` and `intake.server.ts` must not be modified. Their behavior
is unchanged whether or not `ELEVENLABS_API_KEY` is set.

**FR-10 — Exported type contract**
The return type `ElevenLabsSessionResult` must be exported so
`onboarding.voice.tsx` can import and use it in Phase 4 without a type cast.

---

### Security Requirements

**SEC-1** — `ELEVENLABS_API_KEY` must only be read from `process.env` inside
the `.server.ts` handler. It must not appear in any `VITE_*` or
`NEXT_PUBLIC_*` variable, in any response payload, or in any log statement
that does not mask it to a boolean.

**SEC-2** — The browser may only receive the `signedUrl` field (a WSS URL
with a short-lived token embedded by ElevenLabs). The raw API key must never
appear in any response to the browser.

**SEC-3** — No `VITE_ELEVENLABS_*` or `NEXT_PUBLIC_ELEVENLABS_*` env vars
may be introduced in this or any future phase.

**SEC-4** — The user must be authenticated (Supabase session verified) before
any ElevenLabs API call is made or any token/session is issued.

**SEC-5** — Error message strings must not contain API key values, internal
file paths, or raw upstream error bodies. Log the upstream error body only
in `NODE_ENV !== "production"` and only after redacting key material.

**SEC-6** — `profiles.is_creator`, `profiles.age`, and `date_of_birth` must
not be read or referenced in any Phase 3 file.

**SEC-7** — `.claude/` must not be touched or committed.

**SEC-8** — After `pnpm build`, the client bundle must not contain the string
`ELEVENLABS_API_KEY`. Build validation:
```
grep -r "ELEVENLABS_API_KEY" dist/client 2>/dev/null | wc -l
# expected: 0
```

---

### Env Vars Introduced in Phase 3

| Variable              | Scope       | Required | Purpose                                   |
|-----------------------|-------------|----------|-------------------------------------------|
| `ELEVENLABS_API_KEY`  | server-only | for voice| Authenticate to ElevenLabs API            |
| `ELEVENLABS_AGENT_ID` | server-only | for voice| Identify which ElevenLabs agent to use    |

Both vars are already present in the RESTORE env catalog (`server-env.ts`).
Neither has a `VITE_` or `NEXT_PUBLIC_` counterpart.
Both are optional — absence causes graceful `ELEVENLABS_NOT_CONFIGURED` return,
not a crash.

---

### What the Browser Receives vs Does Not Receive

| Item                    | Browser receives? | Notes                                      |
|-------------------------|-------------------|--------------------------------------------|
| `signedUrl`             | Yes               | WSS URL; token embedded by ElevenLabs      |
| `conversationId`        | Yes (optional)    | Safe identifier, not a secret              |
| `expiresInSeconds`      | Yes               | Integer, not a secret                      |
| `provider`              | Yes               | Literal string `"elevenlabs"`              |
| `ELEVENLABS_API_KEY`    | **No**            | Stays in server process only               |
| `ELEVENLABS_AGENT_ID`   | **No**            | Stays in server process only               |
| Error code string       | Yes               | Safe diagnostic, no secret content         |
| User-facing message     | Yes               | Safe, always fallback-friendly             |
| Raw upstream error body | **No**            | Never forwarded                            |

---

### Phase 4 Integration Preview (not implemented in Phase 3)

After Phase 3 is confirmed clean and env vars are deployed:

1. Add `@elevenlabs/react` (browser SDK) to `package.json`
2. In `onboarding.voice.tsx`, on mic button enable:
   - Call `treyIElevenLabsSession({ data: { accessToken } })`
   - If `result.ok`, pass `result.signedUrl` to `useConversation().startSession({ signedUrl })`
   - If `result.ok === false`, show inline "voice unavailable" state; keep text input active
3. Voice transcript from ElevenLabs feeds into `profileSetupTurn` for Trey-I state machine
4. TTS from Phase 2 continues for assistant messages
5. Text input remains available at all times as fallback
