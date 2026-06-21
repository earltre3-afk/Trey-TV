import React from 'react';
import { Home, Compass, Library, User, Sparkles } from 'lucide-react';
import TradioAIBall from './TradioAIBall';

export type NavKey = 'Home' | 'Explore' | 'Prescribe Me' | 'Library' | 'Profile';

interface BottomNavProps {
  active: NavKey;
  onChange: (key: NavKey) => void;
}

const items: { key: NavKey; icon: React.ElementType }[] = [
  { key: 'Home', icon: Home },
  { key: 'Explore', icon: Compass },
  { key: 'Prescribe Me', icon: Sparkles }, // Icon fallback, overridden in render
  { key: 'Library', icon: Library },
  { key: 'Profile', icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-[100] bg-gradient-to-t from-black via-black/95 to-transparent pb-[max(env(safe-area-inset-bottom),0px)]">
      <div className="tradio-player-dock mx-4 my-3 max-w-2xl px-2 py-2.5 sm:mx-auto">
        <div className="flex items-center justify-around">
          {items.map(({ key, icon: Icon }) => {
            const isActive = key === active;
            if (key === 'Prescribe Me') {
              return (
                <div
                  key={key}
                  className="flex flex-col items-center gap-1 py-0.5 flex-1 active:scale-95 transition-transform cursor-pointer"
                >
                  <TradioAIBall size="sm" onClick={() => onChange(key)} />
                  <button
                    type="button"
                    onClick={() => onChange(key)}
                    className={`text-[11px] font-medium tracking-wide transition-colors ${
                      isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]' : 'text-white/40'
                    }`}
                  >
                    Prescribe
                  </button>
                </div>
              );
            }

            return (
              <button
                type="button"
                key={key}
                onClick={() => onChange(key)}
                className="flex flex-col items-center gap-1 py-1 flex-1 active:scale-95 transition-transform animate-fade-in"
              >
                <Icon
                  className={`w-6 h-6 ${isActive ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]' : 'text-white/40'}`}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                <span
                  className={`text-[11px] font-medium ${
                    isActive ? 'text-amber-400' : 'text-white/40'
                  }`}
                >
                  {key === 'Profile' ? 'Profile' : key}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
