import React from 'react';
import { Play, Pause, Radio } from 'lucide-react';
import { IMG, TRACKS } from './data';
import { EqIcon } from './ui';
import { usePlayer } from '@/tradio/contexts/PlayerContext';
import { TradioImage } from './NoCoverVisualizer';

interface Props {
  onOpen?: () => void;
  className?: string;
}

export const MiniPlayer: React.FC<Props> = ({ onOpen, className = '' }) => {
  const { currentItem, currentSource, isPlaying, isBuffering, isLive, toggle, currentTime, duration, progress, play } = usePlayer();

  // Fallback display when nothing is playing yet (so the shell never looks empty)
  const display = currentItem ?? {
    id: 'fallback',
    title: 'Midnight Velvet',
    artist: 'Trey Trizzy - Live Mix',
    art: IMG.treyTrizzy,
    sourceLabel: 'Station',
  };

  const pct = isLive ? 100 : progress;
  const sourceLabel = currentSource?.label || display.sourceLabel || 'Song';

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentItem) {
      play({ ...TRACKS.midnightVelvet, sourceType: 'station', sourceLabel: 'Station', isLive: true });
    } else {
      toggle();
    }
  };

  return (
    <div className={`px-4 pb-3 ${className}`}>
      <div className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0914]/80 p-3.5 pr-4 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] transition-all duration-500 hover:border-white/18 hover:bg-[#0A0914]/90 sm:gap-4">
        <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4">
          <TradioImage
            src={(currentItem ? (currentItem.coverUrl || currentItem.art) : display.art) ?? undefined}
            title={display.title}
            artist={display.artist}
            isPlaying={isPlaying}
            isLoading={isBuffering}
            mood={display.mood?.[0]}
            genre={display.genre}
            fallbackSize="mini"
            className="h-12 w-12 rounded-lg object-cover shadow-[0_0_20px_-5px_rgba(176,38,255,0.3)] transition-all duration-300 group-hover:shadow-[0_0_30px_-2px_rgba(176,38,255,0.5)]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <div className="truncate text-sm font-semibold text-white">{display.title}</div>
              {isLive && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-400/35 bg-rose-500/15 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-200">
                  <Radio className="h-2.5 w-2.5" /> Live
                </span>
              )}
            </div>
            <div className="truncate text-[11px] text-white/65">
              {display.artist}
              {display.station ? ` - ${display.station}` : currentSource?.title ? ` - ${currentSource.title}` : ''}
            </div>
            <div className="mt-1.5 inline-flex rounded-full border border-purple-500/20 bg-purple-500/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              {isBuffering ? 'Buffering' : sourceLabel}
            </div>
          </div>
        </button>
        <EqIcon isPlaying={isPlaying} className={`hidden h-5 w-5 transition-all duration-300 sm:flex ${isPlaying ? 'opacity-100' : 'opacity-50'}`} />
        <button
          aria-label={isPlaying ? 'Pause track' : 'Play track'}
          onClick={handlePlay}
          className="ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 text-white shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_10px_30px_rgba(168,85,247,0.45)] border border-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-[1px] active:scale-95"
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
        </button>
        {/* live progress strip */}
        <span
          className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r ${isLive ? 'from-rose-400 via-fuchsia-500 to-cyan-400' : 'from-fuchsia-400 via-purple-500 to-cyan-400'} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
