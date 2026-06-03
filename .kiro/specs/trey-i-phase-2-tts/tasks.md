# Tasks — Trey-I Phase 2 TTS

## Execution Order

```
Task 1 (add dependency) → Task 2 (tts.server.ts) → Task 3 (wire onboarding.voice.tsx) → Task 4 (docs)
```

---

## Task 1 — Add @google/genai dependency

**Goal:** Add the `@google/genai` package to `package.json` so the TTS server function
can import `GoogleGenAI` and `Modality`.

**Files involved:**

- `package.json`

**Steps:**

1. Add `"@google/genai": "^1.50.1"` to the `dependencies` section of `package.json`.
   (Same version as RESTORE-599. Do not use a newer major without testing.)
2. Run `pnpm install` to update `pnpm-lock.yaml`.

**Acceptance criteria:**

- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- `import { GoogleGenAI, Modality } from "@google/genai"` resolves without error.

**Security boundary:** Package addition only. No API keys added in this task.

**Visual preservation:** No UI change.

**Terminal validation:**

```
pnpm install
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. Remove the line from `package.json` and run `pnpm install` to revert.

---

## Task 2 — Write `src/lib/trey-i/tts.server.ts`

**Goal:** Implement `treyITts` as a `createServerFn` that calls Gemini TTS and returns
base64-encoded WAV audio, or `{ audioBase64: null }` on any failure.

**Files involved:**

- `src/lib/trey-i/tts.server.ts` (new)
- Reference: `C:\Users\info\TREY-TV-RESTORE-599\app\api\trey-i\tts\route.ts`

**Steps:**

1. Create `src/lib/trey-i/tts.server.ts`.
2. Implement `treyITts` with input `{ text: string }` and return type
   `{ audioBase64: string; mimeType: "audio/wav" } | { audioBase64: null }`.
3. Resolve API key from `process.env.GOOGLE_GENAI_API_KEY` → `GEMINI_API_KEY` → `GOOGLE_API_KEY`.
   If none found, return `{ audioBase64: null }` immediately.
4. Clean input text: collapse whitespace, strip "Next steps:…" / "If it still fails…" suffixes, truncate to 700 chars.
5. Call `new GoogleGenAI({ apiKey }).models.generateContent(...)` with:
   - model: `process.env.GEMINI_TREYI_TTS_MODEL || "gemini-2.5-flash-preview-tts"`
   - voice: `process.env.GEMINI_TREYI_VOICE_NAME || "Algieba"`
   - `responseModalities: [Modality.AUDIO]`
6. Extract base64 audio from `response.candidates[0].content.parts[*].inlineData.data`.
   If absent, return `{ audioBase64: null }`.
7. If `mimeType` is not WAV, prepend a 44-byte WAV header (PCM → WAV conversion).
8. Return `{ audioBase64: wav.toString("base64"), mimeType: "audio/wav" }`.
9. Wrap the entire Gemini call in `try/catch` — any exception returns `{ audioBase64: null }`.
10. Do NOT call `verifyTreyIUser` — TTS is stateless; no user auth needed.
11. Do NOT log or expose the API key value anywhere.

**Acceptance criteria:**

- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- No Google API key appears in any `VITE_`-prefixed variable or in browser-accessible code.
- When `GOOGLE_GENAI_API_KEY` is not set, function returns `{ audioBase64: null }` without throwing.
- Return type is always `{ audioBase64: string | null; mimeType?: "audio/wav" }` — never throws to caller.

**Security boundary:**

- `GOOGLE_GENAI_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_API_KEY` read from `process.env` server-side only.
- Browser receives only base64 audio bytes.
- No user credentials passed to Gemini.

**Visual preservation:** No UI change in this task.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. New file only. Delete `tts.server.ts` to revert. No existing files modified.

---

## Task 3 — Wire TTS into `onboarding.voice.tsx`

**Goal:** After `profileSetupTurn` resolves and `assistantMessage` is set, call `treyITts`
fire-and-forget and play the returned audio. Text flow must be unaffected if TTS fails.

**Files involved:**

- `src/routes/onboarding.voice.tsx` (modify)
- `src/lib/trey-i/tts.server.ts` (import)

**Steps:**

1. Import `treyITts` from `@/lib/trey-i/tts.server`.
2. Add a `playTts(message: string): void` helper function (not async in the call site):
   ```typescript
   function playTts(message: string): void {
     treyITts({ data: { text: message } })
       .then((result) => {
         if (!result.audioBase64) return;
         const bytes = Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0));
         const blob = new Blob([bytes], { type: "audio/wav" });
         const url = URL.createObjectURL(blob);
         const audio = new Audio(url);
         audio.onended = () => URL.revokeObjectURL(url);
         audio.play().catch(() => {});
       })
       .catch(() => {});
   }
   ```
3. In `submit()`, after `setAssistantMessage(result.assistant.message)`, add:
   ```typescript
   playTts(result.assistant.message);
   ```
   This is a fire-and-forget call — no `await`, no error surfacing.
4. No other changes to `onboarding.voice.tsx`. All existing JSX, state, and logic preserved.

**Acceptance criteria:**

- `pnpm tsc --noEmit` passes.
- `pnpm build` passes.
- `submit()` does not `await` `playTts` — text renders immediately.
- A TTS error (thrown or `audioBase64: null`) does not set `error` state or block the flow.
- All existing Lovable visual elements (orb, progress chips, backdrop, input) are unchanged.

**Security boundary:**

- `treyITts` is a server function — API key never reaches the browser.
- `playTts` only handles the returned base64 bytes client-side.

**Visual preservation:**

- No JSX changes. No new UI elements. Audio is purely additive.
- Orb, progress chips, input field, backdrop, error display — all unchanged.

**Terminal validation:**

```
pnpm tsc --noEmit
pnpm build
```

**Rollback risk:** Low. Remove the `playTts` call and import to revert. The `submit()` function
is otherwise unchanged.

---

## Task 4 — Update steering docs

**Goal:** Record Phase 2 TTS completion in migration-map.md and file-map.md.

**Files involved:**

- `.kiro/steering/migration-map.md`
- `.kiro/steering/file-map.md`

**Steps:**

1. In `migration-map.md`, update the Trey-I Phase 1 row or add a new row for Phase 2:
   note that `treyITts` is wired, `@google/genai` added, TTS is non-fatal, no ElevenLabs/Live.
2. In `file-map.md`, add `trey-i/tts.server.ts` to the Lib section.
3. Update `onboarding.voice.tsx` entry to note TTS is wired (fire-and-forget).

**Acceptance criteria:** Steering docs updated. No code changes.

**Terminal validation:** N/A.

**Rollback risk:** None.

---

## Do Not Do

- Do not add `VITE_GOOGLE_GENAI_API_KEY` or any `VITE_`-prefixed Google credential
- Do not `await` `playTts` in the critical submit path
- Do not show a TTS error to the user
- Do not wire the mic button (still visual-only — Phase 3)
- Do not touch `TreyIWidget.tsx`
- Do not touch Watch Now / Guide / Creator pipeline
- Do not use `profiles.is_creator`, `profiles.age`, or `date_of_birth`
- Do not run browser validation, Playwright, or screenshots
