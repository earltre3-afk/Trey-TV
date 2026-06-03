// Renders a live-updating chat message list. Subscribes to Supabase Realtime
// for the (kind, scope_id) tuple. Caller passes optimistic pending messages
// for the current user; sent confirmations come through Realtime.
//
// Per spec docs/superpowers/specs/2026-05-24-watch-party-design.md §9.2

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Shield } from "lucide-react";
import type { ChatKind, ChatMessageRow, PendingMessage } from "./ChatTypes";
import { useChatProfiles } from "./useChatProfiles";

const MAX_INITIAL = 100;

type Props = {
  kind: ChatKind;
  scopeId: string;
  /** Optimistic messages awaiting server confirmation. Keyed by tempId. */
  pending: PendingMessage[];
  /** Optional current-user-id so we can render their own messages with a "you" hint. */
  currentUserId?: string | null;
  className?: string;
};

export function ChatMessageList({ kind, scopeId, pending, currentUserId, className }: Props) {
  const [rows, setRows] = useState<ChatMessageRow[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  // Initial load + Realtime subscription.
  useEffect(() => {
    if (!scopeId) return;
    let cancelled = false;

    (async () => {
      const { data } = await (supabase as any)
        .from("chat_messages")
        .select("*")
        .eq("kind", kind)
        .eq("scope_id", scopeId)
        .order("created_at", { ascending: false })
        .limit(MAX_INITIAL);
      if (cancelled) return;
      setRows(((data ?? []) as ChatMessageRow[]).slice().reverse());
    })();

    const ch = supabase
      .channel(`chat-${kind}-${scopeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `scope_id=eq.${scopeId}`,
        },
        (payload) => {
          const next = payload.new as ChatMessageRow;
          if (next.kind !== kind) return; // double-check; filter only checks scope_id
          setRows((prev) => {
            if (prev.some((r) => r.id === next.id)) return prev;
            return [...prev, next].slice(-MAX_INITIAL);
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [kind, scopeId]);

  // Hide a pending row once its server row arrives via Realtime
  // (matched by body + sender_id within a short time window).
  const visiblePending = useMemo(() => {
    if (pending.length === 0) return pending;
    return pending.filter((p) => {
      if (p.status === "blocked" || p.status === "nudge") return true; // keep so the user can see feedback
      const matched = rows.some(
        (r) =>
          r.sender_id === currentUserId &&
          r.body === p.body &&
          Math.abs(new Date(r.created_at).getTime() - p.createdAt) < 30_000,
      );
      return !matched;
    });
  }, [pending, rows, currentUserId]);

  // Profile enrichment.
  const senderIds = useMemo(() => {
    const ids = new Set(rows.map((r) => r.sender_id));
    return [...ids];
  }, [rows]);
  const profiles = useChatProfiles(senderIds);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [rows.length, visiblePending.length]);

  return (
    <div className={`flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2 ${className ?? ""}`}>
      {rows.length === 0 && visiblePending.length === 0 && (
        <div className="text-center text-xs text-white/40 py-6">
          No messages yet. Say something.
        </div>
      )}

      {rows.map((row) => {
        const profile = profiles[row.sender_id];
        const name = profile?.display_name || profile?.username || "Viewer";
        const isMe = row.sender_id === currentUserId;
        return (
          <div key={row.id} className="flex items-start gap-2">
            <div className="size-7 rounded-full bg-white/10 overflow-hidden shrink-0">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="size-full object-cover" />
              ) : (
                <div className="size-full grid place-items-center text-[10px] text-white/60">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`text-[11px] font-semibold truncate ${isMe ? "text-primary" : "text-white/90"}`}
                >
                  {name}
                </span>
                <span className="text-[10px] text-white/40 shrink-0">
                  {new Date(row.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-sm text-white/90 break-words">{row.body}</div>
            </div>
          </div>
        );
      })}

      {/* Optimistic / blocked pending messages */}
      {visiblePending.map((p) => (
        <div key={p.tempId} className="flex items-start gap-2 opacity-90">
          <div className="size-7 rounded-full bg-primary/20 shrink-0 grid place-items-center">
            <span className="text-[10px] text-primary">you</span>
          </div>
          <div className="min-w-0 flex-1">
            <div
              className={`text-sm break-words ${
                p.status === "blocked"
                  ? "text-red-300 line-through"
                  : p.status === "sending"
                    ? "text-white/60 italic"
                    : "text-white/90"
              }`}
            >
              {p.body}
            </div>
            {p.status === "blocked" && (
              <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-red-300/90">
                <Shield className="size-3" />
                Blocked by Trey-I{p.reason ? ` · ${p.reason}` : ""}
                {p.timeoutMinutes ? ` · muted ${p.timeoutMinutes}m` : ""}
              </div>
            )}
            {p.status === "nudge" && (
              <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-amber-300/90">
                <AlertTriangle className="size-3" /> Trey-I: {p.reason || "keep it civil"}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
