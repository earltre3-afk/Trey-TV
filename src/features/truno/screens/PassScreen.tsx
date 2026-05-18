import React, { useState } from 'react';
import { Crown, Lock, Check, Clock, Zap, Star } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';

const premiumRow = [
  { level: 21, type: 'CARD BACK',   name: 'Neon Swirl',     locked: true,  icon: '🌀' },
  { level: 22, type: 'TABLE THEME', name: 'Cosmic Lounge',   locked: true,  icon: '🛋️' },
  { level: 23, type: 'EMOJI',       name: 'Flex Flame',      locked: true,  icon: '🔥' },
  { level: 24, type: 'WILD EFFECT', name: 'Neon Burst',      locked: true,  icon: '✨' },
  { level: 25, type: 'COINS',       name: '500',             locked: false, icon: '★' },
];

const freeRow = [
  { level: 21, type: 'COINS',         name: '100',           claimed: true,  claim: false, locked: false, icon: '★' },
  { level: 22, type: 'PROFILE FRAME', name: 'Neon Pulse',    claimed: true,  claim: false, locked: false, icon: '⭕' },
  { level: 23, type: 'CARD BACK',     name: 'Electric Flow', claimed: false, claim: true,  locked: false, icon: '🌀' },
  { level: 24, type: 'EMOJI',         name: 'Good Vibes',    claimed: false, claim: false, locked: true,  icon: '😎' },
  { level: 25, type: 'TABLE THEME',   name: 'Midnight City', claimed: false, claim: false, locked: true,  icon: '🌃' },
];

const featured = [
  { type: 'EXCLUSIVE CARD BACK', name: 'Galactic Crown', badge: 'Season Exclusive', icon: '👑' },
  { type: 'TABLE THEME',         name: 'Eclipse Arena',  badge: 'Premium Reward',   icon: '🌑' },
  { type: 'WILD EFFECT',         name: 'Stellar Storm',  badge: 'Premium Reward',   icon: '🌪️' },
  { type: 'PROFILE FRAME',       name: 'Neon Royalty',   badge: 'Season Exclusive', icon: '👑' },
];

