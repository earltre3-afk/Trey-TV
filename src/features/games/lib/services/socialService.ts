/* eslint-disable @typescript-eslint/no-explicit-any */
// Trey TV friends + game requests (inbox) service.

import { supabase } from '@/lib/supabase';
import { PlayerIdentity } from './identity';
import { GameType } from './roomService';

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';

export interface GameRequest {
  id: string;
  from_user_id: string;
  from_display_name: string;
  to_user_id: string;
  to_display_name: string | null;
  game_type: GameType;
  room_id: string | null;
  room_code: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: string;
  responded_at: string | null;
  expires_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_user_id: string;
  friend_display_name: string;
  created_at: string;
}

/* ----- friends ----- */

export async function listFriends(userId: string): Promise<Friend[]> {
  const { data } = await supabase
    .from('game_friends')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  return (data || []) as Friend[];
}

export async function addFriendByName(identity: PlayerIdentity, friendUserId: string, friendDisplayName: string): Promise<Friend | null> {
  const { data, error } = await supabase
    .from('game_friends')
    .insert({
      user_id: identity.userId,
      friend_user_id: friendUserId,
      friend_display_name: friendDisplayName,
    })
    .select()
    .single();
  if (error) return null;
  return data as Friend;
}

export async function removeFriend(id: string): Promise<void> {
  await supabase.from('game_friends').delete().eq('id', id);
}

// Quick way to "find" a user by display name (case-insensitive). Returns
// the most recently seen user_id with that name. In production this would
// be a real user-search API.
export async function findUserByDisplayName(name: string): Promise<{ user_id: string; display_name: string } | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const { data } = await supabase
    .from('game_room_players')
    .select('user_id,display_name,last_seen_at')
    .ilike('display_name', trimmed)
    .order('last_seen_at', { ascending: false })
    .limit(1);
  const row = (data || [])[0] as any;
  if (!row) return null;
  return { user_id: row.user_id, display_name: row.display_name };
}

/* ----- requests / inbox ----- */

export async function sendGameRequest(opts: {
  from: PlayerIdentity;
  toUserId: string;
  toDisplayName?: string;
  gameType: GameType;
  roomId?: string | null;
  roomCode?: string | null;
  message?: string;
}): Promise<GameRequest> {
  const { data, error } = await supabase
    .from('game_requests')
    .insert({
      from_user_id: opts.from.userId,
      from_display_name: opts.from.displayName,
      to_user_id: opts.toUserId,
      to_display_name: opts.toDisplayName ?? null,
      game_type: opts.gameType,
      room_id: opts.roomId ?? null,
      room_code: opts.roomCode ?? null,
      message: opts.message ?? null,
      status: 'pending',
    })
    .select()
    .single();
  if (error) throw error;
  return data as GameRequest;
}

export async function listInbox(userId: string): Promise<GameRequest[]> {
  const { data } = await supabase
    .from('game_requests')
    .select('*')
    .eq('to_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return (data || []) as GameRequest[];
}

export async function listOutgoing(userId: string): Promise<GameRequest[]> {
  const { data } = await supabase
    .from('game_requests')
    .select('*')
    .eq('from_user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return (data || []) as GameRequest[];
}

export async function acceptRequest(id: string): Promise<GameRequest | null> {
  const { data } = await supabase
    .from('game_requests')
    .update({ status: 'accepted', responded_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  return (data as GameRequest) || null;
}

export async function declineRequest(id: string): Promise<void> {
  await supabase
    .from('game_requests')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', id);
}

export async function cancelOutgoingRequest(id: string): Promise<void> {
  await supabase
    .from('game_requests')
    .update({ status: 'cancelled', responded_at: new Date().toISOString() })
    .eq('id', id);
}

export async function getPendingInboxCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('game_requests')
      .select('*', { count: 'exact', head: true })
      .eq('to_user_id', userId)
      .eq('status', 'pending');
    if (error) return 0;
    return count || 0;
  } catch {
    return 0;
  }
}
