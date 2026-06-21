import React, { useEffect } from 'react';
import { Pause, Play, Loader2 } from 'lucide-react';
import { GRADIENTS } from '../mockData';
import { TradioData } from '../api';
import CardArt from '../components/CardArt';
import { RailSkeleton } from '../components/RailSkeleton';
import { usePlayer, fmt } from '../PlayerContext';

interface Props {
  data: TradioData | null;
  loading: boolean;
  onPlay: () => void;
}

const AlbumDetailScreen: React.FC<Props> = ({ data, loading, onPlay }) => {
  const { current, playing, elapsed, duration, loading: audioLoading, playTrack, setQueue } = usePlayer();

  useEffect(() => {
    if (data?.albumTracks?.length) {
      setQueue(
        data.albumTracks.map((t) => ({
          id: t.id, title: t.title, artist: t.artist, year: '2024',
          gradient: t.gradient ?? GRADIENTS.city, streamUrl: t.streamUrl,
        }))
      );
    }
  }, [data, setQueue]);

  if (loading || !data) {
    return (
      <div className="grid grid-cols-[0.9fr_1.4fr] gap-10">
        <div className="w-full aspect-square rounded-3xl bg-white/5 animate-pulse" />
        <RailSkeleton title=" " count={0} />
      </div>
    );
  }

  const handle = (t: typeof data.albumTracks[number]) => {
    playTrack({
      id: t.id, title: t.title, artist: t.artist, year: '2024',
      gradient: t.gradient ?? GRADIENTS.city, streamUrl: t.streamUrl,
    });
    onPlay();
  };

  return (
    <div className="grid grid-cols-[0.9fr_1.4fr] gap-10">
      <div>
        <CardArt
          item={{ id: 'cover', title: '', gradient: GRADIENTS.city }}
          className="w-full aspect-square ring-2 ring-fuchsia-400/40 shadow-[0_0_40px_rgba(217,70,239,0.3)]"
          rounded="rounded-3xl"
        />
        <h1 className="text-white font-extrabold text-[clamp(28px,3vw,52px)] mt-5">Neon Sunset</h1>
        <p className="text-white/60 text-[clamp(16px,1.5vw,26px)]">Aether Echo</p>
        <p className="text-white/40 text-[clamp(14px,1.2vw,20px)]">2024</p>
      </div>

      <div className="flex flex-col">
        {data.albumTracks.length === 0 && (
          <div className="text-white/40 py-16 text-center">No tracks in this album yet</div>
        )}
        {data.albumTracks.map((t) => {
          const active = current?.id === t.id;
          const pct = active && duration ? (elapsed / duration) * 100 : 33;
          return (
            <button
              key={t.id}
              onClick={() => handle(t)}
              className={`flex items-center gap-5 px-5 py-3 transition-all text-left ${
                active ? 'bg-white/10 rounded-2xl ring-1 ring-white/15' : 'border-b border-white/10 hover:bg-white/5'
              }`}
            >
              <span className="w-6 grid place-items-center text-white/50 text-[clamp(15px,1.3vw,20px)]">
                {active
                  ? (audioLoading
                      ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                      : playing
                        ? <Pause className="w-5 h-5 text-white fill-white" />
                        : <Play className="w-5 h-5 text-white fill-white" />)
                  : t.num}
              </span>
              <span className="text-white font-medium flex-1 text-[clamp(15px,1.4vw,22px)]">{t.title}</span>
              {active && (
                <div className="w-32 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              )}
              <span className="text-white/50 text-[clamp(14px,1.2vw,20px)] w-12 text-right tabular-nums">
                {active && duration ? fmt(elapsed) : t.duration}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AlbumDetailScreen;
