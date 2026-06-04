import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { assembleEpisodePreviewServer } from "../../../../lib/trey-i/broadcastAssembly.server";
import { buildEpisodeTimelineManifest, validateTimelineForAssembly } from "./broadcastAssemblyManifest";
import { getSignedAssemblyUrlClient } from "./broadcastAssemblyStorage";
import { TradioShowBlock } from "../types/broadcast";
import { TimelineManifest, RenderSettings, EpisodeAssembly, AssemblyStatus, AssemblyType, TimelineValidationResult } from "../types/broadcastAssemblyTypes";

// Local cache for in-memory offline fallback
let localAssemblies: EpisodeAssembly[] = [];

/**
 * Builds the timeline manifest.
 */
export function buildManifest(showId: string, episodeId: string, blocks: TradioShowBlock[]): TimelineManifest {
  return buildEpisodeTimelineManifest(showId, episodeId, blocks);
}

/**
 * Validates the timeline for assembly.
 */
export async function validateTimeline(episodeId: string, blocks: TradioShowBlock[], userRole = "artist"): Promise<TimelineValidationResult> {
  return validateTimelineForAssembly(episodeId, blocks, userRole);
}

/**
 * Creates and triggers a full episode assembly.
 */
export async function generateEpisodeAssemblyPreview(
  showId: string,
  episodeId: string,
  blocks: TradioShowBlock[],
  settings: RenderSettings,
  assemblyType: AssemblyType = "preview"
): Promise<EpisodeAssembly> {
  let userId = "00000000-0000-0000-0000-000000000000";
  let userRole = "artist";

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;

        // Fetch role
        const { data: roleData } = await supabase
          .from("tradio_user_roles")
          .select("role")
          .eq("user_id", userId)
          .maybeSingle();
        if (roleData?.role) userRole = roleData.role;
      }
    } catch {
      // ignore, proceed
    }
  }

  // 1. Build manifest
  const manifest = buildEpisodeTimelineManifest(showId, episodeId, blocks);

  // 2. Call server assembler function
  try {
    const result = await assembleEpisodePreviewServer({
      data: {
        showId,
        episodeId,
        ownerUserId: userId,
        manifest,
        settings,
        assemblyType,
      }
    });

    if (!isSupabaseConfigured || !supabase) {
      localAssemblies.unshift(result);
    }
    return result;
  } catch (err: any) {
    console.error("[Assembly Service] Assembly trigger failed:", err);
    return {
      id: `asmb-fail-${Date.now()}`,
      owner_user_id: userId,
      show_id: showId,
      episode_id: episodeId,
      assembly_status: "failed",
      assembly_type: assemblyType,
      mime_type: "audio/mpeg",
      block_count: blocks.length,
      source_manifest: manifest,
      render_settings: settings,
      render_error: err.message || "Endpoint call failed.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}

/**
 * Retrieves a single assembly by ID.
 */
export async function getEpisodeAssemblyById(id: string): Promise<EpisodeAssembly | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_episode_assemblies")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      let audioUrl = data.output_audio_url;
      if (data.output_storage_path && (!audioUrl || audioUrl.includes("supabase.co/storage"))) {
        const signed = await getSignedAssemblyUrlClient(data.output_storage_path);
        if (signed) audioUrl = signed;
      }

      return {
        id: data.id,
        owner_user_id: data.owner_user_id,
        show_id: data.show_id,
        episode_id: data.episode_id,
        assembly_status: data.assembly_status as AssemblyStatus,
        assembly_type: data.assembly_type as AssemblyType,
        output_audio_url: audioUrl,
        output_storage_path: data.output_storage_path,
        mime_type: data.mime_type || "audio/mpeg",
        duration_seconds: Number(data.duration_seconds),
        sample_rate: data.sample_rate,
        loudness_lufs: Number(data.loudness_lufs),
        peak_db: Number(data.peak_db),
        block_count: data.block_count || 0,
        source_manifest: data.source_manifest || {},
        render_settings: data.render_settings || {},
        render_error: data.render_error,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (e) {
      console.error("[Assembly Service] Error getting assembly:", e);
    }
  }

  const local = localAssemblies.find((a) => a.id === id);
  return local || null;
}

/**
 * Lists all assemblies for a given episode.
 */
export async function listEpisodeAssembliesForEpisode(episodeId: string): Promise<EpisodeAssembly[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_episode_assemblies")
        .select("*")
        .eq("episode_id", episodeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        owner_user_id: row.owner_user_id,
        show_id: row.show_id,
        episode_id: row.episode_id,
        assembly_status: row.assembly_status as AssemblyStatus,
        assembly_type: row.assembly_type as AssemblyType,
        output_audio_url: row.output_audio_url,
        output_storage_path: row.output_storage_path,
        mime_type: row.mime_type || "audio/mpeg",
        duration_seconds: Number(row.duration_seconds),
        sample_rate: row.sample_rate,
        loudness_lufs: Number(row.loudness_lufs),
        peak_db: Number(row.peak_db),
        block_count: row.block_count || 0,
        source_manifest: row.source_manifest || {},
        render_settings: row.render_settings || {},
        render_error: row.render_error,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }));
    } catch (e) {
      console.error("[Assembly Service] Error listing assemblies:", e);
      return [];
    }
  }

  return localAssemblies.filter((a) => a.episode_id === episodeId);
}

/**
 * Updates an assembly status.
 */
export async function updateEpisodeAssemblyStatus(
  id: string,
  status: AssemblyStatus,
  error?: string
): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error: dbError } = await supabase
        .from("tradio_episode_assemblies")
        .update({
          assembly_status: status,
          render_error: error || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (dbError) throw dbError;
      return true;
    } catch (e) {
      console.error("[Assembly Service] Error updating status:", e);
      return false;
    }
  }

  const local = localAssemblies.find((a) => a.id === id);
  if (local) {
    local.assembly_status = status;
    local.render_error = error || null;
    return true;
  }
  return false;
}

/**
 * Cancels a queued or in-progress assembly.
 */
export async function cancelEpisodeAssembly(id: string): Promise<boolean> {
  return updateEpisodeAssemblyStatus(id, "canceled");
}

/**
 * Retrieves a browser-safe signed playback stream URL.
 */
export async function getSignedAssemblyUrl(path: string): Promise<string | null> {
  return getSignedAssemblyUrlClient(path);
}

/**
 * Deletes an assembly and purges its storage file.
 */
export async function deleteEpisodeAssembly(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const assembly = await getEpisodeAssemblyById(id);
      if (assembly?.output_storage_path) {
        await supabase.storage.from("tradio").remove([assembly.output_storage_path]);
      }

      const { error } = await supabase
        .from("tradio_episode_assemblies")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[Assembly Service] Error deleting assembly:", e);
      return false;
    }
  }

  const index = localAssemblies.findIndex((a) => a.id === id);
  if (index !== -1) {
    localAssemblies.splice(index, 1);
    return true;
  }
  return false;
}

/**
 * Marks an assembly as a reviewed final candidate ready for slot broadcasting.
 */
export async function markAssemblyReadyForReview(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("tradio_episode_assemblies")
        .update({
          assembly_type: "review" as AssemblyType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error("[Assembly Service] Error marking ready for review:", e);
      return false;
    }
  }

  const local = localAssemblies.find((a) => a.id === id);
  if (local) {
    local.assembly_type = "review";
    return true;
  }
  return false;
}
