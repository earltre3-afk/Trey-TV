import React, { useState, useRef } from 'react';
import {
  ChevronDown,
  Cast,
  Shuffle,
  SkipBack,
  SkipForward,
  Pause,
  Play,
  Repeat,
  Repeat1,
  ListMusic,
  Heart,
  Quote,
  Share2,
} from 'lucide-react';
import { usePlayer, formatTime } from '../../../contexts/PlayerContext';
import { useSaved } from '../../../contexts/SavedContext';
import { NOW_PLAYING } from '../../../data/mockData';
import QueuePanel from '../QueuePanel';

interface Props {
  onClose: () => void;
}

export default function NowPlayingScreen({ onClose }: Props) {
  const {
    current,
    isPlaying,
    currentTime,
    duration,
    shuffle,
    repeat,
    toggle,
    next,
    prev,
    seekRatio,
    toggleShuffle,
    cycleRepeat,
    queue,
  } = usePlayer();
  const { isTrackSaved, toggleTrack } = useSaved();
  const [showQueue, setShowQueue] = useState(false);
  const [extra, setExtra] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  const fallback = {
    id: 'fallback',
    title: NOW_PLAYING.title,
    artist: NOW_PLAYING.artist,
    artwork: NOW_PLAYING.artwork,
    src: '',
  };
  const track = current ?? fallback;
  const saved = isTrackSaved(track.id);
  const progress = duration > 0 ? currentTime / duration : 0;
  const remaining = duration > 0 ? duration - currentTime : 0;
  const nextTrack = queue[1] ?? null;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    seekRatio(ratio);
  };

  return (
    <div className="relative flex flex-col h-full overflow-y-auto">
      {/* top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <button onClick={onClose} className="text-white/80 active:opacity-60">
          <ChevronDown className="w-6 h-6" />
        </button>
        <div className="text-center">
          <p className="text-white font-semibold text-base">Now Playing</p>
          <p className="text-white/50 text-xs">Living Room TV</p>
        </div>
        <button className="text-white/80 active:opacity-60">
          <Cast className="w-6 h-6" />
        </button>
      </div>

      {/* artwork */}
      <div className="px-5 pt-3">
        <div className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-[0_20px_60px_-20px_rgba(245,158,11,0.55)]">
          <img src={track.artwork} alt={track.title} className="w-full aspect-square object-cover object-top" />
        </div>
      </div>

      {/* title row */}
      <div className="px-5 pt-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-black text-white leading-none truncate uppercase">{track.title}</h1>
          <p className="text-white/55 text-lg font-medium tracking-wide uppercase">{track.artist}</p>
        </div>
        <button
          onClick={() => current && toggleTrack(current)}
          aria-label={saved ? 'Remove from Liked' : 'Save to Liked'}
          className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition ${
            saved
              ? 'bg-amber-500/20 border border-amber-500/60 tradio-gold-glow'
              : 'bg-white/[0.07] border border-white/10'
          }`}
        >
          <Heart
            className={`w-5 h-5 ${saved ? 'text-amber-400' : 'text-white'}`}
            fill={saved ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* progress (seekable) */}
      <div className="px-5 pt-4">
        <div ref={barRef} onClick={handleSeek} className="relative h-1.5 rounded-full bg-white/15 cursor-pointer py-2 -my-2">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-white/15" />
          <div
            className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 rounded-full tradio-progress-gradient shadow-[0_0_10px_rgba(245,158,11,0.7)]"
            style={{ width: `${Math.min(100, progress * 100)}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow"
            style={{ left: `calc(${Math.min(100, progress * 100)}% - 8px)` }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-white/45 text-xs">{formatTime(currentTime)}</span>
          <span className="text-white/45 text-xs">-{formatTime(remaining)}</span>
        </div>
      </div>

      {/* controls */}
      <div className="px-5 pt-5 flex items-center justify-between">
        <button
          onClick={toggleShuffle}
          aria-label="Shuffle"
          className={`relative active:opacity-60 transition ${shuffle ? 'text-amber-400' : 'text-white/45'}`}
        >
          <Shuffle className="w-6 h-6" />
          {shuffle && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]" />
          )}
        </button>
        <button onClick={prev} className="text-white active:opacity-60">
          <SkipBack className="w-8 h-8" fill="currentColor" />
        </button>
        <button
          onClick={toggle}
          className="w-[72px] h-[72px] rounded-full bg-white flex items-center justify-center active:scale-90 transition-transform shadow-[0_0_30px_-4px_rgba(255,255,255,0.4)]"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-black" fill="currentColor" />
          ) : (
            <Play className="w-8 h-8 text-black translate-x-[2px]" fill="currentColor" />
          )}
        </button>
        <button onClick={next} className="text-white active:opacity-60">
          <SkipForward className="w-8 h-8" fill="currentColor" />
        </button>
        <button
          onClick={cycleRepeat}
          aria-label="Repeat"
          className={`relative active:opacity-60 transition ${repeat !== 'off' ? 'text-amber-400' : 'text-white/45'}`}
        >
          {repeat === 'one' ? <Repeat1 className="w-6 h-6" /> : <Repeat className="w-6 h-6" />}
          {repeat !== 'off' && (
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]" />
          )}
        </button>
      </div>

      {/* action buttons */}
      <div className="px-5 pt-7 flex items-center gap-3">
        <button
          onClick={() => setShowQueue(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold bg-white/[0.04] border border-white/[0.07] text-white/70 active:scale-95 transition"
        >
          <ListMusic className="w-4 h-4" />
          Queue
        </button>
        <button
          onClick={() => current && toggleTrack(current)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold transition active:scale-95 ${
            saved
              ? 'bg-white/[0.06] border border-amber-500/60 text-white tradio-gold-glow'
              : 'bg-white/[0.04] border border-white/[0.07] text-white/70'
          }`}
        >
          <Heart className={`w-4 h-4 ${saved ? 'text-amber-400' : ''}`} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save'}
        </button>
        {[
          { key: 'Lyrics', icon: Quote },
          { key: 'Share', icon: Share2 },
        ].map(({ key, icon: Icon }) => {
          const isActive = extra === key;
          return (
            <button
              key={key}
              onClick={() => setExtra((e) => (e === key ? null : key))}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-sm font-semibold transition active:scale-95 ${
                isActive
                  ? 'bg-white/[0.06] border border-amber-500/60 text-white tradio-gold-glow'
                  : 'bg-white/[0.04] border border-white/[0.07] text-white/70'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : ''}`} />
              {key}
            </button>
          );
        })}
      </div>

      {/* Queue lives inside the player without duplicating the mini-player UI. */}
      <div className="px-5 pt-5 pb-6 mt-auto">
        <button
          onClick={() => setShowQueue(true)}
          className="w-full border-t border-white/[0.08] pt-4 text-left active:opacity-75 transition"
        >
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-amber-300">
              <ListMusic className="w-4 h-4" />
              Up next
            </span>
            <span className="min-w-0 text-right">
              <span className="block truncate text-sm font-bold text-white">
                {nextTrack ? nextTrack.title : 'Radio queue'}
              </span>
              <span className="block truncate text-xs font-semibold text-white/45">
                {nextTrack ? nextTrack.artist : 'Open the player queue'}
              </span>
            </span>
          </div>
        </button>
      </div>

      {showQueue && <QueuePanel onClose={() => setShowQueue(false)} />}
    </div>
  );
}
