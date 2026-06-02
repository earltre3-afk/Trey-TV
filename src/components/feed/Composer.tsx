import { Image as ImageIcon, Film, Sparkles as GifIcon, Globe, ChevronDown, Lock, Users, X, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { currentUser } from "@/lib/mock-data";
import { useFeed } from "@/lib/feed-store";
import { useAuth } from "@/lib/auth";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import { uploadFeedMedia } from "@/lib/supabase-storage";
import {
  validateMediaFile, validateCaption, getVideoDurationMs,
  MAX_CAPTION, MAX_VIDEO_DURATION_MS,
} from "@/lib/feed/mediaValidation";

const AUDIENCES = [
  { id: "Everyone", label: "Everyone", icon: Globe },
  { id: "Followers", label: "Followers", icon: Users },
  { id: "Premium", label: "Premium", icon: Lock },
] as const;

type Draft =
  | { kind: "image" | "video"; file: File; previewUrl: string; durationMs?: number }
  | { kind: "gif"; url: string; gifFwdId: string | null; gifPosterUrl: string | null; gifTitle: string | null }
  | null;

export function Composer() {
  const navigate = useNavigate();
  const { addPost } = useFeed();
  const { isGuest, user } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const avatarUrl = user?.avatar || currentUser.avatar;

  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["id"]>("Everyone");
  const [audOpen, setAudOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(null);
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const imgRef = useRef<HTMLInputElement | null>(null);
  const vidRef = useRef<HTMLInputElement | null>(null);

  const clearDraft = () => {
    if (draft && (draft.kind === "image" || draft.kind === "video")) URL.revokeObjectURL(draft.previewUrl);
    setDraft(null);
  };
  const reset = () => { clearDraft(); setCaption(""); };

  const onFile = async (f: File | null) => {
    if (!f) return;
    const v = validateMediaFile(f);
    if (!v.ok) { toast.error(v.error); return; }
    if (v.kind === "video") {
      try {
        const durationMs = await getVideoDurationMs(f);
        if (durationMs > MAX_VIDEO_DURATION_MS) { toast.error("Clips must be 30 seconds or shorter."); return; }
        clearDraft();
        setDraft({ kind: "video", file: f, previewUrl: URL.createObjectURL(f), durationMs });
      } catch { toast.error("Could not read that video."); }
      return;
    }
    clearDraft();
    setDraft({ kind: "image", file: f, previewUrl: URL.createObjectURL(f) });
  };

  const handlePost = async () => {
    if (isGuest) { toast("Sign up to post"); navigate({ to: "/signup" }); return; }
    if (!draft) { toast.error("Add a photo, clip, or GIF first."); return; }
    const cap = validateCaption(caption);
    if (!cap.ok) { toast.error(cap.error); return; }

    setPosting(true);
    try {
      if (draft.kind === "gif") {
        addPost({
          text: caption.trim(), audience, media: draft.url, mediaType: "gif",
          sourceType: "fwd", gifFwdId: draft.gifFwdId, gifPosterUrl: draft.gifPosterUrl, gifTitle: draft.gifTitle,
        });
      } else {
        const uid = supabaseUser?.id;
        if (!uid) { toast.error("Sign in to post."); return; }
        const { url } = await uploadFeedMedia(uid, draft.file);
        addPost({
          text: caption.trim(), audience, media: url, mediaType: draft.kind,
          durationMs: draft.kind === "video" ? draft.durationMs : undefined,
        });
      }
      toast.success("Posted to your profile");
      reset();
      navigate({ to: "/u/$uid", params: { uid: user?.uid ?? currentUser.uid } });
    } catch (err) {
      console.error("Failed to post media:", err);
      toast.error("Upload failed — try again.");
    } finally {
      setPosting(false);
    }
  };

  const aud = AUDIENCES.find((a) => a.id === audience)!;
  const remaining = MAX_CAPTION - caption.length;

  return (
    <div className="mobile-edge-card rounded-none sm:rounded-3xl p-3 sm:p-4 glass neon-border relative overflow-hidden">
      <div className="relative flex items-start gap-3">
        <img src={avatarUrl} alt="" className="size-11 rounded-full object-cover shrink-0 conic-ring" />
        <div className="flex-1 min-w-0">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
            placeholder="Add a caption (optional)"
            rows={1}
            maxLength={MAX_CAPTION}
            className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-muted-foreground leading-relaxed"
            aria-label="Caption"
          />
          {draft && (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-white/10">
              {draft.kind === "video" ? (
                <video src={draft.previewUrl} controls className="w-full max-h-72 object-cover" />
              ) : draft.kind === "gif" ? (
                <img src={draft.url} alt="" className="w-full max-h-72 object-cover" />
              ) : (
                <img src={draft.previewUrl} alt="" className="w-full max-h-72 object-cover" />
              )}
              <button onClick={clearDraft} aria-label="Remove media"
                className="absolute top-2 right-2 size-7 grid place-items-center rounded-full bg-black/60 hover:bg-black/80 backdrop-blur">
                <X className="size-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
      <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />

      <div className="relative mt-3 flex items-center gap-2 flex-wrap">
        <button onClick={() => imgRef.current?.click()} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <ImageIcon className="size-4" /> Photo
        </button>
        <button onClick={() => vidRef.current?.click()} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <Film className="size-4" /> Clip
        </button>
        <button onClick={() => setShowFwdPicker(true)} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
          <GifIcon className="size-4 text-primary" /> FWD GIF
        </button>
        <div className="relative">
          <button onClick={() => setAudOpen((s) => !s)} className="px-3 py-2 rounded-xl glass text-xs flex items-center gap-1.5 hover:bg-white/5">
            <aud.icon className="size-4" /> {aud.label} <ChevronDown className={`size-3 transition-transform ${audOpen ? "rotate-180" : ""}`} />
          </button>
          {audOpen && (
            <div className="absolute left-0 top-full mt-2 w-44 rounded-xl glass-strong border border-white/10 shadow-2xl p-1 z-30">
              {AUDIENCES.map((a) => (
                <button key={a.id} onClick={() => { setAudience(a.id); setAudOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-white/5 flex items-center gap-2 ${audience === a.id ? "text-primary font-semibold" : ""}`}>
                  <a.icon className="size-4" /> {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {caption.length > 0 && (
            <span className={`text-[11px] tabular-nums ${remaining < 20 ? "text-[oklch(0.78_0.24_15)]" : "text-muted-foreground"}`}>{remaining}</span>
          )}
          <button onClick={handlePost} disabled={!draft || posting}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-primary text-primary glow-gold hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:glow-none flex items-center gap-1.5">
            {posting && <Loader2 className="size-4 animate-spin" />} Post
          </button>
        </div>
      </div>

      <FwdGifPicker
        open={showFwdPicker}
        restrictTab="created"
        context="profile"
        treyTvUid={user?.uid ?? null}
        onClose={() => setShowFwdPicker(false)}
        onSelect={(gif) => {
          setShowFwdPicker(false);
          clearDraft();
          setDraft({ kind: "gif", url: gif.url, gifFwdId: gif.gif_id ?? null, gifPosterUrl: gif.preview_url ?? null, gifTitle: gif.title ?? null });
        }}
      />
    </div>
  );
}
