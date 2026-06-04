import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";

export const VOICE_RENDER_BUCKET = "tradio";

export function getVoiceRenderStoragePath(input: {
  owner_user_id?: string | null;
  show_id?: string | null;
  episode_id?: string | null;
  render_id: string;
}) {
  const userId = input.owner_user_id || "00000000-0000-0000-0000-000000000000";
  const showId = input.show_id || "no-show";
  const epId = input.episode_id || "no-episode";
  return `voice-renders/${userId}/${showId}/${epId}/${input.render_id}.mp3`;
}

/**
 * Server-only function to upload a voice render audio buffer.
 */
export async function uploadVoiceRenderAudioServer(
  path: string,
  audioBuffer: Buffer,
  mimeType: string = "audio/mpeg"
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Dynamically import the server client to prevent bundling on the client-side
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure the bucket exists in storage
    try {
      await supabaseAdmin.storage.createBucket(VOICE_RENDER_BUCKET, {
        public: false,
        fileSizeLimit: 10485760, // 10MB limit
      });
    } catch {
      // Ignore if bucket already exists
    }

    const { error } = await supabaseAdmin.storage
      .from(VOICE_RENDER_BUCKET)
      .upload(path, audioBuffer, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) throw error;

    // Get signed URL for preview/playback
    const { data: signedData, error: signedError } = await supabaseAdmin.storage
      .from(VOICE_RENDER_BUCKET)
      .createSignedUrl(path, 60 * 60 * 24); // 24 hours signed URL

    if (signedError) throw signedError;

    return {
      success: true,
      url: signedData.signedUrl,
    };
  } catch (err: any) {
    console.error("[Voice Render Storage] Server Upload Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Server-only helper to generate a signed playback URL.
 */
export async function getSignedVoiceRenderUrlServer(
  path: string,
  expiresInSeconds: number = 3600
): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.storage
      .from(VOICE_RENDER_BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error) throw error;
    return data.signedUrl;
  } catch (err) {
    console.error("[Voice Render Storage] Server Signed URL Error:", err);
    return null;
  }
}

/**
 * Client-safe helper to fetch a signed URL (calls a server function or client client).
 */
export async function getSignedVoiceRenderUrlClient(
  path: string
): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(VOICE_RENDER_BUCKET)
        .createSignedUrl(path, 3600);
      if (error) throw error;
      return data?.signedUrl || null;
    } catch {
      return null;
    }
  }
  return null;
}
