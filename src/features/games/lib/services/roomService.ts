import { supabase } from "@/lib/supabase";
import { generateRoomCode, PlayerIdentity } from "./identity";
import { newSpadesGame } from "@/features/games/lib/spades/spadesEngine";
import { newBlackjackGame } from "@/features/games/lib/blackjack/blackjackEngine";
import { newBullshitGame } from "@/features/games/lib/bullshit/bullshitEngine";
import { createTrunoGame } from "@/features/truno/lib/trunoEngine";

export type GameType = "spades" | "blackjack" | "bullshit" | "truno";

const BOT_NAMES = ["Aaliyah", "Marcus", "Jamal", "Zion", "Nova", "Drei", "Lyric", "Sage"];

export const MAX_PLAYERS_BY_GAME: Record<GameType, number> = {
  spades: 4,
  blackjack: 1,
  bullshit: 4,
  truno: 4,
};

export interface RoomRow {
  id: string;
  room_code: string;
  game_type: GameType;
  status: "waiting" | "active" | "ended" | "abandoned";
  host_user_id: string;
  host_display_name: string;
  max_players: number;
  current_players: number;
  is_private: boolean;
  target_score: number;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
}

export interface PlayerRow {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  seat_index: number;
  team_index: number | null;
  is_bot: boolean;
  is_ready: boolean;
  is_connected: boolean;
  is_host: boolean;
  joined_at: string;
  last_seen_at: string;
}

export interface SessionRow {
  id: string;
  room_id: string;
  game_type: GameType;
  status: "active" | "ended";
  current_turn_seat: number | null;
  round_number: number;
  phase: string | null;
  state_json: any;
  created_at: string;
  updated_at: string;
}

const STALE_PLAYER_MS = 30000;

export async function createRoom(opts: {
  identity: PlayerIdentity;
  gameType: GameType;
  isPrivate: boolean;
  targetScore?: number;
}): Promise<{ room: RoomRow; player: PlayerRow }> {
  const max = MAX_PLAYERS_BY_GAME[opts.gameType];

  // attempt to insert with a unique code, retry on collision
  let lastErr: any = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateRoomCode();
    const { data, error } = await supabase
      .from("game_rooms")
      .insert({
        room_code: code,
        game_type: opts.gameType,
        status: "waiting",
        host_user_id: opts.identity.userId,
        host_display_name: opts.identity.displayName,
        max_players: max,
        current_players: 1,
        is_private: opts.isPrivate,
        target_score: opts.targetScore ?? 500,
      })
      .select()
      .single();
    if (!error && data) {
      const room = data as RoomRow;
      const { data: pData, error: pErr } = await supabase
        .from("game_room_players")
        .insert({
          room_id: room.id,
          user_id: opts.identity.userId,
          display_name: opts.identity.displayName,
          seat_index: 0,
          team_index: opts.gameType === "spades" ? 0 : null,
          is_bot: false,
          is_host: true,
          is_ready: true,
          is_connected: true,
        })
        .select()
        .single();
      if (pErr) throw pErr;
      return { room, player: pData as PlayerRow };
    }
    lastErr = error;
  }
  throw lastErr || new Error("Failed to create room");
}

