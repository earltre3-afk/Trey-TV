import React, { useEffect, useState } from 'react';
import { Pause, Play, Loader2, ListMusic, Clock } from 'lucide-react';
import { GRADIENTS, Track } from '../mockData';
import { fetchPlaylistTracks, totalDurationSec, PlaylistDetail } from '../api';
import CardArt from '../components/CardArt';
import SaveButton from '../components/SaveButton';
import { usePlayer, fmt } from '../PlayerContext';

interface Props {
  playlistId: string | null;
  onPlay: () => void;
}

const toPlayerTrack = (t: Track) => ({
  id: t.id, title: t.title, artist: t.artist,
  gradient: t.gradient ?? GRADIENTS.city, streamUrl: t.streamUrl,
});

const PlaylistDetailScreen: React.FC<Props> = ({ playlistId, onPlay }) => {
  const [detail, setDetail] = useState<PlaylistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { current, playing, elapsed, duration, loading: audioLoading, playTrack, setQueue } = usePlayer();

  useEffect(() => {
    if (!playlistId) return;
    setLoading(true);
    fetchPlaylistTracks(playlistId)
      .then((d) => {
        setDetail(d);
        setQueue(d.tracks.map(toPlayerTrack));
      })
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [playlistId, setQueue]);

  const playAll = () => {
    if (!detail?.tracks.length) return;
    setQueue(detail.tracks.map(toPlayerTrack));
    playTrack(toPlayerTrack(detail.tracks[0]));
    onPlay();
  };

  const handle = (t: Track) => {
    playTrack(toPlayerTrack(t));
    onPlay();
  };

  if (loading || !detail) {
    return (
      <div className="grid grid-cols-[0.9fr_1.4fr] gap-10">
        <div className="w-full aspect-square rounded-3xl bg-white/5 animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { playlist, tracks } = detail;
  const totalSec = totalDurationSec(tracks);

  return (
    <div className="grid grid-cols-[0.9fr_1.4fr] gap-10">
      <div>
        <CardArt
          item={{ id: playlist.id, title: '', gradient: playlist.gradient ?? GRADIENTS.violet }}
          className="w-full aspect-square ring-2 ring-cyan-400/40 shadow-[0_0_40px_rgba(34,211,238,0.3)]"
          rounded="rounded-3xl"
        />
        <div className="flex items-start justify-between gap-3 mt-5">
          <div>
            <p className="text-cyan-300/80 font-semibold uppercase tracking-widest text-[clamp(11px,0.9vw,14px)]">Playlist</p>
            <h1 className="text-white font-extrabold text-[clamp(26px,2.8vw,48px)] leading-tight">{playlist.title}</h1>
            <p className="text-white/55 text-[clamp(14px,1.3vw,22px)]">{playlist.subtitle ?? 'Tradio'}</p>
          </div>
          <SaveButton id={playlist.id} kind="playlist" />
        </div>

        <div className="flex items-center gap-5 mt-4 text-white/55 text-[clamp(13px,1.1vw,18px)]">
          <span className="flex items-center gap-2"><ListMusic className="w-4 h-4" />{tracks.length} tracks</span>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{fmt(totalSec)} min</span>
        </div>

        <button
          onClick={playAll}
          disabled={!tracks.length}
          className="mt-6 inline-flex items-center gap-3 bg-white text-black font-bold px-8 py-3.5 rounded-full text-[clamp(15px,1.3vw,20px)] shadow-[0_0_28px_rgba(34,211,238,0.5)] hover:scale-[1.03] transition disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        >
          <Play className="w-5 h-5 fill-black" /> Play Playlist
        </button>
      </div>

      <div className="flex flex-col">
        {tracks.length === 0 && (
          <div className="text-white/40 py-16 text-center">This playlist has no tracks yet.</div>
        )}
        {tracks.map((t, i) => {
          const active = current?.id === t.id;
          const pct = active && duration ? (elapsed / duration) * 100 : 0;
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
                  : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate text-[clamp(15px,1.4vw,22px)]">{t.title}</p>
                <p className="text-white/45 truncate text-[clamp(12px,1vw,16px)]">{t.artist}</p>
              </div>
              {active && (
                <div className="w-32 h-1.5 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full bg-cyan-300 rounded-full transition-all" style={{ width: `${pct}%` }} />
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

export default PlaylistDetailScreen;
