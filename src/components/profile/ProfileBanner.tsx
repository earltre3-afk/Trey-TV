/**
 * ProfileBanner.tsx
 * The cinematic hero banner that sits at the top of every profile.
 * - Owner view: owner-neon/glass/scan treatment with Crown ribbon
 * - Creator: channel-style with larger aspect ratio + conic avatar
 * - Normal user: standard liquid-glass banner
 * - Responsive: taller on lg+ breakpoints
 */

import { ArrowLeft, Bell, MoreHorizontal, Crown, Pencil, Play, Image as ImageIcon, Copy, ExternalLink } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { recordUserTrace } from "@/lib/user-trace";
import type { ProfileContext } from "./ProfileTypes";
import { AnimatedBanner } from "./AnimatedBanner";

interface ProfileBannerProps extends ProfileContext {
  onBack: () => void;
}

export function ProfileBanner({ profile, viewerRole, profileType, isOwner, onBack }: ProfileBannerProps) {
  const { updateUser } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const isCreator = profileType === "creator";

  const heroFrame = isOwner
    ? "owner-neon owner-glass owner-scan rounded-3xl overflow-hidden"
    : isCreator
      ? "glass neon-border rounded-3xl overflow-hidden"
      : "rounded-3xl overflow-hidden border border-white/10 liquid-glass";

  const bannerHeight = isCreator
    ? "h-44 sm:h-60 lg:h-80 xl:h-96"
    : "h-40 sm:h-56 lg:h-72 xl:h-80";

  return (
    <div className="relative">
      <div className={`relative ${heroFrame}`}>
        {/* Banner media — supports static images, looping GIFs, and short looping videos */}
        <AnimatedBanner
          src={profile.bannerUrl}
          fallback="/profile-banner"
          alt=""
          className={`w-full ${bannerHeight} object-cover`}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        {/* Owner neon tint overlay */}
        {isOwner && (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,oklch(0.82_0.16_85_/_0.25),transparent_55%),radial-gradient(circle_at_85%_90%,oklch(0.7_0.25_340_/_0.22),transparent_55%)]"
          />
        )}

        {/* Creator cinematic tint */}
        {isCreator && !isOwner && (
          <div
            aria-hidden
            className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,oklch(0.7_0.25_340_/_0.2),transparent_60%),radial-gradient(circle_at_80%_70%,oklch(0.65_0.22_300_/_0.2),transparent_60%)]"
          />
        )}

        {/* Owner ribbon */}
        {isOwner && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full owner-ribbon text-[10px] font-bold tracking-[0.25em] text-black">
            <Crown className="size-3.5" /> OWNER
          </div>
        )}

        {/* Nav buttons */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="size-9 grid place-items-center rounded-full glass"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            <button aria-label="Notifications" className="size-9 grid place-items-center rounded-full glass">
              <Bell className="size-4" />
            </button>
            <button
              aria-label="More options"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="size-9 grid place-items-center rounded-full glass"
            >
              <MoreHorizontal className="size-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-11 w-64 rounded-2xl liquid-glass border border-white/15 p-2 shadow-[0_24px_70px_-20px_oklch(0_0_0_/_0.85)]">
                {isOwner && (
                  <>
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/5 text-left"
                    >
                      <ImageIcon className="size-4 text-primary" /> Change banner photo
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                      className="hidden"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const banner = URL.createObjectURL(file);
                        updateUser({ banner });
                        recordUserTrace({ userUid: profile.uid, action: "profile.banner_update", targetType: "profile", targetId: profile.uid, details: { fileType: file.type } });
                        toast.success("Banner photo updated");
                        setMenuOpen(false);
                      }}
                    />
                  </>
                )}
                <button
                  onClick={() => { navigator.clipboard?.writeText(profile.uid); toast.success("UID copied"); }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/5 text-left"
                >
                  <Copy className="size-4" /> Copy UID {profile.uid.slice(0, 3)}
                </button>
                <Link
                  to="/u/$uid"
                  params={{ uid: profile.uid }}
                  className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-white/5 text-left"
                >
                  <ExternalLink className="size-4" /> Open public profile
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Desktop: creator channel-style watch now CTA */}
        {isCreator && (
          <div className="hidden lg:flex absolute inset-0 items-center justify-center pointer-events-none">
            <span className="size-16 rounded-full bg-primary/10 border border-primary/30 grid place-items-center opacity-40">
              <Play className="size-6 text-primary" />
            </span>
          </div>
        )}

        {/* Desktop identity overlay — avatar + name + handle */}
        <div className="hidden lg:flex absolute inset-x-0 bottom-0 p-8 gap-6 items-end">
          {/* Avatar */}
          <div
            className={`${isCreator ? "size-28 xl:size-32 rounded-2xl" : "size-32 xl:size-36 rounded-full"} conic-ring bg-background shrink-0 ${isOwner ? "animate-float" : ""}`}
          >
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              className={`size-full ${isCreator ? "rounded-2xl" : "rounded-full"} object-cover ring-2 ring-white/20`}
            />
          </div>

          {/* Identity text — rendered in ProfileIdentityCard on mobile */}
          <div className="flex-1 min-w-0 pb-2">
            <DesktopIdentityText profile={profile} isOwner={isOwner} profileType={profileType} viewerRole={viewerRole} />
          </div>

          {/* Desktop CTA buttons */}
          <div className="flex items-center gap-2 pb-2">
            <DesktopActionButtons profile={profile} isOwner={isOwner} viewerRole={viewerRole} profileType={profileType} />
          </div>
        </div>
      </div>

      {/* Mobile-only avatar overlap */}
      <div
        className={`lg:hidden absolute left-1/2 -translate-x-1/2 -bottom-12 ${isCreator ? "size-24 sm:size-28 rounded-2xl" : "size-24 sm:size-28 rounded-full"} conic-ring bg-background animate-float ${isOwner ? "ring-2 ring-primary/40" : ""}`}
      >
        <img
          src={profile.avatarUrl}
          alt={profile.displayName}
          className={`size-full ${isCreator ? "rounded-2xl" : "rounded-full"} object-cover ring-2 ring-white/20`}
        />
      </div>
      <div className="lg:hidden h-12" />
    </div>
  );
}

