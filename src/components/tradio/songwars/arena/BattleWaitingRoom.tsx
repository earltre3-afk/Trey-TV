import React from 'react';
import { Lock, Play, Radio } from 'lucide-react';
import type { ArenaState, BattleSide, SongWar } from '../../../../data/mockData';
import CheckInIndicator from './CheckInIndicator';

interface Props {
  war: SongWar;
  arena: ArenaState;
  isAdmin: boolean;
  onCheckIn: (side: BattleSide) => void;
  onSetCountdown: (seconds: number) => void;
  onStartBattle: () => void;
}

export default function BattleWaitingRoom({ war, arena, isAdmin, onCheckIn, onSetCountdown, onStartBattle }: Props) {
  const both = arena.checkLeft && arena.checkRight;
  const message = both
    ? 'Both artists checked in. Ready to start.'
    : arena.checkLeft
      ? `${war.left.name} checked in`
      : arena.checkRight
        ? `${war.right.name} checked in`
        : 'Waiting for both artists to check in';

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl border border-fuchsia-300/25 p-5">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/40 via-[#090914] to-black" />
        <div className="absolute -top-14 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-[80px]" />
        <div className="relative">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-fuchsia-300/35 bg-black/45 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-100">
            <Radio className="h-3 w-3" /> Pre-Battle Waiting Room
          </span>
          <h2 className="text-2xl font-black leading-tight text-white">{war.title}</h2>
          <p className="mt-1 text-xs font-semibold text-white/50">{war.hype}</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <CheckCard image={war.left.image} name={war.left.name} track={war.left.track} checked={arena.checkLeft} />
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-400/10 text-sm font-black text-cyan-100">VS</div>
        <CheckCard image={war.right.image} name={war.right.name} track={war.right.track} checked={arena.checkRight} />
      </div>

      <div className={`rounded-3xl border p-4 text-center ${both ? 'border-emerald-300/35 bg-emerald-500/10' : 'border-white/10 bg-white/[0.035]'}`}>
        <p className={`text-sm font-bold ${both ? 'text-emerald-200' : 'text-white/65'}`}>{message}</p>
        {!isAdmin && <p className="mt-1 text-xs text-white/40">Battle starts soon. The live arena opens when admin starts the battle.</p>}
      </div>

      {isAdmin && (
        <div className="rounded-3xl border border-fuchsia-300/25 bg-fuchsia-950/15 p-4">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-200">Admin Ready State</p>
          <div className="grid grid-cols-2 gap-2">
            <Action label={arena.checkLeft ? `${war.left.name} ✓` : `Check in ${war.left.name}`} onClick={() => onCheckIn('left')} active={arena.checkLeft} />
            <Action label={arena.checkRight ? `${war.right.name} ✓` : `Check in ${war.right.name}`} onClick={() => onCheckIn('right')} active={arena.checkRight} />
          </div>
          <p className="mt-4 mb-2 text-[11px] font-semibold text-white/50">Countdown selector</p>
          <div className="grid grid-cols-3 gap-2">
            {[10, 30, 60].map((s) => <Action key={s} label={`${s} seconds`} onClick={() => onSetCountdown(s)} active={arena.countdownSel === s} />)}
          </div>
          <button
            disabled={!both}
            onClick={onStartBattle}
            className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-black transition active:scale-[0.98] ${both ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-black shadow-[0_0_30px_-10px_rgba(217,70,239,0.9)]' : 'cursor-not-allowed bg-white/[0.05] text-white/30'}`}
          >
            {both ? <Play className="h-5 w-5" fill="currentColor" /> : <Lock className="h-5 w-5" />}
            Start Battle
          </button>
          <p className="mt-3 text-center text-[11px] leading-relaxed text-pink-200/65">Starting the battle will open the live arena for viewers and lock artist check-in.</p>
        </div>
      )}
    </div>
  );
}

function CheckCard({ image, name, track, checked }: { image: string; name: string; track: string; checked: boolean }) {
  return (
    <div className={`rounded-3xl border p-3 text-center ${checked ? 'border-emerald-300/35 bg-emerald-500/10' : 'border-white/10 bg-white/[0.035]'}`}>
      <img src={image} alt={name} className="mx-auto h-20 w-20 rounded-full object-cover border-2 border-black/50" />
      <p className="mt-2 truncate text-sm font-black text-white">{name}</p>
      <p className="truncate text-[10px] text-white/40">{track}</p>
      <div className="mt-2 flex justify-center"><CheckInIndicator checked={checked} label={checked ? 'Checked In' : 'Waiting'} /></div>
    </div>
  );
}

function Action({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`min-h-[40px] rounded-2xl px-3 py-2 text-[11px] font-black transition active:scale-[0.98] ${active ? 'border border-emerald-300/35 bg-emerald-500/15 text-emerald-100' : 'border border-white/10 bg-white/[0.06] text-white/70'}`}>
      {label}
    </button>
  );
}
