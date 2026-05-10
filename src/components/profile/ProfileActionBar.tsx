/**
 * ProfileActionBar.tsx
 * Action button row below stats for public / guest viewers.
 * Owner view shows: Edit Profile, Creator Studio (if creator)
 * Public user view: Follow, Message, Share, Subscribe (creator)
 * Guest view: Follow prompt → sign up, Share
 */

import { Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Pencil, UserPlus, UserCheck, MessageCircle, Share2, Copy,
  Crown, Sparkles, Gift, Bell,
} from "lucide-react";
import { toast } from "sonner";
import type { ProfileContext } from "./ProfileTypes";
import { GiftPickerSheet } from "@/components/gifts/GiftPickerSheet";

interface Props extends ProfileContext {
  followingThis?: boolean;
  subscribedThis?: boolean;
  notifyOn?: boolean;
  onFollow?: () => void;
  onSubscribe?: () => void;
  onNotify?: () => void;
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
}: Props) {
  const isCreator = profileType === "creator";
  const [giftOpen, setGiftOpen] = useState(false);

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
          <Link
            to="/creator-studio"
            id="creator-studio-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold glass border border-primary/40 text-primary glow-gold tilt-press"
          >
            <Crown className="size-4" /> Creator Studio
          </Link>
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
          to="/onboarding"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold liquid-glass border border-white/10 text-foreground"
        >
          Sign up to follow
        </Link>
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
  return (
    <div className="flex flex-wrap gap-2">
      {/* Follow */}
      <button
        id={`follow-btn-${profile.uid}-bar`}
        onClick={onFollow}
        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold tilt-press ${
          followingThis
            ? "glass border border-white/15"
            : "bg-primary text-primary-foreground glow-gold"
        }`}
      >
        {followingThis ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
        {followingThis ? "Friends" : "Follow"}
      </button>

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

      {/* Creator-only: Send Gift */}
      {isCreator && (
        <>
          <button
            onClick={() => setGiftOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold glass border border-primary/40 text-primary glow-gold tilt-press"
          >
            <Gift className="size-4" /> Gift
          </button>
          <GiftPickerSheet open={giftOpen} onClose={() => setGiftOpen(false)} recipient={profile.handle} />
        </>
      )}

      {/* Message (non-creator) */}
      {!isCreator && (
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
