import { a as createServerFn, u as createSsrRpc } from "./index.mjs";
const OAUTH_SCOPES = ["profile:read", "email:read", "creator:read", "verification:read", "public_uid:read"];
const APP_TYPES = ["web_app", "mobile_app", "creator_tool", "internal_tool", "other"];
const STATUSES = ["draft", "active", "suspended", "revoked"];
const cleanText = (value, max = 500) => String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
const cleanUrl = (value, max = 800) => cleanText(value, max);
const cleanId = (value) => cleanText(value, 120);
function normalizeScopes(scopes) {
  const list = Array.isArray(scopes) ? scopes : cleanText(scopes, 300).split(/[,\s]+/);
  return Array.from(new Set(list.filter((s) => OAUTH_SCOPES.includes(s))));
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
const listDeveloperDashboard = createServerFn({
  method: "POST"
}).inputValidator(validateAuthInput).handler(createSsrRpc("096bcdbce722acde5178a5e7a0db5a6b749ccb7acf34224f54863b1759861d4e"));
const listAdminDeveloperApps = createServerFn({
  method: "POST"
}).inputValidator(validateAuthInput).handler(createSsrRpc("1dc211957eed47e3bbaefba9d598b628d20ea7eaaf5e3eafe8499ec1998ea9b2"));
const createDeveloperApp = createServerFn({
  method: "POST"
}).inputValidator(validateAppInput).handler(createSsrRpc("ebecc3428588a244ac9f03595413ab71cd40a36c4eabb152d1e7c87db01eeb08"));
const updateDeveloperApp = createServerFn({
  method: "POST"
}).inputValidator(validateUpdateAppInput).handler(createSsrRpc("182b583c26d2258ad5be9766f418e8841ba3ac4b337fff97600af640b6f7da8c"));
const rotateDeveloperSecret = createServerFn({
  method: "POST"
}).inputValidator(validateAppIdInput).handler(createSsrRpc("dac76c0ff93707f6b85830d7d7232f7123e0a736bbe9feb64af062bccfb40e8a"));
const revokeDeveloperApp = createServerFn({
  method: "POST"
}).inputValidator(validateAppIdInput).handler(createSsrRpc("ce6e1ae3f8f6a403b0b9ec3ee718291529aa9c34ca8c3d7364e47f9e8f084405"));
const createApiKey = createServerFn({
  method: "POST"
}).inputValidator(validateApiKeyInput).handler(createSsrRpc("a2871da9ab0f867f3b2063e9c94156fc8b10bf0bb78537c73e929cd1e5cdd2ba"));
const revokeApiKey = createServerFn({
  method: "POST"
}).inputValidator(validateApiKeyIdInput).handler(createSsrRpc("8e4d801f9b3e10ed1072006f13fab119f227bd6219edd9a9ce8e28a9e2f825d1"));
const listConnectedApps = createServerFn({
  method: "POST"
}).inputValidator(validateAuthInput).handler(createSsrRpc("515a67968b03b8f15f89ca070e32d586db154658ba442692129c5b8c642e43c8"));
const revokeConnectedApp = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
  consentId: cleanId(input?.consentId)
})).handler(createSsrRpc("4f8aba627b247a17f0161277dcbe6297bca258746df33920039b3efbda01f966"));
const validateOAuthAuthorizeRequest = createServerFn({
  method: "POST"
}).inputValidator((input) => ({
  clientId: cleanId(input?.clientId),
  redirectUri: cleanUrl(input?.redirectUri),
  scope: cleanText(input?.scope, 400)
})).handler(createSsrRpc("2b8b306f4f6a5f94d8629aa686e95e9546aac0ecacf45d111e9d469c0009e5bf"));
const approveOAuthAuthorization = createServerFn({
  method: "POST"
}).inputValidator(validateConsentInput).handler(createSsrRpc("14250ff0c506277113440b0dc94265ef0d9033ca18eaf3a790c9abf2e7c76b82"));
export {
  OAUTH_SCOPES as O,
  rotateDeveloperSecret as a,
  createApiKey as b,
  createDeveloperApp as c,
  revokeApiKey as d,
  listConnectedApps as e,
  revokeConnectedApp as f,
  approveOAuthAuthorization as g,
  listAdminDeveloperApps as h,
  listDeveloperDashboard as l,
  revokeDeveloperApp as r,
  updateDeveloperApp as u,
  validateOAuthAuthorizeRequest as v
};
