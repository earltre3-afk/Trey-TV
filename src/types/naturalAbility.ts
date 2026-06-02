export type NaturalAbility =
  | "Diviner"
  | "Reaper"
  | "Empath"
  | "Charmer"
  | "Alchemist"
  | "Herbalist"
  | "Seer"
  | "Shapeshifter"
  | "Healer"
  | "Dreamer"
  | "Prophet"
  | "Ungifted"
  | "Manifestor"
  | "Creative";

export type Genre = "Drama" | "Funny" | "Scary" | "Action" | "Real Life";

export type SignalStrength = "Strong" | "Mixed" | "Emerging" | "Unreadable";

export interface ScenarioChoice {
  id: "A" | "B" | "C";
  label: string;
  body: string;
  primary: NaturalAbility;
  secondary: NaturalAbility;
}

export interface Scenario {
  id: number;
  genre: Genre;
  title: string;
  imageSrc?: string;
  imageAlt?: string;
  scenarioBody: string;
  choices: ScenarioChoice[];
  customOption: boolean;
  sceneBrief?: string[];
  pressureLine?: string;
}

export interface AbilityResultContent {
  ability: NaturalAbility;
  subtitle: string;
  explanation: string;
  strength: string;
  shadow: string;
  growthPrompt: string;
  feedSymbol: string;
  glow: string; // tailwind hex
  accent: string;
}

export interface UserAnswer {
  scenarioId: number;
  selectedChoiceId?: "A" | "B" | "C";
  customText?: string;
}

export interface SignalResult {
  primaryAbility: NaturalAbility;
  secondaryAbility: NaturalAbility;
  signalBlend: string;
  signalStrength: SignalStrength;
  scores: Record<NaturalAbility, number>;
  interpretation?: string;
}

export type PrivacyMode = "public" | "profile" | "private";

export interface ActiveNaturalAbilityBadge {
  badgeSlug: string;
  badgeLabel: string;
  badgeSymbol: string;
  badgeSubtitle: string;
  badgeGlow: string;
  feedNamePreview: string;
  showOnProfile: boolean;
  showInFeed: boolean;
  isActive: boolean;
  badgeActivatedAt: string;
}
