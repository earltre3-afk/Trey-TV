import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link, e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell, i as isPublicProfileUid, P as ProfilePictureLink, V as VerifiedBadge } from "./AppShell-BWcCrjwR.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { m as useFeed, q as useFollow, v as posts, e as creators, w as prescribed, b as useAuth$1, k as currentUser, n as useActivity, u as useAuth, a as useCurrentUser, o as useComments, h as useMessages, p as REACTIONS, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { a as useFwdConnectionStatus, u as useMarkFwdGifUsed, F as FwdGifPicker, b as buildFwdGifDetailUrl } from "./FwdGifPicker-CLzlV72K.mjs";
import { g as getMutualFollows } from "./social-relationships-wtdld6Dy.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { R as Radio, S as Sparkles, ai as Star, Y as Flame, T as TrendingUp, at as UserPlus, G as Globe, a5 as Users, i as Lock, X, d as Image, W as WandSparkles, ak as ChevronDown, P as Plus, az as LoaderCircle, aV as Ellipsis, aJ as Pause, a4 as Play, b as Heart, au as MessageCircle, b4 as Repeat2, a8 as Bookmark, f as Send, a_ as ExternalLink, k as Check, b5 as Reply, ao as Pencil, aF as Trash2, b6 as Forward } from "../_libs/lucide-react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const tags = [
  { label: "Music", color: "cyan" },
  { label: "Comedy", color: "cyan" },
  { label: "Motivation", color: "purple" },
  { label: "Fashion", color: "gold" },
  { label: "Gaming", color: "magenta" }
];
const ringMap = {
  cyan: "border-[oklch(0.82_0.15_215)] text-[oklch(0.82_0.15_215)]",
  purple: "border-[oklch(0.65_0.22_300)] text-[oklch(0.65_0.22_300)]",
  gold: "border-primary text-primary",
  magenta: "border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]"
};
const AUDIENCES = [
  { id: "Everyone", label: "Everyone", icon: Globe },
  { id: "Followers", label: "Followers", icon: Users },
  { id: "Premium", label: "Premium", icon: Lock }
];
const MAX = 500;
const postSchema = objectType({
  text: stringType().trim().min(1, "Write something first").max(MAX, `Keep it under ${MAX} characters`)
});
function Composer() {
  const navigate = useNavigate();
  const { addPost } = useFeed();
  const { isGuest } = useAuth$1();
  const [selected, setSelected] = reactExports.useState([]);
  const [text, setText] = reactExports.useState("");
  const [audience, setAudience] = reactExports.useState("Everyone");
  const [audOpen, setAudOpen] = reactExports.useState(false);
  const [media, setMedia] = reactExports.useState(null);
  const [focused, setFocused] = reactExports.useState(false);
  const taRef = reactExports.useRef(null);
  const fileRef = reactExports.useRef(null);
  const toggleTag = (t) => setSelected((s) => s.includes(t) ? s.filter((x) => x !== t) : [...s, t]);
  reactExports.useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 280) + "px";
  }, [text]);
  const reset = () => {
    setText("");
    setMedia(null);
    setSelected([]);
    setFocused(false);
  };
  const handlePost = () => {
    if (isGuest) {
      toast("Sign up to post");
      navigate({ to: "/signup" });
      return;
    }
    const parsed = postSchema.safeParse({ text });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Invalid post");
      return;
    }
    addPost({ text: parsed.data.text, audience, tags: selected, media: media ?? void 0 });
    toast.success("Posted to your feed");
    reset();
  };
  const onFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Image files only");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Image must be under 8MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setMedia(typeof reader.result === "string" ? reader.result : null);
    reader.readAsDataURL(f);
  };
  const remaining = MAX - text.length;
  const aud = AUDIENCES.find((a) => a.id === audience);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mobile-edge-card rounded-none sm:rounded-3xl p-3 sm:p-4 glass neon-border shadow-[0_0_30px_-10px_oklch(0.82_0.16_85_/_0.4)] relative overflow-hidden hover-lift", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_80%_-20%,oklch(0.7_0.25_340_/_0.4),transparent_60%)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-11 rounded-full conic-ring shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: currentUser.avatar, alt: "", className: "size-11 rounded-full object-cover" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "textarea",
          {
            ref: taRef,
            value: text,
            onChange: (e) => setText(e.target.value.slice(0, MAX)),
            onFocus: () => setFocused(true),
            onKeyDown: (e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handlePost();
              }
            },
            placeholder: `What's on your mind, ${currentUser.name}?`,
            rows: 1,
            maxLength: MAX,
            className: "w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground leading-relaxed",
            "aria-label": "Post composer"
          }
        ),
        media && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-2 rounded-xl overflow-hidden border border-white/10", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: media, alt: "", className: "w-full max-h-64 object-cover" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setMedia(null),
              className: "absolute top-2 right-2 size-7 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur",
              "aria-label": "Remove image",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3.5" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3 flex items-center gap-2 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileRef,
          type: "file",
          accept: "image/*",
          className: "hidden",
          onChange: (e) => onFile(e.target.files?.[0] ?? null)
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileRef.current?.click(), className: "px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-4" }),
        " Image"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({ to: "/creator-studio/edit" }), className: "px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { className: "size-4 text-primary" }),
        " Trey-I Tools"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setAudOpen((s) => !s), className: "px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(aud.icon, { className: "size-4" }),
          " ",
          aud.label,
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: `size-3 transition-transform ${audOpen ? "rotate-180" : ""}` })
        ] }),
        audOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-full mt-2 w-44 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30 animate-scale-in", children: AUDIENCES.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => {
              setAudience(a.id);
              setAudOpen(false);
            },
            className: `w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 flex items-center gap-2 ${audience === a.id ? "text-primary font-semibold" : ""}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(a.icon, { className: "size-4" }),
              " ",
              a.label
            ]
          },
          a.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto flex items-center gap-2", children: [
        (focused || text.length > 0) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[11px] tabular-nums ${remaining < 40 ? "text-[oklch(0.78_0.24_15)]" : "text-muted-foreground"}`, children: remaining }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handlePost,
            disabled: text.trim().length === 0,
            className: "px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:glow-none",
            children: "Post"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-2", children: "RECOMMENDATION TAGS" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
        tags.map((t) => {
          const isSel = selected.includes(t.label);
          return /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => toggleTag(t.label),
              className: `px-3 py-1 rounded-full text-xs border ${ringMap[t.color]} ${isSel ? "bg-white/10" : "bg-transparent hover:bg-white/5"}`,
              children: t.label
            },
            t.label
          );
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({ to: "/creator-studio/edit" }), className: "size-7 grid place-items-center rounded-full border border-white/15 text-muted-foreground hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3.5" }) })
      ] })
    ] })
  ] });
}
function CreatorRail() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 overflow-x-auto no-scrollbar px-2 py-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 shrink-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Going live — preparing your stream"), className: "size-16 rounded-2xl border border-primary/60 grid place-items-center text-primary glow-gold bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-6" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-primary font-semibold", children: "Go Live" })
    ] }),
    creators.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        onClick: () => toast(`Opening ${c.name}'s channel`),
        className: "flex flex-col items-center gap-1 shrink-0 w-[72px] tilt-press",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-16 rounded-full conic-ring", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: c.avatar,
                alt: c.name,
                className: "size-16 rounded-full object-cover ring-1 ring-white/20",
                loading: "lazy"
              }
            ),
            c.live && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-[oklch(0.65_0.24_15)] text-white shadow-[0_0_10px_oklch(0.65_0.24_15_/_0.8)] animate-glow-pulse", children: "LIVE" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-foreground/90 truncate w-full text-center", children: c.name })
        ]
      },
      c.id
    ))
  ] });
}
const lovableToSupabaseReaction = {
  fire: "like",
  gem: "love",
  crown: "wow",
  dead: "laugh",
  cinematic: "sad"
};
const supabaseToLovableReaction = {
  like: "fire",
  love: "gem",
  wow: "crown",
  laugh: "dead",
  sad: "cinematic"
};
function toSupabaseReaction(reaction) {
  return reaction ? lovableToSupabaseReaction[reaction] : null;
}
function toLovableReaction(reaction) {
  const normalized = String(reaction ?? "").trim().toLowerCase();
  return supabaseToLovableReaction[normalized] ?? null;
}
function userPostReactionsTable(supabase) {
  return supabase.from("user_post_reactions");
}
function useSupabaseReactions(postId, initialLikesCount = 0) {
  const { user, isSignedIn } = useAuth();
  const [reaction, setReaction] = reactExports.useState(null);
  const [likeCount, setLikeCount] = reactExports.useState(initialLikesCount);
  const [pending, setPending] = reactExports.useState(false);
  reactExports.useEffect(() => {
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
        const countRequest = userPostReactionsTable(supabase).select("id", { count: "exact", head: true }).eq("post_id", postId);
        const reactionRequest = isSignedIn && user ? userPostReactionsTable(supabase).select("reaction_type").eq("post_id", postId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle() : Promise.resolve({ data: null, error: null });
        const [countResult, reactionResult] = await Promise.all([countRequest, reactionRequest]);
        if (!mounted) return;
        if (!countResult.error) {
          setLikeCount(countResult.count ?? initialLikesCount);
        } else {
          setLikeCount(initialLikesCount);
        }
        if (!reactionResult.error && reactionResult.data) {
          setReaction(toLovableReaction(reactionResult.data.reaction_type));
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
  const fetchCount = reactExports.useCallback(async () => {
    if (!postId) return initialLikesCount;
    const supabase = createBrowserClient();
    const { count, error } = await userPostReactionsTable(supabase).select("id", { count: "exact", head: true }).eq("post_id", postId);
    if (error) return null;
    return count ?? 0;
  }, [postId, initialLikesCount]);
  const toggleReaction = reactExports.useCallback(async (newReaction) => {
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
      const deleteResult = await userPostReactionsTable(supabase).delete().eq("post_id", postId).eq("user_id", user.id);
      if (deleteResult.error) throw deleteResult.error;
      if (nextSupabaseReaction) {
        const { error } = await userPostReactionsTable(supabase).upsert({
          post_id: postId,
          user_id: user.id,
          reaction_type: nextSupabaseReaction
        }, { onConflict: "post_id,user_id" });
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
  }, [postId, user, isSignedIn, reaction, likeCount, fetchCount]);
  return { reaction, toggleReaction, likeCount, pending };
}
function fmt(n) {
  return n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` : `${n}`;
}
function PostCard({ post, index = 0 }) {
  const { saves, toggleSave, logShare } = useActivity();
  const { addPost, updatePost, removePost } = useFeed();
  const { isSignedIn, user } = useAuth();
  const currentProfile = useCurrentUser();
  const fwdStatus = useFwdConnectionStatus();
  const markUsed = useMarkFwdGifUsed();
  const isGuest = !isSignedIn;
  const nav = useNavigate();
  const { reaction, toggleReaction, likeCount, pending: reactionPending } = useSupabaseReactions(post.id, post.likes);
  const saved = !!saves[post.id];
  const [reshared, setReshared] = reactExports.useState(false);
  const [playing, setPlaying] = reactExports.useState(false);
  const [pickerOpen, setPickerOpen] = reactExports.useState(false);
  const [burst, setBurst] = reactExports.useState(false);
  const [commentsOpen, setCommentsOpen] = reactExports.useState(false);
  const [newComment, setNewComment] = reactExports.useState("");
  const [replyTo, setReplyTo] = reactExports.useState(null);
  const [commentGif, setCommentGif] = reactExports.useState(null);
  const [showGifPicker, setShowGifPicker] = reactExports.useState(false);
  const [postMenuOpen, setPostMenuOpen] = reactExports.useState(false);
  const [editOpen, setEditOpen] = reactExports.useState(false);
  const [editText, setEditText] = reactExports.useState(post.text);
  const [deleteOpen, setDeleteOpen] = reactExports.useState(false);
  const [fwdOpen, setFwdOpen] = reactExports.useState(false);
  const [fwdPickerOpen, setFwdPickerOpen] = reactExports.useState(false);
  const [fwdCaption, setFwdCaption] = reactExports.useState("");
  const [selectedFwdGif, setSelectedFwdGif] = reactExports.useState(null);
  const [shareDialogOpen, setShareDialogOpen] = reactExports.useState(false);
  const [mutuals, setMutuals] = reactExports.useState([]);
  const [loadingMutuals, setLoadingMutuals] = reactExports.useState(false);
  const { byPost, loaded: commentsLoaded, add, toggleLike, edit, remove, isMine } = useComments();
  const { openThread, send: sendMessage } = useMessages();
  const treyTvUid = currentProfile.uid || user?.id || null;
  const allComments = byPost(post.id);
  const commentCount = commentsLoaded(post.id) ? allComments.length : Math.max(post.comments, allComments.length);
  const topComments = allComments.filter((c) => !c.parentId);
  const repliesOf = (id) => allComments.filter((c) => c.parentId === id);
  const saveCount = post.saves + (saved ? 1 : 0);
  const reshareCount = post.reshares + (reshared ? 1 : 0);
  const meta = { title: post.text.split("\n")[0].slice(0, 60), creator: post.creator.handle, thumb: post.media };
  const creatorPublicProfileUid = post.creator.publicProfileUid || (isPublicProfileUid(post.creator.id) ? post.creator.id : null);
  const isOwner = Boolean(user?.id && post.ownerId && post.ownerId === user.id);
  const isFwdPost = post.sourceType === "fwd";
  reactExports.useEffect(() => {
    if (!postMenuOpen && !editOpen && !deleteOpen && !fwdOpen && !fwdPickerOpen) return;
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      setPostMenuOpen(false);
      setEditOpen(false);
      setDeleteOpen(false);
      setFwdOpen(false);
      setFwdPickerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [postMenuOpen, editOpen, deleteOpen, fwdOpen, fwdPickerOpen]);
  const requireAuth = (fn) => () => {
    if (isGuest) {
      toast("Sign up to interact");
      nav({ to: "/signup" });
      return;
    }
    fn();
  };
  const closePostModals = () => {
    setPostMenuOpen(false);
    setEditOpen(false);
    setDeleteOpen(false);
    setFwdOpen(false);
    setFwdPickerOpen(false);
  };
  const openEdit = () => {
    if (!isOwner) {
      toast.error("Only the post owner can do this");
      return;
    }
    setEditText(post.text);
    setPostMenuOpen(false);
    setEditOpen(true);
  };
  const saveEdit = async () => {
    const next = editText.trim();
    if (!next) {
      toast.error("Post text can't be empty");
      return;
    }
    setBusyAction("edit");
    const result = await updatePost(post.id, { text: next });
    setBusyAction(null);
    if (!result.ok) {
      toast.error(result.reason ?? "Could not update post");
      return;
    }
    toast.success("Post updated");
    setEditOpen(false);
  };
  const confirmDelete = async () => {
    setBusyAction("delete");
    const result = await removePost(post.id);
    setBusyAction(null);
    if (!result.ok) {
      toast.error(result.reason ?? "Could not delete post");
      return;
    }
    toast.success("Post deleted");
    closePostModals();
  };
  const openFwdComposer = () => {
    if (isGuest) {
      toast("Sign up to post with FWD");
      nav({ to: "/signup" });
      return;
    }
    setPostMenuOpen(false);
    setFwdOpen(true);
  };
  const postFwdGif = async () => {
    if (!selectedFwdGif?.url) {
      toast.error("Choose a GIF first");
      return;
    }
    const caption = fwdCaption.trim();
    setBusyAction("fwd");
    addPost({
      text: caption || selectedFwdGif.title || "FWD GIF",
      media: selectedFwdGif.url,
      sourceType: "fwd",
      gifFwdId: selectedFwdGif.gif_id ?? null,
      gifPosterUrl: selectedFwdGif.preview_url ?? null,
      gifTitle: selectedFwdGif.title ?? null,
      tags: ["FWD"]
    });
    setBusyAction(null);
    toast.success("FWD posted to Trey TV");
    setFwdCaption("");
    setSelectedFwdGif(null);
    setFwdOpen(false);
  };
  const configureFwd = () => {
    const returnTo = encodeURIComponent(window.location.href);
    window.open(`https://fwd.treytv.com/signup?returnTo=${returnTo}`, "_blank", "noopener,noreferrer");
  };
  const onCommentLike = async (id) => {
    if (isGuest) {
      toast("Sign up to like comments");
      nav({ to: "/signup" });
      return;
    }
    const ok = await toggleLike(id);
    if (!ok) toast("Couldn't update comment like. Try again.");
  };
  const onCommentEdit = async (id, text) => {
    const ok = await edit(id, text);
    if (!ok) toast("Couldn't edit comment. Try again.");
  };
  const onCommentDelete = async (id) => {
    const ok = await remove(id);
    if (!ok) toast("Couldn't delete comment. Try again.");
  };
  const onReactionPick = async (k) => {
    if (isGuest) {
      toast("Sign up to react");
      nav({ to: "/signup" });
      return;
    }
    const result = await toggleReaction(reaction === k ? null : k);
    if (!result.ok) {
      toast(result.reason === "signed-out" ? "Sign up to react" : "Reaction unavailable");
      if (result.reason === "signed-out") nav({ to: "/signup" });
      return;
    }
    setBurst(true);
    setPickerOpen(false);
    setTimeout(() => setBurst(false), 600);
  };
  const current = reaction ? REACTIONS.find((r) => r.key === reaction) : null;
  const loadMutuals = async () => {
    setLoadingMutuals(true);
    try {
      const dbMutuals = await getMutualFollows();
      const mockMutuals = creators.slice(0, 2).map((c) => ({
        id: c.id,
        public_profile_uid: null,
        username: c.handle,
        display_name: c.name,
        avatar_url: c.avatar,
        verification_type: c.verified
      }));
      const combined = [...dbMutuals];
      mockMutuals.forEach((m) => {
        if (!combined.some((c) => c.username === m.username)) combined.push(m);
      });
      setMutuals(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMutuals(false);
    }
  };
  const handleShareInternally = (peer) => {
    if (!mutuals.some((m) => m.id === peer.id)) {
      toast.error("You can only share with mutual friends!");
      return;
    }
    const threadId = openThread({
      id: peer.id,
      publicProfileUid: peer.public_profile_uid,
      name: peer.display_name,
      handle: peer.username,
      avatar: peer.avatar_url,
      verified: peer.verification_type
    });
    const shareText = `[TTV_SHARE:post:${encodeURIComponent(post.id)}:${encodeURIComponent(post.text)}:${encodeURIComponent(post.media || "")}]`;
    sendMessage(threadId, shareText);
    toast.success(`Shared post with @${peer.username}!`);
    setShareDialogOpen(false);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "article",
    {
      className: "mobile-edge-card group relative rounded-none sm:rounded-3xl liquid-glass neon-border shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] liquid-hover",
      style: { animationDelay: `${index * 80}ms` },
      children: [
        shareDialogOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(ModalShell, { title: "Share Internally", eyebrow: "Send to Friends", onClose: () => setShareDialogOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "You can only share posts with mutual follows (friends). If you don't see someone, add/follow them first!" }),
          loadingMutuals ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-6 animate-spin text-primary" }) }) : mutuals.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-32 text-center text-sm text-muted-foreground space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "No mutual friends found." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => {
                  setShareDialogOpen(false);
                  nav({ to: "/explore" });
                },
                className: "text-xs font-semibold text-primary hover:underline",
                children: "Explore and follow creators to build connections!"
              }
            )
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-60 overflow-y-auto space-y-2 pr-1", children: mutuals.map((peer) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => handleShareInternally(peer),
              className: "flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left hover:bg-white/[0.08] transition",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: peer.avatar_url, alt: "", className: "size-9 rounded-full object-cover ring-1 ring-white/10" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: peer.display_name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
                    "@",
                    peer.username
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/15 border border-primary/20", children: "Send" })
              ]
            },
            peer.id
          )) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ProfilePictureLink,
            {
              publicProfileUid: creatorPublicProfileUid,
              label: `Open @${post.creator.handle}'s public profile`,
              className: "relative size-10 rounded-full conic-ring shrink-0 hover:scale-105 transition-transform",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: post.creator.avatar, alt: "", className: "size-10 rounded-full object-cover" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [
            creatorPublicProfileUid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$uid", params: { uid: creatorPublicProfileUid }, className: "font-semibold hover:underline", children: post.creator.name }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/channel/$handle", params: { handle: post.creator.handle }, className: "font-semibold hover:underline", children: post.creator.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(VerifiedBadge, { kind: post.creator.verified }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/channel/$handle", params: { handle: post.creator.handle }, className: "text-xs text-muted-foreground hover:text-foreground", children: [
              "@",
              post.creator.handle,
              " · ",
              post.timeAgo
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[10px] px-1.5 py-0.5 rounded-md border border-primary/50 text-primary", children: "Creator" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                setPostMenuOpen(true);
              },
              className: "size-8 grid place-items-center text-muted-foreground hover:text-foreground tilt-press",
              "aria-label": "Open post actions",
              "aria-haspopup": "dialog",
              "aria-expanded": postMenuOpen,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "size-5" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-4 pb-3 text-sm whitespace-pre-line", children: post.text }),
        post.media && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-0 sm:px-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-none sm:rounded-2xl overflow-hidden border-y border-x-0 sm:border-x border-white/10 shadow-[0_0_28px_-12px_oklch(0.65_0.22_300_/_0.6)] shimmer-sweep", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: isFwdPost ? post.gifPosterUrl || post.media : post.media, alt: "", className: "w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.04]", loading: "lazy" }),
          isFwdPost && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-3 top-3 rounded-full border border-primary/40 bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur", children: "FWD GIF" }),
          !isFwdPost && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPlaying((p) => !p), className: "absolute inset-0 grid place-items-center bg-black/10 hover:bg-black/30 transition", "aria-label": "Play", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `size-14 rounded-full grid place-items-center bg-black/50 backdrop-blur-md border border-white/20 transition-transform ${playing ? "scale-90" : "scale-100 group-hover:scale-110"} animate-glow-pulse`, children: playing ? /* @__PURE__ */ jsxRuntimeExports.jsx(Pause, { className: "size-6 fill-white text-white" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-6 fill-white text-white" }) }) }),
          post.duration && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border border-white/10", children: post.duration })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-center justify-between px-5 py-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPickerOpen((v) => !v);
                },
                onMouseEnter: () => setPickerOpen(true),
                disabled: reactionPending,
                className: `flex items-center gap-1.5 transition tilt-press disabled:opacity-70 ${current ? "" : "text-muted-foreground hover:text-foreground"}`,
                style: current ? { color: current.color } : void 0,
                "aria-label": current ? `Reaction selected: ${current.label}` : "Choose a reaction",
                "aria-pressed": Boolean(current),
                title: current ? current.label : "Choose a reaction",
                children: [
                  current ? /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-lg leading-none ${burst ? "animate-react-burst inline-block" : "inline-block"}`, children: current.emoji }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "size-5", "aria-hidden": "true" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: fmt(likeCount) })
                ]
              }
            ),
            pickerOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                onMouseLeave: () => setPickerOpen(false),
                className: "absolute bottom-full left-0 mb-2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-full liquid-glass border border-white/10 reaction-pop shadow-[0_20px_40px_-15px_oklch(0_0_0_/_0.7)]",
                children: REACTIONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void onReactionPick(r.key);
                    },
                    disabled: reactionPending,
                    title: r.label,
                    className: `size-9 grid place-items-center rounded-full text-xl hover:scale-125 transition-transform disabled:opacity-60 ${reaction === r.key ? "bg-white/10" : ""}`,
                    style: { filter: `drop-shadow(0 0 8px ${r.color})` },
                    children: r.emoji
                  },
                  r.key
                ))
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                setCommentsOpen((v) => !v);
              },
              className: `flex items-center gap-1.5 transition tilt-press ${commentsOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`,
              "aria-expanded": commentsOpen,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "size-5" }),
                " ",
                commentCount
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            requireAuth(() => {
              setReshared((v) => !v);
              toast(reshared ? "Unshared" : "Reshared to your channel");
            })();
          }, className: `flex items-center gap-1.5 transition tilt-press ${reshared ? "text-primary" : "text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Repeat2, { className: `size-5 ${reshared ? "animate-burst" : ""}` }),
            " ",
            reshareCount
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            requireAuth(() => toggleSave(post.id, meta))();
          }, className: `flex items-center gap-1.5 transition tilt-press ${saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: `size-5 ${saved ? "fill-current animate-burst" : ""}` }),
            " ",
            fmt(saveCount)
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isGuest) {
                  toast("Sign up to share posts internally");
                  nav({ to: "/signup" });
                  return;
                }
                logShare(post.id, meta);
                setShareDialogOpen(true);
                void loadMutuals();
              },
              className: "text-muted-foreground hover:text-foreground tilt-press",
              "aria-label": "share",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-5" })
            }
          )
        ] }),
        commentsOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-white/10 bg-black/20 px-4 py-4 animate-rise", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-sm font-semibold", children: [
              "Comments · ",
              commentCount
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCommentsOpen(false), className: "text-muted-foreground hover:text-foreground", "aria-label": "Close comments", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "space-y-3 max-h-72 overflow-y-auto pr-1", children: [
            topComments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "text-xs text-muted-foreground py-2", children: "Be the first to comment." }),
            topComments.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "space-y-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CommentRow, { c, mine: isMine(c), onLike: () => onCommentLike(c.id), onReply: () => setReplyTo(c), onEdit: (t) => onCommentEdit(c.id, t), onDelete: () => onCommentDelete(c.id) }),
              repliesOf(c.id).length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "pl-10 space-y-2 border-l border-white/10 ml-4", children: repliesOf(c.id).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentRow, { c: r, mine: isMine(r), onLike: () => onCommentLike(r.id), onReply: () => setReplyTo(c), onEdit: (t) => onCommentEdit(r.id, t), onDelete: () => onCommentDelete(r.id), compact: true }) }, r.id)) })
            ] }, c.id))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 pt-3 border-t border-white/5", children: [
            replyTo && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground mb-1.5 px-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "Replying to ",
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary", children: [
                  "@",
                  replyTo.author.handle
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReplyTo(null), className: "hover:text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "form",
              {
                onSubmit: (e) => {
                  e.preventDefault();
                  if (isGuest) {
                    toast("Sign up to comment");
                    nav({ to: "/signup" });
                    return;
                  }
                  void (async () => {
                    const gifPayload = commentGif ? {
                      gifUrl: commentGif.url,
                      gifPosterUrl: commentGif.preview_url ?? null,
                      gifFwdId: commentGif.gif_id ?? null
                    } : void 0;
                    const ok = await add(post.id, newComment, replyTo?.id, gifPayload);
                    if (!ok) {
                      toast("Comment couldn't post. Try again.");
                      return;
                    }
                    if (commentGif) {
                      markUsed.mutate({ id: commentGif.gif_id, gif_url: commentGif.url });
                    }
                    setNewComment("");
                    setReplyTo(null);
                    setCommentGif(null);
                  })();
                },
                className: "flex flex-col gap-2",
                children: [
                  commentGif && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-20 h-20 rounded-xl overflow-hidden border border-white/10", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: commentGif.preview_url ?? commentGif.url, alt: "GIF", className: "w-full h-full object-cover" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => setCommentGif(null),
                        className: "absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "button",
                        onClick: () => {
                          if (isGuest) {
                            toast("Sign up to add GIFs");
                            nav({ to: "/signup" });
                            return;
                          }
                          setShowGifPicker(true);
                        },
                        className: "grid size-9 shrink-0 place-items-center rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors",
                        "aria-label": "Add GIF",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "input",
                      {
                        value: newComment,
                        onChange: (e) => setNewComment(e.target.value),
                        placeholder: replyTo ? "Write a reply…" : "Add a comment…",
                        className: "flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-primary/60"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        type: "submit",
                        disabled: !newComment.trim() && !commentGif,
                        className: "rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold disabled:opacity-40 hover:opacity-90",
                        children: "Post"
                      }
                    )
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              FwdGifPicker,
              {
                open: showGifPicker,
                context: "comment",
                treyTvUid,
                onClose: () => setShowGifPicker(false),
                onSelect: (gif) => {
                  setCommentGif(gif);
                  setShowGifPicker(false);
                }
              }
            )
          ] })
        ] }),
        postMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
          PostActionSheet,
          {
            isOwner,
            onClose: () => setPostMenuOpen(false),
            onEdit: openEdit,
            onDelete: () => {
              if (!isOwner) {
                toast.error("Only the post owner can do this");
                return;
              }
              setPostMenuOpen(false);
              setDeleteOpen(true);
            },
            onFwd: openFwdComposer
          }
        ),
        editOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalShell, { title: "Edit post", eyebrow: "Owner tools", onClose: () => setEditOpen(false), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: editText,
              onChange: (event) => setEditText(event.currentTarget.value.slice(0, 500)),
              autoFocus: true,
              className: "min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-primary/60"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setEditOpen(false), className: "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void saveEdit(), disabled: busyAction === "edit", className: "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60", children: [
              busyAction === "edit" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
              " Save"
            ] })
          ] })
        ] }),
        deleteOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalShell, { title: "Delete this post?", eyebrow: "Confirm action", onClose: () => setDeleteOpen(false), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-6 text-white/70", children: "This removes the post from Trey TV. Reactions, comments, saves, and repost activity attached to this post will no longer appear with it." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex items-center justify-end gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setDeleteOpen(false), className: "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white", children: "Cancel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void confirmDelete(), disabled: busyAction === "delete", className: "inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60", children: [
              busyAction === "delete" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
              " Delete"
            ] })
          ] })
        ] }),
        fwdOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(ModalShell, { title: "Post with FWD", eyebrow: "GIF composer", onClose: () => setFwdOpen(false), children: [
          selectedFwdGif ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative overflow-hidden rounded-2xl border border-white/10 bg-black/50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: selectedFwdGif.preview_url ?? selectedFwdGif.url, alt: selectedFwdGif.title ?? "Selected GIF", className: "max-h-72 w-full object-cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setSelectedFwdGif(null), className: "absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/70 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              onClick: () => setFwdPickerOpen(true),
              className: "flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-8" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold", children: "Choose from saved GIFs or search FWD" })
              ]
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: fwdCaption,
              onChange: (event) => setFwdCaption(event.currentTarget.value.slice(0, 500)),
              placeholder: "Add a caption...",
              className: "mt-3 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-primary/60"
            }
          ),
          fwdStatus.data && !fwdStatus.data.connected && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: configureFwd, className: "mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline", children: [
            "Configure FWD ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "size-3.5" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setFwdPickerOpen(true), className: "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:text-white", children: selectedFwdGif ? "Change GIF" : "Browse GIFs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => void postFwdGif(), disabled: !selectedFwdGif || busyAction === "fwd", className: "inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60", children: [
              busyAction === "fwd" && /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "size-4 animate-spin" }),
              " Post FWD"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            FwdGifPicker,
            {
              open: fwdPickerOpen,
              context: "profile",
              treyTvUid,
              draft: fwdCaption,
              onClose: () => setFwdPickerOpen(false),
              onSelect: (gif) => {
                setSelectedFwdGif(gif);
                setFwdPickerOpen(false);
              }
            }
          )
        ] })
      ]
    }
  );
}
function PostActionSheet({
  isOwner,
  onClose,
  onEdit,
  onDelete,
  onFwd
}) {
  const [touchStartY, setTouchStartY] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[90] flex items-end justify-center bg-black/45 px-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] backdrop-blur-sm sm:items-center sm:pb-0",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": "Post actions",
      onClick: (event) => {
        if (event.target === event.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] ring-1 ring-primary/15 backdrop-blur-xl",
          onTouchStart: (event) => setTouchStartY(event.touches[0]?.clientY ?? null),
          onTouchEnd: (event) => {
            if (touchStartY == null) return;
            const endY = event.changedTouches[0]?.clientY ?? touchStartY;
            if (endY - touchStartY > 70) onClose();
            setTouchStartY(null);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-white/10 px-4 py-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-[0.28em] text-primary", children: "Post actions" }),
              !isOwner && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-white/50", children: "Only the post owner can edit or delete." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionRow, { icon: Pencil, label: "Edit", disabled: !isOwner, onClick: onEdit }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionRow, { icon: Trash2, label: "Delete", danger: true, disabled: !isOwner, onClick: onDelete }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(ActionRow, { icon: Forward, label: "FWD", onClick: onFwd })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "w-full border-t border-white/10 px-4 py-3 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white", children: "Cancel" })
          ]
        }
      )
    }
  );
}
function ActionRow({
  icon: Icon,
  label,
  disabled,
  danger,
  onClick
}) {
  const [touchStartY, setTouchStartY] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      type: "button",
      onClick,
      disabled,
      title: disabled ? "Only the post owner can do this" : label,
      className: `flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${danger ? "text-red-300 hover:bg-red-500/10" : "text-white/85 hover:bg-white/[0.07] hover:text-white"} disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: label })
      ]
    }
  );
}
function ModalShell({
  title,
  eyebrow,
  onClose,
  children
}) {
  const [touchStartY, setTouchStartY] = reactExports.useState(null);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: "fixed inset-0 z-[95] flex items-end justify-center bg-black/70 px-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] backdrop-blur-md sm:items-center sm:pb-0",
      role: "dialog",
      "aria-modal": "true",
      "aria-label": title,
      onClick: (event) => {
        if (event.target === event.currentTarget) onClose();
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950/95 p-4 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] ring-1 ring-primary/15 backdrop-blur-xl",
          onTouchStart: (event) => setTouchStartY(event.touches[0]?.clientY ?? null),
          onTouchEnd: (event) => {
            if (touchStartY == null) return;
            const endY = event.changedTouches[0]?.clientY ?? touchStartY;
            if (endY - touchStartY > 70) onClose();
            setTouchStartY(null);
          },
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-start justify-between gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-[0.28em] text-primary", children: eyebrow }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 font-display text-xl font-black text-white", children: title })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: onClose, className: "grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white", "aria-label": "Close", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
            ] }),
            children
          ]
        }
      )
    }
  );
}
function timeAgo(ts) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1e3));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}
function CommentRow({ c, mine, onLike, onReply, onEdit, onDelete, compact }) {
  const [editing, setEditing] = reactExports.useState(false);
  const [draft, setDraft] = reactExports.useState(c.text);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePictureLink, { publicProfileUid: c.author.publicProfileUid, label: `Open @${c.author.handle}'s public profile`, className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.author.avatar, alt: "", className: `${compact ? "size-7" : "size-8"} rounded-full object-cover ring-1 ring-white/10` }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/[0.04] border border-white/5 px-3 py-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs", children: [
          c.author.publicProfileUid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$uid", params: { uid: c.author.publicProfileUid }, className: "font-semibold hover:underline", children: c.author.name }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/channel/$handle", params: { handle: c.author.handle }, className: "font-semibold hover:underline", children: c.author.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
            "· ",
            timeAgo(c.createdAt),
            c.editedAt ? " · edited" : ""
          ] })
        ] }),
        editing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              value: draft,
              onChange: (e) => setDraft(e.target.value),
              autoFocus: true,
              className: "flex-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-sm focus:outline-none focus:border-primary/60"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                if (!draft.trim()) return;
                void Promise.resolve(onEdit(draft)).then(() => setEditing(false));
              },
              className: "text-primary",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setDraft(c.text);
            setEditing(false);
          }, className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5", children: [
          c.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm break-words whitespace-pre-wrap", children: c.text }),
          c.gifUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: buildFwdGifDetailUrl(c.gifFwdId), target: "_blank", rel: "noreferrer", className: "relative mt-1 block max-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition hover:border-primary/40", "aria-label": "Open FWD GIF", children: [
            c.gifPosterUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.gifPosterUrl, alt: "", "aria-hidden": true, className: "absolute inset-0 h-full w-full object-cover opacity-30 blur-sm" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: c.gifUrl,
                alt: "FWD GIF",
                className: "relative max-h-[200px] w-full object-cover",
                loading: "lazy",
                onError: (e) => {
                  e.currentTarget.style.display = "none";
                }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-1 left-1 rounded-full border border-white/20 bg-black/55 px-1.5 py-0.5 text-[9px] font-black tracking-[0.18em] text-primary", children: "FWD" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 px-1 text-[11px] text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onLike, className: `flex items-center gap-1 hover:text-foreground transition ${c.likedByMe ? "text-[oklch(0.7_0.25_15)]" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: `size-3.5 ${c.likedByMe ? "fill-current" : ""}` }),
          " ",
          c.likes
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onReply, className: "flex items-center gap-1 hover:text-foreground transition", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Reply, { className: "size-3.5" }),
          " Reply"
        ] }),
        mine && !editing && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setEditing(true), className: "flex items-center gap-1 hover:text-foreground transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-3.5" }),
            " Edit"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onDelete, className: "flex items-center gap-1 hover:text-[oklch(0.7_0.25_15)] transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }),
            " Delete"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Home() {
  const [tab, setTab] = reactExports.useState("for-you");
  const {
    posts: userPosts
  } = useFeed();
  const {
    isFollowing
  } = useFollow();
  const merged = [...userPosts, ...posts];
  const filtered = tab === "following" ? merged.filter((p) => {
    const isOwnPost = !p.creator || p.creator.handle === "trey";
    const isDbFollow = p.creator && isFollowing(p.creator.handle);
    const isDemoMode = typeof window !== "undefined" && (window.location.search.includes("demo=1") || localStorage.getItem("treytv_demo") === "true" || false);
    const isMockFollow = isDemoMode && p.creator && (p.creator.handle === "chrishorizon" || p.creator.handle === "treyipicks");
    return isOwnPost || isDbFollow || isMockFollow;
  }) : tab === "latest" ? [...userPosts, ...[...posts].reverse()] : merged;
  const heading = tab === "following" ? "From creators you follow" : tab === "latest" ? "Latest drops" : "Recommended for you";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AppShell, { activeTab: tab, onTabChange: setTab, wide: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex items-center gap-2 mb-6", children: [
      [{
        id: "for-you",
        label: "For You"
      }, {
        id: "following",
        label: "Following"
      }, {
        id: "latest",
        label: "Latest"
      }].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t.id), className: `px-4 py-2 rounded-full text-sm font-semibold transition ${tab === t.id ? "bg-primary text-primary-foreground glow-gold" : "glass border border-white/10 text-muted-foreground hover:text-foreground"}`, children: t.label }, t.id)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "ml-auto text-xs text-muted-foreground", children: [
        "Live network · ",
        posts.length * 412,
        " active viewers"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_minmax(0,640px)_320px] xl:grid-cols-[1fr_minmax(0,720px)_360px] lg:gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex flex-col gap-4 sticky top-6 h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Radio, { className: "size-4 text-[oklch(0.65_0.24_15)]" }),
              " Live now"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/explore", className: "text-[11px] text-primary hover:underline", children: "All" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5", children: creators.filter((c) => c.live).concat(creators.slice(0, 3)).slice(0, 4).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-10 rounded-full conic-ring shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, alt: "", className: "size-10 rounded-full object-cover" }),
              c.live && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[oklch(0.65_0.24_15)] ring-2 ring-background animate-glow-pulse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
                "@",
                c.handle
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast(`Followed ${c.name}`), className: "text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10", children: "Follow" })
          ] }, c.id + Math.random())) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4 text-primary" }),
            " Quick picks"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/prescribe-me", className: "rounded-2xl glass border border-white/10 p-3 hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-primary", children: "PRESCRIBE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mt-1", children: "Mood mix" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/go-live", className: "rounded-2xl glass border border-white/10 p-3 hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-[oklch(0.65_0.24_15)]", children: "GO LIVE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mt-1", children: "Stream now" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/create", className: "rounded-2xl glass border border-white/10 p-3 hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-[oklch(0.7_0.25_340)]", children: "CREATE" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mt-1", children: "New post" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/rewards", className: "rounded-2xl glass border border-white/10 p-3 hover:bg-white/5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-[oklch(0.82_0.15_215)]", children: "REWARDS" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mt-1", children: "12,480 pts" })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Composer, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CreatorRail, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "text-base lg:text-lg font-semibold flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-4 text-primary" }),
            " ",
            heading
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast("Loading more…"), className: "text-sm text-primary hover:underline", children: "See all" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-5", children: filtered.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(PostCard, { post: p, index: i }, p.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden lg:flex flex-col gap-4 sticky top-6 h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold flex items-center gap-2 mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Flame, { className: "size-4 text-[oklch(0.7_0.25_340)]" }),
            " Trending tonight"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: [{
            tag: "#StudioSessions",
            up: "+184%"
          }, {
            tag: "#LateNightDrops",
            up: "+92%"
          }, {
            tag: "#AuroraFilter",
            up: "+71%"
          }, {
            tag: "#NeonTalk",
            up: "+44%"
          }, {
            tag: "#CityAfterDark",
            up: "+33%"
          }].map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono text-muted-foreground w-5", children: i + 1 }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: t.tag }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-[oklch(0.78_0.18_150)] flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "size-3" }),
                " ",
                t.up
              ] })
            ] })
          ] }, t.tag)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-sm font-bold flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(UserPlus, { className: "size-4 text-primary" }),
              " Suggested creators"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/explore", className: "text-[11px] text-primary hover:underline", children: "More" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: creators.slice(1, 5).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: c.avatar, alt: "", className: "size-9 rounded-full object-cover ring-1 ring-white/15" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
                "@",
                c.handle
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast(`Followed ${c.name}`), className: "text-[11px] px-2.5 py-1 rounded-full bg-primary/10 border border-primary/40 text-primary hover:bg-primary/20", children: "+ Follow" })
          ] }, c.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold mb-3", children: "Tonight's prescriptions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: prescribed.slice(0, 3).map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/prescribe-me", className: "flex items-center gap-3 p-2 rounded-xl hover:bg-white/5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-lg overflow-hidden shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, alt: "", className: "size-full object-cover" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-widest text-primary", children: p.kind }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold truncate", children: p.title })
            ] })
          ] }, p.id)) })
        ] })
      ] })
    ] })
  ] });
}
export {
  Home as component
};
