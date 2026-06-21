import React, { useEffect, useState } from 'react';
import { Play, ChevronRight, Heart, Loader2 } from 'lucide-react';
import { fetchArtistById, ArtistDetail } from '../api';
import { GRADIENTS } from '../mockData';
import CardArt from '../components/CardArt';
import TradioCard from '../components/TradioCard';
import TradioRail from '../components/TradioRail';
import SaveButton from '../components/SaveButton';
import { usePlayer } from '../PlayerContext';
import { useSaved } from '../saved';

interface Props {
  artistId: string | null;
  onPlay: () => void;
  onOpenArtist: (id: string) => void;
}

const ArtistProfileScreen: React.FC<Props> = ({ artistId, onPlay, onOpenArtist }) => {
  const [detail, setDetail] = useState<ArtistDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { playTrack, setQueue } = usePlayer();
  const { has, toggle } = useSaved();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    const id = artistId ?? 'a1';
    fetchArtistById(id)
      .then((d) => { if (alive) { setDetail(d); setLoading(false); } })
      .catch((e) => { if (alive) { setError(e?.message ?? 'Failed'); setLoading(false); } });
    return () => { alive = false; };
  }, [artistId]);

  if (loading || !detail) {
    return <div className="h-[60vh] grid place-items-center text-white/40"><Loader2 className="w-8 h-8 animate-spin text-cyan-300" /></div>;
  }
  if (error) {
    return <div className="h-[60vh] grid place-items-center text-white/40">Couldn't load this artist.</div>;
  }

  const { artist, topTracks, discography, relatedArtists } = detail;
  const following = has(artist.id);
  const grad = artist.gradient ?? GRADIENTS.cyanBlue;
  const nameParts = artist.title.toUpperCase().split(' ');

  const startRadio = () => {
    const queue = topTracks.map((t) => ({
      id: t.id, title: t.title, artist: t.artist ?? artist.title,
      gradient: t.gradient ?? grad, streamUrl: t.streamUrl,
    }));
    setQueue(queue);
    if (queue[0]) playTrack(queue[0]);
    onPlay();
  };

  const playOne = (t: typeof topTracks[number]) => {
    setQueue(topTracks.map((x) => ({ id: x.id, title: x.title, artist: x.artist ?? artist.title, gradient: x.gradient ?? grad, streamUrl: x.streamUrl })));
    playTrack({ id: t.id, title: t.title, artist: t.artist ?? artist.title, gradient: t.gradient ?? grad, streamUrl: t.streamUrl });
    onPlay();
  };

  return (
    <div className="grid grid-cols-[1fr_1.3fr] gap-8 -mx-8 -mb-8">
      <div className="relative pl-8 pb-8 flex flex-col justify-between min-h-[60vh]" style={{ background: grad }}>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent" />
        <div className="relative pt-2">
          <p className="text-white/80 text-[clamp(16px,1.4vw,24px)] mb-2">Artist Profile</p>
          <h1 className="text-black font-black leading-[0.9] text-[clamp(44px,5.5vw,100px)] tracking-tight">
            {nameParts.map((p, i) => <span key={i} className="block">{p}</span>)}
          </h1>
        </div>
        <div className="relative flex flex-col gap-4 items-start">
          <button
            onClick={() => toggle(artist.id, 'artist')}
            className={`font-bold rounded-full px-8 py-2.5 text-[clamp(15px,1.3vw,20px)] flex items-center gap-2 transition ${
              following ? 'bg-fuchsia-500 text-white shadow-[0_0_22px_rgba(217,70,239,0.6)]' : 'bg-white/90 text-black hover:bg-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${following ? 'fill-white' : ''}`} />
            {following ? 'Following' : 'Follow'}
          </button>
          <button
            onClick={startRadio}
            className="bg-black/70 text-white font-bold rounded-full px-7 py-2.5 flex items-center gap-2 text-[clamp(15px,1.3vw,20px)] hover:bg-black transition"
          >
            <Play className="w-5 h-5 fill-white" /> Start Radio
          </button>
        </div>
      </div>

      <div className="pr-8 pb-8 grid grid-cols-2 gap-x-8 content-start">
        <div>
          <h2 className="text-white font-semibold text-[clamp(18px,1.8vw,28px)] mb-3">Top Tracks</h2>
          <div className="bg-white/5 rounded-2xl p-2">
            {topTracks.length === 0 && <p className="text-white/40 p-4">No tracks yet.</p>}
            {topTracks.map((t) => (
              <button key={t.id} onClick={() => playOne(t)} className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition text-left group">
                <CardArt item={{ id: t.id, title: '', gradient: t.gradient ?? grad }} className="w-12 h-12" rounded="rounded-lg" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-[clamp(14px,1.1vw,18px)] truncate">{t.title}</p>
                  <p className="text-white/50 text-[clamp(12px,0.9vw,14px)] truncate">{t.artist ?? artist.title}</p>
                </div>
                <span className="text-white/40 text-sm tabular-nums mr-1">{t.duration}</span>
                <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-cyan-300" />
              </button>
            ))}
          </div>
        </div>
        <TradioRail title="Discography">
          {discography.map((d) => (
            <div key={d.id} className="relative shrink-0">
              <TradioCard item={d} onClick={onPlay} />
              <div className="absolute top-1.5 right-1.5"><SaveButton id={d.id} kind="album" /></div>
            </div>
          ))}
        </TradioRail>
        <div className="col-span-2 mt-2">
          <TradioRail title="Related Artists">
            {relatedArtists.map((r) => <TradioCard key={r.id} item={r} onClick={() => onOpenArtist(r.id)} />)}
          </TradioRail>
        </div>
      </div>
    </div>
  );
};

export default ArtistProfileScreen;
