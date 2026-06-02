import {
  Image as ImageIcon,
  Film,
  Sparkles as GifIcon,
  Globe,
  ChevronDown,
  Lock,
  Users,
  X,
  Loader2,
  ArrowLeft,
  Check,
  FolderPlus,
  MessageSquare,
  Send,
  Compass,
  Sparkles,
  Folder,
  Play,
  Eye,
  Music,
  Type,
  Sliders,
  Crop,
  Sun,
  Contrast,
  Droplet,
  Palette,
  Tag,
  MapPin,
  Search,
  ChevronRight,
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
  validateMediaFile,
  validateCaption,
  getVideoDurationMs,
  MAX_CAPTION,
  MAX_VIDEO_DURATION_MS,
} from "@/lib/feed/mediaValidation";

const AUDIENCES = [
  { id: "Everyone", label: "Everyone", icon: Globe },
  { id: "Followers", label: "Followers", icon: Users },
  { id: "Premium", label: "Premium", icon: Lock },
] as const;

type Draft =
  | { kind: "image" | "video"; file: File; previewUrl: string; durationMs?: number }
  | {
      kind: "gif";
      url: string;
      gifFwdId: string | null;
      gifPosterUrl: string | null;
      gifTitle: string | null;
    }
  | { kind: "mock"; url: string; label: string }
  | null;

const MOCK_GALLERY = [
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986683829_2c697ab7.png",
    label: "ATL Heat",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986707024_a1d0505d.png",
    label: "Memphis Live",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986750809_4e57f6ad.jpg",
    label: "Neon Disco",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986767781_0ba6a8e1.jpg",
    label: "Out of Orbit",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986787354_65419cd8.png",
    label: "Mila Live",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986835747_6ddf50eb.jpg",
    label: "Darius Studio",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986874398_28ab4dd4.png",
    label: "Kiana Live",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986907668_f7d54282.jpg",
    label: "Midnight Drive",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986969747_0621f927.jpg",
    label: "Late Night Soul",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986988018_572a0201.jpg",
    label: "Dance Floor",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341710343_1f96159c.jpg",
    label: "Trance Energy",
    isVideo: false,
  },
  {
    url: "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341715677_13124eb9.png",
    label: "Hologram Vibe",
    isVideo: false,
  },
];

const QUICK_HASHTAGS = [
  "#nightlife",
  "#vibes",
  "#beats",
  "#electronic",
  "#studiotalk",
  "#newsound",
  "#atlparty",
  "#treytv",
];

const DESTINATIONS = [
  { key: "FEED", label: "FEED", desc: "Post to general news feed" },
  { key: "PROFILE", label: "PROFILE", desc: "Post to your public profile" },
  { key: "MESSAGE", label: "MESSAGE", desc: "Send as a direct message" },
  { key: "TRENZ", label: "TRENZ", desc: "Share to Trey TV Stories" },
] as const;

const FILTERS = [
  { name: "Normal", value: "" },
  { name: "Clarendon", value: "contrast(1.2) saturate(1.35)" },
  { name: "Gingham", value: "brightness(1.05) hue-rotate(-10deg) saturate(0.85)" },
  { name: "Juno", value: "contrast(1.1) saturate(1.25) sepia(0.08)" },
  { name: "Ludwig", value: "brightness(1.05) contrast(1.05) saturate(1.1) sepia(0.05)" },
  { name: "Lofi", value: "contrast(1.3) saturate(1.4)" },
  { name: "Inkwell", value: "grayscale(1) contrast(1.15) brightness(1.05)" },
  { name: "Cyberpunk", value: "hue-rotate(55deg) saturate(1.65) contrast(1.1) brightness(1.1)" },
  { name: "Atlanta Heat", value: "saturate(1.55) contrast(1.15) sepia(0.12) brightness(0.95)" },
  {
    name: "Liquid Frost",
    value: "saturate(0.7) contrast(1.05) hue-rotate(190deg) brightness(1.05)",
  },
];

