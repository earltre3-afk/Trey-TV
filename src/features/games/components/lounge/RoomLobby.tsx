/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Check, Bot, Users, Loader2, Play, Crown } from 'lucide-react';
import {
  PlayerRow, RoomRow, getRoomPlayers, fillSeatsWithBots, startGameSession,
  leaveRoom, getActiveSession,
} from '@/features/games/lib/services/roomService';
import { supabase } from '@/lib/supabase';
import { PlayerIdentity } from '@/features/games/lib/services/identity';

interface Props {
  roomId: string;
  identity: PlayerIdentity;
  onBack: () => void;
  onSessionStarted: () => void;
}

export const RoomLobby: React.FC<Props> = ({ roomId, identity, onBack, onSessionStarted }) => {
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [{ data: r }, p, s] = await Promise.all([
      supabase.from('game_rooms').select('*').eq('id', roomId).single(),
      getRoomPlayers(roomId),
      getActiveSession(roomId),
    ]);
    setRoom(r as RoomRow | null);
    setPlayers(p);
    if (s) onSessionStarted();
  };

  useEffect(() => {
    load();
    const channel = supabase.channel(`lobby:${roomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_room_players', filter: `room_id=eq.${roomId}` },
        async () => setPlayers(await getRoomPlayers(roomId)))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'game_sessions', filter: `room_id=eq.${roomId}` },
        () => onSessionStarted())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
        (payload: any) => setRoom(payload.new as RoomRow))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const me = players.find(p => p.user_id === identity.userId);
  const isHost = !!me?.is_host;
  const seats = room ? room.max_players : 4;
  const filledSeats = Array.from({ length: seats }).map((_, i) => players.find(p => p.seat_index === i) || null);

  const copyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleFillBots = async () => {
    if (!room) return;
    setBusy(true);
    try { await fillSeatsWithBots(roomId, room.game_type); }
    finally { setBusy(false); }
  };

  const handleStart = async () => {
    if (!room) return;
    setBusy(true); setError('');
    try {
      if (players.length < seats) await fillSeatsWithBots(roomId, room.game_type);
      await startGameSession(roomId, room.game_type);
      onSessionStarted();
    } catch (e: any) {
      setError(e.message || 'Failed to start');
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    await leaveRoom(roomId, identity.userId);
    onBack();
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-2" /> Loading room…
      </div>
    );
  }

  const gameMeta = {
    spades:    { name: 'Spades',    color: '#00B7FF' },
    blackjack: { name: 'Blackjack', color: '#FFC857' },
    bullshit:  { name: 'Bullshit',  color: '#A855F7' },
  }[room.game_type];

  return (
    <div className="min-h-screen w-full text-white pb-10" style={{ background: '#05070D' }}>
      <div className="sticky top-0 z-20 backdrop-blur-xl border-b" style={{ background: 'rgba(5,7,13,0.85)', borderColor: gameMeta.color + '30' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={handleLeave} className="p-2 rounded-xl hover:bg-white/5"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <div className="text-[10px] tracking-[0.2em]" style={{ color: gameMeta.color }}>ROOM LOBBY</div>
            <div className="text-lg font-bold">{gameMeta.name}</div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-md font-bold tracking-widest" style={{
            background: room.is_private ? 'rgba(168,85,247,0.15)' : 'rgba(0,183,255,0.15)',
            color: room.is_private ? '#A855F7' : '#00B7FF',
            border: '1px solid ' + (room.is_private ? '#A855F740' : '#00B7FF40'),
          }}>{room.is_private ? 'PRIVATE' : 'PUBLIC'}</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-6">
        {/* Code card */}
        <div className="rounded-3xl p-5 border text-center mb-6 trey-queue-card"
          style={{ background: 'linear-gradient(135deg, rgba(8,17,31,0.95), rgba(5,7,13,0.95))', borderColor: gameMeta.color + '60', boxShadow: `0 0 40px ${gameMeta.color}20` }}>
          <div className="text-xs text-slate-400 tracking-widest mb-2">ROOM CODE</div>
          <div className="flex items-center justify-center gap-3">
            <div className="text-4xl md:text-5xl font-black tracking-[0.4em] font-mono" style={{ color: gameMeta.color, textShadow: `0 0 20px ${gameMeta.color}60` }}>
              {room.room_code}
            </div>
            <button onClick={copyCode} className="p-2.5 rounded-xl border hover:bg-white/5" style={{ borderColor: gameMeta.color + '40' }}>
              {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} style={{ color: gameMeta.color }} />}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-3">Share this code with friends to invite them to this table.</p>
        </div>

        {/* Players */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2"><Users size={16} /> Players</h3>
          <div className="text-xs text-slate-400">{players.length} / {seats}</div>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {filledSeats.map((p, i) => (
            <SeatCard key={i} seat={i} player={p} isYou={p?.user_id === identity.userId} accent={gameMeta.color} teamLabel={room.game_type === 'spades' ? (i % 2 === 0 ? 'WE' : 'THEM') : null} />
          ))}
        </div>

        {/* Host controls */}
        {isHost ? (
          <div className="space-y-3">
            {players.length < seats && (
              <button onClick={handleFillBots} disabled={busy}
                className="w-full py-3 rounded-2xl font-bold border flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ borderColor: 'rgba(168,85,247,0.5)', background: 'rgba(168,85,247,0.1)', color: '#C4A6FF' }}>
                <Bot size={16} /> Fill Empty Seats With Bots
              </button>
            )}
            <button onClick={handleStart} disabled={busy}
              className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg,#00B7FF,#A855F7)', color: '#fff', boxShadow: '0 0 24px rgba(0,183,255,0.4)' }}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Start Game
            </button>
            {error && <div className="text-xs text-red-400 text-center">{error}</div>}
          </div>
        ) : (
          <div className="text-center py-6 rounded-2xl border" style={{ background: 'rgba(8,17,31,0.6)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <Loader2 size={20} className="animate-spin mx-auto mb-2 text-cyan-400" />
            <div className="text-sm text-slate-300">Waiting for the host to start the game…</div>
            <div className="text-xs text-slate-500 mt-1">Hosted by {room.host_display_name}</div>
          </div>
        )}
      </div>
    </div>
  );
};

const SeatCard: React.FC<{ seat: number; player: PlayerRow | null; isYou: boolean; accent: string; teamLabel: string | null }> = ({ seat, player, isYou, accent, teamLabel }) => (
  <div className="rounded-2xl p-3 border flex items-center gap-3 trey-glass-panel"
    style={{
      background: player ? 'rgba(8,17,31,0.7)' : 'rgba(8,17,31,0.3)',
      borderColor: isYou ? accent : player ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
      borderStyle: player ? 'solid' : 'dashed',
    }}>
    <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold"
      style={{
        background: player ? `linear-gradient(135deg, ${accent}40, ${accent}10)` : 'rgba(255,255,255,0.05)',
        border: `1px solid ${player ? accent + '60' : 'rgba(255,255,255,0.1)'}`,
        color: player ? '#fff' : '#475569',
      }}>
      {player ? player.display_name.charAt(0).toUpperCase() : `${seat + 1}`}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <div className="text-sm font-bold truncate">{player?.display_name || 'Open seat'}</div>
        {player?.is_host && <Crown size={12} className="text-amber-400 shrink-0" />}
      </div>
      <div className="text-[10px] text-slate-400 flex items-center gap-2">
        {player ? (
          <>
            {player.is_bot && <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300">BOT</span>}
            {isYou && <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300">YOU</span>}
            {teamLabel && <span className="px-1.5 py-0.5 rounded" style={{ background: accent + '20', color: accent }}>{teamLabel}</span>}
          </>
        ) : (
          <span>Seat {seat + 1}</span>
        )}
      </div>
    </div>
  </div>
);
