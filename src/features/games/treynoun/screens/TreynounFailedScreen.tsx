import React from 'react';
import { ScreenWrap, TreyHeader, TreyBottomNav, GlossyButton, GhostButton, GlassCard } from '../components/TreyShell';
import { TreynounRoundState } from '../treynounTypes';
import { ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react';

interface Props {
  round: TreynounRoundState;
  reason: string;
  isLastRound: boolean;
  onNext: () => void;
  onRetry: () => void;
  onExit: () => void;
}

const TreynounFailedScreen: React.FC<Props> = ({ round, reason, isLastRound, onNext, onRetry, onExit }) => (
  <ScreenWrap>
    <TreyHeader />
    <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-6 text-center flex flex-col trey-rise">
      <div className="mt-10 trey-pop">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/15 border border-red-500/50 flex items-center justify-center mb-3 trey-glow text-red-400"><AlertTriangle className="w-8 h-8" /></div>
        <h1 className="text-6xl font-black" style={{ background: 'linear-gradient(180deg,#FF6B6B,#C81E1E)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Trail Lost!</h1>
        <p className="text-white/60 mt-2">The noun got away.</p>
      </div>

      <GlassCard className="mt-6 p-4 mx-auto max-w-sm w-full" glow="#EF4444">
        <div className="text-xs text-white/40 font-bold">THE NOUN WAS</div>
        <div className="text-3xl font-black capitalize text-white mb-3">{round.targetNoun}</div>
        <div className="text-[11px] text-white/40 font-bold tracking-wider">REASON</div>
        <div className="text-lg font-bold text-red-300">{reason}</div>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="bg-black/40 rounded-xl p-2"><div className="text-white/40">Chaos</div><div className="font-black text-red-300">{round.chaos}</div></div>
          <div className="bg-black/40 rounded-xl p-2"><div className="text-white/40">Wrong</div><div className="font-black">{round.wrongGuesses.length}</div></div>
          <div className="bg-black/40 rounded-xl p-2"><div className="text-white/40">Hints</div><div className="font-black">{round.hintsUsed.length}</div></div>
        </div>
      </GlassCard>

      <div className="mt-auto pt-6 space-y-3">
        <GlossyButton onClick={onNext} className="w-full py-5 text-2xl">{isLastRound ? 'MATCH RESULTS' : 'NEXT ROUND'} <ChevronRight className="w-6 h-6" /></GlossyButton>
        <GhostButton onClick={onRetry} className="w-full py-3.5"><RotateCcw className="w-4 h-4" /> TRY AGAIN</GhostButton>
        <button onClick={onExit} className="w-full text-xs text-white/40 underline">Back to Games</button>
      </div>
    </div>
    <TreyBottomNav active="home" onHome={onExit} />
  </ScreenWrap>
);

export default TreynounFailedScreen;
