import React from 'react';
import { TradioData } from '../api';
import CardArt from '../components/CardArt';
import TradioCard from '../components/TradioCard';
import TradioRail from '../components/TradioRail';
import { RailSkeleton } from '../components/RailSkeleton';

interface Props {
  data: TradioData | null;
  loading: boolean;
  onOpenAlbum: () => void;
  onOpenStations: () => void;
}

const HomeScreen: React.FC<Props> = ({ data, loading, onOpenAlbum, onOpenStations }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 gap-8">
        <RailSkeleton title="Featured Playlists" count={3} />
        <RailSkeleton title="Live Radio Stations" />
        <div className="col-span-2"><RailSkeleton title="Recently Played" count={8} /></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-8">
      <section>
        <h2 className="text-white font-semibold text-[clamp(18px,1.8vw,28px)] mb-3">Featured Playlists</h2>
        {data.featuredPlaylists.length === 0 ? (
          <div className="rounded-3xl bg-white/5 h-40 grid place-items-center text-white/40">No featured playlists</div>
        ) : (
          <button
            onClick={onOpenAlbum}
            className="w-full p-3 rounded-3xl ring-4 ring-fuchsia-400/60 shadow-[0_0_40px_rgba(217,70,239,0.4)] transition-transform hover:scale-[1.01]"
            style={{ background: 'linear-gradient(135deg,rgba(168,85,247,0.35),rgba(236,72,153,0.35))' }}
          >
            <div className="flex gap-3">
              {data.featuredPlaylists.map((p) => (
                <div key={p.id} className="flex-1 text-left">
                  <CardArt item={p} className="w-full aspect-square" />
                  <p className="text-white font-semibold mt-2 text-[clamp(13px,1vw,17px)] truncate">{p.title}</p>
                  <p className="text-white/60 text-[clamp(11px,0.9vw,14px)]">{p.subtitle}</p>
                </div>
              ))}
            </div>
          </button>
        )}
      </section>

      <TradioRail title="Live Radio Stations">
        {data.liveRadioStations.map((s) => (
          <TradioCard key={s.id} item={s} onClick={onOpenStations} />
        ))}
      </TradioRail>

      <div className="col-span-2">
        <TradioRail title="Recently Played">
          {data.recentlyPlayed.map((r) => (
            <TradioCard key={r.id} item={r} onClick={onOpenAlbum} />
          ))}
        </TradioRail>
      </div>
    </div>
  );
};

export default HomeScreen;
