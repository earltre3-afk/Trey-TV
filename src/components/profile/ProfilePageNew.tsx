/**
 * ProfilePageNew.tsx
 * Exact port of the reference profile design from the lovable-polish-pass repo.
 * Supports variants: "owner" | "creator" | "user" | "public"
 * wired to real ProfileData.
 */

import { useId, useState, useMemo } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import {
  ArrowLeft, Share, MoreHorizontal, BadgeCheck, MapPin, Link2,
  Instagram, Twitter, Youtube, Music2, FileText, Users, UserPlus,
  Sparkles, Eye, Star, Clock, Bookmark, Heart, User, Trophy,
  ChevronRight, Globe, Mail, ShoppingBag, Play, Home, Compass,
  Plus, BookOpen, Inbox, Sparkle, Pin, Disc3, ExternalLink,
  ShieldCheck, Fingerprint, KeyRound, X, ImageIcon, StickyNote,
  Pencil, Crown, Flame, Rocket, Zap, TrendingUp, Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import type { ProfileData } from "./ProfileTypes";
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

/* ---------- GoldCheck SVG badge ---------- */
function GoldCheck({ size = 24, className = "" }: { size?: number; className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={{ filter: "drop-shadow(0 0 6px rgba(255,200,87,0.85)) drop-shadow(0 0 16px rgba(255,200,87,0.55)) drop-shadow(0 1px 1px rgba(0,0,0,0.55))" }}
    >
      <defs>
        <radialGradient id={`gc-face-${uid}`} cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#FFF6CF" />
          <stop offset="35%" stopColor="#FFD668" />
          <stop offset="70%" stopColor="#E9A917" />
          <stop offset="100%" stopColor="#8A5A00" />
        </radialGradient>
        <linearGradient id={`gc-rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF1B0" />
          <stop offset="50%" stopColor="#7A4E00" />
          <stop offset="100%" stopColor="#FFEFA8" />
        </linearGradient>
        <linearGradient id={`gc-sheen-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gc-spark-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="49%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="51%" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`gc-clip-${uid}`}><circle cx="12" cy="12" r="11" /></clipPath>
      </defs>
      <g style={{ transformOrigin: "12px 12px" }}>
        <circle cx="12" cy="12" r="11.5" fill={`url(#gc-rim-${uid})`}>
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="9s" repeatCount="indefinite" />
        </circle>
      </g>
      <circle cx="12" cy="12" r="10.6" fill={`url(#gc-face-${uid})`} />
      <ellipse cx="12" cy="7.5" rx="7.5" ry="3.6" fill={`url(#gc-sheen-${uid})`} opacity="0.9" />
      <path d="M6.5 12.4 L10.4 16.2 L17.6 7.8" fill="none" stroke="#0a0a0a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 1px 0 rgba(255,235,160,0.55))" }} />
      <g clipPath={`url(#gc-clip-${uid})`} style={{ mixBlendMode: "screen" }}>
        <rect x="-24" y="0" width="24" height="24" fill={`url(#gc-spark-${uid})`}>
          <animate attributeName="x" from="-24" to="24" dur="3.2s" begin="0s" repeatCount="indefinite" />
        </rect>
      </g>
      <circle cx="12" cy="12" r="10.6" fill="none" stroke="#FFF6CF" strokeOpacity="0.5" strokeWidth="0.5" />
      <circle cx="12" cy="12" r="11.5" fill="none" stroke="#0a0a0a" strokeOpacity="0.5" strokeWidth="0.6" />
    </svg>
  );
}