const TRADIO_TRACKS = [
  {
    id: "1",
    title: "Atlanta After Hours",
    artist: "DJ Trey",
    duration: "3:42",
    cover:
      "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986683829_2c697ab7.png",
  },
  {
    id: "2",
    title: "Liquid Frost Vibe",
    artist: "Mila",
    duration: "2:58",
    cover:
      "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986707024_a1d0505d.png",
  },
  {
    id: "3",
    title: "Neon City Lights",
    artist: "Darius",
    duration: "4:15",
    cover:
      "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986750809_4e57f6ad.jpg",
  },
  {
    id: "4",
    title: "Trance Energy Peak",
    artist: "Kiana",
    duration: "5:12",
    cover:
      "https://d64gsuwffb70l.cloudfront.net/6a1ddb096616cb7e4e894f24_1780341710343_1f96159c.jpg",
  },
  {
    id: "5",
    title: "Late Night Drive",
    artist: "Trey Trizzy",
    duration: "3:20",
    cover:
      "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986907668_f7d54282.jpg",
  },
];

const PRESET_LOCATIONS = [
  "Atlanta, GA",
  "TRadio Main Stage",
  "Trance VIP Lounge",
  "Trey TV HQ Studio",
  "Miami Beach, FL",
  "Los Angeles, CA",
];

interface Adjustments {
  brightness: number; // 0 to 200, default 100
  contrast: number; // 0 to 200, default 100
  fade: number; // 0 to 100, default 0
  color: number; // 0 to 200, default 100 (saturate)
  highlights: number; // -100 to 100, default 0
  shadows: number; // -100 to 100, default 0
  sharpen: number; // 0 to 100, default 0
  crop: "1:1" | "4:5" | "16:9" | "original";
}

interface TextOverlay {
  text: string;
  color: string;
  size: number; // in px
  font: "neon" | "classic" | "future" | "bold";
  align: "left" | "center" | "right";
  x: number; // percentage
  y: number; // percentage
}

