# Design — Trey-I Wiring Lane

## Stack Translation: RESTORE → ANTIGRAVITY

RESTORE uses Next.js App Router API routes (`app/api/*/route.ts`).
ANTIGRAVITY uses TanStack Start + Cloudflare Workers with `createServerFn()`.

| RESTORE pattern                                      | ANTIGRAVITY equivalent                                                                       |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `app/api/intake/profile-setup-turn/route.ts`         | `src/lib/trey-i/intake.server.ts` → `profileSetupTurn` (createServerFn)                      |
| `app/api/onboarding/save-profile/route.ts`           | `src/lib/trey-i/onboarding.server.ts` → `saveOnboardingProfile` (createServerFn)             |
| `app/api/trey-i/tts/route.ts`                        | `src/lib/trey-i/tts.server.ts` → `treyITts` (createServerFn)                                 |
| `app/api/elevenlabs/conversation/token/route.ts`     | `src/lib/trey-i/elevenlabs.server.ts` → `getElevenLabsToken` (createServerFn)                |
| `app/api/gemini/live/profile-setup/session/route.ts` | `src/lib/trey-i/gemini-live.server.ts` → `startGeminiLiveSession` (createServerFn)           |
| `createAdminClient()` (service-role)                 | `createClient(url, serviceKey)` — same pattern as `getAdminClient()` in post-queue.server.ts |
| `createClient()` (auth user)                         | `createBrowserClient()` in hooks; auth token passed to server fn                             |

---

## Architecture: Phase 1 (Text-First, Required Foundation)

```
/onboarding/voice (onboarding.voice.tsx)
       │
       │  user types or speaks a response
       ▼
profileSetupTurn (createServerFn, server-only)
       │
       ├─ verify auth (Supabase anon client with user's access token)
       ├─ load intake_sessions row by session_id
       ├─ run stage machine (ask → confirm → save)
       ├─ filler detection (yesPattern, noPattern, skipPattern)
       ├─ saveConfirmedIntakeField() → writes to intake_sessions.confirmed_fields
       ├─ on complete: finalizeProfileSetupForAuthenticatedUser()
       │    └─ writes confirmed_fields to profiles table
       │    └─ sets onboarding_completed = true
       │    └─ ensures public_profile_uid
       └─ returns { assistant: { message }, confirmedFields, complete?, switchToManual? }
```

The UI (`onboarding.voice.tsx`) is updated minimally:

- Replace `signIn("creator") + updateUser()` with a call to `profileSetupTurn`
- Display the `assistant.message` response
- On `complete: true`, navigate to `/u/{public_profile_uid}?tour=1`
- Preserve all existing Lovable visual elements

---

## Architecture: Phase 2 (Gemini TTS)

```
profileSetupTurn returns { assistant: { message } }
       │
       ▼
treyITts (createServerFn, server-only)
       │
       ├─ reads GOOGLE_GENAI_API_KEY / GEMINI_API_KEY from process.env
       ├─ calls Gemini TTS API (gemini-2.5-flash-preview-tts, voice: Algieba)
       └─ returns audio/wav binary
```

The UI plays the returned audio via `new Audio(URL.createObjectURL(blob))`.
No API key ever reaches the browser.

---

## Architecture: Phase 3 (ElevenLabs Real-Time Voice)

```
onboarding.voice.tsx
       │
       │  user clicks mic
       ▼
getElevenLabsToken (createServerFn, server-only)
       │
       ├─ reads ELEVENLABS_API_KEY from process.env
       ├─ calls ElevenLabs API to get signed URL or conversation token
       └─ returns { signedUrl } or { conversationToken }
       │
       ▼
Browser connects to ElevenLabs SDK using the token
(ELEVENLABS_API_KEY never in browser)
       │
       │  ElevenLabs sends transcript back to browser
       ▼
profileSetupTurn called with transcript
```

---

## New Files

```
src/lib/trey-i/
  intake.server.ts        — profileSetupTurn, startIntakeSession (createServerFn)
  onboarding.server.ts    — saveOnboardingProfile, finalizeOnboarding (createServerFn)
  tts.server.ts           — treyITts (createServerFn) [Phase 2]
  elevenlabs.server.ts    — getElevenLabsToken (createServerFn) [Phase 3]
  gemini-live.server.ts   — startGeminiLiveSession, sendGeminiInput, closeGeminiSession [Phase 4]
```

---

## Modified Files

```
src/routes/onboarding.voice.tsx   — replace mock auth calls with real server fn calls
```

No other existing files are modified in Phase 1.

---

## Stage Machine (Phase 1 core)

