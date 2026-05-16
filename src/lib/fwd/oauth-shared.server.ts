import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { ensurePublicProfileUid, getTreyIServiceClient } from "@/lib/trey-i/onboarding.server";

const DEFAULT_FWD_ALLOWED_REDIRECTS = [
  "https://fwd.treytv.com/auth/trey-tv/callback",
  "http://localhost:5173/auth/trey-tv/callback",
] as const;

export const DEFAULT_FWD_CLIENT_ID = "7a8b2b60-9597-45cb-99fd-66abd03abcb2";

export type FwdOAuthClient = {
  app_name: string;
  allowed_scopes: string[];
  allowed_redirect_uris: string[];
  client_id: string;
  client_secret_hash: string;
  id: string;
  is_active: boolean;
};

export function hashSecret(value: string) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function generateCode() {
  return `fwd_code_${randomBytes(32).toString("base64url")}`;
}

export function cleanText(value: unknown, max = 500) {
  return String(value ?? "").trim().replace(/\s+/g, " ").slice(0, max);
}

export function cleanUrl(value: unknown) {
  return cleanText(value, 900);
}

export function safeLog(event: string, metadata: Record<string, unknown> = {}) {
  console.info("[fwd-oauth]", event, metadata);
}

export function oauthJson(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      pragma: "no-cache",
    },
  });
}

export function oauthError(error: string, description: string, status = 400) {
  return oauthJson({ error, error_description: description }, status);
}

export function isPast(iso: string | null | undefined) {
  return !iso || new Date(iso).getTime() <= Date.now();
}

export function plusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

export function verifySecret(secret: string, hash: string) {
  const supplied = Buffer.from(hashSecret(secret));
  const stored = Buffer.from(hash);
  return supplied.length === stored.length && timingSafeEqual(supplied, stored);
}

export function getFwdAllowedRedirects() {
  return Array.from(new Set([
    process.env.FWD_ALLOWED_REDIRECT_URI?.trim(),
    process.env.FWD_LOCAL_REDIRECT_URI?.trim(),
    ...DEFAULT_FWD_ALLOWED_REDIRECTS,
  ].filter(Boolean) as string[]));
}

export function getFwdClientId() {
  return process.env.FWD_OAUTH_CLIENT_ID?.trim() || DEFAULT_FWD_CLIENT_ID;
}

export function normalizeFwdScope(scope: unknown) {
  const scopes = String(scope ?? "")
    .trim()
    .split(/[,\s]+/)
    .filter(Boolean);
  return scopes.length ? Array.from(new Set(scopes)) : ["profile"];
}

export function isAllowedRedirect(client: FwdOAuthClient, redirectUri: string) {
  const allowed = Array.isArray(client.allowed_redirect_uris) ? client.allowed_redirect_uris : [];
  return allowed.includes(redirectUri) && getFwdAllowedRedirects().includes(redirectUri);
}

export function isAllowedScope(client: FwdOAuthClient, scope: unknown) {
  const requested = normalizeFwdScope(scope);
  const allowed = Array.isArray(client.allowed_scopes) && client.allowed_scopes.length ? client.allowed_scopes : ["profile"];
  return requested.every((item) => allowed.includes(item));
}

export function getPublicProfileUrl(uid: string | null | undefined) {
  if (!uid) return null;
  const origin = process.env.TREY_TV_PUBLIC_ORIGIN?.trim()?.replace(/\/+$/, "") || "https://tv.treytrizzy.com";
  return `${origin}/u/${uid}`;
}

export async function getActiveFwdClient(clientId: string): Promise<FwdOAuthClient | null> {
  if (!clientId) return null;
  if (clientId !== getFwdClientId()) return null;

  const service = getTreyIServiceClient();
  const { data, error } = await service
    .from("fwd_oauth_clients")
    .select("id, client_id, client_secret_hash, app_name, allowed_redirect_uris, allowed_scopes, is_active")
    .eq("client_id", clientId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) {
    const envSecret = process.env.FWD_OAUTH_CLIENT_SECRET?.trim();
    if (!envSecret) return null;
    return {
      id: "env:fwd",
      app_name: "FWD",
      allowed_scopes: ["profile"],
      allowed_redirect_uris: getFwdAllowedRedirects(),
      client_id: clientId,
      client_secret_hash: hashSecret(envSecret),
      is_active: true,
    };
  }
  return data as FwdOAuthClient | null;
}

export type FwdSafeProfile = {
  avatar_url: string | null;
  display_name: string | null;
  profile_url: string | null;
  trey_tv_uid: string | null;
  trey_tv_user_id: string;
};

export async function getSafeProfile(userId: string): Promise<FwdSafeProfile> {
  const service = getTreyIServiceClient();
  const ensuredUid = await ensurePublicProfileUid(userId);
  const { data: profile, error } = await service
    .from("profiles")
    .select("public_profile_uid, display_name, username, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const treyTvUid = profile?.public_profile_uid ?? ensuredUid ?? null;

  return {
    avatar_url: profile?.avatar_url ?? null,
    display_name: profile?.display_name ?? profile?.username ?? null,
    profile_url: getPublicProfileUrl(treyTvUid),
    trey_tv_uid: treyTvUid,
    trey_tv_user_id: userId,
  };
}
