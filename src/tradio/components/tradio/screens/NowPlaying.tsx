import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  Heart,
  ListMusic,
  Loader2,
  Pause,
  Play,
  Radio,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  Sliders,
  Cpu,
  Activity,
  Mic2,
  Disc,
  CornerDownRight,
  Zap,
  BookOpen,
  Info,
  Layers,
  Award,
  Cast,
  Airplay,
  Tv,
  Laptop,
  Smartphone,
  Copy,
  UploadCloud,
  Check
} from 'lucide-react';
import { GlassCard, Waveform, TradioLogo } from '../ui';
import { IMG, TRACKS } from '../data';
import { formatTime, usePlayer, type PlaybackItem } from '@/tradio/contexts/PlayerContext';
import { TradioImage } from '../NoCoverVisualizer';
import aiBallCutout from '@/tradio/assets/ai-ball.png';

const UP_NEXT_FALLBACK: PlaybackItem[] = [
  { ...TRACKS.cityLights, sourceType: 'song', sourceLabel: 'Song' },
  { ...TRACKS.fallingForYou, sourceType: 'song', sourceLabel: 'Song' },
  { ...TRACKS.sixAmThoughts, sourceType: 'song', sourceLabel: 'Song' },
];

const formatLiveElapsed = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const sourceCopy: Record<string, { eyebrow: string; detail: string; action: string }> = {
  song: { eyebrow: 'Song', detail: 'Library playback', action: 'Add to Queue' },
  station: { eyebrow: 'Live Station', detail: 'Continuous Tradio radio', action: 'Follow Station' },
  artist_station: { eyebrow: 'Artist Station', detail: 'Artist-owned radio lane', action: 'Follow Artist' },
  instant_release: { eyebrow: 'Instant Release', detail: 'Fresh drop on Tradio', action: 'Save Release' },
  producer_beat: { eyebrow: 'Producer Beat', detail: 'Beat preview workspace', action: 'Pitch to Artist' },
  dj_mix: { eyebrow: 'DJ Mix', detail: 'Curated host mix', action: 'Add to Mixes' },
  live_show: { eyebrow: 'Live Show', detail: 'Broadcast in progress', action: 'Set Reminder' },
  song_war_round: { eyebrow: 'Song War Round', detail: 'Battle playback context', action: 'Open Battle' },
  replay: { eyebrow: 'Replay', detail: 'Archived Tradio event', action: 'Share Replay' },
};

const MOCK_LYRICS_CATALOG: Record<string, { line: string; start: number; end: number }[]> = {
  'midnight-velvet': [
    { line: 'Step into the velvet dark...', start: 0, end: 6 },
    { line: 'Neon lights are casting sparks.', start: 6, end: 12 },
    { line: 'Your frequency is locking in,', start: 12, end: 18 },
    { line: 'This is where the dreams begin.', start: 18, end: 24 },
    { line: 'Midnight velvet, feel the glow...', start: 24, end: 32 },
    { line: 'Streaming vibes in stereo.', start: 32, end: 999 },
  ],
  'after-hours': [
    { line: 'After hours under streetlamp skies,', start: 0, end: 6 },
    { line: 'Searching for truth within your eyes.', start: 6, end: 12 },
    { line: 'The beat goes slow, the synth is deep,', start: 12, end: 18 },
    { line: 'We have promises that we must keep.', start: 18, end: 24 },
    { line: 'Late night sessions on repeat...', start: 24, end: 32 },
    { line: 'Echoes moving down the street.', start: 32, end: 999 },
  ],
  default: [
    { line: 'Tuning into the Tradio sonic waves...', start: 0, end: 5 },
    { line: 'Analyzing harmonic signals and tones...', start: 5, end: 11 },
    { line: 'Calibrating Dolby Atmos holographic stage...', start: 11, end: 18 },
    { line: 'AI active: Upscaling stream to 192kHz...', start: 18, end: 25 },
    { line: 'Synchronizing network playback queues...', start: 25, end: 32 },
    { line: 'Enjoy premium seamless playback.', start: 32, end: 999 },
  ],
};

const LYRIC_EXPLANATIONS: Record<string, string> = {
  'midnight-velvet': 'A warm invitation to find comfort in late-night sounds. The velvet metaphor represents a soft, secure auditory space designed to make you feel completely grounded and creatively connected.',
  'after-hours': 'This melody reflects the quiet, contemplative moments of R&B after midnight. Deep, cozy synths provide a secure and comforting space for creative thoughts.',
  default: 'Tuned using our local audio filters to optimize pleasant soundwaves, acoustic warmth, and soft, comforting spatial playback.',
};

