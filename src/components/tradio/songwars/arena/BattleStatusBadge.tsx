import React from 'react';
import { Radio, Pause, Trophy, Vote, Zap } from 'lucide-react';
import type { LiveStatus } from '../../../../data/mockData';

const LABELS: Record<LiveStatus, string> = {
  waiting_for_checkins: 'Waiting for check-ins',
  ready_to_start: 'Ready to start',
  live_starting: 'Starting live',
  artist_a_performing: 'Artist A performing',
  artist_b_performing: 'Artist B performing',
  voting_open: 'Voting open',
  voting_closed: 'Voting closed',
  winner_reveal: 'Winner reveal',
  round_break: 'Round break',
  paused: 'Paused',
  completed: 'Completed',
};

export default function BattleStatusBadge({ status }: { status: LiveStatus }) {
  const live = ['artist_a_performing', 'artist_b_performing', 'voting_open'].includes(status);
  const Icon = status === 'paused' ? Pause : status === 'completed' ? Trophy : status.includes('voting') ? Vote : live ? Radio : Zap;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] border ${
        live
          ? 'border-red-400/50 bg-red-500/20 text-red-100 shadow-[0_0_22px_-8px_rgba(239,68,68,0.9)]'
          : status === 'ready_to_start'
            ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
            : status === 'completed'
              ? 'border-fuchsia-300/40 bg-fuchsia-500/20 text-fuchsia-100'
              : 'border-white/10 bg-white/[0.06] text-white/70'
      }`}
    >
      {live && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
      <Icon className="h-3 w-3" />
      {LABELS[status]}
    </span>
  );
}
