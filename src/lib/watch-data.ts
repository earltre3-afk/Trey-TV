import chris from "@/assets/creator-chris.jpg";
import treyi from "@/assets/creator-treyi.jpg";
import lena from "@/assets/creator-lena.jpg";
import zay from "@/assets/creator-zay.jpg";
import postStudio from "@/assets/post-studio.jpg";
import postNight from "@/assets/post-night.jpg";
import postConcert from "@/assets/post-concert.jpg";
import profileTrey from "@/assets/profile-trey.jpg";

export type Category =
  | "Music" | "Comedy" | "Reality" | "Talk" | "Drama" | "Documentary" | "Lifestyle";

export type Channel = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  color: string; // tailwind/oklch
  category: Category;
  verified?: boolean;
  followers: string;
};

export type Episode = {
  id: string;
  showId: string;
  channelId: string;
  season: number;
  number: number;
  title: string;
  duration: number; // minutes
  thumb: string;
  isFree?: boolean;
  premium?: boolean;
  isLive?: boolean;
  airTime: string; // ISO
  comments: number;
  reactions: number;
};

export type Show = {
  id: string;
  title: string;
  channelId: string;
  poster: string;
  backdrop: string;
  category: Category;
  rating: string;
  year: number;
  description: string;
  episodes: Episode[];
  premium?: boolean;
};

export type ScheduleSlot = {
  channelId: string;
  startsAt: string; // ISO
  endsAt: string;
  episodeId: string;
  status: "live" | "upcoming" | "aired";
};

// ---- Channels ----
export const channels: Channel[] = [
  { id: "ch-chris",  name: "Chris Horizon TV", handle: "chrishorizon", avatar: chris,  color: "oklch(0.7 0.25 340)", category: "Talk",       verified: true, followers: "284K" },
  { id: "ch-treyi",  name: "Trey-I Picks",     handle: "treyipicks",   avatar: treyi,  color: "oklch(0.82 0.15 215)", category: "Lifestyle", verified: true, followers: "412K" },
  { id: "ch-lena",   name: "Lena Live",        handle: "lena",         avatar: lena,   color: "oklch(0.7 0.25 340)", category: "Reality",   verified: true, followers: "198K" },
  { id: "ch-zay",    name: "Zay Beats Radio",  handle: "zaybeats",     avatar: zay,    color: "oklch(0.65 0.22 300)", category: "Music",     verified: true, followers: "521K" },
  { id: "ch-trey",   name: "Trey TV Originals",handle: "trey",         avatar: profileTrey, color: "oklch(0.82 0.16 85)", category: "Drama",  verified: true, followers: "1.2M" },
  { id: "ch-night",  name: "Night Mode",       handle: "nightmode",    avatar: postNight,  color: "oklch(0.65 0.22 300)", category: "Documentary", followers: "92K" },
  { id: "ch-comedy", name: "Punchline Plus",   handle: "punchline",    avatar: postConcert, color: "oklch(0.78 0.18 150)", category: "Comedy", followers: "76K" },
];

const baseDate = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();
const at = (h: number, m = 0) => new Date(baseDate.getTime() + (h * 60 + m) * 60_000).toISOString();

// ---- Shows + episodes ----
function stableCount(seed: string, min: number, span: number) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return min + (hash % span);
}

function mkEp(p: Partial<Episode> & Pick<Episode, "id" | "showId" | "channelId" | "title" | "duration" | "thumb" | "airTime" | "number">): Episode {
  return {
    season: 1,
    isFree: p.number <= 2,
    comments: stableCount(p.id, 12, 320),
    reactions: stableCount(`${p.id}:reactions`, 80, 4200),
    ...p,
  };
}

