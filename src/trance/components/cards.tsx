// TRANCE — domain card components
import React from 'react';
import { useNavigate } from '../hooks/router-compat';
import {
  Play, Lock, Bookmark, Users, Flame, ChevronRight, Crown, Star,
  BookOpen, Target, Zap, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight,
} from 'lucide-react';
import { cn, TranceGlassCard, VerifiedTick } from './primitives';
import {
  DanceRoutine, ChoreographerProfile, StudioRoom, RehearsalAssignment,
  LeaderboardEntry, CountSection, DirectionCue, SessionMode,
} from '../types';
import { TRANCE_ROUTES } from '../routes/manifest';

const fmtNum = (n: number) => n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/* TranceRoutineCard */
export const TranceRoutineCard: React.FC<{ routine: DanceRoutine; rank?: number; wide?: boolean }> =
  ({ routine, rank, wide }) => {
    const navigate = useNavigate();
    return (
      <TranceGlassCard glow="purple" onClick={() => navigate(TRANCE_ROUTES.routine(routine.id))}
        className={cn('overflow-hidden shrink-0 group', wide ? 'w-full' : 'w-44')}>
        <div className="relative aspect-[3/4] overflow-hidden">
          <img src={routine.cover} alt={routine.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-85" />
          {rank && <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-black/75 border border-white/20 grid place-items-center text-xs font-black text-white z-10 transition-colors group-hover:border-fuchsia-400">{rank}</div>}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 backdrop-blur grid place-items-center border border-white/35 z-10 transition-all duration-300 group-hover:scale-110 group-hover:bg-fuchsia-500/30 group-hover:border-fuchsia-400 group-hover:shadow-[0_0_25px_rgba(217,70,239,0.7)]">
            <Play className="w-5 h-5 fill-white text-white transition-transform duration-300 group-hover:translate-x-0.5" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
            <h4 className="font-black text-white leading-tight transition-colors group-hover:text-fuchsia-200">{routine.title}</h4>
            <p className="text-[11px] text-fuchsia-300 mb-1.5">by {routine.choreographerName}</p>
            <div className="flex items-center justify-between text-[10px] text-white/60">
              <span className="flex items-center gap-1"><Bookmark className="w-3 h-3" />{fmtNum(routine.saves)}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{fmtNum(routine.students)}</span>
            </div>
          </div>
        </div>
      </TranceGlassCard>
    );
  };

/* Trending dance compact card */
export const TrendingDanceCard: React.FC<{ routine: DanceRoutine; rank: number }> = ({ routine, rank }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(TRANCE_ROUTES.routine(routine.id))}
      className="shrink-0 w-36 cursor-pointer group">
      <div className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.25)]">
        <img src={routine.cover} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" alt={routine.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute top-2 left-2 text-xs font-black bg-black/75 px-2 py-0.5 rounded-md border border-white/20 transition-colors group-hover:border-cyan-400">#{rank}</span>
        <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-white/15 backdrop-blur grid place-items-center border border-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-cyan-500/30 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.6)]">
          <Play className="w-3.5 h-3.5 fill-white text-white transition-transform duration-300 group-hover:translate-x-0.5" />
        </div>
      </div>
      <div className="mt-1.5">
        <h5 className="text-sm font-bold text-white truncate transition-colors group-hover:text-cyan-200">{routine.title}</h5>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-cyan-300">{routine.choreographerName}</span>
          <span className="flex items-center gap-0.5 text-orange-400"><Flame className="w-3 h-3" />{fmtNum(routine.saves)}</span>
        </div>
      </div>
    </div>
  );
};

