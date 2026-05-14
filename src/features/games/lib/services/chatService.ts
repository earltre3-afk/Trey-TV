import { supabase } from '@/lib/supabase';

export interface ChatMessageRow {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  seat_index: number | null;
  body: string;
  kind: 'text' | 'quick' | 'emoji' | string;
  created_at: string;
}

export async function fetchChatMessages(roomId: string, sinceIso?: string): Promise<ChatMessageRow[]> {
  let q = supabase
    .from('chat_messages')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })
    .limit(200);
  if (sinceIso) q = q.gt('created_at', sinceIso);
  const { data, error } = await q;
  if (error) {
    console.warn('fetchChatMessages failed', error);
    return [];
  }
  return (data || []) as ChatMessageRow[];
}

export async function sendChatMessage(opts: {
  roomId: string;
  userId: string;
  displayName: string;
  seatIndex: number | null;
  body: string;
  kind?: 'text' | 'quick' | 'emoji';
}): Promise<ChatMessageRow | null> {
  const body = (opts.body || '').trim().slice(0, 280);
  if (!body) return null;
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      room_id: opts.roomId,
      user_id: opts.userId,
      display_name: opts.displayName,
      seat_index: opts.seatIndex,
      body,
      kind: opts.kind || 'text',
    })
    .select()
    .single();
  if (error) {
    console.warn('sendChatMessage failed', error);
    return null;
  }
  return data as ChatMessageRow;
}
