import React from 'react';
import { SkipBack, SkipForward, Pause, Play } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface MiniPlayerProps {
  onOpen?: () => void;
}

export default function MiniPlayer({ onOpen }: MiniPlayerProps) {
  const { current, isPlaying, currentTime, duration, toggle, next, prev } = usePlayer();

  if (!current) return null;

  const track = current;
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="fixed inset-x-0 bottom-[var(--tradio-nav-height)] z-[90] px-3 pb-2 pointer-events-none">
      <div className="tradio-player-dock relative mx-auto max-w-2xl overflow-hidden pointer-events-auto">
        <div className="pointer-events-none absolute inset-x-10 -top-12 h-16 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="flex items-center gap-3 px-3 py-2.5">
          <button type="button" onClick={onOpen} className="group flex items-center gap-3 flex-1 min-w-0 text-left">
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <img
                src={track.artwork}
                alt={track.title}
                className="h-full w-full object-cover object-top transition duration-500 group-active:scale-95"
              />
              <span className="absolute inset-0 bg-gradient-to-br from-transparent to-black/25" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{track.title}</p>
              <p className="truncate text-xs font-semibold text-white/45">{track.artist}</p>
            </div>
          </button>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" aria-label="Previous track" onClick={prev} className="text-white/80 active:opacity-60">
              <SkipBack className="w-5 h-5" fill="currentColor" />
            </button>
            <button
              type="button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={toggle}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_0_24px_-7px_rgba(255,255,255,0.9)] active:scale-90 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 text-black translate-x-[1px]" fill="currentColor" />
              )}
            </button>
            <button type="button" aria-label="Next track" onClick={next} className="text-white/80 active:opacity-60">
              <SkipForward className="w-5 h-5" fill="currentColor" />
            </button>
          </div>
        </div>
        <div className="h-[3px] w-full bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.8)] transition-[width] duration-200"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
