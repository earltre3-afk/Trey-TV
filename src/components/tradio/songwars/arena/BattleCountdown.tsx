import React from 'react';
import type { ArenaState, SongWar } from '../../../../data/mockData';

export default function BattleCountdown({ war, arena }: { war: SongWar; arena: ArenaState }) {
  return (
    <div className="relative flex min-h-[620px] flex-1 flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-fuchsia-300/20 bg-black p-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-900/45 via-[#090914] to-black" />
      <div className="absolute -top-16 left-1/3 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-[90px] animate-pulse" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/20 blur-[90px]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(115deg,transparent_40%,rgba(255,255,255,0.20)_50%,transparent_60%)] animate-pulse" />
      {['🔥', '👑', '💯', 'TRIZZY', '💜'].map((e, i) => (
        <span key={i} className="absolute text-2xl font-black animate-bounce opacity-70" style={{ left: `${10 + i * 18}%`, bottom: `${12 + (i % 3) * 18}%`, animationDelay: `${i * 180}ms` }}>
          {e}
        </span>
      ))}

      <div className="relative z-10">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.34em] text-fuchsia-200/80">Song Wars begins in</p>
        <p className="text-[118px] font-black leading-none text-white drop-shadow-[0_0_38px_rgba(217,70,239,0.9)]">{arena.countdown}</p>
        <div className="mt-7 flex items-center justify-center gap-5">
          <div className="text-right">
            <p className="text-lg font-black text-white">{war.left.name}</p>
            <p className="text-[11px] font-bold text-fuchsia-200/60">Stage A</p>
          </div>
          <span className="rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-sm font-black text-cyan-100">VS</span>
          <div className="text-left">
            <p className="text-lg font-black text-white">{war.right.name}</p>
            <p className="text-[11px] font-bold text-cyan-200/60">Stage B</p>
          </div>
        </div>
      </div>
    </div>
  );
}
