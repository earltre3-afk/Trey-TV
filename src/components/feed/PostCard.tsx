import { useState } from "react";
import { Heart, MessageCircle, Repeat2, Bookmark, Send, MoreHorizontal, Play, Pause } from "lucide-react";
import { toast } from "sonner";
import { VerifiedBadge } from "@/components/brand/Badge";
import type { posts as Posts } from "@/lib/mock-data";

type Post = (typeof Posts)[number];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reshared, setReshared] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [burst, setBurst] = useState(false);

  const likeCount = post.likes + (liked ? 1 : 0);
  const saveCount = post.saves + (saved ? 1 : 0);
  const reshareCount = post.reshares + (reshared ? 1 : 0);

  const onLike = () => {
    setLiked((v) => !v);
    setBurst(true);
    setTimeout(() => setBurst(false), 600);
  };

  return (
    <article
      className="group rounded-3xl glass neon-border overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] hover-lift animate-rise"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="flex items-center gap-3 p-4">
        <div className="relative size-10 rounded-full conic-ring shrink-0">
          <img src={post.creator.avatar} alt="" className="size-10 rounded-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold">{post.creator.name}</span>
            <VerifiedBadge kind={post.creator.verified} />
            <span className="text-xs text-muted-foreground">@{post.creator.handle} · {post.timeAgo}</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md border border-primary/50 text-primary">Creator</span>
          </div>
        </div>
        <button onClick={() => toast("Post options")} className="size-8 grid place-items-center text-muted-foreground hover:text-foreground tilt-press" aria-label="more">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <p className="px-4 pb-3 text-sm whitespace-pre-line">{post.text}</p>

      <div className="px-3">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_28px_-12px_oklch(0.65_0.22_300_/_0.6)] shimmer-sweep">
          <img src={post.media} alt="" className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-[1.04]" loading="lazy" />
          <button onClick={() => setPlaying((p) => !p)} className="absolute inset-0 grid place-items-center bg-black/10 hover:bg-black/30 transition" aria-label="Play">
            <span className={`size-14 rounded-full grid place-items-center bg-black/50 backdrop-blur-md border border-white/20 transition-transform ${playing ? "scale-90" : "scale-100 group-hover:scale-110"} animate-glow-pulse`}>
              {playing ? <Pause className="size-6 fill-white text-white" /> : <Play className="size-6 fill-white text-white" />}
            </span>
          </button>
          <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border border-white/10">
            {post.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3 text-sm">
        <button onClick={onLike} className={`flex items-center gap-1.5 transition tilt-press ${liked ? "text-[oklch(0.65_0.24_15)]" : "text-muted-foreground hover:text-foreground"}`}>
          <Heart className={`size-5 ${liked ? "fill-current" : ""} ${burst ? "animate-burst" : ""}`} /> {fmt(likeCount)}
        </button>
        <button onClick={() => toast("Comments coming soon")} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground tilt-press">
          <MessageCircle className="size-5" /> {post.comments}
        </button>
        <button onClick={() => { setReshared((v) => !v); toast(reshared ? "Unshared" : "Reshared to your channel"); }} className={`flex items-center gap-1.5 transition tilt-press ${reshared ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Repeat2 className={`size-5 ${reshared ? "animate-burst" : ""}`} /> {reshareCount}
        </button>
        <button onClick={() => setSaved((v) => !v)} className={`flex items-center gap-1.5 transition tilt-press ${saved ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
          <Bookmark className={`size-5 ${saved ? "fill-current animate-burst" : ""}`} /> {fmt(saveCount)}
        </button>
        <button
          onClick={async () => {
            try {
              await navigator.share?.({ title: post.creator.name, text: post.text });
            } catch {
              await navigator.clipboard?.writeText(`${post.creator.name}: ${post.text}`);
              toast("Link copied");
            }
          }}
          className="text-muted-foreground hover:text-foreground tilt-press"
          aria-label="share"
        >
          <Send className="size-5" />
        </button>
      </div>
    </article>
  );
}