/* ChoreographerCard */
export const ChoreographerCard: React.FC<{ c: ChoreographerProfile }> = ({ c }) => {
  const navigate = useNavigate();
  return (
    <TranceGlassCard glow="magenta" onClick={() => navigate(TRANCE_ROUTES.choreographer(c.id))}
      className="shrink-0 w-40 overflow-hidden group">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img src={c.cover} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" alt={c.displayName} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-yellow-500/20 border border-yellow-400/60 grid place-items-center transition-all duration-300 group-hover:scale-115 group-hover:bg-yellow-500/35">
          <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
        </div>
        <div className="absolute bottom-0 p-3">
          <div className="flex items-center gap-1">
            <h4 className="font-black text-fuchsia-300 uppercase text-sm transition-colors group-hover:text-fuchsia-200">{c.displayName}</h4>
            {c.verified && <VerifiedTick className="w-3.5 h-3.5" />}
          </div>
          <p className="text-[10px] text-white/70 mb-1">{c.tagline.split('.')[0]}</p>
          <span className="text-[9px] font-bold text-yellow-400 uppercase">Top Choreographer</span>
        </div>
      </div>
    </TranceGlassCard>
  );
};

/* StudioRoomCard */
export const StudioRoomCard: React.FC<{ s: StudioRoom }> = ({ s }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(TRANCE_ROUTES.studio(s.id))}
      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-fuchsia-500/35 cursor-pointer transition-all duration-300 group">
      <div className="w-11 h-11 rounded-xl grid place-items-center bg-gradient-to-br from-purple-600/40 to-fuchsia-600/30 border border-white/10 transition-all duration-300 group-hover:scale-105 group-hover:border-fuchsia-400/40">
        {s.locked ? <Lock className="w-5 h-5 text-cyan-300" /> : <Users className="w-5 h-5 text-fuchsia-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <h5 className="font-bold text-white text-sm truncate transition-colors group-hover:text-fuchsia-300">{s.name}</h5>
        <p className="text-[11px] text-white/50">{s.members} / {s.capacity} Members</p>
      </div>
      <span className={cn('text-[10px] font-black uppercase flex items-center gap-1 transition-all duration-300',
        s.status === 'LIVE' ? 'text-emerald-400 group-hover:scale-105' : 'text-white/40')}>
        {s.status === 'LIVE' && <Flame className="w-3 h-3 animate-pulse" />}{s.status}
      </span>
    </div>
  );
};

/* RehearsalAssignmentCard */
export const RehearsalAssignmentCard: React.FC<{ a: RehearsalAssignment }> = ({ a }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] cursor-pointer">
    <div className="text-center shrink-0 w-12">
      <div className="text-[10px] text-white/50 font-bold">{a.date.split(' ')[0]}</div>
      <div className="text-lg font-black text-fuchsia-300 leading-none">{a.date.split(' ')[1]}</div>
    </div>
    <div className="flex-1 min-w-0">
      <h5 className="font-bold text-white text-sm truncate">{a.title}</h5>
      <p className="text-[11px] text-white/50">{a.focus}</p>
    </div>
    <div className="flex flex-col items-end gap-1">
      <span className="text-[9px] font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 px-2 py-0.5 rounded-full">{a.due}</span>
      <ChevronRight className="w-4 h-4 text-white/40" />
    </div>
  </div>
);

