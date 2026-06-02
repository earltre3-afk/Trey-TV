import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { fetchSignalRecord } from "@/lib/tests/naturalAbilityStorage";
import { MessageCircle, Repeat2, Bookmark, Send, MoreHorizontal, Play, Pause, Heart, Reply, X, Pencil, Trash2, Check, Image as ImageIcon, Loader2, ExternalLink, Forward } from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/brand/Badge";
import type { posts as Posts } from "@/lib/mock-data";
import { useActivity, REACTIONS, type ReactionKey } from "@/lib/activity-store";
import { useFeed, type UserPost } from "@/lib/feed-store";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useSupabaseReactions } from "@/hooks/use-supabase-reactions";
import { useNavigate, Link } from "@tanstack/react-router";
import { useComments, type Comment } from "@/lib/comments-store";
import { ProfilePictureLink } from "@/components/profile/ProfileAvatarLink";
import { isPublicProfileUid } from "@/lib/profile-links";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import { buildFwdGifDetailUrl, type FwdGifPayload } from "@/lib/fwd/picker";
import { useFwdConnectionStatus, useMarkFwdGifUsed } from "@/lib/fwd-gif-api";
import { getMutualFollows } from "@/lib/social-relationships";
import { useMessages } from "@/lib/messages-store";
import { creators } from "@/lib/mock-data";