/* ---------- Helpers ---------- */
function Spark({ color, data }: { color: string; data: number[] }) {
  const w = 100, h = 28;
  const max = Math.max(...data), min = Math.min(...data);
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
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
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Medallion({ icon: Icon, label, color, accent }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; color: string; accent?: string }) {
  const c2 = accent ?? color;
  const grad = `linear-gradient(135deg, ${color}, ${c2})`;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full blur-md opacity-60" style={{ background: grad }} />
        <div className="absolute inset-0 rounded-full" style={{ background: `linear-gradient(135deg,${color}26,${c2}14)`, boxShadow: `inset 0 0 0 1px ${color}88,0 0 10px ${c2}55` }} />
        <div aria-hidden className="absolute inset-0 rounded-full opacity-90" style={{ padding: 1, background: grad, WebkitMask: "linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
        <Icon className="w-5 h-5 relative z-10 text-white" style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
      </div>
      <span className="text-[9px] text-foreground/80 text-center leading-tight">{label}</span>
    </div>
  );
}

function LinkRow({ icon: Icon, color, accent, title, sub }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string; accent?: string; title: string; sub: string }) {
  const c2 = accent ?? color;
  const grad = `linear-gradient(135deg,${color},${c2})`;
  return (
    <a href="#" className="group relative panel px-2.5 py-2 flex items-center gap-2 hover-lift cursor-pointer overflow-hidden" style={{ background: `linear-gradient(135deg,${color}1F,${c2}14 70%)`, borderColor: `${color}55` }}>
      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" style={{ background: `linear-gradient(110deg,transparent 40%,${c2}40 50%,transparent 60%)` }} />
      <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full blur-xl opacity-50 group-hover:opacity-90 transition" style={{ background: grad }} />
      <div className="relative w-8 h-8 rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform text-white" style={{ background: grad, border: `1px solid ${color}88`, boxShadow: `0 0 14px ${color}66,0 0 20px ${c2}40,inset 0 1px 0 rgba(255,255,255,0.35)` }}>
        <Icon className="w-4 h-4 drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]" />
      </div>
      <div className="relative flex-1 min-w-0">
        <div className="text-[11px] font-bold truncate leading-tight">{title}</div>
        <div className="text-[9px] truncate" style={{ color: `${c2}cc` }}>{sub}</div>
      </div>
      <ExternalLink className="relative w-3 h-3 transition group-hover:translate-x-0.5" style={{ color: c2 }} />
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
  const navigate = useNavigate();
  const { user: authUser, isGuest } = useAuth();
  const myUid = authUser?.uid ?? "";
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteTab, setNoteTab] = useState<"note" | "gif">("note");
  const [note, setNote] = useState("");

  const isPublic = variant === "public";
  const showOwnerBadge = variant === "owner";
  const showAdminBadge = false; // never show admin badge per user request
  const showCreatorBadge = (variant === "owner" || variant === "creator" || isPublic) && profile.isCreator;
  const showVerifiedBadge = profile.isVerified && variant !== "user";
  const showChannelCTA = profile.isCreator && variant !== "user";
  const showGiftButton = profile.isCreator && variant !== "user";
  const showOwnerControls = variant === "owner";
  const showCreatorControls = variant === "creator"; // edit profile for creators

  const bannerSrc = profile.bannerUrl || staticBanner;
  const avatarSrc = profile.avatarUrl || staticPortrait;

  const fmt = (n: number | string) => {
    const num = typeof n === "string" ? parseInt(n, 10) : n;
    if (isNaN(num)) return String(n);
    return num >= 1_000_000 ? `${(num / 1_000_000).toFixed(1)}M` :
           num >= 1_000 ? `${(num / 1_000).toFixed(1)}K` : String(num);
  };

  const onShare = async () => {
    try { await navigator.share?.({ title: profile.displayName, url: location.href }); }
    catch { await navigator.clipboard?.writeText(location.href); toast.success("Link copied"); }
  };

  const channelLink = `/channel/${profile.handle}` as const;

  return (
    <div className="profile-refr">
      {/* Ambient blobs */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-20 w-[420px] h-[420px] rounded-full blur-3xl opacity-30" style={{ background: `radial-gradient(circle,${NEON_PURPLE},transparent 60%)` }} />
        <div className="absolute top-1/3 -right-24 w-[360px] h-[360px] rounded-full blur-3xl opacity-25" style={{ background: `radial-gradient(circle,${NEON_BLUE},transparent 60%)` }} />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full blur-3xl opacity-20" style={{ background: `radial-gradient(circle,${PINK},transparent 60%)` }} />
      </div>

      {/* ── BANNER ─────────────────────────────────────────── */}
      <section className="relative w-full reveal">
        <div className="relative h-[220px] sm:h-[260px] md:h-[300px] w-full overflow-hidden">
          <img src={bannerSrc} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" decoding="async" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/40 to-[#05070D]/10" />
          <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 35%,${NEON_PURPLE}40,transparent 60%)` }} />

          {/* Back */}
          <button type="button" aria-label="Go back" onClick={() => navigate({ to: "/" })} className="absolute top-3 left-3 w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition z-20">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="absolute top-3 right-3 flex gap-1.5 z-20">
            <button type="button" aria-label="Share" onClick={onShare} className="w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition">
              <Share className="w-4 h-4" />
            </button>
            <button type="button" aria-label="More" className="w-9 h-9 rounded-full bg-black/40 border border-white/15 backdrop-blur-md flex items-center justify-center active:scale-95 transition">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Trey TV Logo top-center */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="relative logo-anim w-[160px] sm:w-[200px] md:w-[240px]">
              <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[70%] rounded-[50%] blur-3xl opacity-60 logo-halo-pulse" style={{ background: `radial-gradient(ellipse at center,${NEON_PURPLE}55 0%,${NEON_BLUE}33 45%,transparent 70%)` }} />
              <img src={treyTvLogo} alt="Trey TV" className="relative w-full h-auto object-contain" style={{ filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 10px rgba(168,85,247,0.35))" }} />
              <div aria-hidden className="absolute inset-0 mix-blend-screen opacity-70" style={{ WebkitMaskImage: `url(${treyTvLogo})`, maskImage: `url(${treyTvLogo})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", background: "linear-gradient(to bottom,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0.18) 38%,rgba(255,255,255,0) 55%)" }} />
              <div aria-hidden className="absolute inset-0 overflow-hidden" style={{ WebkitMaskImage: `url(${treyTvLogo})`, maskImage: `url(${treyTvLogo})`, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center" }}>
                <div className="absolute -inset-y-6 -left-1/3 w-1/3 animate-scan-sweep" style={{ background: "linear-gradient(115deg,transparent 35%,rgba(255,255,255,0.9) 50%,transparent 65%)", filter: "blur(2px)" }} />
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05070D] to-transparent" />
        </div>

        {/* Avatar overlapping banner */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-14 z-30">
          <div className="relative w-[120px] h-[120px] md:w-[150px] md:h-[150px]">
            <div className="absolute -inset-10 rounded-full opacity-25 blur-3xl" style={{ background: NEON_PURPLE }} />
            <div className="absolute -inset-[5px] rounded-full ring-gradient animate-spin-slow opacity-80" style={{ filter: "blur(0.5px)" }} />
            <div className="absolute -inset-[2px] rounded-full ring-pulse opacity-90" />
            <div className="absolute inset-0 rounded-full bg-[#05070D] overflow-hidden border border-white/10">
              <img src={avatarSrc} alt={profile.displayName} fetchPriority="high" decoding="async" className="w-full h-full object-cover" />
            </div>
            {showVerifiedBadge && (
              <div className="absolute -bottom-1 -right-1">
                <GoldCheck size={42} />
              </div>
            )}
            {showOwnerControls && (
              <button onClick={() => setNoteOpen(true)} aria-label="Add note" className="absolute -top-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center bg-white text-black border-2 border-white/80 shadow-[0_0_18px_rgba(255,255,255,0.85)] hover:scale-110 active:scale-95 transition-transform plus-pulse z-10">
                <Plus className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────── */}
      <div className="max-w-[1280px] mx-auto px-3 md:px-6 pt-[72px] md:pt-20">

        {/* IDENTITY */}
        <div className="max-w-2xl mx-auto mb-5 md:mb-7">
          <div className="text-center reveal">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-[26px] md:text-3xl font-extrabold metallic-chrome drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                {profile.displayName}
              </h1>
              {showVerifiedBadge && <GoldCheck size={22} />}
            </div>
            <div className="mt-1 text-[11px] tracking-wide text-muted-foreground">@{profile.handle}</div>

            {/* Role pills */}
            <div className="mt-2.5 flex items-center justify-center flex-wrap gap-1.5 px-2">
              {showOwnerBadge && (
                <span className="owner-badge inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.22em] whitespace-nowrap px-2.5 py-[4px] sm:px-3 sm:py-[5px] rounded-full">
                  <span aria-hidden className="owner-badge__shine" />
                  <span aria-hidden className="owner-badge__crown"><Crown className="w-2.5 h-2.5" strokeWidth={2.5} /></span>
                  <span className="owner-badge__text">Owner</span>
                </span>
              )}
              {[
                showVerifiedBadge && { I: GoldCheck as React.ComponentType<any>, l: "Verified", c: GOLD, gold: true },
                showCreatorBadge && { I: Sparkles, l: "Creator", c: NEON_PURPLE, gold: false },
              ].filter(Boolean).map((b: any) => (
                <span key={b.l} className="role-pill inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-white/95 px-2 py-[3px] sm:px-2.5 sm:py-1 rounded-full whitespace-nowrap" style={{ "--pill-c": b.c } as React.CSSProperties}>
                  <span aria-hidden className="role-pill__shine" />
                  <span aria-hidden className="role-pill__ring" />
                  {b.gold ? <GoldCheck size={11} className="role-pill__icon" /> : <b.I className="w-2.5 h-2.5 role-pill__icon" strokeWidth={2.5} style={{ color: b.c }} />}
                  <span className="role-pill__label" style={{ textShadow: `0 0 8px ${b.c}66` }}>{b.l}</span>
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
              <div className={`mt-3 grid gap-2 max-w-md mx-auto ${showGiftButton ? "grid-cols-4" : "grid-cols-3"}`}>
                {[
                  { l: "Follow", I: UserPlus, c: NEON_PURPLE, primary: true },
                  { l: "Subscribe", I: Sparkles, c: GOLD, primary: false },
                  { l: "Message", I: Mail, c: NEON_BLUE, primary: false },
                  ...(showGiftButton ? [{ l: "Gift", I: Heart, c: PINK, primary: false }] : []),
                ].map(({ l, I, c, primary }) => (
                  <button key={l} className="cert-btn group" data-primary={primary ? "true" : "false"} style={{ "--btn-c": c } as React.CSSProperties}>
                    <span aria-hidden className="cert-btn__border" />
                    <span aria-hidden className="cert-btn__surface" />
                    <span aria-hidden className="cert-btn__cert">
                      <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none">
                        <path d="M2.5 6.2 L4.8 8.4 L9.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="cert-btn__content">
                      <span className="cert-btn__icon"><I className="w-3.5 h-3.5" strokeWidth={2.25} /></span>
                      <span className="cert-btn__label">{l}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Channel CTA */}
            {showChannelCTA && (
              <div className="mt-3 flex justify-center">
                <Link to={channelLink as any} className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-extrabold text-[12px] uppercase tracking-[0.18em] text-black overflow-hidden active:scale-95 hover:scale-[1.04] transition-transform" style={{ background: `linear-gradient(135deg,#FFE9A8 0%,${GOLD} 35%,#E9A917 60%,#FFF3C4 100%)`, boxShadow: `0 0 0 1px rgba(255,255,255,0.35) inset,0 0 22px ${GOLD}99,0 0 48px ${GOLD}66,0 8px 30px rgba(0,0,0,0.55)` }}>
                  <span aria-hidden className="absolute -inset-[2px] rounded-full opacity-90 animate-spin-slow -z-10" style={{ background: `conic-gradient(from 0deg,${GOLD},${PINK},${NEON_PURPLE},${NEON_BLUE},${GOLD})`, filter: "blur(6px)" }} />
                  <span aria-hidden className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out pointer-events-none" style={{ background: "linear-gradient(110deg,transparent 38%,rgba(255,255,255,0.85) 50%,transparent 62%)" }} />
                  <Play className="w-4 h-4 fill-black" strokeWidth={2.5} />
                  <span className="relative">View My Channel</span>
                  <ChevronRight className="w-4 h-4" strokeWidth={3} />
                </Link>
              </div>
            )}

            {/* Owner controls */}
            {showOwnerControls && (
              <div className="mt-2 flex justify-center items-center gap-2">
                <Link to="/edit-profile" className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08),0 6px 18px rgba(0,0,0,0.45)" }}>
                  <Pencil className="w-3.5 h-3.5" style={{ color: GOLD }} />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}

            {/* Creator controls (edit profile) */}
            {showCreatorControls && (
              <div className="mt-2 flex justify-center items-center gap-2">
                <Link to="/edit-profile" className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] hover:border-white/25 active:scale-95 transition" style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08),0 6px 18px rgba(0,0,0,0.45)" }}>
                  <Pencil className="w-3.5 h-3.5" style={{ color: GOLD }} />
                  <span>Edit Profile</span>
                </Link>
              </div>
            )}

            {/* Public back button */}
            {isPublic && (
              <div className="mt-2 flex justify-center">
                <button onClick={() => navigate({ to: -1 as any })} className="group relative inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.16em] text-white/90 border border-white/15 bg-white/[0.04] backdrop-blur-md hover:bg-white/[0.08] active:scale-95 transition">
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
                <button key={l} type="button" aria-label={l} className="w-8 h-8 rounded-full flex items-center justify-center border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 active:scale-90 transition" style={{ color: c }}>
                  <I className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TWO-COLUMN LAYOUT ──────────────────────────── */}
        <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-6 lg:items-start space-y-3 lg:space-y-0">

          {/* LEFT COLUMN */}
          <div className="space-y-3 lg:sticky lg:top-4">

            {/* Certification strip */}
            <div className="panel neon-border p-2.5 reveal" style={{ animationDelay: ".05s" }}>
              <div className="grid grid-cols-3 gap-1.5 text-center">
                {[
                  { I: ShieldCheck, l: "Identity", s: "Confirmed", c: GOLD },
                  { I: Fingerprint, l: "Original", s: "Account", c: NEON_BLUE },
                  { I: KeyRound, l: profile.isCreator ? "Creator" : "Member", s: "Verified", c: NEON_PURPLE },
                ].map(({ I, l, s, c }) => (
                  <div key={l} className="flex flex-col items-center gap-0.5 py-1 transition hover:-translate-y-0.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: `${c}1A`, border: `1px solid ${c}66`, boxShadow: `0 0 12px ${c}55,inset 0 0 8px ${c}22` }}>
                      <I className="w-3.5 h-3.5" style={{ color: c }} />
                    </div>
                    <div className="text-[10px] font-bold leading-none mt-0.5" style={{ color: c }}>{l}</div>
                    <div className="text-[9px] text-muted-foreground leading-none">{s}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stat bar */}
            <div className="panel neon-border grid grid-cols-4 divide-x divide-white/5 reveal" style={{ animationDelay: ".08s" }}>
              {[
                { I: FileText, c: NEON_BLUE, v: fmt(profile.stats.posts || 0), l: "Posts" },
                { I: Users, c: NEON_PURPLE, v: fmt(profile.stats.followers || 0), l: "Followers" },
                { I: UserPlus, c: PINK, v: fmt(profile.stats.following || 0), l: "Following" },
                { I: Sparkles, c: GOLD, v: fmt(profile.stats.prescriptions || 0), l: "Rx" },
              ].map(({ I, c, v, l }) => (
                <button key={l} className="flex items-center justify-center gap-1.5 px-1 py-2.5 transition hover:bg-white/[0.03] active:scale-[0.98]">
                  <I className="w-3.5 h-3.5" style={{ color: c, filter: `drop-shadow(0 0 6px ${c})` }} />
                  <div className="text-left">
                    <div className="text-sm font-bold leading-none tabular-nums">{v}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{l}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Bio / About */}
            <div className="panel neon-border p-3 reveal relative" style={{ animationDelay: ".1s" }}>
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: NEON_PURPLE, boxShadow: `0 0 8px ${NEON_PURPLE}` }} />
                  <h3 className="font-semibold text-xs">About {profile.displayName.split(" ")[0]}</h3>
                </div>
                <p className="text-[11px] text-foreground/80 leading-relaxed mb-2">
                  {profile.bio || "Member of Trey TV. Building something great."}
                </p>
                <button className="rounded-full border border-white/15 px-2.5 py-1 text-[10px] font-semibold inline-flex items-center gap-0.5 hover:bg-white/5 transition">
                  Full bio <ChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Facts + Zodiac */}
              <div className="grid grid-cols-[auto_1fr_auto] gap-x-2 md:gap-x-6 gap-y-1.5 items-center text-[10px] md:text-[11px] w-full">
                <ul className="space-y-1.5 justify-self-start">
                  {[
                    { I: Globe, l: "Member since" },
                    { I: Sparkle, l: "Creator" },
                    { I: User, l: "Prescribe Me" },
                    { I: BadgeCheck, l: "Response rate" },
                    { I: Clock, l: "Avg. response" },
                  ].map(({ I, l }) => (
                    <li key={l} className="flex items-center gap-2 text-left">
                      <I className="w-3 h-3 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">{l}</span>
                    </li>
                  ))}
                </ul>

                {/* Zodiac center badge */}
                <div className="flex justify-center self-center">
                  <div className="relative w-[96px] h-[112px] md:w-[120px] md:h-[140px] flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-60" style={{ background: `radial-gradient(circle,${GOLD}66,transparent 70%)` }} />
                    <div className="absolute inset-1 rounded-full animate-spin-slow" style={{ background: `conic-gradient(${GOLD},transparent 30%,${NEON_PURPLE},transparent 60%,${GOLD})`, WebkitMask: "radial-gradient(circle,transparent 60%,#000 62%,#000 66%,transparent 68%)", mask: "radial-gradient(circle,transparent 60%,#000 62%,#000 66%,transparent 68%)", filter: `drop-shadow(0 0 8px ${GOLD})` }} />
                    <img src={taurusBull} alt="zodiac" className="relative w-[64px] md:w-[80px] animate-float" style={{ filter: `drop-shadow(0 0 12px ${GOLD}) drop-shadow(0 0 22px ${NEON_PURPLE}88)` }} />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold tracking-[0.22em] px-1.5 py-0.5 rounded-full border whitespace-nowrap" style={{ color: GOLD, borderColor: `${GOLD}88`, background: "rgba(0,0,0,0.7)", boxShadow: `0 0 10px ${GOLD}55` }}>
                      {profile.zodiacSunSign ? `♉ ${profile.zodiacSunSign.toUpperCase()}` : "♉ TAURUS"}
                    </span>
                  </div>
                </div>

                <ul className="space-y-1.5 justify-self-end text-right">
                  {[
                    { v: profile.joinedDate || "Jan 2023", c: "#fff" },
                    { v: profile.isCreator ? "Music • Film" : "Member", c: "#fff" },
                    { v: "Open", c: GREEN },
                    { v: "98%", c: NEON_BLUE },
                    { v: "2h", c: "#fff" },
                  ].map(({ v, c }, i) => (
                    <li key={i} className="font-medium" style={{ color: c }}>{v}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-3">

            {/* Tabs */}
            <div className="panel neon-border grid grid-cols-4 reveal" style={{ animationDelay: ".15s" }}>
              {["Posts", "Likes", "Saved", "About"].map((t, i) => (
                <button key={t} className={`relative py-3 text-[12px] font-semibold transition active:scale-95 ${i === 0 ? "text-white" : "text-muted-foreground hover:text-white"}`}>
                  {t}
                  {i === 0 && <span className="absolute bottom-0 left-1/3 right-1/3 h-[2px] rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />}
                </button>
              ))}
            </div>

            {/* Posts grid */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".2s" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: NEON_BLUE, boxShadow: `0 0 8px ${NEON_BLUE}` }} />
                  <h3 className="font-semibold text-xs">Recent Posts</h3>
                </div>
                <a className="text-[9px] text-muted-foreground inline-flex items-center gap-0.5 hover:text-white" href="#">
                  View all <ChevronRight className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {FALL_POSTS.map((img, i) => (
                  <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 group hover:border-white/30 transition">
                    <img src={img} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    {i === 0 && (
                      <div className="absolute top-1 left-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: GOLD }}>
                        <Pin className="w-2 h-2 text-black" />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between text-[8px] font-medium text-white">
                      <span className="inline-flex items-center gap-0.5"><Play className="w-2 h-2 fill-current" /> {["34.2K","52.6K","12.1K","18.7K","24.3K"][i]}</span>
                      <span className="text-white/70">{["1:24","2:08","0:58","1:45","2:12"][i]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top 3 Friends */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".22s" }}>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                  <h3 className="font-semibold text-xs">Top 3 Friends</h3>
                  <span className="text-[9px] text-muted-foreground">· inner circle</span>
                </div>
                <a className="text-[9px] text-muted-foreground inline-flex items-center gap-0.5 hover:text-white" href="#">
                  View all <ChevronRight className="w-2.5 h-2.5" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-5 place-items-center pt-2 pb-1">
                {[
                  { name: "Jaylen K.", handle: "@jayk", img: fallPost2, rank: 1, color: GOLD, accent: "#FFE066", badge: "BFF" },
                  { name: "Mira S.", handle: "@mira", img: fallPost3, rank: 2, color: NEON_PURPLE, accent: "#E0E0E0", badge: "Day 1" },
                  { name: "Devon R.", handle: "@dev", img: fallPost4, rank: 3, color: NEON_BLUE, accent: "#FF8A3D", badge: "Squad" },
                ].map((f) => (
                  <div key={f.handle} className="relative group flex flex-col items-center gap-1.5">
                    <div className="relative w-20 h-20 md:w-24 md:h-24">
                      <div aria-hidden className="absolute -inset-1 rounded-full animate-spin-slow opacity-90" style={{ background: `conic-gradient(from 0deg,${f.color},${f.accent},${f.color},transparent 70%,${f.color})` }} />
                      <div aria-hidden className="absolute -inset-3 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition" style={{ background: `radial-gradient(circle,${f.color}77,transparent 70%)` }} />
                      <div className="absolute inset-0 rounded-full bg-[#05070D] p-[3px]">
                        <div className="w-full h-full rounded-full overflow-hidden border border-white/20">
                          <img src={f.img} alt={f.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                        </div>
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-8 h-8 flex items-center justify-center" style={{ color: f.color }}>
                        <div className="absolute inset-0 rounded-full blur-md opacity-70" style={{ background: f.color }} />
                        <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: f.color, background: `radial-gradient(circle at 35% 30%,${f.color}66,#0a0418 85%)`, backdropFilter: "blur(4px)", boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4),0 0 10px ${f.color}99` }} />
                        <span className="relative z-10 text-[14px] font-black leading-none" style={{ color: "#fff", textShadow: `0 1px 0 rgba(0,0,0,0.85),0 0 6px ${f.color}` }}>{f.rank}</span>
                      </div>
                    </div>
                    <div className="text-center max-w-[88px]">
                      <div className="text-[11px] font-bold text-white leading-tight truncate">{f.name}</div>
                      <div className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full inline-block mt-0.5 text-black" style={{ background: f.color, boxShadow: `0 0 8px ${f.color}90` }}>{f.badge}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connect links */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".25s" }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: PINK, boxShadow: `0 0 8px ${PINK}` }} />
                <h3 className="font-semibold text-xs">Connect</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1.5">
                <LinkRow icon={Instagram} color="#EC4899" accent="#A855F7" title="Instagram" sub={`@${profile.handle}`} />
                <LinkRow icon={Globe} color="#22D3EE" accent="#3B82F6" title="Website" sub={profile.websiteLink || "trey.tv"} />
                <LinkRow icon={Twitter} color="#E2E8F0" accent="#A855F7" title="X" sub={`@${profile.handle}`} />
                <LinkRow icon={Mail} color="#F59E0B" accent="#EC4899" title="Booking" sub={`booking@trey.tv`} />
                <LinkRow icon={Music2} color="#22D3EE" accent="#EC4899" title="TikTok" sub={`@${profile.handle}`} />
                <LinkRow icon={Youtube} color="#EF4444" accent="#FF7700" title="YouTube" sub={`@${profile.handle}`} />
                <LinkRow icon={ShoppingBag} color="#10B981" accent="#22D3EE" title="Merch" sub="treytv.store" />
                <LinkRow icon={Disc3} color="#FF7700" accent="#FFC857" title="SoundCloud" sub={`@${profile.handle}`} />
              </div>
            </div>

            {/* Badges */}
            <div className="panel neon-border p-3 reveal" style={{ animationDelay: ".3s" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD, boxShadow: `0 0 8px ${GOLD}` }} />
                  <h3 className="font-semibold text-xs">Badges</h3>
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
            <div className="panel neon-border p-3 relative overflow-hidden reveal" style={{ animationDelay: ".35s" }}>
              <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 50% 40%,${PINK}33,transparent 60%)` }} />
              <div className="relative flex items-center gap-3">
                <img src={prescribeLock} alt="" className="h-16 w-auto animate-float shrink-0" style={{ filter: "drop-shadow(0 0 20px rgba(255,80,200,0.7))" }} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs mb-0.5">Prescribe Me</h3>
                  <p className="text-[10px] text-foreground/80 mb-2 leading-snug">Unlock exclusive content & deeper access.</p>
                  <button className="rounded-full px-3 py-1.5 text-[10px] font-bold transition hover:scale-[1.02]" style={{ background: GOLD, color: "#000", boxShadow: `0 0 16px ${GOLD}66` }}>
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
          <button aria-label="Close" onClick={() => setNoteOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div className="relative w-full max-w-sm panel neon-border p-4 rounded-2xl pop-in" style={{ boxShadow: `0 0 40px ${NEON_PURPLE}66,0 0 80px ${PINK}44` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${GOLD}1A`, border: `1px solid ${GOLD}66`, boxShadow: `0 0 12px ${GOLD}55` }}>
                  <Sparkles className="w-4 h-4" style={{ color: GOLD }} />
                </div>
                <div>
                  <div className="text-sm font-bold leading-none">Note of the Day</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Share what's on your mind</div>
                </div>
              </div>
              <button onClick={() => setNoteOpen(false)} className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-white/5 border border-white/10 mb-3">
              {([{ id: "note", label: "Note", I: StickyNote, c: NEON_PURPLE }, { id: "gif", label: "GIF", I: ImageIcon, c: NEON_BLUE }] as const).map(({ id, label, I, c }) => (
                <button key={id} onClick={() => setNoteTab(id)} className={`relative flex items-center justify-center gap-1.5 py-1.5 rounded-full text-[11px] font-semibold transition ${noteTab === id ? "text-white" : "text-muted-foreground"}`} style={noteTab === id ? { background: `${c}26`, boxShadow: `0 0 14px ${c}55,inset 0 0 8px ${c}33`, border: `1px solid ${c}66` } : {}}>
                  <I className="w-3.5 h-3.5" style={noteTab === id ? { color: c } : undefined} /> {label}
                </button>
              ))}
            </div>
            {noteTab === "note" ? (
              <div>
                <div className="relative">
                  <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 50))} placeholder="What's the vibe today?" rows={3} className="w-full resize-none rounded-xl bg-black/40 border border-white/10 px-3 py-2 text-[12px] text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-400/60 transition" />
                  <div className="absolute bottom-2 right-2.5 text-[9px] font-semibold tabular-nums" style={{ color: note.length >= 50 ? PINK : note.length >= 40 ? GOLD : "rgba(255,255,255,0.5)" }}>{note.length}/50</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {FALL_POSTS.concat([fallPost1]).map((src, i) => (
                  <button key={i} className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-cyan-400/60 transition group">
                    <img src={src} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute bottom-1 left-1 text-[8px] font-bold text-white/90 bg-black/60 px-1 rounded">GIF</div>
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => setNoteOpen(false)} className="mt-3 w-full rounded-full py-2 text-[12px] font-bold transition active:scale-95" style={{ background: `linear-gradient(90deg,${NEON_PURPLE},${PINK},${GOLD})`, color: "#0a0a0a", boxShadow: `0 0 20px ${NEON_PURPLE}66` }}>
              Post for today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
