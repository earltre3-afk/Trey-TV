import React from 'react';
import { Radio } from 'lucide-react';
import type { ArenaState, SongWar } from '../../../../data/mockData';

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex h-10 items-end gap-[3px]">
      {Array.from({ length: 22 }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-gradient-to-t from-fuchsia-400 to-cyan-300 ${active ? 'animate-pulse' : 'opacity-30'}`}
          style={{ height: `${active ? 25 + ((i * 37) % 65) : 18}%`, animationDelay: `${i * 55}ms` }}
        />
      ))}
    </div>
  );
}

export default function NowPlayingBattleCard({ war, arena }: { war: SongWar; arena: ArenaState }) {
  const performer = arena.currentPerformer === 'left' ? war.left : war.right;
  const active = arena.status === 'artist_a_performing' || arena.status === 'artist_b_performing';

  return (
    <div className="rounded-3xl border border-cyan-300/20 bg-black/35 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">
          <Radio className="h-3.5 w-3.5" /> Now Playing
        </span>
        <span className="text-[11px] font-semibold text-white/45">{active ? '-1:24 left' : 'Standby'}</span>
      </div>
      <div className="flex items-center gap-3">
        <img src={performer.image} alt={performer.name} className="h-16 w-16 rounded-2xl object-cover border border-white/10" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-black text-white">{performer.track}</p>
          <p className="truncate text-xs text-white/45">{performer.name} • Round {arena.roundNumber}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className={`h-full rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 ${active ? 'w-2/3' : 'w-1/5'} transition-all duration-700`} />
          </div>
        </div>
        <Waveform active={active} />
      </div>
    </div>
  );
}
