import React, { useState } from 'react';
import { ChevronUp, Megaphone, Pause, Play, Radio, RefreshCcw, Shield, Trophy, Vote, WifiOff } from 'lucide-react';
import type { ArenaState, BattleSide, SongWar } from '../../../../data/mockData';

interface Props {
  war: SongWar;
  arena: ArenaState;
  onCheckIn: (side: BattleSide) => void;
  onStartBattle: () => void;
  onSetCountdown: (seconds: number) => void;
  onStartPerformance: (side: BattleSide) => void;
  onOpenVoting: () => void;
  onCloseVoting: () => void;
  onRevealWinner: () => void;
  onNextRound: () => void;
  onPause: () => void;
  onResume: () => void;
  onMute: (side: BattleSide) => void;
  onFlagTech: () => void;
  onAnnouncement: () => void;
  onEndBattle: () => void;
  onReset: () => void;
}

export default function AdminBattleDock(props: Props) {
  const [open, setOpen] = useState(true);
  const { arena, war } = props;
  const both = arena.checkLeft && arena.checkRight;

  return (
    <div className="sticky bottom-3 z-30 mt-4 rounded-3xl border border-fuchsia-300/25 bg-black/80 backdrop-blur-xl shadow-[0_0_50px_-20px_rgba(217,70,239,0.9)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-fuchsia-100">
          <Shield className="h-4 w-4" /> Admin Battle Dock
        </span>
        <span className="inline-flex items-center gap-2 text-[10px] font-bold text-white/45">
          {arena.status}
          <ChevronUp className={`h-4 w-4 transition ${open ? '' : 'rotate-180'}`} />
        </span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-white/10 p-4 pt-3">
          <div className="grid grid-cols-2 gap-2">
            <DockBtn label={`${war.left.name} ${arena.checkLeft ? '✓' : 'Check In'}`} onClick={() => props.onCheckIn('left')} active={arena.checkLeft} />
            <DockBtn label={`${war.right.name} ${arena.checkRight ? '✓' : 'Check In'}`} onClick={() => props.onCheckIn('right')} active={arena.checkRight} />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[10, 30, 60].map((seconds) => (
              <DockBtn key={seconds} label={`${seconds}s`} onClick={() => props.onSetCountdown(seconds)} active={arena.countdownSel === seconds} />
            ))}
          </div>

          <DockBtn
            icon={<Play className="h-3.5 w-3.5" />}
            label="Start Battle"
            onClick={props.onStartBattle}
            disabled={!both || !['ready_to_start', 'waiting_for_checkins'].includes(arena.status)}
            primary
          />

          <div className="grid grid-cols-2 gap-2">
            <DockBtn icon={<Radio className="h-3.5 w-3.5" />} label="Start Artist A" onClick={() => props.onStartPerformance('left')} disabled={!['artist_a_performing', 'artist_b_performing', 'round_break', 'voting_closed', 'winner_reveal'].includes(arena.status)} />
            <DockBtn icon={<Radio className="h-3.5 w-3.5" />} label="Start Artist B" onClick={() => props.onStartPerformance('right')} disabled={!['artist_a_performing', 'artist_b_performing', 'round_break', 'voting_closed', 'winner_reveal'].includes(arena.status)} />
            <DockBtn icon={<Vote className="h-3.5 w-3.5" />} label="Open Voting" onClick={props.onOpenVoting} disabled={!['artist_a_performing', 'artist_b_performing', 'voting_closed', 'round_break'].includes(arena.status)} />
            <DockBtn label="Close Voting" onClick={props.onCloseVoting} disabled={arena.status !== 'voting_open'} />
            <DockBtn icon={<Trophy className="h-3.5 w-3.5" />} label="Reveal Winner" onClick={props.onRevealWinner} disabled={!['voting_closed', 'voting_open'].includes(arena.status)} />
            <DockBtn label="Next Round" onClick={props.onNextRound} disabled={arena.roundNumber >= arena.totalRounds || !['winner_reveal', 'round_break'].includes(arena.status)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DockBtn icon={<Pause className="h-3.5 w-3.5" />} label="Pause Battle" onClick={props.onPause} disabled={arena.status === 'paused' || arena.status === 'completed'} />
            <DockBtn icon={<Play className="h-3.5 w-3.5" />} label="Resume Battle" onClick={props.onResume} disabled={arena.status !== 'paused'} />
            <DockBtn icon={<WifiOff className="h-3.5 w-3.5" />} label={arena.mutedArtistA ? 'Unmute Artist A' : 'Mute Artist A'} onClick={() => props.onMute('left')} />
            <DockBtn icon={<WifiOff className="h-3.5 w-3.5" />} label={arena.mutedArtistB ? 'Unmute Artist B' : 'Mute Artist B'} onClick={() => props.onMute('right')} />
            <DockBtn label={arena.technicalIssue ? 'Clear Tech Issue' : 'Flag Tech Issue'} onClick={props.onFlagTech} />
            <DockBtn icon={<Megaphone className="h-3.5 w-3.5" />} label="Push Announcement" onClick={props.onAnnouncement} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <DockBtn icon={<Trophy className="h-3.5 w-3.5" />} label="End Battle" onClick={props.onEndBattle} danger />
            <DockBtn icon={<RefreshCcw className="h-3.5 w-3.5" />} label="Reset Demo" onClick={props.onReset} />
          </div>
        </div>
      )}
    </div>
  );
}

function DockBtn({ label, onClick, disabled, primary, danger, active, icon }: { label: string; onClick: () => void; disabled?: boolean; primary?: boolean; danger?: boolean; active?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-[11px] font-black transition active:scale-[0.98] ${
        disabled
          ? 'cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/25'
          : primary
            ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-black shadow-[0_0_28px_-10px_rgba(34,211,238,0.9)]'
            : danger
              ? 'border border-red-300/35 bg-red-500/15 text-red-100'
              : active
                ? 'border border-emerald-300/35 bg-emerald-500/15 text-emerald-100'
                : 'border border-white/10 bg-white/[0.06] text-white/75 hover:bg-white/[0.1]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
