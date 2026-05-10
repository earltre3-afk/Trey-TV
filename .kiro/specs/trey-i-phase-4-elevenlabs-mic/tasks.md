# Trey-I Phase 4 — ElevenLabs Mic Wiring — Tasks

## Task Overview

| # | Task | Files changed | Risk |
|---|------|---------------|------|
| 1 | Add `@elevenlabs/react@1.3.0` dependency | `package.json`, `pnpm-lock.yaml` | Low |
| 2 | Wire mic button in `onboarding.voice.tsx` | `src/routes/onboarding.voice.tsx` | Medium |
| 3 | Validate build and security | 0 files changed | None |
| 4 | Update steering map and checkpoint | 2 doc files | None |
| 5 | Commit Phase 4 | staged files only | Low |

---

## Task 1 — Add `@elevenlabs/react@1.3.0`

### Files involved
- `package.json` — dependency added
- `pnpm-lock.yaml` — updated by pnpm

### Command
```bash
pnpm add @elevenlabs/react@1.3.0
```

Note: Use exact version `1.3.0` (no caret). This matches the version confirmed in
RESTORE's `package.json` and pins the `useConversation` API shape.

### Acceptance criteria
- [ ] `package.json` contains `"@elevenlabs/react": "1.3.0"` (no `^`)
- [ ] `pnpm-lock.yaml` updated
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
- `@elevenlabs/react` is a browser SDK — it never handles the API key
- The API key stays in `elevenlabs-session.server.ts` only
- The SDK uses only the `signedUrl` (WSS URL) to connect

### Visual preservation rule
No UI files are modified in Task 1.

### Terminal validation
```bash
pnpm tsc --noEmit
# expected: no output (zero errors)

pnpm build
# expected: ✓ built in N.NNs
```

### Rollback risk
**Low.** `pnpm remove @elevenlabs/react` removes it cleanly.
No existing files are modified beyond `package.json` and `pnpm-lock.yaml`.

---

## Task 2 — Wire Mic Button in `onboarding.voice.tsx`

### Files involved
- `src/routes/onboarding.voice.tsx` — **modified**

### Current implementation audit

The current file (`onboarding.voice.tsx`) contains:

| Item | Current state | Phase 4 change |
|------|--------------|----------------|
| `listening` state | `useState(false)` — drives orb + mic button | Removed; replaced by `voiceStatus` |
| Mic button `onClick` | `setListening((v) => !v)` — visual toggle only | Replaced by `startElevenLabsSession` / `stopElevenLabsSession` |
| `submit()` function | Reads `draft` state, calls `profileSetupTurn` | Refactored into `submitWithText(text)` |
| TTS call | Always fires after assistant response | Suppressed when `voiceStatus` is active |
| `VoiceOnboarding` function | Single component with all state | Split into thin wrapper + `VoiceOnboardingInner` |
| `@elevenlabs/react` import | Not present | Added |
| `treyIElevenLabsSession` import | Not present | Added |

### What to implement

See `design.md` for full annotated code. Summary:

**Step 1 — Split component**
Rename the existing `VoiceOnboarding` function body to `VoiceOnboardingInner`.
Create a new `VoiceOnboarding` that wraps it in `<ConversationProvider>`.

**Step 2 — Add new imports**
```typescript
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { treyIElevenLabsSession } from "@/lib/trey-i/elevenlabs-session.server";
```

**Step 3 — Add `voiceStatus` state and refs**
```typescript
type VoiceStatus =
  | "idle" | "connecting" | "connected"
  | "listening" | "speaking" | "error" | "unavailable";

const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");
const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const processingTranscriptRef = useRef(false);
```

**Step 4 — Remove `listening` state**
Remove `const [listening, setListening] = useState(false)`.
Replace all `listening` references in JSX with `voiceStatus`-derived expressions.

**Step 5 — Add `clearWatchdog` helper**
```typescript
function clearWatchdog() {
  if (watchdogRef.current !== null) {
    clearTimeout(watchdogRef.current);
    watchdogRef.current = null;
  }
}
```

