import React from 'react';
import { Sparkles, Bell, ChevronRight, Play, Pause, MoreHorizontal, Check, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { IMG } from './data';
import { TradioImage } from './NoCoverVisualizer';
import aiBallCutout from '@/tradio/assets/ai-ball.png';

// ─── TRADIO LOGO ─────────────────────────────────────────
export const TradioLogo: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <div className={`font-black tracking-[0.22em] ${size === 'sm' ? 'text-lg' : 'text-2xl'}`}>
    <span className="bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]">
      TRA
    </span>
    <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]">
      D
    </span>
    <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(168,85,247,0.25)]">
      IO
    </span>
  </div>
);

// ─── GLASS CARD ──────────────────────────────────────────
export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement> & { glow?: boolean }> = ({
  className = '',
  glow = false,
  children,
  ...rest
}) => (
  <div
    className={`relative rounded-3xl border-[0.5px] border-white/[0.08] bg-gradient-to-b from-white/[0.07] to-white/[0.01] backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.1),inset_0_-1px_0_rgba(255,255,255,0.02)] transition-all duration-500 hover:border-white/18 hover:bg-white/[0.12] hover:-translate-y-[1px] hover:shadow-[0_30px_60px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.15)] ${
      glow ? 'shadow-[0_0_40px_rgba(168,85,247,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(168,85,247,0.22),inset_0_1px_1.5px_rgba(255,255,255,0.3)] hover:border-purple-500/25' : ''
    } ${className}`}
    {...rest}
  >
    <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/0 via-transparent to-cyan-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" />
    </div>
    <div className="relative">{children}</div>
  </div>
);

// ─── BUTTONS ─────────────────────────────────────────────
export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <button
    className={`relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_15px_30px_rgba(168,85,247,0.3)] border border-white/10 transition-all duration-500 hover:shadow-[0_20px_45px_rgba(168,85,247,0.45)] hover:scale-[1.03] hover:-translate-y-[1px] active:scale-95 hover:brightness-105 group overflow-hidden ${className}`}
    {...rest}
  >
    {/* High-fidelity sweeping gloss sheen */}
    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
    <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25), transparent)'}} />
    <span className="relative flex items-center justify-center gap-2">{children}</span>
  </button>
);

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className = '',
  children,
  ...rest
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-full border-[0.5px] border-white/[0.08] bg-white/[0.04] px-5 py-3 text-sm font-bold uppercase tracking-wider text-white backdrop-blur-xl transition-all duration-500 hover:border-white/18 hover:bg-white/[0.08] hover:-translate-y-[1px] hover:shadow-[0_15px_30px_rgba(0,0,0,0.4)] active:scale-95 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

export const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }
> = ({ className = '', active, children, ...rest }) => (
  <button
    className={`inline-flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-500 backdrop-blur-lg ${
      active
        ? 'border-purple-400/40 bg-gradient-to-br from-purple-500/20 to-purple-500/5 text-purple-100 shadow-[0_0_25px_-5px_rgba(176,38,255,0.35)]'
        : 'border-white/[0.08] bg-white/[0.03] text-white/80 hover:border-white/18 hover:bg-white/[0.08] hover:scale-105'
    } active:scale-95 ${className}`}
    {...rest}
  >
    {children}
  </button>
);

// ─── AI PILL ─────────────────────────────────────────────
export const AIPill: React.FC<{ label?: string; onClick?: () => void }> = ({ label = 'AI', onClick }) => (
  <button
    onClick={onClick}
    className="group relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center select-none active:scale-95 transition-all duration-300"
  >
    {/* Soft pulsing aura */}
    <span className="absolute inset-0 rounded-full bg-purple-500/25 blur-lg animate-pulse-orb-slow" />

    {/* The ball */}
    <div className="relative h-10 w-10 sm:h-11 sm:w-11">
      <img
        src={aiBallCutout}
        alt="Prescription Radio"
        className="h-full w-full object-contain pointer-events-none [filter:drop-shadow(0_0_8px_rgba(176,38,255,0.55))] transition-transform duration-700 animate-slow-spin group-hover:scale-110 group-hover:animate-orb-spin"
      />
    </div>
  </button>
);

