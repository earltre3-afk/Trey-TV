import React from 'react';
import { Upload, Hash, Sparkles, Move, Trophy, Lock } from 'lucide-react';
import { cn } from './primitives';

export const builderSteps = [
  { n: 1, label: 'Upload', sub: 'Add your routine video', icon: Upload, color: 'fuchsia' },
  { n: 2, label: 'Mark 8-Counts', sub: 'Beat map your choreo', icon: Hash, color: 'purple' },
  { n: 3, label: 'Move Hints', sub: 'Add coaching cues & tips', icon: Sparkles, color: 'purple' },
  { n: 4, label: 'Direction Arrows', sub: 'Set facing & transitions', icon: Move, color: 'cyan' },
  { n: 5, label: 'Scoring Rules', sub: 'Define how AI will score', icon: Trophy, color: 'teal' },
  { n: 6, label: 'Publish Settings', sub: 'Choose privacy & visibility', icon: Lock, color: 'teal' },
];

const colorMap: Record<string, string> = {
  fuchsia: 'border-fuchsia-400/60 text-fuchsia-300 bg-fuchsia-500/10',
  purple: 'border-purple-400/60 text-purple-300 bg-purple-500/10',
  cyan: 'border-cyan-400/60 text-cyan-300 bg-cyan-500/10',
  teal: 'border-teal-400/60 text-teal-300 bg-teal-500/10',
};

export const BuilderStepper: React.FC<{ active: number; onSelect: (n: number) => void }> = ({ active, onSelect }) => (
  <div className="flex md:flex-col overflow-x-auto no-scrollbar gap-2 md:space-y-2 md:gap-0 pb-2 md:pb-0 scroll-smooth px-1 md:px-0">
    {builderSteps.map((s) => (
      <button key={s.n} onClick={() => onSelect(s.n)}
        className={cn('shrink-0 md:shrink w-[150px] md:w-full flex items-center gap-2 md:gap-3 rounded-2xl border bg-white/[0.03] p-2.5 md:p-3 text-left transition',
          active === s.n ? colorMap[s.color] : 'border-white/10 text-white/50')}>
        <span className={cn('w-5 h-5 md:w-6 md:h-6 rounded-full grid place-items-center text-[10px] md:text-xs font-black shrink-0', active === s.n ? 'bg-current text-black' : 'bg-white/10')}>{s.n}</span>
        <s.icon className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
        <div className="min-w-0"><div className="text-[10px] md:text-xs font-black uppercase truncate">{s.label}</div><div className="text-[8px] md:text-[9px] text-white/40 truncate">{s.sub}</div></div>
      </button>
    ))}
  </div>
);
