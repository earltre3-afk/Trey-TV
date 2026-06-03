/**
 * ProfileActionBar.tsx
 * Action button row below stats for public / guest viewers.
 * Owner view shows: Edit Profile, Creator Studio (if creator)
 * Public user view: Follow, Message, Share, Subscribe (creator)
 * Guest view: Follow prompt → sign up, Share
 */

import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Pencil,
  UserPlus,
  UserCheck,
  MessageCircle,
  Share2,
  Copy,
  Crown,
  Sparkles,
  Gift,
  Bell,
  MoreVertical,
  Shield,
  ShieldAlert,
  Tv,
} from "lucide-react";
import { toast } from "sonner";
import type { ProfileContext } from "./ProfileTypes";
import { GiftPickerSheet } from "@/components/gifts/GiftPickerSheet";
import { toggleFollow, blockUser, unblockUser } from "@/lib/social-relationships";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props extends ProfileContext {
  followingThis?: boolean;
  subscribedThis?: boolean;
  notifyOn?: boolean;
  onFollow?: (nextFollowing: boolean) => void;
  onSubscribe?: () => void;
  onNotify?: () => void;
  profileUserId?: string;
}

export function ProfileActionBar({
  profile,
  profileType,
  viewerRole,
  isOwner,
  isGuest,
  followingThis,
  subscribedThis,
  notifyOn,
  onFollow,
  onSubscribe,
  onNotify,
  profileUserId,
  relationshipStatus,
}: Props) {
  const isCreator = profileType === "creator";
  const [giftOpen, setGiftOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(followingThis || false);
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (followingThis !== undefined) {
      setIsFollowing(Boolean(followingThis));
    }
  }, [followingThis]);

  const onShare = async () => {
    try {
      await navigator.share?.({ title: profile.displayName, url: location.href });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast("Link copied");
    }
  };

  const onCopyUid = () => {
    navigator.clipboard?.writeText(profile.uid);
    toast.success("UID copied");
  };

  const handleFollowToggle = async () => {
    if (!profileUserId) return;

    const previousState = isFollowing;
    setIsFollowing(!previousState); // Optimistic update

    const success = await toggleFollow(profileUserId, previousState);
    if (success) {
      if (onFollow) onFollow(!previousState);
    } else {
      setIsFollowing(previousState); // Revert on failure
    }
  };

  const handleBlock = async () => {
    if (!profileUserId) return;

    setIsBlocking(true);
    const success = await blockUser(profileUserId);
    setIsBlocking(false);

    if (success) {
      // Refresh page or update UI to show blocked state
      window.location.reload();
    }
  };

  const handleUnblock = async () => {
    if (!profileUserId) return;

    setIsBlocking(true);
    const success = await unblockUser(profileUserId);
    setIsBlocking(false);

    if (success) {
      window.location.reload();
    }
  };

  // ── Owner view ──────────────────────────────────────────────────────────
  if (isOwner) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          to="/edit-profile"
          id="edit-profile-btn-bar"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press"
        >
          <Pencil className="size-4" /> Edit Profile
        </Link>
        {isCreator && (
          <>
            <Link
              to="/u/$uid/channel"
              params={{ uid: profile.uid }}
              id="creator-channel-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-300 via-primary to-amber-500 text-black glow-gold tilt-press"
            >
              <Tv className="size-4" /> View Channel
            </Link>
            <Link
              to="/creator-studio"
              id="creator-studio-btn"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold glass border border-primary/40 text-primary glow-gold tilt-press"
            >
              <Crown className="size-4" /> Creator Studio
            </Link>
          </>
        )}
        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 hover:bg-white/5 tilt-press"
          aria-label="Share profile"
        >
          <Share2 className="size-4" />
        </button>
        <button
          onClick={onCopyUid}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 hover:bg-white/5 tilt-press"
          aria-label="Copy UID"
        >
          <Copy className="size-4" />
        </button>
      </div>
    );
  }

  // ── Guest view ──────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          to="/signup"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold liquid-glass border border-white/10 text-foreground"
        >
          Sign up to follow
        </Link>
        {isCreator && (
          <Link
            to="/u/$uid/channel"
            params={{ uid: profile.uid }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-300 via-primary to-amber-500 text-black glow-gold tilt-press"
          >
            <Tv className="size-4" /> View Channel
          </Link>
        )}
        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 tilt-press"
          aria-label="Share profile"
        >
          <Share2 className="size-4" />
        </button>
        <button
          onClick={onCopyUid}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 tilt-press"
          aria-label="Copy UID"
        >
          <Copy className="size-4" />
        </button>
      </div>
    );
  }

  // ── Authenticated public user ────────────────────────────────────────────
  // Check if blocked relationship exists
  const isBlocked = relationshipStatus?.is_blocked || false;
  const isBlockedBy = relationshipStatus?.is_blocked_by || false;
  const canFollow = relationshipStatus?.can_follow !== false;
  const canMessage = relationshipStatus?.can_message !== false;

  // If current user blocked the profile, show blocked state
  if (isBlocked) {
    return (
      <div className="flex flex-wrap gap-2">
        <div className="rounded-2xl liquid-glass border border-white/10 px-4 py-2.5 text-sm text-muted-foreground">
          You have blocked this user
        </div>
        <button
          onClick={handleUnblock}
          disabled={isBlocking}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 hover:bg-white/5 tilt-press"
        >
          <ShieldAlert className="size-4" /> {isBlocking ? "Unblocking..." : "Unblock"}
        </button>
        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 tilt-press"
          aria-label="Share profile"
        >
          <Share2 className="size-4" />
        </button>
      </div>
    );
  }

  // If profile blocked the current user, show unavailable state
  if (isBlockedBy) {
    return (
      <div className="flex flex-wrap gap-2">
        <div className="rounded-2xl liquid-glass border border-white/10 px-4 py-2.5 text-sm text-muted-foreground">
          This profile is not available
        </div>
        <button
          onClick={onShare}
          className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 tilt-press"
          aria-label="Share profile"
        >
          <Share2 className="size-4" />
        </button>
      </div>
    );
  }

  const isFollowedBy = relationshipStatus?.is_followed_by || false;
  const isMutual = relationshipStatus?.is_mutual_follow || false;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Follows you / Mutual indicator */}
      {!isFollowing && isFollowedBy && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold glass border border-white/15 text-muted-foreground">
          Follows you
        </span>
      )}
      {isMutual && isFollowing && (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold glass border border-primary/30 text-primary">
          ↕ Mutual
        </span>
      )}

      {/* Follow */}
      {canFollow && (
        <button
          id={`follow-btn-${profile.uid}-bar`}
          onClick={handleFollowToggle}
          disabled={!profileUserId}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold tilt-press ${
            isFollowing
              ? "glass border border-white/15"
              : "bg-primary text-primary-foreground glow-gold"
          }`}
        >
          {isFollowing ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
          {isFollowing ? "Following" : "Follow"}
        </button>
      )}

      {/* Creator-only: Subscribe */}
      {isCreator && (
        <button
          onClick={onSubscribe}
          className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold tilt-press ${
            subscribedThis
              ? "border border-[oklch(0.7_0.25_340_/_0.5)] text-[oklch(0.85_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.12)]"
              : "border border-[oklch(0.7_0.25_340_/_0.5)] text-[oklch(0.85_0.25_340)] hover:bg-[oklch(0.7_0.25_340_/_0.1)]"
          }`}
        >
          <Sparkles className="size-4" />
          {subscribedThis ? "Subscribed" : "Subscribe"}
        </button>
      )}

      {isCreator && (
        <Link
          to="/u/$uid/channel"
          params={{ uid: profile.uid }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-300 via-primary to-amber-500 text-black glow-gold tilt-press"
        >
          <Tv className="size-4" /> View Channel
        </Link>
      )}

      {/* Creator-only: Send Gift */}
      {isCreator && (
        <>
          <button
            onClick={() => setGiftOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold glass border border-primary/40 text-primary glow-gold tilt-press"
          >
            <Gift className="size-4" /> Gift
          </button>
          <GiftPickerSheet
            open={giftOpen}
            onClose={() => setGiftOpen(false)}
            recipient={profile.handle}
          />
        </>
      )}

      {/* Message (non-creator, if allowed) */}
      {!isCreator && canMessage && (
        <Link
          to="/inbox"
          search={{ to: profile.handle }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 hover:bg-white/5"
        >
          <MessageCircle className="size-4" /> Message
        </Link>
      )}

      {/* Notify */}
      <button
        onClick={onNotify}
        className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border tilt-press ${
          notifyOn ? "border-primary/40 text-primary glow-gold" : "border-white/15"
        }`}
        aria-label="Notifications"
      >
        <Bell className="size-4" />
      </button>

      {/* More menu with Block option */}
      {profileUserId && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 hover:bg-white/5 tilt-press"
              aria-label="More options"
            >
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onCopyUid}>
              <Copy className="size-4 mr-2" /> Copy UID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleBlock}
              disabled={isBlocking}
              className="text-destructive"
            >
              <Shield className="size-4 mr-2" /> {isBlocking ? "Blocking..." : "Block User"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Share */}
      <button
        onClick={onShare}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold glass border border-white/15 tilt-press"
        aria-label="Share profile"
      >
        <Share2 className="size-4" />
      </button>
    </div>
  );
}
