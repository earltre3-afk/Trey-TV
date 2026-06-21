import React from 'react';
import { Share2, Trophy, Users } from 'lucide-react';
import type { ArenaState, SongWar } from '../../../../data/mockData';

export default function BattleSummary({ war, arena, onReturn }: { war: SongWar; arena: ArenaState; onReturn: () => void }) {
  const leftWins = arena.roundResults.filter((r) => r.winner === 'left').length;
  const rightWins = arena.roundResults.filter((r) => r.winner === 'right').length;
  const winnerSide = arena.winner ?? (leftWins === rightWins ? 'tie' : leftWins > rightWins ? 'left' : 'right');
  const winner = winnerSide === 'left' ? war.left : winnerSide === 'right' ? war.right : undefined;
  const totalVotes = arena.roundResults.reduce((sum, r) => sum + r.leftVotes + r.rightVotes, 0);

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-300/25 bg-black p-5 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/45 via-black to-black" />
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-[90px]" />
        <div className="relative">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-cyan-200/35 bg-cyan-400/15 text-cyan-100">
            <Trophy className="h-8 w-8" fill="currentColor" />
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-200/80">Song Wars Champion</p>
          {winner ? <h2 className="mt-2 text-3xl font-black text-white">{winner.name}</h2> : <h2 className="mt-2 text-3xl font-black text-white">Battle tied</h2>}
          <p className="mt-1 text-sm text-white/50">Final score: {war.left.name} {leftWins} — {rightWins} {war.right.name}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
        <p className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-200">Round-by-round results</p>
        <div className="space-y-2">
          {arena.roundResults.map((r) => (
            <div key={r.round} className="flex items-center justify-between rounded-2xl bg-black/35 px-3 py-2 text-sm">
              <span className="font-bold text-white">Round {r.round}</span>
              <span className="text-white/55">{r.winner === 'tie' ? 'Tie' : r.winner === 'left' ? war.left.name : war.right.name}</span>
              <span className="text-[11px] text-cyan-200">{r.leftPct}% / {r.rightPct}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat icon={<Users className="h-4 w-4" />} value={totalVotes.toLocaleString()} label="Total votes" />
        <Stat value={arena.peakViewers.toLocaleString()} label="Peak viewers" />
        <Stat value="🔥" label="Top reaction" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-4">
        <p className="text-sm font-black text-white">Replay placeholder</p>
        <p className="mt-1 text-xs text-white/45">A full battle replay card will live here after real streaming is wired.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-fuchsia-400 to-cyan-300 px-4 py-3 text-sm font-black text-black">
          <Share2 className="h-4 w-4" /> Share Result
        </button>
        <button onClick={onReturn} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-black text-white">Return to Tradio</button>
      </div>
    </div>
  );
}

function Stat({ value, label, icon }: { value: string; label: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3 text-center">
      <p className="flex items-center justify-center gap-1 text-lg font-black text-white">{icon}{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-white/35">{label}</p>
    </div>
  );
}
