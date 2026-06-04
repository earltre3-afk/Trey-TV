/**
 * Tradio Broadcast Studio Pass 9B: Highlight Candidate Detection
 * Detect meaningful segments from existing Tradio events
 */

import { supabaseAdmin } from '@/integrations/supabase/client.server';

const supabase = supabaseAdmin;

interface GeneratedHighlightCandidate {
  segment_type: string;
  start_time_seconds: number;
  end_time_seconds: number;
  title?: string;
  description?: string;
  confidence: number;
  source_event_ids: string[];
  metadata: Record<string, unknown>;
}

type DetectedSegment = GeneratedHighlightCandidate;

interface ReactionEventRow {
  id: string;
  created_at: string;
  reaction_type: string;
}

interface ChatMessageEventRow {
  id: string;
  created_at: string;
  message: string;
}

interface PollEventRow {
  id: string;
  created_at: string;
  closed_at: string | null;
  question: string;
  total_votes: number | null;
  top_option: string | null;
  top_percentage: number | null;
}

interface CallRequestEventRow {
  id: string;
  created_at: string;
  approved_at: string | null;
  ended_at: string | null;
  caller_name: string | null;
  caller_id: string;
}

interface SfxEventRow {
  id: string;
  created_at: string;
  sfx_name: string | null;
  sfx_id: string;
}

interface MicEventRow {
  id: string;
  event_type: string;
  start_time_seconds: number | null;
  duration_seconds: number | null;
  speaker_id: string;
}

interface ReactionSpikeEvent {
  start_time: number;
  end_time: number;
  reaction_count: number;
  duration: number;
  reaction_types: string[];
  event_ids: string[];
}

interface ChatSpikeEvent {
  start_time: number;
  end_time: number;
  message_count: number;
  duration: number;
  keywords: string[];
  event_ids: string[];
}

interface PollEvent {
  start_time: number;
  end_time: number;
  question: string;
  vote_count: number;
  top_option: string;
  top_percentage: number;
  event_ids: string[];
}

interface CallInEvent {
  start_time: number;
  end_time: number;
  caller_name: string;
  caller_id: string;
  duration_seconds: number;
  event_ids: string[];
}

interface SfxEvent {
  start_time: number;
  end_time: number;
  sfx_name: string;
  sfx_id: string;
  event_ids: string[];
}

interface MicEvent {
  type: string;
  start_time: number;
  end_time: number;
  duration_seconds: number;
  speaker: string;
  event_ids: string[];
}

/**
 * Detect highlight candidates from recorded session events
 */
