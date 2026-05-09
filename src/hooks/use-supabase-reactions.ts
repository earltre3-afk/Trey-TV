import { useState, useEffect, useCallback, useRef } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "./use-auth";

export function useSupabaseReactions(postId: string, initialLikesCount: number = 0) {
  const { user, isSignedIn } = useAuth();
  const [reaction, setReaction] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(initialLikesCount);
  const initialReactionRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!isSignedIn || !user || !postId) {
      if (mounted) {
        setReaction(null);
        setLikeCount(initialLikesCount);
      }
      return;
    }

    async function fetchReaction() {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await (supabase as any)
          .from("user_post_reactions")
          .select("reaction_type")
          .eq("post_id", postId)
          .eq("user_id", user!.id)
          .limit(1)
          .maybeSingle();

        if (mounted) {
          if (!error && data) {
            setReaction(data.reaction_type);
            initialReactionRef.current = data.reaction_type;
          } else {
            setReaction(null);
            initialReactionRef.current = null;
          }
          // Reset count based on the initial DB value so we don't double count
          setLikeCount(initialLikesCount);
        }
      } catch (err) {
        // ignore silently
      }
    }

    fetchReaction();
    return () => { mounted = false; };
  }, [postId, user, isSignedIn, initialLikesCount]);

  const toggleReaction = useCallback(async (newReaction: string | null) => {
    if (!isSignedIn || !user) return;
    
    const previousReaction = reaction;
    
    // Optimistic Update
    setReaction(newReaction);
    
    // Calculate new like count
    // If we are adding a reaction and didn't have one, +1
    // If we are removing a reaction and had one, -1
    // If we are just changing the reaction type, +0
    setLikeCount((prev) => {
      let next = prev;
      if (!previousReaction && newReaction) next += 1;
      else if (previousReaction && !newReaction) next -= 1;
      return Math.max(0, next);
    });

    try {
      const supabase = createBrowserClient();
      
      // Remove existing reaction first to prevent unique constraint issues or duplicate rows
      await (supabase as any)
        .from("user_post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      // Insert new reaction if one was selected
      if (newReaction) {
        const { error } = await (supabase as any).from("user_post_reactions").insert({
          post_id: postId,
          user_id: user.id,
          reaction_type: newReaction,
        });
        
        if (error) throw error;
      }
    } catch (err) {
      console.error("Failed to sync reaction to database:", err);
      // Revert optimistic update on failure
      setReaction(previousReaction);
      setLikeCount((prev) => {
        let next = prev;
        if (!newReaction && previousReaction) next += 1;
        else if (newReaction && !previousReaction) next -= 1;
        return Math.max(0, next);
      });
    }
  }, [postId, user, isSignedIn, reaction]);

  return { reaction, toggleReaction, likeCount };
}
