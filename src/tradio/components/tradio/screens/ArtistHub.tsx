import React from "react";
import {
  Bell,
  CalendarDays,
  Heart,
  ListMusic,
  Music,
  Radio,
  Send,
  Sparkles,
  UploadCloud,
  Users,
  Mic2,
  Headphones,
  Sliders,
  CheckCircle2,
  Clock,
  Lock,
  BarChart3,
} from "lucide-react";
import {
  TopBar,
  GlassCard,
  PrimaryButton,
  SecondaryButton,
  Chip,
  VerifiedBadge,
  Waveform,
  ReleaseCard,
  PlayCircle,
} from "../ui";
import {
  ALL_STATIONS,
  ARTIST_PLAYLISTS,
  ARTIST_PROFILES,
  RELEASES,
  STATION_COMMUNITIES,
  TRACKS,
  VOICE_DROPS,
} from "../data";
import { AccessGate } from "../auth/components";
import { toast } from "sonner";
import { usePlayer } from "@/tradio/contexts/PlayerContext";

const fanReactions = STATION_COMMUNITIES["station-trey-trizzy"].messages.slice(0, 3);
const artist = ARTIST_PROFILES[0];
const station = ALL_STATIONS.find((item) => item.id === "station-trey-trizzy") || ALL_STATIONS[0];
const pinnedRelease = RELEASES.find((release) => release.artist === artist.name) || RELEASES[0];
const OWNER_ARTIST_TRACKS = [TRACKS.iLookLike, TRACKS.callOn];

