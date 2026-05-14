import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createBrowserClient } from "@/lib/supabase-browser";

type FeedCreator = {
  id: string;
  publicProfileUid?: string | null;
  name: string;
  handle: string;
  avatar: string;
  ring: "gold";
  verified?: "creator" | "user";
};

const fallbackCreator: FeedCreator = {
  id: "me",
  publicProfileUid: currentUser.uid,
  name: currentUser.name,
  handle: currentUser.handle,
  avatar: currentUser.avatar,
  ring: "gold" as const,
  verified: currentUser.verified,
} as const;

export type UserPost = {
  id: string;
  creator: FeedCreator;
  timeAgo: string;
  text: string;
  media?: string;
  duration?: string;
  likes: number;
  comments: number;
  reshares: number;
  saves: number;
  audience: "Everyone" | "Followers" | "Premium";
  tags: string[];
  createdAt: number;
};

type Ctx = {
  posts: UserPost[];
  addPost: (input: { text: string; audience?: UserPost["audience"]; tags?: string[]; media?: string }) => UserPost;
  removePost: (id: string) => void;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_user_posts_v1";
const SERVER_FALLBACK_CTX: Ctx = {
  posts: [],
  addPost: () => {
    throw new Error("FeedProvider is required before adding posts");
  },
  removePost: () => undefined,
};

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function FeedProvider({ children }: { children: ReactNode }) {
  const [raw, setRaw] = useState<UserPost[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const { user: supabaseUser } = useSupabaseAuth();
  const profileUser = useCurrentUser();
  const storageKey = `${KEY}:${profileUser.uid}`;
  const meAsCreator: FeedCreator = {
    id: profileUser.uid,
    publicProfileUid: profileUser.uid,
    name: profileUser.name,
    handle: profileUser.handle,
    avatar: profileUser.avatar,
    ring: "gold",
    verified: profileUser.verified,
  };

  useEffect(() => {
    try {
      const v = localStorage.getItem(storageKey);
      if (v) setRaw(JSON.parse(v));
      else setRaw([]);
    } catch {}
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(storageKey, JSON.stringify(raw)); } catch {}
  }, [raw, hydrated, storageKey]);

  useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;

    const loadPosts = async () => {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await (supabase as any)
          .from("user_feed_posts")
          .select("id, body, media_url, audience, tags, metrics, created_at")
          .eq("user_id", supabaseUser.id)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        if (cancelled) return;

        setRaw(((data ?? []) as any[]).map((row) => ({
          id: row.id,
          creator: meAsCreator,
          timeAgo: timeAgo(new Date(row.created_at).getTime()),
          text: row.body,
          media: row.media_url ?? undefined,
          duration: undefined,
          likes: Number(row.metrics?.likes ?? 0),
          comments: Number(row.metrics?.comments ?? 0),
          reshares: Number(row.metrics?.reshares ?? 0),
          saves: Number(row.metrics?.saves ?? 0),
          audience: row.audience ?? "Everyone",
          tags: Array.isArray(row.tags) ? row.tags : [],
          createdAt: new Date(row.created_at).getTime(),
        })));
      } catch (error) {
        console.error("Failed to load UID feed posts:", error);
      }
    };

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser?.id]);

  const posts = raw.map((p) => ({ ...p, timeAgo: timeAgo(p.createdAt) }));

  const addPost: Ctx["addPost"] = ({ text, audience = "Everyone", tags = [], media }) => {
    const id = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `p-${Date.now()}`;
    const post: UserPost = {
      id, creator: meAsCreator, timeAgo: "now",
      text, media, duration: undefined,
      likes: 0, comments: 0, reshares: 0, saves: 0,
      audience, tags, createdAt: Date.now(),
    };
    setRaw((s) => [post, ...s].slice(0, 100));
    if (supabaseUser) {
      void (async () => {
        try {
          const supabase = createBrowserClient();
          const { data, error } = await (supabase as any)
            .from("user_feed_posts")
            .insert({
              user_id: supabaseUser.id,
              public_profile_uid: profileUser.uid,
              body: text,
              media_url: media ?? null,
              audience,
              tags,
              metrics: { likes: 0, comments: 0, reshares: 0, saves: 0 },
            })
            .select("id, created_at")
            .single();

          if (error) throw error;
          if (data?.id) {
            const createdAt = data.created_at ? new Date(data.created_at).getTime() : post.createdAt;
            setRaw((s) => s.map((p) => p.id === id ? { ...p, id: data.id, createdAt } : p));
          }
        } catch (error) {
          console.error("Failed to save UID feed post:", error);
        }
      })();
    }
    return post;
  };

  const removePost: Ctx["removePost"] = (id) => {
    setRaw((s) => s.filter((p) => p.id !== id));
    if (supabaseUser) {
      void (async () => {
        try {
          const supabase = createBrowserClient();
          await (supabase as any).from("user_feed_posts").delete().eq("id", id).eq("user_id", supabaseUser.id);
        } catch (error) {
          console.error("Failed to remove UID feed post:", error);
        }
      })();
    }
  };

  return <C.Provider value={{ posts, addPost, removePost }}>{children}</C.Provider>;
}

export function useFeed() {
  const ctx = useContext(C);
  if (!ctx && typeof window === "undefined") return SERVER_FALLBACK_CTX;
  if (!ctx) throw new Error("useFeed must be inside <FeedProvider>");
  return ctx;
}
