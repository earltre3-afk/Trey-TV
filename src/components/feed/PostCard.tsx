import { useState } from "react";
import { MessageCircle, Repeat2, Bookmark, Send, MoreHorizontal, Play, Pause, Heart, Reply, X } from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/brand/Badge";
import type { posts as Posts } from "@/lib/mock-data";
import { useActivity, REACTIONS, type ReactionKey } from "@/lib/activity-store";
import { useAuth } from "@/lib/auth";
import { useNavigate, Link } from "@tanstack/react-router";
import { useComments, type Comment } from "@/lib/comments-store";

type Post = (typeof Posts)[number];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const { reactions, saves, setReaction, toggleSave, logShare } = useActivity();
  const { isGuest } = useAuth();
  const nav = useNavigate();

  const reaction = reactions[post.id] ?? null;
  const saved = !!saves[post.id];
  const [reshared, setReshared] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [burst, setBurst] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const { byPost, add, toggleLike } = useComments();
  const allComments = byPost(post.id);
  const topComments = allComments.filter((c) => !c.parentId);
  const repliesOf = (id: string) => allComments.filter((c) => c.parentId === id);

  const likeCount = post.likes + (reaction ? 1 : 0);
  const saveCount = post.saves + (saved ? 1 : 0);
  const reshareCount = post.reshares + (reshared ? 1 : 0);

  const meta = { title: post.text.split("\n")[0].slice(0, 60), creator: post.creator.handle, thumb: post.media };

  const requireAuth = (fn: () => void) => () => {
    if (isGuest) { toast("Sign up to interact"); nav({ to: "/onboarding" }); return; }
    fn();
  };

  const onReactionPick = (k: ReactionKey) => {
    setReaction(post.id, reaction === k ? null : k, meta);
    setBurst(true);
    setPickerOpen(false);
    setTimeout(() => setBurst(false), 600);
  };

  const current = reaction ? REACTIONS.find((r) => r.key === reaction) : null;

  return (
    <article
      className="group rounded-3xl liquid-glass neon-border overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] liquid-hover animate-rise"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 p-4">
        <Link
          to="/channel/$handle"
          params={{ handle: post.creator.handle }}
          className="relative size-10 rounded-full conic-ring shrink-0 hover:scale-105 transition-transform"
          aria-label={`Open @${post.creator.handle}'s profile`}
        >
          <img src={post.creator.avatar} alt="" className="size-10 rounded-full object-cover" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link to="/channel/$handle" params={{ handle: post.creator.handle }} className="font-semibold hover:underline">
              {post.creator.name}
            </Link>
            <VerifiedBadge kind={post.creator.verified} />
            <Link to="/channel/$handle" params={{ handle: post.creator.handle }} className="text-xs text-muted-foreground hover:text-foreground">
              @{post.creator.handle} · {post.timeAgo}
            </Link>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md border border-primary/50 text-primary">Creator</span>
          </div>
        </div>
        <button onClick={() => toast("Post options")} className="size-8 grid place-items-center text-muted-foreground hover:text-foreground tilt-press" aria-label="more">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <p className="px-4 pb-3 text-sm whitespace-pre-line">{post.text}</p>

      {post.media && (
        <div className="px-3">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_28px_-12px_oklch(0.65_0.22_300_/_0.6)] shimmer-sweep">
            <img src={post.media} alt="" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
            <button onClick={() => setPlaying((p) => !p)} className="absolute inset-0 grid place-items-center bg-black/10 hover:bg-black/30 transition" aria-label="Play">
              <span className={`size-14 rounded-full grid place-items-center bg-black/50 backdrop-blur-md border border-white/20 transition-transform ${playing ? "scale-90" : "scale-100 group-hover:scale-110"} animate-glow-pulse`}>
                {playing ? <Pause className="size-6 fill-white text-white" /> : <Play className="size-6 fill-white text-white" />}
              </span>
            </button>
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
            onClick={requireAuth(() => setPickerOpen((v) => !v))}
            onMouseEnter={() => !isGuest && setPickerOpen(true)}
            className={`flex items-center gap-1.5 transition tilt-press ${current ? "" : "text-muted-foreground hover:text-foreground"}`}
            style={current ? { color: current.color } : undefined}
          >
            <span className={`text-lg leading-none ${burst ? "animate-react-burst inline-block" : "inline-block"}`}>
              {current?.emoji ?? "🔥"}
            </span>
            <span className="text-xs font-semibold">{fmt(likeCount)}</span>
          </button>

          {pickerOpen && !isGuest && (
            <div
              onMouseLeave={() => setPickerOpen(false)}
              className="absolute bottom-full left-0 mb-2 z-20 flex items-center gap-1 px-2 py-1.5 rounded-full liquid-glass border border-white/10 reaction-pop shadow-[0_20px_40px_-15px_oklch(0_0_0_/_0.7)]"
            >
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => onReactionPick(r.key)}
                  title={r.label}
                  className={`size-9 grid place-items-center rounded-full text-xl hover:scale-125 transition-transform ${reaction === r.key ? "bg-white/10" : ""}`}
                  style={{ filter: `drop-shadow(0 0 8px ${r.color})` }}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => setCommentsOpen((v) => !v)}
          className={`flex items-center gap-1.5 transition tilt-press ${commentsOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          aria-expanded={commentsOpen}
        >
          <MessageCircle className="size-5" /> {post.comments + allComments.length}
        </button>
        <button onClick={requireAuth(() => { setReshared((v) => !v); toast(reshared ? "Unshared" : "Reshared to your channel"); })} className={`flex items-center gap-1.5 transition tilt-press ${reshared ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Repeat2 className={`size-5 ${reshared ? "animate-burst" : ""}`} /> {reshareCount}
        </button>
        <button onClick={requireAuth(() => toggleSave(post.id, meta))} className={`flex items-center gap-1.5 transition tilt-press ${saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Bookmark className={`size-5 ${saved ? "fill-current animate-burst" : ""}`} /> {fmt(saveCount)}
        </button>
        <button
          onClick={async () => {
            logShare(post.id, meta);
            try { await navigator.share?.({ title: post.creator.name, text: post.text }); }
            catch { await navigator.clipboard?.writeText(`${post.creator.name}: ${post.text}`); toast("Link copied"); }
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
            <h4 className="text-sm font-semibold">Comments · {allComments.length}</h4>
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
                <CommentRow c={c} onLike={() => toggleLike(c.id)} onReply={() => setReplyTo(c)} />
                {repliesOf(c.id).length > 0 && (
                  <ul className="pl-10 space-y-2 border-l border-white/10 ml-4">
                    {repliesOf(c.id).map((r) => (
                      <li key={r.id}><CommentRow c={r} onLike={() => toggleLike(r.id)} onReply={() => setReplyTo(c)} compact /></li>
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
                if (isGuest) { toast("Sign up to comment"); nav({ to: "/onboarding" }); return; }
                add(post.id, newComment, replyTo?.id);
                setNewComment(""); setReplyTo(null);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={replyTo ? "Write a reply…" : "Add a comment…"}
                className="flex-1 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm focus:outline-none focus:border-primary/60"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold disabled:opacity-40 hover:opacity-90"
              >
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </article>
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

function CommentRow({ c, onLike, onReply, compact }: { c: Comment; onLike: () => void; onReply: () => void; compact?: boolean }) {
  return (
    <div className="flex gap-2.5">
      <Link to="/channel/$handle" params={{ handle: c.author.handle }} className="shrink-0">
        <img src={c.author.avatar} alt="" className={`${compact ? "size-7" : "size-8"} rounded-full object-cover ring-1 ring-white/10`} />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl bg-white/[0.04] border border-white/5 px-3 py-2">
          <div className="flex items-center gap-1.5 text-xs">
            <Link to="/channel/$handle" params={{ handle: c.author.handle }} className="font-semibold hover:underline">
              {c.author.name}
            </Link>
            <span className="text-muted-foreground">· {timeAgo(c.createdAt)}</span>
          </div>
          <p className="text-sm mt-0.5 break-words whitespace-pre-wrap">{c.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-1 text-[11px] text-muted-foreground">
          <button onClick={onLike} className={`flex items-center gap-1 hover:text-foreground transition ${c.likedByMe ? "text-[oklch(0.7_0.25_15)]" : ""}`}>
            <Heart className={`size-3.5 ${c.likedByMe ? "fill-current" : ""}`} /> {c.likes}
          </button>
          <button onClick={onReply} className="flex items-center gap-1 hover:text-foreground transition">
            <Reply className="size-3.5" /> Reply
          </button>
        </div>
      </div>
    </div>
  );
}
