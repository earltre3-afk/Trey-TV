import React, { useState, useEffect, useMemo } from "react";
import { usePlayer } from "../../../contexts/PlayerContext";
import { CreatorArchiveDashboard } from "./CreatorArchiveDashboard";
import { AdminClipReviewDashboard } from "./AdminClipReviewDashboard";
import { AdminPostShowReviewDashboard } from "./AdminPostShowReviewDashboard";
import { PublicReplayLibrary } from "./PublicReplayLibrary";
import { PostShowProducerDashboard } from "./PostShowProducerDashboard";
import { DistributionDeskDashboard } from "./DistributionDeskDashboard";
import { useTradioIdentity } from "../auth/useTradioIdentity";
import {
  Radio,
  Sparkles,
  ChevronRight,
  Lock,
  CheckCircle,
  Send,
  User,
  Shield,
  Users,
  Music,
  Mic2,
  Disc,
  Calendar,
  Flame,
  UploadCloud,
  Layers,
  AlertCircle,
  Megaphone,
  Play,
  RotateCcw,
  Check,
  Plus,
  Globe,
  Settings,
  X,
  Trash2,
  ArrowUp,
  ArrowDown,
  Volume2,
  Pause,
  Clock,
  Tag,
  ShieldCheck,
  Eye,
  BadgeAlert,
  Heart,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { TopBar, GlassCard, PrimaryButton, SecondaryButton, Chip, Waveform } from "../ui";
import { ACTIVE_USER, IMG, ALL_STATIONS } from "../data";
import { AccessGate } from "../auth/components";
import { canAdminPlatform } from "../auth/roleUtils";
import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { toast } from "sonner";
import {
  TradioShow,
  TradioShowEpisode,
  TradioShowBlock,
  TradioBroadcastSlot,
  TradioAdSlot,
  TradioMusicSubmission,
  TradioShowAnalytics,
} from "../types/broadcast";
import {
  generateShowRundown,
  generateHostScripts,
  generateStationDrop,
  generateAdRead,
  suggestMusicBlocks,
  validateShowReadiness,
  renderVoiceWithProvider,
  generateTransitionScript,
  generateArtistSpotlight,
  generateProducerSpotlight,
  generateEpisodeOutro,
  saveGeneratedRundownToBlocks,
  saveGeneratedScriptRevision,
  validateEpisodeDraft,
} from "../services/broadcastService";
import {
  listAvailableVoices,
  estimateVoiceRenderCost,
  VOICE_STYLE_MODES,
} from "../services/broadcastVoiceProvider";
import {
  renderVoiceForBlock,
  listVoiceRendersForBlock,
  attachVoiceRenderToBlock,
  renderStationDropVoice,
  renderAdReadVoice,
  listStationDrops,
} from "../services/broadcastVoiceService";
import {
  generateEpisodeAssemblyPreview,
  listEpisodeAssembliesForEpisode,
  validateTimeline,
  markAssemblyReadyForReview,
} from "../services/broadcastAssemblyService";
import {
  TradioBroadcastChannel,
  TradioBroadcastQueueItem,
  TradioBroadcastReview,
  ChannelNowPlaying,
  ChannelType,
  ChannelVisibility,
  ChannelStatus,
} from "../types/broadcastPlayoutTypes";
import {
  createBroadcastChannel,
  updateBroadcastChannel,
  listMyBroadcastChannels,
  listPublicBroadcastChannels,
  getBroadcastChannelBySlug,
  submitAssemblyForBroadcastReview,
  approveBroadcastReview,
  rejectBroadcastReview,
  requestBroadcastChanges,
  addAssemblyToBroadcastQueue,
  updateBroadcastQueueItem,
  removeBroadcastQueueItem,
  reorderBroadcastQueue,
  getNowPlayingForChannel,
  getUpcomingBroadcastsForChannel,
  getPublicPlaybackUrlForQueueItem,
  listPendingReviews,
} from "../services/broadcastPlayoutService";
import { getChannelStreamDetails, STREAM_PROVIDERS } from "../services/broadcastStreamProvider";
import {
  followChannel,
  unfollowChannel,
  getMyChannelFollowStatus,
  createBroadcastReaction,
  listRecentBroadcastReactions,
  getReplayEligibleBroadcasts,
} from "../services/broadcastListenerService";
import {
  getCreatorChannelAnalytics,
  getChannelPulseSummary,
  rollupDailyChannelAnalytics,
} from "../services/broadcastAnalyticsService";
import { startChannelTracking } from "../services/broadcastPublicChannelService";
import {
  ReactionType,
  ChannelPulseSummary,
  TradioBroadcastReaction,
} from "../types/broadcastListenerTypes";
import {
  TradioLiveRoom,
  TradioLiveChatMessage,
  TradioLivePoll,
  TradioLivePollOption,
  LiveRoomPulseSummary,
} from "../types/broadcastLiveRoomTypes";
import {
  getOrCreateLiveRoomForChannel,
  listLiveRoomMessages,
  sendLiveRoomMessage,
  pinLiveRoomMessage,
  highlightLiveRoomMessage,
  reportLiveRoomMessage,
} from "../services/broadcastLiveRoomService";
import {
  createLivePoll,
  closeLivePoll,
  listActivePollsForRoom,
  voteInLivePoll,
} from "../services/broadcastPollService";
import {
  listModerationReports,
  hideLiveRoomMessage,
  removeLiveRoomMessage,
  resolveLiveRoomPulseSummary,
} from "../services/broadcastModerationService";
import { subscribeToLiveRoomEvents } from "../services/broadcastLiveRoomRealtime";

import {
  TradioLiveMicSession,
  TradioLiveMicParticipant,
  TradioLiveCallRequest,
  TradioLiveSfxDrop,
  LiveMicMode,
  BackgroundAudioMode,
} from "../types/broadcastLiveMicTypes";
import {
  getOrCreateLiveMicSession,
  startLiveMicSession,
  endLiveMicSession,
  generateHostAudioToken,
  generateParticipantAudioToken,
  submitCallInRequest,
  approveCallRequest,
  rejectCallRequest,
  muteParticipant,
  unmuteParticipant,
  removeParticipant,
  listLiveParticipants,
  listCallRequests,
  logMicSessionEvent,
} from "../services/broadcastLiveMicService";
import { subscribeToLiveMicEvents } from "../services/broadcastLiveMicRealtime";
import { triggerSfxDrop, listSfxDrops } from "../services/broadcastSfxService";
import { getAudioProvider, AudioParticipant } from "../services/broadcastLiveAudioProvider";

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
    <div className="relative">{children}</div>
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
  },
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
    },
  ],
};

