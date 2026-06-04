import React, { useMemo, useState } from 'react';
import { ScreenWrap, TreyHeader, TreyBottomNav, catColor } from '../components/TreyShell';
import { LEADERBOARD } from '../treynounMockData';
import { NounType, TreynounLeaderboardEntry } from '../treynounTypes';
import { TreynounStats } from '../treynounStorage';
import { ChevronLeft, Trophy, Flame, Zap } from 'lucide-react';

interface Props {
  stats?: TreynounStats;
  onBack: () => void;
  onExit: () => void;
}

type Board = 'score' | 'trail' | 'fast';
type Filter = 'all' | NounType;

const TreynounLeaderboard: React.FC<Props> = ({ stats, onBack, onExit }) => {
  const [board, setBoard] = useState<Board>('score');
  const [filter, setFilter] = useState<Filter>('all');

  // Merge the persisted player stats into the TreyLegend (you) entry.
  const baseRows = useMemo<TreynounLeaderboardEntry[]>(() => {
    if (!stats) return LEADERBOARD;
    const bestCat = (stats.matchHistory[0]?.bestCategory as NounType) || 'person';
    const fastest = stats.matchHistory.length
      ? Math.min(...stats.matchHistory.map((m) => (m.accuracy > 0 ? 4.8 : 9.9)))
      : 4.8;
    return LEADERBOARD.map((r) =>
      r.name === 'TreyLegend'
        ? {
            ...r,
            nounScore: Math.max(r.nounScore, stats.totalNounScore),
            hotTrail: Math.max(r.hotTrail, stats.bestHotTrail),
            fastestLock: fastest,
            bestCategory: bestCat,
          }
        : r
    );
  }, [stats]);

  let rows = [...baseRows];
  if (filter !== 'all') rows = rows.filter((r) => r.bestCategory === filter);
  if (board === 'trail') rows.sort((a, b) => b.hotTrail - a.hotTrail);
  else if (board === 'fast') rows.sort((a, b) => a.fastestLock - b.fastestLock);
  else rows.sort((a, b) => b.nounScore - a.nounScore);

  const val = (r: TreynounLeaderboardEntry) =>
    board === 'trail' ? `${r.hotTrail}` : board === 'fast' ? `${r.fastestLock}s` : r.nounScore.toLocaleString();


  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="flex items-center gap-3 mt-4 mb-4">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center active:scale-95"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="text-2xl font-black flex items-center gap-2"><Trophy className="w-6 h-6 text-yellow-400" /> Leaderboard</h1>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {([['score', 'Noun Score', Trophy], ['trail', 'Hot Trail', Flame], ['fast', 'Fastest Lock', Zap]] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setBoard(id)} className={`rounded-xl border py-2 text-xs font-bold flex flex-col items-center gap-1 ${board === id ? 'bg-purple-500/20 border-purple-400' : 'bg-black/40 border-white/10'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'person', 'place', 'thing'] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="flex-1 rounded-full border py-1.5 text-xs font-bold capitalize" style={{ borderColor: filter === f ? (f === 'all' ? '#fff' : catColor[f]) : '#ffffff20', color: filter === f ? (f === 'all' ? '#fff' : catColor[f]) : '#9CA3AF', background: filter === f ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
              {f}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {rows.map((r, i) => {
            const isMe = r.name === 'TreyLegend';
            return (
              <div key={r.name} className="rounded-2xl border p-3 flex items-center gap-3" style={{ borderColor: isMe ? '#FFB800' : '#ffffff12', background: isMe ? 'rgba(255,184,0,0.1)' : 'rgba(0,0,0,0.3)' }}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${i < 3 ? 'bg-yellow-500 text-black' : 'bg-white/10'}`}>{i + 1}</div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center text-xs font-black">{r.avatar}</div>
                <div className="flex-1">
                  <div className="font-bold flex items-center gap-1.5">{r.name} {isMe && <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-black">YOU</span>}</div>
                  <div className="text-[11px] capitalize" style={{ color: catColor[r.bestCategory] }}>Best lane: {r.bestCategory}</div>
                </div>
                <div className="font-black text-yellow-300">{val(r)}</div>
              </div>
            );
          })}
          {rows.length === 0 && <div className="text-center text-white/40 py-8">No players in this lane yet.</div>}
        </div>
      </div>
      <TreyBottomNav active="rankings" onHome={onExit} />
    </ScreenWrap>
  );
};

export default TreynounLeaderboard;
