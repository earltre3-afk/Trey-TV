import React from 'react';
import { Plus, Bookmark, MoreHorizontal, Users, Radio, Star, Globe, Mic, Play } from 'lucide-react';
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, IconButton, VerifiedBadge, PlayCircle, Waveform, SectionHeader } from '../ui';
import { IMG, ROTATION, TRACKS } from '../data';
import { usePlayer } from '@/tradio/contexts/PlayerContext';

const VOICE_DROPS = [
  { id: 'vd1', title: 'Tap In With Trizzy', dur: '00:07', track: TRACKS.midnightVelvet },
  { id: 'vd2', title: 'Late Night Vibes', dur: '00:06', track: TRACKS.sixAmThoughts },
  { id: 'vd3', title: 'Real One Radio', dur: '00:05', track: TRACKS.treyTrizzyRadio },
];

const INFLUENCES = [
  { name: 'Future', img: IMG.dariusCole },
  { name: 'J. Cole', img: IMG.noahKade },
  { name: 'Young Thug', img: IMG.treyTrizzy },
  { name: 'Drake', img: IMG.jordan },
  { name: 'Kid Cudi', img: IMG.dariusCole },
];

const FAVES = [
  { title: 'Midnight Velvet', sub: 'Soul - R&B - Late Night', img: IMG.midnightVelvet, track: TRACKS.midnightVelvet },
  { title: 'Neon Heartbreak', sub: 'Pop - Indie - Heartfelt', img: IMG.neonHeartbreak, track: TRACKS.neonHeartbreak },
  { title: '6AM Thoughts', sub: 'Trey Trizzy', img: IMG.treyTrizzy, track: TRACKS.sixAmThoughts },
  { title: 'Instant Drop', sub: 'Zaylen', img: IMG.instantDrop, badge: 'NEW', track: TRACKS.instantDrop },
  { title: 'Memphis After Dark', sub: 'Blues - Soul - Classic', img: IMG.memphisAfterDark, track: TRACKS.memphisAfterDark },
];