export const BroadcastStudioGateway: React.FC<{ onBack: () => void; initialTab?: string }> = ({
  onBack,
  initialTab,
}) => {
  const player = usePlayer();
  const { identity } = useTradioIdentity();
  const currentUserId = identity?.user_id || '';
  const isIdentityAdmin = canAdminPlatform(identity);

  // Helper: Play Channel stream/file live
  const handlePlayChannel = async (channel: TradioBroadcastChannel) => {
    try {
      const nowPlaying = await getNowPlayingForChannel(channel.slug);
      if (nowPlaying && nowPlaying.streamUrl) {
        player.play({
          id: channel.id,
          title: nowPlaying.episodeTitle || "Live Stream",
          artist: nowPlaying.showTitle || channel.title,
          src: nowPlaying.streamUrl,
          isLive: true,
          coverUrl: channel.cover_art_url || IMG.treyTrizzy,
          sourceType: "station",
          sourceLabel: "Broadcast Playout",
        });
        toast.success(`Broadcasting ${channel.title} live! 🎙️📻`);

        // Start listening session tracking!
        await startChannelTracking(
          channel.id,
          "live",
          nowPlaying.queueItem?.id || null,
          null,
          nowPlaying.queueItem?.episode_id || null,
          nowPlaying.queueItem?.assembly_id || null,
        );
      } else {
        toast.error(
          "No active playout audio found for this channel. Schedule an approved episode first!",
        );
      }
    } catch (e: any) {
      toast.error("Failed to start channel playout: " + e.message);
    }
  };

  const handlePlayReplay = async (replay: any, channel: TradioBroadcastChannel) => {
    try {
      let playbackUrl = null;
      if (replay.assembly_id) {
        playbackUrl = await getPublicPlaybackUrlForQueueItem(replay.id);
      }
      if (!playbackUrl) playbackUrl = replay.episode?.media_url;

      if (playbackUrl) {
        player.play({
          id: replay.id,
          title: replay.episode?.title || "Replay Broadcast",
          artist: replay.show?.title || channel.title,
          src: playbackUrl,
          isLive: false,
          coverUrl: replay.episode?.cover_art || channel.cover_art_url || IMG.treyTrizzy,
          sourceType: "station",
          sourceLabel: "Replay Broadcast",
        });
        toast.success(`Playing replay: ${replay.episode?.title}! 🔊📻`);

        // Start listening session tracking in replay mode
        await startChannelTracking(
          channel.id,
          "replay",
          replay.id,
          null,
          replay.episode_id,
          replay.assembly_id,
        );
      } else {
        toast.error("Replay playback audio is currently unavailable.");
      }
    } catch (e: any) {
      toast.error("Failed to play replay: " + e.message);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelTitle.trim() || !newChannelSlug.trim()) {
      toast.error("Title and slug are required.");
      return;
    }
    try {
      setLoading(true);
      await createBroadcastChannel({
        title: newChannelTitle,
        slug: newChannelSlug,
        description: newChannelDesc,
        channel_type: newChannelType,
        visibility: newChannelVisibility,
        cover_art_url: newChannelCover || undefined,
        mood_tags: newChannelMoods ? newChannelMoods.split(",").map((t) => t.trim()) : [],
        genre_tags: newChannelGenres ? newChannelGenres.split(",").map((t) => t.trim()) : [],
        audience_tags: newChannelAudience ? newChannelAudience.split(",").map((t) => t.trim()) : [],
      });
      toast.success("Broadcast Channel created successfully! 📻");
      // Reset Form
      setNewChannelTitle("");
      setNewChannelSlug("");
      setNewChannelDesc("");
      setNewChannelCover("");
      setNewChannelMoods("");
      setNewChannelGenres("");
      setNewChannelAudience("");

      // Reload channels
      const myChans = await listMyBroadcastChannels();
      setChannels(myChans);
      setSubView("dashboard");
      setActiveTab("channels");
    } catch (e: any) {
      toast.error("Failed to create channel: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleChannelId || !scheduleStart || !scheduleEnd) {
      toast.error("Please fill in all scheduling fields.");
      return;
    }
    if (!currentShow || !currentEpisode || assemblyHistory.length === 0) {
      toast.error("No valid assembly exists for this episode.");
      return;
    }
    try {
      setLoading(true);
      const latestAssembly = assemblyHistory[0];
      await addAssemblyToBroadcastQueue(
        scheduleChannelId,
        currentShow.id,
        currentEpisode.id,
        latestAssembly.id,
        new Date(scheduleStart).toISOString(),
        new Date(scheduleEnd).toISOString(),
        "America/Chicago",
        scheduleIsLive,
        scheduleIsReplay,
      );
      toast.success("Broadcast successfully scheduled! 📅📻");
      setShowScheduleModal(false);

      // Refresh selected channel info if in channel detail view
      if (selectedChannel && selectedChannel.id === scheduleChannelId) {
        const q = await getUpcomingBroadcastsForChannel(selectedChannel.id);
        setUpcomingBroadcasts(q);
      }
    } catch (e: any) {
      toast.error("Failed to schedule broadcast: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelClick = async (channel: TradioBroadcastChannel) => {
    setSelectedChannel(channel);
    setSubView("channel-detail");
    try {
      setLoading(true);
      const q = await getUpcomingBroadcastsForChannel(channel.id);
      setUpcomingBroadcasts(q);

      const nowPlaying = await getNowPlayingForChannel(channel.slug);
      setActiveNowPlaying(nowPlaying);

      // Load Pass 6 states
      const follow = await getMyChannelFollowStatus(channel.id);
      setIsFollowing(!!follow);

      const summary = await getChannelPulseSummary(channel.id);
      setPulseSummary(summary);

      const reactionsList = await listRecentBroadcastReactions(channel.id);
      setRecentReactions(reactionsList);

      const replays = await getReplayEligibleBroadcasts(channel.id);
      setReplayBroadcasts(replays);

      const trends = await getCreatorChannelAnalytics(channel.id);
      setAnalyticsDaily(trends);

      // Resolve Live Room Pass 7
      try {
        const room = await getOrCreateLiveRoomForChannel(
          channel.id,
          nowPlaying?.queueItem?.id || null,
          nowPlaying?.queueItem?.show_id || null,
          nowPlaying?.queueItem?.episode_id || null
        );
        setLiveRoom(room);

        const msgs = await listLiveRoomMessages(room.id);
        setChatMessages(msgs);

        const polls = await listActivePollsForRoom(room.id);
        setActivePolls(polls);

        const pulseSum = await resolveLiveRoomPulseSummary(channel.id, room.id);
        setRoomPulse(pulseSum);

        let isOwnerOrAdmin = false;
        if (isSupabaseConfigured && supabase) {
          const { data: userSess } = await supabase.auth.getUser();
          const userId = userSess?.user?.id;
          isOwnerOrAdmin = channel.owner_user_id === userId || role === "admin";
        }
        if (isOwnerOrAdmin) {
          const reps = await listModerationReports(room.id);
          setModerationReports(reps);
        }
      } catch (err: any) {
        console.error("Live room initialization failed:", err);
      }
    } catch (e: any) {
      toast.error("Failed to load channel details: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !liveRoom || !selectedChannel) return;

    const now = Date.now();
    const slowModeSec = liveRoom.slow_mode_seconds || 5;
    if (now - lastSentTime < slowModeSec * 1000) {
      toast.error(`Slow mode active. Please wait ${slowModeSec}s between messages.`);
      return;
    }

    if (chatInput.length > 240) {
      toast.error("Message exceeds maximum limit of 240 characters.");
      return;
    }

    try {
      const isOwner = selectedChannel.owner_user_id === currentUserId;
      const senderRole = isOwner ? "creator" : "listener";
      const msgType = isOwner ? "host_note" : "chat";
      const playbackPos = activeNowPlaying?.timeRemainingSeconds
        ? (activeNowPlaying?.queueItem?.metadata?.duration_seconds || 1800) - activeNowPlaying.timeRemainingSeconds
        : null;

      const newMsg = await sendLiveRoomMessage(
        liveRoom.id,
        selectedChannel.id,
        chatInput,
        senderRole,
        msgType,
        activeNowPlaying?.queueItem?.id || null,
        playbackPos,
        currentUserId ? null : "anon-local-session-id"
      );

      setChatMessages((prev) => [...prev, newMsg]);
      setChatBody("");
      setLastSentTime(now);
    } catch (err: any) {
      toast.error("Send failed: " + err.message);
    }
  };

  const handleVotePoll = async (pollId: string, optionId: string) => {
    if (!liveRoom || !selectedChannel) return;
    try {
      const playbackPos = activeNowPlaying?.timeRemainingSeconds
        ? (activeNowPlaying?.queueItem?.metadata?.duration_seconds || 1800) - activeNowPlaying.timeRemainingSeconds
        : null;

      await voteInLivePoll(
        pollId,
        optionId,
        liveRoom.id,
        selectedChannel.id,
        activeNowPlaying?.queueItem?.id || null,
        playbackPos,
        currentUserId ? null : "anon-local-session-id"
      );
      toast.success("Vote recorded!");

      const polls = await listActivePollsForRoom(liveRoom.id);
      setActivePolls(polls);
    } catch (err: any) {
      toast.error("Vote failed: " + err.message);
    }
  };

  const handleCreatePoll = async () => {
    if (!liveRoom || !selectedChannel || !pollQuestion.trim() || !pollOptionsText.trim()) return;
    try {
      const options = pollOptionsText
        .split("\n")
        .map((opt) => opt.trim())
        .filter((opt) => opt.length > 0);

      if (options.length < 2) {
        toast.error("Please provide at least 2 choices.");
        return;
      }

      const poll = await createLivePoll(
        liveRoom.id,
        selectedChannel.id,
        pollQuestion,
        options,
        pollAllowMultiple,
        pollShowResults,
        activeNowPlaying?.queueItem?.id || null
      );

      setActivePolls((prev) => [poll, ...prev]);
      setPollQuestion("");
      setPollOptionsText("");
      setShowPollModal(false);
      toast.success("Poll launched successfully!");
    } catch (err: any) {
      toast.error("Failed to create poll: " + err.message);
    }
  };

  const handlePinMessage = async (messageId: string | null) => {
    if (!liveRoom) return;
    try {
      await pinLiveRoomMessage(liveRoom.id, messageId);
      toast.success(messageId ? "Message pinned." : "Message unpinned.");

      const msgs = await listLiveRoomMessages(liveRoom.id);
      setChatMessages(msgs);
    } catch (err: any) {
      toast.error("Pin action failed: " + err.message);
    }
  };

  const handleHighlightMessage = async (messageId: string, isHighlighted: boolean) => {
    try {
      await highlightLiveRoomMessage(messageId, isHighlighted);
      toast.success(isHighlighted ? "Message highlighted!" : "Highlight removed.");

      if (liveRoom) {
        const msgs = await listLiveRoomMessages(liveRoom.id);
        setChatMessages(msgs);
      }
    } catch (err: any) {
      toast.error("Highlight action failed: " + err.message);
    }
  };

  const handleHideMessage = async (messageId: string) => {
    try {
      await hideLiveRoomMessage(messageId);
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message hidden from public chat.");
    } catch (err: any) {
      toast.error("Hide failed: " + err.message);
    }
  };

  const handleRemoveMessage = async (messageId: string) => {
    try {
      await removeLiveRoomMessage(messageId);
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message completely removed.");
    } catch (err: any) {
      toast.error("Remove failed: " + err.message);
    }
  };

  const handleReportMessage = async (messageId: string, reportedUserId: string | null, reason: string) => {
    if (!liveRoom) return;
    try {
      await reportLiveRoomMessage(
        liveRoom.id,
        messageId,
        reportedUserId,
        reason,
        currentUserId ? null : "anon-local-session-id"
      );
      setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
      toast.success("Message reported. Hidden for review.");
    } catch (err: any) {
      toast.error("Report failed: " + err.message);
    }
  };

  const handleToggleRoomSetting = async (field: 'chat_enabled' | 'polls_enabled' | 'reactions_enabled', value: boolean) => {
    if (!liveRoom) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("tradio_live_rooms")
          .update({ [field]: value })
          .eq("id", liveRoom.id);

        if (error) throw error;
      }
      setLiveRoom((prev) => (prev ? { ...prev, [field]: value } : null));
      toast.success(`Room settings updated.`);
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  };

  const handleSetSlowMode = async (seconds: number) => {
    if (!liveRoom) return;
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from("tradio_live_rooms")
          .update({ slow_mode_seconds: seconds })
          .eq("id", liveRoom.id);

        if (error) throw error;
      }
      setLiveRoom((prev) => (prev ? { ...prev, slow_mode_seconds: seconds } : null));
      toast.success(`Slow mode set to ${seconds}s.`);
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  };

  const handleToggleFollow = async () => {
    if (!selectedChannel) return;
    try {
      if (isFollowing) {
        await unfollowChannel(selectedChannel.id);
        setIsFollowing(false);
        toast.success("Unfollowed channel.");
      } else {
        await followChannel(selectedChannel.id);
        setIsFollowing(true);
        toast.success("Following channel! 🔔📻");
      }
      const summary = await getChannelPulseSummary(selectedChannel.id);
      setPulseSummary(summary);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSendReaction = async (type: ReactionType) => {
    if (!selectedChannel) return;
    if (reactionSpamCount > 10) {
      toast.error("Whoa! Easy on the dial, tastemaker! Rate-limited client-side. 🏄‍♂️");
      return;
    }
    setReactionSpamCount((prev) => prev + 1);
    setTimeout(() => setReactionSpamCount((prev) => Math.max(0, prev - 1)), 5000);

    try {
      await createBroadcastReaction(
        selectedChannel.id,
        type,
        activeNowPlaying?.queueItem?.id || null,
        true,
      );
      toast.success(`Sent reaction: ${type}! 🔥`);

      const list = await listRecentBroadcastReactions(selectedChannel.id);
      setRecentReactions(list);

      const summary = await getChannelPulseSummary(selectedChannel.id);
      setPulseSummary(summary);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleManualRollup = async () => {
    if (!selectedChannel) return;
    const dateStr = new Date().toISOString().slice(0, 10);
    try {
      setLoading(true);
      await rollupDailyChannelAnalytics(selectedChannel.id, dateStr);
      toast.success("Manual analytical rollup calculated! 📊📈");
      const trends = await getCreatorChannelAnalytics(selectedChannel.id);
      setAnalyticsDaily(trends);
    } catch (e: any) {
      toast.error("Rollup failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };
  const [subView, setSubView] = useState<
    | "dashboard"
    | "create-show"
    | "show-detail"
    | "create-episode"
    | "editor"
    | "timeline-preview"
    | "channel-detail"
    | "create-channel"
    | "archive"
    | "admin-clips"
    | "admin-post-show"
    | "public-library"
    | "post-show"
    | "distribution"
  >("dashboard");

  // Tab state on Dashboard
  const [activeTab, setActiveTab] = useState<"shows" | "channels" | "admin-reviews" | "archive">("shows");

  // Playout States
  const [channels, setChannels] = useState<TradioBroadcastChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<TradioBroadcastChannel | null>(null);
  const [channelQueue, setChannelQueue] = useState<TradioBroadcastQueueItem[]>([]);
  const [upcomingBroadcasts, setUpcomingBroadcasts] = useState<TradioBroadcastQueueItem[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [activeNowPlaying, setActiveNowPlaying] = useState<ChannelNowPlaying | null>(null);
  const [assemblyReview, setAssemblyReview] = useState<TradioBroadcastReview | null>(null);

  // Listener and Analytics States (Pass 6)
  const [isFollowing, setIsFollowing] = useState(false);
  const [pulseSummary, setPulseSummary] = useState<ChannelPulseSummary | null>(null);
  const [recentReactions, setRecentReactions] = useState<TradioBroadcastReaction[]>([]);
  const [replayBroadcasts, setReplayBroadcasts] = useState<any[]>([]);
  const [analyticsDaily, setAnalyticsDaily] = useState<any[]>([]);
  const [reactionSpamCount, setReactionSpamCount] = useState(0);

  // Form states for Create Channel
  const [newChannelTitle, setNewChannelTitle] = useState("");
  const [newChannelSlug, setNewChannelSlug] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");
  const [newChannelType, setNewChannelType] = useState<ChannelType>("radio");
  const [newChannelVisibility, setNewChannelVisibility] = useState<ChannelVisibility>("public");
  const [newChannelCover, setNewChannelCover] = useState("");
  const [newChannelMoods, setNewChannelMoods] = useState("");
  const [newChannelGenres, setNewChannelGenres] = useState("");
  const [newChannelAudience, setNewChannelAudience] = useState("");

  // Scheduling modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleChannelId, setScheduleChannelId] = useState("");
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");
  const [scheduleIsLive, setScheduleIsLive] = useState(false);
  const [scheduleIsReplay, setScheduleIsReplay] = useState(true);

  // Timeline Preview / Assembler states
  const [renderFormat, setRenderFormat] = useState<"mp3" | "wav">("mp3");
  const [targetLoudness, setTargetLoudness] = useState<number>(-16);
  const [crossfadeSec, setCrossfadeSec] = useState<number>(1.5);
  const [normalizeVoice, setNormalizeVoice] = useState<boolean>(true);
  const [includeWatermark, setIncludeWatermark] = useState<boolean>(true);
  const [silenceBetween, setSilenceBetween] = useState<number>(0.5);
  const [useBlockFade, setUseBlockFade] = useState<boolean>(true);
  const [assemblingStatus, setAssemblingStatus] = useState<
    "idle" | "queued" | "assembling" | "completed" | "failed"
  >("idle");
  const [assemblyError, setAssemblyError] = useState<string | null>(null);
  const [assemblyOutputUrl, setAssemblyOutputUrl] = useState<string | null>(null);
  const [assemblyHistory, setAssemblyHistory] = useState<any[]>([]);
  const [timelineValidation, setTimelineValidation] = useState<any>(null);

  const handleGenerateAssembly = async (type: "preview" | "review" | "final_candidate") => {
    if (!currentShow || !currentEpisode) return;
    setAssemblingStatus("assembling");
    setAssemblyError(null);
    setAssemblyOutputUrl(null);
    try {
      const settings = {
        output_format: renderFormat,
        target_loudness_lufs: targetLoudness,
        crossfade_seconds: crossfadeSec,
        normalize_voice_clips: normalizeVoice,
        include_draft_watermark: includeWatermark,
        silence_between_blocks_seconds: silenceBetween,
        use_block_fade_settings: useBlockFade,
      };

      const result = await generateEpisodeAssemblyPreview(
        currentShow.id,
        currentEpisode.id,
        episodeBlocks,
        settings,
        type,
      );

      if (result.assembly_status === "completed" && result.output_audio_url) {
        setAssemblingStatus("completed");
        setAssemblyOutputUrl(result.output_audio_url);
        toast.success("Timeline Assembled Successfully! 🎙️📻");

        // Refresh assembly history
        const history = await listEpisodeAssembliesForEpisode(currentEpisode.id);
        setAssemblyHistory(history);
      } else {
        setAssemblingStatus("failed");
        setAssemblyError(result.render_error || "Unknown assembly rendering failure.");
        toast.error("Assembly failed: " + (result.render_error || "Unknown error"));
      }
    } catch (e: any) {
      setAssemblingStatus("failed");
      setAssemblyError(e.message);
      toast.error("Assembly failed: " + e.message);
    }
  };
  const [loading, setLoading] = useState(false);
  const [role] = useState<string>("artist");

  // Live Room States
  const [liveRoom, setLiveRoom] = useState<TradioLiveRoom | null>(null);
  const [chatMessages, setChatMessages] = useState<TradioLiveChatMessage[]>([]);
  const [chatInput, setChatBody] = useState("");
  const [roomPulse, setRoomPulse] = useState<LiveRoomPulseSummary | null>(null);
  const [activePolls, setActivePolls] = useState<TradioLivePoll[]>([]);
  const [moderationReports, setModerationReports] = useState<any[]>([]);

  // Poll Creation Modal States
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptionsText, setPollOptionsText] = useState("");
  const [pollAllowMultiple, setPollAllowMultiple] = useState(false);
  const [pollShowResults, setPollShowResults] = useState<'always' | 'after_vote' | 'after_close' | 'never'>('after_vote');

  // Rate limiting / slow mode state
  const [lastSentTime, setLastSentTime] = useState<number>(0);

  // Pass 8: Live Mic States
  const [liveMicSession, setLiveMicSession] = useState<TradioLiveMicSession | null>(null);
  const [liveMicParticipants, setLiveMicParticipants] = useState<TradioLiveMicParticipant[]>([]);
  const [liveCallRequests, setLiveCallRequests] = useState<TradioLiveCallRequest[]>([]);
  const [liveSfxDrops, setLiveSfxDrops] = useState<TradioLiveSfxDrop[]>([]);
  const [audioParticipants, setAudioParticipants] = useState<AudioParticipant[]>([]);
  const [isHostSpeaking, setIsHostSpeaking] = useState(false);
  const [micEnabled, setMicEnabled] = useState(false);
  const [sfxEventsLog, setSfxEventsLog] = useState<string[]>([]);
  const [myCallRequest, setMyCallRequest] = useState<TradioLiveCallRequest | null>(null);
  const [callInNote, setCallInNote] = useState("");
  const [isCallInModalOpen, setIsCallInModalOpen] = useState(false);
  const [micMode, setMicMode] = useState<LiveMicMode>("host_only");
  const [bgAudioMode, setBgAudioMode] = useState<BackgroundAudioMode>("duck_on_host");
  const [isConnectingAudio, setIsConnectingAudio] = useState(false);

  useEffect(() => {
    if (!liveRoom) return;

    const sub = subscribeToLiveRoomEvents(liveRoom.id, (event) => {
      switch (event.type) {
        case "message_inserted":
          setChatMessages((prev) => {
            if (prev.some((m) => m.id === event.message.id)) return prev;
            return [...prev, event.message];
          });
          break;
        case "message_updated":
          setChatMessages((prev) =>
            prev
              .map((m) => (m.id === event.message.id ? event.message : m))
              .filter((m) => m.moderation_status === "visible")
          );
          break;
        case "poll_inserted":
          setActivePolls((prev) => [
            event.poll,
            ...prev.filter((p) => p.id !== event.poll.id),
          ]);
          break;
        case "poll_updated":
          setActivePolls((prev) =>
            prev.map((p) => (p.id === event.poll.id ? event.poll : p))
          );
          break;
        case "vote_inserted":
          listActivePollsForRoom(liveRoom.id).then(setActivePolls);
          break;
        case "room_updated":
          setLiveRoom((prev) => (prev ? { ...prev, ...event.room } : prev));
          break;
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, [liveRoom]);

  useEffect(() => {
    if (subView === "dashboard") {
      setLiveRoom(null);
      setChatMessages([]);
      setChatBody("");
      setActivePolls([]);
      setRoomPulse(null);
      setModerationReports([]);
    }
  }, [subView]);

  // Database states
  const [shows, setShows] = useState<TradioShow[]>(MOCK_SHOWS);
  const [episodes, setEpisodes] = useState<Record<string, TradioShowEpisode[]>>(MOCK_EPISODES);
  const [currentShow, setCurrentShow] = useState<TradioShow | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<TradioShowEpisode | null>(null);
  const [episodeBlocks, setEpisodeBlocks] = useState<TradioShowBlock[]>([]);
  const [analytics, setAnalytics] = useState<Record<string, TradioShowAnalytics>>({});
  const [stationDrops, setStationDrops] = useState<any[]>([
    {
      id: "drop-1",
      title: "Trey TV Official Station ID",
      audio_url: "/audio/drops/id1.mp3",
      duration_seconds: 4,
    },
    {
      id: "drop-2",
      title: "Midnight Atmospheric Drop",
      audio_url: "/audio/drops/id2.mp3",
      duration_seconds: 5,
    },
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
  const [newShowVisibility, setNewShowVisibility] = useState<"public" | "private" | "unlisted">(
    "public",
  );
  const [newShowScheduleIntent, setNewShowScheduleIntent] = useState("live");

  // Form states for Create Episode
  const [newEpTitle, setNewEpisodeTitle] = useState("");
  const [newEpDesc, setNewEpisodeDesc] = useState("");

  // Script editor states
  const [editingBlock, setEditingBlock] = useState<TradioShowBlock | null>(null);
  const [editingScriptText, setEditingScriptText] = useState("");
  const [generatingScript, setGeneratingScript] = useState(false);

  // AI Program Director and Script modifiers states
  const [revisions, setRevisions] = useState<Record<string, string[]>>({});

  // Voice Renderer states
  const [selectedVoice, setSelectedVoice] = useState("rachel");
  const [selectedProvider, setSelectedVoiceProvider] = useState<
    "elevenlabs" | "openai" | "gemini" | "internal" | "manual_upload"
  >("elevenlabs");
  const [selectedStyleMode, setSelectedStyleMode] = useState("late-night-smooth");
  const [voicePacing, setVoicePacing] = useState<number>(1.0);
  const [voiceEnergy, setVoiceEnergy] = useState<number>(1.0);
  const [voiceRenderStatus, setVoiceRenderStatus] = useState<
    "idle" | "rendering" | "completed" | "failed"
  >("idle");
  const [voiceRenderError, setVoiceRenderError] = useState<string | null>(null);
  const [voiceRenderHistory, setVoiceRenderHistory] = useState<any[]>([]);
  const [previewingRender, setPreviewingRender] = useState<string | null>(null);

  // Reusable drop state
  const [newDropText, setNewDropText] = useState("");
  const [newDropVoice, setNewDropVoice] = useState("paul");
  const [newDropProvider, setNewDropProvider] = useState<
    "elevenlabs" | "openai" | "gemini" | "internal"
  >("elevenlabs");
  const [renderingDrop, setRenderingDrop] = useState(false);

  // Load block render history when editingBlock changes
  useEffect(() => {
    if (editingBlock) {
      listVoiceRendersForBlock(editingBlock.id).then((history) => {
        setVoiceRenderHistory(history);
      });
      setVoiceRenderStatus("idle");
      setVoiceRenderError(null);
      setPreviewingRender(null);
    } else {
      setVoiceRenderHistory([]);
    }
  }, [editingBlock]);

  // Load custom station drops
  const loadStationDropsList = async () => {
    let userId = "00000000-0000-0000-0000-000000000000";
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) userId = data.user.id;
    }
    const drops = await listStationDrops(userId);
    setStationDrops(drops);
  };

  useEffect(() => {
    loadStationDropsList();
  }, []);

  const handleRenderVoice = async () => {
    if (!editingBlock) return;
    setVoiceRenderStatus("rendering");
    setVoiceRenderError(null);
    try {
      let userId = "00000000-0000-0000-0000-000000000000";
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user) userId = data.user.id;
      }

      const activeVoiceProfile =
        listAvailableVoices(selectedProvider).find((v) => v.id === selectedVoice) ||
        listAvailableVoices(selectedProvider)[0];

      const renderInput = {
        script_text: editingScriptText,
        voice_provider: selectedProvider,
        provider_voice_id: selectedVoice,
        provider_model:
          selectedProvider === "openai"
            ? "tts-1"
            : selectedProvider === "elevenlabs"
              ? "eleven_monolingual_v1"
              : "gemini-2.5-flash-preview-tts",
        voice_name: activeVoiceProfile?.name || selectedVoice,
        style_mode: selectedStyleMode,
        pacing: voicePacing,
        energy: voiceEnergy,
        show_id: currentShow?.id,
        episode_id: currentEpisode?.id,
        block_id: editingBlock.id,
        owner_user_id: userId,
      };

      const result = await renderVoiceForBlock(editingBlock.id, renderInput);

      if (result.render_status === "completed" && result.audio_url) {
        setVoiceRenderStatus("completed");
        setPreviewingRender(result.audio_url);
        toast.success("Voice rendered successfully! Play below. 🎙️🔊");

        // Refresh history
        const history = await listVoiceRendersForBlock(editingBlock.id);
        setVoiceRenderHistory(history);
      } else {
        setVoiceRenderStatus("failed");
        setVoiceRenderError(result.render_error || "Unknown rendering error");
        toast.error("Voice rendering failed: " + (result.render_error || "Unknown error"));
      }
    } catch (e: any) {
      setVoiceRenderStatus("failed");
      setVoiceRenderError(e.message);
      toast.error("Rendering failed: " + e.message);
    }
  };

  const handleAttachVoiceToBlock = async (
    audioUrl: string,
    renderId: string,
    durationSeconds: number,
  ) => {
    if (!editingBlock) return;
    try {
      const success = await attachVoiceRenderToBlock(
        editingBlock.id,
        renderId,
        audioUrl,
        durationSeconds,
      );
      if (success) {
        toast.success("Voice clip attached to block! 🔒🎙️");
        // Update local block media_url & duration
        setEpisodeBlocks((prev) =>
          prev.map((b) =>
            b.id === editingBlock.id
              ? { ...b, media_url: audioUrl, duration_seconds: durationSeconds }
              : b,
          ),
        );
      } else {
        toast.error("Failed to attach voice clip");
      }
    } catch (e: any) {
      toast.error("Attachment failed: " + e.message);
    }
  };

  const handleCreateStationDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDropText.trim()) {
      toast.error("Drop text is required");
      return;
    }
    setRenderingDrop(true);
    try {
      let userId = "00000000-0000-0000-0000-000000000000";
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user) userId = data.user.id;
      }

      const result = await renderStationDropVoice(
        newDropText,
        currentShow?.host_mode || "cinematic",
        newDropVoice,
        newDropProvider,
        userId,
      );

      if (result.render_status === "completed" && result.audio_url) {
        toast.success("Station Drop created and added to library! 🎚️💿");
        setNewDropText("");
        loadStationDropsList();
      } else {
        toast.error("Failed to render station drop: " + (result.render_error || "Unknown error"));
      }
    } catch (e: any) {
      toast.error("Failed to create station drop: " + e.message);
    } finally {
      setRenderingDrop(false);
    }
  };

  const toggleBlockLock = async (id: string) => {
    const updated = episodeBlocks.map((b) => {
      if (b.id === id) {
        const isLocked = !b.metadata?.locked;
        const metadata = { ...b.metadata, locked: isLocked };
        return { ...b, metadata };
      }
      return b;
    });
    setEpisodeBlocks(updated);

    const block = updated.find((b) => b.id === id);
    if (block && isSupabaseConfigured && supabase) {
      try {
        await supabase.from("tradio_show_blocks").update({ metadata: block.metadata }).eq("id", id);
        toast.success(
          block.metadata.locked ? "Block script locked! 🔒" : "Block script unlocked. 🔓",
        );
      } catch (e: any) {
        toast.error("Failed to save block lock state: " + e.message);
      }
    } else {
      toast.success(
        block?.metadata?.locked
          ? "Block script locked locally! 🔒"
          : "Block script unlocked locally. 🔓",
      );
    }
  };

  const handleAIRegenerateScriptWithModifier = async (modifier: string) => {
    if (!editingBlock) return;
    setGeneratingScript(true);
    try {
      const generated = await generateHostScripts({
        blockTitle: editingBlock.title,
        blockType: editingBlock.block_type,
        hostTone: currentShow?.host_mode ?? "cinematic",
        promptNotes: editingBlock.description ?? "",
        styleModifier: modifier,
      });
      setEditingScriptText(generated);
      setRevisions((prev) => {
        const list = prev[editingBlock.id] || [];
        return { ...prev, [editingBlock.id]: [...list, generated] };
      });
      toast.success("AI Script adjusted successfully! ⚡");
    } catch (e: any) {
      toast.error("AI customization failed: " + e.message);
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleRegenerateFullRundown = async () => {
    if (!currentShow || !currentEpisode) return;
    setLoading(true);
    try {
      const { blocks: newBlocks } = await generateShowRundown({
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

      const mergedBlocks: any[] = [];
      const maxLen = Math.max(episodeBlocks.length, newBlocks.length);
      for (let i = 0; i < maxLen; i++) {
        const existing = episodeBlocks[i];
        if (existing && existing.metadata?.locked) {
          mergedBlocks.push(existing);
        } else {
          const fallback = newBlocks.find(
            (nb) => !mergedBlocks.some((mb) => mb.title === nb.title),
          );
          if (fallback) {
            mergedBlocks.push(fallback);
          } else if (newBlocks[i]) {
            mergedBlocks.push(newBlocks[i]);
          }
        }
      }

      const saved = await saveGeneratedRundownToBlocks(
        currentShow.id,
        currentEpisode.id,
        mergedBlocks,
      );
      setEpisodeBlocks(saved);
      toast.success("Rundown regenerated! Locked scripts were preserved. 🔒✨");
    } catch (e: any) {
      toast.error("Regeneration failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Scheduling states
  const [scheduleStartTime, setScheduleStartTime] = useState("");
  const [scheduleTimezone, setScheduleTimezone] = useState("UTC");
  const [scheduleRecurrence, setScheduleRecurrence] = useState("none");

  // Review states
  const [readinessCheck, setReadinessCheck] = useState<{ ready: boolean; warnings: string[] }>({
    ready: true,
    warnings: [],
  });

  // Load Data
  const loadPlayoutData = async () => {
    try {
      const myChannels = await listMyBroadcastChannels();
      setChannels(myChannels);

      const pReviews = await listPendingReviews();
      setPendingReviews(pReviews);
    } catch (e: any) {
      console.warn("Failed to load playout data: ", e.message);
    }
  };

  const loadData = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // offline fallback
      await loadPlayoutData();
      return;
    }
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
      await loadPlayoutData();
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load show data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pass 8: Player Volume Ducking Trigger
  const { volume, setVolume } = usePlayer();
  const [originalVolume, setOriginalVolume] = useState(1.0);

  useEffect(() => {
    if (bgAudioMode === "duck_on_host") {
      if (isHostSpeaking) {
        setOriginalVolume(volume > 0.2 ? volume : 1.0);
        setVolume(0.15); // Duck background volume
      } else {
        setVolume(originalVolume); // Restore original volume
      }
    }
  }, [isHostSpeaking, bgAudioMode, volume, setVolume, originalVolume]);

  // Pass 8: Live Mic Session Initialization & Realtime Sync
  useEffect(() => {
    let sub: { unsubscribe: () => void } | null = null;
    let provider = getAudioProvider("local_dev_stub"); // default or livekit

    async function initLiveMic() {
      if (!liveRoom || !selectedChannel) return;
      try {
        setLoading(true);
        // 1. Resolve or create live mic session
        const session = await getOrCreateLiveMicSession(
          liveRoom.id,
          selectedChannel.id,
          liveRoom.queue_id,
          liveRoom.show_id,
          liveRoom.episode_id
        );
        setLiveMicSession(session);
        setMicMode(session.mic_mode);
        setBgAudioMode(session.background_audio_mode);

        // 2. Load initial logs/participants/requests
        const parts = await listLiveParticipants(session.id);
        setLiveMicParticipants(parts);

        const reqs = await listCallRequests(session.id);
        setLiveCallRequests(reqs);

        const drops = await listSfxDrops(liveRoom.id);
        setLiveSfxDrops(drops);

        // 3. Connect to Audio Provider
        provider = getAudioProvider(session.provider);
        provider.onStreamStateChanged((speakers) => {
          setAudioParticipants(speakers);
        });

        provider.onVolumeDuckingTriggered((shouldDuck) => {
          setIsHostSpeaking(shouldDuck);
        });

        // 4. Subscribe to Realtime Postgres Changes
        sub = subscribeToLiveMicEvents(session.id, (event) => {
          switch (event.type) {
            case "session_updated":
              setLiveMicSession(event.session);
              setMicMode(event.session.mic_mode);
              setBgAudioMode(event.session.background_audio_mode);
              break;
            case "participant_inserted":
              setLiveMicParticipants((prev) => {
                const filtered = prev.filter((p) => p.id !== event.participant.id);
                return [...filtered, event.participant];
              });
              setSfxEventsLog((prev) => [
                `[${new Date().toLocaleTimeString()}] Speaker Joined: ${
                  event.participant.display_name || "Guest"
                }`,
                ...prev,
              ]);
              break;
            case "participant_updated":
              setLiveMicParticipants((prev) =>
                prev.map((p) => (p.id === event.participant.id ? event.participant : p))
              );
              break;
            case "call_request_inserted":
              setLiveCallRequests((prev) => {
                const filtered = prev.filter((r) => r.id !== event.request.id);
                return [...filtered, event.request];
              });
              if (selectedChannel.owner_user_id === currentUserId) {
                toast("New Listener Call-In Request in Queue! 📞");
              }
              break;
            case "call_request_updated":
              setLiveCallRequests((prev) =>
                prev.map((r) => (r.id === event.request.id ? event.request : r))
              );
              if (event.request.requester_user_id === currentUserId) {
                setMyCallRequest(event.request);
                if (event.request.request_status === "approved") {
                  toast.success("Host approved your call-in request! You are now live. 🎙️🎉");
                } else if (event.request.request_status === "rejected") {
                  toast.error("Call-in request declined by host.");
                }
              }
              break;
            case "sfx_triggered":
              setSfxEventsLog((prev) => [
                `[${new Date().toLocaleTimeString()}] Sound Drop Triggered: ID ${
                  event.event.sfx_drop_id
                }`,
                ...prev,
              ]);
              break;
          }
        });
      } catch (err: any) {
        console.error("Failed to initialize live mic module:", err);
      } finally {
        setLoading(false);
      }
    }

    initLiveMic();

    return () => {
      if (sub) sub.unsubscribe();
      provider.leaveRoom();
      setLiveMicSession(null);
      setLiveMicParticipants([]);
      setLiveCallRequests([]);
      setAudioParticipants([]);
      setIsHostSpeaking(false);
      setMicEnabled(false);
    };
  }, [liveRoom, selectedChannel, currentUserId]);

  // Live Mic Control Methods
  const handleStartLiveMic = async () => {
    if (!liveMicSession || !selectedChannel) return;
    try {
      setIsConnectingAudio(true);
      // 1. Activate session
      await startLiveMicSession(liveMicSession.id, micMode, bgAudioMode);

      // 2. Generate and connect token
      const token = await generateHostAudioToken(liveMicSession.id);
      const provider = getAudioProvider(liveMicSession.provider);
      await provider.joinRoom(liveMicSession.provider_room_name || `room-${liveMicSession.room_id}`, token);

      setMicEnabled(true);
      await provider.setMicrophoneEnabled(true);
      await logMicSessionEvent(liveMicSession.id, liveMicSession.room_id, selectedChannel.id, "session_started");
      toast.success("Tradio Live Mic STARTED successfully! You are broadcasting live. 🎤📻");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to start Live Mic: " + err.message);
    } finally {
      setIsConnectingAudio(false);
    }
  };

  const handleEndLiveMic = async () => {
    if (!liveMicSession || !selectedChannel) return;
    try {
      setIsConnectingAudio(true);
      await endLiveMicSession(liveMicSession.id);
      const provider = getAudioProvider(liveMicSession.provider);
      await provider.leaveRoom();
      setMicEnabled(false);
      await logMicSessionEvent(liveMicSession.id, liveMicSession.room_id, selectedChannel.id, "session_ended");
      toast.success("Live Mic ended. Scheduled broadcast back to full volume.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to end Live Mic: " + err.message);
    } finally {
      setIsConnectingAudio(false);
    }
  };

  const handleToggleMic = async () => {
    if (!liveMicSession) return;
    try {
      const nextState = !micEnabled;
      setMicEnabled(nextState);
      const provider = getAudioProvider(liveMicSession.provider);
      await provider.setMicrophoneEnabled(nextState);
      await logMicSessionEvent(
        liveMicSession.id,
        liveMicSession.room_id,
        liveMicSession.channel_id,
        nextState ? "participant_unmuted" : "participant_muted"
      );
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to toggle microphone: " + err.message);
    }
  };

  const handleTriggerSfx = async (drop: TradioLiveSfxDrop) => {
    if (!liveMicSession || !selectedChannel) return;
    try {
      await triggerSfxDrop(liveMicSession.id, liveMicSession.room_id, selectedChannel.id, drop);
      toast.success(`Triggered SFX: ${drop.title}`);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to trigger drop: " + err.message);
    }
  };

  const handleRequestCallIn = async () => {
    if (!liveMicSession || !selectedChannel) return;
    try {
      setIsConnectingAudio(true);
      const req = await submitCallInRequest(
        liveMicSession.id,
        liveMicSession.room_id,
        selectedChannel.id,
        callInNote,
        liveMicSession.queue_id
      );
      setMyCallRequest(req);
      setIsCallInModalOpen(false);
      toast.success("Call-in request submitted! Waiting in queue for Host approval. 📞⏱️");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit request: " + err.message);
    } finally {
      setIsConnectingAudio(false);
    }
  };

  const handleApproveCall = async (requestId: string) => {
    try {
      await approveCallRequest(requestId);
      // Reload queue lists
      if (liveMicSession) {
        const reqs = await listCallRequests(liveMicSession.id);
        setLiveCallRequests(reqs);
        const parts = await listLiveParticipants(liveMicSession.id);
        setLiveMicParticipants(parts);
      }
      toast.success("Caller APPROVED to speak! Seat added.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to approve caller: " + err.message);
    }
  };

  const handleRejectCall = async (requestId: string, reason: string = "Declined by Host") => {
    try {
      await rejectCallRequest(requestId, reason);
      if (liveMicSession) {
        const reqs = await listCallRequests(liveMicSession.id);
        setLiveCallRequests(reqs);
      }
      toast.success("Caller declined.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to reject caller: " + err.message);
    }
  };

  const handleMuteParticipant = async (partId: string) => {
    try {
      await muteParticipant(partId);
      if (liveMicSession) {
        const parts = await listLiveParticipants(liveMicSession.id);
        setLiveMicParticipants(parts);
      }
      toast.success("Speaker muted.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to mute speaker: " + err.message);
    }
  };

  const handleUnmuteParticipant = async (partId: string) => {
    try {
      await unmuteParticipant(partId);
      if (liveMicSession) {
        const parts = await listLiveParticipants(liveMicSession.id);
        setLiveMicParticipants(parts);
      }
      toast.success("Speaker unmuted.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to unmute speaker: " + err.message);
    }
  };

  const handleRemoveParticipant = async (partId: string) => {
    try {
      await removeParticipant(partId);
      if (liveMicSession) {
        const parts = await listLiveParticipants(liveMicSession.id);
        setLiveMicParticipants(parts);
      }
      toast.success("Speaker kicked and removed from live mic session.");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to remove speaker: " + err.message);
    }
  };

  const handleJoinApprovedStream = async () => {
    if (!liveMicSession) return;
    try {
      setIsConnectingAudio(true);
      const token = await generateParticipantAudioToken(liveMicSession.id);
      const provider = getAudioProvider(liveMicSession.provider);
      await provider.joinRoom(liveMicSession.provider_room_name || `room-${liveMicSession.room_id}`, token);
      await provider.setMicrophoneEnabled(true);
      setMicEnabled(true);
      toast.success("Successfully joined the live host broadcast! Speak into your microphone now. 🎙️🎉");
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to connect audio stream: " + err.message);
    } finally {
      setIsConnectingAudio(false);
    }
  };

  const handleLeaveApprovedStream = async () => {
    if (!liveMicSession) return;
    try {
      setIsConnectingAudio(true);
      const provider = getAudioProvider(liveMicSession.provider);
      await provider.leaveRoom();
      setMicEnabled(false);
      toast.success("Left caller audio stream.");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsConnectingAudio(false);
    }
  };

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
          { id: blocks[targetIdx].id, sort_order: blocks[targetIdx].sort_order },
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        toast.success(
          `Episode successfully ${statusToSet === "published" ? "Published Live" : "Scheduled"}!`,
        );
      } catch (e: any) {
        toast.error("Failed to update status: " + e.message);
      }
    } else {
      toast.success(
        `Supabase offline: Episode mock ${statusToSet === "published" ? "Published" : "Scheduled"}!`,
      );
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
            else if (subView === "timeline-preview") setSubView("editor");
            else if (subView === "channel-detail") setSubView("dashboard");
            else if (subView === "create-channel") setSubView("dashboard");
            else if (subView === "archive") setActiveTab("archive");
            else if (subView === "admin-clips") setActiveTab("archive");
            else if (subView === "admin-post-show") setActiveTab("archive");
            else if (subView === "public-library") setActiveTab("archive");
            else if (subView === "post-show") setActiveTab("archive");
            else if (subView === "distribution") setActiveTab("archive");
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
            {/* 1. TABBED DASHBOARD VIEW */}
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
                        Tradio{" "}
                        <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                          Studio
                        </span>
                      </h1>
                      <p className="mt-2 text-xs md:text-sm text-white/60 max-w-xl">
                        "Your sound is not a post. It is programming." Design, schedule, and live
                        broadcast highly atmospheric radio shows with generative AI.
                      </p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                      <button
                        onClick={() => setSubView("create-show")}
                        className="rounded-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-black px-5 py-3 text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] whitespace-nowrap"
                      >
                        <Plus className="h-3.5 w-3.5 inline mr-1.5" /> Create Show
                      </button>
                      <button
                        onClick={() => setSubView("create-channel")}
                        className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black px-5 py-3 text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] whitespace-nowrap"
                      >
                        <Radio className="h-3.5 w-3.5 inline mr-1.5" /> Create Channel
                      </button>
                    </div>
                  </div>
                </GlassCard>

                {/* Tab Selectors */}
                <div className="flex border-b border-white/10 gap-6 font-mono text-[10px] font-black tracking-widest uppercase">
                  <button
                    onClick={() => setActiveTab("shows")}
                    className={`pb-3 relative transition-all ${
                      activeTab === "shows"
                        ? "text-purple-300 font-bold border-b-2 border-purple-500"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    Show Lanes ({shows.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("channels")}
                    className={`pb-3 relative transition-all ${
                      activeTab === "channels"
                        ? "text-cyan-300 font-bold border-b-2 border-cyan-400"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    Broadcast Channels ({channels.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("admin-reviews")}
                    className={`pb-3 relative transition-all ${
                      activeTab === "admin-reviews"
                        ? "text-yellow-300 font-bold border-b-2 border-yellow-400"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    Admin Reviews ({pendingReviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("archive")}
                    className={`pb-3 relative transition-all ${
                      activeTab === "archive"
                        ? "text-green-300 font-bold border-b-2 border-green-400"
                        : "text-white/40 hover:text-white/70"
                    }`}
                  >
                    <Disc className="h-3 w-3 inline mr-1" /> Live Archive
                  </button>
                </div>

                {/* Tab Conditionally Rendered Content */}
                {activeTab === "shows" && (
                  <div className="space-y-4">
                    {shows.length === 0 ? (
                      <GlassCard className="p-8 text-center space-y-3 border-dashed border-white/10">
                        <Mic2 className="h-8 w-8 text-white/20 mx-auto" />
                        <div className="text-sm font-bold text-white/80">No lanes created yet</div>
                        <p className="text-xs text-white/50 max-w-xs mx-auto">
                          Create your first official show lane to start compiling episodes.
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
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest font-mono ${
                                      show.status === "published"
                                        ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-300"
                                        : "bg-yellow-500/15 border border-yellow-500/20 text-yellow-300"
                                    }`}
                                  >
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
                                <span>
                                  Mood:{" "}
                                  <span className="text-purple-300">
                                    {show.mood || "Atmospheric"}
                                  </span>
                                </span>
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
                )}

                {activeTab === "channels" && (
                  <div className="space-y-4">
                    {channels.length === 0 ? (
                      <GlassCard className="p-8 text-center space-y-3 border-dashed border-white/10">
                        <Radio className="h-8 w-8 text-white/20 mx-auto" />
                        <div className="text-sm font-bold text-white/80">
                          No channels created yet
                        </div>
                        <p className="text-xs text-white/50 max-w-xs mx-auto">
                          Create your first public or private channel to program scheduled audio
                          broadcasts.
                        </p>
                      </GlassCard>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {channels.map((chan) => (
                          <GlassCard
                            key={chan.id}
                            className="p-5 flex flex-col justify-between hover:border-cyan-500/30 hover:bg-white/[0.01] transition-all group cursor-pointer"
                          >
                            <div onClick={() => handleChannelClick(chan)}>
                              <div className="flex items-start justify-between">
                                <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-purple-300 font-mono">
                                  {chan.channel_type.replace(/_/g, " ")}
                                </span>
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest font-mono ${
                                    chan.status === "active"
                                      ? "bg-emerald-500/15 border border-emerald-500/20 text-emerald-300"
                                      : "bg-white/10 border border-white/10 text-white/40"
                                  }`}
                                >
                                  {chan.status}
                                </span>
                              </div>
                              <h4 className="mt-4 font-black text-white text-lg group-hover:text-cyan-300 transition-colors">
                                {chan.title}
                              </h4>
                              <p className="mt-1 text-xs text-white/50 line-clamp-2">
                                {chan.description || "No description provided."}
                              </p>

                              {/* Display Tags */}
                              <div className="flex flex-wrap gap-1 mt-3">
                                {chan.mood_tags.map((m) => (
                                  <span
                                    key={m}
                                    className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-white/45 font-mono"
                                  >
                                    #{m}
                                  </span>
                                ))}
                                {chan.genre_tags.map((g) => (
                                  <span
                                    key={g}
                                    className="px-1.5 py-0.5 rounded bg-white/5 text-[9px] text-cyan-400/60 font-mono"
                                  >
                                    #{g}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePlayChannel(chan);
                                }}
                                className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full transition-all"
                              >
                                <Play className="h-3 w-3 fill-emerald-300" /> Listen Live
                              </button>
                              <button
                                onClick={() => handleChannelClick(chan)}
                                className="text-[10px] font-mono font-bold text-cyan-300 hover:text-cyan-400 flex items-center gap-0.5"
                              >
                                Manage Channel <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "admin-reviews" && (
                  <div className="space-y-4">
                    {pendingReviews.length === 0 ? (
                      <GlassCard className="p-8 text-center space-y-3 border-dashed border-white/10">
                        <CheckCircle className="h-8 w-8 text-white/20 mx-auto" />
                        <div className="text-sm font-bold text-white/80">All reviews cleared!</div>
                        <p className="text-xs text-white/50 max-w-xs mx-auto">
                          There are currently no pending broadcast submissions waiting for approval.
                        </p>
                      </GlassCard>
                    ) : (
                      <div className="space-y-3">
                        {pendingReviews.map((rev) => (
                          <GlassCard
                            key={rev.id}
                            className="p-5 border-yellow-500/20 bg-yellow-500/[0.01]"
                          >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                <span className="rounded-full bg-yellow-500/15 border border-yellow-500/30 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-yellow-300 font-mono">
                                  Pending PD Review
                                </span>
                                <h4 className="mt-2 font-black text-white text-base">
                                  {rev.episode?.title || "Draft Episode"}
                                </h4>
                                <p className="text-xs text-white/50 mt-1 font-mono">
                                  Submitted by:{" "}
                                  <span className="text-purple-300">
                                    {rev.requester?.email || "Creator"}
                                  </span>{" "}
                                  • {new Date(rev.created_at).toLocaleDateString()}
                                </p>
                                {rev.review_notes && (
                                  <p className="mt-3 p-3 bg-white/5 rounded-xl text-xs text-white/70 font-mono italic">
                                    " {rev.review_notes} "
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2 self-center shrink-0">
                                <button
                                  onClick={async () => {
                                    try {
                                      await approveBroadcastReview(
                                        rev.id,
                                        "Audio compiles and passes full rights clearance checks.",
                                      );
                                      toast.success("Broadcast Review APPROVED! 📻🏆");
                                      const pReviews = await listPendingReviews();
                                      setPendingReviews(pReviews);
                                    } catch (e: any) {
                                      toast.error("Failed: " + e.message);
                                    }
                                  }}
                                  className="rounded-full bg-emerald-500 text-black font-black px-4 py-2 text-[10px] uppercase tracking-wider hover:brightness-110 transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={async () => {
                                    const reason = prompt("Enter change request notes:");
                                    if (reason === null) return;
                                    try {
                                      await requestBroadcastChanges(rev.id, reason);
                                      toast.success("Changes requested.");
                                      const pReviews = await listPendingReviews();
                                      setPendingReviews(pReviews);
                                    } catch (e: any) {
                                      toast.error("Failed: " + e.message);
                                    }
                                  }}
                                  className="rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 font-black px-4 py-2 text-[10px] uppercase tracking-wider hover:bg-yellow-500/30 transition-all"
                                >
                                  Changes Request
                                </button>
                                <button
                                  onClick={async () => {
                                    const reason = prompt("Enter rejection reason:");
                                    if (reason === null) return;
                                    try {
                                      await rejectBroadcastReview(rev.id, reason);
                                      toast.success("Submission rejected.");
                                      const pReviews = await listPendingReviews();
                                      setPendingReviews(pReviews);
                                    } catch (e: any) {
                                      toast.error("Failed: " + e.message);
                                    }
                                  }}
                                  className="rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-black px-4 py-2 text-[10px] uppercase tracking-wider hover:bg-red-500/20 transition-all"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Archive Tab */}
                {activeTab === "archive" && (
                  <div className="space-y-4">
                    <GlassCard className="p-6 border-green-500/20 bg-green-500/10">
                      <div className="flex items-center gap-3 mb-4">
                        <Disc className="h-6 w-6 text-green-300" />
                        <div>
                          <h3 className="font-bold text-green-300 text-lg">Live Archive & Replay</h3>
                          <p className="text-xs text-white/60">Manage live recordings, create highlight clips, and publish replay archives</p>
                        </div>
                      </div>
                      <div className="grid gap-3 md:grid-cols-6 mt-4">
                        <button
                          onClick={() => setSubView("archive")}
                          className="p-4 rounded-xl border border-green-500/30 bg-green-500/[0.08] hover:bg-green-500/15 transition-all text-left"
                        >
                          <h4 className="font-bold text-green-300 text-sm">Creator Archive</h4>
                          <p className="text-xs text-white/50 mt-1">Manage your recordings and clips</p>
                        </button>
                        <button
                          onClick={() => {
                            if (isIdentityAdmin) {
                              setSubView("admin-clips");
                            } else {
                              toast.error("Admin access required");
                            }
                          }}
                          className="p-4 rounded-xl border border-orange-500/30 bg-orange-500/[0.08] hover:bg-orange-500/15 transition-all text-left"
                        >
                          <h4 className="font-bold text-orange-300 text-sm">Clip Review</h4>
                          <p className="text-xs text-white/50 mt-1">Review and approve clips (Admin)</p>
                        </button>
                        <button
                          onClick={() => setSubView("post-show")}
                          className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/[0.08] hover:bg-yellow-500/15 transition-all text-left"
                        >
                          <h4 className="font-bold text-yellow-300 text-sm flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            Post-Show Producer
                          </h4>
                          <p className="text-xs text-white/50 mt-1">AI-powered asset generation</p>
                        </button>
                        <button
                          onClick={() => setSubView("distribution")}
                          className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/[0.08] hover:bg-cyan-500/15 transition-all text-left"
                        >
                          <h4 className="font-bold text-cyan-200 text-sm flex items-center gap-1">
                            <Megaphone className="w-4 h-4" />
                            Distribution Desk
                          </h4>
                          <p className="text-xs text-white/50 mt-1">Queue social, newsletter, push, and site drafts</p>
                        </button>
                        <button
                          onClick={() => {
                            if (isIdentityAdmin) {
                              setSubView("admin-post-show");
                            } else {
                              toast.error("Admin access required");
                            }
                          }}
                          className="p-4 rounded-xl border border-pink-500/30 bg-pink-500/[0.08] hover:bg-pink-500/15 transition-all text-left"
                        >
                          <h4 className="font-bold text-pink-300 text-sm">Post-Show Review</h4>
                          <p className="text-xs text-white/50 mt-1">Review generated producer assets</p>
                        </button>
                        <button
                          onClick={() => setSubView("public-library")}
                          className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/[0.08] hover:bg-blue-500/15 transition-all text-left"
                        >
                          <h4 className="font-bold text-blue-300 text-sm">Public Replay Library</h4>
                          <p className="text-xs text-white/50 mt-1">Browse published clips and replays</p>
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                )}
              </div>
            )}

            {/* 2. CREATOR ARCHIVE VIEW */}
            {subView === "archive" && (
              <CreatorArchiveDashboard
                sessionId={selectedChannel?.id}
                onNavigate={(view) => {
                  if (view === "back") setActiveTab("archive");
                  if (view === "distribution") setSubView("distribution");
                }}
              />
            )}

            {/* 2A. ADMIN CLIP REVIEW VIEW */}
            {subView === "admin-clips" && (
              <AdminClipReviewDashboard
                onNavigate={(view) => {
                  if (view === "back") setActiveTab("archive");
                }}
              />
            )}

            {/* 2AA. ADMIN POST-SHOW REVIEW VIEW */}
            {subView === "admin-post-show" && (
              <AdminPostShowReviewDashboard
                onNavigate={(view) => {
                  if (view === "back") setActiveTab("archive");
                }}
              />
            )}

            {/* 2B. PUBLIC REPLAY LIBRARY VIEW */}
            {subView === "public-library" && (
              <PublicReplayLibrary
                onNavigate={(view) => {
                  if (view === "back") setActiveTab("archive");
                }}
              />
            )}

            {/* 2C. POST-SHOW PRODUCER VIEW */}
            {subView === "post-show" && (
              <PostShowProducerDashboard
                onNavigate={(view) => {
                  if (view === "back") setActiveTab("archive");
                  if (view === "distribution") setSubView("distribution");
                }}
              />
            )}

            {/* 2D. DISTRIBUTION DESK VIEW */}
            {subView === "distribution" && (
              <DistributionDeskDashboard
                onNavigate={(view) => {
                  if (view === "back") setActiveTab("archive");
                  if (view === "post-show") setSubView("post-show");
                }}
              />
            )}

            {/* 3. CREATE SHOW FORM */}
            {subView === "create-show" && (
              <div className="max-w-2xl mx-auto animate-scale-in">
                <GlassCard className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Create Broadcast Lane</h3>
                    <p className="text-xs text-white/55 mt-1 leading-relaxed">
                      Set up your official lane parameters. These constraints guide the AI in
                      drafting timeline structures, moods, and playlist models.
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
                        Ready to make radio history? Click "New Episode" to start building your
                        ordered timeline.
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
                              <span
                                className={`rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase tracking-widest font-mono ${
                                  ep.status === "published"
                                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                    : ep.status === "scheduled"
                                      ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                                      : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                                }`}
                              >
                                {ep.status}
                              </span>
                            </div>
                            <p className="text-xs text-white/40 mt-1 max-w-xl truncate">
                              {ep.description}
                            </p>
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
                      Under Show Lane:{" "}
                      <span className="text-purple-300 font-bold">{currentShow.title}</span>
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
                        <span className="font-bold">AI Timeline Initialization:</span> Once created,
                        Tradio's backend co-pilot will automatically construct a customized
                        30-minute block timeline matching your lane formats.
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
                      DURATION:{" "}
                      {Math.round(
                        episodeBlocks.reduce((acc, b) => acc + b.duration_seconds, 0) / 60,
                      )}{" "}
                      MINS
                    </span>
                    <span className="text-[10px] text-cyan-300 bg-cyan-500/10 px-2.5 py-1 rounded-full font-mono font-bold uppercase">
                      STATUS: {currentEpisode.status}
                    </span>
                    <button
                      onClick={async () => {
                        setSubView("timeline-preview");
                        // Trigger manifest build and validation
                        const validation = await validateTimeline(
                          currentEpisode.id,
                          episodeBlocks,
                          role,
                        );
                        setTimelineValidation(validation);
                        // Load assembly history
                        listEpisodeAssembliesForEpisode(currentEpisode.id).then((history) => {
                          setAssemblyHistory(history);
                        });
                      }}
                      className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black px-4 py-1.5 text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 shadow-md font-mono"
                    >
                      <Eye className="h-3.5 w-3.5" /> Timeline Preview Console
                    </button>
                  </div>
                </div>

                {/* Sub-panels Grid */}
                <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                  {/* Left: Ordered Timeline Blocks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <h4 className="text-xs font-black text-white/45 uppercase tracking-widest font-mono">
                        Episode Timeline blocks
                      </h4>
                      <button
                        onClick={handleRegenerateFullRundown}
                        className="rounded-full border border-purple-500/35 bg-purple-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-purple-300 hover:bg-purple-500/20 active:scale-95 transition-all flex items-center gap-1 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Regenerate Full Rundown
                      </button>
                    </div>

                    <div className="space-y-3">
                      {episodeBlocks.map((block, index) => {
                        const isSelected = editingBlock?.id === block.id;
                        return (
                          <GlassCard
                            key={block.id}
                            className={`p-4 border-[0.5px] transition-all relative ${
                              isSelected
                                ? "border-purple-400/40 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                : "border-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3.5">
                                <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-purple-300">
                                  {block.block_type === "intro" ? (
                                    <Mic2 className="h-5 w-5" />
                                  ) : block.block_type === "song" ? (
                                    <Music className="h-5 w-5" />
                                  ) : block.block_type === "ad" ? (
                                    <Megaphone className="h-5 w-5" />
                                  ) : block.block_type === "producer_spotlight" ? (
                                    <Sparkles className="h-5 w-5" />
                                  ) : (
                                    <Radio className="h-5 w-5" />
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">
                                      {block.title}
                                    </span>
                                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/40 font-mono">
                                      {block.block_type.replace(/_/g, " ")}
                                    </span>
                                    {block.block_type === "song" && (
                                      <span
                                        className={`rounded-full px-1.5 py-0.5 text-[7px] font-mono font-bold uppercase tracking-wider ${
                                          block.clearance_status === "cleared"
                                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                            : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                                        }`}
                                      >
                                        {block.clearance_status}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-white/55 mt-1 leading-relaxed">
                                    {block.description || "No notes."}
                                  </p>
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
                                  onClick={() => toggleBlockLock(block.id)}
                                  className={`h-8 w-8 flex items-center justify-center rounded-lg border transition-all ${
                                    block.metadata?.locked
                                      ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-pulse"
                                      : "border-white/5 bg-white/[0.02] text-white/40 hover:text-white"
                                  }`}
                                  title={block.metadata?.locked ? "Script Locked" : "Lock Script"}
                                >
                                  {block.metadata?.locked ? (
                                    <Lock className="h-3.5 w-3.5" />
                                  ) : (
                                    <Settings className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingBlock(block);
                                    setEditingScriptText(block.script_text || "");
                                    setRevisions((prev) => {
                                      if (!prev[block.id]) {
                                        return { ...prev, [block.id]: [block.script_text || ""] };
                                      }
                                      return prev;
                                    });
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
                          <button
                            onClick={() => setEditingBlock(null)}
                            className="text-white/40 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-[10px] text-white/50">
                          Editing Script for:{" "}
                          <span className="text-purple-300 font-bold">{editingBlock.title}</span>
                        </div>

                        <textarea
                          className={`${inputClass} h-32 resize-none text-xs leading-relaxed font-mono text-cyan-300`}
                          value={editingScriptText}
                          onChange={(e) => setEditingScriptText(e.target.value)}
                          placeholder="Write the teleprompter/script content for this segment..."
                        />

                        {/* AI STYLE MODIFIERS */}
                        <div className="space-y-1.5">
                          <span className="block text-[8px] font-black uppercase tracking-widest text-white/35 font-mono">
                            AI Style Modifiers (Single Tap)
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              {
                                label: "Shorter",
                                modifier: "Make it short, concise, under 40 words.",
                              },
                              {
                                label: "Funnier",
                                modifier: "Add witty, lighthearted humor and dry jokes.",
                              },
                              {
                                label: "Professional",
                                modifier:
                                  "Deliver an articulate, formal, traditional broadcast tone.",
                              },
                              {
                                label: "More Street",
                                modifier:
                                  "Apply street-polished, cultural tastemaker vocabulary and slick delivery rules.",
                              },
                              {
                                label: "Emotional",
                                modifier:
                                  "Speak from the heart with deep emotional connection, appreciating the art.",
                              },
                              {
                                label: "Hype / High Energy",
                                modifier:
                                  "Deliver hyper high energy, active hype, commanding the club vibe.",
                              },
                            ].map((preset) => (
                              <button
                                key={preset.label}
                                type="button"
                                disabled={generatingScript}
                                onClick={() =>
                                  handleAIRegenerateScriptWithModifier(preset.modifier)
                                }
                                className="px-2.5 py-1 rounded-lg border border-white/5 bg-white/[0.03] text-[9px] font-bold text-white/70 hover:bg-white/5 active:scale-95 transition-all whitespace-nowrap"
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* REVISION HISTORY */}
                        {revisions[editingBlock.id] && revisions[editingBlock.id].length > 1 && (
                          <div className="p-2.5 rounded-xl border border-white/5 bg-black/30 flex items-center justify-between gap-3 text-xs leading-none">
                            <span className="text-[10px] text-white/45 uppercase font-mono font-bold">
                              REVISIONS HISTORY ({revisions[editingBlock.id].length} Drafts)
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const list = revisions[editingBlock.id];
                                  const currentIdx = list.indexOf(editingScriptText);
                                  if (currentIdx > 0) {
                                    setEditingScriptText(list[currentIdx - 1]);
                                    toast.message(`Loaded prior revision #${currentIdx}`);
                                  }
                                }}
                                className="h-6 px-1.5 rounded bg-white/5 text-[9px] font-black uppercase text-white/70 active:scale-90"
                              >
                                Prev
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const list = revisions[editingBlock.id];
                                  const currentIdx = list.indexOf(editingScriptText);
                                  if (currentIdx !== -1 && currentIdx < list.length - 1) {
                                    setEditingScriptText(list[currentIdx + 1]);
                                    toast.message(`Loaded revision #${currentIdx + 2}`);
                                  }
                                }}
                                className="h-6 px-1.5 rounded bg-white/5 text-[9px] font-black uppercase text-white/70 active:scale-90"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <button
                            type="button"
                            onClick={handleAIRegenerateScript}
                            disabled={generatingScript}
                            className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/20 transition-all flex items-center gap-1 disabled:opacity-40"
                          >
                            <Sparkles className="h-3 w-3 animate-pulse" />{" "}
                            {generatingScript ? "Generative AI..." : "Regenerate Script with AI"}
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

                        {/* TRADIO VOICE RENDERER SUB-PANEL */}
                        <div className="pt-4 mt-4 border-t border-white/10 space-y-4">
                          <div className="flex items-center gap-1.5 text-xs font-black text-white/80 uppercase tracking-widest font-mono">
                            <Volume2 className="h-4 w-4 text-cyan-300 animate-pulse" /> Tradio Voice
                            Renderer
                          </div>

                          {/* Provider and Voice Selector */}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Voice Provider">
                              <select
                                className={selectClass}
                                value={selectedProvider}
                                onChange={(e) => {
                                  const p = e.target.value as any;
                                  setSelectedVoiceProvider(p);
                                  // Update selected voice automatically to the first one available for this provider
                                  const available = listAvailableVoices(p);
                                  if (available.length > 0) {
                                    setSelectedVoice(available[0].id);
                                  }
                                }}
                              >
                                <option value="elevenlabs">ElevenLabs Premium</option>
                                <option value="openai">OpenAI TTS</option>
                                <option value="gemini">Gemini Live Voice</option>
                                <option value="internal">Local FM Synthesizer</option>
                                <option value="manual_upload">Manual Audio Upload</option>
                              </select>
                            </Field>

                            <Field label="Voice Name">
                              <select
                                className={selectClass}
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                disabled={selectedProvider === "manual_upload"}
                              >
                                {listAvailableVoices(selectedProvider).map((v) => (
                                  <option key={v.id} value={v.id}>
                                    {v.name}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          </div>

                          {/* Style, Pacing, and Energy Controls */}
                          {selectedProvider !== "manual_upload" && (
                            <>
                              <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Style / Tone Mode">
                                  <select
                                    className={selectClass}
                                    value={selectedStyleMode}
                                    onChange={(e) => setSelectedStyleMode(e.target.value)}
                                  >
                                    {VOICE_STYLE_MODES.map((style) => (
                                      <option key={style.id} value={style.id}>
                                        {style.name}
                                      </option>
                                    ))}
                                  </select>
                                </Field>
                                <div className="text-[10px] text-white/40 flex items-center justify-start italic pt-4">
                                  {
                                    VOICE_STYLE_MODES.find((s) => s.id === selectedStyleMode)
                                      ?.description
                                  }
                                </div>
                              </div>

                              <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                                    Pacing / Speed ({voicePacing}x)
                                  </span>
                                  <input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={voicePacing}
                                    onChange={(e) => setVoicePacing(parseFloat(e.target.value))}
                                    className="w-full accent-cyan-400 cursor-pointer bg-white/10 rounded-lg appearance-none h-1"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <span className="block text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                                    Energy / Vocal Drive ({voiceEnergy}x)
                                  </span>
                                  <input
                                    type="range"
                                    min="0.5"
                                    max="1.5"
                                    step="0.1"
                                    value={voiceEnergy}
                                    onChange={(e) => setVoiceEnergy(parseFloat(e.target.value))}
                                    className="w-full accent-cyan-400 cursor-pointer bg-white/10 rounded-lg appearance-none h-1"
                                  />
                                </div>
                              </div>
                            </>
                          )}

                          {/* Cost Estimate & Actions */}
                          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-white/45 uppercase font-bold">
                              Estimated Cost:
                            </span>
                            <span className="text-cyan-300 font-bold">
                              {estimateVoiceRenderCost(editingScriptText, selectedProvider)} Credits
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={
                                voiceRenderStatus === "rendering" || !editingScriptText.trim()
                              }
                              onClick={handleRenderVoice}
                              className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black uppercase tracking-widest disabled:opacity-40 hover:brightness-110 active:scale-95 transition-all shadow-md"
                            >
                              {voiceRenderStatus === "rendering"
                                ? "Rendering Voice..."
                                : "Render Voice"}
                            </button>

                            {previewingRender && (
                              <button
                                type="button"
                                onClick={() => {
                                  const audio = new Audio(previewingRender);
                                  audio.play();
                                  toast.success("Playing preview... 🔊");
                                }}
                                className="px-4 py-2.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-xs font-black uppercase tracking-widest hover:bg-cyan-500/20 active:scale-95 transition-all"
                              >
                                Preview Play
                              </button>
                            )}

                            {previewingRender && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleAttachVoiceToBlock(
                                    previewingRender,
                                    "active",
                                    Math.max(3, Math.round(editingScriptText.length / 15)),
                                  )
                                }
                                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-black uppercase tracking-widest hover:bg-purple-700 active:scale-95 transition-all"
                              >
                                Attach Voice
                              </button>
                            )}
                          </div>

                          {/* Error Display */}
                          {voiceRenderStatus === "failed" && voiceRenderError && (
                            <div className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/20 text-red-300 text-[11px] font-mono flex items-start gap-1.5 leading-relaxed">
                              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold">Rendering Failed:</span>{" "}
                                {voiceRenderError}
                              </div>
                            </div>
                          )}

                          {/* Voice Render History */}
                          {voiceRenderHistory.length > 0 && (
                            <div className="space-y-2">
                              <span className="block text-[8px] font-black uppercase tracking-widest text-white/35 font-mono">
                                Voice Render History for this block
                              </span>
                              <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
                                {voiceRenderHistory.map((h, idx) => (
                                  <div
                                    key={h.id || idx}
                                    className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-[11px]"
                                  >
                                    <div className="truncate pr-2">
                                      <span className="font-bold text-white/70 capitalize font-mono text-[10px]">
                                        {h.voice_provider} •{" "}
                                        {h.voice_name || h.provider_voice_id || "Voice"}
                                      </span>
                                      <span className="block text-[9px] text-white/40 font-mono mt-0.5">
                                        {h.duration_seconds}s • {h.mime_type}
                                      </span>
                                    </div>
                                    <div className="flex gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (h.audio_url) {
                                            const audio = new Audio(h.audio_url);
                                            audio.play();
                                            toast.success("Playing historical render... 🔊");
                                          }
                                        }}
                                        className="h-6 w-6 flex items-center justify-center rounded bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                                        title="Play clip"
                                      >
                                        <Play className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleAttachVoiceToBlock(
                                            h.audio_url || "",
                                            h.id,
                                            h.duration_seconds || 4,
                                          )
                                        }
                                        className="h-6 px-1.5 rounded bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 text-[9px] font-black uppercase tracking-widest"
                                        title="Attach this render"
                                      >
                                        Attach
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </GlassCard>
                    )}

                    {/* Station Drops area */}
                    <GlassCard className="p-4 space-y-3">
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Disc
                          className="h-4 w-4 text-purple-300 animate-spin"
                          style={{ animationDuration: "5s" }}
                        />{" "}
                        STATION DROPS & SFX
                      </h4>

                      {/* Creator Input */}
                      <form
                        onSubmit={handleCreateStationDrop}
                        className="space-y-2 pt-2 border-t border-white/5"
                      >
                        <span className="block text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                          Create Custom Station Drop
                        </span>
                        <input
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white outline-none transition placeholder:text-white/35 focus:border-cyan-400/50"
                          value={newDropText}
                          onChange={(e) => setNewDropText(e.target.value)}
                          placeholder="e.g. You are locked into Tradio."
                        />

                        <div className="grid gap-2 grid-cols-2">
                          <select
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-2 py-1.5 text-[10px] text-white outline-none transition cursor-pointer"
                            value={newDropProvider}
                            onChange={(e) => {
                              const p = e.target.value as any;
                              setNewDropProvider(p);
                              const available = listAvailableVoices(p);
                              if (available.length > 0) {
                                setNewDropVoice(available[0].id);
                              }
                            }}
                          >
                            <option value="elevenlabs">ElevenLabs</option>
                            <option value="openai">OpenAI TTS</option>
                            <option value="gemini">Gemini</option>
                            <option value="internal">Local FM</option>
                          </select>

                          <select
                            className="w-full rounded-xl border border-white/10 bg-black/50 px-2 py-1.5 text-[10px] text-white outline-none transition cursor-pointer"
                            value={newDropVoice}
                            onChange={(e) => setNewDropVoice(e.target.value)}
                          >
                            {listAvailableVoices(newDropProvider).map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={renderingDrop || !newDropText.trim()}
                          className="w-full text-center py-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                        >
                          {renderingDrop ? "Rendering..." : "Render & Save Drop"}
                        </button>
                      </form>

                      {/* Display Drops */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <span className="block text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                          Station Drop Library
                        </span>
                        {stationDrops.length === 0 ? (
                          <div className="text-[10px] text-white/35 italic py-1">
                            No custom station drops.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                            {stationDrops.map((drop) => (
                              <div
                                key={drop.id}
                                className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between text-xs hover:border-white/10 transition-colors"
                              >
                                <div className="truncate pr-2">
                                  <span className="font-bold text-white/80 block truncate">
                                    {drop.title}
                                  </span>
                                  <span className="text-[9px] text-white/40 font-mono">
                                    {drop.duration_seconds}s • cleared
                                  </span>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <button
                                    onClick={() => {
                                      if (drop.audio_url) {
                                        const audio = new Audio(drop.audio_url);
                                        audio.play();
                                        toast.success(`Playing preview for "${drop.title}" 🔊`);
                                      }
                                    }}
                                    className="p-1 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/25"
                                    title="Play preview sfx"
                                  >
                                    <Play className="h-3 w-3" />
                                  </button>
                                  {editingBlock && (
                                    <button
                                      onClick={() =>
                                        handleAttachVoiceToBlock(
                                          drop.audio_url,
                                          drop.id,
                                          drop.duration_seconds || 4,
                                        )
                                      }
                                      className="px-1.5 py-0.5 rounded bg-purple-600/30 text-purple-300 hover:bg-purple-600/40 text-[9px] font-mono uppercase"
                                      title="Attach this drop"
                                    >
                                      Attach
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </GlassCard>

                    {/* Ad read manager */}
                    <GlassCard className="p-4 space-y-3">
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Megaphone className="h-4 w-4 text-cyan-300" /> SPONSOR AD SLOTS
                      </h4>
                      <p className="text-[10px] text-white/55 leading-relaxed">
                        Insert sponsor reads into your ad blocks. Select filled provider models and
                        render draft audio.
                      </p>

                      {/* Render Ad Read controls */}
                      <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="grid gap-2 grid-cols-2">
                          <button
                            type="button"
                            onClick={async () => {
                              const text = await generateAdRead({
                                adProvider: "Trey TV Luxury Watches",
                                durationSeconds: 30,
                                tone: currentShow.host_mode ?? "cinematic",
                              });
                              setEditingScriptText(text);
                              toast.success("Sponsor ad read drafted into editor! 📻");
                            }}
                            className="w-full text-center py-1.5 rounded-xl border border-dashed border-cyan-400/20 bg-cyan-500/5 text-[9px] font-bold uppercase text-cyan-300 hover:bg-cyan-500/10"
                          >
                            Draft Luxury Watch Read
                          </button>

                          <button
                            type="button"
                            onClick={async () => {
                              const text = await generateAdRead({
                                adProvider: "Tradio Premium Club",
                                durationSeconds: 30,
                                tone: currentShow.host_mode ?? "hype",
                              });
                              setEditingScriptText(text);
                              toast.success("Sponsor ad read drafted into editor! 📻");
                            }}
                            className="w-full text-center py-1.5 rounded-xl border border-dashed border-cyan-400/20 bg-cyan-500/5 text-[9px] font-bold uppercase text-cyan-300 hover:bg-cyan-500/10"
                          >
                            Draft Premium Club Read
                          </button>
                        </div>

                        {editingBlock?.block_type === "ad" && (
                          <div className="p-2.5 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-[10px] text-cyan-200">
                            <span className="font-bold">Active Ad Block:</span> You can
                            write/generate your sponsor script above, render it using the Tradio
                            Voice Renderer, and click "Attach" to link it directly to this slot.
                          </div>
                        )}
                      </div>
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
                              <span className="font-bold">Clear for Broadcast:</span> Everything
                              matches scheduling constraints. Music clearances are confirmed.
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-300 text-xs flex items-start gap-2">
                            <BadgeAlert className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold">Checks Flagged:</span> Please review the
                              warning signals before publishing.
                            </div>
                          </div>
                        )}

                        {readinessCheck.warnings.map((warn, i) => (
                          <div
                            key={i}
                            className="text-[10px] text-white/60 bg-white/[0.01] p-2 rounded-lg border border-white/5 flex items-start gap-1.5"
                          >
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

            {/* 6. TIMELINE PREVIEW & ASSEMBLY VIEW */}
            {subView === "timeline-preview" && currentEpisode && currentShow && (
              <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01] border border-white/5 p-5 rounded-[2rem] shadow-lg">
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-300 font-mono">
                      <Layers className="h-3 w-3" /> Timeline Preview Console
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2">{currentEpisode.title}</h3>
                    <p className="text-xs text-white/50 mt-1 max-w-xl">
                      Audit your timeline, check rights, configure render options, and generate a
                      full episode preview candidate.
                    </p>
                  </div>
                  <div className="flex gap-2 self-center shrink-0">
                    <button
                      onClick={() => setSubView("editor")}
                      className="rounded-full border border-white/10 hover:bg-white/5 px-5 py-2 text-xs font-semibold text-white/80"
                    >
                      Return to Editor
                    </button>
                    <button
                      onClick={async () => {
                        const validation = await validateTimeline(
                          currentEpisode.id,
                          episodeBlocks,
                          role,
                        );
                        setTimelineValidation(validation);
                        toast.success("Timeline clearances updated! 🔍");
                      }}
                      className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-2 text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/20"
                    >
                      Re-Audit Manifest
                    </button>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                  {/* Left: Manifest Block Cards list */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-white/45 uppercase tracking-widest font-mono flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Ordered Segment Sequence
                    </h4>

                    {/* Overall Warnings Banner */}
                    {timelineValidation && !timelineValidation.ready && (
                      <div className="p-4 bg-yellow-500/15 border border-yellow-500/30 rounded-3xl text-yellow-300 text-xs space-y-2">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4" /> Assembly Clearance Blockers:
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-white/70 font-mono text-[10px]">
                          {timelineValidation.warnings.map((w: string, idx: number) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-3">
                      {episodeBlocks.map((block, idx) => {
                        const isMissing = timelineValidation?.missing_audio_blocks.includes(
                          block.id,
                        );
                        const isRightsIssue = timelineValidation?.rights_issue_blocks.includes(
                          block.id,
                        );

                        return (
                          <GlassCard
                            key={block.id}
                            className={`p-4 border-[0.5px] relative transition-all ${
                              isMissing
                                ? "border-red-500/20 bg-red-500/[0.01]"
                                : isRightsIssue
                                  ? "border-yellow-500/20 bg-yellow-500/[0.01]"
                                  : "border-white/5 bg-white/[0.005]"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="h-8 w-8 text-xs font-mono font-bold flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-white/50">
                                  #{idx + 1}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-white text-sm">
                                      {block.title}
                                    </span>
                                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                                      {block.block_type.replace(/_/g, " ")}
                                    </span>
                                    {block.metadata?.locked && (
                                      <span className="text-[8px] text-yellow-300 bg-yellow-500/10 px-1.5 py-0.5 rounded-full uppercase font-mono font-bold">
                                        🔒 Locked
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-xs text-white/45 mt-1 leading-relaxed">
                                    {block.description || "No notes."}
                                  </p>

                                  {/* Badges for status */}
                                  <div className="flex flex-wrap gap-2 mt-2.5">
                                    {isMissing ? (
                                      <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-red-300 font-mono flex items-center gap-1">
                                        ⚠️ Missing Audio Source
                                      </span>
                                    ) : block.media_url ? (
                                      <span className="rounded-full bg-cyan-500/10 border border-cyan-400/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-300 font-mono flex items-center gap-1">
                                        🔊 Audio Rendered
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-white/40 font-mono">
                                        No Audio (Script Only)
                                      </span>
                                    )}

                                    {block.block_type === "song" && (
                                      <span
                                        className={`rounded-full px-2 py-0.5 text-[8px] font-mono font-bold uppercase tracking-widest ${
                                          block.clearance_status === "cleared"
                                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                            : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300"
                                        }`}
                                      >
                                        Clearance: {block.clearance_status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Per-block audio actions */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {block.media_url ? (
                                  <button
                                    onClick={() => {
                                      const audio = new Audio(block.media_url || undefined);
                                      audio.play();
                                      toast.success(`Previewing block #${idx + 1}... 🔊`);
                                    }}
                                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                                    title="Preview Audio Block"
                                  >
                                    <Play className="h-3.5 w-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingBlock(block);
                                      setEditingScriptText(block.script_text || "");
                                      setSubView("editor");
                                      toast.message("Redirected to script editor");
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg border border-dashed border-white/10 hover:border-white/20 text-[9px] font-black uppercase tracking-widest text-white/45"
                                  >
                                    Fix / Render
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="mt-3 pt-2 border-t border-white/5 flex justify-between text-[9px] font-mono font-bold text-white/30">
                              <span>
                                EST. START:{" "}
                                {Math.round(
                                  episodeBlocks
                                    .slice(0, idx)
                                    .reduce((acc, current) => acc + current.duration_seconds, 0) /
                                    60,
                                )}
                                m{" "}
                                {episodeBlocks
                                  .slice(0, idx)
                                  .reduce((acc, current) => acc + current.duration_seconds, 0) % 60}
                                s
                              </span>
                              <span>DURATION: {block.duration_seconds}s</span>
                              <span>
                                FADES: in {block.fade_in_seconds || 0}s / out{" "}
                                {block.fade_out_seconds || 0}s
                              </span>
                            </div>
                          </GlassCard>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Render Settings & Assembly Actions */}
                  <div className="space-y-6">
                    {/* 1. Render settings configuration card */}
                    <GlassCard className="p-5 border-white/10 space-y-4">
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Settings className="h-4 w-4 text-cyan-300" /> Assembly Settings
                      </h4>

                      <div className="space-y-3 pt-2">
                        <Field label="Output Format">
                          <select
                            className={selectClass}
                            value={renderFormat}
                            onChange={(e) => setRenderFormat(e.target.value as any)}
                          >
                            <option value="mp3">MPEG-3 (.mp3) - Preferred</option>
                            <option value="wav">Waveform PCM (.wav) - HD</option>
                          </select>
                        </Field>

                        <Field label="Target Loudness Standards">
                          <select
                            className={selectClass}
                            value={targetLoudness}
                            onChange={(e) => setTargetLoudness(parseInt(e.target.value))}
                          >
                            <option value="-16">Podcast Preview (-16 LUFS) (Recommended)</option>
                            <option value="-14">Radio/FM Standard (-14 LUFS)</option>
                            <option value="-23">EBU R128 Broadcast (-23 LUFS)</option>
                          </select>
                        </Field>

                        <div className="grid gap-3 grid-cols-2">
                          <div className="space-y-1">
                            <span className="block text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                              Silence Between Segments
                            </span>
                            <input
                              type="number"
                              className={`${inputClass} !py-1.5 !px-3 font-mono text-xs`}
                              step="0.1"
                              min="0"
                              max="5"
                              value={silenceBetween}
                              onChange={(e) => setSilenceBetween(parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div className="space-y-1">
                            <span className="block text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                              Default Crossfades (s)
                            </span>
                            <input
                              type="number"
                              className={`${inputClass} !py-1.5 !px-3 font-mono text-xs`}
                              step="0.1"
                              min="0"
                              max="10"
                              value={crossfadeSec}
                              onChange={(e) => setCrossfadeSec(parseFloat(e.target.value) || 0)}
                            />
                          </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2.5 pt-2 border-t border-white/5">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="accent-cyan-400"
                              checked={normalizeVoice}
                              onChange={(e) => setNormalizeVoice(e.target.checked)}
                            />
                            <span className="text-[10px] text-white/70 font-semibold font-mono uppercase">
                              Normalize host voiceovers
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="accent-cyan-400"
                              checked={includeWatermark}
                              onChange={(e) => setIncludeWatermark(e.target.checked)}
                            />
                            <span className="text-[10px] text-white/70 font-semibold font-mono uppercase">
                              Embed "Draft Preview" watermark
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="accent-cyan-400"
                              checked={useBlockFade}
                              onChange={(e) => setUseBlockFade(e.target.checked)}
                            />
                            <span className="text-[10px] text-white/70 font-semibold font-mono uppercase">
                              Respect block fade faders
                            </span>
                          </label>
                        </div>
                      </div>
                    </GlassCard>

                    {/* 2. Primary Assembly triggers */}
                    <GlassCard className="p-5 border-cyan-500/20 bg-gradient-to-br from-[#0c1822] via-[#040910] to-black space-y-4">
                      <div>
                        <h4 className="text-xs font-black text-white/90 uppercase tracking-widest font-mono">
                          Tradio Timeline Assembler
                        </h4>
                        <p className="text-[10px] text-white/40 mt-1 leading-relaxed">
                          Compile your entire block sequence into a single high-fidelity review
                          audio.
                        </p>
                      </div>

                      {/* Current Assembly Status display */}
                      {assemblingStatus !== "idle" && (
                        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 text-xs">
                          <div className="flex items-center justify-between font-mono">
                            <span className="text-white/45 font-bold uppercase">Status:</span>
                            <span
                              className={`font-black uppercase tracking-wider ${
                                assemblingStatus === "assembling"
                                  ? "text-cyan-400 animate-pulse"
                                  : assemblingStatus === "completed"
                                    ? "text-emerald-400"
                                    : assemblingStatus === "failed"
                                      ? "text-red-400"
                                      : "text-white"
                              }`}
                            >
                              {assemblingStatus}
                            </span>
                          </div>

                          {assemblingStatus === "assembling" && (
                            <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-[65%] animate-pulse" />
                            </div>
                          )}

                          {assemblingStatus === "completed" && assemblyOutputUrl && (
                            <div className="pt-2 border-t border-white/5 space-y-2.5">
                              <span className="block text-[8px] font-black uppercase tracking-widest text-white/45 font-mono">
                                Player: Assembled Preview Candidate
                              </span>
                              <audio
                                controls
                                src={assemblyOutputUrl}
                                className="w-full accent-cyan-400 h-8"
                              />
                              <div className="flex gap-1.5 pt-1">
                                <a
                                  href={assemblyOutputUrl}
                                  download={`assembled-${currentEpisode.id}.mp3`}
                                  className="flex-1 text-center py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider"
                                >
                                  Download Program
                                </a>
                                <div className="mt-4 pt-3 border-t border-white/5 space-y-3 flex-1 flex flex-col">
                                  <div className="flex items-center justify-between text-[10px] font-mono">
                                    <span className="text-white/45 uppercase font-bold">
                                      Review Status:
                                    </span>
                                    <span className="text-yellow-400 font-black uppercase font-mono">
                                      Pending Approval
                                    </span>
                                  </div>

                                  <div className="flex gap-2 w-full">
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        if (assemblyHistory.length > 0) {
                                          try {
                                            await submitAssemblyForBroadcastReview(
                                              null,
                                              currentShow.id,
                                              currentEpisode.id,
                                              assemblyHistory[0].id,
                                              "Requesting official broadcast approval.",
                                            );
                                            toast.success(
                                              "Submitted for Professional Broadcast review! 📻🏆",
                                            );
                                            const p = await listPendingReviews();
                                            setPendingReviews(p);
                                          } catch (err: any) {
                                            toast.error(err.message);
                                          }
                                        }
                                      }}
                                      className="flex-1 text-center py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[9px] font-bold uppercase tracking-widest"
                                    >
                                      Submit Review
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (assemblyHistory.length > 0) {
                                          setScheduleChannelId(channels[0]?.id || "");
                                          setScheduleStart(new Date().toISOString().slice(0, 16));
                                          setScheduleEnd(
                                            new Date(Date.now() + 1800 * 1000)
                                              .toISOString()
                                              .slice(0, 16),
                                          );
                                          setShowScheduleModal(true);
                                        } else {
                                          toast.error("Assemble a broadcast candidate first!");
                                        }
                                      }}
                                      className="flex-1 text-center py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-black text-[9px] font-black uppercase tracking-widest shadow-md"
                                    >
                                      Schedule Live
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {assemblingStatus === "failed" && assemblyError && (
                            <div className="text-[10px] font-mono text-red-300 italic leading-relaxed pt-1 border-t border-white/5">
                              Error: {assemblyError}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          type="button"
                          disabled={assemblingStatus === "assembling"}
                          onClick={() => handleGenerateAssembly("preview")}
                          className="w-full text-center py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-lg disabled:opacity-40"
                        >
                          Generate Assembly Preview
                        </button>

                        <button
                          type="button"
                          disabled={
                            assemblingStatus === "assembling" ||
                            (timelineValidation && !timelineValidation.ready)
                          }
                          onClick={() => handleGenerateAssembly("final_candidate")}
                          className="w-full text-center py-2.5 rounded-full border border-purple-400/40 bg-purple-500/15 text-purple-300 text-xs font-black uppercase tracking-widest disabled:opacity-30"
                          title={
                            timelineValidation && !timelineValidation.ready
                              ? "Fix manifest warnings to enable final compilation"
                              : ""
                          }
                        >
                          Assemble Final Broadcast Candidate
                        </button>
                      </div>
                    </GlassCard>

                    {/* 3. Assembly Renders History list */}
                    {assemblyHistory.length > 0 && (
                      <GlassCard className="p-4 space-y-3">
                        <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono">
                          Assembly Render Logs
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {assemblyHistory.map((a, index) => (
                            <div
                              key={a.id || index}
                              className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between text-xs font-mono leading-none"
                            >
                              <div>
                                <span className="font-bold text-white/70 block capitalize">
                                  {a.assembly_type} render
                                </span>
                                <span className="text-[9px] text-white/40 block mt-1">
                                  {a.duration_seconds}s • {a.block_count} blocks •{" "}
                                  {new Date(a.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex gap-1.5">
                                {a.output_audio_url && (
                                  <button
                                    onClick={() => {
                                      const audio = new Audio(a.output_audio_url);
                                      audio.play();
                                      toast.success("Playing historical assembly... 🔊");
                                    }}
                                    className="h-6 w-6 flex items-center justify-center rounded bg-cyan-500/10 text-cyan-300"
                                    title="Play assembly preview"
                                  >
                                    <Play className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 7. CREATE CHANNEL FLOW */}
            {subView === "create-channel" && (
              <div className="max-w-2xl mx-auto animate-scale-in">
                <GlassCard className="p-6 md:p-8 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-white">Create Broadcast Channel</h3>
                    <p className="text-xs text-white/55 mt-1 leading-relaxed">
                      Establish a public or private Tradio frequency. Program your assembled
                      episodes and let listeners tune in live.
                    </p>
                  </div>

                  <form onSubmit={handleCreateChannel} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Channel Title">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="e.g. Trey FM Street Anthems"
                          value={newChannelTitle}
                          onChange={(e) => {
                            setNewChannelTitle(e.target.value);
                            setNewChannelSlug(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-8]+/g, "-")
                                .replace(/(^-|-$)/g, ""),
                            );
                          }}
                        />
                      </Field>

                      <Field label="Channel Slug (Frequency slug)">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="e.g. street-anthems"
                          value={newChannelSlug}
                          onChange={(e) => setNewChannelSlug(e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Description">
                      <textarea
                        rows={3}
                        className={`${inputClass} resize-none`}
                        placeholder="Atmospheric rap loops and exclusive beat playouts curated live by Trey TV creators."
                        value={newChannelDesc}
                        onChange={(e) => setNewChannelDesc(e.target.value)}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Channel Format Type">
                        <select
                          className={selectClass}
                          value={newChannelType}
                          onChange={(e) => setNewChannelType(e.target.value as ChannelType)}
                        >
                          <option value="radio">Radio Station</option>
                          <option value="artist_station">Artist Station</option>
                          <option value="dj_station">DJ Station</option>
                          <option value="producer_station">Producer Station</option>
                          <option value="talk_station">Talk Station</option>
                          <option value="discovery_station">Discovery & Premire Station</option>
                          <option value="event_station">Event Station</option>
                        </select>
                      </Field>

                      <Field label="Visibility / Access Gating">
                        <select
                          className={selectClass}
                          value={newChannelVisibility}
                          onChange={(e) =>
                            setNewChannelVisibility(e.target.value as ChannelVisibility)
                          }
                        >
                          <option value="public">Public (Everyone can tune in)</option>
                          <option value="private">Private (Only owner/admins can access)</option>
                          <option value="unlisted">Unlisted (Must have link)</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Cover Art Image URL">
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="https://unsplash.com/..."
                        value={newChannelCover}
                        onChange={(e) => setNewChannelCover(e.target.value)}
                      />
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <Field label="Mood Tags (comma sep)">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="chill, atmospheric"
                          value={newChannelMoods}
                          onChange={(e) => setNewChannelMoods(e.target.value)}
                        />
                      </Field>

                      <Field label="Genre Tags (comma sep)">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="lofi, hiphop"
                          value={newChannelGenres}
                          onChange={(e) => setNewChannelGenres(e.target.value)}
                        />
                      </Field>

                      <Field label="Target Audience">
                        <input
                          type="text"
                          className={inputClass}
                          placeholder="late night drivers"
                          value={newChannelAudience}
                          onChange={(e) => setNewChannelAudience(e.target.value)}
                        />
                      </Field>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSubView("dashboard")}
                        className="rounded-full border border-white/10 px-6 py-2.5 text-xs font-semibold text-white/70 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:brightness-110 shadow-lg"
                      >
                        Create Frequency
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            )}

            {/* 8. CHANNEL DETAIL & SCHEDULING MANAGER SCREEN */}
            {subView === "channel-detail" && selectedChannel && (
              <div className="space-y-8 animate-fade-in">
                {/* Header card with follow toggles and live counts */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.01] border border-white/5 p-6 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-48 w-48 bg-cyan-500/5 blur-[80px] pointer-events-none" />
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-gradient-to-b from-[#1a1236] to-black border border-white/10 flex items-center justify-center text-cyan-300">
                      <Radio className="h-8 w-8 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-cyan-300 font-mono">
                          <Globe className="h-2.5 w-2.5" /> Channel Console
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase">
                          {selectedChannel.status}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white mt-2">
                        {selectedChannel.title}
                      </h3>
                      <p className="text-xs text-white/55 mt-1 max-w-xl">
                        {selectedChannel.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 z-10">
                    <button
                      onClick={handleToggleFollow}
                      className={`rounded-full px-5 py-2 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 transition-all ${
                        isFollowing
                          ? "bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                          : "border border-white/10 text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isFollowing ? "fill-white" : ""}`} />
                      {isFollowing ? "Following" : "Follow Station"}
                    </button>
                    <button
                      onClick={() => setSubView("dashboard")}
                      className="rounded-full border border-white/10 hover:bg-white/5 px-5 py-2 text-xs font-semibold text-white/80"
                    >
                      Dashboard
                    </button>
                    <button
                      onClick={() => handlePlayChannel(selectedChannel)}
                      className="rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black px-6 py-2 text-xs uppercase tracking-widest shadow-md flex items-center gap-1.5"
                    >
                      <Play className="h-4 w-4 fill-white animate-bounce" /> Tune In Live
                    </button>
                  </div>
                </div>

                {/* Pulse stats counter strip */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                  <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                        Listeners Live
                      </span>
                      <span className="text-xl font-black text-emerald-400 font-mono mt-1 block">
                        {pulseSummary?.activeListeners || 0}
                      </span>
                    </div>
                    <Users className="h-5 w-5 text-emerald-400/40" />
                  </GlassCard>

                  <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                        Recent Activity
                      </span>
                      <span className="text-xl font-black text-cyan-300 font-mono mt-1 block">
                        +{pulseSummary?.recentReactionsCount || 0}
                      </span>
                    </div>
                    <Flame className="h-5 w-5 text-cyan-400/40" />
                  </GlassCard>

                  <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                        Follower Base
                      </span>
                      <span className="text-xl font-black text-purple-300 font-mono mt-1 block">
                        {pulseSummary?.followersCount || 0}
                      </span>
                    </div>
                    <Heart className="h-5 w-5 text-purple-400/40" />
                  </GlassCard>

                  <GlassCard className="p-4 flex items-center justify-between">
                    <div>
                      <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                        Top Mood tag
                      </span>
                      <span className="text-xs font-mono font-black text-yellow-300 mt-1.5 uppercase block">
                        {pulseSummary?.topReactionType || "HYPE"}
                      </span>
                    </div>
                    <Sparkles className="h-5 w-5 text-yellow-400/40" />
                  </GlassCard>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
                  {/* Left Column: Live player console, Replays backlog, upcoming schedule */}
                  <div className="space-y-6">
                    {/* Live Player / Reaction console */}
                    <GlassCard className="p-5 md:p-6 border-cyan-500/25 bg-gradient-to-b from-[#06121a] via-[#020509] to-black space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <Radio className="h-4 w-4 text-cyan-400 animate-pulse" /> Live Now Playing
                        </h4>
                        {activeNowPlaying?.isFallbackFilePlayout && (
                          <span className="text-[8px] font-mono font-black text-purple-300 border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 rounded-full uppercase">
                            Continuous fallback program
                          </span>
                        )}
                      </div>

                      {activeNowPlaying && activeNowPlaying.queueItem ? (
                        <div className="space-y-4">
                          <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                              <h5 className="font-bold text-white text-base">
                                {activeNowPlaying.showTitle}
                              </h5>
                              <p className="text-xs text-white/50 mt-0.5">
                                {activeNowPlaying.episodeTitle}
                              </p>
                              <span className="inline-block mt-2 font-mono text-[9px] font-black text-cyan-400 uppercase">
                                REMAINING: {activeNowPlaying.timeRemainingSeconds || 1800}s
                              </span>
                            </div>
                            <Waveform animate={true} className="w-16 h-8 text-cyan-400" />
                          </div>

                          {/* Reaction bar */}
                          <div className="space-y-2">
                            <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                              React Live: Pulse the Station
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                { type: "fire", emoji: "🔥" },
                                { type: "love", emoji: "❤️" },
                                { type: "laugh", emoji: "😂" },
                                { type: "rewind", emoji: "⏪" },
                                { type: "hard", emoji: "🔊" },
                                { type: "smooth", emoji: "🌊" },
                                { type: "salute", emoji: "🫡" },
                              ].map((r) => (
                                <button
                                  key={r.type}
                                  onClick={() => handleSendReaction(r.type as any)}
                                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                                >
                                  <span>{r.emoji}</span>
                                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white/50 capitalize">
                                    {r.type}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-8 bg-white/[0.01] border border-white/5 rounded-3xl text-xs space-y-3">
                          <Radio className="h-8 w-8 text-white/20 mx-auto" />
                          <div className="font-bold text-white/70">Playout Loop Active</div>
                          <p className="text-[10px] text-white/40 max-w-xs mx-auto leading-relaxed">
                            No live scheduled block is active at this hour. Playing looping baseline
                            station identification and sfx drops.
                          </p>
                        </div>
                      )}
                    </GlassCard>

                    {/* TRADIO LIVE ROOM - PASS 7 */}
                    {liveRoom && (
                      <GlassCard className="p-5 border-cyan-500/25 bg-gradient-to-b from-[#0a071d] via-[#020108] to-black space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full border border-cyan-400/40 bg-cyan-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-cyan-300 font-mono">
                              <MessageSquare className="h-3 w-3 animate-pulse" /> Tradio Live Room
                            </span>
                            <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-widest font-mono">
                              {liveRoom.title || "Live Lounge Chat"}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Host Moderation Trigger */}
                            {(selectedChannel.owner_user_id === currentUserId || role === "admin") && (
                              <button
                                onClick={() => setShowPollModal(true)}
                                className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-mono font-bold text-[9px] uppercase tracking-widest px-3 py-1.5 shadow-lg active:scale-95 transition-all"
                              >
                                Launch Poll
                              </button>
                            )}

                            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              liveRoom.room_status === "open"
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                                : "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                            }`}>
                              {liveRoom.room_status}
                            </span>
                          </div>
                        </div>

                        {/* Room settings toggles for Host/Admin */}
                        {(selectedChannel.owner_user_id === currentUserId || role === "admin") && (
                          <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-[9px] font-mono uppercase font-black text-white/50 flex flex-wrap gap-x-4 gap-y-2 justify-between">
                            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                              <input
                                type="checkbox"
                                className="accent-cyan-400"
                                checked={liveRoom.chat_enabled}
                                onChange={(e) => handleToggleRoomSetting('chat_enabled', e.target.checked)}
                              />
                              <span>Chat Enabled</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition">
                              <input
                                type="checkbox"
                                className="accent-cyan-400"
                                checked={liveRoom.polls_enabled}
                                onChange={(e) => handleToggleRoomSetting('polls_enabled', e.target.checked)}
                              />
                              <span>Polls Enabled</span>
                            </label>
                            <div className="flex items-center gap-1.5">
                              <span>Slow Mode:</span>
                              <select
                                className="bg-black/80 border border-white/15 rounded px-1.5 py-0.5 text-white outline-none cursor-pointer"
                                value={liveRoom.slow_mode_seconds}
                                onChange={(e) => handleSetSlowMode(Number(e.target.value))}
                              >
                                <option value="0">Off</option>
                                <option value="5">5s</option>
                                <option value="15">15s</option>
                                <option value="30">30s</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {/* Pinned Message Box */}
                        {chatMessages.some(m => m.is_pinned) && (
                          <div className="p-3 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 flex items-start gap-2 animate-scale-in">
                            <span className="text-base">📌</span>
                            <div className="flex-1 min-w-0 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-yellow-300 font-mono text-[9px] uppercase tracking-wider">
                                  {chatMessages.find(m => m.is_pinned)?.profiles?.display_name || "HOST PIN"}
                                </span>
                                {(selectedChannel.owner_user_id === currentUserId || role === "admin") && (
                                  <button
                                    onClick={() => handlePinMessage(null)}
                                    className="text-[9px] font-mono font-bold text-rose-300 hover:underline uppercase"
                                  >
                                    Unpin
                                  </button>
                                )}
                              </div>
                              <p className="text-white/90 font-medium mt-0.5 whitespace-pre-wrap break-words">
                                {chatMessages.find(m => m.is_pinned)?.message_text}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Poll Section */}
                        {liveRoom.polls_enabled && activePolls.length > 0 && (
                          <div className="space-y-3.5">
                            {activePolls.map((poll) => {
                              const isClosed = poll.poll_status === "closed";
                              const totalVotes = poll.options?.reduce((sum, opt) => sum + (opt.vote_count || 0), 0) || 0;
                              const hasVoted = poll.options?.some(opt => opt.voted_by_me) || false;
                              const shouldShowResults = poll.show_results_mode === "always" || hasVoted || isClosed;

                              return (
                                <div
                                  key={poll.id}
                                  className="p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5 space-y-3 animate-fade-in"
                                >
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <span className="inline-block text-[8px] font-mono font-bold text-purple-300 uppercase tracking-widest">
                                        STATION POLL {isClosed && "· CLOSED"}
                                      </span>
                                      <h5 className="font-black text-white text-sm mt-1 leading-snug">
                                        {poll.question}
                                      </h5>
                                    </div>

                                    {/* Creator Close Action */}
                                    {(selectedChannel.owner_user_id === currentUserId || role === "admin") && !isClosed && (
                                      <button
                                        onClick={() => closeLivePoll(poll.id)}
                                        className="text-[8px] font-mono font-bold bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 px-2 py-1 rounded-full uppercase"
                                      >
                                        Close
                                      </button>
                                    )}
                                  </div>

                                  <div className="space-y-2">
                                    {poll.options?.map((opt) => {
                                      const voteCount = opt.vote_count || 0;
                                      const percent = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                                      return (
                                        <div key={opt.id} className="relative">
                                          {shouldShowResults ? (
                                            /* Results Bar Display */
                                            <div className="w-full text-left p-3 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between relative overflow-hidden">
                                              <div
                                                className="absolute left-0 top-0 bottom-0 bg-purple-500/15 transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                              />
                                              <span className="relative text-xs text-white/90 font-medium flex items-center gap-1.5 z-10">
                                                {opt.option_text}
                                                {opt.voted_by_me && (
                                                  <span className="text-[8px] font-mono uppercase bg-purple-500/30 text-purple-200 border border-purple-500/30 px-1.5 py-0.5 rounded-full">
                                                    My Vote
                                                  </span>
                                                )}
                                              </span>
                                              <span className="relative text-xs font-mono font-black text-purple-300 z-10">
                                                {percent}% ({voteCount})
                                              </span>
                                            </div>
                                          ) : (
                                            /* Vote Button Action */
                                            <button
                                              onClick={() => handleVotePoll(poll.id, opt.id)}
                                              disabled={isClosed}
                                              className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-purple-500/40 bg-white/5 hover:bg-purple-500/10 text-xs text-white font-medium hover:scale-[1.01] active:scale-95 transition-all"
                                            >
                                              {opt.option_text}
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="text-[9px] font-mono text-white/40 font-bold flex justify-between items-center">
                                    <span>{totalVotes} total votes cast</span>
                                    <span>{poll.show_results_mode.replace(/_/g, " ")} results mode</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Moderation Reports Queue for Hosts / Admins */}
                        {(selectedChannel.owner_user_id === currentUserId || role === "admin") && moderationReports.length > 0 && (
                          <div className="p-3.5 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-3.5 animate-fade-in">
                            <h5 className="text-[9px] font-black font-mono text-rose-300 uppercase tracking-widest flex items-center gap-1">
                              <BadgeAlert className="h-3.5 w-3.5 text-rose-400 animate-bounce" /> Live Moderation Queue ({moderationReports.length})
                            </h5>
                            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                              {moderationReports.map((report) => (
                                <div key={report.id} className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[10px] space-y-2">
                                  <div className="flex justify-between items-center text-[9px] font-mono uppercase font-bold text-white/40">
                                    <span>Reason: <span className="text-rose-300">{report.reason}</span></span>
                                    <span>{report.report_status}</span>
                                  </div>
                                  {report.message && (
                                    <p className="text-white/80 italic font-medium border-l border-white/20 pl-2">
                                      "{report.message.message_text}"
                                    </p>
                                  )}
                                  <div className="flex justify-end gap-1.5 font-mono text-[8px] font-black uppercase tracking-wider">
                                    <button
                                      onClick={async () => {
                                        await handleHideMessage(report.message_id);
                                        // Dismiss report locally
                                        setModerationReports(prev => prev.filter(r => r.id !== report.id));
                                      }}
                                      className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded hover:bg-yellow-500/20"
                                    >
                                      Hide Message
                                    </button>
                                    <button
                                      onClick={async () => {
                                        await handleRemoveMessage(report.message_id);
                                        setModerationReports(prev => prev.filter(r => r.id !== report.id));
                                      }}
                                      className="px-2 py-1 bg-red-500/15 border border-red-500/20 text-rose-300 rounded hover:bg-red-500/25"
                                    >
                                      Remove
                                    </button>
                                    <button
                                      onClick={async () => {
                                        // Simple dismiss report from DB/local state
                                        if (isSupabaseConfigured && supabase) {
                                          await supabase.from("tradio_live_moderation_reports").update({ report_status: "dismissed" }).eq("id", report.id);
                                        }
                                        setModerationReports(prev => prev.filter(r => r.id !== report.id));
                                        toast.success("Report dismissed.");
                                      }}
                                      className="px-2 py-1 bg-white/5 border border-white/10 text-white/50 rounded hover:bg-white/10"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Chat Messages Feed container */}
                        <div className="space-y-3">
                          <span className="block text-[8px] font-mono font-bold uppercase tracking-widest text-white/40">
                            Live Stream Discussion
                          </span>

                          <div className="h-64 rounded-2xl bg-black/40 border border-white/5 p-3 overflow-y-auto space-y-3 flex flex-col-reverse">
                            <div className="space-y-3">
                              {chatMessages.length === 0 ? (
                                <div className="text-center py-12 text-xs font-mono text-white/30 italic">
                                  Lounge is quiet... Say hello in chat! 📻🎤
                                </div>
                              ) : (
                                chatMessages.slice().reverse().map((msg) => {
                                  const isSystem = msg.message_type === "system";
                                  const isHostNote = msg.message_type === "host_note";
                                  const isShoutout = msg.message_type === "shoutout";
                                  const isOwnMessage = msg.user_id === currentUserId;

                                  let wrapperClass = "flex items-start gap-2.5 max-w-full text-xs text-left animate-fade-in";
                                  if (isSystem) wrapperClass = "flex justify-center text-center p-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10 font-mono text-[10px] text-cyan-300 leading-normal w-full";
                                  else if (isHostNote) wrapperClass = "flex flex-col p-3 rounded-2xl border border-yellow-500/10 bg-yellow-500/5 w-full";
                                  else if (isShoutout) wrapperClass = "flex flex-col p-3 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 shadow-md shadow-cyan-500/5 w-full";
                                  else wrapperClass = "flex flex-col p-2 rounded-xl bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.03] w-full";

                                  return (
                                    <div key={msg.id} className={wrapperClass}>
                                      {isSystem ? (
                                        <p>{msg.message_text}</p>
                                      ) : (
                                        <>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-4 font-mono text-[9px]">
                                              <span className={`font-black uppercase tracking-wider flex items-center gap-1.5 ${
                                                isHostNote ? "text-yellow-300" : isShoutout ? "text-cyan-300" : "text-purple-300"
                                              }`}>
                                                {msg.profiles?.display_name || (msg.sender_role === "creator" ? "DJ" : "Listener")}
                                                {msg.sender_role !== "listener" && (
                                                  <span className="text-[7px] border border-cyan-400/30 bg-cyan-400/10 px-1 py-0.2 rounded font-black uppercase text-cyan-200">
                                                    {msg.sender_role}
                                                  </span>
                                                )}
                                              </span>

                                              {/* Actions container for admin/creator */}
                                              <div className="flex items-center gap-1.5 shrink-0 opacity-40 hover:opacity-100 transition-opacity">
                                                {/* Pin Option */}
                                                {(selectedChannel.owner_user_id === currentUserId || role === "admin") && (
                                                  <button
                                                    onClick={() => handlePinMessage(msg.id)}
                                                    className="hover:text-yellow-300 text-white/50 text-[8px] uppercase tracking-widest font-black"
                                                    title="Pin Message"
                                                  >
                                                    Pin
                                                  </button>
                                                )}
                                                {/* Highlight Option */}
                                                {(selectedChannel.owner_user_id === currentUserId || role === "admin") && (
                                                  <button
                                                    onClick={() => handleHighlightMessage(msg.id, !msg.is_highlighted)}
                                                    className="hover:text-cyan-300 text-white/50 text-[8px] uppercase tracking-widest font-black"
                                                    title="Highlight message"
                                                  >
                                                    {msg.is_highlighted ? "Unshout" : "Shout"}
                                                  </button>
                                                )}
                                                {/* Hide message Option */}
                                                {(selectedChannel.owner_user_id === currentUserId || role === "admin") && (
                                                  <button
                                                    onClick={() => handleHideMessage(msg.id)}
                                                    className="hover:text-rose-300 text-white/50 text-[8px] uppercase tracking-widest font-black"
                                                    title="Hide message from room"
                                                  >
                                                    Hide
                                                  </button>
                                                )}
                                                {/* User Report message Option */}
                                                {!isOwnMessage && (
                                                  <button
                                                    onClick={() => handleReportMessage(msg.id, msg.user_id, "Inappropriate Content")}
                                                    className="hover:text-rose-400 text-white/40 text-[8px] uppercase font-black tracking-widest"
                                                    title="Report message as abusive or spam"
                                                  >
                                                    Report
                                                  </button>
                                                )}
                                              </div>
                                            </div>

                                            <p className={`text-white/80 font-medium leading-relaxed mt-1 break-words ${
                                              isShoutout ? "text-xs font-black tracking-wide text-cyan-200" : ""
                                            }`}>
                                              {msg.message_text}
                                            </p>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Message Composer block */}
                        {liveRoom.chat_enabled ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              className={`${inputClass} !py-2.5 !px-3.5 !rounded-xl text-xs`}
                              placeholder="Type brief lofi chat (max 240 chars)..."
                              value={chatInput}
                              onChange={(e) => setChatBody(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                              maxLength={240}
                            />
                            <button
                              onClick={handleSendMessage}
                              disabled={!chatInput.trim()}
                              className="rounded-xl bg-cyan-500 text-black font-bold px-4 hover:bg-cyan-400 disabled:opacity-45 disabled:pointer-events-none transition-all flex items-center justify-center shrink-0"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 text-center rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono uppercase tracking-widest">
                            Chat is disabled by station host.
                          </div>
                        )}
                      </GlassCard>
                    )}

                    {/* TRADIO LIVE MIC - PASS 8 */}
                    {liveRoom && liveMicSession && (
                      <GlassCard className="p-5 border-cyan-500/25 bg-gradient-to-b from-[#09151e] via-[#020508] to-black space-y-4">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full border border-lime-400/40 bg-lime-500/10 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-lime-300 font-mono">
                              <Mic2 className="h-3 w-3 animate-pulse" /> Tradio Live Mic
                            </span>
                            <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-widest font-mono flex items-center gap-2">
                              Live host mic + call-ins
                              {liveMicSession.session_status === "live" && (
                                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                              )}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              liveMicSession.session_status === "live"
                                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 animate-pulse"
                                : "bg-white/10 border border-white/10 text-white/40"
                            }`}>
                              {liveMicSession.session_status}
                            </span>
                          </div>
                        </div>

                        {/* HOST CONTROLS PANEL */}
                        {(selectedChannel.owner_user_id === currentUserId || role === "admin") ? (
                          <div className="space-y-4">
                            {/* Controls Button row */}
                            <div className="flex flex-wrap gap-2">
                              {liveMicSession.session_status !== "live" ? (
                                <button
                                  onClick={handleStartLiveMic}
                                  disabled={isConnectingAudio}
                                  className="flex-1 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 text-black font-black px-5 py-2.5 text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg animate-pulse"
                                >
                                  <Mic2 className="h-4 w-4" />
                                  {isConnectingAudio ? "Connecting..." : "Go Live on Mic"}
                                </button>
                              ) : (
                                <div className="w-full flex gap-2">
                                  <button
                                    onClick={handleToggleMic}
                                    className={`flex-1 rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                                      micEnabled
                                        ? "bg-lime-400 text-black border-lime-400 hover:bg-lime-300"
                                        : "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                                    }`}
                                  >
                                    {micEnabled ? <Mic2 className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                                    {micEnabled ? "Mic is Live" : "Mic is Muted"}
                                  </button>
                                  <button
                                    onClick={handleEndLiveMic}
                                    disabled={isConnectingAudio}
                                    className="rounded-full bg-rose-500 hover:bg-rose-600 text-white font-black px-5 py-2.5 text-xs uppercase tracking-widest disabled:opacity-50 transition-all"
                                  >
                                    End Mic
                                  </button>
                                </div>
                              )}
                            </div>

                            {liveMicSession.session_status === "live" && (
                              <div className="space-y-3 p-3.5 bg-white/[0.01] border border-white/5 rounded-2xl animate-fade-in text-xs">
                                {/* Configuration details */}
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">
                                      Mic Mode
                                    </label>
                                    <select
                                      value={micMode}
                                      onChange={async (e) => {
                                        const mode = e.target.value as any;
                                        setMicMode(mode);
                                        // Update session
                                        if (isSupabaseConfigured && supabase) {
                                          await supabase.from("tradio_live_mic_sessions").update({ mic_mode: mode }).eq("id", liveMicSession.id);
                                        }
                                      }}
                                      className={`${selectClass} !py-2 !px-3 !rounded-xl text-xs mt-1 bg-black/60`}
                                    >
                                      <option value="host_only">Host Only</option>
                                      <option value="host_plus_cohost">Host + Co-Host Seats</option>
                                      <option value="call_in_queue">Listener Call-In Queue</option>
                                      <option value="open_stage_locked">Open Stage (Locked)</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">
                                      Playout Background Audio Mode
                                    </label>
                                    <select
                                      value={bgAudioMode}
                                      onChange={async (e) => {
                                        const mode = e.target.value as any;
                                        setBgAudioMode(mode);
                                        if (isSupabaseConfigured && supabase) {
                                          await supabase.from("tradio_live_mic_sessions").update({ background_audio_mode: mode }).eq("id", liveMicSession.id);
                                        }
                                      }}
                                      className={`${selectClass} !py-2 !px-3 !rounded-xl text-xs mt-1 bg-black/60`}
                                    >
                                      <option value="duck_on_host">Ducking background volume</option>
                                      <option value="keep_full_volume">Keep background at full volume</option>
                                      <option value="pause_on_host">Pause when Host speaks</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Active Speakers */}
                                <div className="space-y-1.5 pt-2 border-t border-white/5">
                                  <span className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">
                                    Speaker Seats ({audioParticipants.length + 1})
                                  </span>
                                  <div className="space-y-1.5">
                                    <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                                      <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                                        <span className="font-bold text-white">DJ Trey (You)</span>
                                        <span className="text-[7px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Host</span>
                                      </div>
                                      <span className="text-[10px] font-mono text-white/50">{micEnabled ? "Speaking 🎙️" : "Muted"}</span>
                                    </div>

                                    {liveMicParticipants.filter(p => p.participant_role !== "host" && p.participant_status !== "left" && p.participant_status !== "removed").map(p => (
                                      <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
                                        <div className="flex items-center gap-2">
                                          <div className={`h-2 w-2 rounded-full ${p.participant_status === "live" ? "bg-emerald-500 animate-pulse" : "bg-yellow-500"}`} />
                                          <span className="font-bold text-white">{p.display_name || "Guest speaker"}</span>
                                          <span className="text-[7px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono font-bold uppercase">{p.participant_role}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => p.is_muted_by_host ? handleUnmuteParticipant(p.id) : handleMuteParticipant(p.id)}
                                            className="text-[9px] font-mono bg-white/5 px-2 py-1 rounded hover:bg-white/10 uppercase"
                                          >
                                            {p.is_muted_by_host ? "Unmute" : "Mute"}
                                          </button>
                                          <button
                                            onClick={() => handleRemoveParticipant(p.id)}
                                            className="text-[9px] font-mono bg-rose-500/10 text-rose-300 px-2 py-1 rounded hover:bg-rose-500/20 uppercase"
                                          >
                                            Kick
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Call Queue if call_in_queue mode is active */}
                                {micMode === "call_in_queue" && (
                                  <div className="space-y-2 pt-2 border-t border-white/5">
                                    <span className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">
                                      Listener Call-In Queue ({liveCallRequests.length})
                                    </span>
                                    {liveCallRequests.length === 0 ? (
                                      <p className="text-[10px] text-white/40 italic">No listeners waiting to call in.</p>
                                    ) : (
                                      <div className="space-y-1.5">
                                        {liveCallRequests.map(req => (
                                          <div key={req.id} className="p-2.5 bg-black/40 border border-white/5 rounded-xl space-y-1.5">
                                            <div className="flex items-center justify-between">
                                              <span className="font-bold text-purple-300 font-mono text-[9px] uppercase">
                                                Requester: {req.requester_user_id ? "Authenticated Listener" : "Anonymous"}
                                              </span>
                                              <div className="flex gap-1.5">
                                                <button
                                                  onClick={() => handleApproveCall(req.id)}
                                                  className="bg-emerald-500 text-black font-mono font-bold text-[8px] uppercase px-2 py-0.5 rounded"
                                                >
                                                  Approve
                                                </button>
                                                <button
                                                  onClick={() => handleRejectCall(req.id)}
                                                  className="bg-rose-500/20 text-rose-300 font-mono font-bold text-[8px] uppercase px-2 py-0.5 rounded"
                                                >
                                                  Decline
                                                </button>
                                              </div>
                                            </div>
                                            {req.request_note && (
                                              <p className="text-[10px] text-white/70 italic bg-white/5 p-1.5 rounded font-mono">
                                                " {req.request_note} "
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* SFX board drop panel */}
                                <div className="space-y-2 pt-2 border-t border-white/5">
                                  <span className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">
                                    Broadcaster SFX Sound Board
                                  </span>
                                  <div className="grid grid-cols-2 gap-2">
                                    {liveSfxDrops.map(drop => (
                                      <button
                                        key={drop.id}
                                        onClick={() => handleTriggerSfx(drop)}
                                        className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 hover:border-purple-400/40 text-[10px] font-mono font-bold text-purple-300 text-left flex items-center justify-between group"
                                      >
                                        <span>{drop.title}</span>
                                        <Play className="h-3 w-3 fill-purple-300 opacity-30 group-hover:opacity-100 transition-opacity" />
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Event logs list */}
                                <div className="space-y-1.5 pt-2 border-t border-white/5">
                                  <span className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">
                                    Live Session Event Log
                                  </span>
                                  <div className="max-h-24 overflow-y-auto bg-black/60 rounded-xl p-2 border border-white/5 font-mono text-[9px] text-white/50 space-y-1">
                                    {sfxEventsLog.length === 0 && <p className="italic">Waiting for logs...</p>}
                                    {sfxEventsLog.map((log, i) => (
                                      <div key={i}>{log}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* LISTENER PANEL VIEW */
                          <div className="space-y-4">
                            {liveMicSession.session_status === "live" ? (
                              <div className="space-y-4">
                                <div className="p-4 rounded-3xl bg-lime-500/10 border border-lime-400/30 flex items-center justify-between gap-4 animate-pulse">
                                  <div>
                                    <span className="text-[8px] font-mono font-bold text-lime-400 uppercase tracking-widest">HOST MICROPHONE ACTIVE</span>
                                    <h5 className="font-black text-white text-sm mt-1 leading-snug">The DJ is speaking live over the air waves!</h5>
                                  </div>
                                  <Mic2 className="h-6 w-6 text-lime-400" />
                                </div>

                                {/* Request call in action if mic mode permits call ins */}
                                {liveMicSession.mic_mode === "call_in_queue" && (
                                  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl space-y-3">
                                    {!myCallRequest ? (
                                      <div className="space-y-2">
                                        <span className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">Listener Interactive Call-Ins</span>
                                        <p className="text-[10px] text-white/60 leading-relaxed">The host is accepting audience call-ins right now! Ask to call in and speak live.</p>

                                        <div className="flex gap-2">
                                          <input
                                            type="text"
                                            className={`${inputClass} !py-2 !rounded-xl text-xs`}
                                            placeholder="What do you want to say to the DJ?..."
                                            value={callInNote}
                                            onChange={(e) => setCallInNote(e.target.value)}
                                          />
                                          <button
                                            onClick={handleRequestCallIn}
                                            className="rounded-xl bg-purple-500 text-white font-bold text-xs px-4 hover:bg-purple-400 transition-all flex items-center justify-center shrink-0 font-mono uppercase"
                                          >
                                            Request
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-2 font-mono text-xs">
                                        <div className="flex items-center justify-between">
                                          <span className="block text-[8px] font-mono font-bold text-white/45 uppercase tracking-widest">Request Status</span>
                                          <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold ${
                                            myCallRequest.request_status === "approved"
                                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 animate-pulse"
                                              : myCallRequest.request_status === "rejected"
                                              ? "bg-rose-500/10 border border-rose-500/20 text-rose-300"
                                              : "bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 animate-pulse"
                                          }`}>
                                            {myCallRequest.request_status}
                                          </span>
                                        </div>

                                        {myCallRequest.request_status === "pending" && (
                                          <p className="text-[10px] text-white/50">You are currently waiting in the host queue. Ensure your microphone is ready!</p>
                                        )}

                                        {myCallRequest.request_status === "approved" && (
                                          <div className="space-y-2 pt-1">
                                            <p className="text-[10px] text-emerald-300">You are APPROVED to speak! Connect your microphone now.</p>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={handleJoinApprovedStream}
                                                className="flex-1 rounded-full bg-emerald-500 text-black font-black py-2 text-[10px] uppercase tracking-wider hover:bg-emerald-400"
                                              >
                                                Connect Stream
                                              </button>
                                              <button
                                                onClick={handleLeaveApprovedStream}
                                                className="rounded-full bg-rose-500/20 text-rose-300 font-black px-4 py-2 text-[10px] uppercase tracking-wider"
                                              >
                                                Leave
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-xs text-white/45 italic text-center py-4 font-mono uppercase tracking-widest">Host Live Mic is Offline</p>
                            )}
                          </div>
                        )}
                      </GlassCard>
                    )}

                    {/* Replays Backlog */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-white/45 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Disc className="h-4 w-4" /> Replay-Eligible Completed Broadcasts
                      </h4>

                      {replayBroadcasts.length === 0 ? (
                        <GlassCard className="p-6 text-center text-xs text-white/40 font-mono border-dashed">
                          No historical replays available.
                        </GlassCard>
                      ) : (
                        <div className="space-y-2">
                          {replayBroadcasts.map((replay) => (
                            <GlassCard
                              key={replay.id}
                              className="p-4 flex items-center justify-between hover:border-cyan-400/20 hover:bg-white/[0.01] transition-all"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-300">
                                  <Disc className="h-5 w-5" />
                                </div>
                                <div>
                                  <h5 className="font-bold text-white text-sm">
                                    {replay.show?.title || "Tradio Show"}
                                  </h5>
                                  <p className="text-xs text-white/55 mt-0.5">
                                    {replay.episode?.title || "Replay Broadcast"}
                                  </p>
                                  <span className="text-[9px] font-mono text-purple-300 font-bold block mt-1.5 uppercase">
                                    Archive compiled • {replay.episode?.duration_seconds || 1800}s
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handlePlayReplay(replay, selectedChannel)}
                                className="h-8 px-4 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold uppercase tracking-wider hover:bg-cyan-500/20 transition-all flex items-center gap-1"
                              >
                                <Play className="h-3 w-3 fill-cyan-300" /> Listen Replay
                              </button>
                            </GlassCard>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Scheduled Slots list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-white/45 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Upcoming Broadcast Schedule
                      </h4>

                      {upcomingBroadcasts.length === 0 ? (
                        <GlassCard className="p-6 text-center text-xs text-white/40 font-mono border-dashed">
                          No upcoming shows programmed.
                        </GlassCard>
                      ) : (
                        <div className="space-y-2">
                          {upcomingBroadcasts.map((item, idx) => {
                            const startStr = item.scheduled_start_at
                              ? new Date(item.scheduled_start_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A";
                            return (
                              <GlassCard
                                key={item.id}
                                className="p-3 border-white/5 bg-white/[0.005] flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-[10px] font-mono font-bold text-white/30">
                                    #{idx + 1}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-white text-xs">
                                      {(item as any).show?.title || "Tradio Show"}
                                    </h5>
                                    <p className="text-[10px] text-white/50 mt-0.5">
                                      {(item as any).episode?.title || "Scheduled Episode"}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-[10px] font-mono text-cyan-300 font-black">
                                  {startStr}
                                </div>
                              </GlassCard>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Analytics, trends, and Property overrides */}
                  <div className="space-y-6">
                    {/* Creator Analytics Panel */}
                    <GlassCard className="p-5 border-purple-500/15 bg-gradient-to-br from-[#120a22] via-[#05030b] to-black space-y-4">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                        <h4 className="text-xs font-black text-purple-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <BarChart3 className="h-4 w-4" /> Station Metrics
                        </h4>
                        <button
                          onClick={handleManualRollup}
                          className="text-[9px] font-mono font-black text-cyan-300 hover:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full uppercase"
                        >
                          Manual Rollup
                        </button>
                      </div>

                      {/* Daily Analytics rollup stats rows */}
                      {analyticsDaily.length > 0 ? (
                        <div className="space-y-3.5 text-xs pt-1">
                          <div className="grid grid-cols-2 gap-3 font-mono">
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="block text-[8px] text-white/40 uppercase">
                                Total Listens
                              </span>
                              <span className="text-base font-black text-white block mt-1">
                                {analyticsDaily.reduce((acc, c) => acc + c.total_listens, 0)}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="block text-[8px] text-white/40 uppercase">
                                Avg Listen Time
                              </span>
                              <span className="text-base font-black text-white block mt-1">
                                {Math.round(analyticsDaily[0].avg_listen_seconds / 60)} mins
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="block text-[8px] text-white/40 uppercase">
                                Reactions Pulse
                              </span>
                              <span className="text-base font-black text-white block mt-1">
                                {analyticsDaily.reduce((acc, c) => acc + c.reaction_count, 0)}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                              <span className="block text-[8px] text-white/40 uppercase">
                                Completion Rate
                              </span>
                              <span className="text-base font-black text-white block mt-1">
                                {analyticsDaily[0].completion_rate || 85}%
                              </span>
                            </div>
                          </div>

                          {/* AGGREGATION ADVISORY CTA */}
                          <div className="p-3.5 rounded-2xl border border-dashed border-purple-500/20 bg-purple-500/[0.01] text-[10px] text-purple-200 font-mono leading-relaxed space-y-1">
                            <div className="font-bold uppercase tracking-wider flex items-center gap-1 text-purple-300">
                              <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />{" "}
                              Pulse PD Recommendation:
                            </div>
                            {analyticsDaily[0].completion_rate &&
                            analyticsDaily[0].completion_rate < 80 ? (
                              <p>
                                Listeners exit timeline during host scripts. Try reducing script
                                length, optimizing emotional tone variables in Voice Renderer, or
                                scheduling slots between peak hours.
                              </p>
                            ) : (
                              <p>
                                Excellent engagement! Your late-night smooth mixes are holding 88%+
                                of the audience. Program additional final compiled candidates to
                                maintain the momentum.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 text-center text-[10px] font-mono text-white/30 italic">
                          Analytical rollups queued. Tune into this station live to generate
                          heartbeat data.
                        </div>
                      )}
                    </GlassCard>

                    {/* Historical logs rollup list */}
                    {analyticsDaily.length > 0 && (
                      <GlassCard className="p-4 space-y-3">
                        <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono">
                          Daily Aggregation Rollups
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-[10px] font-mono">
                          {analyticsDaily.map((d, index) => (
                            <div
                              key={d.id || index}
                              className="p-2.5 rounded-xl border border-white/5 bg-white/[0.01] space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-white/70 font-bold">
                                <span>{d.analytics_date}</span>
                                <span className="text-cyan-400">
                                  Peak: {d.peak_concurrent_listeners} listeners
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5 text-white/40 font-bold text-[8px]">
                                <span>
                                  LISTENS: <span className="text-white/60">{d.total_listens}</span>
                                </span>
                                <span>
                                  REPLAYS: <span className="text-purple-300">{d.replay_count}</span>
                                </span>
                                <span>
                                  REACTIONS:{" "}
                                  <span className="text-yellow-300">{d.reaction_count}</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}

                    {/* Channel Configuration overrides */}
                    <GlassCard className="p-5 space-y-4">
                      <h4 className="text-xs font-black text-white/80 uppercase tracking-widest font-mono flex items-center gap-1.5">
                        <Settings className="h-4 w-4 text-purple-300" /> Channel Overrides
                      </h4>

                      <div className="space-y-3 text-xs pt-1">
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-white/40 font-mono">
                            Slug Prefix
                          </span>
                          <span className="font-mono text-purple-300 font-bold block mt-1">
                            /{selectedChannel.slug}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-white/40 font-mono">
                            Format
                          </span>
                          <span className="capitalize block mt-1">
                            {selectedChannel.channel_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-white/40 font-mono">
                            Access Gating
                          </span>
                          <span className="capitalize block mt-1">
                            {selectedChannel.visibility}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black uppercase tracking-widest text-white/40 font-mono">
                            Status
                          </span>
                          <select
                            className={`${selectClass} !py-2 !px-3 font-mono text-xs mt-1`}
                            value={selectedChannel.status}
                            onChange={async (e) => {
                              try {
                                const nextChan = await updateBroadcastChannel(selectedChannel.id, {
                                  status: e.target.value as any,
                                });
                                setSelectedChannel(nextChan);
                                toast.success(`Channel status set to: ${e.target.value}`);
                              } catch (err: any) {
                                toast.error(err.message);
                              }
                            }}
                          >
                            <option value="draft">Draft (Private)</option>
                            <option value="active">Active (Online)</option>
                            <option value="paused">Paused (Muted)</option>
                            <option value="hidden">Hidden</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                </div>
              </div>
            )}

            {/* 9. SCHEDULE BROADCAST MODAL (overlay popup) */}
            {showScheduleModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <GlassCard className="p-6 md:p-8 max-w-md w-full space-y-6 relative border-cyan-400/25 shadow-2xl">
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-1.5">
                      <Calendar className="h-5 w-5 text-cyan-300" /> Schedule Episode Playout
                    </h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      Program your final compiled assembly onto a public channel queue. Timezone
                      defaulted to America/Chicago.
                    </p>
                  </div>

                  <form onSubmit={handleScheduleBroadcast} className="space-y-4">
                    <Field label="Select Channel / Frequency">
                      <select
                        className={selectClass}
                        value={scheduleChannelId}
                        onChange={(e) => setScheduleChannelId(e.target.value)}
                        required
                      >
                        <option value="">-- Choose Channel --</option>
                        {channels.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </Field>

                    <div className="grid gap-4 grid-cols-2">
                      <Field label="Scheduled Start">
                        <input
                          type="datetime-local"
                          className={inputClass}
                          value={scheduleStart}
                          onChange={(e) => setScheduleStart(e.target.value)}
                          required
                        />
                      </Field>

                      <Field label="Scheduled End">
                        <input
                          type="datetime-local"
                          className={inputClass}
                          value={scheduleEnd}
                          onChange={(e) => setScheduleEnd(e.target.value)}
                          required
                        />
                      </Field>
                    </div>

                    <div className="space-y-2.5 pt-2 border-t border-white/5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-cyan-400"
                          checked={scheduleIsLive}
                          onChange={(e) => setScheduleIsLive(e.target.checked)}
                        />
                        <span className="text-[10px] text-white/70 font-semibold font-mono uppercase">
                          Set as Live Booking Slot
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="accent-cyan-400"
                          checked={scheduleIsReplay}
                          onChange={(e) => setScheduleIsReplay(e.target.checked)}
                        />
                        <span className="text-[10px] text-white/70 font-semibold font-mono uppercase">
                          Eligible for automatic replays
                        </span>
                      </label>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(false)}
                        className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black px-6 py-2"
                      >
                        Schedule Slot
                      </button>
                    </div>
                  </form>
                </GlassCard>
              </div>
            )}

            {/* 10. CREATE POLL MODAL (overlay popup) */}
            {showPollModal && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                <GlassCard className="p-6 md:p-8 max-w-md w-full space-y-6 relative border-purple-400/25 shadow-2xl">
                  <button
                    onClick={() => setShowPollModal(false)}
                    className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div>
                    <h3 className="text-xl font-black text-white flex items-center gap-1.5">
                      <Sparkles className="h-5 w-5 text-purple-300" /> Launch Station Poll
                    </h3>
                    <p className="text-xs text-white/50 mt-1 leading-relaxed">
                      Prompt active listeners with interactive voting. Results calculate in real-time.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Field label="Question">
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="e.g. How is this lofi track hitting?"
                        value={pollQuestion}
                        onChange={(e) => setPollQuestion(e.target.value)}
                        required
                      />
                    </Field>

                    <Field label="Choices (One option per line)">
                      <textarea
                        className={`${inputClass} h-24 resize-none`}
                        placeholder="Pure Fire &#10;Smooth Waves &#10;Let it Cook"
                        value={pollOptionsText}
                        onChange={(e) => setPollOptionsText(e.target.value)}
                        required
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Results Gating">
                        <select
                          className={selectClass}
                          value={pollShowResults}
                          onChange={(e) => setPollShowResults(e.target.value as any)}
                        >
                          <option value="always">Always Visible</option>
                          <option value="after_vote">After Voting</option>
                          <option value="after_close">After Closing</option>
                          <option value="never">Host Private Only</option>
                        </select>
                      </Field>

                      <div className="space-y-2.5 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="accent-purple-400"
                            checked={pollAllowMultiple}
                            onChange={(e) => setPollAllowMultiple(e.target.checked)}
                          />
                          <span className="text-[10px] text-white/70 font-semibold font-mono uppercase">
                            Allow Multiple Choices
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPollModal(false)}
                        className="rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePoll}
                        disabled={!pollQuestion.trim() || !pollOptionsText.trim()}
                        className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black px-6 py-2 shadow-lg disabled:opacity-45"
                      >
                        Launch Poll
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </div>
        )}
      </div>
    </AccessGate>
  );
};

export default BroadcastStudioGateway;
