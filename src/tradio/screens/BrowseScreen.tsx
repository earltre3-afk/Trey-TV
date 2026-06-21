import React from 'react';
import { TradioData } from '../api';
import TradioCard from '../components/TradioCard';
import TradioRail from '../components/TradioRail';
import { RailSkeleton } from '../components/RailSkeleton';

interface Props {
  data: TradioData | null;
  loading: boolean;
  onOpenArtist: (id: string) => void;
  onOpenAlbum: () => void;
}


const BrowseScreen: React.FC<Props> = ({ data, loading, onOpenArtist, onOpenAlbum }) => {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 gap-x-8">
        <RailSkeleton title="Genres" />
        <RailSkeleton title="Moods" />
        <RailSkeleton title="Decades" />
        <RailSkeleton title="Live Radio" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-8">
      <TradioRail title="Genres">
        {data.genres.map((g) => <TradioCard key={g.id} item={g} onClick={onOpenAlbum} />)}
      </TradioRail>
      <TradioRail title="Moods">
        {data.moods.map((m) => <TradioCard key={m.id} item={m} onClick={onOpenAlbum} />)}
      </TradioRail>
      <TradioRail title="Decades">
        {data.decades.map((d) => <TradioCard key={d.id} item={d} onClick={onOpenAlbum} />)}
      </TradioRail>
      <TradioRail title="Live Radio">
        {data.liveRadioStations.map((s) => <TradioCard key={s.id} item={s} onClick={onOpenAlbum} />)}
      </TradioRail>
      <div className="col-span-2">
        <TradioRail title="Artist Streams">
          {data.artistStreams.map((a) => <TradioCard key={a.id} item={a} onClick={() => onOpenArtist(a.id)} />)}
        </TradioRail>

      </div>
    </div>
  );
};

export default BrowseScreen;
