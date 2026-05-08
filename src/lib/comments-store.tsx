import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { currentUser } from "@/lib/mock-data";

export type Comment = {
  id: string;
  postId: string;
  parentId?: string;
  author: { name: string; handle: string; avatar: string };
  text: string;
  likes: number;
  likedByMe: boolean;
  createdAt: number;
};

type Ctx = {
  byPost: (postId: string) => Comment[];
  add: (postId: string, text: string, parentId?: string) => void;
  toggleLike: (id: string) => void;
  remove: (id: string) => void;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_comments_v1";

const SEED: Comment[] = [
  { id: "c-seed-1", postId: "p1", author: { name: "Aria Knox", handle: "ariaknox", avatar: "https://i.pravatar.cc/120?img=47" }, text: "This shot is unreal 🔥", likes: 12, likedByMe: false, createdAt: Date.now() - 1000 * 60 * 22 },
  { id: "c-seed-2", postId: "p1", author: { name: "Miles Vega", handle: "milesvega", avatar: "https://i.pravatar.cc/120?img=12" }, text: "Drop the preset pls", likes: 4, likedByMe: false, createdAt: Date.now() - 1000 * 60 * 8 },
];

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Comment[]>(SEED);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const byPost: Ctx["byPost"] = (postId) =>
    items.filter((c) => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);

  const add: Ctx["add"] = (postId, text, parentId) => {
    if (!text.trim()) return;
    const c: Comment = {
      id: (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `c-${Date.now()}`,
      postId, parentId,
      author: { name: currentUser.name, handle: currentUser.handle, avatar: currentUser.avatar as unknown as string },
      text: text.trim(), likes: 0, likedByMe: false, createdAt: Date.now(),
    };
    setItems((s) => [...s, c]);
  };

  const toggleLike: Ctx["toggleLike"] = (id) =>
    setItems((s) => s.map((c) => c.id === id ? { ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) } : c));

  const remove: Ctx["remove"] = (id) =>
    setItems((s) => s.filter((c) => c.id !== id && c.parentId !== id));

  return <C.Provider value={{ byPost, add, toggleLike, remove }}>{children}</C.Provider>;
}

export function useComments() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useComments must be inside <CommentsProvider>");
  return ctx;
}
