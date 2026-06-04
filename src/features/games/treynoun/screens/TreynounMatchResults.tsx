import React from "react";
import {
  ScreenWrap,
  TreyHeader,
  TreyBottomNav,
  catColor,
  GlossyButton,
} from "../components/TreyShell";
import { TreynounMatchState } from "../treynounTypes";
import { SOLO_TARGETS_BY_DIFFICULTY } from "../treynounMockData";
import { RotateCcw, Trophy, Flame, Target as TargetIcon, Zap } from "lucide-react";

interface Props {
  match: TreynounMatchState;
  onPlayAgain: () => void;
  onExit: () => void;
}

const Stat: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({
  label,
  value,
  icon,
}) => (
  <div className="rounded-2xl bg-black/40 border border-white/10 p-3 text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <div className="text-lg font-black">{value}</div>
    <div className="text-[10px] text-white/40 font-bold">{label}</div>
  </div>
);

const TreynounMatchResults: React.FC<Props> = ({ match, onPlayAgain, onExit }) => {
  const target = SOLO_TARGETS_BY_DIFFICULTY[match.difficulty] || 650;
  const cleared =
    match.mode === "solo"
      ? match.totalScore >= target && match.roundsFailed < 3
      : match.roundsWon > 0;
  const totalAnswered = match.roundsWon + match.roundsFailed;
  const accuracy = totalAnswered ? Math.round((match.roundsWon / totalAnswered) * 100) : 0;
  const catCount: Record<string, number> = {};
  match.history.forEach((h) => {
    if (h.won) catCount[h.category] = (catCount[h.category] || 0) + 1;
  });
  const bestCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "thing";

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto px-4 pb-8 text-center trey-rise">
        {/* Victory Header */}
        <div className="mt-8 relative py-6 px-4 rounded-3xl bg-gradient-to-b from-[#110e29]/40 to-transparent border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
          <Trophy
            className={`w-16 h-16 mx-auto ${cleared ? "text-yellow-400 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" : "text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.3)]"}`}
          />
          <h1
            className={`text-4xl font-black mt-3 ${cleared ? "bg-gradient-to-r from-yellow-400 via-amber-400 to-cyan-400 bg-clip-text text-transparent" : "text-red-400"}`}
          >
            {cleared ? "Run Cleared!" : "Run Failed"}
          </h1>
          <p className="text-xs text-white/50 tracking-wider uppercase mt-1">
            {match.mode === "solo" ? `Target: ${target} pts` : "Match Complete"}
          </p>
        </div>

        {/* Noun Score Showcase */}
        <div className="mt-6 rounded-3xl bg-gradient-to-r from-purple-900/20 via-black/40 to-cyan-950/10 border border-yellow-500/20 p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden">
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-full animate-[shimmer_5s_infinite]" />
          <div className="text-[10px] text-white/40 font-black tracking-widest uppercase">
            TOTAL NOUN SCORE
          </div>
          <div className="text-5xl sm:text-6xl font-black text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)] mt-1">
            {match.totalScore}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <Stat
            label="ROUNDS WON"
            value={`${match.roundsWon}`}
            icon={<Trophy className="w-5 h-5 text-yellow-400" />}
          />
          <Stat
            label="ACCURACY"
            value={`${accuracy}%`}
            icon={<TargetIcon className="w-5 h-5 text-cyan-400" />}
          />
          <Stat
            label="FASTEST LOCK"
            value={match.fastestLockIn ? `${match.fastestLockIn}s` : "-"}
            icon={<Zap className="w-5 h-5 text-fuchsia-400" />}
          />
          <Stat
            label="HOT TRAIL"
            value={`${match.bestStreak}`}
            icon={<Flame className="w-5 h-5 text-orange-500 fill-orange-500/20" />}
          />
          <Stat
            label="GEMS"
            value={`+${match.gemsEarned}`}
            icon={
              <span className="w-3.5 h-3.5 rotate-45 rounded-sm bg-fuchsia-500/80 shadow-[0_0_8px_rgba(217,70,239,0.45)]" />
            }
          />

          <div className="rounded-2xl bg-black/40 border border-white/5 p-3.5 flex flex-col justify-center items-center text-center">
            <div className="text-xs text-white/40 font-bold mb-1">BEST LANE</div>
            <div
              className="text-base font-black capitalize leading-none mt-1"
              style={{ color: catColor[bestCat] }}
            >
              {bestCat}
            </div>
          </div>
        </div>

        {/* Round History list */}
        <div className="mt-6 rounded-3xl bg-black/30 border border-white/5 p-4 text-left">
          <div className="font-black text-xs text-white/45 tracking-widest mb-3 uppercase">
            Round History
          </div>
          <div className="space-y-2">
            {match.history.map((h) => (
              <div
                key={h.round}
                className="flex items-center justify-between py-2 border-b border-white/5 text-sm last:border-b-0"
              >
                <span className="text-white/40 font-bold text-xs">R{h.round}</span>
                <span
                  className="capitalize font-extrabold text-white flex-1 pl-4"
                  style={{ color: catColor[h.category] }}
                >
                  {h.noun}
                </span>
                <span className="text-xs text-white/40 pr-3">{h.timeUsed}s</span>
                <span
                  className={`font-black text-right min-w-[50px] ${h.won ? "text-green-400" : "text-red-400"}`}
                >
                  {h.won ? `+${h.score}` : "Lost"}
                </span>
              </div>
            ))}
            {match.history.length === 0 && (
              <div className="text-white/30 text-sm py-4 text-center">No rounds played.</div>
            )}
          </div>
        </div>

        {/* Action CTAs */}
        <div className="mt-8 space-y-3.5 max-w-sm mx-auto">
          <GlossyButton onClick={onPlayAgain} className="w-full py-4 text-xl">
            <RotateCcw className="w-5 h-5 mr-1.5" /> PLAY AGAIN
          </GlossyButton>

          <button
            onClick={onExit}
            className="w-full text-xs text-white/40 hover:text-white/60 transition underline"
          >
            Back to Trey TV Games
          </button>
        </div>
      </div>
      <TreyBottomNav active="home" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounMatchResults;