**Step 6 — Add `useConversation` hook**
Wire `onConnect`, `onDisconnect`, `onError`, `onModeChange`, `onMessage` callbacks.
See `design.md` for full callback implementations.
Key rules:
- `onMessage` with `role !== "user"` → `setAssistantMessage(text)` only
- `onMessage` with `role === "user"` → `processingTranscriptRef` guard → `submitFromVoice(text)`
- `onDisconnect` with `reason === "error"` → `setVoiceStatus("error")`
- `onDisconnect` normal → `setVoiceStatus("idle")`

**Step 7 — Refactor `submit()` into `submitWithText(text)`**
Extract the core logic from `submit()` into `submitWithText(text: string)`.
Add TTS suppression inside `submitWithText`:
```typescript
const elevenLabsActive =
  voiceStatus === "connected" ||
  voiceStatus === "listening" ||
  voiceStatus === "speaking";
if (!elevenLabsActive) {
  playAssistantAudio(result.assistant.message);
}
```
Keep the typed path:
```typescript
const submit = async () => {
  const text = draft.trim();
  if (!text) return;
  setDraft("");
  await submitWithText(text);
};
```
Add the voice path:
```typescript
async function submitFromVoice(text: string) {
  await submitWithText(text);
}
```

**Step 8 — Add `startElevenLabsSession` function**
```typescript
async function startElevenLabsSession() {
  if (!accessToken || !sessionId) return;
  setVoiceStatus("connecting");
  setError(null);
  const result = await treyIElevenLabsSession({ data: { accessToken } }).catch(() => null);
  if (!result || !result.ok) {
    setVoiceStatus("unavailable");
    setError(result?.message ?? "Voice is unavailable. Type to continue.");
    return;
  }
  watchdogRef.current = setTimeout(() => {
    try { conversation.endSession(); } catch { /* harmless */ }
    setVoiceStatus("error");
    setError("Voice connection timed out. Type to continue or tap mic to retry.");
  }, 12_000);
  try {
    await conversation.startSession({
      signedUrl: result.signedUrl,
      connectionType: "websocket",
    });
  } catch {
    clearWatchdog();
    setVoiceStatus("error");
    setError("Voice unavailable. Type to continue.");
  }
}
```

**Step 9 — Add `stopElevenLabsSession` function**
```typescript
function stopElevenLabsSession() {
  clearWatchdog();
  try { conversation.endSession(); } catch { /* harmless */ }
  setVoiceStatus("idle");
  setError(null);
}
```

**Step 10 — Add cleanup `useEffect`**
```typescript
useEffect(() => {
  return () => {
    clearWatchdog();
    try { conversation.endSession(); } catch { /* harmless */ }
  };
}, [conversation]);
```

**Step 11 — Update mic button JSX**
Replace `onClick={() => setListening((v) => !v)}` with:
```tsx
const voiceActive =
  voiceStatus === "connected" ||
  voiceStatus === "listening" ||
  voiceStatus === "speaking";

const micDisabled =
  !accessToken ||
  !sessionId ||
  voiceStatus === "connecting" ||
  thinking;

<button
  onClick={voiceActive ? stopElevenLabsSession : startElevenLabsSession}
  disabled={micDisabled}
  aria-label={voiceActive ? "Stop voice" : "Start voice"}
  className={`size-10 rounded-full grid place-items-center transition ${
    voiceActive
      ? "bg-primary text-primary-foreground glow-gold"
      : voiceStatus === "connecting"
      ? "bg-white/5 text-muted-foreground animate-pulse"
      : voiceStatus === "error" || voiceStatus === "unavailable"
      ? "bg-red-500/20 text-red-400"
      : "bg-white/5 text-muted-foreground"
  }`}
>
  {voiceStatus === "connecting"
    ? <Loader2 className="size-5 animate-spin" />
    : voiceActive
    ? <Mic className="size-5" />
    : <MicOff className="size-5" />}
</button>
```