const PassScreen: React.FC = () => {
  const [tab, setTab] = useState<'rewards' | 'challenges'>('rewards');

  return (
    <div className="px-3 pb-24 space-y-4">
      <div className="flex flex-col items-center">
        <div className="flex items-end gap-3 w-full">
          <div className="flex-1">
            <TrunoLogo size="md" showParent={false} />
            <div className="flex items-center justify-center gap-2 mt-1">
              <h2 className="text-2xl font-black tracking-wide" style={{
                background: 'linear-gradient(180deg, #FFD700, #FFA500)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>PASS</h2>
              <Crown size={20} className="text-amber-400" />
            </div>
            <p className="text-[11px] tracking-wider font-bold text-fuchsia-300 mt-1 text-center">SEASON 1: NEON ASCENSION</p>
            <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1 mt-1">
              <Clock size={10} /> ENDS IN 27 DAYS
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-fuchsia-500/30 bg-zinc-950/80 p-3 flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl border-2 border-purple-500 bg-purple-500/10 flex items-center justify-center font-black text-purple-300 shadow-[0_0_15px_rgba(157,78,221,0.4)]">23</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 tracking-wider">LEVEL</span>
            <span className="text-[11px] text-zinc-300">2,750 / 5,000 XP</span>
          </div>
          <div className="h-2 mt-1 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-blue-500" style={{ width: '55%' }} />
          </div>
        </div>
        <button className="text-xs font-bold px-3 py-2 rounded-xl border border-amber-500/50 text-amber-300 hover:bg-amber-500/10">Buy Levels</button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => setTab('rewards')} className={`py-2.5 rounded-xl text-xs font-bold ${tab === 'rewards' ? 'bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
          REWARDS
        </button>
        <button onClick={() => setTab('challenges')} className={`relative py-2.5 rounded-xl text-xs font-bold ${tab === 'challenges' ? 'bg-fuchsia-500/20 border border-fuchsia-500/50 text-fuchsia-300' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}>
          CHALLENGES
          <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-amber-500 text-[9px] font-black text-amber-950 flex items-center justify-center">7</span>
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <div className="flex">
          <div className="w-20 flex-shrink-0 bg-gradient-to-b from-amber-900/40 to-amber-950/20 border-r border-amber-500/30 flex flex-col items-center justify-center p-2">
            <Crown size={20} className="text-amber-400" />
            <span className="text-[10px] font-black text-amber-300 mt-1">PREMIUM</span>
            <button className="mt-2 text-[10px] font-bold text-amber-400 border border-amber-500/50 rounded-md px-2 py-0.5">UPGRADE</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1 p-2 min-w-max">
              {premiumRow.map((r, i) => (
                <div key={i} className={`relative w-20 rounded-xl border ${r.locked ? 'border-zinc-800 bg-zinc-900/60' : 'border-amber-500/50 bg-amber-500/10'} p-2 flex flex-col items-center`}>
                  {r.locked && <Lock size={11} className="absolute top-1 right-1 text-zinc-600" />}
                  <div className="text-2xl">{r.icon}</div>
                  <div className="text-[8px] text-zinc-500 mt-1">{r.type}</div>
                  <div className="text-[9px] font-bold text-white text-center leading-tight">{r.name}</div>
                  {!r.locked && (
                    <button className="mt-1 text-[9px] font-black text-amber-300 border border-amber-500/50 rounded-md px-2 py-0.5">CLAIM</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-around py-2 bg-gradient-to-r from-transparent via-fuchsia-950/40 to-transparent border-y border-zinc-800">
          {[21, 22, 23, 24, 25].map((l, i) => (
            <div key={i} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black ${l === 23 ? 'border-2 border-amber-400 text-amber-300 bg-amber-500/10' : 'border border-zinc-700 text-zinc-400'}`}>{l}</div>
          ))}
        </div>

        <div className="flex">
          <div className="w-20 flex-shrink-0 bg-gradient-to-b from-blue-900/30 to-blue-950/20 border-r border-blue-500/30 flex flex-col items-center justify-center p-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-500/50 rotate-45 flex items-center justify-center">
              <Star size={12} className="text-blue-300 -rotate-45" fill="currentColor" />
            </div>
            <span className="text-[10px] font-black text-blue-300 mt-1">FREE</span>
          </div>
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1 p-2 min-w-max">
              {freeRow.map((r, i) => (
                <div key={i} className={`relative w-20 rounded-xl border ${r.locked ? 'border-zinc-800 bg-zinc-900/60' : r.claimed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-fuchsia-500/50 bg-fuchsia-500/10'} p-2 flex flex-col items-center`}>
                  {r.locked && <Lock size={11} className="absolute top-1 right-1 text-zinc-600" />}
                  <div className="text-2xl">{r.icon}</div>
                  <div className="text-[8px] text-zinc-500 mt-1">{r.type}</div>
                  <div className="text-[9px] font-bold text-white text-center leading-tight">{r.name}</div>
                  {r.claimed && <Check size={12} className="text-emerald-400 mt-1" />}
                  {r.claim && <button className="mt-1 text-[9px] font-black text-fuchsia-300 border border-fuchsia-500/50 rounded-md px-2 py-0.5">CLAIM</button>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-fuchsia-300 tracking-wider text-center mb-3">FEATURED REWARDS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {featured.map((f, i) => (
            <div key={i} className="rounded-2xl border border-purple-500/30 bg-zinc-950/80 p-3 text-center">
              <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-900/40 to-fuchsia-900/20 mb-2 flex items-center justify-center text-4xl">{f.icon}</div>
              <div className="text-[9px] text-zinc-500 font-bold">{f.type}</div>
              <div className="text-xs font-bold text-white">{f.name}</div>
              <div className={`text-[9px] mt-1.5 px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${f.badge.includes('Season') ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                {f.badge.includes('Season') ? '◆' : <Crown size={8} />} {f.badge}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
        <h3 className="text-xs font-bold text-fuchsia-300 tracking-wider text-center mb-2">TRUNO PASS PERKS</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
          {[
            { icon: <div className="w-7 h-7 rounded-lg rotate-45 bg-blue-500/20 border border-blue-500 flex items-center justify-center"><Star size={12} className="text-blue-300 -rotate-45" fill="currentColor" /></div>, title: '+50%', sub: 'Season XP Boost' },
            { icon: <div className="text-xl">🪙</div>, title: 'Daily', sub: 'Bonus Coins' },
            { icon: <Crown size={20} className="text-amber-400" />, title: 'Exclusive', sub: 'Rewards' },
            { icon: <Zap size={20} className="text-fuchsia-400" />, title: 'Priority', sub: 'Matchmaking' },
          ].map((p, i) => (
            <div key={i} className="flex flex-col items-center gap-1 p-2">
              {p.icon}
              <div className="text-[11px] font-black text-white">{p.title}</div>
              <div className="text-[9px] text-zinc-400">{p.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-fuchsia-950/40 to-purple-950/40 p-4 flex items-center justify-between text-left">
        <div>
          <h3 className="text-amber-300 font-black text-base">UNLOCK THE FULL EXPERIENCE</h3>
          <p className="text-[11px] text-zinc-400 mt-1">Get exclusive rewards, faster progression,<br/>and show off your status at the table.</p>
        </div>
        <span className="text-xs font-black px-4 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/60 text-amber-300 flex items-center gap-2">
          <Crown size={12} /> UPGRADE TO PREMIUM
        </span>
      </button>
    </div>
  );
};

export default PassScreen;
