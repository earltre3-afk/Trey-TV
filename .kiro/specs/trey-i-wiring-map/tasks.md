# Tasks — Trey-I Wiring Lane

## Execution Order

```
Phase 1 (required foundation — text-first):
  Task 1 → Task 2 → Task 3 → Task 4 → Task 5 → Task 6

Phase 2 (TTS — optional, after Phase 1):
  Task 7

Phase 3 (real-time voice — optional, after Phase 2):
  Task 8

Phase 4 (Gemini Live — optional, after Phase 3):
  Task 9
```

---

## Phase 1 — Text-First Foundation

### Task 1 — Verify schema: profiles onboarding columns + intake_sessions + user_onboarding

**Goal:** Confirm which columns and tables exist in the live ANTIGRAVITY Supabase project
before writing any server function that touches them.

**Files involved:**
- `C:\Users\info\TREY-TV-RESTORE-599\supabase\migrations\` (read-only reference)
- `.kiro/steering/schema.md` (update with findings)

**Steps:**
1. Search RESTORE migrations for `intake_sessions` CREATE TABLE.
2. Search RESTORE migrations for `user_onboarding` CREATE TABLE.
3. Search RESTORE migrations for `profiles` ALTER TABLE ADD COLUMN for: `onboarding_status`, `onboarding_completed`, `onboarding_method`, `onboarding_step`, `onboarding_last_saved_at`, `onboarding_completed_at`, `account_setup_completed_at`, `favorite_categories`, `favorite_moods`, `content_frequency`, `fan_type`, `profile_visibility`, `show_location`, `show_birthday`, `show_top_three`, `allow_top_three_adds`, `social_links`.
4. For each confirmed column/table: note it as safe to use.
5. For each missing column/table: flag as a blocker requiring a migration before the server function that uses it.
6. Update `.kiro/steering/schema.md` with confirmed onboarding columns.

**Acceptance criteria:**
- All required columns/tables are confirmed or flagged as blockers.
- No code changes.

**Security boundary:** Read-only inspection.
**Visual preservation:** N/A.
**Terminal validation:** N/A (research task).
**Rollback risk:** None.

---

### Task 2 — Write migration(s) for any missing columns/tables

**Goal:** If Task 1 finds missing columns or tables, write the migration SQL.

**Files involved:**
- New migration file(s) applied to the live Supabase project (out-of-band, not in ANTIGRAVITY src/)

**Steps:**
1. For each missing item from Task 1, write a safe `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` or `CREATE TABLE IF NOT EXISTS` migration.
2. Apply to the live Supabase project.
3. Confirm columns/tables are now present.

**Acceptance criteria:**
- All columns/tables required by Tasks 3–6 exist in the live project.

**Security boundary:** Migration applied via Supabase dashboard or CLI, not via browser code.
**Visual preservation:** N/A.
**Terminal validation:** N/A.
**Rollback risk:** Low. All migrations use `IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`.

---

### Task 3 — Write `src/lib/trey-i/intake.server.ts`

**Goal:** Implement `startIntakeSession` and `profileSetupTurn` as `createServerFn` functions.

**Files involved:**
- `src/lib/trey-i/intake.server.ts` (new)
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\intake\profile-setup-turn\route.ts`
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\intake\start-session\route.ts`

**Steps:**
1. Create `src/lib/trey-i/intake.server.ts`.
2. Implement `startIntakeSession`: creates a row in `intake_sessions` with `flow_type = "signup"`, `user_id` from verified auth, empty `metadata` and `confirmed_fields`. Returns `{ sessionId }`.
3. Implement `profileSetupTurn`: accepts `{ accessToken, sessionId, transcript }`. Verifies auth with anon client. Loads `intake_sessions` row. Runs stage machine. Returns `{ assistant: { message }, confirmedFields, complete?, switchToManual? }`.
4. Port filler detection patterns (`yesPattern`, `noPattern`, `skipPattern`) from RESTORE.
5. Port minimum required stages: `ask_display_name` → `confirm_display_name` → `ask_username` → `confirm_username` → `ask_bio` → `confirm_bio` → `ask_location` → `confirm_location` → `review` → `complete`.
6. On `complete`: write `confirmed_fields` to `profiles`, set `onboarding_completed = true`, `onboarding_status = "completed"`, call `ensurePublicProfileUid`.
7. Use `(supabase as any).from(...)` cast pattern consistent with existing server functions.
8. Do NOT use `profiles.is_creator`. Do NOT expose any key with `VITE_` prefix.

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- `startIntakeSession` creates an `intake_sessions` row.
- `profileSetupTurn` advances stage and returns assistant message.
- Filler inputs ("yes", "no", "skip") at `ask_display_name` stage return a re-prompt, not a save.
- On `complete`, `profiles.onboarding_completed = true` and `public_profile_uid` is set.

**Security boundary:**
- Auth verified server-side before any write.
- No API keys in this file.
- Service-role only used if `intake_sessions` RLS requires it (check during Task 1).

**Visual preservation:** No UI changes in this task.
**Terminal validation:** `pnpm tsc --noEmit` + `pnpm build`.
**Rollback risk:** Medium. If tsc fails, revert the new file. No existing files are modified.

---

### Task 4 — Write `src/lib/trey-i/onboarding.server.ts`

**Goal:** Implement `saveOnboardingProfile` for step-by-step saves and `chooseOnboardingMethod` for method selection.

**Files involved:**
- `src/lib/trey-i/onboarding.server.ts` (new)
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\onboarding\save-profile\route.ts`

