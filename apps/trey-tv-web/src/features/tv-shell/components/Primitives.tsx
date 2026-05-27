import React from 'react';

// Focusable button - TV-safe, large, with glowing neon focus state
export const FocusButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'gold' | 'outline';
  icon?: React.ReactNode;
  className?: string;
  autoFocus?: boolean;
}> = ({ children, onClick, variant = 'ghost', icon, className = '', autoFocus }) => {
  const base =
    'group relative inline-flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-semibold text-base ' +
    'transition-all duration-200 outline-none focus:scale-[1.04] focus:z-10 ' +
    'focus:ring-2 focus:ring-offset-0';
  const variants = {
    primary:
      'bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white shadow-[0_0_24px_rgba(255,43,214,0.35)] ' +
      'focus:shadow-[0_0_40px_rgba(255,43,214,0.85)] focus:ring-fuchsia-400',
    ghost:
      'bg-white/5 text-white border border-white/10 backdrop-blur-md ' +
      'focus:border-fuchsia-400 focus:bg-white/10 focus:shadow-[0_0_28px_rgba(255,43,214,0.55)] focus:ring-fuchsia-400/60',
    gold:
      'bg-gradient-to-br from-amber-300 to-yellow-600 text-black shadow-[0_0_24px_rgba(248,200,75,0.35)] ' +
      'focus:shadow-[0_0_36px_rgba(248,200,75,0.8)] focus:ring-amber-300',
    outline:
      'border border-fuchsia-500/50 text-white bg-black/40 ' +
      'focus:border-fuchsia-400 focus:shadow-[0_0_32px_rgba(255,43,214,0.7)] focus:ring-fuchsia-400/60',
  };
  return (
    <button autoFocus={autoFocus} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>
      {icon}
      <span>{children}</span>
    </button>
  );
};

// Focusable card - liquid glass with neon glow focus
export const FocusCard: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  glow?: 'magenta' | 'cyan' | 'gold';
}> = ({ children, onClick, className = '', glow = 'magenta' }) => {
  const glowMap = {
    magenta: 'focus:shadow-[0_0_38px_rgba(255,43,214,0.7)] focus:border-fuchsia-400',
    cyan: 'focus:shadow-[0_0_38px_rgba(0,217,255,0.6)] focus:border-cyan-400',
    gold: 'focus:shadow-[0_0_38px_rgba(248,200,75,0.7)] focus:border-amber-300',
  };
  return (
    <button
      onClick={onClick}
      className={
        'group relative overflow-hidden rounded-2xl border border-white/10 ' +
        'bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-md ' +
        'transition-all duration-200 outline-none text-left ' +
        'focus:scale-[1.05] focus:z-10 ' +
        glowMap[glow] + ' ' + className
      }
    >
      {children}
    </button>
  );
};

// Section heading row
export const RowHeader: React.FC<{ title: string; viewAll?: boolean }> = ({ title, viewAll }) => (
  <div className="flex items-end justify-between mb-3">
    <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
    {viewAll && (
      <button className="text-sm text-fuchsia-300 hover:text-fuchsia-200 focus:text-white focus:underline outline-none">
        View All ›
      </button>
    )}
  </div>
);

// Remote control hints bar
export const RemoteHints: React.FC<{ hints?: { label: string; icon: string }[] }> = ({
  hints = [
    { label: 'Navigate', icon: '⊕' },
    { label: 'Select', icon: 'OK' },
    { label: 'Back', icon: '↩' },
    { label: 'Menu', icon: '☰' },
  ],
}) => (
  <div className="flex items-center gap-6 text-sm text-white/70">
    {hints.map((h) => (
      <div key={h.label} className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center min-w-[34px] h-8 px-2 rounded-md border border-white/20 bg-white/5 font-bold text-xs">
          {h.icon}
        </span>
        <span>{h.label}</span>
      </div>
    ))}
  </div>
);

// Glass panel
export const GlassPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <div
    className={
      'rounded-2xl border border-fuchsia-500/20 bg-gradient-to-br from-[rgba(18,12,28,0.82)] to-[rgba(10,10,18,0.78)] ' +
      'backdrop-blur-xl shadow-[0_0_60px_rgba(168,85,247,0.08)_inset] ' + className
    }
  >
    {children}
  </div>
);
