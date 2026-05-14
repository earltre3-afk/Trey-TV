/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Loader2, Users, Sparkles, CheckCircle2, X, UserPlus,
  Zap, Clock, Spade, Layers, Crown, ChevronRight,
} from 'lucide-react';
import { TreyBrandMark } from '@/features/games/components/shared/TreyBrandMark';
import { GameType, MAX_PLAYERS_BY_GAME } from '@/features/games/lib/services/roomService';
import { PlayerIdentity } from '@/features/games/lib/services/identity';
import {
  QueueEntry, QueueSnapshot,
  joinQueue, cancelQueue, getQueueSnapshot,
  resolveMatchesForGame, heartbeatQueue, reapStaleQueueEntries,
} from '@/features/games/lib/services/matchmakingService';
import { isGameBackendEnabled } from '@/features/games/lib/gameBackend';

interface Props {
  gameType: GameType;
  identity: PlayerIdentity;
  onBack: () => void;
  onMatched: (roomId: string, gameType: GameType) => void;
  onInviteFriends: () => void;
}

const GAME_META: Record<GameType, { name: string; tag: string; desc: string; color: string; icon: React.ReactNode }> = {
  spades: { name: 'Spades', tag: 'TEAMS · 4 PLAYERS', desc: 'Bidding, books, and bag pressure with a partner.', color: '#00B7FF', icon: <Spade size={16} /> },
  blackjack: { name: 'Blackjack', tag: 'SOLO TABLE · 1 PLAYER', desc: 'Beat the dealer in the neon lounge.', color: '#FFC857', icon: <Layers size={16} /> },
  bullshit: { name: 'Bullshit / Cheat', tag: 'BLUFFING · 3-4 PLAYERS', desc: 'Call the bluff before the table flips.', color: '#A855F7', icon: <Crown size={16} /> },
};

type Phase = 'searching' | 'almost' | 'found';