/* LeaderboardRow */
export const LeaderboardRow: React.FC<{ e: LeaderboardEntry }> = ({ e }) => {
  const tier: Record<string, string> = {
    gold: 'border-yellow-400/60 shadow-[0_0_24px_-8px_rgba(250,204,21,0.6)] bg-gradient-to-r from-yellow-500/10 to-transparent',
    magenta: 'border-fuchsia-400/40 bg-white/[0.03]',
    purple: 'border-purple-400/40 bg-white/[0.03]',
    cyan: 'border-cyan-400/40 bg-white/[0.03]',
  };
  const rankColor = e.rank === 1 ? 'text-yellow-300' : e.rank === 2 ? 'text-white/70' : e.rank === 3 ? 'text-orange-400' : 'text-white/50';
  return (
    <div className={cn('flex items-center gap-3 p-3 rounded-2xl border', tier[e.badgeTier])}>
      <div className={cn('w-7 text-center font-black text-lg', rankColor)}>
        {e.rank === 1 ? <Crown className="w-6 h-6 mx-auto text-yellow-300 fill-yellow-300/30" /> : e.rank}
      </div>
      <div className={cn('w-11 h-11 rounded-full overflow-hidden border-2', e.rank === 1 ? 'border-yellow-400' : 'border-white/20')}>
        <img src={e.user.avatar} className="w-full h-full object-cover" alt={e.user.displayName} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-black text-white uppercase text-sm truncate">{e.user.displayName}</span>
          {e.user.verified && <VerifiedTick className="w-3.5 h-3.5 shrink-0" />}
        </div>
        <span className="text-[10px] text-fuchsia-300">LV. {e.level} · {e.title}</span>
      </div>
      <div className="text-right">
        <div className="font-black text-white text-sm">{e.score.toLocaleString()}</div>
        <div className="text-[10px] text-cyan-300">{e.accuracy}% · {e.streak}x</div>
      </div>
    </div>
  );
};

/* SessionModeCard */
export const SessionModeCard: React.FC<{
  mode: SessionMode; subtitle: string; onClick?: () => void;
}> = ({ mode, subtitle, onClick }) => {
  const cfg: Record<string, { icon: React.ComponentType<{ className?: string }>; glow: string; ring: string }> = {
    Learn: { icon: BookOpen, glow: 'from-fuchsia-500/20 border-fuchsia-400/40', ring: 'text-fuchsia-300' },
    Practice: { icon: Target, glow: 'from-cyan-500/20 border-cyan-400/40', ring: 'text-cyan-300' },
    Performance: { icon: Zap, glow: 'from-yellow-500/20 border-yellow-400/40', ring: 'text-yellow-300' },
  };
  const C = cfg[mode];
  return (
    <button onClick={onClick} className={cn('flex-1 text-left rounded-2xl border bg-gradient-to-b to-transparent p-3.5 active:scale-95 transition', C.glow)}>
      <C.icon className={cn('w-5 h-5 mb-2', C.ring)} />
      <div className={cn('font-black uppercase text-sm', C.ring)}>{mode} Mode</div>
      <div className="text-[10px] text-white/60 mt-0.5">{subtitle}</div>
    </button>
  );
};

/* CountStructureCard */
export const CountStructureCard: React.FC<{ sections: CountSection[]; bpm: number }> = ({ sections, bpm }) => (
  <div className="space-y-1.5">
    {sections.map((s) => (
      <div key={s.id} className="flex items-center gap-2">
        <span className="w-5 text-center text-xs font-black text-white/40">{s.index}</span>
        <div className="flex-1 rounded-lg bg-gradient-to-r from-fuchsia-600/40 via-purple-600/30 to-cyan-600/30 px-3 py-2 flex items-center justify-between">
          <span className="text-xs font-bold text-white uppercase">{s.label}</span>
          <span className="text-[10px] text-white/70">{s.counts}</span>
        </div>
      </div>
    ))}
    <div className="text-right text-[10px] text-cyan-300 font-bold pt-1">{bpm} BPM</div>
  </div>
);

/* DirectionCueCard */
export const DirectionCueCard: React.FC<{ cue: DirectionCue }> = ({ cue }) => {
  const map: Record<string, React.ComponentType<any>> = {
    up: ArrowUp, down: ArrowDown, left: ArrowLeft, right: ArrowRight, 'up-right': ArrowUpRight, 'up-left': ArrowUpRight,
  };
  const Icon = map[cue.direction] || ArrowUp;
  return (
    <div className="shrink-0 w-20 rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-3 text-center">
      <Icon className="w-7 h-7 mx-auto text-cyan-300 mb-1" style={{ filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.6))' }} />
      <div className="text-[10px] text-white/60">{cue.timestamp}</div>
      <div className="text-[11px] font-bold text-white">{cue.facing}</div>
    </div>
  );
};

export { fmtNum, fmtTime };
