import React from 'react';
import { ScreenWrap, TreyHeader, TreyBottomNav, NeonButton, catColor } from '../components/TreyShell';
import { TreynounMatchState } from '../treynounTypes';
import { SOLO_TARGETS_BY_DIFFICULTY } from '../treynounMockData';
import { RotateCcw, Trophy, Flame, Target as TargetIcon, Zap } from 'lucide-react';

interface Props {
  match: TreynounMatchState;
  onPlayAgain: () => void;
  onExit: () => void;
}

const Stat: React.FC<{ label: string; value: string; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="rounded-2xl bg-black/40 border border-white/10 p-3 text-center">
    <div className="flex justify-center mb-1">{icon}</div>
    <div className="text-lg font-black">{value}</div>
    <div className="text-[10px] text-white/40 font-bold">{label}</div>
  </div>
);

const TreynounMatchResults: React.FC<Props> = ({ match, onPlayAgain, onExit }) => {
  const target = SOLO_TARGETS_BY_DIFFICULTY[match.difficulty] || 650;
  const cleared = match.mode === 'solo' ? match.totalScore >= target && match.roundsFailed < 3 : match.roundsWon > 0;
  const totalAnswered = match.roundsWon + match.roundsFailed;
  const accuracy = totalAnswered ? Math.round((match.roundsWon / totalAnswered) * 100) : 0;
  const catCount: Record<string, number> = {};
  match.history.forEach((h) => { if (h.won) catCount[h.category] = (catCount[h.category] || 0) + 1; });
  const bestCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'thing';

  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto px-4 pb-6 text-center">
        <div className="mt-8">
          <Trophy className={`w-16 h-16 mx-auto ${cleared ? 'text-yellow-400' : 'text-white/30'}`} />
          <h1 className={`text-4xl font-black mt-2 ${cleared ? 'bg-gradient-to-r from-yellow-400 to-cyan-400 bg-clip-text text-transparent' : 'text-red-400'}`}>
            {cleared ? 'Run Cleared!' : 'Run Failed'}
          </h1>
          <p className="text-white/50 mt-1">{match.mode === 'solo' ? `Target: ${target} pts` : 'Match Complete'}</p>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-r from-purple-900/40 to-black/40 border border-yellow-500/30 p-5">
          <div className="text-xs text-white/40 font-bold">TOTAL NOUN SCORE</div>
          <div className="text-5xl font-black text-yellow-300">{match.totalScore}</div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <Stat label="ROUNDS WON" value={`${match.roundsWon}`} icon={<Trophy className="w-5 h-5 text-yellow-400" />} />
          <Stat label="ACCURACY" value={`${accuracy}%`} icon={<TargetIcon className="w-5 h-5 text-cyan-400" />} />
          <Stat label="FASTEST LOCK" value={match.fastestLockIn ? `${match.fastestLockIn}s` : '—'} icon={<Zap className="w-5 h-5 text-fuchsia-400" />} />
          <Stat label="HOT TRAIL" value={`${match.bestStreak}`} icon={<Flame className="w-5 h-5 text-orange-400" />} />
          <Stat label="GEMS" value={`${match.gemsEarned}`} icon={<span className="text-fuchsia-400 text-lg">◆</span>} />
          <div className="rounded-2xl bg-black/40 border border-white/10 p-3 text-center">
            <div className="text-[10px] text-white/40 font-bold mb-1">BEST LANE</div>
            <div className="text-lg font-black capitalize" style={{ color: catColor[bestCat] }}>{bestCat}</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-black/40 border border-white/10 p-3 text-left">
          <div className="font-bold text-sm mb-2">Round History</div>
          {match.history.map((h) => (
            <div key={h.round} className="flex items-center justify-between py-1.5 border-b border-white/5 text-sm">
              <span className="text-white/50">R{h.round}</span>
              <span className="capitalize font-bold" style={{ color: catColor[h.category] }}>{h.noun}</span>
              <span className={h.won ? 'text-green-400' : 'text-red-400'}>{h.won ? `+${h.score}` : 'Lost'}</span>
            </div>
          ))}
          {match.history.length === 0 && <div className="text-white/30 text-sm py-2">No rounds played.</div>}
        </div>

        <NeonButton onClick={onPlayAgain} className="w-full py-4 text-lg mt-5">
          <span className="flex items-center justify-center gap-2"><RotateCcw className="w-5 h-5" /> Play Again</span>
        </NeonButton>
        <button onClick={onExit} className="w-full mt-3 text-xs text-white/40 underline">Back to Games</button>
      </div>
      <TreyBottomNav active="home" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounMatchResults;
