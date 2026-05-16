import { supabase } from '@/lib/supabase';

const paidWeight = (t: string | null | undefined, paid: boolean) => {
  if (!paid) return 0;
  if (t === 'front') return 100;
  if (t === 'hot') return 50;
  if (t === 'quick') return 10;
  return 0;
};

/**
 * Recompute queue_position. In production, prefer the SQL SECURITY DEFINER RPC
 * `rebuild_music_review_queue()` from the hardening migration so clients do not
 * reorder global queues directly. The local fallback exists only for standalone
 * module previews and legacy Famous.ai exports.
 */
export async function rebuildReviewQueue() {
  try {
    const { error } = await supabase.rpc('rebuild_music_review_queue');
    if (!error) return;
  } catch {
    // Continue to isolated fallback.
  }

  if (import.meta.env.PROD) {
    console.warn('[Trey TV Music Review] Queue RPC missing. Direct client queue rebuild is disabled in production.');
    return;
  }

  const { data, error } = await supabase
    .from('music_review_submissions')
    .select('id, priority_tier, priority_paid, created_at, status')
    .in('status', ['in_queue', 'ai_prechecked', 'pending', 'now_playing', 'under_review']);
  if (error || !data) return;

  const sorted = [...data].sort((a, b) => {
    const wa = paidWeight(a.priority_tier, a.priority_paid);
    const wb = paidWeight(b.priority_tier, b.priority_paid);
    if (wb !== wa) return wb - wa;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  for (let i = 0; i < sorted.length; i++) {
    await supabase
      .from('music_review_submissions')
      .update({ queue_position: i + 1 })
      .eq('id', sorted[i].id);
  }
}

export async function setNowPlaying(submissionId: string) {
  try {
    const { error } = await supabase.rpc('set_music_review_now_playing', { p_submission_id: submissionId });
    if (!error) return;
  } catch {
    // Continue to isolated fallback.
  }

  if (import.meta.env.PROD) {
    console.warn('[Trey TV Music Review] set_music_review_now_playing RPC missing. Direct client mutation disabled in production.');
    return;
  }

  await supabase
    .from('music_review_submissions')
    .update({ status: 'in_queue', queue_position: null })
    .eq('status', 'now_playing');
  await supabase
    .from('music_review_submissions')
    .update({ status: 'now_playing' })
    .eq('id', submissionId);
}