Ported from RESTORE `app/api/intake/profile-setup-turn/route.ts`.
Minimum required stages for a complete profile:

```
ask_display_name → confirm_display_name
ask_username     → confirm_username
ask_bio          → confirm_bio          (skippable)
ask_location     → confirm_location     (skippable)
review
complete
```

Optional stages (skippable, added after location):

```
ask_birthday_choice → ask_birthday → confirm_date_of_birth
ask_content_choice  → ask_categories → confirm_categories
                    → ask_moods → confirm_moods
                    → ask_frequency → confirm_frequency
                    → ask_fan_type → confirm_fan_type
ask_socials_choice  → ask_instagram/tiktok/youtube/x_handle
ask_privacy_choice  → ask_visibility → ask_privacy_details
```

Filler detection patterns (must not save as real values):

```typescript
const yesPattern =
  /^(yes|yeah|yep|correct|right|that'?s right|looks good|sounds good|save it|confirm|confirmed|sure|ok|okay|please do)$/i;
const noPattern = /^(no|nope|nah|not quite|wrong|change it|try again)/i;
const skipPattern = /^(skip|skip it|pass|no thanks|not now|later|next)$/i;
```

---

## intake_sessions Table Usage

```
session_id      uuid PK
flow_type       text  ("signup")
user_id         uuid  → auth.users
metadata        jsonb  { profile_setup_voice_stage, profile_setup_voice_pending }
confirmed_fields jsonb  { display_name, username, bio, location, ... }
```

Session is created by `startIntakeSession` server function before the first turn.
Each turn reads and updates `metadata.profile_setup_voice_stage`.
Each confirmed field is written to `confirmed_fields` immediately (not batched).

---

## Profile Finalization

On `stage === "complete"`:

1. Read all `confirmed_fields` from `intake_sessions`
2. UPDATE `profiles` with confirmed fields (anon client, user's own row)
3. Set `onboarding_completed = true`, `onboarding_status = "completed"`, `onboarding_completed_at = now()`
4. Call `ensurePublicProfileUid(userId)` — SELECT existing or generate new `public_profile_uid`
5. Return `{ complete: true, publicProfileUid }`
6. UI navigates to `/u/{publicProfileUid}?tour=1`

---

## Security Boundaries

| Boundary               | Enforcement                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| Gemini API key         | `process.env.GOOGLE_GENAI_API_KEY` — server-only, no `VITE_` prefix                             |
| ElevenLabs API key     | `process.env.ELEVENLABS_API_KEY` — server-only, no `VITE_` prefix                               |
| Supabase service-role  | `process.env.SUPABASE_SERVICE_ROLE_KEY` — server-only, only if needed for intake_sessions write |
| User auth verification | Access token passed from browser to server fn; verified with anon client before any write       |
| `profiles.is_creator`  | Not queried anywhere in this flow                                                               |
| `profiles.age`         | Not queried; `date_of_birth` only collected through confirmed voice step                        |
| Filler detection       | Server-side only; browser never decides what gets saved                                         |

---

## Rollback Risks

| Risk                                     | Mitigation                                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `intake_sessions` table missing          | Verify before implementing; write migration if absent                                                    |
| `profiles` onboarding columns missing    | Verify before implementing; write migration if absent                                                    |
| `onboarding.voice.tsx` breaks Lovable UI | Minimal change: only replace the `signIn`/`updateUser` call; preserve all JSX                            |
| `profileSetupTurn` tsc error             | All server fn inputs validated with `as any` cast pattern (consistent with existing server fns)          |
| Gemini TTS unavailable                   | Phase 2 is optional; Phase 1 works text-only                                                             |
| ElevenLabs token unavailable             | Phase 3 is optional; Phase 1+2 work without it                                                           |
| `public_profile_uid` not generated       | `ensurePublicProfileUid` must be called before redirect; if it returns null, show error, do not redirect |

---

## What Is NOT Changed

| Area                                 | Reason                                                  |
| ------------------------------------ | ------------------------------------------------------- |
| `src/routes/onboarding.tsx`          | Entry page is visual-only; no wiring needed             |
| `src/components/ai/TreyIWidget.tsx`  | Floating widget — separate lane, not part of onboarding |
| `src/components/profile/`            | Default Profile Layout System — complete, do not touch  |
| `src/routes/u.$uid.tsx`              | Public profile route — complete, do not touch           |
| `src/lib/admin/post-queue.server.ts` | Admin publishing — complete, do not touch               |
| `src/lib/watch-data.ts`              | Watch Now static data                                   |
| `src/lib/guide-store.tsx`            | Guide localStorage                                      |
| `src/lib/feed-store.tsx`             | Feed localStorage                                       |
