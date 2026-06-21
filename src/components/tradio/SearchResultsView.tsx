import React from 'react';
import { Play, Music, Mic2, Radio as RadioIcon, SearchX, Heart } from 'lucide-react';
import { usePlayer } from '../../contexts/PlayerContext';
import { useSaved } from '../../contexts/SavedContext';
import {
  searchAll,
  SEARCH_TRACKS,
  SearchEntity,
} from '../../data/mockData';

interface Props {
  query: string;
}

function EntityCard({
  item,
  icon,
  saved,
  onToggleSave,
}: {
  item: SearchEntity;
  icon: React.ElementType;
  saved?: boolean;
  onToggleSave?: () => void;
}) {
  const Icon = icon;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] active:bg-white/[0.07] active:scale-[0.99] transition">
      {item.image ? (
        <img src={item.image} alt={item.title} className="w-12 h-12 rounded-xl object-cover object-top" />
      ) : (
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.tone || 'from-amber-500 to-yellow-700'} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-black" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{item.title}</p>
        <p className="text-white/45 text-xs truncate">{item.subtitle}</p>
      </div>
      {onToggleSave ? (
        <button
          onClick={onToggleSave}
          aria-label={saved ? 'Unsave' : 'Save'}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition"
        >
          <Heart
            className={`w-5 h-5 ${saved ? 'text-amber-400' : 'text-white/30'}`}
            fill={saved ? 'currentColor' : 'none'}
          />
        </button>
      ) : (
        <Icon className="w-4 h-4 text-white/25" />
      )}
    </div>
  );
}

import { useTradioDataState } from '../../contexts/TradioDataContext';

export default function SearchResultsView({ query }: Props) {
  const { releasedTracks } = useTradioDataState();
  const { playTrack, current, isPlaying } = usePlayer();
  const { isTrackSaved, toggleTrack, isPlaylistSaved, togglePlaylist } = useSaved();

  const results = React.useMemo(() => {
    const rawResults = searchAll(query);
    const lowercaseQuery = query.toLowerCase();

    // Filter custom tracks that are released (instant or scheduled date in the past)
    const customReleased = (releasedTracks || []).filter((t) => {
      // release check
      const isReleased =
        t.releaseType === 'instant' ||
        (t.releaseDate && new Date(t.releaseDate).getTime() <= Date.now());
      if (!isReleased) return false;

      // search query match
      const titleMatch = t.title.toLowerCase().includes(lowercaseQuery);
      const artistMatch = t.artistName.toLowerCase().includes(lowercaseQuery);
      return titleMatch || artistMatch;
    });

    const mappedCustomTracks = customReleased.map((t) => ({
      id: t.id,
      title: t.title,
      artist: t.artistName,
      artwork: 'https://d64gsuwffb70l.cloudfront.net/6a05429725f8777cb511ee72_1778730889057_b6e69acc.png', // default artwork
      src: t.audioUrl || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // default audio
    }));

    return {
      ...rawResults,
      tracks: [...mappedCustomTracks, ...rawResults.tracks],
      total: rawResults.total + mappedCustomTracks.length,
    };
  }, [query, releasedTracks]);

  if (results.total === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-8">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center mb-4">
          <SearchX className="w-7 h-7 text-white/40" />
        </div>
        <p className="text-white font-semibold">No results for “{query}”</p>
        <p className="text-white/40 text-sm mt-1">Try a track, artist, playlist, or radio name.</p>
      </div>
    );
  }

  return (
    <div className="space-y-7 px-5">
      {results.tracks.length > 0 && (
        <section>
          <h3 className="text-white font-bold text-base mb-3">
            Songs <span className="text-white/30 font-medium">· {results.tracks.length}</span>
          </h3>
          <div className="space-y-2">
            {results.tracks.map((t) => {
              const active = current?.id === t.id && isPlaying;
              const saved = isTrackSaved(t.id);
              return (
                <div
                  key={t.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl border transition ${
                    active ? 'tradio-active-pill' : 'bg-white/[0.04] border-white/[0.06]'
                  }`}
                >
                  <button
                    onClick={() => playTrack(t, SEARCH_TRACKS)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left active:scale-[0.99] transition-transform"
                  >
                    <div className="relative shrink-0">
                      <img src={t.artwork} alt={t.title} className="w-12 h-12 rounded-xl object-cover object-top" />
                      <div className="absolute inset-0 rounded-xl bg-black/35 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${active ? 'text-amber-300' : 'text-white'}`}>
                        {t.title}
                      </p>
                      <p className="text-white/45 text-xs truncate">{t.artist}</p>
                    </div>
                  </button>
                  {active && (
                    <div className="flex items-end gap-0.5 h-4">
                      <span className="w-0.5 bg-amber-400 animate-pulse" style={{ height: '60%' }} />
                      <span className="w-0.5 bg-amber-400 animate-pulse" style={{ height: '100%', animationDelay: '0.15s' }} />
                      <span className="w-0.5 bg-amber-400 animate-pulse" style={{ height: '40%', animationDelay: '0.3s' }} />
                    </div>
                  )}
                  <button
                    onClick={() => toggleTrack(t)}
                    aria-label={saved ? 'Unsave' : 'Save'}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition shrink-0"
                  >
                    <Heart
                      className={`w-5 h-5 ${saved ? 'text-amber-400' : 'text-white/30'}`}
                      fill={saved ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {results.artists.length > 0 && (
        <section>
          <h3 className="text-white font-bold text-base mb-3">
            Artists <span className="text-white/30 font-medium">· {results.artists.length}</span>
          </h3>
          <div className="space-y-2">
            {results.artists.map((a) => (
              <EntityCard key={a.id} item={a} icon={Mic2} />
            ))}
          </div>
        </section>
      )}

      {results.playlists.length > 0 && (
        <section>
          <h3 className="text-white font-bold text-base mb-3">
            Playlists <span className="text-white/30 font-medium">· {results.playlists.length}</span>
          </h3>
          <div className="space-y-2">
            {results.playlists.map((p) => (
              <EntityCard
                key={p.id}
                item={p}
                icon={Music}
                saved={isPlaylistSaved(p.id)}
                onToggleSave={() => togglePlaylist({ id: p.id, title: p.title, subtitle: p.subtitle, image: p.image })}
              />
            ))}
          </div>
        </section>
      )}

      {results.radios.length > 0 && (
        <section>
          <h3 className="text-white font-bold text-base mb-3">
            Radios <span className="text-white/30 font-medium">· {results.radios.length}</span>
          </h3>
          <div className="space-y-2">
            {results.radios.map((r) => (
              <EntityCard key={r.id} item={r} icon={RadioIcon} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
