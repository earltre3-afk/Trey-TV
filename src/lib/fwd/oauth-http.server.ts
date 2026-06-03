import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";
import {
  cleanText,
  getActiveFwdClient,
  getPublicProfileUrl,
  isAllowedRedirect,
  isPast,
  isAllowedScope,
  oauthError,
  oauthJson,
  safeLog,
  verifySecret,
  type FwdSafeProfile,
} from "./oauth-shared.server";

const ACCESS_TOKEN_SECONDS = 60 * 60;

type Payload = Record<string, string>;

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function publicProfileUrl(request: Request, uid: unknown) {
  if (typeof uid !== "string" || !uid) return null;
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}/u/${uid}`;
}

function signingSecret(clientSecretHash: string) {
  const serviceSecret =
    process.env.FWD_OAUTH_SECRET_PEPPER?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceSecret) throw new Error("missing_signing_secret");
  return `${serviceSecret}:${clientSecretHash}`;
}

function signToken(profile: FwdSafeProfile, clientId: string, clientSecretHash: string) {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      aud: "fwd.treytv.com",
      avatar_url: profile.avatar_url,
      client_id: clientId,
      display_name: profile.display_name,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_SECONDS,
      iat: Math.floor(Date.now() / 1000),
      iss: "trey-tv",
      jti: randomBytes(16).toString("base64url"),
      sub: profile.trey_tv_uid,
      profile_url: profile.profile_url,
      trey_tv_uid: profile.trey_tv_uid,
    }),
  );
  const input = `${header}.${payload}`;
  const signature = createHmac("sha256", signingSecret(clientSecretHash))
    .update(input)
    .digest("base64url");
  return `${input}.${signature}`;
}

function verifySignedToken(
  token: string,
  clientSecretHash: string,
): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  const expected = createHmac("sha256", signingSecret(clientSecretHash))
    .update(`${header}.${payload}`)
    .digest("base64url");
  const supplied = Buffer.from(signature);
  const stored = Buffer.from(expected);
  if (supplied.length !== stored.length || !timingSafeEqual(supplied, stored)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Record<
      string,
      unknown
    >;
    const exp = typeof decoded.exp === "number" ? decoded.exp : 0;
    if (exp <= Math.floor(Date.now() / 1000)) return null;
    return decoded;
  } catch {
    return null;
  }
}

async function readPayload(request: Request): Promise<Payload> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return Object.fromEntries(
      Object.entries(body ?? {}).map(([key, value]) => [key, String(value ?? "")]),
    );
  }

  const text = await request.text();
  return Object.fromEntries(new URLSearchParams(text));
}

async function exchangeAuthorizationCode(request: Request) {
  if (request.method === "OPTIONS") return oauthJson({});
  if (request.method !== "POST")
    return oauthError("invalid_request", "Use POST for the token endpoint.", 405);

  try {
    const payload = await readPayload(request);
    const grantType = payload.grant_type ?? "";
    const code = cleanText(payload.code, 300);
    const redirectUri = cleanText(payload.redirect_uri, 900);
    const clientId = cleanText(payload.client_id, 160);
    const clientSecret = payload.client_secret ?? "";

    if (grantType !== "authorization_code") {
      return oauthError("unsupported_grant_type", "Only authorization_code is supported.");
    }
    if (!code || !redirectUri || !clientId || !clientSecret) {
      return oauthError(
        "invalid_request",
        "code, redirect_uri, client_id, and client_secret are required.",
      );
    }

    const client = await getActiveFwdClient(clientId);
    if (!client) return oauthError("invalid_client", "Unknown or inactive client_id.", 401);
    if (!verifySecret(clientSecret, client.client_secret_hash)) {
      safeLog("invalid_client_secret", { client_id: clientId });
      return oauthError("invalid_client", "Invalid client credentials.", 401);
    }
    if (!isAllowedRedirect(client, redirectUri)) {
      return oauthError("invalid_grant", "redirect_uri is not registered for FWD.");
    }

    const service = getTreyIServiceClient();
    const { data: codeRow, error } = await service
      .from("fwd_oauth_codes")
      .select(
        "id, code, client_id, redirect_uri, trey_tv_user_id, trey_tv_uid, display_name, avatar_url, profile_url, scope, expires_at, used_at",
      )
      .eq("code", code)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!codeRow || codeRow.client_id !== client.client_id)
      return oauthError("invalid_grant", "Invalid authorization code.");
    if (codeRow.redirect_uri !== redirectUri)
      return oauthError("invalid_grant", "redirect_uri does not match the authorization code.");
    if (codeRow.used_at)
      return oauthError("invalid_grant", "Authorization code has already been used.");
    if (isPast(codeRow.expires_at))
      return oauthError("invalid_grant", "Authorization code has expired.");
    if (!isAllowedScope(client, codeRow.scope))
      return oauthError("invalid_grant", "Authorization code scope is not allowed.");

    const now = new Date().toISOString();
    const { data: usedRows, error: usedError } = await service
      .from("fwd_oauth_codes")
      .update({ used_at: now })
      .eq("id", codeRow.id)
      .is("used_at", null)
      .select("id");

    if (usedError) throw new Error(usedError.message);
    if (!usedRows?.length)
      return oauthError("invalid_grant", "Authorization code has already been used.");

    const profile: FwdSafeProfile = {
      avatar_url: codeRow.avatar_url ?? null,
      display_name: codeRow.display_name ?? null,
      profile_url: codeRow.profile_url ?? getPublicProfileUrl(codeRow.trey_tv_uid),
      trey_tv_uid: codeRow.trey_tv_uid ?? null,
      trey_tv_user_id: codeRow.trey_tv_user_id,
    };
    const accessToken = signToken(profile, client.client_id, client.client_secret_hash);

    safeLog("authorization_code_exchanged", {
      client_id: client.client_id,
      redirect_uri: redirectUri,
      trey_tv_uid: profile.trey_tv_uid,
    });

    return oauthJson({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_SECONDS,
      user: {
        trey_tv_uid: profile.trey_tv_uid,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        profile_url: profile.profile_url ?? publicProfileUrl(request, profile.trey_tv_uid),
      },
    });
  } catch (error) {
    console.error("[fwd-oauth] token_error", error);
    return oauthError("server_error", "The token request could not be completed.", 500);
  }
}

async function handleUserInfo(request: Request) {
  if (request.method === "OPTIONS") return oauthJson({});
  if (request.method !== "GET" && request.method !== "POST") {
    return oauthError("invalid_request", "Use GET or POST for userinfo.", 405);
  }

  try {
    const bearer = (request.headers.get("authorization") ?? "")
      .match(/^Bearer\s+(.+)$/i)?.[1]
      ?.trim();
    if (!bearer) return oauthError("invalid_request", "Bearer access token is required.", 401);

    const unsignedPayload = bearer.split(".")[1];
    if (!unsignedPayload)
      return oauthError("invalid_token", "Access token is invalid or expired.", 401);

    const decoded = JSON.parse(
      Buffer.from(unsignedPayload, "base64url").toString("utf8"),
    ) as Record<string, unknown>;
    const clientId = typeof decoded.client_id === "string" ? decoded.client_id : "";
    const client = await getActiveFwdClient(clientId);
    if (!client) return oauthError("invalid_token", "Access token is invalid or expired.", 401);

    const verified = verifySignedToken(bearer, client.client_secret_hash);
    if (!verified) return oauthError("invalid_token", "Access token is invalid or expired.", 401);

    return oauthJson({
      sub: verified.trey_tv_uid ?? null,
      provider: "trey_tv",
      trey_tv_uid: verified.trey_tv_uid ?? null,
      name: verified.display_name ?? null,
      picture: verified.avatar_url ?? null,
      profile_url: verified.profile_url ?? publicProfileUrl(request, verified.trey_tv_uid),
    });
  } catch {
    return oauthError("invalid_token", "Access token is invalid or expired.", 401);
  }
}

export function handleFwdOAuthRequest(request: Request): Promise<Response> | Response | null {
  const url = new URL(request.url);
  if (url.pathname === "/api/fwd/oauth/token") return exchangeAuthorizationCode(request);
  if (url.pathname === "/api/fwd/oauth/userinfo") return handleUserInfo(request);
  return null;
}
