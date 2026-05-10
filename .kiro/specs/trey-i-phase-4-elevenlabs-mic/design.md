# Trey-I Phase 4 — ElevenLabs Mic Wiring — Design

## Source References

RESTORE implementation studied:
- `components/onboarding/TreyIVoiceSetup.tsx` — full `useConversation` integration
- `lib/voice/providers/elevenlabs.ts` — browser fetch helpers and type definitions
- `lib/voice/providers/types.ts` — `VoiceProviderStatus`, `SafeVoiceDiagnosticCode`
- `app/api/elevenlabs/agent-session/route.ts` — server-side signed URL pattern

ANTIGRAVITY files being modified:
- `src/routes/onboarding.voice.tsx` — only file changed in Phase 4

ANTIGRAVITY files used as-is (not modified):
- `src/lib/trey-i/elevenlabs-session.server.ts` — Phase 3 server function
- `src/lib/trey-i/intake.server.ts` — Phase 1 server functions
- `src/lib/trey-i/tts.server.ts` — Phase 2 TTS server function

---

## Architecture

### Data Flow

```
User taps mic button
  │
  ├─ accessToken null? → disabled (no-op)
  ├─ sessionId null?   → disabled (no-op)
  ├─ voiceStatus === "connecting"? → disabled (no-op)
  │
  ▼
setVoiceStatus("connecting")
  │
  ▼
treyIElevenLabsSession({ data: { accessToken } })
  │  [TanStack Start server function — Phase 3]
  │
  ├─ result.ok === false
  │    └─ setVoiceStatus("unavailable")
  │       setError(result.message)
  │       return  ← text input remains active
  │
  └─ result.ok === true
       │
       ▼
     set 12s watchdog timeout
       │
       ▼
     conversation.startSession({
       signedUrl: result.signedUrl,
       connectionType: "websocket",
     })
       │
       ├─ onConnect fires
       │    └─ clearWatchdog()
       │       setVoiceStatus("connected")
       │
       ├─ onModeChange fires
       │    ├─ mode === "listening" → setVoiceStatus("listening")
       │    └─ mode === "speaking"  → setVoiceStatus("speaking")
       │
       ├─ onMessage fires
       │    ├─ role === "agent"
       │    │    └─ setAssistantMessage(text)
       │    │       [TTS suppressed — ElevenLabs speaks directly]
       │    │
       │    └─ role === "user"
       │         └─ processingTranscriptRef.current === true? → drop
       │            processingTranscriptRef.current = true
       │            await submit(text)   ← reuses existing submit()
       │            processingTranscriptRef.current = false
       │
       ├─ onDisconnect fires
       │    ├─ reason === "error"
       │    │    └─ clearWatchdog()
       │    │       setVoiceStatus("error")
       │    │       setError("Voice disconnected. Type to continue or tap mic to retry.")
       │    │
       │    └─ normal
       │         └─ clearWatchdog()
       │            setVoiceStatus("idle")
       │            setError(null)
       │
       └─ onError fires
            └─ clearWatchdog()
               setVoiceStatus("error")
               setError("Voice disconnected. Type to continue or tap mic to retry.")

Watchdog fires (12s, no onConnect)
  └─ conversation.endSession() [try/catch]
     setVoiceStatus("error")
     setError("Voice connection timed out. Type to continue or tap mic to retry.")

User taps mic button while connected
  └─ conversation.endSession()
     setVoiceStatus("idle")
     setError(null)

Component unmounts
  └─ clearWatchdog()
     conversation.endSession() [try/catch]
```

---

## Component Structure Change

### Before Phase 4

```tsx
export const Route = createFileRoute("/onboarding/voice")({
  component: VoiceOnboarding,
  ...
});

function VoiceOnboarding() {
  // all state and JSX here
}
```

### After Phase 4

```tsx
export const Route = createFileRoute("/onboarding/voice")({
  component: VoiceOnboarding,
  ...
});

// Thin wrapper — required by @elevenlabs/react
function VoiceOnboarding() {
  return (
    <ConversationProvider>
      <VoiceOnboardingInner />
    </ConversationProvider>
  );
}

// All existing state and JSX moves here
function VoiceOnboardingInner() {
  // existing state unchanged
  // + new voice state additions
  // + useConversation hook
}
```

This is the exact pattern used in RESTORE's `TreyIVoiceSetup.tsx`.

---

## New State Added to `VoiceOnboardingInner`

```typescript
// Voice status state machine
type VoiceStatus =
  | "idle"        // mic not active
  | "connecting"  // treyIElevenLabsSession in flight or WebSocket opening
  | "connected"   // onConnect fired
  | "listening"   // onModeChange → "listening"
  | "speaking"    // onModeChange → "speaking"
  | "error"       // onError or onDisconnect with reason === "error"
  | "unavailable" // treyIElevenLabsSession returned ok: false

const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("idle");

// Refs
const watchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
const processingTranscriptRef = useRef(false);
```

