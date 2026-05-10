# Trey-I Phase 3 — ElevenLabs Session — Design

## Source Reference

RESTORE project ElevenLabs implementation studied at:
- `app/api/elevenlabs/conversation/token/route.ts` — conversation token route
- `app/api/elevenlabs/conversation/signed-url/route.ts` — signed URL route
- `app/api/elevenlabs/agent-session/route.ts` — agent session route (most complete)
- `lib/voice/providers/elevenlabs.ts` — browser-side fetch helpers and type definitions
- `lib/voice/providers/types.ts` — `SafeVoiceDiagnosticCode` union and provider status enum
- `lib/env/server-env.ts` — `getElevenLabsServerConfig()` and env catalog

ANTIGRAVITY established server function pattern:
- `src/lib/trey-i/tts.server.ts` — Phase 2 server function (most recent pattern to match)
- `src/lib/trey-i/intake.server.ts` — auth gate pattern (`verifyTreyIUser`)

---

## Architecture

### Data Flow

```
Browser (onboarding.voice.tsx — Phase 4 only)
  │
  │  treyIElevenLabsSession({ data: { accessToken } })
  │  [TanStack Start server function call]
  ▼
src/lib/trey-i/elevenlabs-session.server.ts
  │
  ├─ validateElevenLabsSessionInput(input)
  │    └─ accessToken: string (must be non-empty)
  │
  ├─ verifyTreyIUser(accessToken)          ← from onboarding.server.ts
  │    └─ throws/rejects if invalid        ← caught; returns { ok: false, code: "AUTH_REQUIRED" }
  │
  ├─ process.env.ELEVENLABS_API_KEY        ← never leaves this boundary
  ├─ process.env.ELEVENLABS_AGENT_ID       ← never leaves this boundary
  │
  ├─ if (!apiKey || !agentId)
  │    └─ return { ok: false, code: "ELEVENLABS_NOT_CONFIGURED" }
  │
  ├─ fetch("https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=...")
  │    headers: { "xi-api-key": apiKey }   ← API key sent to ElevenLabs only, not to browser
  │    on 404 → try "get-signed-url" variant
  │    on 401/403 → return { ok: false, code: "ELEVENLABS_API_KEY_INVALID/FORBIDDEN" }
  │    on !ok → return { ok: false, code: "ELEVENLABS_SESSION_CREATE_FAILED" }
  │    on JSON parse fail → return { ok: false, code: "ELEVENLABS_RESPONSE_SHAPE_INVALID" }
  │    on missing signed_url field → return { ok: false, code: "ELEVENLABS_RESPONSE_SHAPE_INVALID" }
  │
  └─ return {
       ok: true,
       provider: "elevenlabs",
       signedUrl: "wss://...",    ← safe: time-limited URL, not the API key
       expiresInSeconds: 900,
       conversationId?: string,
     }
  │
  ▼
Browser receives signedUrl only
  │
  │  Phase 4: useConversation().startSession({ signedUrl })
  └─ @elevenlabs/react SDK connects to ElevenLabs via WebSocket
     (API key is NOT needed client-side — the signed URL is self-authenticating)
```

---

## New File

### `src/lib/trey-i/elevenlabs-session.server.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";
import { verifyTreyIUser } from "@/lib/trey-i/onboarding.server";

// --- Types ---

type ElevenLabsSessionInput = {
  accessToken: string;
};

export type ElevenLabsSessionResult =
  | {
      ok: true;
      provider: "elevenlabs";
      signedUrl: string;
      expiresInSeconds: number;
      conversationId?: string;
    }
  | {
      ok: false;
      code:
        | "AUTH_REQUIRED"
        | "ELEVENLABS_NOT_CONFIGURED"
        | "ELEVENLABS_API_KEY_INVALID"
        | "ELEVENLABS_API_KEY_FORBIDDEN"
        | "ELEVENLABS_SESSION_CREATE_FAILED"
        | "ELEVENLABS_RESPONSE_SHAPE_INVALID"
        | "UNKNOWN_ELEVENLABS_ERROR";
      message: string;
    };

// --- Constants ---

const FALLBACK_MESSAGE = "Voice is unavailable. Type to continue.";
const SIGNED_URL_PATHS = ["get_signed_url", "get-signed-url"] as const;

// --- Input validator ---

function validateElevenLabsSessionInput(
  input: ElevenLabsSessionInput
): ElevenLabsSessionInput {
  return {
    accessToken:
      typeof input?.accessToken === "string" ? input.accessToken : "",
  };
}

// --- Helper: safe server log ---

function log(level: "info" | "warn" | "error", code: string, detail?: object) {
  if (process.env.NODE_ENV === "production" && level === "info") return;
  const tag = "[trey-i-elevenlabs-session]";
  const args = detail ? [tag, code, detail] : [tag, code];
  if (level === "error") console.error(...args);
  else if (level === "warn") console.warn(...args);
  else console.info(...args);
}

