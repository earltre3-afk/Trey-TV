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
  xs: 'w-10 h-14 text-xs rounded-lg',
  sm: 'w-14 h-20 text-sm rounded-xl',
  md: 'w-20 h-28 text-xl rounded-2xl',
  lg: 'w-28 h-40 text-3xl rounded-2xl',
};

const EnergyIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 24 }) => {
  if (color === 'red') return <Flame size={size} className="text-red-300" strokeWidth={2.5} />;
  if (color === 'blue') return <Zap size={size} className="text-cyan-200" strokeWidth={2.5} fill="currentColor" />;
  if (color === 'green') return <RotateCw size={size} className="text-emerald-200" strokeWidth={2.5} />;
  if (color === 'yellow') return <Crown size={size} className="text-amber-200" strokeWidth={2.5} />;
  return <SpectrumSwirl size={size} />;
};

export const SpectrumSwirl: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" className="drop-shadow-[0_0_8px_rgba(255,0,128,0.8)]">
    <defs>
      <linearGradient id="spec" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#FF0080" />
        <stop offset="33%" stopColor="#9D4EDD" />
        <stop offset="66%" stopColor="#00D9FF" />
        <stop offset="100%" stopColor="#00FF88" />
      </linearGradient>
    </defs>
    <path d="M20 4 C28 4 36 12 36 20 C36 26 32 30 26 30 C22 30 18 26 18 22 C18 19 20 17 22 17"
      fill="none" stroke="url(#spec)" strokeWidth="3.5" strokeLinecap="round" />
    <circle cx="22" cy="17" r="2.5" fill="url(#spec)" />
  </svg>
);

const TrunoCard: React.FC<Props> = ({ card, size = 'md', playable, selected, faceDown, onClick, className = '' }) => {
  const style = COLOR_STYLES[card.color];

  if (faceDown) {
    return (
      <div
        onClick={onClick}
        className={`${sizeMap[size]} relative flex items-center justify-center overflow-hidden cursor-pointer
          bg-gradient-to-br from-zinc-900 via-purple-950 to-black border-2 border-fuchsia-500/40
          shadow-[0_0_20px_rgba(157,78,221,0.5)] ${className}`}
      >
        <div className="absolute inset-0 opacity-30" style={{
          background: 'radial-gradient(circle at center, rgba(255,0,128,0.4), transparent 70%)'
        }} />
        <SpectrumSwirl size={size === 'lg' ? 40 : size === 'md' ? 28 : 18} />
      </div>
    );
  }

  const renderSymbol = () => {
    if (card.symbol === 'number') return card.value;
    if (card.symbol === 'reverse') return <RotateCw className="w-1/2 h-1/2" strokeWidth={2.5} />;
    if (card.symbol === 'skip') return <Ban className="w-1/2 h-1/2" strokeWidth={2.5} />;
    if (card.symbol === 'draw_two') return '+2';
    if (card.symbol === 'wild_draw_four') return '+4';
    if (card.symbol === 'wild') return <SpectrumSwirl size={size === 'lg' ? 56 : 36} />;
    return card.label;
  };

  const isWild = card.color === 'black' || (card.color === 'purple' && card.symbol === 'wild_draw_four');

  return (
    <button
      onClick={onClick}
      className={`${sizeMap[size]} relative flex flex-col items-center justify-between p-2 overflow-hidden
        bg-gradient-to-br ${style.bg} border-2 ${style.border} ${style.glow}
        transition-all duration-200 cursor-pointer
        ${playable ? 'hover:-translate-y-3 hover:scale-105' : 'opacity-60 saturate-50'}
        ${selected ? '-translate-y-4 scale-110 ring-4 ring-white/60' : ''}
        ${className}`}
      style={{
        background: card.color === 'black'
          ? 'radial-gradient(circle at center, rgba(40,10,60,0.95), #000)'
          : undefined,
      }}
    >
      <div className={`self-start text-[0.6em] font-black ${style.text} leading-none`}>
        {card.symbol === 'number' ? card.value : card.symbol === 'draw_two' ? '+2' : card.symbol === 'wild_draw_four' ? '+4' : ''}
      </div>
      <div className={`flex-1 flex items-center justify-center font-black ${style.text} drop-shadow-[0_0_10px_currentColor]`}>
        {renderSymbol()}
      </div>
      <div className="self-end opacity-90">
        <EnergyIcon color={isWild ? 'black' : card.color} size={size === 'lg' ? 22 : size === 'md' ? 16 : 12} />
      </div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-white/10 via-transparent to-transparent" />
    </button>
  );
};

export default TrunoCard;
