import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";

export type Comment = {
  id: string;
  postId: string;
  parentId?: string;
  author: { id?: string; name: string; handle: string; avatar: string };
  text: string;
  likes: number;
  likedByMe: boolean;
  createdAt: number;
  editedAt?: number;
};

type Ctx = {
  byPost: (postId: string) => Comment[];
  add: (postId: string, text: string, parentId?: string) => void;
  toggleLike: (id: string) => void;
  remove: (id: string) => void;
  edit: (id: string, text: string) => void;
  isMine: (c: Comment) => boolean;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_comments_v1";

const SEED: Comment[] = [
  { id: "c-seed-1", postId: "p1", author: { name: "Aria Knox", handle: "ariaknox", avatar: "https://i.pravatar.cc/120?img=47" }, text: "This shot is unreal", likes: 12, likedByMe: false, createdAt: Date.now() - 1000 * 60 * 22 },
  { id: "c-seed-2", postId: "p1", author: { name: "Miles Vega", handle: "milesvega", avatar: "https://i.pravatar.cc/120?img=12" }, text: "Drop the preset pls", likes: 4, likedByMe: false, createdAt: Date.now() - 1000 * 60 * 8 },
];

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Comment[]>(SEED);
  const fetchedPosts = useRef<Set<string>>(new Set());
  const currentUser = useCurrentUser();
  const { user: supabaseUser } = useSupabaseAuth();

  useEffect(() => {
    if (supabaseUser) return;
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, [supabaseUser?.id]);

  useEffect(() => {
    if (supabaseUser) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, supabaseUser?.id]);

  const fetchCommentsForPost = async (postId: string) => {
    const supabase = createBrowserClient();
    const { data, error } = await (supabase as any)
      .from("user_post_comments")
      .select(`
        id,
        post_id,
        creator_id,
        parent_comment_id,
        body,
        edited_at,
        created_at,
        profiles:creator_id (
          display_name,
          username,
          avatar_url,
          public_profile_uid
        )
      `)
      .eq("post_id", postId)
      .eq("moderation_status", "visible")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch comments for post:", error);
      return;
    }

    const rows = (data ?? []) as any[];
    const ids = rows.map((row) => row.id);
    let reactionRows: any[] = [];

    if (ids.length > 0) {
      const { data: reactions, error: reactionError } = await (supabase as any)
        .from("user_comment_reactions")
        .select("comment_id, user_id")
        .in("comment_id", ids);

      if (!reactionError) reactionRows = reactions ?? [];
    }

    const likesByComment = new Map<string, number>();
    const likedByMe = new Set<string>();
    reactionRows.forEach((row) => {
      likesByComment.set(row.comment_id, (likesByComment.get(row.comment_id) ?? 0) + 1);
      if (supabaseUser && row.user_id === supabaseUser.id) likedByMe.add(row.comment_id);
    });

    const dbComments: Comment[] = rows.map((row) => ({
      id: row.id,
      postId: row.post_id,
      parentId: row.parent_comment_id || undefined,
      author: {
        id: row.creator_id,
        name: row.profiles?.display_name || "Unknown",
        handle: row.profiles?.username || "unknown",
        avatar: row.profiles?.avatar_url || "",
      },
      text: row.body,
      likes: likesByComment.get(row.id) ?? 0,
      likedByMe: likedByMe.has(row.id),
      createdAt: new Date(row.created_at).getTime(),
      editedAt: row.edited_at ? new Date(row.edited_at).getTime() : undefined,
    }));

    setItems((prev) => {
      const localOnly = supabaseUser ? [] : prev.filter((c) => !isUUID(c.id));
      return [...localOnly, ...prev.filter((c) => c.postId !== postId && isUUID(c.id)), ...dbComments];
    });
  };

  const byPost: Ctx["byPost"] = (postId) => {
    if (!fetchedPosts.current.has(postId)) {
      fetchedPosts.current.add(postId);
      setTimeout(() => {
        void fetchCommentsForPost(postId);
      }, 0);
    }
    return items.filter((c) => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
  };

  const add: Ctx["add"] = async (postId, text, parentId) => {
    if (!text.trim()) return;

    const localId = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `c-${Date.now()}`;
    const newComment: Comment = {
      id: localId,
      postId,
      parentId,
      author: {
        id: supabaseUser?.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
      },
      text: text.trim(),
      likes: 0,
      likedByMe: false,
      createdAt: Date.now(),
    };

    setItems((s) => [...s, newComment]);

    if (!supabaseUser) return;

    const supabase = createBrowserClient();
    const { data, error } = await (supabase as any)
      .from("user_post_comments")
      .insert({
        post_id: postId,
        parent_comment_id: parentId || null,
        body: text.trim(),
        creator_id: supabaseUser.id,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Failed to add comment:", error);
      setItems((s) => s.filter((x) => x.id !== localId));
      return;
    }

    if (data) {
      setItems((s) => s.map((x) => x.id === localId ? {
        ...x,
        id: data.id,
        createdAt: data.created_at ? new Date(data.created_at).getTime() : x.createdAt,
      } : x));
    }
  };

  const toggleLike: Ctx["toggleLike"] = (id) => {
    const comment = items.find((c) => c.id === id);
    if (!comment) return;

    const nextLiked = !comment.likedByMe;
    setItems((s) => s.map((c) => c.id === id ? {
      ...c,
      likedByMe: nextLiked,
      likes: Math.max(0, c.likes + (nextLiked ? 1 : -1)),
    } : c));

    if (!supabaseUser || !isUUID(id)) return;

    void (async () => {
      try {
        const supabase = createBrowserClient();
        const result = nextLiked
          ? await (supabase as any).from("user_comment_reactions").upsert({
              comment_id: id,
              user_id: supabaseUser.id,
              reaction_type: "like",
            }, { onConflict: "comment_id,user_id" })
          : await (supabase as any)
              .from("user_comment_reactions")
              .delete()
              .eq("comment_id", id)
              .eq("user_id", supabaseUser.id);

        if (result.error) throw result.error;
      } catch (error) {
        console.error("Failed to persist comment reaction:", error);
        setItems((s) => s.map((c) => c.id === id ? {
          ...c,
          likedByMe: !nextLiked,
          likes: Math.max(0, c.likes + (nextLiked ? -1 : 1)),
        } : c));
      }
    })();
  };

  const remove: Ctx["remove"] = async (id) => {
    const comment = items.find((c) => c.id === id);
    if (!comment) return;

    setItems((s) => s.filter((c) => c.id !== id && c.parentId !== id));

    if (!supabaseUser || !isUUID(id)) return;

    const supabase = createBrowserClient();
    const { error } = await (supabase as any)
      .from("user_post_comments")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("creator_id", supabaseUser.id);

    if (error) {
      console.error("Failed to delete comment:", error);
      void fetchCommentsForPost(comment.postId);
    }
  };

  const edit: Ctx["edit"] = (id, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setItems((s) => s.map((c) => c.id === id ? { ...c, text: trimmed, editedAt: Date.now() } : c));

    if (!supabaseUser || !isUUID(id)) return;

    void (async () => {
      try {
        const supabase = createBrowserClient();
        const { error } = await (supabase as any)
          .from("user_post_comments")
          .update({ body: trimmed, edited_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq("id", id)
          .eq("creator_id", supabaseUser.id);
        if (error) throw error;
      } catch (error) {
        console.error("Failed to edit comment:", error);
      }
    })();
  };

  const isMine: Ctx["isMine"] = (c) =>
    (!!supabaseUser && c.author.id === supabaseUser.id) || c.author.handle === currentUser.handle;

  return <C.Provider value={{ byPost, add, toggleLike, remove, edit, isMine }}>{children}</C.Provider>;
}

export function useComments() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useComments must be inside <CommentsProvider>");
  return ctx;
}
