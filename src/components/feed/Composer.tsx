import { 
  Image as ImageIcon, Film, Sparkles as GifIcon, Globe, ChevronDown, Lock, Users, X, Loader2, 
  ArrowLeft, Check, FolderPlus, MessageSquare, Send, Compass, Sparkles, Folder, Play, Eye
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { currentUser, creators } from "@/lib/mock-data";
import { useFeed } from "@/lib/feed-store";
import { useAuth } from "@/lib/auth";
import { useAuth as useSupabaseAuth } from "@/hooks/use-auth";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import { useMessages } from "@/lib/messages-store";
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
  | { kind: "mock"; url: string; label: string }
  | null;

const MOCK_GALLERY = [
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986683829_2c697ab7.png", label: "ATL Heat", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986707024_a1d0505d.png", label: "Memphis Live", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986750809_4e57f6ad.jpg", label: "Neon Disco", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986767781_0ba6a8e1.jpg", label: "Out of Orbit", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986787354_65419cd8.png", label: "Mila Live", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986835747_6ddf50eb.jpg", label: "Darius Studio", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986874398_28ab4dd4.png", label: "Kiana Live", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986907668_f7d54282.jpg", label: "Midnight Drive", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986969747_0621f927.jpg", label: "Late Night Soul", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986988018_572a0201.jpg", label: "Dance Floor", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341710343_1f96159c.jpg", label: "Trance Energy", isVideo: false },
  { url: "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341715677_13124eb9.png", label: "Hologram Vibe", isVideo: false },
];

const QUICK_HASHTAGS = ["#nightlife", "#vibes", "#beats", "#electronic", "#studiotalk", "#newsound", "#atlparty", "#treytv"];

const DESTINATIONS = [
  { key: "FEED", label: "FEED", desc: "Post to general news feed" },
  { key: "PROFILE", label: "PROFILE", desc: "Post to your public profile" },
  { key: "MESSAGE", label: "MESSAGE", desc: "Send as a direct message" },
  { key: "TRENZ", label: "TRENZ", desc: "Share to Trey TV Stories" },
] as const;

export function Composer() {
  const navigate = useNavigate();
  const { addPost } = useFeed();
  const { isGuest, user } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const { threads, send: sendMessage, sendMedia } = useMessages();
  const avatarUrl = user?.avatar || currentUser.avatar;

  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["id"]>("Everyone");
  const [audOpen, setAudOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(null);
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const [aspectFit, setAspectFit] = useState(false);
  const [activeDest, setActiveDest] = useState<(typeof DESTINATIONS)[number]["key"]>("FEED");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [showTrenzCelebration, setShowTrenzAnimation] = useState(false);

  const imgRef = useRef<HTMLInputElement | null>(null);
  const vidRef = useRef<HTMLInputElement | null>(null);

  // Automatically select first mock image and trigger device file open on load
  useEffect(() => {
    setDraft({ kind: "mock", url: MOCK_GALLERY[0].url, label: MOCK_GALLERY[0].label });
    
    const triggerTimer = setTimeout(() => {
      imgRef.current?.click();
    }, 450);
    return () => clearTimeout(triggerTimer);
  }, []);

  const clearDraft = () => {
    if (draft && (draft.kind === "image" || draft.kind === "video")) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    setDraft(null);
  };

  const handleSelectMockImage = (url: string, label: string) => {
    clearDraft();
    setDraft({ kind: "mock", url, label });
    if (navigator.vibrate) navigator.vibrate(8);
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    const v = validateMediaFile(f);
    if (!v.ok) {
      toast.error(v.error);
      return;
    }
    if (v.kind === "video") {
      try {
        const durationMs = await getVideoDurationMs(f);
        if (durationMs > MAX_VIDEO_DURATION_MS) {
          toast.error("Clips must be 30 seconds or shorter.");
          return;
        }
        clearDraft();
        setDraft({ kind: "video", file: f, previewUrl: URL.createObjectURL(f), durationMs });
      } catch {
        toast.error("Could not read that video.");
      }
      return;
    }
    clearDraft();
    setDraft({ kind: "image", file: f, previewUrl: URL.createObjectURL(f) });
  };

  const handleAddHashtag = (tag: string) => {
    if (caption.includes(tag)) return;
    setCaption(prev => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag}` : tag;
    });
  };

  const handlePost = async () => {
    if (isGuest) {
      toast("Sign up to publish creatives");
      navigate({ to: "/signup" });
      return;
    }
    if (!draft) {
      toast.error("Please choose a photo, clip, or GIF first.");
      return;
    }

    const cap = validateCaption(caption);
    if (!cap.ok) {
      toast.error(cap.error);
      return;
    }

    setPosting(true);
    try {
      let mediaUrlToPost = "";
      
      // Resolve media URLs based on selected draft types
      if (draft.kind === "mock" || draft.kind === "gif") {
        mediaUrlToPost = draft.url;
      } else {
        const uid = supabaseUser?.id;
        if (!uid) {
          toast.error("Please sign in to post files.");
          setPosting(false);
          return;
        }
        const { url } = await uploadFeedMedia(uid, draft.file);
        mediaUrlToPost = url;
      }

      const mediaTypeToPost = draft.kind === "video" ? "video" : draft.kind === "gif" ? "gif" : "image";

      if (activeDest === "FEED") {
        addPost({
          text: caption.trim(),
          audience,
          media: mediaUrlToPost,
          mediaType: mediaTypeToPost,
          durationMs: draft.kind === "video" ? draft.durationMs : undefined,
        });
        toast.success("Shared successfully to home news feed!");
        navigate({ to: "/for-you" });

      } else if (activeDest === "PROFILE") {
        addPost({
          text: caption.trim(),
          audience,
          media: mediaUrlToPost,
          mediaType: mediaTypeToPost,
          durationMs: draft.kind === "video" ? draft.durationMs : undefined,
        });
        toast.success("Shared successfully to your public profile!");
        navigate({ to: "/u/$uid", params: { uid: user?.uid ?? currentUser.uid } });

      } else if (activeDest === "MESSAGE") {
        if (selectedRecipients.length === 0) {
          toast.error("Please select at least one message recipient.");
          setPosting(false);
          return;
        }

        // Send DMs to all selected threads
        for (const recipientId of selectedRecipients) {
          if (draft.kind !== "mock" && draft.kind !== "gif") {
            await sendMedia(recipientId, draft.file);
            if (caption.trim()) {
              await sendMessage(recipientId, caption.trim());
            }
          } else {
            const bodyText = caption.trim() 
              ? `${caption.trim()}\n\n📸 Post: ${mediaUrlToPost}`
              : `📸 Post: ${mediaUrlToPost}`;
            await sendMessage(recipientId, bodyText);
          }
        }
        toast.success(`Sent as a direct message to ${selectedRecipients.length} recipients!`);
        navigate({ to: "/inbox" });

      } else if (activeDest === "TRENZ") {
        // Trenz / Stories published
        // Store story locally or trigger beautiful IG animation before navigating
        setShowTrenzAnimation(true);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        
        setTimeout(() => {
          setShowTrenzAnimation(false);
          toast.success("Story successfully published to TRENZ!");
          navigate({ to: "/" });
        }, 1800);
      }

    } catch (err) {
      console.error("Post creation error:", err);
      toast.error("Upload/Post failed — please try again.");
    } finally {
      if (activeDest !== "TRENZ") {
        setPosting(false);
      }
    }
  };

  const toggleRecipient = (id: string) => {
    setSelectedRecipients(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const aud = AUDIENCES.find((a) => a.id === audience)!;

  // Build recipients list from direct message threads or mock fallbacks
  const recipientsList = threads.length > 0 
    ? threads.map(t => ({ id: t.id, name: t.peer.name, avatar: t.peer.avatar })) 
    : creators.slice(0, 5).map(c => ({ id: c.id, name: c.name, avatar: c.avatar as unknown as string }));

  return (
    <div className="relative">
      {/* TRENZ Posting Success Confetti Animation */}
      {showTrenzCelebration && (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-center animate-fade-in">
          <div className="relative mb-6">
            <span className="absolute -inset-4 bg-gradient-to-tr from-fuchsia-500 via-rose-500 to-amber-500 rounded-full blur-xl opacity-80 animate-pulse" />
            <div className="size-24 rounded-full bg-[#05060E] border-2 border-amber-400 flex items-center justify-center relative">
              <Sparkles className="size-10 text-amber-300 animate-spin-slow" />
            </div>
          </div>
          <h2 className="text-xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-rose-400 to-amber-300 uppercase animate-bounce">
            PUBLISHED TO TRENZ!
          </h2>
          <p className="text-zinc-400 text-sm mt-2 max-w-xs px-4">
            Your creative is now live on Trey TV Trenz story cards!
          </p>
        </div>
      )}

      {/* Main Instagram Layout Shell */}
      <div className="mobile-edge-card rounded-none sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-[#0a0c16]/95 to-[#04050a]/98 border-[0.5px] border-white/12 backdrop-blur-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden space-y-5">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-1">
          <button 
            type="button"
            onClick={() => navigate({ to: "/" })} 
            className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="size-3.5" /> Cancel
          </button>
          <div className="text-center">
            <h2 className="text-xs font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              NEW POST
            </h2>
            <p className="text-[9px] text-zinc-500 font-mono tracking-widest mt-0.5">IG CREATOR VIEW</p>
          </div>
          <button 
            type="button"
            onClick={handlePost} 
            disabled={posting}
            className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.35)] hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0 active:scale-95"
          >
            {posting ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3 stroke-[3]" />} SHARE
          </button>
        </div>

        {/* Square Preview Container */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 group shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />
          
          {draft ? (
            <>
              {draft.kind === "video" ? (
                <video src={draft.previewUrl} controls className={`w-full h-full ${aspectFit ? "object-contain" : "object-cover"}`} />
              ) : (
                <img 
                  src={draft.kind === "mock" ? draft.url : draft.kind === "gif" ? draft.url : draft.previewUrl} 
                  alt="Selected Post Preview" 
                  className={`w-full h-full transition-transform duration-700 ${aspectFit ? "object-contain" : "object-cover"}`} 
                />
              )}
              
              {/* Fit/Cover Aspect Toggle */}
              <button 
                type="button"
                onClick={() => setAspectFit(!aspectFit)}
                className="absolute bottom-3 left-3 size-8 rounded-full bg-black/80 border border-white/15 flex items-center justify-center text-white hover:bg-black hover:border-white/30 active:scale-95 transition-all z-10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                title="Toggle Zoom/Aspect"
              >
                <Compass className="size-4 text-fuchsia-400 animate-pulse" />
              </button>

              {/* Remove/Clear Media */}
              <button 
                type="button"
                onClick={clearDraft}
                className="absolute top-3 right-3 size-8 rounded-full bg-black/80 border border-white/15 flex items-center justify-center text-white hover:bg-black hover:border-white/30 active:scale-95 transition-all z-10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                title="Remove Media"
              >
                <X className="size-4" />
              </button>
            </>
          ) : (
            <div 
              onClick={() => imgRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-white/[0.01] transition-colors"
            >
              <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-fuchsia-500/5 via-purple-500/5 to-amber-500/5 blur-xl animate-pulse" />
              
              <div className="size-14 rounded-2xl bg-zinc-950/80 border border-white/10 flex items-center justify-center mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative">
                <ImageIcon className="size-6 text-zinc-500" />
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-amber-500 rounded-b-2xl" />
              </div>
              
              <h3 className="text-xs font-bold text-white mb-1">Device Library Empty</h3>
              <p className="text-[10px] text-zinc-400 max-w-[210px] leading-normal">
                Choose a photo from the camera roll below, or click to load a custom image/video from your device.
              </p>
            </div>
          )}
        </div>

        {/* Hidden File Inputs */}
        <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
        <input ref={vidRef} type="file" accept="video/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />

        {/* Interactive Caption / Hashtags */}
        <div className="p-3 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-3.5">
          <div className="flex items-start gap-3">
            <img src={avatarUrl} alt="Me" className="size-8 rounded-full object-cover shrink-0 ring-1 ring-white/10" />
            <div className="flex-1 min-w-0">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                placeholder="Write an epic caption..."
                rows={1}
                maxLength={MAX_CAPTION}
                className="w-full bg-transparent resize-none outline-none text-xs text-zinc-100 placeholder-zinc-500 leading-normal"
              />
              <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-1 font-mono">
                <span>{caption.length} / {MAX_CAPTION}</span>
                <div className="relative">
                  <button 
                    type="button"
                    onClick={() => setAudOpen((s) => !s)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                  >
                    <aud.icon className="size-2.5 text-amber-400" /> {aud.label} <ChevronDown className="size-2" />
                  </button>
                  {audOpen && (
                    <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-zinc-900 border border-white/10 shadow-2xl p-1 z-30">
                      {AUDIENCES.map((a) => (
                        <button 
                          key={a.id} 
                          type="button"
                          onClick={() => { setAudience(a.id); setAudOpen(false); }}
                          className={`w-full text-left px-2.5 py-1 rounded text-[10px] hover:bg-white/5 flex items-center gap-1.5 ${audience === a.id ? "text-fuchsia-400 font-bold" : "text-zinc-400"}`}
                        >
                          <a.icon className="size-3" /> {a.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Hashtags Scroller */}
          <div className="border-t border-white/5 pt-2.5">
            <p className="text-[9px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">IMMERSIVE HASHTAGS</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {QUICK_HASHTAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddHashtag(tag)}
                  className="px-2 py-0.5 rounded-full bg-zinc-900 border border-white/5 hover:border-white/10 text-[10px] text-zinc-400 hover:text-fuchsia-400 hover:bg-fuchsia-500/5 transition-all shrink-0 active:scale-95 font-mono"
                >
                  {tag}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowFwdPicker(true)}
                className="px-2 py-0.5 rounded-full bg-gradient-to-r from-fuchsia-500/20 to-purple-500/20 border border-fuchsia-500/25 text-[10px] text-fuchsia-300 hover:text-white transition-all shrink-0 active:scale-95 flex items-center gap-1"
              >
                <GifIcon className="size-3 text-fuchsia-400" /> + Add GIF
              </button>
            </div>
          </div>
        </div>

        {/* MESSAGE: Direct Message Recipients row */}
        {activeDest === "MESSAGE" && (
          <div className="p-3.5 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">Select DM Recipient</p>
              <span className="text-[9px] text-fuchsia-400 font-mono tracking-widest">{selectedRecipients.length} SELECTED</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
              {recipientsList.map((rec) => {
                const isSelected = selectedRecipients.includes(rec.id);
                return (
                  <button
                    key={rec.id}
                    type="button"
                    onClick={() => toggleRecipient(rec.id)}
                    className="flex flex-col items-center gap-1.5 shrink-0 select-none group relative py-1"
                  >
                    <div className="relative">
                      <div 
                        className={`size-11 rounded-full overflow-hidden p-0.5 transition-all duration-300 ${
                          isSelected 
                            ? "ring-2 ring-fuchsia-500 scale-105 shadow-[0_0_12px_rgba(217,70,239,0.5)]" 
                            : "ring-1 ring-white/10 group-hover:ring-white/20"
                        }`}
                      >
                        <img src={rec.avatar} alt={rec.name} className="size-full rounded-full object-cover" />
                      </div>
                      {isSelected && (
                        <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-fuchsia-500 text-white flex items-center justify-center border border-zinc-950 shadow">
                          <Check className="size-2.5 stroke-[3.5]" />
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] truncate max-w-[60px] transition-colors ${isSelected ? "text-fuchsia-400 font-bold" : "text-zinc-500 group-hover:text-zinc-300"}`}>
                      {rec.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Camera Roll / Gallery Selector Grid */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 px-1">
              <span className="text-xs font-black text-white tracking-wide">CAMERA ROLL</span>
              <span className="text-[8px] bg-white/5 border border-white/8 text-zinc-400 px-1.5 py-0.5 rounded font-mono select-none">Recent ▾</span>
            </div>
            <button 
              type="button"
              onClick={() => imgRef.current?.click()}
              className="text-[10px] font-black tracking-wider text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 px-2.5 py-1 rounded-lg border border-fuchsia-500/15 transition-all active:scale-95 select-none"
            >
              <FolderPlus className="size-3" /> CHOOSE DEVICE FILE
            </button>
          </div>

          <div className="grid grid-cols-4 gap-1 rounded-xl overflow-hidden bg-zinc-950/30 p-1 border border-white/5 shadow-inner">
            {MOCK_GALLERY.map((img) => {
              const isSelected = draft && draft.kind === "mock" && draft.url === img.url;
              return (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => handleSelectMockImage(img.url, img.label)}
                  className="aspect-square relative overflow-hidden group active:scale-95 transition-transform"
                >
                  <img 
                    src={img.url} 
                    alt={img.label} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  {isSelected && <div className="absolute inset-0 bg-black/40 border-2 border-fuchsia-500" />}
                  
                  <div className={`absolute top-1 right-1 size-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected 
                      ? "bg-fuchsia-500 border-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.5)] scale-110" 
                      : "bg-black/30 border-white/25"
                  }`}>
                    {isSelected && <Check className="size-2 text-white stroke-[3.5]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Segmented Bottom Tab Controller (Feed, Profile, Message, Trenz) */}
        <div className="border-t border-white/5 pt-3 mb-1">
          <p className="text-[9px] font-bold text-zinc-500 tracking-wider mb-2 text-center uppercase">POSTING TYPE TARGET</p>
          <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950/80 rounded-2xl border border-white/5 relative overflow-hidden">
            {DESTINATIONS.map((dest) => {
              const isSel = activeDest === dest.key;
              return (
                <button
                  key={dest.key}
                  type="button"
                  onClick={() => {
                    setActiveDest(dest.key);
                    if (navigator.vibrate) navigator.vibrate(5);
                  }}
                  className="flex flex-col items-center py-2 rounded-xl transition-all duration-300 relative select-none"
                >
                  {isSel && (
                    <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 via-rose-500/10 to-amber-500/10 rounded-xl border border-white/5 animate-fade-in" />
                  )}
                  <span className={`text-[11px] font-black tracking-wider transition-all ${isSel ? "text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-400 scale-105" : "text-zinc-500 hover:text-zinc-300"}`}>
                    {dest.label}
                  </span>
                  <span className="text-[8px] text-zinc-500 mt-0.5 truncate font-mono scale-[0.85] opacity-65">
                    {dest.key === "FEED" ? "Home Feed" : dest.key === "PROFILE" ? "Wall" : dest.key === "MESSAGE" ? "DM Inbox" : "Stories"}
                  </span>
                  {isSel && (
                    <span className="absolute bottom-0.5 size-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Embedded FWD GIF picker popup */}
      <FwdGifPicker
        open={showFwdPicker}
        restrictTab="created"
        context="profile"
        treyTvUid={user?.uid ?? null}
        onClose={() => setShowFwdPicker(false)}
        onSelect={(gif) => {
          setShowFwdPicker(false);
          clearDraft();
          setDraft({ 
            kind: "gif", 
            url: gif.url, 
            gifFwdId: gif.gif_id ?? null, 
            gifPosterUrl: gif.preview_url ?? null, 
            gifTitle: gif.title ?? null 
          });
          if (navigator.vibrate) navigator.vibrate(10);
        }}
      />
    </div>
  );
}
