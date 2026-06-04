import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  TradioLiveRoom,
  TradioLiveChatMessage,
  TradioLivePoll,
  TradioLivePollOption,
  LiveRoomPulseSummary,
  LiveRoomStatus,
} from "../../tradio/components/tradio/types/broadcastLiveRoomTypes";

/**
 * Server Function: Get or Create Live Room for a Channel
 */
export const resolveLiveRoomServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      channelId: string;
      queueId?: string | null;
      showId?: string | null;
      episodeId?: string | null;
    }) => input,
  )
  .handler(
    async ({
      data: input,
    }): Promise<{ success: boolean; room?: TradioLiveRoom; error?: string }> => {
      try {
        // 1. Fetch channel details to find owner and title
        const { data: channel, error: chanErr } = await (supabaseAdmin as any)
          .from("tradio_broadcast_channels")
          .select("*")
          .eq("id", input.channelId)
          .single();

        if (chanErr || !channel) {
          return {
            success: false,
            error: `Channel not found: ${chanErr?.message || "Unknown error"}`,
          };
        }

        // 2. Look for an existing open live room for this channel
        const { data: rooms, error: roomsErr } = await (supabaseAdmin as any)
          .from("tradio_live_rooms")
          .select("*")
          .eq("channel_id", input.channelId)
          .eq("room_status", "open")
          .order("created_at", { ascending: false });

        if (roomsErr) {
          return { success: false, error: `Failed to query existing rooms: ${roomsErr.message}` };
        }

        if (rooms && rooms.length > 0) {
          return { success: true, room: rooms[0] as TradioLiveRoom };
        }

        // 3. Create a new open live room since none exists
        const insertPayload = {
          channel_id: input.channelId,
          queue_id: input.queueId || null,
          show_id: input.showId || null,
          episode_id: input.episodeId || null,
          owner_user_id: channel.owner_user_id,
          room_status: "open" as LiveRoomStatus,
          visibility: channel.visibility,
          title: `${channel.title} Live Chat`,
          slow_mode_seconds: 5,
          chat_enabled: true,
          polls_enabled: true,
          reactions_enabled: true,
          metadata: {
            mood_tags: channel.mood_tags || [],
            genre_tags: channel.genre_tags || [],
            audience_tags: channel.audience_tags || [],
            creator_role: channel.creator_role || null,
          },
        };

        const { data: newRoom, error: createErr } = await (supabaseAdmin as any)
          .from("tradio_live_rooms")
          .insert(insertPayload)
          .select()
          .single();

        if (createErr || !newRoom) {
          return { success: false, error: `Failed to create live room: ${createErr?.message}` };
        }

        return { success: true, room: newRoom as TradioLiveRoom };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );

/**
 * Server Function: Send Live Room Chat Message
 */
export const sendLiveRoomMessageServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      roomId: string;
      channelId: string;
      queueId?: string | null;
      userId?: string | null;
      anonymousSessionId?: string | null;
      senderRole: string;
      messageText: string;
      messageType: string;
      playbackPositionSeconds?: number | null;
      metadata?: Record<string, any>;
    }) => input,
  )
  .handler(
    async ({
      data: input,
    }): Promise<{ success: boolean; message?: TradioLiveChatMessage; error?: string }> => {
      try {
        // 1. Verify Room State
        const { data: room, error: roomErr } = await (supabaseAdmin as any)
          .from("tradio_live_rooms")
          .select("*")
          .eq("id", input.roomId)
          .single();

        if (roomErr || !room) {
          return { success: false, error: "Room not found." };
        }

        if (room.room_status === "locked" || room.room_status === "ended") {
          return { success: false, error: `Chat room is ${room.room_status}.` };
        }

        if (!room.chat_enabled && input.senderRole === "listener") {
          return { success: false, error: "Chat is disabled in this room." };
        }

        // Escaping text to prevent HTML injection
        const sanitizedText = input.messageText
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");

        const insertPayload = {
          room_id: input.roomId,
          channel_id: input.channelId,
          queue_id: input.queueId || null,
          user_id: input.userId || null,
          anonymous_session_id: input.anonymousSessionId || null,
          sender_role: input.senderRole,
          message_text: sanitizedText,
          message_type: input.messageType || "chat",
          playback_position_seconds: input.playbackPositionSeconds || null,
          is_pinned: false,
          is_highlighted: false,
          moderation_status: "visible",
          metadata: input.metadata || {},
        };

        const { data: message, error: sendErr } = await (supabaseAdmin as any)
          .from("tradio_live_chat_messages")
          .insert(insertPayload)
          .select()
          .single();

        if (sendErr || !message) {
          return { success: false, error: `Failed to insert message: ${sendErr?.message}` };
        }

        return { success: true, message: message as TradioLiveChatMessage };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );

/**
 * Server Function: Create Live Poll
 */
export const createLivePollServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      roomId: string;
      channelId: string;
      queueId?: string | null;
      creatorUserId: string;
      question: string;
      allowMultiple?: boolean;
      showResultsMode?: string;
      options: string[];
      opensAt?: string | null;
      closesAt?: string | null;
    }) => input,
  )
  .handler(
    async ({
      data: input,
    }): Promise<{ success: boolean; poll?: TradioLivePoll; error?: string }> => {
      try {
        // 1. Verify Room Ownership or Admin
        const { data: room, error: roomErr } = await (supabaseAdmin as any)
          .from("tradio_live_rooms")
          .select("*")
          .eq("id", input.roomId)
          .single();

        if (roomErr || !room) {
          return { success: false, error: "Room not found." };
        }

        // Check if user is room owner
        if (room.owner_user_id !== input.creatorUserId) {
          // Double check admin helper
          const { data: isAdmin } = await (supabaseAdmin as any).rpc("is_admin", {
            _user_id: input.creatorUserId,
          });
          if (!isAdmin) {
            return {
              success: false,
              error: "Permission denied. Only creators or admins can open polls.",
            };
          }
        }

        // 2. Create the Poll
        const insertPollPayload = {
          room_id: input.roomId,
          channel_id: input.channelId,
          queue_id: input.queueId || null,
          creator_user_id: input.creatorUserId,
          question: input.question,
          poll_status: "active", // Activate instantly
          allow_multiple: input.allowMultiple || false,
          show_results_mode: input.showResultsMode || "after_vote",
          opens_at: input.opensAt || new Date().toISOString(),
          closes_at: input.closesAt || null,
          metadata: {},
        };

        const { data: poll, error: pollErr } = await (supabaseAdmin as any)
          .from("tradio_live_polls")
          .insert(insertPollPayload)
          .select()
          .single();

        if (pollErr || !poll) {
          return { success: false, error: `Failed to create poll: ${pollErr?.message}` };
        }

        // 3. Create the Poll Options
        const optionRecords = input.options.map((optText, index) => ({
          poll_id: poll.id,
          option_text: optText,
          sort_order: index,
          metadata: {},
        }));

        const { data: insertedOptions, error: optErr } = await (supabaseAdmin as any)
          .from("tradio_live_poll_options")
          .insert(optionRecords)
          .select();

        if (optErr) {
          // Cleanup poll on option failure
          await (supabaseAdmin as any).from("tradio_live_polls").delete().eq("id", poll.id);
          return { success: false, error: `Failed to create options: ${optErr.message}` };
        }

        const completedPoll: TradioLivePoll = {
          ...(poll as TradioLivePoll),
          options: (insertedOptions || []) as TradioLivePollOption[],
        };

        return { success: true, poll: completedPoll };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );

/**
 * Server Function: Submit Vote in Live Poll
 */
export const voteInLivePollServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      pollId: string;
      optionId: string;
      userId?: string | null;
      anonymousSessionId?: string | null;
      roomId: string;
      channelId: string;
      queueId?: string | null;
      playbackPositionSeconds?: number | null;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Fetch Poll Details and check status
      const { data: poll, error: pollErr } = await (supabaseAdmin as any)
        .from("tradio_live_polls")
        .select("*")
        .eq("id", input.pollId)
        .single();

      if (pollErr || !poll) {
        return { success: false, error: "Poll not found." };
      }

      if (poll.poll_status !== "active") {
        return { success: false, error: `This poll is currently ${poll.poll_status}.` };
      }

      // 2. If allow_multiple is false, verify they haven't voted on ANY option in this poll
      if (!poll.allow_multiple) {
        let query = (supabaseAdmin as any)
          .from("tradio_live_poll_votes")
          .select("*", { count: "exact", head: true })
          .eq("poll_id", input.pollId);

        if (input.userId) {
          query = query.eq("user_id", input.userId);
        } else if (input.anonymousSessionId) {
          query = query.eq("anonymous_session_id", input.anonymousSessionId);
        } else {
          return {
            success: false,
            error: "Either userId or anonymousSessionId is required to vote.",
          };
        }

        const { count, error: countErr } = await query;
        if (countErr) {
          return { success: false, error: `Verification failed: ${countErr.message}` };
        }

        if (count && count > 0) {
          return { success: false, error: "Already voted in this poll." };
        }
      }

      // 3. Insert the Vote
      const insertPayload = {
        poll_id: input.pollId,
        option_id: input.optionId,
        user_id: input.userId || null,
        anonymous_session_id: input.anonymousSessionId || null,
        room_id: input.roomId,
        channel_id: input.channelId,
        queue_id: input.queueId || null,
        playback_position_seconds: input.playbackPositionSeconds || null,
        metadata: {},
      };

      const { error: voteErr } = await (supabaseAdmin as any)
        .from("tradio_live_poll_votes")
        .insert(insertPayload);

      if (voteErr) {
        return { success: false, error: `Failed to cast vote: ${voteErr.message}` };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Moderate Message (Admin/Host Only)
 */
export const moderateLiveMessageServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      messageId: string;
      moderatorUserId: string;
      action: "hide" | "remove" | "flag" | "restore";
      notes?: string;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Fetch message details to find room
      const { data: message, error: msgErr } = await (supabaseAdmin as any)
        .from("tradio_live_chat_messages")
        .select("*")
        .eq("id", input.messageId)
        .single();

      if (msgErr || !message) {
        return { success: false, error: "Message not found." };
      }

      // 2. Fetch room to check owner
      const { data: room, error: roomErr } = await (supabaseAdmin as any)
        .from("tradio_live_rooms")
        .select("*")
        .eq("id", message.room_id)
        .single();

      if (roomErr || !room) {
        return { success: false, error: "Associated chat room not found." };
      }

      // 3. Enforce Permissions
      if (room.owner_user_id !== input.moderatorUserId) {
        const { data: isAdmin } = await (supabaseAdmin as any).rpc("is_admin", {
          _user_id: input.moderatorUserId,
        });
        if (!isAdmin) {
          return {
            success: false,
            error: "Permission denied. Only creators or admins can moderate chat messages.",
          };
        }
      }

      // 4. Map action to status
      let newStatus: "visible" | "hidden" | "flagged" | "removed" = "visible";
      if (input.action === "hide") newStatus = "hidden";
      else if (input.action === "remove") newStatus = "removed";
      else if (input.action === "flag") newStatus = "flagged";

      // 5. Update message status
      const { error: updateErr } = await (supabaseAdmin as any)
        .from("tradio_live_chat_messages")
        .update({
          moderation_status: newStatus,
          metadata: {
            ...message.metadata,
            moderated_by: input.moderatorUserId,
            moderated_at: new Date().toISOString(),
            notes: input.notes || null,
          },
        })
        .eq("id", input.messageId);

      if (updateErr) {
        return { success: false, error: `Failed to moderate message: ${updateErr.message}` };
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Report Live Message (Abuse / Spam Reporting)
 */
export const reportLiveMessageServer = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      roomId: string;
      messageId: string;
      reportedUserId?: string | null;
      reporterUserId?: string | null;
      anonymousSessionId?: string | null;
      reason: string;
    }) => input,
  )
  .handler(async ({ data: input }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Check if reported message exists
      const { data: message, error: msgErr } = await (supabaseAdmin as any)
        .from("tradio_live_chat_messages")
        .select("*")
        .eq("id", input.messageId)
        .single();

      if (msgErr || !message) {
        return { success: false, error: "Message to report was not found." };
      }

      // 2. Insert report record
      const insertReportPayload = {
        room_id: input.roomId,
        message_id: input.messageId,
        reported_user_id: input.reportedUserId || message.user_id,
        reporter_user_id: input.reporterUserId || null,
        anonymous_session_id: input.anonymousSessionId || null,
        reason: input.reason,
        report_status: "pending",
        metadata: {},
      };

      const { error: reportErr } = await (supabaseAdmin as any)
        .from("tradio_live_moderation_reports")
        .insert(insertReportPayload);

      if (reportErr) {
        return { success: false, error: `Failed to file report: ${reportErr.message}` };
      }

      // Auto flag message to 'flagged' status if multiple reports occur, or just set it to 'flagged' immediately for safety
      await (supabaseAdmin as any)
        .from("tradio_live_chat_messages")
        .update({ moderation_status: "flagged" })
        .eq("id", input.messageId);

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

/**
 * Server Function: Get Live Room Pulse / Analytical metrics rollup
 */
export const getLiveRoomPulseServer = createServerFn({ method: "POST" })
  .inputValidator((input: { channelId: string; roomId: string }) => input)
  .handler(
    async ({
      data: input,
    }): Promise<{ success: boolean; pulse?: LiveRoomPulseSummary; error?: string }> => {
      try {
        // 1. Resolve Active Listeners (sessions updated in last 2 minutes with no ended_at)
        const twoMinutesAgo = new Date(Date.now() - 120000).toISOString();
        const { count: listenersCount, error: sessionErr } = await (supabaseAdmin as any)
          .from("tradio_broadcast_listening_sessions")
          .select("*", { count: "exact", head: true })
          .eq("channel_id", input.channelId)
          .is("ended_at", null)
          .gt("updated_at", twoMinutesAgo);

        // 2. Get chat metrics
        const { count: msgCount } = await (supabaseAdmin as any)
          .from("tradio_live_chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", input.roomId);

        // Unique chatters count
        const { data: uniqueChattersData } = await (supabaseAdmin as any)
          .from("tradio_live_chat_messages")
          .select("user_id, anonymous_session_id")
          .eq("room_id", input.roomId);

        const uniqueChattersSet = new Set();
        (uniqueChattersData || []).forEach((c: any) => {
          if (c.user_id) uniqueChattersSet.add(c.user_id);
          else if (c.anonymous_session_id) uniqueChattersSet.add(c.anonymous_session_id);
        });
        const uniqueChatters = uniqueChattersSet.size;

        // 3. Poll counts
        const { count: voteCount } = await (supabaseAdmin as any)
          .from("tradio_live_poll_votes")
          .select("*", { count: "exact", head: true })
          .eq("room_id", input.roomId);

        const { count: activePolls } = await (supabaseAdmin as any)
          .from("tradio_live_polls")
          .select("*", { count: "exact", head: true })
          .eq("room_id", input.roomId)
          .eq("poll_status", "active");

        // 4. Shoutouts and reports
        const { count: shoutouts } = await (supabaseAdmin as any)
          .from("tradio_live_chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("room_id", input.roomId)
          .eq("message_type", "shoutout");

        const { count: reports } = await (supabaseAdmin as any)
          .from("tradio_live_moderation_reports")
          .select("*", { count: "exact", head: true })
          .eq("room_id", input.roomId);

        // 5. Calculate Engagement Rate (Unique Engagers / Listeners)
        const activeListeners = listenersCount || 1; // avoid division by zero
        const engagers = uniqueChattersSet.size; // chatters
        const engagementRate = Math.min(100, Math.round((engagers / activeListeners) * 100));

        // 6. Find Top Poll Option
        let topOption = null;
        const { data: activePollList } = await (supabaseAdmin as any)
          .from("tradio_live_polls")
          .select("id, question")
          .eq("room_id", input.roomId)
          .eq("poll_status", "active")
          .limit(1);

        if (activePollList && activePollList.length > 0) {
          const activePoll = activePollList[0];
          // Fetch option counts
          const { data: voteSummary, error: voteSumErr } = await (supabaseAdmin as any)
            .from("tradio_live_poll_votes")
            .select("option_id")
            .eq("poll_id", activePoll.id);

          if (!voteSumErr && voteSummary && voteSummary.length > 0) {
            const tally: Record<string, number> = {};
            voteSummary.forEach((v: any) => {
              tally[v.option_id] = (tally[v.option_id] || 0) + 1;
            });

            let bestOptionId = "";
            let maxVotes = 0;
            Object.entries(tally).forEach(([optId, vCount]) => {
              if (vCount > maxVotes) {
                maxVotes = vCount;
                bestOptionId = optId;
              }
            });

            if (bestOptionId) {
              // Fetch option text
              const { data: optRec } = await (supabaseAdmin as any)
                .from("tradio_live_poll_options")
                .select("option_text")
                .eq("id", bestOptionId)
                .single();

              if (optRec) {
                topOption = {
                  poll_id: activePoll.id,
                  question: activePoll.question,
                  option_id: bestOptionId,
                  option_text: optRec.option_text,
                  votes: maxVotes,
                };
              }
            }
          }
        }

        // 7. Find Top Reaction Moment (playback second with most reactions)
        let topReactionMoment = null;
        const { data: reactionData } = await (supabaseAdmin as any)
          .from("tradio_broadcast_reactions")
          .select("playback_position_seconds")
          .eq("channel_id", input.channelId);

        if (reactionData && reactionData.length > 0) {
          const buckets: Record<number, number> = {};
          reactionData.forEach((r: any) => {
            if (r.playback_position_seconds !== null && r.playback_position_seconds !== undefined) {
              const secondBucket = Math.floor(Number(r.playback_position_seconds));
              buckets[secondBucket] = (buckets[secondBucket] || 0) + 1;
            }
          });

          let peakSecond = 0;
          let peakCount = 0;
          Object.entries(buckets).forEach(([sec, rCount]) => {
            if (rCount > peakCount) {
              peakCount = rCount;
              peakSecond = Number(sec);
            }
          });

          if (peakCount > 0) {
            topReactionMoment = {
              second: peakSecond,
              count: peakCount,
            };
          }
        }

        const pulse: LiveRoomPulseSummary = {
          channel_id: input.channelId,
          room_id: input.roomId,
          active_listeners: activeListeners,
          chat_message_count: msgCount || 0,
          unique_chatters: uniqueChatters,
          poll_vote_count: voteCount || 0,
          active_poll_count: activePolls || 0,
          shoutout_count: shoutouts || 0,
          report_count: reports || 0,
          engagement_rate: engagementRate,
          top_poll_option: topOption,
          top_reaction_moment: topReactionMoment,
        };

        return { success: true, pulse };
      } catch (e: any) {
        return { success: false, error: e.message };
      }
    },
  );
