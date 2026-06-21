import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { TradioData, fetchTradioSearch, SearchResults } from '../api';
import { TradioItem } from '../mockData';
import CardArt from '../components/CardArt';
import SaveButton from '../components/SaveButton';
import { CardSkeleton } from '../components/RailSkeleton';
import { usePlayer } from '../PlayerContext';
import { useSaved, SavedKind } from '../saved';

const recentSearches = ['Neon Sunset', 'Aether Echo', 'Tradio Chill', 'Synthwave'];
const libraryItems: { label: string; kind: SavedKind }[] = [
  { label: 'Playlists', kind: 'playlist' },
  { label: 'Albums', kind: 'album' },
  { label: 'Artists', kind: 'artist' },
  { label: 'Stations', kind: 'station' },
];

interface Props {
  data: TradioData | null;
  loading: boolean;
  onOpenAlbum: () => void;
  onOpenArtist: (id: string) => void;
  onOpenPlaylist: (id: string) => void;
}

const GridCard: React.FC<{
  item: TradioItem;
  tag: string;
  kind: SavedKind;
  highlight?: boolean;
  onClick: () => void;
}> = ({ item, tag, kind, highlight, onClick }) => (
  <div className="relative group">
    <button onClick={onClick} className="text-left w-full">
      <CardArt
        item={item}
        className={`w-full aspect-square transition-all group-hover:scale-[1.04] ${
          highlight
            ? 'ring-4 ring-fuchsia-400 shadow-[0_0_24px_rgba(217,70,239,0.5)]'
            : 'ring-2 ring-white/0 group-hover:ring-cyan-300/60 group-hover:shadow-[0_0_22px_rgba(34,211,238,0.4)]'
        }`}
      />
      <p className="text-white font-semibold mt-2 text-[clamp(13px,1.1vw,18px)] truncate">{item.title}</p>
      <p className="text-white/45 text-[clamp(11px,0.9vw,15px)] truncate">{item.subtitle ?? tag}</p>
    </button>
    {kind !== 'station' && (
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <SaveButton id={item.id} kind={kind} />
      </div>
    )}
  </div>
);


