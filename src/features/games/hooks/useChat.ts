import { useCallback, useEffect, useRef, useState } from 'react';
import { ChatMessageRow, fetchChatMessages, sendChatMessage } from '../lib/services/chatService';
import { PlayerIdentity } from '../lib/services/identity';

interface UseChatOpts {
  roomId: string | null | undefined;
  identity: PlayerIdentity | null | undefined;
  mySeat: number | null;
  isOpen: boolean;
  pollMs?: number;
}

export interface UseChatResult {
  messages: ChatMessageRow[];
  unread: number;
  loading: boolean;
  send: (body: string, kind?: 'text' | 'quick' | 'emoji') => Promise<void>;
  markRead: () => void;
}

/**
 * useChat — polls chat_messages every `pollMs` (default 2s, matching the
 * room sync cadence) and tracks an unread counter for messages received
 * while the drawer is closed.
 */
export function useChat({ roomId, identity, mySeat, isOpen, pollMs = 2000 }: UseChatOpts): UseChatResult {
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const lastSeenRef = useRef<string | null>(null); // last created_at the user has "seen"
  const lastFetchedAtRef = useRef<string | null>(null); // newest message timestamp we've fetched
  const cancelledRef = useRef(false);
  const openRef = useRef(isOpen);
  openRef.current = isOpen;

  const refresh = useCallback(async () => {
    if (!roomId) return;
    try {
      // First load: fetch the latest window; thereafter, incremental since last fetch
      const since = lastFetchedAtRef.current ?? undefined;
      const incoming = await fetchChatMessages(roomId, since);
      if (cancelledRef.current) return;
      if (!incoming.length) {
        setLoading(false);
        return;
      }
      setMessages(prev => {
        // dedupe by id
        const seen = new Set(prev.map(m => m.id));
        const merged = [...prev];
        for (const m of incoming) if (!seen.has(m.id)) merged.push(m);
        merged.sort((a, b) => a.created_at.localeCompare(b.created_at));
        return merged.slice(-200);
      });
      const newest = incoming[incoming.length - 1];
      lastFetchedAtRef.current = newest.created_at;

      // Bump unread for messages from others received while drawer is closed
      if (!openRef.current && identity) {
        const others = incoming.filter(m => m.user_id !== identity.userId);
        if (others.length) setUnread(u => u + others.length);
      } else if (openRef.current) {
        lastSeenRef.current = newest.created_at;
      }
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
    }
  }, [roomId, identity]);

  // initial load + polling
  useEffect(() => {
    cancelledRef.current = false;
    setMessages([]);
    setUnread(0);
    lastSeenRef.current = null;
    lastFetchedAtRef.current = null;
    setLoading(!!roomId);
    if (!roomId) return;
    refresh();
    const t = setInterval(refresh, pollMs);
    return () => { cancelledRef.current = true; clearInterval(t); };
  }, [roomId, refresh, pollMs]);

  // when drawer opens, clear unread and pin last-seen to newest
  useEffect(() => {
    if (isOpen) {
      setUnread(0);
      if (messages.length) lastSeenRef.current = messages[messages.length - 1].created_at;
    }
  }, [isOpen, messages]);

  const send = useCallback(async (body: string, kind: 'text' | 'quick' | 'emoji' = 'text') => {
    if (!roomId || !identity) return;
    const row = await sendChatMessage({
      roomId,
      userId: identity.userId,
      displayName: identity.displayName,
      seatIndex: mySeat,
      body,
      kind,
    });
    if (row) {
      // optimistic merge
      setMessages(prev => {
        if (prev.some(m => m.id === row.id)) return prev;
        const next = [...prev, row].sort((a, b) => a.created_at.localeCompare(b.created_at));
        return next.slice(-200);
      });
      lastFetchedAtRef.current = row.created_at;
      lastSeenRef.current = row.created_at;
    }
  }, [roomId, identity, mySeat]);

  const markRead = useCallback(() => {
    setUnread(0);
    if (messages.length) lastSeenRef.current = messages[messages.length - 1].created_at;
  }, [messages]);

  return { messages, unread, loading, send, markRead };
}
