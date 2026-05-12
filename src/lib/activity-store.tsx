import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { recordUserTrace } from "@/lib/user-trace";

export type ReactionKey = "fire" | "gem" | "crown" | "dead" | "cinematic";

export const REACTIONS: { key: ReactionKey; emoji: string; label: string; color: string }[] = [
  { key: "fire",      emoji: "🔥", label: "Fire",       color: "oklch(0.75 0.2 40)" },
  { key: "gem",       emoji: "💎", label: "Gem",        color: "oklch(0.82 0.15 215)" },
  { key: "crown",     emoji: "👑", label: "Crown",      color: "oklch(0.82 0.16 85)" },
  { key: "dead",      emoji: "💀", label: "Dead",       color: "oklch(0.75 0.05 270)" },
  { key: "cinematic", emoji: "🎬", label: "Cinematic",  color: "oklch(0.7 0.25 340)" },
];

export type ActivityItem = {
  id: string;
  ts: number;
  type: "react" | "save" | "share" | "follow" | "view";
  userUid: string;
  postId: string;
  reaction?: ReactionKey;
  title: string;
  creator: string;
  thumb?: string;
};

type Ctx = {
  reactions: Record<string, ReactionKey | null>;
  saves: Record<string, boolean>;
  activity: ActivityItem[];
  setReaction: (postId: string, r: ReactionKey | null, meta: Omit<ActivityItem, "id" | "ts" | "type" | "postId" | "reaction">) => void;
  toggleSave: (postId: string, meta: Omit<ActivityItem, "id" | "ts" | "type" | "postId" | "userUid">) => void;
  logShare: (postId: string, meta: Omit<ActivityItem, "id" | "ts" | "type" | "postId" | "userUid">) => void;
  clear: () => void;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_activity_v1";

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const [reactions, setReactions] = useState<Record<string, ReactionKey | null>>({});
  const [saves, setSaves] = useState<Record<string, boolean>>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const storageKey = `${KEY}:${user?.uid ?? "guest"}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const p = JSON.parse(raw);
        setReactions(p.reactions || {});
        setSaves(p.saves || {});
        setActivity(p.activity || []);
      } else {
        setReactions({});
        setSaves({});
        setActivity([]);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify({ reactions, saves, activity })); } catch {}
  }, [reactions, saves, activity, storageKey]);

  useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;

    const loadActivity = async () => {
      try {
        const supabase = createBrowserClient();
        const [activityResult, savedResult] = await Promise.all([
          (supabase as any)
            .from("user_feed_activity")
            .select("id, activity_type, target_id, reaction, metadata, created_at")
            .eq("user_id", supabaseUser.id)
            .order("created_at", { ascending: false })
            .limit(80),
          (supabase as any)
            .from("user_saved_items")
            .select("target_id, metadata, created_at")
            .eq("user_id", supabaseUser.id)
            .eq("target_type", "post"),
        ]);

        if (activityResult.error || savedResult.error) throw activityResult.error || savedResult.error;
        if (cancelled) return;

        const rows = (activityResult.data ?? []) as any[];
        const nextActivity: ActivityItem[] = rows.map((row) => ({
          id: row.id,
          ts: new Date(row.created_at).getTime(),
          type: row.activity_type,
          userUid: user?.uid ?? "guest",
          postId: row.target_id,
          reaction: row.reaction ?? undefined,
          title: row.metadata?.title ?? "Post",
          creator: row.metadata?.creator ?? "Trey TV",
          thumb: row.metadata?.thumb,
        }));
        const nextReactions: Record<string, ReactionKey | null> = {};
        const nextSaves: Record<string, boolean> = {};
        nextActivity.forEach((item) => {
          if (item.type === "react") nextReactions[item.postId] = item.reaction ?? null;
        });
        ((savedResult.data ?? []) as any[]).forEach((row) => {
          nextSaves[row.target_id] = true;
        });
        setActivity(nextActivity);
        setReactions(nextReactions);
        setSaves(nextSaves);
      } catch (error) {
        console.error("Failed to load UID feed activity:", error);
      }
    };

    loadActivity();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser?.id, user?.uid]);

  const traceUid = user?.uid ?? "guest";
  const push = (a: Omit<ActivityItem, "userUid"> & { userUid?: string }) => {
    const item = { ...a, userUid: a.userUid ?? traceUid };
    setActivity((prev) => [item, ...prev].slice(0, 80));

    if (supabaseUser) {
      void (async () => {
        try {
          const supabase = createBrowserClient();
          await (supabase as any).from("user_feed_activity").insert({
            user_id: supabaseUser.id,
            public_profile_uid: traceUid,
            activity_type: item.type,
            target_type: "post",
            target_id: item.postId,
            reaction: item.reaction ?? null,
            metadata: {
              title: item.title,
              creator: item.creator,
              thumb: item.thumb,
            },
          });
        } catch (error) {
          console.error("Failed to save UID feed activity:", error);
        }
      })();
    }
  };

  const setReaction: Ctx["setReaction"] = (postId, r, meta) => {
    setReactions((prev) => ({ ...prev, [postId]: r }));
    if (r) {
      push({ id: crypto.randomUUID(), ts: Date.now(), type: "react", postId, reaction: r, ...meta });
      recordUserTrace({ userUid: traceUid, action: "feed.react", targetType: "post", targetId: postId, details: { reaction: r, title: meta.title } });
    }
  };
  const toggleSave: Ctx["toggleSave"] = (postId, meta) => {
    setSaves((prev) => {
      const next = !prev[postId];
      if (next) {
        push({ id: crypto.randomUUID(), ts: Date.now(), type: "save", postId, ...meta });
        recordUserTrace({ userUid: traceUid, action: "feed.save", targetType: "post", targetId: postId, details: { title: meta.title } });
      }
      if (supabaseUser) {
        void (async () => {
          try {
            const supabase = createBrowserClient();
            if (next) {
              await (supabase as any).from("user_saved_items").upsert({
                user_id: supabaseUser.id,
                target_type: "post",
                target_id: postId,
                metadata: meta,
              }, { onConflict: "user_id,target_type,target_id" });
            } else {
              await (supabase as any)
                .from("user_saved_items")
                .delete()
                .eq("user_id", supabaseUser.id)
                .eq("target_type", "post")
                .eq("target_id", postId);
            }
          } catch (error) {
            console.error("Failed to persist saved item:", error);
          }
        })();
      }
      return { ...prev, [postId]: next };
    });
  };
  const logShare: Ctx["logShare"] = (postId, meta) => {
    push({ id: crypto.randomUUID(), ts: Date.now(), type: "share", postId, ...meta });
    recordUserTrace({ userUid: traceUid, action: "feed.share", targetType: "post", targetId: postId, details: { title: meta.title } });
    if (supabaseUser) {
      void (async () => {
        try {
          const supabase = createBrowserClient();
          await (supabase as any).from("user_shares").insert({
            user_id: supabaseUser.id,
            target_type: "post",
            target_id: postId,
            destination: "native_share",
            metadata: meta,
          });
        } catch (error) {
          console.error("Failed to persist share:", error);
        }
      })();
    }
  };
  const clear = () => { setReactions({}); setSaves({}); setActivity([]); };

  return (
    <C.Provider value={{ reactions, saves, activity, setReaction, toggleSave, logShare, clear }}>
      {children}
    </C.Provider>
  );
}

export function useActivity() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useActivity must be inside <ActivityProvider>");
  return ctx;
}