// ─── Desktop identity text rendered inside banner ────────────────────────────

import { ShieldCheck, Sparkles } from "lucide-react";
import { VerifiedBadge } from "@/components/brand/Badge";

function DesktopIdentityText({
  profile, isOwner, profileType,
}: Pick<ProfileContext, "profile" | "viewerRole" | "profileType"> & { isOwner: boolean }) {
  const isCreator = profileType === "creator";
  return (
    <>
      <h1 className={`text-3xl xl:text-4xl font-bold leading-tight flex items-center gap-2 ${isOwner ? "text-gradient-gold" : ""}`}>
        {profile.displayName}
        {profile.isVerified && (
          <VerifiedBadge kind={profile.verifiedKind ?? (isCreator ? "creator" : "user")} className="!size-5" />
        )}
        {isOwner && (
          <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.25em] px-2.5 py-1 rounded-full owner-ribbon text-black">
            <ShieldCheck className="size-3" /> OWNER
          </span>
        )}
      </h1>

      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
        <span>@{profile.handle}</span>
        {isCreator && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
            <Crown className="size-3" /> Verified Creator
          </span>
        )}
        {!isCreator && profile.isVerified && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[oklch(0.78_0.18_150_/_0.15)] text-[oklch(0.78_0.18_150)] border border-[oklch(0.78_0.18_150_/_0.4)]">
            <VerifiedBadge kind="user" className="!size-3" /> Verified
          </span>
        )}
        {isOwner && profile.isFounder && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[oklch(0.7_0.25_340_/_0.18)] text-[oklch(0.85_0.25_340)] border border-[oklch(0.7_0.25_340_/_0.5)]">
            <Sparkles className="size-3" /> Founder
          </span>
        )}
      </div>

      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        {profile.location && (
          <span className="flex items-center gap-1">
            <span className="size-3 inline-block">📍</span> {profile.location}
          </span>
        )}
        {profile.websiteLink && (
          <span className="flex items-center gap-1 text-[oklch(0.82_0.15_215)]">
            <span className="size-3 inline-block">🔗</span> {profile.websiteLink}
          </span>
        )}
      </div>
    </>
  );
}

// ─── Desktop banner action buttons ───────────────────────────────────────────

import { UserPlus, MessageCircle } from "lucide-react";

function DesktopActionButtons({
  profile, isOwner, viewerRole, profileType,
}: Pick<ProfileContext, "profile" | "viewerRole" | "profileType"> & { isOwner: boolean }) {
  const isCreator = profileType === "creator";

  if (isOwner) {
    return (
      <Link
        to="/edit-profile"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press"
      >
        <Pencil className="size-4" /> Edit Profile
      </Link>
    );
  }

  if (viewerRole === "guest") {
    return (
      <Link
        to="/signup"
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold liquid-glass border border-white/10"
      >
        Sign up to interact
      </Link>
    );
  }

  return (
    <>
      <button
        id={`follow-btn-${profile.uid}-desktop`}
        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-semibold tilt-press bg-primary text-primary-foreground glow-gold"
      >
        <UserPlus className="size-4" />
        {isCreator ? "Follow" : "Follow"}
      </button>
      {!isCreator && (
        <Link
          to="/inbox"
          search={{ to: profile.handle }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-semibold glass border border-white/15 hover:bg-white/5"
        >
          <MessageCircle className="size-4" /> Message
        </Link>
      )}
    </>
  );
}
