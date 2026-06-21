import React from 'react';
import { X, ChevronUp, ChevronDown, Play, ListMusic } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';

interface Props {
  onClose: () => void;
}

function Equalizer() {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full tradio-waveform animate-pulse"
          style={{ height: `${[10, 16, 7, 13][i]}px`, animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export default function QueuePanel({ onClose }: Props) {
  const { queue, currentPos, isPlaying, jumpToPos, moveQueueItem } = usePlayer();

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end">
      {/* scrim */}
      <button
        aria-label="Close queue"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* sheet */}
      <div className="relative max-h-[80%] flex flex-col rounded-t-3xl bg-[#0a0c14]/95 backdrop-blur-xl border-t border-x border-white/[0.08] shadow-[0_-20px_60px_-20px_rgba(245,158,11,0.45)]">
        <div className="flex items-center justify-center pt-3">
          <span className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Up Next</h2>
            <span className="text-white/35 text-sm font-medium">· {queue.length}</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6 space-y-1.5">
          {queue.map((t, i) => {
            const active = i === currentPos;
            const upcoming = i > currentPos;
            return (
              <div
                key={`${t.id}-${i}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition ${
                  active ? 'tradio-active-pill' : 'bg-white/[0.03] border-white/[0.06]'
                }`}
              >
                <button
                  onClick={() => jumpToPos(i)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.99] transition-transform"
                >
                  <div className="relative shrink-0">
                    <img
                      src={t.artwork}
                      alt={t.title}
                      className="w-11 h-11 rounded-xl object-cover object-top"
                    />
                    {!active && (
                      <div className="absolute inset-0 rounded-xl bg-black/35 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-semibold text-sm truncate ${
                        active ? 'text-amber-300' : 'text-white'
                      }`}
                    >
                      {t.title}
                    </p>
                    <p className="text-white/45 text-xs truncate">{t.artist}</p>
                  </div>
                </button>

                {active && isPlaying ? (
                  <Equalizer />
                ) : upcoming ? (
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => moveQueueItem(i, i - 1)}
                      aria-label="Move up"
                      className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <ChevronUp className="w-4 h-4 text-white/70" />
                    </button>
                    <button
                      onClick={() => moveQueueItem(i, i + 1)}
                      aria-label="Move down"
                      disabled={i === queue.length - 1}
                      className="w-7 h-7 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                ) : (
                  <span className="text-white/30 text-xs pr-1">Played</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
