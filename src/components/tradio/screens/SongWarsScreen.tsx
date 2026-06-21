import React, { useMemo, useState } from 'react';
import { ChevronLeft, Swords, Shield, Filter, X, Crown, Share2, Radio } from 'lucide-react';
import BattleCard from '../songwars/BattleCard';
import { useSongWars } from '../../../contexts/SongWarsContext';
import { recapShareText, type Contestant, type BattleStatus } from '../../../data/mockData';
import { shareReference } from '../../../lib/share';

interface Props {
  onClose: () => void;
  onOpenAdmin: () => void;
  onPlayContestant: (c: Contestant) => void;
  focusWarId?: string;
  onClearFocus?: () => void;
  onEnterArena?: (warId: string) => void;
}

const FILTERS: { key: 'live' | 'upcoming' | 'results'; label: string; statuses: BattleStatus[] }[] = [
  { key: 'live', label: 'Live', statuses: ['active', 'reported'] },
  { key: 'upcoming', label: 'Upcoming', statuses: ['scheduled'] },
  { key: 'results', label: 'Results', statuses: ['completed'] },
];

export default function SongWarsScreen({
  onClose,
  onOpenAdmin,
  onPlayContestant,
  focusWarId,
  onClearFocus,
  onEnterArena,
}: Props) {
  const { wars, totals } = useSongWars();
  const [filter, setFilter] = useState<'live' | 'upcoming' | 'results'>('live');

  const focusWar = useMemo(
    () => (focusWarId ? wars.find((w) => w.id === focusWarId) : undefined),
    [focusWarId, wars],
  );

  const active = FILTERS.find((f) => f.key === filter)!;
  const visible = useMemo(
    () => wars.filter((w) => active.statuses.includes(w.status)),
    [wars, active],
  );

  return (
    <>
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 shrink-0">
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/[0.06] border border-fuchsia-400/20 flex items-center justify-center text-white active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <Swords className="w-4 h-4 text-fuchsia-400" />
          <span className="tradio-chrome font-bold tracking-wide text-sm">SONG WARS</span>
        </div>
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-fuchsia-400/20 text-fuchsia-300 text-xs font-bold active:scale-95 transition"
        >
          <Shield className="w-3.5 h-3.5" /> Admin
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4 pt-1">
        {focusWar ? (
          <div className="px-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-fuchsia-300/80 text-[11px] font-bold tracking-widest">
                  MATCHED TO YOUR VIBE
                </p>
                <h2 className="text-white text-xl font-black">{focusWar.vibe} Battle</h2>
              </div>
              <button
                onClick={onClearFocus}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10 text-white/70 text-xs font-bold active:scale-95 transition"
              >
                <X className="w-3.5 h-3.5" /> All battles
              </button>
            </div>
            <BattleCard war={focusWar} onPlay={onPlayContestant} onEnterArena={onEnterArena} highlight defaultOpenComments />
          </div>
        ) : (
          <>
            {/* arena hero */}
            <div className="px-5 mb-5">
              <div className="relative rounded-3xl overflow-hidden border border-fuchsia-400/25 p-5">
                <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-700/35 via-slate-950 to-black" />
                <div className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-fuchsia-400/25 blur-3xl" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cyan-500/10 to-transparent" />
                <div className="relative">
                  <p className="tradio-chrome text-[11px] font-bold tracking-[0.2em] mb-1">
                    TREY TV MUSIC ARENA
                  </p>
                  <h2 className="text-white text-2xl font-black leading-tight">
                    Vote. Battle. Crown the winner.
                  </h2>
                  <p className="text-white/55 text-sm mt-1">
                    {totals.active} battles live • {totals.allVotes.toLocaleString()} votes cast
                  </p>
                </div>
              </div>
            </div>

            {/* filter pills */}
            <div className="px-5 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-white/40" />
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    filter === f.key
                      ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300 text-black'
                      : 'bg-white/[0.06] text-white/60 border border-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* battles */}
            <div className="px-5 space-y-5">
              {visible.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-10">
                  No battles here yet. Check back soon.
                </p>
              ) : (
                visible.map((war) => (
                  <BattleCard key={war.id} war={war} onPlay={onPlayContestant} onEnterArena={onEnterArena} />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
