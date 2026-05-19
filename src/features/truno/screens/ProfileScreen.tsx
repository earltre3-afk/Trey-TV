import React, { useState } from 'react';
import { Trophy, Zap, Calendar, Flame, Edit, Check, Crown, Shield, Star, Users, Box } from 'lucide-react';
import TrunoLogo from '../components/TrunoLogo';

const decks = [
  { name: 'Neon Inferno',    count: '54 / 54', equipped: true,  gradient: 'from-red-700 via-orange-700 to-red-900',    icon: '🔥' },
  { name: 'Cosmic Surge',    count: '23 / 54', equipped: false, gradient: 'from-purple-700 via-blue-700 to-purple-900', icon: '🌌' },
  { name: 'Electric Dreams', count: '18 / 54', equipped: false, gradient: 'from-cyan-700 via-blue-700 to-indigo-900',   icon: '⚡' },
  { name: 'Royal Flush',     count: '31 / 54', equipped: false, gradient: 'from-amber-700 via-pink-700 to-rose-900',    icon: '👑' },
  { name: 'Midnight Wave',   count: '16 / 54', equipped: false, gradient: 'from-fuchsia-700 via-purple-700 to-blue-900',icon: '🌊' },
];

const badges = [
  { name: 'Truno Legend',      sub: '',    icon: Crown,  color: 'text-fuchsia-300', bg: 'from-fuchsia-900/40 to-purple-900/40' },
  { name: 'Win Streak',        sub: '10',  icon: Star,   color: 'text-amber-300',   bg: 'from-amber-900/40 to-yellow-900/40' },
  { name: 'Collector',         sub: '100', icon: Shield, color: 'text-purple-300',  bg: 'from-purple-900/40 to-indigo-900/40' },
  { name: 'Quick Play Master', sub: '',    icon: Zap,    color: 'text-cyan-300',    bg: 'from-cyan-900/40 to-blue-900/40' },
  { name: 'On Fire',           sub: '25',  icon: Flame,  color: 'text-orange-300',  bg: 'from-orange-900/40 to-red-900/40' },
  { name: 'Social Butterfly',  sub: '',    icon: Users,  color: 'text-emerald-300', bg: 'from-emerald-900/40 to-teal-900/40' },
  { name: 'Deck Designer',     sub: '',    icon: Box,    color: 'text-blue-300',    bg: 'from-blue-900/40 to-indigo-900/40' },
];

const ProfileScreen: React.FC = () => {
  const [tab, setTab] = useState('DECKS');

  return (
    <div className="px-3 pb-24 space-y-4">
      <div className="flex flex-col items-center">
        <TrunoLogo size="md" subtitle="Match colors. Play action. Own the table." showParent={false} />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-600 to-blue-700 ring-4 ring-fuchsia-500/50 shadow-[0_0_30px_rgba(255,0,128,0.5)] flex items-center justify-center text-4xl font-black text-white">T</div>
          <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Trey-1</h1>
            <div className="w-5 h-5 rounded-full bg-fuchsia-500 text-xs font-black text-white flex items-center justify-center">✓</div>
          </div>
          <div className="mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/30">
            <Crown size={11} className="text-purple-300" />
            <span className="text-[11px] font-bold text-purple-300">The Card Architect</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-9 h-9 rounded-md border-2 border-amber-500 bg-amber-500/10 flex items-center justify-center text-amber-300 font-black text-sm">42</div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500" style={{ width: '62%' }} />
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">12,450 / 20,000 XP</div>
            </div>
          </div>
        </div>
        <button className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900/60 text-xs text-zinc-300">
          <Edit size={12} /> Edit Profile
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 grid grid-cols-5 gap-2 text-center">
        {[
          { label: 'TOTAL WINS',    value: '1,248',    Icon: Trophy,   color: 'text-amber-300' },
          { label: 'WIN RATE',      value: '68%',      Icon: Star,     color: 'text-fuchsia-300' },
          { label: 'FAVORITE MODE', value: 'Quick',    Icon: Zap,      color: 'text-cyan-300' },
          { label: 'BEST STREAK',   value: '19',       Icon: Flame,    color: 'text-orange-400' },
          { label: 'JOINED',        value: 'May 2024', Icon: Calendar, color: 'text-zinc-300' },
        ].map((s, i) => (
          <div key={i} className={i < 4 ? 'border-r border-zinc-800' : ''}>
            <div className="text-[9px] font-bold text-zinc-500 tracking-wider">{s.label}</div>
            <div className="flex items-center justify-center gap-1 mt-1">
              <s.Icon size={14} className={s.color} />
              <span className="text-xs font-black text-white">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-zinc-300 tracking-wider">BADGE COLLECTION</h3>
          <button className="text-[10px] text-zinc-400">View All ›</button>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {badges.map((b, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-12 h-14 rounded-xl bg-gradient-to-b ${b.bg} border ${b.color.replace('text', 'border')}/40 flex items-center justify-center relative`}
                style={{ clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)' }}>
                <b.icon size={20} className={b.color} fill={b.icon === Star ? 'currentColor' : 'none'} />
                {b.sub && <span className="absolute bottom-1 text-[8px] font-black text-white bg-black/60 px-1 rounded">{b.sub}</span>}
              </div>
              <div className="text-[9px] font-bold text-white mt-1 text-center leading-tight">{b.name}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 overflow-hidden">
        <div className="flex border-b border-zinc-800 overflow-x-auto">
          {['DECKS', 'CARD BACKS', 'WILD EFFECTS', 'SPECIAL CARDS', 'TABLES'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2.5 text-[11px] font-bold whitespace-nowrap ${tab === t ? 'text-amber-300 border-b-2 border-amber-400' : 'text-zinc-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-zinc-300">MY DECKS</h3>
            <button className="text-xs font-bold text-fuchsia-300 px-3 py-1 rounded-lg border border-zinc-700">View Collection</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {decks.map((d, i) => (
              <div key={i} className={`flex-shrink-0 w-28 rounded-xl border ${d.equipped ? 'border-amber-500/60 shadow-[0_0_15px_rgba(255,215,0,0.3)]' : 'border-zinc-800'} bg-zinc-950/60 overflow-hidden`}>
                <div className={`relative aspect-[3/4] bg-gradient-to-br ${d.gradient} flex items-center justify-center text-4xl`}>
                  {d.icon}
                </div>
                <div className="p-2">
                  <div className="text-[11px] font-bold text-white">{d.name}</div>
                  {d.equipped ? (
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold mt-0.5">
                      Equipped <Check size={10} />
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-500">🃏 {d.count}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full py-2.5 rounded-xl border border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300 font-bold text-sm flex items-center justify-center gap-2">
            <Zap size={14} /> Equip Deck
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
        <h3 className="text-xs font-bold text-zinc-400 tracking-wider mb-2">COLLECTION PREVIEW</h3>
        <div className="grid grid-cols-4 gap-2">
          {[
            { name: 'Card Backs',   count: '27 / 72', icon: '🃏' },
            { name: 'Wild Effects', count: '14 / 36', icon: '✨' },
            { name: 'Special Cards',count: '22 / 52', icon: '🎴' },
            { name: 'Table Skins',  count: '9 / 24',  icon: '🎰' },
          ].map((c, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-2 text-center">
              <div className="aspect-square rounded-lg bg-gradient-to-br from-purple-900/40 to-fuchsia-900/40 mb-1.5 flex items-center justify-center text-2xl">{c.icon}</div>
              <div className="text-[10px] font-bold text-white">{c.name}</div>
              <div className="text-[9px] text-zinc-500">{c.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