const SearchLibraryScreen: React.FC<Props> = ({ data, loading, onOpenAlbum, onOpenArtist, onOpenPlaylist }) => {
  const [activeRecent, setActiveRecent] = useState('');
  const [activeLib, setActiveLib] = useState<SavedKind | ''>('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [playlistTitle, setPlaylistTitle] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { playTrack, toggle, current } = usePlayer();
  const { byKind, createPlaylist } = useSaved();

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();
    if (q.length < 2) { setResults(null); setSearching(false); return; }
    setSearching(true);
    timer.current = setTimeout(() => {
      fetchTradioSearch(q)
        .then((r) => setResults(r))
        .catch(() => setResults({ artists: [], albums: [], stations: [] }))
        .finally(() => setSearching(false));
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const playStation = (s: TradioItem) => {
    if (current?.id === s.id) { toggle(); return; }
    playTrack({ id: s.id, title: s.title, artist: s.subtitle ?? 'Tradio', gradient: s.gradient, streamUrl: s.streamUrl, isLive: true });
  };

  const hasResults = results && (results.artists.length || results.albums.length || results.stations.length);
  const onCreatePlaylist = () => {
    const title = playlistTitle.trim();
    if (!title) return;
    createPlaylist({ title, subtitle: 'Created on Trey TV', visibility: 'private' });
    setPlaylistTitle('');
    setActiveLib('playlist');
    setQuery('');
  };

  // library filtering: saved items of a kind, fall back to whole category
  const libraryView = (): { items: TradioItem[]; kind: SavedKind; title: string } => {
    const savedIds = new Set(byKind(activeLib as SavedKind));
    const pick = (all: TradioItem[]) => {
      const saved = all.filter((i) => savedIds.has(i.id));
      return saved.length ? saved : all;
    };
    if (activeLib === 'playlist') return { items: pick(data?.allPlaylists ?? []), kind: 'playlist', title: 'Playlists' };
    if (activeLib === 'album') return { items: pick(data?.allAlbums ?? []), kind: 'album', title: 'Albums' };
    if (activeLib === 'artist') return { items: pick(data?.allArtists ?? []), kind: 'artist', title: 'Artists' };
    return { items: pick(data?.allStations ?? []), kind: 'station', title: 'Stations' };
  };

  const renderLibrary = () => {
    if (loading || !data) {
      return (
        <div className="grid grid-cols-5 gap-5">
          {Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      );
    }
    if (activeLib) {
      const { items, kind, title } = libraryView();
      const savedSet = new Set(byKind(kind));
      return (
        <>
          <h2 className="text-white font-semibold text-[clamp(20px,2vw,30px)] mb-4">{title}</h2>
          {items.length === 0 ? (
            <div className="text-white/40 py-16">Nothing here yet.</div>
          ) : (
            <div className="grid grid-cols-5 gap-5">
              {items.map((a) => (
                <GridCard
                  key={a.id}
                  item={a}
                  tag={title}
                  kind={kind}
                  highlight={savedSet.has(a.id)}
                  onClick={() => (kind === 'artist' ? onOpenArtist(a.id) : kind === 'station' ? playStation(a) : kind === 'playlist' ? onOpenPlaylist(a.id) : onOpenAlbum())}
                />
              ))}
            </div>
          )}
        </>
      );
    }
    // default saved albums
    const savedSet = new Set(byKind('album'));
    const savedAlbums = data.allAlbums.filter((a) => savedSet.has(a.id));
    const list = savedAlbums.length ? savedAlbums : data.savedAlbums;
    return (
      <>
        <h2 className="text-white font-semibold text-[clamp(20px,2vw,30px)] mb-4">My Saved Albums</h2>
        {list.length === 0 ? (
          <div className="text-white/40 py-16">No saved albums yet. Tap the heart on any album to save it.</div>
        ) : (
          <div className="grid grid-cols-5 gap-5">
            {list.map((a) => (
              <GridCard key={a.id} item={a} tag="Album" kind="album" highlight={savedSet.has(a.id)} onClick={onOpenAlbum} />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="grid grid-cols-[0.7fr_2.3fr] gap-8">
      <aside>
        <div className="mb-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Artists, Songs, Radios…"
            className="w-full bg-white/8 border border-white/10 rounded-full px-5 py-3 text-white text-[clamp(14px,1.2vw,18px)] placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
          />
        </div>
        <h3 className="text-white font-semibold text-[clamp(16px,1.5vw,24px)] mb-3">Recent Searches</h3>
        <div className="flex flex-col gap-1 mb-8">
          {recentSearches.map((s) => (
            <button
              key={s}
              onClick={() => { setQuery(s); setActiveRecent(s); setActiveLib(''); }}
              className={`text-left px-4 py-2.5 rounded-xl text-[clamp(15px,1.3vw,20px)] transition ${
                activeRecent === s && query === s ? 'bg-white/10 text-white font-semibold ring-1 ring-white/15' : 'text-white/55 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <h3 className="text-white font-semibold text-[clamp(16px,1.5vw,24px)] mb-3">Library</h3>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => { setActiveLib(''); setQuery(''); }}
            className={`text-left px-4 py-2.5 rounded-xl text-[clamp(15px,1.3vw,20px)] transition ${
              activeLib === '' && !query ? 'bg-white/10 text-white font-semibold ring-1 ring-white/15' : 'text-white/55 hover:text-white'
            }`}
          >
            All Saved
          </button>
          {libraryItems.map((s) => (
            <button
              key={s.label}
              onClick={() => { setActiveLib(s.kind); setQuery(''); }}
              className={`text-left px-4 py-2.5 rounded-xl text-[clamp(15px,1.3vw,20px)] transition ${
                activeLib === s.kind ? 'bg-white/10 text-white font-semibold ring-1 ring-white/15' : 'text-white/55 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-white/[0.06] border border-white/10 p-4">
          <p className="text-white font-semibold text-[clamp(15px,1.2vw,20px)] mb-3">Create Playlist</p>
          <input
            value={playlistTitle}
            onChange={(e) => setPlaylistTitle(e.target.value)}
            placeholder="Playlist name"
            className="w-full bg-black/30 border border-white/10 rounded-full px-4 py-3 text-white placeholder:text-white/35 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
          />
          <button
            onClick={onCreatePlaylist}
            className="mt-3 w-full rounded-full bg-white text-black font-bold py-3 flex items-center justify-center gap-2 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-cyan-300 transition"
          >
            <Plus className="w-5 h-5" /> Create
          </button>
        </div>
      </aside>

      <div>
        {query.trim().length >= 2 ? (
          <>
            <h2 className="text-white font-semibold text-[clamp(20px,2vw,30px)] mb-4 flex items-center gap-3">
              Results for “{query.trim()}”
              {searching && <Loader2 className="w-5 h-5 animate-spin text-cyan-300" />}
            </h2>
            {searching && !results ? (
              <div className="grid grid-cols-5 gap-5">
                {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)}
              </div>
            ) : !hasResults ? (
              <div className="text-white/40 py-16">No matches found. Try another search.</div>
            ) : (
              <div className="space-y-8">
                {results!.artists.length > 0 && (
                  <section>
                    <h3 className="text-white/70 font-semibold mb-3 text-[clamp(15px,1.4vw,20px)]">Artists</h3>
                    <div className="grid grid-cols-5 gap-5">
                      {results!.artists.map((a) => (
                        <GridCard key={a.id} item={a} tag="Artist" kind="artist" onClick={() => onOpenArtist(a.id)} />
                      ))}
                    </div>
                  </section>
                )}
                {results!.albums.length > 0 && (
                  <section>
                    <h3 className="text-white/70 font-semibold mb-3 text-[clamp(15px,1.4vw,20px)]">Albums</h3>
                    <div className="grid grid-cols-5 gap-5">
                      {results!.albums.map((a) => (
                        <GridCard key={a.id} item={a} tag="Album" kind="album" onClick={onOpenAlbum} />
                      ))}
                    </div>
                  </section>
                )}
                {results!.stations.length > 0 && (
                  <section>
                    <h3 className="text-white/70 font-semibold mb-3 text-[clamp(15px,1.4vw,20px)]">Stations</h3>
                    <div className="grid grid-cols-5 gap-5">
                      {results!.stations.map((s) => (
                        <GridCard key={s.id} item={s} tag="Station" kind="station" onClick={() => playStation(s)} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        ) : (
          renderLibrary()
        )}
      </div>
    </div>
  );
};

export default SearchLibraryScreen;