// ─── CHIP / PILL ─────────────────────────────────────────
export const Chip: React.FC<{
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
}> = ({ label, selected, onClick, icon }) => (
  <button
    onClick={onClick}
    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border-[0.5px] px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all duration-300 ${
      selected
        ? 'border-purple-500 bg-purple-500/15 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)]'
        : 'border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.01] text-white/75 hover:border-white/20 hover:bg-white/[0.05]'
    }`}
  >
    {icon}
    {label}
  </button>
);

// ─── HEADER ──────────────────────────────────────────────
export const TopBar: React.FC<{ showBack?: boolean; onBack?: () => void; centerLogo?: boolean; title?: string; onProfileClick?: () => void }> = ({
  showBack,
  onBack,
  centerLogo,
  title,
  onProfileClick,
}) => (
  <div className="flex items-center justify-between px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-3 animate-fade-in sm:px-6 lg:px-10">
    {showBack ? (
      <button
        onClick={onBack}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-gradient-to-br from-white/10 to-white/3 text-white backdrop-blur-lg hover:border-white/20 transition-all duration-300"
        aria-label="Back"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    ) : (
      <TradioLogo />
    )}
    {centerLogo && <TradioLogo size="sm" />}
    {title && !centerLogo && (
      <div className="min-w-0 flex-1 px-4 text-center">
        <div className="truncate text-sm font-bold uppercase tracking-[0.18em] text-white/70">{title}</div>
      </div>
    )}
    <div className="flex items-center gap-3">
      <AIPill />
      <img
        onClick={onProfileClick}
        src={IMG.jordan}
        alt="profile"
        className={`h-11 w-11 rounded-full border border-white/30 object-cover ring-2 ring-purple-500/40 shadow-[0_0_20px_-5px_rgba(176,38,255,0.3)] ${
          onProfileClick ? 'cursor-pointer transition-transform active:scale-95 hover:scale-105' : ''
        }`}
      />
    </div>
  </div>
);

// ─── WAVEFORM ────────────────────────────────────────────
export const Waveform: React.FC<{ className?: string; bars?: number; color?: string }> = ({
  className = '',
  bars = 28,
  color = 'from-fuchsia-400 to-purple-500',
}) => (
  <div className={`flex items-end gap-[2px] ${className}`}>
    {Array.from({ length: bars }).map((_, i) => {
      const h = 20 + Math.abs(Math.sin(i * 0.7)) * 80;
      return (
        <div
          key={i}
          className={`w-[2px] rounded-full bg-gradient-to-t ${color}`}
          style={{ height: `${h}%`, opacity: 0.4 + (i / bars) * 0.6 }}
        />
      );
    })}
  </div>
);

// ─── SECTION HEADER ──────────────────────────────────────
export const SectionHeader: React.FC<{ title: string; onSeeAll?: () => void }> = ({
  title,
  onSeeAll,
}) => (
  <div className="mb-4 flex items-center justify-between px-4 sm:px-6 lg:px-10">
    <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
    {onSeeAll && (
      <button onClick={onSeeAll} className="flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200">
        See All <ChevronRight className="h-4 w-4" />
      </button>
    )}
  </div>
);

// ─── VERIFIED BADGE ──────────────────────────────────────
export const VerifiedBadge: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" className={`h-4 w-4 text-purple-400 ${className}`} fill="currentColor">
    <path d="M12 2l2.39 2.39 3.39-.39.61 3.39L21 9l-1.61 3 1.61 3-2.61 1.61-.61 3.39-3.39-.39L12 22l-2.39-2.39-3.39.39-.61-3.39L3 15l1.61-3L3 9l2.61-1.61.61-3.39 3.39.39L12 2z" />
    <path d="M9.5 12l2 2 3.5-4" stroke="#0A0A0F" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ─── PLAY BUTTON CIRCLE ─────────────────────────────────
export const PlayCircle: React.FC<{ size?: number; onClick?: (event?: React.MouseEvent | React.KeyboardEvent) => void; gradient?: boolean }> = ({
  size = 48,
  onClick,
  gradient,
}) => (
  <span
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={(event) => onClick?.(event)}
    onKeyDown={(event) => {
      if (!onClick) return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onClick(event);
      }
    }}
    style={{ width: size, height: size }}
    className={`flex items-center justify-center rounded-full transition-all duration-500 ${
      gradient
        ? 'bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)]'
        : 'border border-white/20 bg-white/[0.07] backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] hover:border-white/35 hover:bg-white/[0.12] hover:shadow-[0_10px_25px_rgba(0,0,0,0.3)]'
    } text-white hover:scale-110 active:scale-95 group`}
  >
    <Play className="h-1/2 w-1/2 fill-white translate-x-[1px]" />
  </span>
);

// ─── TOGGLE ──────────────────────────────────────────────
export const Toggle: React.FC<{ on: boolean; onChange: (v: boolean) => void }> = ({ on, onChange }) => (
  <button
    onClick={() => onChange(!on)}
    className={`relative h-7 w-12 rounded-full transition ${
      on ? 'bg-gradient-to-r from-fuchsia-500 to-purple-500' : 'bg-white/10'
    }`}
  >
    <span
      className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md transition ${
        on ? 'left-[22px]' : 'left-0.5'
      }`}
    />
  </button>
);

