import { createServerFn } from "@tanstack/react-start";
import { verifyTreyIUser } from "@/lib/trey-i/onboarding.server";

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

const FALLBACK_MESSAGE = "Voice is unavailable. Type to continue.";
const SIGNED_URL_PATHS = ["get_signed_url", "get-signed-url"] as const;

function validateElevenLabsSessionInput(input: ElevenLabsSessionInput): ElevenLabsSessionInput {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  };
}

function log(level: "info" | "warn" | "error", code: string, detail?: object) {
  if (process.env.NODE_ENV === "production" && level === "info") return;
  const tag = "[trey-i-elevenlabs-session]";
  const args: unknown[] = detail ? [tag, code, detail] : [tag, code];
  if (level === "error") console.error(...args);
  else if (level === "warn") console.warn(...args);
  else console.info(...args);
}

// Unauthenticated version for onboarding — no user session required.
// Auth happens at the end of onboarding when the profile is saved.
export const treyIElevenLabsOnboardingSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<ElevenLabsSessionResult> => {
    try {
      const apiKey = process.env.ELEVENLABS_API_KEY?.trim() || "";
      const agentId = process.env.ELEVENLABS_AGENT_ID?.trim() || "";

      if (!apiKey || !agentId) {
        log("warn", "ELEVENLABS_NOT_CONFIGURED (onboarding)");
        return { ok: false, code: "ELEVENLABS_NOT_CONFIGURED", message: FALLBACK_MESSAGE };
      }

      for (const path of SIGNED_URL_PATHS) {
        const url = `https://api.elevenlabs.io/v1/convai/conversation/${path}?agent_id=${encodeURIComponent(agentId)}`;
        let upstream: Response;
        try {
          upstream = await fetch(url, {
            method: "GET",
            headers: { "xi-api-key": apiKey },
            cache: "no-store",
          });
        } catch {
          continue;
        }

        if (upstream.status === 404 && path === "get_signed_url") continue;

        if (upstream.status === 401 || upstream.status === 403) {
          return {
            ok: false,
            code:
              upstream.status === 401
                ? "ELEVENLABS_API_KEY_INVALID"
                : "ELEVENLABS_API_KEY_FORBIDDEN",
            message: FALLBACK_MESSAGE,
          };
        }

        if (!upstream.ok) {
          return { ok: false, code: "ELEVENLABS_SESSION_CREATE_FAILED", message: FALLBACK_MESSAGE };
        }

        const payload = (await upstream.json().catch(() => null)) as {
          signed_url?: unknown;
          signedUrl?: unknown;
          conversation_id?: unknown;
          conversationId?: unknown;
        } | null;

        if (!payload)
          return {
            ok: false,
            code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
            message: FALLBACK_MESSAGE,
          };

        const signedUrl =
          typeof payload.signed_url === "string"
            ? payload.signed_url
            : typeof payload.signedUrl === "string"
              ? payload.signedUrl
              : "";

        if (!signedUrl)
          return {
            ok: false,
            code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
            message: FALLBACK_MESSAGE,
          };

        return { ok: true, provider: "elevenlabs", signedUrl, expiresInSeconds: 900 };
      }

      return { ok: false, code: "ELEVENLABS_SESSION_CREATE_FAILED", message: FALLBACK_MESSAGE };
    } catch (error) {
      log("error", "UNKNOWN_ELEVENLABS_ERROR (onboarding)", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { ok: false, code: "UNKNOWN_ELEVENLABS_ERROR", message: FALLBACK_MESSAGE };
    }
  },
);

export const treyIElevenLabsSession = createServerFn({ method: "POST" })
  .inputValidator(validateElevenLabsSessionInput)
  .handler(async ({ data }): Promise<ElevenLabsSessionResult> => {
    try {
      if (!data.accessToken) {
        return { ok: false, code: "AUTH_REQUIRED", message: "Sign in to use Trey-I voice." };
      }

      try {
        await verifyTreyIUser(data.accessToken);
      } catch {
        return { ok: false, code: "AUTH_REQUIRED", message: "Sign in to use Trey-I voice." };
      }

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

        if (upstream.status === 404 && path === "get_signed_url") {
          log("warn", "SIGNED_URL_404_TRY_NEXT", { path });
          continue;
        }

        if (upstream.status === 401 || upstream.status === 403) {
          let safeBody = "";
          try {
            safeBody = (await upstream.text())
              .slice(0, 200)
              .replace(/xi-api-key|api_key|key/gi, "***");
          } catch {
            /* harmless */
          }
          log("error", "ELEVENLABS_API_KEY_PERMISSIONS_ISSUE", {
            status: upstream.status,
            path,
            safeBody,
          });
          return {
            ok: false,
            code:
              upstream.status === 401
                ? "ELEVENLABS_API_KEY_INVALID"
                : "ELEVENLABS_API_KEY_FORBIDDEN",
            message: FALLBACK_MESSAGE,
          };
        }

        if (!upstream.ok) {
          log("error", "ELEVENLABS_SESSION_CREATE_FAILED", { path, status: upstream.status });
          return { ok: false, code: "ELEVENLABS_SESSION_CREATE_FAILED", message: FALLBACK_MESSAGE };
        }

        const payload = (await upstream.json().catch(() => null)) as {
          signed_url?: unknown;
          signedUrl?: unknown;
          conversation_id?: unknown;
          conversationId?: unknown;
        } | null;

        if (!payload) {
          log("error", "ELEVENLABS_RESPONSE_SHAPE_INVALID", { path, note: "JSON parse failed" });
          return {
            ok: false,
            code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
            message: FALLBACK_MESSAGE,
          };
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
          return {
            ok: false,
            code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
            message: FALLBACK_MESSAGE,
          };
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

      log("error", "ELEVENLABS_SESSION_CREATE_FAILED", { note: "All paths exhausted" });
      return { ok: false, code: "ELEVENLABS_SESSION_CREATE_FAILED", message: FALLBACK_MESSAGE };
    } catch (error) {
      log("error", "UNKNOWN_ELEVENLABS_ERROR", {
        error: error instanceof Error ? error.message : String(error),
      });
      return { ok: false, code: "UNKNOWN_ELEVENLABS_ERROR", message: FALLBACK_MESSAGE };
    }
  });