**Step 12 — Update orb JSX conditions**
Replace `listening` references in the orb with `voiceStatus`-derived expressions:
```tsx
// Orb outer ring animation
className={`... ${
  (voiceStatus === "connected" || voiceStatus === "listening" || voiceStatus === "speaking")
    ? "animate-conic-spin"
    : "opacity-60"
}`}

// Orb inner icon
{(thinking || voiceStatus === "connecting")
  ? <Loader2 className="size-10 text-primary animate-spin" />
  : (voiceStatus === "connected" || voiceStatus === "listening" || voiceStatus === "speaking")
  ? <Volume2 className="size-10 text-primary animate-glow-pulse" />
  : <Sparkles className="size-10 text-primary" />}
```

**Step 13 — Update input placeholder**
```tsx
placeholder={
  voiceStatus === "connected" || voiceStatus === "listening"
    ? "Listening… (or type)"
    : voiceStatus === "connecting"
    ? "Connecting voice…"
    : "Type your answer…"
}
```

### Acceptance criteria
- [ ] `VoiceOnboarding` is a thin wrapper rendering `<ConversationProvider><VoiceOnboardingInner /></ConversationProvider>`
- [ ] `useConversation` is called inside `VoiceOnboardingInner`
- [ ] `voiceStatus` state machine covers all 7 states
- [ ] `listening` state variable is removed
- [ ] `submit()` is refactored into `submitWithText(text)` + thin `submit()` wrapper
- [ ] TTS is suppressed when `voiceStatus` is `connected | listening | speaking`
- [ ] Mic button calls `startElevenLabsSession` / `stopElevenLabsSession`
- [ ] Mic button is disabled when `accessToken` null, `sessionId` null, `connecting`, or `thinking`
- [ ] `processingTranscriptRef` guard prevents duplicate transcript submissions
- [ ] 12-second watchdog set after `startSession`, cleared in `onConnect` / `onError` / `onDisconnect`
- [ ] Cleanup `useEffect` calls `endSession` on unmount
- [ ] Text input and Send button remain enabled regardless of `voiceStatus`
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors

### Security boundary
- `treyIElevenLabsSession` is a `.server.ts` import — the API key never reaches the browser
- The browser only receives `signedUrl` from the server function
- No `VITE_ELEVENLABS_*` vars introduced
- Error messages shown to user contain no API key values, URLs, or raw upstream errors

**Pre-implementation security greps:**
```bash
# No VITE_ ElevenLabs vars anywhere
rg "VITE_ELEVENLABS|NEXT_PUBLIC_ELEVENLABS" src/
# expected: 0 matches

# ElevenLabs API key only in server file
rg -n "ELEVENLABS_API_KEY" src/
# expected: only src/lib/trey-i/elevenlabs-session.server.ts
```

**Post-implementation security greps:**
```bash
# No VITE_ ElevenLabs vars
rg "VITE_ELEVENLABS|NEXT_PUBLIC_ELEVENLABS" src/
# expected: 0 matches

# API key still only in server file
rg -n "ELEVENLABS_API_KEY" src/
# expected: only src/lib/trey-i/elevenlabs-session.server.ts

# No forbidden profile fields in onboarding.voice.tsx
rg "profiles\.is_creator|is_creator|profiles\.age|date_of_birth" src/routes/onboarding.voice.tsx
# expected: 0 matches

# No TreyIWidget cross-contamination
rg "TreyIWidget" src/routes/onboarding.voice.tsx
# expected: 0 matches

# After build: API key not in client bundle
grep -r "ELEVENLABS_API_KEY" dist/client 2>/dev/null | wc -l
# expected: 0
```

### Visual preservation rule
The Lovable UI structure of `onboarding.voice.tsx` is preserved:
- Orb, progress chips, assistant message display, input row, Send button — all unchanged in structure
- Only condition expressions inside existing JSX change (orb animation class, mic button class/icon)
- No new UI sections added
- No Lovable components replaced