export const ArtistStationScreen: React.FC<{
  onBack: () => void;
  onOpenSongWars?: (dest?: { view: 'hub' | 'setup' | 'stage' | 'results' | 'replay'; battleId?: string }) => void;
}> = ({ onBack, onOpenSongWars }) => {
  const { play, playQueue, currentTrack, isPlaying } = usePlayer();
  const rotationTracks = ROTATION.map((r) => r.track);
  const artistStationSource = {
    id: 'trey-trizzy-radio',
    type: 'artist_station' as const,
    label: 'Artist Station',
    title: 'Trey Trizzy Radio',
    subtitle: 'Trey Trizzy',
    image: IMG.treyTrizzy,
    isLive: true,
    listenerCount: 128000,
  };

  return (
    <div className="space-y-8 pb-4 lg:space-y-10">
      <TopBar showBack onBack={onBack} centerLogo />

      {/* Hero */}
      <div className="relative">
        <img src={IMG.treyTrizzy} alt="" className="absolute right-0 top-0 h-[280px] w-full object-cover opacity-90" />
        <div className="absolute inset-x-0 top-0 h-[280px] bg-gradient-to-r from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-[280px] bg-gradient-to-b from-transparent via-transparent to-[#0A0A0F]" />
        <div className="relative px-4 pt-2 sm:px-6 lg:px-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-1 text-[11px] font-semibold text-purple-200">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> ARTIST-OWNED STATION
          </span>
          <h1 className="mt-3 text-[44px] font-black leading-[0.95] tracking-tight text-white">
            TREY<br />TRIZZY<br /><span className="text-fuchsia-400">RADIO</span>
          </h1>
          <div className="mt-3 flex items-center gap-2">
            <VerifiedBadge />
            <div>
              <div className="text-sm font-semibold text-white">@treytrizzy</div>
              <div className="text-[11px] text-white/55">128K Followers</div>
            </div>
          </div>
          <p className="mt-3 max-w-[70%] text-sm text-white/70">The official station. The real me. No skips.</p>
          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <PrimaryButton className="flex-1" onClick={() => playQueue(rotationTracks.map((track) => ({ ...track, sourceType: 'artist_station', sourceLabel: 'Artist Station', isLive: true })), 0, artistStationSource)}>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                <Play className="h-3 w-3 fill-white" />
              </span>
              Play Station
            </PrimaryButton>
            <SecondaryButton><Plus className="h-4 w-4" /> Follow</SecondaryButton>
            <SecondaryButton><Bookmark className="h-4 w-4" /> Save</SecondaryButton>
            <IconButton><MoreHorizontal className="h-5 w-5" /></IconButton>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard className="grid grid-cols-4 gap-2 p-4">
          {[
            { icon: <Users className="h-4 w-4 text-purple-300" />, value: '128K', label: 'Followers' },
            { icon: <Radio className="h-4 w-4 text-purple-300" />, value: '24/7', label: 'Always On' },
            { icon: <Star className="h-4 w-4 text-purple-300" />, value: '100%', label: 'Artist Curated' },
            { icon: <Globe className="h-4 w-4 text-purple-300" />, value: 'Global', label: 'Listeners' },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center text-center">
              <div className="mb-1">{s.icon}</div>
              <div className="text-base font-bold text-white">{s.value}</div>
              <div className="text-[10px] text-white/55">{s.label}</div>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Song Wars Artist PvP Board */}
      {onOpenSongWars && (
        <div className="px-4 sm:px-6 lg:px-10 animate-fade-in">
          <GlassCard className="p-5 bg-gradient-to-r from-[#1B0B2E] via-[#0A0A0F] to-[#0A0A0F] border-purple-500/25">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/25 text-fuchsia-400 font-bold">
                  VS
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">Challenge Trey Trizzy</h3>
                  <p className="text-xs text-white/50">Pitch a PvP Song War. Go song-for-song with live fan voting.</p>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onOpenSongWars({ view: 'setup' })}
                  className="flex-1 sm:flex-none text-center rounded-full bg-fuchsia-500 px-4 py-2 text-xs font-bold text-white hover:bg-fuchsia-600 shadow-[0_4px_12px_rgba(244,63,94,0.3)] whitespace-nowrap"
                >
                  Start Song War
                </button>
                <button
                  onClick={() => onOpenSongWars({ view: 'replay', battleId: 'replay-1' })}
                  className="flex-1 sm:flex-none text-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/10 whitespace-nowrap"
                >
                  View Past Battles
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* About + Voice drop */}
      <div className="space-y-3 px-4 sm:px-6 lg:px-10">
        <GlassCard className="p-4">
          <div className="text-[11px] font-bold tracking-wider text-white/60">ABOUT THIS STATION</div>
          <p className="mt-2 text-sm leading-relaxed text-white/75">
            Trey Trizzy Radio is where you'll hear the music that inspires me, the sounds I'm creating, and the vibes I live by. Hip-hop. Trap. Real stories. No filters.
          </p>
          <button className="mt-2 text-xs font-semibold text-purple-300">Show More</button>
        </GlassCard>
        <GlassCard className="flex items-center gap-3 p-3.5">
          <PlayCircle size={42} onClick={() => play({ ...TRACKS.treyTrizzyRadio, sourceType: 'artist_station', sourceLabel: 'Voice Drop', station: 'Trey Trizzy Radio' }, undefined, artistStationSource)} />
          <div className="flex-1">
            <div className="text-[11px] text-white/55">Now Playing Voice Drop</div>
            <div className="text-sm font-semibold italic text-white">"Welcome to Trey Trizzy Radio"</div>
            <div className="mt-1 flex items-center gap-2">
              <Waveform className="h-3 w-20" bars={20} />
              <span className="text-[11px] text-white/55">00:08</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Current rotation */}
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mb-2 text-[11px] font-bold tracking-wider text-white/60">CURRENT ROTATION</div>
        <GlassCard className="divide-y divide-white/5">
          {ROTATION.map((r, i) => {
            const live = currentTrack?.id === r.track.id && isPlaying;
            return (
              <button
                key={r.n}
                onClick={() => playQueue(rotationTracks.map((track) => ({ ...track, sourceType: 'artist_station', sourceLabel: 'Artist Station', isLive: true })), i, artistStationSource)}
                className={`flex w-full items-center gap-3 p-3 text-left transition hover:bg-white/[0.03] ${live ? 'bg-purple-500/5' : ''}`}
              >
                <span className={`w-5 text-sm font-semibold ${live ? 'text-purple-300' : 'text-white/50'}`}>{r.n}</span>
                <img src={r.img} alt="" className="h-10 w-10 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className={`truncate text-sm font-semibold ${live ? 'text-purple-300' : 'text-white'}`}>{r.title}</div>
                  <div className="truncate text-[11px] text-white/55">{r.artist}</div>
                </div>
                <Waveform className={`h-4 w-12 ${live ? 'opacity-100' : 'opacity-50'}`} bars={16} />
                <span className="text-[11px] text-white/55">{r.dur}</span>
              </button>
            );
          })}
        </GlassCard>
      </div>

      {/* Voice drops */}
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/60">VOICE DROPS</div>
          <button className="text-xs text-purple-300">See All</button>
        </div>
        <GlassCard className="divide-y divide-white/5">
          {VOICE_DROPS.map((v) => (
            <div key={v.id} className="flex items-center gap-3 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                <Mic className="h-4 w-4 text-purple-300" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{v.title}</div>
                <div className="text-[11px] text-white/55">{v.dur}</div>
              </div>
              <PlayCircle size={32} onClick={() => play({ ...v.track, sourceType: 'artist_station', sourceLabel: 'Voice Drop', station: 'Trey Trizzy Radio' }, undefined, artistStationSource)} />
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Influences */}
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[11px] font-bold tracking-wider text-white/60">INFLUENCES</div>
          <button className="text-xs text-purple-300">See All</button>
        </div>
        <div className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {INFLUENCES.map((i) => (
            <div key={i.name} className="flex shrink-0 flex-col items-center">
              <img src={i.img} alt={i.name} className="h-14 w-14 rounded-full border border-white/10 object-cover" />
              <div className="mt-1 text-[11px] text-white/70">{i.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fan favorites */}
      <div>
        <SectionHeader title="Fan Favorites" onSeeAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FAVES.map((f) => (
            <div key={f.title} className="w-[140px] shrink-0">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                <img src={f.img} alt="" className="h-full w-full object-cover" />
                <span className="absolute bottom-2 right-2">
                  <PlayCircle size={32} onClick={() => play({ ...f.track, sourceType: 'artist_station', sourceLabel: 'Artist Station', station: 'Trey Trizzy Radio' }, undefined, artistStationSource)} />
                </span>
                {f.badge && (
                  <span className="absolute right-2 top-2 rounded bg-cyan-400/20 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300">
                    {f.badge}
                  </span>
                )}
              </div>
              <div className="mt-2 truncate text-xs font-semibold text-white">{f.title}</div>
              <div className="truncate text-[10px] text-white/55">{f.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistStationScreen;
