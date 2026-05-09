import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { creators } from "@/lib/mock-data";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";

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
const PUBLIC_UID_RE = /^\d{10,}$/;

const SEED: FollowedCreator[] = creators.slice(0, 3).map((c, i) => ({
  id: c.id, name: c.name, handle: c.handle, avatar: c.avatar as unknown as string,
  followedAt: Date.now() - i * 86_400_000, watchScore: 100 - i * 20,
}));

type FollowedProfileRow = {
  following: {
    public_profile_uid: string | null;
    display_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

const isRealProfileId = (id: string) => PUBLIC_UID_RE.test(id);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [localFollowed, setLocalFollowed] = useState<FollowedCreator[]>(SEED);
  const [dbFollowed, setDbFollowed] = useState<Map<string, FollowedCreator>>(new Map());
  const [ownPublicProfileUid, setOwnPublicProfileUid] = useState<string | null>(null);
  const { user: supabaseUser, isSignedIn } = useSupabaseAuth();
  const navigate = useNavigate();

  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setLocalFollowed(JSON.parse(raw)); } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(localFollowed)); } catch {}
  }, [localFollowed]);

  useEffect(() => {
    let cancelled = false;

    const loadDbFollows = async () => {
      if (!supabaseUser) {
        setDbFollowed(new Map());
        setOwnPublicProfileUid(null);
        return;
      }

      try {
        const supabase = createBrowserClient();
        const [{ data: ownProfile }, { data, error }] = await Promise.all([
          supabase
            .from("profiles")
            .select("public_profile_uid")
            .eq("id", supabaseUser.id)
            .maybeSingle(),
          supabase
            .from("follows")
            .select(`
              following:profiles!follows_following_id_fkey(
                public_profile_uid,
                display_name,
                username,
                avatar_url
              )
            `)
            .eq("follower_id", supabaseUser.id),
        ]);

        if (cancelled) return;

        setOwnPublicProfileUid((ownProfile as { public_profile_uid?: string | null } | null)?.public_profile_uid ?? null);

        if (error) {
          console.error("Failed to load follows:", error);
          setDbFollowed(new Map());
          return;
        }

        const next = new Map<string, FollowedCreator>();
        ((data ?? []) as FollowedProfileRow[]).forEach((row) => {
          const profile = row.following;
          const handle = profile?.username;
          if (!profile || !handle) return;

          next.set(handle, {
            id: profile.public_profile_uid ?? handle,
            name: profile.display_name || handle,
            handle,
            avatar: profile.avatar_url || "",
            followedAt: Date.now(),
            watchScore: 0,
          });
        });

        setDbFollowed(next);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to initialize follows:", error);
          setDbFollowed(new Map());
          setOwnPublicProfileUid(null);
        }
      }
    };

    loadDbFollows();

    return () => {
      cancelled = true;
    };
  }, [supabaseUser]);

  const followed = useMemo(() => {
    const merged = new Map<string, FollowedCreator>();
    dbFollowed.forEach((creator, handle) => merged.set(handle, creator));
    localFollowed.forEach((creator) => merged.set(creator.handle, creator));
    return [...merged.values()];
  }, [dbFollowed, localFollowed]);

  const isFollowing: Ctx["isFollowing"] = (handle) =>
    dbFollowed.has(handle) || localFollowed.some((f) => f.handle === handle);

  const toggle: Ctx["toggle"] = (c) => {
    if (!isRealProfileId(c.id)) {
      setLocalFollowed((s) => {
        if (s.some((f) => f.handle === c.handle)) return s.filter((f) => f.handle !== c.handle);
        return [...s, { id: c.id, name: c.name, handle: c.handle, avatar: c.avatar, followedAt: Date.now(), watchScore: 10 }];
      });
      return !isFollowing(c.handle);
    }

    if (!isSignedIn || !supabaseUser) {
      toast("Sign up to follow");
      navigate({ to: "/onboarding" });
      return false;
    }

    if (ownPublicProfileUid === c.id) {
      toast("You cannot follow yourself");
      return false;
    }

    const wasFollowing = isFollowing(c.handle);
    const optimisticCreator: FollowedCreator = {
      id: c.id,
      name: c.name,
      handle: c.handle,
      avatar: c.avatar,
      followedAt: Date.now(),
      watchScore: 0,
    };
    const rollbackOptimistic = () => {
      setDbFollowed((prev) => {
        const next = new Map(prev);
        if (wasFollowing) next.set(c.handle, optimisticCreator);
        else next.delete(c.handle);
        return next;
      });
    };

    setDbFollowed((prev) => {
      const next = new Map(prev);
      if (wasFollowing) next.delete(c.handle);
      else next.set(c.handle, optimisticCreator);
      return next;
    });

    void (async () => {
      try {
        const supabase = createBrowserClient();
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id")
          .eq("public_profile_uid", c.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const followingId = (profile as { id?: string } | null)?.id;
        if (!followingId) throw new Error("Follow target profile was not found.");
        if (followingId === supabaseUser.id) {
          rollbackOptimistic();
          toast("You cannot follow yourself");
          return;
        }

        const followRow: any = { follower_id: supabaseUser.id, following_id: followingId };
        const { error } = wasFollowing
          ? await supabase
              .from("follows")
              .delete()
              .eq("follower_id", supabaseUser.id)
              .eq("following_id", followingId)
          : await supabase
              .from("follows")
              .insert(followRow);

        if (error) throw error;
      } catch (error) {
        console.error("Failed to update follow:", error);
        rollbackOptimistic();
        toast.error("Follow failed");
      }
    })();

    return !wasFollowing;
  };

  const bumpWatch: Ctx["bumpWatch"] = (handle) =>
    setLocalFollowed((s) => s.map((f) => f.handle === handle ? { ...f, watchScore: f.watchScore + 5 } : f));

  const topThree = useMemo(
    () => [...localFollowed].sort((a, b) => b.watchScore - a.watchScore).slice(0, 3),
    [localFollowed]
  );

  return <C.Provider value={{ followed, isFollowing, toggle, bumpWatch, topThree }}>{children}</C.Provider>;
}

export function useFollow() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useFollow must be inside <FollowProvider>");
  return ctx;
}
