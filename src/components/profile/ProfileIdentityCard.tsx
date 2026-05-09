/**
 * ProfileIdentityCard.tsx
 * Mobile-only identity block rendered below the banner avatar.
 * Shows: display name, handle, badge row, bio, location/link, action buttons.
 * Adapts content based on profileType and viewerRole.
 */

import { Link } from "@tanstack/react-router";
import { Crown, Sparkles, UserPlus, MessageCircle, Pencil } from "lucide-react";
import { VerifiedBadge } from "@/components/brand/Badge";
import type { ProfileContext } from "./ProfileTypes";

interface Props extends ProfileContext {
  /** Called when follow button is clicked — parent handles store logic */
  onFollow?: () => void;
  followingThis?: boolean;
}

export function ProfileIdentityCard({
  profile,
  profileType,
  viewerRole,
  isOwner,
  isGuest,
  onFollow,
  followingThis,
}: Props) {
  const isCreator = profileType === "creator";

  return (
    <div className="lg:hidden text-center px-2 -mt-2 space-y-2">
      {/* Display name */}
      <h1 className={`text-2xl font-bold leading-tight ${isOwner ? "text-gradient-gold" : ""}`}>
        {profile.displayName}
      </h1>

      {/* Handle + badge row */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground flex-wrap">
        <span>@{profile.handle}</span>
        {isCreator && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
            <VerifiedBadge kind="creator" className="!size-3" /> Verified Creator
          </span>
        )}
        {!isCreator && profile.isVerified && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-[oklch(0.78_0.18_150_/_0.15)] text-[oklch(0.78_0.18_150)] border border-[oklch(0.78_0.18_150_/_0.4)]">
            <VerifiedBadge kind="user" className="!size-3" /> Verified
          </span>
        )}
      </div>

      {/* Owner special ribbon row */}
      {isOwner && (
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-[0.25em] px-2.5 py-1 rounded-full owner-ribbon text-black">
            <Crown className="size-3" /> OWNER
          </span>
          {profile.isFounder && (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[oklch(0.7_0.25_340_/_0.18)] text-[oklch(0.85_0.25_340)] border border-[oklch(0.7_0.25_340_/_0.5)]">
              <Sparkles className="size-3" /> Founder
            </span>
          )}
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
            to="/onboarding"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold liquid-glass border border-white/10 text-foreground"
          >
            Sign up to interact
          </Link>
        ) : (
          <>
            <button
              id={`follow-btn-${profile.uid}-mobile`}
              onClick={onFollow}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold tilt-press ${
                followingThis
                  ? "glass border border-white/15"
                  : "bg-primary text-primary-foreground glow-gold"
              }`}
            >
              <UserPlus className="size-3.5" />
              {followingThis ? "Friends" : "Follow"}
            </button>
            {!isCreator && (
              <Link
                to="/inbox"
                search={{ to: profile.handle }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold glass border border-white/15 hover:bg-white/5"
              >
                <MessageCircle className="size-3.5" /> Message
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
