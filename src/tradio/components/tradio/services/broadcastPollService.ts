import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { TradioLivePoll, TradioLivePollOption } from "../types/broadcastLiveRoomTypes";
import {
  createLivePollServer,
  voteInLivePollServer,
} from "../../../../lib/trey-i/broadcastLiveRoom.server";

// Local in-memory store for offline fallback simulation
let localPolls: TradioLivePoll[] = [];
let localVotes: Array<{
  poll_id: string;
  option_id: string;
  user_id: string | null;
  anonymous_session_id: string | null;
}> = [];
const OFFLINE_USER_ID = "00000000-0000-0000-0000-000000000000";

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
 * Creates a poll and its option list
 */
export async function createLivePoll(
  roomId: string,
  channelId: string,
  question: string,
  options: string[],
  allowMultiple: boolean = false,
  showResultsMode: "always" | "after_vote" | "after_close" | "never" = "after_vote",
  queueId: string | null = null,
): Promise<TradioLivePoll> {
  const userId = await getUserId();
  if (!userId && isSupabaseConfigured) {
    throw new Error("You must be logged in to create a poll.");
  }

  if (isSupabaseConfigured && supabase) {
    const response = await createLivePollServer({
      data: {
        roomId,
        channelId,
        queueId,
        creatorUserId: userId || OFFLINE_USER_ID,
        question,
        allowMultiple,
        showResultsMode,
        options,
      },
    });

    if (response.success && response.poll) {
      return response.poll;
    }
    throw new Error(response.error || "Failed to create poll on server.");
  } else {
    // Offline Mock Fallback
    const mockPollId = `poll-mock-${Date.now()}`;
    const mockOptions: TradioLivePollOption[] = options.map((txt, index) => ({
      id: `opt-mock-${mockPollId}-${index}`,
      poll_id: mockPollId,
      option_text: txt,
      sort_order: index,
      metadata: {},
      created_at: new Date().toISOString(),
    }));

    const mockPoll: TradioLivePoll = {
      id: mockPollId,
      room_id: roomId,
      channel_id: channelId,
      queue_id: queueId,
      creator_user_id: userId || OFFLINE_USER_ID,
      question,
      poll_status: "active",
      allow_multiple: allowMultiple,
      show_results_mode: showResultsMode,
      opens_at: new Date().toISOString(),
      closes_at: null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      options: mockOptions,
    };

    localPolls.push(mockPoll);
    return mockPoll;
  }
}

/**
 * Closes an active live poll
 */
export async function closeLivePoll(pollId: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("tradio_live_polls")
      .update({ poll_status: "closed", closes_at: new Date().toISOString() })
      .eq("id", pollId);
    if (error) throw error;
  } else {
    // Offline Mock Fallback
    const poll = localPolls.find((p) => p.id === pollId);
    if (poll) {
      poll.poll_status = "closed";
      poll.closes_at = new Date().toISOString();
    }
  }
}

/**
 * Lists active and closed polls in a room, retrieving options and calculating live results
 */
