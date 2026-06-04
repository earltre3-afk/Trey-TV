import React from "react";
import {
  Search as SearchIcon,
  Sparkles,
  TrendingUp,
  Play,
  Flame,
  Calendar,
  RotateCcw,
  Radio,
  Route,
  Home,
  Headphones,
  Music,
  Sliders,
  CheckCircle2,
  Lock,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  TopBar,
  GlassCard,
  PrimaryButton,
  SectionHeader,
  VerifiedBadge,
  PlayCircle,
  Waveform,
} from "../ui";
import {
  IMG,
  FEATURED_STATIONS,
  ARTIST_STATIONS,
  INSTANT_RELEASES,
  TRENDING,
  TRACKS,
} from "../data";
import { usePlayer, type PlaybackSource, type Track } from "@/tradio/contexts/PlayerContext";
import { PrescriptionRail } from "../auth/components";
import { useAuth } from "@/lib/auth";
import { useSupabaseSession } from "@/lib/supabase-session";
import { useTradioIdentity } from "../auth/useTradioIdentity";
import { useAccessRequests } from "../auth/AccessRequestsContext";
import { toast } from "sonner";

interface Props {
  onOpenPlayer: () => void;
  onOpenArtist: () => void;
  onOpenBuild: () => void;
  onOpenSongWars?: (dest?: {
    view: "hub" | "setup" | "stage" | "results" | "replay";
    battleId?: string;
  }) => void;
  onOpenProfile?: (role: "artist" | "producer" | "host", name: string) => void;
  onOpenRouteMe?: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  onOpenPlayer,
  onOpenArtist,
  onOpenBuild,
  onOpenSongWars,
  onOpenProfile,
  onOpenRouteMe,
}) => {
  const { play, playQueue, playStation: startStation, currentTrack, isPlaying } = usePlayer();
  const { identity, currentMode, setActiveMode, currentRoleLabel } = useTradioIdentity();
  const access = useAccessRequests();

  // Tradio reads the logged-in Trey TV identity (parent is the identity source).
  // Display priority: Trey TV username → display name → email prefix → fallback.
  const { user: treyUser } = useAuth();
  const { user: supaUser } = useSupabaseSession();
  const emailPrefix = supaUser?.email ? supaUser.email.split("@")[0] : "";
  const greetingName =
    treyUser?.handle?.trim() || treyUser?.name?.trim() || emailPrefix.trim() || "Tradio Listener";

  const getRoleStatus = (role: "artist" | "producer" | "dj") => {
    const grant = identity?.roles?.find((g) => g.role === role);
    const request = access?.getRequestFor(role);
    const isApproved = grant
      ? grant.role_status === "active" || grant.role_status === "approved"
      : false;
    const requestStatus = request?.status ?? "not_started";
    return { isApproved, requestStatus, request };
  };

  const experiences = [
    {
      mode: "listener",
      title: "Listener",
      tagline: "Be Entertained",
      description:
        "Explore high-fidelity AI-curated stations, customize mood mixes, and participate in interactive song wars.",
      Icon: Headphones,
    },
    {
      mode: "artist",
      title: "Tradio Artist",
      tagline: "Music Catalog",
      description:
        "Distribute your music catalog on the app, launch custom artist stations, and host exclusive premieres.",
      Icon: Music,
    },
    {
      mode: "producer",
      title: "Beat Producer",
      tagline: "Promote Beats",
      description:
        "Promote your beat catalog, organize beat packs, secure host slots, and collaborate with approved Tradio artists.",
      Icon: Sliders,
    },
    {
      mode: "dj",
      title: "Radio Host / DJ",
      tagline: "Host a Show",
      description:
        "Schedule live radio shows, broadcast DJ mixes, handle requests, and host interactive PVP sessions.",
      Icon: Radio,
    },
  ];

  const playStation = (track: Track, queue?: Track[], source?: PlaybackSource) => {
    const playbackTrack = {
      ...track,
      sourceType: source?.type || "station",
      sourceLabel: source?.label || "Station",
      isLive: source?.isLive ?? true,
    };
    if (source?.isLive) startStation(source, [playbackTrack, ...(queue || [])]);
    else if (queue) playQueue([playbackTrack, ...queue], 0, source);
    else play(playbackTrack, undefined, source);
    onOpenPlayer();
  };

  return (
    <div className="flex flex-col gap-5 pb-5 lg:gap-6 lg:pb-6 [&>*]:order-10">
      <div className="order-1">
        <TopBar onProfileClick={() => onOpenProfile?.("host", "Jordan")} />
      </div>

      {/* Greeting & Search Group */}
      <div className="order-2 px-4 sm:px-6 lg:px-10 flex flex-col gap-4 sm:gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl flex items-baseline gap-2">
                Good evening,{" "}
                <span className="text-signature text-3xl sm:text-4xl text-fuchsia-300 font-normal drop-shadow-[0_0_12px_rgba(217,70,239,0.55)] ml-1">
                  {greetingName}
                </span>
              </h1>
              <Waveform className="h-5 w-8 self-center" bars={6} animate={isPlaying} />
            </div>
            <p className="mt-1 text-sm text-white/60">Music that understands you.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border-[0.5px] border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.015] px-4 py-3 backdrop-blur-3xl focus-within:border-purple-400/55 focus-within:shadow-[0_0_25px_rgba(168,85,247,0.22),inset_0_1.5px_2px_rgba(255,255,255,0.12)] focus-within:bg-white/[0.08] transition-all duration-500">
          <SearchIcon className="h-5 w-5 text-white/50" />
          <input
            placeholder="Search artists, stations, moods..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 active:scale-90 hover:scale-105 hover:shadow-[0_0_12px_rgba(217,70,239,0.5)] transition-all duration-300">
            <Waveform
              className="h-4 w-4"
              bars={4}
              color="from-white to-white"
              animate={isPlaying}
            />
          </button>
        </div>
      </div>

      {/* Sleek Tradio Pathway Dock */}
      <div className="order-4 px-4 sm:px-6 lg:px-10 animate-fade-in">
        <GlassCard className="p-4 liquid-glass border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.015] to-transparent -skew-x-12 translate-x-[-150%] animate-shimmer-sweep pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-fuchsia-300">
                Active Mode Selector
              </span>
              <h2 className="text-base font-bold text-white tracking-tight">
                Select your Tradio Pathway
              </h2>
              <p className="text-[11px] text-white/50 leading-relaxed mt-0.5">
                Switch modes to adapt available creator, broadcast, and community tools.
              </p>
            </div>

            {/* Horizontal Dock of 4 Experiences */}
            <div className="grid grid-cols-2 lg:flex items-center gap-2">
              {experiences.map((exp) => {
                const isActive = currentMode === exp.mode;
                const { isApproved, requestStatus } =
                  exp.mode !== "listener"
                    ? getRoleStatus(exp.mode as any)
                    : { isApproved: true, requestStatus: "approved" };

                return (
                  <button
                    key={exp.mode}
                    type="button"
                    onClick={() => {
                      if (isActive) return;
                      if (isApproved) {
                        setActiveMode(exp.mode as any);
                        toast.success(`Switched Tradio to ${exp.title} Mode`);
                      } else if (requestStatus === "pending" || requestStatus === "under_review") {
                        toast.info(`Your ${exp.title} access request is currently under review.`);
                      } else {
                        access?.openFlow(exp.mode as any);
                      }
                    }}
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl border text-left transition-all duration-300 relative ${
                      isActive
                        ? "bg-primary/10 border-primary/30 ring-1 ring-primary/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]"
                        : "bg-white/[0.02] border-white/5 hover:border-white/12 text-white/60 hover:text-white hover:bg-white/5 hover:translate-y-[-1px]"
                    }`}
                  >
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 transition-transform group-hover:scale-105 ${
                        isActive
                          ? "bg-primary/20 text-primary shadow-[0_0_10px_rgba(245,158,11,0.3)]"
                          : "bg-white/[0.03] text-white/55"
                      }`}
                    >
                      <exp.Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 pr-1">
                      <div
                        className={`text-xs font-bold truncate leading-tight flex items-center gap-1 ${isActive ? "text-primary" : ""}`}
                      >
                        {exp.title}
                        {isActive && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_var(--gold)] animate-glow-pulse" />
                        )}
                      </div>
                      <div className="text-[8px] font-mono tracking-wider text-white/40 leading-none mt-0.5 uppercase">
                        {exp.mode === "listener"
                          ? "Active"
                          : isApproved
                            ? "Approved"
                            : requestStatus === "pending"
                              ? "Reviewing"
                              : "Locked"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="order-5 px-4 sm:px-6 lg:px-10">
        <PrescriptionRail
          compact
          title="Prescribe My Music"
          subtitle="AI picked these stations for your current energy using Tradio listening signals."
        />
      </div>

      {/* Premium Creative Action Hub (Minimalist and compact, replaces 3 bulky boxes) */}
      <div className="order-3 px-4 sm:px-6 lg:px-10">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {/* Action 1: Universe Router */}
          <GlassCard
            glow
            className="p-4 sm:p-5 flex flex-col gap-3 sm:justify-between hover-lift relative overflow-hidden group min-h-0 sm:min-h-[170px]"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl group-hover:bg-cyan-400/15 transition-all duration-700 pointer-events-none" />
            <div>
              <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-cyan-300">
                <Route className="h-3 w-3" /> Universe Router
              </span>
              <h3 className="mt-2 text-base font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors sm:mt-2.5">
                Route Me
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                Answer a short Prescribe Me flow and instantly route into Trey TV, Tradio, FWD,
                Storybook, Games, or Song Wars.
              </p>
            </div>
            {onOpenRouteMe && (
              <button
                type="button"
                onClick={onOpenRouteMe}
                className="mt-0 w-full h-8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 sm:mt-4"
              >
                Launch Router
              </button>
            )}
          </GlassCard>

          {/* Action 2: Live Music Review */}
          <GlassCard
            glow
            className="p-4 sm:p-5 flex flex-col gap-3 sm:justify-between hover-lift relative overflow-hidden group min-h-0 sm:min-h-[170px]"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-fuchsia-500/10 blur-2xl group-hover:bg-fuchsia-500/15 transition-all duration-700 pointer-events-none" />
            <div>
              <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-fuchsia-300">
                <Radio className="h-3 w-3 animate-pulse" /> Live Feature
              </span>
              <h3 className="mt-2 text-base font-black tracking-tight text-white group-hover:text-fuchsia-300 transition-colors sm:mt-2.5">
                Live Music Review
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                Submit your track and get reviewed live on-air by Trey Trizzy. Priority
                skip-the-line options available.
              </p>
            </div>
            <Link
              to="/music-review"
              className="mt-0 w-full h-8 rounded-lg bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 hover:border-fuchsia-500/40 text-fuchsia-300 text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 flex items-center justify-center sm:mt-4"
            >
              Submit Track
            </Link>
          </GlassCard>

          {/* Action 3: Prescription Radio (Minimalist Hero) */}
          <GlassCard
            glow
            className="p-4 sm:p-5 flex flex-col gap-3 sm:justify-between hover-lift relative overflow-hidden group min-h-0 sm:min-h-[170px]"
          >
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-purple-500/15 blur-2xl group-hover:bg-purple-500/25 transition-all duration-700 pointer-events-none" />
            {/* Small glowing animated micro-sphere emblem at the top right corner */}
            <div className="absolute top-4 right-4 h-12 w-12 rounded-full overflow-hidden flex items-center justify-center opacity-40 group-hover:opacity-80 transition-opacity pointer-events-none">
              <div className="relative w-8 h-8 flex items-center justify-center scale-75">
                <div className="absolute rounded-full border border-transparent border-t-fuchsia-500 animate-slow-spin w-8 h-8 filter drop-shadow-[0_0_4px_#d946ef]" />
                <div className="absolute rounded-full border border-transparent border-b-cyan-400 animate-spin-reverse w-6 h-6 filter drop-shadow-[0_0_3px_#22d3ee]" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-purple-300">
                <Sparkles className="h-3 w-3" /> Live Synthetic Radio
              </span>
              <h3 className="mt-2 text-base font-black tracking-tight text-white group-hover:text-purple-300 transition-colors sm:mt-2.5">
                Prescription Radio
              </h3>
              <p className="mt-1 text-[11px] leading-relaxed text-white/50">
                Continuously listening. Always perfect. Tradio mixes what you love with what you'll
                love next.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                playStation(
                  TRACKS.aiRadio,
                  [TRACKS.midnightVelvet, TRACKS.fallingForYou, TRACKS.sixAmThoughts],
                  {
                    id: "ai-radio-for-you-live-signal",
                    type: "station",
                    label: "Prescription Radio",
                    title: "Prescription Radio",
                    subtitle: "Synthesized Live Formula",
                    image: IMG.aiSphere,
                    isLive: true,
                    listenerCount: 18400,
                  },
                )
              }
              className="mt-0 w-full h-8 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 sm:mt-4"
            >
              Tune In Live
            </button>
          </GlassCard>
        </div>
      </div>

      {/* Featured Song Wars PvP module */}
      {onOpenSongWars && (
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-fuchsia-400 animate-pulse" /> Live Song Wars PVP
            </h2>
            <button
              onClick={() => onOpenSongWars({ view: "hub" })}
              className="text-xs font-bold text-purple-300 hover:text-white transition-all"
            >
              Enter Hub
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Live Card */}
            <div className="relative p-5 rounded-3xl border-[0.5px] border-white/18 bg-gradient-to-br from-white/[0.10] via-white/[0.03] to-transparent backdrop-blur-3xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(255,255,255,0.02),0_20px_45px_rgba(0,0,0,0.65)] hover:border-white/40 hover:shadow-[0_0_35px_rgba(255,255,255,0.12),inset_0_1.5px_2.5px_rgba(255,255,255,0.32),0_20px_45px_rgba(0,0,0,0.7)] group transition-all duration-500">
              {/* Card Header Status */}
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
                <span className="flex items-center gap-1.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" /> Live Now
                </span>
                <span className="text-white/60 font-mono">14.8K Watching</span>
              </div>

              {/* Facing-Off Arena Visual */}
              <div className="my-5 flex items-center justify-center">
                <div className="relative flex items-center">
                  {/* Left Avatar */}
                  <div className="relative z-10 h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-fuchsia-500 to-purple-600 shadow-[0_0_15px_rgba(217,70,239,0.4)]">
                    <img
                      src={IMG.treyTrizzy}
                      alt="Trey Trizzy"
                      className="h-full w-full rounded-full object-cover border border-black/20"
                    />
                  </div>
                  {/* VS Middle Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white via-zinc-300 to-zinc-600 border border-white/40 text-[9px] font-black italic text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    VS
                  </div>
                  {/* Right Avatar */}
                  <div className="relative -ml-4 z-10 h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    <img
                      src={IMG.kianaLane}
                      alt="Kiana Lane"
                      className="h-full w-full rounded-full object-cover border border-black/20"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-white truncate">
                  Trey Trizzy vs Kiana Lane
                </h3>
                <p className="text-[10px] text-fuchsia-300/60 font-medium">
                  The Late Night Trap/Soul Clash
                </p>
              </div>

              {/* Watch CTA */}
              <button
                onClick={() => onOpenSongWars({ view: "stage", battleId: "battle-1" })}
                className="w-full mt-5 rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_20px_rgba(217,70,239,0.4)]"
              >
                Watch Live Clash
              </button>
            </div>

            {/* Upcoming Card */}
            <div className="relative p-5 rounded-3xl border-[0.5px] border-white/18 bg-gradient-to-br from-white/[0.10] via-white/[0.03] to-transparent backdrop-blur-3xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(255,255,255,0.02),0_20px_45px_rgba(0,0,0,0.65)] hover:border-white/40 hover:shadow-[0_0_35px_rgba(255,255,255,0.12),inset_0_1.5px_2.5px_rgba(255,255,255,0.32),0_20px_45px_rgba(0,0,0,0.7)] group transition-all duration-500">
              {/* Card Header Status */}
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-cyan-400">
                <span className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-400/20 rounded-full px-2.5 py-1">
                  <Calendar className="h-3 w-3" /> Upcoming
                </span>
                <span className="text-cyan-300/80 font-mono">Tomorrow 8PM</span>
              </div>

              {/* Facing-Off Arena Visual */}
              <div className="my-5 flex items-center justify-center">
                <div className="relative flex items-center">
                  {/* Left Avatar */}
                  <div className="relative z-10 h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                    <img
                      src={IMG.milaRain}
                      alt="JAYE."
                      className="h-full w-full rounded-full object-cover border border-black/20"
                    />
                  </div>
                  {/* VS Middle Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white via-zinc-300 to-zinc-600 border border-white/40 text-[9px] font-black italic text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    VS
                  </div>
                  {/* Right Avatar */}
                  <div className="relative -ml-4 z-10 h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                    <img
                      src={IMG.dariusCole}
                      alt="Darius Cole"
                      className="h-full w-full rounded-full object-cover border border-black/20"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-white truncate">JAYE. vs Darius Cole</h3>
                <p className="text-[10px] text-cyan-300/60 font-medium">
                  Neon Chill vs Electronic Fusion
                </p>
              </div>

              {/* Watch CTA */}
              <button
                onClick={() => onOpenSongWars({ view: "setup", battleId: "battle-2" })}
                className="w-full mt-5 rounded-full bg-white/10 border border-white/15 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white hover:bg-white/18 active:scale-95 transition-all shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15)]"
              >
                View Match Setup
              </button>
            </div>

            {/* Replay Card */}
            <div className="relative p-5 rounded-3xl border-[0.5px] border-white/18 bg-gradient-to-br from-white/[0.10] via-white/[0.03] to-transparent backdrop-blur-3xl shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.22),inset_0_-1px_1px_rgba(255,255,255,0.02),0_20px_45px_rgba(0,0,0,0.65)] hover:border-white/40 hover:shadow-[0_0_35px_rgba(255,255,255,0.12),inset_0_1.5px_2.5px_rgba(255,255,255,0.32),0_20px_45px_rgba(0,0,0,0.7)] group transition-all duration-500">
              {/* Card Header Status */}
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-purple-400">
                <span className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full px-2.5 py-1">
                  <RotateCcw className="h-3 w-3" /> Past Replay
                </span>
                <span className="text-purple-300/80 font-mono">ATL vs LA</span>
              </div>

              {/* Facing-Off Arena Visual */}
              <div className="my-5 flex items-center justify-center">
                <div className="relative flex items-center">
                  {/* Left Avatar */}
                  <div className="relative z-10 h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                    <img
                      src={IMG.noahKade}
                      alt="ATL Heat"
                      className="h-full w-full rounded-full object-cover border border-black/20"
                    />
                    {/* Winner badge */}
                    <span className="absolute -top-1 -left-1 text-[8px] bg-amber-400 text-black px-1 rounded-full font-black uppercase shadow-[0_0_5px_rgba(245,158,11,0.5)]">
                      WIN
                    </span>
                  </div>
                  {/* VS Middle Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white via-zinc-300 to-zinc-600 border border-white/40 text-[9px] font-black italic text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    VS
                  </div>
                  {/* Right Avatar */}
                  <div className="relative -ml-4 z-10 h-14 w-14 rounded-full p-[2px] bg-white/10 opacity-70">
                    <img
                      src={IMG.milaRain}
                      alt="LA Sunsets"
                      className="h-full w-full rounded-full object-cover border border-black/20"
                    />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-white truncate">ATL Heat vs LA Sunsets</h3>
                <p className="text-[10px] text-purple-300/60 font-medium">
                  Completed: ATL won 3 - 2
                </p>
              </div>

              {/* Watch CTA */}
              <button
                onClick={() => onOpenSongWars({ view: "replay", battleId: "replay-1" })}
                className="w-full mt-5 rounded-full bg-white/10 border border-white/15 py-2.5 text-center text-xs font-black uppercase tracking-wider text-white hover:bg-white/18 active:scale-95 transition-all shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.15)]"
              >
                Watch Replay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured stations */}
      <div>
        <SectionHeader title="Featured Stations" onSeeAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FEATURED_STATIONS.map((s) => {
            const playingThis = currentTrack?.id === s.track.id && isPlaying;
            return (
              <button
                key={s.id}
                onClick={() =>
                  playStation(s.track, undefined, {
                    id: s.id,
                    type: "station",
                    label: "Station",
                    title: s.title,
                    subtitle: s.tags,
                    image: s.img,
                    isLive: true,
                  })
                }
                className="group w-[160px] shrink-0 text-left hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.35)] group-hover:border-purple-500/30 group-hover:shadow-[0_12px_30px_rgba(168,85,247,0.15)] transition-all duration-300">
                  <img
                    src={s.img}
                    alt={s.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  <span className="absolute bottom-2.5 right-2.5 transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <PlayCircle size={36} />
                  </span>
                  <Waveform
                    className={`absolute bottom-2.5 left-2.5 h-3 w-12 ${playingThis ? "opacity-100" : "opacity-50"}`}
                    bars={10}
                    animate={playingThis}
                  />
                </div>
                <div className="mt-2.5 truncate text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {s.title}
                </div>
                <div className="truncate text-[11px] text-white/55">{s.tags}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Artist-Owned Stations */}
      <div>
        <SectionHeader title="Artist-Owned Stations" onSeeAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {ARTIST_STATIONS.map((a) => (
            <GlassCard
              key={a.id}
              className="flex w-[210px] shrink-0 items-center gap-3 p-2.5 pr-3 hover:-translate-y-1 hover:border-cyan-500/20 active:scale-98 transition-all duration-300 group"
            >
              <img
                src={a.img}
                alt={a.name}
                onClick={() => {
                  if (onOpenProfile) {
                    onOpenProfile(a.name === "JAYE." ? "producer" : "artist", a.name);
                  } else {
                    onOpenArtist();
                  }
                }}
                className="h-12 w-12 rounded-full border border-purple-400/40 object-cover cursor-pointer transition-transform active:scale-95 hover:scale-110 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => {
                    if (onOpenProfile) {
                      onOpenProfile(a.name === "JAYE." ? "producer" : "artist", a.name);
                    } else {
                      onOpenArtist();
                    }
                  }}
                  className="flex items-center gap-1 truncate text-left text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
                >
                  {a.name} {a.verified && <VerifiedBadge />}
                </button>
                <div className="text-[11px] text-white/55">Station</div>
              </div>
              <div className="transition-transform duration-300 group-hover:scale-105 active:scale-90 shrink-0">
                <PlayCircle
                  size={32}
                  onClick={() =>
                    playStation(a.track, undefined, {
                      id: a.id,
                      type: "artist_station",
                      label: "Artist Station",
                      title: `${a.name} Radio`,
                      subtitle: a.name,
                      image: a.img,
                      isLive: true,
                    })
                  }
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Instant Releases */}
      <div>
        <SectionHeader title="Instant Releases" onSeeAll={() => {}} />
        <div className="flex gap-3 overflow-x-auto px-4 pb-1 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {INSTANT_RELEASES.map((r) => (
            <GlassCard
              key={r.id}
              className="flex w-[270px] shrink-0 items-center gap-3 p-2.5 hover:-translate-y-1 hover:border-purple-500/20 active:scale-98 transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-white/5">
                <img
                  src={r.img}
                  alt={r.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {r.title}
                  <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-cyan-300">
                    NEW
                  </span>
                </div>
                <div className="truncate text-[11px] text-white/55 group-hover:text-purple-300 transition-colors">
                  {r.artist}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Waveform
                    className={`h-2.5 w-16 ${currentTrack?.id === r.track.id && isPlaying ? "opacity-100" : "opacity-50"}`}
                    bars={14}
                    animate={currentTrack?.id === r.track.id && isPlaying}
                  />
                  <span className="text-[10px] text-white/40">Released {r.released}</span>
                </div>
              </div>
              <div className="transition-transform duration-300 group-hover:scale-105 active:scale-90 shrink-0">
                <PlayCircle
                  size={32}
                  onClick={() =>
                    playStation(
                      {
                        ...r.track,
                        sourceType: "instant_release",
                        sourceLabel: "Release",
                        isLive: false,
                      },
                      undefined,
                      {
                        id: r.id,
                        type: "instant_release",
                        label: "Release",
                        title: r.title,
                        subtitle: r.artist,
                        image: r.img,
                        isLive: false,
                      },
                    )
                  }
                />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Trending Now */}
      <div className="animate-fade-in">
        <SectionHeader title="Trending Now" onSeeAll={() => {}} />
        <div className="flex gap-4 overflow-x-auto px-4 pb-2 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRENDING.map((t) => (
            <GlassCard
              key={t.rank}
              className="flex w-[270px] shrink-0 items-center gap-4 p-4 hover:shadow-premium-lg transition-all duration-300 group"
            >
              <span className="text-3xl font-black text-purple-300/80 group-hover:text-purple-300 transition-colors">
                {t.rank}
              </span>
              <img
                src={t.img}
                alt={t.title}
                className="h-13 w-13 rounded-2xl object-cover shadow-[0_0_15px_-5px_rgba(176,38,255,0.2)] group-hover:shadow-[0_0_25px_-2px_rgba(176,38,255,0.4)] transition-all duration-300"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{t.title}</div>
                <div className="truncate text-[11px] text-white/55">{t.artist}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" /> {t.delta}
                </div>
              </div>
              <PlayCircle
                size={40}
                onClick={() =>
                  playStation(t.track, undefined, {
                    id: `trending-${t.rank}`,
                    type: "song",
                    label: "Song",
                    title: "Trending Now",
                    subtitle: t.artist,
                    image: t.img,
                  })
                }
                gradient
              />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