---

## New Imports Added to `onboarding.voice.tsx`

```typescript
import { ConversationProvider, useConversation } from "@elevenlabs/react";
import { treyIElevenLabsSession } from "@/lib/trey-i/elevenlabs-session.server";
```

---

## `useConversation` Hook Configuration

```typescript
const conversation = useConversation({
  onConnect: () => {
    clearWatchdog();
    setVoiceStatus("connected");
  },
  onDisconnect: (details) => {
    clearWatchdog();
    if (details.reason === "error") {
      setVoiceStatus("error");
      setError("Voice disconnected. Type to continue or tap mic to retry.");
    } else {
      setVoiceStatus("idle");
      setError(null);
    }
  },
  onError: () => {
    clearWatchdog();
    setVoiceStatus("error");
    setError("Voice disconnected. Type to continue or tap mic to retry.");
  },
  onModeChange: (nextMode) => {
    if (nextMode.mode === "listening") setVoiceStatus("listening");
    else if (nextMode.mode === "speaking") setVoiceStatus("speaking");
  },
  onMessage: (message) => {
    const text = message.message.trim();
    if (!text) return;
    if (message.role !== "user") {
      // Agent message — display only, never submit
      setAssistantMessage(text);
      return;
    }
    // User transcript — feed into existing submit()
    if (processingTranscriptRef.current) return;
    processingTranscriptRef.current = true;
    submitFromVoice(text).finally(() => {
      processingTranscriptRef.current = false;
    });
  },
});
```

---

## `startElevenLabsSession` Function

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

  // 12-second watchdog
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

---

## `stopElevenLabsSession` Function

```typescript
function stopElevenLabsSession() {
  clearWatchdog();
  try { conversation.endSession(); } catch { /* harmless */ }
  setVoiceStatus("idle");
  setError(null);
}
```

---

## `clearWatchdog` Helper

```typescript
function clearWatchdog() {
  if (watchdogRef.current !== null) {
    clearTimeout(watchdogRef.current);
    watchdogRef.current = null;
  }
}
```

---

## `submitFromVoice` Function

This is a thin wrapper that calls the existing `submit()` with a pre-set draft value,
avoiding duplication of the `profileSetupTurn` call logic.

```typescript
async function submitFromVoice(text: string) {
  // Temporarily set draft so submit() picks it up, then restore
  // OR: extract submit logic into submitWithText(text) and call from both paths
}
```

**Preferred approach:** Extract the core of `submit()` into `submitWithText(text: string)`
so both the typed path and the voice path call the same function without state coupling.

```typescript
// Renamed from submit() — accepts text directly
async function submitWithText(text: string) {
  if (!text.trim() || thinking) return;
  if (!accessToken) { setError("Please sign in to use voice setup."); return; }
  if (!sessionId) { setError("Setup session is still starting. Please try again."); return; }

  setThinking(true);
  setError(null);

  try {
    const result = await profileSetupTurn({
      data: { accessToken, sessionId, transcript: text.trim() },
    });
    setAssistantMessage(result.assistant.message);
    // TTS: only play if ElevenLabs is NOT active
    const elevenLabsActive =
      voiceStatus === "connected" ||
      voiceStatus === "listening" ||
      voiceStatus === "speaking";
    if (!elevenLabsActive) {
      playAssistantAudio(result.assistant.message);
    }
    setConfirmedFields(result.confirmedFields);
    if (result.switchToManual) { nav({ to: "/signup" }); return; }
    if (result.complete) {
      if (!result.publicProfileUid) {
        setError("Your profile is saved, but your public link isn't ready yet.");
        return;
      }
      window.location.href = `/u/${result.publicProfileUid}?tour=1`;
    }
  } catch (err: unknown) {
    setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
  } finally {
    setThinking(false);
  }
}

// Typed path — called by input onKeyDown and Send button
const submit = async () => {
  const text = draft.trim();
  if (!text) return;
  setDraft("");
  await submitWithText(text);
};

// Voice path — called by onMessage handler
async function submitFromVoice(text: string) {
  await submitWithText(text);
}
```

---

## Mic Button Behavior

### Current (Phase 3 — visual only)
```tsx
<button
  onClick={() => setListening((v) => !v)}
  ...
>
  {listening ? <Mic /> : <MicOff />}
</button>
```

### Phase 4
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
  {voiceStatus === "connecting" ? (
    <Loader2 className="size-5 animate-spin" />
  ) : voiceActive ? (
    <Mic className="size-5" />
  ) : (
    <MicOff className="size-5" />
  )}
