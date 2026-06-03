import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/tradio/lib/supabaseClient";
import {
  sendChat,
  listChat,
  submitRequest,
  listRequests,
  setRequestStatus,
  createPoll,
  closePoll,
  getActivePoll,
  votePoll,
  listVotes,
  computePollTallies,
  type ChatMessage,
  type SongRequest,
  type LivePoll,
  type PollVote,
} from "./tradioLiveInteractionService";
import type { PollOption, PollTally, RequestStatus } from "./liveInteractionLogic";

export interface LiveInteraction {
  chat: ChatMessage[];
  requests: SongRequest[];
  activePoll: LivePoll | null;
  tallies: PollTally[];
  sendChat: (body: string) => Promise<{ error: string | null }>;
  submitRequest: (input: {
    songTitle: string;
    artist?: string;
    message?: string;
  }) => Promise<{ error: string | null }>;
  setRequestStatus: (requestId: string, status: RequestStatus) => Promise<void>;
  createPoll: (question: string, options: PollOption[]) => Promise<{ error: string | null }>;
  closePoll: () => Promise<void>;
  votePoll: (optionId: string) => Promise<{ error: string | null }>;
}

export function useTradioLiveInteraction(opts: { sessionId: string | null }): LiveInteraction {
  const { sessionId } = opts;
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [requests, setRequests] = useState<SongRequest[]>([]);
  const [activePoll, setActivePoll] = useState<LivePoll | null>(null);
  const [votes, setVotes] = useState<PollVote[]>([]);

  const reloadChat = useCallback(async () => {
    if (sessionId) setChat(await listChat(sessionId));
  }, [sessionId]);
  const reloadRequests = useCallback(async () => {
    if (sessionId) setRequests(await listRequests(sessionId));
  }, [sessionId]);
  const reloadPoll = useCallback(async () => {
    if (!sessionId) return;
    const poll = await getActivePoll(sessionId);
    setActivePoll(poll);
    setVotes(poll ? await listVotes(poll.id) : []);
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !supabase) return;
    void reloadChat();
    void reloadRequests();
    void reloadPoll();
    const ch = supabase
      .channel(`tradio-live:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradio_live_chat",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void reloadChat(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradio_live_requests",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void reloadRequests(),
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tradio_live_polls",
          filter: `session_id=eq.${sessionId}`,
        },
        () => void reloadPoll(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tradio_live_poll_votes" },
        () => void reloadPoll(),
      )
      .subscribe();
    return () => {
      void supabase!.removeChannel(ch);
    };
  }, [sessionId, reloadChat, reloadRequests, reloadPoll]);

  const tallies = activePoll ? computePollTallies(activePoll.options, votes) : [];

  return {
    chat,
    requests,
    activePoll,
    tallies,
    sendChat: (body) => sendChat(sessionId!, body),
    submitRequest: (input) => submitRequest({ sessionId: sessionId!, ...input }),
    setRequestStatus: (requestId, status) => setRequestStatus(requestId, status),
    createPoll: (question, options) => createPoll({ sessionId: sessionId!, question, options }),
    closePoll: async () => {
      if (activePoll) await closePoll(activePoll.id);
    },
    votePoll: (optionId) =>
      activePoll ? votePoll(activePoll.id, optionId) : Promise.resolve({ error: "No active poll" }),
  };
}
