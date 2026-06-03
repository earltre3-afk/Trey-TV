import React, { useState } from "react";
import { useTradioIdentity } from "../auth/useTradioIdentity";
import { hasAnyRole } from "../auth/roleUtils";
import {
  ChevronLeft,
  Sparkles,
  Mic,
  Music,
  CheckCircle,
  Calendar,
  Play,
  Volume2,
  Users,
  Sliders,
  Cpu,
  Layers,
  Globe,
  Flame,
  Trophy,
  TrendingUp,
  Heart,
  Share2,
  Clock,
  Radio,
  Tag,
  MessageSquare,
} from "lucide-react";
import { GlassCard, PrimaryButton, Chip, PlayCircle, Waveform, VerifiedBadge } from "../ui";
import { IMG, TRACKS } from "../data";
import type { Track } from "@/tradio/contexts/PlayerContext";
import { usePlayer } from "@/tradio/contexts/PlayerContext";

interface ProfileProps {
  role?: "artist" | "producer" | "host" | "fan" | "listener" | "admin" | "dj";
  name?: string;
  avatar?: string;
  onBack: () => void;
}

export const ProfileScreen: React.FC<ProfileProps> = ({
  role = "artist",
  name,
  avatar,
  onBack,
}) => {
  const { play, playQueue, isPlaying } = usePlayer();
  const [activeTab, setActiveTab] = useState<"overview" | "catalog" | "dna" | "community">(
    "overview",
  );
  const [isFollowing, setIsFollowing] = useState(false);

  const { identity } = useTradioIdentity();
  const isApprovedCreator = hasAnyRole(identity, ["artist", "producer", "dj", "admin", "owner"]);
  const displayName = name || identity?.display_name || "Trey Trizzy";
  const userAvatar = avatar || identity?.avatar_url || IMG.treyTrizzy;

  // Profile-specific details depending on name/role
  const isArtist = role === "artist" || role === "listener" || role === "fan";
  const isProducer = role === "producer";
  const isHost = role === "host" || role === "dj";

  // Profile Data Configuration
  const getProfileData = () => {
    if (
      displayName === "Trey Trizzy" ||
      (identity && displayName === identity.display_name) ||
      isArtist
    ) {
      return {
        name: displayName,
        avatar: userAvatar,
        coverUrl: IMG.midnightDrive,
        tagline: "Superstar Artist & Host | King of Late Night Soul",
        monthlyListeners: "1,482,900",
        listeners: "1,482,900",
        followers: "342,000",
        rank: "#1 Platform Artist",
        bio: `Forging a fresh pathway through Southern Hip-Hop and modern R&B, ${displayName} fuses raw trap drumlines with liquid soul vocals. As an original Tradio Pioneer, ${displayName} hosts the late-night Velvet Session while curating one of the app's most followed custom station chains.`,
        autograph: displayName,
        spotlight: TRACKS.iLookLike,
        stationName: "Velvet Horizon Radio",
        recentReleases: [
          TRACKS.iLookLike,
          TRACKS.callOn,
          TRACKS.midnightVelvet,
          TRACKS.sixAmThoughts,
        ],
        voiceDrops: [
          { id: "vd1", title: "Late Night Shoutout", duration: "0:12" },
          { id: "vd2", title: "Station Intro Hook", duration: "0:08" },
        ],
        stats: [
          { label: "Platform Releases", value: "42 Tracks" },
          { label: "Cleared Stations", value: "3 Active" },
          { label: "App Airplay Score", value: "98.5" },
        ],
      };
    } else if (name === "JAYE." || isProducer) {
      return {
        name: "JAYE.",
        avatar: IMG.noahKade,
        coverUrl: IMG.aiSphere,
        tagline: "Platinum Producer & Acoustic Architect",
        monthlyListeners: "845,200",
        listeners: "845,200",
        followers: "124,000",
        rank: "#3 Producer DNA",
        bio: 'The mastermind behind the lo-fi trap wave, JAYE. specializes in vintage analog synthesizers, deep bass gains, and organic field recordings. Famous for his highly targeted "Neon Chill" and "Healing Lotus" sound recipes, JAYE. designs acoustic blueprints that power Tradio\'s top stations.',
        autograph: "Jaye. Blueprints",
        spotlight: TRACKS.cityLights,
        stationName: "Lo-Fi Lounge Station",
        recentReleases: [TRACKS.cityLights, TRACKS.underCityLights, TRACKS.noLookingBack],
        voiceDrops: [
          { id: "vd1", title: "Synthesizer Chord Demo", duration: "0:15" },
          { id: "vd2", title: "BPM Alignment Cue", duration: "0:06" },
        ],
        stats: [
          { label: "Beats Leased", value: "18,400" },
          { label: "App Collabs Cleared", value: "142 Artists" },
          { label: "Sound Signature", value: "Ambience / Chill" },
        ],
      };
    } else {
      // DJ / Host - Jordan
      return {
        name: "Jordan",
        avatar: IMG.jordan,
        coverUrl: IMG.lateNightSoul,
        tagline: "Master Broadcaster & DJ | velvet_soul_host_001",
        monthlyListeners: "674,100",
        listeners: "674,100",
        followers: "98,000",
        rank: "#2 Airplay Curator",
        bio: "With over a decade of live broadcast experience, Jordan is the voice of the late-night airwaves. Renowned for a smooth mic presence, high listener request fulfillment rates, and custom seamless transition mixes, Jordan hosts the weekly Velvet Afterhours show.",
        autograph: "Jordan Velvet Voice",
        spotlight: TRACKS.spinning,
        stationName: "Late Night Velvet Soul Show",
        recentReleases: [TRACKS.spinning, TRACKS.dontCall, TRACKS.afterHours],
        voiceDrops: [
          { id: "vd1", title: "Intro Greeting Mic Check", duration: "0:10" },
          { id: "vd2", title: "Late Night Midnight Sign-off", duration: "0:14" },
        ],
        stats: [
          { label: "Broadcast Hours", value: "1,420 hrs" },
          { label: "Fulfillment Score", value: "98.4%" },
          { label: "Active Tune-ins", value: "34,000" },
        ],
      };
    }
  };

  const p = getProfileData();

  return (
    <div className="relative min-h-screen bg-[#0A0A0F] text-white pb-16 overflow-y-auto">
      {/* Dynamic Background Banner Cover (Parallax Style Blur Cover) */}
      <div className="relative h-[280px] sm:h-[350px] w-full overflow-hidden">
        <img
          src={p.coverUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover scale-105 filter brightness-[0.4] blur-[2px]"
        />

        {/* Sleek silver specular glass overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0A0A0F]" />

        {/* Shiny silver bezel accent lines */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-6 left-4 sm:left-6 lg:left-10 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-white hover:bg-black/60 transition-all active:scale-90 shadow-premium"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Top-Right Quick Share */}
        {isApprovedCreator && (
          <button
            className="absolute top-6 right-4 sm:right-6 lg:right-10 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 backdrop-blur-xl text-white hover:bg-black/60 transition-all active:scale-90 shadow-premium"
            aria-label="Share"
          >
            <Share2 className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* 2. Floating Header Profile Card */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-10 -mt-24 sm:-mt-28 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
          {/* High-res floating avatar */}
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl p-[3px] bg-gradient-to-tr from-fuchsia-500 via-purple-600 to-cyan-400 shadow-[0_15px_35px_rgba(168,85,247,0.35)] shrink-0">
            <img
              src={p.avatar}
              alt={p.name}
              className="h-full w-full rounded-[21px] object-cover border border-black/20"
            />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 border-2 border-[#0A0A0F] shadow-lg">
              {isArtist && <Music className="h-3.5 w-3.5 text-white" />}
              {isProducer && <Sliders className="h-3.5 w-3.5 text-white" />}
              {isHost && <Mic className="h-3.5 w-3.5 text-white" />}
            </span>
          </div>

          <div className="space-y-1 sm:mb-2">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                {p.name}
              </h2>
              <VerifiedBadge />
            </div>
            <p className="text-xs sm:text-sm font-medium text-fuchsia-300 tracking-wide filter drop-shadow-[0_0_8px_rgba(217,70,239,0.3)]">
              {p.tagline}
            </p>

            <div className="mt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-white/50 font-mono">
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-cyan-400" /> {p.monthlyListeners || p.listeners}{" "}
                Monthly Listeners
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-fuchsia-400" /> {p.followers} Followers
              </span>
            </div>
          </div>
        </div>

        {/* Header CTAs */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end md:mb-2">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`rounded-full px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${
              isFollowing
                ? "bg-purple-500/10 border border-purple-500/35 text-purple-200"
                : "bg-white/10 border border-white/15 text-white hover:bg-white/15"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>

          <PrimaryButton
            onClick={() => play(p.spotlight)}
            className="flex items-center gap-2 rounded-full py-2.5 px-6 text-xs font-black uppercase tracking-widest"
          >
            <Play className="h-3.5 w-3.5 fill-current text-white" /> Tune In Spotlight
          </PrimaryButton>
        </div>
      </div>

      {/* 3. Segmented Profile Navigation Tabs */}
      <div className="px-4 sm:px-6 lg:px-10 py-5">
        <div className="flex gap-2 border-b border-white/5 pb-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { id: "overview", label: "Spotlight Overview" },
            {
              id: "catalog",
              label: isArtist ? "Discography" : isProducer ? "Beat Store" : "Mix Catalog",
            },
            {
              id: "dna",
              label: isArtist ? "Artistic Story" : isProducer ? "Sonic DNA" : "Airplay Matrix",
            },
            { id: "community", label: "Broadcast Station Room" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "overview" | "catalog" | "dna" | "community")}
              className={`pb-3 text-xs font-black uppercase tracking-wider relative transition-all whitespace-nowrap ${
                activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Panels */}
      <div className="px-4 sm:px-6 lg:px-10 space-y-8">
        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left: Featured Station card & Top tracks */}
            <div className="lg:col-span-7 space-y-6">
              {/* Dynamic Station Node Card */}
              <div>
                <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300 mb-3 flex items-center gap-1.5">
                  <Radio className="h-4 w-4 text-purple-400 animate-pulse" /> Platform Broadcast
                  Station
                </div>
                <GlassCard
                  glow
                  className="p-5 border-fuchsia-500/20 bg-gradient-to-br from-[#1A0B2B]/20 via-[#0B0D1E]/10 to-transparent relative overflow-hidden group"
                >
                  {/* Decorative gloss shine */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-color-dodge">
                    <div className="absolute -inset-[50%] animate-shimmer-sweep bg-gradient-to-tr from-transparent via-fuchsia-500/10 to-transparent" />
                  </div>

                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                      <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <PlayCircle size={32} gradient onClick={() => play(p.spotlight)} />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-black text-white truncate">{p.stationName}</h4>
                        <span className="inline-flex items-center gap-1 rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-2 py-0.5 text-[9px] font-bold text-fuchsia-200">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />{" "}
                          LIVE SIGNAL
                        </span>
                      </div>
                      <p className="text-[11px] text-fuchsia-300 font-mono font-bold uppercase mt-0.5">
                        Tuned in & verified
                      </p>
                      <p className="text-xs text-white/70 leading-snug mt-1.5">
                        Tuning 100% curated vibe loops designed specifically by {p.name}. Features
                        live voice drop interventions.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Spotlight / Heavy Rotation tracks */}
              <div>
                <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300 mb-3">
                  Top Airplay Rotations
                </div>
                <div className="space-y-3">
                  {p.recentReleases.map((track, idx) => (
                    <GlassCard
                      key={track.id}
                      className="flex items-center justify-between gap-4 p-3 border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300 cursor-pointer"
                      onClick={() => play(track)}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="text-sm font-bold text-purple-300/60 font-mono w-4 text-center">
                          {idx + 1}
                        </span>
                        <img
                          src={track.art}
                          alt=""
                          className="h-11 w-11 rounded-lg object-cover border border-white/10 shrink-0"
                        />
                        <div className="min-w-0 flex-1 text-left">
                          <h5 className="text-sm font-bold text-white truncate">{track.title}</h5>
                          <p className="text-[10px] text-white/50 truncate mt-0.5">
                            {track.station}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <span className="text-cyan-400/80">
                          {(Math.random() * 8 + 1).toFixed(1)}M Streams
                        </span>
                        <PlayCircle size={28} />
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side Overview stats */}
            <div className="lg:col-span-5 space-y-6">
              {/* Premium Verification Seal */}
              <GlassCard className="p-5 text-center border-zinc-400/20 bg-gradient-to-b from-white/[0.06] via-white/[0.01] to-transparent shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.15)] relative overflow-hidden">
                <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 bg-purple-500/10 rounded-full blur-2xl" />

                <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-zinc-400">
                  Tradio Verified Autograph Seal
                </h4>
                <div className="my-4">
                  <span className="text-signature text-5xl text-fuchsia-300 tracking-wide font-normal drop-shadow-[0_0_15px_rgba(217,70,239,0.5)]">
                    {p.autograph}
                  </span>
                </div>
                <p className="text-[10px] text-white/45 leading-snug font-mono uppercase">
                  Authenticated prescription provider ID: {p.rank}
                </p>
              </GlassCard>

              {/* Dynamic Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                {p.stats.map((stat, idx) => (
                  <GlassCard
                    key={idx}
                    className="p-4 border-white/5 flex justify-between items-center gap-3"
                  >
                    <span className="text-xs font-bold text-white/60 uppercase font-mono">
                      {stat.label}
                    </span>
                    <span className="text-sm font-black text-cyan-300 font-mono filter drop-shadow-[0_0_5px_rgba(34,211,238,0.2)]">
                      {stat.value}
                    </span>
                  </GlassCard>
                ))}
              </div>

              {/* Quick bio card */}
              <GlassCard className="p-5 border-white/5 space-y-3 text-left">
                <h4 className="text-xs font-mono font-black uppercase tracking-widest text-purple-300">
                  Curator Background Biography
                </h4>
                <p className="text-xs text-white/70 leading-relaxed font-medium">{p.bio}</p>
              </GlassCard>
            </div>
          </div>
        )}

        {/* CATALOG PANEL */}
        {activeTab === "catalog" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-white uppercase tracking-tight flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-cyan-400" /> Complete Catalog
              </h3>
              <span className="text-xs font-mono text-white/50 uppercase">
                {isArtist
                  ? "Verified Discography"
                  : isProducer
                    ? "Analog Beats"
                    : "Curated Recordings"}
              </span>
            </div>

            {/* If Artist Profile: Show Releases */}
            {isArtist && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(TRACKS)
                  .slice(0, 8)
                  .map((t) => (
                    <GlassCard
                      key={t.id}
                      className="p-3 border-white/5 hover:border-white/15 flex items-center gap-3.5 transition-all duration-300 cursor-pointer"
                      onClick={() => play(t)}
                    >
                      <img
                        src={t.art || IMG.aiSphere}
                        alt=""
                        className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white truncate">{t.title}</h4>
                          <span className="rounded bg-cyan-400/10 px-1.5 py-0.5 text-[8px] font-black text-cyan-300">
                            VERIFIED
                          </span>
                        </div>
                        <p className="text-xs text-white/50 truncate mt-0.5">{t.artist}</p>
                        <div className="mt-1.5 flex items-center gap-2.5 text-[10px] text-white/35 font-mono">
                          <span>BPM: 92</span>
                          <span>•</span>
                          <span>Key: G min</span>
                        </div>
                      </div>
                      <PlayCircle size={32} />
                    </GlassCard>
                  ))}
              </div>
            )}

            {/* If Producer Profile: Beat Store Catalogue */}
            {isProducer && (
              <div className="space-y-3">
                {[
                  {
                    id: "b1",
                    title: "Velvet Highway Bounce",
                    bpm: "92 BPM",
                    key: "C# Minor",
                    mood: "Melodic Trap",
                    lease: "$49",
                    exclusive: "$249",
                  },
                  {
                    id: "b2",
                    title: "Tokyo Rainy Windows",
                    bpm: "78 BPM",
                    key: "F Major",
                    mood: "Chill Lo-Fi",
                    lease: "$39",
                    exclusive: "$199",
                  },
                  {
                    id: "b3",
                    title: "Southern Heatwave Stems",
                    bpm: "142 BPM",
                    key: "A Minor",
                    mood: "Hard Memphis Rap",
                    lease: "$59",
                    exclusive: "$349",
                  },
                  {
                    id: "b4",
                    title: "Celestial Gravity Chords",
                    bpm: "85 BPM",
                    key: "E Minor",
                    mood: "Space Ambience",
                    lease: "$49",
                    exclusive: "$249",
                  },
                ].map((beat, idx) => (
                  <GlassCard
                    key={beat.id}
                    className="p-4 border-white/5 hover:border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 h-7 w-7 rounded-lg flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="text-left">
                        <h4 className="text-sm font-black text-white">{beat.title}</h4>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-white/50 font-mono">
                          <span className="bg-white/5 rounded px-1.5 py-0.5">{beat.bpm}</span>
                          <span>•</span>
                          <span className="bg-white/5 rounded px-1.5 py-0.5">{beat.key}</span>
                          <span>•</span>
                          <span className="text-fuchsia-300 font-bold">{beat.mood}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-end border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                      <div className="text-right font-mono shrink-0">
                        <div className="text-[10px] text-white/40">Lease / Exclusive</div>
                        <div className="text-xs font-extrabold text-white mt-0.5">
                          {beat.lease} / <span className="text-cyan-300">{beat.exclusive}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => play(TRACKS.midnightVelvet)}
                        className="rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 active:scale-95 transition-all"
                      >
                        Preview Beat
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* If Host Profile: Curated Recordings / DJ Mixes */}
            {isHost && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    title: "Velvet Afterhours Live Session",
                    date: "Recorded: Jun 12",
                    listeners: "14.2K played",
                    tags: "Soul • R&B",
                  },
                  {
                    title: "Mid-week Midnight Soul Ride",
                    date: "Recorded: Jun 08",
                    listeners: "11.8K played",
                    tags: "Vibe Hop",
                  },
                  {
                    title: "Memphis Roots Airplay Mix",
                    date: "Recorded: Jun 03",
                    listeners: "9.4K played",
                    tags: "Southern Rap",
                  },
                  {
                    title: "Chilly Sunday Morning Reset",
                    date: "Recorded: May 28",
                    listeners: "15.6K played",
                    tags: "Neo Soul",
                  },
                ].map((mix, idx) => (
                  <GlassCard
                    key={idx}
                    className="p-4 border-white/5 hover:border-purple-500/20 flex items-center justify-between gap-4 transition-all duration-300 cursor-pointer"
                    onClick={() => play(TRACKS.spinning)}
                  >
                    <div className="min-w-0 text-left">
                      <h4 className="text-sm font-black text-white truncate">{mix.title}</h4>
                      <p className="text-[10px] text-purple-300 font-mono mt-1 uppercase tracking-wide font-bold">
                        {mix.tags}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-[10px] text-white/40 font-mono">
                        <span>{mix.date}</span>
                        <span>•</span>
                        <span>{mix.listeners}</span>
                      </div>
                    </div>
                    <PlayCircle size={32} />
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DNA / BACKGROUND STORY PANEL */}
        {activeTab === "dna" && (
          <div className="space-y-6 animate-fade-in text-left">
            {/* If Artist Story */}
            {isArtist && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 space-y-5">
                  <GlassCard className="p-6 border-white/5 space-y-4">
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      The Story of {p.name}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                      Building dynamic soundscapes is second nature to {p.name}. Fusing old school
                      soul with tomorrow's high energy production style, {p.name} represents a next
                      generation pioneer under our theme.
                    </p>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">
                      Every single piece of audio content, release file, and live stream is curated
                      completely inside our platform interface, providing a highly integrated
                      community atmosphere.
                    </p>
                  </GlassCard>
                </div>

                {/* Voice Drops Player */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300">
                    Voice Drop Soundbites
                  </div>
                  {p.voiceDrops.map((vd) => (
                    <GlassCard
                      key={vd.id}
                      className="p-4 border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="text-left">
                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                          <Mic className="h-3.5 w-3.5 text-fuchsia-400" /> {vd.title}
                        </div>
                        <span className="text-[10px] text-white/40 font-mono uppercase mt-0.5 block">
                          Duration: {vd.duration}
                        </span>
                      </div>
                      <button
                        onClick={() => play(p.spotlight)}
                        className="h-8 w-8 rounded-full border border-white/10 hover:border-fuchsia-400/40 text-white/40 hover:text-fuchsia-300 flex items-center justify-center transition-all active:scale-90"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* If Producer DNA */}
            {isProducer && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sonic DNA knobs dials */}
                <GlassCard className="p-6 border-white/5 space-y-6 text-center">
                  <h3 className="text-sm font-mono font-black uppercase tracking-widest text-purple-300">
                    Producer Acoustic DNA Dials
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { l: "Sub Bass Gain", v: "+6.2 dB", p: 85, c: "text-purple-300" },
                      { l: "Analog Warmth", v: "92%", p: 92, c: "text-fuchsia-300" },
                      { l: "Synth Weight", v: "High", p: 75, c: "text-pink-300" },
                      { l: "Acoustic Ambience", v: "Max Glow", p: 95, c: "text-cyan-300" },
                    ].map((knob, idx) => {
                      const radius = 30;
                      const c = 2 * Math.PI * radius;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center p-3 border border-white/5 rounded-2xl bg-black/20"
                        >
                          <span className="text-[10px] font-mono uppercase text-white/45">
                            {knob.l}
                          </span>
                          <span className={`text-sm font-black mt-1 ${knob.c}`}>{knob.v}</span>
                          <div className="relative my-2.5 h-[65px] w-[65px]">
                            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="rgba(255,255,255,0.04)"
                                strokeWidth="6"
                              />
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="6"
                                strokeDasharray={c}
                                strokeDashoffset={c - (knob.p / 100) * c}
                                className={knob.c}
                              />
                            </svg>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Top produced tracks */}
                <div className="space-y-4">
                  <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300">
                    Signature Co-Productions
                  </div>
                  {p.recentReleases.map((t) => (
                    <GlassCard
                      key={t.id}
                      className="p-3 border-white/5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 text-left">
                        <img
                          src={t.art}
                          alt=""
                          className="h-11 w-11 rounded-lg object-cover border border-white/10"
                        />
                        <div>
                          <h4 className="text-sm font-black text-white">{t.title}</h4>
                          <p className="text-[10px] text-white/55">
                            Singers on beat: Trey Trizzy, Mila Rain
                          </p>
                        </div>
                      </div>
                      <PlayCircle size={28} onClick={() => play(t)} />
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* If Host Airplay Matrix */}
            {isHost && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly slated schedules */}
                <GlassCard className="p-6 border-white/5 space-y-4 text-left">
                  <h3 className="text-sm font-mono font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> Weekly Airplay Schedules
                  </h3>
                  {[
                    { day: "TUESDAYS 8PM", show: "Midnight Beats Acoustic Room" },
                    { day: "THURSDAYS 10PM", show: "Velvet Sessions & Stems Session" },
                    { day: "SATURDAYS MIDNIGHT", show: "Late Night Trap/Soul Showdown" },
                  ].map((sl, idx) => (
                    <div
                      key={idx}
                      className="p-3 border border-white/5 rounded-xl bg-white/[0.01] flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-[9px] font-mono text-cyan-300 font-bold tracking-widest">
                          {sl.day}
                        </div>
                        <div className="text-xs font-black text-white mt-1">{sl.show}</div>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    </div>
                  ))}
                </GlassCard>

                {/* Listener Request Dashboard */}
                <GlassCard className="p-6 border-white/5 space-y-4 text-left">
                  <h3 className="text-sm font-mono font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" /> Fan Request Board
                  </h3>
                  {[
                    { user: "treytv_fan_01", song: "Velvet Dream Stems", progress: "In Queue" },
                    {
                      user: "kiana_soul_10",
                      song: "Falling For You (Acoustic)",
                      progress: "Live Scheduled",
                    },
                    { user: "onyx_vibe_99", song: "Memphis After Dark", progress: "Fulfilled" },
                  ].map((req, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 border border-white/5 rounded-xl bg-black/20 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-[10px] text-white/55 font-mono">
                          {req.user} requested:
                        </div>
                        <div className="text-xs font-extrabold text-white mt-0.5">{req.song}</div>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[8px] font-mono font-bold tracking-wider ${
                          req.progress === "Fulfilled"
                            ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                            : "bg-cyan-400/10 text-cyan-300 border border-cyan-400/20"
                        }`}
                      >
                        {req.progress.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </GlassCard>
              </div>
            )}
          </div>
        )}

        {/* STATION COMMUNITY PANEL */}
        {activeTab === "community" && (
          <div className="space-y-6 animate-fade-in text-left max-w-4xl mx-auto">
            <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
              <MessageSquare className="h-4.5 w-4.5" /> Dynamic Live Chat Matrix
            </div>

            {/* Chat list */}
            <GlassCard className="p-5 border-white/5 space-y-4 bg-black/20 min-h-[300px]">
              {[
                {
                  author: "Jordan_Trizzy_Fan",
                  text: "This station curated by Trey is literally the best late night vibe, the transition on Velvet Dream is insane!",
                  time: "2m ago",
                  avatar: IMG.jordan,
                },
                {
                  author: "luna_vibe_seeker",
                  text: "Does Jaye have a new beat pack dropping soon? The backing chords on cityLights are beautiful.",
                  time: "5m ago",
                  avatar: IMG.flowers,
                },
                {
                  author: "bren_faiy_R&B",
                  text: "Velvet sessions weekly show is literally my go-to. Jordan always fulfills SZA requests instantly, love the stream!",
                  time: "12m ago",
                  avatar: IMG.midnightVelvet,
                },
              ].map((comment, idx) => (
                <div
                  key={idx}
                  className="flex gap-3.5 p-3 rounded-2xl border border-white/5 bg-white/[0.01]"
                >
                  <img
                    src={comment.avatar}
                    alt=""
                    className="h-9 w-9 rounded-xl border border-white/10 shrink-0 object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black text-purple-300">
                        {comment.author}
                      </span>
                      <span className="text-[10px] text-white/35 font-mono">{comment.time}</span>
                    </div>
                    <p className="text-xs text-white/85 leading-snug mt-1.5 font-medium">
                      {comment.text}
                    </p>
                  </div>
                </div>
              ))}

              {/* Fake message sender */}
              <div className="pt-4 border-t border-white/5 flex gap-3">
                <input
                  type="text"
                  placeholder="Dispatch comment to station room..."
                  className="flex-1 bg-black/50 border border-white/10 rounded-full px-5 py-2.5 text-xs text-white outline-none focus:border-purple-400/50"
                />
                <button className="rounded-full bg-purple-500 hover:bg-purple-600 text-white px-5 py-2 text-xs font-black uppercase tracking-widest active:scale-95 transition-all">
                  Send
                </button>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
