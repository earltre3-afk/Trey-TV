import {
  useEffect,
  useId,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type SVGProps,
} from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;
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
  Plus,
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

import { AvatarWithFallback } from "@/components/brand/DefaultAvatar";
import { GiftPickerSheet } from "@/components/gifts/GiftPickerSheet";
import { ProfilePictureLink } from "@/components/profile/ProfileAvatarLink";
import type {
  ProfileData,
  RelationshipStatus,
  TopThreeEntry,
  ViewerRole,
} from "@/components/profile/ProfileTypes";
import { toggleFollow } from "@/lib/social-relationships";
import portrait from "@/assets/lovable-profile-portrait.jpg";
import heroBg from "@/assets/lovable-hero-bg.jpg";
import treyTvLogo from "@/assets/trey-tv-logo.png";
import taurusBull from "@/assets/lovable-taurus-bull.png";
import prescribeLock from "@/assets/lovable-prescribe-lock.png";
import post1 from "@/assets/lovable-post1.jpg";
import post2 from "@/assets/lovable-post2.jpg";
import post3 from "@/assets/lovable-post3.jpg";
import post4 from "@/assets/lovable-post4.jpg";
import post5 from "@/assets/lovable-post5.jpg";

const GOLD = "#FFC857";
const NEON_BLUE = "#22D3EE"; // shifted to cyan for the iridescent violet→pink→cyan ombré
const NEON_PURPLE = "#A855F7";
const PINK = "#EC4899";
const GREEN = "#22C55E";
const RED = "#EF4444";

import { GoldCheck } from "@/components/brand/Badge";

/* ---------- helpers ---------- */
function Spark({ color, data }: { color: string; data: number[] }) {
  const w = 100,
    h = 28;
  const max = Math.max(...data),
    min = Math.min(...data);
  const step = w / (data.length - 1);
  const pts = data
    .map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`)
    .join(" ");
  const id = `g-${color.replace(/[^a-z0-9]/gi, "")}`;
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

function Stat({
  icon: Icon,
  color,
  label,
  value,
  delta,
  data,
}: {
  icon: IconType;
  color: string;
  label: string;
  value: string | number;
  delta: string | number;
  data: number[];
}) {
  return (
    <div className="panel px-2 py-1.5 hover-lift">
      <div className="flex items-center gap-1.5">
        <Icon className="w-3 h-3 shrink-0" style={{ color }} />
        <div className="text-sm font-bold leading-none">{value}</div>
        <span className="text-[8px] font-semibold ml-auto" style={{ color }}>
          ↑{delta}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <div className="text-[8px] text-muted-foreground truncate flex-1">{label}</div>
        <div className="w-12">
          <Spark color={color} data={data} />
        </div>
      </div>
    </div>
  );
}

function Quick({
  icon: Icon,
  color,
  label,
  sub,
}: {
  icon: IconType;
  color: string;
  label: string;
  sub: string;
}) {
  return (
    <button className="panel p-2.5 flex items-center gap-2 text-left hover-lift w-full">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}1A`, color, boxShadow: `0 0 14px ${color}33 inset` }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold truncate leading-tight">{label}</div>
        <div className="text-[9px] text-muted-foreground truncate">{sub}</div>
      </div>
    </button>
  );
}

function LinkRow({
  icon: Icon,
  color,
  accent,
  title,
  sub,
  href = "#",
}: {
  icon: IconType;
  color: string;
  accent?: string;
  title: string;
  sub: string;
  href?: string;
}) {
  const c2 = accent ?? color;
  const grad = `linear-gradient(135deg, ${color}, ${c2})`;
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className="group relative panel px-2.5 py-2 flex items-center gap-2 hover-lift cursor-pointer overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}1F, ${c2}14 70%)`,
        borderColor: `${color}55`,
      }}
    >
      {/* animated shimmer sweep on hover */}
      <span
        className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(110deg, transparent 40%, ${c2}40 50%, transparent 60%)`,
        }}
      />
      {/* glowing colored aura behind icon */}
      <span
        className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full blur-xl opacity-50 group-hover:opacity-90 transition"
        style={{ background: grad }}
      />
      <div
        className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-white"
        style={{
          background: grad,
          border: `1px solid ${color}88`,
          boxShadow: `0 0 14px ${color}66, 0 0 20px ${c2}40, inset 0 1px 0 rgba(255,255,255,0.35)`,
        }}
      >
        <Icon className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]" />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-[11px] font-bold truncate leading-tight" style={{ color: "#fff" }}>
          {title}
        </div>
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

function Medallion({
  icon: Icon,
  label,
  color,
  accent,
}: {
  icon: IconType;
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
            background: `linear-gradient(135deg, ${color}26, ${c2}14)`,
            border: `1px solid transparent`,
            backgroundClip: "padding-box",
            boxShadow: `inset 0 0 0 1px ${color}88, 0 0 10px ${c2}55`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 rounded-full opacity-90"
          style={{
            padding: 1,
            background: grad,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <Icon
          className="w-5 h-5 relative z-10 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.55)]"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </div>
      <span className="text-[9px] text-foreground/80 text-center leading-tight">{label}</span>
    </div>
  );
}

export type ProfileVariant = "owner" | "creator" | "user" | "public";

export interface LovableProfilePageProps {
  variant?: ProfileVariant;
  profile: ProfileData;
  viewerRole: ViewerRole;
  relationshipStatus?: RelationshipStatus;
  topThree?: TopThreeEntry[];
  profileUserId?: string;
  onBack?: () => void;
}

function formatStat(value: number | string | undefined) {
  if (typeof value === "number") {
    if (value >= 1_000_000)
      return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  }
  return value ?? "0";
}

function normalizeLink(value?: string | null) {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value.replace(/^@/, "")}`;
}

