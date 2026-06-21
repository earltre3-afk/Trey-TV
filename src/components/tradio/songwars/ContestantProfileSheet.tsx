import React from 'react';
import {
  Play,
  Share2,
  BadgeCheck,
  Lock,
  Trophy,
  Swords,
  Flame,
  UserPlus,
  UserCheck,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { monthlyListeners, type Contestant } from '../../../data/mockData';
import { shareReference } from '../../../lib/share';
import { useSongWars } from '../../../contexts/SongWarsContext';

interface Props {
  contestant?: Contestant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlay: (c: Contestant) => void;
}

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export default function ContestantProfileSheet({
  contestant,
  open,
  onOpenChange,
  onPlay,
}: Props) {
  const { isFollowing, toggleFollow } = useSongWars();
  if (!contestant) return null;
  const c = contestant;
  const total = c.wins + c.losses;
  const winRate = total ? Math.round((c.wins / total) * 100) : 0;
  const following = isFollowing(c.handle);

  const share = () =>
    shareReference(
      `${c.name} (${c.handle}) on Tradio — ${c.role}\nRecord: ${c.wins}W • ${c.losses}L\nTune in on the Trey TV Music universe.`,
      'Artist copied',
    );
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 border-amber-400/20 bg-black rounded-t-[28px] max-h-[88vh] overflow-y-auto"
      >
        {/* cinematic Apple-Music-style header */}
        <div className="relative h-60">
          <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="absolute -bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-1">
              {c.approved ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/40 text-amber-200 text-[10px] font-bold tracking-wide">
                  <BadgeCheck className="w-3 h-3" /> APPROVED ARTIST
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-white/60 text-[10px] font-bold tracking-wide">
                  <Lock className="w-3 h-3" /> PENDING APPROVAL
                </span>
              )}
              <span className="text-white/50 text-[10px] font-bold tracking-widest uppercase">
                {c.role}
              </span>
            </div>
            <h2 className="text-white text-3xl font-black leading-none drop-shadow-lg">{c.name}</h2>
            <p className="text-amber-200/70 text-xs font-semibold mt-1">{c.handle}</p>
          </div>
        </div>

        <div className="px-5 pb-8 -mt-1">
          <p className="text-white/45 text-[11px] font-semibold tracking-wide mb-4">
            {monthlyListeners(c.handle)} monthly listeners on Tradio
          </p>

          {/* primary actions */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => onPlay(c)}
              className="flex-1 tradio-gold-gradient text-black font-black py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg shadow-amber-500/30"
            >
              <Play className="w-5 h-5" fill="currentColor" /> Play
            </button>
            <button
              onClick={share}
              className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white active:scale-95 transition"
              aria-label="Share artist"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* follow */}
          <button
            onClick={() => toggleFollow(c)}
            className={`w-full mb-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition ${
              following
                ? 'bg-emerald-500/15 border border-emerald-400/40 text-emerald-300'
                : 'bg-white/[0.06] border border-amber-400/40 text-amber-200'
            }`}
          >
            {following ? (
              <>
                <UserCheck className="w-5 h-5" /> Following
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" /> Follow
              </>
            )}
          </button>

          {/* battle record */}
          <p className="tradio-chrome text-[11px] font-bold tracking-[0.2em] mb-3">SONG WARS RECORD</p>
          <div className="grid grid-cols-3 gap-3 mb-6">
            <Stat icon={Trophy} value={`${c.wins}`} label="Wins" tone="text-amber-300" />
            <Stat icon={Swords} value={`${c.losses}`} label="Losses" tone="text-white/70" />
            <Stat icon={Flame} value={`${winRate}%`} label="Win rate" tone="text-cyan-300" />
          </div>

          {/* win-rate meter */}
          <div className="h-2.5 rounded-full overflow-hidden bg-white/[0.08] mb-6">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all"
              style={{ width: `${winRate}%` }}
            />
          </div>

          {/* featured track */}
          <p className="tradio-chrome text-[11px] font-bold tracking-[0.2em] mb-3">FEATURED TRACK</p>
          <button
            onClick={() => onPlay(c)}
            className="w-full flex items-center gap-3 tradio-glass rounded-2xl p-3 active:scale-[0.99] transition"
          >
            <img src={c.image} alt={c.track} className="w-12 h-12 rounded-xl object-cover" />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-white font-bold text-sm truncate">{c.track}</p>
              <p className="text-white/45 text-[11px] truncate">{c.name}</p>
            </div>
            <span className="w-9 h-9 rounded-full tradio-gold-gradient text-black flex items-center justify-center shrink-0">
              <Play className="w-4 h-4" fill="currentColor" />
            </span>
          </button>

          {/* approval gate note */}
          <div
            className={`mt-6 rounded-2xl p-4 border ${
              c.approved
                ? 'border-amber-400/25 bg-amber-400/[0.04]'
                : 'border-white/10 bg-white/[0.03]'
            }`}
          >
            <p className="text-white font-bold text-sm mb-1">
              {c.approved ? 'Eligible for Song Wars' : 'Not yet eligible'}
            </p>
            <p className="text-white/55 text-[12px] leading-relaxed">
              {c.approved
                ? 'This is an approved Trey TV artist. They can set up a profile and enter Song Wars battles against other approved artists.'
                : 'Only approved Trey TV artists can set up profiles and enter Song Wars. This creator is pending admin approval.'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="tradio-glass rounded-2xl p-3 flex flex-col items-center text-center">
      <Icon className={`w-5 h-5 mb-1.5 ${tone}`} />
      <span className={`font-black text-xl ${tone}`}>{value}</span>
      <span className="text-white/40 text-[10px] font-semibold tracking-wide mt-0.5">{label}</span>
    </div>
  );
}