type Post = (typeof Posts)[number] & Partial<UserPost>;

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export function PostCard({ post, index = 0 }: { post: any; index?: number }) {
  const { saves, toggleSave, logShare } = useActivity();

  const [authorSignal, setAuthorSignal] = useState<{ symbol: string; ability: string } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  useEffect(() => {
    if (!post.ownerId) return;
    fetchSignalRecord(post.ownerId).then((row) => {
      if (row && row.show_in_feed) {
        setAuthorSignal({
          symbol: row.badge_symbol || "✦",
          ability: row.primary_ability,
        });
      }
    });
  }, [post.ownerId]);
  const { addPost, updatePost, removePost } = useFeed();
  const { isGuest, user } = useAuth();
  const currentProfile = useCurrentUser();
  const fwdStatus = useFwdConnectionStatus();
  const markUsed = useMarkFwdGifUsed();
  const isSignedIn = !isGuest;
  const nav = useNavigate();

  const { reaction, toggleReaction, likeCount, pending: reactionPending } = useSupabaseReactions(post.id, post.likes);
  const saved = !!saves[post.id];
  const [reshared, setReshared] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [burst, setBurst] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [commentGif, setCommentGif] = useState<FwdGifPayload | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [fwdOpen, setFwdOpen] = useState(false);
  const [fwdPickerOpen, setFwdPickerOpen] = useState(false);
  const [fwdCaption, setFwdCaption] = useState("");
  const [selectedFwdGif, setSelectedFwdGif] = useState<FwdGifPayload | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [mutuals, setMutuals] = useState<any[]>([]);
  const [loadingMutuals, setLoadingMutuals] = useState(false);
  const { byPost, loaded: commentsLoaded, add, toggleLike, edit, remove, isMine } = useComments();
  const { openThread, send: sendMessage } = useMessages();
  const treyTvUid = currentProfile.uid || (user as any)?.id || null;
  const allComments = byPost(post.id);
  const commentCount = commentsLoaded(post.id) ? allComments.length : Math.max(post.comments, allComments.length);
  const topComments = allComments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => allComments.filter((c) => c.parentId === id);

  const saveCount = post.saves + (saved ? 1 : 0);
  const reshareCount = post.reshares + (reshared ? 1 : 0);

  const meta = { title: post.text.split("\n")[0].slice(0, 60), creator: post.creator.handle, thumb: post.media };
  const creatorPublicProfileUid =
    (post.creator as any).publicProfileUid ||
    (isPublicProfileUid((post.creator as any).id) ? (post.creator as any).id : null);
  const isOwner = Boolean(user?.id && post.ownerId && post.ownerId === user.id);
  const isFwdPost = post.sourceType === "fwd";

  useEffect(() => {
    if (!postMenuOpen && !editOpen && !deleteOpen && !fwdOpen && !fwdPickerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
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

  const requireAuth = (fn: () => void) => () => {
    if (isGuest) { toast("Sign up to interact"); nav({ to: "/signup" }); return; }
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
      tags: ["FWD"],
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

  const onCommentLike = async (id: string) => {
    if (isGuest) {
      toast("Sign up to like comments");
      nav({ to: "/signup" });
      return;
    }
    const ok = await toggleLike(id);
    if (!ok) toast("Couldn't update comment like. Try again.");
  };

  const onCommentEdit = async (id: string, text: string) => {
    const ok = await edit(id, text);
    if (!ok) toast("Couldn't edit comment. Try again.");
  };

  const onCommentDelete = async (id: string) => {
    const ok = await remove(id);
    if (!ok) toast("Couldn't delete comment. Try again.");
  };

  const onReactionPick = async (k: ReactionKey) => {
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
        verification_type: c.verified,
      }));
      
      const combined = [...dbMutuals];
      mockMutuals.forEach(m => {
        if (!combined.some(c => c.username === m.username)) combined.push(m);
      });
      
      setMutuals(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMutuals(false);
    }
  };

  const handleShareInternally = (peer: any) => {
    if (!mutuals.some(m => m.id === peer.id)) {
      toast.error("You can only share with mutual friends!");
      return;
    }
    const threadId = openThread({
      id: peer.id,
      publicProfileUid: peer.public_profile_uid,
      name: peer.display_name,
      handle: peer.username,
      avatar: peer.avatar_url,
      verified: peer.verification_type,
    });

    const shareText = `[TTV_SHARE:post:${encodeURIComponent(post.id)}:${encodeURIComponent(post.text)}:${encodeURIComponent(post.media || "")}]`;
    sendMessage(threadId, shareText);
    toast.success(`Shared post with @${peer.username}!`);
    setShareDialogOpen(false);
  };

  return (
    <article
      className="mobile-edge-card group relative rounded-none sm:rounded-3xl liquid-glass neon-border shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] liquid-hover"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Share Dialog */}
      {shareDialogOpen && (
        <ModalShell title="Share Internally" eyebrow="Send to Friends" onClose={() => setShareDialogOpen(false)}>
          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground">
              You can only share posts with mutual follows (friends). If you don't see someone, add/follow them first!
            </p>
            {loadingMutuals ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
              </div>
            ) : mutuals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center text-sm text-muted-foreground space-y-2">
                <p>No mutual friends found.</p>
                <button
                  type="button"
                  onClick={() => { setShareDialogOpen(false); nav({ to: "/explore" }); }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Explore and follow creators to build connections!
                </button>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {mutuals.map((peer) => (
                  <button
                    key={peer.id}
                    type="button"
                    onClick={() => handleShareInternally(peer)}
                    className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left hover:bg-white/[0.08] transition"
                  >
                    <img src={peer.avatar_url} alt="" className="size-9 rounded-full object-cover ring-1 ring-white/10" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{peer.display_name}</div>
                      <div className="text-xs text-muted-foreground truncate">@{peer.username}</div>
                    </div>
                    <span className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/15 border border-primary/20">
                      Send
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </ModalShell>
      )}
      <div className="flex items-center gap-3 p-4">
        <ProfilePictureLink
          publicProfileUid={creatorPublicProfileUid}
          label={`Open @${post.creator.handle}'s public profile`}
          className="relative size-10 rounded-full conic-ring shrink-0 hover:scale-105 transition-transform"
        >
          <img src={post.creator.avatar} alt="" className="size-10 rounded-full object-cover" />
        </ProfilePictureLink>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {creatorPublicProfileUid ? (
              <Link to="/u/$uid" params={{ uid: creatorPublicProfileUid }} className="font-semibold hover:underline flex items-center gap-1.5 flex-wrap">
                <span>{post.creator.name}</span>
                {authorSignal && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-amber-300 font-normal opacity-90">
                    <span>{authorSignal.symbol}</span>
                    <span className="tracking-wide text-[10px] uppercase font-bold">{authorSignal.ability}</span>
                  </span>
                )}
              </Link>
            ) : (
              <Link to="/channel/$handle" params={{ handle: post.creator.handle }} className="font-semibold hover:underline flex items-center gap-1.5 flex-wrap">
                <span>{post.creator.name}</span>
                {authorSignal && (
                  <span className="inline-flex items-center gap-0.5 text-xs text-amber-300 font-normal opacity-90">
                    <span>{authorSignal.symbol}</span>
                    <span className="tracking-wide text-[10px] uppercase font-bold">{authorSignal.ability}</span>
                  </span>
                )}
              </Link>
            )}
            <VerifiedBadge kind={post.creator.verified} />
            <Link to="/channel/$handle" params={{ handle: post.creator.handle }} className="text-xs text-muted-foreground hover:text-foreground">
              @{post.creator.handle} · {post.timeAgo}
            </Link>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md border border-primary/50 text-primary">Creator</span>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPostMenuOpen(true);
          }}
          className="size-8 grid place-items-center text-muted-foreground hover:text-foreground tilt-press"
          aria-label="Open post actions"
          aria-haspopup="dialog"
          aria-expanded={postMenuOpen}
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <p className="px-4 pb-3 text-sm whitespace-pre-line">{post.text}</p>

      {post.media && (
        <div className="px-0 sm:px-3">
          <div className="relative rounded-none sm:rounded-2xl overflow-hidden border-y border-x-0 sm:border-x border-white/10 shadow-[0_0_28px_-12px_oklch(0.65_0.22_300_/_0.6)] shimmer-sweep">
            <img src={isFwdPost ? (post.gifPosterUrl || post.media) : post.media} alt="" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
            {isFwdPost && (
              <span className="absolute left-3 top-3 rounded-full border border-primary/40 bg-black/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur">
                FWD GIF
              </span>
            )}
            {!isFwdPost && (
              <button onClick={() => setPlaying((p) => !p)} className="absolute inset-0 grid place-items-center bg-black/10 hover:bg-black/30 transition" aria-label="Play">
                <span className={`size-14 rounded-full grid place-items-center bg-black/50 backdrop-blur-md border border-white/20 transition-transform ${playing ? "scale-90" : "scale-100 group-hover:scale-110"} animate-glow-pulse`}>
                  {playing ? <Pause className="size-6 fill-white text-white" /> : <Play className="size-6 fill-white text-white" />}
                </span>
              </button>
            )}
            {post.duration && (
              <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border border-white/10">
                {post.duration}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative flex items-center justify-between px-5 py-3 text-sm">
        {/* Reaction button + picker */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPickerOpen((v) => !v); }}
            onMouseEnter={() => setPickerOpen(true)}
            disabled={reactionPending}
            className={`flex items-center gap-1.5 transition tilt-press disabled:opacity-70 ${current ? "" : "text-muted-foreground hover:text-foreground"}`}
            style={current ? { color: current.color } : undefined}
            aria-label={current ? `Reaction selected: ${current.label}` : "Choose a reaction"}
            aria-pressed={Boolean(current)}
            title={current ? current.label : "Choose a reaction"}
          >
            {current ? (
              <span className={`text-lg leading-none ${burst ? "animate-react-burst inline-block" : "inline-block"}`}>
                {current.emoji}
              </span>
            ) : (
              <Heart className="size-5" aria-hidden="true" />
            )}
            <span className="text-xs font-semibold">{fmt(likeCount)}</span>
          </button>

          {pickerOpen && (
            <div
              onMouseLeave={() => setPickerOpen(false)}
              className="absolute bottom-full left-0 mb-2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-full liquid-glass border border-white/10 reaction-pop shadow-[0_20px_40px_-15px_oklch(0_0_0_/_0.7)]"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); void onReactionPick(r.key); }}
                  disabled={reactionPending}
                  title={r.label}
                  className={`size-9 grid place-items-center rounded-full text-xl hover:scale-125 transition-transform disabled:opacity-60 ${reaction === r.key ? "bg-white/10" : ""}`}
                  style={{ filter: `drop-shadow(0 0 8px ${r.color})` }}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCommentsOpen((v) => !v); }}
          className={`flex items-center gap-1.5 transition tilt-press ${commentsOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          aria-expanded={commentsOpen}
        >
          <MessageCircle className="size-5" /> {commentCount}
        </button>
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); requireAuth(() => { setReshared((v) => !v); toast(reshared ? "Unshared" : "Reshared to your channel"); })(); }} className={`flex items-center gap-1.5 transition tilt-press ${reshared ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Repeat2 className={`size-5 ${reshared ? "animate-burst" : ""}`} /> {reshareCount}
        </button>
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); requireAuth(() => toggleSave(post.id, meta))(); }} className={`flex items-center gap-1.5 transition tilt-press ${saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Bookmark className={`size-5 ${saved ? "fill-current animate-burst" : ""}`} /> {fmt(saveCount)}
        </button>
        <button
          type="button"
          onClick={(e) => {
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
          }}
          className="text-muted-foreground hover:text-foreground tilt-press"
          aria-label="share"
        >
          <Send className="size-5" />
        </button>
      </div>

      {commentsOpen && (
        <div className="border-t border-white/10 bg-black/20 px-4 py-4 animate-rise">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Comments · {commentCount}</h4>
            <button onClick={() => setCommentsOpen(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close comments">
              <X className="size-4" />
            </button>
          </div>

          <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {topComments.length === 0 && (
              <li className="text-xs text-muted-foreground py-2">Be the first to comment.</li>
            )}
            {topComments.map((c) => (
              <li key={c.id} className="space-y-2">
                <CommentRow c={c} mine={isMine(c)} onLike={() => onCommentLike(c.id)} onReply={() => setReplyTo(c)} onEdit={(t) => onCommentEdit(c.id, t)} onDelete={() => onCommentDelete(c.id)} />
                {repliesOf(c.id).length > 0 && (
                  <ul className="pl-10 space-y-2 border-l border-white/10 ml-4">
                    {repliesOf(c.id).map((r) => (
                      <li key={r.id}><CommentRow c={r} mine={isMine(r)} onLike={() => onCommentLike(r.id)} onReply={() => setReplyTo(c)} onEdit={(t) => onCommentEdit(r.id, t)} onDelete={() => onCommentDelete(r.id)} compact /></li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3 pt-3 border-t border-white/5">
            {replyTo && (
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5 px-1">
                <span>Replying to <span className="text-primary">@{replyTo.author.handle}</span></span>
                <button onClick={() => setReplyTo(null)} className="hover:text-foreground"><X className="size-3" /></button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isGuest) { toast("Sign up to comment"); nav({ to: "/signup" }); return; }
                void (async () => {
                  const gifPayload = commentGif ? {
                    gifUrl: commentGif.url,
                    gifPosterUrl: commentGif.preview_url ?? null,
                    gifFwdId: commentGif.gif_id ?? null,
                  } : undefined;
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
              }}
              className="flex flex-col gap-2"
            >
              {commentGif && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10">
                  <img src={commentGif.preview_url ?? commentGif.url} alt="GIF" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setCommentGif(null)}
                    className="absolute top-1 right-1 size-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isGuest) { toast("Sign up to add GIFs"); nav({ to: "/signup" }); return; }
                    setShowGifPicker(true);
                  }}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-white/5 border border-white/10 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
                  aria-label="Add GIF"
                >
                  <ImageIcon className="size-4" />
                </button>
                <input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
                  className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-primary/60"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() && !commentGif}
                  className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold disabled:opacity-40 hover:opacity-90"
                >
                  Post
                </button>
              </div>
            </form>
            <FwdGifPicker
              open={showGifPicker}
              context="comment"
              treyTvUid={treyTvUid}
              onClose={() => setShowGifPicker(false)}
              onSelect={(gif) => { setCommentGif(gif); setShowGifPicker(false); }}
            />
          </div>
        </div>
      )}

      {postMenuOpen && (
        <PostActionSheet
          isOwner={isOwner}
          onClose={() => setPostMenuOpen(false)}
          onEdit={openEdit}
          onDelete={() => {
            if (!isOwner) {
              toast.error("Only the post owner can do this");
              return;
            }
            setPostMenuOpen(false);
            setDeleteOpen(true);
          }}
          onFwd={openFwdComposer}
        />
      )}

      {editOpen && (
        <ModalShell title="Edit post" eyebrow="Owner tools" onClose={() => setEditOpen(false)}>
          <textarea
            value={editText}
            onChange={(event) => setEditText(event.currentTarget.value.slice(0, 500))}
            autoFocus
            className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none focus:border-primary/60"
          />
          <div className="mt-4 flex items-center justify-end gap-2">
            <button type="button" onClick={() => setEditOpen(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white">
              Cancel
            </button>
            <button type="button" onClick={() => void saveEdit()} disabled={busyAction === "edit"} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busyAction === "edit" && <Loader2 className="size-4 animate-spin" />} Save
            </button>
          </div>
        </ModalShell>
      )}

      {deleteOpen && (
        <ModalShell title="Delete this post?" eyebrow="Confirm action" onClose={() => setDeleteOpen(false)}>
          <p className="text-sm leading-6 text-white/70">
            This removes the post from Trey TV. Reactions, comments, saves, and repost activity attached to this post will no longer appear with it.
          </p>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button type="button" onClick={() => setDeleteOpen(false)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:text-white">
              Cancel
            </button>
            <button type="button" onClick={() => void confirmDelete()} disabled={busyAction === "delete"} className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              {busyAction === "delete" && <Loader2 className="size-4 animate-spin" />} Delete
            </button>
          </div>
        </ModalShell>
      )}

      {fwdOpen && (
        <ModalShell title="Post with FWD" eyebrow="GIF composer" onClose={() => setFwdOpen(false)}>
          {selectedFwdGif ? (
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50">
              <img src={selectedFwdGif.preview_url ?? selectedFwdGif.url} alt={selectedFwdGif.title ?? "Selected GIF"} className="max-h-72 w-full object-cover" />
              <button type="button" onClick={() => setSelectedFwdGif(null)} className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/70 text-white">
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setFwdPickerOpen(true)}
              className="flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"
            >
              <ImageIcon className="size-8" />
              <span className="text-sm font-bold">Choose from saved GIFs or search FWD</span>
            </button>
          )}

          <textarea
            value={fwdCaption}
            onChange={(event) => setFwdCaption(event.currentTarget.value.slice(0, 500))}
            placeholder="Add a caption..."
            className="mt-3 min-h-24 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-primary/60"
          />

          {fwdStatus.data && !fwdStatus.data.connected && (
            <button type="button" onClick={configureFwd} className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline">
              Configure FWD <ExternalLink className="size-3.5" />
            </button>
          )}

          <div className="mt-4 flex items-center justify-between gap-2">
            <button type="button" onClick={() => setFwdPickerOpen(true)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:text-white">
              {selectedFwdGif ? "Change GIF" : "Browse GIFs"}
            </button>
            <button type="button" onClick={() => void postFwdGif()} disabled={!selectedFwdGif || busyAction === "fwd"} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">
              {busyAction === "fwd" && <Loader2 className="size-4 animate-spin" />} Post FWD
            </button>
          </div>

          <FwdGifPicker
            open={fwdPickerOpen}
            context="profile"
            treyTvUid={treyTvUid}
            draft={fwdCaption}
            onClose={() => setFwdPickerOpen(false)}
            onSelect={(gif) => {
              setSelectedFwdGif(gif);
              setFwdPickerOpen(false);
            }}
          />
        </ModalShell>
      )}
    </article>
  );
}

function PostActionSheet({
  isOwner,
  onClose,
  onEdit,
  onDelete,
  onFwd,
}: {
  isOwner: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onFwd: () => void;
}) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 px-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] backdrop-blur-sm sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label="Post actions"
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/95 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] ring-1 ring-primary/15 backdrop-blur-xl"
        onTouchStart={(event) => setTouchStartY(event.touches[0]?.clientY ?? null)}
        onTouchEnd={(event) => {
          if (touchStartY == null) return;
          const endY = event.changedTouches[0]?.clientY ?? touchStartY;
          if (endY - touchStartY > 70) onClose();
          setTouchStartY(null);
        }}
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Post actions</div>
          {!isOwner && <div className="mt-1 text-xs text-white/50">Only the post owner can edit or delete.</div>}
        </div>
        <div className="p-2">
          <ActionRow icon={Pencil} label="Edit" disabled={!isOwner} onClick={onEdit} />
          <ActionRow icon={Trash2} label="Delete" danger disabled={!isOwner} onClick={onDelete} />
          <ActionRow icon={Forward} label="FWD" onClick={onFwd} />
        </div>
        <button type="button" onClick={onClose} className="w-full border-t border-white/10 px-4 py-3 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white">
          Cancel
        </button>
      </div>
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  disabled,
  danger,
  onClick,
}: {
  icon: typeof Pencil;
  label: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Only the post owner can do this" : label}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${
        danger ? "text-red-300 hover:bg-red-500/10" : "text-white/85 hover:bg-white/[0.07] hover:text-white"
      } disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-transparent`}
    >
      <Icon className="size-4" />
      <span>{label}</span>
    </button>
  );
}

