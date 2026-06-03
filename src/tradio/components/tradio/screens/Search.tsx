import React, { useState, useMemo } from "react";
import { Search as SearchIcon, Sparkles, Moon, User, Calendar, Play, Route } from "lucide-react";
import { TopBar, GlassCard, PrimaryButton, Chip, PlayCircle, Waveform, SectionHeader } from "../ui";
import { IMG, SEARCH_SONGS, TRACKS } from "../data";
import { usePlayer } from "@/tradio/contexts/PlayerContext";
import { TradioImage } from "../NoCoverVisualizer";
import { PrescriptionRail } from "../auth/components";

const TABS = ["Songs", "Stations", "Artists", "Albums", "AI Suggestions"];

const ARTISTS = [
  { name: "Bryson Tiller", img: IMG.dariusCole, track: TRACKS.persuasion },
  { name: "PARTYNEXTDOOR", img: IMG.treyTrizzy, track: TRACKS.midnightVelvet },
  { name: "Giveon", img: IMG.noahKade, track: TRACKS.afterHours },
  { name: "SZA", img: IMG.milaRain, track: TRACKS.dontCall },
  { name: "Brent Faiyaz", img: IMG.jordan, track: TRACKS.persuasion },
  { name: "Summer Walker", img: IMG.kianaLane, track: TRACKS.spinning },
];

const PLAYLISTS = [
  {
    title: "Late Night R&B",
    sub: "AI Station",
    img: IMG.lateNightSoul,
    track: TRACKS.lateNightSoul,
  },
  {
    title: "After Dark R&B",
    sub: "AI Station",
    img: IMG.memphisAfterDark,
    track: TRACKS.memphisAfterDark,
  },
  { title: "Bedroom Vibes", sub: "Playlist", img: IMG.flowers, track: TRACKS.noLookingBack },
  {
    title: "Down For You R&B",
    sub: "AI Station",
    img: IMG.neonHeartbreak,
    track: TRACKS.neonHeartbreak,
  },
];

