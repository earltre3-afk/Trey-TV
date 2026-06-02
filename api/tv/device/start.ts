import { createClient } from "@supabase/supabase-js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// POST /api/tv/device/start — TV app begins device-code pairing.
// Self-contained (no cross-file imports) so the Vercel Node bundler ships it whole.
const TABLE = "tv_device_pairing";
const TTL_MS = 10 * 60 * 1000;
const POLL_SECONDS = 5;

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
function token(n = 24) {
  const v = new Uint8Array(n);
  crypto.getRandomValues(v);
  return Array.from(v, (b) => b.toString(16).padStart(2, "0")).join("");
}
function userCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const v = new Uint8Array(8);
  crypto.getRandomValues(v);
  return Array.from(v, (b) => a[b % a.length]).join("");
}
function display(c: string) {
  const n = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return n.length > 4 ? `${n.slice(0, 4)}-${n.slice(4)}` : n;
}
function origin(req: VercelRequest) {
  const env =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    process.env.VITE_SITE_URL?.trim().replace(/\/+$/, "");
  if (env) return env;
  const proto = (req.headers["x-forwarded-proto"] as string) || "https";
  const host = (req.headers["x-forwarded-host"] as string) || (req.headers.host as string) || "tv.treytrizzy.com";
  return `${proto}://${host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return send(res, 200, {});
  if (req.method !== "POST") return send(res, 405, { error: "Method not allowed." });

  const s = svc();
  const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
  for (let i = 0; i < 5; i += 1) {
    const deviceCode = `tv_${token(24)}`;
    const { data, error } = await s
      .from(TABLE)
      .insert({
        device_code: deviceCode,
        user_code: userCode(),
        status: "pending",
        expires_at: expiresAt,
        device_label: "Trey TV streaming-box app",
        user_agent: ((req.headers["user-agent"] as string) || "").slice(0, 240) || null,
      })
      .select("device_code, user_code, expires_at")
      .single();
    if (!error && data) {
      return send(res, 200, {
        device_code: data.device_code,
        user_code: display(data.user_code),
        verification_url: `${origin(req)}/tv/activate`,
        expires_at: data.expires_at,
        polling_interval_seconds: POLL_SECONDS,
      });
    }
  }
  return send(res, 500, { error: "Could not start TV device sign-in. Try again." });
}
