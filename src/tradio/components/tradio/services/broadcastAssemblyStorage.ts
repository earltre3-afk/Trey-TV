import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";

export const ASSEMBLY_BUCKET = "tradio";

export function getAssemblyStoragePath(input: {
  owner_user_id?: string | null;
  show_id?: string | null;
  episode_id?: string | null;
  assembly_id: string;
}) {
  const userId = input.owner_user_id || "00000000-0000-0000-0000-000000000000";
  const showId = input.show_id || "no-show";
  const epId = input.episode_id || "no-episode";
  return `episode-assemblies/${userId}/${showId}/${epId}/${input.assembly_id}.mp3`;
}

/**
 * Server-only function to upload an assembled episode preview file.
 */
export async function uploadEpisodeAssemblyAudioServer(
  path: string,
  audioBuffer: Buffer,
  mimeType: string = "audio/mpeg"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure the bucket exists
    try {
      await supabaseAdmin.storage.createBucket(ASSEMBLY_BUCKET, {
        public: false,
        fileSizeLimit: 52428800, // 50MB limit for full episodes
      });
    } catch {
      // Ignore if bucket already exists
    }

    const { error } = await supabaseAdmin.storage
      .from(ASSEMBLY_BUCKET)
      .upload(path, audioBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;

    // Get 24 hour signed playback URL
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(ASSEMBLY_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24);

    if (signedError) throw signedError;

    return {
      success: true,
      url: signedData.signedUrl,
    };
  } catch (err: any) {
    console.error("[Assembly Storage] Server Upload Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Server-only helper to generate a signed playback URL.
 */
export async function getSignedAssemblyUrlServer(
  path: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from(ASSEMBLY_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  } catch (err) {
    console.error("[Assembly Storage] Server Signed URL Error:", err);
    return null;
  }
}

/**
 * Client-safe helper to fetch a signed assembly URL from the browser.
 */
export async function getSignedAssemblyUrlClient(
  path: string
): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(ASSEMBLY_BUCKET)
        .createSignedUrl(path, 3600);
      if (error) throw error;
      return data?.signedUrl || null;
    } catch {
      return null;
    }
  }
  return null;
}
