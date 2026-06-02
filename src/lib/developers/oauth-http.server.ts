import { createHash, randomBytes } from "node:crypto";
import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";

const ACCESS_TOKEN_SECONDS = 60 * 60;
const REFRESH_TOKEN_SECONDS = 60 * 60 * 24 * 30;
const TOKEN_PREFIX = "treytv_access_";
const REFRESH_PREFIX = "treytv_refresh_";

const OAUTH_SCOPES = [
  "profile:read",
  "email:read",
  "creator:read",
  "verification:read",
  "public_uid:read",
] as const;

type OAuthScope = (typeof OAUTH_SCOPES)[number];

type TokenPayload = Record<string, string>;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      pragma: "no-cache",
    },
  });
}

function oauthError(error: string, description: string, status = 400) {
  return json({ error, error_description: description }, status);
}

function hashSecret(value: string) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function token(prefix: string) {
  return `${prefix}${randomBytes(32).toString("base64url")}`;
}

function normalizeScopes(scopes: unknown): OAuthScope[] {
  const list = Array.isArray(scopes)
    ? scopes
    : String(scopes ?? "")
        .trim()
        .split(/[,\s]+/);
  return Array.from(
    new Set(
      list.filter((scope): scope is OAuthScope => OAUTH_SCOPES.includes(scope as OAuthScope)),
    ),
  );
}