// ─── EQ ICON ─────────────────────────────────────────────
export const EqIcon: React.FC<{ className?: string; isPlaying?: boolean }> = ({ className = '', isPlaying = false }) => (
  <div className={`flex items-end gap-[2px] ${className}`}>
    {[40, 80, 50, 90, 30, 70].map((h, i) => {
      const dur = 0.5 + (i * 0.12) % 0.6;
      const delay = (i * 0.08) % 0.4;
      return (
        <span
          key={i}
          className={`w-[2px] rounded-full bg-purple-400 transform-gpu transition-all duration-300 ${
            isPlaying ? 'animate-eq-bounce' : ''
          }`}
          style={{
            height: `${h}%`,
            animationDuration: isPlaying ? `${dur}s` : undefined,
            animationDelay: isPlaying ? `${delay}s` : undefined,
            transformOrigin: 'bottom',
          }}
        />
      );
    })}
  </div>
);

// ─── STATION CARD COMPONENT ──────────────────────────────
export const StationCard: React.FC<{
  title: string;
  genre: string;
  image: string;
  isPlaying?: boolean;
  onClick?: () => void;
}> = ({ title, genre, image, isPlaying, onClick }) => (
  <button
    onClick={onClick}
    className="group w-[160px] shrink-0 text-left transition-transform duration-300 hover:scale-105 active:scale-95"
  >
    <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10">
      <TradioImage
        src={image}
        title={title}
        artist={genre}
        isPlaying={isPlaying}
        fallbackSize="card"
        className="h-full w-full object-cover"
        imgClassName="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <span className="absolute bottom-2 right-2"><PlayCircle size={36} /></span>
      {isPlaying && <Waveform className="absolute bottom-2 left-2 h-3 w-12 opacity-100" bars={10} />}
    </div>
    <div className="mt-2 truncate text-sm font-semibold text-white">{title}</div>
    <div className="truncate text-[11px] text-white/55">{genre}</div>
  </button>
);

// ─── ARTIST CARD ─────────────────────────────────────────
export const ArtistCard: React.FC<{
  name: string;
  avatar: string;
  verified?: boolean;
  subtitle?: string;
  onClick?: () => void;
}> = ({ name, avatar, verified, subtitle, onClick }) => (
  <GlassCard onClick={onClick} className="flex items-center gap-3 p-2.5 pr-3 transition-all duration-300 hover:border-white/20 cursor-pointer">
    <img src={avatar} alt={name} className="h-12 w-12 rounded-full border border-purple-400/40 object-cover" />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-1 truncate text-left text-sm font-semibold text-white">
        {name} {verified && <VerifiedBadge />}
      </div>
      <div className="text-[11px] text-white/55">{subtitle || 'Artist'}</div>
    </div>
    <PlayCircle size={32} onClick={(e) => { e?.stopPropagation(); onClick?.(); }} />
  </GlassCard>
);

