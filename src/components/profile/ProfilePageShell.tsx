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

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useGoBack } from "@/hooks/use-go-back";
import { useFollow } from "@/lib/follow-store";
import { toast } from "sonner";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileIdentityCard } from "./ProfileIdentityCard";
import { ProfileStatsBar } from "./ProfileStatsBar";
import { ProfileActionBar } from "./ProfileActionBar";
import { NormalUserProfileModules } from "./NormalUserProfileModules";
import { CreatorProfileModules } from "./CreatorProfileModules";
import { ProfileOwnerControls } from "./ProfileOwnerControls";
import { PublicProfileControls } from "./PublicProfileControls";
import type { ProfileData, ViewerRole, ProfileType } from "./ProfileTypes";

export interface ProfilePageShellProps {
  profile: ProfileData;
  viewerRole: ViewerRole;
}

export function ProfilePageShell({ profile, viewerRole }: ProfilePageShellProps) {
  const goBack = useGoBack("/");
  const follow = useFollow();
  const [subscribed, setSubscribed] = useState(false);
  const [notifyOn, setNotifyOn] = useState(true);

  // ── Derive context ──────────────────────────────────────────────────────
  const isOwner = viewerRole === "owner";
  const isGuest = viewerRole === "guest";
  const isPublicUser = viewerRole === "user";
  const profileType: ProfileType = profile.profileType;
  const followingThis = follow.isFollowing(profile.handle);

  const ctx = {
    profile,
    viewerRole,
    profileType,
    isOwner,
    isPublicUser,
    isGuest,
  };

  // ── Follow handler ──────────────────────────────────────────────────────
  const onFollow = () => {
    const now = follow.toggle({
      id: profile.uid,
      name: profile.displayName,
      handle: profile.handle,
      avatar: profile.avatarUrl,
    });
    toast.success(now ? `Added ${profile.displayName} to your friends` : `Removed ${profile.displayName}`);
  };

  // ── Subscribe handler ───────────────────────────────────────────────────
  const onSubscribe = () => {
    setSubscribed((s) => !s);
    toast(subscribed ? "Unsubscribed" : "Subscribed ✦");
  };

  const onNotify = () => setNotifyOn((n) => !n);

  return (
    <AppShell wide>
      <div className="space-y-5 -mt-3 lg:mt-0">

        {/* ── HERO BANNER ────────────────────────────────────────── */}
        <ProfileBanner
          {...ctx}
          onBack={goBack}
        />

        {/* ── MOBILE IDENTITY CARD ───────────────────────────────── */}
        <ProfileIdentityCard
          {...ctx}
          onFollow={onFollow}
          followingThis={followingThis}
        />

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
            {isOwner ? (
              <ProfileOwnerControls {...ctx} />
            ) : (
              <PublicProfileControls {...ctx} />
            )}
          </aside>
        </div>

        {/* ── MOBILE SIDEBAR (below main content) ────────────────── */}
        <div className="lg:hidden space-y-4 pb-4">
          {isOwner ? (
            <ProfileOwnerControls {...ctx} />
          ) : (
            <PublicProfileControls {...ctx} />
          )}
        </div>

      </div>
    </AppShell>
  );
}
