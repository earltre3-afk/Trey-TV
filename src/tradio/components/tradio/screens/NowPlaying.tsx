import React, { useMemo, useState } from "react";
import {
  Activity,
  Cast,
  Check,
  ChevronDown,
  Heart,
  ListMusic,
  Mic2,
  Pause,
  Play,
  Plus,
  Radio,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Sliders,
  Trash2,
  Volume2,
  VolumeX,
} from "lucide-react";
import { TRACKS } from "../data";
import { TradioImage } from "../NoCoverVisualizer";
import { TradioLogo, Waveform } from "../ui";
import { formatTime, usePlayer, type PlaybackItem } from "@/tradio/contexts/PlayerContext";

type DetailTab = "queue" | "lyrics" | "sound" | "context" | "cast";

const TAB_ITEMS: Array<{
  id: DetailTab;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "queue", label: "Queue", Icon: ListMusic },
  { id: "lyrics", label: "Lyrics", Icon: Mic2 },
  { id: "sound", label: "Sound", Icon: Sliders },
  { id: "context", label: "Info", Icon: Activity },
  { id: "cast", label: "Cast", Icon: Cast },
];

const UP_NEXT_FALLBACK: PlaybackItem[] = [
  { ...TRACKS.cityLights, sourceType: "song", sourceLabel: "Song" },
  { ...TRACKS.fallingForYou, sourceType: "song", sourceLabel: "Song" },
  { ...TRACKS.sixAmThoughts, sourceType: "song", sourceLabel: "Song" },
];

const SOURCE_COPY: Record<string, { label: string; detail: string; accent: string }> = {
  song: {
    label: "Song",
    detail: "Library playback",
    accent: "border-cyan-300/30 bg-cyan-400/10 text-cyan-100",
  },
  station: {
    label: "Station",
    detail: "Continuous Tradio radio",
    accent: "border-rose-300/30 bg-rose-400/10 text-rose-100",
  },
  artist_station: {
    label: "Artist Station",
    detail: "Artist-owned radio lane",
    accent: "border-fuchsia-300/30 bg-fuchsia-400/10 text-fuchsia-100",
  },
  instant_release: {
    label: "Release",
    detail: "Fresh drop on Tradio",
    accent: "border-lime-300/30 bg-lime-400/10 text-lime-100",
  },
  producer_beat: {
    label: "Beat",
    detail: "Producer preview",
    accent: "border-amber-300/30 bg-amber-400/10 text-amber-100",
  },
  dj_mix: {
    label: "DJ Mix",
    detail: "Curated host mix",
    accent: "border-sky-300/30 bg-sky-400/10 text-sky-100",
  },
  live_show: {
    label: "Live Show",
    detail: "Broadcast in progress",
    accent: "border-red-300/30 bg-red-400/10 text-red-100",
  },
  song_war_round: {
    label: "Song War",
    detail: "Battle playback context",
    accent: "border-orange-300/30 bg-orange-400/10 text-orange-100",
  },
  replay: {
    label: "Replay",
    detail: "Archived Tradio event",
    accent: "border-violet-300/30 bg-violet-400/10 text-violet-100",
  },
};

const LYRIC_LINES: Record<string, Array<{ line: string; start: number; end: number }>> = {
  "midnight-velvet": [
    { line: "Step into the velvet dark", start: 0, end: 6 },
    { line: "Neon lights are casting sparks", start: 6, end: 12 },
    { line: "Your frequency is locking in", start: 12, end: 18 },
    { line: "This is where the dreams begin", start: 18, end: 24 },
    { line: "Midnight velvet, feel the glow", start: 24, end: 32 },
    { line: "Streaming warmth in stereo", start: 32, end: 999 },
  ],
  default: [
    { line: "Tuning into the Tradio signal", start: 0, end: 5 },
    { line: "Balancing drums, vocals, and air", start: 5, end: 11 },
    { line: "Locking the station into focus", start: 11, end: 18 },
    { line: "Keeping the queue ready underneath", start: 18, end: 25 },
    { line: "Soft lights, clean stream, steady pace", start: 25, end: 32 },
    { line: "Enjoy the room", start: 32, end: 999 },
  ],
};