### Terminal validation
```bash
pnpm tsc --noEmit
# expected: no output (zero errors)

pnpm build
# expected: ✓ built in N.NNs

# Confirm @elevenlabs/react is in client bundle (SDK is browser-side)
grep -r "elevenlabs" dist/client 2>/dev/null | head -5
# expected: SDK code present (not the API key)

# Confirm API key is NOT in client bundle
grep -r "ELEVENLABS_API_KEY" dist/client 2>/dev/null | wc -l
# expected: 0
```

### Rollback risk
**Medium.** `onboarding.voice.tsx` is modified. Rollback:
```bash
git checkout HEAD -- src/routes/onboarding.voice.tsx
pnpm remove @elevenlabs/react
```
Phase 1, 2, and 3 behavior is fully restored. No server files are affected.

---

## Task 3 — Validate Build and Security

### Files involved
- 0 files changed

### What to do
Run all validation greps and build checks from Task 2 acceptance criteria.
Confirm the following:

1. `pnpm tsc --noEmit` → zero errors
2. `pnpm build` → zero errors
3. `ELEVENLABS_API_KEY` not in `dist/client`
4. No `VITE_ELEVENLABS_*` vars in `src/`
5. `profiles.is_creator` / `profiles.age` / `date_of_birth` not in `onboarding.voice.tsx`
6. `TreyIWidget` not referenced in `onboarding.voice.tsx`
7. `treyIElevenLabsSession` not imported in any file other than `onboarding.voice.tsx`

```bash
# Full validation sequence
pnpm tsc --noEmit
pnpm build

rg "VITE_ELEVENLABS|NEXT_PUBLIC_ELEVENLABS" src/
rg -n "ELEVENLABS_API_KEY" src/
rg "profiles\.is_creator|is_creator|profiles\.age|date_of_birth" src/routes/onboarding.voice.tsx
rg "TreyIWidget" src/routes/onboarding.voice.tsx
grep -r "ELEVENLABS_API_KEY" dist/client 2>/dev/null | wc -l

# Confirm server function not imported in other routes
rg "treyIElevenLabsSession" src/routes/
# expected: only onboarding.voice.tsx
```

### Acceptance criteria
- [ ] All greps return expected results (see above)
- [ ] `pnpm tsc --noEmit` → zero errors
- [ ] `pnpm build` → zero errors
- [ ] `dist/client` contains zero matches for `ELEVENLABS_API_KEY`

### Rollback risk
**None.** No files changed in Task 3.

---

## Task 4 — Update Steering Map and Checkpoint

### Files involved
- `.kiro/steering/file-map.md` — update `onboarding.voice.tsx` entry
- `.kiro/checkpoints/lovable-backend-migration-current-state.md` — add Phase 4 row

### What to update

**file-map.md** — update the `onboarding.voice.tsx` line:
```
onboarding.voice.tsx — Trey-I voice onboarding (REAL — Phase 4: mic button wired to
ElevenLabs real-time voice via useConversation + treyIElevenLabsSession; voiceStatus
state machine (idle/connecting/connected/listening/speaking/error/unavailable);
ConversationProvider wrapper; transcript feeds profileSetupTurn; TTS suppressed while
ElevenLabs active; 12s watchdog; processingTranscriptRef duplicate guard; text input
permanent fallback; @elevenlabs/react@1.3.0; tsc ✅ build ✅)
```

**lovable-backend-migration-current-state.md** — add Phase 4 row to the Trey-I table:
```
| Phase 4 — ElevenLabs mic wiring | @elevenlabs/react@1.3.0 + onboarding.voice.tsx | ✅ Real — mic button wired; voiceStatus state machine; transcript → profileSetupTurn; TTS suppressed while active; text fallback permanent; tsc ✅ build ✅ |
```

### Acceptance criteria
- [ ] `file-map.md` updated with Phase 4 status
- [ ] `lovable-backend-migration-current-state.md` updated with Phase 4 row
- [ ] No other files modified

### Rollback risk
**None.** Documentation only.

---

## Task 5 — Commit Phase 4

