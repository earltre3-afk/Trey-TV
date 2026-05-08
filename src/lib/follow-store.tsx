import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { creators } from "@/lib/mock-data";

export type FollowedCreator = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followedAt: number;
  watchScore: number;
};

type Ctx = {
  followed: FollowedCreator[];
  isFollowing: (handle: string) => boolean;
  toggle: (c: { id: string; name: string; handle: string; avatar: string }) => boolean;
  bumpWatch: (handle: string) => void;
  topThree: FollowedCreator[];
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_follows_v1";

const SEED: FollowedCreator[] = creators.slice(0, 3).map((c, i) => ({
  id: c.id, name: c.name, handle: c.handle, avatar: c.avatar as unknown as string,
  followedAt: Date.now() - i * 86_400_000, watchScore: 100 - i * 20,
}));

export function FollowProvider({ children }: { children: ReactNode }) {
  const [followed, setFollowed] = useState<FollowedCreator[]>(SEED);

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setFollowed(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(followed)); } catch {}
  }, [followed]);

  const isFollowing: Ctx["isFollowing"] = (handle) => followed.some((f) => f.handle === handle);

  const toggle: Ctx["toggle"] = (c) => {
    let nowFollowing = false;
    setFollowed((s) => {
      if (s.some((f) => f.handle === c.handle)) return s.filter((f) => f.handle !== c.handle);
      nowFollowing = true;
      return [...s, { id: c.id, name: c.name, handle: c.handle, avatar: c.avatar, followedAt: Date.now(), watchScore: 10 }];
    });
    return !isFollowing(c.handle);
  };

  const bumpWatch: Ctx["bumpWatch"] = (handle) =>
    setFollowed((s) => s.map((f) => f.handle === handle ? { ...f, watchScore: f.watchScore + 5 } : f));

  const topThree = useMemo(
    () => [...followed].sort((a, b) => b.watchScore - a.watchScore).slice(0, 3),
    [followed]
  );

  return <C.Provider value={{ followed, isFollowing, toggle, bumpWatch, topThree }}>{children}</C.Provider>;
}

export function useFollow() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useFollow must be inside <FollowProvider>");
  return ctx;
}