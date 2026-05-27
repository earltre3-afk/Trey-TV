import "./lib/error-capture";

import {
  handleJwks,
  handleOAuthRevoke,
  handleOAuthToken,
  handleOAuthUserInfo,
  handleOpenIdConfiguration,
} from "./lib/developers/oauth-http.server";
import { handleAuthLogout, handleAuthMe, handleAuthSession } from "./lib/auth-http.server";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { handleFwdOAuthRequest } from "./lib/fwd/oauth-http.server";
import { handleLiveKitToken, handleLiveKitDiagnostics } from "./lib/livekit-token.server";
import { handlePluginApiRequest } from "./lib/plugins/registry";
import { handlePlutoApiRequest } from "./lib/pluto/pluto-api.server";
import { handleTrafficRequest } from "./lib/traffic-fake.server";
import { handleTvApiRequest } from "./lib/tv/tv-api.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

async function handleOAuthApiRequest(request: Request, env: unknown): Promise<Response | null> {
  const url = new URL(request.url);

  const trafficResponse = handleTrafficRequest(request);
  if (trafficResponse) return trafficResponse;

  const fwdOAuthResponse = handleFwdOAuthRequest(request);
  if (fwdOAuthResponse) return fwdOAuthResponse;

  const pluginResponse = await handlePluginApiRequest(request);
  if (pluginResponse) return pluginResponse;

  const tvResponse = await handleTvApiRequest(request);
  if (tvResponse) return tvResponse;

  const plutoResponse = await handlePlutoApiRequest(request);
  if (plutoResponse) return plutoResponse;

  if (url.pathname === "/api/auth/session") return handleAuthSession(request);
  if (url.pathname === "/api/auth/me") return handleAuthMe(request);
  if (url.pathname === "/api/auth/logout") return handleAuthLogout(request);
  if (url.pathname === "/api/livekit/token" || url.pathname === "/livekit-token") {
    return handleLiveKitToken(request, env);
  }
  if (url.pathname === "/api/livekit/diagnostics") {
    return handleLiveKitDiagnostics(request, env);
  }

  if (url.pathname === "/oauth/token") return handleOAuthToken(request);
  if (url.pathname === "/oauth/userinfo") return handleOAuthUserInfo(request);
  if (url.pathname === "/oauth/revoke") return handleOAuthRevoke(request);
  if (url.pathname === "/.well-known/openid-configuration") return handleOpenIdConfiguration(request);
  if (url.pathname === "/oauth/jwks.json") return handleJwks();

  return null;
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const oauthResponse = await handleOAuthApiRequest(request, env);
      if (oauthResponse) return oauthResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
