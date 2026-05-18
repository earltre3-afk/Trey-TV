import React from 'react';
import { Crown, Trophy, Flame, RotateCw, Share2, Home, Check } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';
import TrunoCard from '../components/TrunoCard';
import { TrunoCard as TCard } from '../lib/cards';
import { avatarFor } from '../lib/avatars';

const finalHand: TCard[] = [
  { id: 'f1', color: 'purple', symbol: 'wild_draw_four', value: 4, label: '+4' },
  { id: 'f2', color: 'blue',   symbol: 'number', value: 7, label: '7' },
  { id: 'f3', color: 'black',  symbol: 'wild', label: 'W' },
  { id: 'f4', color: 'red',    symbol: 'number', value: 2, label: '2' },
  { id: 'f5', color: 'green',  symbol: 'reverse', label: 'R' },
];

const standings = [
  { rank: 1, name: 'Trey-1', cards: 0, points: 125, mvp: true  },
  { rank: 2, name: 'Zay',    cards: 3, points: 75,  mvp: false },
  { rank: 3, name: 'Maya',   cards: 5, points: 50,  mvp: false },
  { rank: 4, name: 'Lena',   cards: 7, points: 25,  mvp: false },
];

const VictoryScreen: React.FC<{ onNavigate: (v: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="px-3 pb-24 space-y-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className="absolute" style={{
            top: `${(i * 37) % 100}%`,
            left: `${(i * 53) % 100}%`,
            width: '6px',
            height: '12px',
            background: ['#FF0080', '#9D4EDD', '#00D9FF', '#00FF88', '#FFD700'][i % 5],
            transform: `rotate(${(i * 47) % 360}deg)`,
            opacity: 0.7,
          }} />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        <TrunoLogo size="md" showParent={false} />
        <h1 className="mt-2 text-4xl md:text-5xl font-black" style={{
          background: 'linear-gradient(180deg, #FFD700, #FFA500)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(255,215,0,0.6))',
        }}>YOU WIN!</h1>
        <p className="text-sm text-zinc-300 mt-1">What a game! You came out on top.</p>
      </div>

      <div className="relative flex flex-col items-center">
        <div className="absolute w-64 h-64 rounded-full" style={{
          background: 'radial-gradient(circle, rgba(255,0,128,0.3), rgba(157,78,221,0.2) 40%, transparent 70%)'
        }} />
        <div className="relative">
          <Crown size={32} className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" fill="currentColor" />
          <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-amber-400 shadow-[0_0_40px_rgba(255,215,0,0.6)]">
            <img src={avatarFor('Trey-1')} alt="Trey-1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute -right-3 top-2 w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(255,215,0,0.4)] backdrop-blur-sm bg-black/50">
            <Crown size={14} className="text-amber-300" />
            <span className="text-[9px] font-black text-amber-300">MVP</span>
          </div>
        </div>
        <h2 className="mt-3 text-2xl font-black text-white">Trey-1</h2>
        <div className="mt-1 px-3 py-1 rounded-md bg-fuchsia-500/20 border border-fuchsia-500/40">
          <span className="text-[11px] font-black text-fuchsia-300 tracking-wider">MATCH MVP</span>
        </div>
      </div>

      <div className="relative flex justify-center items-end" style={{ height: 130 }}>
        {finalHand.map((c, i) => {
          const mid = Math.floor(finalHand.length / 2);
          const offset = i - mid;
          const isCenter = i === mid;
          return (
            <div key={c.id} className="absolute transition-transform" style={{
              transform: `translateX(${offset * 50}px) translateY(${Math.abs(offset) * 5}px) rotate(${offset * 6}deg) ${isCenter ? 'translateY(-15px) scale(1.1)' : ''}`,
              zIndex: isCenter ? 50 : 10 - Math.abs(offset),
            }}>
              <TrunoCard card={c} size="sm" playable />
            </div>
          );
        })}
      </div>
      <div className="text-center -mt-2">
        <span className="text-[10px] font-bold text-fuchsia-300 tracking-wider px-3 py-1 rounded-md bg-fuchsia-500/10 border border-fuchsia-500/30">FINAL HAND</span>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 grid grid-cols-3 gap-3 text-center">
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-8 h-9 rounded-md border border-fuchsia-500 bg-fuchsia-500/10 flex items-center justify-center text-[10px] font-black text-fuchsia-300">XP</div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-400 font-bold">XP EARNED</div>
              <div className="text-base font-black text-fuchsia-300">+125 <span className="text-xs">XP</span></div>
            </div>
          </div>
        </div>
        <div className="border-x border-zinc-800">
          <div className="flex items-center justify-center gap-1.5">
            <div className="text-2xl">🪙</div>
            <div className="text-left">
              <div className="text-[10px] text-zinc-400 font-bold">COINS WON</div>
              <div className="text-base font-black text-amber-300">+250</div>
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-center gap-1.5">
            <Flame size={20} className="text-orange-400" />
            <div className="text-left">
              <div className="text-[10px] text-zinc-400 font-bold">STREAK BONUS</div>
              <div className="text-base font-black text-white">7 <span className="text-xs">DAYS</span></div>
              <div className="text-[9px] text-emerald-400 font-bold">+50% XP & Coins</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <div className="grid grid-cols-[40px_1fr_80px_80px] gap-2 px-3 py-2 border-b border-zinc-800 text-[10px] font-bold text-zinc-500 tracking-wider">
          <div>#</div>
          <div>PLAYER</div>
          <div className="text-right">CARDS LEFT</div>
          <div className="text-right">POINTS</div>
        </div>
        {standings.map(s => (
          <div key={s.rank} className={`grid grid-cols-[40px_1fr_80px_80px] gap-2 px-3 py-2.5 items-center ${s.rank === 1 ? 'bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-400' : ''}`}>
            <div className="flex items-center gap-1 text-white font-bold">
              {s.rank}
              {s.mvp && <Crown size={11} className="text-amber-400" />}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <img src={avatarFor(s.name)} alt={s.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" referrerPolicy="no-referrer" />
              <span className="text-sm font-bold text-white truncate">{s.name}</span>
              {s.mvp && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black">MVP</span>}
            </div>
            <div className="text-right text-sm text-white font-bold">{s.cards}</div>
            <div className="text-right text-sm font-black text-amber-300">★ +{s.points}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Flame size={28} className="text-orange-400" />
          <div>
            <div className="text-xs font-black text-white"><span className="text-orange-400">7</span> DAY STREAK</div>
            <div className="text-[10px] text-zinc-400">Keep it going!</div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-1 px-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center"><Check size={10} className="text-emerald-400" /></div>
          <div className="flex-1 h-1.5 rounded-full bg-emerald-500" />
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center"><Check size={10} className="text-emerald-400" /></div>
          <div className="flex-1 h-1.5 rounded-full bg-emerald-500" />
          <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center"><Check size={10} className="text-amber-400" /></div>
          <div className="flex-1 h-1.5 rounded-full bg-gradient-to-r from-amber-400 to-pink-400" />
          <div className="w-6 h-6 rounded-md border border-amber-500 bg-amber-500/10 flex items-center justify-center text-[10px] font-black text-amber-300">7</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xl">🎁</div>
          <div className="text-right">
            <div className="text-[9px] text-zinc-400 font-bold">NEXT REWARD</div>
            <div className="text-sm font-black text-amber-300">★ +500</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onNavigate('match')}
          className="py-3 rounded-2xl border border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-fuchsia-500/10"
        >
          <RotateCw size={14} /> REMATCH
        </button>
        <button className="py-3 rounded-2xl border border-cyan-500/50 bg-cyan-500/5 text-cyan-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-cyan-500/10">
          <Share2 size={14} /> SHARE WIN
        </button>
        <button
          onClick={() => onNavigate('home')}
          className="py-3 rounded-2xl border border-amber-500/50 bg-amber-500/5 text-amber-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/10"
        >
          <Home size={14} /> BACK TO LOBBY
        </button>
      </div>

      <div className="text-center text-[11px] text-zinc-500 flex items-center justify-center gap-1">
        <span className="text-fuchsia-400">♥</span> Thanks for playing
        <span className="font-black" style={{
          background: 'linear-gradient(90deg, #FF0080, #9D4EDD, #00D9FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>TRUNO™</span>
      </div>
    </div>
  );
};

export default VictoryScreen;
