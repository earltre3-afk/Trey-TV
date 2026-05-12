import { createServerFn } from "@tanstack/react-start";
import { createHash, randomBytes } from "node:crypto";
import { getTreyIServiceClient, verifyTreyIUser } from "@/lib/trey-i/onboarding.server";

export const OAUTH_SCOPES = [
  "profile:read",
  "email:read",
  "creator:read",
  "verification:read",
  "public_uid:read",
] as const;

export type OAuthScope = (typeof OAUTH_SCOPES)[number];

const APP_TYPES = ["web_app", "mobile_app", "creator_tool", "internal_tool", "other"] as const;
const STATUSES = ["draft", "active", "suspended", "revoked"] as const;

type AuthInput = { accessToken: string };
type AppInput = AuthInput & {
  appName: string;
  appDescription?: string;
  websiteUrl?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
  redirectUri: string;
  appType: string;
  scopes: string[];
};
type UpdateAppInput = AppInput & { appId: string; status?: string };
type AppIdInput = AuthInput & { appId: string };
type ApiKeyInput = AuthInput & { appId?: string | null; label: string; scopes: string[]; mode: "live" | "test" };
type ApiKeyIdInput = AuthInput & { keyId: string };
type ConsentInput = AuthInput & {
  clientId: string;
  redirectUri: string;
  scope: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
};

const cleanText = (value: unknown, max = 500) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const cleanUrl = (value: unknown, max = 800) => cleanText(value, max);
const cleanId = (value: unknown) => cleanText(value, 120);

function hashSecret(value: string) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function token(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

function generateClientId() {
  return `treytv_client_${token(18)}`;
}

function generateClientSecret() {
  return `treytv_secret_${token(32)}`;
}

function generateAuthorizationCode() {
  return `treytv_code_${token(32)}`;
}

function generateApiKey(mode: "live" | "test") {
  return `treytv_${mode}_${token(32)}`;
}

function normalizeScopes(scopes: unknown): OAuthScope[] {
  const list = Array.isArray(scopes)
    ? scopes
    : cleanText(scopes, 300).split(/[,\s]+/);
  return Array.from(new Set(list.filter((s): s is OAuthScope => OAUTH_SCOPES.includes(s as OAuthScope))));
}

function normalizeRedirectUris(primary: string, extra: unknown[] = []) {
  return Array.from(new Set([primary, ...extra].map((uri) => cleanUrl(uri)).filter(Boolean)));
}

function validateAuthInput(input: AuthInput): AuthInput {
  return { accessToken: typeof input?.accessToken === "string" ? input.accessToken : "" };
}

function validateAppInput(input: AppInput): AppInput {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    appName: cleanText(input?.appName, 80),
    appDescription: cleanText(input?.appDescription, 300),
    websiteUrl: cleanUrl(input?.websiteUrl),
    privacyPolicyUrl: cleanUrl(input?.privacyPolicyUrl),
    termsUrl: cleanUrl(input?.termsUrl),
    redirectUri: cleanUrl(input?.redirectUri),
    appType: APP_TYPES.includes(input?.appType as any) ? input.appType : "web_app",
    scopes: normalizeScopes(input?.scopes),
  };
}

function validateUpdateAppInput(input: UpdateAppInput): UpdateAppInput {
  const base = validateAppInput(input);
  return {
    ...base,
    appId: cleanId(input?.appId),
    status: STATUSES.includes(input?.status as any) ? input.status : undefined,
  };
}

const validateAppIdInput = (input: AppIdInput): AppIdInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  appId: cleanId(input?.appId),
});

const validateApiKeyInput = (input: ApiKeyInput): ApiKeyInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  appId: input?.appId ? cleanId(input.appId) : null,
  label: cleanText(input?.label, 80),
  scopes: normalizeScopes(input?.scopes),
  mode: input?.mode === "test" ? "test" : "live",
});

