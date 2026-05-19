import React, { useState } from 'react';
import { Crown, Flame } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';

const podium = [
  { rank: 2, name: 'Zay',    tier: 'SPECTRUM ELITE',  tierColor: 'text-cyan-300',  score: 22410, streak: 12, color: 'from-pink-500 to-red-700',     ringColor: 'ring-cyan-400/60' },
  { rank: 1, name: 'Trey-1', tier: 'SPECTRUM LEGEND', tierColor: 'text-amber-300', score: 25670, streak: 15, color: 'from-fuchsia-500 to-purple-700', ringColor: 'ring-amber-400', isYou: true },
  { rank: 3, name: 'Maya',   tier: 'SPECTRUM ELITE',  tierColor: 'text-red-300',   score: 20315, streak: 9,  color: 'from-purple-500 to-indigo-700', ringColor: 'ring-red-400/60' },
];

const rankings = [
  { rank: 4, name: 'Lena',        tier: 'SPECTRUM MASTER', score: 18890, streak: 7, color: 'from-rose-500 to-pink-700' },
  { rank: 5, name: 'AceTheGreat', tier: 'SPECTRUM MASTER', score: 17540, streak: 6, color: 'from-blue-500 to-cyan-700' },
  { rank: 6, name: 'KingNova',    tier: 'SPECTRUM MASTER', score: 16220, streak: 5, color: 'from-purple-500 to-fuchsia-700' },
  { rank: 7, name: 'ShadowPlay',  tier: 'SPECTRUM ELITE',  score: 15030, streak: 4, color: 'from-zinc-500 to-zinc-700' },
];

const LeaderboardScreen: React.FC = () => {
  const [tab, setTab] = useState('Global');

  return (
    <div className="px-3 pb-24 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="md" showParent={false} />
        <p className="text-xs tracking-[0.3em] font-bold text-fuchsia-300 mt-2">RANKED LEADERBOARD</p>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-1 grid grid-cols-4">
        {['Global', 'Friends', 'Clubs', 'Weekly'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`py-2 rounded-xl text-xs font-bold ${tab === t ? 'bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_15px_rgba(255,0,128,0.25)]' : 'text-zinc-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-900 to-purple-900 flex items-center justify-center text-xl">🃏</div>
          <div>
            <div className="font-bold text-white">Season 07</div>
            <div className="text-[10px] text-zinc-500">18d 06h 42m</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500">Season Score</div>
          <div className="text-xl font-black text-white">12,850</div>
        </div>
        <Crown size={32} className="text-amber-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950/80 to-zinc-950/40 p-4">
        <div className="grid grid-cols-3 gap-2 items-end">
          {podium.map((p) => (
            <div key={p.rank} className={`flex flex-col items-center ${p.rank === 1 ? 'order-2' : p.rank === 2 ? 'order-1' : 'order-3'}`}>
              <div className="relative">
                {p.rank === 1 && <Crown size={20} className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-400" fill="currentColor" />}
                <div className={`${p.rank === 1 ? 'w-20 h-20' : 'w-14 h-14'} rounded-full bg-gradient-to-br ${p.color} ring-4 ${p.ringColor} relative`}>
                  {p.rank === 1 && <div className="absolute -inset-2 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,215,0,0.3), transparent 70%)' }} />}
                </div>
                <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${p.rank === 1 ? 'bg-amber-500 text-amber-950' : p.rank === 2 ? 'bg-cyan-500 text-white' : 'bg-red-500 text-white'}`}>
                  {p.rank}
                </div>
              </div>
              <div className="text-center mt-3">
                <div className="flex items-center gap-1 justify-center">
                  <span className="text-sm font-black text-white">{p.name}</span>
                  {p.isYou && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300">You</span>}
                </div>
                <div className={`text-[10px] font-black tracking-wider ${p.tierColor}`}>{p.tier}</div>
                <div className="text-base font-black text-white mt-0.5">{p.score.toLocaleString()}</div>
                <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">Win Streak <Flame size={9} className="text-orange-400" /> <span className="text-amber-300 font-bold">{p.streak}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {rankings.map((r, i) => (
          <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-2.5 flex items-center gap-3">
            <span className="w-6 text-center text-zinc-400 font-bold text-sm">{r.rank}</span>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${r.color} ring-1 ring-white/10`} />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-white text-sm truncate">{r.name}</div>
              <div className="text-[10px] font-bold text-purple-300">{r.tier}</div>
            </div>
            <span className="text-sm font-black text-white">{r.score.toLocaleString()}</span>
            <span className="flex items-center gap-0.5 text-xs text-amber-300 font-bold"><Flame size={11} className="text-orange-400" /> {r.streak}</span>
            <div className="w-6 h-7 rounded-md bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
              <Crown size={11} className="text-purple-300" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-fuchsia-500/60 bg-gradient-to-r from-fuchsia-950/40 via-purple-950/40 to-fuchsia-950/40 p-3 flex items-center gap-3 shadow-[0_0_30px_rgba(255,0,128,0.25)]">
        <div className="text-center">
          <div className="text-[9px] text-zinc-400">Your Rank</div>
          <div className="text-2xl font-black text-white">13</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-700 ring-2 ring-fuchsia-400/60" />
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white">Trey-1</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40 text-fuchsia-300">You</span>
          </div>
          <div className="text-[10px] font-black text-amber-300">SPECTRUM CHAMPION</div>
          <div className="text-base font-black text-white">12,850</div>
        </div>
        <div className="text-right">
          <div className="text-[9px] text-zinc-400">Win Streak</div>
          <div className="flex items-center gap-0.5 text-base font-black text-amber-300">
            <Flame size={14} className="text-orange-400" /> 10
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 grid grid-cols-3 gap-3 items-center">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-orange-400" />
          <div>
            <div className="text-[10px] text-zinc-500">Win Streak</div>
            <div className="text-xl font-black text-white">10</div>
            <div className="text-[10px] text-zinc-400">Keep it going!</div>
          </div>
        </div>
        <div className="flex items-center gap-2 border-x border-zinc-800 px-3">
          <Flame size={20} className="text-orange-400" />
          <div>
            <div className="text-[10px] text-zinc-500">Best Streak</div>
            <div className="text-xl font-black text-white">15</div>
            <div className="text-[10px] text-emerald-400">New personal best!</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl">🎁</div>
          <div>
            <div className="text-[10px] text-zinc-500">Next Reward</div>
            <div className="text-base font-black text-amber-300">★ +400</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
