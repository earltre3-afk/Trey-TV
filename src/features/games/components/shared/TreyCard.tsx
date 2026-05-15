// TreyCard.tsx
// React card component for the player hand fan (not Pixi).
// Uses official Trey TV luxury card face images via cardIdToUrl().
import React, { type CSSProperties } from 'react';
import { cardIdToUrl } from '../pixi/pixiAssets';

interface TreyCardProps {
  cardId: string;
  faceDown?: boolean;
  selected?: boolean;
  isLegal?: boolean; // if false, dim the card
  onClick?: () => void;
  style?: CSSProperties;
}

export const TreyCard: React.FC<TreyCardProps> = ({ cardId, faceDown, selected, isLegal = true, onClick, style }) => {
  const faceUrl = faceDown ? null : cardIdToUrl(cardId);
  const suit = cardId.slice(-1).toUpperCase();
  const rank = cardId.slice(0, -1).toUpperCase();
  const isRed = suit === 'H' || suit === 'D';
  const SUIT_GLYPH: Record<string, string> = { S: '♠', H: '♥', D: '♦', C: '♣' };

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: 60,
        height: 86,
        borderRadius: 10,
        overflow: 'hidden',
        background: faceDown
          ? 'radial-gradient(120% 90% at 50% 0%, oklch(0.18 0.08 285) 0%, oklch(0.09 0.04 282) 55%, oklch(0.04 0.015 280) 100%)'
          : 'linear-gradient(160deg, #0d1124 0%, #060910 100%)',
        boxShadow: selected
          ? '0 0 26px var(--neon-cyan), 0 0 52px oklch(0.84 0.16 215 / 0.35), 0 16px 32px rgba(0,0,0,0.75)'
          : '0 10px 24px -8px rgba(0,0,0,0.7), 0 2px 6px rgba(0,0,0,0.5)',
        opacity: !isLegal && !selected ? 0.45 : 1,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'opacity 0.2s',
        flexShrink: 0,
        ...style,
      }}
    >
      {faceDown ? (
        // Card back with official Trey TV card-back image
        <img
          src="/assets/games/cards/trey-tv-luxury/card-back.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : faceUrl ? (
        // Official Trey TV luxury card face
        <>
          <img
            src={faceUrl}
            alt={`${rank}${SUIT_GLYPH[suit] ?? suit}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.18) 100%)',
            pointerEvents: 'none',
          }} />
        </>
      ) : (
        // Fallback: procedural card (no face image)
        <>
          <div style={{
            position: 'absolute', top: 4, left: 5,
            fontSize: 12, fontWeight: 700, lineHeight: 1,
            color: isRed ? '#e44' : '#b5c7f5',
            fontFamily: "Georgia, 'Times New Roman', serif",
            textShadow: isRed ? '0 0 6px #f44' : '0 0 6px #88aaff',
          }}>
            <div>{rank}</div>
            <div style={{ fontSize: 10, marginTop: 1 }}>{SUIT_GLYPH[suit] ?? suit}</div>
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, color: isRed ? '#e44' : '#b5c7f5',
            textShadow: isRed ? '0 0 10px #f44' : '0 0 10px #88aaff',
          }}>
            {SUIT_GLYPH[suit] ?? suit}
          </div>
          <div style={{
            position: 'absolute', bottom: 4, right: 5, transform: 'rotate(180deg)',
            fontSize: 12, fontWeight: 700, lineHeight: 1,
            color: isRed ? '#e44' : '#b5c7f5',
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}>
            <div>{rank}</div>
            <div style={{ fontSize: 10, marginTop: 1 }}>{SUIT_GLYPH[suit] ?? suit}</div>
          </div>
        </>
      )}
      {selected && <span className="selected-card-glow" aria-hidden />}
    </div>
  );
};