const EQ_FREQS = ['32Hz', '64Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

export const NowPlayingScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    currentItem,
    currentSource,
    queue,
    upNext,
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
  } = usePlayer();

  const display = currentItem ?? { ...TRACKS.midnightVelvet, sourceType: 'station' as const, sourceLabel: 'Station', isLive: true };
  const sourceType = currentSource?.type || display.sourceType || 'song';
  const copy = sourceCopy[sourceType] || sourceCopy.song;
  const isLiked = liked.has(display.id);
  const pct = isLive || duration <= 0 ? 100 : (currentTime / duration) * 100;
  const upNextList = queue.length > 0 ? queue.slice(0, 5) : UP_NEXT_FALLBACK;
  
  const beatContext = display.context?.beat;
  const songWarsContext = display.context?.songWars;
  const liveContext = display.context?.liveShow;
  const stationContext = display.context?.station;
  const isAiSphere = (display.coverUrl || display.art) === IMG.aiSphere;

  // ─── CONTROL TABS STATE ────────────────────────────────
  const [activeConsoleTab, setActiveConsoleTab] = useState<'morph' | 'dsp' | 'lyrics' | 'queue' | 'context' | 'cast'>('morph');

  const { isCasting, activeCastDevice, startCast, stopCast } = usePlayer();
  const [isScanning, setIsScanning] = useState(false);
  const [castFileUploading, setCastFileUploading] = useState(false);
  const [castFileName, setCastFileName] = useState<string | null>(null);
  const [castUploadProgress, setCastUploadProgress] = useState(0);
  const [copiedCastCode, setCopiedCastCode] = useState(false);

  // Trigger quick sonar scan when entering the Cast tab
  useEffect(() => {
    if (activeConsoleTab === 'cast') {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 950);
      return () => clearTimeout(timer);
    }
  }, [activeConsoleTab]);

  // Extended AI & Audio States
  const [aiPrompt, setAiPrompt] = useState('');
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [selectedRemixPreset, setSelectedRemixPreset] = useState<string | null>(null);
  
  // Audio DSP Toggles
  const [spatialAudio, setSpatialAudio] = useState(true);
  const [harmonicUpscale, setHarmonicUpscale] = useState(true);
  const [vocalIsolation, setVocalIsolation] = useState(false);
  const [instrumentalMode, setInstrumentalMode] = useState(false);

  // Equalizer Slider state
  const [eqPreset, setEqPreset] = useState<'neutral' | 'neon' | 'lofi' | 'bass' | 'acoustic'>('neutral');
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // Lyric Explainer state
  const [isAnalyzingLyrics, setIsAnalyzingLyrics] = useState(false);
  const [lyricAnalysis, setLyricAnalysis] = useState<string | null>(null);

  // Apply EQ Preset changes
  useEffect(() => {
    const presets: Record<string, number[]> = {
      neutral: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      neon: [3, 2, 1, -1, -2, 1, 2, 3, 2, 1],
      lofi: [-2, -1, 2, 3, 1, -1, -2, -1, 0, -1],
      bass: [5, 4, 3, 1, 0, 0, -1, 0, 1, 2],
      acoustic: [1, 1, -1, 0, 2, 3, 1, 2, 2, 1],
    };
    if (presets[eqPreset]) {
      setEqGains(presets[eqPreset]);
    }
  }, [eqPreset]);

  // Real-time Synchronized Lyrics calculations
  const songLyrics = MOCK_LYRICS_CATALOG[display.id] || MOCK_LYRICS_CATALOG.default;
  const activeLyricIndex = songLyrics.findIndex(
    (l) => currentTime >= l.start && currentTime < l.end
  );

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isLive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = ((e.clientX - rect.left) / rect.width) * 100;
    if (!currentItem) play(display);
    seekPct(Math.max(0, Math.min(100, p)));
  };

  // Submit AI Prompt
  const handleAiPromptSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsProcessingAi(true);
    setAiFeedback(null);
    setSelectedRemixPreset(null);

    setTimeout(() => {
      setIsProcessingAi(false);
      setAiFeedback(
        `AI: "${aiPrompt}" loaded. Audio frequencies have been softened and balanced. Harmonic warmth has been enhanced by 15% and spatial distribution has been optimized for clean, inviting acoustics.`
      );
      setEqPreset('acoustic');
    }, 1100);
  };

  // Apply quick AI remixes
  const applyQuickRemix = (preset: string, prompt: string, associatedEq: 'lofi' | 'neon' | 'bass' | 'acoustic') => {
    setIsProcessingAi(true);
    setAiFeedback(null);
    setSelectedRemixPreset(preset);
    setAiPrompt(prompt);

    setTimeout(() => {
      setIsProcessingAi(false);
      setAiFeedback(
        `Vibe update: "${preset}" active. Ambient filters configured. Transitioning Eq curve to ${associatedEq.toUpperCase()} for a soft, comforting acoustic state.`
      );
      setEqPreset(associatedEq);
    }, 850);
  };

  // Ask AI for lyric deep meaning
  const handleAnalyzeLyrics = () => {
    setIsAnalyzingLyrics(true);
    setLyricAnalysis(null);

    setTimeout(() => {
      setIsAnalyzingLyrics(false);
      setLyricAnalysis(LYRIC_EXPLANATIONS[display.id] || LYRIC_EXPLANATIONS.default);
    }, 950);
  };

  // Handle single EQ slider changes
  const handleEqSliderChange = (idx: number, val: number) => {
    setEqPreset('neutral'); // Custom modifications set preset back to neutral
    setEqGains((prev) => {
      const nextGains = [...prev];
      nextGains[idx] = val;
      return nextGains;
    });
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#080711] text-white flex flex-col justify-between overflow-hidden relative font-sans animate-slide-up-modal">

      {/* Ultra-luxurious organic film noise overlay */}
      <div className="pointer-events-none absolute inset-0 z-50 opacity-[0.022] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      {/* Soothing slowly breathing ambient background colors */}
      <div className="absolute inset-0 pointer-events-none opacity-40 overflow-hidden z-0 select-none">
        <div className="absolute top-[-10%] left-[20%] h-[50%] w-[45%] rounded-full bg-[#3d2b75]/25 blur-[120px] animate-pulse" style={{ animationDuration: '9s' }} />
        <div className="absolute bottom-[-15%] right-[25%] h-[55%] w-[40%] rounded-full bg-[#1e4854]/25 blur-[110px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* Top Balanced Header Bar */}
      <div className="relative z-10 flex h-16 items-center justify-between px-6 sm:px-8 border-b border-white/[0.06] bg-[#07060e]/50 backdrop-blur-2xl select-none">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-white/80 hover:text-white hover:border-white/18 active:scale-95 transition-all duration-300"
        >
          <ChevronDown className="h-4.5 w-4.5" />
        </button>
        <div className="flex flex-col items-center">
          <TradioLogo size="sm" />
          <span className="text-[8px] font-mono text-purple-300 tracking-[0.25em] uppercase font-bold mt-0.5">
            Balanced Studio Player
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-[9px] font-mono font-bold tracking-wider transition-all duration-300 ${
            spatialAudio
              ? 'border-purple-500/25 bg-purple-500/5 text-purple-300'
              : 'border-white/10 bg-white/5 text-white/40'
          }`}>
            <Award className={`h-3 w-3 ${spatialAudio ? 'text-purple-400' : 'text-white/30'}`} />
            {spatialAudio ? 'DOLBY HD ACTIVE' : 'DOLBY HD BYPASS'}
          </span>
          <img
            src={IMG.jordan}
            className="h-8 w-8 rounded-xl border border-white/[0.08] object-cover shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
            alt="Creator avatar"
          />
        </div>
      </div>

      {/* Main Double-Column Layout — Fits strictly within screen height */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 max-w-[1500px] mx-auto w-full overflow-hidden items-stretch">

        {/* LEFT COLUMN: Visualizer Cover Art Canvas (Compact fixed block) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 overflow-hidden h-full">
          <GlassCard className="overflow-hidden p-0 border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.08)] flex-1 flex flex-col justify-center bg-[#07060f]/40 backdrop-blur-3xl relative rounded-[32px]">
            <div className="relative aspect-square w-full max-w-[400px] mx-auto flex items-center justify-center">
              
              {!isAiSphere && (
                <div
                  className="absolute inset-0 pointer-events-none opacity-25 animate-slow-spin z-0"
                  style={{
                    background: `radial-gradient(circle, #8b5cf622 0%, #06b6d40a 50%, transparent 85%)`,
                  }}
                />
              )}

              {isAiSphere ? (
                /* Premium transparent AI Sphere deck with comforting, soft lighting */
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <div className="relative w-[68%] h-[68%] flex items-center justify-center">

                    {/* Orbiting streaks */}
                    <div className="absolute inset-[-8%] rounded-full border border-t-cyan-400/30 border-r-purple-500/0 border-b-fuchsia-500/0 border-l-transparent animate-spin pointer-events-none opacity-40" style={{ animationDuration: '6s' }} />
                    <div className="absolute inset-[-3%] rounded-full border border-b-fuchsia-400/35 border-l-transparent border-t-purple-500/0 border-r-cyan-400/0 animate-spin-reverse pointer-events-none opacity-40" style={{ animationDuration: '8s' }} />

                    {/* Circular Halo EQ Bars with rounded ends */}
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                      {Array.from({ length: 30 }).map((_, i) => {
                        const angle = i * (360 / 30);
                        const delay = (i * 0.1) % 1.2;
                        const duration = 0.5 + (Math.sin(i * 0.5) + 1) * 0.3;
                        return (
                          <div
                            key={i}
                            className={`absolute w-[1.5px] rounded-full bg-gradient-to-t ${
                              spatialAudio
                                ? 'from-cyan-400/80 via-purple-400/60 to-purple-300/80 shadow-[0_0_8px_rgba(34,211,238,0.4)]'
                                : 'from-zinc-500/40 via-zinc-600/30 to-zinc-500/30'
                            } origin-bottom transform-gpu transition-all duration-500 ${
                              isPlaying ? 'animate-radial-eq' : ''
                            }`}
                            style={{
                              transform: `rotate(${angle}deg) translateY(${spatialAudio ? '-64px' : '-52px'})`,
                              bottom: '50%',
                              left: '50%',
                              marginLeft: '-0.75px',
                              height: spatialAudio ? '6px' : '2px',
                              animationDelay: isPlaying ? `${delay}s` : undefined,
                              animationDuration: isPlaying ? `${duration}s` : undefined,
                              opacity: isPlaying ? (spatialAudio ? 0.85 : 0.4) : 0.15,
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* AI Ball cut-out with soft, safe shadows */}
                    <img
                      src={aiBallCutout}
                      alt={display.title}
                      className={`relative z-10 w-full h-full object-contain [filter:drop-shadow(0_0_15px_rgba(139,92,246,0.45))_drop-shadow(0_0_40px_rgba(6,182,212,0.25))] ${
                        isPlaying ? 'animate-slow-spin' : ''
                      }`}
                    />

                    {/* Reflection overlay */}
                    <div className="absolute inset-0 z-20 rounded-full overflow-hidden pointer-events-none mix-blend-color-dodge">
                      <div
                        className="absolute -inset-[50%] animate-streak-sweep"
                        style={{
                          background: 'linear-gradient(135deg, transparent 35%, rgba(139,92,246,0.15) 45%, rgba(255,255,255,0.6) 50%, rgba(34,211,238,0.15) 55%, transparent 65%)'
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <TradioImage
                  src={(display.coverUrl || display.art) ?? undefined}
                  title={display.title}
                  artist={display.artist}
                  isPlaying={isPlaying}
                  isLoading={isBuffering}
                  mood={display.mood?.[0]}
                  genre={display.genre}
                  showLabel={true}
                  fallbackSize="full"
                  className="h-full w-full object-cover relative z-10"
                  imgClassName="h-full w-full object-cover rounded-none"
                />
              )}

              {/* Cover Art shadow gradient */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20 pointer-events-none" />
              
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/8 bg-black/40 text-[9px] font-mono font-bold tracking-wider text-purple-200 backdrop-blur-md z-30">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse-orb mr-1" />
                {copy.eyebrow.toUpperCase()}
              </span>

              {isLive && (
                <span className="absolute left-4 top-12 inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-[9px] font-mono font-bold uppercase tracking-widest text-purple-300 backdrop-blur-md z-30">
                  LIVE STREAM
                </span>
              )}

              <button
                onClick={() => toggleLike(display.id)}
                className="absolute right-4 top-4 h-8 w-8 rounded-xl border border-white/8 bg-black/40 hover:bg-black/60 active:scale-90 transition-all backdrop-blur-md z-30 flex items-center justify-center text-white"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-pink-500 text-pink-500' : 'text-white/60'}`} />
              </button>

              {/* Title & Artist Text */}
              <div className="absolute inset-x-0 bottom-0 p-5 z-30 select-none text-left">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white truncate">{display.title}</h2>
                <p className="text-xs sm:text-sm text-white/70 mt-0.5 font-bold truncate">{display.artist}</p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="rounded-md border border-white/8 bg-white/[0.05] px-2 py-0.5 text-[8px] font-mono font-extrabold uppercase tracking-widest text-fuchsia-300">
                    {currentSource?.label || display.sourceLabel || copy.eyebrow}
                  </span>
                  {(currentSource?.title || display.station) && (
                    <span className="text-[10px] text-white/50 font-bold truncate">
                      {currentSource?.title || display.station}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick action grid underneath the canvas */}
            <div className="grid grid-cols-4 gap-0.5 border-t border-white/8 bg-black/10 p-1.5 select-none text-[10px] font-mono font-bold">
              {[
                { icon: <ListMusic className="h-3.5 w-3.5 text-purple-300" />, label: 'Add Queue', action: () => addToQueue(display) },
                { icon: <Sliders className="h-3.5 w-3.5 text-white/60" />, label: 'Sound Deck', action: () => setActiveConsoleTab('dsp') },
                { icon: <Cast className="h-3.5 w-3.5 text-cyan-300" />, label: 'AirWave Cast', action: () => setActiveConsoleTab('cast') },
                { icon: <Info className="h-3.5 w-3.5 text-white/60" />, label: 'About', action: () => setActiveConsoleTab('context') },
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={q.action}
                  className="flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-white/70 hover:bg-white/5 hover:text-white transition-all active:scale-95"
                >
                  {q.icon}
                  <span className="uppercase tracking-widest text-[8px] scale-90">{q.label}</span>
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Player deck + Premium interactive Segmented Switching Dashboard */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden h-full justify-between">

          {/* SECTION 1: Cozy Compact Player Controls */}
          <GlassCard className="p-4 border border-white/10 bg-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] select-none rounded-[24px]">
            {/* Progress Bar & Durations */}
            <div className="flex items-center gap-2.5">
              <span className="w-10 text-[9px] font-mono text-white/50 tabular-nums">
                {isLive ? formatLiveElapsed(currentTime) : formatTime(currentTime)}
              </span>
              
              <div
                className={`relative flex h-5 flex-1 items-center ${isLive ? 'cursor-default' : 'cursor-pointer'} group`}
                onClick={handleSeek}
                role="slider"
                aria-label={isLive ? 'Live elapsed' : 'Seek'}
              >
                <div className="absolute inset-x-0 h-[3px] rounded-full bg-white/10 group-hover:h-[4px] transition-all" />
                <div
                  className={`absolute left-0 h-[3px] rounded-full bg-gradient-to-r from-purple-400 to-cyan-300 group-hover:h-[4px] transition-all`}
                  style={{ width: `${pct}%` }}
                />
                {!isLive && (
                  <div
                    className="absolute h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] scale-0 group-hover:scale-100 transition-transform"
                    style={{ left: `${pct}%` }}
                  />
                )}
              </div>

              <span className="w-10 text-right text-[9px] font-mono text-white/50 tabular-nums">
                {isLive ? 'LIVE' : formatTime(duration)}
              </span>
            </div>

            {/* Micro transport deck */}
            <div className="flex items-center justify-between mt-2.5">
              <button
                onClick={toggleShuffle}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 ${
                  shuffleMode ? 'text-cyan-300 bg-cyan-950/15' : 'text-purple-300 bg-white/5'
                } hover:scale-105 active:scale-95 transition-all`}
              >
                <Shuffle className="h-3.5 w-3.5" />
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={previous}
                  disabled={!currentItem}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/80 disabled:opacity-40 hover:border-white/10 active:scale-90 transition-all"
                >
                  <SkipBack className="h-4.5 w-4.5 fill-white text-white/80" />
                </button>

                <button
                  onClick={() => (currentItem ? toggle() : play(display))}
                  className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-400 text-white shadow-[0_4px_15px_rgba(139,92,246,0.35)] hover:scale-105 active:scale-90 transition-all disabled:opacity-60 shrink-0"
                >
                  {isBuffering ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="h-5 w-5 fill-white text-white" />
                  ) : (
                    <Play className="h-5 w-5 fill-white text-white ml-0.5" />
                  )}
                </button>

                <button
                  onClick={next}
                  disabled={!upNext && repeatMode !== 'repeat_one'}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-white/80 disabled:opacity-40 hover:border-white/10 active:scale-90 transition-all"
                >
                  <SkipForward className="h-4.5 w-4.5 fill-white text-white/80" />
                </button>
              </div>

              <button
                onClick={() => setRepeatMode(repeatMode === 'repeat_one' ? 'normal' : 'repeat_one')}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border border-white/5 ${
                  repeatMode === 'repeat_one' ? 'text-purple-300 bg-purple-950/15' : 'text-purple-300 bg-white/5'
                } hover:scale-105 active:scale-95 transition-all`}
              >
                <Repeat className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Volume control deck */}
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-3 text-xs">
              <button onClick={toggleMute} className="text-white/60 hover:text-white">
                {muted ? <VolumeX className="h-3.5 w-3.5 text-rose-400" /> : <Volume2 className="h-3.5 w-3.5 text-cyan-400" />}
              </button>
              <input
                aria-label="Volume Slider"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="h-1 flex-1 bg-white/10 rounded-full appearance-none accent-purple-400 cursor-pointer"
              />
              <span className="text-[9px] font-mono text-white/50 w-6 text-right">
                {muted ? 'MUT' : `${Math.round(volume * 100)}`}
              </span>
            </div>
          </GlassCard>

          {/* SECTION 2: Premium Control Swapper Console (NO SCROLLING - TAB CONTROLS) */}
          <div className="flex-1 flex flex-col min-h-0 bg-black/15 border border-white/10 rounded-[24px] overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
            
            {/* Segmented comfort switchbar */}
            <div className="flex border-b border-white/5 bg-white/[0.01] p-1 gap-1 select-none shrink-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                { id: 'morph', label: 'AI Tweak', icon: <Cpu className="h-3.5 w-3.5" /> },
                { id: 'dsp', label: 'EQ Console', icon: <Sliders className="h-3.5 w-3.5" /> },
                { id: 'cast', label: 'Cast Output', icon: <Cast className="h-3.5 w-3.5" /> },
                { id: 'lyrics', label: 'Lyrics', icon: <Mic2 className="h-3.5 w-3.5" /> },
                { id: 'queue', label: 'Up Next', icon: <ListMusic className="h-3.5 w-3.5" /> },
                { id: 'context', label: 'Context', icon: <Activity className="h-3.5 w-3.5" /> },
              ].map((tab) => {
                const isActive = activeConsoleTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveConsoleTab(tab.id as 'morph' | 'dsp' | 'lyrics' | 'queue' | 'context' | 'cast')}
                    className={`flex-1 py-1.5 text-center text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95 ${
                      isActive 
                        ? 'bg-[#1b1735]/40 border border-purple-500/25 text-purple-200 shadow-sm' 
                        : 'text-white/40 hover:text-white/70 border border-transparent'
                    }`}
                  >
                    {tab.icon}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Viewport */}
            <div className="flex-1 overflow-y-auto p-4.5 scrollbar-thin flex flex-col justify-between min-h-0 text-left">

              {/* TAB: AirWave Casting Deck */}
              {activeConsoleTab === 'cast' && (
                <div className="space-y-4 animate-fade-in flex flex-col h-full justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-cyan-300">AirWave Cast Output</span>
                      {isCasting ? (
                        <span className="text-[8px] font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-500/30 px-2 py-0.5 rounded animate-pulse">CASTING ACTIVE</span>
                      ) : (
                        <span className="text-[8px] font-mono text-white/40">READY TO STREAM</span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/55 leading-relaxed font-mono">
                      Stream losslessly to any local AirPlay, Chromecast, Bluetooth device, or browser receiver.
                    </p>

                    {/* Scanning radar indicator if scanning */}
                    {isScanning ? (
                      <div className="p-6 rounded-2xl border border-white/5 bg-black/20 flex flex-col items-center justify-center space-y-3 relative overflow-hidden">
                        {/* Radar Scan Ring Animation */}
                        <div className="relative w-12 h-12 flex items-center justify-center">
                          <span className="absolute inset-0 rounded-full border border-cyan-500/40 animate-ping" />
                          <span className="absolute w-8 h-8 rounded-full border border-purple-500/30 animate-pulse" />
                          <Cast className="h-6 w-6 text-cyan-300 animate-pulse" />
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 animate-pulse uppercase tracking-wider">Scanning local airwaves...</span>
                      </div>
                    ) : (
                      /* Discovered Devices List */
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {[
                          { id: 'jordan-monitors', name: "Jordan's Studio Monitor", sub: 'AirPlay • Lossless 192kHz enabled', icon: <Laptop className="h-4 w-4" /> },
                          { id: 'living-room-tv', name: 'Living Room Apple TV 4K', sub: 'AirPlay • Dolby Atmos 5.1 ready', icon: <Tv className="h-4 w-4" /> },
                          { id: 'trey-tv-control', name: 'Trey TV Master Control Deck', sub: 'Chromecast • 24-bit HD Stream active', icon: <Tv className="h-4 w-4" /> },
                          { id: 'soundbar-bluetooth', name: 'Dolby Soundbar System', sub: 'Bluetooth • aptX HD receiver', icon: <Volume2 className="h-4 w-4" /> },
                          { id: 'web-receiver', name: 'Tradio Web Cast Receiver', sub: 'Web Audio • Direct sync node ready', icon: <Smartphone className="h-4 w-4" /> },
                        ].map((dev) => {
                          const isTarget = activeCastDevice === dev.id;
                          return (
                            <button
                              key={dev.id}
                              onClick={() => {
                                if (isTarget) stopCast();
                                else startCast(dev.id);
                              }}
                              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all active:scale-[0.98] ${
                                isTarget
                                  ? 'border-cyan-400/40 bg-cyan-950/15 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                  : 'border-white/5 bg-white/[0.01] hover:bg-white/5 text-white/70 hover:text-white'
                              }`}
                            >
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                                isTarget ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' : 'border-white/5 bg-white/5 text-white/50'
                              }`}>
                                {dev.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold truncate">{dev.name}</div>
                                <div className="text-[9px] text-white/40 truncate mt-0.5">{dev.sub}</div>
                              </div>
                              {isTarget ? (
                                <div className="flex items-center gap-1.5 text-[9px] font-mono text-cyan-300 font-bold">
                                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                                  ACTIVE
                                </div>
                              ) : (
                                <span className="text-[9px] font-mono text-white/30 uppercase">CONNECT</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* AirWave drag drop / direct beam area */}
                  <div className="pt-3 border-t border-white/5 space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-white/45">Local File Direct Beam</span>
                      <span className="text-[8px] font-mono text-purple-300 bg-purple-500/15 border border-purple-500/25 px-1.5 py-0.5 rounded">ANY RECEIVER</span>
                    </div>

                    {castFileUploading ? (
                      <div className="p-3 rounded-xl border border-cyan-500/15 bg-cyan-950/5 text-[10px] leading-relaxed text-cyan-300 font-mono shadow-inner flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                          <div className="truncate font-bold text-white">Beaming "{castFileName}"...</div>
                        </div>
                        {/* Progress Bar */}
                        <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-cyan-400 transition-all duration-100" style={{ width: `${castUploadProgress}%` }} />
                        </div>
                        <div className="text-[8px] text-white/40 text-right">Uploading stream cue • {castUploadProgress}%</div>
                      </div>
                    ) : (
                      <div className="relative rounded-xl border border-dashed border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-all p-3 flex flex-col items-center justify-center text-center cursor-pointer group">
                        <input
                          type="file"
                          accept="audio/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setCastFileName(file.name);
                            setCastFileUploading(true);
                            setCastUploadProgress(0);

                            // Simulate upload & play
                            let prog = 0;
                            const intv = setInterval(() => {
                              prog += 8;
                              if (prog >= 100) {
                                prog = 100;
                                clearInterval(intv);
                                setTimeout(() => {
                                  play({
                                    id: `cast-${Date.now()}`,
                                    title: file.name.replace(/\.[^/.]+$/, ""),
                                    artist: 'Local Cast Beam',
                                    art: IMG.aiSphere,
                                    sourceType: 'song',
                                    sourceLabel: 'Direct Beam',
                                  });
                                  setCastFileUploading(false);
                                  if (!activeCastDevice) {
                                    startCast('trey-tv-control');
                                  }
                                }, 300);
                              }
                              setCastUploadProgress(prog);
                            }, 100);
                          }}
                        />
                        <UploadCloud className="h-5 w-5 text-purple-300 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-mono text-white/55 mt-1">Beam any local audio file to Cast receivers</span>
                        <span className="text-[8px] text-white/30 font-mono mt-0.5 uppercase tracking-wider">Drag here or click to browse</span>
                      </div>
                    )}

                    {/* QR Code & Web Link Direct Receiver */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/20 text-[10px] font-mono">
                      <div className="space-y-0.5 text-left">
                        <div className="text-white/70 font-bold">Cast to other browsers</div>
                        <div className="text-white/40 text-[9px]">Open <strong className="text-cyan-300 font-bold">tradio.tv/receive</strong> and enter:</div>
                        <div className="text-xs text-white font-black tracking-wider uppercase mt-1">TRADIO-8855</div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText("https://tradio.tv/receive?code=TRADIO-8855");
                          setCopiedCastCode(true);
                          setTimeout(() => setCopiedCastCode(false), 2000);
                        }}
                        className="flex h-8 items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-2.5 text-[9px] text-white/70 hover:bg-white/10 active:scale-95 transition-all"
                      >
                        {copiedCastCode ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            <span>COPIED</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 text-cyan-300" />
                            <span>LINK</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: AI TWEEK SYSTEM */}
              {activeConsoleTab === 'morph' && (
                <div className="space-y-3.5 animate-fade-in flex flex-col h-full justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-purple-300">Acoustic Shaper</span>
                      <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">CALIBRATED</span>
                    </div>
                    <p className="text-[11px] text-white/50 leading-relaxed font-mono">
                      Softly shape the dynamic soundwave. Choose a balanced preset shortcut below or enter a custom prompt:
                    </p>

                    {/* Quick presets */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Dusty Lo-Fi', prompt: 'Comforting vinyl dust, warm tape lowpass', eq: 'lofi' as const },
                        { label: 'Balanced Space', prompt: 'Deep stereophonic chorus, center vocal clarity', eq: 'neon' as const },
                        { label: 'Ambient Cavern', prompt: 'Spacious soft echoes, 10% slow decompress', eq: 'bass' as const },
                        { label: 'Acoustic Cozy', prompt: 'Harmonize dynamic range, warm vocal filters', eq: 'acoustic' as const },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyQuickRemix(preset.label, preset.prompt, preset.eq)}
                          className={`text-[10px] p-2.5 rounded-xl border font-bold font-mono text-left transition-all active:scale-[0.98] ${
                            selectedRemixPreset === preset.label
                              ? 'border-purple-400/40 bg-[#1b1735]/20 text-purple-200'
                              : 'border-white/5 bg-white/[0.01] text-white/45 hover:bg-white/5'
                          }`}
                        >
                          <div className="text-[10px] font-bold text-white">{preset.label}</div>
                          <div className="text-[8px] text-white/30 truncate mt-0.5">{preset.prompt}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 space-y-3 shrink-0">
                    <form onSubmit={handleAiPromptSubmit} className="flex gap-2 items-center">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Tune acoustics (e.g. 'boost vocal warmth, decompress beats')"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          className="w-full bg-black/30 border border-white/10 hover:border-white/15 focus:border-purple-400 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/20 focus:outline-none pr-8 font-mono"
                        />
                        <Sparkles className="absolute right-2.5 top-2.5 h-4 w-4 text-purple-400 animate-pulse" />
                      </div>
                      <button
                        type="submit"
                        disabled={isProcessingAi || !aiPrompt.trim()}
                        className="flex items-center justify-center h-8 w-10 shrink-0 rounded-xl bg-purple-500/20 border border-purple-500/30 text-white disabled:opacity-40 hover:bg-purple-500/30 active:scale-95 transition-all shadow-md"
                      >
                        {isProcessingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <CornerDownRight className="h-4 w-4" />}
                      </button>
                    </form>

                    {aiFeedback && (
                      <div className="p-2.5 rounded-xl border border-purple-500/15 bg-purple-950/10 text-[10px] leading-relaxed text-purple-300 font-mono shadow-inner flex gap-2">
                        <Zap className="h-3.5 w-3.5 shrink-0 text-purple-300 mt-0.5 animate-pulse" />
                        <div>{aiFeedback}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: EQ CONSOLE & DSP */}
              {activeConsoleTab === 'dsp' && (
                <div className="space-y-3.5 animate-fade-in flex flex-col h-full justify-between">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DSP Toggles */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-purple-300 block mb-1">Signal Filters</span>
                      {[
                        { id: 'spatial', title: 'Atmos Spatial Stage', state: spatialAudio, toggle: () => setSpatialAudio(!spatialAudio) },
                        { id: 'upscale', title: 'Harmonic Warmth Filter', state: harmonicUpscale, toggle: () => setHarmonicUpscale(!harmonicUpscale) },
                        { id: 'vocal', title: 'Vocal Presence Focus', state: vocalIsolation, toggle: () => { setVocalIsolation(!vocalIsolation); if (instrumentalMode) setInstrumentalMode(false); } },
                        { id: 'instrumental', title: 'Acoustic Beat Focus', state: instrumentalMode, toggle: () => { setInstrumentalMode(!instrumentalMode); if (vocalIsolation) setVocalIsolation(false); } },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={filter.toggle}
                          className={`flex w-full items-center justify-between p-2 rounded-xl border text-left text-[11px] font-semibold transition-all ${
                            filter.state ? 'border-purple-500/25 bg-purple-950/10 text-purple-200' : 'border-white/5 bg-white/[0.01] text-white/50 hover:bg-white/5'
                          }`}
                        >
                          <span className="truncate">{filter.title}</span>
                          <div className={`h-3 w-6 rounded-full p-0.5 shrink-0 ${filter.state ? 'bg-purple-400' : 'bg-white/10'}`}>
                            <div className={`h-2 w-2 rounded-full bg-white transition-transform ${filter.state ? 'translate-x-3' : 'translate-x-0'}`} />
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Manual EQ Sliders */}
                    <div className="flex flex-col h-full justify-between">
                      <div className="flex items-center justify-between border-b border-white/5 pb-1">
                        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-purple-300">Calibrator EQ</span>
                        <select
                          aria-label="Equalizer Preset Selector"
                          value={eqPreset}
                          onChange={(e) => setEqPreset(e.target.value as 'neutral' | 'neon' | 'lofi' | 'bass' | 'acoustic')}
                          className="bg-black/50 border border-white/10 rounded-md text-[9px] font-mono font-bold px-1.5 py-0.5 text-purple-300 focus:outline-none"
                        >
                          <option value="neutral">Neutral</option>
                          <option value="neon">Balanced Drive</option>
                          <option value="lofi">Lofi Tape</option>
                          <option value="bass">Sub Bass</option>
                          <option value="acoustic">Cozy Acoustic</option>
                        </select>
                      </div>

                      {/* Micro sliders visual grid */}
                      <div className="flex gap-1.5 items-end justify-between h-[95px] pt-1.5">
                        {eqGains.map((gain, idx) => {
                          const pct = ((gain + 12) / 24) * 100;
                          return (
                            <div key={idx} className="flex-1 h-full flex flex-col justify-between items-center group">
                              <span className="text-[8px] font-mono text-white/40">{gain > 0 ? `+${gain}` : gain}</span>
                              <div className="relative w-1 h-[65px] bg-white/5 rounded-full flex justify-center items-end cursor-ns-resize">
                                <div className="absolute w-full rounded-full bg-gradient-to-t from-purple-400 to-cyan-300" style={{ height: `${pct}%` }} />
                                <input
                                  aria-label={`Band ${EQ_FREQS[idx]}`}
                                  type="range"
                                  min="-12"
                                  max="12"
                                  step="1"
                                  value={gain}
                                  onChange={(e) => handleEqSliderChange(idx, Number(e.target.value))}
                                  className="absolute inset-0 opacity-0 cursor-ns-resize h-full w-full"
                                />
                              </div>
                              <span className="text-[7px] font-mono text-white/20 uppercase mt-1">{EQ_FREQS[idx].replace('Hz', '').replace('kHz', 'k')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex justify-center shrink-0">
                    <span className="text-[9px] font-mono text-white/30 flex items-center gap-1">
                      <Activity className="h-3 w-3 text-purple-400 animate-pulse" /> CALM ANALOG EMBEDDED DSP COCKPIT
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: COZY LYRICS INTERPRETER */}
              {activeConsoleTab === 'lyrics' && (
                <div className="space-y-4 animate-fade-in flex flex-col h-full justify-between">
                  <div className="space-y-3 overflow-hidden flex-1 flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 shrink-0">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-purple-300">Synced Poetry Feed</span>
                      <button
                        onClick={handleAnalyzeLyrics}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-[9px] font-bold text-purple-300 hover:bg-purple-500/15 active:scale-95 transition-all shadow-sm"
                      >
                        <BookOpen className="h-3 w-3" /> Explain Lyrics
                      </button>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-[110px] pr-1 scrollbar-thin flex-1 min-h-0">
                      {songLyrics.map((lyric, idx) => {
                        const isActive = idx === activeLyricIndex;
                        return (
                          <div
                            key={idx}
                            className={`transition-all duration-300 text-xs font-semibold flex items-start gap-2 ${
                              isActive
                                ? 'text-purple-300 scale-[1.01] py-1 px-2 rounded-lg bg-white/5 border border-white/5 font-bold'
                                : 'text-white/40'
                            }`}
                          >
                            {isActive && <Activity className="h-3.5 w-3.5 text-purple-400 animate-pulse shrink-0 mt-0.5" />}
                            <span className="leading-snug">{lyric.line}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lyric explanation box */}
                  {(isAnalyzingLyrics || lyricAnalysis) && (
                    <div className="pt-3 border-t border-white/5 shrink-0">
                      {isAnalyzingLyrics ? (
                        <div className="flex items-center gap-2 text-[9px] font-mono text-white/45">
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" /> Connecting semantic translation nodes...
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl border border-purple-500/10 bg-purple-950/5 text-[10px] leading-relaxed text-purple-300 font-mono shadow-inner">
                          {lyricAnalysis}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: COMPACT QUEUE */}
              {activeConsoleTab === 'queue' && (
                <div className="space-y-3.5 animate-fade-in flex flex-col h-full justify-between">
                  <div className="space-y-2.5 flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 shrink-0">
                      <span className="text-[10px] font-mono font-black uppercase tracking-widest text-purple-300">Upcoming Wave Queue</span>
                      {queue.length > 0 && (
                        <button onClick={clearQueue} className="text-[9px] font-mono font-bold text-rose-400 hover:text-rose-300 underline uppercase tracking-wider">Clear all</button>
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-[145px] pr-1 scrollbar-thin flex-1 min-h-0">
                      {upNextList.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.01] p-1.5 hover:border-white/10 hover:bg-white/[0.03] transition-all"
                        >
                          <TradioImage
                            src={(item.coverUrl || item.art) ?? undefined}
                            title={item.title}
                            artist={item.artist}
                            isPlaying={false}
                            fallbackSize="mini"
                            className="h-8 w-8 rounded-lg object-cover border border-white/5"
                            imgClassName="h-8 w-8 rounded-lg object-cover"
                          />
                          
                          <button
                            onClick={() => play(item, queue.filter((q) => q.id !== item.id), currentSource || undefined)}
                            className="min-w-0 flex-1 text-left"
                          >
                            <div className="truncate text-[11px] font-bold text-white">{item.title}</div>
                            <div className="truncate text-[9px] text-white/40 mt-0.5">{item.artist}</div>
                          </button>

                          {queue.some((queued) => queued.id === item.id) && (
                            <button
                              onClick={() => removeFromQueue(item.id)}
                              className="text-white/35 hover:text-rose-400 p-1 rounded transition-colors shrink-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: ACTIVE STREAM CONTEXT */}
              {activeConsoleTab === 'context' && (
                <div className="space-y-3.5 animate-fade-in flex flex-col h-full justify-between">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-1">
                      <span className="text-[9px] font-mono font-black text-white/30 uppercase block">Bitrate Profile</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">● 1411kbps Lossless</span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-1">
                      <span className="text-[9px] font-mono font-black text-white/30 uppercase block">Source Feed</span>
                      <span className="text-xs font-mono font-bold text-white truncate block">{currentSource?.title || display.station || 'Core System'}</span>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-1 col-span-2">
                      <span className="text-[9px] font-mono font-black text-white/30 uppercase block">Spatial Engine & Codec</span>
                      <span className={`text-xs font-mono font-bold transition-colors duration-300 ${spatialAudio ? 'text-purple-300' : 'text-white/40'}`}>
                        {spatialAudio ? '● Dolby Atmos Digital Plus (Wired)' : '○ Discrete L/R Stereo (Bypass)'}
                      </span>
                    </div>

                    {isLive && (
                      <div className="rounded-xl border border-purple-500/10 bg-purple-500/5 p-3 text-left space-y-1 col-span-2">
                        <span className="text-[9px] font-mono font-black text-purple-300/60 uppercase block">Active Listeners</span>
                        <span className="text-xs font-mono font-bold text-white block">
                          {(currentSource?.listenerCount || stationContext?.listenerCount || liveContext?.listenerCount || 18420).toLocaleString()} receivers active
                        </span>
                      </div>
                    )}

                    {beatContext && (
                      <>
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-1">
                          <span className="text-[9px] font-mono font-black text-white/30 uppercase block">BPM & Key</span>
                          <span className="text-xs font-mono font-bold text-cyan-300">{beatContext.bpm} BPM • {beatContext.musicalKey}</span>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-1">
                          <span className="text-[9px] font-mono font-black text-white/30 uppercase block">Licensing</span>
                          <span className="text-xs font-mono font-bold text-white truncate block">{beatContext.licenseLabel || 'Exclusive'}</span>
                        </div>
                      </>
                    )}

                    {songWarsContext && (
                      <>
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-1">
                          <span className="text-[9px] font-mono font-black text-white/30 uppercase block">Matchup</span>
                          <span className="text-xs font-mono font-bold text-white truncate block">{songWarsContext.artistA} vs {songWarsContext.artistB}</span>
                        </div>
                        <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-1">
                          <span className="text-[9px] font-mono font-black text-white/30 uppercase block">Stage</span>
                          <span className="text-xs font-mono font-bold text-white">Round {songWarsContext.roundNumber}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-3 rounded-xl border border-white/5 bg-black/10 text-[10px] leading-relaxed text-white/55 font-mono">
                    <strong className="text-purple-300 font-bold block mb-0.5">Atmosphere Insight:</strong>
                    Tuned with Dolby Atmos filters. Local signal analysis identifies this as a secure, harmonic {copy.eyebrow} stream environment.
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
        
      </div>
      
    </div>
  );
};

export default NowPlayingScreen;
