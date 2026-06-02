import React from "react";
import { Activity, Radio, Sparkles, AlertCircle, RotateCcw } from "lucide-react";

interface NoCoverVisualizerProps {
  title?: string;
  artist?: string;
  isPlaying?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  mood?: string;
  genre?: string;
  dominantColor?: string;
  size?: "mini" | "card" | "full";
  showLabel?: boolean;
  className?: string;
}

export const NoCoverVisualizer: React.FC<NoCoverVisualizerProps> = ({
  title = "Untitled Signal",
  artist = "Sonic Identity",
  isPlaying = true,
  isLoading = false,
  isError = false,
  onRetry,
  mood,
  genre,
  dominantColor,
  size = "card",
  showLabel = true,
  className = "",
}) => {
  // Use brand colors or custom dominantColor
  const primaryColor = dominantColor || "#B026FF"; // Tradio premium purple
  const secondaryColor = "#06B6D4"; // Tradio cyber cyan
  const accentColor = "#EAB308"; // Premium gold

  // Animation play state
  const isAnimating = isPlaying && !isLoading && !isError;
  const playState = isAnimating ? "running" : "paused";

  // Base dimensions based on size
  const sizeClasses = {
    mini: "h-11 w-11 rounded-lg",
    card: "aspect-square w-full rounded-2xl sm:rounded-3xl",
    full: "aspect-[4/5] w-full rounded-2xl sm:rounded-3xl",
  };

  if (size === "mini") {
    return (
      <div
        className={`relative overflow-hidden bg-[#050508] border border-white/10 flex items-center justify-center shadow-inner transition-all duration-300 ${sizeClasses.mini} ${className}`}
      >
        {/* Glow behind */}
        <div
          className="absolute inset-0 opacity-40 animate-slow-spin"
          style={{
            background: `radial-gradient(circle, ${primaryColor}22 0%, transparent 70%)`,
            animationPlayState: playState,
          }}
        />

        {/* Loading state indicator */}
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="h-5 w-5 rounded-full border border-purple-500/30 border-t-purple-500 animate-spin"
              style={{ animationDuration: "1s" }}
            />
          </div>
        ) : isError ? (
          <AlertCircle className="h-4 w-4 text-red-500/80" />
        ) : (
          /* Small central orb */
          <div className="relative flex items-center justify-center h-5 w-5">
            <div
              className="absolute inset-0 rounded-full animate-pulse-orb"
              style={{
                background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: `0 0 12px ${primaryColor}66`,
                animationPlayState: playState,
              }}
            />
            {/* Inner core */}
            <div className="h-1.5 w-1.5 rounded-full bg-white opacity-90" />
          </div>
        )}

        {/* Miniature spinning sweep ring (Glow streak along the line!) */}
        {isAnimating && (
          <div
            className="absolute inset-1 rounded-full border border-transparent border-t-cyan-400/80 animate-slow-spin"
            style={{
              animationDuration: "3s",
              animationPlayState: playState,
              filter: `drop-shadow(0 0 3px ${secondaryColor})`,
            }}
          />
        )}
      </div>
    );
  }

  // Large/Medium visualizers (card & full)
  return (
    <div
      className={`relative overflow-hidden bg-[#030305] border border-white/[0.08] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col justify-between p-5 luxury-grain ${sizeClasses[size]} ${className}`}
    >
      {/* 1. Neon Radial Glow Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen animate-slow-spin"
        style={{
          background: `radial-gradient(circle, ${primaryColor}2a 0%, ${secondaryColor}15 40%, transparent 75%)`,
          animationPlayState: playState,
        }}
      />

      {/* 2. Shimmer sweep line (liquid glass vibe) */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ animationPlayState: playState }}
      >
        <div
          className="absolute -inset-y-10 left-0 w-24 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-shimmer-sweep"
          style={{ animationPlayState: playState }}
        />
      </div>

      {/* 3. Floating Particles */}
      {!isError && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
          <div
            className="absolute top-1/4 left-1/3 h-1.5 w-1.5 rounded-full bg-purple-400/40 blur-[0.5px] animate-particle-1"
            style={{ animationPlayState: playState }}
          />
          <div
            className="absolute top-1/3 right-1/4 h-1 w-1 rounded-full bg-cyan-300/40 blur-[0.5px] animate-particle-2"
            style={{ animationPlayState: playState }}
          />
          <div
            className="absolute bottom-1/3 left-1/4 h-1.5 w-1.5 rounded-full bg-pink-400/30 blur-[0.5px] animate-particle-2"
            style={{ animationPlayState: playState, animationDelay: "-3s" }}
          />
          <div
            className="absolute bottom-1/4 right-1/3 h-1 w-1 rounded-full bg-purple-300/50 blur-[0.5px] animate-particle-1"
            style={{ animationPlayState: playState, animationDelay: "-4s" }}
          />
        </div>
      )}

      {/* 4. Thin Frequency Lines (Radio/Sonic Identity) */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
        <div className="w-[85%] h-[85%] rounded-full border border-white/20 border-dashed" />
        <div className="absolute w-[65%] h-[65%] rounded-full border border-white/10" />
        {/* Horizontal & vertical cursor ticks */}
        <div className="absolute w-full h-[1px] bg-white/20" />
        <div className="absolute h-full w-[1px] bg-white/20" />
      </div>

      {/* Top Bar - Label & Badges */}
      <div className="relative z-10 flex items-center justify-between w-full">
        {showLabel ? (
          <span className="inline-flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold tracking-wider text-purple-300 rounded-full border border-purple-500/20 bg-black/40 backdrop-blur-md">
            <Radio className="h-3 w-3 animate-pulse" />
            {isError ? "SIGNAL LOSS" : isLoading ? "TUNING SIGNAL..." : "TRADIO SIGNAL"}
          </span>
        ) : (
          <div />
        )}

        {/* Mood or Genre Badge */}
        {!isError && (mood || genre) && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-cyan-200 rounded bg-cyan-950/40 border border-cyan-500/20 backdrop-blur-md">
            <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
            {mood ? mood.toUpperCase() : genre?.toUpperCase()}
          </span>
        )}
      </div>

      {/* Center - Orb and Waves */}
      <div className="relative flex-1 flex flex-col items-center justify-center">
        {isError ? (
          /* Error State UI */
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-950/40 border border-red-500/30 text-red-400 mb-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
              <AlertCircle className="h-8 w-8 animate-pulse" />
            </div>
            <h3 className="text-sm font-semibold text-white">Signal Unavailable</h3>
            <p className="text-[11px] text-white/50 mt-1 max-w-[180px]">
              Connection lost. Check your frequency stream.
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3.5 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-full bg-white/10 hover:bg-white/15 border border-white/10 active:scale-95 transition-all"
              >
                <RotateCcw className="h-3 w-3" /> Retry Stream
              </button>
            )}
          </div>
        ) : (
          /* Normal / Loading visualizers */
          <div className="relative flex items-center justify-center h-48 w-48">
            {/* Wave rings pulsing outwards */}
            {!isLoading && (
              <>
                <div
                  className="absolute inset-0 rounded-full border border-purple-500/20 animate-wave-expand"
                  style={{ animationPlayState: playState, animationDelay: "0s" }}
                />
                <div
                  className="absolute inset-0 rounded-full border border-cyan-400/15 animate-wave-expand"
                  style={{ animationPlayState: playState, animationDelay: "1.5s" }}
                />
                <div
                  className="absolute inset-0 rounded-full border border-purple-400/10 animate-wave-expand"
                  style={{ animationPlayState: playState, animationDelay: "3s" }}
                />
              </>
            )}

            {/* Glowing Central Orb or Vinyl Disc Circle */}
            <div
              className={`relative flex items-center justify-center rounded-full transition-all duration-700 ${
                size === "full" ? "h-32 w-32" : "h-24 w-24"
              } ${isLoading ? "animate-pulse-orb-slow" : "animate-pulse-orb"}`}
              style={{
                background: `radial-gradient(circle, rgba(0,0,0,0.9) 30%, ${primaryColor}22 75%, ${primaryColor}dd 100%)`,
                border: "1px solid rgba(255, 255, 255, 0.12)",
                animationPlayState: playState,
              }}
            >
              {/* Vinyl grooves or frequency rings inside the orb */}
              <div className="absolute inset-2 rounded-full border border-white/5 flex items-center justify-center">
                <div className="w-[80%] h-[80%] rounded-full border border-white/5 flex items-center justify-center">
                  <div className="w-[60%] h-[60%] rounded-full border border-white/5" />
                </div>
              </div>

              {/* Core glowing nucleus */}
              <div
                className={`rounded-full bg-white flex items-center justify-center shadow-lg transition-all duration-500 ${
                  size === "full" ? "h-10 w-10" : "h-8 w-8"
                }`}
                style={{
                  boxShadow: `0 0 25px ${primaryColor}, 0 0 45px ${secondaryColor}`,
                }}
              >
                {isLoading ? (
                  <div
                    className="h-4 w-4 rounded-full border border-purple-600 border-t-white animate-spin"
                    style={{ animationDuration: "0.8s" }}
                  />
                ) : (
                  <Activity
                    className={`h-4 w-4 text-purple-700 ${isAnimating ? "animate-pulse" : ""}`}
                  />
                )}
              </div>
            </div>

            {/* Concentric sweep tracks (Glow streaks along the lines!) */}
            {!isLoading && (
              <div className="absolute inset-0 pointer-events-none z-10">
                {/* Sweep Track 1: Inner secondaryColor clockwise streak */}
                <div
                  className="absolute inset-[3px] rounded-full border border-transparent animate-slow-spin"
                  style={{
                    borderTopColor: secondaryColor,
                    animationDuration: "4s",
                    animationPlayState: playState,
                    filter: `drop-shadow(0 0 6px ${secondaryColor})`,
                  }}
                />
                {/* Sweep Track 2: Outer primaryColor counter-clockwise streak */}
                <div
                  className="absolute inset-[-12px] rounded-full border border-transparent animate-spin-reverse"
                  style={{
                    borderBottomColor: primaryColor,
                    animationDuration: "6s",
                    animationPlayState: playState,
                    filter: `drop-shadow(0 0 8px ${primaryColor})`,
                  }}
                />
                {/* Sweep Track 3: Middle accentColor/primaryColor subtle streak */}
                <div
                  className="absolute inset-[-24px] rounded-full border border-transparent animate-slow-spin"
                  style={{
                    borderLeftColor: primaryColor,
                    borderRightColor: `${accentColor}44`,
                    animationDuration: "9s",
                    animationPlayState: playState,
                    filter: `drop-shadow(0 0 4px ${primaryColor})`,
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Bar - Subtext / Info */}
      <div className="relative z-10 w-full">
        {!isError && (
          <div className="flex items-center justify-between">
            {/* Equalizer activity signal */}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 ${
                    isAnimating ? "" : "paused-important"
                  }`}
                  style={{ animationPlayState: playState }}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isLoading ? "bg-amber-400" : "bg-green-500"
                  }`}
                />
              </span>
              <span className="text-[9px] font-mono tracking-widest text-white/40">
                {isLoading ? "LOCKING..." : isAnimating ? "HQ STEREO STREAM" : "PAUSED"}
              </span>
            </div>

            {/* Gold Accent Indicator */}
            {accentColor && (
              <div
                className="text-[9px] font-mono font-bold text-yellow-500 animate-pulse tracking-wide"
                style={{ animationPlayState: playState }}
              >
                PREMIUM AUDIO
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export interface TradioImageProps {
  src?: string;
  fallbackSize?: "mini" | "card" | "full";
  title?: string;
  artist?: string;
  isPlaying?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  mood?: string;
  genre?: string;
  showLabel?: boolean;
  className?: string;
  imgClassName?: string;
}

export const TradioImage: React.FC<TradioImageProps> = ({
  src,
  fallbackSize = "card",
  title,
  artist,
  isPlaying = true,
  isLoading = false,
  isError = false,
  mood,
  genre,
  showLabel = false,
  className = "",
  imgClassName = "",
}) => {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const isCoverMissing = !src || src === "processing" || src === "null" || src === "undefined";

  if (isCoverMissing || imageError || isError) {
    return (
      <NoCoverVisualizer
        size={fallbackSize}
        title={title}
        artist={artist}
        isPlaying={isPlaying}
        isLoading={isLoading}
        isError={isError || imageError}
        mood={mood}
        genre={genre}
        showLabel={showLabel}
        className={className}
      />
    );
  }

  return (
    <img
      src={src}
      alt={title || ""}
      onError={() => setImageError(true)}
      className={`${imgClassName} ${className}`}
    />
  );
};

export default NoCoverVisualizer;
