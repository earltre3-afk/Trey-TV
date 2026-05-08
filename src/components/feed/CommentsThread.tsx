import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, CornerDownRight, Send } from "lucide-react";
import { toast } from "sonner";
import { useComments, timeAgo, type Comment } from "@/lib/comments-store";
import { useAuth } from "@/lib/auth";
import { currentUser } from "@/lib/mock-data";

function Row({ c, onReply }: { c: Comment; onReply: (id: string, name: string) => void }) {
  const { toggleLike } = useComments();
  const { isGuest } = useAuth();
  const nav = useNavigate();
  const guard = (fn: () => void) => () => {
    if (isGuest) { toast("Sign up to interact"); nav({ to: "/onboarding" }); return; }
    fn();
  };
  const initials = c.authorName.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className={`flex items-start gap-2.5 ${c.parentId ? "pl-8" : ""}`}>
      <Link to="/u/$uid" params={{ uid: c.authorId }} className="shrink-0">
        {c.authorAvatar ? (
          <img src={c.authorAvatar} alt="" className="size-8 rounded-full object-cover ring-1 ring-white/10" />
        ) : (
          <div className="size-8 rounded-full grid place-items-center bg-white/5 border border-white/10 text-[10px] font-semibold">
            {initials}
          </div>
        )}
      </Link>
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl px-3 py-2 bg-white/[0.04] border border-white/10">
          <div className="flex items-center gap-1.5 text-xs">
            <Link to="/u/$uid" params={{ uid: c.authorId }} className="font-semibold hover:underline truncate">
              {c.authorName}
            </Link>
            <span className="text-muted-foreground">@{c.authorHandle}</span>
            <span className="text-muted-foreground">· {timeAgo(c.createdAt)}</span>
          </div>
          <p className="text-sm mt-0.5 break-words whitespace-pre-line">{c.text}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 px-2 text-[11px] text-muted-foreground">
          <button
            onClick={guard(() => toggleLike(c.id))}
            className={`flex items-center gap-1 transition tilt-press ${c.likedByMe ? "text-[oklch(0.7_0.25_340)]" : "hover:text-foreground"}`}
          >
            <Heart className={`size-3.5 ${c.likedByMe ? "fill-current" : ""}`} /> {c.likes}
          </button>
          <button
            onClick={guard(() => onReply(c.id, c.authorName))}
            className="flex items-center gap-1 hover:text-foreground transition tilt-press"
          >
            <CornerDownRight className="size-3.5" /> Reply
          </button>
        </div>
      </div>
    </div>
  );
}

export function CommentsThread({ postId }: { postId: string }) {
  const { byPost, add } = useComments();
  const { isGuest } = useAuth();
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);

  const all = byPost(postId);
  const top = all.filter((c) => !c.parentId);
  const repliesOf = (id: string) => all.filter((c) => c.parentId === id);

  const submit = () => {
    if (isGuest) { toast("Sign up to comment"); nav({ to: "/onboarding" }); return; }
    if (!text.trim()) return;
    add(postId, text, replyTo?.id ?? null);
    setText("");
    setReplyTo(null);
  };

  return (
    <div className="border-t border-white/10 px-4 pt-3 pb-4 animate-rise">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-3">
        COMMENTS · {all.length}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1 -mr-1 scrollbar-thin">
        {top.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">
            Be the first to comment.
          </p>
        )}
        {top.map((c) => (
          <div key={c.id} className="space-y-2">
            <Row c={c} onReply={(id, name) => setReplyTo({ id, name })} />
            {repliesOf(c.id).map((r) => (
              <Row key={r.id} c={r} onReply={(id, name) => setReplyTo({ id, name })} />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2">
        <img src={currentUser.avatar} alt="" className="size-8 rounded-full object-cover ring-1 ring-primary/40 shrink-0" />
        <div className="flex-1 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-primary/50 transition px-3 py-2">
          {replyTo && (
            <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
              <span>Replying to <span className="text-primary">@{replyTo.name}</span></span>
              <button onClick={() => setReplyTo(null)} className="hover:text-foreground">cancel</button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); submit(); }
              }}
              placeholder={replyTo ? `Reply to ${replyTo.name}…` : "Add a comment…"}
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground min-h-[20px] max-h-32"
            />
            <button
              onClick={submit}
              disabled={!text.trim()}
              className="size-8 grid place-items-center rounded-full border border-primary text-primary disabled:opacity-40 disabled:cursor-not-allowed glow-gold hover:bg-primary/10"
              aria-label="Post comment"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
