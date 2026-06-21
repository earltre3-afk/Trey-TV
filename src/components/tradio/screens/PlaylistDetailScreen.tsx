import React, { useState } from 'react';
import { Heart, Play } from 'lucide-react';
import TradioHeader from '../TradioHeader';
import TrackRow from '../TrackRow';
import NeonButton from '../NeonButton';
import { PLAYLIST_DETAIL } from '../../../data/mockData';
import { useSaved } from '../../../contexts/SavedContext';
import { useTradioDataState } from '../../../contexts/TradioDataContext';


interface Props {
  currentId?: string;
  playlistId: string | null;
  onPlayTrack: (index: number, tracks?: any[]) => void;
  onPlayPlaylist: (tracks?: any[]) => void;
  onBrowse: () => void;
}

export default function PlaylistDetailScreen({
  currentId,
  playlistId,
  onPlayTrack,
  onPlayPlaylist,
  onBrowse,
}: Props) {
  const [tab, setTab] = useState('Explore');
  const { isTrackSaved, toggleTrack, isPlaylistSaved, togglePlaylist } = useSaved();
  const { playlists } = useTradioDataState();

  const customPlaylist = playlists?.find((p) => p.id === playlistId);

  const playlistTitle = customPlaylist ? customPlaylist.title : PLAYLIST_DETAIL.title;
  const playlistArtist = customPlaylist ? customPlaylist.creatorName : PLAYLIST_DETAIL.artist;
  const playlistArtwork = customPlaylist
    ? 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384757469_41d1b4e5.jpg'
    : PLAYLIST_DETAIL.artwork;
  const playlistDescription = customPlaylist
    ? customPlaylist.description || 'Custom playlist created by ' + customPlaylist.creatorName
    : PLAYLIST_DETAIL.description;

  const tracks = customPlaylist
    ? customPlaylist.tracks.map((t, idx) => ({
        id: t.id || `custom-t-${idx}`,
        n: idx + 1,
        title: t.title,
        artist: t.artist || customPlaylist.creatorName,
        time: t.time || '3:30',
        artwork: t.artwork || 'https://d64gsuwffb70l.cloudfront.net/6a2dc5b5ed1f99f26cee7943_1781384757469_41d1b4e5.jpg',
        src: t.src || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      }))
    : PLAYLIST_DETAIL.tracks;

  const playlistMeta = customPlaylist
    ? `${tracks.length} Tracks • ${tracks.length * 3} Min`
    : PLAYLIST_DETAIL.meta;

  const activeId = tracks.some((t) => t.id === currentId) ? currentId : tracks[0]?.id;
  const plId = playlistId || 'p1';
  const playlistSaved = isPlaylistSaved(plId);

  return (
    <>
      <TradioHeader
        tabs={['Explore', 'Browse']}
        activeTab={tab}
        onTabChange={(t) => {
          setTab(t);
          if (t === 'Browse') onBrowse();
        }}
      />
      <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        <div className="flex gap-4 px-5 pt-2 pb-5">
          <img
            src={playlistArtwork}
            alt={playlistTitle}
            className="w-40 h-40 rounded-2xl object-cover border border-white/[0.06] shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold tracking-widest text-amber-400 mb-1">
              {customPlaylist ? 'MY PLAYLIST' : 'FEATURED PLAYLIST'}
            </p>

            <h1 className="text-2xl font-black text-white leading-tight">{playlistTitle}</h1>
            <p className="text-white/55 text-sm mb-2">{playlistArtist}</p>
            <p className="text-white/55 text-xs leading-snug mb-2">{playlistDescription}</p>
            <p className="text-white/45 text-xs font-medium mb-3">{playlistMeta}</p>
            <div className="flex items-center gap-2">
              <NeonButton onClick={() => onPlayPlaylist(tracks)} className="px-5 py-2 text-sm" disabled={tracks.length === 0}>
                <Play className="w-4 h-4" fill="currentColor" />
                Play Playlist
              </NeonButton>
              <button
                onClick={() =>
                  togglePlaylist({
                    id: plId,
                    title: playlistTitle,
                    subtitle: playlistArtist,
                    image: playlistArtwork,
                    visibility: 'private',
                  })
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition ${
                  playlistSaved
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-white/[0.06] border-white/10 text-white/70'
                }`}
                aria-label={playlistSaved ? 'Unsave playlist' : 'Save playlist'}
              >
                <Heart className="w-4 h-4" fill={playlistSaved ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        <div className="px-2 space-y-1">
          {tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              n={t.n}
              title={t.title}
              artist={t.artist}
              time={t.time}
              active={t.id === activeId}
              saved={isTrackSaved(t.id)}
              onClick={() => onPlayTrack(i, tracks)}
              onToggleSave={() =>
                toggleTrack({
                  id: t.id,
                  title: t.title,
                  artist: t.artist,
                  artwork: t.artwork,
                  src: t.src,
                })
              }
            />
          ))}
          {tracks.length === 0 && (
            <div className="text-white/40 text-center py-8 text-sm">
              No tracks in this playlist yet. Add songs from Search or Browse.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
