import React from "react";
import { ScreenWrap, TreyHeader, TreyBottomNav, GlassCard } from "../components/TreyShell";
import { TreynounRoundState } from "../treynounTypes";
import { ChevronRight, RotateCcw, AlertTriangle } from "lucide-react";

interface Props {
  round: TreynounRoundState;
  reason: string;
  isLastRound: boolean;
  onNext: () => void;
  onRetry: () => void;
  onExit: () => void;
}

const TreynounFailedScreen: React.FC<Props> = ({
  round,
  reason,
  isLastRound,
  onNext,
  onRetry,
  onExit,
}) => (
  <ScreenWrap>
    <TreyHeader />
    <div className="flex-1 overflow-y-auto trey-scroll px-4 pb-6 text-center flex flex-col justify-between trey-rise">
      <div className="mt-8 trey-pop">
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center mb-4 trey-glow text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-5xl font-black bg-gradient-to-b from-red-400 to-red-600 bg-clip-text text-transparent leading-none">
          Trail Lost!
        </h1>
        <p className="text-white/50 mt-2 text-sm">The noun slipped away into the chaos.</p>
      </div>

      <GlassCard
        className="mt-6 p-5 mx-auto max-w-sm w-full border border-red-500/20"
        glow="#EF4444"
      >
        <div className="text-[10px] text-white/40 font-black tracking-widest">THE TARGET WAS</div>
        <div className="text-4xl font-black capitalize text-white mb-4 tracking-wide">
          {round.targetNoun}
        </div>

        <div className="text-[10px] text-white/40 font-black tracking-widest">FAILURE REASON</div>
        <div className="text-base font-extrabold text-red-400 mb-4">{reason}</div>

        <div className="grid grid-cols-3 gap-2.5 mt-2 text-xs">
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
            <div className="text-white/40 font-bold text-[9px]">CHAOS</div>
            <div className="font-black text-red-400 mt-0.5">{round.chaos}</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
            <div className="text-white/40 font-bold text-[9px]">WRONG</div>
            <div className="font-black text-white mt-0.5">{round.wrongGuesses.length}</div>
          </div>
          <div className="bg-black/40 border border-white/5 rounded-xl p-2.5">
            <div className="text-white/40 font-bold text-[9px]">HINTS</div>
            <div className="font-black text-white mt-0.5">{round.hintsUsed.length}</div>
          </div>
        </div>
      </GlassCard>

      <div className="mt-8 mb-4 max-w-sm mx-auto w-full space-y-3.5">
        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 rounded-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
          >
            <RotateCcw className="w-4 h-4" /> TRY AGAIN
          </button>

          <button
            onClick={onNext}
            className="flex-1 rounded-full py-4 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-extrabold flex items-center justify-center gap-1 active:scale-95 transition-all"
          >
            {isLastRound ? "RESULTS" : "NEXT ROUND"} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onExit}
          className="w-full text-xs text-white/40 hover:text-white/60 transition underline"
        >
          Back to Games
        </button>
      </div>
    </div>
    <TreyBottomNav active="home" onHome={onExit} />
  </ScreenWrap>
);

export default TreynounFailedScreen;
