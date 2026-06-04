/**

 * ProfilePageShell.tsx

 * ═══════════════════════════════════════════════════════════════

 * THE MASTER PROFILE TEMPLATE

 * ═══════════════════════════════════════════════════════════════

 *

 * This is the reusable, automated profile template system for Trey TV.

 * Every new user and creator account automatically inherits this layout.

 *

 * Usage:

 *   <ProfilePageShell profile={profileData} viewerRole="owner" />

 *

 * The shell resolves:

 * - Which banner/hero treatment to apply (owner / creator / user)

 * - Which main-column modules to show (NormalUser vs Creator)

 * - Which sidebar to show (Owner controls vs Public controls)

 * - All responsive layout (1-col mobile → 2-col desktop)

 *

 * DO NOT hardcode any profile-specific data here.

 * All data must flow in through the ProfileData prop.

 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BadgeCheck,
  Bookmark,
  ChevronRight,
  Clock,
  FileText,
  Globe,
  Heart,
  ImageIcon,
  Instagram,
  KeyRound,
  Link2,
  Mail,
  MapPin,
  MoreHorizontal,
  Music2,
  Play,
  Plus,
  Share,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  UserPlus,
  Users,
  Youtube,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";

import { useGoBack } from "@/hooks/use-go-back";

import { toast } from "sonner";

import { ProfileBanner } from "./ProfileBanner";

import { ProfileIdentityCard } from "./ProfileIdentityCard";

import { ProfileStatsBar } from "./ProfileStatsBar";

import { ProfileActionBar } from "./ProfileActionBar";

import { NormalUserProfileModules } from "./NormalUserProfileModules";

import { CreatorProfileModules } from "./CreatorProfileModules";

import { ProfileOwnerControls } from "./ProfileOwnerControls";

import { PublicProfileControls } from "./PublicProfileControls";

import { ProfileTopThree } from "./ProfileTopThree";

import type {
  ProfileData,
  ViewerRole,
  ProfileType,
  RelationshipStatus,
  TopThreeEntry,
} from "./ProfileTypes";
import { GoldCheck } from "@/components/brand/Badge";
import { AvatarWithFallback } from "@/components/brand/DefaultAvatar";
import { ProfilePage as LovableProfilePage } from "./lovable/LovableProfilePage";
import { toggleFollow } from "@/lib/social-relationships";
import treyTvLogo from "@/assets/trey-tv-logo.png";
import heroFallback from "@/assets/pixel-channel-hero.jpg";
import taurusBull from "@/assets/pixel-taurus-bull.png";
import postFallback1 from "@/assets/pixel-post1.jpg";
import postFallback2 from "@/assets/pixel-post2.jpg";
import postFallback3 from "@/assets/pixel-post3.jpg";

export interface ProfilePageShellProps {
  profile: ProfileData;

  viewerRole: ViewerRole;

  relationshipStatus?: RelationshipStatus;

  topThree?: TopThreeEntry[];

  profileUserId?: string;
}

function RolePill({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
      style={{
        color,
        borderColor: `${color}88`,
        background: `${color}1A`,
        boxShadow: `0 0 10px ${color}55, inset 0 0 6px ${color}22`,
      }}
    >
      <Icon className="size-2.5" /> {label}
    </span>
  );
}

function PixelActionButton({
  label,
  icon: Icon,
  color,
  primary,
  disabled,
  onClick,
}: {
  label: string;
  icon: any;
  color: string;
  primary?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative flex flex-col items-center gap-0.5 overflow-hidden rounded-xl border px-2 py-2 text-[10px] font-bold transition hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45"
      style={{
        color: primary ? "#0a0a0a" : color,
        borderColor: `${color}88`,
        background: primary
          ? `linear-gradient(135deg, ${color}, #EC4899)`
          : `linear-gradient(135deg, ${color}1F, transparent 70%)`,
        boxShadow: `0 0 16px ${color}55, inset 0 0 10px ${color}22`,
      }}
    >
      <Icon className="size-3.5" />
      {label}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full" />
    </button>
  );
}

function PixelLinkButton({
  label,
  icon: Icon,
  color,
  to,
  params,
  primary,
  disabled,
}: {
  label: string;
  icon: any;
  color: string;
  to: string;
  params?: Record<string, string>;
  primary?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return <PixelActionButton label={label} icon={Icon} color={color} disabled />;
  }

  return (
    <Link
      to={to as any}
      params={params as any}
      className="group relative flex flex-col items-center gap-0.5 overflow-hidden rounded-xl border px-2 py-2 text-[10px] font-bold transition hover:scale-[1.03] active:scale-95"
      style={{
        color: primary ? "#0a0a0a" : color,
        borderColor: `${color}88`,
        background: primary
          ? `linear-gradient(135deg, ${color}, #EC4899)`
          : `linear-gradient(135deg, ${color}1F, transparent 70%)`,
        boxShadow: `0 0 16px ${color}55, inset 0 0 10px ${color}22`,
      }}
    >
      <Icon className="size-3.5" />
      {label}
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_40%,rgba(255,255,255,0.25)_50%,transparent_60%)] transition-transform duration-700 group-hover:translate-x-full" />
    </Link>
  );
}

function SocialIcon({ icon: Icon, color, href }: { icon: any; color: string; href?: string }) {
  const content = (
    <span
      className="p-1 transition-transform active:scale-90 inline-block"
      style={{ color, filter: `drop-shadow(0 0 6px ${color})` }}
    >
      <Icon className="size-4" />
    </span>
  );
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:scale-110 transition-transform"
      >
        {content}
      </a>
    );
  }
  return (
    <button
      className="p-1 transition-transform active:scale-90"
      style={{ color, filter: `drop-shadow(0 0 6px ${color})` }}
    >
      <Icon className="size-4" />
    </button>
  );
}

function Certification({
  icon: Icon,
  label,
  sub,
  color,
}: {
  icon: any;
  label: string;
  sub: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 py-1">
      <div
        className="flex size-7 items-center justify-center rounded-full"
        style={{
          background: `${color}1A`,
          border: `1px solid ${color}66`,
          boxShadow: `0 0 12px ${color}55, inset 0 0 8px ${color}22`,
        }}
      >
        <Icon className="size-3.5" style={{ color }} />
      </div>
      <div className="mt-0.5 text-[9px] font-bold leading-none" style={{ color }}>
        {label}
      </div>
      <div className="text-[8px] leading-none text-muted-foreground">{sub}</div>
    </div>
  );
}

function ProfileStat({
  icon: Icon,
  color,
  value,
  label,
}: {
  icon: any;
  color: string;
  value: number | string | undefined;
  label: string;
}) {
  return (
    <div className="flex items-center justify-center gap-1.5 px-1 py-2.5">
      <Icon className="size-3.5" style={{ color, filter: `drop-shadow(0 0 6px ${color})` }} />
      <div>
        <div className="text-sm font-bold leading-none">{value ?? "-"}</div>
        <div className="mt-0.5 text-[9px] text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function FactLabel({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <li className="flex items-center gap-2 text-left">
      <Icon className="size-3 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
    </li>
  );
}

function FactValue({ value, color = "#fff" }: { value: string; color?: string }) {
  return (
    <li className="font-medium" style={{ color }}>
      {value}
    </li>
  );
}

function GoldProfileCheck({ size = 24 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full text-black pixel-gold-pulse"
      style={{
        width: size,
        height: size,
        background:
          "radial-gradient(circle at 35% 20%, #fffbe8 0%, #ffe58b 18%, #ffc857 42%, #b87908 72%, #3d2500 100%)",
        boxShadow:
          "0 0 0 1px rgba(255,255,255,0.55) inset, 0 0 14px rgba(255,200,87,0.8), 0 0 28px rgba(255,160,20,0.42)",
      }}
    >
      <BadgeCheck
        size={Math.max(14, Math.round(size * 0.68))}
        className="fill-white/80 text-black"
        strokeWidth={3}
      />
    </span>
  );
}

export function ProfilePageShell({
  profile,

  viewerRole,

  relationshipStatus,

  topThree,

  profileUserId,
}: ProfilePageShellProps) {
  const goBack = useGoBack("/");

  const [subscribed, setSubscribed] = useState(false);

  const [notifyOn, setNotifyOn] = useState(true);
  const [liveRelationship, setLiveRelationship] = useState(relationshipStatus);
  const [followerDelta, setFollowerDelta] = useState(0);

  useEffect(() => {
    setLiveRelationship(relationshipStatus);
    setFollowerDelta(0);
  }, [relationshipStatus, profile.uid]);

  // ── Derive context ──────────────────────────────────────────────────────

  const isOwner = viewerRole === "owner";

  const isGuest = viewerRole === "guest";

  const isPublicUser = viewerRole === "user";

  const profileType: ProfileType = profile.profileType;

  const isDefaultBanner =
    !profile.bannerUrl ||
    profile.bannerUrl === "/profile-banner" ||
    profile.bannerUrl.includes("profile-banner");

  const bannerSrc = isDefaultBanner ? heroFallback : profile.bannerUrl;

  const followingThis = Boolean(liveRelationship?.is_following);

  const liveProfile = useMemo<ProfileData>(() => {
    const currentFollowers = Number(profile.stats.followers);
    return {
      ...profile,
      stats: {
        ...profile.stats,
        followers: Number.isFinite(currentFollowers)
          ? Math.max(0, currentFollowers + followerDelta)
          : profile.stats.followers,
      },
    };
  }, [profile, followerDelta]);

  const ctx = {
    profile: liveProfile,

    viewerRole,

    profileType,

    isOwner,

    isPublicUser,

    isGuest,

    relationshipStatus: liveRelationship,

    topThree,
  };

  // ── Follow handler ──────────────────────────────────────────────────────

  const onFollow = (nextFollowing?: boolean) => {
    if (typeof nextFollowing !== "boolean") return;
    setLiveRelationship((status) =>
      status
        ? {
            ...status,
            is_following: nextFollowing,
            is_mutual_follow: nextFollowing && status.is_followed_by,
          }
        : status,
    );
    setFollowerDelta((delta) => delta + (nextFollowing ? 1 : -1));
    toast.success(
      nextFollowing ? `Following ${profile.displayName}` : `Unfollowed ${profile.displayName}`,
    );
  };

  // ── Subscribe handler ───────────────────────────────────────────────────

  const onSubscribe = () => {
    setSubscribed((s) => !s);

    toast(subscribed ? "Unsubscribed" : "Subscribed ✦");
  };

  const onNotify = () => setNotifyOn((n) => !n);
  const profileAccentStyle = useMemo(() => {
    const accent =
      profile.accentColor && /^#[0-9A-Fa-f]{6}$/.test(profile.accentColor)
        ? profile.accentColor
        : "#FFC857";
    const r = parseInt(accent.slice(1, 3), 16);
    const g = parseInt(accent.slice(3, 5), 16);
    const b = parseInt(accent.slice(5, 7), 16);
    return {
      "--profile-accent": accent,
      "--profile-accent-rgb": `${r}, ${g}, ${b}`,
      "--primary": accent,
    } as CSSProperties;
  }, [profile.accentColor]);

  if (isPublicUser && (liveRelationship?.is_blocked || liveRelationship?.is_blocked_by)) {
    return (
      <AppShell wide>
        <div className="space-y-5 -mt-3 lg:mt-0" style={profileAccentStyle}>
          <ProfileBanner
            {...ctx}
            onBack={goBack}
            followingThis={followingThis}
            onFollow={onFollow}
            profileUserId={profileUserId}
          />
          <div className="mx-auto max-w-xl rounded-3xl liquid-glass border border-white/10 p-6 text-center">
            <div className="text-lg font-bold">
              {liveRelationship.is_blocked ? "You blocked this profile" : "Profile unavailable"}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {liveRelationship.is_blocked
                ? "Unblock this user to follow, message, or feature them again."
                : "This profile is not available for interaction."}
            </p>
            <div className="mt-4 flex justify-center">
              <ProfileActionBar
                {...ctx}
                followingThis={followingThis}
                subscribedThis={subscribed}
                notifyOn={notifyOn}
                onFollow={onFollow}
                onSubscribe={onSubscribe}
                onNotify={onNotify}
                profileUserId={profileUserId}
              />
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  const isFounderProfile = Boolean(profile.isFounder);
  const isCreatorProfile = profileType === "creator";
  const canShowChannel = isCreatorProfile;
  const canShowCreatorBadge = isCreatorProfile;
  const canShowOwnerBadges = isFounderProfile;
  const channelHref = `/u/${profile.uid}/channel`;
  const actionAccent =
    profile.accentColor && /^#[0-9A-Fa-f]{6}$/.test(profile.accentColor)
      ? profile.accentColor
      : "#FFC857";

  const handlePixelFollow = async () => {
    if (isOwner) return;
    if (isGuest) {
      window.location.href = "/signup";
      return;
    }
    if (!profileUserId || liveRelationship?.can_follow === false) return;
    const previous = followingThis;
    onFollow(!previous);
    const success = await toggleFollow(profileUserId, previous);
    if (!success) onFollow(previous);
  };

  const shareProfile = async () => {
    try {
      await navigator.share?.({ title: `${profile.displayName} on Trey TV`, url: location.href });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast.success("Profile link copied");
    }
  };

  return (
    <AppShell wide>
      <div className="-mx-4 -mt-5 sm:-mx-6 lg:-mx-8" style={profileAccentStyle}>
        <LovableProfilePage
          profile={liveProfile}
          viewerRole={viewerRole}
          variant={isOwner ? "owner" : isCreatorProfile ? "creator" : "user"}
          relationshipStatus={liveRelationship}
          topThree={topThree}
          profileUserId={profileUserId}
          onBack={goBack}
        />
      </div>
    </AppShell>
  );

  return (
    <AppShell wide>
      <main
        className="pixel-profile-page -mx-4 -mt-5 min-h-screen pb-10 sm:-mx-6 lg:-mx-8"
        style={profileAccentStyle}
      >
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.36),transparent_62%)] blur-3xl" />
          <div className="absolute top-1/3 -right-24 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(0,183,255,0.24),transparent_62%)] blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.18),transparent_62%)] blur-3xl" />
        </div>

        <section className="relative w-full pixel-reveal">
          <div className="relative h-[220px] w-full overflow-hidden sm:h-[260px] md:h-[300px]">
            <img src={bannerSrc} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/45 to-[#05070D]/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(168,85,247,0.25),transparent_62%)]" />

            <button
              onClick={goBack}
              className="absolute left-3 top-3 z-20 flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="size-4" />
            </button>
            <div className="absolute right-3 top-3 z-20 flex gap-1.5">
              <button
                onClick={shareProfile}
                className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-95"
                aria-label="Share profile"
              >
                <Share className="size-4" />
              </button>
              <button
                className="flex size-9 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md transition active:scale-95"
                aria-label="More profile actions"
              >
                <MoreHorizontal className="size-4" />
              </button>
            </div>

            <div
              className={`pointer-events-none absolute left-1/2 z-20 w-[160px] -translate-x-1/2 sm:w-[200px] md:w-[240px] transition-all duration-300 ${isDefaultBanner ? "top-1/2 -translate-y-1/2" : "top-2"}`}
            >
              <div className="relative animate-float-slow">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,200,87,0.42),transparent_68%)] blur-2xl"
                />
                <img
                  src={treyTvLogo}
                  alt="Trey TV"
                  className="relative h-auto w-full object-contain drop-shadow-[0_0_18px_rgba(255,200,87,0.55)]"
                />
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#05070D] to-transparent" />
          </div>

          <div className="absolute -bottom-14 left-1/2 z-30 -translate-x-1/2">
            <div className="relative size-[120px] md:size-[150px]">
              <div className="absolute -inset-10 rounded-full bg-violet/40 blur-3xl" />
              <div className="pixel-ring-gradient absolute -inset-[6px] rounded-full animate-spin-slow" />
              <div className="absolute -inset-[2px] rounded-full pixel-ring-pulse" />
              <div className="absolute inset-0 overflow-hidden rounded-full border border-white/10 bg-[#05070D]">
                <AvatarWithFallback
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  name={profile.displayName}
                  uid={profile.uid}
                  size="2xl"
                  className="size-full"
                />
              </div>

              {profile.isVerified && (
                <div className="absolute -bottom-1 -right-1">
                  <GoldCheck size={42} />
                </div>
              )}

              {isOwner && (
                <Link
                  to="/u/$uid/edit-profile"
                  params={{ uid: profile.uid }}
                  aria-label="Edit profile"
                  className="pixel-plus-pulse absolute -right-2 -top-2 z-10 flex size-9 items-center justify-center rounded-full border-2 border-white/80 bg-white text-black shadow-[0_0_18px_rgba(255,255,255,0.85)] transition-transform hover:scale-110 active:scale-95"
                >
                  <Plus className="size-5" strokeWidth={3} />
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1100px] space-y-2.5 px-2.5 pt-20 md:px-5">
          <section className="text-center pixel-reveal">
            <div className="flex items-center justify-center gap-1.5">
              <h1 className="text-2xl font-extrabold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:text-3xl">
                {profile.displayName}
              </h1>
              {profile.isVerified && <GoldCheck size={22} />}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">@{profile.handle}</div>

            {(canShowOwnerBadges || canShowCreatorBadge) && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
                {canShowOwnerBadges && <RolePill icon={KeyRound} label="Owner" color="#FFC857" />}
                {canShowCreatorBadge && (
                  <RolePill icon={Sparkles} label="Content Creator" color="#EC4899" />
                )}
                {canShowOwnerBadges && (
                  <RolePill icon={ShieldCheck} label="Admin" color="#00B7FF" />
                )}
              </div>
            )}

            {profile.bio && (
              <p className="mx-auto mt-2 max-w-xl whitespace-pre-line px-4 text-[12px] leading-snug text-foreground/85">
                {profile.bio}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
              {profile.location && (
                <span className="inline-flex items-center gap-0.5">
                  <MapPin className="size-3 text-[#FFC857]" /> {profile.location}
                </span>
              )}
              {profile.websiteLink && (
                <span className="inline-flex items-center gap-0.5">
                  <Link2 className="size-3 text-[#00B7FF]" /> {profile.websiteLink}
                </span>
              )}
            </div>

            <div className="mx-auto mt-3 grid max-w-md grid-cols-4 gap-1.5">
              {!isOwner && (
                <PixelActionButton
                  label={followingThis ? "Following" : "Follow"}
                  icon={followingThis ? UserCheck : UserPlus}
                  color="#A855F7"
                  primary
                  disabled={liveRelationship?.can_follow === false}
                  onClick={handlePixelFollow}
                />
              )}
              {isOwner && (
                <PixelLinkButton
                  label="Edit"
                  icon={ImageIcon}
                  color="#A855F7"
                  to="/u/$uid/edit-profile"
                  params={{ uid: profile.uid }}
                  primary
                />
              )}
              {canShowCreatorBadge && (
                <PixelActionButton
                  label={subscribed ? "Subscribed" : "Subscribe"}
                  icon={Sparkles}
                  color="#FFC857"
                  onClick={onSubscribe}
                />
              )}
              <PixelLinkButton
                label="Message"
                icon={Mail}
                color="#00B7FF"
                to="/inbox"
                disabled={!isOwner && liveRelationship?.can_message === false}
              />
              <PixelActionButton
                label="Gift"
                icon={Heart}
                color="#EC4899"
                onClick={() => toast("Gifts coming soon")}
              />
              <PixelActionButton
                label="Save"
                icon={Bookmark}
                color={actionAccent}
                onClick={() => toast("Saved profile")}
              />
            </div>

            {canShowChannel && (
              <div className="mt-3 flex justify-center">
                <Link
                  to={channelHref as any}
                  className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-[12px] font-extrabold uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.04] active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, #FFE9A8 0%, #FFC857 35%, #E9A917 60%, #FFF3C4 100%)",
                    boxShadow:
                      "0 0 0 1px rgba(255,255,255,0.35) inset, 0 0 22px rgba(255,200,87,0.6), 0 8px 30px rgba(0,0,0,0.55)",
                  }}
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent_38%,rgba(255,255,255,0.85)_50%,transparent_62%)] transition-transform duration-1000 group-hover:translate-x-full" />
                  <Play className="relative size-4 fill-black" strokeWidth={2.5} />
                  <span className="relative">
                    {canShowOwnerBadges ? "View My Channel" : "View Channel"}
                  </span>
                  <ChevronRight className="relative size-4" strokeWidth={3} />
                </Link>
              </div>
            )}

            {(() => {
              const instagram = profile.socialInstagram;
              const tiktok = profile.socialTikTok;
              const youtube = profile.socialYouTube;
              if (!instagram && !tiktok && !youtube) return null;
              return (
                <div className="mt-3 flex items-center justify-center gap-3.5">
                  {instagram && (
                    <SocialIcon
                      icon={Instagram}
                      color="#EC4899"
                      href={
                        instagram!.startsWith("http")
                          ? instagram!
                          : `https://instagram.com/${instagram!.replace(/^@/, "")}`
                      }
                    />
                  )}
                  {tiktok && (
                    <SocialIcon
                      icon={Music2}
                      color="#FFFFFF"
                      href={
                        tiktok!.startsWith("http")
                          ? tiktok!
                          : `https://tiktok.com/@${tiktok!.replace(/^@/, "")}`
                      }
                    />
                  )}
                  {youtube && (
                    <SocialIcon
                      icon={Youtube}
                      color="#EF4444"
                      href={
                        youtube!.startsWith("http")
                          ? youtube!
                          : youtube!.includes("youtube.com")
                            ? youtube!.startsWith("http")
                              ? youtube!
                              : `https://${youtube!}`
                            : `https://youtube.com/@${youtube!.replace(/^@/, "")}`
                      }
                    />
                  )}
                </div>
              );
            })()}
          </section>

          {canShowOwnerBadges && (
            <section className="pixel-panel pixel-neon-border p-2.5 pixel-reveal">
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <Certification
                  icon={ShieldCheck}
                  label="Identity"
                  sub="Confirmed"
                  color="#FFC857"
                />
                <Certification icon={User} label="Original" sub="Account" color="#00B7FF" />
                <Certification icon={KeyRound} label="Owner" sub="Verified" color="#A855F7" />
              </div>
            </section>
          )}

          <section className="pixel-panel pixel-neon-border grid grid-cols-4 divide-x divide-white/5 pixel-reveal">
            <ProfileStat
              icon={FileText}
              color="#00B7FF"
              value={profile.stats.posts}
              label="Posts"
            />
            <ProfileStat
              icon={Users}
              color="#A855F7"
              value={profile.stats.followers}
              label="Followers"
            />
            <ProfileStat
              icon={UserPlus}
              color="#EC4899"
              value={profile.stats.following}
              label="Following"
            />
            <ProfileStat
              icon={Sparkles}
              color="#FFC857"
              value={profile.stats.prescriptions ?? "-"}
              label="Rx"
            />
          </section>

          <section className="pixel-panel pixel-neon-border relative p-3 pixel-reveal">
            <div className="mb-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
                <h3 className="text-xs font-semibold">
                  About {profile.displayName.split(" ")[0] || profile.displayName}
                </h3>
              </div>
              <p className="mb-2 text-[11px] leading-relaxed text-foreground/80">
                {profile.tagline || profile.bio || "This Trey TV profile is being built."}
              </p>
            </div>

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1.5 text-[10px] md:gap-x-6 md:text-[11px]">
              <ul className="justify-self-start space-y-1.5">
                <FactLabel icon={Globe} label="Member since" />
                <FactLabel icon={Sparkles} label="Profile type" />
                <FactLabel icon={User} label="Prescribe Me" />
                <FactLabel icon={BadgeCheck} label="Status" />
                <FactLabel icon={Clock} label="Response" />
              </ul>

              <div className="flex justify-center self-center">
                <div className="relative flex h-[112px] w-[96px] items-center justify-center md:h-[140px] md:w-[120px]">
                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,200,87,0.38),transparent_70%)] blur-2xl" />
                  <img
                    src={taurusBull}
                    alt=""
                    className="relative w-[64px] animate-float md:w-[80px]"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#FFC857]/55 bg-black/70 px-1.5 py-0.5 text-[7px] font-bold tracking-[0.22em] text-[#FFC857]">
                    {profile.zodiacSunSign
                      ? (profile.zodiacSunSign ?? "").toUpperCase()
                      : "TREY TV"}
                  </span>
                </div>
              </div>

              <ul className="justify-self-end space-y-1.5 text-right">
                <FactValue value={profile.joinedDate || "-"} />
                <FactValue value={isCreatorProfile ? "Creator" : "Member"} />
                <FactValue value="Open" color="#22C55E" />
                <FactValue
                  value={canShowOwnerBadges ? "Owner" : canShowCreatorBadge ? "Approved" : "Active"}
                  color={canShowCreatorBadge ? "#00B7FF" : "#FFFFFF"}
                />
                <FactValue value="-" />
              </ul>
            </div>
          </section>

          {(topThree ?? []).length > 0 && (
            <section className="pixel-panel pixel-neon-border p-3 pixel-reveal">
              <ProfileTopThree topThree={topThree ?? []} isOwner={isOwner} />
            </section>
          )}

          <section className="pixel-panel pixel-neon-border grid grid-cols-4 pixel-reveal">
            {["Posts", "Likes", "Saved", "About"].map((tab, index) => (
              <button
                key={tab}
                className={`relative py-3 text-[12px] font-semibold transition active:scale-95 ${index === 0 ? "text-white" : "text-muted-foreground hover:text-white"}`}
              >
                {tab}
                {index === 0 && (
                  <span className="absolute bottom-0 left-1/3 right-1/3 h-[2px] rounded-full bg-[#FFC857] shadow-[0_0_8px_#FFC857]" />
                )}
              </button>
            ))}
          </section>

          <section className="pixel-panel pixel-neon-border p-3 pixel-reveal">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-[#00B7FF] shadow-[0_0_8px_#00B7FF]" />
                <h3 className="text-xs font-semibold">Recent Posts</h3>
              </div>
              <button className="text-[10px] font-semibold text-muted-foreground hover:text-white">
                View all
              </button>
            </div>
            {isFounderProfile ? (
              <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
                {[postFallback1, postFallback2, postFallback3].map((img, index) => (
                  <div
                    key={img}
                    className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-white/10 bg-white/5"
                  >
                    <img
                      src={img}
                      alt=""
                      className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold text-white/90">
                      {index === 0 ? "Pinned" : "Featured"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <ImageIcon className="mx-auto size-8 text-white/35" />
                <p className="mt-2 text-sm font-semibold">No public posts yet</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  New drops will appear here when this profile publishes content.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );

  return (
    <AppShell wide>
      <div className="space-y-5 -mt-3 lg:mt-0" style={profileAccentStyle}>
        {/* ── HERO BANNER ────────────────────────────────────────── */}

        <ProfileBanner
          {...ctx}
          onBack={goBack}
          followingThis={followingThis}
          onFollow={onFollow}
          profileUserId={profileUserId}
        />

        {/* ── MOBILE IDENTITY CARD ───────────────────────────────── */}

        <ProfileIdentityCard {...ctx} onFollow={onFollow} followingThis={followingThis} />

        {/* ── MOBILE ACTION BAR (non-owners only, below identity) ── */}

        {!isOwner && (
          <div className="lg:hidden">
            <ProfileActionBar
              {...ctx}
              followingThis={followingThis}
              subscribedThis={subscribed}
              notifyOn={notifyOn}
              onFollow={onFollow}
              onSubscribe={onSubscribe}
              onNotify={onNotify}
              profileUserId={profileUserId}
            />
          </div>
        )}

        {/* ── 2-COL DESKTOP LAYOUT ───────────────────────────────── */}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Main content column */}

          <div className="min-w-0 space-y-5">
            {/* Stats bar */}

            <ProfileStatsBar {...ctx} />

            {/* Desktop action bar for owner */}

            {isOwner && (
              <div className="hidden lg:flex">
                <ProfileActionBar
                  {...ctx}
                  followingThis={followingThis}
                  profileUserId={profileUserId}
                  subscribedThis={subscribed}
                  notifyOn={notifyOn}
                  onFollow={onFollow}
                  onSubscribe={onSubscribe}
                  onNotify={onNotify}
                />
              </div>
            )}

            {/* ── PROFILE TYPE MODULES ─────────────────────────── */}

            {profileType === "creator" ? (
              <CreatorProfileModules {...ctx} />
            ) : (
              <NormalUserProfileModules {...ctx} />
            )}
          </div>

          {/* Desktop sidebar */}

          <aside className="hidden lg:flex flex-col gap-4 sticky top-6 h-fit">
            {isOwner ? <ProfileOwnerControls {...ctx} /> : <PublicProfileControls {...ctx} />}
          </aside>
        </div>

        {/* ── MOBILE SIDEBAR (below main content) ────────────────── */}

        <div className="lg:hidden space-y-4 pb-4">
          {isOwner ? <ProfileOwnerControls {...ctx} /> : <PublicProfileControls {...ctx} />}
        </div>
      </div>
    </AppShell>
  );
}