// ─── SONG ROW / TRACK LIST ITEM ──────────────────────────
export const SongRow: React.FC<{
  rank?: number;
  title: string;
  artist: string;
  duration?: string;
  artwork?: string;
  isPlaying?: boolean;
  trending?: string;
  onClick?: () => void;
}> = ({ rank, title, artist, duration, artwork, isPlaying, trending, onClick }) => (
  <button
    onClick={onClick}
    className="group flex w-full items-center gap-3 rounded-lg border border-white/5 bg-gradient-to-r from-white/[0.03] to-transparent px-3 py-2.5 transition-all duration-300 hover:border-white/10 hover:bg-gradient-to-r hover:from-white/[0.06] hover:to-transparent active:scale-95"
  >
    {rank && <span className="text-sm font-bold text-purple-300/80">{rank}</span>}
    {artwork && (
      <TradioImage
        src={artwork}
        title={title}
        artist={artist}
        isPlaying={isPlaying}
        fallbackSize="mini"
        className="h-10 w-10 rounded object-cover"
        imgClassName="h-10 w-10 rounded object-cover"
      />
    )}
    <div className="min-w-0 flex-1 text-left">
      <div className="flex items-center gap-2 truncate text-sm font-semibold text-white">
        {title}
        {isPlaying && <Waveform className="h-2.5 w-4" bars={5} />}
      </div>
      <div className="truncate text-[11px] text-white/55">{artist}</div>
    </div>
    {trending && <span className="text-xs text-emerald-400 font-semibold">{trending}</span>}
    {duration && <span className="text-[11px] text-white/40">{duration}</span>}
    <PlayCircle size={32} gradient={isPlaying} />
  </button>
);

// ─── STAT CARD (for Studio/Analytics) ─────────────────
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
}> = ({ label, value, icon, trend }) => (
  <GlassCard className="flex flex-col gap-2 p-4">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{label}</span>
      {icon && <div className="text-purple-400">{icon}</div>}
    </div>
    <div className="text-2xl font-black text-white">{value}</div>
    {trend && (
      <div className={`text-xs font-semibold flex items-center gap-1 ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {trend.isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {trend.value}%
      </div>
    )}
  </GlassCard>
);

// ─── EMPTY STATE ─────────────────────────────────────────
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent px-6 py-16 text-center">
    {icon && <div className="text-4xl text-purple-400/60">{icon}</div>}
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {description && <p className="text-sm text-white/60">{description}</p>}
    {action && (
      <PrimaryButton onClick={action.onClick} className="mt-2">
        {action.label}
      </PrimaryButton>
    )}
  </div>
);

// ─── LOADING SKELETON ─────────────────────────────────────
export const LoadingSkeleton: React.FC<{ count?: number; variant?: 'card' | 'row' }> = ({ count = 4, variant = 'card' }) => (
  <div className={`space-y-3 ${variant === 'card' ? 'grid gap-3 grid-cols-2 sm:grid-cols-3' : ''}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`rounded-xl border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent animate-pulse ${variant === 'card' ? 'aspect-square' : 'h-14'}`} />
    ))}
  </div>
);

