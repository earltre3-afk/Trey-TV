import React from 'react';
import { CardDef, SUIT_DISPLAY, getCard } from '@/features/games/lib/cards/cardManifest';
import { TreyBrandMark } from './TreyBrandMark';

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
  xs: { w: 42, h: 62,  rank: 'text-[9px]',  pip: 'text-[11px]', big: 16, mono: 11 },
  sm: { w: 58, h: 86,  rank: 'text-[11px]', pip: 'text-sm',     big: 22, mono: 13 },
  md: { w: 78, h: 114, rank: 'text-[13px]', pip: 'text-base',   big: 30, mono: 16 },
  lg: { w: 108, h: 158, rank: 'text-base',  pip: 'text-lg',     big: 42, mono: 22 },
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
    // Official Trey TV logo as the hero element. Size by card WIDTH so the
    // wordmark never spills past the edges. (logo aspect ≈ 1.7 : 1)
    const logoTargetWidth = dims.w * 0.78;
    const logoHeight = logoTargetWidth / 1.7;
    return (
      <div
        onClick={onClick}
        className={`relative rounded-xl overflow-hidden select-none transition-all duration-300 trey-card-gloss ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
        style={{
          ...baseStyle,
          background: `
            radial-gradient(ellipse at 30% 18%, rgba(0,183,255,0.22) 0%, transparent 55%),
            radial-gradient(ellipse at 75% 85%, rgba(168,85,247,0.20) 0%, transparent 58%),
            radial-gradient(ellipse at 50% 50%, rgba(255,200,87,0.06) 0%, transparent 70%),
            linear-gradient(160deg, #0c1633 0%, #050912 50%, #0b1230 100%)
          `,
          border: '1.5px solid transparent',
          backgroundClip: 'padding-box',
          boxShadow: '0 8px 26px rgba(0,0,0,0.6), 0 0 26px rgba(0,183,255,0.22), inset 0 0 28px rgba(0,183,255,0.08)',
        }}
      >
        {/* neon gradient border ring */}
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
          padding: 1.5,
          background: 'linear-gradient(135deg, rgba(0,183,255,0.85) 0%, rgba(168,85,247,0.6) 50%, rgba(255,200,87,0.65) 100%)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude',
        }} />
        {/* diagonal pattern texture */}
        <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="trey-diag" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="rgba(0,183,255,0.45)" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#trey-diag)" />
        </svg>
        {/* inner frame */}
        <div className="absolute inset-1.5 rounded-lg border pointer-events-none" style={{ borderColor: 'rgba(0,183,255,0.20)' }} />
        {/* corner accent dots */}
        <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full" style={{ background: '#00B7FF', boxShadow: '0 0 6px #00B7FF' }} />
        <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full" style={{ background: '#A855F7', boxShadow: '0 0 6px #A855F7' }} />
        <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full" style={{ background: '#A855F7', boxShadow: '0 0 6px #A855F7' }} />
        <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full" style={{ background: '#FFC857', boxShadow: '0 0 6px #FFC857' }} />

        {/* ===== OFFICIAL TREY TV LOGO — exact attached PNG, transparent ===== */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <TreyBrandMark size={logoHeight} glow />
        </div>

        {/* holographic shimmer sweep */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
          <div className="trey-card-shimmer absolute -inset-y-2 w-1/3"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.14), transparent)' }} />
        </div>
      </div>
    );
  }




  /* ===== CARD FACE ===== */
  const c = suitMeta!.color;
  const glow = suitMeta!.glow;
  const isFace = card.rank === 'J' || card.rank === 'Q' || card.rank === 'K';
  const isAce = card.rank === 'A';
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  const ring = selected
    ? `0 0 0 2px ${c}, 0 0 36px ${glow}, 0 10px 26px rgba(0,0,0,0.6)`
    : playable
      ? `0 0 22px ${glow}, 0 4px 16px rgba(0,0,0,0.55)`
      : `0 4px 16px rgba(0,0,0,0.55)`;

  // Center pip layout for numeric cards
  const pipCount = isAce ? 1 : isFace ? 0 : parseInt(card.rank, 10);

  return (
    <div
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden select-none trey-card-gloss transition-all duration-300 ${onClick ? 'cursor-pointer hover:-translate-y-1 active:scale-95' : ''} ${selected ? '-translate-y-3' : ''} ${dimmed ? 'opacity-35 saturate-50' : ''} ${className || ''}`}
      style={{
        ...baseStyle,
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 55%),
          linear-gradient(165deg, #0E1726 0%, #060912 55%, #0a1322 100%)
        `,
        border: '1.5px solid transparent',
        boxShadow: ring,
        color: c,
      }}
    >
      {/* neon gradient border ring */}
      <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
        padding: 1,
        background: `linear-gradient(135deg, ${c}cc, ${c}40 50%, ${c}aa)`,
        WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
        WebkitMaskComposite: 'xor', maskComposite: 'exclude',
      }} />

      {/* inner soft frame */}
      <div className="absolute inset-1.5 rounded-lg pointer-events-none" style={{
        border: `1px solid ${c}28`,
        background: `radial-gradient(ellipse at 50% 0%, ${c}10 0%, transparent 60%)`,
      }} />

      {/* corner indicator top-left */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-[1]" style={{ color: c, textShadow: `0 0 6px ${glow}` }}>
        <span className={`${dims.rank} font-black`}>{card.rank}</span>
        <span className={`${dims.rank} font-bold -mt-0.5`}>{suitMeta!.symbol}</span>
      </div>
      {/* corner bottom-right (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-[1] rotate-180" style={{ color: c, textShadow: `0 0 6px ${glow}` }}>
        <span className={`${dims.rank} font-black`}>{card.rank}</span>
        <span className={`${dims.rank} font-bold -mt-0.5`}>{suitMeta!.symbol}</span>
      </div>

      {/* CENTER artwork */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {isAce && (
          <div className="relative flex flex-col items-center">
            <div
              style={{
                fontSize: dims.big * 1.4,
                lineHeight: 1,
                color: c,
                textShadow: `0 0 18px ${glow}, 0 0 32px ${glow}`,
                filter: `drop-shadow(0 0 6px ${glow})`,
              }}
            >
              {suitMeta!.symbol}
            </div>
            <div
              className="font-black tracking-[0.3em] mt-0.5"
              style={{
                fontSize: dims.mono * 0.55,
                color: c,
                textShadow: `0 0 6px ${glow}`,
                fontFamily: "'Cinzel', serif",
              }}
            >
              ACE
            </div>
          </div>
        )}

        {isFace && (
          <FaceArt rank={card.rank as 'J'|'Q'|'K'} color={c} glow={glow} dims={dims} symbol={suitMeta!.symbol} />
        )}

        {!isAce && !isFace && (
          <PipGrid count={pipCount} color={c} glow={glow} symbol={suitMeta!.symbol} dims={dims} />
        )}
      </div>

      {/* T monogram watermark — only on face cards / ace, subtle bottom */}
      {(isFace || isAce) && (
        <div className="absolute bottom-1 left-0 right-0 text-center pointer-events-none"
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: dims.h * 0.11,
            lineHeight: 1,
            color: c,
            opacity: 0.55,
            textShadow: `0 0 6px ${glow}`,
          }}>
          T
        </div>
      )}

      {/* selected breathing glow overlay */}
      {selected && (
        <div className="absolute inset-0 rounded-xl pointer-events-none trey-card-breathe" style={{ color: c }} />
      )}

      {/* holographic shimmer (subtle on faces) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        <div className="trey-card-shimmer absolute -inset-y-2 w-1/3"
          style={{ background: `linear-gradient(90deg, transparent, ${isRed ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.08)'}, transparent)` }} />
      </div>
    </div>
  );
};

/* ============================================================
   Numeric pip grid — clean centered layout
   ============================================================ */
const PipGrid: React.FC<{ count: number; color: string; glow: string; symbol: string; dims: typeof SIZE_MAP['md'] }> =
({ count, color, glow, symbol, dims }) => {
  // Render up to 10 pips in a recognized layout
  const positions: Array<[number, number]> = layoutPips(count); // [colPct, rowPct] 0..1 inside center area
  return (
    <div className="relative" style={{ width: '70%', height: '78%' }}>
      {positions.map(([x, y], i) => (
        <span
          key={i}
          className="absolute font-bold"
          style={{
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            transform: `translate(-50%, -50%) ${y > 0.55 ? 'rotate(180deg)' : ''}`,
            color,
            fontSize: dims.pip === 'text-[11px]' ? 11 : dims.pip === 'text-sm' ? 14 : dims.pip === 'text-base' ? 18 : 22,
            textShadow: `0 0 6px ${glow}`,
            lineHeight: 1,
          }}
        >
          {symbol}
        </span>
      ))}
    </div>
  );
};

function layoutPips(n: number): Array<[number, number]> {
  // Classic playing-card pip layouts (column,row in 0..1 space)
  const L = 0.18, M = 0.5, R = 0.82;
  const T = 0.1, MT = 0.32, C = 0.5, MB = 0.68, B = 0.9;
  switch (n) {
    case 2:  return [[M,T],[M,B]];
    case 3:  return [[M,T],[M,C],[M,B]];
    case 4:  return [[L,T],[R,T],[L,B],[R,B]];
    case 5:  return [[L,T],[R,T],[M,C],[L,B],[R,B]];
    case 6:  return [[L,T],[R,T],[L,C],[R,C],[L,B],[R,B]];
    case 7:  return [[L,T],[R,T],[M,0.22],[L,C],[R,C],[L,B],[R,B]];
    case 8:  return [[L,T],[R,T],[M,0.22],[L,MT],[R,MT],[M,MB],[L,B],[R,B]];
    case 9:  return [[L,T],[R,T],[L,MT],[R,MT],[M,C],[L,MB],[R,MB],[L,B],[R,B]];
    case 10: return [[L,T],[R,T],[M,0.2],[L,MT],[R,MT],[M,0.55],[L,MB],[R,MB],[L,B],[R,B]];
    default: return [[M,C]];
  }
}

/* ============================================================
   Face card art — bespoke neon ornament for J/Q/K
   ============================================================ */
const FaceArt: React.FC<{ rank: 'J'|'Q'|'K'; color: string; glow: string; symbol: string; dims: typeof SIZE_MAP['md'] }> =
({ rank, color, glow, symbol, dims }) => {
  // simple iconic letter + crown/diamond accent above
  const ornament = rank === 'K' ? '♕' : rank === 'Q' ? '♛' : '✦';
  return (
    <div className="relative flex flex-col items-center justify-center" style={{ width: '78%', height: '82%' }}>
      {/* halo */}
      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color}26 0%, transparent 65%)` }} />
      <div style={{
        fontSize: dims.big * 0.7,
        lineHeight: 1,
        color,
        textShadow: `0 0 10px ${glow}`,
      }}>
        {ornament}
      </div>
      <div
        className="font-black"
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: dims.big * 1.55,
          lineHeight: 0.95,
          color,
          textShadow: `0 0 16px ${glow}, 0 0 28px ${glow}`,
          letterSpacing: '-0.04em',
        }}
      >
        {rank}
      </div>
      <div style={{
        fontSize: dims.big * 0.75,
        lineHeight: 1,
        color,
        textShadow: `0 0 8px ${glow}`,
        marginTop: -dims.big * 0.05,
      }}>
        {symbol}
      </div>
    </div>
  );
};
