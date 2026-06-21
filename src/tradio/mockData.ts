// Tradio TV shared types + gradient constants.
// NOTE: All screen content now comes from Supabase (see src/tradio/api.ts).
// These gradient constants remain for components that render decorative artwork.

export interface TradioItem {
  id: string;
  title: string;
  subtitle?: string;
  type?: string;
  gradient: string;
  icon?: 'wave' | 'play' | 'logo' | 'text' | null;
  label?: string | null;
  streamUrl?: string;
  image?: string;
}

export interface Track {
  id: string;
  num: number;
  title: string;
  duration: string;
  streamUrl?: string;
  artist?: string;
  gradient?: string;
}

export const GRADIENTS = {
  purplePink: 'linear-gradient(135deg,#a855f7 0%,#ec4899 60%,#f97316 100%)',
  cyanBlue: 'linear-gradient(135deg,#22d3ee 0%,#3b82f6 100%)',
  navy: 'linear-gradient(135deg,#1e3a8a 0%,#312e81 100%)',
  pinkPurple: 'linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)',
  sunset: 'linear-gradient(160deg,#7c3aed 0%,#db2777 50%,#f59e0b 100%)',
  red: 'linear-gradient(135deg,#ef4444 0%,#f97316 100%)',
  teal: 'linear-gradient(135deg,#14b8a6 0%,#22d3ee 100%)',
  violet: 'linear-gradient(135deg,#6d28d9 0%,#9333ea 100%)',
  city: 'linear-gradient(180deg,#4c1d95 0%,#be185d 55%,#1e1b4b 100%)',
};
