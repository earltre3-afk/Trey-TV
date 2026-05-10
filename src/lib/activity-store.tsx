import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
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
  toggleSave: (postId: string, meta: Omit<ActivityItem, "id" | "ts" | "type" | "postId">) => void;
  logShare: (postId: string, meta: Omit<ActivityItem, "id" | "ts" | "type" | "postId">) => void;
  clear: () => void;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_activity_v1";

export function ActivityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<Record<string, ReactionKey | null>>({});
  const [saves, setSaves] = useState<Record<string, boolean>>({});
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        setReactions(p.reactions || {});
        setSaves(p.saves || {});
        setActivity(p.activity || []);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify({ reactions, saves, activity })); } catch {}
  }, [reactions, saves, activity]);

  const traceUid = user?.uid ?? "guest";
  const push = (a: Omit<ActivityItem, "userUid"> & { userUid?: string }) =>
    setActivity((prev) => [{ ...a, userUid: a.userUid ?? traceUid }, ...prev].slice(0, 80));

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
      return { ...prev, [postId]: next };
    });
  };
  const logShare: Ctx["logShare"] = (postId, meta) => {
    push({ id: crypto.randomUUID(), ts: Date.now(), type: "share", postId, ...meta });
    recordUserTrace({ userUid: traceUid, action: "feed.share", targetType: "post", targetId: postId, details: { title: meta.title } });
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
