import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";

export type Comment = {
  id: string;
  postId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  text: string;
  createdAt: number;
  likes: number;
  likedByMe: boolean;
};

type Ctx = {
  byPost: (postId: string) => Comment[];
  add: (postId: string, text: string, parentId?: string | null) => void;
  toggleLike: (id: string) => void;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_comments_v1";

const seed: Comment[] = [
  { id: "s1", postId: "1", authorId: "lena", authorName: "Lena", authorHandle: "lena",
    authorAvatar: "", text: "Can't wait for this drop 🔥", createdAt: Date.now() - 1000 * 60 * 22,
    likes: 12, likedByMe: false },
  { id: "s2", postId: "1", authorId: "zay", authorName: "Zay Beats", authorHandle: "zaybeats",
    authorAvatar: "", text: "Lighting looks insane", createdAt: Date.now() - 1000 * 60 * 8,
    likes: 4, likedByMe: false },
  { id: "s3", postId: "2", authorId: "maya", authorName: "Maya", authorHandle: "maya",
    authorAvatar: "", text: "Adding this to my run playlist", createdAt: Date.now() - 1000 * 60 * 14,
    likes: 7, likedByMe: false },
  { id: "s4", postId: "3", authorId: "chris", authorName: "Chris H.", authorHandle: "chrishorizon",
    authorAvatar: "", text: "This hit different at 1am", createdAt: Date.now() - 1000 * 60 * 40,
    likes: 21, likedByMe: false },
];

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Comment[]>(seed);

  useEffect(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) setItems(JSON.parse(v));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const value = useMemo<Ctx>(() => ({
    byPost: (postId) => items.filter((c) => c.postId === postId).sort((a, b) => b.createdAt - a.createdAt),
    add: (postId, text, parentId = null) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const id = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `c-${Date.now()}`;
      setItems((s) => [{
        id, postId, parentId,
        authorId: "me",
        authorName: currentUser.name,
        authorHandle: currentUser.handle,
        authorAvatar: currentUser.avatar,
        text: trimmed,
        createdAt: Date.now(),
        likes: 0,
        likedByMe: false,
      }, ...s]);
    },
    toggleLike: (id) => setItems((s) => s.map((c) =>
      c.id === id ? { ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) } : c
    )),
  }), [items]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useComments() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useComments must be inside <CommentsProvider>");
  return ctx;
}

export function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
