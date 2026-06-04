import React, { useEffect, useRef, useState } from "react";
import { Play, Pause, AlertTriangle, RotateCw, Volume2, VolumeX } from "lucide-react";
import { Waveform } from "./Waveform";

interface AudioPlayerProps {
  src?: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
  autoPlay?: boolean;
  showWaveform?: boolean;
  onEnded?: () => void;
  compact?: boolean;
}

const fmt = (s: number) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${r.toString().padStart(2, "0")}`;
};

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  artist,
  coverUrl,
  autoPlay = false,
  showWaveform = true,
  onEnded,
  compact = false,
}) => {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setError(null);
    setProgress(0);
    setPlaying(false);
  }, [src]);

  useEffect(() => {
    if (autoPlay && ref.current && src) {
      ref.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => {});
    }
  }, [autoPlay, src]);

  const toggle = async () => {
    const a = ref.current;
    if (!a || !src) return;
    try {
      if (playing) {
        a.pause();
        setPlaying(false);
      } else {
        await a.play();
        setPlaying(true);
      }
    } catch (e: any) {
      setError("Playback blocked. Tap play again.");
    }
  };

  const retry = () => {
    setError(null);
    if (ref.current) ref.current.load();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    ref.current.currentTime = pct * duration;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      className={`relative rounded-3xl border border-[#1a2942] bg-gradient-to-b from-[#0B1426] to-[#08111F] ${compact ? "p-3" : "p-4 md:p-5"}`}
    >
      <audio
        ref={ref}
        src={src}
        data-is-music="true"
        data-castable="true"
        preload="metadata"
        onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration || 0)}
        onTimeUpdate={(e) => setProgress((e.target as HTMLAudioElement).currentTime || 0)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          onEnded?.();
        }}
        onError={() => setError("Audio failed to load")}
      />
      <div className="flex items-center gap-3 md:gap-4">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            className={`${compact ? "w-14 h-14" : "w-20 h-20 md:w-24 md:h-24"} rounded-2xl object-cover border border-[#FFC857]/40 shadow-[0_0_20px_-5px_rgba(255,200,87,0.4)]`}
          />
        ) : (
          <div
            className={`${compact ? "w-14 h-14" : "w-20 h-20 md:w-24 md:h-24"} rounded-2xl bg-gradient-to-br from-[#00B7FF]/20 to-[#A855F7]/20 border border-[#1a2942] flex items-center justify-center`}
          >
            <div className="text-[#00B7FF] text-2xl">♪</div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <div className="font-bold text-[#F8FAFC] truncate text-base md:text-lg">{title}</div>
          )}
          {artist && <div className="text-[#00B7FF] text-sm truncate">{artist}</div>}
          {showWaveform && !compact && (
            <div className="mt-2">
              <Waveform playing={playing} bars={40} height={36} />
            </div>
          )}
        </div>
        <button
          onClick={toggle}
          disabled={!src}
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0B1426] border-2 border-[#00B7FF] flex items-center justify-center text-[#00B7FF] shadow-[0_0_25px_-3px_rgba(0,183,255,0.7)] hover:scale-105 active:scale-95 transition disabled:opacity-30"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-[#94A3B8] tabular-nums w-10">{fmt(progress)}</span>
        <div
          onClick={seek}
          className="flex-1 h-1.5 rounded-full bg-[#101827] cursor-pointer relative overflow-hidden"
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg,#FFC857,#FFB000)",
              boxShadow: "0 0 10px rgba(255,200,87,0.6)",
            }}
          />
        </div>
        <span className="text-xs text-[#94A3B8] tabular-nums w-10 text-right">{fmt(duration)}</span>
        <button
          onClick={() => {
            setMuted(!muted);
            if (ref.current) ref.current.muted = !muted;
          }}
          className="text-[#94A3B8] hover:text-[#00B7FF] transition"
          aria-label="Mute"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-center gap-2 text-sm text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl px-3 py-2">
          <AlertTriangle size={14} />
          <span className="flex-1">{error}</span>
          <button
            onClick={retry}
            className="flex items-center gap-1 text-[#00B7FF] hover:underline"
          >
            <RotateCw size={12} /> Retry
          </button>
        </div>
      )}
    </div>
  );
};
