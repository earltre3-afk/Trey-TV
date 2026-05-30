import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// GET /api/tv/device/status?device_code=tv_... — TV app polls for approval.
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
async function cryptoKey() {
  const secret = process.env.TV_DEVICE_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) return null;
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}
async function decryptToken(reference: string | null | undefined) {
  if (!reference?.startsWith("v1:")) return null;
  const key = await cryptoKey();
  if (!key) return null;
  const [, ivB64, encB64] = reference.split(":");
  if (!ivB64 || !encB64) return null;
  try {
    const dec = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(Buffer.from(ivB64, "base64")) },
      key,
      new Uint8Array(Buffer.from(encB64, "base64")),
    );
    return new TextDecoder().decode(dec);
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return send(res, 200, {});
  if (req.method !== "GET") return send(res, 405, { error: "Method not allowed." });

  const deviceCode = String(req.query.device_code ?? "");
  if (!deviceCode.startsWith("tv_") || deviceCode.length < 32) return send(res, 200, { status: "expired" });

  const s = svc();
  const { data: session } = await s
    .from(TABLE)
    .select("id, device_code, status, user_id, session_reference, expires_at")
    .eq("device_code", deviceCode)
    .maybeSingle();

  if (!session) return send(res, 200, { status: "expired" });
  await s.from(TABLE).update({ last_polled_at: new Date().toISOString() }).eq("device_code", deviceCode);

  if (new Date(session.expires_at).getTime() <= Date.now()) {
    await s.from(TABLE).update({ status: "expired" }).eq("device_code", deviceCode).eq("status", "pending");
    return send(res, 200, { status: "expired" });
  }
  if (session.status === "denied") return send(res, 200, { status: "denied" });
  if (session.status !== "approved") return send(res, 200, { status: "pending" });

  const accessToken = await decryptToken(session.session_reference);
  if (!accessToken) return send(res, 503, { status: "approved", error: "TV session handoff is not configured." });

  return send(res, 200, {
    status: "approved",
    access_token: accessToken,
    token_type: "bearer",
    expires_at: session.expires_at,
    user_id: session.user_id,
  });
}
