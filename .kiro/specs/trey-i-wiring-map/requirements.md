# Requirements — Trey-I Wiring Lane

## Audit Summary

### Existing Trey-I Files in ANTIGRAVITY

| File                                 | Status            | Notes                                                                                                                                                                                                                                                        |
| ------------------------------------ | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/routes/onboarding.tsx`          | UI-only mock      | Two buttons: voice → `/onboarding/voice`, manual → `/signup`. No Supabase. No server calls. Lovable UI preserved.                                                                                                                                            |
| `src/routes/onboarding.voice.tsx`    | UI-only mock      | 4-step hardcoded script (name, handle, bio, vibe). Local state only. On finish: calls `signIn("creator")` + `updateUser()` from Lovable mock auth. No real Supabase write. No ElevenLabs. No Gemini. Comment: "Voice powered by ElevenLabs (plug in later)". |
| `src/components/ai/TreyIWidget.tsx`  | UI-only mock      | Floating draggable chat widget. `aiReply()` is hardcoded keyword matching. No real AI. No server calls.                                                                                                                                                      |
| `src/lib/trey-i/`                    | Does not exist    | No server functions for TTS, ElevenLabs token, Gemini session, or intake.                                                                                                                                                                                    |
| `src/lib/admin/post-queue.server.ts` | Real (admin lane) | Do not touch.                                                                                                                                                                                                                                                |

### No Existing Trey-I Spec

No `.kiro/specs/trey-i*` folder existed before this spec.

---

## Current Gaps

| Gap                                                                | Impact                                                                                                                                                                                               |
| ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onboarding.voice.tsx` writes to Lovable mock auth only            | Profile data is never saved to Supabase                                                                                                                                                              |
| No `intake_sessions` server function                               | Cannot persist voice conversation state                                                                                                                                                              |
| No `profile-setup-turn` server function                            | Cannot run the stage machine (ask → confirm → save)                                                                                                                                                  |
| No `onboarding/save-profile` server function                       | Cannot finalize profile + set `onboarding_completed`                                                                                                                                                 |
| No TTS server function                                             | Cannot play Trey-I voice responses                                                                                                                                                                   |
| No ElevenLabs token server function                                | Cannot connect real-time voice                                                                                                                                                                       |
| No Gemini Live session server function                             | Cannot run bidirectional voice session                                                                                                                                                               |
| `profiles` onboarding columns unconfirmed in ANTIGRAVITY schema.md | Must verify before writing: `onboarding_status`, `onboarding_completed`, `onboarding_method`, `onboarding_step`, `onboarding_last_saved_at`, `onboarding_completed_at`, `account_setup_completed_at` |
| `intake_sessions` table existence unconfirmed in ANTIGRAVITY       | Must verify migration was applied                                                                                                                                                                    |
| `user_onboarding` table existence unconfirmed in ANTIGRAVITY       | Must verify migration was applied                                                                                                                                                                    |

---

## Feature Goals

1. Trey-I voice setup is a conversational profile-builder flow at `/onboarding/voice`.
2. The flow gathers required profile fields: `display_name`, `username`, `bio`, `location`. Optional: `date_of_birth`, `favorite_categories`, `favorite_moods`, `content_frequency`, `fan_type`, `social_links`, privacy settings.
3. Filler answers ("yes", "no", "skip") must not be saved as real profile values. Confirmation step required before each field is written.
4. User can review all collected fields before final save.
5. On completion: real Supabase profile write, `onboarding_completed = true`, redirect to `/u/{public_profile_uid}?tour=1`.
6. `public_profile_uid` routing must be preserved.
7. Lovable UI shell must not be broken.
8. Default Profile Layout System (`ProfilePageShell`) must not be broken.
9. Creator/admin publishing pipeline must not be touched.
10. Watch Now / Guide must not be touched.
11. No secret keys (ElevenLabs, Gemini, Supabase service-role) in browser code.

---

## Voice Provider Strategy

