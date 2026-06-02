# Design — Trey-I Phase 2 TTS

## Architecture

```
onboarding.voice.tsx
       │
       │  user submits transcript
       ▼
profileSetupTurn (existing server fn)
       │
       └─ returns { assistant: { message }, confirmedFields, ... }
              │
              │  browser receives message, renders text immediately
              │
              ▼  (fire-and-forget, non-blocking)
treyITts (new server fn)
       │
       ├─ reads GOOGLE_GENAI_API_KEY from process.env
       ├─ calls Gemini TTS API
       ├─ returns { audioBase64: string, mimeType: "audio/wav" }
       │    OR { audioBase64: null } on any failure
       │
       ▼
browser decodes base64 → Blob → Audio.play()
(failure: silent, no user-visible error)
```

---

## New File

### `src/lib/trey-i/tts.server.ts`

Single exported server function: `treyITts`.

```typescript
import { createServerFn } from "@tanstack/react-start"
import { GoogleGenAI, Modality } from "@google/genai"

type TtsInput = { text: string }
type TtsResult = { audioBase64: string; mimeType: "audio/wav" } | { audioBase64: null }

// env key resolution order (matches RESTORE pattern)
function getApiKey(): string | null {
  return (
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    null
  )
}

function cleanForTts(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/Next steps:[\s\S]*$/i, "")
    .replace(/If it still fails[\s\S]*$/i, "")
    .trim()
    .slice(0, 700)
}

function wavFromPcm(pcm: Buffer): Buffer { /* 44-byte WAV header + PCM */ }

export const treyITts = createServerFn({ method: "POST" })
  .inputValidator(...)
  .handler(async ({ data }): Promise<TtsResult> => {
    const text = cleanForTts(String(data.text ?? "").trim())
    if (!text) return { audioBase64: null }

    const apiKey = getApiKey()
    if (!apiKey) return { audioBase64: null }   // key not configured — silent skip

    try {
      const client = new GoogleGenAI({ apiKey })
      const response = await client.models.generateContent({
        model: process.env.GEMINI_TREYI_TTS_MODEL || "gemini-2.5-flash-preview-tts",
        contents: `Say in a warm, smooth, confident, premium, emotionally intelligent, and conversational voice: ${text}`,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: process.env.GEMINI_TREYI_VOICE_NAME || "Algieba",
              },
            },
          },
        },
      })

      // extract base64 audio from response
      const audio = extractAudioBuffer(response)
      if (!audio) return { audioBase64: null }

      const wav = isWav(audio) ? audio.bytes : wavFromPcm(audio.bytes)
      return { audioBase64: wav.toString("base64"), mimeType: "audio/wav" }
    } catch {
      return { audioBase64: null }   // any Gemini error — silent skip
    }
  })
```

**Key design decisions:**

- Returns `{ audioBase64: null }` instead of throwing on any failure — the browser never sees an error
- Uses direct API key auth (`new GoogleGenAI({ apiKey })`) — no Vertex AI / Google Cloud ADC required for this phase
- `Buffer` is available in Cloudflare Workers via the `nodejs_compat` flag (already used in the project)

---

## Modified File

### `src/routes/onboarding.voice.tsx`

Add a `playTts` helper that is called fire-and-forget after `profileSetupTurn` resolves.
The critical `submit()` path is unchanged — text renders immediately regardless of TTS.

```typescript
async function playTts(message: string) {
  try {
    const result = await treyITts({ data: { text: message } });
    if (!result.audioBase64) return;
    const bytes = Uint8Array.from(atob(result.audioBase64), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: result.mimeType });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  } catch {
    // silent — TTS failure never surfaces to user
  }
}
```

Call site inside `submit()`, after `setAssistantMessage(result.assistant.message)`:

```typescript
setAssistantMessage(result.assistant.message);
setConfirmedFields(result.confirmedFields);
playTts(result.assistant.message); // fire-and-forget, no await
```

No other changes to `onboarding.voice.tsx`.

---

## Dependency Addition

Add to `package.json` dependencies:

```json
"@google/genai": "^1.50.1"
```

This is the same version used in RESTORE-599. Run `pnpm install` after adding.

---

## Environment Variables (server-only)

| Variable                  | Purpose                 | Required?                                            |
| ------------------------- | ----------------------- | ---------------------------------------------------- |
| `GOOGLE_GENAI_API_KEY`    | Primary Gemini API key  | One of the three must be set for TTS to work         |
| `GEMINI_API_KEY`          | Fallback Gemini API key |                                                      |
| `GOOGLE_API_KEY`          | Fallback Google API key |                                                      |
| `GEMINI_TREYI_TTS_MODEL`  | Override TTS model      | Optional; defaults to `gemini-2.5-flash-preview-tts` |
| `GEMINI_TREYI_VOICE_NAME` | Override TTS voice      | Optional; defaults to `Algieba`                      |

None of these may have a `VITE_` prefix. If none are set, `treyITts` returns
`{ audioBase64: null }` silently — TTS is simply disabled.

---

## Security Boundaries

| Boundary         | Enforcement                                                                        |
| ---------------- | ---------------------------------------------------------------------------------- |
| Google API key   | `process.env` server-side only; no `VITE_` prefix                                  |
| Browser receives | Only base64 WAV audio bytes — no credentials                                       |
| TTS failure      | Returns `{ audioBase64: null }` — never throws to browser                          |
| No auth required | TTS is stateless; no user data is sent to Gemini (only the assistant message text) |

---

## What Is NOT Changed

| Area                   | Reason                                               |
| ---------------------- | ---------------------------------------------------- |
| `intake.server.ts`     | No change — `profileSetupTurn` return type unchanged |
| `onboarding.server.ts` | No change                                            |
| `onboarding.tsx`       | Entry page — no change                               |
| `TreyIWidget.tsx`      | Separate future lane                                 |
| Watch Now / Guide      | Static/localStorage — not touched                    |
| Creator/admin pipeline | Not touched                                          |
| Mic button behavior    | Still visual-only — TTS is output only, not input    |