const formatTrackDuration = (seconds?: number) => {
  if (!seconds) return "";
  const totalSeconds = Math.round(seconds);
  return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
};

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
}) => {
  const { play, currentTrack, isPlaying } = usePlayer();

  return (
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
          {onEditProfile && (
            <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onEditProfile}>
              Edit Artist Profile
            </SecondaryButton>
          )}
          {onViewPublicProfile && (
            <SecondaryButton className="px-4 py-2.5 text-[11px]" onClick={onViewPublicProfile}>
              View Public Artist Profile
            </SecondaryButton>
          )}
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden">
          <div className="relative min-h-[260px]">
            <img
              src={artist.avatar}
              alt=""
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/10" />
            <div className="relative p-5 sm:p-6">
              <Chip label="Artist Studio" selected icon={<Music className="h-3.5 w-3.5" />} />
              <div className="mt-5 flex max-w-[620px] flex-col gap-4 sm:flex-row sm:items-end">
                <img
                  src={artist.avatar}
                  alt={artist.name}
                  className="h-24 w-24 rounded-2xl border border-white/15 object-cover shadow-premium"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                      {artist.name}
                    </h1>
                    {artist.verified && <VerifiedBadge />}
                  </div>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
                    {artist.bio}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Chip
                      label={`${(artist.monthlyListeners / 1000).toFixed(0)}K monthly listeners`}
                    />
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

      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard className="p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">Owner Media Library</div>
              <div className="text-xs text-white/50">
                Uploaded songs available on Trey Trizzy's Tradio artist profile
              </div>
            </div>
            <Music className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {OWNER_ARTIST_TRACKS.map((track) => {
              const trackPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={track.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <img src={track.art} alt="" className="h-14 w-14 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-white">{track.title}</div>
                    <div className="truncate text-xs text-white/55">{track.artist}</div>
                    <div className="mt-1 truncate font-mono text-[10px] text-white/40">
                      {formatTrackDuration(track.duration)} - {track.src}
                    </div>
                  </div>
                  <PlayCircle
                    size={38}
                    gradient={trackPlaying}
                    onClick={() => play(track, OWNER_ARTIST_TRACKS)}
                  />
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <GlassCard className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Artist Station</div>
              <div className="text-xs text-white/50">
                Premieres, rotation, requests, and fan notifications
              </div>
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
              <div className="rounded-xl bg-white/[0.04] p-2 text-white/70">
                Countdown
                <br />
                <span className="font-bold text-cyan-300">18h</span>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2 text-white/70">
                Notify
                <br />
                <span className="font-bold text-fuchsia-300">86K</span>
              </div>
              <div className="rounded-xl bg-white/[0.04] p-2 text-white/70">
                Premiere
                <br />
                <span className="font-bold text-purple-300">Armed</span>
              </div>
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
            <SecondaryButton className="px-3 py-2 text-xs">
              <ListMusic className="h-3.5 w-3.5" /> New Playlist
            </SecondaryButton>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ARTIST_PLAYLISTS.map((playlist) => (
              <div
                key={playlist.id}
                className="flex gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
              >
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
              ["Premiere reminder", "86.3K fans queued"],
              ["Playlist update", "18.9K followers"],
              ["Voice drop", `${VOICE_DROPS.length} reusable drops`],
            ].map(([title, sub]) => (
              <div
                key={title}
                className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3"
              >
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
                    <span className="truncate text-xs font-semibold text-white">
                      {reaction.author}
                    </span>
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
              ["After Dark EP", "Station premiere", "Jun 6"],
              ["Voice note to fans", "Community drop", "Tonight"],
              [TRACKS.sixAmThoughts.title, "Pinned rotation refresh", "Friday"],
            ].map(([title, type, date]) => (
              <div
                key={title}
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] p-3"
              >
                <div>
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="text-xs text-white/50">{type}</div>
                </div>
                <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold text-cyan-200">
                  {date}
                </span>
              </div>
            ))}
          </div>
          <PrimaryButton className="mt-3 w-full py-3" onClick={onOpenRelease}>
            <Send className="h-4 w-4" /> Release to Tradio
          </PrimaryButton>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <SecondaryButton
              onClick={() => onOpenBroadcastStudio?.("builder")}
              className="text-[10px] font-black uppercase tracking-wider py-2.5"
            >
              <Mic2 className="h-3.5 w-3.5 text-purple-300" /> Create Artist Show
            </SecondaryButton>
            <SecondaryButton
              onClick={() => onOpenBroadcastStudio?.("builder")}
              className="text-[10px] font-black uppercase tracking-wider py-2.5"
            >
              <Radio className="h-3.5 w-3.5 text-cyan-300" /> Schedule Premiere
            </SecondaryButton>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
        {/* Artist Music Analytics */}
        <GlassCard className="p-5 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Music Analytics</div>
              <div className="text-[11px] text-white/50">Performance metrics for your catalog</div>
            </div>
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
              <BarChart3 className="h-2.5 w-2.5" /> Live Pulse
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                Total Streams
              </div>
              <div className="mt-1 text-xl font-black text-white">142.8K</div>
              <div className="text-[9px] text-emerald-400 mt-0.5 flex items-center justify-center gap-0.5">
                <span>+18.3%</span> this week
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                Station Adds
              </div>
              <div className="mt-1 text-xl font-black text-white">12,482</div>
              <div className="text-[9px] text-emerald-400 mt-0.5 flex items-center justify-center gap-0.5">
                <span>+24.5%</span> this week
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                Fan Saves
              </div>
              <div className="mt-1 text-xl font-black text-white">8,934</div>
              <div className="text-[9px] text-emerald-400 mt-0.5 flex items-center justify-center gap-0.5">
                <span>+12.1%</span> this week
              </div>
            </div>

            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/45">
                Audience Reach
              </div>
              <div className="mt-1 text-xl font-black text-white">86.3K</div>
              <div className="text-[9px] text-purple-300 mt-0.5">Across 40+ countries</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.01] p-3">
            <div className="flex justify-between text-[10px] font-bold text-white/40 mb-1">
              <span>FALLING FOR YOU STREAM GROWTH</span>
              <span>7-DAY TREND</span>
            </div>
            {/* Simple mock graphic trend bars */}
            <div className="h-10 flex items-end gap-1 px-1">
              {[25, 45, 35, 65, 80, 70, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500 to-purple-500 hover:opacity-80 transition-opacity"
                  style={{ height: `${h}%` }}
                  title={`Day ${i + 1}: ${h}%`}
                />
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Creative Connections Hub */}
        <GlassCard className="p-5 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Creative Connections</div>
              <div className="text-[11px] text-white/50">Connect with Radio Hosts & Producers</div>
            </div>
            <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300">
              Network
            </span>
          </div>

          <div className="space-y-3">
            {/* Radio Hosts */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/55">
                    Active Radio DJs / Hosts
                  </span>
                </div>
                <span className="text-[9px] text-white/40 font-mono">DJs live: 3</span>
              </div>

              <div className="mt-2.5 space-y-2">
                {[
                  { name: "Jordan", show: "Midnight Therapy", reach: "45K" },
                  { name: "DJ Hyped", show: "Tradio Electro Hours", reach: "28K" },
                ].map((host) => (
                  <div
                    key={host.name}
                    className="flex items-center justify-between rounded-lg bg-black/25 p-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{host.name}</span>
                      <span className="text-white/45 ml-1.5">• Host of {host.show}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          `Pitched 'Falling For You' directly to ${host.name}'s show queue!`,
                        )
                      }
                      className="rounded-lg border border-purple-400/40 hover:border-purple-400 bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 text-[10px] font-bold text-purple-200 transition-colors"
                    >
                      Pitch Track
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Beat Producers */}
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/55">
                    Active Beat Producers
                  </span>
                </div>
                <span className="text-[9px] text-white/40 font-mono">Producers: 12</span>
              </div>

              <div className="mt-2.5 space-y-2">
                {[
                  { name: "Apex Beats", style: "Trap / Melodic", bpm: "140 BPM" },
                  { name: "Soundwave", style: "Boom Bap / Soul", bpm: "90 BPM" },
                ].map((producer) => (
                  <div
                    key={producer.name}
                    className="flex items-center justify-between rounded-lg bg-black/25 p-2 text-xs"
                  >
                    <div>
                      <span className="font-bold text-white">{producer.name}</span>
                      <span className="text-white/45 ml-1.5">
                        • {producer.style} ({producer.bpm})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          `Collaboration request sent to ${producer.name}! Reviewing beat packs.`,
                        )
                      }
                      className="rounded-lg border border-cyan-400/40 hover:border-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 text-[10px] font-bold text-cyan-200 transition-colors"
                    >
                      Collab
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
    </AccessGate>
  );
};

export default ArtistHub;
