# Trey-I Phase 3 — ElevenLabs Session — Tasks

## Task Overview

| #   | Task                                      | Files changed   | Risk |
| --- | ----------------------------------------- | --------------- | ---- |
| 1   | Create `elevenlabs-session.server.ts`     | 1 new file      | Low  |
| 2   | Validate integration contract (read-only) | 0 files changed | None |
| 3   | Commit Phase 3                            | 1 file staged   | Low  |

No existing files are modified in Phase 3.
No new npm packages are added in Phase 3.

---

## Task 1 — Create `elevenlabs-session.server.ts`

### Files involved

- `src/lib/trey-i/elevenlabs-session.server.ts` — **new file**

### What to implement

See `design.md` for the full annotated implementation.

Summary of what the file must contain:

1. `ElevenLabsSessionInput` type (`{ accessToken: string }`)
2. Exported `ElevenLabsSessionResult` union type (success | typed error)
3. `FALLBACK_MESSAGE` and `SIGNED_URL_PATHS` constants
4. `validateElevenLabsSessionInput` — strips to non-empty string
5. `log()` helper — boolean masking, dev-only info suppression in prod
6. `treyIElevenLabsSession` — `createServerFn({ method: "POST" })` with:
   - `.inputValidator(validateElevenLabsSessionInput)`
   - `.handler(...)` containing:
     - Auth gate via `verifyTreyIUser(accessToken)` — returns `AUTH_REQUIRED` if fails
     - Env check — returns `ELEVENLABS_NOT_CONFIGURED` if key/agentId absent
     - For-loop over `SIGNED_URL_PATHS` — `get_signed_url` first, `get-signed-url` second
     - 404 on first → continue to second
     - 401/403 → return `ELEVENLABS_API_KEY_INVALID` / `ELEVENLABS_API_KEY_FORBIDDEN`
     - Other non-ok → return `ELEVENLABS_SESSION_CREATE_FAILED`
     - JSON parse fail → return `ELEVENLABS_RESPONSE_SHAPE_INVALID`
     - Missing `signed_url` field → return `ELEVENLABS_RESPONSE_SHAPE_INVALID`
     - Success → return `{ ok: true, provider: "elevenlabs", signedUrl, expiresInSeconds: 900, conversationId? }`
     - Outer catch → return `UNKNOWN_ELEVENLABS_ERROR`

### Acceptance criteria

- [ ] File is at `src/lib/trey-i/elevenlabs-session.server.ts`
- [ ] Exports `treyIElevenLabsSession` and `ElevenLabsSessionResult`
- [ ] `createServerFn({ method: "POST" })` pattern matches `tts.server.ts`
- [ ] Auth gate calls `verifyTreyIUser` before any ElevenLabs fetch
- [ ] `ELEVENLABS_API_KEY` read from `process.env` only — not hardcoded, not a VITE\_ var
- [ ] Both signed URL path variants attempted (underscore-first)
- [ ] All error paths return `{ ok: false }` — function never throws to browser
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors; file lands in server bundle, not client bundle

### Security boundary

- `ELEVENLABS_API_KEY` appears only in `process.env.ELEVENLABS_API_KEY` inside the handler
- It does not appear in any response payload or log statement without boolean masking
- Upstream error body is read as text, key material redacted, and logged only in dev

**Pre-implementation security grep (run before writing the file):**

```bash
rg "VITE_ELEVENLABS|NEXT_PUBLIC_ELEVENLABS" src/
# expected: 0 matches
```

**Post-implementation security greps (run after writing):**

```bash
# No client-facing ElevenLabs key exposure
rg "VITE_ELEVENLABS|NEXT_PUBLIC_ELEVENLABS" src/
# expected: 0 matches

# Key only in server file
rg -n "ELEVENLABS_API_KEY" src/
# expected: only src/lib/trey-i/elevenlabs-session.server.ts lines

# No forbidden profile fields
rg "profiles\.is_creator|is_creator|profiles\.age|date_of_birth" src/lib/trey-i/elevenlabs-session.server.ts
# expected: 0 matches

# After build: key not in client bundle
grep -r "ELEVENLABS_API_KEY" dist/client 2>/dev/null | wc -l
# expected: 0
```

### Visual preservation rule

This file contains zero UI code.
`onboarding.voice.tsx` is not modified.
The mic button remains visual-only after Task 1.

### Terminal validation (no browser)

```bash
pnpm tsc --noEmit
# expected: no output (zero errors)

pnpm build
# expected: ✓ built in N.NNs
# expected: dist/server/assets/elevenlabs-session.server-*.js present
# expected: dist/client/ does not contain elevenlabs-session.server-*.js
```

### Rollback risk

**Low.** This is a new file only. No existing file is modified.
Rollback: `git rm src/lib/trey-i/elevenlabs-session.server.ts && git commit -m "Revert Phase 3"`.
All Phase 1 and Phase 2 behavior continues unchanged.

---

## Task 2 — Validate Integration Contract (Read-Only)

### Files involved

- `src/routes/onboarding.voice.tsx` — **read-only**
- `src/lib/trey-i/elevenlabs-session.server.ts` — **from Task 1**

### What to do

1. Confirm the current mic button in `onboarding.voice.tsx` is visual-only:
   ```bash
   rg "ElevenLabs|useConversation|startSession|elevenlabs-session" src/routes/onboarding.voice.tsx
   # expected: 0 matches
   ```
