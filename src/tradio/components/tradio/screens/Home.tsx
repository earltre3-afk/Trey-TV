import React from 'react';
import { Search as SearchIcon, Sparkles, TrendingUp, Play, Flame, Calendar, RotateCcw, Radio, Route, Home, Headphones, Music, Sliders, CheckCircle2, Lock, Clock, AlertCircle } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { TopBar, GlassCard, PrimaryButton, SectionHeader, VerifiedBadge, PlayCircle, Waveform } from '../ui';
import { IMG, FEATURED_STATIONS, ARTIST_STATIONS, INSTANT_RELEASES, TRENDING, TRACKS } from '../data';
import { usePlayer, type PlaybackSource, type Track } from '@/tradio/contexts/PlayerContext';
import { PrescriptionRail } from '../auth/components';
import { useAuth } from '@/lib/auth';
import { useSupabaseSession } from '@/lib/supabase-session';
import { useTradioIdentity } from '../auth/useTradioIdentity';
import { useAccessRequests } from '../auth/AccessRequestsContext';
import { toast } from 'sonner';

interface Props {
  onOpenPlayer: () => void;
  onOpenArtist: () => void;
  onOpenBuild: () => void;
  onOpenSongWars?: (dest?: { view: 'hub' | 'setup' | 'stage' | 'results' | 'replay'; battleId?: string }) => void;
  onOpenProfile?: (role: 'artist' | 'producer' | 'host', name: string) => void;
  onOpenRouteMe?: () => void;
}

