import React from 'react';
import { TradioItem } from '../mockData';
import CardArt from './CardArt';

interface Props {
  item: TradioItem;
  size?: number; // art size in px (tv-scaled via clamp class)
  focused?: boolean;
  showText?: boolean;
  onClick?: () => void;
  onFocus?: () => void;
  square?: boolean;
}

const TradioCard: React.FC<Props> = ({ item, focused, showText = true, onClick, onFocus }) => {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onFocus}
      className={`group shrink-0 text-left outline-none transition-all duration-200 ${
        focused ? 'scale-[1.06]' : 'hover:scale-[1.04]'
      }`}
    >
      <CardArt
        item={item}
        className={`w-[clamp(120px,11vw,180px)] aspect-square transition-shadow duration-200 ${
          focused
            ? 'ring-4 ring-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.6)]'
            : 'ring-2 ring-white/0 group-hover:ring-white/40'
        }`}
      />
      {showText && (
        <div className="mt-2 w-[clamp(120px,11vw,180px)]">
          <p className="text-white font-semibold text-[clamp(13px,1.1vw,18px)] truncate">{item.title}</p>
          {item.subtitle && (
            <p className="text-white/50 text-[clamp(11px,0.9vw,15px)] truncate">{item.subtitle}</p>
          )}
        </div>
      )}
    </button>
  );
};

export default TradioCard;