function socialHandle(value?: string | null) {
  if (!value) return "";
  return value.startsWith("@") ? value : `@${value.replace(/^https?:\/\/(www\.)?[^/]+\//i, "")}`;
}

export function ProfilePage({
  variant = "owner",
  profile,
  viewerRole,
  relationshipStatus,
  topThree = [],
  profileUserId,
  onBack,
}: LovableProfilePageProps) {
  const [noteOpen, setNoteOpen] = useState(false);
  const [tab, setTab] = useState<"note" | "gif">("note");
  const [note, setNote] = useState("");
  const [giftOpen, setGiftOpen] = useState(false);
  const [following, setFollowing] = useState(Boolean(relationshipStatus?.is_following));
  const [followerDelta, setFollowerDelta] = useState(0);

  useEffect(() => {
    setFollowing(Boolean(relationshipStatus?.is_following));
    setFollowerDelta(0);
  }, [relationshipStatus?.is_following, profile.uid]);

  const isPublic = variant === "public";
  const showOwnerBadge = Boolean(profile.isFounder);
  const showAdminBadge = Boolean(profile.isFounder);
  const showCreatorBadge = profile.profileType === "creator";
  const showVerifiedBadge = Boolean(profile.isVerified);
  const showChannelCTA = profile.profileType === "creator";
  const showGiftButton = viewerRole !== "owner" && profile.profileType === "creator";
  const showSelfControls = viewerRole === "owner";
  const showFounderNoteControls = showSelfControls && Boolean(profile.isFounder);
  const showPrescribePanel = profile.profileType === "creator" || Boolean(profile.isFounder);
  const profileUrl = `/u/${profile.uid}`;
  const channelUrl = `/u/${profile.uid}/channel`;
  const followers = useMemo(() => {
    const current = Number(profile.stats.followers);
    return Number.isFinite(current)
      ? Math.max(0, current + followerDelta)
      : profile.stats.followers;
  }, [profile.stats.followers, followerDelta]);
  const displayName = profile.displayName || "Trey TV Member";
  const handle = profile.handle || profile.uid;
  const bio = profile.bio || "This Trey TV profile is being built.";
  const isFounderDemo = Boolean(profile.isFounder);
  const showZodiac = Boolean(profile.zodiacSunSign || profile.zodiacCuspLabel || isFounderDemo);
  const zodiacLabel = profile.zodiacCuspLabel || profile.zodiacSunSign || "Taurus";
  const canFollow = viewerRole !== "owner" && relationshipStatus?.can_follow !== false;
  const socialLinks = [
    profile.socialInstagram && {
      icon: Instagram,
      color: PINK,
      accent: NEON_PURPLE,
      title: "Instagram",
      sub: socialHandle(profile.socialInstagram),
      href: normalizeLink(`instagram.com/${profile.socialInstagram.replace(/^@/, "")}`),
    },
    profile.websiteLink && {
      icon: Globe,
      color: NEON_BLUE,
      accent: "#3B82F6",
      title: "Website",
      sub: profile.websiteLink,
      href: normalizeLink(profile.websiteLink),
    },
    profile.socialTikTok && {
      icon: Music2,
      color: "#fff",
      accent: PINK,
      title: "TikTok",
      sub: socialHandle(profile.socialTikTok),
      href: normalizeLink(`tiktok.com/@${profile.socialTikTok.replace(/^@/, "")}`),
    },
    profile.socialYouTube && {
      icon: Youtube,
      color: RED,
      accent: "#FF7700",
      title: "YouTube",
      sub: socialHandle(profile.socialYouTube),
      href: normalizeLink(profile.socialYouTube),
    },
  ].filter(Boolean) as {
    icon: IconType;
    color: string;
    accent: string;
    title: string;
    sub: string;
    href: string;
  }[];
  const topThreeCards = topThree
    .slice()
    .sort((a, b) => a.position - b.position)
    .slice(0, 3)
    .map((entry, index) => ({
      name: entry.featured_display_name || entry.featured_username || "Trey TV Member",
      handle: entry.featured_username ? `@${entry.featured_username}` : "",
      img: entry.featured_avatar_url || "",
      uid: entry.featured_public_profile_uid || "",
      rank: entry.position || index + 1,
      color: [GOLD, NEON_PURPLE, NEON_BLUE][index] || GOLD,
      accent: ["#FFE066", "#E0E0E0", "#FF8A3D"][index] || GOLD,
      badge: entry.is_mutual_top_three ? "Mutual" : `Top ${entry.position || index + 1}`,
    }));
  const earnedBadges = [
    showOwnerBadge && { icon: Crown, label: "Owner", color: GOLD, accent: PINK },
    showAdminBadge && { icon: ShieldCheck, label: "Admin", color: PINK, accent: NEON_BLUE },
    showCreatorBadge && { icon: Sparkles, label: "Creator", color: GOLD, accent: NEON_PURPLE },
    showVerifiedBadge && {
      icon: BadgeCheck,
      label: "Verified",
      color: profile.verifiedKind === "user" ? GREEN : GOLD,
      accent: NEON_BLUE,
    },
  ].filter(Boolean) as { icon: IconType; label: string; color: string; accent: string }[];

  const handleFollow = async () => {
    if (viewerRole === "guest") {
      window.location.href = "/signup";
      return;
    }
    if (!profileUserId || !canFollow) return;
    const previous = following;
    setFollowing(!previous);
    setFollowerDelta((delta) => delta + (previous ? -1 : 1));
    const success = await toggleFollow(profileUserId, previous);
    if (!success) {
      setFollowing(previous);
      setFollowerDelta((delta) => delta + (previous ? 1 : -1));
      toast.error("Could not update follow state");
      return;
    }
    toast.success(previous ? `Unfollowed ${displayName}` : `Following ${displayName}`);
  };

  const handleShare = async () => {
    try {
      await navigator.share?.({ title: `${displayName} on Trey TV`, url: location.href });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast.success("Profile link copied");
    }
  };

  const posts = [
    { img: post1, views: "34.2K", time: "1:24", pinned: true },
    { img: post2, views: "52.6K", time: "2:08" },
    { img: post3, views: "12.1K", time: "0:58" },
    { img: post4, views: "18.7K", time: "1:45" },
    { img: post5, views: "24.3K", time: "2:12" },
  ].filter(() => isFounderDemo);

  return (
    <main className="min-h-screen pb-32">
      {/* ambient neon blobs */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-30"
          style={{ background: `radial-gradient(circle, ${NEON_PURPLE}, transparent 60%)` }}
        />
        <div
          className="absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-25"
          style={{ background: `radial-gradient(circle, ${NEON_BLUE}, transparent 60%)` }}
        />
        <div
          className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full blur-3xl opacity-20"
          style={{ background: `radial-gradient(circle, ${PINK}, transparent 60%)` }}
        />
      </div>

      {/* ============ FULL-WIDTH BANNER ============ */}
      <section className="relative w-full reveal">
        <div className="relative h-[220px] sm:h-[260px] md:h-[300px] w-full overflow-hidden">
          <img
            src={profile.bannerUrl || (isFounderDemo ? heroBg : "")}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/40 to-[#05070D]/10" />
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${NEON_PURPLE}40, transparent 60%)`,
            }}
          />

          {/* top buttons */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Go back"
            className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition z-20"
          >
            <ArrowLeft aria-hidden="true" className="w-4 h-4" />
          </button>
          <div className="absolute top-3 right-3 flex gap-1.5 z-20">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share profile"
              className="w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition"
            >
              <Share aria-hidden="true" className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label="More options"
              className="w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition"
            >
              <MoreHorizontal aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          {/* ============ TREY TV LOGO (top-center brand mark) ============ */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="relative logo-anim w-[160px] sm:w-[200px] md:w-[240px]">
              {/* Soft elliptical neon halo — palette-matched, no boxy gold bloom */}
              <div
                aria-hidden
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[70%] rounded-[50%] blur-3xl opacity-60 logo-halo-pulse"
                style={{
                  background: `radial-gradient(ellipse at center, ${NEON_PURPLE}55 0%, ${NEON_BLUE}33 45%, transparent 70%)`,
                }}
              />
              {/* Logo */}
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
                    "linear-gradient(to bottom, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.18) 38%, rgba(255,255,255,0) 55%)",
                }}
              />
              {/* Animated sweeping sheen — clipped to logo */}
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
                      "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.9) 50%, transparent 65%)",
                    filter: "blur(2px)",
                  }}
                />
              </div>
              {/* Bottom depth shadow */}
              <div
                aria-hidden
                className="absolute inset-0 mix-blend-multiply opacity-40"
                style={{
                  WebkitMaskImage: `url(${treyTvLogo})`,
                  maskImage: `url(${treyTvLogo})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                  background: "linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 40%)",
                }}
              />
            </div>
          </div>

          {/* Bottom fade so avatar reads */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05070D] to-transparent" />
        </div>

        {/* ============ AVATAR (center-bottom of banner, overlapping) ============ */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 z-30">
          <div className="relative w-[120px] h-[120px] md:w-[150px] md:h-[150px]">
            {/* Soft outer halo */}
            <div className="absolute -inset-10 rounded-full bg-violet/25 blur-3xl" />
            {/* Refined conic gradient ring */}
            <div
              className="absolute -inset-[5px] rounded-full ring-gradient animate-spin-slow opacity-80"
              style={{ filter: "blur(0.5px)" }}
            />
            {/* Subtle pulsing neon ring */}
            <div className="absolute -inset-[2px] rounded-full ring-pulse opacity-90" />
            {/* Inner mask */}
            <div className="absolute inset-0 rounded-full bg-[#05070D] overflow-hidden border border-white/10">
              <AvatarWithFallback
                src={profile.avatarUrl || (isFounderDemo ? portrait : "")}
                alt={displayName}
                name={displayName}
                uid={profile.uid}
                size="2xl"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gold check (Twitter-style) */}
            {showVerifiedBadge && (
              <div className="absolute -bottom-1 -right-1">
                <GoldCheck size={42} />
              </div>
            )}

            {/* WHITE PLUS button — opens daily note / gif menu */}
            {showFounderNoteControls && (
              <button
                onClick={() => setNoteOpen(true)}
                aria-label="Add note or GIF of the day"
                className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center
                           bg-white text-black border-2 border-white/80 shadow-[0_0_18px_rgba(255,255,255,0.85)]
                           hover:scale-110 active:scale-95 transition-transform plus-pulse z-10"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-[1280px] mx-auto px-3 md:px-6 pt-[72px] md:pt-20">
        {/* ============ HERO IDENTITY (centered under avatar) ============ */}
        <div className="max-w-2xl mx-auto mb-5 md:mb-7">
          {/* ============ IDENTITY ============ */}
          <div className="text-center reveal">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-[26px] md:text-3xl font-extrabold metallic-chrome drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {displayName}
              </h1>
              {showVerifiedBadge && <GoldCheck size={22} />}
            </div>
            <div className="mt-1 text-[11px] tracking-wide text-muted-foreground">@{handle}</div>

            {/* ROLE PILLS — refined tonal glass with accent edge */}
            <div className="mt-2.5 flex items-center justify-center flex-wrap sm:flex-nowrap gap-1.5 px-2">
              {showOwnerBadge && (
                <span
                  key="Owner"
                  className="owner-badge inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] whitespace-nowrap px-2.5 py-[4px] sm:px-3 sm:py-[5px] rounded-full"
                >
                  <span aria-hidden className="owner-badge__shine" />
                  <span aria-hidden className="owner-badge__crown">
                    <Crown className="w-2.5 h-2.5" strokeWidth={2.5} />
                  </span>
                  <span className="owner-badge__text">Owner</span>
                </span>
              )}
              {(
                [
                  showVerifiedBadge && {
                    I: GoldCheck as IconType,
                    l: "Verified",
                    c: GOLD,
                    gold: true,
                  },
                  showCreatorBadge && { I: Sparkles, l: "Creator", c: NEON_PURPLE, gold: false },
                  showAdminBadge && { I: ShieldCheck, l: "Admin", c: PINK, gold: false },
                ].filter(Boolean) as { I: IconType; l: string; c: string; gold: boolean }[]
              ).map(({ I, l, c, gold }) => (
                <span
                  key={l}
                  className="role-pill inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-white/95 px-2 py-[3px] sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap"
                  style={{ "--pill-c": c } as CSSProperties}
                >
                  <span aria-hidden className="role-pill__shine" />
                  <span aria-hidden className="role-pill__ring" />
                  {gold ? (
                    <GoldCheck size={11} className="role-pill__icon" />
                  ) : (
                    <I
                      className="w-2.5 h-2.5 role-pill__icon"
                      strokeWidth={2.5}
                      style={{ color: c }}
                    />
                  )}
                  <span className="role-pill__label" style={{ textShadow: `0 0 8px ${c}66` }}>
                    {l}
                  </span>
                </span>
              ))}
            </div>

            <p className="mt-2 text-[12px] text-foreground/85 leading-snug px-4">{bio}</p>
            <div className="mt-1.5 flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="w-3 h-3" style={{ color: GOLD }} />{" "}
                {profile.showLocation === false
                  ? "Location hidden"
                  : profile.location || "Location not set"}
              </span>
              {profile.websiteLink && (
                <span className="inline-flex items-center gap-0.5">
                  <Link2 className="w-3 h-3" style={{ color: NEON_BLUE }} /> {profile.websiteLink}
                </span>
              )}
            </div>

            {/* ACTION ROW — Follow / Subscribe / Message / Gift */}
            <div
              className={`mt-3 grid gap-2 max-w-md mx-auto ${showGiftButton ? "grid-cols-4" : "grid-cols-3"} ${showSelfControls ? "hidden" : ""}`}
            >
              {[
                {
                  l: following ? "Following" : "Follow",
                  I: following ? BadgeCheck : UserPlus,
                  c: NEON_PURPLE,
                  primary: true,
                  onClick: handleFollow,
                },
                ...(showCreatorBadge
                  ? [
                      {
                        l: "Subscribe",
                        I: Sparkles,
                        c: GOLD,
                        primary: false,
                        onClick: () => toast("Creator subscriptions are coming soon."),
                      },
                    ]
                  : []),
                {
                  l: "Message",
                  I: Mail,
                  c: NEON_BLUE,
                  primary: false,
                  onClick: () => {
                    window.location.href = `/inbox?to=${encodeURIComponent(handle)}`;
                  },
                },
                ...(showGiftButton
                  ? [
                      {
                        l: "Gift",
                        I: Heart,
                        c: PINK,
                        primary: false,
                        onClick: () => setGiftOpen(true),
                      },
                    ]
                  : []),
              ].map(({ l, I, c, primary, onClick }) => (
                <button
                  key={l}
                  type="button"
                  onClick={onClick}
                  disabled={l === "Follow" && !canFollow}
                  className="cert-btn group"
                  data-primary={primary ? "true" : "false"}
                  style={{ "--btn-c": c } as CSSProperties}
                >
                  <span aria-hidden className="cert-btn__border" />
                  <span aria-hidden className="cert-btn__surface" />

                  {/* tiny certified tick — top right */}
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

            {showChannelCTA && (
              <div className="mt-3 flex justify-center">
                <Link
                  to={channelUrl as any}
                  className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-[12px] uppercase tracking-[0.18em] text-black overflow-hidden active:scale-95 hover:scale-[1.04] transition-transform"
                  style={{
                    background: `linear-gradient(135deg, #FFE9A8 0%, ${GOLD} 35%, #E9A917 60%, #FFF3C4 100%)`,
                    boxShadow: `0 0 0 1px rgba(255,255,255,0.35) inset, 0 0 22px ${GOLD}99, 0 0 48px ${GOLD}66, 0 8px 30px rgba(0,0,0,0.55)`,
                  }}
                >
                  <span
                    aria-hidden
                    className="absolute -inset-[2px] rounded-full opacity-90 animate-spin-slow -z-10"
                    style={{
                      background: `conic-gradient(from 0deg, ${GOLD}, ${PINK}, ${NEON_PURPLE}, ${NEON_BLUE}, ${GOLD})`,
                      filter: "blur(6px)",
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 38%, rgba(255,255,255,0.85) 50%, transparent 62%)",
                    }}
                  />
                  <Play className="w-4 h-4 fill-black" strokeWidth={2.5} />
                  <span className="relative">View My Channel</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={3} />
                </Link>
              </div>
            )}

            {/* ============ EDIT PROFILE + VIEW PUBLIC (owner only) ============ */}
            {showSelfControls && (
              <div className="mt-2 flex justify-center items-center gap-2">
                <Link
                  to="/u/$uid/edit-profile"
                  params={{ uid: profile.uid }}
                  className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  <Pencil className="w-3.5 h-3.5" style={{ color: GOLD }} />
                  <span>Edit Profile</span>
                </Link>

                <Link
                  to={profileUrl as any}
                  aria-label="View public profile"
                  className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white overflow-hidden active:scale-95 hover:scale-[1.03] transition-transform"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(168,85,247,0.18), rgba(236,72,153,0.18) 50%, rgba(34,211,238,0.18))",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,0.18), 0 6px 22px rgba(168,85,247,0.35), 0 6px 22px rgba(34,211,238,0.25)",
                  }}
                >
                  {/* iridescent conic border */}
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full p-[1px]"
                    style={{
                      background: `conic-gradient(from 0deg, ${NEON_PURPLE}, ${PINK}, ${NEON_BLUE}, ${NEON_PURPLE})`,
                      WebkitMask:
                        "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
                      WebkitMaskComposite: "xor",
                      maskComposite: "exclude",
                    }}
                  />
                  {/* glass surface */}
                  <span
                    aria-hidden
                    className="absolute inset-[1px] rounded-full -z-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02) 40%, rgba(0,0,0,0.35))",
                      backdropFilter: "blur(8px)",
                    }}
                  />
                  {/* shimmer sweep */}
                  <span
                    aria-hidden
                    className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.45) 50%, transparent 60%)",
                    }}
                  />
                  <Eye
                    className="relative w-3.5 h-3.5"
                    style={{ color: NEON_BLUE }}
                    strokeWidth={2.5}
                  />
                  <span className="relative">View Public Profile</span>
                  <ExternalLink className="relative w-3 h-3 opacity-80" strokeWidth={2.5} />
                </Link>
              </div>
            )}

            {isPublic && (
              <div className="mt-2 flex justify-center">
                <Link
                  to={profileUrl as any}
                  className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition"
                  style={{
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 6px 18px rgba(0,0,0,0.45)",
                  }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" style={{ color: NEON_PURPLE }} />
                  <span>Back to My View</span>
                </Link>
              </div>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-3.5 flex items-center justify-center gap-1">
                {socialLinks.map(({ icon: I, color: c, title, href }) => (
                  <a
                    key={title}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={title}
                    className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 active:scale-90 transition"
                    style={{ color: c }}
                  >
                    <I aria-hidden="true" className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6 lg:items-start space-y-3 lg:space-y-0">
          {/* ============ LEFT COLUMN (sticky on desktop) ============ */}
          <div className="space-y-3 lg:sticky lg:top-4">
            {/* ============ OWNER CERTIFICATION STRIP ============ */}
            {showOwnerBadge && (
              <div className="panel neon-border p-2.5 reveal" style={{ animationDelay: ".05s" }}>
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  {[
                    { I: ShieldCheck, l: "Identity", s: "Confirmed", c: GOLD },
                    { I: Fingerprint, l: "Original", s: "Account", c: NEON_BLUE },
                    { I: KeyRound, l: "Owner", s: "Verified", c: NEON_PURPLE },
                  ].map(({ I, l, s, c }) => (
                    <div
                      key={l}
                      className="flex flex-col items-center gap-0.5 py-1 transition hover:-translate-y-0.5"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          background: `${c}1A`,
                          border: `1px solid ${c}66`,
                          boxShadow: `0 0 12px ${c}55, inset 0 0 8px ${c}22`,
                        }}
                      >
                        <I className="w-3.5 h-3.5" style={{ color: c }} />
                      </div>
                      <div
                        className="text-[10px] font-bold leading-none mt-0.5"
                        style={{ color: c }}
                      >
                        {l}
                      </div>
                      <div className="text-[9px] text-muted-foreground leading-none">{s}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============ STAT BAR ============ */}
            <div
              className="panel neon-border grid grid-cols-4 divide-x divide-white/5 reveal"
              style={{ animationDelay: ".08s" }}
            >
              {[
                { I: FileText, c: NEON_BLUE, v: formatStat(profile.stats.posts), l: "Posts" },
                { I: Users, c: NEON_PURPLE, v: formatStat(followers), l: "Followers" },
                { I: UserPlus, c: PINK, v: formatStat(profile.stats.following), l: "Following" },
                { I: Sparkles, c: GOLD, v: formatStat(profile.stats.prescriptions), l: "Rx" },
              ].map(({ I, c, v, l }) => (
                <button
                  key={l}
                  className="flex items-center justify-center gap-1.5 px-1 py-2.5 transition hover:bg-white/[0.03] active:scale-[0.98]"
                >
                  <I
                    className="w-3.5 h-3.5"
                    style={{ color: c, filter: `drop-shadow(0 0 6px ${c})` }}
                  />
                  <div className="text-left">
                    <div className="text-sm font-bold leading-none tabular-nums">{v}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{l}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* ============ BIO / ABOUT ============ */}
            <div
              className="panel neon-border p-3 reveal relative"
              style={{ animationDelay: ".1s" }}
            >
              {/* About header */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: NEON_PURPLE, boxShadow: `0 0 8px ${NEON_PURPLE}` }}
                  />
                  <h3 className="font-semibold text-xs">
                    About {displayName.split(" ")[0] || displayName}
                  </h3>
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">{bio}</p>
                <button className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold inline-flex items-center gap-0.5 hover:bg-white/5 transition">
                  Full bio <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Facts table — labels far LEFT (under "Full bio") | TAURUS center | values far RIGHT (under "3.2K") */}
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 md:gap-x-6 gap-y-1.5 items-center text-[10px] md:text-[11px] w-full">
                {/* LEFT — labels pushed to far left */}
                <ul className="space-y-1.5 justify-self-start">
                  {[
                    { I: Globe, l: "Member since" },
                    { I: Sparkle, l: "Profile type" },
                    { I: User, l: "Visibility" },
                    { I: BadgeCheck, l: "Verification" },
                    { I: Clock, l: "Location" },
                  ].map(({ I, l }) => (
                    <li key={l} className="flex items-center gap-2 text-left">
                      <I className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{l}</span>
                    </li>
                  ))}
                </ul>

                {/* CENTER — Taurus zodiac badge */}
                <div className="flex justify-center self-center">
                  {showZodiac ? (
                    <div className="relative w-[96px] h-[112px] md:w-[120px] md:h-[140px] flex items-center justify-center">
                      <div
                        className="absolute inset-0 rounded-full blur-2xl opacity-60"
                        style={{
                          background: `radial-gradient(circle, ${GOLD}66, transparent 70%)`,
                        }}
                      />
                      <div
                        className="absolute inset-1 rounded-full animate-spin-slow"
                        style={{
                          background: `conic-gradient(${GOLD}, transparent 30%, ${NEON_PURPLE}, transparent 60%, ${GOLD})`,
                          WebkitMask:
                            "radial-gradient(circle, transparent 60%, #000 62%, #000 66%, transparent 68%)",
                          mask: "radial-gradient(circle, transparent 60%, #000 62%, #000 66%, transparent 68%)",
                          filter: `drop-shadow(0 0 8px ${GOLD})`,
                        }}
                      />
                      <img
                        src={taurusBull}
                        alt={`${zodiacLabel} zodiac`}
                        className="relative w-[64px] md:w-[80px] animate-float"
                        style={{
                          filter: `drop-shadow(0 0 12px ${GOLD}) drop-shadow(0 0 22px ${NEON_PURPLE}88)`,
                        }}
                      />
                      <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold tracking-[0.22em] px-1.5 py-0.5 rounded-full border whitespace-nowrap"
                        style={{
                          color: GOLD,
                          borderColor: `${GOLD}88`,
                          background: "rgba(0,0,0,0.7)",
                          boxShadow: `0 0 10px ${GOLD}55`,
                        }}
                      >
                        {zodiacLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="panel flex h-[96px] w-[96px] items-center justify-center rounded-full text-center text-[10px] text-muted-foreground">
                      Zodiac hidden
                    </div>
                  )}
                </div>

                {/* RIGHT — values pushed to far right */}
                <ul className="space-y-1.5 justify-self-end text-right">
                  {[
                    { v: profile.joinedDate || "-", c: "#fff" },
                    { v: profile.profileType === "creator" ? "Creator" : "Member", c: "#fff" },
                    { v: profile.profileVisibility?.replace("_", " ") || "public", c: GREEN },
                    {
                      v: showVerifiedBadge ? "Verified" : "-",
                      c: showVerifiedBadge ? NEON_BLUE : "#fff",
                    },
                    { v: profile.location || "-", c: "#fff" },
                  ].map(({ v, c }, i) => (
                    <li key={i} className="font-medium" style={{ color: c }}>
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* ============ RIGHT COLUMN ============ */}
          <div className="space-y-3">
            {/* ============ TABS ============ */}
            <div
              className="panel neon-border grid grid-cols-4 reveal"
              style={{ animationDelay: ".15s" }}
            >
              {["Posts", "Likes", "Saved", "About"].map((t, i) => (
                <button
                  key={t}
                  className={`relative py-3 text-[12px] font-semibold transition active:scale-95 ${i === 0 ? "text-white" : "text-muted-foreground hover:text-white"}`}
                >
                  {t}
                  {i === 0 && (
                    <span
                      className="absolute bottom-0 left-1/3 right-1/3 h-[2px] rounded-full"
                      style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ============ POSTS ============ */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".2s" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: NEON_BLUE, boxShadow: `0 0 8px ${NEON_BLUE}` }}
                  />
                  <h3 className="font-semibold text-xs">Recent Posts</h3>
                </div>
                <a
                  className="text-[9px] text-muted-foreground inline-flex items-center gap-0.5 hover:text-white"
                  href="#"
                >
                  View all <ChevronRight className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {posts.length > 0 ? (
                  posts.map((p, i) => (
                    <div
                      key={i}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group hover:border-white/30 transition"
                    >
                      <img
                        src={p.img}
                        alt={`Post ${i + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                      {p.pinned && (
                        <div
                          className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{ background: GOLD }}
                        >
                          <Pin className="w-2 h-2 text-black" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[8px] font-medium text-white">
                        <span className="inline-flex items-center gap-0.5">
                          <Play className="w-2 h-2 fill-current" /> {p.views}
                        </span>
                        <span className="text-white/70">{p.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-muted-foreground">
                    No public posts yet.
                  </div>
                )}
              </div>
            </div>

            {/* ============ TOP 3 FRIENDS ============ */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".22s" }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                  />
                  <h3 className="font-semibold text-xs">Top 3 Friends</h3>
                  <span className="text-[9px] text-muted-foreground">· inner circle</span>
                </div>
                <a
                  className="text-[9px] text-muted-foreground inline-flex items-center gap-0.5 hover:text-white"
                  href="#"
                >
                  View all <ChevronRight className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-5 place-items-center pt-2 pb-1">
                {topThreeCards.length > 0 ? (
                  topThreeCards.map((f) => (
                    <div
                      key={f.uid || f.handle || f.name}
                      className="relative group flex flex-col items-center gap-1.5"
                    >
                      {/* Outer animated conic ring */}
                      <ProfilePictureLink
                        publicProfileUid={f.uid}
                        label={`Open ${f.name}'s public profile`}
                        className="relative w-20 h-20 md:w-24 md:h-24"
                      >
                        <div
                          aria-hidden
                          className="absolute -inset-1 rounded-full animate-spin-slow opacity-90"
                          style={{
                            background: `conic-gradient(from 0deg, ${f.color}, ${f.accent}, ${f.color}, transparent 70%, ${f.color})`,
                          }}
                        />
                        {/* Glow halo */}
                        <div
                          aria-hidden
                          className="absolute -inset-3 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition"
                          style={{
                            background: `radial-gradient(circle, ${f.color}77, transparent 70%)`,
                          }}
                        />
                        {/* Inner dark gap */}
                        <div className="absolute inset-0 rounded-full bg-[#05070D] p-[3px]">
                          {/* Avatar */}
                          <div className="w-full h-full rounded-full overflow-hidden border border-white/20">
                            <AvatarWithFallback
                              src={f.img}
                              alt={f.name}
                              name={f.name}
                              uid={f.uid}
                              size="lg"
                              className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                            />
                          </div>
                        </div>
                        {/* Rank medal — matches Badges/Connect aesthetic */}
                        <div
                          className="absolute -bottom-1.5 -right-1.5 w-8 h-8 flex items-center justify-center"
                          style={{ color: f.color }}
                        >
                          <div
                            className="absolute inset-0 rounded-full blur-md opacity-70"
                            style={{ background: f.color }}
                          />
                          <div
                            className="absolute inset-0 rounded-full border-2"
                            style={{
                              borderColor: f.color,
                              background: `radial-gradient(circle at 35% 30%, ${f.color}66, #0a0418 85%)`,
                              backdropFilter: "blur(4px)",
                              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), 0 0 10px ${f.color}99`,
                            }}
                          />
                          <span
                            className="relative z-10 text-[14px] font-black leading-none"
                            style={{
                              color: "#ffffff",
                              textShadow: `0 1px 0 rgba(0,0,0,0.85), 0 0 6px ${f.color}, 0 0 12px ${f.color}cc`,
                              WebkitTextStroke: `0.5px rgba(0,0,0,0.6)`,
                              fontFeatureSettings: '"tnum","ss01"',
                            }}
                          >
                            {f.rank}
                          </span>
                        </div>
                      </ProfilePictureLink>
                      <div className="text-center max-w-[88px]">
                        <div className="text-[11px] font-bold text-white leading-tight truncate">
                          {f.name}
                        </div>
                        <div
                          className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block mt-0.5 text-black"
                          style={{ background: f.color, boxShadow: `0 0 8px ${f.color}90` }}
                        >
                          {f.badge}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 py-8 text-center text-xs text-muted-foreground">
                    No Top 3 friends yet.
                  </div>
                )}
              </div>
            </div>

            {/* ============ CONNECT ============ */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".25s" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: PINK, boxShadow: `0 0 8px ${PINK}` }}
                />
                <h3 className="font-semibold text-xs">Connect</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                {socialLinks.length > 0 ? (
                  socialLinks.map((link) => (
                    <LinkRow
                      key={link.title}
                      icon={link.icon}
                      color={link.color}
                      accent={link.accent}
                      title={link.title}
                      sub={link.sub}
                      href={link.href}
                    />
                  ))
                ) : (
                  <div className="col-span-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
                    No public social links yet.
                  </div>
                )}
              </div>
            </div>

            {/* ============ BADGES ============ */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".3s" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }}
                  />
                  <h3 className="font-semibold text-xs">Badges</h3>
                </div>
                <span className="text-[9px] text-muted-foreground">
                  {earnedBadges.length} earned
                </span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-2.5">
                {earnedBadges.length > 0 ? (
                  earnedBadges.map((badge) => (
                    <Medallion
                      key={badge.label}
                      icon={badge.icon}
                      label={badge.label}
                      color={badge.color}
                      accent={badge.accent}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-5 text-center text-xs text-muted-foreground">
                    No public badges assigned yet.
                  </div>
                )}
              </div>
            </div>

            {/* ============ PRESCRIBE ME ============ */}
            {showPrescribePanel && (
              <div
                className="panel neon-border p-3 relative overflow-hidden reveal"
                style={{ animationDelay: ".35s" }}
              >
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(circle at 50% 40%, ${PINK}33, transparent 60%)`,
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <img
                    src={prescribeLock}
                    alt=""
                    className="h-16 w-auto animate-float drop-shadow-[0_0_20px_rgba(255,80,200,0.7)] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs mb-0.5">Prescribe Me</h3>
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
            )}
          </div>
        </div>
      </div>

      <GiftPickerSheet open={giftOpen} onClose={() => setGiftOpen(false)} recipient={handle} />

      {/* ============ NOTE / GIF OF THE DAY POPUP ============ */}
      {noteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* backdrop */}
          <button
            aria-label="Close"
            onClick={() => setNoteOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md animate-[fade-in_.25s_ease-out]"
          />
          {/* dialog */}
          <div
            className="relative w-full max-w-sm panel neon-border p-4 rounded-2xl pop-in"
            style={{ boxShadow: `0 0 40px ${NEON_PURPLE}66, 0 0 80px ${PINK}44` }}
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

            {/* Tab toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-white/5 border border-white/10 mb-3">
              {(
                [
                  { id: "note", label: "Note", I: StickyNote, c: NEON_PURPLE },
                  { id: "gif", label: "GIF", I: ImageIcon, c: NEON_BLUE },
                ] as const
              ).map(({ id, label, I, c }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={`relative flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold transition ${
                    tab === id ? "text-white" : "text-muted-foreground"
                  }`}
                  style={
                    tab === id
                      ? {
                          background: `${c}26`,
                          boxShadow: `0 0 14px ${c}55, inset 0 0 8px ${c}33`,
                          border: `1px solid ${c}66`,
                        }
                      : {}
                  }
                >
                  <I className="w-3.5 h-3.5" style={tab === id ? { color: c } : undefined} />
                  {label}
                </button>
              ))}
            </div>

            {tab === "note" ? (
              <div className="animate-[fade-in_.3s_ease-out]">
                <div className="relative">
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 50))}
                    placeholder="What's the vibe today?"
                    rows={3}
                    className="w-full resize-none rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-[12px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-400/60 focus:shadow-[0_0_18px_rgba(168,85,247,0.45)] transition"
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
              <div className="animate-[fade-in_.3s_ease-out]">
                <div className="grid grid-cols-3 gap-1.5">
                  {[post1, post2, post3, post4, post5, post1].map((src, i) => (
                    <button
                      key={i}
                      className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/60 hover:shadow-[0_0_18px_rgba(0,183,255,0.55)] transition group"
                    >
                      <img
                        src={src}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      />
                      <div className="absolute bottom-1 left-1 text-[8px] font-bold text-white/90 bg-black/60 px-1 rounded">
                        GIF
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setNoteOpen(false)}
              className="mt-3 w-full rounded-full py-2 text-[12px] font-bold transition active:scale-95"
              style={{
                background: `linear-gradient(90deg, ${NEON_PURPLE}, ${PINK}, ${GOLD})`,
                color: "#0a0a0a",
                boxShadow: `0 0 20px ${NEON_PURPLE}66`,
              }}
            >
              Post for today
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
