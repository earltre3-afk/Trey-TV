import React, { useState, useEffect } from "react";
import {
  Moon,
  Heart,
  Zap,
  Waves,
  Droplet,
  Sparkles,
  RotateCcw,
  ChevronRight,
  RefreshCw,
  Play,
  Terminal,
  Sliders,
  Check,
  Lock,
  Unlock,
  Volume2,
  Activity,
} from "lucide-react";
import { TopBar, GlassCard, PrimaryButton, Chip, SectionHeader, PlayCircle, Waveform } from "../ui";
import { IMG, TRACKS } from "../data";
import type { Track } from "@/tradio/contexts/PlayerContext";
import { usePlayer } from "@/tradio/contexts/PlayerContext";

const VIBES: {
  label: string;
  icon: React.ReactNode;
  defaultDials: Record<string, number>;
  defaultBpm: number;
}[] = [
  {
    label: "Late Night",
    icon: <Moon className="h-3.5 w-3.5" />,
    defaultDials: { Energy: 40, Discovery: 80, Intimacy: 90 },
    defaultBpm: 92,
  },
  {
    label: "Healing",
    icon: <Heart className="h-3.5 w-3.5" />,
    defaultDials: { Energy: 20, Discovery: 60, Intimacy: 95 },
    defaultBpm: 75,
  },
  {
    label: "Turn Up",
    icon: <Zap className="h-3.5 w-3.5" />,
    defaultDials: { Energy: 95, Discovery: 75, Intimacy: 30 },
    defaultBpm: 128,
  },
  {
    label: "Smooth",
    icon: <Waves className="h-3.5 w-3.5" />,
    defaultDials: { Energy: 50, Discovery: 70, Intimacy: 75 },
    defaultBpm: 88,
  },
  {
    label: "Cry In Peace",
    icon: <Droplet className="h-3.5 w-3.5" />,
    defaultDials: { Energy: 30, Discovery: 50, Intimacy: 85 },
    defaultBpm: 80,
  },
  {
    label: "Memphis",
    icon: <Waveform className="h-3.5 w-4" />,
    defaultDials: { Energy: 85, Discovery: 75, Intimacy: 50 },
    defaultBpm: 96,
  },
];

