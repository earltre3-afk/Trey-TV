import React from 'react';
import type { ArenaState } from '../../../../data/mockData';

const REACTIONS = [
  { key: 'fire', label: '🔥' },
  { key: 'crown', label: '👑' },
  { key: 'hundred', label: '💯' },
  { key: 'speaker', label: '🔊' },
  { key: 'shock', label: '😮' },
  { key: 'heart', label: '💜' },
  { key: 'trizzy', label: 'TRIZZY' },
];

export default function ReactionStrip({ arena, onReact }: { arena: ArenaState; onReact: (key: string, label: string) => void }) {
  return (
    <div className="relative rounded-3xl border border-white/10 bg-black/35 p-3 overflow-hidden">
      <div className="absolute inset-x-0 -top-14 h-20 bg-gradient-to-b from-fuchsia-500/20 to-transparent blur-2xl" />
      <div className="relative flex items-center gap-2 overflow-x-auto no-scrollbar">
        {REACTIONS.map((reaction) => (
          <button
            key={reaction.key}
            onClick={() => onReact(reaction.key, reaction.label)}
            className={`shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-black text-white transition active:scale-90 ${reaction.key === 'trizzy' ? 'text-[10px] tracking-widest text-fuchsia-100 border-fuchsia-300/30 bg-fuchsia-500/15' : ''}`}
          >
            {reaction.label}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {arena.reactions.slice(0, 8).map((r, i) => (
          <span
            key={r.id}
            className="absolute rounded-full bg-black/40 px-2 py-1 text-sm font-black text-white animate-bounce"
            style={{ left: `${8 + ((i * 17) % 72)}%`, bottom: `${18 + (i % 3) * 16}px`, animationDelay: `${i * 80}ms` }}
          >
            {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}
