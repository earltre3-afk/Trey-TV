import { c as createServerRpc, a as createServerFn, v as verifyTreyIUser, g as getTreyIServiceClient } from "./index.mjs";
import { createHash, randomBytes } from "node:crypto";
import "../_libs/react.mjs";
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
const OAUTH_SCOPES = ["profile:read", "email:read", "creator:read", "verification:read", "public_uid:read"];
const APP_TYPES = ["web_app", "mobile_app", "creator_tool", "internal_tool", "other"];
const STATUSES = ["draft", "active", "suspended", "revoked"];
const cleanText = (value, max = 500) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const cleanUrl = (value, max = 800) => cleanText(value, max);
const cleanId = (value) => cleanText(value, 120);
function hashSecret(value) {
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
function generateApiKey(mode) {
  return `treytv_${mode}_${token(32)}`;
}
function normalizeScopes(scopes) {
  const list = Array.isArray(scopes) ? scopes : cleanText(scopes, 300).split(/[,\s]+/);
  return Array.from(new Set(list.filter((s) => OAUTH_SCOPES.includes(s))));
}
function normalizeRedirectUris(primary, extra = []) {
  return Array.from(new Set([primary, ...extra].map((uri) => cleanUrl(uri)).filter(Boolean)));
}
function validateAuthInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : ""
  };
}
function validateAppInput(input) {
  return {
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    appName: cleanText(input?.appName, 80),
    appDescription: cleanText(input?.appDescription, 300),
    websiteUrl: cleanUrl(input?.websiteUrl),
    privacyPolicyUrl: cleanUrl(input?.privacyPolicyUrl),
    termsUrl: cleanUrl(input?.termsUrl),
    redirectUri: cleanUrl(input?.redirectUri),
    appType: APP_TYPES.includes(input?.appType) ? input.appType : "web_app",
    scopes: normalizeScopes(input?.scopes)
  };
}
function validateUpdateAppInput(input) {
  const base = validateAppInput(input);
  return {
    ...base,
    appId: cleanId(input?.appId),
    status: STATUSES.includes(input?.status) ? input.status : void 0
  };
}
const validateAppIdInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  appId: cleanId(input?.appId)
});
const validateApiKeyInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  appId: input?.appId ? cleanId(input.appId) : null,
  label: cleanText(input?.label, 80),
  scopes: normalizeScopes(input?.scopes),
  mode: input?.mode === "test" ? "test" : "live"
});
const validateApiKeyIdInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  keyId: cleanId(input?.keyId)
});
const validateConsentInput = (input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  clientId: cleanId(input?.clientId),
  redirectUri: cleanUrl(input?.redirectUri),
  scope: cleanText(input?.scope, 400),
  state: cleanText(input?.state, 500),
  codeChallenge: cleanText(input?.codeChallenge, 256),
  codeChallengeMethod: cleanText(input?.codeChallengeMethod, 20)
});
async function getOwnedApp(service, appId, userId) {
  const {
    data,
    error
  } = await service.from("developer_apps").select("*").eq("id", appId).eq("owner_user_id", userId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Developer app not found");
  return data;
}
async function auditDeveloperEvent(service, eventType, options = {}) {
  await service.from("developer_app_audit_events").insert({
    app_id: options.appId ?? null,
    actor_user_id: options.actorUserId ?? null,
    event_type: eventType,
    metadata: options.metadata ?? {}
  });
}
async function validateOAuthRequest(service, data) {
  const {
    data: app,
    error
  } = await service.from("developer_apps").select("id, app_name, website_url, privacy_policy_url, terms_url, redirect_uris, allowed_scopes, status").eq("client_id", data.clientId).maybeSingle();
  if (error) throw new Error(error.message);
  if (!app) throw new Error("Unknown Trey TV client_id");
  if (!["draft", "active"].includes(app.status)) throw new Error("This Trey TV app is not active");
  const redirectUris = Array.isArray(app.redirect_uris) ? app.redirect_uris : [];
  if (!redirectUris.includes(data.redirectUri)) throw new Error("redirect_uri is not registered for this app");
  const requestedScopes = normalizeScopes(data.scope);
  const allowedScopes = normalizeScopes(app.allowed_scopes);
  const rejectedScopes = requestedScopes.filter((scope) => !allowedScopes.includes(scope));
  if (rejectedScopes.length) throw new Error(`Scope not allowed: ${rejectedScopes.join(", ")}`);
  return {
    app,
    requestedScopes
  };
}
const listDeveloperDashboard_createServerFn_handler = createServerRpc({
  id: "096bcdbce722acde5178a5e7a0db5a6b749ccb7acf34224f54863b1759861d4e",
  name: "listDeveloperDashboard",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => listDeveloperDashboard.__executeServer(opts));
const listDeveloperDashboard = createServerFn({
  method: "POST"
}).inputValidator(validateAuthInput).handler(listDeveloperDashboard_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  const [{
    data: apps,
    error: appsError
  }, {
    data: apiKeys,
    error: keysError
  }] = await Promise.all([service.from("developer_apps").select("*").eq("owner_user_id", user.id).order("created_at", {
    ascending: false
  }), service.from("api_keys").select("id, app_id, key_prefix, label, scopes, status, last_used_at, created_at, revoked_at").eq("owner_user_id", user.id).order("created_at", {
    ascending: false
  })]);
  if (appsError) throw new Error(appsError.message);
  if (keysError) throw new Error(keysError.message);
  return {
    apps: apps ?? [],
    apiKeys: apiKeys ?? []
  };
});
const listAdminDeveloperApps_createServerFn_handler = createServerRpc({
  id: "1dc211957eed47e3bbaefba9d598b628d20ea7eaaf5e3eafe8499ec1998ea9b2",
  name: "listAdminDeveloperApps",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => listAdminDeveloperApps.__executeServer(opts));
const listAdminDeveloperApps = createServerFn({
  method: "POST"
}).inputValidator(validateAuthInput).handler(listAdminDeveloperApps_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  const {
    data: admin
  } = await service.from("admin_users").select("role").eq("user_id", user.id).maybeSingle();
  if (!admin) throw new Error("Admin access required");
  const {
    data: apps,
    error
  } = await service.from("developer_apps").select("*, profiles!developer_apps_owner_user_id_fkey(display_name, username, email)").order("created_at", {
    ascending: false
  });
  if (error) {
    const fallback = await service.from("developer_apps").select("*").order("created_at", {
      ascending: false
    });
    if (fallback.error) throw new Error(fallback.error.message);
    return {
      apps: fallback.data ?? []
    };
  }
  return {
    apps: apps ?? []
  };
});
const createDeveloperApp_createServerFn_handler = createServerRpc({
  id: "ebecc3428588a244ac9f03595413ab71cd40a36c4eabb152d1e7c87db01eeb08",
  name: "createDeveloperApp",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => createDeveloperApp.__executeServer(opts));
const createDeveloperApp = createServerFn({
  method: "POST"
}).inputValidator(validateAppInput).handler(createDeveloperApp_createServerFn_handler, async ({
  data
}) => {
  if (!data.appName) throw new Error("App name is required");
  if (!data.redirectUri) throw new Error("Redirect URI is required");
  if (!data.scopes.length) throw new Error("Select at least one scope");
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  const clientId = generateClientId();
  const clientSecret = generateClientSecret();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const {
    data: app,
    error
  } = await service.from("developer_apps").insert({
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
    updated_at: now
  }).select("*").single();
  if (error) throw new Error(error.message);
  await auditDeveloperEvent(service, "app_created", {
    appId: app.id,
    actorUserId: user.id
  });
  return {
    app,
    clientSecret
  };
});
const updateDeveloperApp_createServerFn_handler = createServerRpc({
  id: "182b583c26d2258ad5be9766f418e8841ba3ac4b337fff97600af640b6f7da8c",
  name: "updateDeveloperApp",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => updateDeveloperApp.__executeServer(opts));
const updateDeveloperApp = createServerFn({
  method: "POST"
}).inputValidator(validateUpdateAppInput).handler(updateDeveloperApp_createServerFn_handler, async ({
  data
}) => {
  if (!data.appId) throw new Error("App ID is required");
  if (!data.appName) throw new Error("App name is required");
  if (!data.redirectUri) throw new Error("Redirect URI is required");
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  await getOwnedApp(service, data.appId, user.id);
  const {
    data: app,
    error
  } = await service.from("developer_apps").update({
    app_name: data.appName,
    app_description: data.appDescription,
    website_url: data.websiteUrl,
    privacy_policy_url: data.privacyPolicyUrl,
    terms_url: data.termsUrl,
    redirect_uris: normalizeRedirectUris(data.redirectUri),
    allowed_scopes: data.scopes,
    app_type: data.appType,
    status: data.status ?? "draft",
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.appId).select("*").single();
  if (error) throw new Error(error.message);
  return {
    app
  };
});
const rotateDeveloperSecret_createServerFn_handler = createServerRpc({
  id: "dac76c0ff93707f6b85830d7d7232f7123e0a736bbe9feb64af062bccfb40e8a",
  name: "rotateDeveloperSecret",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => rotateDeveloperSecret.__executeServer(opts));
const rotateDeveloperSecret = createServerFn({
  method: "POST"
}).inputValidator(validateAppIdInput).handler(rotateDeveloperSecret_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  await getOwnedApp(service, data.appId, user.id);
  const clientSecret = generateClientSecret();
  const {
    error
  } = await service.from("developer_apps").update({
    client_secret_hash: hashSecret(clientSecret),
    updated_at: (/* @__PURE__ */ new Date()).toISOString()
  }).eq("id", data.appId);
  if (error) throw new Error(error.message);
  await auditDeveloperEvent(service, "secret_rotated", {
    appId: data.appId,
    actorUserId: user.id
  });
  return {
    clientSecret
  };
});
const revokeDeveloperApp_createServerFn_handler = createServerRpc({
  id: "ce6e1ae3f8f6a403b0b9ec3ee718291529aa9c34ca8c3d7364e47f9e8f084405",
  name: "revokeDeveloperApp",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => revokeDeveloperApp.__executeServer(opts));
const revokeDeveloperApp = createServerFn({
  method: "POST"
}).inputValidator(validateAppIdInput).handler(revokeDeveloperApp_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  await getOwnedApp(service, data.appId, user.id);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await service.from("developer_apps").update({
    status: "revoked",
    revoked_at: now,
    updated_at: now
  }).eq("id", data.appId);
  if (error) throw new Error(error.message);
  await auditDeveloperEvent(service, "app_revoked", {
    appId: data.appId,
    actorUserId: user.id
  });
  await service.from("developer_app_tokens").update({
    revoked_at: now
  }).eq("app_id", data.appId).is("revoked_at", null);
  return {
    ok: true
  };
});
const createApiKey_createServerFn_handler = createServerRpc({
  id: "a2871da9ab0f867f3b2063e9c94156fc8b10bf0bb78537c73e929cd1e5cdd2ba",
  name: "createApiKey",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => createApiKey.__executeServer(opts));
const createApiKey = createServerFn({
  method: "POST"
}).inputValidator(validateApiKeyInput).handler(createApiKey_createServerFn_handler, async ({
  data
}) => {
  if (!data.label) throw new Error("API key label is required");
  if (!data.scopes.length) throw new Error("Select at least one scope");
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  if (data.appId) await getOwnedApp(service, data.appId, user.id);
  const apiKey = generateApiKey(data.mode);
  const keyPrefix = apiKey.split("_").slice(0, 3).join("_") + "_";
  const {
    data: key,
    error
  } = await service.from("api_keys").insert({
    owner_user_id: user.id,
    app_id: data.appId,
    key_hash: hashSecret(apiKey),
    key_prefix: keyPrefix,
    label: data.label,
    scopes: data.scopes,
    status: "active"
  }).select("id, app_id, key_prefix, label, scopes, status, last_used_at, created_at, revoked_at").single();
  if (error) throw new Error(error.message);
  await auditDeveloperEvent(service, "api_key_created", {
    appId: data.appId,
    actorUserId: user.id,
    metadata: {
      label: data.label,
      mode: data.mode
    }
  });
  return {
    key,
    apiKey
  };
});
const revokeApiKey_createServerFn_handler = createServerRpc({
  id: "8e4d801f9b3e10ed1072006f13fab119f227bd6219edd9a9ce8e28a9e2f825d1",
  name: "revokeApiKey",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => revokeApiKey.__executeServer(opts));
const revokeApiKey = createServerFn({
  method: "POST"
}).inputValidator(validateApiKeyIdInput).handler(revokeApiKey_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await service.from("api_keys").update({
    status: "revoked",
    revoked_at: now
  }).eq("id", data.keyId).eq("owner_user_id", user.id);
  if (error) throw new Error(error.message);
  await auditDeveloperEvent(service, "api_key_revoked", {
    actorUserId: user.id,
    metadata: {
      key_id: data.keyId
    }
  });
  return {
    ok: true
  };
});
const listConnectedApps_createServerFn_handler = createServerRpc({
  id: "515a67968b03b8f15f89ca070e32d586db154658ba442692129c5b8c642e43c8",
  name: "listConnectedApps",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => listConnectedApps.__executeServer(opts));
const listConnectedApps = createServerFn({
  method: "POST"
}).inputValidator(validateAuthInput).handler(listConnectedApps_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  const {
    data: consents,
    error
  } = await service.from("oauth_consents").select("id, scopes, granted_at, revoked_at, developer_apps(id, app_name, website_url)").eq("user_id", user.id).order("granted_at", {
    ascending: false
  });
  if (error) throw new Error(error.message);
  const activeConsents = (consents ?? []).filter((consent) => !consent.revoked_at);
  const appIds = activeConsents.map((consent) => consent.developer_apps?.id).filter(Boolean);
  const lastUsedByApp = /* @__PURE__ */ new Map();
  if (appIds.length) {
    const {
      data: tokens
    } = await service.from("developer_app_tokens").select("app_id, last_used_at, created_at").eq("user_id", user.id).in("app_id", appIds).order("last_used_at", {
      ascending: false,
      nullsFirst: false
    });
    for (const row of tokens ?? []) {
      if (!lastUsedByApp.has(row.app_id)) lastUsedByApp.set(row.app_id, row.last_used_at ?? row.created_at ?? null);
    }
  }
  return {
    consents: (consents ?? []).map((consent) => ({
      ...consent,
      last_used_at: lastUsedByApp.get(consent.developer_apps?.id) ?? null
    }))
  };
});
const revokeConnectedApp_createServerFn_handler = createServerRpc({
  id: "4f8aba627b247a17f0161277dcbe6297bca258746df33920039b3efbda01f966",
  name: "revokeConnectedApp",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => revokeConnectedApp.__executeServer(opts));
const revokeConnectedApp = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  consentId: cleanId(input?.consentId)
})).handler(revokeConnectedApp_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const {
    error
  } = await service.from("oauth_consents").update({
    revoked_at: now
  }).eq("id", data.consentId).eq("user_id", user.id);
  if (error) throw new Error(error.message);
  await auditDeveloperEvent(service, "consent_revoked", {
    actorUserId: user.id,
    metadata: {
      consent_id: data.consentId
    }
  });
  return {
    ok: true
  };
});
const validateOAuthAuthorizeRequest_createServerFn_handler = createServerRpc({
  id: "2b8b306f4f6a5f94d8629aa686e95e9546aac0ecacf45d111e9d469c0009e5bf",
  name: "validateOAuthAuthorizeRequest",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => validateOAuthAuthorizeRequest.__executeServer(opts));
const validateOAuthAuthorizeRequest = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  clientId: cleanId(input?.clientId),
  redirectUri: cleanUrl(input?.redirectUri),
  scope: cleanText(input?.scope, 400)
})).handler(validateOAuthAuthorizeRequest_createServerFn_handler, async ({
  data
}) => {
  const service = getTreyIServiceClient();
  return validateOAuthRequest(service, data);
});
const approveOAuthAuthorization_createServerFn_handler = createServerRpc({
  id: "14250ff0c506277113440b0dc94265ef0d9033ca18eaf3a790c9abf2e7c76b82",
  name: "approveOAuthAuthorization",
  filename: "src/lib/developers/oauth.server.ts"
}, (opts) => approveOAuthAuthorization.__executeServer(opts));
const approveOAuthAuthorization = createServerFn({
  method: "POST"
}).inputValidator(validateConsentInput).handler(approveOAuthAuthorization_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const service = getTreyIServiceClient();
  const {
    app,
    requestedScopes
  } = await validateOAuthRequest(service, data);
  const code = generateAuthorizationCode();
  const now = /* @__PURE__ */ new Date();
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1e3).toISOString();
  const {
    error: codeError
  } = await service.from("oauth_authorization_codes").insert({
    app_id: app.id,
    user_id: user.id,
    code_hash: hashSecret(code),
    redirect_uri: data.redirectUri,
    scopes: requestedScopes,
    code_challenge: data.codeChallenge || null,
    code_challenge_method: data.codeChallengeMethod || null,
    expires_at: expiresAt
  });
  if (codeError) throw new Error(codeError.message);
  await service.from("oauth_consents").upsert({
    app_id: app.id,
    user_id: user.id,
    scopes: requestedScopes,
    granted_at: now.toISOString(),
    revoked_at: null
  }, {
    onConflict: "app_id,user_id"
  });
  await auditDeveloperEvent(service, "oauth_authorized", {
    appId: app.id,
    actorUserId: user.id,
    metadata: {
      scopes: requestedScopes,
      redirect_uri: data.redirectUri
    }
  });
  return {
    code
  };
});
export {
  approveOAuthAuthorization_createServerFn_handler,
  createApiKey_createServerFn_handler,
  createDeveloperApp_createServerFn_handler,
  listAdminDeveloperApps_createServerFn_handler,
  listConnectedApps_createServerFn_handler,
  listDeveloperDashboard_createServerFn_handler,
  revokeApiKey_createServerFn_handler,
  revokeConnectedApp_createServerFn_handler,
  revokeDeveloperApp_createServerFn_handler,
  rotateDeveloperSecret_createServerFn_handler,
  updateDeveloperApp_createServerFn_handler,
  validateOAuthAuthorizeRequest_createServerFn_handler
};