2. Confirm `accessToken` is already available in `onboarding.voice.tsx` state
   (established in Phase 1 — no change needed):
   ```bash
   rg "accessToken" src/routes/onboarding.voice.tsx
   # expected: lines showing useState and the useEffect that sets accessToken
   ```
3. Confirm the server function is importable for Phase 4 without package changes:
   ```bash
   # The import path @/lib/trey-i/elevenlabs-session.server would be valid
   # No @elevenlabs/react import needed in Phase 3
   rg "@elevenlabs" src/
   # expected: 0 matches (package not yet added)
   ```
4. Confirm `treyIElevenLabsSession` is not yet imported in any route:
   ```bash
   rg "treyIElevenLabsSession" src/routes/
   # expected: 0 matches
   ```

### Acceptance criteria

- [ ] `onboarding.voice.tsx` has zero ElevenLabs SDK references
- [ ] `accessToken` state already exists in `onboarding.voice.tsx`
- [ ] `@elevenlabs/react` is not yet in `package.json`
- [ ] `ElevenLabsSessionResult` is exported and typed correctly for Phase 4 import
- [ ] `pnpm tsc --noEmit` passes with no errors (types compile correctly)

### Security boundary

No new imports in Phase 3.
`elevenlabs-session.server.ts` is not imported in any client file.
The TanStack Start `.server.ts` module boundary ensures the handler never
runs in the browser.

### Visual preservation rule

`onboarding.voice.tsx` is not modified in Phase 3.
The voice onboarding page looks and behaves identically to Phase 2.

### Terminal validation (no browser)

```bash
pnpm tsc --noEmit
# expected: zero errors

rg "ElevenLabs|useConversation|startSession|@elevenlabs" src/routes/onboarding.voice.tsx
# expected: 0 matches

rg "treyIElevenLabsSession" src/routes/
# expected: 0 matches
```

### Rollback risk

**None.** No files are changed in Task 2.

---

## Task 3 — Commit Phase 3

### Files to stage (specific file only — no git add .)

```bash
git add src/lib/trey-i/elevenlabs-session.server.ts
```

### Commit message

```bash
git commit -m "Add Trey-I Phase 3 ElevenLabs session server function"
```

### Files involved

- `src/lib/trey-i/elevenlabs-session.server.ts` — **staged and committed**

### Acceptance criteria

- [ ] Only `elevenlabs-session.server.ts` staged — no other files
- [ ] `.claude/` not staged, not committed
- [ ] `package.json` not changed
- [ ] `pnpm-lock.yaml` not changed
- [ ] `git status --short` after commit: only `?? .claude/` untracked

### Security boundary: pre-commit greps

Run all of these before staging:

```bash
# No client-facing key var
rg "VITE_ELEVENLABS|NEXT_PUBLIC_ELEVENLABS" src/
# expected: 0

# Key reference only in new server file
rg -n "ELEVENLABS_API_KEY" src/
# expected: only elevenlabs-session.server.ts

# Scope check: no cross-contamination
rg "TreyIWidget|watch-data|guide-store|post-queue|creator_post_queue" src/lib/trey-i/elevenlabs-session.server.ts
# expected: 0

# Forbidden field check
rg "profiles\.is_creator|is_creator|profiles\.age|date_of_birth" src/lib/trey-i/elevenlabs-session.server.ts
# expected: 0

# Existing files untouched
git diff HEAD -- src/routes/onboarding.voice.tsx src/lib/trey-i/intake.server.ts src/lib/trey-i/tts.server.ts
# expected: no output (empty diff)
```

### Visual preservation rule

No UI files modified. No design files modified.
Voice onboarding page is visually identical to Phase 2 after commit.

### Post-commit terminal validation

```bash
pnpm tsc --noEmit
# expected: zero errors

pnpm build
# expected: ✓ built in N.NNs

git status --short
# expected: ?? .claude/

git log --oneline -5
# expected: top commit is "Add Trey-I Phase 3 ElevenLabs session server function"
```

### Rollback risk

**Low.** Single additive file.
Clean revert: `git revert HEAD` removes it with no side effects.
Phase 1 and Phase 2 behavior is not affected.

---

## Phase 4 Prerequisites Checklist (not Phase 3 work)

Before starting Phase 4, confirm:

- [ ] `ELEVENLABS_API_KEY` is set in the deployment environment
- [ ] `ELEVENLABS_AGENT_ID` is set in the deployment environment
- [ ] ElevenLabs agent is configured with the correct security settings
      (domain allowlist or public mode — see ElevenLabs dashboard → Agent → Security)
- [ ] Phase 3 commit is confirmed clean (`pnpm tsc`, `pnpm build` green)
- [ ] Phase 3 server function tested by calling it with a valid access token
      and confirming it returns `{ ok: true, signedUrl: "wss://..." }`

Phase 4 will then:

1. `pnpm add @elevenlabs/react`
2. Wire mic button in `onboarding.voice.tsx` to call `treyIElevenLabsSession`
3. Pass `signedUrl` to `useConversation().startSession()`
4. Handle `{ ok: false }` gracefully (text fallback, mic button disabled state)
5. Feed voice transcript into existing `profileSetupTurn` state machine
