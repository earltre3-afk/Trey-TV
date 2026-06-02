import React from 'react';
import { Globe, Lock, User, LucideIcon } from 'lucide-react';
import { PrivacyMode } from '@/types/naturalAbility';

interface Props {
  value: PrivacyMode;
  onChange: (v: PrivacyMode) => void;
}

const SignalPrivacyControls: React.FC<Props> = ({
  value,
  onChange,
}) => {
  const options: {
    id: PrivacyMode;
    icon: LucideIcon;
    title: string;
    sub: string;
    color: string;
  }[] = [
    { id: 'public', icon: Globe, title: 'Profile + Feed', sub: 'Show everywhere', color: 'fuchsia' },
    { id: 'profile', icon: User, title: 'Profile Only', sub: 'No feed display', color: 'cyan' },
    { id: 'private', icon: Lock, title: 'Keep Private', sub: 'Just for you', color: 'amber' },
  ];

  const tintMap: Record<string, { border: string; glow: string; text: string; bg: string }> = {
    fuchsia: { border: 'border-fuchsia-400', glow: 'shadow-[0_0_25px_-5px_rgba(217,70,239,0.6)]', text: 'text-fuchsia-300', bg: 'bg-fuchsia-500/15' },
    cyan: { border: 'border-cyan-400', glow: 'shadow-[0_0_25px_-5px_rgba(34,211,238,0.6)]', text: 'text-cyan-300', bg: 'bg-cyan-500/15' },
    amber: { border: 'border-amber-400', glow: 'shadow-[0_0_25px_-5px_rgba(251,191,36,0.6)]', text: 'text-amber-300', bg: 'bg-amber-500/15' },
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Lock className="w-4 h-4 text-slate-400" />
        <span className="text-[11px] tracking-[0.3em] text-slate-400 font-semibold">PRIVACY CONTROL</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((o) => {
          const Icon = o.icon;
          const active = value === o.id;
          const t = tintMap[o.color];
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className={`relative rounded-2xl border px-3 py-4 text-center transition flex flex-col items-center gap-2 ${
                active
                  ? `${t.border} ${t.glow} ${t.bg}`
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? t.text : 'text-slate-400'}`} />
              <div className={`text-[11px] font-bold tracking-wide leading-tight ${active ? t.text : 'text-slate-300'}`}>
                {o.title}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">{o.sub}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SignalPrivacyControls;
