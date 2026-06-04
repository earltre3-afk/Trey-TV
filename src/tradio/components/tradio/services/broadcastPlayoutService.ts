import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  TradioBroadcastChannel,
  TradioBroadcastQueueItem,
  TradioBroadcastReview,
  TradioPlayoutEvent,
  ChannelNowPlaying,
  ReviewStatus,
  QueueStatus,
  ChannelType,
  ChannelVisibility,
  ChannelStatus
} from "../types/broadcastPlayoutTypes";
import {
  scheduleBroadcastItemServer,
  submitAssemblyForBroadcastReviewServer,
  approveBroadcastItemServer,
  resolveNowPlayingServer,
  getSignedBroadcastPlaybackUrlServer,
  createPlayoutEventServer
} from "../../../../lib/trey-i/broadcastPlayout.server";

// Offline Mock Data for local fallback development
let localChannels: TradioBroadcastChannel[] = [
  {
    id: "chan-mock-1",
    owner_user_id: "00000000-0000-0000-0000-000000000000",
    title: "Trey FM Smooth Waves",
    slug: "smooth-waves",
    description: "The smoothest lofi, late-night grooves, and creator-curated radio.",
    channel_type: "radio",
    visibility: "public",
    status: "active",
    mood_tags: ["relaxing", "chilled"],
    genre_tags: ["lofi", "ambient"],
    audience_tags: ["midnight-riders"],
    cover_art_url: "https://images.unsplash.com/photo-1614149162883-504ce4d13909?w=500&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {},
  },
  {
    id: "chan-mock-2",
    owner_user_id: "00000000-0000-0000-0000-000000000000",
    title: "DJ Hype's Midnight Club",
    slug: "dj-hype-club",
    description: "High-octane club music and energetic broadcast mixes.",
    channel_type: "dj_station",
    visibility: "public",
    status: "active",
    mood_tags: ["hype", "energetic"],
    genre_tags: ["house", "electronic"],
    audience_tags: ["club-goers"],
    cover_art_url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    metadata: {},
  }
];

let localQueue: TradioBroadcastQueueItem[] = [];
let localReviews: TradioBroadcastReview[] = [];
let localPlayoutEvents: TradioPlayoutEvent[] = [];

/**
 * Resolves current user id
 */
async function getUserId(): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id || "00000000-0000-0000-0000-000000000000";
    } catch {
      // ignore
    }
  }
  return "00000000-0000-0000-0000-000000000000";
}

// ----------------------------------------------------
// CHANNEL FUNCTIONS
// ----------------------------------------------------

export async function createBroadcastChannel(input: {
  title: string;
  slug: string;
  description?: string;
  channel_type: ChannelType;
  visibility: ChannelVisibility;
  cover_art_url?: string;
  mood_tags?: string[];
  genre_tags?: string[];
  audience_tags?: string[];
}): Promise<TradioBroadcastChannel> {
  const userId = await getUserId();
  const newChannel: TradioBroadcastChannel = {
    id: isSupabaseConfigured ? "" : `chan-${Date.now()}`,
    owner_user_id: userId,
    title: input.title,
    slug: input.slug,
    description: input.description || null,
    channel_type: input.channel_type,
    visibility: input.visibility,
    status: "draft",
    cover_art_url: input.cover_art_url || null,
    mood_tags: input.mood_tags || [],
    genre_tags: input.genre_tags || [],
    audience_tags: input.audience_tags || [],
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_channels")
      .insert(newChannel)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    localChannels.unshift(newChannel);
    return newChannel;
  }
}

export async function updateBroadcastChannel(id: string, updates: Partial<TradioBroadcastChannel>): Promise<TradioBroadcastChannel> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_channels")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const channel = localChannels.find(c => c.id === id);
    if (!channel) throw new Error("Channel not found");
    Object.assign(channel, updates, { updated_at: new Date().toISOString() });
    return channel;
  }
}

export async function listMyBroadcastChannels(): Promise<TradioBroadcastChannel[]> {
  const userId = await getUserId();
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_channels")
      .select("*")
      .eq("owner_user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    return localChannels.filter(c => c.owner_user_id === userId);
  }
}

export async function listPublicBroadcastChannels(): Promise<TradioBroadcastChannel[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_channels")
      .select("*")
      .eq("status", "active")
      .eq("visibility", "public")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  } else {
    return localChannels.filter(c => c.status === "active" && c.visibility === "public");
  }
}

export async function getBroadcastChannelBySlug(slug: string): Promise<TradioBroadcastChannel | null> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_channels")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data;
  } else {
    return localChannels.find(c => c.slug === slug) || null;
  }
}

// ----------------------------------------------------
// REVIEW & APPROVAL FLOW
// ----------------------------------------------------

