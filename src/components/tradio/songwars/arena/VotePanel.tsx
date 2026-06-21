import React from 'react';
import { Check, Lock, Vote } from 'lucide-react';
import type { ArenaState, BattleSide, SongWar } from '../../../../data/mockData';

function pct(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 50;
}

export default function VotePanel({
  war,
  arena,
  onVote,
}: {
  war: SongWar;
  arena: ArenaState;
  onVote: (side: BattleSide) => void;
}) {
  const voted = arena.userVoteByRound[arena.roundNumber];
  const total = arena.roundVotes.left + arena.roundVotes.right;
  const leftPct = pct(arena.roundVotes.left, total || 1);
  const rightPct = pct(arena.roundVotes.right, total || 1);
  const open = arena.status === 'voting_open';

  return (
    <div className="rounded-3xl border border-fuchsia-300/20 bg-white/[0.04] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-fuchsia-200">
          <Vote className="h-3.5 w-3.5" /> Fan Voting
        </span>
        <span className="text-[11px] font-bold text-white/50">
          {open ? `Closes in ${arena.voteSeconds}s` : voted ? 'Vote locked' : 'Voting locked'}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <VoteButton label={`Vote ${war.left.name}`} picked={voted === 'left'} disabled={!open || !!voted} locked={!open} onClick={() => onVote('left')} />
        <VoteButton label={`Vote ${war.right.name}`} picked={voted === 'right'} disabled={!open || !!voted} locked={!open} onClick={() => onVote('right')} />
      </div>
      <div className="mt-4 space-y-2">
        <Bar label={war.left.name} pct={leftPct} />
        <Bar label={war.right.name} pct={rightPct} flip />
      </div>
      <p className="mt-3 text-center text-[11px] text-white/45">
        {open ? 'Pick the winner for this round.' : voted ? 'Vote locked. Results reveal soon.' : 'Voting opens after both performances.'}
      </p>
    </div>
  );
}

function VoteButton({ label, picked, disabled, locked, onClick }: { label: string; picked: boolean; disabled: boolean; locked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[56px] rounded-2xl px-3 py-3 text-sm font-black transition active:scale-[0.98] ${
        picked
          ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-black shadow-[0_0_30px_-10px_rgba(217,70,239,0.9)]'
          : disabled
            ? 'border border-white/10 bg-white/[0.04] text-white/35'
            : 'border border-fuchsia-300/35 bg-fuchsia-500/15 text-white hover:bg-fuchsia-500/25'
      }`}
    >
      {picked ? <span className="inline-flex items-center gap-1"><Check className="h-4 w-4" /> Voted</span> : locked ? <span className="inline-flex items-center gap-1"><Lock className="h-4 w-4" /> Locked</span> : label}
    </button>
  );
}

function Bar({ label, pct, flip }: { label: string; pct: number; flip?: boolean }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-bold text-white/55">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${flip ? 'from-cyan-300 to-fuchsia-400' : 'from-fuchsia-400 to-pink-400'} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
