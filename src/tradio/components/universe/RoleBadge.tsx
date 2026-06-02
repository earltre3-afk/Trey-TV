import React from "react";
import {
  BadgeCheck,
  Crown,
  Disc3,
  Headphones,
  Mic2,
  Music2,
  Radio,
  Shield,
  Sparkles,
  Star,
  Tv,
  User,
} from "lucide-react";
import type { NaturalAbility } from "@/tradio/lib/universe/signalTest";

/**
 * TREY TV UNIVERSE — Role / identity badge system.
 *
 * One premium, theme-aligned badge set that works across Trey TV and Tradio:
 * profile headers, comments, messages, search results, mentions, Song Wars,
 * radio shows, and creator cards. Badges connect personal Trey TV identity to a
 * user's public Tradio music identity WITHOUT collapsing them into one page.
 *
 * Components-only file (safe for fast-refresh).
 */

export type UniverseBadgeKind =
  | "verified_artist"
  | "artist"
  | "producer"
  | "dj_host"
  | "radio_host"
  | "show_creator"
  | "tv_creator"
  | "verified_creator"
  | "admin"
  | "owner"
  | "fan"
  | "trizfit"
  | "natural_ability";

interface BadgeStyle {
  label: string;
  Icon: React.FC<{ className?: string }>;
  tone: string;
}

const BADGE_STYLES: Record<Exclude<UniverseBadgeKind, "natural_ability">, BadgeStyle> = {
  verified_artist: {
    label: "Verified Artist",
    Icon: BadgeCheck,
    tone: "border-fuchsia-300/35 bg-fuchsia-500/12 text-fuchsia-100",
  },
  artist: {
    label: "Artist",
    Icon: Music2,
    tone: "border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-200",
  },
  producer: {
    label: "Producer",
    Icon: Disc3,
    tone: "border-purple-300/25 bg-purple-500/10 text-purple-200",
  },
  dj_host: {
    label: "DJ / Host",
    Icon: Mic2,
    tone: "border-amber-300/25 bg-amber-500/10 text-amber-200",
  },
  radio_host: {
    label: "Radio Host",
    Icon: Radio,
    tone: "border-amber-300/25 bg-amber-500/10 text-amber-200",
  },
  show_creator: {
    label: "Show Creator",
    Icon: Headphones,
    tone: "border-cyan-300/25 bg-cyan-500/10 text-cyan-200",
  },
  tv_creator: {
    label: "TV Creator",
    Icon: Tv,
    tone: "border-cyan-300/25 bg-cyan-500/10 text-cyan-200",
  },
  verified_creator: {
    label: "Verified Creator",
    Icon: BadgeCheck,
    tone: "border-emerald-300/30 bg-emerald-500/10 text-emerald-200",
  },
  admin: { label: "Admin", Icon: Shield, tone: "border-red-300/30 bg-red-500/10 text-red-200" },
  owner: { label: "Owner", Icon: Crown, tone: "border-red-300/35 bg-red-500/12 text-red-100" },
  fan: { label: "Fan", Icon: User, tone: "border-white/15 bg-white/[0.05] text-white/70" },
  trizfit: {
    label: "Trizfit",
    Icon: Star,
    tone: "border-cyan-300/30 bg-gradient-to-r from-fuchsia-500/15 to-cyan-500/15 text-cyan-100",
  },
};

const SIZE: Record<"sm" | "md", string> = {
  sm: "px-2 py-0.5 text-[10px] gap-1",
  md: "px-2.5 py-1 text-[11px] gap-1.5",
};

const ICON_SIZE: Record<"sm" | "md", string> = { sm: "h-3 w-3", md: "h-3.5 w-3.5" };

export const RoleBadge: React.FC<{
  kind: Exclude<UniverseBadgeKind, "natural_ability">;
  size?: "sm" | "md";
}> = ({ kind, size = "md" }) => {
  const style = BADGE_STYLES[kind];
  const { Icon } = style;
  return (
    <span
      className={`inline-flex items-center rounded-full border font-bold uppercase tracking-wider ${SIZE[size]} ${style.tone}`}
    >
      <Icon className={ICON_SIZE[size]} /> {style.label}
    </span>
  );
};

/** Natural Ability result badge from the Signal Test (permanent identity marker). */
export const NaturalAbilityBadge: React.FC<{ ability: NaturalAbility; size?: "sm" | "md" }> = ({
  ability,
  size = "md",
}) => (
  <span
    className={`inline-flex items-center rounded-full border border-violet-300/30 bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 font-bold uppercase tracking-wider text-violet-100 ${SIZE[size]}`}
  >
    <Sparkles className={ICON_SIZE[size]} /> {ability}
  </span>
);

export interface UniverseBadgeSpec {
  kind: UniverseBadgeKind;
  ability?: NaturalAbility;
}

/** Renders a row of badges, de-duplicated, with a sensible cap. */
export const BadgeRow: React.FC<{
  badges: UniverseBadgeSpec[];
  size?: "sm" | "md";
  max?: number;
  className?: string;
}> = ({ badges, size = "md", max = 5, className = "" }) => {
  const shown = badges.slice(0, max);
  if (!shown.length) return null;
  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {shown.map((badge, i) =>
        badge.kind === "natural_ability" && badge.ability ? (
          <NaturalAbilityBadge key={`na-${i}`} ability={badge.ability} size={size} />
        ) : badge.kind !== "natural_ability" ? (
          <RoleBadge key={`${badge.kind}-${i}`} kind={badge.kind} size={size} />
        ) : null,
      )}
    </span>
  );
};
