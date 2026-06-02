import React, { useMemo, useState, useEffect, useRef } from 'react';
import { 
  BadgeCheck, 
  CalendarClock, 
  Check, 
  Megaphone, 
  MessageCircle, 
  Mic2, 
  Music2, 
  Radio, 
  Save, 
  Sparkles, 
  Users, 
  Wand2, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Plus, 
  Volume2, 
  Play, 
  Pause, 
  Square, 
  Activity, 
  Zap, 
  Share2, 
  MessageSquare, 
  Smile, 
  Star 
} from 'lucide-react';
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, SegmentedTabs, Waveform } from '../ui';
import { ContentFeelAnalysisPanel } from '../../content-feel/ContentFeelComponents';
import { useContentFeelAnalysis } from '../../content-feel/useContentFeelAnalysis';
import { ALL_STATIONS, RADIO_SHOWS, SHOW_TEMPLATES, type RadioShow, type ShowSegment } from '../data';
import { generateShowPlan, emptyForm, type ShowBuilderFormState, type SaveTarget } from '../showPlan';
import { LegalAcceptanceGroup } from '../legal/LegalPrimitives';
import {
  createLegalAcceptanceValues,
  isLegalFlowAccepted,
  LEGAL_ACCEPTANCE_FLOWS,
  recordLegalFlowAcceptance,
  type LegalAcceptanceValues,
} from '../legal/legalAcceptanceConfig';

type ShowBuilderTab = 'builder' | 'templates' | 'saved';

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-white/45">{label}</span>
    {children}
  </label>
);

const inputClass = 'w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/50 focus:bg-white/[0.07]';

const segmentIcon: Record<string, React.FC<{ className?: string }>> = {
  intro: Mic2,
  'music-block': Music2,
  'host-talk': Mic2,
  'fan-request': MessageCircle,
  'producer-spotlight': Sparkles,
  'artist-premiere': Radio,
  commercial: Megaphone,
  poll: Users,
  closing: CalendarClock,
};

// Mock comments for simulation
const CHAT_TEMPLATES: Record<string, string[]> = {
  intro: ["Let's gooo!", "Tuned in and ready!", "Unbelievable intro vibe.", "Tradio AI on the air!", "Jordan at the helm? 🔥"],
  'host-talk': ["Love this tone of host", "The AI translation is wild", "Speak on it!", "Always tuning in for this", "Cozy night stream"],
  'music-block': ["This track is heavy!", "WTF is this ID? It's fire", "Banger alert", "Memphis trap elements? 🔥", "Need this on Spotify ASAP"],
  commercial: ["Commercial break, staying tuned", "Support the network!", "Brb grabbing a drink", "AI ad engine is neat", "Don't miss the spotlight!"],
  'fan-request': ["I requested this! Thanks!", "Wow, actually plays requests", "Tradio community wins again", "This queue is packed", "Big shoutout!"],
  'producer-spotlight': ["That first beat is crazy", "Who produced this? Stems are hot", "Rapping over this immediately", "Producer spotlight is key", "Pitching my vocals now"],
  'artist-premiere': ["OMGGGG NEW RELEASE", "First listen hype", "Pre-saved immediately", "The vocals are crisp", "Pure heat! 😭🔥"],
  poll: ["Voted A!", "Option B is easily better", "Crowdsourced DJ set, love it", "Click B quick!", "VOTING NOW"],
  closing: ["Nooo don't close yet!", "Replay will be on repeat", "Amazing session", "Goodnight y'all!", "Tradio AI did it again 🙌"],
};

