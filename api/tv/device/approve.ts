import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// POST /api/tv/device/approve — signed-in member links the TV code on /tv/activate.
const TABLE = "tv_device_pairing";

function svc() {
  return createClient(
    process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
function send(res: VercelResponse, status: number, data: unknown) {
  res.status(status);
  res.setHeader("content-type", "application/json; charset=utf-8");
  res.setHeader("cache-control", "no-store");
  res.send(JSON.stringify(data));
}
function normalize(code: string) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}
async function readBody(req: VercelRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === "object") return req.body as Record<string, unknown>;
  if (typeof req.body === "string") { try { return JSON.parse(req.body); } catch { return {}; } }
  return {};
}
async function getUser(req: VercelRequest) {
  const token = ((req.headers.authorization as string) || "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  if (!token) return null;
  try {
    const { data, error } = await (svc().auth as any).getUser(token);
    if (error || !data.user) return null;
    return { user: data.user, accessToken: token };
  } catch { return null; }
}
async function sha256Hex(value: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function cryptoKey() {
  const secret = process.env.TV_DEVICE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function encryptToken(accessToken: string) {
  const key = await cryptoKey();
  if (!key) return null;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const enc = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(accessToken));
  return `v1:${Buffer.from(iv).toString("base64")}:${Buffer.from(new Uint8Array(enc)).toString("base64")}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return send(res, 200, {});
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed." });

  const auth = await getUser(req);
  if (!auth) return send(res, 401, { error: "Sign in to approve this TV device." });

  const body = await readBody(req);
  const decision = body.decision === "deny" ? "deny" : "approve";
  const normalized = normalize(typeof body.user_code === "string" ? body.user_code : "");

  const s = svc();
  const { data: session } = await s
    .from(TABLE)
    .select("id, status, expires_at")
    .eq("user_code", normalized)
    .maybeSingle();

  if (!session) return send(res, 404, { error: "That TV code is invalid or expired." });
  const expired = new Date(session.expires_at).getTime() <= Date.now();
  if (session.status !== "pending" || expired) {
    if (expired) await s.from(TABLE).update({ status: "expired" }).eq("id", session.id);
    return send(res, 410, { error: "That TV code is no longer active." });
  }

  if (decision === "deny") {
    await s.from(TABLE).update({ status: "denied", denied_at: new Date().toISOString() }).eq("id", session.id);
    return send(res, 200, { ok: true, status: "denied" });
  }

  const sessionReference = await encryptToken(auth.accessToken);
  if (!sessionReference) return send(res, 500, { error: "TV session handoff is not configured." });

  await s
    .from(TABLE)
    .update({
      status: "approved",
      user_id: auth.user.id,
      access_token_hash: await sha256Hex(auth.accessToken),
      session_reference: sessionReference,
      approved_at: new Date().toISOString(),
    })
    .eq("id", session.id)
    .eq("status", "pending");

  return send(res, 200, { ok: true, status: "approved" });
}
