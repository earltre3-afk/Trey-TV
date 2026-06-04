import React from 'react';
import { Home, Target, ShoppingBag, BarChart3, User, Bell } from 'lucide-react';

export const NEON = {
  cyan: '#00F0FF',
  magenta: '#FF00E5',
  gold: '#FFB800',
  purple: '#8B5CF6',
  teal: '#2DD4BF',
};

export const catColor: Record<string, string> = {
  person: NEON.gold,
  place: NEON.cyan,
  thing: NEON.magenta,
};

/* ----------------------------- Brand Logo ----------------------------- */
export const BrandLogo: React.FC<{ size?: string; className?: string }> = ({ size = 'text-6xl', className = '' }) => (
  <h1 className={`font-black leading-none tracking-tight ${size} ${className}`}>
    <span style={{
      background: 'linear-gradient(180deg,#FFE082,#FFB300,#FF8F00)', WebkitBackgroundClip: 'text',
      backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 2px 6px rgba(255,160,0,.5))',
    }}>Trey</span>
    <span style={{
      background: 'linear-gradient(180deg,#C77DFF,#7B5BFF,#34E0FF)', WebkitBackgroundClip: 'text',
      backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 2px 8px rgba(120,90,255,.55))',
    }}>noun</span>
  </h1>
);

/* ------------------------------ Header ------------------------------ */
export const TreyHeader: React.FC<{ coins?: number; gems?: number }> = ({ coins = 12450, gems = 255 }) => (
  <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#06060f]/85 backdrop-blur-xl border-b border-white/5">
    <div className="relative">
      <div className="text-2xl font-black tracking-tight pr-5 pl-1"
        style={{ clipPath: 'polygon(0 0,100% 0,86% 100%,0% 100%)', background: 'linear-gradient(120deg,rgba(120,80,255,.18),transparent)' }}>
        <span className="text-white">TREY</span>
        <span style={{ color: NEON.cyan }}>TV</span>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-black/50 border border-yellow-500/40 rounded-full pl-1 pr-3 py-1 shadow-[0_0_12px_rgba(255,184,0,.2)]">
        <span className="w-5 h-5 rounded-full bg-gradient-to-b from-yellow-300 to-amber-600 text-black text-[11px] font-black flex items-center justify-center">T</span>
        <span className="text-sm font-bold text-yellow-300">{coins.toLocaleString()}</span>
        <span className="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs leading-none">+</span>
      </div>
      <div className="flex items-center gap-1.5 bg-black/50 border border-fuchsia-500/40 rounded-full pl-2 pr-3 py-1 shadow-[0_0_12px_rgba(255,0,229,.2)]">
        <span className="text-fuchsia-400 text-sm rotate-45 inline-block w-3 h-3 bg-fuchsia-500 rounded-sm" />
        <span className="text-sm font-bold text-fuchsia-200">{gems}</span>
        <span className="w-4 h-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs leading-none">+</span>
      </div>
      <button className="relative w-9 h-9 rounded-full bg-black/50 border border-white/10 flex items-center justify-center">
        <Bell className="w-4 h-4 text-white/70" />
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center">3</span>
      </button>
    </div>
  </header>
);

/* ---------------------------- Bottom Nav ---------------------------- */
export const TreyBottomNav: React.FC<{ active?: string; onHome?: () => void }> = ({ active = 'home', onHome }) => {
  const items = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'missions', label: 'MISSIONS', icon: Target },
    { id: 'shop', label: 'SHOP', icon: ShoppingBag },
    { id: 'rankings', label: 'RANKINGS', icon: BarChart3 },
    { id: 'profile', label: 'PROFILE', icon: User },
  ];
  return (
    <nav className="sticky bottom-0 z-30 flex items-center justify-around px-2 pt-2 pb-3 bg-[#06060f]/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl">
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={it.id === 'home' ? onHome : undefined} className="relative flex flex-col items-center gap-1 px-2 active:scale-90 transition">
            <Icon className="w-5 h-5" style={{ color: isActive ? NEON.gold : '#5B6478', filter: isActive ? 'drop-shadow(0 0 8px rgba(255,184,0,.7))' : 'none' }} />
            <span className="text-[10px] font-semibold tracking-wide" style={{ color: isActive ? NEON.gold : '#5B6478' }}>{it.label}</span>
            {it.id === 'missions' && <span className="absolute top-0 right-1.5 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_red]" />}
            {isActive && <span className="absolute -bottom-1.5 w-6 h-0.5 rounded-full bg-yellow-400" />}
          </button>
        );
      })}
    </nav>
  );
};

