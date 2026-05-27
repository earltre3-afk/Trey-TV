// Public per-channel chat that sits under the LIVE NOW video on
// /channel/$handle. Text only — no voice. AI-moderated via Trey-I.
//
// See spec: docs/superpowers/specs/2026-05-24-watch-party-design.md §1, §9.3

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useSupabaseSession } from "@/lib/supabase-session";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposer } from "./ChatComposer";
import type { PendingMessage } from "./ChatTypes";

type Props = {
  handle: string;
  className?: string;
};

export function ChannelChatPanel({ handle, className }: Props) {
  const { session } = useSupabaseSession();
  const [pending, setPending] = useState<PendingMessage[]>([]);

  const userId = session?.user?.id ?? null;
  const disabledReason = userId ? null : "Sign in to chat";

  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur flex flex-col h-[420px] ${className ?? ""}`}>
      <header className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-4 text-primary" />
          <span className="text-sm font-semibold">Community chat</span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-[9px] tracking-widest font-bold">
            <span className="size-1 rounded-full bg-green-400 animate-pulse" /> 24/7
          </span>
        </div>
        <div className="text-[10px] text-white/40">@{handle}</div>
      </header>

      <ChatMessageList kind="public" scopeId={handle} pending={pending} currentUserId={userId} />

      <ChatComposer
        kind="public"
        scopeId={handle}
        disabledReason={disabledReason}
        onPending={setPending}
      />
    </section>
  );
}
