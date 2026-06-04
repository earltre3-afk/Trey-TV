import React, { useState, useEffect, useMemo } from "react";
import {
  Radio, Sparkles, ChevronRight, Lock, CheckCircle, Send, User, Shield, Users,
  Music, Mic2, Disc, Calendar, Flame, UploadCloud, Layers, AlertCircle,
  Megaphone, Play, RotateCcw, Check, Plus, Globe, Settings, X, Trash2, ArrowUp, ArrowDown,
  Volume2, Pause, Clock, Tag, ShieldCheck, Eye, BadgeAlert, Heart, BarChart3, MessageSquare
} from "lucide-react";
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, Waveform } from "../ui";
import { ACTIVE_USER, IMG, ALL_STATIONS } from "../data";
import { AccessGate } from "../auth/components";
import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { toast } from "sonner";
import {
  TradioShow, TradioShowEpisode, TradioShowBlock, TradioBroadcastSlot,
  TradioAdSlot, TradioMusicSubmission, TradioShowAnalytics
} from "../types/broadcast";
import {
  generateShowRundown, generateHostScripts, generateStationDrop,
  generateAdRead, suggestMusicBlocks, validateShowReadiness,
  renderVoiceWithProvider
} from "../services/broadcastService";

// Standard class for customized custom-styled premium inputs
const inputClass =
  "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/50 focus:bg-white/[0.02]";

const selectClass =
  "w-full rounded-2xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition cursor-pointer focus:border-cyan-400/50 focus:bg-black/80 appearance-none";

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block space-y-1.5">
    <span className="block text-[10px] font-black uppercase tracking-widest text-white/45 font-mono">
      {label}
    </span>
    <div className="relative">
      {children}
    </div>
  </label>
);

