import React, { useState } from 'react';
import { Mic, MessageSquare, Send, Plus, Trophy, MoreVertical, ChevronDown, Clock } from 'lucide-react';
import TrunoCard from '../components/TrunoCard';
import { TrunoCard as TCard, sampleHand } from '../lib/cards';
import { avatarFor } from '../lib/avatars';

interface Props {
  onNavigate: (view: string, params?: any) => void;
}

const opponents = [
  { name: 'Trey-1', cards: 12, score: 2450, pos: 'top' },
  { name: 'Zay',    cards: 9,  score: 1890, pos: 'left' },
  { name: 'Maya',   cards: 10, score: 2210, pos: 'right' },
];

const chatMessages = [
  { who: 'Trey-1', msg: "Let's gooo 🔥" },
  { who: 'Zay',    msg: "Don't play yourself 😂" },
  { who: 'Maya',   msg: '👀👀👀👀' },
  { who: 'Lena',   msg: 'TRUNO TIME! 😈' },
];

const reactions = ['🔥', '😂', '😮', '👏', '+'];

const MatchScreen: React.FC<Props> = ({ onNavigate }) => {
  const [hand] = useState<TCard[]>(sampleHand());
  const [selected, setSelected] = useState<string | null>(null);
  const [voice, setVoice] = useState(true);
  const [chat, setChat] = useState(true);

  const topCard: TCard = { id: 'top', color: 'blue', symbol: 'number', value: 7, label: '7' };

  return (
    <div className="px-3 pb-24">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
            <ChevronDown className="rotate-90 text-zinc-300" size={16} />
          </button>
          <div className="rounded-xl bg-zinc-950/80 border border-zinc-800 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Trophy size={12} className="text-amber-400" />
              <span className="text-[10px] text-zinc-400 font-semibold">Room ID</span>
            </div>
            <span className="text-sm font-bold text-white">784 512</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="px-4 py-2 rounded-xl border border-pink-500/50 text-pink-300 text-sm font-bold hover:bg-pink-500/10"
          >
            Leave Match
          </button>
          <button className="w-9 h-9 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
            <MoreVertical size={16} className="text-zinc-300" />
          </button>
        </div>
      </div>

      <div className="mx-auto w-fit rounded-full bg-zinc-950/80 border border-fuchsia-500/30 px-4 py-1.5 mb-4 flex items-center gap-3">
        <span className="text-xs font-bold text-fuchsia-300">🔥 HIGH STAKES TABLE</span>
        <span className="text-xs text-zinc-500">|</span>
        <span className="text-xs text-zinc-300">Bet: <span className="text-amber-400 font-bold">★ 500</span></span>
      </div>

      <div className="relative aspect-square max-w-md mx-auto">
        <div className="absolute inset-0 rounded-full" style={{
          background: 'radial-gradient(circle, transparent 35%, rgba(157,78,221,0.15) 50%, transparent 65%)'
        }} />
        <div className="absolute inset-8 rounded-full border border-purple-500/30" />
        <div className="absolute inset-16 rounded-full border border-fuchsia-500/20" />
        <div className="absolute inset-24 rounded-full border border-blue-500/20" />

        <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="flex items-center gap-1 mb-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-3 h-8 rounded-sm border border-purple-500/40" style={{ transform: `rotate(${(i - 2) * 4}deg)`, background: 'rgba(157,78,221,0.1)' }} />
            ))}
          </div>
          <PlayerAvatar p={opponents[0]} cards={12} />
        </div>

        <div className="absolute top-1/2 left-0 -translate-y-1/2 flex flex-col items-center">
          <PlayerAvatar p={opponents[1]} cards={9} />
          <div className="flex items-center mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-2.5 h-7 rounded-sm border border-purple-500/40 -mr-1" style={{ transform: `rotate(${(i - 2) * 6}deg)` }} />
            ))}
          </div>
        </div>

        <div className="absolute top-1/2 right-0 -translate-y-1/2 flex flex-col items-center">
          <PlayerAvatar p={opponents[2]} cards={10} />
          <div className="flex items-center mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-2.5 h-7 rounded-sm border border-purple-500/40 -mr-1" style={{ transform: `rotate(${(i - 2) * 6}deg)` }} />
            ))}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center gap-3">
          <TrunoCard card={{ id: 'd', color: 'black', symbol: 'wild', label: 'W' }} faceDown size="md" />
          <TrunoCard card={topCard} size="md" playable />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 bottom-1/4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950/80 border border-zinc-800">
          <span className="text-[10px] text-zinc-400">Current Color</span>
          <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,217,255,0.8)]" />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2 text-xs">
        <button className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold">
          <ChevronDown size={14} className="rotate-180" /> YOUR TURN
        </button>
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300">
          <Clock size={12} /> 15s
        </span>
      </div>

      <div className="mt-3 relative flex justify-center items-end overflow-visible" style={{ height: 130 }}>
        {hand.map((c, i) => {
          const mid = Math.floor(hand.length / 2);
          const offset = i - mid;
          const isSel = selected === c.id;
          return (
            <div
              key={c.id}
              className="absolute transition-transform"
              style={{
                transform: `translateX(${offset * 42}px) translateY(${Math.abs(offset) * 4}px) rotate(${offset * 5}deg) ${isSel ? 'translateY(-20px) scale(1.1)' : ''}`,
                zIndex: isSel ? 100 : 10 + i,
              }}
            >
              <TrunoCard card={c} size="sm" playable onClick={() => setSelected(c.id)} selected={isSel} />
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button className="rounded-2xl border border-purple-500/40 bg-zinc-950/70 py-3 text-purple-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-500/10">
          <Plus size={16} /> Draw
        </button>
        <button className="rounded-2xl py-3 font-black text-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 via-purple-600 to-pink-600 blur-md opacity-70 group-hover:opacity-100" />
          <div className="relative">
            <div className="text-white text-base leading-none">CALL TRUNO</div>
            <div className="text-[9px] text-fuchsia-100 mt-0.5">If you have 1 card left</div>
          </div>
        </button>
        <button className="rounded-2xl border border-cyan-500/40 bg-zinc-950/70 py-3 text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-500/10">
          ▶ Play Card
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button onClick={() => setVoice(!voice)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <div className={`w-7 h-7 rounded-full ${voice ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-zinc-800'} flex items-center justify-center`}>
            <Mic size={14} className={voice ? 'text-emerald-300' : 'text-zinc-500'} />
          </div>
          <span className="text-xs text-zinc-300">Voice: <span className={voice ? 'text-emerald-300 font-bold' : 'text-zinc-500'}>{voice ? 'On' : 'Off'}</span></span>
        </button>
        <button onClick={() => setChat(!chat)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <div className={`w-7 h-7 rounded-full ${chat ? 'bg-cyan-500/20 border border-cyan-500/50' : 'bg-zinc-800'} flex items-center justify-center`}>
            <MessageSquare size={14} className={chat ? 'text-cyan-300' : 'text-zinc-500'} />
          </div>
          <span className="text-xs text-zinc-300">Chat: <span className={chat ? 'text-cyan-300 font-bold' : 'text-zinc-500'}>{chat ? 'On' : 'Off'}</span></span>
        </button>
      </div>

      {chat && (
        <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-zinc-300">Live Chat</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            {chatMessages.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <img src={avatarFor(m.who)} alt={m.who} className="w-6 h-6 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-bold text-fuchsia-300">{m.who}</span>
                  <p className="text-[11px] text-zinc-300 truncate">{m.msg}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              placeholder="Say something..."
              className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 outline-none focus:border-fuchsia-500/50"
            />
            <button className="w-8 h-8 rounded-lg bg-fuchsia-500/20 border border-fuchsia-500/40 flex items-center justify-center">
              <Send size={12} className="text-fuchsia-300" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            {reactions.map((r, i) => (
              <button key={i} className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm hover:bg-zinc-800">
                {r === '+' ? <Plus size={12} className="text-zinc-400" /> : r}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PlayerAvatar: React.FC<{ p: { name: string; score: number }; cards: number }> = ({ p, cards }) => (
  <div className="flex flex-col items-center">
    <div className="relative">
      <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-fuchsia-500/60 shadow-[0_0_20px_rgba(255,0,128,0.45)]">
        <img src={avatarFor(p.name)} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
      </div>
      <span className="absolute -top-1 -right-1 min-w-6 h-6 px-1.5 rounded-full bg-zinc-950 border border-zinc-700 text-[10px] font-black text-white flex items-center justify-center">{cards}</span>
      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-black" />
    </div>
    <span className="mt-1 text-[11px] font-bold text-white">{p.name}</span>
    <span className="text-[10px] text-amber-400 flex items-center gap-0.5">🏆 {p.score}</span>
  </div>
);

export default MatchScreen;