const EQ_FREQS = ["60", "150", "400", "1K", "3K", "8K"];

const formatLiveElapsed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const nextRepeatMode = (mode: "normal" | "repeat_one" | "repeat_all") => {
  if (mode === "normal") return "repeat_all";
  if (mode === "repeat_all") return "repeat_one";
  return "normal";
};

function IconAction({
  label,
  active,
  children,
  onClick,
}: {
  label: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`grid size-11 shrink-0 place-items-center rounded-full border transition active:scale-95 ${
        active
          ? "border-cyan-300/35 bg-cyan-300/15 text-cyan-100"
          : "border-white/10 bg-white/[0.05] text-white/75 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function DetailShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[220px] rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      {children}
    </div>
  );
}

export const NowPlayingScreen: React.FC<{
  onClose: () => void;
  onOpenPrescription?: () => void;
}> = ({ onClose, onOpenPrescription }) => {
  const {
    currentItem,
    currentSource,
    queue,
    isPlaying,
    isBuffering,
    isLive,
    currentTime,
    duration,
    liked,
    muted,
    volume,
    repeatMode,
    shuffleMode,
    toggle,
    next,
    previous,
    seekPct,
    toggleLike,
    play,
    addToQueue,
    removeFromQueue,
    clearQueue,
    toggleShuffle,
    setRepeatMode,
    setVolume,
    toggleMute,
    isCasting,
    startCast,
    stopCast,
    enhancerPreset,
    setEnhancerPreset,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<DetailTab>("queue");
  const [eqGains, setEqGains] = useState([0, 1, 0, -1, 1, 0]);

  const display: PlaybackItem = currentItem ?? {
    ...TRACKS.midnightVelvet,
    sourceType: "station",
    sourceLabel: "Station",
    isLive: true,
  };
  const sourceType = currentSource?.type || display.sourceType || "song";
  const sourceCopy = SOURCE_COPY[sourceType] || SOURCE_COPY.song;
  const displayIsLive =
    isLive ||
    Boolean(display.isLive) ||
    sourceType === "station" ||
    sourceType === "artist_station" ||
    sourceType === "live_show";
  const cover = display.coverUrl || display.art || null;
  const progressPct =
    displayIsLive || duration <= 0
      ? 100
      : Math.min(100, Math.max(0, (currentTime / duration) * 100));
  const elapsed = displayIsLive ? formatLiveElapsed(currentTime) : formatTime(currentTime);
  const total = displayIsLive ? "Live" : formatTime(duration || display.duration || 0);
  const isLiked = liked.has(display.id);

  const upNextList = useMemo(
    () => (queue.length > 0 ? queue.slice(0, 6) : UP_NEXT_FALLBACK),
    [queue],
  );
  const lyrics = LYRIC_LINES[display.id] || LYRIC_LINES.default;
  const activeLyricIndex = lyrics.findIndex(
    (item) => currentTime >= item.start && currentTime < item.end,
  );

  const handlePrimary = () => {
    if (!currentItem) {
      play(display);
      return;
    }
    toggle();
  };

  const handleShare = () => {
    const text = `${display.title} by ${display.artist} on Tradio`;
    if (navigator.share) {
      void navigator.share({ title: display.title, text }).catch(() => undefined);
      return;
    }
    void navigator.clipboard?.writeText(text).catch(() => undefined);
  };

  const handleStartCast = () => {
    if (!currentItem) {
      play(display);
      return;
    }
    void Promise.resolve(startCast("browser-cast")).catch((error) => {
      console.warn("[Tradio] Cast could not be started", error);
    });
  };

  const handleStopCast = () => {
    void Promise.resolve(stopCast()).catch((error) => {
      console.warn("[Tradio] Cast could not be stopped", error);
    });
  };

  const handleOpenPrescription = () => {
    onClose();
    window.requestAnimationFrame(() => onOpenPrescription?.());
  };

  const renderDetail = () => {
    if (activeTab === "lyrics") {
      return (
        <DetailShell>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Live Lyrics</div>
              <div className="text-xs text-white/50">Synced to the current playhead</div>
            </div>
            <Mic2 className="size-5 text-cyan-200" />
          </div>
          <div className="space-y-2">
            {lyrics.map((lyric, index) => (
              <div
                key={`${lyric.start}-${lyric.line}`}
                className={`rounded-xl px-3 py-2 text-sm transition ${
                  index === activeLyricIndex
                    ? "bg-cyan-300/12 text-white"
                    : "bg-white/[0.03] text-white/45"
                }`}
              >
                {lyric.line}
              </div>
            ))}
          </div>
        </DetailShell>
      );
    }

    if (activeTab === "sound") {
      return (
        <DetailShell>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Studio Master Enhancer</div>
              <div className="text-xs text-white/50">Real-time Web Audio DSP mastering & tube warmers</div>
            </div>
            <Sliders className="size-5 text-cyan-300 animate-pulse" />
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: "commercial_master",
                label: "Commercial Master (Trey TV Edit)",
                desc: "Adds analog tape saturation, 12kHz high-shelf air, and master dynamic limiting.",
                badge: "STUDIO MASTER",
                color: "border-cyan-500/30 bg-cyan-500/10 hover:border-cyan-400/40 text-cyan-100",
                activeColor: "border-cyan-400 bg-cyan-500/20 shadow-[0_0_15px_rgba(34,211,238,0.25)] text-cyan-200",
              },
              {
                id: "bass_boost",
                label: "Club Sub Bass Boost",
                desc: "Pumps deep sub-bass (80Hz) and glues transients for maximum club-ready punch.",
                badge: "CLUB MODE",
                color: "border-fuchsia-500/30 bg-fuchsia-500/10 hover:border-fuchsia-400/40 text-fuchsia-100",
                activeColor: "border-fuchsia-400 bg-fuchsia-500/20 shadow-[0_0_15px_rgba(232,121,249,0.25)] text-fuchsia-200",
              },
              {
                id: "vocal_presence",
                label: "Acoustic Vocal Presence",
                desc: "Filters low-end rumble and boosts 2.5kHz for razor-sharp acoustic vocal clarity.",
                badge: "ACOUSTIC",
                color: "border-amber-500/30 bg-amber-500/10 hover:border-amber-400/40 text-amber-100",
                activeColor: "border-amber-400 bg-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.25)] text-amber-200",
              },
              {
                id: "off",
                label: "Bypass (Dry)",
                desc: "No mastering or enhancement. Unprocessed flat output directly from the source.",
                badge: "DRY OUT",
                color: "border-white/10 bg-white/[0.04] hover:border-white/20 text-white/70",
                activeColor: "border-white/40 bg-white/[0.12] text-white",
              },
            ].map((preset) => {
              const active = enhancerPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => setEnhancerPreset(preset.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all active:scale-[0.98] ${
                    active ? preset.activeColor : preset.color
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black uppercase tracking-wider">{preset.label}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-black/40 text-white/60">
                      {preset.badge}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-white/55 leading-relaxed">{preset.desc}</p>
                </button>
              );
            })}
          </div>

          {enhancerPreset !== "off" && (
            <div className="mt-4 p-3 rounded-xl border border-white/5 bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full size-2 bg-lime-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  DSP Mastering Engines Active
                </span>
              </div>
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-0.5 bg-cyan-400 h-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-0.5 bg-cyan-400 h-1/2 animate-bounce" style={{ animationDelay: "0.4s" }} />
                <div className="w-0.5 bg-cyan-400 h-3/4 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-0.5 bg-cyan-400 h-full animate-bounce" style={{ animationDelay: "0.6s" }} />
              </div>
            </div>
          )}
        </DetailShell>
      );
    }

    if (activeTab === "context") {
      return (
        <DetailShell>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Playback Context</div>
              <div className="text-xs text-white/50">{sourceCopy.detail}</div>
            </div>
            <Activity className="size-5 text-amber-200" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-white/[0.04] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Source
              </div>
              <div className="mt-1 truncate text-white">
                {currentSource?.title || display.station || sourceCopy.label}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Status
              </div>
              <div className="mt-1 text-white">
                {isBuffering ? "Buffering" : isPlaying ? "Playing" : "Ready"}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Genre
              </div>
              <div className="mt-1 truncate text-white">
                {display.genre || display.station || "Tradio"}
              </div>
            </div>
            <div className="rounded-xl bg-white/[0.04] p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Listeners
              </div>
              <div className="mt-1 text-white">
                {(currentSource?.listenerCount || 18420).toLocaleString()}
              </div>
            </div>
          </div>
        </DetailShell>
      );
    }

    if (activeTab === "cast") {
      return (
        <DetailShell>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-white">Cast Output</div>
              <div className="text-xs text-white/50">
                Send the active track to a browser cast target
              </div>
            </div>
            <Cast className="size-5 text-sky-200" />
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-sm font-semibold text-white">
              {isCasting ? "Casting is active" : "This device is active"}
            </div>
            <div className="mt-1 text-xs text-white/50">
              {display.title} - {display.artist}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleStartCast}
              className="flex-1 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-black active:scale-[0.98]"
            >
              Start Cast
            </button>
            <button
              onClick={handleStopCast}
              className="flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-semibold text-white active:scale-[0.98]"
            >
              Stop
            </button>
          </div>
        </DetailShell>
      );
    }

    return (
      <DetailShell>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Up Next</div>
            <div className="text-xs text-white/50">
              {queue.length ? `${queue.length} tracks queued` : "Suggested rotation"}
            </div>
          </div>
          {queue.length > 0 && (
            <button
              onClick={clearQueue}
              className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/60"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {upNextList.map((item) => {
            const queued = queue.some((queuedItem) => queuedItem.id === item.id);
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.035] p-2.5"
              >
                <TradioImage
                  src={(item.coverUrl || item.art) ?? undefined}
                  title={item.title}
                  artist={item.artist}
                  isPlaying={false}
                  fallbackSize="mini"
                  className="size-11 rounded-lg object-cover"
                  imgClassName="size-11 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-white">{item.title}</div>
                  <div className="truncate text-xs text-white/50">{item.artist}</div>
                </div>
                <button
                  aria-label={queued ? "Remove from queue" : "Add to queue"}
                  title={queued ? "Remove from queue" : "Add to queue"}
                  onClick={() => (queued ? removeFromQueue(item.id) : addToQueue(item))}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/70 active:scale-95"
                >
                  {queued ? (
                    <Check className="size-4 text-lime-200" />
                  ) : (
                    <Plus className="size-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </DetailShell>
    );
  };

  return (
    <div className="flex h-[100dvh] w-screen flex-col overflow-hidden bg-[#07080c] text-white">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-[#07080c]/95 px-4 backdrop-blur-xl sm:px-6">
        <button
          onClick={onClose}
          aria-label="Close player"
          title="Close player"
          className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 active:scale-95"
        >
          <ChevronDown className="size-5" />
        </button>
        <div className="text-center">
          <TradioLogo size="sm" />
          <div className="mt-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-white/38">
            Now Playing
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenPrescription && (
            <button
              onClick={handleOpenPrescription}
              aria-label="Open Prescribe Me"
              title="Open Prescribe Me"
              className="grid size-10 place-items-center rounded-full border border-purple-300/25 bg-purple-400/10 text-purple-100 shadow-[0_0_18px_rgba(168,85,247,0.18)] active:scale-95"
            >
              <Sparkles className="size-4" />
            </button>
          )}
          <button
            onClick={handleShare}
            aria-label="Share track"
            title="Share track"
            className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.05] text-white/80 active:scale-95"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl gap-5 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
          <section className="min-w-0">
            <div className="relative mx-auto aspect-square w-full max-w-[min(82vw,420px)] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)] lg:max-w-none">
              <TradioImage
                src={cover ?? undefined}
                title={display.title}
                artist={display.artist}
                isPlaying={isPlaying}
                isLoading={isBuffering}
                mood={display.mood?.[0]}
                genre={display.genre}
                showLabel={false}
                fallbackSize="full"
                className="h-full w-full object-cover"
                imgClassName="h-full w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-4">
                <div
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${sourceCopy.accent}`}
                >
                  {displayIsLive ? <Radio className="size-3" /> : <Activity className="size-3" />}
                  {isBuffering ? "Buffering" : sourceCopy.label}
                </div>
              </div>
            </div>
          </section>

          <section className="flex min-w-0 flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-black leading-tight text-white sm:text-4xl">
                    {display.title}
                  </h1>
                  <p className="mt-1 truncate text-sm text-white/55 sm:text-base">
                    {display.artist}
                  </p>
                </div>
                <IconAction
                  label={isLiked ? "Unlike" : "Like"}
                  active={isLiked}
                  onClick={() => toggleLike(display.id)}
                >
                  <Heart className={`size-5 ${isLiked ? "fill-current" : ""}`} />
                </IconAction>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/55">
                  <span>{elapsed}</span>
                  <span>{total}</span>
                </div>
                <input
                  aria-label="Seek"
                  type="range"
                  min={0}
                  max={100}
                  value={progressPct}
                  disabled={displayIsLive}
                  onChange={(event) => seekPct(Number(event.currentTarget.value))}
                  className="h-2 w-full accent-cyan-300 disabled:opacity-55"
                />
              </div>

              <div className="mt-5 flex items-center justify-center gap-3">
                <IconAction label="Shuffle" active={shuffleMode} onClick={toggleShuffle}>
                  <Shuffle className="size-4" />
                </IconAction>
                <IconAction label="Previous" onClick={previous}>
                  <SkipBack className="size-5 fill-current" />
                </IconAction>
                <button
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause" : "Play"}
                  onClick={handlePrimary}
                  className="grid size-16 place-items-center rounded-full bg-cyan-300 text-black shadow-[0_18px_50px_rgba(103,232,249,0.22)] transition active:scale-95"
                >
                  {isPlaying ? (
                    <Pause className="size-7 fill-current" />
                  ) : (
                    <Play className="ml-1 size-7 fill-current" />
                  )}
                </button>
                <IconAction label="Next" onClick={next}>
                  <SkipForward className="size-5 fill-current" />
                </IconAction>
                <IconAction
                  label={`Repeat: ${repeatMode}`}
                  active={repeatMode !== "normal"}
                  onClick={() => setRepeatMode(nextRepeatMode(repeatMode))}
                >
                  <Repeat className="size-4" />
                </IconAction>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <Waveform
                  bars={18}
                  animate={isPlaying && !isBuffering}
                  className="h-10 justify-center sm:justify-start"
                  color="from-cyan-300 to-lime-300"
                />
                <div className="flex items-center gap-3 rounded-full border border-white/10 bg-black/20 px-3 py-2">
                  <button
                    aria-label={muted ? "Unmute" : "Mute"}
                    title={muted ? "Unmute" : "Mute"}
                    onClick={toggleMute}
                    className="text-white/70 active:scale-95"
                  >
                    {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                  </button>
                  <input
                    aria-label="Volume"
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={muted ? 0 : volume}
                    onChange={(event) => setVolume(Number(event.currentTarget.value))}
                    className="w-full min-w-28 accent-lime-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {TAB_ITEMS.map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-black uppercase tracking-wider transition active:scale-95 ${
                      active
                        ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-100"
                        : "border-white/10 bg-white/[0.04] text-white/55"
                    }`}
                  >
                    <Icon className="size-3.5" />
                    {label}
                  </button>
                );
              })}
            </div>

            {renderDetail()}

            <button
              onClick={() => currentItem && removeFromQueue(currentItem.id)}
              className="mb-1 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold text-white/55 active:scale-[0.99]"
            >
              <Trash2 className="size-4" />
              Remove From Rotation
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default NowPlayingScreen;
