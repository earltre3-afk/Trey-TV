import React, { useState } from 'react';
import { Play, Pause, Loader2 } from 'lucide-react';
import { GRADIENTS } from '../mockData';
import { TradioData } from '../api';
import CardArt from '../components/CardArt';
import TradioCard from '../components/TradioCard';
import TradioRail from '../components/TradioRail';
import { RailSkeleton } from '../components/RailSkeleton';
import { usePlayer } from '../PlayerContext';

const Waveform = () => (
  <div className="flex items-end gap-[3px] h-10">
    {Array.from({ length: 40 }).map((_, i) => (
      <div
        key={i}
        style={{ height: `${10 + Math.abs(Math.sin(i * 0.7)) * 30}px` }}
        className="w-[3px] rounded-full bg-white/80"
      />
    ))}
  </div>
);

interface Props {
  data: TradioData | null;
  loading: boolean;
  onOpenArtist: (id: string) => void;
}


const LiveStationsScreen: React.FC<Props> = ({ data, loading, onOpenArtist }) => {
  const [selected, setSelected] = useState(0);
  const { current, playing, loading: audioLoading, playTrack, toggle } = usePlayer();

  if (loading || !data) {
    return (
      <div>
        <h2 className="text-white font-semibold text-[clamp(18px,1.8vw,28px)] mb-3">Live Stations</h2>
        <div className="h-48 rounded-3xl bg-white/5 animate-pulse mb-6" />
        <RailSkeleton title="Curated Artist Streams" />
      </div>
    );
  }

  const stations = data.stationList;
  const station = stations[selected];
  const isThisPlaying = station && current?.id === station.id && playing;

  const onPlayStation = () => {
    if (!station) return;
    if (current?.id === station.id) { toggle(); return; }
    playTrack({
      id: station.id, title: station.title, artist: station.subtitle ?? 'Tradio Original',
      gradient: station.gradient, streamUrl: station.streamUrl, isLive: true,
    });
  };

  return (
    <div>
      <h2 className="text-white font-semibold text-[clamp(18px,1.8vw,28px)] mb-3">Live Stations</h2>
      <div className="grid grid-cols-[1fr_1.4fr] gap-6 mb-6">
        <div className="flex flex-col gap-3">
          {stations.map((s, i) => {
            const sel = selected === i;
            const sPlaying = current?.id === s.id && playing;
            return (
              <button
                key={s.id}
                onClick={() => setSelected(i)}
                className={`flex items-center gap-4 p-3 rounded-2xl transition-all text-left ${
                  sel ? 'bg-white/95 shadow-[0_0_24px_rgba(255,255,255,0.3)] scale-[1.02]' : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <CardArt item={s} className="w-14 h-14" rounded="rounded-xl" />
                <div className="flex-1">
                  <p className={`font-bold text-[clamp(15px,1.3vw,22px)] ${sel ? 'text-black' : 'text-white'}`}>{s.title}</p>
                  <p className={`text-[clamp(12px,1vw,16px)] ${sel ? 'text-black/60' : 'text-white/50'}`}>{s.subtitle}</p>
                </div>
                {sPlaying && (
                  <span className={`flex items-end gap-[2px] h-4 ${sel ? '' : 'opacity-80'}`}>
                    {[1, 2, 3].map((n) => (
                      <span key={n} className={`w-[3px] rounded-full ${sel ? 'bg-black' : 'bg-cyan-300'} animate-pulse`} style={{ height: `${6 + n * 3}px`, animationDelay: `${n * 120}ms` }} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="relative rounded-3xl p-6 flex items-center gap-6 overflow-hidden" style={{ background: station?.gradient ?? GRADIENTS.violet }}>
          <div className="absolute inset-0 bg-black/35" />
          <div className="relative w-40 h-40 rounded-2xl grid place-items-center shrink-0" style={{ background: GRADIENTS.purplePink }}>
            <div className="w-20 h-20 rotate-45 rounded-lg" style={{ background: GRADIENTS.cyanBlue }} />
          </div>
          <div className="relative flex-1">
            <p className="text-white/70 text-[clamp(14px,1.2vw,20px)]">Tradio Original:</p>
            <h3 className="text-white font-extrabold text-[clamp(24px,2.6vw,42px)] leading-tight mb-3">
              {station?.title ?? 'Synthwave Nights'}
            </h3>
            <Waveform />
            <div className="flex items-center gap-4 mt-4">
              <span className="inline-flex items-center gap-2 bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> LIVE
              </span>
              <button
                onClick={onPlayStation}
                className="w-12 h-12 rounded-full bg-white grid place-items-center hover:scale-105 transition shadow-[0_0_20px_rgba(255,255,255,0.4)]"
              >
                {audioLoading && current?.id === station?.id
                  ? <Loader2 className="w-6 h-6 text-black animate-spin" />
                  : isThisPlaying
                    ? <Pause className="w-6 h-6 text-black fill-black" />
                    : <Play className="w-6 h-6 text-black fill-black ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <TradioRail title="Curated Artist Streams">
        {data.artistStreams.map((a) => (
          <TradioCard key={a.id} item={a} onClick={() => onOpenArtist(a.id)} />
        ))}

      </TradioRail>
    </div>
  );
};

export default LiveStationsScreen;