export async function detectHighlightCandidatesServer(input: {
  recording_id: string;
  session_id: string;
  room_id: string;
  channel_id: string;
  recording_duration_seconds: number;
}): Promise<{ segments: DetectedSegment[]; error?: string }> {
  const segments: DetectedSegment[] = [];

  try {
    // Fetch all relevant events from the session
    const eventPromises = [
      fetchReactionSpikes(input.session_id),
      fetchChatSpikes(input.session_id),
      fetchPollResults(input.session_id),
      fetchCallInMoments(input.session_id),
      fetchSfxMoments(input.session_id),
      fetchMicEvents(input.session_id),
    ] as const;

    const [reactions, chats, polls, callIns, sfx, micEvents]: [
      ReactionSpikeEvent[],
      ChatSpikeEvent[],
      PollEvent[],
      CallInEvent[],
      SfxEvent[],
      MicEvent[],
    ] = await Promise.all(eventPromises);

    // Process reaction spikes
    reactions.forEach((event: ReactionSpikeEvent) => {
      segments.push({
        segment_type: 'reaction_spike',
        start_time_seconds: event.start_time,
        end_time_seconds: event.end_time,
        title: `Reaction spike: ${event.reaction_count} reactions`,
        description: `${event.reaction_count} reactions in ${event.duration}s`,
        confidence: Math.min(1, event.reaction_count / 10),
        source_event_ids: event.event_ids,
        metadata: {
          reaction_types: event.reaction_types,
          reaction_count: event.reaction_count,
        },
      });
    });

    // Process chat spikes
    chats.forEach((event: ChatSpikeEvent) => {
      segments.push({
        segment_type: 'chat_spike',
        start_time_seconds: event.start_time,
        end_time_seconds: event.end_time,
        title: `Chat spike: ${event.message_count} messages`,
        description: `${event.message_count} messages in ${event.duration}s`,
        confidence: Math.min(1, event.message_count / 20),
        source_event_ids: event.event_ids,
        metadata: {
          message_count: event.message_count,
          keywords: event.keywords,
        },
      });
    });

    // Process poll results
    polls.forEach((event: PollEvent) => {
      segments.push({
        segment_type: 'poll_result',
        start_time_seconds: event.start_time,
        end_time_seconds: event.end_time,
        title: `Poll: "${event.question}"`,
        description: `${event.vote_count} votes, ${event.top_option} leading`,
        confidence: 0.7,
        source_event_ids: event.event_ids,
        metadata: {
          question: event.question,
          top_option: event.top_option,
          vote_count: event.vote_count,
          top_percentage: event.top_percentage,
        },
      });
    });

    // Process call-in moments
    callIns.forEach((event: CallInEvent) => {
      segments.push({
        segment_type: 'call_in_moment',
        start_time_seconds: event.start_time,
        end_time_seconds: event.end_time,
        title: `Call-in: ${event.caller_name}`,
        description: `${event.caller_name} joined as speaker`,
        confidence: 0.8,
        source_event_ids: event.event_ids,
        metadata: {
          caller_name: event.caller_name,
          caller_id: event.caller_id,
          duration_seconds: event.duration_seconds,
        },
      });
    });

    // Process SFX moments
    sfx.forEach((event: SfxEvent) => {
      segments.push({
        segment_type: 'sfx_moment',
        start_time_seconds: event.start_time,
        end_time_seconds: event.end_time,
        title: `SFX: ${event.sfx_name}`,
        description: `Sound effect played`,
        confidence: 0.5,
        source_event_ids: event.event_ids,
        metadata: {
          sfx_name: event.sfx_name,
          sfx_id: event.sfx_id,
        },
      });
    });

    // Process host/cohost monologues
    micEvents.forEach((event: MicEvent) => {
      if (event.type === 'host_monologue') {
        segments.push({
          segment_type: 'host_monologue',
          start_time_seconds: event.start_time,
          end_time_seconds: event.end_time,
          title: `Host moment: ${event.duration_seconds}s`,
          description: 'Extended host speaking moment',
          confidence: 0.6,
          source_event_ids: event.event_ids,
          metadata: {
            duration_seconds: event.duration_seconds,
            speaker: event.speaker,
          },
        });
      }
    });

    // Sort by confidence descending
    segments.sort((a, b) => b.confidence - a.confidence);

    return { segments };
  } catch (err) {
    return {
      segments: [],
      error: err instanceof Error ? err.message : 'Detection failed',
    };
  }
}

/**
 * Fetch reaction spikes from the session
 */