export const ShowBuilder: React.FC = () => {
  const [tab, setTab] = useState<ShowBuilderTab>('builder');
  const [form, setForm] = useState<ShowBuilderFormState>(emptyForm);
  const [generatedShow, setGeneratedShow] = useState<RadioShow | null>(null);
  const showPlanContentFeel = useContentFeelAnalysis({
    contentId: 'draft-ai-show-builder',
    contentType: 'radio_show',
    sourcePlatform: 'tradio',
    title: form.showName || 'Untitled Show Plan',
    description: `Show plan • ${form.showMood} • ${form.hostTone} • for ${form.targetAudience}`,
    creatorTags: [form.showMood, form.fanInteractionStyle],
  });
  const [saved, setSaved] = useState(false);

  // Simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simActiveIndex, setSimActiveIndex] = useState(0);
  const [simSecondsElapsed, setSimSecondsElapsed] = useState(0);
  const [simPlaying, setSimPlaying] = useState(true);
  const [vuLeft, setVuLeft] = useState([40, 50, 60, 45, 30, 20]);
  const [vuRight, setVuRight] = useState([35, 55, 65, 40, 25, 15]);
  const [simFeed, setSimFeed] = useState<{ user: string; text: string; id: number }[]>([]);
  const [activeSFX, setActiveSFX] = useState<string | null>(null);
  const [volume, setVolume] = useState(80);
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);

  // Setup initial generated show so there's always something to play
  useEffect(() => {
    if (!generatedShow) {
      setGeneratedShow(generateShowPlan(emptyForm));
    }
  }, [generatedShow]);

  // Handle segment editing states
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState(120);
  const [editNotes, setEditNotes] = useState('');

  // Add Custom Segment state
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addType, setAddType] = useState<ShowSegment['type']>('music-block');
  const [addTitle, setAddTitle] = useState('');
  const [addDur, setAddDuration] = useState(180);
  const [addNotes, setAddNotes] = useState('');

  const activeShow = useMemo(() => generatedShow || RADIO_SHOWS[0], [generatedShow]);

  // Simulation Interval Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating && simPlaying && activeShow) {
      interval = setInterval(() => {
        const segments = activeShow.segments;
        const currentSegment = segments[simActiveIndex];

        if (!currentSegment) return;

        // Tick elapsed time (10x fast speed for snappy QA and engagement)
        setSimSecondsElapsed((prev) => {
          if (prev + 10 >= currentSegment.duration) {
            // Move to next segment
            if (simActiveIndex + 1 < segments.length) {
              setSimActiveIndex((idx) => idx + 1);
              return 0;
            } else {
              // End of show
              setIsSimulating(false);
              return 0;
            }
          }
          return prev + 10;
        });

        // Dynamic VU levels simulation
        setVuLeft(Array.from({ length: 12 }, () => Math.floor(Math.random() * 55) + 25));
        setVuRight(Array.from({ length: 12 }, () => Math.floor(Math.random() * 55) + 25));

        // Periodically inject chats matching segment type
        if (Math.random() > 0.45) {
          const type = currentSegment.type;
          const comments = CHAT_TEMPLATES[type] || ["Vibing!", "Tradio AI 🔥"];
          const userList = ["Jordan", "Kiana", "Noel", "Mila", "Darius", "Zaylen", "TreyFan_99", "TrapSoulSis", "DJ_Drop", "Memphis_Kid"];
          const user = userList[Math.floor(Math.random() * userList.length)];
          const text = comments[Math.floor(Math.random() * comments.length)];
          setSimFeed((prev) => [{ user, text, id: Date.now() }, ...prev.slice(0, 15)]);
        }
      }, 700);
    }
    return () => clearInterval(interval);
  }, [isSimulating, simPlaying, simActiveIndex, activeShow]);

  // Idle VU meter simulation
  useEffect(() => {
    let idleInterval: NodeJS.Timeout;
    if (!isSimulating || !simPlaying) {
      idleInterval = setInterval(() => {
        setVuLeft(Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 10));
        setVuRight(Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 10));
      }, 1000);
    }
    return () => clearInterval(idleInterval);
  }, [isSimulating, simPlaying]);

  const generate = () => {
    setGeneratedShow(generateShowPlan(form));
    setSaved(false);
    setIsSimulating(false);
  };

  const save = () => {
    if (!generatedShow) setGeneratedShow(generateShowPlan(form));
    setSaved(true);
  };

  // Sound effect triggers
  const triggerSFX = (sfx: string) => {
    setActiveSFX(sfx);
    // Spike the meters!
    setVuLeft(Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 80));
    setVuRight(Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 80));
    setSimFeed((prev) => [
      { user: "MASTER SFX", text: `Triggered effect: [${sfx.toUpperCase()}] 🔊`, id: Date.now() },
      ...prev
    ]);
    setTimeout(() => setActiveSFX(null), 1000);
  };

  // Live timeline editor handlers
  const handleMoveSegment = (index: number, direction: 'up' | 'down') => {
    if (!generatedShow) return;
    const segments = [...generatedShow.segments];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= segments.length) return;

    // Swap
    const temp = segments[index];
    segments[index] = segments[targetIdx];
    segments[targetIdx] = temp;

    setGeneratedShow({ ...generatedShow, segments });
  };

  const handleDeleteSegment = (index: number) => {
    if (!generatedShow) return;
    const segments = generatedShow.segments.filter((_, idx) => idx !== index);
    const totalMinutes = Math.round(segments.reduce((sum, s) => sum + s.duration, 0) / 60);
    setGeneratedShow({ ...generatedShow, segments, duration: totalMinutes });
  };

  const handleStartEditSegment = (segment: ShowSegment) => {
    setEditingSegmentId(segment.id);
    setEditTitle(segment.title);
    setEditDuration(segment.duration);
    setEditNotes(segment.hostNotes || '');
  };

  const handleSaveSegmentEdit = () => {
    if (!generatedShow || !editingSegmentId) return;
    const segments = generatedShow.segments.map((s) => {
      if (s.id === editingSegmentId) {
        return { ...s, title: editTitle, duration: editDuration, hostNotes: editNotes };
      }
      return s;
    });
    const totalMinutes = Math.round(segments.reduce((sum, s) => sum + s.duration, 0) / 60);
    setGeneratedShow({ ...generatedShow, segments, duration: totalMinutes });
    setEditingSegmentId(null);
  };

  const handleAddSegment = () => {
    if (!generatedShow) return;
    const newSeg: ShowSegment = {
      id: `custom-add-${Date.now()}`,
      type: addType,
      title: addTitle || 'Custom Music Interlude',
      duration: addDur,
      hostNotes: addNotes,
    };
    const segments = [...generatedShow.segments, newSeg];
    const totalMinutes = Math.round(segments.reduce((sum, s) => sum + s.duration, 0) / 60);
    setGeneratedShow({ ...generatedShow, segments, duration: totalMinutes });
    setShowAddPanel(false);
    // Reset inputs
    setAddTitle('');
    setAddDuration(180);
    setAddNotes('');
  };

  return (
    <div className="space-y-8 pb-6 lg:space-y-10">
      <TopBar title="AI Show Builder" />

      {/* Hero Header Banner */}
      <div className="px-4 sm:px-6 lg:px-10">
        <GlassCard glow className="overflow-hidden relative border border-purple-500/10">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-30 bg-radial-gradient bg-radial-[#8B5CF6]/20 to-transparent pointer-events-none" />
          <div className="p-5 relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-purple-400/30 bg-purple-500/10 shadow-[0_0_20px_rgba(176,38,255,0.2)]">
                <Wand2 className="h-8 w-8 text-fuchsia-300 animate-pulse" />
              </div>
              <div>
                <Chip label="AI Live Radio Show Builder" selected icon={<Sparkles className="h-3.5 w-3.5" />} />
                <h1 className="mt-3 text-3xl font-black tracking-tight text-white">Build & Simulate Live Radio</h1>
                <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/65">
                  Design fully sequenced radio plans and launch them into our state-of-the-art **On-Air Simulation Deck** to experience real-time equalizing, AI script prompts, live fan chat reactions, and interactive SFX triggers.
                </p>
              </div>
            </div>
            {saved && (
              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-3 text-sm font-semibold text-cyan-200 animate-pulse">
                Saved as {form.saveAs}
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* Tabs Row */}
      <div className="px-4 sm:px-6 lg:px-10">
        <SegmentedTabs
          tabs={[
            { id: 'builder', label: 'Builder' },
            { id: 'templates', label: 'Templates', count: SHOW_TEMPLATES.length },
            { id: 'saved', label: 'Saved', count: RADIO_SHOWS.length },
          ]}
          activeTab={tab}
          onTabChange={(next) => setTab(next as ShowBuilderTab)}
        />
      </div>

      {tab === 'builder' && (
        <div className="px-4 sm:px-6 lg:px-10">
          <ContentFeelAnalysisPanel profile={showPlanContentFeel.profile} status={showPlanContentFeel.status} onRun={showPlanContentFeel.run} />
        </div>
      )}

      {tab === 'builder' && (
        <div className="grid gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 items-start">

          {/* LEFT PANEL: Show Planner Form */}
          <div className="space-y-6">
            <ShowBuilderForm
              form={form}
              onChange={(next) => setForm((current) => ({ ...current, ...next }))}
              onGenerate={generate}
              onSave={save}
              generated={Boolean(generatedShow)}
            />
          </div>

          {/* RIGHT PANEL: Live Timeline Preview or Simulation Deck */}
          <div className="space-y-6">
            
            {isSimulating ? (
              /* ON AIR SIMULATOR DECK */
              <GlassCard glow className="p-5 border-[0.5px] border-red-500/35 bg-gradient-to-b from-black/80 via-black/40 to-black/60 shadow-[0_0_50px_rgba(239,68,68,0.15)] relative">
                
                {/* Visual flash effect when SFX triggers */}
                {activeSFX && (
                  <div className="absolute inset-0 bg-fuchsia-500/5 backdrop-blur-[1px] pointer-events-none rounded-[2rem] border border-fuchsia-500/30 z-30 animate-pulse" />
                )}

                {/* Simulated Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <div>
                      <span className="text-xs font-black tracking-widest text-red-500 uppercase font-mono animate-pulse">ON AIR BROADCAST</span>
                      <span className="block text-[10px] text-white/40 uppercase font-mono">{activeShow.title}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimPlaying(!simPlaying)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 hover:border-white/20 active:scale-95 transition-all text-white/80 hover:text-white"
                      title={simPlaying ? "Pause simulation" : "Resume simulation"}
                    >
                      {simPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                    </button>
                    <button
                      onClick={() => setIsSimulating(false)}
                      className="rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Square className="h-3 w-3 fill-red-400" /> STOP LIVE SIM
                    </button>
                  </div>
                </div>

                {/* Dynamic Master VU Meters & Deck Controls */}
                <div className="grid grid-cols-[1fr_80px] gap-4 mb-4 bg-black/40 border border-white/5 rounded-2xl p-4">
                  
                  {/* Active Segment Control */}
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
                      SEGMENT {simActiveIndex + 1} OF {activeShow.segments.length} • {activeShow.segments[simActiveIndex]?.type.toUpperCase()}
                    </span>
                    <h3 className="text-xl font-black text-white truncate mt-1">
                      {activeShow.segments[simActiveIndex]?.title}
                    </h3>
                    <p className="text-xs text-white/50 truncate mt-0.5">
                      {activeShow.segments[simActiveIndex]?.description || "Curated audio stream"}
                    </p>

                    {/* Progress Slider */}
                    <div className="mt-4 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono text-white/45">
                        <span>ELAPSED: {Math.round(simSecondsElapsed)}s</span>
                        <span>DURATION: {activeShow.segments[simActiveIndex]?.duration}s</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-red-500 via-fuchsia-500 to-cyan-400 transition-all duration-700" 
                          style={{ width: `${(simSecondsElapsed / (activeShow.segments[simActiveIndex]?.duration || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dual VU Meters */}
                  <div className="flex items-center gap-2.5 justify-center bg-black/40 p-2 rounded-xl border border-white/5">
                    {/* Left VU */}
                    <div className="flex flex-col gap-0.5 items-center justify-end h-24 w-4">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const levelVal = (10 - idx) * 10;
                        const active = Math.max(...vuLeft) > levelVal;
                        let bg = 'bg-white/10';
                        if (active) {
                          if (levelVal > 80) bg = 'bg-red-500';
                          else if (levelVal > 60) bg = 'bg-yellow-400';
                          else bg = 'bg-emerald-400';
                        }
                        return <div key={idx} className={`w-3 h-1.5 rounded-[1px] ${bg} transition-all duration-100`} />;
                      })}
                      <span className="text-[7px] font-mono text-white/40 mt-1">L</span>
                    </div>

                    {/* Right VU */}
                    <div className="flex flex-col gap-0.5 items-center justify-end h-24 w-4">
                      {Array.from({ length: 10 }).map((_, idx) => {
                        const levelVal = (10 - idx) * 10;
                        const active = Math.max(...vuRight) > levelVal;
                        let bg = 'bg-white/10';
                        if (active) {
                          if (levelVal > 80) bg = 'bg-red-500';
                          else if (levelVal > 60) bg = 'bg-yellow-400';
                          else bg = 'bg-emerald-400';
                        }
                        return <div key={idx} className={`w-3 h-1.5 rounded-[1px] ${bg} transition-all duration-100`} />;
                      })}
                      <span className="text-[7px] font-mono text-white/40 mt-1">R</span>
                    </div>
                  </div>

                </div>

                {/* Scrolling Host Script/Teleprompter (Showed if talking or intro) */}
                {activeShow.segments[simActiveIndex]?.hostNotes && (
                  <div className="mb-4 bg-[#100B1A]/80 border border-purple-500/10 rounded-2xl p-4 relative overflow-hidden">
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                      <span className="text-[8px] font-mono text-cyan-300 font-bold uppercase tracking-wider">AI Host Prompting</span>
                    </div>
                    <div className="text-[9px] font-bold text-purple-300 uppercase tracking-widest font-mono">Host Notes Teleprompter</div>
                    <p className="mt-2 text-xs italic leading-relaxed text-purple-100 font-medium line-clamp-3">
                      "{activeShow.segments[simActiveIndex]?.hostNotes}"
                    </p>
                    <Waveform className="h-3 w-full opacity-35 mt-3" bars={36} color="from-cyan-300 to-purple-400" />
                  </div>
                )}

                {/* Soundboard Panel */}
                <div className="mb-4">
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono mb-2">Live FX Soundboard</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { sfx: "Airhorn", icon: <Zap className="h-3.5 w-3.5" /> },
                      { sfx: "Scratch", icon: <Activity className="h-3.5 w-3.5" /> },
                      { sfx: "Crowd", icon: <Users className="h-3.5 w-3.5" /> },
                      { sfx: "Drop", icon: <Sparkles className="h-3.5 w-3.5" /> },
                      { sfx: "Reverb", icon: <Volume2 className="h-3.5 w-3.5" /> },
                      { sfx: "Bass Boost", icon: <Radio className="h-3.5 w-3.5" /> },
                    ].map((item) => (
                      <button
                        key={item.sfx}
                        onClick={() => triggerSFX(item.sfx)}
                        className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white/70 hover:text-white hover:bg-white/[0.08] hover:border-white/10 active:scale-95 transition-all shadow-inner"
                      >
                        {item.icon}
                        <span className="truncate">{item.sfx}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Fan Reaction Feed */}
                <div>
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-widest font-mono mb-2 flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5 text-cyan-400" /> Live Fan Reaction Chat
                  </div>
                  <div className="bg-black/50 border border-white/5 rounded-2xl p-3 h-36 overflow-y-auto flex flex-col-reverse gap-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {simFeed.length === 0 ? (
                      <div className="text-center text-xs text-white/20 py-8">Awaiting fan reaction signals...</div>
                    ) : (
                      simFeed.map((msg) => {
                        const sfxTag = msg.user === "MASTER SFX";
                        return (
                          <div key={msg.id} className={`flex items-start gap-2.5 text-xs animate-fade-in ${sfxTag ? 'border border-fuchsia-500/20 bg-fuchsia-950/10 p-1.5 rounded-lg' : ''}`}>
                            <div className={`font-black ${sfxTag ? 'text-fuchsia-400 font-mono' : 'text-cyan-300'}`}>@{msg.user}:</div>
                            <div className={`flex-1 text-white/80 font-medium ${sfxTag ? 'text-fuchsia-200' : ''}`}>{msg.text}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </GlassCard>
            ) : (
              /* INTERACTIVE TIMELINE PLANNER EDITOR */
              <GlassCard glow className="p-4 sm:p-5 border border-white/10 shadow-premium relative">
                
                {/* Header with Go On Air FAB */}
                <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <CalendarClock className="h-5 w-5 text-purple-400" /> Interactive Live Plan
                    </h2>
                    <div className="text-xs text-white/50">{activeShow.duration} min duration - {activeShow.mood}</div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSimActiveIndex(0);
                      setSimSecondsElapsed(0);
                      setSimFeed([]);
                      setIsSimulating(true);
                    }}
                    className="rounded-full bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
                  >
                    <Radio className="h-4 w-4" /> Go On Air (Sim)
                  </button>
                </div>

                {/* Show Segment Grid Meter Bar */}
                <div className="flex overflow-hidden rounded-full border border-white/10 bg-white/[0.04] h-3.5 mb-5 relative group">
                  {activeShow.segments.length === 0 ? (
                    <div className="w-full text-center text-[10px] text-white/30 font-bold">No segments in plan</div>
                  ) : (
                    activeShow.segments.map((segment, idx) => {
                      const totalSeconds = activeShow.segments.reduce((sum, s) => sum + s.duration, 0);
                      const pct = (segment.duration / totalSeconds) * 100;
                      return (
                        <div
                          key={segment.id}
                          className="h-full bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 border-r border-black/20 hover:brightness-125 transition-all cursor-pointer"
                          style={{ width: `${pct}%` }}
                          title={`${segment.title} (${Math.round(segment.duration / 60)} min)`}
                        />
                      );
                    })
                  )}
                </div>

                {/* Editable Segments List */}
                <div className="space-y-3">
                  {activeShow.segments.length === 0 ? (
                    <div className="text-center py-12 text-xs text-white/30 border border-dashed border-white/10 rounded-2xl">
                      Click "+ Add Custom Segment" below to start scheduling blocks.
                    </div>
                  ) : (
                    activeShow.segments.map((segment, index) => {
                      const Icon = segmentIcon[segment.type] || Music2;
                      const isEditing = editingSegmentId === segment.id;

                      return (
                        <div key={segment.id} className="relative group/card">
                          <GlassCard className={`p-4 transition-all duration-300 ${isEditing ? 'border-cyan-400/40 bg-cyan-950/10' : 'hover:border-white/15'}`}>
                            
                            {isEditing ? (
                              /* Inner Live Segment Editor Box */
                              <div className="space-y-3 animate-fade-in">
                                <div className="text-xs font-bold text-cyan-300 uppercase tracking-widest font-mono">Edit Segment Settings</div>
                                <div className="grid gap-2">
                                  <Field label="Segment Title">
                                    <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className={inputClass} />
                                  </Field>
                                  <Field label="Segment Duration (Seconds)">
                                    <input type="number" value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value))} className={inputClass} />
                                  </Field>
                                  <Field label="Host Note Script Prompt">
                                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className={`${inputClass} h-20 resize-none`} placeholder="Optional scripting..." />
                                  </Field>
                                </div>
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingSegmentId(null)} className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-bold text-white/60 hover:text-white">Cancel</button>
                                  <button onClick={handleSaveSegmentEdit} className="rounded-xl bg-cyan-500 hover:bg-cyan-600 px-4 py-1.5 text-xs font-black text-white">Save Changes</button>
                                </div>
                              </div>
                            ) : (
                              /* Standard Segment Card with Reordering Controls */
                              <div className="flex gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10">
                                  <Icon className="h-5 w-5 text-purple-200" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="font-semibold text-white truncate max-w-[180px]">{segment.title}</div>
                                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] uppercase tracking-wider text-white/50">{segment.type}</span>
                                  </div>
                                  <div className="mt-0.5 text-xs text-cyan-300 font-semibold font-mono">{Math.round(segment.duration / 60)} min ({segment.duration}s)</div>
                                  {segment.description && <p className="mt-1.5 text-xs leading-relaxed text-white/50">{segment.description}</p>}
                                  {segment.hostNotes && <p className="mt-1.5 rounded-xl border border-white/5 bg-white/[0.02] p-2 text-[11px] italic leading-relaxed text-white/45">{segment.hostNotes}</p>}
                                </div>

                                {/* Reordering & Action panel inside card */}
                                <div className="flex flex-col items-center justify-center gap-1.5 opacity-40 group-hover/card:opacity-100 transition-opacity">
                                  <button 
                                    onClick={() => handleMoveSegment(index, 'up')}
                                    disabled={index === 0}
                                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                                    title="Move Segment Up"
                                  >
                                    <ArrowUp className="h-3.5 w-3.5" />
                                  </button>
                                  <button 
                                    onClick={() => handleMoveSegment(index, 'down')}
                                    disabled={index === activeShow.segments.length - 1}
                                    className="h-7 w-7 flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-white/70 hover:bg-white/[0.08] hover:text-white disabled:opacity-20 disabled:pointer-events-none"
                                    title="Move Segment Down"
                                  >
                                    <ArrowDown className="h-3.5 w-3.5" />
                                  </button>
                                  <div className="flex gap-1 mt-0.5">
                                    <button 
                                      onClick={() => handleStartEditSegment(segment)}
                                      className="h-7 px-2 flex items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/10 text-[10px] font-bold"
                                      title="Edit details"
                                    >
                                      Edit
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteSegment(index)}
                                      className="h-7 w-7 flex items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                                      title="Delete block"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                          </GlassCard>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Segment Action Box */}
                <div className="mt-4">
                  {showAddPanel ? (
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-3 animate-scale-in">
                      <div className="text-xs font-bold text-purple-300 uppercase tracking-widest font-mono">Insert New Segment block</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Segment Type">
                          <select className={inputClass} value={addType} onChange={(e) => setAddType(e.target.value as ShowSegment['type'])}>
                            {['intro', 'music-block', 'host-talk', 'fan-request', 'producer-spotlight', 'artist-premiere', 'commercial', 'poll', 'closing'].map((t) => (
                              <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>
                            ))}
                          </select>
                        </Field>
                        <Field label="Title text">
                          <input value={addTitle} onChange={(e) => setAddTitle(e.target.value)} placeholder="e.g. Host Banter / Mix Spot" className={inputClass} />
                        </Field>
                        <Field label="Duration (Seconds)">
                          <input type="number" value={addDur} onChange={(e) => setAddDuration(Number(e.target.value))} className={inputClass} />
                        </Field>
                        <Field label="Host Note (Notes / Prompts)">
                          <input value={addNotes} onChange={(e) => setAddNotes(e.target.value)} placeholder="Optional scripted host cue..." className={inputClass} />
                        </Field>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button onClick={() => setShowAddPanel(false)} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-white/60 hover:text-white">Cancel</button>
                        <button onClick={handleAddSegment} className="rounded-xl bg-purple-500 hover:bg-purple-600 px-5 py-2 text-xs font-black text-white">Insert Block</button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddPanel(true)}
                      className="w-full rounded-2xl border border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/25 py-3 text-center text-xs font-bold text-white/60 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="h-4 w-4 text-purple-300" /> Insert New Segment Block
                    </button>
                  )}
                </div>

              </GlassCard>
            )}

          </div>

        </div>
      )}

      {tab === 'templates' && (
        <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          {SHOW_TEMPLATES.map((template) => (
            <ShowTemplateCard key={template.id} show={template} onUse={() => {
              setForm((current) => ({ ...current, showName: template.title, showLength: template.duration, showMood: template.mood }));
              setTab('builder');
            }} />
          ))}
        </div>
      )}

      {tab === 'saved' && (
        <div className="grid gap-3 px-4 sm:px-6 lg:grid-cols-2 lg:px-10">
          {RADIO_SHOWS.map((show) => <ShowTemplateCard key={show.id} show={show} />)}
          {generatedShow && <ShowTemplateCard show={generatedShow} />}
        </div>
      )}
    </div>
  );
};

const ShowBuilderForm: React.FC<{
  form: ShowBuilderFormState;
  onChange: (next: Partial<ShowBuilderFormState>) => void;
  onGenerate: () => void;
  onSave: () => void;
  generated: boolean;
}> = ({ form, onChange, onGenerate, onSave, generated }) => {
  const [legalValues, setLegalValues] = useState<LegalAcceptanceValues>(() => createLegalAcceptanceValues('dj_broadcast_schedule'));
  const [legalStatus, setLegalStatus] = useState<'idle' | 'saving' | 'saved' | 'fallback' | 'error'>('idle');
  const [legalMessage, setLegalMessage] = useState<string | null>(null);
  const legalAccepted = isLegalFlowAccepted('dj_broadcast_schedule', legalValues);

  const recordAndRun = async (action: 'generate' | 'save') => {
    if (!legalAccepted || legalStatus === 'saving') return;
    setLegalStatus('saving');
    const result = await recordLegalFlowAcceptance('dj_broadcast_schedule', legalValues, {
      action,
      referenceId: form.showName || 'mock-ai-show-builder',
      showName: form.showName,
      selectedStation: form.selectedStation,
      saveAs: form.saveAs,
    });
    setLegalStatus(result.source === 'supabase' ? 'saved' : 'fallback');
    setLegalMessage(result.source === 'supabase' ? 'Broadcast acknowledgement saved.' : result.warning);
    if (action === 'generate') onGenerate();
    else onSave();
  };

  return (
    <GlassCard className="space-y-4 p-5">
      <div>
        <div className="text-sm font-black text-white">Show Setup</div>
        <p className="mt-1 text-xs leading-relaxed text-white/50">Draft the show plan before saving a template, replay package, or live show.</p>
      </div>
      <Field label="Show Name">
        <input className={inputClass} value={form.showName} onChange={(e) => onChange({ showName: e.target.value })} placeholder="Midnight Network Session" />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Length">
          <input type="number" className={inputClass} value={form.showLength} onChange={(e) => onChange({ showLength: Number(e.target.value) })} />
        </Field>
        <Field label="Mood">
          <input className={inputClass} value={form.showMood} onChange={(e) => onChange({ showMood: e.target.value })} />
        </Field>
      </div>
      <Field label="Target Audience">
        <textarea className={`${inputClass} h-20 resize-none`} value={form.targetAudience} onChange={(e) => onChange({ targetAudience: e.target.value })} />
      </Field>
      <Field label="Music Source">
        <input className={inputClass} value={form.musicSource} onChange={(e) => onChange({ musicSource: e.target.value })} />
      </Field>
      <Field label="Save As">
        <select className={inputClass} value={form.saveAs} onChange={(e) => onChange({ saveAs: e.target.value as SaveTarget })}>
          <option value="template">Template</option>
          <option value="live show">Live show</option>
          <option value="replay">Replay</option>
        </select>
      </Field>
      <LegalAcceptanceGroup
        config={LEGAL_ACCEPTANCE_FLOWS.dj_broadcast_schedule}
        values={legalValues}
        onChange={setLegalValues}
        status={legalStatus}
        statusMessage={legalMessage}
        compact
      />
      <div className="flex flex-wrap gap-2 pt-1">
        <PrimaryButton disabled={!legalAccepted || legalStatus === 'saving'} onClick={() => recordAndRun('generate')} className={legalAccepted ? '' : 'pointer-events-none opacity-40'}>
          <Sparkles className="h-4 w-4" /> Generate Plan
        </PrimaryButton>
        <SecondaryButton disabled={!generated || !legalAccepted || legalStatus === 'saving'} onClick={() => recordAndRun('save')} className={generated && legalAccepted ? '' : 'pointer-events-none opacity-40'}>
          <Save className="h-4 w-4" /> Save Show
        </SecondaryButton>
      </div>
    </GlassCard>
  );
};

const ShowTemplateCard: React.FC<{ show: RadioShow; onUse?: () => void }> = ({ show, onUse }) => (
  <GlassCard className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-base font-bold text-white">{show.title}</div>
        <div className="mt-1 text-xs text-white/50">{show.duration} min - {show.mood}</div>
      </div>
      <Chip label={show.status || 'draft'} selected />
    </div>
    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/65">{show.targetAudience}</p>
    {onUse && (
      <SecondaryButton className="mt-4 px-3 py-2 text-xs" onClick={onUse}>
        Use Template
      </SecondaryButton>
    )}
  </GlassCard>
);

export default ShowBuilder;
