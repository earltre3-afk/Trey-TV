/**
 * PublicProfileControls.tsx
 * Sidebar / inline panel visible to PUBLIC viewers and GUESTS (not the owner).
 * Shows: quick share/copy actions, mutual creators, subscribe prompts for creators.
 * Guests see sign-up nudges instead of interactive buttons.
 */

import { Link } from "@tanstack/react-router";
import { Share2, Copy, MoreHorizontal, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { creators } from "@/lib/mock-data";
import type { ProfileContext } from "./ProfileTypes";
import { ProfileSectionCard } from "./ProfileSectionCard";

interface Props extends ProfileContext {}

export function PublicProfileControls({ profile, viewerRole }: Props) {
  const isGuest = viewerRole === "guest";

  const onShare = async () => {
    try {
      await navigator.share?.({ title: profile.displayName, url: location.href });
    } catch {
      await navigator.clipboard?.writeText(location.href);
      toast("Link copied");
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick actions row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            icon: Share2,
            label: "Share",
            onClick: onShare,
          },
          {
            icon: Copy,
            label: "Copy UID",
            onClick: () => {
              navigator.clipboard?.writeText(profile.uid);
              toast.success("UID copied");
            },
          },
          {
            icon: MoreHorizontal,
            label: "More",
            onClick: () => toast("More options"),
          },
        ].map((a) => (
          <button
            key={a.label}
            onClick={a.onClick}
            className="rounded-2xl liquid-glass liquid-hover border border-white/10 flex flex-col items-center justify-center py-3 gap-1"
          >
            <a.icon className="size-4" />
            <span className="text-[10px] text-muted-foreground">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Engagement snapshot — shown to everyone */}
      <ProfileSectionCard title="This month" icon={TrendingUp} iconColor="text-[oklch(0.78_0.18_150)]">
        <ul className="space-y-3 text-sm">
          {[
            { label: "Profile views", val: "12.4K" },
            { label: "New followers", val: "+842", color: "text-[oklch(0.78_0.18_150)]" },
            { label: "Post reach", val: "94.1K" },
            { label: "Avg. watch time", val: "3:42" },
          ].map((row) => (
            <li key={row.label} className="flex items-center justify-between">
              <span className="text-muted-foreground">{row.label}</span>
              <span className={`font-semibold ${row.color ?? ""}`}>{row.val}</span>
            </li>
          ))}
        </ul>
      </ProfileSectionCard>

      {/* Frequently watched together */}
      <div className="rounded-3xl glass neon-border p-4">
        <h3 className="text-sm font-bold mb-3">Frequently watched together</h3>
        <ul className="space-y-3">
          {creators.slice(0, 4).map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <img
                src={c.avatar}
                alt=""
                className="size-9 rounded-full object-cover ring-1 ring-white/15 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{c.name}</div>
                <div className="text-[11px] text-muted-foreground truncate">@{c.handle}</div>
              </div>
              {isGuest ? (
                <Link
                  to="/signup"
                  className="text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10"
                >
                  Join
                </Link>
              ) : (
                <button className="text-[11px] px-2.5 py-1 rounded-full border border-primary/40 text-primary hover:bg-primary/10 tilt-press">
                  Follow
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Guest CTA block */}
      {isGuest && (
        <div className="rounded-3xl liquid-glass border border-white/10 p-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Join Trey TV to follow, message, and interact.</p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press"
          >
            Sign up free
          </Link>
        </div>
      )}
    </div>
  );
}