**Steps:**
1. Implement `chooseOnboardingMethod`: accepts `{ accessToken, method: "voice" | "manual" }`. Updates `profiles.onboarding_method` and `onboarding_status = "in_progress"`.
2. Implement `saveOnboardingProfile`: accepts `{ accessToken, fields }`. Validates and writes safe profile fields. Does not write `is_creator`, `age`, or any banned column.
3. Implement `finalizeOnboarding`: accepts `{ accessToken }`. Sets `onboarding_completed = true`, `onboarding_status = "completed"`, calls `ensurePublicProfileUid`. Returns `{ publicProfileUid }`.

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- `chooseOnboardingMethod` updates `profiles.onboarding_method`.
- `finalizeOnboarding` returns a non-null `publicProfileUid`.

**Security boundary:** Auth verified before any write. No banned columns written.
**Visual preservation:** No UI changes in this task.
**Terminal validation:** `pnpm tsc --noEmit` + `pnpm build`.
**Rollback risk:** Low. New file only.

---

### Task 5 — Wire `onboarding.voice.tsx` to real server functions

**Goal:** Replace the mock `signIn("creator") + updateUser()` calls in `onboarding.voice.tsx`
with real calls to `startIntakeSession` and `profileSetupTurn`.

**Files involved:**
- `src/routes/onboarding.voice.tsx` (modify)
- `src/lib/trey-i/intake.server.ts` (import)

**Steps:**
1. On component mount (or when user starts), call `startIntakeSession` to get a `sessionId`.
2. Replace the `submit()` function: instead of advancing local state, call `profileSetupTurn({ accessToken, sessionId, transcript: draft })`.
3. Display `response.assistant.message` as the Trey-I prompt text (replacing the hardcoded `script[step].ai`).
4. On `response.complete === true`: navigate to `/u/${response.publicProfileUid}?tour=1`.
5. On `response.switchToManual === true`: navigate to `/signup`.
6. Preserve all existing Lovable JSX (orb, progress chips, mic button, input field, backdrop). Only the data flow changes.
7. The `script` array and `Profile` type can be removed once the server fn drives the conversation.
8. Keep the mic button toggle (visual only for now; real voice wired in Phase 3).

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- Submitting a display name calls `profileSetupTurn` and shows the server's response.
- Filler input "yes" at the first step does not advance to username; server returns a re-prompt.
- On completion, browser navigates to `/u/{publicProfileUid}?tour=1`.
- Lovable visual elements (orb, backdrop, progress chips) are unchanged.

**Security boundary:**
- `accessToken` obtained from `useAuth()` session, passed to server fn.
- No API keys in this file.

**Visual preservation:** All existing JSX preserved. Only `submit()` logic and displayed text change.
**Terminal validation:** `pnpm tsc --noEmit` + `pnpm build`.
**Rollback risk:** Medium. If the server fn is unavailable, the UI shows an error. Revert to mock by restoring the original `submit()` if needed.

---

### Task 6 — Update steering docs

**Goal:** Record Phase 1 completion in migration-map.md and file-map.md.

**Files involved:**
- `.kiro/steering/migration-map.md`
- `.kiro/steering/file-map.md`
- `.kiro/steering/schema.md`

