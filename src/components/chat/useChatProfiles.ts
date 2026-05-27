// Batch-fetches sender profiles for a chat message list and caches them.
// Used by ChatMessageList to render avatar + display name.

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ChatSenderProfile } from "./ChatTypes";

const cache = new Map<string, ChatSenderProfile>();

export function useChatProfiles(senderIds: string[]): Record<string, ChatSenderProfile> {
  const [, setTick] = useState(0);
  const inflight = useRef(new Set<string>());

  useEffect(() => {
    const missing = senderIds.filter((id) => id && !cache.has(id) && !inflight.current.has(id));
    if (missing.length === 0) return;
    missing.forEach((id) => inflight.current.add(id));

    (async () => {
      const { data } = await (supabase as any)
        .from("profiles")
        .select("id, display_name, username, avatar_url")
        .in("id", missing);
      (data ?? []).forEach((row: ChatSenderProfile) => {
        cache.set(row.id, row);
      });
      missing.forEach((id) => {
        if (!cache.has(id)) {
          // Fill a placeholder so we don't re-query forever for deleted users.
          cache.set(id, { id, display_name: null, username: null, avatar_url: null });
        }
        inflight.current.delete(id);
      });
      setTick((t) => t + 1);
    })();
  }, [senderIds.join(",")]);

  const out: Record<string, ChatSenderProfile> = {};
  senderIds.forEach((id) => {
    const p = cache.get(id);
    if (p) out[id] = p;
  });
  return out;
}