// ─── MOOD CHIP / FILTER CHIP ─────────────────────────────
export const MoodChip: React.FC<{
  label: string;
  emoji?: string;
  selected?: boolean;
  onClick?: () => void;
}> = ({ label, emoji, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 shrink-0 rounded-full border px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
      selected
        ? 'border-purple-400/50 bg-gradient-to-r from-purple-500/25 to-purple-500/10 text-white shadow-[0_0_30px_-8px_rgba(176,38,255,0.5)]'
        : 'border-white/10 bg-gradient-to-br from-white/8 to-white/2 text-white/75 hover:border-white/15 hover:bg-gradient-to-br hover:from-white/12 hover:to-white/5'
    }`}
  >
    {emoji && <span>{emoji}</span>}
    {label}
  </button>
);

// ─── SEGMENTED TABS ──────────────────────────────────────
export const SegmentedTabs: React.FC<{
  tabs: { id: string; label: string; count?: number }[];
  active?: string;
  activeTab?: string;
  onChange?: (id: string) => void;
  onTabChange?: (id: string) => void;
}> = ({ tabs, active, activeTab, onChange, onTabChange }) => (
  <div className="inline-flex rounded-full border border-white/[0.05] bg-black/40 p-1 backdrop-blur-xl shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => (onChange ?? onTabChange)?.(tab.id)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
          (active ?? activeTab) === tab.id
            ? 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 text-white shadow-[0_4px_15px_rgba(168,85,247,0.35)]'
            : 'text-white/60 hover:text-white/90'
        }`}
      >
        {tab.label}
        {typeof tab.count === 'number' && (
          <span className="ml-2 rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">{tab.count}</span>
        )}
      </button>
    ))}
  </div>
);

// ─── COMMUNITY MESSAGE BUBBLE ──────────────────────────
export const CommunityBubble: React.FC<{
  author: string;
  avatar: string;
  message: string;
  timestamp: string;
  verified?: boolean;
}> = ({ author, avatar, message, timestamp, verified }) => (
  <GlassCard className="p-3 space-y-2">
    <div className="flex items-center gap-2">
      <img src={avatar} alt={author} className="h-8 w-8 rounded-full border border-white/20" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-semibold text-white truncate">{author}</span>
          {verified && <VerifiedBadge className="h-3 w-3" />}
        </div>
        <span className="text-[10px] text-white/40">{timestamp}</span>
      </div>
    </div>
    <p className="text-sm text-white/90 leading-relaxed">{message}</p>
  </GlassCard>
);

