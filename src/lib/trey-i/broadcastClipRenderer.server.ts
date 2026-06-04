/**
 * Tradio Broadcast Studio Pass 9B: Real FFmpeg Clip Rendering
 * Server-side clip rendering with FFmpeg for audio trimming and MP3 export
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import path from 'path';
import { supabaseAdmin } from '@/integrations/supabase/client.server';

const execAsync = promisify(exec);
const supabase = supabaseAdmin;

interface RenderClipInput {
  clip_id: string;
  recording_id: string;
  source_audio_path: string; // Path to full recording audio file
  start_time_seconds: number;
  end_time_seconds: number;
  owner_user_id: string;
}

interface RenderClipResult {
  success: boolean;
  clip_id: string;
  output_path?: string;
  audio_url?: string;
  duration_seconds?: number;
  error?: string;
}

/**
 * Check if FFmpeg is available on the system
 */
export async function isFFmpegAvailable(): Promise<boolean> {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Render a highlight clip from a full recording
 * Trims the audio and exports to MP3
 */
export async function renderHighlightClipServer(
  input: RenderClipInput,
): Promise<RenderClipResult> {
  const clipId = input.clip_id;

  try {
    // Verify FFmpeg is available
    const ffmpegAvailable = await isFFmpegAvailable();
    if (!ffmpegAvailable) {
      await updateClipRenderStatusServer(clipId, 'failed', {
        error: 'FFmpeg not available on this server',
      });
      return {
        success: false,
        clip_id: clipId,
        error: 'FFmpeg not available. Clip rendering is not supported in this environment.',
      };
    }

    // Validate trim parameters
    const duration = input.end_time_seconds - input.start_time_seconds;
    if (duration < 5) {
      await updateClipRenderStatusServer(clipId, 'failed', {
        error: 'Clip too short. Minimum 5 seconds.',
      });
      return {
        success: false,
        clip_id: clipId,
        error: 'Clip duration must be at least 5 seconds',
      };
    }

    if (duration > 3600) {
      await updateClipRenderStatusServer(clipId, 'failed', {
        error: 'Clip too long. Maximum 1 hour.',
      });
      return {
        success: false,
        clip_id: clipId,
        error: 'Clip duration cannot exceed 1 hour',
      };
    }

    // Update status to rendering
    await updateClipRenderStatusServer(clipId, 'rendering');

    // Create temporary output file path
    const tempDir = '/tmp/tradio-clips';
    await fs.mkdir(tempDir, { recursive: true });
    const tempOutputPath = path.join(tempDir, `${clipId}-render.mp3`);

    // Run FFmpeg command to trim and export
    const ffmpegCmd = `ffmpeg -i "${input.source_audio_path}" -ss ${input.start_time_seconds} -t ${duration} -q:a 5 -f mp3 "${tempOutputPath}" -loglevel error -y`;

    console.log('[ClipRenderer] Rendering clip:', clipId);
    await execAsync(ffmpegCmd, { timeout: 60000 }); // 60 second timeout

    // Verify output file exists
    const stats = await fs.stat(tempOutputPath);
    if (stats.size === 0) {
      throw new Error('FFmpeg produced empty output file');
    }

    // Upload to Supabase storage
    const fileBuffer = await fs.readFile(tempOutputPath);
    const storagePath = `tradio/live-clips/${input.owner_user_id}/${input.recording_id}/${clipId}.mp3`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('tradio')
      .upload(storagePath, fileBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL for the rendered clip
    const { data: urlData } = supabase.storage
      .from('tradio')
      .getPublicUrl(storagePath);

    const audioUrl = urlData?.publicUrl;

    // Update clip record with rendered status and URL
    await updateClipRenderStatusServer(clipId, 'rendered', {
      storage_path: storagePath,
      audio_url: audioUrl,
      duration_seconds: duration,
    });

    // Clean up temporary file
    try {
      await fs.unlink(tempOutputPath);
    } catch {
      console.warn('[ClipRenderer] Could not delete temp file:', tempOutputPath);
    }

    console.log('[ClipRenderer] Successfully rendered clip:', clipId);

    return {
      success: true,
      clip_id: clipId,
      output_path: storagePath,
      audio_url: audioUrl,
      duration_seconds: duration,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[ClipRenderer] Render failed for clip', clipId, ':', errorMessage);

    await updateClipRenderStatusServer(clipId, 'failed', {
      error: errorMessage,
    });

    return {
      success: false,
      clip_id: clipId,
      error: `Clip rendering failed: ${errorMessage}`,
    };
  }
}

/**
 * Update clip render status in database
 */
async function updateClipRenderStatusServer(
  clipId: string,
  status: 'rendering' | 'rendered' | 'failed',
  extraData?: Record<string, unknown>,
): Promise<void> {
  const updateData: Record<string, unknown> = {
    clip_status: status === 'rendered' ? 'rendered' : status === 'rendering' ? 'rendering' : 'failed',
    updated_at: new Date().toISOString(),
    ...extraData,
  };

  const { error } = await (supabase as any)
    .from('tradio_live_highlight_clips')
    .update(updateData)
    .eq('id', clipId);

  if (error) {
    console.error('[ClipRenderer] Failed to update clip status:', error.message);
  }
}

/**
 * Create a background job for clip rendering
 */
export async function createClipRenderJobServer(input: {
  clip_id: string;
  recording_id: string;
  owner_user_id: string;
}): Promise<{ job_id: string; error?: string }> {
  const { data, error } = await (supabase as any)
    .from('tradio_live_archive_jobs')
    .insert({
      owner_user_id: input.owner_user_id,
      clip_id: input.clip_id,
      recording_id: input.recording_id,
      job_type: 'clip_render',
      job_status: 'queued',
      input_payload: {
        clip_id: input.clip_id,
        recording_id: input.recording_id,
      },
    })
    .select('id')
    .single();

  if (error) return { job_id: '', error: error.message };
  return { job_id: data?.id || '' };
}
