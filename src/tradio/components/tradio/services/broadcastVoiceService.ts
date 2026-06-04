import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { renderBroadcastVoiceServer, renderStationDropVoiceServer, renderAdReadVoiceServer } from "../../../../lib/trey-i/broadcastVoice.server";
import { getSignedVoiceRenderUrlClient } from "./broadcastVoiceStorage";
import { VoiceRenderInput, VoiceRenderResult, VoiceRenderStatus } from "../types/broadcastVoiceTypes";

// Local in-memory state for offline mode
let localVoiceRenders: any[] = [];
let localStationDrops: any[] = [
  { id: "drop-1", title: "Trey TV Official Station ID", audio_url: "/audio/drops/id1.mp3", duration_seconds: 4, metadata: { provider: "internal" } },
  { id: "drop-2", title: "Midnight Atmospheric Drop", audio_url: "/audio/drops/id2.mp3", duration_seconds: 5, metadata: { provider: "internal" } }
];

export async function createVoiceRender(input: VoiceRenderInput): Promise<VoiceRenderResult> {
  return renderVoiceForScript(input);
}

export async function getVoiceRenderById(id: string): Promise<VoiceRenderResult | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_voice_renders")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      // Ensure the audio URL is a fresh signed URL if it was a storage path
      let audioUrl = data.audio_url;
      if (data.storage_path && (!audioUrl || audioUrl.includes("supabase.co/storage"))) {
        const signed = await getSignedVoiceRenderUrlClient(data.storage_path);
        if (signed) audioUrl = signed;
      }

      return {
        id: data.id,
        audio_url: audioUrl,
        storage_path: data.storage_path,
        duration_seconds: Number(data.duration_seconds),
        mime_type: data.mime_type || "audio/mpeg",
        render_status: data.render_status as VoiceRenderStatus,
        render_error: data.render_error,
        usage_metadata: data.usage_metadata || {},
        metadata: data.metadata || {},
      };
    } catch (e) {
      console.error("[Voice Service] Error getting render:", e);
    }
  }

  const local = localVoiceRenders.find((r) => r.id === id);
  return local || null;
}

export async function listVoiceRendersForBlock(blockId: string): Promise<VoiceRenderResult[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_voice_renders")
        .select("*")
        .eq("block_id", blockId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        audio_url: row.audio_url,
        storage_path: row.storage_path,
        duration_seconds: Number(row.duration_seconds),
        mime_type: row.mime_type || "audio/mpeg",
        render_status: row.render_status as VoiceRenderStatus,
        render_error: row.render_error,
        usage_metadata: row.usage_metadata || {},
        metadata: row.metadata || {},
      }));
    } catch (e) {
      console.error("[Voice Service] Error listing renders for block:", e);
      return [];
    }
  }

  return localVoiceRenders.filter((r) => r.block_id === blockId);
}

export async function listVoiceRendersForEpisode(episodeId: string): Promise<VoiceRenderResult[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_voice_renders")
        .select("*")
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        audio_url: row.audio_url,
        storage_path: row.storage_path,
        duration_seconds: Number(row.duration_seconds),
        mime_type: row.mime_type || "audio/mpeg",
        render_status: row.render_status as VoiceRenderStatus,
        render_error: row.render_error,
        usage_metadata: row.usage_metadata || {},
        metadata: row.metadata || {},
      }));
    } catch (e) {
      console.error("[Voice Service] Error listing renders for episode:", e);
      return [];
    }
  }

  return localVoiceRenders.filter((r) => r.episode_id === episodeId);
}

export async function listVoiceRendersForStationDrop(stationDropId: string): Promise<VoiceRenderResult[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_voice_renders")
        .select("*")
        .eq("station_drop_id", stationDropId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        audio_url: row.audio_url,
        storage_path: row.storage_path,
        duration_seconds: Number(row.duration_seconds),
        mime_type: row.mime_type || "audio/mpeg",
        render_status: row.render_status as VoiceRenderStatus,
        render_error: row.render_error,
        usage_metadata: row.usage_metadata || {},
        metadata: row.metadata || {},
      }));
    } catch (e) {
      console.error("[Voice Service] Error listing renders for station drop:", e);
      return [];
    }
  }

  return localVoiceRenders.filter((r) => r.station_drop_id === stationDropId);
}

export async function renderVoiceForScript(input: VoiceRenderInput): Promise<VoiceRenderResult> {
  try {
    const result = await renderBroadcastVoiceServer({ data: input });

    if (!isSupabaseConfigured || !supabase) {
      // Simulate database insertion locally
      const mockResult = {
        ...result,
        block_id: input.block_id,
        episode_id: input.episode_id,
        show_id: input.show_id,
        script_id: input.script_id,
        station_drop_id: input.station_drop_id,
        ad_slot_id: input.ad_slot_id,
        created_at: new Date().toISOString(),
      };
      localVoiceRenders.unshift(mockResult);
    }
    return result;
  } catch (err: any) {
    console.error("[Voice Service] renderVoiceForScript failed:", err);
    return {
      id: `vr-fail-${Date.now()}`,
      mime_type: "audio/mpeg",
      render_status: "failed",
      render_error: err.message || "Renderer call failure",
      usage_metadata: {},
      metadata: {},
    };
  }
}

