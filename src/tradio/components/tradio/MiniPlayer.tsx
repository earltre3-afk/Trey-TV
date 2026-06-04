import React from "react";
import { Cast, Play, Pause, Radio, Pin } from "lucide-react";
import { IMG, TRACKS } from "./data";
import { EqIcon } from "./ui";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { TradioImage } from "./NoCoverVisualizer";

interface Props {
  onOpen?: () => void;
  className?: string;
}

export const MiniPlayer: React.FC<Props> = ({ onOpen, className = "" }) => {
  const {
    currentItem,
    currentSource,
    isPlaying,
    isBuffering,
    isLive,
    toggle,
    currentTime,
    duration,
    progress,
    play,
    startCast,
    isMounted,
    mountPlayer,
  } = usePlayer();

  // Fallback display when nothing is playing yet (so the shell never looks empty)
  const display = currentItem ?? {
    id: "fallback",
    title: "Midnight Velvet",
    artist: "Trey Trizzy - Live Mix",
    art: IMG.treyTrizzy,
    sourceLabel: "Station",
  };

  const pct = isLive ? 100 : progress;
  const sourceLabel = currentSource?.label || display.sourceLabel || "Song";

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentItem) {
      play({
        ...TRACKS.midnightVelvet,
        sourceType: "station",
        sourceLabel: "Station",
        isLive: true,
      });
    } else {
      toggle();
    }
  };

  const handleCast = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentItem) {
      play({
        ...TRACKS.midnightVelvet,
        sourceType: "station",
        sourceLabel: "Station",
        isLive: true,
      });
      return;
    }
    void Promise.resolve(startCast("browser-cast")).catch((error) => {
      console.warn("[Tradio] Cast could not be started", error);
    });
  };

  return (
    <div className={`px-4 pb-3 ${className}`}>
      <div className="group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border-[0.5px] border-white/12 bg-gradient-to-b from-[#0e0e1a]/85 to-[#06050b]/92 p-3.5 pr-4 backdrop-blur-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),inset_0_1.5px_2px_rgba(255,255,255,0.14),inset_0_-1px_10px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20 hover:bg-gradient-to-b hover:from-[#121226]/90 hover:to-[#08070e]/95 hover:shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9),inset_0_1.5px_2.5px_rgba(255,255,255,0.22)] sm:gap-4">
        <button
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 text-left sm:gap-4"
        >
          <TradioImage
            src={(currentItem ? currentItem.coverUrl || currentItem.art : display.art) ?? undefined}
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
              {display.station
                ? ` - ${display.station}`
                : currentSource?.title
                  ? ` - ${currentSource.title}`
                  : ""}
            </div>
            <div className="mt-1.5 inline-flex rounded-full border border-purple-500/20 bg-purple-500/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
              {isBuffering ? "Buffering" : sourceLabel}
            </div>
          </div>
        </button>
        <EqIcon
          isPlaying={isPlaying}
          className={`hidden h-5 w-5 transition-all duration-300 sm:flex ${isPlaying ? "opacity-100" : "opacity-50"}`}
        />
        {currentItem && !isMounted && (
          <button
            aria-label="Mount player"
            title="Mount player as floating widget"
            onClick={(e) => {
              e.stopPropagation();
              mountPlayer();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-amber-200 transition-all duration-300 hover:border-amber-300/35 hover:bg-amber-400/10 active:scale-95 shrink-0"
          >
            <Pin className="h-4 w-4" />
          </button>
        )}
        <button
          aria-label="Cast Tradio music"
          title="Cast Tradio music"
          onClick={handleCast}
          className="hidden h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-cyan-200 transition-all duration-300 hover:border-cyan-300/35 hover:bg-cyan-400/10 active:scale-95 sm:flex"
        >
          <Cast className="h-4 w-4" />
        </button>
        <button
          aria-label={isPlaying ? "Pause track" : "Play track"}
          onClick={handlePlay}
          className="ml-2 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 text-white shadow-[0_8px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_10px_30px_rgba(168,85,247,0.45)] border border-white/10 transition-all duration-500 hover:scale-105 hover:-translate-y-[1px] active:scale-95"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-white" />
          ) : (
            <Play className="h-4 w-4 fill-white" />
          )}
        </button>
        {/* live progress strip */}
        <span
          className={`absolute bottom-0 left-0 h-[3px] bg-gradient-to-r ${isLive ? "from-rose-400 via-fuchsia-500 to-cyan-400" : "from-fuchsia-400 via-purple-500 to-cyan-400"} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export default MiniPlayer;
