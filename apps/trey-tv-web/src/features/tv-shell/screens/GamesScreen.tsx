import React, { useState } from 'react';
import { TVFrame } from '../components/TVFrame';
import { FocusButton } from '../components/Primitives';
import { GameRow, ContentRow } from '../components/Rows';
import { trendingGames, interactiveStories, IMG } from '../mockData';
import { Gamepad2, Zap, Trophy, Users, Crown, Flame, Spade, Dice5 } from 'lucide-react';
import { useTV } from '../TVContext';

const chips = [
  { label: 'All Games', Icon: Gamepad2 },
  { label: 'Card & Board', Icon: Spade },
  { label: 'Multiplayer', Icon: Users },
  { label: 'Casino', Icon: Dice5 },
  { label: 'Story Mode', Icon: Crown },
  { label: 'Party Games', Icon: Zap },
  { label: 'Competitive', Icon: Trophy },
  { label: 'Trending', Icon: Flame },
];

export const GamesScreen: React.FC = () => {
  const [active, setActive] = useState('All Games');
  const { navigate } = useTV();
  return (
    <TVFrame activeRail="Games">
      {/* Hero */}
      <section className="relative h-[400px] w-full overflow-hidden rounded-3xl border border-fuchsia-500/20 mb-6 shadow-[0_0_60px_rgba(168,85,247,0.15)]">
        <img src={IMG(5)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        <div className="relative px-12 py-10 max-w-2xl">
          <div className="text-fuchsia-300 font-bold tracking-[0.3em] text-sm">TREY TV</div>
          <h1 className="text-7xl font-black leading-none mt-2">
            <span className="text-white">GAMES </span>
            <span className="bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent italic">LOUNGE</span>
          </h1>
          <p className="mt-4 text-white/80 text-lg">Play. Compete. Connect.<br />Welcome to the world of Trey Trizzy Gaming.</p>
          <div className="mt-6 flex gap-3">
            <FocusButton variant="primary" icon={<Gamepad2 className="w-5 h-5" />} autoFocus>Browse Games</FocusButton>
            <FocusButton variant="ghost" icon={<Zap className="w-5 h-5 text-fuchsia-300" />}>Quick Match</FocusButton>
          </div>
        </div>
        <span className="absolute top-6 right-6 px-3 py-1.5 rounded-md bg-amber-400 text-black text-xs font-black">4K ULTRA HD</span>
      </section>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {chips.map((c) => {
          const sel = active === c.label;
          return (
            <button
              key={c.label}
              onClick={() => setActive(c.label)}
              className={
                'flex items-center gap-2 px-5 py-3 rounded-2xl border outline-none transition-all focus:scale-105 ' +
                (sel
                  ? 'border-fuchsia-400 bg-gradient-to-br from-fuchsia-600/25 to-purple-700/25 shadow-[0_0_20px_rgba(255,43,214,0.55)]'
                  : 'border-white/10 bg-white/5 text-white/70 focus:border-fuchsia-400')
              }
            >
              <c.Icon className="w-5 h-5" />
              <span className="font-semibold">{c.label}</span>
            </button>
          );
        })}
      </div>

      <GameRow title="Featured Games" items={trendingGames} onSelect={(g) => g.title === 'Spades' ? navigate('spades') : null} />

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-3">Multiplayer Lounge</h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { t: 'QUICK MATCH', d: 'Random Opponent', Icon: Zap },
            { t: 'CREW BATTLES', d: 'Team vs Team', Icon: Users },
            { t: 'TOURNAMENTS', d: 'Compete & Win', Icon: Trophy },
            { t: 'PARTY ROOM', d: 'Invite & Play', Icon: Crown },
          ].map((it) => (
            <button key={it.t} className="flex items-center gap-3 px-5 py-5 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] outline-none focus:border-fuchsia-400 focus:shadow-[0_0_28px_rgba(255,43,214,0.55)] focus:scale-[1.03] transition-all">
              <it.Icon className="w-7 h-7 text-fuchsia-400" />
              <div className="text-left">
                <div className="font-black tracking-wide">{it.t}</div>
                <div className="text-xs text-white/60">{it.d}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <ContentRow title="Interactive Stories" items={interactiveStories} size="md" onSelect={() => navigate('stories')} />
      <GameRow title="Card Games" items={trendingGames.slice(0, 4)} onSelect={(g) => g.title === 'Spades' ? navigate('spades') : null} />
    </TVFrame>
  );
};
