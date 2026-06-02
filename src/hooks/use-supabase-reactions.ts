import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "./use-auth";
import type { ReactionKey } from "@/lib/activity-store";

type UserPostReactionType = "like" | "love" | "laugh" | "wow" | "sad" | "angry";

type ReactionRow = {
  reaction_type: string | null;
};

type ToggleReactionResult =
  | { ok: true }
  | { ok: false; reason: "signed-out" | "missing-post" | "unavailable" };

const lovableToSupabaseReaction: Record<ReactionKey, UserPostReactionType> = {
  fire: "like",
  gem: "love",
  crown: "wow",
  dead: "laugh",
  cinematic: "sad",
};

const supabaseToLovableReaction: Partial<Record<UserPostReactionType, ReactionKey>> = {
  like: "fire",
  love: "gem",
  wow: "crown",
  laugh: "dead",
  sad: "cinematic",
};

function toSupabaseReaction(reaction: ReactionKey | null): UserPostReactionType | null {
  return reaction ? lovableToSupabaseReaction[reaction] : null;
}

function toLovableReaction(reaction: string | null | undefined): ReactionKey | null {
  const normalized = String(reaction ?? "")
    .trim()
    .toLowerCase() as UserPostReactionType;
  return supabaseToLovableReaction[normalized] ?? null;
}

function userPostReactionsTable(supabase: ReturnType<typeof createBrowserClient>) {
  return (supabase as any).from("user_post_reactions");
}

export function useSupabaseReactions(postId: string, initialLikesCount: number = 0) {
  const { user, isGuest } = useAuth();
  const isSignedIn = !isGuest;
  const [reaction, setReaction] = useState<ReactionKey | null>(null);
  const [likeCount, setLikeCount] = useState(initialLikesCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!postId) {
      if (mounted) {
        setReaction(null);
        setLikeCount(initialLikesCount);
      }
      return;
    }

    async function fetchReaction() {
      try {
        const supabase = createBrowserClient();

        const countRequest = userPostReactionsTable(supabase)
          .select("id", { count: "exact", head: true })
          .eq("post_id", postId);

        const reactionRequest =
          isSignedIn && user
            ? userPostReactionsTable(supabase)
                .select("reaction_type")
                .eq("post_id", postId)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle()
            : Promise.resolve({ data: null, error: null });

        const [countResult, reactionResult] = await Promise.all([countRequest, reactionRequest]);

        if (!mounted) return;

        if (!countResult.error) {
          setLikeCount(countResult.count ?? initialLikesCount);
        } else {
          setLikeCount(initialLikesCount);
        }

        if (!reactionResult.error && reactionResult.data) {
          setReaction(toLovableReaction((reactionResult.data as ReactionRow).reaction_type));
        } else {
          setReaction(null);
        }
      } catch {
        if (mounted) {
          setReaction(null);
          setLikeCount(initialLikesCount);
        }
      }
    }

    fetchReaction();
    return () => {
      mounted = false;
    };
  }, [postId, user?.id, isSignedIn, initialLikesCount]);

  const fetchCount = useCallback(async () => {
    if (!postId) return initialLikesCount;

    const supabase = createBrowserClient();
    const { count, error } = await userPostReactionsTable(supabase)
      .select("id", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) return null;
    return count ?? 0;
  }, [postId, initialLikesCount]);

  const toggleReaction = useCallback(
    async (newReaction: ReactionKey | null): Promise<ToggleReactionResult> => {
      if (!postId) return { ok: false, reason: "missing-post" };
      if (!isSignedIn || !user) return { ok: false, reason: "signed-out" };

      const nextReaction = newReaction;
      const nextSupabaseReaction = toSupabaseReaction(nextReaction);
      const previousReaction = reaction;
      const previousCount = likeCount;

      setPending(true);
      setReaction(nextReaction);
      setLikeCount((prev) => {
        if (!previousReaction && nextReaction) return prev + 1;
        if (previousReaction && !nextReaction) return Math.max(0, prev - 1);
        return prev;
      });

      try {
        const supabase = createBrowserClient();

        const deleteResult = await userPostReactionsTable(supabase)
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        if (deleteResult.error) throw deleteResult.error;

        if (nextSupabaseReaction) {
          const { error } = await userPostReactionsTable(supabase).upsert(
            {
              post_id: postId,
              user_id: user.id,
              reaction_type: nextSupabaseReaction,
            },
            { onConflict: "post_id,user_id" },
          );

          if (error) throw error;
        }

        const freshCount = await fetchCount();
        if (freshCount !== null) setLikeCount(freshCount);
        return { ok: true };
      } catch (err) {
        console.error("[useSupabaseReactions] toggleReaction failed:", err);
        setReaction(previousReaction);
        setLikeCount(previousCount);
        return { ok: false, reason: "unavailable" };
      } finally {
        setPending(false);
      }
    },
    [postId, user, isSignedIn, reaction, likeCount, fetchCount],
  );

  return { reaction, toggleReaction, likeCount, pending };
}
