/**
 * ProfilePageNew.tsx
 * Exact port of the reference profile design from the lovable-polish-pass repo.
 * Supports variants: "owner" | "creator" | "user" | "public"
 * wired to real ProfileData.
 */

import { useId, useState, useMemo, useEffect, useRef } from "react";
import { fetchSignalRecord } from "@/lib/tests/naturalAbilityStorage";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  ArrowLeft,
  Share,
  MoreHorizontal,
  BadgeCheck,
  MapPin,
  Link2,
  Instagram,
  Twitter,
  Youtube,
  Music2,
  FileText,
  Users,
  UserPlus,
  Sparkles,
  Eye,
  Star,
  Clock,
  Bookmark,
  Heart,
  User,
  Trophy,
  ChevronRight,
  Globe,
  Mail,
  ShoppingBag,
  Play,
  Pause,
  Home,
  Compass,
  Plus,
  BookOpen,
  Inbox,
  Sparkle,
  Pin,
  Disc3,
  ExternalLink,
  ShieldCheck,
  Fingerprint,
  KeyRound,
  X,
  ImageIcon,
  StickyNote,
  Pencil,
  Crown,
  Flame,
  Rocket,
  Zap,
  TrendingUp,
  Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import type { ProfileData } from "./ProfileTypes";
import { useTopThree } from "@/hooks/use-profile";
import { useFollowState, useSubscribeState } from "@/lib/profile-identity";
import { createBrowserClient } from "@/lib/supabase-browser";
import { FwdGifPicker } from "@/components/fwd/FwdGifPicker";
import { useFwdGifLibrary } from "@/lib/fwd-gif-api";
import { buildFwdGifDetailUrl, getAnimatedFwdGifUrl, getFwdPosterUrl } from "@/lib/fwd/picker";
import { TREY_OWNER_UID, isTreyOwnerProfile } from "@/lib/trey-owner";
import treyTvLogo from "@/assets/trey-tv-logo.png";
import staticBanner from "@/assets/lovable-hero-bg.jpg";
import staticPortrait from "@/assets/lovable-profile-portrait.jpg";
import taurusBull from "@/assets/lovable-taurus-bull.png";
import prescribeLock from "@/assets/lovable-prescribe-lock.png";
import fallPost1 from "@/assets/lovable-post1.jpg";
import fallPost2 from "@/assets/lovable-post2.jpg";
import fallPost3 from "@/assets/lovable-post3.jpg";
import fallPost4 from "@/assets/lovable-post4.jpg";
import fallPost5 from "@/assets/lovable-post5.jpg";

const GOLD = "#FFC857";
const NEON_BLUE = "#22D3EE";
const NEON_PURPLE = "#A855F7";
const PINK = "#EC4899";
const GREEN = "#22C55E";
const RED = "#EF4444";

const FALL_POSTS = [fallPost1, fallPost2, fallPost3, fallPost4, fallPost5];

import aiBallCutout from "@/tradio/assets/ai-ball.png";

const SELECTABLE_SONGS = [
  {
    id: "i-look-like",
    title: "I Look Like",
    artist: "Trey Trizzy",
    art: staticPortrait,
    src: "/tradio-tracks/I_Look_Like.wav",
    duration: "3:11",
    streams: "Owner Library",
  },
  {
    id: "call-on",
    title: "Call On",
    artist: "Trey Trizzy",
    art: staticPortrait,
    src: "/tradio-tracks/Call_On.wav",
    duration: "4:04",
    streams: "Owner Library",
  },
  {
    id: "midnight-velvet",
    title: "Midnight Velvet",
    artist: "Trey Trizzy",
    art: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986727359_90668e12.png",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "3:45",
    streams: "1.2M",
  },
  {
    id: "6am-thoughts",
    title: "6AM Thoughts",
    artist: "Trey Trizzy",
    art: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986727359_90668e12.png",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    duration: "2:50",
    streams: "840K",
  },
  {
    id: "city-lights",
    title: "City Lights",
    artist: "JAYE.",
    art: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986809175_9fd3c540.png",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    duration: "3:15",
    streams: "420K",
  },
  {
    id: "neon-heartbreak",
    title: "Neon Heartbreak",
    artist: "Trey Trizzy",
    art: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986750809_4e57f6ad.jpg",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    duration: "4:10",
    streams: "950K",
  },
  {
    id: "falling-for-you",
    title: "Falling For You",
    artist: "Mila Rain",
    art: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986787354_65419cd8.png",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    duration: "3:30",
    streams: "2.4M",
  },
  {
    id: "after-hours",
    title: "After Hours",
    artist: "Giveon",
    art: "https://d64gsuwffb70l.cloudfront.net/6a18701749efbfb7c3f35d89_1779986683829_2c697ab7.png",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    duration: "3:28",
    streams: "1.8M",
  },
];

import { GoldCheck } from "@/components/brand/Badge";

/* ---------- Helpers ---------- */
function Spark({ color, data }: { color: string; data: number[] }) {
  const w = 100,
    h = 28;
  const max = Math.max(...data),
    min = Math.min(...data);
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`)
    .join(" ");
  const id = `spark-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-7" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#${id})`} />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Medallion({
  icon: Icon,
  label,
  color,
  accent,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  color: string;
  accent?: string;
}) {
  const c2 = accent ?? color;
  const grad = `linear-gradient(135deg, ${color}, ${c2})`;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full blur-md opacity-60"
          style={{ background: grad }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(135deg,${color}26,${c2}14)`,
            boxShadow: `inset 0 0 0 1px ${color}88,0 0 10px ${c2}55`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-90"
          style={{
            padding: 1,
            background: grad,
            WebkitMask: "linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <Icon
          className="w-5 h-5 relative z-10 text-white"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </div>
      <span className="text-[9px] text-foreground/80 text-center leading-tight">{label}</span>
    </div>
  );
}

function LinkRow({
  icon: Icon,
  color,
  accent,
  title,
  sub,
  href,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  accent?: string;
  title: string;
  sub: string;
  href?: string;
}) {
  const c2 = accent ?? color;
  const grad = `linear-gradient(135deg,${color},${c2})`;
  return (
    <a
      href={href || "#"}
      target={href ? "_blank" : undefined}
      rel={href ? "noopener noreferrer" : undefined}
      className="group relative panel px-2.5 py-2 flex items-center gap-2 hover-lift cursor-pointer overflow-hidden"
      style={{
        background: `linear-gradient(135deg,${color}1F,${c2}14 70%)`,
        borderColor: `${color}55`,
      }}
    >
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(110deg,transparent 40%,${c2}40 50%,transparent 60%)`,
        }}
      />
      <span
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full blur-xl opacity-50 group-hover:opacity-90 transition"
        style={{ background: grad }}
      />
      <div
        className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-white"
        style={{
          background: grad,
          border: `1px solid ${color}88`,
          boxShadow: `0 0 14px ${color}66,0 0 20px ${c2}40,inset 0 1px 0 rgba(255,255,255,0.35)`,
        }}
      >
        <Icon className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]" />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-[11px] font-bold truncate leading-tight">{title}</div>
        <div className="text-[9px] truncate" style={{ color: `${c2}cc` }}>
          {sub}
        </div>
      </div>
      <ExternalLink
        className="relative w-3 h-3 transition group-hover:translate-x-0.5"
        style={{ color: c2 }}
      />
    </a>
  );
}

/* ========== MAIN EXPORT ========== */
export type ProfileVariant = "owner" | "creator" | "user" | "public";