export async function submitAssemblyForBroadcastReview(
  channelId: string | null,
  showId: string,
  episodeId: string,
  assemblyId: string,
  reviewNotes?: string
): Promise<TradioBroadcastReview> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const result = await submitAssemblyForBroadcastReviewServer({
      data: {
        channelId,
        showId,
        episodeId,
        assemblyId,
        requesterUserId: userId,
        reviewNotes,
      }
    });
    if (!result.success) throw new Error(result.error);
    return result.review;
  } else {
    const newReview: TradioBroadcastReview = {
      id: `rev-${Date.now()}`,
      channel_id: channelId,
      show_id: showId,
      episode_id: episodeId,
      assembly_id: assemblyId,
      requester_user_id: userId,
      review_status: "pending",
      review_notes: reviewNotes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localReviews.unshift(newReview);
    return newReview;
  }
}

export async function approveBroadcastReview(
  reviewId: string,
  notes?: string,
  rightsNotes?: string,
  technicalNotes?: string
): Promise<TradioBroadcastReview> {
  const userId = await getUserId();
  if (isSupabaseConfigured && supabase) {
    const result = await approveBroadcastItemServer({
      data: {
        reviewId,
        reviewerUserId: userId,
        status: "approved",
        notes,
        rightsNotes,
        technicalNotes,
      }
    });
    if (!result.success) throw new Error(result.error);
    return result.review;
  } else {
    const review = localReviews.find(r => r.id === reviewId);
    if (!review) throw new Error("Review not found");
    Object.assign(review, {
      reviewer_user_id: userId,
      review_status: "approved" as ReviewStatus,
      review_notes: notes || review.review_notes,
      rights_notes: rightsNotes || review.rights_notes,
      technical_notes: technicalNotes || review.technical_notes,
      updated_at: new Date().toISOString(),
    });
    return review;
  }
}

export async function rejectBroadcastReview(reviewId: string, notes?: string): Promise<TradioBroadcastReview> {
  const userId = await getUserId();
  if (isSupabaseConfigured && supabase) {
    const result = await approveBroadcastItemServer({
      data: {
        reviewId,
        reviewerUserId: userId,
        status: "rejected",
        notes,
      }
    });
    if (!result.success) throw new Error(result.error);
    return result.review;
  } else {
    const review = localReviews.find(r => r.id === reviewId);
    if (!review) throw new Error("Review not found");
    Object.assign(review, {
      reviewer_user_id: userId,
      review_status: "rejected" as ReviewStatus,
      review_notes: notes || review.review_notes,
      updated_at: new Date().toISOString(),
    });
    return review;
  }
}

export async function requestBroadcastChanges(reviewId: string, notes?: string): Promise<TradioBroadcastReview> {
  const userId = await getUserId();
  if (isSupabaseConfigured && supabase) {
    const result = await approveBroadcastItemServer({
      data: {
        reviewId,
        reviewerUserId: userId,
        status: "needs_changes",
        notes,
      }
    });
    if (!result.success) throw new Error(result.error);
    return result.review;
  } else {
    const review = localReviews.find(r => r.id === reviewId);
    if (!review) throw new Error("Review not found");
    Object.assign(review, {
      reviewer_user_id: userId,
      review_status: "needs_changes" as ReviewStatus,
      review_notes: notes || review.review_notes,
      updated_at: new Date().toISOString(),
    });
    return review;
  }
}

export async function listPendingReviews(): Promise<TradioBroadcastReview[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await (supabase as any)
      .from("tradio_broadcast_reviews")
      .select("*, show:tradio_shows(title), episode:tradio_show_episodes(title, user_id)")
      .eq("review_status", "pending")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data || []) as TradioBroadcastReview[];
  } else {
    return localReviews.filter(r => r.review_status === "pending");
  }
}

// ----------------------------------------------------
// QUEUE & SCHEDULING MODEL
// ----------------------------------------------------

export async function addAssemblyToBroadcastQueue(
  channelId: string,
  showId: string,
  episodeId: string,
  assemblyId: string,
  scheduledStartAt: string,
  scheduledEndAt: string,
  timezone = "America/Chicago",
  isLiveSlot = false,
  isReplayEligible = true
): Promise<TradioBroadcastQueueItem> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const result = await scheduleBroadcastItemServer({
      data: {
        channelId,
        showId,
        episodeId,
        assemblyId,
        ownerUserId: userId,
        scheduledStartAt,
        scheduledEndAt,
        timezone,
        isLiveSlot,
        isReplayEligible,
      }
    });
    if (!result.success) throw new Error(result.error);
    return result.queueItem;
  } else {
    const newQueueItem: TradioBroadcastQueueItem = {
      id: `queue-${Date.now()}`,
      channel_id: channelId,
      show_id: showId,
      episode_id: episodeId,
      assembly_id: assemblyId,
      owner_user_id: userId,
      queue_status: "scheduled",
      scheduled_start_at: scheduledStartAt,
      scheduled_end_at: scheduledEndAt,
      timezone,
      sort_order: localQueue.length,
      is_live_slot: isLiveSlot,
      is_replay_eligible: isReplayEligible,
      rights_snapshot: {},
      readiness_snapshot: {},
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localQueue.push(newQueueItem);
    return newQueueItem;
  }
}

export async function updateBroadcastQueueItem(id: string, updates: Partial<TradioBroadcastQueueItem>): Promise<TradioBroadcastQueueItem> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_queue")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const item = localQueue.find(q => q.id === id);
    if (!item) throw new Error("Queue item not found");
    Object.assign(item, updates, { updated_at: new Date().toISOString() });
    return item;
  }
}

