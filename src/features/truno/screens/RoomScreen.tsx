import React, { useEffect, useMemo, useState } from 'react';
import { Lock, UserPlus, Copy, Bot, ChevronRight, Send, LogOut, Crown, GripVertical, Check, Loader2, Play } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';
import { useCurrentUser } from '@/hooks/use-current-user';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import {
  fillSeatsWithBots,
  getActiveSession,
  getRoomPlayers,
  PlayerRow,
  RoomRow,
  startGameSession,
  leaveRoom,
} from '@/features/games/lib/services/roomService';
import { FriendInviteCenter } from '@/features/games/components/lounge/FriendInviteCenter';
import { supabase } from '@/lib/supabase';

interface Props {
  onNavigate: (view: string, params?: any) => void;
  identity: PlayerIdentity;
  roomId: string | null;
  roomError?: string | null;
  onJoinRoom: (code: string) => Promise<void>;
  onRoomReady: (roomId: string) => void;
}

const RoomScreen: React.FC<Props> = ({ onNavigate, identity, roomId, roomError, onJoinRoom, onRoomReady }) => {
  const currentUser = useCurrentUser();
  const [room, setRoom] = useState<RoomRow | null>(null);
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [rules, setRules] = useState({ classic: true, action: true, wild: true, team: false });
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(roomError ?? null);
  const [showInvites, setShowInvites] = useState(false);

  const loadRoom = async () => {
    if (!roomId) return;
    const [{ data: roomRow }, seated, session] = await Promise.all([
      supabase.from('game_rooms').select('*').eq('id', roomId).maybeSingle(),
      getRoomPlayers(roomId),
      getActiveSession(roomId),
    ]);
    const nextRoom = roomRow as RoomRow | null;
    setRoom(nextRoom);
    setPlayers(seated);
    if (session) onNavigate('match', { roomId });
  };

  useEffect(() => {
    setFeedback(roomError ?? null);
  }, [roomError]);

  useEffect(() => {
    if (!roomId) return;
    let cancelled = false;
    const load = async () => { if (!cancelled) await loadRoom(); };
    load();
    const timer = setInterval(load, 2000);
    return () => { cancelled = true; clearInterval(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  const seats = room?.max_players ?? 4;
  const filledSeats = useMemo(() => (
    Array.from({ length: seats }).map((_, seat) => players.find((p) => p.seat_index === seat) ?? null)
  ), [players, seats]);
  const me = players.find((p) => p.user_id === identity.userId);
  const isHost = !!me?.is_host;

  const copyCode = async () => {
    if (!room?.room_code) {
      setFeedback('Create a real private room before sharing a code.');
      return;
    }
    await navigator.clipboard?.writeText(room.room_code);
    setCopied(true);
    setFeedback('Room code copied.');
    setTimeout(() => { setCopied(false); setFeedback(null); }, 1600);
  };

  const handleInvite = async () => {
    if (!room) {
      setFeedback('Create a room first, then invite friends.');
      return;
    }
    setShowInvites(true);
  };

  const handleFillBots = async () => {
    if (!room) {
      setFeedback('Create a room before filling seats.');
      return;
    }
    setBusy(true);
    try {
      await fillSeatsWithBots(room.id, 'truno');
      await loadRoom();
      setFeedback('Open seats filled with bot players.');
    } catch (e: any) {
      setFeedback(e?.message || 'Could not fill seats.');
    } finally {
      setBusy(false);
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  const handleStart = async () => {
    if (!room) return;
    setBusy(true);
    try {
      if (players.length < 2) await fillSeatsWithBots(room.id, 'truno');
      await startGameSession(room.id, 'truno');
      onRoomReady(room.id);
      onNavigate('match', { roomId: room.id });
    } catch (e: any) {
      setFeedback(e?.message || 'Could not start match.');
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (room) await leaveRoom(room.id, identity.userId);
    onNavigate('home');
  };

  const handleJoin = async () => {
    if (joinCode.trim().length !== 6) return;
    setBusy(true);
    setFeedback(null);
    try {
      await onJoinRoom(joinCode);
    } catch (e: any) {
      setFeedback(e?.message || 'Could not join room.');
    } finally {
      setBusy(false);
    }
  };

  if (showInvites && room) {
    return (
      <FriendInviteCenter
        identity={identity}
        defaultGame="truno"
        roomId={room.id}
        roomCode={room.room_code}
        onBack={() => setShowInvites(false)}
      />
    );
  }

  return (
    <div className="px-3 pb-32 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="md" subtitle="Match colors. Play action. Own the table." showParent={false} />
      </div>

      {!room && (
        <div className="rounded-2xl border border-amber-500/30 bg-zinc-950/80 p-4">
          <h2 className="text-sm font-black text-amber-300">Private Room</h2>
          <p className="mt-1 text-xs text-zinc-400">No active room is loaded. Enter a real Trey TV room code, or go back and choose Play Friends to create one.</p>
          <div className="mt-3 flex gap-2">
            <input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm font-bold tracking-[0.25em] text-white outline-none"
            />
            <button onClick={handleJoin} disabled={busy || joinCode.length !== 6} className="rounded-xl px-4 py-2 text-xs font-black bg-amber-500 text-black disabled:opacity-40">
              {busy ? 'Joining...' : 'Join'}
            </button>
          </div>
          {feedback && <p className="mt-2 text-xs text-fuchsia-300">{feedback}</p>}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lock size={14} className="text-amber-400" />
            <span className="text-xs font-bold text-amber-300 tracking-wider">PRIVATE ROOM</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-300">{room ? 'Room is open' : 'Waiting for room'}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="text-center">
            <span className="text-[10px] font-bold text-zinc-500 tracking-widest">ROOM CODE</span>
            <h2 className="text-4xl md:text-5xl font-black my-2 tracking-tight" style={{
              background: 'linear-gradient(90deg, #FF0080, #9D4EDD, #00D9FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 12px rgba(157,78,221,0.5))',
            }}>{room?.room_code ?? '------'}</h2>
            <p className="text-[11px] text-zinc-500 mb-3">{room ? 'Share this code to invite friends' : 'Create or join a room to get a shareable code'}</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleInvite} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300 text-xs font-bold hover:bg-fuchsia-500/10">
                <UserPlus size={14} /> Invite Friends
              </button>
              <button onClick={copyCode} className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-amber-500/50 bg-amber-500/5 text-amber-300 text-xs font-bold hover:bg-amber-500/10">
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            {feedback && <p className="mt-2 text-xs text-fuchsia-300">{feedback}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-300">{players.length} / {seats} <span className="text-zinc-500 font-normal">PLAYERS</span></span>
              <button onClick={handleFillBots} disabled={busy || !room} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-cyan-500/40 text-cyan-300 text-[10px] font-bold disabled:opacity-40">
                {busy ? <Loader2 size={12} className="animate-spin" /> : <Bot size={12} />} AI Fill
              </button>
            </div>
            <div className="space-y-1.5">
              {filledSeats.map((p, i) => (
                <SeatRow key={i} player={p} seat={i} currentUserAvatar={currentUser.avatar} currentUserName={currentUser.name} isYou={p?.user_id === identity.userId} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(157,78,221,0.2), transparent 70%)' }} />
            <div className="absolute inset-8 rounded-full border border-purple-500/30" />
            {filledSeats.map((p, i) => <TableSeat key={i} player={p} seat={i} isYou={p?.user_id === identity.userId} currentUserAvatar={currentUser.avatar} />)}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-16 rounded-xl bg-gradient-to-br from-zinc-900 to-black border-2 border-fuchsia-500/40 shadow-[0_0_20px_rgba(157,78,221,0.6)] flex items-center justify-center">
                <span className="text-xl">TR</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-2">TABLE CHAT</h3>
          <div className="flex-1 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 p-4 text-center text-xs text-zinc-500">
            Room chat is not live yet. Invites and room seats are real; chat will stay quiet until a backed chat service is added.
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input disabled placeholder="Chat coming soon" className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-500 outline-none" />
            <button disabled className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center opacity-50">
              <Send size={12} className="text-zinc-500" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h3 className="text-sm font-bold text-white mb-3">GAME RULES</h3>
          <div className="space-y-2">
            {[
              { k: 'classic', label: 'Classic Mode',  sub: 'Match colors & numbers' },
              { k: 'action',  label: 'Action Heavy',  sub: 'Skip, reverse, draw cards' },
              { k: 'wild',    label: 'Wild Rules',    sub: 'Wild and +4 cards enabled' },
              { k: 'team',    label: 'Team Play',     sub: 'Coming soon' },
            ].map(r => (
              <button
                key={r.k}
                onClick={() => r.k !== 'team' && setRules({ ...rules, [r.k]: !rules[r.k as keyof typeof rules] })}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-left"
              >
                <div>
                  <div className="text-xs font-bold text-white">{r.label}</div>
                  <div className="text-[10px] text-zinc-500">{r.sub}</div>
                </div>
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${rules[r.k as keyof typeof rules] ? 'bg-fuchsia-500' : 'bg-zinc-700'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform ${rules[r.k as keyof typeof rules] ? 'translate-x-4' : ''}`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
          <h3 className="text-sm font-bold text-white mb-3">MATCH SETTINGS</h3>
          <div className="space-y-2">
            {[
              { label: 'Seats', value: `${seats}` },
              { label: 'Mode', value: room?.is_private ? 'Private' : 'Private' },
              { label: 'Bots', value: players.some(p => p.is_bot) ? 'Enabled' : 'Optional' },
            ].map((s, i) => (
              <div key={i} className="w-full flex items-center justify-between px-3 py-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
                <span className="text-xs text-zinc-300">{s.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{s.value}</span>
                  <ChevronRight size={14} className="text-zinc-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={handleLeave} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-pink-500/50 text-pink-300 font-bold text-sm">
          <LogOut size={14} /> Leave Room
        </button>
        <button onClick={handleStart} disabled={busy || !room || (!isHost && players.length > 0)} className="relative py-3 rounded-2xl font-black overflow-hidden disabled:opacity-50">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 blur-md opacity-70" />
          <div className="relative flex items-center justify-center gap-2">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
            <div>
              <div className="text-white text-base">Start Match</div>
              <div className="text-[9px] text-fuchsia-100">{isHost ? 'Bots can fill open seats' : 'Waiting for host'}</div>
            </div>
          </div>
        </button>
        <button onClick={handleFillBots} disabled={busy || !room} className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-emerald-500/50 text-emerald-300 font-bold text-xs disabled:opacity-40">
          <Bot size={14} /> <div className="text-left"><div>AI Fill</div><div className="text-[9px] text-emerald-200/70 font-normal">Fill empty seats</div></div>
        </button>
      </div>
    </div>
  );
};

const SeatRow: React.FC<{ player: PlayerRow | null; seat: number; currentUserAvatar?: string; currentUserName?: string; isYou: boolean }> = ({
  player,
  seat,
  currentUserAvatar,
  currentUserName,
  isYou,
}) => (
  <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${player ? 'bg-zinc-900/60' : 'border border-dashed border-zinc-800'}`}>
    {player ? (
      isYou && currentUserAvatar ? (
        <img src={currentUserAvatar} alt={currentUserName || player.display_name} className="w-7 h-7 rounded-full object-cover" />
      ) : (
        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${player.is_bot ? 'from-cyan-600 to-blue-800' : 'from-fuchsia-500 to-purple-700'} flex items-center justify-center text-[10px] font-black text-white`}>
          {player.display_name[0]?.toUpperCase()}
        </div>
      )
    ) : (
      <div className="w-7 h-7 rounded-full border border-dashed border-zinc-700" />
    )}
    <div className="flex-1">
      <div className="flex items-center gap-1.5">
        <span className={`text-xs font-bold ${player?.is_host ? 'text-fuchsia-300' : 'text-white'}`}>{player ? (isYou ? currentUserName || player.display_name : player.display_name) : 'Open Seat'}</span>
        {player?.is_host && <Crown size={11} className="text-amber-400" />}
        {player?.is_bot && <span className="text-[9px] text-cyan-300 border border-cyan-500/30 rounded px-1">BOT</span>}
        {isYou && <span className="text-[9px] text-emerald-300 border border-emerald-500/30 rounded px-1">YOU</span>}
      </div>
      <span className={`text-[10px] ${player ? 'text-emerald-400' : 'text-zinc-500'}`}>{player ? 'Ready' : `Seat ${seat + 1}`}</span>
    </div>
    <GripVertical size={12} className="text-zinc-600" />
  </div>
);

const TableSeat: React.FC<{ player: PlayerRow | null; seat: number; isYou: boolean; currentUserAvatar?: string }> = ({ player, seat, isYou, currentUserAvatar }) => {
  const positions = [
    'top-2 left-1/2 -translate-x-1/2',
    'top-1/2 right-2 -translate-y-1/2',
    'bottom-8 left-1/2 -translate-x-1/2',
    'top-1/2 left-2 -translate-y-1/2',
  ];
  return (
    <div className={`absolute ${positions[seat] ?? positions[0]} flex flex-col items-center`}>
      {player ? (
        isYou && currentUserAvatar ? (
          <img src={currentUserAvatar} alt={player.display_name} className="w-10 h-10 rounded-full object-cover ring-2 ring-fuchsia-500/50" />
        ) : (
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${player.is_bot ? 'from-cyan-600 to-blue-800' : 'from-fuchsia-500 to-purple-700'} ring-2 ring-fuchsia-500/50 flex items-center justify-center text-xs font-black`}>
            {player.display_name[0]?.toUpperCase()}
          </div>
        )
      ) : (
        <div className="w-10 h-10 rounded-full border border-dashed border-zinc-700" />
      )}
      <span className="text-[9px] font-bold text-white mt-1">{player?.display_name || 'Open'}</span>
      <span className={`text-[8px] ${player?.is_bot ? 'text-cyan-300' : player ? 'text-emerald-400' : 'text-zinc-600'}`}>{player?.is_bot ? 'Bot' : player ? 'Ready' : 'Seat'}</span>
    </div>
  );
};

export default RoomScreen;