export const shows: Show[] = [
  {
    id: "s-mindset", title: "Level Up Your Mindset", channelId: "ch-chris", poster: postStudio, backdrop: postStudio,
    category: "Talk", rating: "TV-14", year: 2025,
    description: "Chris Horizon sits down with founders, athletes and artists to unpack the habits that build winners.",
    episodes: [
      mkEp({ id: "e-mind-1", showId: "s-mindset", channelId: "ch-chris", number: 1, title: "Reset the Operating System", duration: 32, thumb: postStudio, airTime: at(20) }),
      mkEp({ id: "e-mind-2", showId: "s-mindset", channelId: "ch-chris", number: 2, title: "Build the Calendar of a King",  duration: 28, thumb: postStudio, airTime: at(20, 30) }),
      mkEp({ id: "e-mind-3", showId: "s-mindset", channelId: "ch-chris", number: 3, title: "How Pros Recover",               duration: 41, thumb: postStudio, airTime: at(21, 15), premium: true }),
    ],
  },
  {
    id: "s-latenight", title: "Late Night Drive", channelId: "ch-zay", poster: postNight, backdrop: postNight,
    category: "Music", rating: "TV-MA", year: 2025,
    description: "A weekly mix tape from Zay Beats designed for the city after dark.",
    episodes: [
      mkEp({ id: "e-late-1", showId: "s-latenight", channelId: "ch-zay", number: 1, title: "Side A — Neon",  duration: 24, thumb: postNight, airTime: at(22) }),
      mkEp({ id: "e-late-2", showId: "s-latenight", channelId: "ch-zay", number: 2, title: "Side B — Smoke", duration: 26, thumb: postNight, airTime: at(22, 30) }),
      mkEp({ id: "e-late-3", showId: "s-latenight", channelId: "ch-zay", number: 3, title: "Encore — Aurora",duration: 30, thumb: postNight, airTime: at(23), premium: true }),
    ],
  },
  {
    id: "s-creators", title: "Creator Talk Live", channelId: "ch-lena", poster: postConcert, backdrop: postConcert,
    category: "Reality", rating: "TV-14", year: 2025,
    description: "Lena hosts the creators shaping tomorrow's culture — live, unfiltered, no script.",
    episodes: [
      mkEp({ id: "e-ctl-1", showId: "s-creators", channelId: "ch-lena", number: 1, title: "Welcome to the Network", duration: 45, thumb: postConcert, airTime: at(19), isLive: true }),
      mkEp({ id: "e-ctl-2", showId: "s-creators", channelId: "ch-lena", number: 2, title: "From Bedroom to Billboard", duration: 50, thumb: postConcert, airTime: at(19, 45) }),
    ],
  },
  {
    id: "s-night", title: "City After Dark", channelId: "ch-night", poster: postNight, backdrop: postNight,
    category: "Documentary", rating: "TV-MA", year: 2025,
    description: "A cinematic doc-series following the people who keep the city alive between midnight and dawn.",
    episodes: [
      mkEp({ id: "e-cad-1", showId: "s-night", channelId: "ch-night", number: 1, title: "The Bouncer", duration: 38, thumb: postNight, airTime: at(23, 30) }),
      mkEp({ id: "e-cad-2", showId: "s-night", channelId: "ch-night", number: 2, title: "Last Call",   duration: 42, thumb: postNight, airTime: at(0, 15) }),
    ],
  },
  {
    id: "s-punch", title: "Punchline Plus", channelId: "ch-comedy", poster: postConcert, backdrop: postConcert,
    category: "Comedy", rating: "TV-14", year: 2025,
    description: "Stand-up sets and sketches from rising comics across the network.",
    episodes: [
      mkEp({ id: "e-pun-1", showId: "s-punch", channelId: "ch-comedy", number: 1, title: "Open Mic Heat", duration: 22, thumb: postConcert, airTime: at(21) }),
      mkEp({ id: "e-pun-2", showId: "s-punch", channelId: "ch-comedy", number: 2, title: "Sketch Hour",   duration: 28, thumb: postConcert, airTime: at(21, 30) }),
    ],
  },
  {
    id: "s-trey", title: "TREY: The Origin", channelId: "ch-trey", poster: profileTrey, backdrop: profileTrey,
    category: "Drama", rating: "TV-MA", year: 2025,
    description: "The flagship Trey TV original. The story behind the network, the man, and the mission.",
    episodes: [
      mkEp({ id: "e-trey-1", showId: "s-trey", channelId: "ch-trey", number: 1, title: "Pilot", duration: 52, thumb: profileTrey, airTime: at(20, 0) }),
      mkEp({ id: "e-trey-2", showId: "s-trey", channelId: "ch-trey", number: 2, title: "The Network", duration: 48, thumb: profileTrey, airTime: at(20, 52) }),
      mkEp({ id: "e-trey-3", showId: "s-trey", channelId: "ch-trey", number: 3, title: "Empire", duration: 50, thumb: profileTrey, airTime: at(21, 40), premium: true }),
    ],
  },
  {
    id: "s-picks", title: "Trey-I Picks", channelId: "ch-treyi", poster: postStudio, backdrop: postStudio,
    category: "Lifestyle", rating: "TV-PG", year: 2025,
    description: "AI-curated lifestyle, tech and culture picks, hand-finished by Trey-I.",
    episodes: [
      mkEp({ id: "e-pick-1", showId: "s-picks", channelId: "ch-treyi", number: 1, title: "Daily Curate", duration: 14, thumb: postStudio, airTime: at(8) }),
      mkEp({ id: "e-pick-2", showId: "s-picks", channelId: "ch-treyi", number: 2, title: "Weekend Drop", duration: 18, thumb: postStudio, airTime: at(9) }),
    ],
  },
];