</button>
```

The `Loader2` icon is already imported in the existing file.

---

## Orb Visual Mapping

The existing orb uses `listening` and `thinking` props. Phase 4 maps `voiceStatus`:

```tsx
// Existing orb usage (unchanged structure):
<div className={`... ${
  (voiceStatus === "connected" || voiceStatus === "listening" || voiceStatus === "speaking")
    ? "animate-conic-spin"
    : "opacity-60"
}`} />

// Existing inner icon (unchanged structure):
{thinking || voiceStatus === "connecting"
  ? <Loader2 className="size-10 text-primary animate-spin" />
  : (voiceStatus === "connected" || voiceStatus === "listening" || voiceStatus === "speaking")
  ? <Volume2 className="size-10 text-primary animate-glow-pulse" />
  : <Sparkles className="size-10 text-primary" />}
```

The orb JSX structure is not redesigned. Only the condition expressions change.

---

## TTS Suppression Logic

Phase 2 TTS (`playAssistantAudio`) must not fire while ElevenLabs is active.
The suppression is inside `submitWithText`:

```typescript
const elevenLabsActive =
  voiceStatus === "connected" ||
  voiceStatus === "listening" ||
  voiceStatus === "speaking";

if (!elevenLabsActive) {
  playAssistantAudio(result.assistant.message);
}
```

When ElevenLabs is active, the agent speaks the response directly via WebSocket.
When ElevenLabs is inactive (text-only mode), TTS plays as in Phase 2.

---

## Cleanup on Unmount

```typescript
useEffect(() => {
  return () => {
    clearWatchdog();
    try { conversation.endSession(); } catch { /* harmless */ }
  };
}, [conversation]);
```

---

## `listening` State Variable

The existing `listening` state variable (`useState(false)`) was used to drive the
orb animation and mic button appearance in Phase 1–3. In Phase 4, it is superseded
by `voiceStatus`. Options:

**Option A (preferred):** Remove `listening` state entirely. Replace all references
with `voiceStatus`-derived expressions. This is cleaner and avoids two sources of truth.

**Option B:** Keep `listening` state but sync it from `voiceStatus` via a `useEffect`.
This is more conservative but adds unnecessary complexity.

**Decision: Option A.** The `listening` state is only used in two places in the
existing JSX (orb animation class and mic button class). Both are replaced by
`voiceStatus`-derived expressions in Phase 4. The `setListening` call in the mic
button `onClick` is replaced by `startElevenLabsSession` / `stopElevenLabsSession`.

---

## Files Changed in Phase 4

| File | Change |
|------|--------|
| `package.json` | Add `"@elevenlabs/react": "1.3.0"` |
| `pnpm-lock.yaml` | Updated by `pnpm add` |
| `src/routes/onboarding.voice.tsx` | Mic wiring, `ConversationProvider` wrapper, `voiceStatus` state machine |
| `.kiro/steering/file-map.md` | Update `onboarding.voice.tsx` entry |
| `.kiro/checkpoints/lovable-backend-migration-current-state.md` | Add Phase 4 row |

## Files NOT Changed in Phase 4

| File | Reason |
|------|--------|
| `src/lib/trey-i/elevenlabs-session.server.ts` | Phase 3 — complete, untouched |
| `src/lib/trey-i/intake.server.ts` | Phase 1 — complete, untouched |
| `src/lib/trey-i/onboarding.server.ts` | Phase 1 — complete, untouched |
| `src/lib/trey-i/tts.server.ts` | Phase 2 — complete, untouched |
| `src/components/ai/TreyIWidget.tsx` | Separate future lane — untouched |
| Any Watch Now / Guide file | Out of scope — untouched |
| Any Creator/admin pipeline file | Out of scope — untouched |
| `.claude/` | Local output — never touched |

---

## Why `connectionType: "websocket"`

RESTORE's `startElevenLabsSession` passes `connectionType: "websocket"` explicitly.
The ElevenLabs SDK defaults to WebRTC in some versions, which requires additional
browser permissions and is more fragile in Cloudflare Workers environments.
WebSocket is the correct transport for this use case.

---

## Why `@elevenlabs/react@1.3.0` (exact)

RESTORE's `package.json` specifies `"@elevenlabs/react": "^1.3.0"` (caret range).
ANTIGRAVITY pins to `1.3.0` exactly (no caret) to prevent silent upgrades from
changing the `useConversation` API shape between now and implementation.
If a newer version is needed later, it is an explicit upgrade decision.

---

## Additive and Reversible Guarantee

Phase 4 is fully reversible:
1. `pnpm remove @elevenlabs/react` removes the dependency.
2. Reverting `onboarding.voice.tsx` to the Phase 3 state restores text-only mode.
3. No server functions are modified.
4. No database tables or columns are added.
5. No env vars are added.

The text-first onboarding flow (Phase 1) and TTS (Phase 2) continue to work
identically whether or not `@elevenlabs/react` is installed.
