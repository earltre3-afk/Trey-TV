import { useState, useEffect } from "react";
import { createBrowserClient } from "../lib/supabase-browser";

export interface SupabasePost {
  id: string;
  body: string | null;
  content: string | null;
  image_url: string | null;
  media_urls: string[] | null;
  status: string;
  visibility: string;
  likes_count: number | null;
  comments_count: number | null;
  created_at: string;
  author?: {
    public_profile_uid?: string;
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    is_creator?: boolean;
  };
  creator?: {
    public_profile_uid?: string;
    display_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
    is_creator?: boolean;
  };
}

export function usePosts() {
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchPosts() {
      try {
        setLoading(true);
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from("user_posts")
          .select(`
            id,
            body,
            content,
            image_url,
            media_urls,
            status,
            visibility,
            likes_count,
            comments_count,
            created_at,
            author:profiles!user_posts_author_id_fkey(public_profile_uid, display_name, username, avatar_url),
            creator:profiles!user_posts_creator_id_fkey(public_profile_uid, display_name, username, avatar_url)
          `)
          .eq("status", "published")
          .eq("visibility", "public")
          .order("created_at", { ascending: false })
          .limit(30);

        if (error) {
          // If the precise relation name fails, fall back to simple relation names.
          if (error.message.includes("relationship")) {
             const fallback = await supabase
              .from("user_posts")
              .select(`
                id,
                body,
                content,
                image_url,
                media_urls,
                status,
                visibility,
                likes_count,
                comments_count,
                created_at,
                author:profiles(public_profile_uid, display_name, username, avatar_url)
              `)
              .eq("status", "published")
              .eq("visibility", "public")
              .order("created_at", { ascending: false })
              .limit(30);
              
              if (fallback.error) throw fallback.error;
              if (mounted) {
                setPosts(fallback.data as SupabasePost[]);
                setError(null);
                setLoading(false);
              }
              return;
          }
          throw error;
        }

        if (mounted) {
          setPosts(data as SupabasePost[]);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchPosts();

    return () => {
      mounted = false;
    };
  }, []);

  return { posts, loading, error };
}