// --- Server function ---

export const treyIElevenLabsSession = createServerFn({ method: "POST" })
  .inputValidator(validateElevenLabsSessionInput)
  .handler(async ({ data }): Promise<ElevenLabsSessionResult> => {
    try {
      // Auth gate
      if (!data.accessToken) {
        return { ok: false, code: "AUTH_REQUIRED", message: "Sign in to use Trey-I voice." };
      }
      try {
        await verifyTreyIUser(data.accessToken);
      } catch {
        return { ok: false, code: "AUTH_REQUIRED", message: "Sign in to use Trey-I voice." };
      }

      // Env check
      const apiKey = process.env.ELEVENLABS_API_KEY?.trim() || "";
      const agentId = process.env.ELEVENLABS_AGENT_ID?.trim() || "";

      log("info", "START", {
        hasApiKey: Boolean(apiKey),
        hasAgentId: Boolean(agentId),
        agentIdSuffix: agentId ? agentId.slice(-6) : "MISSING",
      });

      if (!apiKey || !agentId) {
        log("warn", "ELEVENLABS_NOT_CONFIGURED");
        return { ok: false, code: "ELEVENLABS_NOT_CONFIGURED", message: FALLBACK_MESSAGE };
      }

      // Try each signed URL path variant
      for (const path of SIGNED_URL_PATHS) {
        const url = `https://api.elevenlabs.io/v1/convai/conversation/${path}?agent_id=${encodeURIComponent(agentId)}`;
        log("info", "SIGNED_URL_FETCH_START", { path });

        let upstream: Response;
        try {
          upstream = await fetch(url, {
            method: "GET",
            headers: { "xi-api-key": apiKey },
            cache: "no-store",
          });
        } catch (fetchErr) {
          log("error", "SIGNED_URL_NETWORK_ERROR", {
            path,
            error: fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
          });
          continue;
        }

        log("info", "SIGNED_URL_FETCH_STATUS", { path, status: upstream.status });

        // 404 on canonical path — try legacy
        if (upstream.status === 404 && path === "get_signed_url") {
          log("warn", "SIGNED_URL_404_TRY_NEXT", { path });
          continue;
        }

        // 401/403 — key or permission problem
        if (upstream.status === 401 || upstream.status === 403) {
          let safeBody = "";
          try {
            safeBody = (await upstream.text())
              .slice(0, 200)
              .replace(/xi-api-key|api_key|key/gi, "***");
          } catch { /* harmless */ }
          log("error", "ELEVENLABS_API_KEY_PERMISSIONS_ISSUE", {
            status: upstream.status,
            path,
            safeBody,
          });
          return {
            ok: false,
            code: upstream.status === 401 ? "ELEVENLABS_API_KEY_INVALID" : "ELEVENLABS_API_KEY_FORBIDDEN",
            message: FALLBACK_MESSAGE,
          };
        }

        // Other non-ok
        if (!upstream.ok) {
          log("error", "ELEVENLABS_SESSION_CREATE_FAILED", { path, status: upstream.status });
          return { ok: false, code: "ELEVENLABS_SESSION_CREATE_FAILED", message: FALLBACK_MESSAGE };
        }

        // Parse
        const payload = (await upstream.json().catch(() => null)) as {
          signed_url?: unknown;
          signedUrl?: unknown;
          conversation_id?: unknown;
          conversationId?: unknown;
        } | null;

        if (!payload) {
          log("error", "ELEVENLABS_RESPONSE_SHAPE_INVALID", { path, note: "JSON parse failed" });
          return { ok: false, code: "ELEVENLABS_RESPONSE_SHAPE_INVALID", message: FALLBACK_MESSAGE };
        }

        const signedUrl =
          typeof payload.signed_url === "string"
            ? payload.signed_url
            : typeof payload.signedUrl === "string"
            ? payload.signedUrl
            : "";

        if (!signedUrl) {
          log("error", "ELEVENLABS_RESPONSE_SHAPE_INVALID", {
            path,
            payloadKeys: Object.keys(payload),
            note: "signed_url field missing or not a string",
          });
          return { ok: false, code: "ELEVENLABS_RESPONSE_SHAPE_INVALID", message: FALLBACK_MESSAGE };
        }

        const conversationId =
          typeof payload.conversation_id === "string"
            ? payload.conversation_id
            : typeof payload.conversationId === "string"
            ? payload.conversationId
            : undefined;

        log("info", "SIGNED_URL_FETCH_OK", { path, hasConversationId: Boolean(conversationId) });

        return {
          ok: true,
          provider: "elevenlabs",
          signedUrl,
          expiresInSeconds: 900,
          ...(conversationId ? { conversationId } : {}),
        };
      }

      // All paths exhausted
      log("error", "ELEVENLABS_SESSION_CREATE_FAILED", { note: "All paths exhausted" });
      return { ok: false, code: "ELEVENLABS_SESSION_CREATE_FAILED", message: FALLBACK_MESSAGE };
    } catch (error) {
      log("error", "UNKNOWN_ELEVENLABS_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { ok: false, code: "UNKNOWN_ELEVENLABS_ERROR", message: FALLBACK_MESSAGE };
    }
  });
```

---

## Endpoint Resolution Strategy

Studied from RESTORE `agent-session/route.ts` (most complete implementation):

| Path variant      | Status     | Notes                                   |
|-------------------|------------|-----------------------------------------|
| `get_signed_url`  | Canonical  | Underscore — ElevenLabs docs confirm    |
| `get-signed-url`  | Legacy     | Hyphen — kept as silent fallback        |

Try 1 → if 404, try 2 → if both exhausted, return `ELEVENLABS_SESSION_CREATE_FAILED`.

Do **not** implement the conversation token endpoint (`/conversation/token`) in Phase 3.
The signed URL approach is universally supported and more durable.
Conversation token is a newer API pattern that can be added in Phase 4 as a tertiary fallback.

---

## Why TanStack Start Server Function vs Next.js API Route

RESTORE uses Next.js API routes (`GET` handler in `route.ts`).
ANTIGRAVITY uses TanStack Start `createServerFn` — the established pattern
from `tts.server.ts` and `intake.server.ts`.

Key differences:
- TanStack Start server functions are called as typed async functions from the browser
  (`await treyIElevenLabsSession({ data: { ... } })`), not as HTTP fetch calls
- The server/browser boundary is enforced by the framework, not by the developer
- Input validation uses `.inputValidator()`, matching existing files
- Authentication uses the `accessToken` pattern (Supabase JWT passed from browser),
  not `createClient()` (server-side Supabase client) — matching Phase 1/2 pattern

---

## Why `accessToken` Pattern (Not Supabase Server Client)

`intake.server.ts` and `tts.server.ts` both receive `accessToken: string` from the
browser and pass it to `verifyTreyIUser()`. This avoids needing `SUPABASE_SERVICE_ROLE_KEY`
solely for auth verification and keeps the pattern consistent across all Trey-I server functions.

The `accessToken` is the Supabase JWT from `createBrowserClient().auth.getSession()`.
It is already available in `onboarding.voice.tsx` (set in state from the Phase 1 `useEffect`).

---

## Safe Log Policy

| Log target              | Logged?                  | Format                        |
|-------------------------|--------------------------|-------------------------------|
| `hasApiKey`             | Yes (boolean only)       | `true` / `false`              |
| `hasAgentId`            | Yes (boolean only)       | `true` / `false`              |
| `agentIdSuffix`         | Yes (last 6 chars only)  | e.g. `"...xAbC9z"`            |
| `apiKey` value          | **Never**                | —                             |
| Upstream error body     | Dev only, redacted       | Key material replaced with `***` |
| HTTP status code        | Yes                      | Integer                       |
| `path` variant tried    | Yes                      | `"get_signed_url"` etc.       |

In production (`NODE_ENV === "production"`), `info`-level logs are suppressed.
`warn` and `error` always log (for diagnostics without exposing secrets).

---

## Additive Guarantee

The following files are **not modified** in Phase 3:

| File                                      | Status in Phase 3 |
|-------------------------------------------|-------------------|
| `src/lib/trey-i/intake.server.ts`         | Untouched         |
| `src/lib/trey-i/onboarding.server.ts`     | Untouched         |
| `src/lib/trey-i/tts.server.ts`            | Untouched         |
| `src/routes/onboarding.voice.tsx`         | Untouched         |
| `src/routes/__root.tsx`                   | Untouched         |
| `package.json`                            | Untouched         |
| `pnpm-lock.yaml`                          | Untouched         |
| `.claude/`                                | Untouched         |

---

## Phase 4 Integration Contract

Phase 4 imports `treyIElevenLabsSession` and `ElevenLabsSessionResult` from Phase 3:

```typescript
// onboarding.voice.tsx (Phase 4 addition — not implemented in Phase 3)
import { treyIElevenLabsSession, type ElevenLabsSessionResult } from "@/lib/trey-i/elevenlabs-session.server";

// On mic button enable:
const result: ElevenLabsSessionResult = await treyIElevenLabsSession({
  data: { accessToken },
});

if (result.ok) {
  await conversation.startSession({ signedUrl: result.signedUrl });
} else {
  // Fall back silently — text input remains active
  setVoiceUnavailable(true);
}
```

Phase 4 also adds `@elevenlabs/react` to `package.json` for `useConversation()`.
The browser SDK never handles the API key — it uses only the `signedUrl`.
