import React from 'react';
import { Crown, Trophy } from 'lucide-react';
import type { ArenaState, BattleSide, SongWar } from '../../../../data/mockData';

export default function WinnerReveal({
  war,
  arena,
  isAdmin,
  onNextRound,
  onEndBattle,
}: {
  war: SongWar;
  arena: ArenaState;
  isAdmin: boolean;
  onNextRound: () => void;
  onEndBattle: () => void;
}) {
  const result = arena.roundResults.find((r) => r.round === arena.roundNumber) ?? arena.roundResults.at(-1);
  const winnerSide: BattleSide | 'tie' = result?.winner ?? arena.winner ?? 'tie';
  const winner = winnerSide === 'left' ? war.left : winnerSide === 'right' ? war.right : undefined;
  const moreRounds = arena.roundNumber < arena.totalRounds;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-300/25 bg-black p-5 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-950/70 via-black to-black" />
      <div className="absolute left-1/2 top-6 h-72 w-72 -translate-x-1/2 rounded-full bg-fuchsia-400/25 blur-[80px]" />
      <div className="absolute left-1/2 top-24 h-44 w-44 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[70px]" />
      <div className="relative">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-fuchsia-200/40 bg-fuchsia-500/20 text-fuchsia-100 shadow-[0_0_45px_-12px_rgba(217,70,239,0.9)]">
          <Trophy className="h-8 w-8" fill="currentColor" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-fuchsia-200/80">Round {arena.roundNumber} Winner</p>
        {winner ? (
          <>
            <img src={winner.image} alt={winner.name} className="mx-auto mt-5 h-32 w-32 rounded-full border-4 border-black/70 object-cover shadow-[0_0_35px_-10px_rgba(34,211,238,0.8)]" />
            <h2 className="mt-4 text-3xl font-black text-white">{winner.name}</h2>
            <p className="mt-1 text-sm text-white/55">{winner.name} takes the round.</p>
          </>
        ) : (
          <>
            <h2 className="mt-5 text-3xl font-black text-white">It’s a tie</h2>
            <p className="mt-1 text-sm text-white/55">The room split the vote evenly.</p>
          </>
        )}

        {result && (
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-white/55">
              <span>{war.left.name}</span>
              <span>{result.leftPct}%</span>
            </div>
            <div className="mb-3 h-2 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full bg-gradient-to-r from-fuchsia-400 to-pink-400" style={{ width: `${result.leftPct}%` }} /></div>
            <div className="mb-2 flex items-center justify-between text-[11px] font-bold text-white/55">
              <span>{war.right.name}</span>
              <span>{result.rightPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full bg-gradient-to-r from-cyan-300 to-fuchsia-400" style={{ width: `${result.rightPct}%` }} /></div>
          </div>
        )}

        {isAdmin && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            {moreRounds && <button onClick={onNextRound} className="rounded-2xl bg-gradient-to-r from-fuchsia-400 to-cyan-300 px-4 py-3 text-sm font-black text-black">Next Round</button>}
            <button onClick={onEndBattle} className="rounded-2xl border border-white/10 bg-white/[0.07] px-4 py-3 text-sm font-black text-white">End Battle</button>
          </div>
        )}
        {winner && <Crown className="pointer-events-none absolute right-12 top-24 h-10 w-10 rotate-12 text-fuchsia-200/60" fill="currentColor" />}
      </div>
    </div>
  );
}