export async function removeBroadcastQueueItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("tradio_broadcast_queue")
      .delete()
      .eq("id", id);
    if (error) throw error;
    return true;
  } else {
    const idx = localQueue.findIndex(q => q.id === id);
    if (idx === -1) return false;
    localQueue.splice(idx, 1);
    return true;
  }
}

export async function reorderBroadcastQueue(channelId: string, orderedIds: string[]): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    // Perform bulk update sequence
    const promises = orderedIds.map((id, index) => {
      return (client as any)
        .from("tradio_broadcast_queue")
        .update({ sort_order: index, updated_at: new Date().toISOString() })
        .eq("id", id);
    });
    await Promise.all(promises);
    return true;
  } else {
    orderedIds.forEach((id, index) => {
      const item = localQueue.find(q => q.id === id);
      if (item) item.sort_order = index;
    });
    return true;
  }
}

export async function getUpcomingBroadcastsForChannel(channelId: string): Promise<TradioBroadcastQueueItem[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_broadcast_queue")
      .select("*, show:tradio_shows(title), episode:tradio_show_episodes(title, duration_seconds)")
      .eq("channel_id", channelId)
      .eq("queue_status", "scheduled")
      .gte("scheduled_start_at", new Date().toISOString())
      .order("scheduled_start_at", { ascending: true })
      .limit(10);
    if (error) throw error;
    return data || [];
  } else {
    const nowStr = new Date().toISOString();
    return localQueue
      .filter(q => q.channel_id === channelId && q.queue_status === "scheduled" && (q.scheduled_start_at || "") >= nowStr)
      .sort((a, b) => (a.scheduled_start_at || "").localeCompare(b.scheduled_start_at || ""));
  }
}

export async function getNowPlayingForChannel(slug: string): Promise<ChannelNowPlaying | null> {
  if (isSupabaseConfigured && supabase) {
    return resolveNowPlayingServer({ data: { channelSlug: slug } });
  } else {
    const chan = localChannels.find(c => c.slug === slug);
    if (!chan) return null;
    return {
      channel: chan,
      queueItem: null,
      isFallbackFilePlayout: true,
    };
  }
}

// ----------------------------------------------------
// PLAYOUT EVENTS & STATUS WORKFLOW
// ----------------------------------------------------

export async function startPlayoutEvent(
  channelId: string,
  queueId?: string | null,
  showId?: string | null,
  episodeId?: string | null,
  assemblyId?: string | null,
  eventType: string = "episode_started"
): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    const res = await createPlayoutEventServer({
      data: {
        channelId,
        queueId,
        showId,
        episodeId,
        assemblyId,
        eventType,
        eventStatus: "started",
      }
    });
    if (!res.success) throw new Error(res.error);
    return res.eventId || "";
  } else {
    const newEvent: TradioPlayoutEvent = {
      id: `evt-${Date.now()}`,
      channel_id: channelId,
      queue_id: queueId,
      show_id: showId,
      episode_id: episodeId,
      assembly_id: assemblyId,
      event_type: eventType as any,
      event_status: "started",
      started_at: new Date().toISOString(),
      listener_count_snapshot: 1,
      metadata: {},
      created_at: new Date().toISOString(),
    };
    localPlayoutEvents.push(newEvent);
    return newEvent.id;
  }
}

export async function completePlayoutEvent(eventId: string, metadata: Record<string, any> = {}): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("tradio_playout_events")
      .update({
        event_status: "completed",
        ended_at: new Date().toISOString(),
        metadata,
      })
      .eq("id", eventId);
    if (error) throw error;
    return true;
  } else {
    const evt = localPlayoutEvents.find(e => e.id === eventId);
    if (evt) {
      evt.event_status = "completed";
      evt.ended_at = new Date().toISOString();
      evt.metadata = { ...evt.metadata, ...metadata };
    }
    return true;
  }
}

export async function failPlayoutEvent(eventId: string, errorMessage: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("tradio_playout_events")
      .update({
        event_status: "failed",
        ended_at: new Date().toISOString(),
        error_message: errorMessage,
      })
      .eq("id", eventId);
    if (error) throw error;
    return true;
  } else {
    const evt = localPlayoutEvents.find(e => e.id === eventId);
    if (evt) {
      evt.event_status = "failed";
      evt.ended_at = new Date().toISOString();
      evt.error_message = errorMessage;
    }
    return true;
  }
}

export async function markQueueItemPlaying(id: string): Promise<TradioBroadcastQueueItem> {
  return updateBroadcastQueueItem(id, { queue_status: "playing" });
}

export async function markQueueItemCompleted(id: string): Promise<TradioBroadcastQueueItem> {
  return updateBroadcastQueueItem(id, { queue_status: "completed" });
}

export async function getPublicPlaybackUrlForQueueItem(queueItemId: string): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    const res = await getSignedBroadcastPlaybackUrlServer({
      data: { queueItemId }
    });
    return res.signedUrl;
  } else {
    // offline mock audio file
    return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  }
}
