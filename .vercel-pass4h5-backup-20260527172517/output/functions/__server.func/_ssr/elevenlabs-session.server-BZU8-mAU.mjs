import { c as createServerRpc, a as createServerFn, v as verifyTreyIUser } from "./index.mjs";
import "../_libs/react.mjs";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
const FALLBACK_MESSAGE = "Voice is unavailable. Type to continue.";
const SIGNED_URL_PATHS = ["get_signed_url", "get-signed-url"];
function validateElevenLabsSessionInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : ""
  };
}
function log(level, code, detail) {
  if (level === "info") return;
  const tag = "[trey-i-elevenlabs-session]";
  const args = detail ? [tag, code, detail] : [tag, code];
  if (level === "error") console.error(...args);
  else if (level === "warn") console.warn(...args);
  else console.info(...args);
}
const treyIElevenLabsOnboardingSession_createServerFn_handler = createServerRpc({
  id: "32425a5c968d0592c182959d85048eed9e3e9223581aee743a986a97cae431e6",
  name: "treyIElevenLabsOnboardingSession",
  filename: "src/lib/trey-i/elevenlabs-session.server.ts"
}, (opts) => treyIElevenLabsOnboardingSession.__executeServer(opts));
const treyIElevenLabsOnboardingSession = createServerFn({
  method: "GET"
}).handler(treyIElevenLabsOnboardingSession_createServerFn_handler, async () => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim() || "";
    const agentId = process.env.ELEVENLABS_AGENT_ID?.trim() || "";
    if (!apiKey || !agentId) {
      log("warn", "ELEVENLABS_NOT_CONFIGURED (onboarding)");
      return {
        ok: false,
        code: "ELEVENLABS_NOT_CONFIGURED",
        message: FALLBACK_MESSAGE
      };
    }
    for (const path of SIGNED_URL_PATHS) {
      const url = `https://api.elevenlabs.io/v1/convai/conversation/${path}?agent_id=${encodeURIComponent(agentId)}`;
      let upstream;
      try {
        upstream = await fetch(url, {
          method: "GET",
          headers: {
            "xi-api-key": apiKey
          },
          cache: "no-store"
        });
      } catch {
        continue;
      }
      if (upstream.status === 404 && path === "get_signed_url") continue;
      if (upstream.status === 401 || upstream.status === 403) {
        return {
          ok: false,
          code: upstream.status === 401 ? "ELEVENLABS_API_KEY_INVALID" : "ELEVENLABS_API_KEY_FORBIDDEN",
          message: FALLBACK_MESSAGE
        };
      }
      if (!upstream.ok) {
        return {
          ok: false,
          code: "ELEVENLABS_SESSION_CREATE_FAILED",
          message: FALLBACK_MESSAGE
        };
      }
      const payload = await upstream.json().catch(() => null);
      if (!payload) return {
        ok: false,
        code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
        message: FALLBACK_MESSAGE
      };
      const signedUrl = typeof payload.signed_url === "string" ? payload.signed_url : typeof payload.signedUrl === "string" ? payload.signedUrl : "";
      if (!signedUrl) return {
        ok: false,
        code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
        message: FALLBACK_MESSAGE
      };
      return {
        ok: true,
        provider: "elevenlabs",
        signedUrl,
        expiresInSeconds: 900
      };
    }
    return {
      ok: false,
      code: "ELEVENLABS_SESSION_CREATE_FAILED",
      message: FALLBACK_MESSAGE
    };
  } catch (error) {
    log("error", "UNKNOWN_ELEVENLABS_ERROR (onboarding)", {
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      ok: false,
      code: "UNKNOWN_ELEVENLABS_ERROR",
      message: FALLBACK_MESSAGE
    };
  }
});
const treyIElevenLabsSession_createServerFn_handler = createServerRpc({
  id: "dd1287e471e65d20cbc5c4dc956ad27b11fa01674c048d20656dfe3221e0c3e9",
  name: "treyIElevenLabsSession",
  filename: "src/lib/trey-i/elevenlabs-session.server.ts"
}, (opts) => treyIElevenLabsSession.__executeServer(opts));
const treyIElevenLabsSession = createServerFn({
  method: "POST"
}).inputValidator(validateElevenLabsSessionInput).handler(treyIElevenLabsSession_createServerFn_handler, async ({
  data
}) => {
  try {
    if (!data.accessToken) {
      return {
        ok: false,
        code: "AUTH_REQUIRED",
        message: "Sign in to use Trey-I voice."
      };
    }
    try {
      await verifyTreyIUser(data.accessToken);
    } catch {
      return {
        ok: false,
        code: "AUTH_REQUIRED",
        message: "Sign in to use Trey-I voice."
      };
    }
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim() || "";
    const agentId = process.env.ELEVENLABS_AGENT_ID?.trim() || "";
    log("info", "START", {
      hasApiKey: Boolean(apiKey),
      hasAgentId: Boolean(agentId),
      agentIdSuffix: agentId ? agentId.slice(-6) : "MISSING"
    });
    if (!apiKey || !agentId) {
      log("warn", "ELEVENLABS_NOT_CONFIGURED");
      return {
        ok: false,
        code: "ELEVENLABS_NOT_CONFIGURED",
        message: FALLBACK_MESSAGE
      };
    }
    for (const path of SIGNED_URL_PATHS) {
      const url = `https://api.elevenlabs.io/v1/convai/conversation/${path}?agent_id=${encodeURIComponent(agentId)}`;
      log("info", "SIGNED_URL_FETCH_START", {
        path
      });
      let upstream;
      try {
        upstream = await fetch(url, {
          method: "GET",
          headers: {
            "xi-api-key": apiKey
          },
          cache: "no-store"
        });
      } catch (fetchErr) {
        log("error", "SIGNED_URL_NETWORK_ERROR", {
          path,
          error: fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
        });
        continue;
      }
      log("info", "SIGNED_URL_FETCH_STATUS", {
        path,
        status: upstream.status
      });
      if (upstream.status === 404 && path === "get_signed_url") {
        log("warn", "SIGNED_URL_404_TRY_NEXT", {
          path
        });
        continue;
      }
      if (upstream.status === 401 || upstream.status === 403) {
        let safeBody = "";
        try {
          safeBody = (await upstream.text()).slice(0, 200).replace(/xi-api-key|api_key|key/gi, "***");
        } catch {
        }
        log("error", "ELEVENLABS_API_KEY_PERMISSIONS_ISSUE", {
          status: upstream.status,
          path,
          safeBody
        });
        return {
          ok: false,
          code: upstream.status === 401 ? "ELEVENLABS_API_KEY_INVALID" : "ELEVENLABS_API_KEY_FORBIDDEN",
          message: FALLBACK_MESSAGE
        };
      }
      if (!upstream.ok) {
        log("error", "ELEVENLABS_SESSION_CREATE_FAILED", {
          path,
          status: upstream.status
        });
        return {
          ok: false,
          code: "ELEVENLABS_SESSION_CREATE_FAILED",
          message: FALLBACK_MESSAGE
        };
      }
      const payload = await upstream.json().catch(() => null);
      if (!payload) {
        log("error", "ELEVENLABS_RESPONSE_SHAPE_INVALID", {
          path,
          note: "JSON parse failed"
        });
        return {
          ok: false,
          code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
          message: FALLBACK_MESSAGE
        };
      }
      const signedUrl = typeof payload.signed_url === "string" ? payload.signed_url : typeof payload.signedUrl === "string" ? payload.signedUrl : "";
      if (!signedUrl) {
        log("error", "ELEVENLABS_RESPONSE_SHAPE_INVALID", {
          path,
          payloadKeys: Object.keys(payload),
          note: "signed_url field missing or not a string"
        });
        return {
          ok: false,
          code: "ELEVENLABS_RESPONSE_SHAPE_INVALID",
          message: FALLBACK_MESSAGE
        };
      }
      const conversationId = typeof payload.conversation_id === "string" ? payload.conversation_id : typeof payload.conversationId === "string" ? payload.conversationId : void 0;
      log("info", "SIGNED_URL_FETCH_OK", {
        path,
        hasConversationId: Boolean(conversationId)
      });
      return {
        ok: true,
        provider: "elevenlabs",
        signedUrl,
        expiresInSeconds: 900,
        ...conversationId ? {
          conversationId
        } : {}
      };
    }
    log("error", "ELEVENLABS_SESSION_CREATE_FAILED", {
      note: "All paths exhausted"
    });
    return {
      ok: false,
      code: "ELEVENLABS_SESSION_CREATE_FAILED",
      message: FALLBACK_MESSAGE
    };
  } catch (error) {
    log("error", "UNKNOWN_ELEVENLABS_ERROR", {
      error: error instanceof Error ? error.message : String(error)
    });
    return {
      ok: false,
      code: "UNKNOWN_ELEVENLABS_ERROR",
      message: FALLBACK_MESSAGE
    };
  }
});
export {
  treyIElevenLabsOnboardingSession_createServerFn_handler,
  treyIElevenLabsSession_createServerFn_handler
};