function safeOrigin(request: Request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function plusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function isPast(iso: string | null | undefined) {
  return !iso || new Date(iso).getTime() <= Date.now();
}

async function readPayload(request: Request): Promise<TokenPayload> {
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

function readBasicClient(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  if (!authorization.toLowerCase().startsWith("basic ")) return {};

  try {
    const decoded = globalThis.atob(authorization.slice(6));
    const separator = decoded.indexOf(":");
    if (separator === -1) return {};
    return {
      client_id: decodeURIComponent(decoded.slice(0, separator)),
      client_secret: decodeURIComponent(decoded.slice(separator + 1)),
    };
  } catch {
    return {};
  }
}

function pkceS256(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

async function audit(
  service: any,
  eventType: string,
  appId: string | null,
  actorUserId: string | null,
  metadata: Record<string, unknown> = {},
) {
  await service.from("developer_app_audit_events").insert({
    app_id: appId,
    actor_user_id: actorUserId,
    event_type: eventType,
    metadata,
  });
}

async function getActiveApp(service: any, clientId: string) {
  const { data: app, error } = await service
    .from("developer_apps")
    .select("id, app_name, client_id, client_secret_hash, redirect_uris, allowed_scopes, status")
    .eq("client_id", clientId)
    .maybeSingle();

  if (error) throw new Error("app_lookup_failed");
  if (!app) return { error: oauthError("invalid_client", "Unknown client_id.", 401) };
  if (app.status !== "active")
    return { error: oauthError("unauthorized_client", "Developer app is not active.", 401) };
  return { app };
}

function validateClientSecret(app: any, clientSecret: string | undefined) {
  if (!clientSecret) return true;
  return hashSecret(clientSecret) === app.client_secret_hash;
}

function validateScopes(app: any, scopes: string[]) {
  const allowed = normalizeScopes(app.allowed_scopes);
  return scopes.every((scope) => allowed.includes(scope as OAuthScope));
}

async function issueTokenPair(service: any, appId: string, userId: string, scopes: string[]) {
  const accessToken = token(TOKEN_PREFIX);
  const refreshToken = token(REFRESH_PREFIX);
  const accessExpiresAt = plusSeconds(ACCESS_TOKEN_SECONDS);
  const refreshExpiresAt = plusSeconds(REFRESH_TOKEN_SECONDS);

  const { data: tokenRow, error } = await service
    .from("developer_app_tokens")
    .insert({
      app_id: appId,
      user_id: userId,
      access_token_hash: hashSecret(accessToken),
      refresh_token_hash: hashSecret(refreshToken),
      scopes,
      expires_at: accessExpiresAt,
      refresh_token_expires_at: refreshExpiresAt,
    })
    .select("id")
    .single();

  if (error) throw new Error("token_insert_failed");
  await audit(service, "token_issued", appId, userId, { token_id: tokenRow.id, scopes });

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_SECONDS,
    scope: scopes.join(" "),
  };
}

async function exchangeAuthorizationCode(request: Request, payload: TokenPayload) {
  const service = getTreyIServiceClient();
  const basic = readBasicClient(request);
  const clientId = payload.client_id || basic.client_id || "";
  const clientSecret = payload.client_secret || basic.client_secret;
  const code = payload.code || "";
  const redirectUri = payload.redirect_uri || "";
  const codeVerifier = payload.code_verifier || "";

  if (!clientId || !code || !redirectUri || !codeVerifier) {
    return oauthError(
      "invalid_request",
      "grant_type, code, client_id, redirect_uri, and code_verifier are required.",
    );
  }

  const { app, error: appError } = await getActiveApp(service, clientId);
  if (appError) return appError;
  if (!validateClientSecret(app, clientSecret))
    return oauthError("invalid_client", "Invalid client credentials.", 401);

  const { data: codeRow, error: codeError } = await service
    .from("oauth_authorization_codes")
    .select(
      "id, app_id, user_id, code_hash, redirect_uri, scopes, code_challenge, code_challenge_method, expires_at, used_at",
    )
    .eq("code_hash", hashSecret(code))
    .maybeSingle();

  if (codeError) throw new Error("code_lookup_failed");
  if (!codeRow || codeRow.app_id !== app.id)
    return oauthError("invalid_grant", "Invalid authorization code.");
  if (codeRow.redirect_uri !== redirectUri)
    return oauthError("invalid_grant", "redirect_uri does not match the authorization code.");
  if (codeRow.used_at)
    return oauthError("invalid_grant", "Authorization code has already been used.");
  if (isPast(codeRow.expires_at))
    return oauthError("invalid_grant", "Authorization code has expired.");
  if (!codeRow.code_challenge)
    return oauthError("invalid_grant", "Authorization code is missing PKCE.");
  if ((codeRow.code_challenge_method ?? "S256") !== "S256")
    return oauthError("invalid_grant", "Unsupported PKCE method.");
  if (pkceS256(codeVerifier) !== codeRow.code_challenge)
    return oauthError("invalid_grant", "Invalid PKCE verifier.");

  const scopes = normalizeScopes(codeRow.scopes);
  if (!validateScopes(app, scopes))
    return oauthError(
      "invalid_grant",
      "Authorization code contains scopes not allowed by this app.",
    );

  const now = new Date().toISOString();
  const { data: usedRows, error: usedError } = await service
    .from("oauth_authorization_codes")
    .update({ used_at: now })
    .eq("id", codeRow.id)
    .is("used_at", null)
    .select("id");

  if (usedError) throw new Error("code_mark_failed");
  if (!usedRows?.length)
    return oauthError("invalid_grant", "Authorization code has already been used.");

  return json(await issueTokenPair(service, app.id, codeRow.user_id, scopes));
}

async function refreshAccessToken(request: Request, payload: TokenPayload) {
  const service = getTreyIServiceClient();
  const basic = readBasicClient(request);
  const clientId = payload.client_id || basic.client_id || "";
  const clientSecret = payload.client_secret || basic.client_secret;
  const refreshToken = payload.refresh_token || "";

  if (!clientId || !refreshToken)
    return oauthError("invalid_request", "client_id and refresh_token are required.");

  const { app, error: appError } = await getActiveApp(service, clientId);
  if (appError) return appError;
  if (!validateClientSecret(app, clientSecret))
    return oauthError("invalid_client", "Invalid client credentials.", 401);

  const { data: existing, error } = await service
    .from("developer_app_tokens")
    .select("id, app_id, user_id, scopes, revoked_at, refresh_token_expires_at")
    .eq("refresh_token_hash", hashSecret(refreshToken))
    .maybeSingle();

  if (error) throw new Error("refresh_lookup_failed");
  if (!existing || existing.app_id !== app.id)
    return oauthError("invalid_grant", "Invalid refresh token.");
  if (existing.revoked_at) return oauthError("invalid_grant", "Refresh token has been revoked.");
  if (isPast(existing.refresh_token_expires_at))
    return oauthError("invalid_grant", "Refresh token has expired.");

  const now = new Date().toISOString();
  const { data: revokedRows, error: revokeError } = await service
    .from("developer_app_tokens")
    .update({ revoked_at: now, last_used_at: now })
    .eq("id", existing.id)
    .is("revoked_at", null)
    .select("id");

  if (revokeError) throw new Error("refresh_rotate_failed");
  if (!revokedRows?.length)
    return oauthError("invalid_grant", "Refresh token has already been used.");

  await audit(service, "token_revoked", app.id, existing.user_id, {
    token_id: existing.id,
    reason: "refresh_rotated",
  });
  return json(
    await issueTokenPair(service, app.id, existing.user_id, normalizeScopes(existing.scopes)),
  );
}

export async function handleOAuthToken(request: Request) {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST")
    return oauthError("invalid_request", "Use POST for the token endpoint.", 405);

  try {
    const payload = await readPayload(request);
    if (payload.grant_type === "authorization_code")
      return await exchangeAuthorizationCode(request, payload);
    if (payload.grant_type === "refresh_token") return await refreshAccessToken(request, payload);
    return oauthError(
      "unsupported_grant_type",
      "Only authorization_code and refresh_token are supported.",
    );
  } catch {
    return oauthError("server_error", "The token request could not be completed.", 500);
  }
}

export async function handleOAuthUserInfo(request: Request) {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "GET" && request.method !== "POST")
    return oauthError("invalid_request", "Use GET or POST for userinfo.", 405);

  try {
    const auth = request.headers.get("authorization") ?? "";
    const bearer = auth.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (!bearer) return oauthError("invalid_request", "Bearer access token is required.", 401);

    const service = getTreyIServiceClient();
    const { data: tokenRow, error } = await service
      .from("developer_app_tokens")
      .select("id, app_id, user_id, scopes, expires_at, revoked_at, developer_apps(id, status)")
      .eq("access_token_hash", hashSecret(bearer))
      .maybeSingle();

    if (error) throw new Error("token_lookup_failed");
    if (!tokenRow || tokenRow.revoked_at || isPast(tokenRow.expires_at))
      return oauthError("invalid_token", "Access token is invalid or expired.", 401);
    const tokenApp = Array.isArray(tokenRow.developer_apps)
      ? tokenRow.developer_apps[0]
      : tokenRow.developer_apps;
    if (tokenApp?.status !== "active")
      return oauthError("invalid_token", "Developer app is not active.", 401);

    const now = new Date().toISOString();
    await service.from("developer_app_tokens").update({ last_used_at: now }).eq("id", tokenRow.id);

    const scopes = normalizeScopes(tokenRow.scopes);
    const response: Record<string, unknown> = { sub: tokenRow.user_id };

    const { data: profile } = await service
      .from("profiles")
      .select(
        "public_profile_uid, display_name, username, avatar_url, email, creator_status, gold_verified, verification_type, verification_category",
      )
      .eq("id", tokenRow.user_id)
      .maybeSingle();

    if (scopes.includes("profile:read")) {
      response.public_profile_uid = profile?.public_profile_uid ?? null;
      response.display_name = profile?.display_name ?? null;
      response.username = profile?.username ?? null;
      response.avatar_url = profile?.avatar_url ?? null;
      response.profile_url = profile?.public_profile_uid
        ? `${safeOrigin(request)}/u/${profile.public_profile_uid}`
        : null;
    } else if (scopes.includes("public_uid:read")) {
      response.public_profile_uid = profile?.public_profile_uid ?? null;
      response.profile_url = profile?.public_profile_uid
        ? `${safeOrigin(request)}/u/${profile.public_profile_uid}`
        : null;
    }

    if (scopes.includes("email:read")) {
      const { data: authUser } = await service.auth.admin.getUserById(tokenRow.user_id);
      response.email = profile?.email ?? authUser?.user?.email ?? null;
    }

    if (scopes.includes("creator:read")) {
      response.is_creator = profile?.creator_status === "approved";
      response.creator_status = profile?.creator_status ?? "not_applied";

      const { data: authUser } = await service.auth.admin.getUserById(tokenRow.user_id);
      if (authUser?.user?.email) {
        const { data: channel } = await service
          .from("creator_channels")
          .select("id")
          .eq("owner_email", authUser.user.email.toLowerCase())
          .maybeSingle();
        if (channel?.id) response.creator_channel_id = channel.id;
      }
    }

    if (scopes.includes("verification:read")) {
      response.is_gold_verified = Boolean(profile?.gold_verified);
      response.verification_type =
        profile?.verification_type ?? profile?.verification_category ?? null;
    }

    return json(response);
  } catch {
    return oauthError("server_error", "The userinfo request could not be completed.", 500);
  }
}

export async function handleOAuthRevoke(request: Request) {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST")
    return oauthError("invalid_request", "Use POST for the revocation endpoint.", 405);

  try {
    const payload = await readPayload(request);
    const rawToken = payload.token || "";
    if (!rawToken) return json({ ok: true });

    const service = getTreyIServiceClient();
    const tokenHash = hashSecret(rawToken);
    const now = new Date().toISOString();

    const { data: rows } = await service
      .from("developer_app_tokens")
      .update({ revoked_at: now, last_used_at: now })
      .or(`access_token_hash.eq.${tokenHash},refresh_token_hash.eq.${tokenHash}`)
      .is("revoked_at", null)
      .select("id, app_id, user_id");

    for (const row of rows ?? []) {
      await audit(service, "token_revoked", row.app_id, row.user_id, {
        token_id: row.id,
        reason: "revocation_endpoint",
      });
    }

    return json({ ok: true });
  } catch {
    return json({ ok: true });
  }
}

export function handleOpenIdConfiguration(request: Request) {
  const origin = safeOrigin(request);
  return json({
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    userinfo_endpoint: `${origin}/oauth/userinfo`,
    revocation_endpoint: `${origin}/oauth/revoke`,
    jwks_uri: `${origin}/oauth/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    scopes_supported: OAUTH_SCOPES,
    token_endpoint_auth_methods_supported: ["none", "client_secret_post", "client_secret_basic"],
    code_challenge_methods_supported: ["S256"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: [],
  });
}

export function handleJwks() {
  return json({
    keys: [],
    id_token_signing: "pending",
  });
}
