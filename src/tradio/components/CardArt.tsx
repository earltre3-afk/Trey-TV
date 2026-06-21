import React from 'react';
import { Play } from 'lucide-react';
import { TradioItem } from '../mockData';

const Waveform: React.FC<{ color?: string }> = ({ color = '#fff' }) => (
  <div className="flex items-end gap-[3px] h-1/2">
    {[10, 22, 14, 30, 18, 26, 12, 28, 16, 24, 10, 20, 14].map((h, i) => (
      <div key={i} style={{ height: `${h}px`, background: color }} className="w-[3px] rounded-full opacity-90" />
    ))}
  </div>
);

const CardArt: React.FC<{ item: TradioItem; className?: string; rounded?: string }> = ({
  item,
  className = '',
  rounded = 'rounded-2xl',
}) => {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${rounded} ${className}`}
      style={{ background: item.gradient }}
    >
      {item.image && (
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      )}
      {item.icon === 'wave' && <Waveform />}
      {item.icon === 'play' && (
        <div className="w-1/3 h-1/3 rounded-full border-[3px] border-white flex items-center justify-center">
          <Play className="text-white fill-white w-1/2 h-1/2" />
        </div>
      )}
      {item.icon === 'text' && (
        <span className="text-white font-extrabold tracking-tight text-[clamp(18px,2.4vw,40px)]">
          {item.label}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
};

export default CardArt;
