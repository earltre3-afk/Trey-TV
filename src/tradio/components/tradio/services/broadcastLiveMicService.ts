import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  TradioLiveMicSession,
  TradioLiveMicParticipant,
  TradioLiveCallRequest,
  LiveMicMode,
  BackgroundAudioMode,
} from "../types/broadcastLiveMicTypes";
import {
  createLiveMicSessionServer,
  startLiveMicSessionServer,
  endLiveMicSessionServer,
  createHostLiveMicTokenServer,
  createParticipantLiveMicTokenServer,
  requestCallInServer,
  approveCallInServer,
  rejectCallInServer,
  muteParticipantServer,
  unmuteParticipantServer,
  removeParticipantServer,
  logLiveMicEventServer,
} from "../../../../lib/trey-i/broadcastLiveMic.server";

let localSessions: TradioLiveMicSession[] = [];
let localParticipants: TradioLiveMicParticipant[] = [];
let localRequests: TradioLiveCallRequest[] = [];

async function getUserId(): Promise<string | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.auth.getUser();
      return data?.user?.id || null;
    } catch {
      // ignore
    }
  }
  return null;
}

/**
 * Resolves or boots a live mic session for a room
 */
export async function getOrCreateLiveMicSession(
  roomId: string,
  channelId: string,
  queueId: string | null = null,
  showId: string | null = null,
  episodeId: string | null = null,
): Promise<TradioLiveMicSession> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await createLiveMicSessionServer({
      data: {
        roomId,
        channelId,
        queueId,
        showId,
        episodeId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
      },
    });

    if (response.success && response.session) {
      return response.session;
    }
    throw new Error(response.error || "Failed to create live mic session.");
  } else {
    // Offline Mock Fallback
    const existing = localSessions.find((s) => s.room_id === roomId && s.session_status === "live");
    if (existing) return existing;

    const mockSession: TradioLiveMicSession = {
      id: `session-mock-${roomId}`,
      room_id: roomId,
      channel_id: channelId,
      queue_id: queueId,
      show_id: showId,
      episode_id: episodeId,
      host_user_id: userId || "00000000-0000-0000-0000-000000000000",
      session_status: "pending",
      provider: "local_dev_stub",
      provider_room_name: `room-mock-${roomId}`,
      provider_session_id: `provider-mock-${roomId}`,
      mic_mode: "host_only",
      background_audio_mode: "duck_on_host",
      recording_enabled: false,
      max_speakers: 4,
      max_callers_waiting: 25,
      metadata: {},
      started_at: null,
      ended_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localSessions.push(mockSession);
    return mockSession;
  }
}

/**
 * Activates the live mic session
 */
export async function startLiveMicSession(
  sessionId: string,
  micMode: LiveMicMode = "host_only",
  backgroundAudioMode: BackgroundAudioMode = "duck_on_host",
): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await startLiveMicSessionServer({
      data: {
        sessionId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
        micMode,
        backgroundAudioMode,
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to start live mic session.");
    }
  } else {
    // Offline Mock Fallback
    const session = localSessions.find((s) => s.id === sessionId);
    if (session) {
      session.session_status = "live";
      session.started_at = new Date().toISOString();
      session.mic_mode = micMode;
      session.background_audio_mode = backgroundAudioMode;
    }
  }
}

/**
 * Shuts down a live mic session
 */
export async function endLiveMicSession(sessionId: string): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await endLiveMicSessionServer({
      data: {
        sessionId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to end live mic session.");
    }
  } else {
    // Offline Mock Fallback
    const session = localSessions.find((s) => s.id === sessionId);
    if (session) {
      session.session_status = "ended";
      session.ended_at = new Date().toISOString();
    }
  }
}

/**
 * Generates Host Auth Token for Live Audio Connections
 */
export async function generateHostAudioToken(sessionId: string): Promise<string> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await createHostLiveMicTokenServer({
      data: {
        sessionId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
      },
    });
    if (response.success && response.token) {
      return response.token;
    }
    throw new Error(response.error || "Failed to generate host token.");
  } else {
    return "mock-host-stub-token";
  }
}

/**
 * Generates Participant Audio Token for Speaker Connections
 */
export async function generateParticipantAudioToken(
  sessionId: string,
  anonymousSessionId: string | null = null,
): Promise<string> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await createParticipantLiveMicTokenServer({
      data: {
        sessionId,
        userId,
        anonymousSessionId,
      },
    });
    if (response.success && response.token) {
      return response.token;
    }
    throw new Error(response.error || "Failed to generate speaker token.");
  } else {
    return "mock-speaker-stub-token";
  }
}

/**
 * Submits a listener request to call-in
 */