async function fetchReactionSpikes(sessionId: string): Promise<ReactionSpikeEvent[]> {
  try {
    const { data } = await (supabase as any)
      .from('tradio_broadcast_reactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const rows = (data ?? []) as ReactionEventRow[];
    if (rows.length < 3) return [];

    // Group reactions into spikes (3+ in 10s)
    const spikes: ReactionSpikeEvent[] = [];
    let i = 0;
    while (i < rows.length) {
      const window: ReactionEventRow[] = [rows[i]];
      const startTime = new Date(rows[i].created_at).getTime();

      let j = i + 1;
      while (j < rows.length && new Date(rows[j].created_at).getTime() - startTime < 10000) {
        window.push(rows[j]);
        j++;
      }

      if (window.length >= 3) {
        const reactionTypes = [...new Set(window.map((row: ReactionEventRow) => row.reaction_type))];
        spikes.push({
          start_time: Math.floor((startTime - new Date(rows[0].created_at).getTime()) / 1000),
          end_time: Math.floor(
            (new Date(window[window.length - 1].created_at).getTime() - new Date(rows[0].created_at).getTime()) /
              1000,
          ),
          reaction_count: window.length,
          duration: Math.round(window.length / 3),
          reaction_types: reactionTypes,
          event_ids: window.map((row: ReactionEventRow) => row.id),
        });
      }

      i = j;
    }

    return spikes;
  } catch {
    return [];
  }
}

/**
 * Fetch chat message spikes
 */
async function fetchChatSpikes(sessionId: string): Promise<ChatSpikeEvent[]> {
  try {
    const { data } = await (supabase as any)
      .from('tradio_live_chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const rows = (data ?? []) as ChatMessageEventRow[];
    if (rows.length < 5) return [];

    const spikes: ChatSpikeEvent[] = [];
    let i = 0;
    while (i < rows.length) {
      const window: ChatMessageEventRow[] = [rows[i]];
      const startTime = new Date(rows[i].created_at).getTime();

      let j = i + 1;
      while (j < rows.length && new Date(rows[j].created_at).getTime() - startTime < 10000) {
        window.push(rows[j]);
        j++;
      }

      if (window.length >= 5) {
        const keywords = extractKeywords(window.map((row: ChatMessageEventRow) => row.message));
        spikes.push({
          start_time: Math.floor((startTime - new Date(rows[0].created_at).getTime()) / 1000),
          end_time: Math.floor(
            (new Date(window[window.length - 1].created_at).getTime() - new Date(rows[0].created_at).getTime()) /
              1000,
          ),
          message_count: window.length,
          duration: Math.round(window.length / 5),
          keywords,
          event_ids: window.map((row: ChatMessageEventRow) => row.id),
        });
      }

      i = j;
    }

    return spikes;
  } catch {
    return [];
  }
}

/**
 * Fetch poll results
 */
async function fetchPollResults(sessionId: string): Promise<PollEvent[]> {
  try {
    const { data } = await (supabase as any)
      .from('tradio_live_polls')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'completed');

    const rows = (data ?? []) as PollEventRow[];
    if (rows.length === 0) return [];

    return rows.map((poll: PollEventRow): PollEvent => ({
      start_time: Math.floor((new Date(poll.created_at).getTime() - new Date(poll.created_at).getTime()) / 1000),
      end_time: Math.floor((new Date(poll.closed_at || poll.created_at).getTime() - new Date(poll.created_at).getTime()) / 1000) || 60,
      question: poll.question,
      vote_count: poll.total_votes || 0,
      top_option: poll.top_option || 'N/A',
      top_percentage: poll.top_percentage || 0,
      event_ids: [poll.id],
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch call-in moments
 */
async function fetchCallInMoments(sessionId: string): Promise<CallInEvent[]> {
  try {
    const { data } = await (supabase as any)
      .from('tradio_live_call_requests')
      .select('*')
      .eq('session_id', sessionId)
      .eq('status', 'approved');

    const rows = (data ?? []) as CallRequestEventRow[];
    if (rows.length === 0) return [];

    return rows.map((call: CallRequestEventRow): CallInEvent => ({
      start_time: Math.floor((new Date(call.approved_at || call.created_at).getTime() - new Date(call.created_at).getTime()) / 1000),
      end_time: Math.floor((new Date(call.ended_at || call.created_at).getTime() - new Date(call.created_at).getTime()) / 1000) || 300,
      caller_name: call.caller_name || 'Caller',
      caller_id: call.caller_id,
      duration_seconds: 300,
      event_ids: [call.id],
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch SFX moments
 */
async function fetchSfxMoments(sessionId: string): Promise<SfxEvent[]> {
  try {
    const { data } = await (supabase as any)
      .from('tradio_live_sfx_events')
      .select('*')
      .eq('session_id', sessionId);

    const rows = (data ?? []) as SfxEventRow[];
    if (rows.length === 0) return [];

    return rows.map((sfx: SfxEventRow): SfxEvent => ({
      start_time: Math.floor((new Date(sfx.created_at).getTime() - new Date(rows[0].created_at).getTime()) / 1000),
      end_time: Math.floor((new Date(sfx.created_at).getTime() - new Date(rows[0].created_at).getTime()) / 1000) + 5,
      sfx_name: sfx.sfx_name || 'SFX',
      sfx_id: sfx.sfx_id,
      event_ids: [sfx.id],
    }));
  } catch {
    return [];
  }
}

/**
 * Fetch host mic events
 */
async function fetchMicEvents(sessionId: string): Promise<MicEvent[]> {
  try {
    const { data } = await (supabase as any)
      .from('tradio_live_mic_events')
      .select('*')
      .eq('session_id', sessionId);

    const rows = (data ?? []) as MicEventRow[];
    if (rows.length === 0) return [];

    // Group consecutive events as monologues
    const monologues: MicEvent[] = [];

    rows.forEach((event: MicEventRow) => {
      if (event.event_type === 'speaking' && event.duration_seconds && event.duration_seconds > 30) {
        monologues.push({
          type: 'host_monologue',
          start_time: event.start_time_seconds || 0,
          end_time: (event.start_time_seconds || 0) + (event.duration_seconds || 60),
          duration_seconds: event.duration_seconds || 60,
          speaker: event.speaker_id,
          event_ids: [event.id],
        });
      }
    });

    return monologues;
  } catch {
    return [];
  }
}

/**
 * Extract keywords from messages
 */
function extractKeywords(messages: string[]): string[] {
  const text = messages.join(' ').toLowerCase();
  // Simple keyword extraction: words appearing 2+ times
  const words = text.split(/\s+/);
  const freq: Record<string, number> = {};

  words.forEach((word) => {
    word = word.replace(/[^\w]/g, '');
    if (word.length > 3) freq[word] = (freq[word] || 0) + 1;
  });

  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}
