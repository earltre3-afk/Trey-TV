import React from 'react';
import TrunoCard from './TrunoCard';
import { TrunoCard as TCard } from '../lib/cards';

interface Props {
  cards: TCard[];
  size?: 'sm' | 'md' | 'lg';
  highlightCenter?: boolean;
}

const TrunoCardFan: React.FC<Props> = ({ cards, size = 'md', highlightCenter = true }) => {
  const mid = Math.floor(cards.length / 2);
  return (
    <div className="relative flex items-end justify-center" style={{ minHeight: size === 'lg' ? 200 : 140 }}>
      {cards.map((card, i) => {
        const offset = i - mid;
        const rotate = offset * 8;
        const translateX = offset * 38;
        const translateY = Math.abs(offset) * 8;
        const isCenter = i === mid;
        const z = isCenter ? 50 : 10 - Math.abs(offset);
        return (
          <div
            key={card.id}
            className="absolute transition-transform"
            style={{
              transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotate}deg) ${isCenter && highlightCenter ? 'scale(1.15) translateY(-20px)' : ''}`,
              zIndex: z,
            }}
          >
            <TrunoCard card={card} size={size} playable={isCenter && highlightCenter} />
          </div>
        );
      })}
    </div>
  );
};

export default TrunoCardFan;
