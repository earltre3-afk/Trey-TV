import { RoomServiceClient } from "livekit-server-sdk";
import { getTreyIServiceClient } from "../trey-i/onboarding.server";
import { loadLiveKitConfig } from "../livekit-config.server";
import { tradioShowRoomName } from "./liveSessionPolicy";
import { nextCallerStatus, type CallerAction } from "./callerLogic";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function bearer(req: Request): string {
  return (req.headers.get("authorization") ?? "").match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? "";
}

function httpUrl(url: string): string {
  if (url.startsWith("wss://")) return `https://${url.slice(6)}`;
  if (url.startsWith("ws://")) return `http://${url.slice(5)}`;
  return url;
}

/**
 * Host-only endpoint that takes/disconnects/declines a call-in request by flipping
 * the caller's LiveKit publish permission at runtime (no rejoin needed). The caller's
 * own client reacts to the permission change to enable/disable its mic.
 */
export async function handleTradioCaller(request: Request, env: unknown): Promise<Response> {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  let config;
  try {
    config = loadLiveKitConfig(env);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : "LiveKit not configured." }, 503);
  }

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action || "") as CallerAction;
    const requestId = String(body.requestId || "").trim();
    if (!requestId || !["take", "disconnect", "decline"].includes(action)) {
      return json({ error: "Bad request." }, 400);
    }

    const supabase = getTreyIServiceClient();
    const token = bearer(request);
    const { data: authData } = await (supabase as any).auth.getUser(token);
    const hostId = authData?.user?.id;
    if (!hostId) return json({ error: "Unauthenticated." }, 401);

    const { data: call } = await (supabase as any)
      .from("tradio_live_call_requests")
      .select("*")
      .eq("id", requestId)
      .maybeSingle();
    if (!call) return json({ error: "Call request not found." }, 404);

    const { data: session } = await (supabase as any)
      .from("tradio_live_sessions")
      .select("id, host_user_id, status")
      .eq("id", call.session_id)
      .maybeSingle();
    if (!session || session.host_user_id !== hostId) return json({ error: "Not the host." }, 403);

    const newStatus = nextCallerStatus(call.status, action);
    const canPublish = newStatus === "on_air" && session.status === "live";

    const svc = new RoomServiceClient(httpUrl(config.url), config.apiKey, config.apiSecret);
    const room = tradioShowRoomName(session.id);
    try {
      await svc.updateParticipant(room, call.caller_identity, undefined, {
        canPublish,
        canSubscribe: true,
        canPublishData: true,
      });
    } catch (err) {
      console.warn("[tradioCaller] updateParticipant failed", err);
      return json({ error: "Could not update caller audio permission." }, 502);
    }

    await (supabase as any)
      .from("tradio_live_call_requests")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", requestId);

    return json({ ok: true, status: newStatus, canPublish });
  } catch (err) {
    console.error("[tradioCaller] error", err);
    return json({ error: "Caller action failed." }, 500);
  }
}
