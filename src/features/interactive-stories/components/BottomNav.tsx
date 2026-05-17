import React from 'react';
import { BookOpen, Bookmark, GitBranch, Users, Settings, Save } from 'lucide-react';

export type NavTab = 'library' | 'story' | 'saves' | 'branches' | 'characters' | 'settings';

interface Props {
  active: NavTab;
  onChange: (t: NavTab) => void;
}

const ITEMS: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'library', label: 'Library', icon: BookOpen },
  { id: 'story', label: 'Story', icon: Bookmark },
  { id: 'saves', label: 'Saves', icon: Save },
  { id: 'branches', label: 'Branches', icon: GitBranch },
  { id: 'characters', label: 'Cast', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC<Props> = ({ active, onChange }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-black/90 backdrop-blur-lg">
    <div className="mx-auto flex max-w-2xl items-stretch justify-around px-1 py-2">
      {ITEMS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`relative flex flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 transition-all ${
              isActive ? 'text-violet-400' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]' : ''}`} />
            <span className="text-[9px] font-medium uppercase tracking-wider">{label}</span>
            {isActive && <span className="absolute -bottom-0.5 h-0.5 w-8 rounded-full bg-violet-500" />}
          </button>
        );
      })}
    </div>
  </nav>
);

