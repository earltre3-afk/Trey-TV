import React from 'react';
import { TrunoCard as TCard, COLOR_STYLES } from '../lib/cards';
import { Flame, Zap, RotateCw, Ban, Crown } from 'lucide-react';

interface Props {
  card: TCard;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  playable?: boolean;
  selected?: boolean;
  faceDown?: boolean;
  onClick?: () => void;
  className?: string;
}

const sizeMap = {
  xs: 'w-10 h-14 text-xs rounded-lg border',
  sm: 'w-14 h-20 text-sm rounded-xl border-2',
  md: 'w-20 h-28 text-xl rounded-2xl border-2',
  lg: 'w-28 h-40 text-3xl rounded-3xl border-2',
};

const EnergyIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 24 }) => {
  if (color === 'red') return <Flame size={size} className="text-red-400 animate-pulse" strokeWidth={2.5} />;
  if (color === 'blue') return <Zap size={size} className="text-cyan-300 animate-bounce" strokeWidth={2.5} fill="currentColor" style={{ animationDuration: '3s' }} />;
  if (color === 'green') return <RotateCw size={size} className="text-emerald-300 animate-spin" strokeWidth={2.5} style={{ animationDuration: '6s' }} />;
  if (color === 'yellow') return <Crown size={size} className="text-amber-300" strokeWidth={2.5} />;
  return <SpectrumSwirl size={size} />;
};

export const SpectrumSwirl: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="drop-shadow-[0_0_10px_rgba(255,0,128,0.9)] animate-pulse">
    <defs>
      <linearGradient id="spec" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF0080" />
        <stop offset="33%" stopColor="#9D4EDD" />
        <stop offset="66%" stopColor="#00D9FF" />
        <stop offset="100%" stopColor="#00FF88" />
      </linearGradient>
    </defs>
    <path d="M20 4 C28 4 36 12 36 20 C36 26 32 30 26 30 C22 30 18 26 18 22 C18 19 20 17 22 17"
      fill="none" stroke="url(#spec)" strokeWidth="4" strokeLinecap="round" />
    <circle cx="22" cy="17" r="3" fill="url(#spec)" />
  </svg>
);

const TrunoCard: React.FC<Props> = ({ card, size = 'md', playable, selected, faceDown, onClick, className = '' }) => {
  const style = COLOR_STYLES[card.color];

  // Sheen & pulse keyframes embedded directly to keep component self-contained and bulletproof
  const styleTag = (
    <style>{`
      @keyframes truno-card-shine {
        0% { transform: translate(-100%, -100%) rotate(25deg); }
        50%, 100% { transform: translate(150%, 150%) rotate(25deg); }
      }
      @keyframes truno-face-down-pulse {
        0%, 100% { box-shadow: 0 0 15px rgba(157,78,221,0.4), inset 0 0 12px rgba(157,78,221,0.2); }
        50% { box-shadow: 0 0 25px rgba(157,78,221,0.7), inset 0 0 20px rgba(157,78,221,0.4); border-color: rgba(236,72,153,0.7); }
      }
      @keyframes truno-card-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-3px); }
      }
    `}</style>
  );

  if (faceDown) {
    return (
      <div
        onClick={onClick}
        className={`${sizeMap[size]} relative flex items-center justify-center overflow-hidden cursor-pointer
          bg-gradient-to-br from-zinc-950 via-purple-950 to-black border-purple-500/40
          transition-all duration-300 active:scale-95 group select-none ${className}`}
        style={{
          animation: 'truno-face-down-pulse 2.5s ease-in-out infinite',
        }}
      >
        {styleTag}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_center,_rgba(255,0,128,0.5),_transparent_70%)] group-hover:opacity-60 transition-opacity duration-300" />
        <div className="absolute top-0 left-0 w-[150%] h-[150%] bg-gradient-to-br from-white/0 via-white/5 to-white/0 pointer-events-none"
          style={{
            animationName: 'truno-card-shine',
            animationDuration: '4s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDelay: '1s'
          }} />
        <div className="transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12">
          <SpectrumSwirl size={size === 'lg' ? 44 : size === 'md' ? 32 : 20} />
        </div>
        {/* Intricate security background pattern */}
        <div className="absolute inset-1 border border-white/5 rounded-[inherit] pointer-events-none" />
      </div>
    );
  }

  const renderSymbol = () => {
    if (card.symbol === 'number') return card.value;
    if (card.symbol === 'reverse') return <RotateCw className="w-1/2 h-1/2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" strokeWidth={3} />;
    if (card.symbol === 'skip') return <Ban className="w-1/2 h-1/2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]" strokeWidth={3} />;
    if (card.symbol === 'draw_two') return '+2';
    if (card.symbol === 'wild_draw_four') return '+4';
    if (card.symbol === 'wild') return <SpectrumSwirl size={size === 'lg' ? 60 : 38} />;
    return card.label;
  };

  const isWild = card.color === 'black' || (card.color === 'purple' && card.symbol === 'wild_draw_four');

  return (
    <button
      onClick={onClick}
      className={`${sizeMap[size]} relative flex flex-col items-center justify-between p-2 sm:p-2.5 overflow-hidden
        bg-gradient-to-br ${style.bg} ${style.border} ${style.glow}
        transition-all duration-300 cursor-pointer select-none outline-none group
        ${playable ? 'hover:-translate-y-4 hover:scale-[1.06] hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] focus:scale-[1.06]' : 'opacity-50 saturate-75 cursor-not-allowed'}
        ${selected ? '-translate-y-6 scale-[1.12] ring-2 ring-white shadow-[0_20px_35px_rgba(0,0,0,0.7)] z-50' : ''}
        ${className}`}
      style={{
        background: card.color === 'black'
          ? 'radial-gradient(circle at center, rgba(35,5,55,0.95), #050409)'
          : undefined,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {styleTag}

      {/* 3D Glass Reflection Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/0 via-white/8 to-white/0 opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Laser Diagonal Sheen Sweep */}
      {playable && (
        <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-gradient-to-br from-white/0 via-white/12 to-white/0 pointer-events-none"
          style={{
            animation: 'truno-card-shine 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
          }} />
      )}

      {/* Top Left Symbol Mini */}
      <div className={`self-start text-[0.6em] font-black tracking-tighter ${style.text} leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.4)]`}>
        {card.symbol === 'number' ? card.value : card.symbol === 'draw_two' ? '+2' : card.symbol === 'wild_draw_four' ? '+4' : ''}
      </div>

      {/* Main Center Symbol */}
      <div className={`flex-1 flex items-center justify-center font-black ${style.text} drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-center scale-100 group-hover:scale-105 transition-transform duration-300`}>
        {renderSymbol()}
      </div>

      {/* Bottom Right Energy Pill Icon */}
      <div className="self-end opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
        <EnergyIcon color={isWild ? 'black' : card.color} size={size === 'lg' ? 24 : size === 'md' ? 18 : 14} />
      </div>

      {/* Dual Bezel Inset Border */}
      <div className="absolute inset-0.5 border border-white/5 rounded-[inherit] pointer-events-none" />
      <div className="absolute inset-1 border border-black/10 rounded-[inherit] pointer-events-none" />
    </button>
  );
};

export default TrunoCard;