### Files to stage (specific files only — no `git add .`)
```bash
git add package.json
git add pnpm-lock.yaml
git add src/routes/onboarding.voice.tsx
git add .kiro/specs/trey-i-phase-4-elevenlabs-mic/requirements.md
git add .kiro/specs/trey-i-phase-4-elevenlabs-mic/design.md
git add .kiro/specs/trey-i-phase-4-elevenlabs-mic/tasks.md
git add .kiro/steering/file-map.md
git add .kiro/checkpoints/lovable-backend-migration-current-state.md
```

### Commit messages (two commits)

**Commit 1 — spec:**
```bash
git commit -m "Add Trey-I Phase 4 ElevenLabs mic wiring spec"
```
Stage: `.kiro/specs/trey-i-phase-4-elevenlabs-mic/` only.

**Commit 2 — implementation:**
```bash
git commit -m "Wire Trey-I Phase 4 ElevenLabs mic to onboarding voice"
```
Stage: `package.json`, `pnpm-lock.yaml`, `src/routes/onboarding.voice.tsx`,
`.kiro/steering/file-map.md`, `.kiro/checkpoints/lovable-backend-migration-current-state.md`.

### Acceptance criteria
- [ ] `.claude/` not staged, not committed
- [ ] `.env.local` not staged, not committed
- [ ] `git status --short` after commit: only `?? .claude/` untracked
- [ ] `pnpm tsc --noEmit` → zero errors after commit
- [ ] `pnpm build` → zero errors after commit

### Pre-commit security greps
```bash
# No VITE_ ElevenLabs vars
rg "VITE_ELEVENLABS|NEXT_PUBLIC_ELEVENLABS" src/
# expected: 0

# API key only in server file
rg -n "ELEVENLABS_API_KEY" src/
# expected: only elevenlabs-session.server.ts

# No forbidden profile fields
rg "profiles\.is_creator|is_creator|profiles\.age|date_of_birth" src/routes/onboarding.voice.tsx
# expected: 0

# Existing server files untouched
git diff HEAD -- src/lib/trey-i/intake.server.ts src/lib/trey-i/onboarding.server.ts src/lib/trey-i/tts.server.ts src/lib/trey-i/elevenlabs-session.server.ts
# expected: no output (empty diff)

# .claude/ not staged
git status --short | grep ".claude"
# expected: ?? .claude/ (untracked only, never staged)
```

### Rollback risk
**Low.** Two clean commits. Revert either with `git revert HEAD`.
Phase 1, 2, and 3 behavior is fully restored by reverting the implementation commit.

---

## Phase 4 Prerequisites Checklist (confirm before starting Task 1)

- [ ] Phase 3 commit `d638c78` is confirmed clean (`pnpm tsc`, `pnpm build` green)
- [ ] `ELEVENLABS_API_KEY` is set in the deployment environment
- [ ] `ELEVENLABS_AGENT_ID` is set in the deployment environment
- [ ] ElevenLabs agent is configured in the ElevenLabs dashboard:
  - Agent → Security → either public mode or domain allowlist includes the deployment domain
  - Agent is active and not paused
- [ ] `treyIElevenLabsSession` has been manually tested (or confirmed testable) with a valid
  access token, returning `{ ok: true, signedUrl: "wss://..." }`
- [ ] Working tree is clean (`git status --short` shows only `?? .claude/`)

---

## Out-of-Scope Reminders

**Gemini Live** — Not implemented in any phase. No Gemini Live code is added in Phase 4.
Any `gemini-live` references in RESTORE are not ported.

**TreyIWidget** — `src/components/ai/TreyIWidget.tsx` remains a visual-only mock.
It is not wired to ElevenLabs, Gemini, or any AI in Phase 4.

**Text input as permanent fallback** — The `<input>` field and Send button remain
active at all times. Voice is an enhancement, not a replacement.

**Watch Now / Guide** — Not touched.

**Creator/admin publishing pipeline** — Not touched.

**.claude/** — Local Claude output. Never staged, never committed.
