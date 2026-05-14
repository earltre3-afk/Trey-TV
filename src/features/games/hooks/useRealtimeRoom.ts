/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  RoomRow, PlayerRow, SessionRow,
  getRoomPlayers, getActiveSession,
  updateSessionState, recordMove, heartbeat, endSession,
} from '../lib/services/roomService';
import { PlayerIdentity } from '../lib/services/identity';

export interface RealtimeRoomState {
  room: RoomRow | null;
  players: PlayerRow[];
  session: SessionRow | null;
  state: any | null;
  mySeat: number | null;
  isHost: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * useRealtimeRoom — Polling-based room sync.
 *
 * NOTE: This merge uses a fast polling loop instead of opening a feature-local
 * realtime channel. That keeps the Game Room stable inside the host app while
 * the database and realtime policies are reviewed in a later backend pass.
 * The local engines are deterministic, so clients can still converge from the
 * same move log once the canonical room tables are enabled.
 */
export function useRealtimeRoom(
  roomId: string | null,
  identity: PlayerIdentity,
  applyMove: (state: any, move: { type: string; seat: number; payload?: any }) => any,
  extractMeta: (state: any) => { currentSeat: number | null; phase: string; round?: number; ended?: boolean },
) {
  const [data, setData] = useState<RealtimeRoomState>({
    room: null, players: [], session: null, state: null,
    mySeat: null, isHost: false, loading: !!roomId, error: null,
  });
  const moveCounter = useRef(0);
  const dataRef = useRef(data);
  dataRef.current = data;
  const pollTimer = useRef<any>(null);
  const hbTimer = useRef<any>(null);

  const loadAll = useCallback(async (rid: string) => {
    try {
      const [{ data: roomRow }, players, session] = await Promise.all([
        supabase.from('game_rooms').select('*').eq('id', rid).single(),
        getRoomPlayers(rid),
        getActiveSession(rid),
      ]);
      const room = roomRow as RoomRow | null;
      const me = players.find(p => p.user_id === identity.userId);
      setData(prev => ({
        room,
        players,
        session: session ?? prev.session,
        // Prefer the freshest local state if its updated_at is newer than DB's;
        // otherwise take DB state. This avoids clobbering an optimistic move
        // with a stale poll response.
        state: pickFreshestState(prev, session),
        mySeat: me ? me.seat_index : prev.mySeat,
        isHost: !!me?.is_host,
        loading: false,
        error: null,
      }));
    } catch (e: any) {
      setData(d => ({ ...d, loading: false, error: e?.message || 'Failed to load room' }));
    }
  }, [identity.userId]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;

    loadAll(roomId);

    // poll every 2s for room/player/session changes
    const tick = async () => {
      if (cancelled) return;
      try { await loadAll(roomId); } catch { /* swallow */ }
    };
    pollTimer.current = setInterval(tick, 2000);

    // heartbeat
    hbTimer.current = setInterval(() => {
      heartbeat(roomId, identity.userId).catch(() => {});
    }, 15000);

    return () => {
      cancelled = true;
      if (pollTimer.current) clearInterval(pollTimer.current);
      if (hbTimer.current) clearInterval(hbTimer.current);
      pollTimer.current = null;
      hbTimer.current = null;
    };
  }, [roomId, identity.userId, loadAll]);

  /**
   * sendMove — every client applies the move locally and writes the new
   * state directly to the DB. Because the engines are deterministic and
   * single-turn-gated, races are minimal in preview; the next poll will
   * reconcile any drift.
   */
  const sendMove = useCallback(async (move: { type: string; seat: number; payload?: any }) => {
    const current = dataRef.current;
    if (!current.room || !current.session || !current.state) return;
    try {
      const nextState = applyMove(current.state, move);
      const meta = extractMeta(nextState);
      // optimistic local update
      setData(d => ({ ...d, state: nextState }));
      await updateSessionState(current.session.id, nextState, meta.currentSeat, meta.phase, meta.round);
      await recordMove(
        current.session.id,
        identity.userId,
        move.seat,
        move.type,
        move.payload || {},
        ++moveCounter.current,
      );
      if (meta.ended) await endSession(current.session.id, current.room.id);
    } catch (e) {
      console.warn('sendMove failed', e);
    }
  }, [identity.userId, applyMove, extractMeta]);

  /** Host-only: directly set the state (used for bot-driven advancement). */
  const setHostState = useCallback(async (nextState: any) => {
    const current = dataRef.current;
    if (!current.session) return;
    const meta = extractMeta(nextState);
    setData(d => ({ ...d, state: nextState }));
    await updateSessionState(current.session.id, nextState, meta.currentSeat, meta.phase, meta.round);
    if (meta.ended && current.room) await endSession(current.session.id, current.room.id);
  }, [extractMeta]);

  return { ...data, sendMove, setHostState, reload: () => roomId && loadAll(roomId) };
}

// Prefer the locally-applied state if the DB session row hasn't caught up yet.
function pickFreshestState(prev: RealtimeRoomState, dbSession: SessionRow | null) {
  if (!dbSession) return prev.state ?? null;
  if (!prev.session || !prev.state) return dbSession.state_json ?? null;
  const prevUpdated = new Date(prev.session.updated_at).getTime();
  const dbUpdated = new Date(dbSession.updated_at).getTime();
  return dbUpdated >= prevUpdated ? (dbSession.state_json ?? prev.state) : prev.state;
}