export const QueueScreen: React.FC<Props> = ({ gameType, identity, onBack, onMatched, onInviteFriends }) => {
  const meta = GAME_META[gameType];
  const max = MAX_PLAYERS_BY_GAME[gameType];
  const backendEnabled = isGameBackendEnabled();

  const [entry, setEntry] = useState<QueueEntry | null>(null);
  const [snap, setSnap] = useState<QueueSnapshot | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [matchedFlash, setMatchedFlash] = useState<string | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const matchedHandledRef = useRef(false);

  // 1) Join queue on mount
  useEffect(() => {
    if (!backendEnabled) {
      setError('Public queue is waiting on the Trey TV game database migration. Solo tables are available now.');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const e = await joinQueue({ identity, gameType, mode: 'public' });
        if (!cancelled) {
          setEntry(e);
          startedAtRef.current = Date.now();
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to join queue');
      }
    })();
    return () => { cancelled = true; };
  }, [backendEnabled, identity.userId, gameType]);

  // 2) Poll snapshot + try to resolve matches
  useEffect(() => {
    if (!backendEnabled || !entry) return;
    let cancelled = false;

    const tick = async () => {
      try {
        // best-effort resolver — any client can run it
        await resolveMatchesForGame(gameType, identity).catch(() => {});
        await reapStaleQueueEntries(120).catch(() => {});
        const s = await getQueueSnapshot(identity.userId, gameType);
        if (cancelled) return;
        setSnap(s);

        if (s.myEntry?.status === 'matched' && s.myEntry.matched_room_id && !matchedHandledRef.current) {
          matchedHandledRef.current = true;
          setMatchedFlash(s.myEntry.matched_room_id);
          // brief "Match Found" celebration, then route
          setTimeout(() => onMatched(s.myEntry!.matched_room_id!, gameType), 1600);
        }

        // heartbeat
        if (s.myEntry?.status === 'searching') {
          heartbeatQueue(s.myEntry.id).catch(() => {});
        }
      } catch {
        // swallow — next tick will retry
      }
    };
    tick();
    const timer = setInterval(tick, 2000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [backendEnabled, entry?.id, gameType, identity.userId]);

  // 3) Elapsed counter
  useEffect(() => {
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 500);
    return () => clearInterval(i);
  }, []);

  const handleCancel = async () => {
    if (backendEnabled) {
      try { await cancelQueue(identity.userId); } catch { /* noop */ }
    }
    onBack();
  };

  // Compute phase
  let phase: Phase = 'searching';
  if (matchedFlash) phase = 'found';
  else if (snap) {
    const fullest = snap.formingRooms[0];
    if (fullest && fullest.current >= fullest.max - 1) phase = 'almost';
    else if (snap.waitingInGame >= max - 1) phase = 'almost';
  }

  const phaseLabel = phase === 'found' ? 'Match found' : phase === 'almost' ? 'Almost ready…' : 'Looking for players…';
  const phaseColor = phase === 'found' ? '#22C55E' : phase === 'almost' ? '#FFC857' : meta.color;

  return (
    <div className="min-h-screen w-full text-white relative overflow-hidden" style={{ background: '#05070D' }}>
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full blur-[140px]" style={{ background: `radial-gradient(circle, ${meta.color}33 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.22) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 backdrop-blur-2xl border-b" style={{ background: 'rgba(5,7,13,0.78)', borderColor: 'rgba(0,183,255,0.18)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={handleCancel} className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition" aria-label="Back" title="Back">
            <ArrowLeft size={18} />
          </button>
          <TreyBrandMark size={28} glow />
          <div className="h-7 w-px bg-white/10" />
          <div className="min-w-0 flex-1">
            <div className="text-[10px] tracking-[0.3em] font-bold" style={{ color: meta.color }}>MATCHMAKING</div>
            <div className="text-sm font-black truncate">{meta.name}</div>
          </div>
        </div>
      </div>

      <div className="relative max-w-3xl mx-auto px-4 py-6 md:py-10 space-y-5">
        {/* Main matchmaking card */}
        <div className="relative rounded-[32px] border overflow-hidden p-6 md:p-10 trey-queue-card"
          style={{
            background: 'linear-gradient(180deg, rgba(8,17,31,0.85), rgba(5,7,13,0.95))',
            borderColor: phaseColor + '55',
            boxShadow: `0 0 80px ${phaseColor}22, inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}>
          {/* status pill */}
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] font-bold px-3 py-1.5 rounded-full backdrop-blur-md"
            style={{ background: phaseColor + '18', border: '1px solid ' + phaseColor + '55', color: phaseColor }}>
            {phase === 'found' ? <CheckCircle2 size={12} /> : phase === 'almost' ? <Zap size={12} /> : <Loader2 size={12} className="animate-spin" />}
            {phaseLabel.toUpperCase()}
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight mt-4">
            {phase === 'found' ? 'You\'re in.' : 'Finding your table…'}
          </h1>
          <p className="text-sm md:text-base text-slate-300 mt-2 max-w-xl leading-relaxed">
            {phase === 'found'
              ? 'Pulling you into the lounge now. Hold tight — your seat is reserved.'
              : meta.desc}
          </p>

          {/* Pulse ring + game icon */}
          <div className="flex items-center justify-center my-8 md:my-10">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-ping opacity-40"
                style={{ background: `radial-gradient(circle, ${phaseColor}55 0%, transparent 70%)` }} />
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 30% 30%, ${phaseColor}40, rgba(5,7,13,0.95) 70%)`,
                  border: `1px solid ${phaseColor}80`,
                  boxShadow: `0 0 60px ${phaseColor}55, inset 0 0 30px ${phaseColor}30`,
                }}>
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div style={{ color: phaseColor, transform: 'scale(2.1)' }}>{meta.icon}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <StatTile label="Queue Position" value={snap?.myEntry?.status === 'matched' ? 'Matched' : (snap ? `#${snap.positionInGame || '—'}` : '—')} color={meta.color} icon={<Users size={12} />} />
            <StatTile label="Players Waiting" value={snap ? `${snap.waitingInGame}` : '—'} color="#A855F7" icon={<Sparkles size={12} />} />
            <StatTile label="Search Time" value={formatTime(elapsed)} color="#FFC857" icon={<Clock size={12} />} />
          </div>

          {/* Action row */}
          <div className="flex flex-wrap gap-2 mt-6">
            <button onClick={onInviteFriends}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-black tracking-wide border transition hover:bg-white/5"
              style={{ borderColor: 'rgba(0,183,255,0.45)', color: '#00B7FF', background: 'rgba(0,183,255,0.08)' }}>
              <UserPlus size={14} /> Invite Friends
            </button>
            <button onClick={handleCancel}
              className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold tracking-wide border transition hover:bg-white/5"
              style={{ borderColor: 'rgba(248,113,113,0.4)', color: '#FCA5A5', background: 'rgba(248,113,113,0.06)' }}>
              <X size={14} /> Cancel Queue
            </button>
          </div>

          {error && (
            <div className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{error}</div>
          )}
        </div>

        {/* Forming rooms */}
        <div className="rounded-3xl border backdrop-blur-md p-5 trey-queue-card"
          style={{ background: 'rgba(8,17,31,0.65)', borderColor: 'rgba(0,183,255,0.22)' }}>
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-[10px] tracking-[0.3em] font-bold text-slate-500">ROOM FILL PRIORITY</div>
              <div className="text-base font-black tracking-tight">Rooms forming now</div>
            </div>
            <div className="text-[10px] text-slate-500">Almost-full first</div>
          </div>

          {snap && snap.formingRooms.length > 0 ? (
            <div className="space-y-2">
              {snap.formingRooms.slice(0, 5).map((r, idx) => {
                const need = r.max - r.current;
                const urgent = need === 1;
                const c = urgent ? '#FFC857' : need === 2 ? meta.color : '#A855F7';
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 border trey-glass-panel"
                    style={{ background: 'rgba(5,7,13,0.6)', borderColor: c + '40' }}>
                    <div className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-md" style={{ background: c + '22', color: c, border: '1px solid ' + c + '60' }}>
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black">{urgent ? 'Needs ONE more' : `Needs ${need}`}</div>
                      <div className="text-[10px] text-slate-500">Room {r.id.slice(0, 6).toUpperCase()}</div>
                    </div>
                    <SeatPips current={r.current} max={r.max} color={c} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-slate-500 px-1 py-2">No rooms forming yet — you'll seed the next one.</div>
          )}
        </div>

        {/* Match found celebration overlay */}
        {phase === 'found' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(5,7,13,0.85)', backdropFilter: 'blur(20px)' }}>
            <div className="relative rounded-[32px] border p-8 md:p-12 max-w-md w-full text-center"
              style={{
                background: 'linear-gradient(180deg, rgba(8,17,31,0.95), rgba(5,7,13,0.98))',
                borderColor: 'rgba(34,197,94,0.6)',
                boxShadow: '0 0 80px rgba(34,197,94,0.45)',
              }}>
              <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-[80px]" style={{ background: 'rgba(34,197,94,0.4)' }} />
                <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full blur-[80px]" style={{ background: 'rgba(0,183,255,0.4)' }} />
              </div>
              <div className="relative">
                <TreyBrandMark size={56} glow className="mx-auto mb-4" />
                <div className="text-[10px] tracking-[0.3em] font-bold text-emerald-300">MATCH FOUND</div>
                <div className="text-3xl md:text-4xl font-black mt-2 tracking-tight">Table secured</div>
                <div className="text-sm text-slate-300 mt-2">Routing you to your seat at the {meta.name} table…</div>
                <Loader2 size={20} className="animate-spin mx-auto mt-5 text-emerald-300" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ----- small bits ----- */

const StatTile: React.FC<{ label: string; value: string; color: string; icon: React.ReactNode }> = ({ label, value, color, icon }) => (
  <div className="rounded-2xl px-3 py-3 border backdrop-blur-md trey-glass-panel" style={{ borderColor: color + '40' }}>
    <div className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] font-bold" style={{ color }}>{icon} {label.toUpperCase()}</div>
    <div className="text-base md:text-lg font-black mt-1 truncate">{value}</div>
  </div>
);

const SeatPips: React.FC<{ current: number; max: number; color: string }> = ({ current, max, color }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: max }).map((_, i) => (
      <div key={i} className="w-2.5 h-2.5 rounded-full"
        style={{
          background: i < current ? color : 'rgba(255,255,255,0.08)',
          boxShadow: i < current ? `0 0 8px ${color}` : 'none',
          border: '1px solid ' + (i < current ? color + '80' : 'rgba(255,255,255,0.12)'),
        }} />
    ))}
  </div>
);

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default QueueScreen;
