import { Heart, MessageCircle, Repeat2, Bookmark, Send, MoreHorizontal, Play } from "lucide-react";
import { VerifiedBadge } from "@/components/brand/Badge";
import type { posts as Posts } from "@/lib/mock-data";

type Post = (typeof Posts)[number];

function fmt(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="rounded-3xl glass border border-white/8 overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)]">
      <div className="flex items-center gap-3 p-4">
        <img src={post.creator.avatar} alt="" className="size-10 rounded-full object-cover ring-neon-gold" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold">{post.creator.name}</span>
            <VerifiedBadge kind={post.creator.verified} />
            <span className="text-xs text-muted-foreground">@{post.creator.handle} · {post.timeAgo}</span>
            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md border border-primary/50 text-primary">Creator</span>
          </div>
        </div>
        <button className="size-8 grid place-items-center text-muted-foreground hover:text-foreground" aria-label="more">
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <p className="px-4 pb-3 text-sm whitespace-pre-line">{post.text}</p>

      <div className="px-3">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_28px_-12px_oklch(0.65_0.22_300_/_0.6)]">
          <img src={post.media} alt="" className="w-full aspect-video object-cover" loading="lazy" />
          <button className="absolute inset-0 grid place-items-center bg-black/10 hover:bg-black/20 transition" aria-label="Play">
            <span className="size-14 rounded-full grid place-items-center bg-black/50 backdrop-blur-md border border-white/20">
              <Play className="size-6 fill-white text-white" />
            </span>
          </button>
          <span className="absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-md bg-black/60 backdrop-blur border border-white/10">
            {post.duration}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 py-3 text-sm">
        <button className="flex items-center gap-1.5 text-[oklch(0.65_0.24_15)]">
          <Heart className="size-5 fill-current" /> {fmt(post.likes)}
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <MessageCircle className="size-5" /> {post.comments}
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <Repeat2 className="size-5" /> {post.reshares}
        </button>
        <button className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <Bookmark className="size-5" /> {post.saves}
        </button>
        <button className="text-muted-foreground hover:text-foreground" aria-label="share">
          <Send className="size-5" />
        </button>
      </div>
    </article>
  );
}
