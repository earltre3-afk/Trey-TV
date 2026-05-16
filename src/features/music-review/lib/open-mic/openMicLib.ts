import { supabase } from '@/lib/supabase';

export const OPEN_MIC_MAX_QUEUE = 10;
export const OPEN_MIC_MAX_PER_DAY = 2;

export async function getDailyCount(userId: string): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await supabase
    .from('open_mic_daily_limits')
    .select('submission_count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();
  return data?.submission_count ?? 0;
}

export async function incrementDailyCount(userId: string) {
  try {
    const { error } = await supabase.rpc('increment_open_mic_daily_count', { p_user_id: userId });
    if (!error) return;
  } catch {
    // Isolated preview fallback below.
  }

  if (import.meta.env.PROD) {
    console.warn('[Trey TV Music Review] increment_open_mic_daily_count RPC missing. Client daily-limit mutation disabled in production.');
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const current = await getDailyCount(userId);
  if (current === 0) {
    await supabase.from('open_mic_daily_limits').insert({
      user_id: userId, date: today, submission_count: 1
    });
  } else {
    await supabase
      .from('open_mic_daily_limits')
      .update({ submission_count: current + 1, updated_at: new Date().toISOString() })
      .eq('user_id', userId).eq('date', today);
  }
}

export async function getActiveQueueCount(): Promise<number> {
  const { count } = await supabase
    .from('open_mic_queue')
    .select('*', { count: 'exact', head: true })
    .in('status', ['queued', 'playing']);
  return count ?? 0;
}

/**
 * Finalize an Open Mic item after it has played. Moves audio to history table,
 * deletes the storage object, and marks cleanup status.
 */
export async function finalizeOpenMicItem(itemId: string) {
  try {
    const { data, error } = await supabase.rpc('finalize_open_mic_item', { p_item_id: itemId });
    if (!error) return { ok: true, cleanup_failed: Boolean((data as any)?.cleanup_failed) };
  } catch {
    // Isolated preview fallback below.
  }

  if (import.meta.env.PROD) {
    console.warn('[Trey TV Music Review] finalize_open_mic_item RPC missing. Client cleanup fallback disabled in production.');
    return { ok: false, error: 'server_finalize_missing' };
  }

  const { data: item } = await supabase
    .from('open_mic_queue')
    .select('*')
    .eq('id', itemId)
    .maybeSingle();
  if (!item) return { ok: false, error: 'not_found' };

  const endedAt = new Date().toISOString();

  await supabase.from('open_mic_play_history').insert({
    user_id: item.user_id,
    open_mic_queue_id: item.id,
    song_title: item.song_title,
    artist_name: item.artist_name,
    submitted_at: item.submitted_at,
    played_at: item.started_at,
    ended_at: endedAt,
    audio_duration: item.audio_duration,
    storage_deleted: true,
    file_deleted_at: endedAt,
    moderation_status: item.moderation_status
  });

  let cleanupFailed = false;
  try {
    if (item.audio_storage_path) {
      const { error } = await supabase.storage
        .from('open-mic-temp-audio')
        .remove([item.audio_storage_path]);
      if (error) cleanupFailed = true;
    }
  } catch {
    cleanupFailed = true;
  }

  await supabase
    .from('open_mic_queue')
    .update({
      status: 'played',
      ended_at: endedAt,
      file_deleted_at: cleanupFailed ? null : endedAt,
      storage_deleted: !cleanupFailed,
      cleanup_failed: cleanupFailed,
      audio_storage_path: cleanupFailed ? item.audio_storage_path : null
    })
    .eq('id', itemId);

  return { ok: true, cleanup_failed: cleanupFailed };
}

export async function retryOpenMicCleanup(itemId: string) {
  const { data: item } = await supabase
    .from('open_mic_queue')
    .select('audio_storage_path')
    .eq('id', itemId)
    .maybeSingle();
  if (!item?.audio_storage_path) return { ok: true };
  const { error } = await supabase.storage
    .from('open-mic-temp-audio')
    .remove([item.audio_storage_path]);
  if (error) return { ok: false, error: error.message };
  await supabase
    .from('open_mic_queue')
    .update({
      cleanup_failed: false,
      storage_deleted: true,
      audio_storage_path: null,
      file_deleted_at: new Date().toISOString()
    })
    .eq('id', itemId);
  return { ok: true };
}