function ModalShell({
  title,
  eyebrow,
  onClose,
  children,
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 px-3 pb-[calc(env(safe-area-inset-bottom)+5rem)] backdrop-blur-md sm:items-center sm:pb-0"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950/95 p-4 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.9)] ring-1 ring-primary/15 backdrop-blur-xl"
        onTouchStart={(event) => setTouchStartY(event.touches[0]?.clientY ?? null)}
        onTouchEnd={(event) => {
          if (touchStartY == null) return;
          const endY = event.changedTouches[0]?.clientY ?? touchStartY;
          if (endY - touchStartY > 70) onClose();
          setTouchStartY(null);
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">{eyebrow}</div>
            <h3 className="mt-1 font-display text-xl font-black text-white">{title}</h3>
          </div>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 hover:text-white" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function CommentRow({ c, mine, onLike, onReply, onEdit, onDelete, compact }: { c: Comment; mine?: boolean; onLike: () => void | Promise<void>; onReply: () => void; onEdit: (text: string) => void | Promise<void>; onDelete: () => void | Promise<void>; compact?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(c.text);
  return (
    <div className="flex gap-2.5">
      <ProfilePictureLink publicProfileUid={c.author.publicProfileUid} label={`Open @${c.author.handle}'s public profile`} className="shrink-0">
        <img src={c.author.avatar} alt="" className={`${compact ? "size-7" : "size-8"} rounded-full object-cover ring-1 ring-white/10`} />
      </ProfilePictureLink>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-white/[0.04] border border-white/5 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs">
            {c.author.publicProfileUid ? (
              <Link to="/u/$uid" params={{ uid: c.author.publicProfileUid }} className="font-semibold hover:underline">
                {c.author.name}
              </Link>
            ) : (
              <Link to="/channel/$handle" params={{ handle: c.author.handle }} className="font-semibold hover:underline">
                {c.author.name}
              </Link>
            )}
            <span className="text-muted-foreground">· {timeAgo(c.createdAt)}{c.editedAt ? " · edited" : ""}</span>
          </div>
          {editing ? (
            <div className="mt-1 flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoFocus
                className="flex-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1 text-sm focus:outline-none focus:border-primary/60"
              />
              <button
                onClick={() => {
                  if (!draft.trim()) return;
                  void Promise.resolve(onEdit(draft)).then(() => setEditing(false));
                }}
                className="text-primary"
              >
                <Check className="size-4" />
              </button>
              <button onClick={() => { setDraft(c.text); setEditing(false); }} className="text-muted-foreground"><X className="size-4" /></button>
            </div>
          ) : (
            <div className="mt-0.5">
              {c.text && <p className="text-sm break-words whitespace-pre-wrap">{c.text}</p>}
              {c.gifUrl && (
                <a href={buildFwdGifDetailUrl(c.gifFwdId)} target="_blank" rel="noreferrer" className="relative mt-1 block max-w-[200px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition hover:border-primary/40" aria-label="Open FWD GIF">
                  {c.gifPosterUrl && <img src={c.gifPosterUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-30 blur-sm" />}
                  <img
                    src={c.gifUrl}
                    alt="FWD GIF"
                    className="relative max-h-[200px] w-full object-cover"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  <span className="absolute bottom-1 left-1 rounded-full border border-white/20 bg-black/55 px-1.5 py-0.5 text-[9px] font-black tracking-[0.18em] text-primary">FWD</span>
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 px-1 text-[11px] text-muted-foreground">
          <button onClick={onLike} className={`flex items-center gap-1 hover:text-foreground transition ${c.likedByMe ? "text-[oklch(0.7_0.25_15)]" : ""}`}>
            <Heart className={`size-3.5 ${c.likedByMe ? "fill-current" : ""}`} /> {c.likes}
          </button>
          <button onClick={onReply} className="flex items-center gap-1 hover:text-foreground transition">
            <Reply className="size-3.5" /> Reply
          </button>
          {mine && !editing && (
            <>
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 hover:text-foreground transition">
                <Pencil className="size-3.5" /> Edit
              </button>
              <button onClick={onDelete} className="flex items-center gap-1 hover:text-[oklch(0.7_0.25_15)] transition">
                <Trash2 className="size-3.5" /> Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
