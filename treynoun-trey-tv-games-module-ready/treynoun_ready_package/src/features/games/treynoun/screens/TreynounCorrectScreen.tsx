import React from 'react';
import { toast } from 'sonner';
import { ScreenWrap, TreyHeader, TreyBottomNav, GlossyButton, GhostButton, GlassCard, Confetti, Meter } from '../components/TreyShell';
import { TreynounRoundState, TreynounScoreBreakdown } from '../treynounTypes';
import { Trophy, Share2, ChevronRight, Flame, Target, BarChart3 } from 'lucide-react';

interface Props {
  round: TreynounRoundState;
  breakdown: TreynounScoreBreakdown;
  streak: number;
  gems: number;
  isLastRound: boolean;
  onNext: () => void;
  onResults: () => void;
  onExit: () => void;
}

const Row: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = '#fff' }) => (
  <div className="flex justify-between text-sm py-1 border-b border-white/5">
    <span className="text-white/50">{label}</span><span className="font-bold" style={{ color }}>{value}</span>
  </div>
);

const TreynounCorrectScreen: React.FC<Props> = ({ round, breakdown, streak, gems, isLastRound, onNext, onResults, onExit }) => {
  const accuracy = round.wrongGuesses.length === 0 ? 100 : Math.max(0, 100 - round.wrongGuesses.length * 20);
  return (
    <ScreenWrap>
      <Confetti />
      <TreyHeader />
      <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-6 text-center relative z-10">
        <div className="mt-6 trey-pop">
          <h1 className="text-7xl font-black trey-title leading-none">Correct!</h1>
          <p className="text-white/85 font-bold mt-1 text-lg">You guessed it!</p>
        </div>

        <div className="mt-5 trey-rise">
          <div className="inline-block trey-glass rounded-full px-4 py-1 text-xs font-bold text-white/70 mb-2">The noun was</div>
          <div className="text-4xl font-black capitalize trey-title">{round.targetNoun}</div>
        </div>

        <div className="mt-4 flex justify-center trey-float">
          <Trophy className="w-16 h-16 text-yellow-400" style={{ filter: 'drop-shadow(0 0 18px rgba(255,184,0,.7))' }} />
        </div>

        <GlassCard className="mt-4 p-4" glow="#FFB800">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-4xl font-black text-yellow-300">+{breakdown.total}</div>
              <div className="text-[10px] text-white/40 font-bold tracking-wider">POINTS</div>
            </div>
            <div className="w-px h-12 bg-white/10" />
            <div className="text-center">
              <div className="text-4xl font-black text-fuchsia-300 flex items-center gap-1 justify-center"><span className="rotate-45 inline-block w-5 h-5 bg-fuchsia-500 rounded-sm" />{gems}</div>
              <div className="text-[10px] text-white/40 font-bold tracking-wider">GEMS</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="mt-4 p-3" glow="#FF7A3D">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-400/50 flex items-center justify-center font-black text-orange-300">{streak}</div>
            <div className="text-left flex-1">
              <div className="font-black text-orange-300 flex items-center gap-1">WIN STREAK</div>
              <div className="text-xs text-white/50">{streak >= 3 ? "Amazing! You're on fire!" : 'Keep the trail hot!'}</div>
              <div className="mt-1.5"><Meter value={Math.min(streak, 7)} max={7} color="linear-gradient(90deg,#FFB300,#FF6A3D)" height="h-2" /></div>
            </div>
            <div className="flex gap-0.5">{Array.from({ length: Math.min(streak, 7) }).map((_, i) => <Flame key={i} className="w-3.5 h-3.5 text-orange-400" />)}</div>
          </div>
        </GlassCard>

        <GlossyButton onClick={isLastRound ? onResults : onNext} className="w-full py-5 text-2xl mt-5">
          {isLastRound ? 'MATCH RESULTS' : 'NEXT ROUND'} <ChevronRight className="w-6 h-6" />
        </GlossyButton>
        <GhostButton onClick={() => toast.success('Win shared to Trey TV feed!')} className="w-full py-3.5 mt-3"><Share2 className="w-4 h-4" /> SHARE WIN</GhostButton>

        {/* stats row */}
        <GlassCard className="mt-4 p-3 flex items-center justify-around">
          <div className="flex flex-col items-center gap-0.5"><Target className="w-5 h-5 text-cyan-400" /><span className="text-[9px] text-white/40 font-bold">ACCURACY</span><span className="font-black text-sm">{accuracy}%</span></div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-0.5"><Trophy className="w-5 h-5 text-yellow-400" /><span className="text-[9px] text-white/40 font-bold">ROUND SCORE</span><span className="font-black text-sm">{breakdown.total}</span></div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex flex-col items-center gap-0.5"><BarChart3 className="w-5 h-5 text-fuchsia-400" /><span className="text-[9px] text-white/40 font-bold">CATEGORY</span><span className="font-black text-sm capitalize">{round.category}</span></div>
        </GlassCard>

        {/* breakdown */}
        <GlassCard className="mt-4 p-4 text-left">
          <div className="font-bold text-sm mb-2">Score Breakdown</div>
          <Row label="Base" value={`+${breakdown.base}`} />
          <Row label="Time bonus" value={`+${breakdown.timeBonus}`} />
          <Row label="Signal bonus" value={`+${breakdown.signalBonus}`} color="#22D3EE" />
          <Row label="Category lock" value={`+${breakdown.categoryLockBonus}`} color="#FFB800" />
          <Row label="No-hint bonus" value={`+${breakdown.noHintBonus}`} color="#22C55E" />
          {breakdown.perfectChaseBonus > 0 && <Row label="Perfect Chase" value={`+${breakdown.perfectChaseBonus}`} color="#FF00E5" />}
          {breakdown.streakBonus > 0 && <Row label="Streak bonus" value={`+${breakdown.streakBonus}`} color="#F97316" />}
          {breakdown.hintPenalty > 0 && <Row label="Hint penalty" value={`-${breakdown.hintPenalty}`} color="#EF4444" />}
          {breakdown.wrongGuessPenalty > 0 && <Row label="Wrong guesses" value={`-${breakdown.wrongGuessPenalty}`} color="#EF4444" />}
          {breakdown.trapMultiplier > 1 && <Row label="Trap multiplier" value={`x${breakdown.trapMultiplier}`} color="#FF00E5" />}
          <div className="flex justify-between mt-2 pt-2 border-t border-white/10"><span className="font-bold">Total</span><span className="font-black text-yellow-300 text-lg">{breakdown.total}</span></div>
        </GlassCard>
        <button onClick={onExit} className="w-full mt-4 text-xs text-white/40 underline">Back to Games</button>
      </div>
      <TreyBottomNav active="home" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounCorrectScreen;
