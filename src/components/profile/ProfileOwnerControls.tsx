/**
 * ProfileOwnerControls.tsx
 * Sidebar / inline panel visible ONLY to the profile owner.
 * Shows: Rewards card, profile completion, quick shortcut links.
 * For normal users: rewards + Prescribe Me + profile progress
 * For creators: rewards + analytics teaser + Creator Studio shortcut
 */

import { Link } from "@tanstack/react-router";
import {
  Gem,
  Crown,
  TrendingUp,
  Sparkles,
  BookmarkCheck,
  Heart,
  BarChart2,
  Settings,
  CheckCircle2,
  Tv,
} from "lucide-react";
import type { ProfileContext } from "./ProfileTypes";
import { ProfileSectionCard } from "./ProfileSectionCard";

interface Props extends ProfileContext {}

export function ProfileOwnerControls({ profile, profileType }: Props) {
  const isCreator = profileType === "creator";
  const rewards = profile.rewards;
  const tierColors: Record<string, string> = {
    BRONZE: "text-[oklch(0.72_0.12_50)]",
    SILVER: "text-[oklch(0.82_0.02_270)]",
    GOLD: "text-primary",
    DIAMOND: "text-[oklch(0.82_0.15_215)]",
  };
  const tierColor = tierColors[rewards?.tier ?? "GOLD"] ?? "text-primary";

  return (
    <div className="space-y-4">
      {/* ── Rewards card ────────────────────────────────────── */}
      {rewards && (
        <Link
          to="/rewards"
          id="rewards-card-link"
          className="block rounded-3xl liquid-glass liquid-hover border border-white/10 p-4 relative overflow-hidden group"
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/30 blur-3xl group-hover:bg-primary/50 transition pointer-events-none"
          />
          <div className="relative flex items-center gap-3">
            <div className="size-12 rounded-2xl grid place-items-center bg-primary/15 text-primary glow-gold shrink-0">
              <Gem className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">
                Rewards · <span className={tierColor}>{rewards.tier}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                {rewards.points.toLocaleString()} pts available
              </div>
              {rewards.uid423 && (
                <div className="text-[10px] tracking-widest text-muted-foreground mt-0.5">
                  423 UID: {rewards.uid423}
                </div>
              )}
            </div>
            <div className="text-xs text-primary font-semibold shrink-0">Open →</div>
          </div>
        </Link>
      )}

      {/* ── Creator Studio shortcut (creator owners only) ────── */}
      {isCreator && (
        <Link
          to="/creator-studio"
          id="creator-studio-owner-card"
          className="block rounded-3xl liquid-glass liquid-hover border border-primary/25 p-4 relative overflow-hidden group"
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/20 blur-3xl pointer-events-none"
          />
          <div className="relative flex items-center gap-3">
            <div className="size-12 rounded-2xl grid place-items-center bg-primary/15 text-primary glow-gold shrink-0">
              <Crown className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">Creator Studio</div>
              <div className="text-[11px] text-muted-foreground">Manage shows, analytics, fans</div>
            </div>
            <div className="text-xs text-primary font-semibold shrink-0">Open →</div>
          </div>
        </Link>
      )}

      {isCreator && (
        <Link
          to="/u/$uid/channel"
          params={{ uid: profile.uid }}
          id="creator-channel-owner-card"
          className="block rounded-3xl liquid-glass liquid-hover border border-primary/25 p-4 relative overflow-hidden group"
        >
          <div
            aria-hidden
            className="absolute -top-10 -right-10 size-32 rounded-full bg-primary/20 blur-3xl pointer-events-none"
          />
          <div className="relative flex items-center gap-3">
            <div className="size-12 rounded-2xl grid place-items-center bg-primary/15 text-primary glow-gold shrink-0">
              <Tv className="size-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold">Creator Channel</div>
              <div className="text-[11px] text-muted-foreground">Open your public channel hub</div>
            </div>
            <div className="text-xs text-primary font-semibold shrink-0">View {">"}</div>
          </div>
        </Link>
      )}

      {/* ── Analytics teaser (creator only) ────────────────── */}
      {isCreator && (
        <ProfileSectionCard
          title="This month"
          icon={TrendingUp}
          iconColor="text-[oklch(0.78_0.18_150)]"
          isOwner
        >
          <ul className="space-y-3 text-sm">
            {[
              { label: "Profile views", val: "12.4K" },
              { label: "New fans", val: "+842", color: "text-[oklch(0.78_0.18_150)]" },
              { label: "Watch hours", val: "3.2K" },
              { label: "Avg. watch time", val: "3:42" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold ${row.color ?? ""}`}>{row.val}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/creator-studio/analytics"
            className="mt-3 block text-xs text-center text-primary hover:underline"
          >
            View full analytics →
          </Link>
        </ProfileSectionCard>
      )}

      {/* ── Normal user engagement snapshot ─────────────────── */}
      {!isCreator && (
        <ProfileSectionCard
          title="This month"
          icon={BarChart2}
          iconColor="text-[oklch(0.78_0.18_150)]"
          isOwner
        >
          <ul className="space-y-3 text-sm">
            {[
              { label: "Profile views", val: "1.2K" },
              { label: "New followers", val: "+54", color: "text-[oklch(0.78_0.18_150)]" },
              { label: "Prescriptions", val: "12" },
              { label: "Watch time", val: "18h" },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{row.label}</span>
                <span className={`font-semibold ${row.color ?? ""}`}>{row.val}</span>
              </li>
            ))}
          </ul>
        </ProfileSectionCard>
      )}

      {/* ── Quick shortcuts ──────────────────────────────────── */}
      <div className="rounded-3xl glass neon-border p-4 space-y-1">
        <h3 className="text-xs tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
          <Settings className="size-3" /> QUICK ACTIONS
        </h3>
        {[
          { icon: BookmarkCheck, label: "Saved Content", to: "/collections" },
          { icon: Heart, label: "Liked Content", to: "/collections" },
          { icon: Sparkles, label: "Prescribe Me", to: "/prescribe-me" },
          { icon: CheckCircle2, label: "Badges & Achievements", to: "/rewards" },
        ].map((item) => (
          <Link
            key={item.label}
            to={item.to as any}
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/5 text-sm text-muted-foreground hover:text-foreground transition"
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