export function Composer() {
  const navigate = useNavigate();
  const { addPost } = useFeed();
  const { isGuest, user } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const { threads, send: sendMessage, sendMedia } = useMessages();
  const avatarUrl = user?.avatar || currentUser.avatar;

  // Primary workflow state
  const [step, setStep] = useState<"EDIT" | "SHARE">("EDIT");
  const [activeEditTab, setActiveEditTab] = useState<"FILTER" | "ADJUST" | "SONG" | "TEXT">(
    "FILTER",
  );

  // Media Draft and Gallery state
  const [draft, setDraft] = useState<Draft>(null);
  const [aspectFit, setAspectFit] = useState(false);
  const imgRef = useRef<HTMLInputElement | null>(null);
  const vidRef = useRef<HTMLInputElement | null>(null);

  // Filter & Adjust State
  const [activeFilter, setActiveFilter] = useState<string>("Normal");
  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 100,
    contrast: 100,
    fade: 0,
    color: 100,
    highlights: 0,
    shadows: 0,
    sharpen: 0,
    crop: "original",
  });
  const [activeSlider, setActiveSlider] = useState<keyof Adjustments | "crop">("brightness");

  // Song Pairing State
  const [selectedSong, setSelectedSong] = useState<(typeof TRADIO_TRACKS)[number] | null>(null);
  const [songSearch, setSongSearch] = useState("");

  // Text Overlay State
  const [textOverlay, setTextOverlay] = useState<TextOverlay>({
    text: "",
    color: "#FFFFFF",
    size: 18,
    font: "neon",
    align: "center",
    x: 50,
    y: 50,
  });
  const [showTextInput, setShowTextInput] = useState(false);

  // Share Settings State
  const [caption, setCaption] = useState("");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]["id"]>("Everyone");
  const [audOpen, setAudOpen] = useState(false);
  const [taggedPeople, setTaggedPeople] = useState<string[]>([]);
  const [tagSearch, setTagSearch] = useState("");
  const [location, setLocation] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const [posting, setPosting] = useState(false);
  const [activeDest, setActiveDest] = useState<(typeof DESTINATIONS)[number]["key"]>("FEED");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [showTrenzCelebration, setShowTrenzAnimation] = useState(false);

  // Default select first mock image on load
  useEffect(() => {
    setDraft({ kind: "mock", url: MOCK_GALLERY[0].url, label: MOCK_GALLERY[0].label });
  }, []);

  const clearDraft = () => {
    if (draft && (draft.kind === "image" || draft.kind === "video")) {
      URL.revokeObjectURL(draft.previewUrl);
    }
    setDraft(null);
    setSelectedSong(null);
    setTextOverlay({
      text: "",
      color: "#FFFFFF",
      size: 18,
      font: "neon",
      align: "center",
      x: 50,
      y: 50,
    });
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
    setCaption((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag}` : tag;
    });
  };

  const getFilterString = () => {
    const filterObj = FILTERS.find((f) => f.name === activeFilter) || FILTERS[0];
    let str = filterObj.value ? `${filterObj.value} ` : "";

    // Sliders math
    str += `brightness(${adjustments.brightness / 100}) `;
    str += `contrast(${adjustments.contrast / 100}) `;
    str += `saturate(${adjustments.color / 100}) `;

    if (adjustments.fade > 0) {
      str += `opacity(${1 - adjustments.fade / 250}) contrast(${1 - adjustments.fade / 300}) `;
    }
    if (adjustments.highlights !== 0) {
      str += `brightness(${1 + adjustments.highlights / 350}) `;
    }
    if (adjustments.shadows !== 0) {
      str += `contrast(${1 - adjustments.shadows / 350}) brightness(${1 + adjustments.shadows / 450}) `;
    }
    if (adjustments.sharpen > 0) {
      str += `contrast(${1 + adjustments.sharpen / 400}) `;
    }

    return str;
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

      const mediaTypeToPost =
        draft.kind === "video" ? "video" : draft.kind === "gif" ? "gif" : "image";

      // Append paired song or location to text/metadata conceptually
      let finalCaption = caption.trim();
      if (selectedSong) {
        finalCaption += ` \n\n🎵 attached: ${selectedSong.title} by ${selectedSong.artist}`;
      }
      if (location) {
        finalCaption += ` \n📍 Location: ${location}`;
      }
      if (taggedPeople.length > 0) {
        finalCaption += ` \n👥 tagged: ${taggedPeople.join(", ")}`;
      }

      if (activeDest === "FEED") {
        addPost({
          text: finalCaption,
          audience,
          media: mediaUrlToPost,
          mediaType: mediaTypeToPost,
          durationMs: draft.kind === "video" ? draft.durationMs : undefined,
        });
        toast.success("Shared successfully to home news feed!");
        navigate({ to: "/for-you" });
      } else if (activeDest === "PROFILE") {
        addPost({
          text: finalCaption,
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

        for (const recipientId of selectedRecipients) {
          if (draft.kind !== "mock" && draft.kind !== "gif") {
            await sendMedia(recipientId, draft.file);
            if (finalCaption) {
              await sendMessage(recipientId, finalCaption);
            }
          } else {
            const bodyText = finalCaption
              ? `${finalCaption}\n\n📸 Post: ${mediaUrlToPost}`
              : `📸 Post: ${mediaUrlToPost}`;
            await sendMessage(recipientId, bodyText);
          }
        }
        toast.success(`Sent as a direct message to ${selectedRecipients.length} recipients!`);
        navigate({ to: "/inbox" });
      } else if (activeDest === "TRENZ") {
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
    setSelectedRecipients((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id],
    );
  };

  const toggleTagPerson = (name: string) => {
    setTaggedPeople((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
    );
  };

  const aud = AUDIENCES.find((a) => a.id === audience)!;

  const recipientsList =
    threads.length > 0
      ? threads.map((t) => ({ id: t.id, name: t.peer.name, avatar: t.peer.avatar }))
      : creators
          .slice(0, 5)
          .map((c) => ({ id: c.id, name: c.name, avatar: c.avatar as unknown as string }));

  const filteredSongs = TRADIO_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(songSearch.toLowerCase()) ||
      t.artist.toLowerCase().includes(songSearch.toLowerCase()),
  );

  const filteredCreatorsForTag = creators.filter((c) =>
    c.name.toLowerCase().includes(tagSearch.toLowerCase()),
  );

  return (
    <div className="relative">
      {/* TRENZ Success Splash */}
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
            Your creative is now live on Trey TV stories!
          </p>
        </div>
      )}

      {/* Main Suite Outer Card */}
      <div className="mobile-edge-card rounded-none sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-[#0B0D1B] to-[#040508] border-[0.5px] border-white/12 backdrop-blur-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden space-y-4">
        {/* ==================== STEP 1: EDIT SCREEN ==================== */}
        {step === "EDIT" && (
          <div className="space-y-4">
            {/* Header */}
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
                  EDIT STUDIO
                </h2>
                <p className="text-[9px] text-fuchsia-400 font-mono tracking-widest mt-0.5">
                  IG CREATOR VIEW
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("SHARE")}
                className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.35)] hover:opacity-95 transition-all flex items-center gap-1 shrink-0 active:scale-95"
              >
                NEXT <ChevronRight className="size-3" />
              </button>
            </div>

            {/* Media Canvas Area (Interactive preview) */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />

              {draft ? (
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                  {draft.kind === "video" ? (
                    <video
                      src={draft.previewUrl}
                      controls
                      className={`w-full h-full transition-all duration-300`}
                      style={{
                        filter: getFilterString(),
                        objectFit: aspectFit ? "contain" : "cover",
                        transform:
                          adjustments.crop === "4:5"
                            ? "scale(0.95)"
                            : adjustments.crop === "16:9"
                              ? "scale(0.9)"
                              : "none",
                      }}
                    />
                  ) : (
                    <img
                      src={
                        draft.kind === "mock"
                          ? draft.url
                          : draft.kind === "gif"
                            ? draft.url
                            : draft.previewUrl
                      }
                      alt="Selected Post Preview"
                      className={`w-full h-full transition-all duration-300`}
                      style={{
                        filter: getFilterString(),
                        objectFit: aspectFit ? "contain" : "cover",
                        transform:
                          adjustments.crop === "4:5"
                            ? "scale(0.95)"
                            : adjustments.crop === "16:9"
                              ? "scale(0.9)"
                              : "none",
                      }}
                    />
                  )}

                  {/* Paired Song Overlay Badge */}
                  {selectedSong && (
                    <div className="absolute top-4 left-4 bg-black/85 border border-fuchsia-500/40 rounded-full py-1.5 px-3.5 flex items-center gap-2 backdrop-blur-md animate-pulse shadow-[0_0_15px_rgba(217,70,239,0.4)] max-w-[80%]">
                      <Music className="size-3 text-fuchsia-400 shrink-0" />
                      <div className="text-[9px] font-bold truncate">
                        <span className="text-white">{selectedSong.title}</span>
                        <span className="text-zinc-500 mx-1">·</span>
                        <span className="text-fuchsia-300">{selectedSong.artist}</span>
                      </div>
                    </div>
                  )}

                  {/* Custom Text Overlay */}
                  {textOverlay.text && (
                    <div
                      className="absolute pointer-events-none select-none px-3 py-1.5 rounded-lg text-center"
                      style={{
                        left: `${textOverlay.x}%`,
                        top: `${textOverlay.y}%`,
                        transform: "translate(-50%, -50%)",
                        color: textOverlay.color,
                        fontSize: `${textOverlay.size}px`,
                        fontFamily:
                          textOverlay.font === "neon"
                            ? "system-ui, sans-serif"
                            : textOverlay.font === "classic"
                              ? "Georgia, serif"
                              : textOverlay.font === "future"
                                ? "monospace"
                                : "sans-serif",
                        fontWeight: textOverlay.font === "bold" ? "900" : "normal",
                        textShadow:
                          textOverlay.font === "neon"
                            ? `0 0 8px ${textOverlay.color}, 0 0 15px ${textOverlay.color}`
                            : "none",
                        backgroundColor: "rgba(0, 0, 0, 0.45)",
                        backdropFilter: "blur(4px)",
                        border: "1.5px solid rgba(255, 255, 255, 0.1)",
                        maxWidth: "85%",
                        wordBreak: "break-word",
                      }}
                    >
                      {textOverlay.text}
                    </div>
                  )}

                  {/* Fit/Cover Aspect Toggle */}
                  <button
                    type="button"
                    onClick={() => setAspectFit(!aspectFit)}
                    className="absolute bottom-3 left-3 size-8 rounded-full bg-black/80 border border-white/15 flex items-center justify-center text-white hover:bg-black hover:border-white/30 active:scale-95 transition-all z-10 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                    title="Toggle Zoom/Aspect"
                  >
                    <Compass className="size-4 text-fuchsia-400" />
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
                </div>
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
                    Choose a photo from the camera roll below, or click to load custom media.
                  </p>
                </div>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={imgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <input
              ref={vidRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />

            {/* Studio Workspace / Tab Controller (Filters, Adjust, Song, Text) */}
            <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-3 space-y-4">
              {/* Toolbar Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-950/80 rounded-xl border border-white/5">
                {[
                  { id: "FILTER", label: "FILTER", icon: Palette },
                  { id: "ADJUST", label: "ADJUST", icon: Sliders },
                  { id: "SONG", label: "SONG", icon: Music },
                  { id: "TEXT", label: "TEXT", icon: Type },
                ].map((tab) => {
                  const isAct = activeEditTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveEditTab(tab.id as any)}
                      className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all ${isAct ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 font-bold" : "text-zinc-500 hover:text-zinc-300"}`}
                    >
                      <tab.icon className="size-3.5" />
                      <span className="text-[9px] tracking-widest font-mono uppercase">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ==================== TAB: FILTER ==================== */}
              {activeEditTab === "FILTER" && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">
                      SELECT COLOR GRADE FILTER
                    </p>
                    <span className="text-[9px] text-fuchsia-400 font-mono">{activeFilter}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                    {FILTERS.map((f) => {
                      const isAct = activeFilter === f.name;
                      return (
                        <button
                          key={f.name}
                          type="button"
                          onClick={() => {
                            setActiveFilter(f.name);
                            if (navigator.vibrate) navigator.vibrate(5);
                          }}
                          className={`flex flex-col items-center gap-1.5 shrink-0 p-1 rounded-xl border transition-all ${isAct ? "border-fuchsia-500/40 bg-fuchsia-500/5 shadow-[0_0_10px_rgba(217,70,239,0.2)]" : "border-white/5 bg-zinc-950/40 hover:border-white/10"}`}
                        >
                          {/* Mini filter preview box */}
                          <div className="size-11 rounded-lg bg-zinc-800 overflow-hidden relative border border-white/5">
                            {draft && (
                              <img
                                src={
                                  draft.kind === "mock"
                                    ? draft.url
                                    : draft.kind === "gif"
                                      ? draft.url
                                      : draft.previewUrl
                                }
                                alt=""
                                className="w-full h-full object-cover"
                                style={{ filter: f.value }}
                              />
                            )}
                            <div className="absolute inset-0 bg-black/10" />
                          </div>
                          <span
                            className={`text-[9px] truncate max-w-[55px] font-mono leading-none ${isAct ? "text-fuchsia-400 font-bold" : "text-zinc-500"}`}
                          >
                            {f.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ==================== TAB: ADJUST ==================== */}
              {activeEditTab === "ADJUST" && (
                <div className="space-y-3 animate-fade-in">
                  {/* Slider option pickers */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar -mx-1 px-1">
                    {[
                      { id: "brightness", label: "Brightness", icon: Sun },
                      { id: "contrast", label: "Contrast", icon: Contrast },
                      { id: "fade", label: "Fade", icon: Droplet },
                      { id: "color", label: "Color", icon: Palette },
                      { id: "highlights", label: "Highlights", icon: Sparkles },
                      { id: "shadows", label: "Shadows", icon: Compass },
                      { id: "sharpen", label: "Sharpen", icon: Sliders },
                      { id: "crop", label: "Crop Ratio", icon: Crop },
                    ].map((opt) => {
                      const isAct = activeSlider === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setActiveSlider(opt.id as any)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all flex items-center gap-1 shrink-0 ${isAct ? "bg-fuchsia-500 text-white shadow-[0_0_8px_rgba(217,70,239,0.4)]" : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"}`}
                        >
                          <opt.icon className="size-3" /> {opt.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Slider View */}
                  {activeSlider !== "crop" ? (
                    <div className="space-y-1 p-2 bg-black/30 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono px-1">
                        <span className="capitalize">{activeSlider}</span>
                        <span className="text-fuchsia-400 font-bold">
                          {adjustments[activeSlider as keyof Adjustments]}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={activeSlider === "highlights" || activeSlider === "shadows" ? -100 : 0}
                        max={
                          activeSlider === "brightness" ||
                          activeSlider === "contrast" ||
                          activeSlider === "color"
                            ? 200
                            : 100
                        }
                        value={adjustments[activeSlider as keyof Adjustments] as number}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setAdjustments((prev) => ({ ...prev, [activeSlider]: val }));
                        }}
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1 p-1 bg-black/30 rounded-xl border border-white/5 text-center">
                      {(["original", "1:1", "4:5", "16:9"] as const).map((ratio) => {
                        const isSel = adjustments.crop === ratio;
                        return (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setAdjustments((prev) => ({ ...prev, crop: ratio }))}
                            className={`py-1 rounded-lg text-[10px] font-mono capitalize transition-all ${isSel ? "bg-fuchsia-500/20 text-fuchsia-400 font-bold border border-fuchsia-500/30" : "text-zinc-500 hover:text-zinc-300"}`}
                          >
                            {ratio}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TAB: SONG ==================== */}
              {activeEditTab === "SONG" && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 size-3 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Attach Tradio sound..."
                      value={songSearch}
                      onChange={(e) => setSongSearch(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-white/5 rounded-xl pl-7.5 pr-3 py-1.5 text-[10px] outline-none placeholder-zinc-500 text-zinc-100 font-mono"
                    />
                  </div>

                  <div className="space-y-1 max-h-[120px] overflow-y-auto no-scrollbar">
                    {filteredSongs.length > 0 ? (
                      filteredSongs.map((track) => {
                        const isAttached = selectedSong?.id === track.id;
                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => {
                              setSelectedSong(isAttached ? null : track);
                              if (navigator.vibrate) navigator.vibrate(10);
                            }}
                            className={`w-full flex items-center justify-between p-1.5 rounded-xl border transition-all text-left ${isAttached ? "border-fuchsia-500/30 bg-fuchsia-500/5" : "border-transparent bg-transparent hover:bg-white/5"}`}
                          >
                            <div className="flex items-center gap-2">
                              <img
                                src={track.cover}
                                alt=""
                                className="size-7 rounded object-cover"
                              />
                              <div>
                                <h4 className="text-[10px] font-bold text-white leading-tight">
                                  {track.title}
                                </h4>
                                <p className="text-[8px] text-zinc-500 leading-none">
                                  {track.artist}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 pr-1">
                              <span className="text-[8px] text-zinc-500 font-mono">
                                {track.duration}
                              </span>
                              <div
                                className={`size-4 rounded-full flex items-center justify-center border ${isAttached ? "bg-fuchsia-500 border-fuchsia-400" : "border-white/10"}`}
                              >
                                {isAttached && (
                                  <Check className="size-2.5 text-white stroke-[3.5]" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-[9px] text-zinc-500 text-center py-4 font-mono">
                        No sounds matching search
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ==================== TAB: TEXT ==================== */}
              {activeEditTab === "TEXT" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter overlay text..."
                      value={textOverlay.text}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, text: e.target.value.slice(0, 36) }))
                      }
                      className="flex-1 bg-zinc-950/80 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] outline-none placeholder-zinc-500 text-zinc-100 font-mono"
                    />
                    {textOverlay.text && (
                      <button
                        type="button"
                        onClick={() => setTextOverlay((prev) => ({ ...prev, text: "" }))}
                        className="size-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>

                  {textOverlay.text && (
                    <div className="space-y-3 p-2 bg-black/30 rounded-xl border border-white/5 space-y-2.5">
                      {/* Font selector */}
                      <div className="flex gap-1.5">
                        {(["neon", "classic", "future", "bold"] as const).map((font) => {
                          const isSel = textOverlay.font === font;
                          return (
                            <button
                              key={font}
                              type="button"
                              onClick={() => setTextOverlay((prev) => ({ ...prev, font }))}
                              className={`flex-1 py-1 rounded text-[9px] font-mono uppercase transition-all ${isSel ? "bg-fuchsia-500 text-white" : "bg-zinc-900 border border-white/5 text-zinc-400"}`}
                            >
                              {font}
                            </button>
                          );
                        })}
                      </div>

                      {/* Color dots picker */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-zinc-500 font-mono">TEXT COLOR</span>
                        <div className="flex gap-1.5">
                          {["#FFFFFF", "#F59E0B", "#F43F5E", "#D946EF", "#06B6D4"].map((color) => {
                            const isSel = textOverlay.color === color;
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setTextOverlay((prev) => ({ ...prev, color }))}
                                className={`size-4 rounded-full border transition-all ${isSel ? "scale-125 border-white ring-1 ring-fuchsia-500" : "border-transparent"}`}
                                style={{ backgroundColor: color }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Positioning Sliders */}
                      <div className="space-y-2 border-t border-white/5 pt-2">
                        <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono">
                          <span>HORIZONTAL X POSITION</span>
                          <span className="text-zinc-300">{textOverlay.x}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={90}
                          value={textOverlay.x}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTextOverlay((prev) => ({ ...prev, x: val }));
                          }}
                          className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                        />

                        <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono">
                          <span>VERTICAL Y POSITION</span>
                          <span className="text-zinc-300">{textOverlay.y}%</span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={90}
                          value={textOverlay.y}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTextOverlay((prev) => ({ ...prev, y: val }));
                          }}
                          className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                        />

                        <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono">
                          <span>FONT OVERLAY SIZE</span>
                          <span className="text-zinc-300">{textOverlay.size}px</span>
                        </div>
                        <input
                          type="range"
                          min={12}
                          max={36}
                          value={textOverlay.size}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setTextOverlay((prev) => ({ ...prev, size: val }));
                          }}
                          className="w-full h-1 bg-zinc-800 rounded appearance-none cursor-pointer accent-fuchsia-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Device Gallery / Recent Media Grid (Bottom selector) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 px-1">
                  <span className="text-xs font-black text-white tracking-wide">CAMERA ROLL</span>
                  <span className="text-[8px] bg-white/5 border border-white/8 text-zinc-400 px-1.5 py-0.5 rounded font-mono select-none">
                    Recent ▾
                  </span>
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
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 border-2 border-fuchsia-500" />
                      )}

                      <div
                        className={`absolute top-1 right-1 size-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-fuchsia-500 border-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.5)] scale-110"
                            : "bg-black/30 border-white/25"
                        }`}
                      >
                        {isSelected && <Check className="size-2 text-white stroke-[3.5]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== STEP 2: SHARE SCREEN ==================== */}
        {step === "SHARE" && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-1">
              <button
                type="button"
                onClick={() => setStep("EDIT")}
                className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <div className="text-center">
                <h2 className="text-xs font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  SHARE DETAILS
                </h2>
                <p className="text-[9px] text-amber-400 font-mono tracking-widest mt-0.5">
                  META SETTINGS
                </p>
              </div>
              <button
                type="button"
                onClick={handlePost}
                disabled={posting}
                className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.35)] hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0 active:scale-95"
              >
                {posting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Check className="size-3 stroke-[3]" />
                )}{" "}
                SHARE
              </button>
            </div>

            {/* Composer mini card & Caption area */}
            <div className="p-3 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="size-14 rounded-xl overflow-hidden bg-zinc-900 shrink-0 relative border border-white/10">
                  {draft && (
                    <img
                      src={
                        draft.kind === "mock"
                          ? draft.url
                          : draft.kind === "gif"
                            ? draft.url
                            : draft.previewUrl
                      }
                      alt=""
                      className="w-full h-full object-cover"
                      style={{ filter: getFilterString() }}
                    />
                  )}
                  {selectedSong && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/75 py-0.5 text-center">
                      <p className="text-[6px] text-fuchsia-400 font-mono truncate font-black px-0.5 uppercase">
                        MUSIC ATTACHED
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                    placeholder="Add caption, tags, thoughts..."
                    rows={2}
                    maxLength={MAX_CAPTION}
                    className="w-full bg-transparent resize-none outline-none text-xs text-zinc-100 placeholder-zinc-500 leading-normal"
                  />
                  <div className="flex items-center justify-between text-[9px] text-zinc-500 mt-1 font-mono">
                    <span>
                      {caption.length} / {MAX_CAPTION}
                    </span>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setAudOpen((s) => !s)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                      >
                        <aud.icon className="size-2.5 text-amber-400" /> {aud.label}{" "}
                        <ChevronDown className="size-2" />
                      </button>
                      {audOpen && (
                        <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-zinc-900 border border-white/10 shadow-2xl p-1 z-30">
                          {AUDIENCES.map((a) => (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => {
                                setAudience(a.id);
                                setAudOpen(false);
                              }}
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
                <p className="text-[9px] font-bold text-zinc-500 tracking-wider mb-2 uppercase">
                  IMMERSIVE HASHTAGS
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                  {QUICK_HASHTAGS.map((tag) => (
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

            {/* Tag People Screen Section */}
            <div className="p-3 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Tag className="size-3.5 text-fuchsia-400" />
                  <span className="text-[10px] font-black tracking-wider text-white uppercase">
                    TAG PEOPLE
                  </span>
                </div>
                {taggedPeople.length > 0 && (
                  <span className="text-[8px] font-mono text-fuchsia-400 bg-fuchsia-500/5 px-2 py-0.5 rounded border border-fuchsia-500/10">
                    {taggedPeople.length} TAGGED
                  </span>
                )}
              </div>

              <div className="relative">
                <Search className="absolute left-2 top-2 size-3 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search creators to tag..."
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  className="w-full bg-zinc-950/80 border border-white/5 rounded-xl pl-7.5 pr-3 py-1.5 text-[9px] outline-none placeholder-zinc-500 text-zinc-100 font-mono"
                />
              </div>

              <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
                {filteredCreatorsForTag.map((c) => {
                  const isTagged = taggedPeople.includes(c.name);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleTagPerson(c.name)}
                      className="flex flex-col items-center gap-1 shrink-0 p-1 rounded-xl transition-all"
                    >
                      <div className="relative">
                        <img
                          src={c.avatar as unknown as string}
                          alt=""
                          className={`size-9 rounded-full object-cover border-2 transition-all ${isTagged ? "border-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.4)]" : "border-white/10"}`}
                        />
                        {isTagged && (
                          <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-fuchsia-500 text-white flex items-center justify-center border border-zinc-950">
                            <Check className="size-2 stroke-[3.5]" />
                          </span>
                        )}
                      </div>
                      <span className="text-[8px] text-zinc-400 font-mono truncate max-w-[50px]">
                        {c.name.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Location Screen Section */}
            <div className="p-3 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <MapPin className="size-3.5 text-amber-400" />
                <span className="text-[10px] font-black tracking-wider text-white uppercase font-mono">
                  ADD LOCATION
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type custom location..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 bg-zinc-950/80 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] outline-none placeholder-zinc-500 text-zinc-100 font-mono"
                />
                {location && (
                  <button
                    type="button"
                    onClick={() => setLocation("")}
                    className="size-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Location presets */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
                {PRESET_LOCATIONS.map((loc) => {
                  const isSel = location === loc;
                  return (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`px-2.5 py-1 rounded-full text-[9px] font-mono shrink-0 transition-all ${isSel ? "bg-amber-400/20 text-amber-300 border border-amber-400/30" : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"}`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message destinations and Recipient panel */}
            {activeDest === "MESSAGE" && (
              <div className="p-3 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase">
                    Select DM Recipient
                  </p>
                  <span className="text-[9px] text-fuchsia-400 font-mono tracking-widest">
                    {selectedRecipients.length} SELECTED
                  </span>
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
                            <img
                              src={rec.avatar}
                              alt={rec.name}
                              className="size-full rounded-full object-cover"
                            />
                          </div>
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 size-4 rounded-full bg-fuchsia-500 text-white flex items-center justify-center border border-zinc-950 shadow">
                              <Check className="size-2.5 stroke-[3.5]" />
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[10px] truncate max-w-[60px] transition-colors ${isSelected ? "text-fuchsia-400 font-bold" : "text-zinc-500 group-hover:text-zinc-300"}`}
                        >
                          {rec.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Posting Type target controller */}
            <div className="border-t border-white/5 pt-3">
              <p className="text-[9px] font-bold text-zinc-500 tracking-wider mb-2 text-center uppercase font-mono">
                POSTING TARGET CHANNELS
              </p>
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
                      <span
                        className={`text-[11px] font-black tracking-wider transition-all ${isSel ? "text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-400 scale-105" : "text-zinc-500 hover:text-zinc-300"}`}
                      >
                        {dest.label}
                      </span>
                      <span className="text-[8px] text-zinc-500 mt-0.5 truncate font-mono scale-[0.85] opacity-65">
                        {dest.key === "FEED"
                          ? "Home Feed"
                          : dest.key === "PROFILE"
                            ? "Wall"
                            : dest.key === "MESSAGE"
                              ? "DM Inbox"
                              : "Stories"}
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
        )}
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
            gifTitle: gif.title ?? null,
          });
          if (navigator.vibrate) navigator.vibrate(10);
        }}
      />
    </div>
  );
}