export const SearchScreen: React.FC<{ onOpenRouteMe?: () => void }> = ({ onOpenRouteMe }) => {
  const [tab, setTab] = useState("Songs");
  const [query, setQuery] = useState("late night r&b");
  const { play, playQueue, currentTrack, isPlaying, isBuffering } = usePlayer();

  const filteredSongs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCH_SONGS;
    return SEARCH_SONGS.filter(
      (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-8 pb-6 lg:space-y-10">
      <TopBar />

      {/* Search Input & Filters Group */}
      <div className="flex flex-col gap-4 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2 rounded-2xl border-[0.5px] border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.015] px-4 py-3 backdrop-blur-3xl focus-within:border-purple-400/55 focus-within:shadow-[0_0_25px_rgba(168,85,247,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.12)] focus-within:bg-white/[0.08] transition-all duration-500">
          <SearchIcon className="h-5 w-5 text-white/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white focus:outline-none"
            placeholder="Search artists, stations, moods..."
          />
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-purple-400/30 bg-purple-500/20 hover:bg-purple-500/30 transition shadow-[0_0_12px_rgba(168,85,247,0.2)]">
            <Waveform className="h-4 w-4" bars={4} color="from-purple-300 to-purple-300" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((t) => (
            <Chip
              key={t}
              label={t}
              selected={tab === t}
              onClick={() => setTab(t)}
              icon={t === "AI Suggestions" ? <Sparkles className="h-3.5 w-3.5" /> : undefined}
            />
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <PrescriptionRail
          title="Refine with Prescribe Me"
          subtitle="Search refinement can later blend Trey TV interests with Tradio listening context."
          compact
        />
      </div>

      {onOpenRouteMe && (
        <div className="px-4 sm:px-6 lg:px-10">
          <GlassCard className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10">
                  <Route className="h-5 w-5 text-cyan-200" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">Route Me universe search</div>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/55">
                    Open the parent Prescribe Me prototype to route across Trey TV, Tradio, FWD,
                    Storybook, Games, and future Trance.
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenRouteMe}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/[0.08] px-4 py-2.5 text-xs font-black uppercase tracking-[0.12em] text-cyan-100"
              >
                <Sparkles className="h-3.5 w-3.5" /> Open
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Top AI result */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden">
          <div className="relative">
            <img
              src={IMG.aiSphere}
              className="absolute right-0 top-0 h-full w-1/2 object-cover"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 to-transparent" />
            <div className="relative p-4">
              <div className="flex items-start justify-between">
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/15 px-2.5 py-1 text-[10px] font-bold text-purple-200">
                  <Sparkles className="h-3 w-3" /> TOP RESULT
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold text-purple-200">
                  <Sparkles className="h-3 w-3" /> PRESCRIPTION RADIO
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold text-white">Late Night R&B</h2>
              <div className="text-xs text-white/55">Prescription Radio Station</div>
              <p className="mt-2 max-w-[60%] text-sm text-white/70">
                Smooth melodies. After hours vibes. R&B for the late night soul.
              </p>
              <PrimaryButton
                className="mt-4"
                onClick={() =>
                  playQueue([
                    TRACKS.afterHours,
                    TRACKS.dontCall,
                    TRACKS.persuasion,
                    TRACKS.spinning,
                  ])
                }
              >
                <Play className="h-3.5 w-3.5 fill-white" /> Play Station
              </PrimaryButton>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Songs */}
      <div>
        <SectionHeader title="Songs" onSeeAll={() => {}} />
        <div className="space-y-2 px-4 sm:px-6 lg:px-10">
          {filteredSongs.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 text-center text-sm text-white/55">
              No songs match &quot;{query}&quot;
            </div>
          )}
          {filteredSongs.map((s, i) => {
            const live = currentTrack?.id === s.id && isPlaying;
            return (
              <GlassCard key={s.id} className="flex items-center gap-3 p-2.5">
                <TradioImage
                  src={s.coverUrl || s.art}
                  title={s.title}
                  artist={s.artist}
                  isPlaying={live}
                  isLoading={currentTrack?.id === s.id && isBuffering}
                  fallbackSize="mini"
                  className="h-11 w-11 rounded-lg object-cover"
                  imgClassName="h-11 w-11 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div
                    className={`text-sm font-semibold ${live ? "text-purple-300" : "text-white"}`}
                  >
                    {s.title}
                  </div>
                  <div className="text-[11px] text-white/55">{s.artist}</div>
                </div>
                <Waveform className={`h-4 w-12 ${live ? "opacity-100" : "opacity-50"}`} bars={16} />
                <span className="text-[11px] text-white/55">{s.dur}</span>
                <PlayCircle size={32} onClick={() => playQueue(filteredSongs, i)} />
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Artists */}
      <div>
        <SectionHeader title="Artists" onSeeAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ARTISTS.map((a) => (
            <div key={a.name} className="flex shrink-0 flex-col items-center">
              <div className="relative">
                <img
                  src={a.img}
                  className="h-16 w-16 rounded-full border border-purple-400/40 object-cover"
                  alt=""
                />
                <span className="absolute -bottom-1 -right-1">
                  <PlayCircle size={26} onClick={() => play(a.track)} />
                </span>
              </div>
              <div className="mt-1.5 max-w-[70px] truncate text-[11px] text-white/70">{a.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Playlists & stations */}
      <div>
        <SectionHeader title="Playlists & Stations" onSeeAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PLAYLISTS.map((p) => (
            <div key={p.title} className="w-[140px] shrink-0">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-white/10">
                <img src={p.img} className="h-full w-full object-cover" alt="" />
                <span className="absolute bottom-2 right-2">
                  <PlayCircle size={30} onClick={() => play(p.track)} />
                </span>
              </div>
              <div className="mt-2 truncate text-xs font-semibold text-white">{p.title}</div>
              <div className="text-[10px] text-white/55">{p.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Refine */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15">
              <Sparkles className="h-5 w-5 text-purple-300" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-white">Refine your search with AI</div>
              <p className="text-[11px] text-white/55">
                Get smarter results, mood matches, and personalized recommendations.
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip label="Mood: Relaxed" icon={<Moon className="h-3.5 w-3.5" />} selected />
            <Chip label="Vocal: Male" icon={<User className="h-3.5 w-3.5" />} selected />
            <Chip label="Era: 2010s – Now" icon={<Calendar className="h-3.5 w-3.5" />} selected />
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default SearchScreen;
