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
  Shield,
  Share2,
  Copy,
  BrainCircuit,
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
  | { kind: "uploaded_media"; url: string; mediaType: "image" | "video"; durationMs?: number }
  | {
      kind: "gif";
      url: string;
      gifFwdId: string | null;
      gifPosterUrl: string | null;
      gifTitle: string | null;
    }
  | { kind: "mock"; url: string; label: string }
  | null;

interface CameraRollItem {
  id: string;
  kind: "image" | "video";
  url: string;
  file?: File;
  label: string;
  durationMs?: number;
}

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

const FILTERS = [
  { name: "Normal", value: "" },
  { name: "Clarendon", value: "contrast(1.25) saturate(1.35)" },
  { name: "Gingham", value: "brightness(1.05) hue-rotate(-10deg) saturate(0.85)" },
  { name: "Juno", value: "contrast(1.15) saturate(1.25) sepia(0.08)" },
  { name: "Ludwig", value: "brightness(1.05) contrast(1.05) saturate(1.1) sepia(0.05)" },
  { name: "Lofi", value: "contrast(1.35) saturate(1.4)" },
  { name: "Inkwell", value: "grayscale(1) contrast(1.2) brightness(1.05)" },
  { name: "Cyberpunk", value: "hue-rotate(55deg) saturate(1.7) contrast(1.15) brightness(1.1)" },
  { name: "Atlanta Heat", value: "saturate(1.6) contrast(1.2) sepia(0.12) brightness(0.95)" },
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

type StepType = "SELECT_TYPE" | "EDIT" | "PREVIEW";
type PostDestinationType = "FEED_PROFILE" | "INBOX_MESSAGE";

export function Composer() {
  const navigate = useNavigate();
  const { posts, addPost } = useFeed();
  const { isGuest, user } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();
  const { threads, send: sendMessage, sendMedia } = useMessages();
  const avatarUrl = user?.avatar || currentUser.avatar;

  // Step state
  const [step, setStep] = useState<StepType>("SELECT_TYPE");
  const [postType, setPostType] = useState<PostDestinationType>("FEED_PROFILE");

  // Permission Flow states
  const [hasGalleryPermission, setHasGalleryPermission] = useState<boolean | null>(null);
  const [showNativePermissionModal, setShowPermissionModal] = useState(false);

  // Load saved permission from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gallery_permission_granted") === "true";
    setHasGalleryPermission(saved);
  }, []);

  // Studio / Edit Tab State
  const [activeEditTab, setActiveEditTab] = useState<"FILTER" | "ADJUST" | "SONG" | "TEXT">(
    "FILTER",
  );

  // Media Draft and Gallery state
  const [draft, setDraft] = useState<Draft>(null);
  const [importedFiles, setImportedFiles] = useState<CameraRollItem[]>([]);
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
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const userPostedMedia: CameraRollItem[] = posts
    .filter((p) => p.media && p.mediaType && p.mediaType !== "gif")
    .map((p) => ({
      id: p.id,
      kind: p.mediaType === "video" ? ("video" as const) : ("image" as const),
      url: p.media!,
      label: p.text || "Uploaded Post",
    }));

  const cameraRoll = [...importedFiles, ...userPostedMedia];

  const isDraftVideo = () => {
    if (!draft) return false;
    if (draft.kind === "video") return true;
    if (draft.kind === "uploaded_media" && draft.mediaType === "video") return true;
    return false;
  };

  const getDraftPreviewUrl = () => {
    if (!draft) return "";
    if (draft.kind === "image" || draft.kind === "video") {
      return draft.previewUrl;
    }
    if (draft.kind === "uploaded_media" || draft.kind === "gif" || draft.kind === "mock") {
      return draft.url;
    }
    return "";
  };

  // AI Prescribe Mood Engine states
  const [aiScanning, setAiScanning] = useState(false);
  const [aiScanned, setAiScanned] = useState(false);
  const [aiMood, setAiMood] = useState("");
  const [aiTargetGroup, setAiGroup] = useState("");
  const [aiProgressText, setAiProgressText] = useState("");

  // Trigger AI Scanning when transitioning to PREVIEW step
  useEffect(() => {
    if (step === "PREVIEW" && !aiScanned && draft) {
      triggerAiScan();
    }
  }, [step]);

  const triggerAiScan = () => {
    setAiScanning(true);
    setAiScanned(false);
    const steps = [
      "AI: Scanning image density & hue layers...",
      "AI: Mapping sonic coordinates with Tradio API...",
      "AI: Formulating mood prescription coordinates...",
      "AI: Finalizing optimal listener routing group...",
    ];

    let current = 0;
    setAiProgressText(steps[0]);

    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setAiProgressText(steps[current]);
      } else {
        clearInterval(interval);
        // Determine logical mood based on filter & song selected
        let moodName = "Vibrant & Inspired";
        let groupName = "Global Art & Music Creators";

        if (selectedSong) {
          if (selectedSong.title.includes("Trance")) {
            moodName = "Epic Trance Peak Hype";
            groupName = "Cyber-Trance Seekers";
          } else if (selectedSong.title.includes("After Hours")) {
            moodName = "Atlanta Heat Chill-Out";
            groupName = "ATL Bass & Hip-Hop Heads";
          } else if (selectedSong.title.includes("Liquid")) {
            moodName = "Sub-Zero Ambient Chill";
            groupName = "Ambient Trance Chillers";
          } else if (selectedSong.title.includes("Neon")) {
            moodName = "Neon Cyber Hype";
            groupName = "Retro Synthwave Riders";
          } else {
            moodName = "Late Night Reflective Wave";
            groupName = "Afterhours Melodic Seekers";
          }
        } else if (activeFilter === "Cyberpunk") {
          moodName = "Neon Cyber Hype";
          groupName = "Cyberpunk Hackers & Ravers";
        } else if (activeFilter === "Inkwell") {
          moodName = "Noir Deep Reflection";
          groupName = "Indie B&W Film Enthusiasts";
        } else if (activeFilter === "Atlanta Heat") {
          moodName = "Hot Atlanta Club Motivation";
          groupName = "Late Night Party Seekers";
        } else if (activeFilter === "Lofi") {
          moodName = "Chill Lofi Resonance";
          groupName = "Vibe Lounge Chillers";
        }

        setAiMood(moodName);
        setAiGroup(groupName);
        setAiScanning(false);
        setAiScanned(true);
        toast.success(`AI Scan Complete: Prescribing as ${moodName}!`);
      }
    }, 700);
  };

  const handleGrantPermission = () => {
    setShowPermissionModal(true);
  };

  const selectNativePermission = (allowed: boolean) => {
    setShowPermissionModal(false);
    if (allowed) {
      localStorage.setItem("gallery_permission_granted", "true");
      setHasGalleryPermission(true);
      if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
      toast.success("Gallery permissions captured and saved for future posts!");
    } else {
      toast.error("Gallery access is required to view your camera roll.");
    }
  };

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
    setAiScanned(false);
    setAiMood("");
    setAiGroup("");
  };

  const handleSelectCameraRollItem = (item: CameraRollItem) => {
    clearDraft();
    if (item.file) {
      setDraft({
        kind: item.kind,
        file: item.file,
        previewUrl: item.url,
        durationMs: item.durationMs,
      });
    } else {
      setDraft({
        kind: "uploaded_media",
        url: item.url,
        mediaType: item.kind,
        durationMs: item.durationMs,
      });
    }
    if (navigator.vibrate) navigator.vibrate(8);
    // Auto progress to Edit screen
    setStep("EDIT");
  };

  const handleImportFiles = async (files: FileList | null) => {
    if (!files) return;
    const newItems: CameraRollItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateMediaFile(file);
      if (!validation.ok) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }

      let durationMs: number | undefined;
      if (validation.kind === "video") {
        try {
          durationMs = await getVideoDurationMs(file);
          if (durationMs > MAX_VIDEO_DURATION_MS) {
            toast.error(`${file.name} is longer than 30 seconds.`);
            continue;
          }
        } catch {
          toast.error(`Could not read duration for ${file.name}.`);
          continue;
        }
      }

      newItems.push({
        id: `imported-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 9)}`,
        kind: validation.kind,
        url: URL.createObjectURL(file),
        file,
        label: file.name,
        durationMs,
      });
    }

    if (newItems.length > 0) {
      setImportedFiles((prev) => [...newItems, ...prev]);
      toast.success(`Successfully imported ${newItems.length} items to Camera Roll!`);
    }
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
        setStep("EDIT");
      } catch {
        toast.error("Could not read that video.");
      }
      return;
    }
    clearDraft();
    setDraft({ kind: "image", file: f, previewUrl: URL.createObjectURL(f) });
    setStep("EDIT");
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

    // Sliders adjustments math
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

    if (postType === "INBOX_MESSAGE" && selectedRecipients.length === 0) {
      toast.error("Please select at least one recipient to send your inbox message.");
      return;
    }

    setPosting(true);
    try {
      let mediaUrlToPost = "";

      if (draft.kind === "mock" || draft.kind === "gif" || draft.kind === "uploaded_media") {
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
        draft.kind === "video" || (draft.kind === "uploaded_media" && draft.mediaType === "video")
          ? "video"
          : draft.kind === "gif"
            ? "gif"
            : "image";

      let finalCaption = caption.trim();
      if (selectedSong) {
        finalCaption += ` \n\n🎵 attached sound: ${selectedSong.title} by ${selectedSong.artist}`;
      }
      if (location) {
        finalCaption += ` \n📍 Location: ${location}`;
      }
      if (taggedPeople.length > 0) {
        finalCaption += ` \n👥 Tagged: ${taggedPeople.join(", ")}`;
      }
      if (aiMood) {
        finalCaption += ` \n🧠 Prescribed AI Mood: ${aiMood}`;
      }

      if (postType === "FEED_PROFILE") {
        addPost({
          text: finalCaption,
          audience,
          media: mediaUrlToPost,
          mediaType: mediaTypeToPost,
          sourceType: draft.kind === "gif" ? "fwd" : "trey",
          gifFwdId: draft.kind === "gif" ? draft.gifFwdId : null,
          gifPosterUrl: draft.kind === "gif" ? draft.gifPosterUrl : null,
          gifTitle: draft.kind === "gif" ? draft.gifTitle : null,
          durationMs:
            draft.kind === "video" || draft.kind === "uploaded_media"
              ? draft.durationMs
              : undefined,
        });
        toast.success(`Creative successfully published & prescribed to followers!`);
        navigate({ to: "/" });
      } else {
        // Send as inbox message to all selected peers
        for (const recipientId of selectedRecipients) {
          if (draft.kind !== "mock" && draft.kind !== "gif" && draft.kind !== "uploaded_media") {
            await sendMedia(recipientId, draft.file);
            if (finalCaption) {
              await sendMessage(recipientId, finalCaption);
            }
          } else {
            const bodyText = finalCaption
              ? `${finalCaption}\n\n📸 Creative Attachment: ${mediaUrlToPost}`
              : `📸 Creative Attachment: ${mediaUrlToPost}`;
            await sendMessage(recipientId, bodyText);
          }
        }
        toast.success(`Creative message sent to ${selectedRecipients.length} chat threads!`);
        navigate({ to: "/inbox" });
      }
    } catch (err) {
      console.error("Post creation error:", err);
      toast.error("Creative upload/send failed. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleCopySmartLink = () => {
    const randomHash = Math.random().toString(36).substring(2, 8);
    const mockLink = `https://treytv.link/p/${randomHash}`;
    navigator.clipboard.writeText(mockLink);
    toast.success("Universal Smart Link copied to clipboard!");
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
      {/* Embedded Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes laser-sweep {
          0%, 100% { top: 0%; }
          50% { top: 100%; }
        }
        .animate-scanner {
          animation: laser-sweep 2.2s ease-in-out infinite;
        }
        @keyframes scan-progress-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: scan-progress-bar 2.8s linear infinite;
        }
      `}} />

      {/* iOS-Style Native Permission Dialog Box */}
      {showNativePermissionModal && (
        <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-[280px] rounded-3xl bg-[#1C1C1E] border border-white/10 text-center text-white overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-5 space-y-2">
              <div className="size-12 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 mx-auto flex items-center justify-center mb-1">
                <ImageIcon className="size-6 text-fuchsia-400" />
              </div>
              <h3 className="text-sm font-black tracking-wide leading-snug">
                “Trey TV” Would Like to Access Your Photos
              </h3>
              <p className="text-[11px] text-[#8E8E93] leading-normal">
                Trey TV requires gallery access to browse recent saves, apply filters, and scan
                prescription moods using our AI engine.
              </p>
            </div>
            <div className="border-t border-[#38383A] flex flex-col divide-y divide-[#38383A] text-xs">
              <button
                type="button"
                onClick={() => selectNativePermission(true)}
                className="w-full py-3 text-fuchsia-400 font-bold active:bg-white/5 transition-colors"
              >
                Allow Access to All Photos
              </button>
              <button
                type="button"
                onClick={() => selectNativePermission(true)}
                className="w-full py-3 text-blue-400 active:bg-white/5 transition-colors"
              >
                Select Photos...
              </button>
              <button
                type="button"
                onClick={() => selectNativePermission(false)}
                className="w-full py-3 text-red-400 active:bg-white/5 transition-colors"
              >
                Don't Allow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Suite Container Card */}
      <div className="mobile-edge-card rounded-none sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-b from-[#0B0D1B] to-[#040508] border-[0.5px] border-white/12 backdrop-blur-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] relative overflow-hidden space-y-4">
        {/* ==================== SCREEN 1: SELECT TYPE & GALLERY ==================== */}
        {step === "SELECT_TYPE" && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <button
                type="button"
                onClick={() => navigate({ to: "/" })}
                className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" /> Cancel
              </button>
              <div className="text-center">
                <h2 className="text-xs font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  NEW CREATIVE
                </h2>
                <p className="text-[9px] text-fuchsia-400 font-mono tracking-widest mt-0.5">
                  CHOOSE DESTINATION
                </p>
              </div>
              <div className="w-12" /> {/* Spacer */}
            </div>

            {/* Destination Selection Cards */}
            <div className="space-y-2">
              <label className="text-[9px] font-black tracking-widest text-zinc-500 block uppercase font-mono">
                SELECT POSTING TYPE
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Option 1: Feed & Profile */}
                <button
                  type="button"
                  onClick={() => {
                    setPostType("FEED_PROFILE");
                    if (navigator.vibrate) navigator.vibrate(5);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-28 ${
                    postType === "FEED_PROFILE"
                      ? "border-fuchsia-500/40 bg-fuchsia-500/5 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
                      : "border-white/5 bg-zinc-950/40 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center border transition-colors ${
                        postType === "FEED_PROFILE"
                          ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400 animate-pulse"
                          : "bg-zinc-900 border-white/5 text-zinc-500"
                      }`}
                    >
                      <Globe className="size-4" />
                    </div>
                    {postType === "FEED_PROFILE" && (
                      <span className="size-4 rounded-full bg-fuchsia-500 border border-fuchsia-400 flex items-center justify-center">
                        <Check className="size-2 text-white stroke-[3.5]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white tracking-wide">
                      Feed & Profile Post
                    </h3>
                    <p className="text-[9px] text-zinc-400 leading-normal mt-0.5">
                      Share creatives publicly to the home stream & user timeline.
                    </p>
                  </div>
                </button>

                {/* Option 2: Inbox Message */}
                <button
                  type="button"
                  onClick={() => {
                    setPostType("INBOX_MESSAGE");
                    if (navigator.vibrate) navigator.vibrate(5);
                  }}
                  className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-28 ${
                    postType === "INBOX_MESSAGE"
                      ? "border-fuchsia-500/40 bg-fuchsia-500/5 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
                      : "border-white/5 bg-zinc-950/40 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className={`size-8 rounded-xl flex items-center justify-center border transition-colors ${
                        postType === "INBOX_MESSAGE"
                          ? "bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400 animate-pulse"
                          : "bg-zinc-900 border-white/5 text-zinc-500"
                      }`}
                    >
                      <MessageSquare className="size-4" />
                    </div>
                    {postType === "INBOX_MESSAGE" && (
                      <span className="size-4 rounded-full bg-fuchsia-500 border border-fuchsia-400 flex items-center justify-center">
                        <Check className="size-2 text-white stroke-[3.5]" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white tracking-wide">
                      Inbox DM Message
                    </h3>
                    <p className="text-[9px] text-zinc-400 leading-normal mt-0.5">
                      Deliver private media messages directly to chosen friends & followers.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Direct Message Recipient Panel for Inbox path */}
            {postType === "INBOX_MESSAGE" && (
              <div className="p-3 bg-zinc-950/50 rounded-2xl border border-white/5 space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono">
                    Select DM Recipient
                  </p>
                  <span className="text-[9px] text-fuchsia-400 font-mono">
                    {selectedRecipients.length} SELECTED
                  </span>
                </div>
                <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
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
                            className={`size-10 rounded-full overflow-hidden p-0.5 transition-all duration-300 ${
                              isSelected
                                ? "ring-2 ring-fuchsia-500 scale-105 shadow-[0_0_10px_rgba(217,70,239,0.5)]"
                                : "ring-1 ring-white/10"
                            }`}
                          >
                            <img
                              src={rec.avatar}
                              alt={rec.name}
                              className="size-full rounded-full object-cover"
                            />
                          </div>
                          {isSelected && (
                            <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-fuchsia-500 text-white flex items-center justify-center border border-zinc-950">
                              <Check className="size-2 stroke-[3.5]" />
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[9px] truncate max-w-[55px] font-mono ${
                            isSelected ? "text-fuchsia-400 font-bold" : "text-zinc-500"
                          }`}
                        >
                          {rec.name.split(" ")[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom half: Permissions or Photo Grid Recent Saves */}
            <div className="border-t border-white/5 pt-4 space-y-3">
              {hasGalleryPermission === false ? (
                /* Permission Gate Box */
                <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 text-center relative overflow-hidden">
                  <div className="absolute -inset-4 bg-gradient-to-tr from-fuchsia-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />
                  <div className="size-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto mb-3 shadow-[0_8px_24px_rgba(0,0,0,0.5)] relative">
                    <Shield className="size-6 text-fuchsia-400 animate-pulse" />
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-fuchsia-500 to-amber-500 rounded-b-2xl" />
                  </div>
                  <h3 className="text-xs font-black text-white tracking-wide">
                    Browse Device Photo Gallery
                  </h3>
                  <p className="text-[10px] text-zinc-400 max-w-[240px] leading-normal mx-auto mt-1">
                    Grant gallery permissions to display your most recent saves, pair them with
                    Tradio, and analyze prescription mood coordinates.
                  </p>
                  <button
                    type="button"
                    onClick={handleGrantPermission}
                    className="mt-4 px-6 py-2 rounded-full text-xs font-black tracking-wider bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white hover:opacity-95 active:scale-95 transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                  >
                    Grant Gallery Permission
                  </button>
                </div>
              ) : (
                /* Recent Saves Photo Grid */
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-white tracking-wide font-mono uppercase">
                        CAMERA ROLL
                      </span>
                      <span className="text-[8px] bg-white/5 border border-white/8 text-zinc-400 px-1.5 py-0.5 rounded font-mono select-none">
                        Recent Saves ▾
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => imgRef.current?.click()}
                        className="text-[9px] font-black tracking-wider text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 px-2 py-1 rounded-lg border border-fuchsia-500/15 transition-all active:scale-95 select-none"
                      >
                        <FolderPlus className="size-3" /> CHOOSE DEVICE FILE
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById("camera-roll-import")?.click()}
                        className="text-[9px] font-black tracking-wider text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/5 hover:bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/15 transition-all active:scale-95 select-none"
                      >
                        <FolderPlus className="size-3" /> IMPORT TO CAMERA ROLL
                      </button>
                    </div>
                  </div>

                  {cameraRoll.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-950/20">
                      <ImageIcon className="size-8 text-zinc-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-zinc-400">Your Camera Roll is Empty</p>
                      <p className="text-[10px] text-zinc-500 max-w-[220px] mx-auto mt-1">
                        Import photos or video clips from your device or create a post to build your camera roll history.
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById("camera-roll-import")?.click()}
                        className="mt-3 px-4 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-[10px] font-black tracking-wider transition-all"
                      >
                        IMPORT FILES
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-1.5 rounded-2xl bg-zinc-950/40 p-1 border border-white/5">
                      {cameraRoll.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSelectCameraRollItem(item)}
                          className="aspect-square relative overflow-hidden group active:scale-95 transition-transform rounded-xl border border-white/5 bg-zinc-900"
                        >
                          {item.kind === "video" ? (
                            <div className="w-full h-full relative">
                              <video
                                src={item.url}
                                className="w-full h-full object-cover"
                                muted
                                playsInline
                              />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play className="size-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] fill-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Hidden File Inputs */}
            <input
              id="camera-roll-import"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={(e) => handleImportFiles(e.target.files)}
            />
            <input
              ref={imgRef}
              type="file"
              accept="image/*,video/*"
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
          </div>
        )}

        {/* ==================== SCREEN 2: EDIT STUDIO ==================== */}
        {step === "EDIT" && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <button
                type="button"
                onClick={() => setStep("SELECT_TYPE")}
                className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <div className="text-center">
                <h2 className="text-xs font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  EDIT STUDIO
                </h2>
                <p className="text-[9px] text-fuchsia-400 font-mono tracking-widest mt-0.5">
                  APPLY EFFECTS
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep("PREVIEW")}
                className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider bg-gradient-to-r from-fuchsia-500 to-amber-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.35)] hover:opacity-95 transition-all flex items-center gap-1 shrink-0 active:scale-95"
              >
                NEXT <ChevronRight className="size-3" />
              </button>
            </div>

            {/* Media Canvas Area */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/5 via-transparent to-transparent opacity-40 pointer-events-none" />

              {draft ? (
                <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                  {isDraftVideo() ? (
                    <video
                      src={getDraftPreviewUrl()}
                      controls
                      className="w-full h-full transition-all duration-300"
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
                      src={getDraftPreviewUrl()}
                      alt="Selected Post Preview"
                      className="w-full h-full transition-all duration-300"
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
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-xs font-bold text-white">No Creative Selected</h3>
                </div>
              )}
            </div>

            {/* Workspace Tab Content */}
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
                      className={`flex flex-col items-center gap-1 py-1.5 rounded-lg transition-all ${
                        isAct
                          ? "bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 font-bold"
                          : "text-zinc-500 hover:text-zinc-300"
                      }`}
                    >
                      <tab.icon className="size-3.5" />
                      <span className="text-[9px] tracking-widest font-mono uppercase">
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* FILTER VIEW */}
              {activeEditTab === "FILTER" && (
                <div className="space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-[9px] font-bold text-zinc-400 tracking-wider uppercase font-mono">
                      COLOR GRADE FILTER
                    </p>
                    <span className="text-[9px] text-fuchsia-400 font-mono">{activeFilter}</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                          className={`flex flex-col items-center gap-1.5 shrink-0 p-1 rounded-xl border transition-all ${
                            isAct
                              ? "border-fuchsia-500/40 bg-fuchsia-500/5 shadow-[0_0_10px_rgba(217,70,239,0.2)]"
                              : "border-white/5 bg-zinc-950/40 hover:border-white/10"
                          }`}
                        >
                          <div className="size-11 rounded-lg bg-zinc-800 overflow-hidden relative border border-white/5">
                            {draft && (
                              <img
                                src={getDraftPreviewUrl()}
                                alt=""
                                className="w-full h-full object-cover"
                                style={{ filter: f.value }}
                              />
                            )}
                          </div>
                          <span
                            className={`text-[9px] truncate max-w-[55px] font-mono leading-none ${
                              isAct ? "text-fuchsia-400 font-bold" : "text-zinc-500"
                            }`}
                          >
                            {f.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ADJUST VIEW */}
              {activeEditTab === "ADJUST" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
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
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono transition-all flex items-center gap-1 shrink-0 ${
                            isAct
                              ? "bg-fuchsia-500 text-white shadow-[0_0_8px_rgba(217,70,239,0.4)]"
                              : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          <opt.icon className="size-3" /> {opt.label}
                        </button>
                      );
                    })}
                  </div>

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
                    <div className="grid grid-cols-4 gap-1 p-1 bg-black/30 rounded-xl border border-white/5 text-center animate-fade-in">
                      {(["original", "1:1", "4:5", "16:9"] as const).map((ratio) => {
                        const isSel = adjustments.crop === ratio;
                        return (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setAdjustments((prev) => ({ ...prev, crop: ratio }))}
                            className={`py-1 rounded-lg text-[10px] font-mono capitalize transition-all ${
                              isSel
                                ? "bg-fuchsia-500/20 text-fuchsia-400 font-bold border border-fuchsia-500/30"
                                : "text-zinc-500 hover:text-zinc-300"
                            }`}
                          >
                            {ratio}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* SONG VIEW */}
              {activeEditTab === "SONG" && (
                <div className="space-y-2.5 animate-fade-in">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 size-3 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="Attach TRadio sound..."
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
                            className={`w-full flex items-center justify-between p-1.5 rounded-xl border transition-all text-left ${
                              isAttached ? "border-fuchsia-500/30 bg-fuchsia-500/5" : "border-transparent bg-transparent hover:bg-white/5"
                            }`}
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
                                className={`size-4 rounded-full flex items-center justify-center border ${
                                  isAttached ? "bg-fuchsia-500 border-fuchsia-400" : "border-white/10"
                                }`}
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

              {/* TEXT VIEW */}
              {activeEditTab === "TEXT" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type custom text overlay..."
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
                              className={`flex-1 py-1 rounded text-[9px] font-mono uppercase transition-all ${
                                isSel ? "bg-fuchsia-500 text-white" : "bg-zinc-900 border border-white/5 text-zinc-400"
                              }`}
                            >
                              {font}
                            </button>
                          );
                        })}
                      </div>

                      {/* Color dots picker */}
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-zinc-500 font-mono">COLOR</span>
                        <div className="flex gap-1.5">
                          {["#FFFFFF", "#F59E0B", "#F43F5E", "#D946EF", "#06B6D4"].map((color) => {
                            const isSel = textOverlay.color === color;
                            return (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setTextOverlay((prev) => ({ ...prev, color }))}
                                className={`size-4 rounded-full border transition-all ${
                                  isSel ? "scale-125 border-white ring-1 ring-fuchsia-500" : "border-transparent"
                                }`}
                                style={{ backgroundColor: color }}
                              />
                            );
                          })}
                        </div>
                      </div>

                      {/* Position & Size controls */}
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
                          <span>SIZE</span>
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
          </div>
        )}

        {/* ==================== SCREEN 3: PREVIEW & POST (AI SCANNING) ==================== */}
        {step === "PREVIEW" && (
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <button
                type="button"
                onClick={() => setStep("EDIT")}
                className="text-zinc-400 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <div className="text-center">
                <h2 className="text-xs font-black tracking-[0.25em] text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
                  FINAL PREVIEW
                </h2>
                <p className="text-[9px] text-amber-400 font-mono tracking-widest mt-0.5">
                  PRESCRIBE & SHARE
                </p>
              </div>
              <button
                type="button"
                onClick={handlePost}
                disabled={posting || aiScanning}
                className="px-4 py-1.5 rounded-full text-[11px] font-black tracking-wider bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 text-white shadow-[0_0_15px_rgba(217,70,239,0.35)] hover:opacity-95 disabled:opacity-50 transition-all flex items-center gap-1 shrink-0 active:scale-95"
              >
                {posting ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Check className="size-3 stroke-[3]" />
                )}{" "}
                {postType === "FEED_PROFILE" ? "POST" : "SEND DM"}
              </button>
            </div>

            {/* Split Screen layout: Left is Visual, Right is metadata/scan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Visual mini-render with active edits */}
              <div className="space-y-2.5">
                <label className="text-[9px] font-black tracking-widest text-zinc-500 block uppercase font-mono">
                  CREATIVE COMPOSITION
                </label>
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black/60 border border-white/10 shadow-xl">
                  {draft && (
                    <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                      {isDraftVideo() ? (
                        <video
                          src={getDraftPreviewUrl()}
                          className="w-full h-full object-cover"
                          controls
                          muted
                          playsInline
                          style={{ filter: getFilterString() }}
                        />
                      ) : (
                        <img
                          src={getDraftPreviewUrl()}
                          alt="Final preview"
                          className="w-full h-full object-cover transition-all"
                          style={{ filter: getFilterString() }}
                        />
                      )}

                      {/* Laser scanner line when AI scanning is active */}
                      {aiScanning && (
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-amber-400 shadow-[0_0_15px_#d946ef] animate-scanner z-30" />
                      )}

                      {/* Paired Song Overlay Badge */}
                      {selectedSong && (
                        <div className="absolute top-3 left-3 bg-black/85 border border-fuchsia-500/40 rounded-full py-1 px-3 flex items-center gap-1.5 backdrop-blur-md">
                          <Music className="size-2.5 text-fuchsia-400 shrink-0" />
                          <div className="text-[8px] font-bold truncate max-w-[120px]">
                            <span className="text-white">{selectedSong.title}</span>
                          </div>
                        </div>
                      )}

                      {/* Custom Text Overlay */}
                      {textOverlay.text && (
                        <div
                          className="absolute pointer-events-none select-none px-2 py-1 rounded text-center"
                          style={{
                            left: `${textOverlay.x}%`,
                            top: `${textOverlay.y}%`,
                            transform: "translate(-50%, -50%)",
                            color: textOverlay.color,
                            fontSize: `${textOverlay.size * 0.8}px`,
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
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            maxWidth: "85%",
                          }}
                        >
                          {textOverlay.text}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Caption textbox */}
                <div className="p-3 bg-zinc-950/40 border border-white/5 rounded-2xl">
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                    placeholder="Write a custom description, thoughts, or story tags..."
                    rows={2}
                    maxLength={MAX_CAPTION}
                    className="w-full bg-transparent resize-none outline-none text-xs text-zinc-200 placeholder-zinc-500 leading-normal"
                  />
                  <div className="flex items-center justify-between text-[8px] text-zinc-500 font-mono mt-1">
                    <span>
                      {caption.length} / {MAX_CAPTION}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFwdPicker(true)}
                      className="text-fuchsia-400 hover:text-fuchsia-300"
                    >
                      + Add Giphy Stickers
                    </button>
                  </div>
                </div>
              </div>

              {/* AI prescription panel & tagging metadata */}
              <div className="space-y-4">
                {/* AI Prescription Mood scanning block */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-fuchsia-500/10 shadow-lg relative overflow-hidden space-y-3">
                  <div className="absolute -inset-10 bg-gradient-to-tr from-fuchsia-500/5 via-purple-500/5 to-transparent opacity-40 pointer-events-none" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                        <BrainCircuit className="size-4 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black tracking-wider text-white uppercase font-mono">
                        AI Mood Prescription Engine
                      </span>
                    </div>
                    {aiScanned && (
                      <span className="text-[8px] font-mono text-fuchsia-300 bg-fuchsia-500/10 px-1.5 py-0.5 rounded border border-fuchsia-500/20 animate-pulse">
                        SCANNED ⚡
                      </span>
                    )}
                  </div>

                  {aiScanning && (
                    <div className="space-y-2 py-3 animate-fade-in">
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{aiProgressText}</span>
                        <span className="text-fuchsia-400 animate-spin">⚡</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                        <div className="bg-gradient-to-r from-fuchsia-500 to-amber-400 h-full w-[80%] animate-loading-bar" />
                      </div>
                    </div>
                  )}

                  {aiScanned && (
                    <div className="p-3 rounded-xl bg-fuchsia-500/5 border border-fuchsia-500/20 space-y-2 animate-scale-in">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] text-zinc-400 font-mono leading-none uppercase">
                            Assessed Prescription Mood
                          </p>
                          <h4 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-amber-300 mt-1 uppercase tracking-wide">
                            {aiMood}
                          </h4>
                        </div>
                        <div className="size-5 rounded-full bg-fuchsia-500 flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(217,70,239,0.5)]">
                          <Check className="size-3 stroke-[3]" />
                        </div>
                      </div>
                      <p className="text-[9px] text-zinc-400 leading-normal border-t border-white/5 pt-1.5">
                        <span className="font-bold text-fuchsia-300">Prescription Routing:</span>{" "}
                        Auto-directing this vibe to the{" "}
                        <span className="text-amber-400 font-bold font-mono">“{aiTargetGroup}”</span>{" "}
                        friend circles and subscribers.
                      </p>
                    </div>
                  )}

                  {!aiScanned && !aiScanning && (
                    <button
                      type="button"
                      onClick={triggerAiScan}
                      className="w-full py-2 rounded-xl text-[10px] font-black tracking-wider bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 text-fuchsia-400 hover:text-white transition-all active:scale-95"
                    >
                      TRIGGER AI VIBE ASSESSMENT
                    </button>
                  )}
                </div>

                {/* Tag People Search */}
                <div className="p-3 bg-zinc-950/40 border border-white/5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Tag className="size-3.5 text-fuchsia-400" />
                      <span className="text-[10px] font-black tracking-wider text-white uppercase font-mono">
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
                      placeholder="Search followers or creators..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="w-full bg-zinc-950/80 border border-white/5 rounded-xl pl-7.5 pr-3 py-1.5 text-[9px] outline-none placeholder-zinc-500 text-zinc-100 font-mono"
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
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
                              className={`size-8 rounded-full object-cover border-2 transition-all ${
                                isTagged
                                  ? "border-fuchsia-500 shadow-[0_0_8px_rgba(217,70,239,0.4)]"
                                  : "border-white/10"
                              }`}
                            />
                            {isTagged && (
                              <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-fuchsia-500 text-white flex items-center justify-center border border-zinc-950">
                                <Check className="size-2 stroke-[3.5]" />
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] text-zinc-500 font-mono truncate max-w-[45px]">
                            {c.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Location & Preset Selector */}
                <div className="p-3 bg-zinc-950/40 border border-white/5 rounded-2xl space-y-2">
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
                      className="flex-1 bg-zinc-950/80 border border-white/5 rounded-xl px-3 py-1.5 text-[9px] outline-none placeholder-zinc-500 text-zinc-100 font-mono"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {PRESET_LOCATIONS.map((loc) => {
                      const isSel = location === loc;
                      return (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocation(loc)}
                          className={`px-2.5 py-1 rounded-full text-[9px] font-mono shrink-0 transition-all ${
                            isSel
                              ? "bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold"
                              : "bg-zinc-900 border border-white/5 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {loc}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Universal Smart Sharing Links */}
                <div className="p-3 bg-zinc-950/40 border border-white/5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Share2 className="size-3.5 text-blue-400" />
                      <span className="text-[10px] font-black tracking-wider text-white uppercase font-mono">
                        UNIVERSAL SMART LINK
                      </span>
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal">
                    Generate an instant smart universal routing link to let recipients bypass web
                    friction and direct-load within Trey TV.
                  </p>
                  <button
                    type="button"
                    onClick={handleCopySmartLink}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black tracking-wider bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 hover:text-white transition-all active:scale-95"
                  >
                    <Copy className="size-3" /> GENERATE SMART UNIVERSAL LINK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FWD GIF picker popup */}
      <FwdGifPicker
        open={showFwdPicker}
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
          setStep("EDIT");
          if (navigator.vibrate) navigator.vibrate(10);
        }}
      />
    </div>
  );
}
