// TRANCE — reusable visual primitives
import React from 'react';
import {
  Crown, Star, Flame, Zap, Award, Shield, Globe, Activity,
  Link as LinkIcon, Sparkles, Lock, AlertTriangle, Loader2,
} from 'lucide-react';
import { Badge } from '../types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Crown, Star, Flame, Zap, Award, Shield, Globe, Activity, Link: LinkIcon, Sparkles, Lock,
};

export const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ');

/* TranceGradientTitle */
export const TranceGradientTitle: React.FC<{
  children: React.ReactNode; className?: string; from?: string;
}> = ({ children, className }) => (
  <h2 className={cn(
    'font-black tracking-tight bg-clip-text text-transparent',
    'bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400',
    className,
  )}>
    {children}
  </h2>
);

/* TranceGlassCard */
export const TranceGlassCard: React.FC<{
  children: React.ReactNode; className?: string; glow?: 'magenta' | 'cyan' | 'purple' | 'gold' | 'none';
  onClick?: () => void;
}> = ({ children, className, glow = 'none', onClick }) => {
  const glows: Record<string, string> = {
    magenta: 'shadow-[0_0_30px_-8px_rgba(217,70,239,0.5)] border-fuchsia-500/30',
    cyan: 'shadow-[0_0_30px_-8px_rgba(34,211,238,0.5)] border-cyan-400/30',
    purple: 'shadow-[0_0_30px_-8px_rgba(168,85,247,0.5)] border-purple-500/30',
    gold: 'shadow-[0_0_30px_-8px_rgba(250,204,21,0.45)] border-yellow-500/40',
    none: 'border-white/10',
  };
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border bg-white/[0.04] backdrop-blur-xl',
        'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-b before:from-white/[0.06] before:to-transparent before:pointer-events-none',
        glows[glow], onClick && 'cursor-pointer transition-transform active:scale-[0.98] hover:border-white/20',
        className,
      )}
    >
      {children}
    </div>
  );
};

/* TranceBadge */
export const TranceBadge: React.FC<{ badge: Badge; size?: 'sm' | 'md' }> = ({ badge, size = 'md' }) => {
  const Icon = iconMap[badge.icon] || Star;
  const tiers: Record<string, string> = {
    gold: 'from-yellow-400/30 to-amber-600/20 border-yellow-400/60 text-yellow-300',
    purple: 'from-purple-500/30 to-fuchsia-600/20 border-purple-400/60 text-purple-200',
    cyan: 'from-cyan-400/30 to-teal-600/20 border-cyan-300/60 text-cyan-200',
    magenta: 'from-fuchsia-500/30 to-pink-600/20 border-fuchsia-400/60 text-fuchsia-200',
    locked: 'from-white/5 to-white/5 border-white/10 text-white/30',
  };
  const dim = size === 'sm' ? 'w-12 h-12' : 'w-16 h-16';
  return (
    <div className="flex flex-col items-center gap-1.5 w-20">
      <div className={cn('rounded-2xl border bg-gradient-to-b grid place-items-center', dim, tiers[badge.tier])}>
        <Icon className={size === 'sm' ? 'w-5 h-5' : 'w-7 h-7'} />
      </div>
      <span className="text-[10px] font-semibold text-center leading-tight text-white/70 uppercase">{badge.name}</span>
    </div>
  );
};

/* TranceStatRing — animated progress ring */
export const TranceStatRing: React.FC<{
  value: number; max?: number; size?: number; stroke?: number;
  color?: string; label?: string; sub?: string; big?: React.ReactNode;
}> = ({ value, max = 100, size = 110, stroke = 9, color = '#d946ef', label, sub, big }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 6px ${color})` }} />
      </svg>
      <div className="absolute text-center">
        {big ?? <div className="text-xl font-black text-white">{value}</div>}
        {label && <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>{label}</div>}
        {sub && <div className="text-[9px] text-white/50">{sub}</div>}
      </div>
    </div>
  );
};

/* ScoreMeter — circular grade meter */
export const ScoreMeter: React.FC<{ value: number; label: string; grade?: string; color: string; desc?: string }> =
  ({ value, label, grade = 'A', color, desc }) => (
    <div className="flex flex-col items-center gap-2">
      <TranceStatRing value={value} size={96} stroke={8} color={color}
        big={<div className="text-center"><div className="text-2xl font-black text-white leading-none">{value}<span className="text-sm">%</span></div><div className="text-sm font-bold" style={{ color }}>{grade}</div></div>} />
      <div className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</div>
      {desc && <div className="text-[10px] text-white/50 text-center max-w-[120px]">{desc}</div>}
    </div>
  );

/* EmptyState */
export const EmptyState: React.FC<{ title: string; message: string; icon?: React.ReactNode }> =
  ({ title, message, icon }) => (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 grid place-items-center mb-4 text-white/40">
        {icon || <Sparkles className="w-7 h-7" />}
      </div>
      <h3 className="text-white font-bold mb-1">{title}</h3>
      <p className="text-sm text-white/50 max-w-xs">{message}</p>
    </div>
  );

/* LoadingState */
export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading TRANCE…' }) => (
  <div className="flex flex-col items-center justify-center py-12 text-white/60">
    <Loader2 className="w-8 h-8 animate-spin text-fuchsia-400 mb-3" />
    <span className="text-sm">{label}</span>
  </div>
);

/* ErrorState */
export const ErrorState: React.FC<{ label?: string; onRetry?: () => void }> = ({ label = 'Something went wrong.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <AlertTriangle className="w-8 h-8 text-amber-400 mb-3" />
    <span className="text-sm text-white/70 mb-3">{label}</span>
    {onRetry && <button onClick={onRetry} className="text-xs font-bold text-cyan-300 underline">Try again</button>}
  </div>
);

/* Verified tick */
export const VerifiedTick: React.FC<{ className?: string }> = ({ className }) => (
  <span className={cn('inline-grid place-items-center rounded-full bg-cyan-400 text-black w-4 h-4', className)}>
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
  </span>
);

/* GradientButton */
export const GradientButton: React.FC<{
  children: React.ReactNode; onClick?: () => void; className?: string; variant?: 'magenta' | 'cyan' | 'gold' | 'outline';
}> = ({ children, onClick, className, variant = 'magenta' }) => {
  const v: Record<string, string> = {
    magenta: 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500 text-white shadow-[0_0_24px_-4px_rgba(217,70,239,0.6)]',
    cyan: 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white',
    gold: 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black',
    outline: 'border border-white/20 text-white bg-white/5',
  };
  return (
    <button onClick={onClick} className={cn(
      'rounded-xl font-bold px-5 py-3 transition-transform active:scale-95 hover:brightness-110',
      v[variant], className,
    )}>{children}</button>
  );
};
