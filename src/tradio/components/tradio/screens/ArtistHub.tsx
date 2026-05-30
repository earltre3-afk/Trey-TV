import React from 'react';
import { Bell, CalendarDays, Heart, ListMusic, Music, Radio, Send, Sparkles, UploadCloud, Users, Mic2 } from 'lucide-react';
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, VerifiedBadge, Waveform, ReleaseCard } from '../ui';
import { ALL_STATIONS, ARTIST_PLAYLISTS, ARTIST_PROFILES, RELEASES, STATION_COMMUNITIES, TRACKS, VOICE_DROPS } from '../data';
import { AccessGate } from '../auth/components';

const fanReactions = STATION_COMMUNITIES['station-trey-trizzy'].messages.slice(0, 3);
const artist = ARTIST_PROFILES[0];
const station = ALL_STATIONS.find((item) => item.id === 'station-trey-trizzy') || ALL_STATIONS[0];
const pinnedRelease = RELEASES.find((release) => release.artist === artist.name) || RELEASES[0];

export const ArtistHub: React.FC<{
  onOpenRelease?: () => void;
  onOpenSchedule?: () => void;
  onOpenBroadcastStudio?: (initialTab?: string) => void;
  onViewPublicProfile?: () => void;
  onEditProfile?: () => void;
}> = ({
  onOpenRelease,
  onOpenSchedule,
  onOpenBroadcastStudio,
  onViewPublicProfile,
  onEditProfile,
}) => (
  <AccessGate
    capability="release-music"
    title="Artist access required"
    message="Switch to Artist Mode or request artist access to manage releases, playlists, station premieres, and artist-owned radio."
    ctaType="artist"
  >
  <div className="space-y-8 pb-4 lg:space-y-10">
    <TopBar title="Artist Studio" />

    {(onEditProfile || onViewPublicProfile) && (
      <div className="flex flex-wrap gap-2 px-4 sm:px-6 lg:px-10">
        {onEditProfile && <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onEditProfile}>Edit Artist Profile</SecondaryButton>}
        {onViewPublicProfile && <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onViewPublicProfile}>View Public Artist Profile</SecondaryButton>}
      </div>
    )}

    <div className="px-4 sm:px-6 lg:px-10">
      <GlassCard glow className="overflow-hidden">
        <div className="relative min-h-[260px]">
          <img src={artist.avatar} alt="" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
          <div className="relative p-5 sm:p-6">
            <Chip label="Artist Studio" selected icon={<Music className="h-3.5 w-3.5" />} />
            <div className="mt-5 flex max-w-[620px] flex-col gap-4 sm:flex-row sm:items-end">
              <img src={artist.avatar} alt={artist.name} className="h-24 w-24 rounded-2xl border border-white/15 object-cover shadow-premium" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{artist.name}</h1>
                  {artist.verified && <VerifiedBadge />}
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{artist.bio}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Chip label={`${(artist.monthlyListeners / 1000).toFixed(0)}K monthly listeners`} />
                  <Chip label={`${artist.totalReleases} releases`} />
                  <Chip label={`${artist.stationCount} stations owned`} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <PrimaryButton onClick={onOpenRelease}>
                <UploadCloud className="h-4 w-4" /> Release to Tradio
              </PrimaryButton>
              <SecondaryButton>
                <ListMusic className="h-4 w-4" /> Create Fan Playlist
              </SecondaryButton>
              <SecondaryButton onClick={onOpenSchedule}>
                <CalendarDays className="h-4 w-4" /> Schedule Station Premiere
              </SecondaryButton>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>

    <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
      <GlassCard className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Artist Station</div>
            <div className="text-xs text-white/50">Premieres, rotation, requests, and fan notifications</div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full border border-pink-400/40 bg-pink-500/10 px-2.5 py-1 text-[10px] font-bold text-pink-200">
            <span className="h-1.5 w-1.5 rounded-full bg-pink-400" /> LIVE
          </span>
        </div>
        <div className="flex gap-3">
          <img src={station.image} alt="" className="h-24 w-24 rounded-2xl object-cover" />
          <div className="min-w-0 flex-1">
            <div className="text-lg font-bold text-white">{station.title}</div>
            <div className="text-xs text-white/55">{station.genre}</div>
            <p className="mt-2 text-sm leading-relaxed text-white/70">{station.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Chip label="Auto-add new releases" selected />
              <Chip label="Fan requests on" selected />
              <Chip label="Premiere ready" />
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Pinned Release</div>
            <div className="text-xs text-white/50">Featured at the top of the station</div>
          </div>
          <Sparkles className="h-5 w-5 text-fuchsia-300" />
        </div>
        <ReleaseCard
          title={pinnedRelease.title}
          artist={pinnedRelease.artist}
          artwork={pinnedRelease.artwork}
          releasedAt={pinnedRelease.releasedAt}
          streams={pinnedRelease.streams}
        />
        <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="text-xs font-semibold text-white">Station Premiere Controls</div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div className="rounded-xl bg-white/[0.04] p-2 text-white/70">Countdown<br /><span className="font-bold text-cyan-300">18h</span></div>
            <div className="rounded-xl bg-white/[0.04] p-2 text-white/70">Notify<br /><span className="font-bold text-fuchsia-300">86K</span></div>
            <div className="rounded-xl bg-white/[0.04] p-2 text-white/70">Premiere<br /><span className="font-bold text-purple-300">Armed</span></div>
          </div>
        </div>
      </GlassCard>
    </div>

    <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
      <GlassCard className="p-4 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Artist Playlists & Collections</div>
            <div className="text-xs text-white/50">Curated music delivery for fans</div>
          </div>
          <SecondaryButton className="px-3 py-2 text-xs"><ListMusic className="h-3.5 w-3.5" /> New Playlist</SecondaryButton>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ARTIST_PLAYLISTS.map((playlist) => (
            <div key={playlist.id} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <img src={playlist.artwork} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{playlist.title}</div>
                <p className="mt-1 line-clamp-2 text-xs text-white/60">{playlist.description}</p>
                <div className="mt-2 flex items-center gap-2 text-[10px] text-white/45">
                  <span>{playlist.tracks.length} tracks</span>
                  <span>{(playlist.followers / 1000).toFixed(1)}K followers</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="mb-3 text-sm font-semibold text-white">Fan Notifications</div>
        <div className="space-y-2">
          {[
            ['Premiere reminder', '86.3K fans queued'],
            ['Playlist update', '18.9K followers'],
            ['Voice drop', `${VOICE_DROPS.length} reusable drops`],
          ].map(([title, sub]) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <Bell className="h-4 w-4 text-cyan-300" />
              <div>
                <div className="text-xs font-semibold text-white">{title}</div>
                <div className="text-[10px] text-white/50">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>

    <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
      <GlassCard className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Heart className="h-4 w-4 text-pink-300" /> Recent Fan Reactions
        </div>
        <div className="space-y-3">
          {fanReactions.map((reaction) => (
            <div key={reaction.id} className="flex gap-3">
              <img src={reaction.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
              <div className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold text-white">{reaction.author}</span>
                  <span className="text-[10px] text-white/40">{reaction.timestamp}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{reaction.message}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
          <Radio className="h-4 w-4 text-purple-300" /> Upcoming Drops
        </div>
        <div className="space-y-2">
          {[
            ['After Dark EP', 'Station premiere', 'Jun 6'],
            ['Voice note to fans', 'Community drop', 'Tonight'],
            [TRACKS.sixAmThoughts.title, 'Pinned rotation refresh', 'Friday'],
          ].map(([title, type, date]) => (
            <div key={title} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-3">
              <div>
                <div className="text-sm font-semibold text-white">{title}</div>
                <div className="text-xs text-white/50">{type}</div>
              </div>
              <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200">{date}</span>
            </div>
          ))}
        </div>
        <PrimaryButton className="mt-3 w-full py-3" onClick={onOpenRelease}>
          <Send className="h-4 w-4" /> Release to Tradio
        </PrimaryButton>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <SecondaryButton onClick={() => onOpenBroadcastStudio?.('builder')} className="text-[10px] font-black uppercase tracking-wider py-2.5"><Mic2 className="h-3.5 w-3.5 text-purple-300" /> Create Artist Show</SecondaryButton>
          <SecondaryButton onClick={() => onOpenBroadcastStudio?.('builder')} className="text-[10px] font-black uppercase tracking-wider py-2.5"><Radio className="h-3.5 w-3.5 text-cyan-300" /> Schedule Premiere</SecondaryButton>
        </div>
      </GlassCard>
    </div>
  </div>
  </AccessGate>
);

export default ArtistHub;
