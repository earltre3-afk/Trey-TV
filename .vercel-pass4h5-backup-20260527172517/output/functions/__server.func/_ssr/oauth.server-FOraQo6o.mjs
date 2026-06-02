import { c as createServerRpc, a as createServerFn, v as verifyTreyIUser, b as getSafeProfile, d as generateCode, g as getTreyIServiceClient, s as safeLog, e as cleanText, f as cleanUrl, h as getActiveFwdClient, i as isAllowedRedirect, j as isAllowedScope, n as normalizeFwdScope } from "./index.mjs";
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
function validateAuthorizeInput(input) {
  return {
    clientId: cleanText(input?.clientId, 160),
    redirectUri: cleanUrl(input?.redirectUri),
    responseType: cleanText(input?.responseType, 40),
    scope: cleanText(input?.scope, 300)
  };
}
function validateApproveInput(input) {
  return {
    ...validateAuthorizeInput(input),
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    state: cleanText(input?.state, 500)
  };
}
async function validateFwdAuthorizeRequest(data) {
  if (data.responseType && data.responseType !== "code") {
    throw new Error("FWD OAuth only supports response_type=code.");
  }
  if (!data.clientId) throw new Error("Missing client_id.");
  if (!data.redirectUri) throw new Error("Missing redirect_uri.");
  const client = await getActiveFwdClient(data.clientId);
  if (!client) throw new Error("Unknown or inactive FWD client_id.");
  if (!isAllowedRedirect(client, data.redirectUri)) {
    throw new Error("redirect_uri is not registered for FWD.");
  }
  if (!isAllowedScope(client, data.scope)) {
    throw new Error("Requested FWD scope is not allowed.");
  }
  return {
    client,
    scope: normalizeFwdScope(data.scope).join(" ")
  };
}
const validateFwdOAuthAuthorizeRequest_createServerFn_handler = createServerRpc({
  id: "0fe2ec5475917eb3f8d1f4ac2dd622ce0b61561000de63b9adff572ffb5878bf",
  name: "validateFwdOAuthAuthorizeRequest",
  filename: "src/lib/fwd/oauth.server.ts"
}, (opts) => validateFwdOAuthAuthorizeRequest.__executeServer(opts));
const validateFwdOAuthAuthorizeRequest = createServerFn({
  method: "POST"
}).inputValidator(validateAuthorizeInput).handler(validateFwdOAuthAuthorizeRequest_createServerFn_handler, async ({
  data
}) => validateFwdAuthorizeRequest(data));
const approveFwdOAuthAuthorization_createServerFn_handler = createServerRpc({
  id: "264431b7c48ff4fbd07e06660b3ffb7277dfd50a7e5a999347f19c353806337d",
  name: "approveFwdOAuthAuthorization",
  filename: "src/lib/fwd/oauth.server.ts"
}, (opts) => approveFwdOAuthAuthorization.__executeServer(opts));
const approveFwdOAuthAuthorization = createServerFn({
  method: "POST"
}).inputValidator(validateApproveInput).handler(approveFwdOAuthAuthorization_createServerFn_handler, async ({
  data
}) => {
  const {
    user
  } = await verifyTreyIUser(data.accessToken);
  const {
    client,
    scope
  } = await validateFwdAuthorizeRequest(data);
  const profile = await getSafeProfile(user.id);
  const code = generateCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1e3).toISOString();
  const service = getTreyIServiceClient();
  const {
    error
  } = await service.from("fwd_oauth_codes").insert({
    code,
    client_id: client.client_id,
    redirect_uri: data.redirectUri,
    trey_tv_user_id: profile.trey_tv_user_id,
    trey_tv_uid: profile.trey_tv_uid,
    display_name: profile.display_name,
    avatar_url: profile.avatar_url,
    profile_url: profile.profile_url,
    scope,
    expires_at: expiresAt
  });
  if (error) throw new Error(error.message);
  safeLog("authorization_code_issued", {
    client_id: client.client_id,
    redirect_uri: data.redirectUri,
    trey_tv_uid: profile.trey_tv_uid
  });
  return {
    code
  };
});
export {
  approveFwdOAuthAuthorization_createServerFn_handler,
  validateFwdOAuthAuthorizeRequest_createServerFn_handler
};