export async function findRoomByCode(code: string): Promise<RoomRow | null> {
  const { data, error } = await supabase
    .from("game_rooms")
    .select("*")
    .eq("room_code", code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data as RoomRow | null;
}

export async function joinRoomByCode(
  code: string,
  identity: PlayerIdentity,
): Promise<{ room: RoomRow; player: PlayerRow }> {
  const room = await findRoomByCode(code);
  if (!room) throw new Error("Room not found");
  if (room.status === "ended" || room.status === "abandoned") throw new Error("Room is closed");

  // see if user is already in the room (reconnect)
  const { data: existing } = await supabase
    .from("game_room_players")
    .select("*")
    .eq("room_id", room.id)
    .eq("user_id", identity.userId)
    .maybeSingle();
  if (existing) {
    await supabase
      .from("game_room_players")
      .update({ is_connected: true, last_seen_at: new Date().toISOString() })
      .eq("id", (existing as PlayerRow).id);
    return { room, player: existing as PlayerRow };
  }

  // find next open seat (skip bots — they will be evicted)
  const { data: seated } = await supabase
    .from("game_room_players")
    .select("*")
    .eq("room_id", room.id)
    .order("seat_index");
  const taken = new Set((seated || []).map((p: any) => p.seat_index));
  let seat = -1;
  for (let i = 0; i < room.max_players; i++) {
    if (!taken.has(i)) {
      seat = i;
      break;
    }
  }
  if (seat === -1) {
    // evict a bot
    const bot = (seated || []).find((p: any) => p.is_bot);
    if (!bot) throw new Error("Room is full");
    await supabase
      .from("game_room_players")
      .delete()
      .eq("id", (bot as PlayerRow).id);
    seat = (bot as PlayerRow).seat_index;
  }

  const { data: pData, error: pErr } = await supabase
    .from("game_room_players")
    .insert({
      room_id: room.id,
      user_id: identity.userId,
      display_name: identity.displayName,
      seat_index: seat,
      team_index: room.game_type === "spades" ? seat % 2 : null,
      is_bot: false,
      is_host: false,
      is_ready: true,
      is_connected: true,
    })
    .select()
    .single();
  if (pErr) throw pErr;

  // bump current_players
  const { count } = await supabase
    .from("game_room_players")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room.id);
  await supabase
    .from("game_rooms")
    .update({ current_players: count ?? 1, last_activity_at: new Date().toISOString() })
    .eq("id", room.id);

  return { room, player: pData as PlayerRow };
}

export async function fillSeatsWithBots(roomId: string, gameType: GameType): Promise<void> {
  const { data: room } = await supabase.from("game_rooms").select("*").eq("id", roomId).single();
  if (!room) return;
  const { data: seated } = await supabase
    .from("game_room_players")
    .select("seat_index")
    .eq("room_id", roomId);
  const taken = new Set((seated || []).map((p: any) => p.seat_index));
  const max = (room as RoomRow).max_players;
  const inserts: any[] = [];
  let nameIdx = 0;
  for (let i = 0; i < max; i++) {
    if (!taken.has(i)) {
      inserts.push({
        room_id: roomId,
        user_id: `bot-${roomId.slice(0, 6)}-${i}`,
        display_name: BOT_NAMES[nameIdx++ % BOT_NAMES.length],
        seat_index: i,
        team_index: gameType === "spades" ? i % 2 : null,
        is_bot: true,
        is_ready: true,
        is_connected: true,
        is_host: false,
      });
    }
  }
  if (inserts.length) {
    await supabase.from("game_room_players").insert(inserts);
    await supabase
      .from("game_rooms")
      .update({ current_players: max, last_activity_at: new Date().toISOString() })
      .eq("id", roomId);
  }
}