const DialControl: React.FC<{
  label: string;
  value: string | number;
  color: string;
  pct: number;
  onIncrease: () => void;
  onDecrease: () => void;
}> = ({ label, value, color, pct, onIncrease, onDecrease }) => {
  const radius = 34;
  const c = 2 * Math.PI * radius;
  return (
    <GlassCard className="flex flex-col items-center p-4 border-white/8 hover:border-white/20 transition-all duration-300 relative group overflow-hidden">
      {/* Decorative top shimmer */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />

      <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">{label}</div>
      <div
        className={`mt-1 text-base font-black tracking-tight ${color} filter drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]`}
      >
        {value}
      </div>

      <div className="relative my-3 h-[85px] w-[90px] flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="5"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={`url(#g-${label})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c - (pct / 100) * c}
            className="transition-all duration-500 ease-out"
          />
          <defs>
            <linearGradient id={`g-${label}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>
        {/* Glowing Center Core */}
        <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/60 border border-white/15 flex items-center justify-center">
          <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,1)] animate-pulse" />
        </div>
      </div>

      {/* Custom Adjust Controls */}
      <div className="flex w-full items-center justify-between gap-2.5">
        <button
          onClick={onDecrease}
          className="flex-1 h-7 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 active:scale-90 text-sm font-black text-white/70 hover:text-white transition-all flex items-center justify-center"
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        <button
          onClick={onIncrease}
          className="flex-1 h-7 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 active:scale-90 text-sm font-black text-white/70 hover:text-white transition-all flex items-center justify-center"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </GlassCard>
  );
};

const RECIPES = [
  {
    title: "Midnight Drive",
    tags: "R&B • Trap Soul",
    desc: "Moody, melodic, made for the road after dark.",
    img: IMG.midnightDrive,
    track: TRACKS.midnightVelvet,
  },
  {
    title: "Healing Waters",
    tags: "R&B • Neo Soul",
    desc: "Soothing sounds to relax, reset, and reflect.",
    img: IMG.healingLotus,
    track: TRACKS.fallingForYou,
  },
  {
    title: "Memphis Heat",
    tags: "Rap • Southern Hip-Hop",
    desc: "Hard-hitting Memphis energy, all day.",
    img: IMG.memphisAfterDark,
    track: TRACKS.memphisAfterDark,
  },
];

export const BuildStationScreen: React.FC = () => {
  const { play, playStation } = usePlayer();

  // State Management
  const [vibe, setVibe] = useState("Late Night");
  const [genres, setGenres] = useState(["R&B", "Hip-Hop"]);
  const [energy, setEnergy] = useState(40);
  const [discovery, setDiscovery] = useState(80);
  const [intimacy, setIntimacy] = useState(90);
  const [tempo, setTempo] = useState(92);

  const [promptInput, setPromptInput] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisStep, setSynthesisStep] = useState("");

  const [generatedTracks, setGeneratedTracks] = useState<Track[]>([]);
  const [lockedTracks, setLockedTracks] = useState<Record<string, boolean>>({});
  const [isRefreshingTracks, setIsRefreshingTracks] = useState(false);

  // Sync dials when vibe changes
  useEffect(() => {
    const selectedVibe = VIBES.find((v) => v.label === vibe);
    if (selectedVibe) {
      setEnergy(selectedVibe.defaultDials.Energy);
      setDiscovery(selectedVibe.defaultDials.Discovery);
      setIntimacy(selectedVibe.defaultDials.Intimacy);
      setTempo(selectedVibe.defaultBpm);
    }
  }, [vibe]);

  // Generate track list based on Vibe + Dial configuration
  useEffect(() => {
    setIsRefreshingTracks(true);
    const timeout = setTimeout(() => {
      // Find default seeds for vibe
      const allCatalog = Object.values(TRACKS).filter(
        (t) =>
          t.id !== "ai-radio" &&
          t.id !== "untitled-signal" &&
          t.id !== "broken-signal" &&
          t.id !== "processing-signal",
      );

      let seeds: Track[] = [];
      if (vibe === "Late Night") {
        seeds = [TRACKS.afterHours, TRACKS.persuasion, TRACKS.midnightVelvet, TRACKS.spinning];
      } else if (vibe === "Healing") {
        seeds = [
          TRACKS.fallingForYou,
          TRACKS.noLookingBack,
          TRACKS.neonHeartbreak,
          TRACKS.outOfOrbit,
        ];
      } else if (vibe === "Turn Up") {
        seeds = [
          TRACKS.treyTrizzyRadio,
          TRACKS.instantDrop,
          TRACKS.sixAmThoughts,
          TRACKS.underCityLights,
        ];
      } else if (vibe === "Smooth") {
        seeds = [TRACKS.afterHours, TRACKS.fallingForYou, TRACKS.cityLights, TRACKS.dontCall];
      } else if (vibe === "Cry In Peace") {
        seeds = [
          TRACKS.neonHeartbreak,
          TRACKS.dontCall,
          TRACKS.sixAmThoughts,
          TRACKS.fallingForYou,
        ];
      } else if (vibe === "Memphis") {
        seeds = [
          TRACKS.memphisAfterDark,
          TRACKS.treyTrizzyRadio,
          TRACKS.instantDrop,
          TRACKS.sixAmThoughts,
        ];
      } else {
        seeds = allCatalog.slice(0, 4);
      }

      // Preserve locked tracks
      const finalTracks = seeds.map((seedTrack, idx) => {
        const generatedId = generatedTracks[idx]?.id;
        if (generatedId && lockedTracks[generatedId]) {
          return generatedTracks[idx];
        }
        return seedTrack;
      });

      setGeneratedTracks(finalTracks);
      setIsRefreshingTracks(false);
    }, 450);

    return () => clearTimeout(timeout);
  }, [vibe, energy, tempo, intimacy, discovery]);

  // Handle entire playlist synthesis via AI Prompt Center
  const handleAISynthesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsSynthesizing(true);
    setSynthesisStep("Initializing Prescription Neural Engine...");

    const logs = [
      "Decoding prompt acoustic signature...",
      "Matching user mood with spectral frequencies...",
      "Synthesizing virtual stems & wave forms...",
      "Aligning BPM grids and harmonic key locks...",
      "Formulating unique Prescription Audio lane...",
    ];

    logs.forEach((log, idx) => {
      setTimeout(
        () => {
          setSynthesisStep(log);
        },
        (idx + 1) * 650,
      );
    });

    setTimeout(
      () => {
        // Complete synthesis with fully updated dynamic dials
        setEnergy(Math.floor(Math.random() * 45) + 50); // High-ish energy
        setDiscovery(Math.floor(Math.random() * 30) + 65);
        setIntimacy(Math.floor(Math.random() * 40) + 55);
        setTempo(Math.floor(Math.random() * 60) + 80); // Random BPM

        const randomCatalog = Object.values(TRACKS)
          .filter(
            (t) =>
              t.id !== "ai-radio" &&
              t.id !== "untitled-signal" &&
              t.id !== "broken-signal" &&
              t.id !== "processing-signal",
          )
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);

        // Preserve locked tracks if possible, otherwise overwrite
        const updatedList = randomCatalog.map((randTrack, idx) => {
          const generatedId = generatedTracks[idx]?.id;
          if (generatedId && lockedTracks[generatedId]) {
            return generatedTracks[idx];
          }
          return randTrack;
        });

        setGeneratedTracks(updatedList);
        setIsSynthesizing(false);
        setPromptInput("");
      },
      (logs.length + 1) * 650,
    );
  };

  // Re-roll a single specific track in the playlist
  const handleSingleTrackReroll = (idxToReroll: number) => {
    const allCatalog = Object.values(TRACKS).filter(
      (t) =>
        t.id !== "ai-radio" &&
        t.id !== "untitled-signal" &&
        t.id !== "broken-signal" &&
        t.id !== "processing-signal",
    );

    // Filter out tracks already in the generated list
    const currentIds = generatedTracks.map((t) => t.id);
    const availablePool = allCatalog.filter((t) => !currentIds.includes(t.id));

    if (availablePool.length === 0) return;
    const randomReplacement = availablePool[Math.floor(Math.random() * availablePool.length)];

    setGeneratedTracks((prev) => {
      const copy = [...prev];
      copy[idxToReroll] = randomReplacement;
      return copy;
    });
  };

  // Toggle dynamic lock on individual tracks
  const toggleTrackLock = (trackId: string) => {
    setLockedTracks((prev) => ({
      ...prev,
      [trackId]: !prev[trackId],
    }));
  };

  // Run full audio stream activation in PlayerContext
  const playForgedStation = () => {
    if (generatedTracks.length === 0) return;
    playStation(
      {
        id: "custom-prescription-station",
        type: "station",
        label: "Prescription Station",
        title: `${vibe} Custom Prescription`,
        subtitle: "Dynamic Tailored Stream",
        image: IMG.aiSphere,
        isLive: true,
        listenerCount: 24800,
      },
      generatedTracks,
    );
  };

  // Dial Step Increments
  const adjustValue = (
    setFn: React.Dispatch<React.SetStateAction<number>>,
    dir: "up" | "down",
    min: number,
    max: number,
    step: number = 5,
  ) => {
    setFn((prev) => {
      const next = dir === "up" ? prev + step : prev - step;
      return Math.max(min, Math.min(max, next));
    });
  };

  return (
    <div className="space-y-8 pb-12 lg:space-y-10">
      <TopBar />

      {/* 1. Futuristic Header */}
      <div className="px-4 sm:px-6 lg:px-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
              Prescription Playlist Forge
            </h1>
            <Sparkles className="h-5 w-5 text-cyan-300 animate-pulse" />
          </div>
          <p className="mt-1 text-sm leading-snug text-white/55">
            Inject prompts, shape audio dials, and forge the perfect musical prescription.
          </p>
        </div>
        <button
          onClick={() => {
            setVibe("Late Night");
            setGenres(["R&B", "Hip-Hop"]);
          }}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Matrix
        </button>
      </div>

      {/* 2. AI COMMAND CENTER (Prompt Injector) */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard className="p-5 border-cyan-500/20 bg-[#0C1527]/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] relative overflow-hidden">
          {/* Diagnostic sweeping line */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-color-dodge">
            <div className="absolute -inset-[50%] animate-shimmer-sweep bg-gradient-to-tr from-transparent via-cyan-400/5 to-transparent" />
          </div>

          <div className="flex items-center gap-2 mb-3.5">
            <Terminal className="h-4.5 w-4.5 text-cyan-300" />
            <div className="text-xs font-mono font-black uppercase tracking-widest text-cyan-300">
              Prescription Command Injector
            </div>
          </div>
          <form onSubmit={handleAISynthesis} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Inject custom prompt (e.g. 'Late night cruise in Tokyo', 'Chill neon lofi beats')..."
              className="flex-1 bg-black/60 border border-white/10 focus:border-cyan-400/50 rounded-full px-5 py-3 text-sm text-white outline-none placeholder:text-white/35 transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.5)]"
            />
            <button
              type="submit"
              disabled={!promptInput.trim()}
              className="rounded-full bg-gradient-to-r from-cyan-500 via-purple-500 to-fuchsia-500 text-white font-black text-xs uppercase tracking-widest px-6 py-3 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-95 disabled:opacity-20 disabled:scale-100 disabled:shadow-none transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" /> Synthesize
            </button>
          </form>
        </GlassCard>
      </div>

      {/* Synthesis Modal Loader */}
      {isSynthesizing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl animate-fade-in p-5">
          <GlassCard className="max-w-[450px] w-full p-8 border-cyan-500/30 text-center relative overflow-hidden flex flex-col items-center">
            {/* Spinning Holographic Core */}
            <div className="relative h-20 w-20 mb-6 flex items-center justify-center">
              <span className="absolute inset-0 rounded-full border-2 border-t-cyan-400 border-r-purple-500 border-b-fuchsia-500 border-l-transparent animate-spin" />
              <span className="absolute inset-[15%] rounded-full border border-b-cyan-400 border-l-purple-500 animate-spin-reverse" />
              <Activity className="h-6 w-6 text-cyan-300 animate-pulse" />
            </div>

            <h3 className="text-lg font-black tracking-widest text-white uppercase">
              Synthesizing Prescription
            </h3>
            <div className="mt-2 text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 rounded px-3 py-1.5 animate-pulse min-h-[34px] flex items-center justify-center">
              {synthesisStep}
            </div>

            {/* Glowing progress line */}
            <div className="mt-6 w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 animate-shimmer-sweep w-2/3 rounded-full" />
            </div>
          </GlassCard>
        </div>
      )}

      {/* 3. Choose Presets */}
      <div>
        <div className="px-4 pb-3 sm:px-6 lg:px-10 text-xs font-mono font-black uppercase tracking-widest text-purple-300">
          1. Select Preset Vibe Matrix
        </div>
        <div className="flex gap-2.5 overflow-x-auto px-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {VIBES.map((v) => (
            <Chip
              key={v.label}
              label={v.label}
              icon={v.icon}
              selected={vibe === v.label}
              onClick={() => setVibe(v.label)}
            />
          ))}
        </div>
      </div>

      {/* 4. Interactive Sound Dials */}
      <div className="px-4 sm:px-6 lg:px-10">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
            <Sliders className="h-4 w-4" /> 2. Shape Audio Frequencies
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DialControl
            label="Energy"
            value={`${energy}%`}
            color="text-purple-300"
            pct={energy}
            onIncrease={() => adjustValue(setEnergy, "up", 0, 100)}
            onDecrease={() => adjustValue(setEnergy, "down", 0, 100)}
          />
          <DialControl
            label="Discovery"
            value={`${discovery}%`}
            color="text-fuchsia-300"
            pct={discovery}
            onIncrease={() => adjustValue(setDiscovery, "up", 0, 100)}
            onDecrease={() => adjustValue(setDiscovery, "down", 0, 100)}
          />
          <DialControl
            label="Intimacy"
            value={`${intimacy}%`}
            color="text-pink-300"
            pct={intimacy}
            onIncrease={() => adjustValue(setIntimacy, "up", 0, 100)}
            onDecrease={() => adjustValue(setIntimacy, "down", 0, 100)}
          />
          <DialControl
            label="Tempo"
            value={`${tempo} BPM`}
            color="text-cyan-300"
            pct={Math.min(100, Math.max(0, ((tempo - 60) / 120) * 100))}
            onIncrease={() => adjustValue(setTempo, "up", 60, 180, 4)}
            onDecrease={() => adjustValue(setTempo, "down", 60, 180, 4)}
          />
        </div>
      </div>

      {/* 5. ACTIVE PRESCRIPTION TRACKLIST (Generated live) */}
      <div className="px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive Generated Playlist */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300 flex items-center gap-1.5">
              <Volume2 className="h-4 w-4 animate-pulse" /> Active Tailored Prescription
            </div>
            {isRefreshingTracks && (
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider animate-pulse flex items-center gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Recalculating...
              </span>
            )}
          </div>

          <GlassCard className="p-4 space-y-3.5 border-white/5 bg-black/30 relative">
            {generatedTracks.map((track, idx) => {
              const isLocked = !!lockedTracks[track?.id];
              return (
                <div
                  key={track?.id || idx}
                  className={`flex items-center justify-between gap-4 p-2.5 rounded-2xl border transition-all duration-300 ${
                    isLocked
                      ? "border-fuchsia-500/20 bg-fuchsia-500/5"
                      : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Artwork */}
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <img
                        src={track?.art || IMG.aiSphere}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                        <PlayCircle size={28} onClick={() => play(track)} />
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1 text-left">
                      <h4 className="text-sm font-bold text-white truncate">{track?.title}</h4>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{track?.artist}</p>
                    </div>
                  </div>

                  {/* Actions / Refinement Dials */}
                  <div className="flex items-center gap-2">
                    {/* Toggle lock */}
                    <button
                      onClick={() => toggleTrackLock(track.id)}
                      className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                        isLocked
                          ? "border-fuchsia-500 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.3)]"
                          : "border-white/10 text-white/40 hover:text-white hover:border-white/20"
                      }`}
                      title={
                        isLocked ? "Unlock track from re-generation" : "Lock track into playlist"
                      }
                    >
                      {isLocked ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {/* Single Reroll */}
                    <button
                      onClick={() => handleSingleTrackReroll(idx)}
                      disabled={isLocked}
                      className="h-8 w-8 rounded-full border border-white/10 hover:border-cyan-400/40 text-white/40 hover:text-cyan-300 disabled:opacity-10 disabled:pointer-events-none flex items-center justify-center transition-all active:scale-90"
                      title="Re-roll track to different suggestion"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>

        {/* Right: Synthesis Preview Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-mono font-black uppercase tracking-widest text-purple-300">
            Station Matrix Preview
          </div>
          <GlassCard glow className="overflow-hidden p-5 relative border-purple-500/15">
            {/* Glossy sweeping shine */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-color-dodge">
              <div
                className="absolute -inset-[50%] bg-gradient-to-tr from-transparent via-purple-500/10 to-transparent"
                style={{ animation: "streak-sweep 6s infinite linear" }}
              />
            </div>

            <div className="flex gap-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.4)]">
                <img src={IMG.lateNightSoul} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <PlayCircle size={36} gradient onClick={() => play(TRACKS.lateNightSoul)} />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-white truncate">
                    {vibe} Prescription Mix
                  </div>
                  <span className="rounded-full border border-purple-400/40 bg-purple-500/15 px-2 py-0.5 text-[9px] font-black text-purple-200">
                    AI COMPILED
                  </span>
                </div>
                <div className="text-[11px] text-white/50 font-mono mt-0.5 uppercase tracking-wide">
                  {genres.join(" • ")} • {tempo} BPM
                </div>
                <p className="mt-2 text-xs leading-snug text-white/70">
                  Tailor-forged acoustic prescription targeting {vibe.toLowerCase()} mood waves with
                  perfect frequency alignment.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono text-purple-300 uppercase font-black">
                    Status: Cleared
                  </span>
                  <Waveform className="h-3 w-6" bars={5} />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between px-1 border-t border-white/5 pt-4">
              <Waveform className="h-5 w-32" bars={22} color="from-cyan-400 to-fuchsia-500" />
              <span className="flex items-center gap-1 text-[9px] font-black text-fuchsia-300 uppercase tracking-widest">
                <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-ping" /> Forge
                Ready
              </span>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* 6. GENERATE STATION & DISPENSE */}
      <div className="px-4 sm:px-6 lg:px-10">
        <PrimaryButton
          onClick={playForgedStation}
          className="w-full py-4.5 text-base shadow-[0_0_30px_rgba(168,85,247,0.45)] hover:shadow-[0_0_45px_rgba(6,182,212,0.65)]"
        >
          <Sparkles className="h-5 w-5 animate-pulse" /> Forge Prescription Station
        </PrimaryButton>
        <p className="mt-2.5 text-center text-xs text-white/35 font-mono">
          Clicking will sync and start your custom tailored audio flow.
        </p>
      </div>

      {/* Recommended Recipes */}
      <div>
        <div className="px-4 pb-3.5 sm:px-6 lg:px-10 text-xs font-mono font-black uppercase tracking-widest text-purple-300">
          Recommended Audio Recipes
        </div>
        <div className="flex gap-3 overflow-x-auto px-4 sm:px-6 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {RECIPES.map((r) => (
            <GlassCard
              key={r.title}
              className="w-[240px] shrink-0 overflow-hidden hover:border-purple-500/20 transition-all duration-300 group"
            >
              <div className="flex gap-3.5 p-3">
                <img
                  src={r.img}
                  alt={r.title}
                  className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0"
                />
                <div className="min-w-0 flex-1 text-left">
                  <div className="truncate text-sm font-black text-white">{r.title}</div>
                  <div className="truncate text-[10px] text-purple-300 font-mono font-bold mt-0.5 uppercase tracking-wide">
                    {r.tags}
                  </div>
                  <p className="mt-1 line-clamp-2 text-[11px] text-white/50 leading-snug">
                    {r.desc}
                  </p>
                </div>
              </div>
              <div className="flex justify-end px-3 pb-3 border-t border-white/5 pt-2">
                <PlayCircle size={30} onClick={() => play(r.track)} />
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuildStationScreen;
