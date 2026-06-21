import React, { useRef } from 'react';
import { Shuffle, SkipBack, SkipForward, Repeat, Play, Pause, Loader2 } from 'lucide-react';
import { GRADIENTS } from '../mockData';
import CardArt from '../components/CardArt';
import { usePlayer, fmt, PlayerTrack } from '../PlayerContext';

const FullPlayerScreen: React.FC = () => {
  const { current, playing, elapsed, duration, shuffle, repeat, loading, toggle, seekPct, toggleShuffle, toggleRepeat, next, prev } = usePlayer();
  const barRef = useRef<HTMLDivElement | null>(null);

  const track: PlayerTrack = current ?? { id: 'demo', title: 'Cybernetic Dreams', artist: 'Aether Echo', year: '2024', gradient: GRADIENTS.city };
  const grad = track.gradient ?? GRADIENTS.city;
  const pct = duration ? (elapsed / duration) * 100 : 0;

  const onBar = (e: React.MouseEvent) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    seekPct((e.clientX - rect.left) / rect.width);
  };

  return (
    <div className="relative -mx-8 -my-8 min-h-[72vh] flex items-center px-12 overflow-hidden rounded-3xl">
      <div className="absolute inset-0 scale-110" style={{ background: grad }} />
      <div className="absolute inset-0 backdrop-blur-3xl bg-black/55" />

      <div className="relative grid grid-cols-2 gap-12 items-center w-full">
        <div className="flex flex-col items-start">
          <CardArt
            item={{ id: 'pl', title: '', gradient: grad }}
            className="w-[clamp(220px,28vw,420px)] aspect-square ring-2 ring-fuchsia-400/60 shadow-[0_0_70px_rgba(217,70,239,0.5)]"
            rounded="rounded-3xl"
          />
          <h3 className="text-white font-extrabold text-[clamp(22px,2.2vw,36px)] mt-5">{track.title}</h3>
          <p className="text-white/60 text-[clamp(15px,1.4vw,22px)]">{track.artist ?? 'Tradio'}</p>
          <p className="text-white/40 text-[clamp(13px,1.1vw,18px)]">{track.year ?? '2024'}</p>
        </div>

        <div>
          <h1 className="text-white font-black leading-[0.92] text-[clamp(40px,5vw,86px)] tracking-tight uppercase [font-stretch:condensed]">
            {(track.title || 'Cybernetic Dreams').split(' ').slice(0, 2).join(' ') || track.title}
            <br />
            {track.title.split(' ').slice(2).join(' ')}
          </h1>
          <p className="text-white/55 font-semibold tracking-[0.25em] text-[clamp(16px,1.6vw,28px)] mt-2 uppercase">
            {track.artist ?? 'Aether Echo'}
          </p>

          <div className="mt-10">
            <div ref={barRef} onClick={onBar} className="relative h-2.5 rounded-full bg-white/15 cursor-pointer group">
              <div
                className="absolute left-0 top-0 h-full rounded-full"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#8b5cf6,#22d3ee 80%,#a5f3fc)' }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white shadow-[0_0_18px_rgba(165,243,252,0.95)]"
                style={{ left: `${pct}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-white/65 text-[clamp(13px,1.1vw,18px)] tabular-nums">
              <span>{fmt(elapsed)}</span>
              <span>{duration ? fmt(duration) : track.durationLabel ?? '2:33'}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-8 mt-9">
            <button onClick={toggleShuffle} className={`transition ${shuffle ? 'text-cyan-300' : 'text-white/60 hover:text-white'}`}><Shuffle className="w-7 h-7" /></button>
            <button onClick={prev} className="text-white hover:scale-110 transition"><SkipBack className="w-9 h-9 fill-white" /></button>
            <button
              onClick={toggle}
              className="w-20 h-20 rounded-full bg-white grid place-items-center hover:scale-105 transition shadow-[0_0_36px_rgba(255,255,255,0.45)]"
            >
              {loading ? <Loader2 className="w-9 h-9 text-black animate-spin" /> : playing ? <Pause className="w-9 h-9 text-black fill-black" /> : <Play className="w-9 h-9 text-black fill-black ml-1" />}
            </button>
            <button onClick={next} className="text-white hover:scale-110 transition"><SkipForward className="w-9 h-9 fill-white" /></button>
            <button onClick={toggleRepeat} className={`transition ${repeat !== 'off' ? 'text-cyan-300' : 'text-white/60 hover:text-white'}`}><Repeat className="w-7 h-7" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPlayerScreen;
