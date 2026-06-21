import React from 'react';
import { Pause, MoreHorizontal, Heart } from 'lucide-react';

interface TrackRowProps {
  n?: number;
  title: string;
  artist: string;
  time: string;
  image?: string;
  active?: boolean;
  saved?: boolean;
  onClick?: () => void;
  onToggleSave?: () => void;
}

function Equalizer() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-amber-500 to-yellow-300 animate-pulse"
          style={{ height: `${[10, 16, 7, 13][i]}px`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}


export default function TrackRow({
  n,
  title,
  artist,
  time,
  image,
  active,
  saved,
  onClick,
  onToggleSave,
}: TrackRowProps) {
  return (
    <div
      className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
        active
          ? 'rounded-2xl bg-white/[0.06] border border-amber-400/30 shadow-[0_0_20px_-6px_rgba(245,158,11,0.5)]'
          : 'rounded-2xl hover:bg-white/[0.03] active:bg-white/[0.05]'
      }`}
    >

      <button onClick={onClick} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        {image ? (
          <img src={image} alt={title} className="w-11 h-11 rounded-xl object-cover object-top shrink-0" />
        ) : (
          <div className="w-6 flex items-center justify-center shrink-0">
            {active ? (
              <Pause className="w-4 h-4 text-amber-400" fill="currentColor" />

            ) : (
              <span className="text-white/40 text-sm font-medium">{n}</span>
            )}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate text-white">{title}</p>
          <p className="text-white/45 text-xs truncate">{artist}</p>
        </div>
      </button>
      <div className="flex items-center gap-2.5 shrink-0">
        {active && <Equalizer />}
        <span className="text-white/45 text-xs">{time}</span>
        {onToggleSave ? (
          <button
            onClick={onToggleSave}
            aria-label={saved ? 'Unsave' : 'Save'}
            className="active:scale-90 transition-transform"
          >
            <Heart
              className={`w-5 h-5 ${saved ? 'text-amber-400' : 'text-white/40'}`}

              fill={saved ? 'currentColor' : 'none'}
            />
          </button>
        ) : (
          <MoreHorizontal className="w-5 h-5 text-white/40" />
        )}
      </div>
    </div>
  );
}
