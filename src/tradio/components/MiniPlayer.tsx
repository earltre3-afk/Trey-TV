import React from 'react';
import { Play, Pause, SkipForward, Loader2, Maximize2 } from 'lucide-react';
import { usePlayer, fmt } from '../PlayerContext';
import { GRADIENTS } from '../mockData';
import CardArt from './CardArt';

interface Props {
  onOpenPlayer: () => void;
}

const MiniPlayer: React.FC<Props> = ({ onOpenPlayer }) => {
  const { current, playing, elapsed, duration, loading, toggle, next } = usePlayer();
  if (!current) return null;

  const pct = duration ? Math.min(100, (elapsed / duration) * 100) : current.isLive ? 100 : 0;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-30">
      {/* progress line */}
      <div className="h-[3px] bg-white/10">
        <div
          className="h-full transition-all"
          style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#8b5cf6,#22d3ee 90%,#a5f3fc)' }}
        />
      </div>
      <div className="flex items-center gap-4 px-6 py-3 bg-black/70 backdrop-blur-xl border-t border-white/10">
        <button onClick={onOpenPlayer} className="flex items-center gap-3 min-w-0 flex-1 text-left group">
          <CardArt
            item={{ id: current.id, title: '', gradient: current.gradient ?? GRADIENTS.city }}
            className="w-12 h-12 shrink-0 transition group-hover:scale-105"
            rounded="rounded-xl"
          />
          <div className="min-w-0">
            <p className="text-white font-semibold text-[clamp(13px,1.1vw,18px)] truncate">{current.title}</p>
            <p className="text-white/50 text-[clamp(11px,0.9vw,15px)] truncate">{current.artist ?? 'Tradio'}</p>
          </div>
          {current.isLive && (
            <span className="ml-1 inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> LIVE
            </span>
          )}
        </button>

        {!current.isLive && (
          <span className="hidden md:block text-white/55 text-[clamp(12px,1vw,16px)] tabular-nums">
            {fmt(elapsed)} / {duration ? fmt(duration) : '0:00'}
          </span>
        )}

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggle}
            className="w-11 h-11 rounded-full bg-white grid place-items-center hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 text-black animate-spin" />
            ) : playing ? (
              <Pause className="w-5 h-5 text-black fill-black" />
            ) : (
              <Play className="w-5 h-5 text-black fill-black ml-0.5" />
            )}
          </button>
          {!current.isLive && (
            <button onClick={next} className="w-10 h-10 rounded-full grid place-items-center text-white/80 hover:text-white hover:bg-white/10 transition">
              <SkipForward className="w-5 h-5 fill-white" />
            </button>
          )}
          <button
            onClick={onOpenPlayer}
            className="w-10 h-10 rounded-full grid place-items-center text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Open full player"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiniPlayer;
