import React from 'react';
import { CardDef, SUIT_DISPLAY, getCard } from '@/features/games/lib/cards/cardManifest';

interface TreyCardProps {
  cardId?: string;
  faceDown?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  selected?: boolean;
  playable?: boolean;
  dimmed?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const SIZE_MAP = {
  xs: { w: 42,  h: 62  },
  sm: { w: 58,  h: 86  },
  md: { w: 78,  h: 114 },
  lg: { w: 108, h: 158 },
};

/* ============================================================
   Premium Trey TV Card
   - Glossy gradient surface + holographic shimmer sweep
   - Suit-themed neon edges & corner ink
   - Face cards (J/Q/K) and Ace receive bespoke ornament
   - Card back: dark liquid-glass + OFFICIAL Trey TV brandmark
     rendered as SVG (no white box, fully transparent)
   ============================================================ */
export const TreyCard: React.FC<TreyCardProps> = ({
  cardId, faceDown, size = 'md', selected, playable, dimmed, onClick, className, style,
}) => {
  const dims = SIZE_MAP[size];
  const card: CardDef | null = cardId && !faceDown ? getCard(cardId) : null;
  const suitMeta = card ? SUIT_DISPLAY[card.suit] : null;

  const baseStyle: React.CSSProperties = {
    width: dims.w,
    height: dims.h,
    ...style,
  };

  /* ===== CARD BACK ===== */
  if (faceDown || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative rounded-xl overflow-hidden select-none transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
        style={{
          ...baseStyle,
          boxShadow: '0 8px 26px rgba(0,0,0,0.6), 0 0 26px rgba(0,183,255,0.22)',
        }}
      >
        <img
          src="/assets/games/cards/trey-tv-luxury/card-back.png"
          alt="Card back"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
        {/* holographic shimmer sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
          <div className="trey-card-shimmer absolute -inset-y-2 w-1/3"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)' }} />
        </div>
      </div>
    );
  }




  /* ===== CARD FACE — PNG ===== */
  const c = suitMeta!.color;
  const glow = suitMeta!.glow;

  const ring = selected
    ? `0 0 0 2px ${c}, 0 0 36px ${glow}, 0 10px 26px rgba(0,0,0,0.6)`
    : playable
      ? `0 0 22px ${glow}, 0 4px 16px rgba(0,0,0,0.55)`
      : `0 4px 16px rgba(0,0,0,0.55)`;

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden select-none transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-95' : ''} ${selected ? '-translate-y-3' : ''} ${dimmed ? 'opacity-35 saturate-50' : ''} ${className || ''}`}
      style={{ ...baseStyle, boxShadow: ring }}
    >
      <img
        src={card.assetPath}
        alt={`${card.rank} of ${card.suit}`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* selected breathing glow overlay */}
      {selected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none trey-card-breathe" style={{ color: c }} />
      )}

      {/* holographic shimmer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        <div className="trey-card-shimmer absolute -inset-y-2 w-1/3"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />
      </div>
    </div>
  );
};

