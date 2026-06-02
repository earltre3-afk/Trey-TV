import { PrivacyMode, SignalResult, UserAnswer } from "@/types/naturalAbility";
import { ABILITY_RESULTS } from "./naturalAbilityResults";

export interface NaturalAbilityBadgeActivation {
  badgeSlug: string;
  badgeLabel: string;
  badgeAbility: string;
  badgeSubtitle: string;
  badgeSymbol: string;
  badgeGlow: string;
  feedNamePreview: string;
  showOnProfile: boolean;
  showInFeed: boolean;
  isActive: boolean;
  activatedAt: string;
}

export interface TreyTVNaturalAbilitySavePayload {
  user_id: string;
  primary_ability: string;
  secondary_ability: string;
  signal_blend: string;
  signal_strength: string;
  answer_snapshot: UserAnswer[];
  badge_slug: string;
  badge_label: string;
  badge_symbol: string;
  badge_glow: string;
  feed_name_preview: string;
  privacy_mode: PrivacyMode;
  show_on_profile: boolean;
  show_in_feed: boolean;
  badge_activated_at: string;
  completed_at: string;
  updated_at: string;
}

export function slugifyAbility(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getVisibilityFlags(privacyMode: PrivacyMode): {
  showOnProfile: boolean;
  showInFeed: boolean;
} {
  return {
    showOnProfile: privacyMode === "public" || privacyMode === "profile",
    showInFeed: privacyMode === "public",
  };
}

export function buildFeedNamePreview(displayName: string, result: SignalResult): string {
  const primary = ABILITY_RESULTS[result.primaryAbility];
  return `${displayName} ${primary.feedSymbol} ${primary.ability}`;
}

export function buildNaturalAbilityBadgeActivation(params: {
  displayName: string;
  result: SignalResult;
  privacyMode: PrivacyMode;
  activatedAt?: string;
}): NaturalAbilityBadgeActivation {
  const { displayName, result, privacyMode } = params;
  const primary = ABILITY_RESULTS[result.primaryAbility];
  const activatedAt = params.activatedAt ?? new Date().toISOString();
  const flags = getVisibilityFlags(privacyMode);

  return {
    badgeSlug: `natural-ability-${slugifyAbility(primary.ability)}`,
    badgeLabel: `${primary.ability} Badge`,
    badgeAbility: primary.ability,
    badgeSubtitle: primary.subtitle,
    badgeSymbol: primary.feedSymbol,
    badgeGlow: primary.glow,
    feedNamePreview: buildFeedNamePreview(displayName, result),
    showOnProfile: flags.showOnProfile,
    showInFeed: flags.showInFeed,
    isActive: true,
    activatedAt,
  };
}

export function buildTreyTVNaturalAbilitySavePayload(params: {
  userId: string;
  displayName: string;
  result: SignalResult;
  privacyMode: PrivacyMode;
  answers?: UserAnswer[];
  takenAt?: string;
}): TreyTVNaturalAbilitySavePayload {
  const takenAt = params.takenAt ?? new Date().toISOString();
  const activation = buildNaturalAbilityBadgeActivation({
    displayName: params.displayName,
    result: params.result,
    privacyMode: params.privacyMode,
    activatedAt: takenAt,
  });

  return {
    user_id: params.userId,
    primary_ability: params.result.primaryAbility,
    secondary_ability: params.result.secondaryAbility,
    signal_blend: params.result.signalBlend,
    signal_strength: params.result.signalStrength,
    answer_snapshot: params.answers ?? [],
    badge_slug: activation.badgeSlug,
    badge_label: activation.badgeLabel,
    badge_symbol: activation.badgeSymbol,
    badge_glow: activation.badgeGlow,
    feed_name_preview: activation.feedNamePreview,
    privacy_mode: params.privacyMode,
    show_on_profile: activation.showOnProfile,
    show_in_feed: activation.showInFeed,
    badge_activated_at: activation.activatedAt,
    completed_at: takenAt,
    updated_at: takenAt,
  };
}
