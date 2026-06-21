import React from 'react';
import { Crown, Mic2, Radio, WifiOff } from 'lucide-react';
import type { Contestant, ArenaState, BattleSide } from '../../../../data/mockData';
import CheckInIndicator from './CheckInIndicator';

function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 50;
}

export default function ArtistBattleCard({
  contestant,
  side,
  arena,
  checked,
  roundWins,
}: {
  contestant: Contestant;
  side: BattleSide;
  arena: ArenaState;
  checked: boolean;
  roundWins: number;
}) {
  const isLeft = side === 'left';
  const performing = arena.status === (isLeft ? 'artist_a_performing' : 'artist_b_performing');
  const muted = isLeft ? arena.mutedArtistA : arena.mutedArtistB;
  const votes = arena.roundVotes[side];
  const total = arena.roundVotes.left + arena.roundVotes.right;
  const votePct = pct(votes, total);
  const status = muted ? 'muted' : arena.technicalIssue ? 'connection issue' : performing ? 'performing' : 'waiting';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border p-3 ${
        performing
          ? 'border-fuchsia-300/60 shadow-[0_0_35px_-14px_rgba(217,70,239,0.9)]'
          : roundWins > 0
            ? 'border-cyan-300/35'
            : 'border-white/10'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] via-white/[0.025] to-black/50" />
      {performing && <div className="absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-fuchsia-500/30 blur-3xl animate-pulse" />}
      <div className="relative">
        <div className="relative mx-auto h-20 w-20">
          <img src={contestant.image} alt={contestant.name} className="h-20 w-20 rounded-full object-cover border-2 border-black/50" />
          {roundWins > 0 && (
            <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border border-fuchsia-200/40 bg-black/80 text-fuchsia-100">
              <Crown className="h-3.5 w-3.5" fill="currentColor" />
            </span>
          )}
        </div>
        <div className="mt-3 text-center">
          <p className="truncate text-sm font-black text-white">{contestant.name}</p>
          <p className="truncate text-[10px] text-white/45">{contestant.track}</p>
        </div>

        <div className="mt-3 flex items-center justify-center">
          <CheckInIndicator checked={checked} label={checked ? 'Checked In' : 'Pending'} />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="rounded-2xl bg-black/35 border border-white/10 px-2 py-2">
            <p className="text-xl font-black text-white">{votePct}%</p>
            <p className="text-[9px] uppercase tracking-wide text-white/35">Votes</p>
          </div>
          <div className="rounded-2xl bg-black/35 border border-white/10 px-2 py-2">
            <p className="text-xl font-black text-cyan-200">{roundWins}</p>
            <p className="text-[9px] uppercase tracking-wide text-white/35">Rounds</p>
          </div>
        </div>

        <div
          className={`mt-3 flex items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
            performing
              ? 'bg-fuchsia-500/20 text-fuchsia-100 border border-fuchsia-300/30'
              : muted || arena.technicalIssue
                ? 'bg-red-500/15 text-red-100 border border-red-300/30'
                : 'bg-white/[0.05] text-white/45 border border-white/10'
          }`}
        >
          {muted || arena.technicalIssue ? <WifiOff className="h-3 w-3" /> : performing ? <Mic2 className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
          {status}
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-300 transition-all duration-500"
            style={{ width: `${votePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