export const HomeScreen: React.FC<Props> = ({ onOpenPlayer, onOpenArtist, onOpenBuild, onOpenSongWars, onOpenProfile, onOpenRouteMe }) => {
  const { play, playQueue, playStation: startStation, currentTrack, isPlaying } = usePlayer();
  const { identity, currentMode, setActiveMode, currentRoleLabel } = useTradioIdentity();
  const access = useAccessRequests();

  // Tradio reads the logged-in Trey TV identity (parent is the identity source).
  // Display priority: Trey TV username → display name → email prefix → fallback.
  const { user: treyUser } = useAuth();
  const { user: supaUser } = useSupabaseSession();
  const emailPrefix = supaUser?.email ? supaUser.email.split('@')[0] : '';
  const greetingName =
    treyUser?.handle?.trim() ||
    treyUser?.name?.trim() ||
    emailPrefix.trim() ||
    'Tradio Listener';

  const getRoleStatus = (role: 'artist' | 'producer' | 'dj') => {
    const grant = identity?.roles?.find((g) => g.role === role);
    const request = access?.getRequestFor(role);
    const isApproved = grant ? (grant.role_status === 'active' || grant.role_status === 'approved') : false;
    const requestStatus = request?.status ?? 'not_started';
    return { isApproved, requestStatus, request };
  };

  const experiences = [
    {
      mode: 'listener',
      title: 'Listener',
      tagline: 'Be Entertained',
      description: 'Explore high-fidelity AI-curated stations, customize mood mixes, and participate in interactive song wars.',
      Icon: Headphones,
    },
    {
      mode: 'artist',
      title: 'Tradio Artist',
      tagline: 'Music Catalog',
      description: 'Distribute your music catalog on the app, launch custom artist stations, and host exclusive premieres.',
      Icon: Music,
    },
    {
      mode: 'producer',
      title: 'Beat Producer',
      tagline: 'Promote Beats',
      description: 'Promote your beat catalog, organize beat packs, secure host slots, and collaborate with approved Tradio artists.',
      Icon: Sliders,
    },
    {
      mode: 'dj',
      title: 'Radio Host / DJ',
      tagline: 'Host a Show',
      description: 'Schedule live radio shows, broadcast DJ mixes, handle requests, and host interactive PVP sessions.',
      Icon: Radio,
    },
  ];

  const playStation = (track: Track, queue?: Track[], source?: PlaybackSource) => {
    const playbackTrack = {
      ...track,
      sourceType: source?.type || 'station',
      sourceLabel: source?.label || 'Station',
      isLive: source?.isLive ?? true,
    };
    if (source?.isLive) startStation(source, [playbackTrack, ...(queue || [])]);
    else if (queue) playQueue([playbackTrack, ...queue], 0, source);
    else play(playbackTrack, undefined, source);
    onOpenPlayer();
  };

  return (
    <div className="space-y-8 pb-6 lg:space-y-10">
      <TopBar onProfileClick={() => onOpenProfile?.('host', 'Jordan')} />

      {/* Greeting & Search Group */}
      <div className="px-4 sm:px-6 lg:px-10 flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Good evening, <span className="text-signature text-4xl sm:text-5xl text-fuchsia-300 font-normal tracking-wide drop-shadow-[0_0_12px_rgba(217,70,239,0.35)]">{greetingName}</span>
              </h1>
              <Waveform className="h-5 w-8 self-center" bars={6} />
            </div>
            <p className="mt-1 text-sm text-white/60">Music that understands you.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl focus-within:border-purple-500/50 focus-within:shadow-[0_0_20px_rgba(168,85,247,0.15)] focus-within:bg-white/[0.06] transition-all duration-300">
          <SearchIcon className="h-5 w-5 text-white/50" />
          <input
            placeholder="Search artists, stations, moods..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 active:scale-90 hover:scale-105 hover:shadow-[0_0_12px_rgba(217,70,239,0.5)] transition-all duration-300">
            <Waveform className="h-4 w-4" bars={4} color="from-white to-white" />
          </button>
        </div>
      </div>

      {/* Tradio Experience Selector Gateway */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="p-5 sm:p-6 overflow-hidden relative">
          {/* Subtle decorative glow overlays */}
          <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 left-10 h-40 w-56 rounded-full bg-fuchsia-500/8 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-fuchsia-300">Tradio Ecosystem Paths</span>
              <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-300">
                Current Mode: {currentRoleLabel}
              </span>
            </div>

            <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">Choose your experience</h2>
            <p className="mt-1 max-w-2xl text-xs text-white/55 leading-relaxed">
              Tradio splits into four target lanes. Select a path below to switch your active experience mode, or request verified access to unlock creative tools.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {experiences.map((exp) => {
                const isActive = currentMode === exp.mode;
                const { isApproved, requestStatus } = exp.mode !== 'listener' ? getRoleStatus(exp.mode as any) : { isApproved: true, requestStatus: 'approved' };

                return (
                  <div
                    key={exp.mode}
                    className={`relative rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 h-full ${
                      isActive
                        ? 'bg-gradient-to-b from-purple-500/15 via-purple-500/5 to-transparent border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15),inset_0_1px_1px_rgba(255,255,255,0.05)]'
                        : 'bg-white/[0.01] border-white/5 hover:border-white/12 hover:bg-white/[0.02]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isActive
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-white/[0.03] text-white/60 border border-white/5'
                        }`}>
                          <exp.Icon className="h-4.5 w-4.5" />
                        </div>

                        {/* Status chip */}
                        {exp.mode === 'listener' ? (
                          <span className="text-[8px] font-mono uppercase font-black bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                            Always Active
                          </span>
                        ) : isApproved ? (
                          <span className="text-[8px] font-mono uppercase font-black bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-400" /> Approved
                          </span>
                        ) : requestStatus === 'pending' || requestStatus === 'under_review' ? (
                          <span className="text-[8px] font-mono uppercase font-black bg-amber-500/10 border border-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5 text-amber-400 animate-pulse" /> In Review
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono uppercase font-black bg-white/5 border border-white/10 text-white/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5 text-white/30" /> Locked
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3.5 text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                        {exp.title}
                        {isActive && <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />}
                      </h3>
                      <p className="mt-0.5 text-[10px] font-medium text-purple-300/80 uppercase font-mono">{exp.tagline}</p>
                      <p className="mt-2 text-[11px] leading-relaxed text-white/50">{exp.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.04]">
                      {isActive ? (
                        <button
                          disabled
                          className="w-full py-2 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-200 text-[10px] font-black uppercase tracking-wider cursor-default flex items-center justify-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3 text-purple-400" /> Active Experience
                        </button>
                      ) : isApproved ? (
                        <button
                          onClick={() => {
                            setActiveMode(exp.mode as any);
                            toast.success(`Switched Tradio to ${exp.title} Mode`);
                          }}
                          className="w-full py-2 rounded-xl bg-white/5 hover:bg-purple-500/10 border border-white/10 hover:border-purple-500/30 text-white hover:text-purple-200 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 flex items-center justify-center gap-1"
                        >
                          Switch Experience
                        </button>
                      ) : requestStatus === 'pending' || requestStatus === 'under_review' ? (
                        <button
                          onClick={() => {
                            toast.info(`Your ${exp.title} access request is currently under review by our team.`);
                          }}
                          className="w-full py-2 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-300/70 text-[10px] font-bold uppercase tracking-wider hover:bg-amber-500/10 transition-all"
                        >
                          Awaiting Review
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            access?.openFlow(exp.mode as any);
                          }}
                          className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 shadow-[0_4px_12px_rgba(168,85,247,0.2)] hover:shadow-[0_4px_18px_rgba(168,85,247,0.35)] flex items-center justify-center gap-1"
                        >
                          Request Access
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="px-4 sm:px-6 lg:px-10">
        <PrescriptionRail
          title="Prescribe My Music"
          subtitle="AI picked these stations for your current energy using Tradio listening signals."
        />
      </div>

      {onOpenRouteMe && (
        <div className="px-4 sm:px-6 lg:px-10">
          <GlassCard glow className="overflow-hidden">
            <div className="relative p-5 sm:p-6">
              <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-cyan-400/15 blur-3xl" />
              <div className="absolute -bottom-16 left-1/3 h-40 w-56 rounded-full bg-fuchsia-500/12 blur-3xl" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
                    <Route className="h-3.5 w-3.5" /> Universe Router
                  </span>
                  <h2 className="mt-3 text-2xl font-black tracking-tight text-white">Route Me</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/62">
                    Answer a short Prescribe Me flow and route into Trey TV, Tradio, FWD, Storybook, Games, Song Wars, or future Trance.
                  </p>
                </div>
                <PrimaryButton onClick={onOpenRouteMe} className="shrink-0">
                  <Sparkles className="h-4 w-4" /> Open Route Me
                </PrimaryButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Live Music Review Card */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden">
          <Link to="/music-review" className="relative p-5 sm:p-6 block group">
            <div className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-fuchsia-500/15 blur-3xl" />
            <div className="absolute -bottom-16 left-1/3 h-40 w-56 rounded-full bg-purple-600/12 blur-3xl" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-fuchsia-100">
                  <Radio className="h-3.5 w-3.5 text-fuchsia-400 animate-pulse" /> Live Feature
                </span>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-white flex items-center gap-2 group-hover:text-fuchsia-300 transition-colors">
                  Live Music Review
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-white/60 font-medium">
                  Submit your track and get reviewed live on-air by Trey Trizzy. Skip the line and prioritize your track with premium options.
                </p>
              </div>
              <div className="relative inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[0_15px_30px_rgba(168,85,247,0.3)] border border-white/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_20px_45px_rgba(168,85,247,0.45)] active:scale-95 hover:brightness-105 group overflow-hidden shrink-0">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" /> Submit Song
                </span>
              </div>
            </div>
          </Link>
        </GlassCard>
      </div>

      {/* Prescription Radio Hero */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden">
          <div className="relative group">
            {/* Pulsing neon backing glow behind the sphere ball */}
            <div className="absolute right-[10%] top-1/2 -translate-y-1/2 h-36 w-36 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-purple-600/15 blur-2xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 pointer-events-none" />

            <img
              src={IMG.aiSphere}
              alt=""
              className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-90 pointer-events-none transition-transform duration-700 group-hover:scale-102"
            />

            {/* Premium Spinning Neon Glow Streaks overlaid exactly along the lines of the sphere */}
            <div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden flex items-center justify-center pointer-events-none">
              <div className="relative w-40 h-44 flex items-center justify-center">
                {/* Outer Magenta Clockwise Glow Streak */}
                <div
                  className="absolute rounded-full border border-transparent border-t-fuchsia-500/90 border-r-fuchsia-400/20 animate-slow-spin"
                  style={{
                    width: '128px',
                    height: '128px',
                    animationDuration: '5s',
                    filter: 'drop-shadow(0 0 8px #d946ef) drop-shadow(0 0 15px #d946ef)',
                  }}
                />
                {/* Inner Cyan Counter-Clockwise Glow Streak */}
                <div
                  className="absolute rounded-full border border-transparent border-b-cyan-400 border-l-cyan-300/30 animate-spin-reverse"
                  style={{
                    width: '100px',
                    height: '100px',
                    animationDuration: '7s',
                    filter: 'drop-shadow(0 0 6px #22d3ee) drop-shadow(0 0 12px #22d3ee)',
                  }}
                />
                {/* Deep core glow overlay */}
                <div
                  className="absolute rounded-full bg-gradient-to-tr from-purple-500/10 to-cyan-400/10 animate-pulse"
                  style={{
                    width: '75px',
                    height: '75px',
                    animationDuration: '3s',
                  }}
                />
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="relative p-5">
              <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/15 px-2.5 py-1 text-[11px] font-semibold text-purple-200">
                <Sparkles className="h-3 w-3" /> PRESCRIPTION RADIO
              </span>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">Prescription Radio For You</h2>
              <p className="mt-2 max-w-[60%] text-sm leading-snug text-white/70">
                Continuously listening. Always perfect. Tradio mixes what you love with what you'll love next.
              </p>
              <PrimaryButton
                onClick={() =>
                  playStation(TRACKS.aiRadio, [
                    TRACKS.midnightVelvet,
                    TRACKS.fallingForYou,
                    TRACKS.cityLights,
                  ], {
                    id: 'ai-radio-for-you',
                    type: 'station',
                    label: 'AI Station',
                    title: 'Prescription Radio For You',
                    subtitle: 'Personal live mix',
                    image: IMG.aiSphere,
                    isLive: true,
                    listenerCount: 18400,
                  })
                }
                className="mt-5"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  <Play className="h-3.5 w-3.5 fill-white" />
                </span>
                Play Your Station
              </PrimaryButton>
              <div className="mt-4 flex justify-end">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-purple-300">
                  <Waveform className="h-3 w-4" bars={5} color="from-purple-300 to-purple-300" />
                  LIVE MIX
                </span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Featured Song Wars PvP module */}
      {onOpenSongWars && (
        <div className="px-4 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              <Flame className="h-4 w-4 text-fuchsia-400 animate-pulse" /> Live Song Wars PVP
            </h2>
            <button
              onClick={() => onOpenSongWars({ view: 'hub' })}
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
                    <img src={IMG.treyTrizzy} alt="Trey Trizzy" className="h-full w-full rounded-full object-cover border border-black/20" />
                  </div>
                  {/* VS Middle Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white via-zinc-300 to-zinc-600 border border-white/40 text-[9px] font-black italic text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    VS
                  </div>
                  {/* Right Avatar */}
                  <div className="relative -ml-4 z-10 h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 to-fuchsia-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]">
                    <img src={IMG.kianaLane} alt="Kiana Lane" className="h-full w-full rounded-full object-cover border border-black/20" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-white truncate">Trey Trizzy vs Kiana Lane</h3>
                <p className="text-[10px] text-fuchsia-300/60 font-medium">The Late Night Trap/Soul Clash</p>
              </div>

              {/* Watch CTA */}
              <button
                onClick={() => onOpenSongWars({ view: 'stage', battleId: 'battle-1' })}
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
                    <img src={IMG.milaRain} alt="JAYE." className="h-full w-full rounded-full object-cover border border-black/20" />
                  </div>
                  {/* VS Middle Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white via-zinc-300 to-zinc-600 border border-white/40 text-[9px] font-black italic text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    VS
                  </div>
                  {/* Right Avatar */}
                  <div className="relative -ml-4 z-10 h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 to-cyan-400 shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                    <img src={IMG.dariusCole} alt="Darius Cole" className="h-full w-full rounded-full object-cover border border-black/20" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-white truncate">JAYE. vs Darius Cole</h3>
                <p className="text-[10px] text-cyan-300/60 font-medium">Neon Chill vs Electronic Fusion</p>
              </div>

              {/* Watch CTA */}
              <button
                onClick={() => onOpenSongWars({ view: 'setup', battleId: 'battle-2' })}
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
                    <img src={IMG.noahKade} alt="ATL Heat" className="h-full w-full rounded-full object-cover border border-black/20" />
                    {/* Winner badge */}
                    <span className="absolute -top-1 -left-1 text-[8px] bg-amber-400 text-black px-1 rounded-full font-black uppercase shadow-[0_0_5px_rgba(245,158,11,0.5)]">WIN</span>
                  </div>
                  {/* VS Middle Badge */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-white via-zinc-300 to-zinc-600 border border-white/40 text-[9px] font-black italic text-black shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                    VS
                  </div>
                  {/* Right Avatar */}
                  <div className="relative -ml-4 z-10 h-14 w-14 rounded-full p-[2px] bg-white/10 opacity-70">
                    <img src={IMG.milaRain} alt="LA Sunsets" className="h-full w-full rounded-full object-cover border border-black/20" />
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center space-y-1">
                <h3 className="text-sm font-black text-white truncate">ATL Heat vs LA Sunsets</h3>
                <p className="text-[10px] text-purple-300/60 font-medium">Completed: ATL won 3 - 2</p>
              </div>

              {/* Watch CTA */}
              <button
                onClick={() => onOpenSongWars({ view: 'replay', battleId: 'replay-1' })}
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
                onClick={() => playStation(s.track, undefined, {
                  id: s.id,
                  type: 'station',
                  label: 'Station',
                  title: s.title,
                  subtitle: s.tags,
                  image: s.img,
                  isLive: true,
                })}
                className="group w-[160px] shrink-0 text-left hover:-translate-y-1 transition-all duration-300 active:scale-[0.98]"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 shadow-[0_8px_20px_rgba(0,0,0,0.35)] group-hover:border-purple-500/30 group-hover:shadow-[0_12px_30px_rgba(168,85,247,0.15)] transition-all duration-300">
                  <img src={s.img} alt={s.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                  <span className="absolute bottom-2.5 right-2.5 transform translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10"><PlayCircle size={36} /></span>
                  <Waveform className={`absolute bottom-2.5 left-2.5 h-3 w-12 ${playingThis ? 'opacity-100' : 'opacity-50'}`} bars={10} />
                </div>
                <div className="mt-2.5 truncate text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">{s.title}</div>
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
            <GlassCard key={a.id} className="flex w-[210px] shrink-0 items-center gap-3 p-2.5 pr-3 hover:-translate-y-1 hover:border-cyan-500/20 active:scale-98 transition-all duration-300 group">
              <img
                src={a.img}
                alt={a.name}
                onClick={() => {
                  if (onOpenProfile) {
                    onOpenProfile(a.name === 'JAYE.' ? 'producer' : 'artist', a.name);
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
                      onOpenProfile(a.name === 'JAYE.' ? 'producer' : 'artist', a.name);
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
                <PlayCircle size={32} onClick={() => playStation(a.track, undefined, {
                  id: a.id,
                  type: 'artist_station',
                  label: 'Artist Station',
                  title: `${a.name} Radio`,
                  subtitle: a.name,
                  image: a.img,
                  isLive: true,
                })} />
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
            <GlassCard key={r.id} className="flex w-[270px] shrink-0 items-center gap-3 p-2.5 hover:-translate-y-1 hover:border-purple-500/20 active:scale-98 transition-all duration-300 group">
              <div className="h-14 w-14 rounded-lg overflow-hidden shrink-0 border border-white/5">
                <img src={r.img} alt={r.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  {r.title}
                  <span className="rounded bg-cyan-400/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-cyan-300">
                    NEW
                  </span>
                </div>
                <div className="truncate text-[11px] text-white/55 group-hover:text-purple-300 transition-colors">{r.artist}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Waveform className="h-2.5 w-16" bars={14} />
                  <span className="text-[10px] text-white/40">Released {r.released}</span>
                </div>
              </div>
              <div className="transition-transform duration-300 group-hover:scale-105 active:scale-90 shrink-0">
                <PlayCircle size={32} onClick={() => playStation({ ...r.track, sourceType: 'instant_release', sourceLabel: 'Release', isLive: false }, undefined, {
                  id: r.id,
                  type: 'instant_release',
                  label: 'Release',
                  title: r.title,
                  subtitle: r.artist,
                  image: r.img,
                  isLive: false,
                })} />
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
            <GlassCard key={t.rank} className="flex w-[270px] shrink-0 items-center gap-4 p-4 hover:shadow-premium-lg transition-all duration-300 group">
              <span className="text-3xl font-black text-purple-300/80 group-hover:text-purple-300 transition-colors">{t.rank}</span>
              <img src={t.img} alt={t.title} className="h-13 w-13 rounded-2xl object-cover shadow-[0_0_15px_-5px_rgba(176,38,255,0.2)] group-hover:shadow-[0_0_25px_-2px_rgba(176,38,255,0.4)] transition-all duration-300" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{t.title}</div>
                <div className="truncate text-[11px] text-white/55">{t.artist}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" /> {t.delta}
                </div>
              </div>
              <PlayCircle size={40} onClick={() => playStation(t.track, undefined, {
                id: `trending-${t.rank}`,
                type: 'song',
                label: 'Song',
                title: 'Trending Now',
                subtitle: t.artist,
                image: t.img,
              })} gradient />
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
