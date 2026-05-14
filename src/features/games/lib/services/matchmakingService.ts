/* eslint-disable @typescript-eslint/no-explicit-any */
// Trey TV Matchmaking & Queue service.
// Polling-based to match the rest of the room sync model.
//
// Concepts:
// - A queue_entry is a player saying "I want to play X."
// - The match resolver tries to assign each searching entry into an open
//   waiting room (or creates one), respecting smart fill priority.
// - When current_players hits max_players, status flips to matched and
//   matched_room_id is set. Client polls and routes to the room.

import { supabase } from '@/lib/supabase';
import { PlayerIdentity, generateRoomCode } from './identity';
import {
  GameType, MAX_PLAYERS_BY_GAME, RoomRow,
} from './roomService';

export type QueueStatus = 'searching' | 'matched' | 'cancelled';
export type QueueMode = 'public' | 'friends' | 'solo';

export interface QueueEntry {
  id: string;
  user_id: string;
  display_name: string;
  game_type: GameType;
  mode: QueueMode;
  status: QueueStatus;
  matched_room_id: string | null;
  party_id: string | null;
  enqueued_at: string;
  last_seen_at: string;
  matched_at: string | null;
}

// Min players to start a Bullshit room (3) — flexible vs Spades (always 4).
export const MIN_TO_START: Record<GameType, number> = {
  spades: 4,
  blackjack: 1,
  bullshit: 3,
};

export interface QueueSnapshot {
  myEntry: QueueEntry | null;
  positionInGame: number;        // 1-based position in this game's queue
  waitingInGame: number;          // total searching for this game
  formingRooms: Array<{ id: string; current: number; max: number }>;
  matchedRoomId: string | null;
}

/* -------------------- enqueue / cancel -------------------- */