// Flat episode lookup
export const allEpisodes: Episode[] = shows.flatMap((s) => s.episodes);
export const showById = (id: string) => shows.find((s) => s.id === id);
export const channelById = (id: string) => channels.find((c) => c.id === id);
export const episodeById = (id: string) => allEpisodes.find((e) => e.id === id);

// ---- Schedule (today, 0–24h) ----
function genScheduleForChannel(ch: Channel): ScheduleSlot[] {
  const eps = allEpisodes.filter((e) => e.channelId === ch.id);
  if (!eps.length) return [];
  const slots: ScheduleSlot[] = [];
  // tile episodes back-to-back from a channel-specific start hour
  const startHour = (parseInt(ch.id.replace(/\D/g, "") || "0", 10) % 6) + 6; // 6–11
  let cursor = new Date(baseDate.getTime() + startHour * 60 * 60_000);
  let i = 0;
  while (cursor.getTime() < baseDate.getTime() + 24 * 60 * 60_000) {
    const ep = eps[i % eps.length];
    const start = new Date(cursor);
    const end = new Date(cursor.getTime() + ep.duration * 60_000);
    slots.push({ channelId: ch.id, startsAt: start.toISOString(), endsAt: end.toISOString(), episodeId: ep.id, status: "upcoming" });
    cursor = end;
    i++;
  }
  return slots;
}
export const scheduleSlots: ScheduleSlot[] = channels.flatMap(genScheduleForChannel);

// ---- Curated rails ----
export const rails = {
  continueWatching: [
    { episodeId: "e-mind-1", progress: 0.62 },
    { episodeId: "e-late-1", progress: 0.18 },
    { episodeId: "e-trey-1", progress: 0.91 },
    { episodeId: "e-cad-1",  progress: 0.34 },
  ],
  trending: ["s-trey", "s-mindset", "s-latenight", "s-creators", "s-night"],
  newEpisodes: ["e-trey-3", "e-mind-3", "e-late-3", "e-pun-2", "e-cad-2"],
  treyiPicks: ["s-picks", "s-mindset", "s-latenight", "s-trey"],
  music: ["s-latenight"],
  comedy: ["s-punch"],
  drama: ["s-trey", "s-creators"],
  docs: ["s-night"],
  recentlyAdded: ["s-trey", "s-night", "s-punch", "s-picks"],
  free: ["e-mind-1", "e-mind-2", "e-late-1", "e-late-2", "e-trey-1", "e-trey-2"],
} as const;

export const featuredHero = {
  showId: "s-trey",
  tagline: "The flagship Trey TV original — three episodes streaming now.",
};

export const categories: Category[] = [
  "Music", "Comedy", "Reality", "Talk", "Drama", "Documentary", "Lifestyle",
];