export async function listActivePollsForRoom(roomId: string): Promise<TradioLivePoll[]> {
  const userId = await getUserId();
  const anonymousSessionId = "anon-sess-local-id"; // fallback anon id

  if (isSupabaseConfigured && supabase) {
    // 1. Fetch polls
    const { data: polls, error: pollErr } = await supabase
      .from("tradio_live_polls")
      .select("*")
      .eq("room_id", roomId)
      .neq("poll_status", "hidden")
      .order("created_at", { ascending: false });

    if (pollErr) throw pollErr;
    if (!polls || polls.length === 0) return [];

    const resultList: TradioLivePoll[] = [];

    for (const poll of polls) {
      // 2. Fetch options
      const { data: options, error: optErr } = await supabase
        .from("tradio_live_poll_options")
        .select("*")
        .eq("poll_id", poll.id)
        .order("sort_order", { ascending: true });

      if (optErr) throw optErr;

      // 3. Fetch votes for tallies
      const { data: votes, error: voteErr } = await supabase
        .from("tradio_live_poll_votes")
        .select("option_id, user_id, anonymous_session_id")
        .eq("poll_id", poll.id);

      if (voteErr) throw voteErr;

      // Count votes per option & check if current user voted
      const tally: Record<string, number> = {};
      let votedByMe = false;
      const userVotedOptionIds = new Set<string>();

      (votes || []).forEach((v: any) => {
        tally[v.option_id] = (tally[v.option_id] || 0) + 1;
        if (userId && v.user_id === userId) {
          userVotedOptionIds.add(v.option_id);
          votedByMe = true;
        } else if (!userId && v.anonymous_session_id === anonymousSessionId) {
          userVotedOptionIds.add(v.option_id);
          votedByMe = true;
        }
      });

      const optionsWithVotes = (options || []).map((o: any) => ({
        ...o,
        vote_count: tally[o.id] || 0,
        voted_by_me: userVotedOptionIds.has(o.id),
      })) as TradioLivePollOption[];

      resultList.push({
        ...(poll as TradioLivePoll),
        options: optionsWithVotes,
      });
    }

    return resultList;
  } else {
    // Offline Mock Fallback
    const polls = localPolls.filter((p) => p.room_id === roomId && p.poll_status !== "hidden");
    if (polls.length === 0) {
      // Inject an initial mock active poll for immediate engagement
      const mockPollId = `poll-init-${roomId}`;
      const mockOptions: TradioLivePollOption[] = [
        {
          id: `opt-1-${mockPollId}`,
          poll_id: mockPollId,
          option_text: "Pure Fire 🔥",
          sort_order: 0,
          metadata: {},
          created_at: new Date().toISOString(),
          vote_count: 5,
          voted_by_me: false,
        },
        {
          id: `opt-2-${mockPollId}`,
          poll_id: mockPollId,
          option_text: "Super Smooth 🌊",
          sort_order: 1,
          metadata: {},
          created_at: new Date().toISOString(),
          vote_count: 8,
          voted_by_me: true,
        },
        {
          id: `opt-3-${mockPollId}`,
          poll_id: mockPollId,
          option_text: "Let it Cook 🍳",
          sort_order: 2,
          metadata: {},
          created_at: new Date().toISOString(),
          vote_count: 3,
          voted_by_me: false,
        },
      ];
      const initialMock: TradioLivePoll = {
        id: mockPollId,
        room_id: roomId,
        channel_id: "chan-mock-1",
        queue_id: null,
        creator_user_id: OFFLINE_USER_ID,
        question: "How is this lofi mix hitting for you guys right now?",
        poll_status: "active",
        allow_multiple: false,
        show_results_mode: "after_vote",
        opens_at: new Date().toISOString(),
        closes_at: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        options: mockOptions,
      };
      localPolls.push(initialMock);
      return [initialMock];
    }

    // Enrich existing local polls with vote tallies
    return polls.map((p) => {
      const optionsWithVotes = (p.options || []).map((o) => {
        const votesForOpt = localVotes.filter((v) => v.poll_id === p.id && v.option_id === o.id);
        const votedByMe = votesForOpt.some(
          (v) => v.user_id === userId || v.anonymous_session_id === anonymousSessionId,
        );
        return {
          ...o,
          vote_count: o.vote_count !== undefined ? o.vote_count : votesForOpt.length,
          voted_by_me: o.voted_by_me !== undefined ? o.voted_by_me : votedByMe,
        };
      });
      return { ...p, options: optionsWithVotes };
    });
  }
}

/**
 * Casts a vote in a live poll
 */
export async function voteInLivePoll(
  pollId: string,
  optionId: string,
  roomId: string,
  channelId: string,
  queueId: string | null = null,
  playbackPositionSeconds: number | null = null,
  anonymousSessionId: string | null = null,
): Promise<void> {
  const userId = await getUserId();

  if (isSupabaseConfigured && supabase) {
    const response = await voteInLivePollServer({
      data: {
        pollId,
        optionId,
        roomId,
        channelId,
        queueId,
        userId,
        anonymousSessionId,
        playbackPositionSeconds,
      },
    });

    if (!response.success) {
      throw new Error(response.error || "Failed to submit poll vote.");
    }
  } else {
    // Offline Mock Fallback
    const poll = localPolls.find((p) => p.id === pollId);
    if (!poll) throw new Error("Poll not found.");
    if (poll.poll_status !== "active") throw new Error("Poll is closed.");

    const alreadyVoted = localVotes.some(
      (v) =>
        v.poll_id === pollId &&
        (v.user_id === userId || v.anonymous_session_id === anonymousSessionId),
    );
    if (alreadyVoted && !poll.allow_multiple) {
      throw new Error("Already voted in this poll.");
    }

    localVotes.push({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId || OFFLINE_USER_ID,
      anonymous_session_id: anonymousSessionId,
    });

    // Manually increment locally stored mock count
    if (poll.options) {
      const opt = poll.options.find((o) => o.id === optionId);
      if (opt) {
        opt.vote_count = (opt.vote_count || 0) + 1;
        opt.voted_by_me = true;
      }
    }
  }
}
