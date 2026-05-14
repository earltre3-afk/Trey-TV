/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { X, Spade, Layers, Sparkles, Lock, Globe, Loader2 } from 'lucide-react';
import { GameType } from '@/features/games/lib/services/roomService';

interface CreateProps {
  open: boolean;
  onClose: () => void;
  onCreate: (opts: { gameType: GameType; isPrivate: boolean; targetScore: number }) => Promise<void>;
  defaultGame?: GameType;
}

export const CreateRoomModal: React.FC<CreateProps> = ({ open, onClose, onCreate, defaultGame = 'spades' }) => {
  const [gameType, setGameType] = useState<GameType>(defaultGame);
  const [isPrivate, setIsPrivate] = useState(true);
  const [targetScore, setTargetScore] = useState(500);
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  const handle = async () => {
    setBusy(true);
    try { await onCreate({ gameType, isPrivate, targetScore }); }
    finally { setBusy(false); }
  };
  const games: { id: GameType; name: string; icon: React.ReactNode; color: string }[] = [
    { id: 'spades',    name: 'Spades',    icon: <Spade size={16} />,    color: '#00B7FF' },
    { id: 'blackjack', name: 'Blackjack', icon: <Layers size={16} />,   color: '#FFC857' },
    { id: 'bullshit',  name: 'Bullshit',  icon: <Sparkles size={16} />, color: '#A855F7' },
  ];
  return (
    <Backdrop onClose={onClose}>
      <div className="text-xs text-cyan-300 tracking-widest">CREATE ROOM</div>
      <h2 className="text-2xl font-bold mb-4">New Game Room</h2>

      <label className="text-xs text-slate-400 mb-2 block">Choose Game</label>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {games.map(g => (
          <button key={g.id} onClick={() => setGameType(g.id)}
            className="rounded-2xl p-3 border transition-all"
            style={{
              background: gameType === g.id ? g.color + '20' : 'rgba(8,17,31,0.6)',
              borderColor: gameType === g.id ? g.color : 'rgba(255,255,255,0.08)',
              color: gameType === g.id ? g.color : '#F8FAFC',
              boxShadow: gameType === g.id ? `0 0 18px ${g.color}40` : 'none',
            }}>
            <div className="flex flex-col items-center gap-1.5">
              {g.icon}
              <div className="text-xs font-bold">{g.name}</div>
            </div>
          </button>
        ))}
      </div>

      <label className="text-xs text-slate-400 mb-2 block">Visibility</label>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <button onClick={() => setIsPrivate(true)}
          className="rounded-xl p-2.5 border flex items-center justify-center gap-2 text-sm"
          style={{
            background: isPrivate ? 'rgba(168,85,247,0.15)' : 'rgba(8,17,31,0.6)',
            borderColor: isPrivate ? '#A855F7' : 'rgba(255,255,255,0.08)',
            color: isPrivate ? '#C4A6FF' : '#94A3B8',
          }}>
          <Lock size={14} /> Private
        </button>
        <button onClick={() => setIsPrivate(false)}
          className="rounded-xl p-2.5 border flex items-center justify-center gap-2 text-sm"
          style={{
            background: !isPrivate ? 'rgba(0,183,255,0.15)' : 'rgba(8,17,31,0.6)',
            borderColor: !isPrivate ? '#00B7FF' : 'rgba(255,255,255,0.08)',
            color: !isPrivate ? '#00B7FF' : '#94A3B8',
          }}>
          <Globe size={14} /> Public
        </button>
      </div>

      {gameType === 'spades' && (
        <>
          <label className="text-xs text-slate-400 mb-2 block">Target Score</label>
          <div className="flex gap-2 mb-5">
            {[200, 300, 500].map(s => (
              <button key={s} onClick={() => setTargetScore(s)}
                className="flex-1 py-2 rounded-xl text-sm font-bold border"
                style={{
                  background: targetScore === s ? 'rgba(255,200,87,0.15)' : 'rgba(8,17,31,0.6)',
                  borderColor: targetScore === s ? '#FFC857' : 'rgba(255,255,255,0.08)',
                  color: targetScore === s ? '#FFC857' : '#94A3B8',
                }}>{s}</button>
            ))}
          </div>
        </>
      )}

      <button onClick={handle} disabled={busy}
        className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        style={{ background: 'linear-gradient(90deg,#00B7FF,#A855F7)', color: '#fff' }}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
        Create Room
      </button>
    </Backdrop>
  );
};

interface JoinProps {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}
export const JoinRoomModal: React.FC<JoinProps> = ({ open, onClose, onJoin }) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  if (!open) return null;
  const handle = async () => {
    setBusy(true); setErr('');
    try { await onJoin(code.toUpperCase()); }
    catch (e: any) { setErr(e.message || 'Failed to join'); }
    finally { setBusy(false); }
  };
  return (
    <Backdrop onClose={onClose}>
      <div className="text-xs text-cyan-300 tracking-widest">JOIN ROOM</div>
      <h2 className="text-2xl font-bold mb-4">Enter Room Code</h2>
      <input value={code} onChange={e => setCode(e.target.value.toUpperCase().slice(0,6))}
        placeholder="ABC123"
        className="w-full bg-black/40 rounded-2xl px-4 py-4 text-2xl font-bold tracking-[0.4em] text-center border outline-none focus:border-cyan-400 mb-2"
        style={{ borderColor: 'rgba(0,183,255,0.3)' }} />
      {err && <div className="text-xs text-red-400 mb-2">{err}</div>}
      <p className="text-xs text-slate-500 mb-5">Ask the host for their 6-character code. Public rooms can also be joined this way.</p>
      <button onClick={handle} disabled={busy || code.length !== 6}
        className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-30"
        style={{ background: 'linear-gradient(90deg,#00B7FF,#A855F7)', color: '#fff' }}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
        Join Room
      </button>
    </Backdrop>
  );
};

const Backdrop: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
    <div className="relative w-full max-w-md rounded-3xl p-6 border"
      style={{ background: 'linear-gradient(160deg,#08111F,#05070D)', borderColor: 'rgba(0,183,255,0.3)', boxShadow: '0 0 60px rgba(0,183,255,0.25)' }}
      onClick={e => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><X size={20} /></button>
      {children}
    </div>
  </div>
);