const validateApiKeyIdInput = (input: ApiKeyIdInput): ApiKeyIdInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  keyId: cleanId(input?.keyId),
});

const validateConsentInput = (input: ConsentInput): ConsentInput => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  clientId: cleanId(input?.clientId),
  redirectUri: cleanUrl(input?.redirectUri),
  scope: cleanText(input?.scope, 400),
  state: cleanText(input?.state, 500),
  codeChallenge: cleanText(input?.codeChallenge, 256),
  codeChallengeMethod: cleanText(input?.codeChallengeMethod, 20),
});

async function getOwnedApp(service: any, appId: string, userId: string) {
  const { data, error } = await service
    .from("developer_apps")
    .select("*")
    .eq("id", appId)
    .eq("owner_user_id", userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Developer app not found");
  return data;
}

async function auditDeveloperEvent(
  service: any,
  eventType: string,
  options: { appId?: string | null; actorUserId?: string | null; metadata?: Record<string, unknown> } = {},
) {
  await service.from("developer_app_audit_events").insert({
    app_id: options.appId ?? null,
    actor_user_id: options.actorUserId ?? null,
    event_type: eventType,
    metadata: options.metadata ?? {},
  });
}

async function validateOAuthRequest(service: any, data: { clientId: string; redirectUri: string; scope: string }) {
  const { data: app, error } = await service
    .from("developer_apps")
    .select("id, app_name, website_url, privacy_policy_url, terms_url, redirect_uris, allowed_scopes, status")
    .eq("client_id", data.clientId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!app) throw new Error("Unknown Trey TV client_id");
  if (!["draft", "active"].includes(app.status)) throw new Error("This Trey TV app is not active");

  const redirectUris = Array.isArray(app.redirect_uris) ? app.redirect_uris : [];
  if (!redirectUris.includes(data.redirectUri)) throw new Error("redirect_uri is not registered for this app");

  const requestedScopes = normalizeScopes(data.scope);
  const allowedScopes = normalizeScopes(app.allowed_scopes);
  const rejectedScopes = requestedScopes.filter((scope) => !allowedScopes.includes(scope));
  if (rejectedScopes.length) throw new Error(`Scope not allowed: ${rejectedScopes.join(", ")}`);

  return { app, requestedScopes };
}

export const listDeveloperDashboard = createServerFn({ method: "POST" })
  .inputValidator(validateAuthInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();

    const [{ data: apps, error: appsError }, { data: apiKeys, error: keysError }] = await Promise.all([
      service.from("developer_apps").select("*").eq("owner_user_id", user.id).order("created_at", { ascending: false }),
      service.from("api_keys").select("id, app_id, key_prefix, label, scopes, status, last_used_at, created_at, revoked_at").eq("owner_user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (appsError) throw new Error(appsError.message);
    if (keysError) throw new Error(keysError.message);

    return { apps: apps ?? [], apiKeys: apiKeys ?? [] };
  });

export const listAdminDeveloperApps = createServerFn({ method: "POST" })
  .inputValidator(validateAuthInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    const { data: admin } = await service.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
    if (!admin) throw new Error("Admin access required");

    const { data: apps, error } = await service
      .from("developer_apps")
      .select("*, profiles!developer_apps_owner_user_id_fkey(display_name, username, email)")
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = await service.from("developer_apps").select("*").order("created_at", { ascending: false });
      if (fallback.error) throw new Error(fallback.error.message);
      return { apps: fallback.data ?? [] };
    }

    return { apps: apps ?? [] };
  });

export const createDeveloperApp = createServerFn({ method: "POST" })
  .inputValidator(validateAppInput)
  .handler(async ({ data }) => {
    if (!data.appName) throw new Error("App name is required");
    if (!data.redirectUri) throw new Error("Redirect URI is required");
    if (!data.scopes.length) throw new Error("Select at least one scope");

    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    const clientId = generateClientId();
    const clientSecret = generateClientSecret();
    const now = new Date().toISOString();

    const { data: app, error } = await service
      .from("developer_apps")
      .insert({
        owner_user_id: user.id,
        app_name: data.appName,
        app_description: data.appDescription,
        website_url: data.websiteUrl,
        privacy_policy_url: data.privacyPolicyUrl,
        terms_url: data.termsUrl,
        client_id: clientId,
        client_secret_hash: hashSecret(clientSecret),
        redirect_uris: normalizeRedirectUris(data.redirectUri),
        allowed_scopes: data.scopes,
        app_type: data.appType,
        status: "draft",
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    await auditDeveloperEvent(service, "app_created", { appId: app.id, actorUserId: user.id });
    return { app, clientSecret };
  });

export const updateDeveloperApp = createServerFn({ method: "POST" })
  .inputValidator(validateUpdateAppInput)
  .handler(async ({ data }) => {
    if (!data.appId) throw new Error("App ID is required");
    if (!data.appName) throw new Error("App name is required");
    if (!data.redirectUri) throw new Error("Redirect URI is required");

    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    await getOwnedApp(service, data.appId, user.id);

    const { data: app, error } = await service
      .from("developer_apps")
      .update({
        app_name: data.appName,
        app_description: data.appDescription,
        website_url: data.websiteUrl,
        privacy_policy_url: data.privacyPolicyUrl,
        terms_url: data.termsUrl,
        redirect_uris: normalizeRedirectUris(data.redirectUri),
        allowed_scopes: data.scopes,
        app_type: data.appType,
        status: data.status ?? "draft",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.appId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return { app };
  });

export const rotateDeveloperSecret = createServerFn({ method: "POST" })
  .inputValidator(validateAppIdInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    await getOwnedApp(service, data.appId, user.id);

    const clientSecret = generateClientSecret();
    const { error } = await service
      .from("developer_apps")
      .update({ client_secret_hash: hashSecret(clientSecret), updated_at: new Date().toISOString() })
      .eq("id", data.appId);
    if (error) throw new Error(error.message);
    await auditDeveloperEvent(service, "secret_rotated", { appId: data.appId, actorUserId: user.id });
    return { clientSecret };
  });

export const revokeDeveloperApp = createServerFn({ method: "POST" })
  .inputValidator(validateAppIdInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    await getOwnedApp(service, data.appId, user.id);

    const now = new Date().toISOString();
    const { error } = await service
      .from("developer_apps")
      .update({ status: "revoked", revoked_at: now, updated_at: now })
      .eq("id", data.appId);
    if (error) throw new Error(error.message);
    await auditDeveloperEvent(service, "app_revoked", { appId: data.appId, actorUserId: user.id });
    await service.from("developer_app_tokens").update({ revoked_at: now }).eq("app_id", data.appId).is("revoked_at", null);
    return { ok: true };
  });

export const createApiKey = createServerFn({ method: "POST" })
  .inputValidator(validateApiKeyInput)
  .handler(async ({ data }) => {
    if (!data.label) throw new Error("API key label is required");
    if (!data.scopes.length) throw new Error("Select at least one scope");

    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    if (data.appId) await getOwnedApp(service, data.appId, user.id);

    const apiKey = generateApiKey(data.mode);
    const keyPrefix = apiKey.split("_").slice(0, 3).join("_") + "_";
    const { data: key, error } = await service
      .from("api_keys")
      .insert({
        owner_user_id: user.id,
        app_id: data.appId,
        key_hash: hashSecret(apiKey),
        key_prefix: keyPrefix,
        label: data.label,
        scopes: data.scopes,
        status: "active",
      })
      .select("id, app_id, key_prefix, label, scopes, status, last_used_at, created_at, revoked_at")
      .single();
    if (error) throw new Error(error.message);
    await auditDeveloperEvent(service, "api_key_created", { appId: data.appId, actorUserId: user.id, metadata: { label: data.label, mode: data.mode } });
    return { key, apiKey };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .inputValidator(validateApiKeyIdInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    const now = new Date().toISOString();
    const { error } = await service
      .from("api_keys")
      .update({ status: "revoked", revoked_at: now })
      .eq("id", data.keyId)
      .eq("owner_user_id", user.id);
    if (error) throw new Error(error.message);
    await auditDeveloperEvent(service, "api_key_revoked", { actorUserId: user.id, metadata: { key_id: data.keyId } });
    return { ok: true };
  });

export const listConnectedApps = createServerFn({ method: "POST" })
  .inputValidator(validateAuthInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    const { data: consents, error } = await service
      .from("oauth_consents")
      .select("id, scopes, granted_at, revoked_at, developer_apps(id, app_name, website_url)")
      .eq("user_id", user.id)
      .order("granted_at", { ascending: false });
    if (error) throw new Error(error.message);

    const activeConsents = (consents ?? []).filter((consent: any) => !consent.revoked_at);
    const appIds = activeConsents
      .map((consent: any) => consent.developer_apps?.id)
      .filter(Boolean);
    const lastUsedByApp = new Map<string, string | null>();

    if (appIds.length) {
      const { data: tokens } = await service
        .from("developer_app_tokens")
        .select("app_id, last_used_at, created_at")
        .eq("user_id", user.id)
        .in("app_id", appIds)
        .order("last_used_at", { ascending: false, nullsFirst: false });

      for (const row of tokens ?? []) {
        if (!lastUsedByApp.has(row.app_id)) lastUsedByApp.set(row.app_id, row.last_used_at ?? row.created_at ?? null);
      }
    }

    return {
      consents: (consents ?? []).map((consent: any) => ({
        ...consent,
        last_used_at: lastUsedByApp.get(consent.developer_apps?.id) ?? null,
      })),
    };
  });

export const revokeConnectedApp = createServerFn({ method: "POST" })
  .inputValidator((input: AuthInput & { consentId: string }) => ({
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    consentId: cleanId(input?.consentId),
  }))
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    const now = new Date().toISOString();
    const { error } = await service
      .from("oauth_consents")
      .update({ revoked_at: now })
      .eq("id", data.consentId)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    await auditDeveloperEvent(service, "consent_revoked", { actorUserId: user.id, metadata: { consent_id: data.consentId } });
    return { ok: true };
  });

export const validateOAuthAuthorizeRequest = createServerFn({ method: "POST" })
  .inputValidator((input: { clientId: string; redirectUri: string; scope: string }) => ({
    clientId: cleanId(input?.clientId),
    redirectUri: cleanUrl(input?.redirectUri),
    scope: cleanText(input?.scope, 400),
  }))
  .handler(async ({ data }) => {
    const service = getTreyIServiceClient();
    return validateOAuthRequest(service, data);
  });

export const approveOAuthAuthorization = createServerFn({ method: "POST" })
  .inputValidator(validateConsentInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const service = getTreyIServiceClient();
    const { app, requestedScopes } = await validateOAuthRequest(service, data);
    const code = generateAuthorizationCode();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString();

    const { error: codeError } = await service.from("oauth_authorization_codes").insert({
      app_id: app.id,
      user_id: user.id,
      code_hash: hashSecret(code),
      redirect_uri: data.redirectUri,
      scopes: requestedScopes,
      code_challenge: data.codeChallenge || null,
      code_challenge_method: data.codeChallengeMethod || null,
      expires_at: expiresAt,
    });
    if (codeError) throw new Error(codeError.message);

    await service.from("oauth_consents").upsert(
      {
        app_id: app.id,
        user_id: user.id,
        scopes: requestedScopes,
        granted_at: now.toISOString(),
        revoked_at: null,
      },
      { onConflict: "app_id,user_id" },
    );

    await auditDeveloperEvent(service, "oauth_authorized", {
      appId: app.id,
      actorUserId: user.id,
      metadata: { scopes: requestedScopes, redirect_uri: data.redirectUri },
    });

    return { code };
  });