const MOCK_SHOWS: TradioShow[] = [
  {
    id: "show-1",
    user_id: "user-1",
    title: "Late Night Lounge",
    description: "The ultimate chill vibes for late-night music lovers.",
    show_type: "artist-show",
    mood: "Chill",
    target_audience: "Lo-fi fans",
    visibility: "public",
    status: "published",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "show-2",
    user_id: "user-1",
    title: "Trap Soul Sessions",
    description: "Heavy drum loops and deep atmospheric trap vocals.",
    show_type: "dj-mix",
    mood: "Energetic",
    target_audience: "Hip hop heads",
    visibility: "public",
    status: "draft",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const MOCK_EPISODES: Record<string, TradioShowEpisode[]> = {
  "show-1": [
    {
      id: "ep-1",
      show_id: "show-1",
      user_id: "user-1",
      title: "Episode 1: Smooth Waveforms",
      description: "Atmospheric textures and premium loops to set the night right.",
      duration_seconds: 1800,
      status: "published",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "ep-2",
      show_id: "show-1",
      user_id: "user-1",
      title: "Episode 2: Lo-Fi Reverie (Draft)",
      description: "A soft journey into nostalgic vinyl crackles and synth pads.",
      duration_seconds: 1200,
      status: "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  ]
};

export const BroadcastStudioGateway: React.FC<{ onBack: () => void; initialTab?: string }> = ({ onBack, initialTab }) => {
  const [subView, setSubView] = useState<"dashboard" | "create-show" | "show-detail" | "create-episode" | "editor">("dashboard");
  const [loading, setLoading] = useState(false);
  const [role] = useState<string>("artist");

  // Database states
  const [shows, setShows] = useState<TradioShow[]>(MOCK_SHOWS);
  const [episodes, setEpisodes] = useState<Record<string, TradioShowEpisode[]>>(MOCK_EPISODES);
  const [currentShow, setCurrentShow] = useState<TradioShow | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<TradioShowEpisode | null>(null);
  const [episodeBlocks, setEpisodeBlocks] = useState<TradioShowBlock[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, TradioShowAnalytics>>({});
  const [stationDrops, setStationDrops] = useState<{ id: string; title: string; audio_url: string }[]>([
    { id: "drop-1", title: "Trey TV Official Station ID", audio_url: "/audio/drops/id1.mp3" },
    { id: "drop-2", title: "Midnight Atmospheric Drop", audio_url: "/audio/drops/id2.mp3" }
  ]);

  // Form states for Create Show
  const [newShowTitle, setNewShowTitle] = useState("");
  const [newShowDesc, setNewShowDesc] = useState("");
  const [newShowType, setNewShowType] = useState("artist-show");
  const [newShowMood, setNewShowMood] = useState("late-night");
  const [newShowAudience, setNewShowAudience] = useState("fans of premieres and discovery");
  const [newShowHostMode, setNewShowHostMode] = useState("cinematic");
  const [newShowMusicSource, setNewShowMusicSource] = useState("station-trey-trizzy");
  const [newShowAdPref, setNewShowAdPref] = useState("none");
  const [newShowVisibility, setNewShowVisibility] = useState<"public" | "private" | "unlisted">("public");
  const [newShowScheduleIntent, setNewShowScheduleIntent] = useState("live");

  // Form states for Create Episode
  const [newEpTitle, setNewEpisodeTitle] = useState("");
  const [newEpDesc, setNewEpisodeDesc] = useState("");

  // Script editor states
  const [editingBlock, setEditingBlock] = useState<TradioShowBlock | null>(null);
  const [editingScriptText, setEditingScriptText] = useState("");
  const [generatingScript, setGeneratingScript] = useState(false);

  // Scheduling states
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleTimezone, setScheduleTimezone] = useState("UTC");
  const [scheduleRecurrence, setScheduleRecurrence] = useState("none");

  // Review states
  const [readinessCheck, setReadinessCheck] = useState<{ ready: boolean; warnings: string[] }>({ ready: true, warnings: [] });

  // Load Data
  const loadData = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    try {
      const { data: showsData, error: showsError } = await supabase
        .from("tradio_shows")
        .select("*")
        .order("created_at", { ascending: false });

      if (showsError) throw showsError;
      if (showsData) {
        setShows(showsData);

        // Fetch all episodes
        const { data: epData, error: epError } = await supabase
          .from("tradio_show_episodes")
          .select("*")
          .order("created_at", { ascending: true });

        if (epError) throw epError;
        if (epData) {
          const epMap: Record<string, TradioShowEpisode[]> = {};
          epData.forEach((ep) => {
            if (!epMap[ep.show_id]) epMap[ep.show_id] = [];
            epMap[ep.show_id].push(ep);
          });
          setEpisodes(epMap);
        }
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load show data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Save new show
  const handleSaveShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShowTitle.trim()) {
      toast.error("Show title is required");
      return;
    }

    let userId = "00000000-0000-0000-0000-000000000000";
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) userId = data.user.id;
    }

    const showRecord: Omit<TradioShow, "id" | "created_at" | "updated_at"> = {
      user_id: userId,
      title: newShowTitle,
      description: newShowDesc,
      show_type: newShowType,
      mood: newShowMood,
      target_audience: newShowAudience,
      host_mode: newShowHostMode,
      music_source_pref: newShowMusicSource,
      ad_preference: newShowAdPref,
      visibility: newShowVisibility,
      schedule_intent: newShowScheduleIntent,
      status: "draft",
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("tradio_shows")
          .insert(showRecord)
          .select("*")
          .single();
        if (error) throw error;
        toast.success("Show created in cloud database!");
        setShows([data, ...shows]);
        setCurrentShow(data);
        setSubView("show-detail");
      } catch (e: any) {
        toast.error("Cloud save failed: " + e.message);
      }
    } else {
      const localShow: TradioShow = {
        ...showRecord,
        id: `local-show-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setShows([localShow, ...shows]);
      setCurrentShow(localShow);
      toast.message("Supabase offline: Show saved to memory.");
      setSubView("show-detail");
    }
  };

  // Save Episode
  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShow) return;
    if (!newEpTitle.trim()) {
      toast.error("Episode title is required");
      return;
    }

    let userId = "00000000-0000-0000-0000-000000000000";
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getUser();
      if (data.user) userId = data.user.id;
    }

    const epRecord = {
      show_id: currentShow.id,
      user_id: userId,
      title: newEpTitle,
      description: newEpDesc,
      duration_seconds: 1800, // default 30 min
      status: "draft" as const,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: epData, error: epError } = await supabase
          .from("tradio_show_episodes")
          .insert(epRecord)
          .select("*")
          .single();
        if (epError) throw epError;

        // Auto-generate AI rundown
        const { blocks: rundownBlocks } = await generateShowRundown({
          title: currentShow.title,
          showType: currentShow.show_type,
          mood: currentShow.mood ?? "Chill",
          durationMinutes: 30,
          hostTone: currentShow.host_mode ?? "warm",
          musicSourcePref: currentShow.music_source_pref ?? "Tradio catalog",
          commercialBreaks: currentShow.ad_preference === "commercial" ? 1 : 0,
          includeListenerRequests: true,
          includeProducerSpotlight: true,
          includeArtistPremiere: true,
        });

        // Insert blocks
        const blocksToInsert = rundownBlocks.map((b) => ({
          ...b,
          episode_id: epData.id,
          user_id: userId,
        }));

        const { data: savedBlocks, error: blockError } = await supabase
          .from("tradio_show_blocks")
          .insert(blocksToInsert)
          .select("*")
          .order("sort_order", { ascending: true });

        if (blockError) throw blockError;

        setEpisodes({
          ...episodes,
          [currentShow.id]: [...(episodes[currentShow.id] || []), epData],
        });
        setCurrentEpisode(epData);
        setEpisodeBlocks(savedBlocks || []);
        toast.success("Episode and AI Rundown initialized in database!");
        setSubView("editor");
      } catch (e: any) {
        toast.error("Cloud insert failed: " + e.message);
      }
    } else {
      const epId = `local-ep-${Date.now()}`;
      const localEp: TradioShowEpisode = {
        ...epRecord,
        id: epId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Generate local blocks
      const { blocks: rundownBlocks } = await generateShowRundown({
        title: currentShow.title,
        showType: currentShow.show_type,
        mood: currentShow.mood ?? "Chill",
        durationMinutes: 30,
        hostTone: currentShow.host_mode ?? "warm",
        musicSourcePref: currentShow.music_source_pref ?? "Tradio catalog",
        commercialBreaks: currentShow.ad_preference === "commercial" ? 1 : 0,
        includeListenerRequests: true,
        includeProducerSpotlight: true,
        includeArtistPremiere: true,
      });

      const blocksToInsert: TradioShowBlock[] = rundownBlocks.map((b, i) => ({
        id: `local-block-${i}-${Date.now()}`,
        episode_id: epId,
        user_id: userId,
        block_type: b.block_type ?? "voiceover",
        title: b.title ?? "Untitled Segment",
        description: b.description ?? "",
        script_text: b.script_text ?? "",
        start_time_seconds: b.start_time_seconds ?? 0,
        duration_seconds: b.duration_seconds ?? 120,
        sort_order: i,
        volume_level: 1.0,
        fade_in_seconds: 1.0,
        fade_out_seconds: 1.0,
        approval_status: b.approval_status ?? "approved",
        clearance_status: b.clearance_status ?? "cleared",
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      setEpisodes({
        ...episodes,
        [currentShow.id]: [...(episodes[currentShow.id] || []), localEp],
      });
      setCurrentEpisode(localEp);
      setEpisodeBlocks(blocksToInsert);
      toast.message("Supabase offline: Local episode timeline built!");
      setSubView("editor");
    }
  };

  // Reorder Block
  const handleMoveBlock = async (index: number, direction: "up" | "down") => {
    const blocks = [...episodeBlocks];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= blocks.length) return;

    // Swap sort orders
    const temp = blocks[index].sort_order;
    blocks[index].sort_order = blocks[targetIdx].sort_order;
    blocks[targetIdx].sort_order = temp;

    // Swap in array
    const tempObj = blocks[index];
    blocks[index] = blocks[targetIdx];
    blocks[targetIdx] = tempObj;

    setEpisodeBlocks(blocks);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("tradio_show_blocks").upsert([
          { id: blocks[index].id, sort_order: blocks[index].sort_order },
          { id: blocks[targetIdx].id, sort_order: blocks[targetIdx].sort_order }
        ]);
        toast.success("Timeline order saved!");
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Delete Block
  const handleDeleteBlock = async (id: string, index: number) => {
    const updated = episodeBlocks.filter((b) => b.id !== id);
    setEpisodeBlocks(updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("tradio_show_blocks").delete().eq("id", id);
        toast.success("Segment removed");
      } catch (e: any) {
        toast.error("Failed to delete segment: " + e.message);
      }
    } else {
      toast.success("Segment removed locally");
    }
  };

  // AI Script Generation
  const handleAIRegenerateScript = async () => {
    if (!editingBlock) return;
    setGeneratingScript(true);
    try {
      const generated = await generateHostScripts({
        blockTitle: editingBlock.title,
        blockType: editingBlock.block_type,
        hostTone: currentShow?.host_mode ?? "cinematic",
        promptNotes: editingBlock.description ?? "",
      });
      setEditingScriptText(generated);
      toast.success("AI script drafted successfully!");
    } catch (e: any) {
      toast.error("AI Generation failed: " + e.message);
    } finally {
      setGeneratingScript(false);
    }
  };

  // Save Script edits
  const handleSaveBlockScript = async () => {
    if (!editingBlock) return;

    const updatedBlocks = episodeBlocks.map((b) => {
      if (b.id === editingBlock.id) {
        return { ...b, script_text: editingScriptText };
      }
      return b;
    });
    setEpisodeBlocks(updatedBlocks);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("tradio_show_blocks")
          .update({ script_text: editingScriptText })
          .eq("id", editingBlock.id);
        toast.success("Script saved to database!");
      } catch (e: any) {
        toast.error("Failed to save script: " + e.message);
      }
    } else {
      toast.success("Script saved locally!");
    }
    setEditingBlock(null);
  };

  // Check show readiness
  const triggerReadinessCheck = async () => {
    if (!currentEpisode) return;
    const validation = await validateShowReadiness(currentEpisode.id, episodeBlocks);
    setReadinessCheck(validation);
  };

  useEffect(() => {
    if (currentEpisode) {
      triggerReadinessCheck();
    }
  }, [episodeBlocks, currentEpisode]);

  // Publish / Schedule
  const handlePublishEpisode = async (statusToSet: "published" | "scheduled") => {
    if (!currentEpisode) return;

    // Check readiness first
    if (!readinessCheck.ready) {
      toast.error("Cannot publish. Please resolve all timeline checklist errors first.");
      return;
    }

    const updatedEpisode = { ...currentEpisode, status: statusToSet };
    setCurrentEpisode(updatedEpisode);

    // Update in list
    if (currentShow) {
      const showEps = episodes[currentShow.id] || [];
      const updatedEps = showEps.map((e) => (e.id === currentEpisode.id ? updatedEpisode : e));
      setEpisodes({ ...episodes, [currentShow.id]: updatedEps });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("tradio_show_episodes")
          .update({ status: statusToSet })
          .eq("id", currentEpisode.id);

        if (statusToSet === "scheduled" && scheduleStartTime) {
          await supabase.from("tradio_broadcast_slots").insert({
            show_id: currentShow?.id,
            episode_id: currentEpisode.id,
            start_time: scheduleStartTime,
            timezone: scheduleTimezone,
            recurrence: scheduleRecurrence,
            status: "scheduled",
          });
        }
        toast.success(`Episode successfully ${statusToSet === "published" ? "Published Live" : "Scheduled"}!`);
      } catch (e: any) {
        toast.error("Failed to update status: " + e.message);
      }
    } else {
      toast.success(`Supabase offline: Episode mock ${statusToSet === "published" ? "Published" : "Scheduled"}!`);
    }
  };

  return (
    <AccessGate
      capability="create-broadcast"
      title="Broadcast access required"
      message="Apply for Broadcast Access or switch to a cleared Artist, Producer, DJ, or Admin mode to build premium Tradio shows."
      ctaType="broadcast"
    >
      <div className="space-y-6 pb-12">
        <TopBar
          title="Tradio Broadcast Control Room"
          showBack
          onBack={() => {
            if (subView === "dashboard") onBack();
            else if (subView === "create-show") setSubView("dashboard");
            else if (subView === "show-detail") setSubView("dashboard");
            else if (subView === "create-episode") setSubView("show-detail");
            else if (subView === "editor") setSubView("show-detail");
          }}
        />

        {/* LOADING INDICATOR */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-t-purple-400 border-purple-400/20" />
          </div>
        )}

        {!loading && (
          <div className="px-4 sm:px-6 lg:px-10">
            {/* 1. DASHBOARD VIEW */}
            {subView === "dashboard" && (
              <div className="space-y-8 animate-fade-in">
                {/* Dashboard Hero */}
                <GlassCard
                  glow
                  className="relative rounded-[2.5rem] border-[0.5px] border-purple-500/15 bg-gradient-to-br from-[#120724] via-[#04020a] to-black p-8 overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 right-0 h-64 w-64 bg-purple-500/10 blur-[100px] pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-purple-400/40 bg-purple-500/15 px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-purple-300 mb-3 font-mono">
                        <Shield className="h-3 w-3" /> VERIFIED BROADCASTER
                      </span>
                      <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                        Tradio <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">Studio</span>
                      </h1>
                      <p className="mt-2 text-xs md:text-sm text-white/60 max-w-xl">
                        "Your sound is not a post. It is programming." Design, schedule, and live broadcast highly atmospheric radio shows with generative AI.
                      </p>
                    </div>
                    <button
                      onClick={() => setSubView("create-show")}
                      className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white font-black px-6 py-3 text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] whitespace-nowrap"
                    >
                      <Plus className="h-3.5 w-3.5 inline mr-1.5" /> Create Show Lane
                    </button>
                  </div>
                </GlassCard>

                {/* Grid for Show Lanes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-white/40 uppercase tracking-widest font-mono">
                      Your Broadcast Lanes
                    </h3>
                  </div>

                  {shows.length === 0 ? (
                    <GlassCard className="p-8 text-center space-y-3 border-dashed border-white/10">
                      <Mic2 className="h-8 w-8 text-white/20 mx-auto" />
                      <div className="text-sm font-bold text-white/80">No lanes created yet</div>
                      <p className="text-xs text-white/50 max-w-xs mx-auto">
                        Create your first official show lane to start compiling episodes and scheduling broadcasts.
                      </p>
                    </GlassCard>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {shows.map((show) => {
                        const showEps = episodes[show.id] || [];
                        return (
                          <GlassCard
                            key={show.id}
                            className="p-5 flex flex-col justify-between hover:border-purple-500/30 hover:bg-white/[0.01] transition-all group cursor-pointer"
                            onClick={() => {
                              setCurrentShow(show);
                              setSubView("show-detail");
                            }}
                          >
                            <div>
                              <div className="flex items-start justify-between">
                                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-300 font-mono">
                                  {show.show_type.replace(/-/g, " ")}
                                </span>
                                <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest font-mono ${
                                  show.status === "published" ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-300" : "bg-yellow-500/15 border border-yellow-500/20 text-yellow-300"
                                }`}>
                                  {show.status}
                                </span>
                              </div>
                              <h4 className="mt-4 font-black text-white text-lg group-hover:text-purple-300 transition-colors">
                                {show.title}
                              </h4>
                              <p className="mt-1 text-xs text-white/50 line-clamp-2">
                                {show.description || "No description provided."}
                              </p>
                            </div>
                            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono font-bold text-white/40">
                              <span>Mood: <span className="text-purple-300">{show.mood || "Atmospheric"}</span></span>
                              <span className="flex items-center gap-1 text-cyan-300">
                                {showEps.length} EPISODES <ChevronRight className="h-3 w-3" />
                              </span>
                            </div>
                          </GlassCard>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. CREATE SHOW FORM */}
            {subView === "create-show" && (
              <div className="max-w-2xl mx-auto animate-scale-in">
                <GlassCard className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Create Broadcast Lane</h3>
                    <p className="text-xs text-white/55 mt-1 leading-relaxed">
                      Set up your official lane parameters. These constraints guide the AI in drafting timeline structures, moods, and playlist models.
                    </p>
                  </div>

                  <form onSubmit={handleSaveShow} className="space-y-4">
                    <Field label="Show Lane Title">
                      <input
                        className={inputClass}
                        value={newShowTitle}
                        onChange={(e) => setNewShowTitle(e.target.value)}
                        placeholder="e.g. Midnight Waves Radio"
                        required
                      />
                    </Field>

                    <Field label="Audience/Vibe Description">
                      <textarea
                        className={`${inputClass} h-20 resize-none`}
                        value={newShowDesc}
                        onChange={(e) => setNewShowDesc(e.target.value)}
                        placeholder="Describe what listeners should feel..."
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Programming Format">
                        <select
                          className={selectClass}
                          value={newShowType}
                          onChange={(e) => setNewShowType(e.target.value)}
                        >
                          <option value="artist-show">Artist Showcase Lane</option>
                          <option value="dj-mix">DJ Live Set Mix</option>
                          <option value="producer-spotlight">Producer Beat Hour</option>
                          <option value="release-premiere">Release Premiere Drop</option>
                        </select>
                      </Field>

                      <Field label="Co-Pilot Tone">
                        <select
                          className={selectClass}
                          value={newShowHostMode}
                          onChange={(e) => setNewShowHostMode(e.target.value)}
                        >
                          <option value="cinematic">Cinematic & Smooth</option>
                          <option value="hype">Energetic & Hype</option>
                          <option value="cozy">Cozy, Lofi & Intimate</option>
                          <option value="robotic">Sci-fi / Future Synthetic</option>
                        </select>
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Aesthetic Mood">
                        <input
                          className={inputClass}
                          value={newShowMood}
                          onChange={(e) => setNewShowMood(e.target.value)}
                          placeholder="e.g. Late-night, Velvet, Neon"
                        />
                      </Field>

                      <Field label="Target Listeners">
                        <input
                          className={inputClass}
                          value={newShowAudience}
                          onChange={(e) => setNewShowAudience(e.target.value)}
                          placeholder="e.g. lo-fi heads, late sleepers"
                        />
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Catalog Source Preferences">
                        <input
                          className={inputClass}
                          value={newShowMusicSource}
                          onChange={(e) => setNewShowMusicSource(e.target.value)}
                          placeholder="e.g. Creator upload feed + Tradio database"
                        />
                      </Field>

                      <Field label="Ad Slot Strategy">
                        <select
                          className={selectClass}
                          value={newShowAdPref}
                          onChange={(e) => setNewShowAdPref(e.target.value)}
                        >
                          <option value="none">No Ads (Subscribers Only)</option>
                          <option value="commercial">1 Mid-roll Sponsorship Read</option>
                          <option value="heavy">Balanced Sponsors</option>
                        </select>
                      </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Publish Visibility">
                        <select
                          className={selectClass}
                          value={newShowVisibility}
                          onChange={(e) => setNewShowVisibility(e.target.value as any)}
                        >
                          <option value="public">Public (Show on main feeds)</option>
                          <option value="unlisted">Unlisted (Links only)</option>
                          <option value="private">Private (Owners/DJs only)</option>
                        </select>
                      </Field>

                      <Field label="Schedule Intent">
                        <select
                          className={selectClass}
                          value={newShowScheduleIntent}
                          onChange={(e) => setNewShowScheduleIntent(e.target.value)}
                        >
                          <option value="live">Continuous Live Room</option>
                          <option value="scheduled">Weekly Slot Booking</option>
                        </select>
                      </Field>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setSubView("dashboard")}
                        className="rounded-full border border-white/10 hover:bg-white/5 px-6 py-2.5 text-xs font-semibold text-white/80"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:brightness-110 shadow-lg"
                      >
                        Create Lane
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            )}

            {/* 3. SHOW DETAIL PAGE */}
            {subView === "show-detail" && currentShow && (
              <div className="space-y-6 animate-scale-in">
                {/* Show Header */}
                <GlassCard className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 border-purple-500/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-purple-300 font-mono">
                        {currentShow.show_type.replace(/-/g, " ")}
                      </span>
                      <Chip label={`Mood: ${currentShow.mood || "Atmospheric"}`} />
                    </div>
                    <h2 className="mt-3 text-3xl font-black text-white">{currentShow.title}</h2>
                    <p className="mt-1 text-xs text-white/60 max-w-xl">{currentShow.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewEpisodeTitle("");
                      setNewEpisodeDesc("");
                      setSubView("create-episode");
                    }}
                    className="rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-600 to-cyan-400 text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-md whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4 inline mr-1" /> New Episode
                  </button>
                </GlassCard>

                {/* Episodes list */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-white/45 uppercase tracking-widest font-mono">
                    Show Episodes
                  </h3>

                  {(episodes[currentShow.id] || []).length === 0 ? (
                    <GlassCard className="p-8 text-center border-dashed border-white/10 space-y-3">
                      <Disc className="h-8 w-8 text-white/20 mx-auto" />
                      <div className="text-sm font-bold text-white/80">No episodes created yet</div>
                      <p className="text-xs text-white/50 max-w-xs mx-auto">
                        Ready to make radio history? Click "New Episode" to start building your ordered timeline.
                      </p>
                    </GlassCard>
                  ) : (
                    <div className="grid gap-3">
                      {(episodes[currentShow.id] || []).map((ep) => (
                        <GlassCard
                          key={ep.id}
                          className="p-4 flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">{ep.title}</span>
                              <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest font-mono ${
                                ep.status === "published" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" :
                                ep.status === "scheduled" ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300" :
                                "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                              }`}>
                                {ep.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 mt-1 max-w-xl truncate">{ep.description}</p>
                            <div className="text-[9px] font-mono font-bold text-white/30 mt-2 flex items-center gap-3">
                              <span>DURATION: {Math.round(ep.duration_seconds / 60)} MINS</span>
                              <span>CREATED: {new Date(ep.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              setCurrentEpisode(ep);
                              setLoading(true);
                              try {
                                if (isSupabaseConfigured && supabase) {
                                  const { data, error } = await supabase
                                    .from("tradio_show_blocks")
                                    .select("*")
                                    .eq("episode_id", ep.id)
                                    .order("sort_order", { ascending: true });
                                  if (error) throw error;
                                  setEpisodeBlocks(data || []);
                                }
                                setSubView("editor");
                              } catch (e: any) {
                                toast.error("Timeline loading failed: " + e.message);
                              } finally {
                                setLoading(false);
                              }
                            }}
                            className="rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/10 transition-colors"
                          >
                            Open Console
                          </button>
                        </GlassCard>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. CREATE EPISODE FLOW */}
            {subView === "create-episode" && currentShow && (
              <div className="max-w-xl mx-auto animate-scale-in">
                <GlassCard className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Create New Episode</h3>
                    <p className="text-xs text-white/55 mt-1">
                      Under Show Lane: <span className="text-purple-300 font-bold">{currentShow.title}</span>
                    </p>
                  </div>

                  <form onSubmit={handleSaveEpisode} className="space-y-4">
                    <Field label="Episode Title">
                      <input
                        className={inputClass}
                        value={newEpTitle}
                        onChange={(e) => setNewEpisodeTitle(e.target.value)}
                        placeholder="e.g. Episode 4: Late Night Deep Dives"
                        required
                      />
                    </Field>

                    <Field label="Episode Description / Concept">
                      <textarea
                        className={`${inputClass} h-24 resize-none`}
                        value={newEpDesc}
                        onChange={(e) => setNewEpisodeDesc(e.target.value)}
                        placeholder="Brief summary of what this episode covers..."
                      />
                    </Field>

                    <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-purple-300 shrink-0 mt-0.5 animate-pulse" />
                      <div className="text-xs leading-relaxed text-purple-200">
                        <span className="font-bold">AI Timeline Initialization:</span> Once created, Tradio's backend co-pilot will automatically construct a customized 30-minute block timeline matching your lane formats.
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setSubView("show-detail")}
                        className="rounded-full border border-white/10 hover:bg-white/5 px-6 py-2.5 text-xs font-semibold text-white/80"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-full bg-gradient-to-r from-fuchsia-500 via-purple-600 to-cyan-500 text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:brightness-110 shadow-lg"
                      >
                        Build Episode
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            )}

            {/* 5. INTEGRATED EPISODE TIMELINE / BLOCKS EDITOR */}
            {subView === "editor" && currentEpisode && currentShow && (
              <div className="space-y-8 animate-fade-in">
                {/* Breadcrumb info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-3xl">
                  <div>
                    <div className="text-[10px] text-white/40 uppercase tracking-widest font-mono">
                      Broadcast Studio Lane • {currentShow.title}
                    </div>
                    <h3 className="text-xl font-black text-white mt-1">{currentEpisode.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/50 bg-white/5 px-2.5 py-1 rounded-full font-mono">
                      DURATION: {Math.round(episodeBlocks.reduce((acc, b) => acc + b.duration_seconds, 0) / 60)} MINS
                    </span>
                    <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full font-mono font-bold uppercase">
                      STATUS: {currentEpisode.status}
                    </span>
                  </div>
                </div>

                {/* Sub-panels Grid */}
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                  {/* Left: Ordered Timeline Blocks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-white/45 uppercase tracking-widest font-mono">
                        Episode Timeline blocks
                      </h4>
                    </div>

                    <div className="space-y-3">
                      {episodeBlocks.map((block, index) => {
                        const isSelected = editingBlock?.id === block.id;
                        return (
                          <GlassCard
                            key={block.id}
                            className={`p-4 border-[0.5px] transition-all relative ${
                              isSelected ? "border-purple-400/40 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3.5">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-purple-300">
                                  {block.block_type === "intro" ? <Mic2 className="h-5 w-5" /> :
                                   block.block_type === "song" ? <Music className="h-5 w-5" /> :
                                   block.block_type === "ad" ? <Megaphone className="h-5 w-5" /> :
                                   block.block_type === "producer_spotlight" ? <Sparkles className="h-5 w-5" /> :
                                   <Radio className="h-5 w-5" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">{block.title}</span>
                                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/40 font-mono">
                                      {block.block_type.replace(/_/g, " ")}
                                    </span>
                                    {block.block_type === "song" && (
                                      <span className={`rounded-full px-1.5 py-0.5 text-[7px] font-mono font-bold uppercase tracking-wider ${
                                        block.clearance_status === "cleared" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300" : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                                      }`}>
                                        {block.clearance_status}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-white/55 mt-1 leading-relaxed">{block.description || "No notes."}</p>
                                  {block.script_text && (
                                    <div className="text-[11px] font-mono text-cyan-300 italic bg-cyan-950/10 border-l border-cyan-400/30 pl-2 py-1 mt-2.5 max-w-lg line-clamp-2">
                                      "{block.script_text}"
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1.5 self-center shrink-0">
                                <button
                                  onClick={() => handleMoveBlock(index, "up")}
                                  disabled={index === 0}
                                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-white/45 hover:text-white hover:bg-white/5 disabled:opacity-20"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleMoveBlock(index, "down")}
                                  disabled={index === episodeBlocks.length - 1}
                                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-white/45 hover:text-white hover:bg-white/5 disabled:opacity-20"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingBlock(block);
                                    setEditingScriptText(block.script_text || "");
                                  }}
                                  className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-300 hover:bg-purple-500/10"
                                >
                                  Edit script
                                </button>
                                <button
                                  onClick={() => handleDeleteBlock(block.id, index)}
                                  className="h-8 w-8 flex items-center justify-center rounded-lg border border-red-500/10 bg-red-500/5 text-red-400/65 hover:text-red-400 hover:bg-red-500/10"
                                  title="Remove Block"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-4 text-[9px] font-mono text-white/35 font-semibold">
                              <span>START: {Math.round(block.start_time_seconds / 60)} MINS</span>
                              <span>DURATION: {block.duration_seconds} SECS</span>
                              <span>VOLUME: {Math.round(block.volume_level * 100)}%</span>
                            </div>
                          </GlassCard>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Panel: Host Script, Drops, Ads, Schedule & Review */}
                  <div className="space-y-6">
                    {/* Block Script Editor Panel */}
                    {editingBlock && (
                      <GlassCard className="p-5 border-purple-500/20 bg-gradient-to-b from-[#1b092a] to-transparent space-y-4 animate-scale-in">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                            <Mic2 className="h-4 w-4 text-purple-300" /> Host Script teleprompter
                          </h4>
                          <button onClick={() => setEditingBlock(null)} className="text-white/40 hover:text-white">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-[10px] text-white/50">
                          Editing Script for: <span className="text-purple-300 font-bold">{editingBlock.title}</span>
                        </div>

                        <textarea
                          className={`${inputClass} h-32 resize-none text-xs leading-relaxed font-mono text-cyan-300`}
                          value={editingScriptText}
                          onChange={(e) => setEditingScriptText(e.target.value)}
                          placeholder="Write the teleprompter/script content for this segment..."
                        />

                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            onClick={handleAIRegenerateScript}
                            disabled={generatingScript}
                            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1 disabled:opacity-40"
                          >
                            <Sparkles className="h-3 w-3 animate-pulse" /> {generatingScript ? "Generative AI..." : "Regenerate Script with AI"}
                          </button>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => setEditingBlock(null)}
                              className="rounded-xl border border-white/10 px-3 py-1.5 text-[10px] font-semibold text-white/60"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveBlockScript}
                              className="rounded-xl bg-purple-500 hover:bg-purple-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-white"
                            >
                              Save Script
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    )}

                    {/* Station Drops area */}
                    <GlassCard className="p-4 space-y-3">
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Disc className="h-4 w-4 text-purple-300 animate-spin" style={{ animationDuration: "5s" }} /> STATION DROPS & SFX
                      </h4>
                      <div className="space-y-2">
                        {stationDrops.map((drop) => (
                          <div key={drop.id} className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between text-xs hover:border-white/10 transition-colors">
                            <span className="font-bold text-white/80 truncate">{drop.title}</span>
                            <button
                              onClick={() => {
                                toast.success(`Playing preview for "${drop.title}" 🔊`);
                              }}
                              className="p-1 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/25"
                              title="Play preview sfx"
                            >
                              <Play className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Ad read manager */}
                    <GlassCard className="p-4 space-y-3">
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Megaphone className="h-4 w-4 text-cyan-300" /> SPONSOR AD SLOTS
                      </h4>
                      <p className="text-[10px] text-white/55 leading-relaxed">
                        Insert sponsor reads into your ad blocks. Select filled provider models.
                      </p>
                      <button
                        onClick={async () => {
                          const adReadText = await generateAdRead({
                            adProvider: "Trey TV Luxury Watches",
                            durationSeconds: 30,
                            tone: currentShow.host_mode ?? "cinematic",
                          });
                          toast.message("AI Ad Read draft saved to clipboard!", { description: adReadText });
                        }}
                        className="w-full text-center py-2 rounded-xl border border-dashed border-cyan-400/20 bg-cyan-500/5 text-[10px] font-black uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/10"
                      >
                        Generate 30s Sponsor Read Script
                      </button>
                    </GlassCard>

                    {/* Readiness Checklist / Review Panel */}
                    <GlassCard className="p-5 space-y-4">
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono">
                        Episode Readiness Checklist
                      </h4>

                      <div className="space-y-2">
                        {readinessCheck.ready ? (
                          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-xs flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Clear for Broadcast:</span> Everything matches scheduling constraints. Music clearances are confirmed.
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-300 text-xs flex items-start gap-2">
                            <BadgeAlert className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Checks Flagged:</span> Please review the warning signals before publishing.
                            </div>
                          </div>
                        )}

                        {readinessCheck.warnings.map((warn, i) => (
                          <div key={i} className="text-[10px] text-white/60 bg-white/[0.01] p-2 rounded-lg border border-white/5 flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />
                            <span>{warn}</span>
                          </div>
                        ))}
                      </div>

                      {/* Schedule Panel and Trigger */}
                      <div className="pt-3 border-t border-white/5 space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/45 font-mono">
                          Schedule Intent
                        </div>
                        <div className="grid gap-2 text-xs">
                          <input
                            type="datetime-local"
                            className={inputClass}
                            value={scheduleStartTime}
                            onChange={(e) => setScheduleStartTime(e.target.value)}
                            title="Schedule Time"
                          />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 flex flex-col gap-2">
                        <button
                          onClick={() => handlePublishEpisode("published")}
                          disabled={!readinessCheck.ready}
                          className="w-full text-center py-2.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-40 shadow-md"
                        >
                          Publish Now (Live Feed)
                        </button>
                        <button
                          onClick={() => handlePublishEpisode("scheduled")}
                          disabled={!readinessCheck.ready || !scheduleStartTime}
                          className="w-full text-center py-2.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-black uppercase tracking-widest disabled:opacity-40"
                        >
                          Schedule Slot
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AccessGate>
  );
};

export default BroadcastStudioGateway;