Three voice options exist in RESTORE. ANTIGRAVITY must choose one per sub-feature:

| Provider        | Use case                                | Key requirement                                                                         |
| --------------- | --------------------------------------- | --------------------------------------------------------------------------------------- |
| **Gemini TTS**  | Play Trey-I text responses as audio     | `GOOGLE_GENAI_API_KEY` or Google Cloud ADC, server-only                                 |
| **ElevenLabs**  | Real-time conversational voice (WebRTC) | `ELEVENLABS_API_KEY` server-only; browser fetches signed URL/token from server function |
| **Gemini Live** | Bidirectional real-time voice session   | Google Cloud ADC (Vertex AI), server-only                                               |

**Recommended phased approach:**

- Phase 1 (text-first): Wire the stage machine with text input only. No voice API yet. Proves the profile-save pipeline end-to-end.
- Phase 2 (TTS): Add Gemini TTS server function so Trey-I responses are spoken.
- Phase 3 (real-time voice): Add ElevenLabs token server function for live voice input.
- Phase 4 (optional): Gemini Live for fully bidirectional session.

This spec covers all phases but marks Phase 1 as the required foundation.

---

## Schema Verification Required Before Implementation

The following columns/tables must be confirmed present in the live ANTIGRAVITY Supabase project before any server function writes to them. Reference: RESTORE migrations.

### profiles columns to verify

```
onboarding_status          text  ("not_started"|"in_progress"|"completed"|...)
onboarding_completed       boolean
onboarding_method          text  ("voice"|"manual")
onboarding_step            text/int
onboarding_last_saved_at   timestamptz
onboarding_completed_at    timestamptz
account_setup_completed_at timestamptz
public_profile_uid         text   ← already confirmed safe
site_uid                   text
favorite_categories        text[]
favorite_moods             text[]
content_frequency          text
fan_type                   text
profile_visibility         text
show_location              boolean
show_birthday              boolean
show_top_three             boolean
allow_top_three_adds       boolean
social_links               jsonb
```

### Tables to verify

```
intake_sessions    — session_id, flow_type, user_id, metadata (jsonb), confirmed_fields (jsonb)
user_onboarding    — user_id, current_step, selected_path, answers (jsonb), completed, updated_at
```

If any column or table is missing, a migration must be written before the server function that uses it.

---

## Hard Rules (from steering)

- Do NOT use `profiles.is_creator`
- Do NOT use `profiles.age`
- Do NOT expose `date_of_birth` directly; only collect it through a confirmed voice step
- Do NOT put any API key (ElevenLabs, Gemini, Supabase service-role) in `src/` with a `VITE_` prefix
- Do NOT redesign the Lovable UI
- Do NOT import RESTORE components into ANTIGRAVITY
- Every change must pass `pnpm tsc --noEmit` and `pnpm build`
- Do NOT touch Watch Now / Guide / Creator publishing pipeline

---

## What Must Not Be Touched

| Area                                              | Reason                                            |
| ------------------------------------------------- | ------------------------------------------------- |
| `src/lib/admin/post-queue.server.ts`              | Admin publishing lane — complete                  |
| `src/lib/watch-data.ts`                           | Watch Now static data                             |
| `src/lib/guide-store.tsx`                         | Guide localStorage store                          |
| `src/components/profile/`                         | Default Profile Layout System — complete          |
| `src/routes/u.$uid.tsx`                           | Public profile route — complete                   |
| `src/components/ai/TreyIWidget.tsx`               | Floating widget — visual only, do not wire AI yet |
| `src/routes/onboarding.tsx`                       | Entry page — visual only, no change needed        |
| Any `shadcn/ui` component in `src/components/ui/` | Do not modify                                     |

---

## Validation Plan

All validation is terminal-only. No browser validation, no Playwright, no screenshots.

```
pnpm tsc --noEmit   — must pass with zero errors after every task
pnpm build          — must produce a clean build after every task
```
