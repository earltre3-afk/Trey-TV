import { createServerFn } from "@tanstack/react-start";
import { verifyTreyIUser } from "@/lib/trey-i/onboarding.server";
import {
  cleanText,
  cleanUrl,
  generateCode,
  getActiveFwdClient,
  getSafeProfile,
  isAllowedRedirect,
  isAllowedScope,
  normalizeFwdScope,
  safeLog,
} from "./oauth-shared.server";
import { getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";

type AuthorizeInput = {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string;
};

type ApproveInput = AuthorizeInput & {
  accessToken: string;
  state?: string;
};

function validateAuthorizeInput(input: AuthorizeInput): AuthorizeInput {
  return {
    clientId: cleanText(input?.clientId, 160),
    redirectUri: cleanUrl(input?.redirectUri),
    responseType: cleanText(input?.responseType, 40),
    scope: cleanText(input?.scope, 300),
  };
}

function validateApproveInput(input: ApproveInput): ApproveInput {
  return {
    ...validateAuthorizeInput(input),
    accessToken: typeof input?.accessToken === "string" ? input.accessToken : "",
    state: cleanText(input?.state, 500),
  };
}

async function validateFwdAuthorizeRequest(data: AuthorizeInput) {
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

  return { client, scope: normalizeFwdScope(data.scope).join(" ") };
}

export const validateFwdOAuthAuthorizeRequest = createServerFn({ method: "POST" })
  .inputValidator(validateAuthorizeInput)
  .handler(async ({ data }) => validateFwdAuthorizeRequest(data));

export const approveFwdOAuthAuthorization = createServerFn({ method: "POST" })
  .inputValidator(validateApproveInput)
  .handler(async ({ data }) => {
    const { user } = await verifyTreyIUser(data.accessToken);
    const { client, scope } = await validateFwdAuthorizeRequest(data);
    const profile = await getSafeProfile(user.id);
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const service = getTreyIServiceClient();

    const { error } = await service.from("fwd_oauth_codes").insert({
      code,
      client_id: client.client_id,
      redirect_uri: data.redirectUri,
      trey_tv_user_id: profile.trey_tv_user_id,
      trey_tv_uid: profile.trey_tv_uid,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      profile_url: profile.profile_url,
      scope,
      expires_at: expiresAt,
    });

    if (error) throw new Error(error.message);

    safeLog("authorization_code_issued", {
      client_id: client.client_id,
      redirect_uri: data.redirectUri,
      trey_tv_uid: profile.trey_tv_uid,
    });

    return { code };
  });
