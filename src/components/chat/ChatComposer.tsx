// Input + send button. Calls the postChatMessage server fn with optimistic UI.
// Surfaces AI-moderation feedback (nudge / block / timeout) via the pending
// message list rendered by ChatMessageList.

import { useCallback, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { useSupabaseSession } from "@/lib/supabase-session";
import { postChatMessage } from "@/lib/watch-party/party.server";
import type { ChatKind, PendingMessage } from "./ChatTypes";

type Props = {
  kind: ChatKind;
  scopeId: string;
  /** Render-disabled overlay reason; pass null when input is enabled. */
  disabledReason?: string | null;
  /** Called whenever a new pending message is created or updated. */
  onPending: (updater: (prev: PendingMessage[]) => PendingMessage[]) => void;
};

function newTempId(): string {
  return `t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function ChatComposer({ kind, scopeId, disabledReason, onPending }: Props) {
  const { session } = useSupabaseSession();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const submit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      const body = text.trim();
      if (!body || sending) return;
      if (!session?.access_token) {
        onPending((prev) => [
          ...prev,
          { tempId: newTempId(), body, status: "blocked", reason: "Sign in to chat", createdAt: Date.now() },
        ]);
        setText("");
        return;
      }

      const tempId = newTempId();
      const optimistic: PendingMessage = { tempId, body, status: "sending", createdAt: Date.now() };
      onPending((prev) => [...prev, optimistic]);
      setText("");
      setSending(true);

      try {
        const result = await postChatMessage({
          data: { accessToken: session.access_token, kind, scopeId, body },
        });
        if (!result.ok) {
          onPending((prev) =>
            prev.map((p) =>
              p.tempId === tempId
                ? {
                    ...p,
                    status: "blocked",
                    reason: result.error === "blocked" ? result.reason ?? "blocked" : result.error,
                    timeoutMinutes: result.timeoutMinutes ?? null,
                  }
                : p,
            ),
          );
        } else if (result.nudge) {
          onPending((prev) =>
            prev.map((p) => (p.tempId === tempId ? { ...p, status: "nudge", reason: result.nudge ?? null } : p)),
          );
          // Drop the nudge banner after a few seconds.
          setTimeout(() => {
            onPending((prev) => prev.filter((p) => p.tempId !== tempId));
          }, 6_000);
        } else {
          // Server confirmed; the Realtime INSERT will render the canonical row.
          // Drop the optimistic row shortly so we don't show duplicates if
          // Realtime is slow (it'll dedupe by id once it arrives).
          onPending((prev) => prev.map((p) => (p.tempId === tempId ? { ...p, status: "sent" } : p)));
          setTimeout(() => {
            onPending((prev) => prev.filter((p) => p.tempId !== tempId));
          }, 2_000);
        }
      } catch (err) {
        console.error("[chat] send failed", err);
        onPending((prev) =>
          prev.map((p) =>
            p.tempId === tempId ? { ...p, status: "blocked", reason: "network_error" } : p,
          ),
        );
      } finally {
        setSending(false);
      }
    },
    [text, sending, session?.access_token, kind, scopeId, onPending],
  );

  const disabled = Boolean(disabledReason) || sending;

  return (
    <form onSubmit={submit} className="border-t border-white/10 p-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={disabledReason ?? "Say something…"}
          maxLength={500}
          disabled={disabled}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/60 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          aria-label="Send"
          className="size-9 grid place-items-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition"
        >
          <Send className="size-4" />
        </button>
      </div>
      {disabledReason && (
        <div className="mt-1 text-[10px] text-white/40">{disabledReason}</div>
      )}
    </form>
  );
}
