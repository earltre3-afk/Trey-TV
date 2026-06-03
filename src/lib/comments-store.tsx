import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";

export type Comment = {
  id: string;
  postId: string;
  parentId?: string;
  author: {
    id?: string;
    publicProfileUid?: string | null;
    name: string;
    handle: string;
    avatar: string;
  };
  text: string;
  likes: number;
  likedByMe: boolean;
  createdAt: number;
  editedAt?: number;
  gifUrl?: string | null;
  gifPosterUrl?: string | null;
  gifFwdId?: string | null;
};

type Ctx = {
  byPost: (postId: string) => Comment[];
  loaded: (postId: string) => boolean;
  add: (
    postId: string,
    text: string,
    parentId?: string,
    gif?: { gifUrl?: string | null; gifPosterUrl?: string | null; gifFwdId?: string | null },
  ) => Promise<boolean>;
  toggleLike: (id: string) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
  edit: (id: string, text: string) => Promise<boolean>;
  isMine: (c: Comment) => boolean;
};

const C = createContext<Ctx | null>(null);
const KEY = "treytv_comments_v1";

const SEED: Comment[] = [
  {
    id: "c-seed-1",
    postId: "p1",
    author: { name: "Aria Knox", handle: "ariaknox", avatar: "https://i.pravatar.cc/120?img=47" },
    text: "This shot is unreal",
    likes: 12,
    likedByMe: false,
    createdAt: Date.now() - 1000 * 60 * 22,
  },
  {
    id: "c-seed-2",
    postId: "p1",
    author: { name: "Miles Vega", handle: "milesvega", avatar: "https://i.pravatar.cc/120?img=12" },
    text: "Drop the preset pls",
    likes: 4,
    likedByMe: false,
    createdAt: Date.now() - 1000 * 60 * 8,
  },
];

const isUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Comment[]>([]);
  const [loadedPosts, setLoadedPosts] = useState<Set<string>>(() => new Set());
  const fetchedPosts = useRef<Set<string>>(new Set());
  const currentUser = useCurrentUser();
  const { user: supabaseUser } = useSupabaseAuth();

  useEffect(() => {
    if (supabaseUser) {
      setItems([]);
      setLoadedPosts(new Set());
      fetchedPosts.current.clear();
      return;
    }
    try {
      const raw = localStorage.getItem(KEY);
      setItems(raw ? JSON.parse(raw) : SEED);
    } catch {
      setItems(SEED);
    }
  }, [supabaseUser?.id]);

  useEffect(() => {
    if (supabaseUser) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, supabaseUser?.id]);

  const fetchCommentsForPost = async (postId: string) => {
    if (!isUUID(postId)) {
      setLoadedPosts((prev) => new Set(prev).add(postId));
      return;
    }

    const supabase = createBrowserClient();
    const { data, error } = await (supabase as any)
      .from("user_post_comments")
      .select(
        `
        id,
        post_id,
        creator_id,
        parent_comment_id,
        body,
        gif_url,
        gif_poster_url,
        gif_fwd_id,
        updated_at,
        created_at
      `,
      )
      .eq("post_id", postId)
      .eq("moderation_status", "visible")
      .is("deleted_at", null)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to fetch comments for post:", JSON.stringify(error, null, 2));
      console.error(
        "Error message:",
        error.message,
        "details:",
        error.details,
        "hint:",
        error.hint,
      );
      setLoadedPosts((prev) => new Set(prev).add(postId));
      return;
    }

    const rows = (data ?? []) as any[];
    const ids = rows.map((row) => row.id);
    const creatorIds = [...new Set(rows.map((row) => row.creator_id).filter(Boolean))];
    let reactionRows: any[] = [];
    const profilesById = new Map<string, any>();

    await Promise.all([
      ids.length > 0
        ? (supabase as any)
            .from("user_comment_reactions")
            .select("comment_id, user_id")
            .in("comment_id", ids)
        : Promise.resolve({ data: [], error: null }),
      creatorIds.length > 0
        ? (supabase as any)
            .from("profiles")
            .select("id, display_name, username, avatar_url, public_profile_uid")
            .in("id", creatorIds)
        : Promise.resolve({ data: [], error: null }),
    ]).then(([reactionResult, profileResult]) => {
      if (!reactionResult.error) reactionRows = reactionResult.data ?? [];
      if (!profileResult.error) {
        (profileResult.data ?? []).forEach((profile: any) => profilesById.set(profile.id, profile));
      }
    });

    const likesByComment = new Map<string, number>();
    const likedByMe = new Set<string>();
    reactionRows.forEach((row) => {
      likesByComment.set(row.comment_id, (likesByComment.get(row.comment_id) ?? 0) + 1);
      if (supabaseUser && row.user_id === supabaseUser.id) likedByMe.add(row.comment_id);
    });

    const dbComments: Comment[] = rows.map((row) => {
      const profile = profilesById.get(row.creator_id);
      return {
        id: row.id,
        postId: row.post_id,
        parentId: row.parent_comment_id || undefined,
        author: {
          id: row.creator_id,
          publicProfileUid: profile?.public_profile_uid || null,
          name: profile?.display_name || profile?.username || "Trey TV Member",
          handle: profile?.username || "member",
          avatar: profile?.avatar_url || "",
        },
        text: row.body,
        gifUrl: row.gif_url ?? null,
        gifPosterUrl: row.gif_poster_url ?? null,
        gifFwdId: row.gif_fwd_id ?? null,
        likes: likesByComment.get(row.id) ?? 0,
        likedByMe: likedByMe.has(row.id),
        createdAt: new Date(row.created_at).getTime(),
        editedAt:
          row.updated_at &&
          new Date(row.updated_at).getTime() - new Date(row.created_at).getTime() > 1000
            ? new Date(row.updated_at).getTime()
            : undefined,
      };
    });

    setItems((prev) => {
      const localOnly = supabaseUser ? [] : prev.filter((c) => !isUUID(c.id));
      return [
        ...localOnly,
        ...prev.filter((c) => c.postId !== postId && isUUID(c.id)),
        ...dbComments,
      ];
    });
    setLoadedPosts((prev) => new Set(prev).add(postId));
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

  const loaded: Ctx["loaded"] = (postId) => loadedPosts.has(postId);

  const add: Ctx["add"] = async (postId, text, parentId, gif) => {
    const trimmed = text.trim();
    if (!trimmed && !gif?.gifUrl) return false;

    const localId = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `c-${Date.now()}`;
    const newComment: Comment = {
      id: localId,
      postId,
      parentId,
      author: {
        id: supabaseUser?.id,
        publicProfileUid: currentUser.uid || null,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
      },
      text: trimmed,
      likes: 0,
      likedByMe: false,
      createdAt: Date.now(),
      gifUrl: gif?.gifUrl ?? null,
      gifPosterUrl: gif?.gifPosterUrl ?? null,
      gifFwdId: gif?.gifFwdId ?? null,
    };

    setItems((s) => [...s, newComment]);

    if (!supabaseUser || !isUUID(postId)) return true;

    const supabase = createBrowserClient();
    const { data, error } = await (supabase as any)
      .from("user_post_comments")
      .insert({
        post_id: postId,
        parent_comment_id: parentId || null,
        body: trimmed || null,
        creator_id: supabaseUser.id,
        gif_url: gif?.gifUrl ?? null,
        gif_poster_url: gif?.gifPosterUrl ?? null,
        gif_fwd_id: gif?.gifFwdId ?? null,
      })
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Failed to add comment:", error);
      setItems((s) => s.filter((x) => x.id !== localId));
      return false;
    }

    if (data) {
      setItems((s) =>
        s.map((x) =>
          x.id === localId
            ? {
                ...x,
                id: data.id,
                createdAt: data.created_at ? new Date(data.created_at).getTime() : x.createdAt,
              }
            : x,
        ),
      );
    }
    return true;
  };

  const toggleLike: Ctx["toggleLike"] = async (id) => {
    const comment = items.find((c) => c.id === id);
    if (!comment) return false;

    const nextLiked = !comment.likedByMe;
    setItems((s) =>
      s.map((c) =>
        c.id === id
          ? {
              ...c,
              likedByMe: nextLiked,
              likes: Math.max(0, c.likes + (nextLiked ? 1 : -1)),
            }
          : c,
      ),
    );

    if (!supabaseUser || !isUUID(id)) return true;

    try {
      const supabase = createBrowserClient();
      const result = nextLiked
        ? await (supabase as any).from("user_comment_reactions").upsert(
            {
              comment_id: id,
              user_id: supabaseUser.id,
              reaction_type: "like",
            },
            { onConflict: "comment_id,user_id" },
          )
        : await (supabase as any)
            .from("user_comment_reactions")
            .delete()
            .eq("comment_id", id)
            .eq("user_id", supabaseUser.id);

      if (result.error) throw result.error;
      return true;
    } catch (error) {
      console.error("Failed to persist comment reaction:", error);
      setItems((s) =>
        s.map((c) =>
          c.id === id
            ? {
                ...c,
                likedByMe: !nextLiked,
                likes: Math.max(0, c.likes + (nextLiked ? -1 : 1)),
              }
            : c,
        ),
      );
      return false;
    }
  };

  const remove: Ctx["remove"] = async (id) => {
    const comment = items.find((c) => c.id === id);
    if (!comment) return false;

    setItems((s) => s.filter((c) => c.id !== id && c.parentId !== id));

    if (!supabaseUser || !isUUID(id)) return true;

    const supabase = createBrowserClient();
    const { error } = await (supabase as any)
      .from("user_post_comments")
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("creator_id", supabaseUser.id);

    if (error) {
      console.error("Failed to delete comment:", error);
      void fetchCommentsForPost(comment.postId);
      return false;
    }
    return true;
  };

  const edit: Ctx["edit"] = async (id, text) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const comment = items.find((c) => c.id === id);
    if (!comment) return false;

    setItems((s) =>
      s.map((c) => (c.id === id ? { ...c, text: trimmed, editedAt: Date.now() } : c)),
    );

    if (!supabaseUser || !isUUID(id)) return true;

    try {
      const supabase = createBrowserClient();
      const { error } = await (supabase as any)
        .from("user_post_comments")
        .update({ body: trimmed, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("creator_id", supabaseUser.id);
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Failed to edit comment:", error);
      setItems((s) => s.map((c) => (c.id === id ? comment : c)));
      return false;
    }
  };

  const isMine: Ctx["isMine"] = (c) =>
    (!!supabaseUser && c.author.id === supabaseUser.id) || c.author.handle === currentUser.handle;

  return (
    <C.Provider value={{ byPost, loaded, add, toggleLike, remove, edit, isMine }}>
      {children}
    </C.Provider>
  );
}

export function useComments() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useComments must be inside <CommentsProvider>");
  return ctx;
}