**Steps:**
1. Add `Trey-I Onboarding (Phase 1 — text-first)` to the Real section of `migration-map.md`.
2. Add `src/lib/trey-i/intake.server.ts` and `src/lib/trey-i/onboarding.server.ts` to `file-map.md`.
3. Update `schema.md` with confirmed onboarding columns (from Task 1 findings).

**Acceptance criteria:** Steering docs updated. No code changes.
**Terminal validation:** N/A.
**Rollback risk:** None.

---

## Phase 2 — Gemini TTS (Optional)

### Task 7 — Write `src/lib/trey-i/tts.server.ts`

**Goal:** Implement `treyITts` server function that calls Gemini TTS and returns audio/wav.

**Files involved:**
- `src/lib/trey-i/tts.server.ts` (new)
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\trey-i\tts\route.ts`

**Steps:**
1. Implement `treyITts`: accepts `{ text }`. Reads `GOOGLE_GENAI_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_API_KEY` from `process.env`. Calls Gemini TTS API. Returns audio buffer.
2. In `onboarding.voice.tsx`: after receiving `assistant.message`, call `treyITts` and play the returned audio via `new Audio(URL.createObjectURL(blob))`.
3. TTS is non-blocking: if it fails, the text response still displays.

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- No Gemini API key in browser code or any `VITE_`-prefixed variable.

**Security boundary:** `GOOGLE_GENAI_API_KEY` server-only.
**Visual preservation:** No visual change; audio is additive.
**Terminal validation:** `pnpm tsc --noEmit` + `pnpm build`.
**Rollback risk:** Low. TTS failure is non-fatal; text still displays.

---

## Phase 3 — ElevenLabs Real-Time Voice (Optional)

### Task 8 — Write `src/lib/trey-i/elevenlabs.server.ts`

**Goal:** Implement `getElevenLabsToken` server function that returns a signed URL or conversation token.

**Files involved:**
- `src/lib/trey-i/elevenlabs.server.ts` (new)
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\elevenlabs\conversation\token\route.ts`
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\lib\voice\providers\elevenlabs.ts`

**Steps:**
1. Implement `getElevenLabsToken`: reads `ELEVENLABS_API_KEY` from `process.env`. Calls ElevenLabs API. Returns `{ conversationToken }` or `{ signedUrl }`.
2. In `onboarding.voice.tsx`: when mic is activated, call `getElevenLabsToken`, then connect to ElevenLabs SDK using the token. ElevenLabs sends transcript back to browser. Browser calls `profileSetupTurn` with the transcript.
3. `ELEVENLABS_API_KEY` must never appear in browser code.

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- No ElevenLabs API key in browser code or any `VITE_`-prefixed variable.

**Security boundary:** `ELEVENLABS_API_KEY` server-only.
**Visual preservation:** Mic button already exists in UI; only its click handler changes.
**Terminal validation:** `pnpm tsc --noEmit` + `pnpm build`.
**Rollback risk:** Low. If token fetch fails, fall back to text input.

---

## Phase 4 — Gemini Live Bidirectional Voice (Optional)

### Task 9 — Write `src/lib/trey-i/gemini-live.server.ts`

**Goal:** Implement Gemini Live session management for fully bidirectional voice.

**Files involved:**
- `src/lib/trey-i/gemini-live.server.ts` (new)
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\gemini\live\profile-setup\session\route.ts`

**Steps:**
1. Implement `startGeminiLiveSession`, `sendGeminiInput`, `closeGeminiSession`.
2. Uses Google Cloud ADC (Vertex AI). Reads `GOOGLE_CLOUD_PROJECT` / `GOOGLE_CLOUD_LOCATION` from `process.env`.
3. No Google credentials in browser.

**Acceptance criteria:**
- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- No Google credentials in browser code.

**Security boundary:** All Google Cloud credentials server-only.
**Visual preservation:** No visual change.
**Terminal validation:** `pnpm tsc --noEmit` + `pnpm build`.
**Rollback risk:** Low. Phase 4 is additive; Phase 1–3 remain functional without it.

---

## Do Not Do

- Do not wire `TreyIWidget.tsx` to real AI in this lane (separate future lane)
- Do not modify `src/routes/onboarding.tsx` (entry page is visual-only)
- Do not use `profiles.is_creator`
- Do not use `profiles.age`
- Do not put any API key in a `VITE_`-prefixed env var
- Do not redesign the Lovable UI
- Do not import RESTORE components
- Do not touch Watch Now / Guide / Creator publishing pipeline
- Do not run browser validation, Playwright, or screenshots