export async function renderVoiceForBlock(blockId: string, input: Omit<VoiceRenderInput, "block_id">): Promise<VoiceRenderResult> {
  return renderVoiceForScript({ ...input, block_id: blockId });
}

export async function renderStationDropVoice(
  dropText: string,
  hostTone: string,
  voiceId: string,
  provider: any,
  userId: string
): Promise<VoiceRenderResult> {
  try {
    const result = await renderStationDropVoiceServer({
      data: { dropText, hostTone, voiceId, provider, userId }
    });

    // Save reusable station drop locally or in Supabase
    if (result.render_status === "completed" && result.audio_url) {
      if (isSupabaseConfigured && supabase) {
        await supabase.from("tradio_station_drops").insert({
          user_id: userId,
          title: `Station Drop: "${dropText.slice(0, 30)}..."`,
          audio_url: result.audio_url,
          duration_seconds: result.duration_seconds || 4,
          clearance_status: "cleared",
          metadata: {
            render_id: result.id,
            tone: hostTone,
            voiceId,
            provider,
          }
        });
      } else {
        localStationDrops.unshift({
          id: `drop-${Date.now()}`,
          title: `Station Drop: "${dropText.slice(0, 30)}..."`,
          audio_url: result.audio_url,
          duration_seconds: result.duration_seconds || 4,
          clearance_status: "cleared",
          metadata: {
            render_id: result.id,
            tone: hostTone,
            voiceId,
            provider,
          }
        });
      }
    }

    return result;
  } catch (err: any) {
    return {
      id: `vr-drop-fail-${Date.now()}`,
      mime_type: "audio/mpeg",
      render_status: "failed",
      render_error: err.message || "Station drop generation failed",
      usage_metadata: {},
      metadata: {},
    };
  }
}

export async function renderAdReadVoice(
  adProvider: string,
  durationSeconds: number,
  tone: string,
  voiceId: string,
  provider: any,
  userId: string
): Promise<VoiceRenderResult> {
  try {
    return await renderAdReadVoiceServer({
      data: { adProvider, durationSeconds, tone, voiceId, provider, userId }
    });
  } catch (err: any) {
    return {
      id: `vr-ad-fail-${Date.now()}`,
      mime_type: "audio/mpeg",
      render_status: "failed",
      render_error: err.message || "Ad read generation failed",
      usage_metadata: {},
      metadata: {},
    };
  }
}

export async function attachVoiceRenderToBlock(
  blockId: string,
  renderId: string,
  audioUrl: string,
  durationSeconds: number
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("tradio_show_blocks")
        .update({
          media_url: audioUrl,
          duration_seconds: durationSeconds,
          metadata: {
            attached_voice_render_id: renderId,
            attached_at: new Date().toISOString(),
          }
        })
        .eq("id", blockId);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[Voice Service] Error attaching voice to block:", e);
      return false;
    }
  }

  // Local fallback: update local memory blocks (if possible) or return true
  return true;
}

export async function updateVoiceRenderStatus(id: string, status: VoiceRenderStatus, error?: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error: dbError } = await supabase
        .from("tradio_voice_renders")
        .update({
          render_status: status,
          render_error: error || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (dbError) throw dbError;
      return true;
    } catch (e) {
      console.error("[Voice Service] Error updating status:", e);
      return false;
    }
  }

  const local = localVoiceRenders.find((r) => r.id === id);
  if (local) {
    local.render_status = status;
    local.render_error = error || null;
    return true;
  }
  return false;
}

export async function cancelVoiceRender(id: string): Promise<boolean> {
  return updateVoiceRenderStatus(id, "canceled");
}

export async function getSignedVoiceRenderUrl(path: string): Promise<string | null> {
  return getSignedVoiceRenderUrlClient(path);
}

export async function deleteVoiceRender(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      // Fetch path first to delete from storage
      const render = await getVoiceRenderById(id);
      if (render?.storage_path) {
        await supabase.storage.from("tradio").remove([render.storage_path]);
      }

      const { error } = await supabase
        .from("tradio_voice_renders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[Voice Service] Error deleting render:", e);
      return false;
    }
  }

  const index = localVoiceRenders.findIndex((r) => r.id === id);
  if (index !== -1) {
    localVoiceRenders.splice(index, 1);
    return true;
  }
  return false;
}

export async function listStationDrops(userId: string): Promise<any[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_station_drops")
        .select("*")
        .or(`user_id.eq.${userId},user_id.is.null`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("[Voice Service] Error listing station drops:", e);
      return localStationDrops;
    }
  }
  return localStationDrops;
}
