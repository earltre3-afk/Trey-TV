/**
 * ProfileIdentityCard.tsx
 * Mobile-only identity block rendered below the banner avatar.
 * Shows: display name, handle, badge row, bio, location/link, action buttons.
 * Adapts content based on profileType and viewerRole.
 */

import { Link } from "@tanstack/react-router";
import { Crown, Sparkles, Pencil } from "lucide-react";
import { VerifiedBadge } from "@/components/brand/Badge";
import { ZodiacBadge } from "@/components/zodiac";
import type { ProfileContext } from "./ProfileTypes";

interface Props extends ProfileContext {
  /** Called when follow button is clicked — parent handles store logic */
  onFollow?: (nextFollowing?: boolean) => void;
  followingThis?: boolean;
}

export function ProfileIdentityCard({ profile, profileType, viewerRole, isOwner, isGuest }: Props) {
  const isCreator = profileType === "creator";
  const isSiteOwnerProfile = Boolean(profile.isFounder);

  return (
    <div className="lg:hidden text-center px-2 -mt-2 space-y-2">
      {/* Display name */}
      <h1
        className={`text-2xl font-bold leading-tight ${isSiteOwnerProfile ? "text-gradient-gold" : ""}`}
      >
        {profile.displayName}
      </h1>

      {/* Handle + badge row */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground flex-wrap">
        <span>@{profile.handle}</span>
        {isCreator && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[oklch(0.82_0.16_85_/_0.15)] text-[oklch(0.82_0.16_85)] border border-[oklch(0.82_0.16_85_/_0.4)]">
            <VerifiedBadge kind="creator" className="!size-3" /> Verified Creator
          </span>
        )}
        {!isCreator && profile.isVerified && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[oklch(0.78_0.18_150_/_0.15)] text-[oklch(0.78_0.18_150)] border border-[oklch(0.78_0.18_150_/_0.4)]">
            <VerifiedBadge kind="user" className="!size-3" /> Verified
          </span>
        )}
      </div>

      {profile.zodiacSunSign && (
        <div className="flex justify-center">
          <ZodiacBadge
            sign={profile.zodiacSunSign}
            isCusp={profile.zodiacIsCusp}
            cuspLabel={profile.zodiacCuspLabel}
            size="sm"
            showName
          />
        </div>
      )}

      {/* Owner special ribbon row */}
      {isSiteOwnerProfile && (
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.25em] px-2.5 py-1 rounded-full owner-ribbon text-black">
            <Crown className="size-3" /> OWNER
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.7_0.25_340_/_0.18)] text-[oklch(0.85_0.25_340)] border border-[oklch(0.7_0.25_340_/_0.5)]">
            <Sparkles className="size-3" /> Founder
          </span>
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm whitespace-pre-line leading-relaxed text-muted-foreground max-w-xs mx-auto">
          {profile.bio}
        </p>
      )}

      {/* Location / link */}
      {(profile.location || profile.websiteLink) && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          {profile.location && (
            <span className="flex items-center gap-1">📍 {profile.location}</span>
          )}
          {profile.websiteLink && (
            <span className="flex items-center gap-1 text-[oklch(0.82_0.15_215)]">
              🔗 {profile.websiteLink}
            </span>
          )}
        </div>
      )}

      {/* CTA buttons */}
      <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
        {isOwner ? (
          <Link
            to="/edit-profile"
            id="edit-profile-btn-mobile"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press"
          >
            <Pencil className="size-3.5" /> Edit Profile
          </Link>
        ) : isGuest ? (
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold liquid-glass border border-white/10 text-foreground"
          >
            Sign up to interact
          </Link>
        ) : null}
      </div>
    </div>
  );
}
