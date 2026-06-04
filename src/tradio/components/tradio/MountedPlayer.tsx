import React, { useCallback, useEffect, useState } from "react";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { TradioImage } from "./NoCoverVisualizer";
import { formatTime } from "@/tradio/contexts/PlayerContext";

export const MountedPlayer: React.FC = () => {
  const player = usePlayer();
  const {
    currentItem,
    currentSource,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    muted,
    unmountPlayer,
    toggle,
    setVolume,
    toggleMute,
  } = player;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      unmountPlayer();
    }, 300);
  }, [unmountPlayer]);

  if (!currentItem) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none"
      }`}
      role="region"
      aria-label="Mounted Tradio Player"
    >
      <div className="w-80 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/50 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="p-4 space-y-3">
          {/* Artwork */}
          <div className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-slate-800/50">
              {currentItem.art || currentItem.coverUrl ? (
                <TradioImage
                  src={currentItem.art || currentItem.coverUrl}
                  alt={currentItem.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-500">
                  <span className="text-2xl">♫</span>
                </div>
              )}
            </div>
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-950 rounded-full p-1.5 transition-colors"
              aria-label="Close mounted player"
            >
              <X className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Track Info */}
          <div className="min-h-14">
            <h3 className="font-semibold text-white text-sm line-clamp-2">{currentItem.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-1 mt-1">{currentItem.artist}</p>
            {currentSource && (
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{currentSource.label}</p>
            )}
          </div>

          {/* Progress Bar */}
          {!currentItem.isLive && (
            <div className="space-y-1">
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={toggle}
              className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center text-white"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            {/* Volume Control */}
            <button
              onClick={toggleMute}
              className="h-10 w-10 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors flex items-center justify-center text-slate-300"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Volume Slider */}
            <div className="w-16 flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(e) => setVolume(parseInt(e.target.value, 10) / 100)}
                className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
