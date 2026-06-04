import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TreyHeader, TreyBottomNav, ScreenWrap, NEON } from './treynoun/components/TreyShell';
import { Gamepad2, Brain, Music, Zap, Target, Dice5, ChevronRight } from 'lucide-react';

interface GameCard {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  route?: string;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  badge?: string;
  live?: boolean;
}

const GAMES: GameCard[] = [
  { id: 'treynoun', title: 'Treynoun', subtitle: 'Chase the noun. Crack the clues. Lock it in.', cta: 'Play', route: '/games/treynoun', color: NEON.magenta, icon: Target, badge: 'NEW', live: true },
  { id: 'beatdrop', title: 'Beat Drop', subtitle: 'Guess the song before the beat drops.', cta: 'Play', color: NEON.cyan, icon: Music, live: false },
  { id: 'trivia', title: 'Trey Trivia', subtitle: 'Fast-fire trivia battles with the crowd.', cta: 'Play', color: NEON.gold, icon: Brain, live: false },
  { id: 'reflex', title: 'Reflex Rush', subtitle: 'Tap fast. Climb the live leaderboard.', cta: 'Play', color: '#3B82F6', icon: Zap, live: false },
  { id: 'dice', title: 'Lucky Roll', subtitle: 'Roll for gems in the daily jackpot.', cta: 'Play', color: '#22C55E', icon: Dice5, live: false },
  { id: 'arcade', title: 'Trey Arcade', subtitle: 'A rotating vault of mini games.', cta: 'Play', color: '#A78BFA', icon: Gamepad2, live: false },
];

const GamesHome: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ScreenWrap>
      <TreyHeader />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="text-center mt-6 mb-5">
          <h1 className="text-3xl font-black">
            TREY TV <span style={{ color: NEON.cyan }}>GAMES</span>
          </h1>
          <p className="text-sm text-white/50 mt-1">Play, compete, and win across the Trey TV universe.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GAMES.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.id}
                onClick={() => g.route && navigate(g.route)}
                disabled={!g.live}
                className="relative rounded-2xl border p-4 text-left transition active:scale-[0.98] disabled:opacity-60 overflow-hidden"
                style={{ borderColor: `${g.color}55`, background: `linear-gradient(135deg, ${g.color}1A, rgba(0,0,0,0.4))` }}
              >
                {g.badge && (
                  <span className="absolute top-3 right-3 text-[10px] font-black px-2 py-0.5 rounded-full" style={{ background: g.color, color: '#000' }}>{g.badge}</span>
                )}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: `${g.color}22`, border: `1px solid ${g.color}` }}>
                  <Icon className="w-6 h-6" style={{ color: g.color }} />
                </div>
                <div className="font-extrabold text-lg">{g.title}</div>
                <div className="text-xs text-white/50 mt-0.5 mb-3 min-h-[32px]">{g.subtitle}</div>
                <div
                  className="inline-flex items-center gap-1 text-sm font-bold px-4 py-1.5 rounded-full"
                  style={{ background: g.live ? g.color : '#374151', color: g.live ? '#000' : '#9CA3AF' }}
                >
                  {g.live ? g.cta : 'Coming Soon'} {g.live && <ChevronRight className="w-4 h-4" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <TreyBottomNav active="home" />
    </ScreenWrap>
  );
};

export default GamesHome;
