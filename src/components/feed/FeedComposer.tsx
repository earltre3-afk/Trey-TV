import { Image as ImageIcon, Wand2, Globe, ChevronDown, Plus, Lock, Users, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { currentUser } from "@/lib/mock-data";
import { useFeed } from "@/lib/feed-store";
import { useAuth } from "@/lib/auth";
import { PlusMenu } from "@/components/inbox/PlusMenu";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";

const tags = [
  { label: "Music", color: "cyan" },
  { label: "Comedy", color: "cyan" },
  { label: "Motivation", color: "purple" },
  { label: "Fashion", color: "gold" },
  { label: "Gaming", color: "magenta" },
];

const ringMap: Record<string, string> = {
  cyan: "border-[oklch(0.82_0.15_215)] text-[oklch(0.82_0.15_215)]",
  purple: "border-[oklch(0.65_0.22_300)] text-[oklch(0.65_0.22_300)]",
  gold: "border-primary text-primary",
  magenta: "border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)]",
};

const AUDIENCES = [
  { id: "Everyone", label: "Everyone", icon: Globe },
  { id: "Followers", label: "Followers", icon: Users },
  { id: "Premium", label: "Premium", icon: Lock },
] as const;

const MAX = 500;

const postSchema = z.object({
  text: z.string().trim().min(1, "Write something first").max(MAX, `Keep it under ${MAX} characters`),
});

export function FeedComposer() {
  const navigate = useNavigate();
  const { addPost } = useFeed();
  const { isGuest, user } = useAuth();
  const avatarUrl = user?.avatar || currentUser.avatar;
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["id"]>("Everyone");
  const [audOpen, setAudOpen] = useState(false);
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [focused, setFocused] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const toggleTag = (t: string) =>
    setSelected((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  // auto-grow textarea
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 280) + "px";
  }, [text]);

  const reset = () => {
    setText(""); setMedia(null); setMediaType(null); setSelected([]); setFocused(false);
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
    addPost({ text: parsed.data.text, audience, tags: selected, media: media ?? undefined });
    toast.success("Posted to your feed");
    reset();
  };

  const onFile = (f: File | null) => {
    if (!f) return;
    const isImage = f.type.startsWith("image/");
    const isVideo = f.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Images, videos, or GIFs only");
      return;
    }
    const maxSize = isVideo ? 50 * 1024 * 1024 : 8 * 1024 * 1024;
    if (f.size > maxSize) {
      toast.error(`${isImage ? "Image" : "Video"} must be under ${isVideo ? "50MB" : "8MB"}`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setMedia(reader.result);
        setMediaType(isImage ? "image" : "video");
      }
    };
    reader.readAsDataURL(f);
  };

  const remaining = MAX - text.length;
  const aud = AUDIENCES.find((a) => a.id === audience)!;

  return (
    <div className={`mobile-edge-card rounded-none sm:rounded-3xl p-3 sm:p-4 glass neon-border shadow-[0_0_30px_-10px_oklch(0.82_0.16_85_/_0.4)] relative overflow-hidden hover-lift ${showPlusMenu || showFwdPicker ? "z-[100]" : ""}`}>
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_80%_-20%,oklch(0.7_0.25_340_/_0.4),transparent_60%)]" />

      <div className="relative flex items-start gap-3">
        <div className="relative size-11 rounded-full conic-ring shrink-0">
          <img src={avatarUrl} alt="" className="size-11 rounded-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            onFocus={() => setFocused(true)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                handlePost();
              }
            }}
            placeholder={`What's on your mind, ${currentUser.name}?`}
            rows={1}
            maxLength={MAX}
            className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground leading-relaxed font-semibold"
            aria-label="Post composer"
          />
          {media && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10">
              {mediaType === "video" ? (
                <video src={media} controls className="w-full max-h-64 object-cover" />
              ) : (
                <img src={media} alt="" className="w-full max-h-64 object-cover" />
              )}
              <button
                onClick={() => { setMedia(null); setMediaType(null); }}
                className="absolute top-2 right-2 size-7 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur"
                aria-label="Remove media"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-3 flex items-center gap-2 flex-wrap">
        <input
          ref={fileRef}
          type="file"
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <button onClick={() => fileRef.current?.click()} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <ImageIcon className="size-4" /> Image/Video
        </button>
        <button onClick={() => navigate({ to: "/creator-studio/edit" })} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <Wand2 className="size-4 text-primary" /> Trey-I Tools
        </button>
        <div className="relative">
          <button onClick={() => setAudOpen((s) => !s)} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
            <aud.icon className="size-4" /> {aud.label} <ChevronDown className={`size-3 transition-transform ${audOpen ? "rotate-180" : ""}`} />
          </button>
          {audOpen && (
            <div className="absolute left-0 top-full mt-2 w-44 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30 animate-scale-in">
              {AUDIENCES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setAudience(a.id); setAudOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 flex items-center gap-2 ${audience === a.id ? "text-primary font-semibold" : ""}`}
                >
                  <a.icon className="size-4" /> {a.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {(focused || text.length > 0) && (
            <span className={`text-[11px] tabular-nums ${remaining < 40 ? "text-[oklch(0.78_0.24_15)]" : "text-muted-foreground"}`}>
              {remaining}
            </span>
          )}
          <button
            onClick={handlePost}
            disabled={text.trim().length === 0}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:glow-none"
          >
            Post
          </button>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-2">RECOMMENDATION TAGS</div>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const isSel = selected.includes(t.label);
            return (
              <button
                key={t.label}
                onClick={() => toggleTag(t.label)}
                className={`px-3 py-1 rounded-full text-xs border ${ringMap[t.color]} ${isSel ? "bg-white/10" : "bg-transparent hover:bg-white/5"}`}
              >
                {t.label}
              </button>
            );
          })}
          <button onClick={() => setShowPlusMenu(true)} className="size-7 grid place-items-center rounded-full border border-white/15 text-muted-foreground hover:bg-white/5" title="Add pics, vids, or GIFs">
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {showPlusMenu && (
        <PlusMenu
          excludeGhost
          onPhoto={() => { setShowPlusMenu(false); fileRef.current?.click(); }}
          onFwd={() => { setShowPlusMenu(false); setShowFwdPicker(true); }}
          onClose={() => setShowPlusMenu(false)}
        />
      )}

      <FwdGifPicker
        open={showFwdPicker}
        onClose={() => setShowFwdPicker(false)}
        onSelect={(gif) => {
          setShowFwdPicker(false);
          setMedia(gif.url);
          setMediaType("image");
        }}
      />
    </div>
  );
}
