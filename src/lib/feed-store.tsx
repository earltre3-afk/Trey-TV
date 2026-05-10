import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";

const meAsCreator = {
  id: "me",
  name: currentUser.name,
  handle: currentUser.handle,
  avatar: currentUser.avatar,
  ring: "gold" as const,
  verified: currentUser.verified,
} as const;

export type UserPost = {
  id: string;
  creator: typeof meAsCreator;
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

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) setRaw(JSON.parse(v));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(raw)); } catch {}
  }, [raw]);

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
    return post;
  };

  const removePost: Ctx["removePost"] = (id) => setRaw((s) => s.filter((p) => p.id !== id));

  return <C.Provider value={{ posts, addPost, removePost }}>{children}</C.Provider>;
}

export function useFeed() {
  const ctx = useContext(C);
  if (!ctx && typeof window === "undefined") return SERVER_FALLBACK_CTX;
  if (!ctx) throw new Error("useFeed must be inside <FeedProvider>");
  return ctx;
}