// ─── POLL CARD ────────────────────────────────────────────
export const PollCard: React.FC<{
  question: string;
  options: { id: string; text: string; votes: number }[];
  totalVotes: number;
  endsIn?: string;
  onVote?: (id: string) => void;
}> = ({ question, options, totalVotes, endsIn, onVote }) => (
  <GlassCard className="space-y-4 p-4">
    <div>
      <h4 className="font-semibold text-white">{question}</h4>
      {endsIn && <p className="mt-1 text-xs text-white/40">Ends in {endsIn}</p>}
    </div>
    <div className="space-y-2">
      {options.map((opt) => {
        const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
        return (
          <button
            key={opt.id}
            onClick={() => onVote?.(opt.id)}
            className="group relative w-full overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r from-white/[0.03] to-transparent p-3 text-left transition-all duration-300 hover:border-white/20"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent transition-all duration-300 group-hover:from-purple-500/20"
              style={{ width: `${percent}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="font-medium text-white">{opt.text}</span>
              <span className="text-sm font-semibold text-purple-300">{percent}%</span>
            </div>
          </button>
        );
      })}
    </div>
  </GlassCard>
);

// ─── VOICE DROP CARD ──────────────────────────────────────
export const VoiceDropCard: React.FC<{
  artist: string;
  avatar: string;
  text: string;
  duration: number;
  isPlaying?: boolean;
  onPlay?: () => void;
}> = ({ artist, avatar, text, duration, isPlaying, onPlay }) => (
  <GlassCard className="space-y-3 p-4">
    <div className="flex items-center gap-3">
      <img src={avatar} alt={artist} className="h-10 w-10 rounded-full border border-purple-400/40 object-cover" />
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-white truncate">{artist}</div>
        <div className="text-[11px] text-white/55">Voice Message</div>
      </div>
    </div>
    <p className="text-sm text-white/80 leading-relaxed">{text}</p>
    <div className="flex items-center gap-3">
      <button
        onClick={onPlay}
        className={`flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
          isPlaying
            ? 'bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white shadow-lg'
            : 'border border-white/15 bg-white/5 text-white/70 hover:border-white/25'
        }`}
      >
        {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
      </button>
      <div className="flex-1">
        <div className="h-1 rounded-full bg-white/10">
          <div className="h-1 w-1/3 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-500" />
        </div>
      </div>
      <span className="text-xs font-semibold text-white/60">{duration.toFixed(1)}s</span>
    </div>
  </GlassCard>
);

// ─── SCHEDULE TIMELINE ITEM ──────────────────────────────
export const ScheduleItem: React.FC<{
  title: string;
  artist?: string;
  type: 'premiere' | 'dj-show' | 'producer-spotlight' | 'fan-request' | 'replay' | 'sponsored' | 'live' | 'block';
  startTime: string;
  endTime?: string;
  image?: string;
  description?: string;
  onSave?: () => void;
}> = ({ title, artist, type, startTime, endTime, image, description, onSave }) => {
  const typeColors = {
    premiere: 'from-cyan-500/15 to-cyan-500/5 border-cyan-400/30',
    'dj-show': 'from-fuchsia-500/15 to-fuchsia-500/5 border-fuchsia-400/30',
    'producer-spotlight': 'from-amber-500/15 to-amber-500/5 border-amber-400/30',
    'fan-request': 'from-purple-500/15 to-purple-500/5 border-purple-400/30',
    replay: 'from-blue-500/15 to-blue-500/5 border-blue-400/30',
    sponsored: 'from-emerald-500/15 to-emerald-500/5 border-emerald-400/30',
    live: 'from-red-500/15 to-red-500/5 border-red-400/30',
    block: 'from-purple-500/15 to-purple-500/5 border-purple-400/30',
  };
  const typeBadgeColors = {
    premiere: 'text-cyan-300 bg-cyan-400/15',
    'dj-show': 'text-fuchsia-300 bg-fuchsia-400/15',
    'producer-spotlight': 'text-amber-300 bg-amber-400/15',
    'fan-request': 'text-purple-300 bg-purple-400/15',
    replay: 'text-blue-300 bg-blue-400/15',
    sponsored: 'text-emerald-300 bg-emerald-400/15',
    live: 'text-red-300 bg-red-400/15',
    block: 'text-purple-300 bg-purple-400/15',
  };

  return (
    <GlassCard className={`bg-gradient-to-br ${typeColors[type]} border border-white/10 space-y-3 p-4`}>
      <div className="flex items-start gap-3">
        {image && <img src={image} alt={title} className="h-12 w-12 rounded-lg object-cover flex-shrink-0" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 gap-y-1 flex-wrap">
            <h4 className="font-semibold text-white">{title}</h4>
            <span className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${typeBadgeColors[type]}`}>
              {type}
            </span>
          </div>
          {artist && <p className="text-sm text-white/70 mt-0.5">{artist}</p>}
          <div className="mt-2 flex items-center gap-2 text-xs text-white/60">
            <Clock className="h-3 w-3" />
            {startTime}
            {endTime && <> - {endTime}</>}
          </div>
        </div>
        <IconButton onClick={onSave} className="flex-shrink-0">
          <Bell className="h-5 w-5" />
        </IconButton>
      </div>
      {description && <p className="text-sm text-white/70 leading-relaxed">{description}</p>}
    </GlassCard>
  );
};

// ─── RELEASE CARD ──────────────────────────────────────────
export const ReleaseCard: React.FC<{
  title: string;
  artist: string;
  artwork: string;
  releasedAt: string;
  streams?: number;
  onClick?: () => void;
}> = ({ title, artist, artwork, releasedAt, streams, onClick }) => (
  <GlassCard onClick={onClick} className="flex items-center gap-3 p-2.5 transition-all duration-300 hover:border-white/20 cursor-pointer">
    <TradioImage
      src={artwork}
      title={title}
      artist={artist}
      isPlaying={false}
      fallbackSize="mini"
      className="h-14 w-14 rounded-lg object-cover"
      imgClassName="h-14 w-14 rounded-lg object-cover"
    />
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        {title}
        <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-cyan-300">
          NEW
        </span>
      </div>
      <div className="truncate text-[11px] text-white/55">{artist}</div>
      <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
        {streams && <span>{(streams / 1000).toFixed(1)}K plays</span>}
        <span>{releasedAt}</span>
      </div>
    </div>
    <PlayCircle size={32} />
  </GlassCard>
);

// ─── ROLE INDICATOR ────────────────────────────────────────
export const RoleIndicator: React.FC<{ role: string; size?: 'sm' | 'md' }> = ({ role, size = 'md' }) => {
  const roleColors: Record<string, string> = {
    fan: 'from-cyan-400/20 to-cyan-400/5 text-cyan-200 border-cyan-400/30',
    artist: 'from-fuchsia-400/20 to-fuchsia-400/5 text-fuchsia-200 border-fuchsia-400/30',
    producer: 'from-purple-400/20 to-purple-400/5 text-purple-200 border-purple-400/30',
    dj: 'from-amber-400/20 to-amber-400/5 text-amber-200 border-amber-400/30',
  };
  const color = roleColors[role] || roleColors.fan;
  const sizeClass = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <span className={`inline-flex items-center rounded-full border bg-gradient-to-r font-semibold ${sizeClass} ${color}`}>
      {role.charAt(0).toUpperCase() + role.slice(1)} Mode
    </span>
  );
};

// ─── BEAT CARD ────────────────────────────────────────────
export const BeatCard: React.FC<{
  title: string;
  producerName: string;
  producerAvatar: string;
  artwork: string;
  bpm: number;
  musicalKey: string;
  mood: string[];
  plays: number;
  onClick?: () => void;
}> = ({ title, producerName, producerAvatar, artwork, bpm, musicalKey, mood, plays, onClick }) => (
  <GlassCard onClick={onClick} className="flex flex-col gap-3 p-3 transition-all duration-300 hover:border-white/20 cursor-pointer group">
    <div className="relative overflow-hidden rounded-lg">
      <TradioImage
        src={artwork}
        title={title}
        artist={producerName}
        isPlaying={false}
        fallbackSize="card"
        className="aspect-square w-full object-cover group-hover:scale-110 transition-transform duration-300"
        imgClassName="aspect-square w-full object-cover group-hover:scale-110 transition-transform duration-300"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="absolute bottom-2 left-2 flex gap-1.5">
        <span className="rounded bg-purple-500/80 px-2 py-1 text-[10px] font-bold text-white">{bpm} BPM</span>
        <span className="rounded bg-cyan-500/80 px-2 py-1 text-[10px] font-bold text-white">{musicalKey}</span>
      </div>
      <button className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-500 text-white shadow-lg hover:scale-110 transition-transform">
        <Play className="h-4 w-4 fill-white" />
      </button>
    </div>
    <div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="mt-1 flex items-center gap-1.5">
        <img src={producerAvatar} alt={producerName} className="h-5 w-5 rounded-full border border-white/20" />
        <span className="text-[11px] text-white/70">{producerName}</span>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {mood.map((m) => (
          <span key={m} className="text-[10px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded">
            {m}
          </span>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-white/50">{(plays / 1000).toFixed(1)}K plays</div>
    </div>
  </GlassCard>
);

// ─── SHOW SEGMENT CARD ────────────────────────────────────
export const SegmentCard: React.FC<{
  type: string;
  title: string;
  duration: number;
  description?: string;
  hostNotes?: string;
  aiGenerated?: boolean;
}> = ({ type, title, duration, description, hostNotes, aiGenerated }) => {
  const typeColors: Record<string, string> = {
    intro: 'from-blue-500/15 to-blue-500/5 border-blue-400/30',
    'music-block': 'from-purple-500/15 to-purple-500/5 border-purple-400/30',
    'host-talk': 'from-pink-500/15 to-pink-500/5 border-pink-400/30',
    'fan-request': 'from-cyan-500/15 to-cyan-500/5 border-cyan-400/30',
    'producer-spotlight': 'from-amber-500/15 to-amber-500/5 border-amber-400/30',
    'artist-premiere': 'from-fuchsia-500/15 to-fuchsia-500/5 border-fuchsia-400/30',
    commercial: 'from-green-500/15 to-green-500/5 border-green-400/30',
    poll: 'from-orange-500/15 to-orange-500/5 border-orange-400/30',
    closing: 'from-indigo-500/15 to-indigo-500/5 border-indigo-400/30',
  };
  const color = typeColors[type] || typeColors['music-block'];

  return (
    <GlassCard className={`bg-gradient-to-br ${color} border border-white/10 space-y-2 p-4`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-white">{title}</h4>
            {aiGenerated && (
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                AI
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-white/60">{(duration / 60).toFixed(1)} min</p>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wide text-white/70">{type}</span>
      </div>
      {description && <p className="text-sm text-white/70">{description}</p>}
      {hostNotes && <p className="text-xs text-white/60 italic">{hostNotes}</p>}
    </GlassCard>
  );
};

// ─── SHOW TIMELINE PREVIEW ────────────────────────────────
export const ShowTimelinePreview: React.FC<{
  segments: { id: string; type: string; title: string; duration: number; description?: string; hostNotes?: string; aiGenerated?: boolean }[];
  totalDuration: number;
}> = ({ segments, totalDuration }) => (
  <GlassCard className="space-y-3 p-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">Show Timeline</h3>
      <span className="text-sm text-white/60">Total: {(totalDuration / 60).toFixed(0)} min</span>
    </div>
    <div className="space-y-2">
      {segments.map((seg) => (
        <div key={seg.id} className="flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500"
              style={{ width: `${(seg.duration / totalDuration) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-white/70">{(seg.duration / 60).toFixed(0)}m</span>
        </div>
      ))}
    </div>
  </GlassCard>
);

// ─── DJ CARD ────────────────────────────────────────────
export const DJCard: React.FC<{
  name: string;
  avatar: string;
  bio: string;
  followers: number;
  showCount: number;
  isLive?: boolean;
  onClick?: () => void;
}> = ({ name, avatar, bio, followers, showCount, isLive, onClick }) => (
  <GlassCard onClick={onClick} className="flex flex-col gap-3 p-4 transition-all duration-300 hover:border-white/20 cursor-pointer">
    <div className="flex items-start gap-3">
      <div className="relative">
        <img src={avatar} alt={name} className="h-16 w-16 rounded-lg border border-purple-400/40 object-cover" />
        {isLive && (
          <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-red-500 border-2 border-black/80 shadow-lg animate-pulse" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-white">{name}</h4>
        <p className="mt-1 text-xs text-white/60 line-clamp-2">{bio}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-2 text-center">
      <div className="rounded-lg bg-white/5 p-2">
        <div className="text-xs text-white/50">Followers</div>
        <div className="mt-1 font-bold text-white">{(followers / 1000).toFixed(0)}K</div>
      </div>
      <div className="rounded-lg bg-white/5 p-2">
        <div className="text-xs text-white/50">Shows</div>
        <div className="mt-1 font-bold text-white">{showCount}</div>
      </div>
    </div>
  </GlassCard>
);

// ─── PRODUCER CARD ────────────────────────────────────────
export const ProducerCard: React.FC<{
  name: string;
  avatar: string;
  bio: string;
  beatCount: number;
  followers: number;
  specialties: string[];
  onClick?: () => void;
}> = ({ name, avatar, bio, beatCount, followers, specialties, onClick }) => (
  <GlassCard onClick={onClick} className="flex flex-col gap-3 p-4 transition-all duration-300 hover:border-white/20 cursor-pointer">
    <div className="flex items-start gap-3">
      <img src={avatar} alt={name} className="h-14 w-14 rounded-full border border-purple-400/40 object-cover flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <h4 className="font-semibold text-white">{name}</h4>
        <p className="mt-1 text-xs text-white/60 line-clamp-2">{bio}</p>
      </div>
    </div>
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <div className="text-[11px] text-white/50">Beats</div>
          <div className="font-semibold text-white">{beatCount}</div>
        </div>
        <div>
          <div className="text-[11px] text-white/50">Followers</div>
          <div className="font-semibold text-white">{(followers / 1000).toFixed(0)}K</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {specialties.slice(0, 3).map((s) => (
          <span key={s} className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-1 rounded">
            {s}
          </span>
        ))}
      </div>
    </div>
  </GlassCard>
);