export async function submitCallInRequest(
  sessionId: string,
  roomId: string,
  channelId: string,
  requestNote: string,
  queueId: string | null = null,
  playbackPositionSeconds: number | null = null,
  anonymousSessionId: string | null = null,
): Promise<TradioLiveCallRequest> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await requestCallInServer({
      data: {
        sessionId,
        roomId,
        channelId,
        queueId,
        userId,
        anonymousSessionId,
        requestNote,
        playbackPositionSeconds,
      },
    });
    if (response.success && response.request) {
      return response.request;
    }
    throw new Error(response.error || "Failed to submit request.");
  } else {
    // Offline Mock Fallback
    const mockReq: TradioLiveCallRequest = {
      id: `req-mock-${Date.now()}`,
      session_id: sessionId,
      room_id: roomId,
      channel_id: channelId,
      queue_id: queueId,
      requester_user_id: userId,
      anonymous_session_id: anonymousSessionId,
      request_status: "pending",
      request_note: requestNote,
      host_decision_user_id: null,
      decision_reason: null,
      playback_position_seconds: playbackPositionSeconds,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    localRequests.push(mockReq);
    return mockReq;
  }
}

/**
 * Host Decision: Approve Caller
 */
export async function approveCallRequest(requestId: string): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await approveCallInServer({
      data: {
        requestId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to approve call request.");
    }
  } else {
    const req = localRequests.find((r) => r.id === requestId);
    if (req) {
      req.request_status = "approved";
      req.host_decision_user_id = userId;

      const mockParticipant: TradioLiveMicParticipant = {
        id: `p-mock-${req.requester_user_id || req.anonymous_session_id}`,
        session_id: req.session_id,
        room_id: req.room_id,
        channel_id: req.channel_id,
        user_id: req.requester_user_id,
        anonymous_session_id: req.anonymous_session_id,
        participant_role: "caller",
        participant_status: "approved",
        provider_participant_id: `prov-p-${req.id}`,
        display_name: req.requester_user_id ? "Listener Friend" : "Anonymous Guest",
        mic_enabled: false,
        is_muted_by_host: false,
        is_muted_self: true,
        joined_at: new Date().toISOString(),
        left_at: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      localParticipants.push(mockParticipant);
    }
  }
}

/**
 * Host Decision: Reject Caller
 */
export async function rejectCallRequest(requestId: string, reason: string = ""): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await rejectCallInServer({
      data: {
        requestId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
        reason,
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to reject call request.");
    }
  } else {
    const req = localRequests.find((r) => r.id === requestId);
    if (req) {
      req.request_status = "rejected";
      req.host_decision_user_id = userId;
      req.decision_reason = reason;
    }
  }
}

/**
 * Host Action: Mute speaker
 */
export async function muteParticipant(participantId: string): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await muteParticipantServer({
      data: {
        participantId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to mute speaker.");
    }
  } else {
    const p = localParticipants.find((x) => x.id === participantId);
    if (p) {
      p.is_muted_by_host = true;
      p.mic_enabled = false;
    }
  }
}

/**
 * Host Action: Unmute speaker
 */
export async function unmuteParticipant(participantId: string): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await unmuteParticipantServer({
      data: {
        participantId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to unmute speaker.");
    }
  } else {
    const p = localParticipants.find((x) => x.id === participantId);
    if (p) {
      p.is_muted_by_host = false;
    }
  }
}

/**
 * Host Action: Kick/Remove speaker
 */
export async function removeParticipant(participantId: string): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await removeParticipantServer({
      data: {
        participantId,
        hostUserId: userId || "00000000-0000-0000-0000-000000000000",
      },
    });
    if (!response.success) {
      throw new Error(response.error || "Failed to remove speaker.");
    }
  } else {
    const p = localParticipants.find((x) => x.id === participantId);
    if (p) {
      p.participant_status = "removed";
      p.mic_enabled = false;
      p.left_at = new Date().toISOString();
    }
  }
}

/**
 * Lists participants inside the active live mic session
 */
export async function listLiveParticipants(sessionId: string): Promise<TradioLiveMicParticipant[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_live_mic_participants")
      .select("*")
      .eq("session_id", sessionId);

    if (error) throw error;
    return (data || []) as TradioLiveMicParticipant[];
  } else {
    return localParticipants.filter((p) => p.session_id === sessionId);
  }
}

/**
 * Lists call queue requests
 */
export async function listCallRequests(sessionId: string): Promise<TradioLiveCallRequest[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_live_call_requests")
      .select("*")
      .eq("session_id", sessionId)
      .eq("request_status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []) as TradioLiveCallRequest[];
  } else {
    return localRequests.filter((r) => r.session_id === sessionId && r.request_status === "pending");
  }
}

/**
 * Logs a session event (such as join, left, mute)
 */
export async function logMicSessionEvent(
  sessionId: string,
  roomId: string,
  channelId: string,
  eventType: string,
  participantId: string | null = null,
  playbackPositionSeconds: number | null = null,
): Promise<void> {
  const userId = await getUserId();
  if (isSupabaseConfigured && supabase) {
    await logLiveMicEventServer({
      data: {
        sessionId,
        roomId,
        channelId,
        participantId,
        userId,
        eventType,
        playbackPositionSeconds,
      },
    });
  } else {
    console.log(`[Offline Events] Session Event Logged: ${eventType}`);
  }
}