export function ProfilePageNew({
  profile,
  variant = "public",
}: {
  profile: ProfileData;
  variant?: ProfileVariant;
}) {
  const isOwner = variant === "owner";
  // Audio state for profile theme song / Tradio top songs
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [treyAccentColor, setTreyAccentColor] = useState<string>("#FFC857");

  useEffect(() => {
    let mounted = true;
    async function fetchTreyAccent() {
      try {
        const supabase = createBrowserClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_accent_color")
          .or(`public_profile_uid.eq.${TREY_OWNER_UID},username.eq.trey`)
          .limit(1)
          .maybeSingle<{ profile_accent_color?: string }>();
        if (!error && data?.profile_accent_color) {
          if (mounted) {
            setTreyAccentColor(data.profile_accent_color);
          }
        }
      } catch (err) {
        console.error("Error fetching Trey accent:", err);
      }
    }
    fetchTreyAccent();
    return () => {
      mounted = false;
    };
  }, []);

  const resolvedAccent = useMemo(() => {
    const isTrey = isTreyOwnerProfile({ uid: profile.uid, handle: profile.handle });
    const rawColor = profile.accentColor || "#FFC857";
    if (isTrey) {
      return rawColor;
    }
    if (rawColor !== "#FFC857") {
      return rawColor;
    }
    return treyAccentColor || "#FFC857";
  }, [profile, treyAccentColor]);

  const profileAccentStyle = useMemo(() => {
    const accent = resolvedAccent;
    let r = 255,
      g = 200,
      b = 87;
    const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(accent);
    if (match) {
      r = parseInt(match[1], 16);
      g = parseInt(match[2], 16);
      b = parseInt(match[3], 16);
    }
    return {
      "--profile-accent": accent,
      "--profile-accent-rgb": `${r}, ${g}, ${b}`,
      "--primary": accent,
    } as React.CSSProperties;
  }, [resolvedAccent]);
  const autoplayStorageKey = `tradio_autoplay_${profile.uid}`;
  const [autoplaySong, setAutoplaySong] = useState<any>(() => {
    if (profile.profileSongId) {
      const matched = SELECTABLE_SONGS.find((s) => s.id === profile.profileSongId);
      if (matched) return matched;
    }
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(autoplayStorageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return SELECTABLE_SONGS[0]; // Default: Midnight Velvet
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSongPicker, setShowSongPicker] = useState(false);

  const playlist = useMemo(() => {
    if (profile.musicOrder && profile.musicOrder.length > 0) {
      const ordered = profile.musicOrder
        .map((id) => SELECTABLE_SONGS.find((s) => s.id === id))
        .filter((s): s is typeof SELECTABLE_SONGS[0] => !!s);
      if (ordered.length > 0) return ordered;
    }
    return SELECTABLE_SONGS.slice(0, 5);
  }, [profile.musicOrder]);

  // Attempt to sync from profile db setting
  useEffect(() => {
    if (profile.profileSongId) {
      const matched = SELECTABLE_SONGS.find((s) => s.id === profile.profileSongId);
      if (matched) {
        setAutoplaySong(matched);
      }
    }
  }, [profile.profileSongId]);

  // Attempt to autoplay or handle change in chosen song
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = autoplaySong.src;
      const timer = setTimeout(() => {
        audioRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch(() => {
            setIsPlaying(false);
          });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [autoplaySong]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error(e);
          toast.error("Playback blocked. Please click again.");
        });
    }
  };

  const playTrack = (track: any) => {
    if (!audioRef.current) return;
    if (autoplaySong.id === track.id) {
      togglePlay();
    } else {
      setAutoplaySong(track);
      setIsPlaying(false);
      setTimeout(() => {
        audioRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }, 50);
    }
  };

  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [commentText, setCommentText] = useState("");
  const [showCommentGifPicker, setShowCommentGifPicker] = useState(false);
  const [postComments, setPostComments] = useState<
    Record<
      string,
      Array<{ author: string; avatar: string; text: string; time: string; gifUrl?: string }>
    >
  >({
    "post-0": [
      { author: "Jaylen K.", avatar: fallPost2, text: "This goes crazy! 🔥", time: "2h ago" },
      {
        author: "Mira S.",
        avatar: fallPost3,
        text: "Love the visuals on this one!",
        time: "4h ago",
      },
    ],
    "post-1": [{ author: "Devon R.", avatar: fallPost4, text: "Siiiick flow!", time: "1d ago" }],
    "like-0": [
      {
        author: "Trey Trizzy",
        avatar: profile.avatarUrl || fallPost1,
        text: "Banger absolute banger!",
        time: "3d ago",
      },
    ],
  });
  const [postReactions, setPostReactions] = useState<Record<string, Record<string, number>>>({
    "post-0": { "🔥": 42, "❤️": 28, "👑": 12 },
    "post-1": { "🔥": 19, "❤️": 15, "🙌": 8 },
    "like-0": { "🔥": 150, "❤️": 98 },
  });
  const [myReactions, setMyReactions] = useState<Record<string, string[]>>({});

  const navigate = useNavigate();
  const { topThree = [] } = useTopThree(profile.profileUserId || "");
  const { user: authUser, isGuest, signOut } = useAuth();
  const myUid = authUser?.uid ?? "";
  const [noteOpen, setNoteOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [noteTab, setNoteTab] = useState<"note" | "gif">("note");
  const [note, setNote] = useState("");
  const [localFollowers, setLocalFollowers] = useState(Number(profile.stats.followers) || 0);
  const [localSubscribers, setLocalSubscribers] = useState(Number(profile.stats.subscribers) || 0);
  const [showFwdGifs, setShowFwdGifs] = useState(!!profile.showFwdGifsOnProfile);
  const [showFwdPicker, setShowFwdPicker] = useState(false);
  const [activeTab, setActiveTab] = useState("Posts");
  const followState = useFollowState(profile.profileUserId, false, (next) => {
    setLocalFollowers((count) => Math.max(0, count + (next ? 1 : -1)));
  });
  const subscribeState = useSubscribeState(profile.profileUserId, false, (next) => {
    setLocalSubscribers((count) => Math.max(0, count + (next ? 1 : -1)));
  });
  const fwdLibrary = useFwdGifLibrary("created", 12, 0);

  const [naturalAbility, setNaturalAbility] = useState<any>(null);
  const [hasLoadedAbility, setHasLoadedAbility] = useState(false);
  const [showTourCard, setShowTourCard] = useState(true);

  const isTourActive = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("tour") === "1";
  }, []);

  useEffect(() => {
    if (!profile.profileUserId) {
      setHasLoadedAbility(true);
      return;
    }
    fetchSignalRecord(profile.profileUserId).then((row) => {
      setNaturalAbility(row);
      setHasLoadedAbility(true);
    });
  }, [profile.profileUserId]);

  const isPublic = variant === "public";
  const showOwnerBadge = variant === "owner";
  const showAdminBadge = false; // never show admin badge per user request
  const showCreatorBadge =
    (variant === "owner" || variant === "creator" || isPublic) && profile.isCreator;
  const showVerifiedBadge = !!profile.isVerified;
  const showChannelCTA = profile.isCreator && variant !== "user";
  const showGiftButton = profile.isCreator && variant !== "user";
  const showOwnerControls = variant === "owner";
  const showCreatorControls = variant === "creator"; // edit profile for creators
  const fwdGifs = showOwnerControls && fwdLibrary.data?.ok ? fwdLibrary.data.data.gifs : [];

  const isDefaultBanner =
    !profile.bannerUrl ||
    profile.bannerUrl === "/profile-banner" ||
    profile.bannerUrl.includes("profile-banner");

  const bannerSrc = isDefaultBanner ? staticBanner : profile.bannerUrl;
  const avatarSrc = profile.avatarUrl || staticPortrait;

  const fmt = (n: number | string) => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return String(n);
    return num >= 1_000_000
      ? `${(num / 1_000_000).toFixed(1)}M`
      : num >= 1_000
        ? `${(num / 1_000).toFixed(1)}K`
        : String(num);
  };

  const onShare = async () => {
    try {
      await navigator.share?.({ title: profile.displayName, url: location.href });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast.success("Link copied");
    }
  };

  const onMessage = () => {
    navigate({ to: "/inbox", search: { to: profile.handle } as any });
  };

  const toggleFwdVisibility = async () => {
    if (!authUser || !profile.profileUserId || authUser.uid !== profile.uid) return;
    const next = !showFwdGifs;
    setShowFwdGifs(next);
    const supabase = createBrowserClient();
    const { error } = await (supabase as any)
      .from("profiles")
      .update({ show_fwd_gifs_on_profile: next })
      .eq("id", profile.profileUserId);
    if (error) {
      setShowFwdGifs(!next);
      toast.error("Could not update FWD visibility");
      return;
    }
    toast.success(next ? "FWD GIFs visible on your profile" : "FWD GIFs hidden from your profile");
  };

  const channelLink = `/channel/${profile.handle}` as const;

  return (
    <div className="profile-refr" style={profileAccentStyle}>
      {/* Ambient blobs */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: `radial-gradient(circle,var(--profile-accent),transparent 60%)` }}
        />
        <div
          className="absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-25"
          style={{ background: `radial-gradient(circle,${NEON_BLUE},transparent 60%)` }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle,${PINK},transparent 60%)` }}
        />
      </div>

      {/* ── BANNER ─────────────────────────────────────────── */}
      <section className="relative w-full reveal">
        <div className="relative h-[220px] sm:h-[260px] md:h-[300px] w-full overflow-hidden">
          <img
            src={bannerSrc}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/40 to-[#05070D]/10" />

          {/* Trey TV Logo */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300 ${isDefaultBanner ? "top-1/2 -translate-y-1/2" : "top-2"}`}
          >
            <div
              className={`relative logo-anim transition-all duration-300 ${isDefaultBanner ? "w-[240px] sm:w-[300px] md:w-[360px]" : "w-[160px] sm:w-[200px] md:w-[240px]"}`}
            >
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[70%] rounded-[50%] blur-3xl opacity-60 logo-halo-pulse"
                style={{
                  background: `radial-gradient(ellipse at center,${NEON_PURPLE}55 0%,${NEON_BLUE}33 45%,transparent 70%)`,
                }}
              />
              <img
                src={treyTvLogo}
                alt="Trey TV"
                className="relative w-full h-auto object-contain"
                style={{
                  filter:
                    "drop-shadow(0 4px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 10px rgba(168,85,247,0.35))",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-screen opacity-70"
                style={{
                  WebkitMaskImage: `url(${treyTvLogo})`,
                  maskImage: `url(${treyTvLogo})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  background:
                    "linear-gradient(to bottom,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0.18) 38%,rgba(255,255,255,0) 55%)",
                }}
              />
              <div
                aria-hidden
                className="absolute inset-0 overflow-hidden"
                style={{
                  WebkitMaskImage: `url(${treyTvLogo})`,
                  maskImage: `url(${treyTvLogo})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              >
                <div
                  className="absolute -inset-y-6 -left-1/3 w-1/3 animate-scan-sweep"
                  style={{
                    background:
                      "linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.9) 50%,transparent 65%)",
                    filter: "blur(2px)",
                  }}
                />
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05070D] to-transparent" />
        </div>

        {/* Floating Controls (Moved outside overflow-hidden banner div but kept absolute relative to the section) */}
        {/* Back */}
        <button
          type="button"
          aria-label="Go back"
          onClick={() => navigate({ to: "/" })}
          className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition z-40"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="absolute top-3 right-3 flex gap-1.5 z-40">
          <button
            type="button"
            aria-label="Share"
            onClick={onShare}
            className="w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition"
          >
            <Share className="w-4 h-4 text-white" />
          </button>
          <div className="relative">
            <button
              type="button"
              aria-label="More"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center active:scale-95 transition-all duration-300 ${moreMenuOpen ? "bg-primary/25 border-primary/40 text-primary scale-110 shadow-[0_0_15px_rgba(255,200,87,0.35)]" : "bg-black/40 border-white/15 text-white hover:bg-black/60"}`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {moreMenuOpen && (
              <>
                {/* Backdrop click interceptor */}
                <div className="fixed inset-0 z-40" onClick={() => setMoreMenuOpen(false)} />

                {/* Dropdown panel */}
                <div className="absolute right-0 mt-2.5 w-52 rounded-2xl p-[1px] bg-gradient-to-br from-white/35 via-primary/25 to-cyan-500/30 shadow-[0_24px_50px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.2)] backdrop-blur-3xl z-50 animate-scale-in origin-top-right">
                  <div className="rounded-[15px] bg-gradient-to-b from-[#0e1124]/88 to-[#05060f]/95 p-1.5 flex flex-col gap-0.5 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.12),inset_0_-1px_12px_rgba(0,0,0,0.6)]">
                    <div className="px-3.5 py-2 text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/10 mb-1 flex items-center justify-between">
                      <span>Profile Console</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    </div>

                    {[
                      {
                        label: "Edit Profile",
                        icon: Pencil,
                        color: GOLD,
                        to: "/u/$uid/edit-profile",
                        params: { uid: profile.uid },
                        onClick: () => setMoreMenuOpen(false),
                      },
                      {
                        label: "Settings",
                        icon: KeyRound,
                        color: NEON_BLUE,
                        to: "/admin/settings",
                        onClick: () => setMoreMenuOpen(false),
                      },
                      {
                        label: "Help Center",
                        icon: ShieldCheck,
                        color: PINK,
                        to: "/guide",
                        onClick: () => setMoreMenuOpen(false),
                      },
                      {
                        label: "Sign Out",
                        icon: X,
                        color: RED,
                        onClick: () => {
                          setMoreMenuOpen(false);
                          signOut();
                          toast.success("Signed out successfully");
                        },
                      },
                    ].map((item) => {
                      const content = (
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_12px_rgba(0,0,0,0.2)] active:bg-white/[0.1] transition duration-200 group text-left w-full cursor-pointer">
                          <div
                            className="size-7 rounded-lg flex items-center justify-center bg-white/[0.02] border border-white/10 group-hover:border-white/20 transition-all duration-300"
                            style={{ color: item.color, boxShadow: `0 0 10px ${item.color}15` }}
                          >
                            <item.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-300 group-hover:text-white transition-colors">
                            {item.label}
                          </span>
                        </div>
                      );

                      if (item.to) {
                        return (
                          <Link
                            key={item.label}
                            to={item.to as any}
                            onClick={item.onClick}
                            className="block w-full"
                          >
                            {content}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={item.onClick}
                          className="w-full block"
                        >
                          {content}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Avatar overlapping banner */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-[60px] md:-bottom-[75px] z-30">
          <div className="relative w-[120px] h-[120px] md:w-[150px] md:h-[150px]">
            <div
              className="absolute -inset-10 rounded-full opacity-25 blur-3xl"
              style={{ background: "var(--profile-accent)" }}
            />
            <div
              className="absolute -inset-[5px] rounded-full ring-gradient animate-spin-slow opacity-80"
              style={{ filter: "blur(0.5px)" }}
            />
            <div className="absolute -inset-[2px] rounded-full ring-pulse opacity-90" />
            <div className="absolute inset-0 rounded-full bg-[#05070D] overflow-hidden border border-white/10">
              <img
                src={avatarSrc}
                alt={profile.displayName}
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
            {showVerifiedBadge && (
              <div className="absolute -bottom-1 -right-1">
                <GoldCheck size={42} />
              </div>
            )}
            {showOwnerControls && (
              <button
                onClick={() => setNoteOpen(true)}
                aria-label="Add note"
                className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center bg-white text-black border-2 border-white/80 shadow-[0_0_18px_rgba(255,255,255,0.85)] hover:scale-110 active:scale-95 transition-transform plus-pulse z-10"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-3 md:px-6 pt-[80px] md:pt-24">
        {/* IDENTITY */}
        <div className="max-w-2xl mx-auto mb-5 md:mb-7">
          <div className="text-center reveal">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-[26px] md:text-3xl font-extrabold metallic-chrome drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {profile.displayName}
              </h1>
              {showVerifiedBadge && <GoldCheck size={22} />}
            </div>
            <div className="mt-1 text-[11px] tracking-wide text-muted-foreground">
              @{profile.handle}
            </div>

            {/* Role pills */}
            <div className="mt-2.5 flex items-center justify-center flex-wrap gap-1.5 px-2">
              {showOwnerBadge && (
                <span className="owner-badge inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] whitespace-nowrap px-2.5 py-[4px] sm:px-3 sm:py-[5px] rounded-full">
                  <span aria-hidden className="owner-badge__shine" />
                  <span aria-hidden className="owner-badge__crown">
                    <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </span>
                  <span className="owner-badge__text">Owner</span>
                </span>
              )}
              {[
                showVerifiedBadge && {
                  I: GoldCheck as React.ComponentType<any>,
                  l: "Verified",
                  c: GOLD,
                  gold: true,
                },
                showCreatorBadge && { I: Sparkles, l: "Creator", c: NEON_PURPLE, gold: false },
              ]
                .filter(Boolean)
                .map((b: any) => (
                  <span
                    key={b.l}
                    className="role-pill inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-white/95 px-2 py-[3px] sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap"
                    style={{ "--pill-c": b.c } as React.CSSProperties}
                  >
                    <span aria-hidden className="role-pill__shine" />
                    <span aria-hidden className="role-pill__ring" />
                    {b.gold ? (
                      <GoldCheck size={11} className="role-pill__icon" />
                    ) : (
                      <b.I
                        className="w-2.5 h-2.5 role-pill__icon"
                        strokeWidth={2.5}
                        style={{ color: b.c }}
                      />
                    )}
                    <span className="role-pill__label" style={{ textShadow: `0 0 8px ${b.c}66` }}>
                      {b.l}
                    </span>
                  </span>
                ))}
            </div>

            {profile.bio && (
              <p className="mt-2 text-[12px] text-foreground/85 leading-snug px-4">{profile.bio}</p>
            )}

            <div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] text-muted-foreground flex-wrap">
              {profile.location && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" style={{ color: GOLD }} /> {profile.location}
                </span>
              )}
              {profile.websiteLink && (
                <span className="inline-flex items-center gap-0.5">
                  <Link2 className="w-3 h-3" style={{ color: NEON_BLUE }} /> {profile.websiteLink}
                </span>
              )}
            </div>

            {/* Action buttons */}
            {!showOwnerControls && !showCreatorControls && (
              <div
                className={`mt-3 grid gap-2 max-w-md mx-auto ${showGiftButton ? "grid-cols-4" : "grid-cols-3"}`}
              >
                {[
                  {
                    l: followState.following ? "Followed" : "Follow",
                    I: followState.following ? BadgeCheck : UserPlus,
                    c: NEON_PURPLE,
                    primary: true,
                    onClick: followState.toggle,
                    disabled: followState.pending,
                  },
                  {
                    l: subscribeState.subscribed ? "Subscribed" : "Subscribe",
                    I: Sparkles,
                    c: GOLD,
                    primary: false,
                    onClick: subscribeState.toggle,
                    disabled: subscribeState.pending,
                  },
                  {
                    l: "Message",
                    I: Mail,
                    c: NEON_BLUE,
                    primary: false,
                    onClick: onMessage,
                    disabled: false,
                  },
                  ...(showGiftButton
                    ? [
                        {
                          l: "Gift",
                          I: Heart,
                          c: PINK,
                          primary: false,
                          onClick: () => toast("Gift picker opens from creator profiles soon."),
                          disabled: false,
                        },
                      ]
                    : []),
                ].map(({ l, I, c, primary, onClick, disabled }) => (
                  <button
                    key={l}
                    type="button"
                    disabled={disabled}
                    onClick={onClick}
                    className="cert-btn group disabled:opacity-60"
                    data-primary={primary ? "true" : "false"}
                    style={{ "--btn-c": c } as React.CSSProperties}
                  >
                    <span aria-hidden className="cert-btn__border" />
                    <span aria-hidden className="cert-btn__surface" />
                    <span aria-hidden className="cert-btn__cert">
                      <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none">
                        <path
                          d="M2.5 6.2 L4.8 8.4 L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="cert-btn__content">
                      <span className="cert-btn__icon">
                        <I className="w-3.5 h-3.5" strokeWidth={2.25} />
                      </span>
                      <span className="cert-btn__label">{l}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Channel CTA */}
            {showChannelCTA && (
              <div className="mt-3 flex justify-center">
                <Link
                  to={channelLink as any}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-[12px] uppercase tracking-[0.18em] text-black overflow-hidden active:scale-95 hover:scale-[1.04] transition-transform"
                  style={{
                    background: `linear-gradient(135deg,#FFE9A8 0%,${GOLD} 35%,#E9A917 60%,#FFF3C4 100%)`,
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.35) inset,0 0 22px ${GOLD}99,0 0 48px ${GOLD}66,0 8px 30px rgba(0,0,0,0.55)`,
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute -inset-[2px] rounded-full opacity-90 animate-spin-slow -z-10"
                    style={{
                      background: `conic-gradient(from 0deg,${GOLD},${PINK},${NEON_PURPLE},${NEON_BLUE},${GOLD})`,
                      filter: "blur(6px)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(110deg,transparent 38%,rgba(255,255,255,0.85) 50%,transparent 62%)",
                    }}
                  />
                  <Play className="w-4 h-4 fill-black" strokeWidth={2.5} />
                  <span className="relative">View My Channel</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={3} />
                </Link>
              </div>
            )}

            {/* Owner controls */}
            {showOwnerControls && (
              <div className="mt-2 flex justify-center items-center gap-2">
                <Link
                  to="/u/$uid/edit-profile"
                  params={{ uid: profile.uid }}
                  className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08),0 6px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" style={{ color: "var(--profile-accent)" }} />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}

            {/* Creator controls (edit profile) */}
            {showCreatorControls && (
              <div className="mt-2 flex justify-center items-center gap-2">
                <Link
                  to="/u/$uid/edit-profile"
                  params={{ uid: profile.uid }}
                  className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08),0 6px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" style={{ color: "var(--profile-accent)" }} />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}

            {/* Public back button */}
            {isPublic && (
              <div className="mt-2 flex justify-center">
                <button
                  onClick={() => navigate({ to: -1 as any })}
                  className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] active:scale-95 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" style={{ color: NEON_PURPLE }} />
                  <span>Back</span>
                </button>
              </div>
            )}

            {/* Social icons */}
            <div className="mt-3.5 flex items-center justify-center gap-1">
              {[
                { I: Instagram, c: PINK, l: "Instagram" },
                { I: Twitter, c: NEON_BLUE, l: "X" },
                { I: Music2, c: "#fff", l: "TikTok" },
                { I: Youtube, c: RED, l: "YouTube" },
                { I: Disc3, c: "#FF7700", l: "SoundCloud" },
              ].map(({ I, c, l }) => (
                <button
                  key={l}
                  type="button"
                  aria-label={l}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 active:scale-90 transition"
                  style={{ color: c }}
                >
                  <I className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Onboarding Optional Signal Test Banner */}
        {isTourActive && showTourCard && !naturalAbility && variant === "owner" && (
          <div className="max-w-2xl mx-auto mb-5 reveal">
            <div className="relative rounded-[24px] p-[1.5px] bg-gradient-to-r from-fuchsia-500/50 via-violet-500/30 to-cyan-500/40 shadow-[0_0_30px_-5px_rgba(168,85,247,0.35)]">
              <div className="rounded-[22px] bg-[#0a0518]/90 backdrop-blur-xl px-5 py-5 relative overflow-hidden">
                <button
                  onClick={() => setShowTourCard(false)}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-500/20 border border-violet-400/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-violet-300" />
                  </div>
                  <div className="flex-1 pr-6">
                    <h3 className="text-base font-bold text-white">Unlock Your Natural Ability</h3>
                    <p className="text-[12px] text-slate-300 mt-1 leading-relaxed">
                      Your profile setup is complete! Take the optional **Signal Test** to discover
                      your core personality archetype, unlock an exclusive neon badge on your
                      profile, and light up your feed display name. You can skip it and take it
                      anytime.
                    </p>
                    <div className="mt-3.5 flex items-center gap-3">
                      <Link
                        to="/tests/natural-ability"
                        className="rounded-xl px-4 py-2 text-[11px] font-bold text-white bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 hover:scale-[1.02] active:scale-[0.98] transition-transform"
                      >
                        Take The Test
                      </Link>
                      <button
                        onClick={() => setShowTourCard(false)}
                        className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TWO-COLUMN LAYOUT ──────────────────────────── */}
        <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6 lg:items-start space-y-3 lg:space-y-0">
          {/* LEFT COLUMN */}
          <div className="space-y-3 lg:sticky lg:top-4">
            {/* Unified Stats & Verification Card */}
            <div
              className="panel neon-border reveal overflow-hidden flex flex-col"
              style={{ animationDelay: ".05s" }}
            >
              {/* Stat bar */}
              <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5 bg-white/[0.01]">
                {[
                  { I: FileText, c: NEON_BLUE, v: fmt(profile.stats.posts || 0), l: "Posts" },
                  { I: Users, c: NEON_PURPLE, v: fmt(localFollowers || 0), l: "Followers" },
                  { I: UserPlus, c: PINK, v: fmt(profile.stats.following || 0), l: "Following" },
                  { I: Sparkles, c: GOLD, v: fmt(localSubscribers || 0), l: "Subs" },
                ].map(({ I, c, v, l }) => (
                  <button
                    key={l}
                    type="button"
                    className="flex flex-col sm:flex-row items-center justify-center gap-1.5 px-1 py-3 transition hover:bg-white/[0.03] active:scale-[0.98]"
                  >
                    <I
                      className="w-3.5 h-3.5 shrink-0"
                      style={{ color: c, filter: `drop-shadow(0 0 6px ${c})` }}
                    />
                    <div className="text-center sm:text-left">
                      <div className="text-sm font-bold leading-none tabular-nums">{v}</div>
                      <div className="text-[9px] text-muted-foreground mt-1 font-semibold uppercase tracking-wider">
                        {l}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Certification strip */}
              <div className="p-3 bg-white/[0.005]">
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[
                    { I: ShieldCheck, l: "Identity", s: "Confirmed", c: GOLD },
                    { I: Fingerprint, l: "Original", s: "Account", c: NEON_BLUE },
                    {
                      I: KeyRound,
                      l: profile.isCreator ? "Creator" : "Member",
                      s: "Verified",
                      c: NEON_PURPLE,
                    },
                  ].map(({ I, l, s, c }) => (
                    <div
                      key={l}
                      className="flex flex-col items-center gap-0.5 py-0.5 transition hover:-translate-y-0.5"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: `${c}1A`,
                          border: `1px solid ${c}55`,
                          boxShadow: `0 0 10px ${c}33,inset 0 0 6px ${c}11`,
                        }}
                      >
                        <I className="w-3.5 h-3.5" style={{ color: c }} />
                      </div>
                      <div className="text-[10px] font-bold leading-none mt-1" style={{ color: c }}>
                        {l}
                      </div>
                      <div className="text-[9px] text-muted-foreground leading-none mt-0.5">
                        {s}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tradio Profile Theme Song Player */}
            <div
              className="panel neon-border p-4 reveal relative overflow-hidden bg-[#0A0518]/80 backdrop-blur-xl animate-fade-in"
              style={{ animationDelay: ".06s" }}
            >
              <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-500/10 via-cyan-500/5 to-transparent" />

              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.7)]" />
                  <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-300">
                    Profile Theme Song
                  </h3>
                </div>
                {variant === "owner" && (
                  <button
                    onClick={() => setShowSongPicker(true)}
                    className="text-[10px] text-purple-300 hover:text-white flex items-center gap-1 transition"
                  >
                    <Pencil className="w-3 h-3" /> Change
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <div
                    className="absolute inset-0 rounded-full bg-[#121214] border-2 border-zinc-800 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden"
                    style={{
                      animation: isPlaying ? "spin 4s linear infinite" : "none",
                    }}
                  >
                    <div className="absolute inset-1 rounded-full border border-zinc-900 opacity-60" />
                    <div className="absolute inset-2.5 rounded-full border border-zinc-900 opacity-60" />
                    <div className="absolute inset-4 rounded-full border border-zinc-900 opacity-60" />
                    <div className="absolute inset-5 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-900">
                      <img src={autoplaySong.art} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute w-2 h-2 rounded-full bg-black border border-white/30 z-10" />
                  </div>

                  <div
                    className="absolute -top-1 -right-1 w-6 h-10 pointer-events-none z-20 origin-[top_right]"
                    style={{
                      transform: isPlaying ? "rotate(18deg)" : "rotate(-12deg)",
                      transition: "transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)",
                    }}
                  >
                    <svg
                      viewBox="0 0 24 40"
                      fill="none"
                      className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                    >
                      <circle cx="18" cy="8" r="4" fill="#52525b" />
                      <circle cx="18" cy="8" r="1.5" fill="#a1a1aa" />
                      <path
                        d="M18 8 L10 28 L6 34"
                        stroke="#a1a1aa"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <rect
                        x="3"
                        y="32"
                        width="6"
                        height="3"
                        rx="0.5"
                        transform="rotate(-15 6 33)"
                        fill="#3f3f46"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <h4 className="text-xs font-bold text-white truncate leading-tight">
                    {autoplaySong.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {autoplaySong.artist}
                  </p>

                  <div className="mt-2.5 h-4 flex items-end gap-[2px]">
                    {[6, 14, 10, 18, 12, 8, 16, 12, 10, 6, 14, 8, 12, 4, 10, 6, 12, 8].map(
                      (h, i) => (
                        <span
                          key={i}
                          className="w-[2px] bg-purple-500 rounded-full transition-all duration-300"
                          style={{
                            height: isPlaying
                              ? `${Math.sin(Date.now() / 150 + i) * 6 + 10}px`
                              : "3px",
                            backgroundColor: isPlaying
                              ? i % 2 === 0
                                ? NEON_BLUE
                                : "var(--profile-accent)"
                              : "rgba(255,255,255,0.15)",
                            animationName: isPlaying ? "visualizer-bounce" : "none",
                            animationDuration: isPlaying ? "0.8s" : "0s",
                            animationTimingFunction: isPlaying ? "ease-in-out" : "ease",
                            animationIterationCount: isPlaying ? "infinite" : 1,
                            animationDirection: isPlaying ? "alternate" : "normal",
                            animationDelay: `${i * 45}ms`,
                          }}
                        />
                      ),
                    )}
                  </div>
                </div>

                <button
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-purple-500 hover:bg-purple-400 text-black flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:scale-105 active:scale-95 transition"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>

            {/* My Signal Badge Panel */}
            {naturalAbility && (variant === "owner" || naturalAbility.show_on_profile) && (
              <div
                className="panel neon-border p-4 reveal relative"
                style={{
                  animationDelay: ".085s",
                  boxShadow: `0 0 20px -5px ${naturalAbility.badge_glow || "#fbbf24"}44, inset 0 0 12px ${naturalAbility.badge_glow || "#fbbf24"}11`,
                }}
              >
                <div
                  className="absolute inset-0 rounded-3xl opacity-[0.03] pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at center, ${naturalAbility.badge_glow || "#fbbf24"}, transparent 70%)`,
                  }}
                />
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-2xl shrink-0"
                    style={{
                      borderColor: naturalAbility.badge_glow,
                      color: naturalAbility.badge_glow,
                      background: `${naturalAbility.badge_glow}15`,
                      boxShadow: `0 0 15px ${naturalAbility.badge_glow}44`,
                    }}
                  >
                    {naturalAbility.badge_symbol}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] tracking-[0.25em] text-amber-300 font-bold uppercase">
                      NATURAL ABILITY
                    </p>
                    <h4
                      className="text-base font-extrabold truncate"
                      style={{ color: naturalAbility.badge_glow }}
                    >
                      {naturalAbility.primary_ability}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate leading-snug">
                      {naturalAbility.badge_label}
                    </p>
                  </div>
                </div>
                {variant === "owner" && (
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            naturalAbility.privacy_mode === "public"
                              ? "#22c55e"
                              : naturalAbility.privacy_mode === "profile"
                                ? "#3b82f6"
                                : "#94a3b8",
                        }}
                      />
                      Visibility: {naturalAbility.privacy_mode.toUpperCase()}
                    </span>
                    <Link
                      to="/settings"
                      className="text-amber-300/80 hover:text-amber-300 transition"
                    >
                      Manage Visibility
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Locked Signal Badge — active CTA before the test is taken (Owner Only) */}
            {hasLoadedAbility && !naturalAbility && variant === "owner" && (
              <div
                className="panel border border-dashed border-white/10 p-4 reveal"
                style={{ animationDelay: ".085s" }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-xl text-slate-500 shrink-0">
                    ?
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-300">
                      Natural Ability Badge: Locked
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Discover your Natural Ability and unlock a permanent profile badge & feed name
                      effect.
                    </p>
                    <Link
                      to="/tests/natural-ability"
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 hover:text-white transition"
                    >
                      Take The Signal Test <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Signal Test already taken — the option is permanently greyed out & unclickable (Owner Only) */}
            {hasLoadedAbility && naturalAbility && variant === "owner" && (
              <div
                className="panel border border-dashed border-white/10 p-4 reveal opacity-50 select-none"
                style={{ animationDelay: ".085s" }}
                aria-disabled="true"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full border border-white/15 bg-white/[0.02] flex items-center justify-center text-slate-400 shrink-0">
                    <BadgeCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-300">Signal Test: Completed</h4>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Your Natural Ability badge is locked to your profile. The Signal Test can only
                      be taken once.
                    </p>
                    <span
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 cursor-not-allowed pointer-events-none"
                      aria-disabled="true"
                      title="The Signal Test has already been completed"
                    >
                      Take The Signal Test <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* GIF of the Day */}
            {profile.gifOfDayUrl && (
              <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".09s" }}>
                <div className="flex items-center gap-1.5 mb-2.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: NEON_BLUE, boxShadow: `0 0 8px ${NEON_BLUE}` }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    GIF of the Day
                  </h3>
                  <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground">
                    FWD
                  </span>
                </div>
                <div className="relative overflow-hidden rounded-xl border border-white/10 max-h-52">
                  {profile.gifOfDayPosterUrl && (
                    <img
                      src={profile.gifOfDayPosterUrl}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm"
                      loading="lazy"
                    />
                  )}
                  <img
                    src={profile.gifOfDayUrl}
                    alt="GIF of the Day"
                    className="relative w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {profile.gifOfDayCaption && (
                  <p className="mt-2 text-[11px] text-foreground/70 text-center">
                    {profile.gifOfDayCaption}
                  </p>
                )}
              </div>
            )}

            {(showOwnerControls || showFwdGifs) && (
              <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".095s" }}>
                <div className="mb-2.5 flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-pulse"
                    style={{ background: NEON_PURPLE, boxShadow: `0 0 8px ${NEON_PURPLE}` }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    FWD GIF Library
                  </h3>
                  <span className="ml-auto rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    FWD
                  </span>
                </div>
                {showOwnerControls && (
                  <div className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
                    <div className="text-left">
                      <div className="text-[11px] font-bold">
                        {showFwdGifs ? "Visible on profile" : "Hidden from public profile"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Only public/allowed FWD GIFs are shown.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleFwdVisibility}
                      className="rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-bold active:scale-95"
                      style={{ color: showFwdGifs ? GOLD : NEON_BLUE }}
                    >
                      {showFwdGifs ? "Hide" : "Show"}
                    </button>
                  </div>
                )}
                {showFwdGifs && fwdGifs.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {fwdGifs.map((gif) => {
                      const poster = getFwdPosterUrl(gif);
                      const src = getAnimatedFwdGifUrl(gif) || poster || "";
                      return (
                        <a
                          key={gif.id}
                          href={buildFwdGifDetailUrl(gif.gif_id ?? gif.id)}
                          className="group relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {poster && (
                            <img
                              src={poster}
                              alt=""
                              aria-hidden
                              className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm"
                              loading="lazy"
                            />
                          )}
                          <img
                            src={src}
                            alt={gif.title || "FWD GIF"}
                            loading="lazy"
                            className="relative h-full w-full object-cover transition duration-500 group-hover:scale-110"
                          />
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center text-[11px] text-muted-foreground">
                    {showOwnerControls
                      ? "Choose GIFs in FWD or feature a GIF of the Day from Edit Profile."
                      : "No public FWD GIFs yet."}
                  </div>
                )}
                {showOwnerControls && (
                  <button
                    type="button"
                    onClick={() => setShowFwdPicker(true)}
                    className="mt-3 w-full rounded-full border border-white/15 px-3 py-2 text-[11px] font-bold text-white/90 active:scale-95"
                  >
                    Choose from FWD
                  </button>
                )}
              </div>
            )}

            {/* Bio / About */}
            <div
              className="panel neon-border p-3 reveal relative"
              style={{ animationDelay: ".1s" }}
            >
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: NEON_PURPLE, boxShadow: `0 0 8px ${NEON_PURPLE}` }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    About {profile.displayName.split(" ")[0]}
                  </h3>
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">
                  {profile.bio || "Member of Trey TV. Building something great."}
                </p>
                <button className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold inline-flex items-center gap-0.5 hover:bg-white/5 transition">
                  Full bio <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Facts + Zodiac with alignment-safe grid row mapping */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 sm:gap-x-4 md:gap-x-6 gap-y-2 items-center text-[10px] md:text-[11px] w-full relative">
                {/* Center Zodiac badge spans 5 rows */}
                <div className="col-start-2 col-end-3 row-start-1 row-end-6 flex justify-center items-center h-full">
                  <div className="relative w-[88px] h-[100px] md:w-[120px] md:h-[135px] flex items-center justify-center">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-60"
                      style={{ background: `radial-gradient(circle,${GOLD}66,transparent 70%)` }}
                    />
                    <div
                      className="absolute inset-1 rounded-full animate-spin-slow"
                      style={{
                        background: `conic-gradient(${GOLD},transparent 30%,${NEON_PURPLE},transparent 60%,${GOLD})`,
                        WebkitMask:
                          "radial-gradient(circle,transparent 60%,#000 62%,#000 66%,transparent 68%)",
                        mask: "radial-gradient(circle,transparent 60%,#000 62%,#000 66%,transparent 68%)",
                        filter: `drop-shadow(0 0 8px ${GOLD})`,
                      }}
                    />
                    <img
                      src={taurusBull}
                      alt="zodiac"
                      className="relative w-[56px] md:w-[75px] animate-float"
                      style={{
                        filter: `drop-shadow(0 0 10px ${GOLD}) drop-shadow(0 0 18px ${NEON_PURPLE}88)`,
                      }}
                    />
                    <span
                      className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[7px] font-black tracking-[0.22em] px-2 py-0.5 rounded-full border whitespace-nowrap"
                      style={{
                        color: GOLD,
                        borderColor: `${GOLD}88`,
                        background: "rgba(5,7,13,0.9)",
                        boxShadow: `0 0 10px ${GOLD}55`,
                      }}
                    >
                      {profile.zodiacSunSign
                        ? `♉ ${profile.zodiacSunSign.toUpperCase()}`
                        : "♉ TAURUS"}
                    </span>
                  </div>
                </div>

                {/* Left side labels and Right side values in exact row alignment pairs */}
                {[
                  { I: Globe, l: "Member since", v: profile.joinedDate || "Jan 2023", c: "#fff" },
                  {
                    I: Sparkle,
                    l: "Creator",
                    v: profile.isCreator ? "Music • Film" : "Member",
                    c: "#fff",
                  },
                  { I: User, l: "Prescribe Me", v: "Open", c: GREEN },
                  { I: BadgeCheck, l: "Response rate", v: "98%", c: NEON_BLUE },
                  { I: Clock, l: "Avg. response", v: "2h", c: "#fff" },
                ].map(({ I, l, v, c }) => (
                  <div className="contents" key={l}>
                    {/* Left cell (Label) */}
                    <div className="col-start-1 col-end-2 flex items-center gap-1.5 text-left truncate">
                      <I className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground font-medium truncate">{l}</span>
                    </div>

                    {/* Right cell (Value) */}
                    <div className="col-start-3 col-end-4 text-right truncate">
                      <span className="font-semibold" style={{ color: c }}>
                        {v}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-3">
            {/* Tradio Artist Top Hits Section */}
            {profile.isCreator && (
              <div
                className="panel neon-border p-4 reveal relative overflow-hidden bg-[#05070D]/90 animate-fade-in"
                style={{ animationDelay: ".12s" }}
              >
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-500/5 to-cyan-500/5" />

                <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={aiBallCutout}
                      alt=""
                      className="size-4.5 object-contain animate-spin-slow [filter:drop-shadow(0_0_3px_rgba(168,85,247,0.5))]"
                      style={{ animationDuration: "12s" }}
                    />
                    <h3 className="font-extrabold text-[12px] uppercase tracking-wider text-white">
                      Tradio Top 5 Hits
                    </h3>
                  </div>

                  {/* Tradio Logo Link Button */}
                  <a
                    href={`/tradio?artistUid=${profile.uid}`}
                    className="group flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 active:scale-95 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                  >
                    <div className="relative size-3.5 flex items-center justify-center shrink-0">
                      <span className="absolute inset-0 rounded-full bg-purple-500/30 blur-[1px] animate-pulse" />
                      <img
                        src={aiBallCutout}
                        alt="Tradio"
                        className="relative size-3.5 object-contain [filter:drop-shadow(0_0_2px_rgba(176,38,255,0.6))]"
                        style={{ animation: "spin 15s linear infinite" }}
                      />
                    </div>
                    <span>Tradio Station</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                </div>

                {/* Song List */}
                <div className="space-y-1.5">
                  {playlist.map((song, index) => {
                    const isActive = autoplaySong.id === song.id;
                    const isSongPlaying = isActive && isPlaying;
                    return (
                      <div
                        key={song.id}
                        className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                          isActive
                            ? "bg-purple-500/10 border-purple-500/30 text-white"
                            : "bg-white/[0.01] border-white/5 text-slate-300 hover:bg-white/[0.03] hover:border-white/10"
                        }`}
                      >
                        <div className="w-5 text-center shrink-0 flex items-center justify-center">
                          {isSongPlaying ? (
                            <div className="flex gap-[1.5px] items-end h-3">
                              <span
                                className="w-[1.5px] h-3 rounded-full animate-[visualizer-bounce_0.6s_ease-in-out_infinite_alternate]"
                                style={{ backgroundColor: "var(--profile-accent)" }}
                              />
                              <span
                                className="w-[1.5px] h-2.5 rounded-full animate-[visualizer-bounce_0.6s_ease-in-out_infinite_alternate_0.2s]"
                                style={{ backgroundColor: "var(--profile-accent)" }}
                              />
                              <span
                                className="w-[1.5px] h-2 rounded-full animate-[visualizer-bounce_0.6s_ease-in-out_infinite_alternate_0.4s]"
                                style={{ backgroundColor: "var(--profile-accent)" }}
                              />
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-500">{index + 1}</span>
                          )}
                        </div>

                        <div className="relative size-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <img src={song.art} alt="" className="size-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition">
                            <button
                              onClick={() => playTrack(song)}
                              className="text-white hover:scale-110 active:scale-90 transition"
                            >
                              {isSongPlaying ? (
                                <Pause className="w-4 h-4 fill-current" />
                              ) : (
                                <Play className="w-4 h-4 fill-current ml-0.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 text-left">
                          <h4 className="text-[11px] font-bold truncate">{song.title}</h4>
                          <p className="text-[9px] text-slate-400 mt-0.5 truncate">{song.artist}</p>
                        </div>

                        <div className="hidden sm:block text-right text-[10px] text-slate-500 tabular-nums font-semibold shrink-0">
                          {song.streams} plays
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono shrink-0">
                          {song.duration}
                        </div>

                        <button
                          onClick={() => playTrack(song)}
                          className={`size-7 rounded-full flex items-center justify-center border transition ${
                            isActive
                              ? "text-black"
                              : "bg-white/5 border-white/10 hover:border-white/25 text-white"
                          }`}
                          style={
                            isActive
                              ? {
                                  backgroundColor: "var(--profile-accent)",
                                  borderColor: "var(--profile-accent)",
                                  boxShadow: "0 0 10px var(--profile-accent)",
                                }
                              : {}
                          }
                        >
                          {isSongPlaying ? (
                            <Pause className="w-3.5 h-3.5 fill-current" />
                          ) : (
                            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Unified Content Panel (Tabs + Content) */}
            <div
              className="panel neon-border reveal flex flex-col overflow-hidden"
              style={{ animationDelay: ".15s" }}
            >
              {/* Integrated Header Tabs */}
              <div className="grid grid-cols-4 border-b border-white/5 bg-white/[0.01]">
                {["Posts", "Likes", "Saved", "About"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`relative py-3.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-[0.08em] transition active:scale-95 ${activeTab === t ? "text-white bg-white/[0.02]" : "text-muted-foreground hover:text-white hover:bg-white/[0.01]"}`}
                  >
                    {t}
                    {activeTab === t && (
                      <span
                        className="absolute bottom-0 inset-x-0 h-[2px]"
                        style={{
                          background: `linear-gradient(90deg,transparent,var(--profile-accent),transparent)`,
                          boxShadow: `0 0 10px var(--profile-accent)`,
                        }}
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content Area */}
              <div className="p-4 bg-white/[0.005]">
                {/* Posts grid */}
                {activeTab === "Posts" && (
                  <div className="reveal">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: NEON_BLUE, boxShadow: `0 0 8px ${NEON_BLUE}` }}
                        />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                          Recent Posts
                        </h3>
                      </div>
                      <a
                        className="text-[10px] font-medium text-slate-400 inline-flex items-center gap-0.5 hover:text-white transition"
                        href="#"
                      >
                        View all <ChevronRight className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {FALL_POSTS.map((img, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            setSelectedPost({
                              id: `post-${i}`,
                              img,
                              title: `Recent Release #${i + 1}`,
                              views: ["34.2K", "52.6K", "12.1K", "18.7K", "24.3K"][i],
                              duration: ["1:24", "2:08", "0:58", "1:45", "2:12"][i],
                            })
                          }
                          className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] transition duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                        >
                          <img
                            src={img}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          {i === 0 && (
                            <div
                              className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full flex items-center justify-center shadow-lg"
                              style={{ background: GOLD }}
                            >
                              <Pin className="w-2.5 h-2.5 text-black" />
                            </div>
                          )}
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-bold tracking-wide text-white">
                            <span className="inline-flex items-center gap-0.5">
                              <Play className="w-2 h-2 fill-current" />{" "}
                              {["34.2K", "52.6K", "12.1K", "18.7K", "24.3K"][i]}
                            </span>
                            <span className="text-white/70">
                              {["1:24", "2:08", "0:58", "1:45", "2:12"][i]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Likes grid */}
                {activeTab === "Likes" && (
                  <div className="reveal">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: PINK, boxShadow: `0 0 8px ${PINK}` }}
                        />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                          Liked Posts
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {[fallPost3, fallPost4, fallPost5, fallPost1, fallPost2].map((img, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            setSelectedPost({
                              id: `like-${i}`,
                              img,
                              title: `Liked Release #${i + 1}`,
                              views: ["12.4K", "18.1K", "9.5K", "4.2K", "21.0K"][i],
                              duration: ["1:02", "1:55", "0:45", "2:10", "1:32"][i],
                            })
                          }
                          className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] transition duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                        >
                          <img
                            src={img}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-bold tracking-wide text-white">
                            <span className="inline-flex items-center gap-0.5">
                              <Play className="w-2 h-2 fill-current" />{" "}
                              {["12.4K", "18.1K", "9.5K", "4.2K", "21.0K"][i]}
                            </span>
                            <span className="text-white/70">
                              {["1:02", "1:55", "0:45", "2:10", "1:32"][i]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Saved grid */}
                {activeTab === "Saved" && (
                  <div className="reveal">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: NEON_PURPLE, boxShadow: `0 0 8px ${NEON_PURPLE}` }}
                        />
                        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                          Saved Posts
                        </h3>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                      {[fallPost5, fallPost2, fallPost1, fallPost3, fallPost4].map((img, i) => (
                        <div
                          key={i}
                          onClick={() =>
                            setSelectedPost({
                              id: `saved-${i}`,
                              img,
                              title: `Saved Release #${i + 1}`,
                              views: ["44.1K", "19.2K", "32.0K", "8.7K", "14.5K"][i],
                              duration: ["2:12", "1:48", "0:35", "1:15", "2:05"][i],
                            })
                          }
                          className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group hover:border-white/25 hover:shadow-[0_0_12px_rgba(255,255,255,0.05)] transition duration-300 cursor-pointer hover:scale-[1.01] active:scale-[0.98]"
                        >
                          <img
                            src={img}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                          <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-bold tracking-wide text-white">
                            <span className="inline-flex items-center gap-0.5">
                              <Play className="w-2 h-2 fill-current" />{" "}
                              {["44.1K", "19.2K", "32.0K", "8.7K", "14.5K"][i]}
                            </span>
                            <span className="text-white/70">
                              {["2:12", "1:48", "0:35", "1:15", "2:05"][i]}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About panel */}
                {activeTab === "About" && (
                  <div className="reveal space-y-4">
                    <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <span
                        className="w-1.5 h-1.5 rounded-full animate-pulse"
                        style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                      />
                      <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                        About @{profile.handle}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      {profile.joinedDate && (
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">
                            Joined
                          </span>
                          <span className="text-white font-medium">{profile.joinedDate}</span>
                        </div>
                      )}
                      {profile.location && (
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">
                            Location
                          </span>
                          <span className="text-white font-medium">{profile.location}</span>
                        </div>
                      )}
                      {profile.websiteLink && (
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">
                            Website
                          </span>
                          <a
                            href={profile.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-amber-300 hover:underline font-medium block truncate"
                          >
                            {profile.websiteLink.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                      {profile.pronouns && (
                        <div>
                          <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">
                            Pronouns
                          </span>
                          <span className="text-white font-medium">{profile.pronouns}</span>
                        </div>
                      )}
                    </div>

                    {profile.bio && (
                      <div className="pt-3 border-t border-white/5">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold mb-1.5">
                          Biography
                        </span>
                        <p className="text-white/95 leading-relaxed text-[11px] whitespace-pre-wrap">
                          {profile.bio}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Top 3 Friends */}
            {(topThree.length > 0 || variant === "owner" || profile.uid === myUid) && (
              <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".22s" }}>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                    />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                      Top 3 Friends
                    </h3>
                    <span className="text-[9px] text-muted-foreground">· inner circle</span>
                  </div>
                  {topThree.length > 0 && (
                    <a
                      className="text-[9px] text-muted-foreground inline-flex items-center gap-0.5 hover:text-white"
                      href="#"
                    >
                      View all <ChevronRight className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
                {topThree.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3 md:gap-5 place-items-center pt-2 pb-1">
                    {topThree.slice(0, 3).map((entry, index) => {
                      const rankColors = [
                        { color: GOLD, accent: "#FFE066", defaultBadge: "BFF" },
                        { color: NEON_PURPLE, accent: "#E0E0E0", defaultBadge: "Day 1" },
                        { color: NEON_BLUE, accent: "#FF8A3D", defaultBadge: "Squad" },
                      ];
                      const style = rankColors[index] || rankColors[0];
                      return (
                        <div
                          key={entry.id || entry.featured_user_id}
                          className="relative group flex flex-col items-center gap-1.5"
                        >
                          <div className="relative w-20 h-20 md:w-24 md:h-24">
                            <div
                              aria-hidden
                              className="absolute -inset-1 rounded-full animate-spin-slow opacity-90"
                              style={{
                                background: `conic-gradient(from 0deg,${style.color},${style.accent},${style.color},transparent 70%,${style.color})`,
                              }}
                            />
                            <div
                              aria-hidden
                              className="absolute -inset-3 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition"
                              style={{
                                background: `radial-gradient(circle,${style.color}77,transparent 70%)`,
                              }}
                            />
                            <div className="absolute inset-0 rounded-full bg-[#05070D] p-[3px]">
                              <div className="w-full h-full rounded-full overflow-hidden border border-white/20">
                                <img
                                  src={entry.featured_avatar_url || fallPost2}
                                  alt={entry.featured_display_name || entry.featured_username || ""}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                />
                              </div>
                            </div>
                            <div
                              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 flex items-center justify-center"
                              style={{ color: style.color }}
                            >
                              <div
                                className="absolute inset-0 rounded-full blur-md opacity-70"
                                style={{ background: style.color }}
                              />
                              <div
                                className="absolute inset-0 rounded-full border-2"
                                style={{
                                  borderColor: style.color,
                                  background: `radial-gradient(circle at 35% 30%,${style.color}66,#0a0418 85%)`,
                                  backdropFilter: "blur(4px)",
                                  boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4),0 0 10px ${style.color}99`,
                                }}
                              />
                              <span
                                className="relative z-10 text-[14px] font-black leading-none"
                                style={{
                                  color: "#fff",
                                  textShadow: `0 1px 0 rgba(0,0,0,0.85),0 0 6px ${style.color}`,
                                }}
                              >
                                {entry.position || index + 1}
                              </span>
                            </div>
                          </div>
                          <div className="text-center max-w-[88px]">
                            <div className="text-[11px] font-bold text-white leading-tight truncate">
                              {entry.featured_display_name || entry.featured_username}
                            </div>
                            <div
                              className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block mt-0.5 text-black"
                              style={{
                                background: style.color,
                                boxShadow: `0 0 8px ${style.color}90`,
                              }}
                            >
                              {entry.is_mutual_top_three ? "Mutual" : style.defaultBadge}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs text-muted-foreground mb-3">
                      You haven't selected your Top 3 Friends yet.
                    </p>
                    <Link
                      to="/u/$uid/edit-profile"
                      params={{ uid: profile.uid }}
                      className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/40 hover:bg-primary/25 transition"
                    >
                      <Plus className="w-3 h-3" /> Add Top 3 Friends
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Connect links */}
            {(profile.socialInstagram ||
              profile.websiteLink ||
              profile.socialTikTok ||
              profile.socialYouTube) && (
              <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".25s" }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: PINK, boxShadow: `0 0 8px ${PINK}` }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    Connect
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                  {profile.socialInstagram && (
                    <LinkRow
                      icon={Instagram}
                      color="#EC4899"
                      accent="#A855F7"
                      title="Instagram"
                      sub={`@${profile.socialInstagram.replace(/^@/, "")}`}
                      href={
                        profile.socialInstagram.startsWith("http")
                          ? profile.socialInstagram
                          : `https://instagram.com/${profile.socialInstagram.replace(/^@/, "")}`
                      }
                    />
                  )}
                  {profile.websiteLink && (
                    <LinkRow
                      icon={Globe}
                      color="#22D3EE"
                      accent="#3B82F6"
                      title="Website"
                      sub={profile.websiteLink}
                      href={
                        profile.websiteLink.startsWith("http")
                          ? profile.websiteLink
                          : `https://${profile.websiteLink}`
                      }
                    />
                  )}
                  {profile.socialTikTok && (
                    <LinkRow
                      icon={Music2}
                      color="#22D3EE"
                      accent="#EC4899"
                      title="TikTok"
                      sub={`@${profile.socialTikTok.replace(/^@/, "")}`}
                      href={
                        profile.socialTikTok.startsWith("http")
                          ? profile.socialTikTok
                          : `https://tiktok.com/@${profile.socialTikTok.replace(/^@/, "")}`
                      }
                    />
                  )}
                  {profile.socialYouTube && (
                    <LinkRow
                      icon={Youtube}
                      color="#EF4444"
                      accent="#FF7700"
                      title="YouTube"
                      sub={
                        profile.socialYouTube.includes("youtube.com")
                          ? "Channel"
                          : `@${profile.socialYouTube.replace(/^@/, "")}`
                      }
                      href={
                        profile.socialYouTube.startsWith("http")
                          ? profile.socialYouTube
                          : profile.socialYouTube.includes("youtube.com")
                            ? `https://${profile.socialYouTube}`
                            : `https://youtube.com/@${profile.socialYouTube.replace(/^@/, "")}`
                      }
                    />
                  )}
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".3s" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                  />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200">
                    Badges
                  </h3>
                </div>
                <span className="text-[9px] text-muted-foreground">12 earned</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-2.5">
                <Medallion icon={Flame} label="Trendsetter" color="#FF7700" accent="#EF4444" />
                <Medallion icon={Rocket} label="Early" color="#A855F7" accent="#EC4899" />
                <Medallion icon={Stethoscope} label="Prescriber" color="#10B981" accent="#34D399" />
                <Medallion icon={Crown} label="Top" color="#FFC857" accent="#F59E0B" />
                <Medallion icon={Trophy} label="100K Club" color="#22D3EE" accent="#67E8F9" />
                <Medallion icon={Eye} label="Watcher" color="#6366F1" accent="#8B5CF6" />
                <Medallion icon={Heart} label="Loved" color="#EC4899" accent="#FF7700" />
                <Medallion icon={TrendingUp} label="Rising" color="#A3E635" accent="#65A30D" />
              </div>
            </div>

            {/* Prescribe Me */}
            <div
              className="panel neon-border p-3 relative overflow-hidden reveal"
              style={{ animationDelay: ".35s" }}
            >
              <div
                className="absolute inset-0 opacity-60"
                style={{
                  background: `radial-gradient(circle at 50% 40%,${PINK}33,transparent 60%)`,
                }}
              />
              <div className="relative flex items-center gap-3">
                <img
                  src={prescribeLock}
                  alt=""
                  className="h-16 w-auto animate-float shrink-0"
                  style={{ filter: "drop-shadow(0 0 20px rgba(255,80,200,0.7))" }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-200 mb-1">
                    Prescribe Me
                  </h3>
                  <p className="text-[10px] text-foreground/80 mb-2 leading-snug">
                    Unlock exclusive content & deeper access.
                  </p>
                  <button
                    className="rounded-full px-3 py-1.5 text-[10px] font-bold transition hover:scale-[1.02]"
                    style={{ background: GOLD, color: "#000", boxShadow: `0 0 16px ${GOLD}66` }}
                  >
                    Prescribe Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NOTE OF THE DAY POPUP (owner only) ───────────── */}
      {noteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Close"
            onClick={() => setNoteOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <div
            className="relative w-full max-w-sm panel neon-border p-4 rounded-2xl pop-in"
            style={{ boxShadow: `0 0 40px ${NEON_PURPLE}66,0 0 80px ${PINK}44` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: `${GOLD}1A`,
                    border: `1px solid ${GOLD}66`,
                    boxShadow: `0 0 12px ${GOLD}55`,
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <div>
                  <div className="text-sm font-bold leading-none">Note of the Day</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    Share what's on your mind
                  </div>
                </div>
              </div>
              <button
                onClick={() => setNoteOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-white/5 border border-white/10 mb-3">
              {(
                [
                  { id: "note", label: "Note", I: StickyNote, c: NEON_PURPLE },
                  { id: "gif", label: "GIF", I: ImageIcon, c: NEON_BLUE },
                ] as const
              ).map(({ id, label, I, c }) => (
                <button
                  key={id}
                  onClick={() => setNoteTab(id)}
                  className={`relative flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold transition ${noteTab === id ? "text-white" : "text-muted-foreground"}`}
                  style={
                    noteTab === id
                      ? {
                          background: `${c}26`,
                          boxShadow: `0 0 14px ${c}55,inset 0 0 8px ${c}33`,
                          border: `1px solid ${c}66`,
                        }
                      : {}
                  }
                >
                  <I className="w-3.5 h-3.5" style={noteTab === id ? { color: c } : undefined} />{" "}
                  {label}
                </button>
              ))}
            </div>
            {noteTab === "note" ? (
              <div>
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 50))}
                    placeholder="What's the vibe today?"
                    rows={3}
                    className="w-full resize-none rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-[12px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-400/60 transition"
                  />
                  <div
                    className="absolute bottom-2 right-2.5 text-[9px] font-semibold tabular-nums"
                    style={{
                      color:
                        note.length >= 50
                          ? PINK
                          : note.length >= 40
                            ? GOLD
                            : "rgba(255,255,255,0.5)",
                    }}
                  >
                    {note.length}/50
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {FALL_POSTS.concat([fallPost1]).map((src, i) => (
                  <button
                    key={i}
                    className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/60 transition group"
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                    />
                    <div className="absolute bottom-1 left-1 text-[8px] font-bold text-white/90 bg-black/60 px-1 rounded">
                      GIF
                    </div>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setNoteOpen(false)}
              className="mt-3 w-full rounded-full py-2 text-[12px] font-bold transition active:scale-95"
              style={{
                background: `linear-gradient(90deg,${NEON_PURPLE},${PINK},${GOLD})`,
                color: "#0a0a0a",
                boxShadow: `0 0 20px ${NEON_PURPLE}66`,
              }}
            >
              Post for today
            </button>
          </div>
        </div>
      )}
      <FwdGifPicker
        open={showFwdPicker}
        context="profile"
        treyTvUid={myUid || null}
        onClose={() => setShowFwdPicker(false)}
        onSelect={() => {
          setShowFwdPicker(false);
          toast.success("FWD GIF selected. Use Edit Profile to feature it as GIF of the Day.");
        }}
      />

      <FwdGifPicker
        open={showCommentGifPicker}
        context="profile"
        treyTvUid={myUid || null}
        onClose={() => setShowCommentGifPicker(false)}
        onSelect={(gif) => {
          if (selectedPost) {
            const gifUrl = getAnimatedFwdGifUrl(gif) || gif.url;
            const newComment = {
              author: authUser?.name || "You",
              avatar: authUser?.avatar || fallPost2,
              text: commentText.trim() || "Sent a FWD GIF 🎬",
              time: "Just now",
              gifUrl,
            };
            setPostComments((prev) => ({
              ...prev,
              [selectedPost.id]: [...(prev[selectedPost.id] || []), newComment],
            }));
            setCommentText("");
            toast.success("FWD GIF comment posted!");
          }
          setShowCommentGifPicker(false);
        }}
      />

      {/* ── INTERACTIVE POST DETAIL MODAL ────────────────── */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-black/85 animate-fade-in">
          <button
            aria-label="Close"
            onClick={() => setSelectedPost(null)}
            className="absolute inset-0 cursor-default bg-transparent"
          />

          <div className="relative w-full max-w-4xl h-[85vh] md:h-[580px] flex flex-col md:grid md:grid-cols-5 panel neon-border overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#05070D]/95 pop-in shadow-[0_0_60px_rgba(34,183,255,0.18)]">
            {/* Global floating Close Button for maximum screen space efficiency */}
            <button
              onClick={() => setSelectedPost(null)}
              className="absolute top-3 right-3 z-50 size-8 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 flex items-center justify-center backdrop-blur-md active:scale-90 transition shadow-lg text-white/90 hover:text-white"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Left media col */}
            <div className="relative w-full h-[40%] md:h-full md:col-span-3 bg-black/60 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/10 group overflow-hidden shrink-0">
              <img
                src={selectedPost.img}
                alt={selectedPost.title}
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-102"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/15 to-transparent" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center backdrop-blur-md hover:scale-110 active:scale-90 transition cursor-pointer shadow-[0_0_20px_rgba(255,200,87,0.35)]">
                  <Play className="w-5 h-5 md:w-6 md:h-6 fill-current text-white ml-0.5" />
                </div>
              </div>

              {/* Title, views, duration */}
              <div className="absolute bottom-3 left-4 right-4 text-left">
                <div className="text-[9px] uppercase font-bold tracking-[0.25em] text-cyan-400 mb-0.5">
                  Streaming Now
                </div>
                <h4 className="text-sm md:text-base font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] truncate sm:whitespace-normal">
                  {selectedPost.title}
                </h4>
                <div className="mt-1 md:mt-2 flex items-center gap-3 text-[9px] md:text-[10px] font-bold text-white/80">
                  <span className="inline-flex items-center gap-0.5">
                    <Play className="w-2.5 h-2.5 fill-current" /> {selectedPost.views} views
                  </span>
                  <span>·</span>
                  <span>{selectedPost.duration} length</span>
                </div>
              </div>
            </div>

            {/* Right details / comments col */}
            <div className="relative w-full h-[60%] md:h-full md:col-span-2 flex flex-col p-3 sm:p-4 bg-[#08080E]/95 overflow-hidden flex-1">
              {/* Creator Header (More compact) */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5 shrink-0 pr-8">
                <div className="flex items-center gap-2">
                  <img
                    src={profile.avatarUrl || fallPost2}
                    alt=""
                    className="size-8 rounded-full object-cover ring-2 ring-primary/25"
                  />
                  <div className="min-w-0 text-left">
                    <div className="text-[11px] md:text-xs font-black text-white truncate flex items-center gap-0.5">
                      {profile.displayName}
                      {showVerifiedBadge && <GoldCheck size={12} className="shrink-0" />}
                    </div>
                    <div className="text-[8px] md:text-[9px] text-muted-foreground">
                      @{profile.handle}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Feed (Compact list, responsive spacing) */}
              <div className="flex-1 overflow-y-auto space-y-2.5 py-2.5 pr-1 my-1 border-b border-white/5 scrollbar-thin scrollbar-thumb-white/10">
                {(postComments[selectedPost.id] || []).length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-3">
                    <div className="text-muted-foreground text-[11px] font-bold mb-0.5">
                      No comments yet
                    </div>
                    <div className="text-[9px] text-muted-foreground/60 leading-tight">
                      Be the first to share your thoughts on this drop!
                    </div>
                  </div>
                ) : (
                  (postComments[selectedPost.id] || []).map((c, idx) => (
                    <div
                      key={idx}
                      className="flex gap-2 items-start text-xs text-left animate-fade-in"
                    >
                      <img
                        src={c.avatar}
                        alt=""
                        className="size-6 sm:size-7 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0 bg-white/[0.015] border border-white/5 px-2.5 py-1.5 rounded-xl">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-extrabold text-white truncate text-[10px] sm:text-[11px]">
                            {c.author}
                          </span>
                          <span className="text-[8px] text-muted-foreground shrink-0">
                            {c.time}
                          </span>
                        </div>
                        <p className="text-white/90 leading-snug text-[10px] sm:text-[11px]">
                          {c.text}
                        </p>
                        {c.gifUrl && (
                          <div className="mt-1 rounded-lg overflow-hidden border border-white/10 max-w-[120px] aspect-video">
                            <img
                              src={c.gifUrl}
                              alt="gif comment"
                              className="size-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reactions Row (Ultra-compact, neat wrap) */}
              <div className="pt-1.5 shrink-0 text-left">
                <div className="text-[8px] md:text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1 pl-0.5">
                  Reactions
                </div>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(
                    postReactions[selectedPost.id] || { "🔥": 0, "❤️": 0, "👑": 0, "🙌": 0 },
                  ).map(([emoji, count]) => {
                    const active = myReactions[selectedPost.id]?.includes(emoji);
                    return (
                      <button
                        key={emoji}
                        onClick={() => {
                          if (isGuest) {
                            toast.error("Please sign in to react to posts!");
                            return;
                          }
                          const postId = selectedPost.id;
                          const hasReacted = myReactions[postId]?.includes(emoji);

                          setPostReactions((prev) => {
                            const cur = prev[postId] || {};
                            return {
                              ...prev,
                              [postId]: {
                                ...cur,
                                [emoji]: Math.max(0, (cur[emoji] || 0) + (hasReacted ? -1 : 1)),
                              },
                            };
                          });

                          setMyReactions((prev) => {
                            const cur = prev[postId] || [];
                            return {
                              ...prev,
                              [postId]: hasReacted
                                ? cur.filter((e) => e !== emoji)
                                : [...cur, emoji],
                            };
                          });
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition duration-300 ${
                          active
                            ? "bg-primary/20 border-primary/40 text-white shadow-[0_0_8px_rgba(255,200,87,0.25)] scale-105"
                            : "bg-white/[0.02] border-white/10 text-white/70 hover:border-white/15 hover:bg-white/[0.05]"
                        }`}
                      >
                        <span>{emoji}</span>
                        <span className="text-[9px] font-bold tabular-nums">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text comment and FWD input */}
              <div className="pt-2 border-t border-white/5 mt-2 shrink-0">
                {isGuest ? (
                  <div className="text-center py-2 rounded-lg border border-white/10 bg-white/[0.01]">
                    <p className="text-[9px] text-muted-foreground">
                      Sign in to leave comments or send FWD GIFs.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="relative flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder="Drop a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (!commentText.trim()) return;
                            const postId = selectedPost.id;
                            const newComment = {
                              author: authUser?.name || "You",
                              avatar: authUser?.avatar || fallPost2,
                              text: commentText.trim(),
                              time: "Just now",
                            };
                            setPostComments((prev) => ({
                              ...prev,
                              [postId]: [...(prev[postId] || []), newComment],
                            }));
                            setCommentText("");
                          }
                        }}
                        className="flex-1 pl-3.5 pr-9 py-2 rounded-full bg-white/[0.02] border border-white/10 text-[11px] text-white focus:outline-none focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/10 transition text-left"
                      />

                      <button
                        onClick={() => setShowCommentGifPicker(true)}
                        className="absolute right-3 p-1 text-muted-foreground hover:text-cyan-400 transition"
                        title="Send a FWD GIF"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[8px] text-muted-foreground/60 px-1 leading-none">
                      <span>Press Enter to comment</span>
                      <span>Or send a FWD GIF</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SONG PICKER MODAL (owner only) ────────────────── */}
      {showSongPicker && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <button
            aria-label="Close"
            onClick={() => setShowSongPicker(false)}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
          />
          <div className="relative w-full max-w-sm panel neon-border p-4 rounded-3xl bg-[#090518]/95 pop-in shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/15 border border-purple-500/30">
                  <Music2 className="w-4 h-4 text-purple-400 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white text-left">
                    Select Profile Theme Song
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-0.5 text-left">
                    Choose a track to autoplay on your profile
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSongPicker(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition active:scale-90"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {SELECTABLE_SONGS.map((song) => {
                const isSelected = autoplaySong.id === song.id;
                return (
                  <div
                    key={song.id}
                    className={`flex items-center gap-3 p-2 rounded-xl border transition-all ${
                      isSelected
                        ? "text-white"
                        : "bg-white/[0.01] border-white/5 text-slate-300 hover:bg-white/[0.03] hover:border-white/10"
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: "rgba(var(--profile-accent-rgb), 0.1)",
                            borderColor: "rgba(var(--profile-accent-rgb), 0.3)",
                          }
                        : {}
                    }
                  >
                    <img
                      src={song.art}
                      alt=""
                      className="size-9 rounded-lg object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className="text-[10px] font-bold truncate">{song.title}</h4>
                      <p className="text-[9px] text-slate-400 mt-0.5 truncate">{song.artist}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAutoplaySong(song);
                        localStorage.setItem(autoplayStorageKey, JSON.stringify(song));
                        setShowSongPicker(false);
                        setIsPlaying(false);
                        if (isOwner) {
                          const supabase = createBrowserClient();
                          (supabase as any)
                            .from("profiles")
                            .update({ profile_song_id: song.id })
                            .eq("public_profile_uid", profile.uid)
                            .then(({ error }: any) => {
                              if (error) {
                                console.error("Failed to sync theme song to database:", error);
                              } else {
                                toast.success("Theme song synced to your profile database!");
                              }
                            });
                        }
                        setTimeout(() => {
                          if (audioRef.current) {
                            audioRef.current.src = song.src;
                            audioRef.current
                              .play()
                              .then(() => setIsPlaying(true))
                              .catch(() => setIsPlaying(false));
                          }
                        }, 50);
                        toast.success(`Theme song set to: ${song.title}`);
                      }}
                      className={`text-[9px] font-bold px-2.5 py-1 rounded-full transition-all ${
                        isSelected
                          ? "text-black"
                          : "bg-white/5 border-white/10 hover:border-white/20 text-white"
                      }`}
                      style={
                        isSelected
                          ? {
                              backgroundColor: "var(--profile-accent)",
                              boxShadow: "0 0 8px var(--profile-accent)",
                            }
                          : {}
                      }
                    >
                      {isSelected ? "Active" : "Select"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* HTML5 Audio Player for Background Theme Music */}
      <audio
        ref={audioRef}
        src={autoplaySong.src}
        data-is-music="true"
        data-castable="true"
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Inline styles for custom animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes visualizer-bounce {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1.3); }
        }
      `}</style>
    </div>
  );
}
