import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";
import { currentUser as mockUser } from "@/lib/mock-data";

export type Comment = {
  id: string;
  postId: string;
  parentId?: string;
  author: { name: string; handle: string; avatar: string };
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
  { id: "c-seed-1", postId: "p1", author: { name: "Aria Knox", handle: "ariaknox", avatar: "https://i.pravatar.cc/120?img=47" }, text: "This shot is unreal 🔥", likes: 12, likedByMe: false, createdAt: Date.now() - 1000 * 60 * 22 },
  { id: "c-seed-2", postId: "p1", author: { name: "Miles Vega", handle: "milesvega", avatar: "https://i.pravatar.cc/120?img=12" }, text: "Drop the preset pls", likes: 4, likedByMe: false, createdAt: Date.now() - 1000 * 60 * 8 },
];

const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

export function CommentsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Comment[]>(SEED);
  const fetchedPosts = useRef<Set<string>>(new Set());
  const currentUser = useCurrentUser();
  const { user: supabaseUser } = useSupabaseAuth();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        // Only restore non-UUID (mock) comments from local storage to avoid overriding real ones initially
        const parsed = JSON.parse(raw) as Comment[];
        const localMocks = parsed.filter(c => !isUUID(c.postId));
        setItems(prev => {
          const others = prev.filter(c => isUUID(c.postId));
          return [...others, ...localMocks];
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      // Only save local mock comments to localStorage
      const localMocks = items.filter(c => !isUUID(c.postId));
      localStorage.setItem(KEY, JSON.stringify(localMocks));
    } catch {}
  }, [items]);

  const fetchCommentsForPost = async (postId: string) => {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("user_post_comments")
      .select(`
        id,
        post_id,
        parent_comment_id,
        body,
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
      .is("deleted_at", null);

    if (!error && data) {
      const dbComments: Comment[] = data.map((row: any) => ({
        id: row.id,
        postId: row.post_id,
        parentId: row.parent_comment_id || undefined,
        author: {
          name: row.profiles?.display_name || "Unknown",
          handle: row.profiles?.username || "unknown",
          avatar: row.profiles?.avatar_url || "",
        },
        text: row.body,
        likes: 0,
        likedByMe: false,
        createdAt: new Date(row.created_at).getTime(),
      }));

      setItems((prev) => {
        const filtered = prev.filter(c => c.postId !== postId);
        return [...filtered, ...dbComments];
      });
    } else if (error) {
      console.error("Failed to fetch comments for post:", error);
    }
  };

  const byPost: Ctx["byPost"] = (postId) => {
    if (isUUID(postId) && !fetchedPosts.current.has(postId)) {
      fetchedPosts.current.add(postId);
      setTimeout(() => {
        fetchCommentsForPost(postId);
      }, 0);
    }
    return items.filter((c) => c.postId === postId).sort((a, b) => a.createdAt - b.createdAt);
  };

  const add: Ctx["add"] = async (postId, text, parentId) => {
    if (!text.trim()) return;
    const isMock = !isUUID(postId);

    const localId = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `c-${Date.now()}`;
    const newComment: Comment = {
      id: localId,
      postId,
      parentId,
      author: { 
        name: currentUser.name, 
        handle: currentUser.handle, 
        avatar: currentUser.avatar 
      },
      text: text.trim(),
      likes: 0,
      likedByMe: false,
      createdAt: Date.now(),
    };

    setItems((s) => [...s, newComment]);

    if (!isMock) {
      if (!supabaseUser) return;
      
      const supabase = createBrowserClient();
      const { data, error } = await supabase
        .from("user_post_comments")
        .insert({
          post_id: postId,
          parent_comment_id: parentId || null,
          body: text.trim(),
          creator_id: supabaseUser.id,
        } as any)
        .select("id")
        .single();

      if (error) {
        console.error("Failed to add comment:", error);
        setItems((s) => s.filter(x => x.id !== localId));
      } else if (data) {
        setItems((s) => s.map(x => x.id === localId ? { ...x, id: (data as any).id } : x));
      }
    }
  };

  const toggleLike: Ctx["toggleLike"] = (id) =>
    setItems((s) => s.map((c) => c.id === id ? { ...c, likedByMe: !c.likedByMe, likes: c.likes + (c.likedByMe ? -1 : 1) } : c));

  const remove: Ctx["remove"] = async (id) => {
    const comment = items.find(c => c.id === id);
    if (!comment) return;
    
    const postId = comment.postId;
    setItems((s) => s.filter((c) => c.id !== id && c.parentId !== id));

    if (isUUID(postId)) {
      const supabase = createBrowserClient();
      const { error } = await supabase
        .from("user_post_comments")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Failed to delete comment:", error);
        fetchCommentsForPost(postId);
      }
    }
  };

  const edit: Ctx["edit"] = (id, text) =>
    setItems((s) => s.map((c) => c.id === id ? { ...c, text: text.trim(), editedAt: Date.now() } : c));

  const isMine: Ctx["isMine"] = (c) => c.author.handle === currentUser.handle;

  return <C.Provider value={{ byPost, add, toggleLike, remove, edit, isMine }}>{children}</C.Provider>;
}

export function useComments() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useComments must be inside <CommentsProvider>");
  return ctx;
}
