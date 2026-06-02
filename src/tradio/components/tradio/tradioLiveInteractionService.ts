import { isSupabaseConfigured, supabase } from '@/tradio/lib/supabaseClient';
import { computePollTallies, type PollOption, type RequestStatus } from './liveInteractionLogic';

export interface ChatMessage { id: string; userId: string; authorName: string | null; body: string; createdAt: string; }
export interface SongRequest { id: string; userId: string; requesterName: string | null; songTitle: string; artist: string | null; message: string | null; status: RequestStatus; createdAt: string; }
export interface LivePoll { id: string; sessionId: string; question: string; options: PollOption[]; status: 'open' | 'closed'; }
export interface PollVote { option_id: string; user_id: string; }

async function uid(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
async function displayName(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  const m = data.user?.user_metadata as Record<string, unknown> | undefined;
  return (m?.display_name as string) || (m?.username as string) || data.user?.email?.split('@')[0] || 'Listener';
}

const ok = isSupabaseConfigured && supabase;

// ── Chat ──────────────────────────────────────────────────────────────────
export async function sendChat(sessionId: string, body: string): Promise<{ error: string | null }> {
  if (!ok) return { error: 'Live chat needs Supabase.' };
  const user = await uid(); if (!user) return { error: 'Sign in to chat.' };
  const { error } = await supabase!.from('tradio_live_chat').insert({ session_id: sessionId, user_id: user, author_name: await displayName(), body: body.trim() });
  return { error: error?.message ?? null };
}
export async function listChat(sessionId: string): Promise<ChatMessage[]> {
  if (!ok) return [];
  const { data } = await supabase!.from('tradio_live_chat').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }).limit(200);
  return (data ?? []).map((r: any) => ({ id: r.id, userId: r.user_id, authorName: r.author_name, body: r.body, createdAt: r.created_at }));
}

// ── Requests ──────────────────────────────────────────────────────────────
export async function submitRequest(input: { sessionId: string; songTitle: string; artist?: string; message?: string }): Promise<{ error: string | null }> {
  if (!ok) return { error: 'Requests need Supabase.' };
  const user = await uid(); if (!user) return { error: 'Sign in to request.' };
  const { error } = await supabase!.from('tradio_live_requests').insert({
    session_id: input.sessionId, user_id: user, requester_name: await displayName(),
    song_title: input.songTitle.trim(), artist: input.artist?.trim() || null, message: input.message?.trim() || null,
  });
  return { error: error?.message ?? null };
}
export async function listRequests(sessionId: string): Promise<SongRequest[]> {
  if (!ok) return [];
  const { data } = await supabase!.from('tradio_live_requests').select('*').eq('session_id', sessionId).order('created_at', { ascending: true }).limit(200);
  return (data ?? []).map((r: any) => ({ id: r.id, userId: r.user_id, requesterName: r.requester_name, songTitle: r.song_title, artist: r.artist, message: r.message, status: r.status, createdAt: r.created_at }));
}
export async function setRequestStatus(requestId: string, status: RequestStatus): Promise<void> {
  if (!ok) return;
  await supabase!.from('tradio_live_requests').update({ status }).eq('id', requestId);
}

// ── Polls ─────────────────────────────────────────────────────────────────
export async function createPoll(input: { sessionId: string; question: string; options: PollOption[] }): Promise<{ error: string | null }> {
  if (!ok) return { error: 'Polls need Supabase.' };
  const user = await uid(); if (!user) return { error: 'Sign in.' };
  const { error } = await supabase!.from('tradio_live_polls').insert({ session_id: input.sessionId, host_user_id: user, question: input.question.trim(), options: input.options, status: 'open' });
  return { error: error?.message ?? null };
}
export async function closePoll(pollId: string): Promise<void> {
  if (!ok) return;
  await supabase!.from('tradio_live_polls').update({ status: 'closed', closed_at: new Date().toISOString() }).eq('id', pollId);
}
export async function getActivePoll(sessionId: string): Promise<LivePoll | null> {
  if (!ok) return null;
  const { data } = await supabase!.from('tradio_live_polls').select('*').eq('session_id', sessionId).eq('status', 'open').order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!data) return null;
  return { id: data.id, sessionId: data.session_id, question: data.question, options: Array.isArray(data.options) ? data.options : [], status: data.status };
}
export async function votePoll(pollId: string, optionId: string): Promise<{ error: string | null }> {
  if (!ok) return { error: 'Voting needs Supabase.' };
  const user = await uid(); if (!user) return { error: 'Sign in to vote.' };
  const { error } = await supabase!.from('tradio_live_poll_votes').upsert({ poll_id: pollId, user_id: user, option_id: optionId }, { onConflict: 'poll_id,user_id' });
  return { error: error?.message ?? null };
}
export async function listVotes(pollId: string): Promise<PollVote[]> {
  if (!ok) return [];
  const { data } = await supabase!.from('tradio_live_poll_votes').select('option_id,user_id').eq('poll_id', pollId);
  return (data ?? []) as PollVote[];
}

export { computePollTallies };
