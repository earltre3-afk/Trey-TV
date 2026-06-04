import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { AccessToken } from "livekit-server-sdk";
import {
  TradioLiveMicSession,
  TradioLiveMicParticipant,
  TradioLiveCallRequest,
} from "../../tradio/components/tradio/types/broadcastLiveMicTypes";

const LIVEKIT_URL = process.env.LIVEKIT_URL || "";
const LIVEKIT_API_KEY = process.env.LIVEKIT_API_KEY || "";
const LIVEKIT_API_SECRET = process.env.LIVEKIT_API_SECRET || "";

function isLiveKitConfigured(): boolean {
  return Boolean(LIVEKIT_URL && LIVEKIT_API_KEY && LIVEKIT_API_SECRET);
}

// Helper to double-check host or admin privileges
async function verifyHostOrAdmin(userId: string, roomId: string): Promise<boolean> {
  try {
    const { data: adminCheck } = await supabaseAdmin.rpc("is_admin", {
      _user_id: userId,
    });
    if (adminCheck) return true;

    const { data: room, error: roomErr } = await (supabaseAdmin as any)
      .from("tradio_live_rooms")
      .select("owner_user_id, channel_id")
      .eq("id", roomId)
      .single();

    if (roomErr || !room) return false;
    if (room.owner_user_id === userId) return true;

    const { data: channel, error: chanErr } = await (supabaseAdmin as any)
      .from("tradio_broadcast_channels")
      .select("owner_user_id")
      .eq("id", room.channel_id)
      .single();

    if (!chanErr && channel && channel.owner_user_id === userId) {
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

/**
 * 1. createLiveMicSessionServer
 */
export const createLiveMicSessionServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      roomId: string;
      channelId: string;
      queueId?: string | null;
      showId?: string | null;
      episodeId?: string | null;
      hostUserId: string;
    }) => input,
  )
  .handler(
    async ({
      data: input,
    }): Promise<{ success: boolean; session?: TradioLiveMicSession; error?: string }> => {
      try {
        const canManage = await verifyHostOrAdmin(input.hostUserId, input.roomId);
        if (!canManage) {
          return { success: false, error: "Unauthorized to start live mic on this room." };
        }

        // Cancel previous live sessions to prevent stale rooms
        await (supabaseAdmin as any)
          .from("tradio_live_mic_sessions")
          .update({ session_status: "archived", ended_at: new Date().toISOString() })
          .eq("room_id", input.roomId)
          .eq("session_status", "live");

        const insertPayload = {
          room_id: input.roomId,
          channel_id: input.channelId,
          queue_id: input.queueId || null,
          show_id: input.showId || null,
          episode_id: input.episodeId || null,
          host_user_id: input.hostUserId,
          session_status: "pending",
          provider_room_name: `room-${input.roomId}-${Date.now()}`,
          mic_mode: "host_only",
          background_audio_mode: "duck_on_host",
          recording_enabled: false,
          max_speakers: 4,
          max_callers_waiting: 25,
          metadata: {},
        };

        const { data: newSession, error: createErr } = await (supabaseAdmin as any)
          .from("tradio_live_mic_sessions")
          .insert(insertPayload)
          .select()
          .single();

        if (createErr || !newSession) {
          return { success: false, error: `Failed to create session: ${createErr?.message}` };
        }

        return { success: true, session: newSession as TradioLiveMicSession };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );

/**
 * 2. startLiveMicSessionServer
 */
export const startLiveMicSessionServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      sessionId: string;
      hostUserId: string;
      micMode?: string;
      backgroundAudioMode?: string;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: session, error: sessErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_sessions")
        .select("*")
        .eq("id", input.sessionId)
        .single();

      if (sessErr || !session) return { success: false, error: "Session not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, session.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      const updates: any = {
        session_status: "live",
        started_at: new Date().toISOString(),
      };
      if (input.micMode) updates.mic_mode = input.micMode;
      if (input.backgroundAudioMode) updates.background_audio_mode = input.backgroundAudioMode;

      const { error: updateErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_sessions")
        .update(updates)
        .eq("id", input.sessionId);

      if (updateErr) return { success: false, error: updateErr.message };

      // Set host as joined participant
      const hostPayload = {
        session_id: input.sessionId,
        room_id: session.room_id,
        channel_id: session.channel_id,
        user_id: input.hostUserId,
        participant_role: "host",
        participant_status: "live",
        mic_enabled: true,
        is_muted_by_host: false,
        is_muted_self: false,
        joined_at: new Date().toISOString(),
      };

      await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .insert(hostPayload);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 3. endLiveMicSessionServer
 */
export const endLiveMicSessionServer = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionId: string; hostUserId: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: session, error: sessErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_sessions")
        .select("*")
        .eq("id", input.sessionId)
        .single();

      if (sessErr || !session) return { success: false, error: "Session not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, session.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      await (supabaseAdmin as any)
        .from("tradio_live_mic_sessions")
        .update({
          session_status: "ended",
          ended_at: new Date().toISOString(),
        })
        .eq("id", input.sessionId);

      // Archive remaining participants
      await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .update({
          participant_status: "left",
          left_at: new Date().toISOString(),
        })
        .eq("session_id", input.sessionId);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 4. createHostLiveMicTokenServer
 */
export const createHostLiveMicTokenServer = createServerFn({ method: "POST" })
  .inputValidator((input: { sessionId: string; hostUserId: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      const { data: session, error: sessErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_sessions")
        .select("*")
        .eq("id", input.sessionId)
        .single();

      if (sessErr || !session) return { success: false, error: "Session not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, session.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      if (!isLiveKitConfigured()) {
        return { success: true, token: "mock-host-token-unconfigured" };
      }

      // Generate LiveKit token
      const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity: `host-${input.hostUserId}`,
        name: "Broadcaster Host",
      });

      at.addGrant({
        roomJoin: true,
        room: session.provider_room_name || `room-${session.room_id}`,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        roomAdmin: true,
      });

      const token = await at.toJwt();
      return { success: true, token };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 5. createParticipantLiveMicTokenServer
 */
export const createParticipantLiveMicTokenServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      sessionId: string;
      userId: string | null;
      anonymousSessionId?: string | null;
      displayName?: string;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
      const { data: session, error: sessErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_sessions")
        .select("*")
        .eq("id", input.sessionId)
        .single();

      if (sessErr || !session) return { success: false, error: "Session not found." };

      // Verify participant is actually invited/approved in database to speak
      let query = (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .select("*")
        .eq("session_id", input.sessionId);

      if (input.userId) {
        query = query.eq("user_id", input.userId);
      } else if (input.anonymousSessionId) {
        query = query.eq("anonymous_session_id", input.anonymousSessionId);
      } else {
        return { success: false, error: "User verification parameters required." };
      }

      const { data: pCheck, error: pErr } = await query;
      if (pErr || !pCheck || pCheck.length === 0) {
        return { success: false, error: "No participant seat has been approved for you." };
      }

      const participant = pCheck[0];
      const isApproved =
        participant.participant_role === "cohost" ||
        participant.participant_role === "host" ||
        participant.participant_status === "approved" ||
        participant.participant_status === "live";

      if (!isApproved) {
        return { success: false, error: "Speaker seat not yet active/approved." };
      }

      if (!isLiveKitConfigured()) {
        return { success: true, token: `mock-speaker-token-${participant.participant_role}` };
      }

      const identity = input.userId ? `user-${input.userId}` : `anon-${input.anonymousSessionId}`;
      const name = input.displayName || participant.display_name || "Guest Speaker";

      const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
        identity,
        name,
      });

      at.addGrant({
        roomJoin: true,
        room: session.provider_room_name || `room-${session.room_id}`,
        canPublish: true,
        canSubscribe: true,
        canPublishData: true,
        roomAdmin: false,
      });

      const token = await at.toJwt();
      return { success: true, token };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 6. requestCallInServer
 */
export const requestCallInServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      sessionId: string;
      roomId: string;
      channelId: string;
      queueId?: string | null;
      userId: string | null;
      anonymousSessionId?: string | null;
      requestNote?: string;
      playbackPositionSeconds?: number | null;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; request?: TradioLiveCallRequest; error?: string }> => {
    try {
      const { data: activeSession } = await (supabaseAdmin as any)
        .from("tradio_live_mic_sessions")
        .select("mic_mode")
        .eq("id", input.sessionId)
        .eq("session_status", "live")
        .single();

      if (!activeSession || activeSession.mic_mode !== "call_in_queue") {
        return { success: false, error: "The host is not currently accepting listener call-ins." };
      }

      // Avoid duplicates
      let checkQuery = (supabaseAdmin as any)
        .from("tradio_live_call_requests")
        .select("id")
        .eq("session_id", input.sessionId)
        .eq("request_status", "pending");

      if (input.userId) {
        checkQuery = checkQuery.eq("requester_user_id", input.userId);
      } else {
        checkQuery = checkQuery.eq("anonymous_session_id", input.anonymousSessionId);
      }

      const { data: exists } = await checkQuery;
      if (exists && exists.length > 0) {
        return { success: false, error: "You already have a pending call-in request in queue." };
      }

      const payload = {
        session_id: input.sessionId,
        room_id: input.roomId,
        channel_id: input.channelId,
        queue_id: input.queueId || null,
        requester_user_id: input.userId || null,
        anonymous_session_id: input.anonymousSessionId || null,
        request_status: "pending",
        request_note: input.requestNote || null,
        playback_position_seconds: input.playbackPositionSeconds || null,
        metadata: {},
      };

      const { data: req, error: insErr } = await (supabaseAdmin as any)
        .from("tradio_live_call_requests")
        .insert(payload)
        .select()
        .single();

      if (insErr) return { success: false, error: insErr.message };

      return { success: true, request: req as TradioLiveCallRequest };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 7. approveCallInServer
 */
export const approveCallInServer = createServerFn({ method: "POST" })
  .inputValidator((input: { requestId: string; hostUserId: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: req, error: reqErr } = await (supabaseAdmin as any)
        .from("tradio_live_call_requests")
        .select("*")
        .eq("id", input.requestId)
        .single();

      if (reqErr || !req) return { success: false, error: "Request not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, req.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      await (supabaseAdmin as any)
        .from("tradio_live_call_requests")
        .update({
          request_status: "approved",
          host_decision_user_id: input.hostUserId,
        })
        .eq("id", input.requestId);

      // Fetch user profile details for display_name mapping if present
      let displayName = "Caller Guest";
      if (req.requester_user_id) {
        const { data: p } = await (supabaseAdmin as any)
          .from("profiles")
          .select("display_name, username")
          .eq("id", req.requester_user_id)
          .single();
        if (p) displayName = p.display_name || p.username || "Trizzy Fan";
      }

      // Add to participants list
      const partPayload = {
        session_id: req.session_id,
        room_id: req.room_id,
        channel_id: req.channel_id,
        user_id: req.requester_user_id,
        anonymous_session_id: req.anonymous_session_id,
        participant_role: "caller",
        participant_status: "approved",
        display_name: displayName,
        mic_enabled: false,
        is_muted_by_host: false,
        is_muted_self: true,
        joined_at: new Date().toISOString(),
      };

      await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .insert(partPayload);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 8. rejectCallInServer
 */
export const rejectCallInServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: { requestId: string; hostUserId: string; reason?: string }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: req, error: reqErr } = await (supabaseAdmin as any)
        .from("tradio_live_call_requests")
        .select("room_id")
        .eq("id", input.requestId)
        .single();

      if (reqErr || !req) return { success: false, error: "Request not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, req.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      await (supabaseAdmin as any)
        .from("tradio_live_call_requests")
        .update({
          request_status: "rejected",
          host_decision_user_id: input.hostUserId,
          decision_reason: input.reason || "Rejected by Host",
        })
        .eq("id", input.requestId);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 9. muteParticipantServer
 */
export const muteParticipantServer = createServerFn({ method: "POST" })
  .inputValidator((input: { participantId: string; hostUserId: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: p, error: pErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .select("room_id, session_id")
        .eq("id", input.participantId)
        .single();

      if (pErr || !p) return { success: false, error: "Participant not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, p.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .update({
          is_muted_by_host: true,
          mic_enabled: false,
        })
        .eq("id", input.participantId);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 10. unmuteParticipantServer
 */
export const unmuteParticipantServer = createServerFn({ method: "POST" })
  .inputValidator((input: { participantId: string; hostUserId: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: p, error: pErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .select("room_id")
        .eq("id", input.participantId)
        .single();

      if (pErr || !p) return { success: false, error: "Participant not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, p.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .update({
          is_muted_by_host: false,
        })
        .eq("id", input.participantId);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 11. removeParticipantServer
 */
export const removeParticipantServer = createServerFn({ method: "POST" })
  .inputValidator((input: { participantId: string; hostUserId: string }) => input)
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data: p, error: pErr } = await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .select("room_id, session_id")
        .eq("id", input.participantId)
        .single();

      if (pErr || !p) return { success: false, error: "Participant not found." };

      const canManage = await verifyHostOrAdmin(input.hostUserId, p.room_id);
      if (!canManage) return { success: false, error: "Unauthorized." };

      await (supabaseAdmin as any)
        .from("tradio_live_mic_participants")
        .update({
          participant_status: "removed",
          mic_enabled: false,
          left_at: new Date().toISOString(),
        })
        .eq("id", input.participantId);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 12. triggerSfxDropServer
 */
export const triggerSfxDropServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      sessionId: string;
      roomId: string;
      channelId: string;
      sfxDropId: string;
      userId: string;
      playbackPositionSeconds?: number | null;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const isAuthorized = await verifyHostOrAdmin(input.userId, input.roomId);
      if (!isAuthorized) return { success: false, error: "Unauthorized to trigger sound drops." };

      const payload = {
        session_id: input.sessionId,
        room_id: input.roomId,
        channel_id: input.channelId,
        sfx_drop_id: input.sfxDropId,
        triggered_by_user_id: input.userId,
        playback_position_seconds: input.playbackPositionSeconds || null,
        event_status: "triggered",
        metadata: {},
      };

      await (supabaseAdmin as any)
        .from("tradio_live_sfx_events")
        .insert(payload);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * 13. logLiveMicEventServer
 */
export const logLiveMicEventServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      sessionId: string;
      roomId: string;
      channelId: string;
      participantId?: string | null;
      userId?: string | null;
      eventType: string;
      playbackPositionSeconds?: number | null;
      metadata?: Record<string, any>;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      const payload = {
        session_id: input.sessionId,
        room_id: input.roomId,
        channel_id: input.channelId,
        participant_id: input.participantId || null,
        user_id: input.userId || null,
        event_type: input.eventType,
        event_status: "recorded",
        playback_position_seconds: input.playbackPositionSeconds || null,
        metadata: input.metadata || {},
      };

      await (supabaseAdmin as any)
        .from("tradio_live_mic_events")
        .insert(payload);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