export async function startGameSession(roomId: string, gameType: GameType): Promise<SessionRow> {
  // load players for ordered seat names
  const { data: players } = await supabase
    .from("game_room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("seat_index");
  const seatNames: string[] = (players || []).map((p: any) => p.display_name);

  let state: any;
  let phase: string;
  let currentSeat: number | null;
  let round = 1;

  if (gameType === "spades") {
    const padded = [...seatNames];
    while (padded.length < 4) padded.push(`Bot ${padded.length + 1}`);
    const s = newSpadesGame(padded.slice(0, 4));
    state = s;
    phase = s.phase;
    currentSeat = s.currentSeat;
    round = s.round;
  } else if (gameType === "blackjack") {
    state = newBlackjackGame(2500);
    phase = state.phase;
    currentSeat = 0;
  } else if (gameType === "bullshit") {
    const padded = seatNames.length >= 2 ? seatNames : [...seatNames, "Bot 1", "Bot 2"];
    const s = newBullshitGame(padded);
    state = s;
    phase = s.phase;
    currentSeat = s.currentSeat;
  } else {
    const orderedPlayers = (players || []).map((p: any) => ({
      id: p.user_id,
      name: p.display_name,
      isBot: !!p.is_bot,
    }));
    while (orderedPlayers.length < 2) {
      const seat = orderedPlayers.length;
      orderedPlayers.push({
        id: `bot-${roomId.slice(0, 6)}-${seat}`,
        name: `Bot ${seat + 1}`,
        isBot: true,
      });
    }
    const s = createTrunoGame(orderedPlayers);
    state = s;
    phase = s.phase;
    currentSeat = s.currentPlayerIndex;
    round = s.turn;
  }

  // close any prior active session
  await supabase
    .from("game_sessions")
    .update({ status: "ended" })
    .eq("room_id", roomId)
    .eq("status", "active");

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      room_id: roomId,
      game_type: gameType,
      status: "active",
      current_turn_seat: currentSeat,
      round_number: round,
      phase,
      state_json: state,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("game_rooms")
    .update({ status: "active", last_activity_at: new Date().toISOString() })
    .eq("id", roomId);

  return data as SessionRow;
}

export async function updateSessionState(
  sessionId: string,
  state: any,
  currentSeat: number | null,
  phase: string,
  round?: number,
) {
  const patch: any = {
    state_json: state,
    current_turn_seat: currentSeat,
    phase,
    updated_at: new Date().toISOString(),
  };
  if (round !== undefined) patch.round_number = round;
  await supabase.from("game_sessions").update(patch).eq("id", sessionId);
}

export async function endSession(sessionId: string, roomId: string) {
  await supabase
    .from("game_sessions")
    .update({ status: "ended", phase: "game-over" })
    .eq("id", sessionId);
  await supabase
    .from("game_rooms")
    .update({ status: "ended", last_activity_at: new Date().toISOString() })
    .eq("id", roomId);
}

export async function recordMove(
  sessionId: string,
  playerId: string,
  seatIndex: number,
  moveType: string,
  payload: any,
  moveNumber: number,
) {
  await supabase.from("game_moves").insert({
    session_id: sessionId,
    player_id: playerId,
    seat_index: seatIndex,
    move_type: moveType,
    move_payload: payload,
    move_number: moveNumber,
  });
}

export async function leaveRoom(roomId: string, userId: string) {
  await supabase
    .from("game_room_players")
    .update({ is_connected: false, last_seen_at: new Date().toISOString() })
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

export async function heartbeat(roomId: string, userId: string) {
  await supabase
    .from("game_room_players")
    .update({ is_connected: true, last_seen_at: new Date().toISOString() })
    .eq("room_id", roomId)
    .eq("user_id", userId);
}

export async function replaceDisconnectedPlayersWithBots(
  roomId: string,
  staleMs = STALE_PLAYER_MS,
) {
  const players = await getRoomPlayers(roomId);
  const cutoff = Date.now() - staleMs;
  const stalePlayers = players.filter((p) => {
    if (p.is_bot) return false;
    if (!p.is_connected) return true;
    return new Date(p.last_seen_at).getTime() < cutoff;
  });

  if (stalePlayers.length === 0) return [];

  const updates = stalePlayers.map((p, index) => {
    const displayName = BOT_NAMES[(p.seat_index + index) % BOT_NAMES.length];
    return supabase
      .from("game_room_players")
      .update({
        user_id: `bot-${roomId.slice(0, 6)}-${p.seat_index}`,
        display_name: displayName,
        is_bot: true,
        is_connected: true,
        is_ready: true,
        is_host: false,
        last_seen_at: new Date().toISOString(),
      })
      .eq("id", p.id);
  });

  await Promise.all(updates);
  await supabase
    .from("game_rooms")
    .update({ last_activity_at: new Date().toISOString() })
    .eq("id", roomId);

  return stalePlayers.map((p) => p.seat_index);
}

export async function listActiveRooms(): Promise<RoomRow[]> {
  try {
    const { data, error } = await supabase
      .from("game_rooms")
      .select("*")
      .in("status", ["waiting", "active", "abandoned"])
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data || []) as RoomRow[];
  } catch (error) {
    console.error("Error in listActiveRooms:", error);
    return [];
  }
}

export async function closeRoom(roomId: string) {
  await supabase.from("game_rooms").update({ status: "ended" }).eq("id", roomId);
}

export async function clearAbandoned() {
  await supabase.from("game_rooms").delete().eq("status", "abandoned");
}

export async function getRoomPlayers(roomId: string): Promise<PlayerRow[]> {
  const { data } = await supabase
    .from("game_room_players")
    .select("*")
    .eq("room_id", roomId)
    .order("seat_index");
  return (data || []) as PlayerRow[];
}

export async function getActiveSession(roomId: string): Promise<SessionRow | null> {
  const { data } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("room_id", roomId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as SessionRow | null;
}
