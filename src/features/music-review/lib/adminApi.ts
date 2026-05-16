/**
 * Exportable admin functions for host Trey TV admin panel integration.
 * Mount these wherever your existing admin actions live.
 */
import { supabase } from '@/lib/supabase';
import { rebuildReviewQueue, setNowPlaying } from './queue/queueLib';
import { finalizeOpenMicItem, retryOpenMicCleanup } from './open-mic/openMicLib';
import { sendReviewEmail } from './email/sendReviewEmail';

export async function getMusicReviewSubmissions(filter?: { status?: string }) {
  let q = supabase.from('music_review_submissions').select('*').order('queue_position', { ascending: true, nullsFirst: false });
  if (filter?.status) q = q.eq('status', filter.status);
  const { data } = await q;
  return data || [];
}

export async function updateSubmissionStatus(id: string, status: string, adminNotes?: string) {
  const patch: any = { status, updated_at: new Date().toISOString() };
  if (adminNotes !== undefined) patch.admin_notes = adminNotes;
  if (status === 'review_complete') patch.reviewed_at = new Date().toISOString();
  await supabase.from('music_review_submissions').update(patch).eq('id', id);
  await rebuildReviewQueue();
}

export async function reorderReviewQueue() {
  await rebuildReviewQueue();
}

export async function markNowPlaying(submissionId: string) {
  await setNowPlaying(submissionId);
}

export async function completeMusicReview(input: {
  submissionId: string;
  userId: string;
  scores: {
    vocals_score: number;
    lyrics_score: number;
    mix_score: number;
    originality_score: number;
    hit_potential_score: number;
    replay_value_score: number;
    marketability_score: number;
  };
  written_summary: string;
  strengths: string[];
  improvements: string[];
  publish: boolean;
}) {
  const s = input.scores;
  const overall = Math.round(
    (s.vocals_score + s.lyrics_score + s.mix_score + s.originality_score +
     s.hit_potential_score + s.replay_value_score + s.marketability_score) / 7
  );
  const { data: sub } = await supabase
    .from('music_review_submissions')
    .select('song_title, artist_name')
    .eq('id', input.submissionId).maybeSingle();

  const { data: score } = await supabase
    .from('music_review_scores')
    .insert({
      submission_id: input.submissionId,
      user_id: input.userId,
      song_title: sub?.song_title,
      artist_name: sub?.artist_name,
      overall_score: overall,
      ...s,
      written_summary: input.written_summary,
      strengths_json: input.strengths,
      improvements_json: input.improvements,
      public_visible: input.publish
    })
    .select()
    .single();

  await supabase
    .from('music_review_submissions')
    .update({ status: 'review_complete', reviewed_at: new Date().toISOString() })
    .eq('id', input.submissionId);

  return score;
}

export async function sendMusicReviewEmail(reviewId: string) {
  const { data: r } = await supabase.from('music_review_scores').select('*').eq('id', reviewId).maybeSingle();
  if (!r) return { ok: false };
  const { data: sub } = await supabase.from('music_review_submissions').select('user_email').eq('id', r.submission_id).maybeSingle();
  const result = await sendReviewEmail({
    reviewId: r.id,
    submissionId: r.submission_id,
    userId: r.user_id,
    recipientEmail: sub?.user_email || '',
    songTitle: r.song_title,
    artistName: r.artist_name,
    overallScore: r.overall_score,
    categories: {
      vocals: r.vocals_score,
      lyrics: r.lyrics_score,
      mix: r.mix_score,
      originality: r.originality_score,
      hit_potential: r.hit_potential_score,
      marketability: r.marketability_score
    },
    summary: r.written_summary
  });
  return result;
}

export async function publishReviewToProfile(reviewId: string, publish = true) {
  await supabase.from('music_review_scores').update({ public_visible: publish }).eq('id', reviewId);
}

export async function getOpenMicQueue() {
  const { data } = await supabase
    .from('open_mic_queue')
    .select('*')
    .in('status', ['queued', 'playing'])
    .order('submitted_at', { ascending: true });
  return data || [];
}

export async function removeOpenMicSong(id: string) {
  await supabase.from('open_mic_queue').update({ status: 'removed' }).eq('id', id);
  await finalizeOpenMicItem(id);
}

export async function skipOpenMicSong(id: string) {
  await supabase.from('open_mic_queue').update({ status: 'skipped' }).eq('id', id);
  await finalizeOpenMicItem(id);
}

export async function retryOpenMicCleanupAction(id: string) {
  return await retryOpenMicCleanup(id);
}

export async function updateMusicReviewSettings(key: string, value: any) {
  const { data } = await supabase.from('music_review_settings').select('id').eq('key', key).maybeSingle();
  if (data) {
    await supabase.from('music_review_settings').update({ value_json: value, updated_at: new Date().toISOString() }).eq('key', key);
  } else {
    await supabase.from('music_review_settings').insert({ key, value_json: value });
  }
}
