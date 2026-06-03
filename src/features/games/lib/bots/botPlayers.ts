/**
 * botPlayers.ts
 * Fictional bot identities for Trey TV card games.
 * No real people, no celebrities, no public figures.
 * Each bot has a distinct visual profile used by GamePlayerSeat to render
 * premium SVG portrait badges.
 */

export type HairStyle =
  | "afro"
  | "short"
  | "natural"
  | "mohawk"
  | "long"
  | "braids"
  | "waves"
  | "locs";

export interface BotProfile {
  name: string;
  /** Skin tone hex */
  skin: string;
  /** Hair fill hex */
  hair: string;
  /** Which silhouette to draw */
  hairStyle: HairStyle;
  /** Background gradient inner stop */
  bgFrom: string;
  /** Background gradient outer stop */
  bgTo: string;
  /** Neon ring accent color */
  ring: string;
}

export const BOT_PROFILES: BotProfile[] = [
  {
    name: "Aaliyah",
    skin: "#C17F4C",
    hair: "#2a1206",
    hairStyle: "afro",
    bgFrom: "#3d1a50",
    bgTo: "#1a0a2a",
    ring: "#FFC857",
  },
  {
    name: "Marcus",
    skin: "#3E2010",
    hair: "#0a0808",
    hairStyle: "short",
    bgFrom: "#081828",
    bgTo: "#020810",
    ring: "#00B7FF",
  },
  {
    name: "Jamal",
    skin: "#8B5E3C",
    hair: "#160804",
    hairStyle: "natural",
    bgFrom: "#082018",
    bgTo: "#020a08",
    ring: "#22D3EE",
  },
  {
    name: "Zion",
    skin: "#C8954A",
    hair: "#1e0a32",
    hairStyle: "mohawk",
    bgFrom: "#1a0a3a",
    bgTo: "#0a0520",
    ring: "#A855F7",
  },
  {
    name: "Nova",
    skin: "#E8B98A",
    hair: "#1a0616",
    hairStyle: "long",
    bgFrom: "#2a0a1a",
    bgTo: "#120508",
    ring: "#EC4899",
  },
  {
    name: "Drei",
    skin: "#4A2610",
    hair: "#0a1a0c",
    hairStyle: "braids",
    bgFrom: "#081a0c",
    bgTo: "#020a04",
    ring: "#22C55E",
  },
  {
    name: "Lyric",
    skin: "#C99A6E",
    hair: "#1e0806",
    hairStyle: "waves",
    bgFrom: "#2a0c06",
    bgTo: "#140402",
    ring: "#F97316",
  },
  {
    name: "Sage",
    skin: "#2E1408",
    hair: "#0a1208",
    hairStyle: "locs",
    bgFrom: "#0a1a0a",
    bgTo: "#040a04",
    ring: "#84CC16",
  },
  {
    name: "Dealer",
    skin: "#8B7355",
    hair: "#1a1206",
    hairStyle: "short",
    bgFrom: "#1a1206",
    bgTo: "#0a0804",
    ring: "#FFC857",
  },
  {
    name: "Player",
    skin: "#C17F4C",
    hair: "#0a0a0a",
    hairStyle: "short",
    bgFrom: "#081828",
    bgTo: "#020810",
    ring: "#00B7FF",
  },
];

export function getBotProfile(name: string): BotProfile {
  const found = BOT_PROFILES.find((p) => p.name === name);
  if (found) return found;
  const hash = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return BOT_PROFILES[hash % BOT_PROFILES.length];
}
