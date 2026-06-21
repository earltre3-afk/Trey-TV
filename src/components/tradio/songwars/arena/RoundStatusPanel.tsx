import React from 'react';
import { Clock3, Swords, TimerReset } from 'lucide-react';
import type { ArenaState, SongWar } from '../../../../data/mockData';
import BattleStatusBadge from './BattleStatusBadge';

export default function RoundStatusPanel({ war, arena }: { war: SongWar; arena: ArenaState }) {
  const performer = arena.currentPerformer === 'left' ? war.left : war.right;
  const statusCopy =
    arena.status === 'artist_a_performing' || arena.status === 'artist_b_performing'
      ? `${performer.name} is on stage`
      : arena.status === 'voting_open'
        ? `Voting closes in ${arena.voteSeconds}s`
        : arena.status === 'voting_closed'
          ? 'Voting closed. Reveal the winner.'
          : arena.status === 'round_break'
            ? `Round ${arena.roundNumber} is staged and ready.`
            : arena.announcement ?? 'Song Wars live control center';

  return (
    <div className="relative overflow-hidden rounded-3xl border border-fuchsia-300/20 bg-white/[0.04] p-4 backdrop-blur-sm">
      <div className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="relative flex items-center justify-between gap-3">
        <BattleStatusBadge status={arena.status} />
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white/60">
          <Clock3 className="h-3 w-3 text-cyan-200" /> Round {arena.roundNumber}/{arena.totalRounds}
        </span>
      </div>
      <div className="relative mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-fuchsia-300/30 bg-fuchsia-500/15 text-fuchsia-100">
          <Swords className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-black text-white">{war.title}</p>
          <p className="text-xs text-white/50">{statusCopy}</p>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-200">
          <TimerReset className="h-3 w-3" /> {arena.peakViewers.toLocaleString()} peak
        </div>
      </div>
    </div>
  );
}