/* ------------------------- Glossy Primary Button ------------------------- */
export const GlossyButton: React.FC<{
  children: React.ReactNode; onClick?: () => void; className?: string;
  disabled?: boolean; tone?: 'primary' | 'gold' | 'danger';
}> = ({ children, onClick, className = '', disabled, tone = 'primary' }) => {
  const grad: Record<string, string> = {
    primary: 'linear-gradient(95deg,#B026FF 0%,#7C3AED 38%,#2E7DFF 68%,#19D3FF 100%)',
    gold: 'linear-gradient(95deg,#FFD54F,#FFB300,#FB8C00)',
    danger: 'linear-gradient(95deg,#FF3D6E,#FF6A3D,#FF9D3D)',
  };
  return (
    <button onClick={onClick} disabled={disabled}
      className={`trey-gloss relative overflow-hidden rounded-full font-black tracking-wide text-white transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
      style={{
        background: grad[tone],
        boxShadow: '0 0 0 2px rgba(255,200,90,.85), 0 0 28px rgba(150,80,255,.55), inset 0 -3px 8px rgba(0,0,0,.3)',
      }}>
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

/* ---------------------------- Ghost Button ---------------------------- */
export const GhostButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string; color?: string }> =
  ({ children, onClick, className = '', color = '#34E0FF' }) => (
    <button onClick={onClick}
      className={`rounded-full font-bold transition active:scale-95 flex items-center justify-center gap-2 ${className}`}
      style={{ background: `${color}14`, border: `1.5px solid ${color}66`, color, boxShadow: `0 0 16px ${color}22` }}>
      {children}
    </button>
  );

/* keep legacy NeonButton as alias */
export const NeonButton: React.FC<{
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'danger' | 'gold';
  className?: string; disabled?: boolean;
}> = ({ children, onClick, variant = 'primary', className = '', disabled }) => {
  if (variant === 'ghost') return <GhostButton onClick={onClick} className={className}>{children}</GhostButton>;
  if (variant === 'danger') return <GlossyButton onClick={onClick} className={className} disabled={disabled} tone="danger">{children}</GlossyButton>;
  if (variant === 'gold') return <GlossyButton onClick={onClick} className={className} disabled={disabled} tone="gold">{children}</GlossyButton>;
  return <GlossyButton onClick={onClick} className={className} disabled={disabled}>{children}</GlossyButton>;
};

/* ----------------------------- Glass Card ----------------------------- */
export const GlassCard: React.FC<{ children: React.ReactNode; className?: string; glow?: string; onClick?: () => void; style?: React.CSSProperties }> =
  ({ children, className = '', glow, onClick, style }) => (
    <div onClick={onClick}
      className={`trey-glass rounded-3xl ${onClick ? 'active:scale-[0.99] cursor-pointer' : ''} ${className}`}
      style={{ ...(glow ? { boxShadow: `0 0 0 1.5px ${glow}55, 0 0 26px ${glow}33, inset 0 1px 0 rgba(255,255,255,.12)` } : {}), ...style }}>
      {children}
    </div>
  );

/* ----------------------------- Neon Ring ----------------------------- */
export const NeonRing: React.FC<{
  value: number; max: number; color: string; label?: string; sub?: string; big: React.ReactNode; size?: number;
}> = ({ value, max, color, label, sub, big, size = 84 }) => {
  const r = size / 2 - 6;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="5" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dashoffset .5s' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
        {label && <span className="text-[8px] font-bold tracking-wider" style={{ color }}>{label}</span>}
        <span className="text-xl font-black text-white my-0.5">{big}</span>
        {sub && <span className="text-[8px] font-bold" style={{ color }}>{sub}</span>}
      </div>
    </div>
  );
};

/* ------------------------------- Meter ------------------------------- */
export const Meter: React.FC<{ value: number; max?: number; color: string; height?: string }> =
  ({ value, max = 100, color, height = 'h-3' }) => (
    <div className={`w-full rounded-full bg-black/60 border border-white/10 overflow-hidden ${height}`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color, boxShadow: `0 0 12px ${color}` }} />
    </div>
  );

/* ------------------------------ Stepper ------------------------------ */
export const Stepper: React.FC<{ step: number; labels: string[] }> = ({ step, labels }) => (
  <div className="flex items-center justify-center gap-1 trey-glass rounded-full px-2 py-2">
    {labels.map((l, i) => {
      const n = i + 1; const active = step === n; const done = step > n;
      return (
        <React.Fragment key={l}>
          <div className="flex items-center gap-1.5 px-1.5">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${active ? 'border-purple-400 text-white shadow-[0_0_12px_rgba(150,90,255,.7)]' : done ? 'border-cyan-400 text-cyan-300' : 'border-white/15 text-white/30'}`}
              style={active ? { background: 'rgba(150,90,255,.25)' } : {}}>{done ? '✓' : n}</span>
            <span className={`text-[11px] font-bold ${active ? 'text-white' : done ? 'text-cyan-300' : 'text-white/30'}`}>{l}</span>
          </div>
          {i < labels.length - 1 && <span className={`w-4 h-px ${done ? 'bg-cyan-400/60' : 'bg-white/10'}`} />}
        </React.Fragment>
      );
    })}
  </div>
);

/* ------------------------------ Confetti ------------------------------ */
export const Confetti: React.FC<{ count?: number }> = ({ count = 36 }) => {
  const colors = ['#FFD54F', '#FF4FD8', '#7C3AED', '#19D3FF', '#34E07F', '#FF7A3D'];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} className="trey-confetti" style={{
          left: `${(i * 97) % 100}%`,
          background: colors[i % colors.length],
          animationDuration: `${2.2 + (i % 5) * 0.5}s`,
          animationDelay: `${(i % 7) * 0.18}s`,
        }} />
      ))}
    </div>
  );
};

/* ----------------------------- Screen Wrap ----------------------------- */
export const ScreenWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-full flex flex-col bg-[#05050d] text-white overflow-hidden">
    <div className="pointer-events-none absolute inset-0"
      style={{
        background:
          'radial-gradient(circle at 50% -5%, rgba(120,70,220,0.35), transparent 45%), radial-gradient(circle at 12% 18%, rgba(160,40,255,0.22), transparent 40%), radial-gradient(circle at 88% 28%, rgba(0,180,255,0.16), transparent 42%), radial-gradient(circle at 50% 105%, rgba(255,0,200,0.14), transparent 45%)',
      }} />
    <div className="pointer-events-none absolute inset-0 opacity-[0.05]"
      style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.6) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
    <div className="relative z-10 flex-1 flex flex-col">{children}</div>
  </div>
);
