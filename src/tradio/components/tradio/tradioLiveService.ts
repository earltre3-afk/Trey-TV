import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { handleMissingTradioTables } from "./auth/tradioProfileBootstrap";
import { tradioShowRoomName } from "@/lib/tradio/liveSessionPolicy";

export interface LiveSession {
  id: string;
  showId: string | null;
  hostUserId: string;
  roomName: string;
  status: "live" | "ended";
  title: string | null;
  hostName: string | null;
  startedAt: string;
  peakListeners: number;
}

const rowToSession = (row: Record<string, any>): LiveSession => ({
  id: String(row.id),
  showId: row.show_id ?? null,
  hostUserId: row.host_user_id,
  roomName: row.room_name,
  status: row.status,
  title: row.title ?? null,
  hostName: row.host_name ?? null,
  startedAt: row.started_at,
  peakListeners: Number(row.peak_listeners ?? 0),
});

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function goLive(input: {
  showId: string | null;
  title: string;
  hostName: string;
}): Promise<{ session: LiveSession | null; error: string | null }> {
  if (!isSupabaseConfigured || !supabase)
    return { session: null, error: "Live requires Supabase." };
  const uid = await currentUserId();
  if (!uid) return { session: null, error: "Sign in to go live." };
  try {
    // Insert first to get the id, then set room_name = tradio-show:<id>.
    const { data: created, error: insErr } = await supabase
      .from("tradio_live_sessions")
      .insert({
        show_id: input.showId,
        host_user_id: uid,
        room_name: "pending",
        status: "live",
        title: input.title,
        host_name: input.hostName,
      })
      .select("*")
      .single();
    if (insErr || !created)
      return { session: null, error: handleMissingTradioTables(insErr).message };
    const roomName = tradioShowRoomName(created.id);
    const { data: updated } = await supabase
      .from("tradio_live_sessions")
      .update({ room_name: roomName })
      .eq("id", created.id)
      .select("*")
      .single();
    if (input.showId)
      await supabase.from("tradio_radio_shows").update({ status: "live" }).eq("id", input.showId);
    return { session: rowToSession(updated ?? created), error: null };
  } catch (err) {
    return { session: null, error: handleMissingTradioTables(err).message };
  }
}

export async function endLive(input: {
  sessionId: string;
  showId: string | null;
  peakListeners: number;
}): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    await supabase
      .from("tradio_live_sessions")
      .update({
        status: "ended",
        ended_at: new Date().toISOString(),
        peak_listeners: input.peakListeners,
      })
      .eq("id", input.sessionId);
    if (input.showId)
      await supabase.from("tradio_radio_shows").update({ status: "draft" }).eq("id", input.showId);
  } catch (err) {
    console.warn("[tradioLive] endLive failed", err);
  }
}

export async function listLiveNow(): Promise<LiveSession[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from("tradio_live_sessions")
      .select("*")
      .eq("status", "live")
      .order("started_at", { ascending: false });
    if (error) return [];
    return (Array.isArray(data) ? data : []).map(rowToSession);
  } catch {
    return [];
  }
}

export async function updatePeakListeners(sessionId: string, count: number): Promise<void> {
  if (!isSupabaseConfigured || !supabase || count <= 0) return;
  try {
    // Best-effort: only raise the peak.
    const { data } = await supabase
      .from("tradio_live_sessions")
      .select("peak_listeners")
      .eq("id", sessionId)
      .maybeSingle();
    const current = Number(data?.peak_listeners ?? 0);
    if (count > current)
      await supabase
        .from("tradio_live_sessions")
        .update({ peak_listeners: count })
        .eq("id", sessionId);
  } catch {
    /* ignore */
  }
}
