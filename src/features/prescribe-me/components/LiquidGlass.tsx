import React from 'react';

type Accent = 'gold' | 'cyan' | 'magenta' | 'purple' | 'pink' | 'orange' | 'multi';

const accentMap: Record<Accent, { border: string; glow: string; ring: string }> = {
  gold:    { border: 'from-amber-300 via-yellow-400 to-orange-500', glow: 'shadow-[0_0_40px_-5px_rgba(251,191,36,0.55)]', ring: 'ring-amber-400/60' },
  cyan:    { border: 'from-cyan-300 via-sky-400 to-blue-500',       glow: 'shadow-[0_0_40px_-5px_rgba(34,211,238,0.55)]', ring: 'ring-cyan-400/60' },
  magenta: { border: 'from-fuchsia-400 via-pink-500 to-rose-500',   glow: 'shadow-[0_0_40px_-5px_rgba(232,121,249,0.55)]', ring: 'ring-fuchsia-400/60' },
  purple:  { border: 'from-purple-400 via-violet-500 to-indigo-500',glow: 'shadow-[0_0_40px_-5px_rgba(168,85,247,0.55)]', ring: 'ring-purple-400/60' },
  pink:    { border: 'from-pink-400 via-rose-500 to-fuchsia-500',   glow: 'shadow-[0_0_40px_-5px_rgba(244,114,182,0.55)]', ring: 'ring-pink-400/60' },
  orange:  { border: 'from-orange-400 via-amber-500 to-yellow-400', glow: 'shadow-[0_0_40px_-5px_rgba(251,146,60,0.55)]', ring: 'ring-orange-400/60' },
  multi:   { border: 'from-cyan-400 via-fuchsia-500 to-amber-400',  glow: 'shadow-[0_0_50px_-5px_rgba(217,70,239,0.45)]', ring: 'ring-fuchsia-400/50' },
};

export const LiquidGlassCard: React.FC<{
  children: React.ReactNode;
  accent?: Accent;
  selected?: boolean;
  className?: string;
  onClick?: () => void;
  role?: string;
  ariaPressed?: boolean;
  ariaLabel?: string;
  tabIndex?: number;
}> = ({ children, accent = 'multi', selected = false, className = '', onClick, role, ariaPressed, ariaLabel, tabIndex }) => {
  const a = accentMap[accent];
  return (
    <div
      onClick={onClick}
      role={role}
      aria-pressed={ariaPressed}
      aria-label={ariaLabel}
      tabIndex={tabIndex ?? (onClick ? 0 : undefined)}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative rounded-3xl p-[1.5px] transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${
        selected ? `bg-gradient-to-br ${a.border} ${a.glow} ring-2 ${a.ring}` : 'bg-gradient-to-br from-white/15 via-white/5 to-white/10 hover:from-white/25 hover:via-white/10 hover:to-white/15'
      } ${className}`}
    >
      <div
        className={`relative rounded-3xl h-full w-full overflow-hidden ${selected ? 'bg-black/70' : 'bg-black/60'} backdrop-blur-xl`}
        style={{
          backgroundImage:
            'radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.08), transparent 50%), radial-gradient(100% 80% at 100% 100%, rgba(255,255,255,0.05), transparent 50%)',
        }}
      >
        {/* gloss highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl" />
        {children}
      </div>
    </div>
  );
};

export const NeonGlassButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'gold' | 'ghost' | 'outline';
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  type?: 'button' | 'submit';
}> = ({ children, onClick, variant = 'gold', disabled, className = '', ariaLabel, type = 'button' }) => {
  if (variant === 'ghost') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`relative px-5 py-3 rounded-full text-sm font-medium text-white/80 hover:text-white border border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }
  if (variant === 'outline') {
    return (
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        className={`relative px-6 py-3 rounded-full text-sm font-semibold text-white border-2 border-fuchsia-400/60 hover:border-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 backdrop-blur-md transition-all shadow-[0_0_30px_-8px_rgba(217,70,239,0.6)] disabled:opacity-50 ${className}`}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`relative group ${className}`}
    >
      <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-300 blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
      <span className="relative block px-8 py-4 rounded-full font-semibold text-black bg-gradient-to-b from-amber-200 via-yellow-300 to-amber-500 border border-amber-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_10px_30px_-5px_rgba(251,191,36,0.6)] disabled:opacity-50">
        {children}
      </span>
    </button>
  );
};