export async function joinQueue(opts: {
  identity: PlayerIdentity;
  gameType: GameType;
  mode?: QueueMode;
  partyId?: string;
}): Promise<QueueEntry> {
  // cancel any prior searching entry for same user
  await supabase
    .from('game_queue_entries')
    .update({ status: 'cancelled' })
    .eq('user_id', opts.identity.userId)
    .eq('status', 'searching');

  const { data, error } = await supabase
    .from('game_queue_entries')
    .insert({
      user_id: opts.identity.userId,
      display_name: opts.identity.displayName,
      game_type: opts.gameType,
      mode: opts.mode ?? 'public',
      status: 'searching',
      party_id: opts.partyId ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as QueueEntry;
}

export async function cancelQueue(userId: string): Promise<void> {
  await supabase
    .from('game_queue_entries')
    .update({ status: 'cancelled' })
    .eq('user_id', userId)
    .eq('status', 'searching');
}

export async function heartbeatQueue(entryId: string): Promise<void> {
  await supabase
    .from('game_queue_entries')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', entryId);
}

/* -------------------- snapshot for UI -------------------- */

export async function getQueueSnapshot(userId: string, gameType: GameType): Promise<QueueSnapshot> {
  // fetch all currently-searching entries for this game, oldest first
  const { data: entries } = await supabase
    .from('game_queue_entries')
    .select('*')
    .eq('game_type', gameType)
    .in('status', ['searching', 'matched'])
    .order('enqueued_at', { ascending: true })
    .limit(200);

  const list = (entries || []) as QueueEntry[];
  const myEntry = list.find(e => e.user_id === userId) || null;

  // searching-only for position math
  const searching = list.filter(e => e.status === 'searching');
  const positionInGame = myEntry
    ? Math.max(1, searching.findIndex(e => e.user_id === userId) + 1)
    : 0;

  // forming rooms = waiting rooms for this game with seats open
  const { data: rooms } = await supabase
    .from('game_rooms')
    .select('id,current_players,max_players,status,game_type,is_private')
    .eq('game_type', gameType)
    .eq('status', 'waiting')
    .eq('is_private', false)
    .order('current_players', { ascending: false })
    .limit(20);

  const formingRooms = ((rooms || []) as any[])
    .filter(r => r.current_players < r.max_players)
    .map(r => ({ id: r.id as string, current: r.current_players as number, max: r.max_players as number }));

  return {
    myEntry,
    positionInGame,
    waitingInGame: searching.length,
    formingRooms,
    matchedRoomId: myEntry?.matched_room_id ?? null,
  };
}

export async function getQueueCounts(): Promise<Record<GameType, number>> {
  const { data } = await supabase
    .from('game_queue_entries')
    .select('game_type,status')
    .eq('status', 'searching')
    .limit(500);
  const counts: Record<GameType, number> = { spades: 0, blackjack: 0, bullshit: 0 };
  for (const r of (data || []) as any[]) {
    if (counts[r.game_type as GameType] !== undefined) counts[r.game_type as GameType]++;
  }
  return counts;
}

/* -------------------- match resolver -------------------- */

// Runs from the client every poll tick. Safe to run from many clients —
// the worst case is two clients both assign the same player; the second
// update will be a no-op because we filter on status='searching'.
//
// Priority:
//   1. Fill rooms that already have (max - 1) players (only need one more).
//   2. Then fill rooms with the most players already seated.
//   3. Then create a new room.
//   4. Within those, prioritize oldest waiting players.
export async function resolveMatchesForGame(gameType: GameType, hostIdentity: PlayerIdentity): Promise<number> {
  const max = MAX_PLAYERS_BY_GAME[gameType];

  // Blackjack: instant solo route — we never need >1 seat in a multiplayer room
  // here (the blackjack engine is single-player vs dealer). Just spin up rooms
  // 1-by-1 for whoever's queued.
  // Spades: needs exactly 4.
  // Bullshit: needs 3..max. Match aggressively at max, but also OK to start
  // a round if 3 humans have been waiting > 25s. For UI simplicity we just
  // match at max here; queues are small.

  // 1. fetch oldest searching entries
  const { data: queued } = await supabase
    .from('game_queue_entries')
    .select('*')
    .eq('game_type', gameType)
    .eq('status', 'searching')
    .eq('mode', 'public')
    .order('enqueued_at', { ascending: true })
    .limit(40);

  const entries = ((queued || []) as QueueEntry[]).slice();
  if (entries.length === 0) return 0;

  // Blackjack: each entry gets its own room (solo vs dealer)
  if (gameType === 'blackjack') {
    let n = 0;
    for (const e of entries) {
      const room = await createMatchedRoom(gameType, e);
      await assignEntryToRoom(e, room.id);
      n++;
    }
    return n;
  }

  // 2. fetch existing public waiting rooms for this game, fullest first
  const { data: rooms } = await supabase
    .from('game_rooms')
    .select('*')
    .eq('game_type', gameType)
    .eq('status', 'waiting')
    .eq('is_private', false)
    .order('current_players', { ascending: false })
    .limit(20);

  const openRooms = ((rooms || []) as RoomRow[]).filter(r => r.current_players < r.max_players);

  let matched = 0;

  for (const room of openRooms) {
    // compute remaining seats by counting real (non-bot) players seated
    const { data: seated } = await supabase
      .from('game_room_players')
      .select('seat_index,is_bot,user_id')
      .eq('room_id', room.id);

    const realSeats = (seated || []).filter((p: any) => !p.is_bot);
    let remaining = room.max_players - realSeats.length;
    if (remaining <= 0) continue;

    for (const e of entries) {
      if (e.status !== 'searching') continue;
      if (remaining <= 0) break;
      // skip if user already seated
      if (realSeats.some((p: any) => p.user_id === e.user_id)) continue;

      const seat = nextOpenSeat(seated || [], room.max_players);
      if (seat < 0) break;
      const inserted = await seatPlayerInRoom(room, seat, e);
      if (inserted) {
        await assignEntryToRoom(e, room.id);
        e.status = 'matched';
        realSeats.push({ seat_index: seat, is_bot: false, user_id: e.user_id });
        remaining--;
        matched++;
      }
    }
  }

  // 3. for whoever's still searching, create new rooms in groups of `max`
  const stillSearching = entries.filter(e => e.status === 'searching');
  let i = 0;
  while (i < stillSearching.length) {
    const group = stillSearching.slice(i, i + max);
    if (group.length === 0) break;
    // Only spin up a new room if we have at least min players OR we're spinning
    // up a "host" room that future entries will join.
    const host = group[0];
    const room = await createMatchedRoom(gameType, host);
    // seat host
    await seatPlayerInRoom(room, 0, host);
    await assignEntryToRoom(host, room.id);
    matched++;
    // seat the rest of the group
    for (let j = 1; j < group.length; j++) {
      const e = group[j];
      const { data: seated2 } = await supabase
        .from('game_room_players')
        .select('seat_index,is_bot,user_id')
        .eq('room_id', room.id);
      const seat = nextOpenSeat(seated2 || [], room.max_players);
      if (seat < 0) break;
      const ok = await seatPlayerInRoom(room, seat, e);
      if (ok) {
        await assignEntryToRoom(e, room.id);
        matched++;
      }
    }
    i += max;
  }

  return matched;
}

function nextOpenSeat(seated: any[], maxPlayers: number): number {
  const taken = new Set(seated.map(p => p.seat_index));
  for (let i = 0; i < maxPlayers; i++) if (!taken.has(i)) return i;
  return -1;
}

async function seatPlayerInRoom(room: RoomRow, seat: number, e: QueueEntry): Promise<boolean> {
  const { error } = await supabase
    .from('game_room_players')
    .insert({
      room_id: room.id,
      user_id: e.user_id,
      display_name: e.display_name,
      seat_index: seat,
      team_index: room.game_type === 'spades' ? (seat % 2) : null,
      is_bot: false,
      is_host: false,
      is_ready: true,
      is_connected: true,
    });
  if (error) {
    // race condition (duplicate seat) — ignore
    return false;
  }
  // bump current_players from row count
  const { count } = await supabase
    .from('game_room_players')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', room.id);
  await supabase
    .from('game_rooms')
    .update({ current_players: count ?? room.current_players + 1, last_activity_at: new Date().toISOString() })
    .eq('id', room.id);
  return true;
}

async function createMatchedRoom(gameType: GameType, host: QueueEntry): Promise<RoomRow> {
  const max = MAX_PLAYERS_BY_GAME[gameType];
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        room_code: code,
        game_type: gameType,
        status: 'waiting',
        host_user_id: host.user_id,
        host_display_name: host.display_name,
        max_players: max,
        current_players: 0,
        is_private: false,
        target_score: 500,
      })
      .select()
      .single();
    if (!error && data) return data as RoomRow;
  }
  throw new Error('Could not create matched room');
}

async function assignEntryToRoom(entry: QueueEntry, roomId: string): Promise<void> {
  await supabase
    .from('game_queue_entries')
    .update({
      status: 'matched',
      matched_room_id: roomId,
      matched_at: new Date().toISOString(),
    })
    .eq('id', entry.id)
    .eq('status', 'searching');
}

/* -------------------- janitor: clean stale entries -------------------- */

export async function reapStaleQueueEntries(olderThanSeconds = 90): Promise<void> {
  const cutoff = new Date(Date.now() - olderThanSeconds * 1000).toISOString();
  await supabase
    .from('game_queue_entries')
    .update({ status: 'cancelled' })
    .eq('status', 'searching')
    .lt('last_seen_at', cutoff);
}
