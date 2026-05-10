// Luxury gift tiers (kept legacy "coin" naming for backwards-compat with imports).
export type CoinTierId = "penny" | "nickel" | "dime" | "quarter" | "dollar";

export type CoinTier = {
  id: CoinTierId;
  name: string;
  symbol: string;   // primary emoji shown in the burst
  cost: number;
  className: string;
  glow: string;
  accent: string;   // accent color for petals/sparkles
  particles: number;
  shower: number;   // floating accents (petals, bubbles, fireworks)
  showerGlyphs: string[];
  blurb: string;
};

export const COIN_TIERS: CoinTier[] = [
  {
    id: "penny",
    name: "Single Rose",
    symbol: "🌹",
    cost: 100,
    className: "gift-rose",
    glow: "oklch(0.65 0.24 15 / 0.85)",
    accent: "oklch(0.7 0.22 15)",
    particles: 8,
    shower: 14,
    showerGlyphs: ["🌹", "🌸", "❤"],
    blurb: "A single rose — soft, sincere support",
  },
  {
    id: "nickel",
    name: "Champagne Toast",
    symbol: "🥂",
    cost: 500,
    className: "gift-champagne",
    glow: "oklch(0.9 0.12 95 / 0.85)",
    accent: "oklch(0.92 0.1 95)",
    particles: 14,
    shower: 22,
    showerGlyphs: ["🥂", "🍾", "✨"],
    blurb: "Pop the bubbly — celebrate the moment",
  },
  {
    id: "dime",
    name: "Limousine of Roses",
    symbol: "🚙",
    cost: 1000,
    className: "gift-limo",
    glow: "oklch(0.6 0.18 350 / 0.9)",
    accent: "oklch(0.72 0.22 350)",
    particles: 20,
    shower: 30,
    showerGlyphs: ["🌹", "🚙", "💖", "✨"],
    blurb: "A black limo, a hundred roses",
  },
  {
    id: "quarter",
    name: "Mansion Estate",
    symbol: "🏛️",
    cost: 2500,
    className: "gift-mansion",
    glow: "oklch(0.85 0.08 280 / 0.9)",
    accent: "oklch(0.85 0.12 280)",
    particles: 26,
    shower: 44,
    showerGlyphs: ["🏛️", "💎", "✨", "🗝️"],
    blurb: "Keys to the estate — pure prestige",
  },
  {
    id: "dollar",
    name: "Castle Getaway",
    symbol: "🏰",
    cost: 10000,
    className: "gift-castle",
    glow: "oklch(0.82 0.16 85 / 0.95)",
    accent: "oklch(0.85 0.18 85)",
    particles: 36,
    shower: 70,
    showerGlyphs: ["🏰", "🎆", "✨", "🌟", "🎇"],
    blurb: "Fireworks over the castle — a fairytale finale",
  },
];

export const getTier = (id: CoinTierId) => COIN_TIERS.find((t) => t.id === id)!;
