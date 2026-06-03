// Mock data layer for Trey TV streaming-box shell
// Replace these with real API calls to:
//   /api/tv/profile, /api/tv/content/home, /api/tv/games,
//   /api/tv/watch-progress, /api/tv/device/start, /api/tv/device/status
import { TV_ARTWORK, isUnsafeHeroArtwork } from "./artwork";

// Official Trey TV logo (silver + gold), bundled locally so it always renders
// in the offline/file:// TV app. (The previous CloudFront URL pointed at a
// profile-page screenshot, not the logo.)
export const TREY_TV_LOGO = "/trey-tv-logo.png";

// Cinematic creator imagery (mock content thumbnails)
const IMGS = [
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633005531_44794775.png",
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633006285_7bc84eb2.png",
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633007094_15ae4417.png",
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633009257_cbaff075.png",
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633011666_0f1b1757.png",
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633013562_de3cc1a7.png",
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633015073_e0863541.png",
  "https://d64gsuwffb70l.cloudfront.net/6a0c4710cb09dea5eb381c61_1779633016331_aa400794.png",
];
const SAFE_TILE_PLACEHOLDER = "/placeholder.svg";

export const IMG = (i: number) => {
  const url = IMGS[i % IMGS.length];
  return isUnsafeHeroArtwork(url) ? SAFE_TILE_PLACEHOLDER : url;
};

export type VideoTile = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  badge?: string;
  progress?: number;
  meta?: string;
  description?: string;
  backdropUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
};

export const heroFeature: VideoTile = {
  id: "kingmaker-change",
  title: "Kingmaker: The Change",
  meta: "Trey TV Original",
  badge: "FEATURED",
  image: TV_ARTWORK.kingmakerHero,
  backdropUrl: TV_ARTWORK.kingmakerHero,
  description: "A cinematic story of power, pressure, and legacy. Every move changes the crown.",
};

export const featured: VideoTile[] = [
  {
    id: "f1",
    title: "Life of a Creator",
    meta: "Documentary Series",
    badge: "NEW",
    image: TV_ARTWORK.lifeOfCreatorCard,
  },
  { id: "f2", title: "Trizzy Takeover", meta: "Epic Series", badge: "EPIC", image: IMG(1) },
  {
    id: "f3",
    title: "After Hours",
    meta: "Late Night",
    badge: "NEW EPISODES",
    image: TV_ARTWORK.afterHoursCard,
  },
  { id: "f4", title: "On The Road", meta: "Docuseries", image: IMG(3) },
  { id: "f5", title: "The World", meta: "Reality", badge: "NEW", image: IMG(4) },
  { id: "f6", title: "Unfiltered", meta: "Exclusive", badge: "EXCLUSIVE", image: IMG(5) },
];

export const continueWatching: VideoTile[] = [
  { id: "c1", title: "The Come Up", meta: "S1 E3 · 24m left", progress: 0.42, image: IMG(0) },
  {
    id: "c2",
    title: "Late Night Gaming",
    meta: "S2 E5 · 18m left",
    progress: 0.61,
    image: TV_ARTWORK.lateNightGamingGuide,
  },
  { id: "c3", title: "On The Road: ATL", meta: "S1 E4 · 32m left", progress: 0.35, image: IMG(3) },
  { id: "c4", title: "Studio Sessions", meta: "S3 E2 · 15m left", progress: 0.74, image: IMG(1) },
];

export const newEpisodes: VideoTile[] = [
  { id: "n1", title: "S3 E1", meta: "The Come Up", badge: "NEW", image: IMG(0) },
  { id: "n2", title: "S2 E7", meta: "Trizzy Takeover", badge: "NEW", image: IMG(1) },
  { id: "n3", title: "S1 E6", meta: "After Hours", badge: "NEW", image: IMG(2) },
  { id: "n4", title: "S4 E2", meta: "On The Road", badge: "NEW", image: IMG(3) },
];

export type Creator = { id: string; name: string; image: string; verified?: boolean };
export const creators: Creator[] = [
  { id: "cr1", name: "Trey Trizzy", image: IMG(0), verified: true },
  { id: "cr2", name: "Kai Cenat", image: IMG(1) },
  { id: "cr3", name: "Fanum", image: IMG(2) },
  { id: "cr4", name: "Duke Dennis", image: IMG(3) },
  { id: "cr5", name: "Agent 00", image: IMG(4) },
  { id: "cr6", name: "KiGotGame", image: IMG(5) },
];

export const musicVideos: VideoTile[] = [
  { id: "m1", title: "New Bag", meta: "Trey Trizzy", image: IMG(0) },
  { id: "m2", title: "No Love", meta: "Trey Trizzy", image: IMG(1) },
  { id: "m3", title: "Out The Way", meta: "Trey Trizzy", image: IMG(2) },
  { id: "m4", title: "Real Ones", meta: "Trey Trizzy", image: IMG(3) },
];

export type Game = {
  id: string;
  title: string;
  meta: string;
  players?: string;
  image: string;
  progress?: number;
  status?: "Ready" | "Coming Soon" | "In Development";
};
export const trendingGames: Game[] = [
  {
    id: "spades",
    title: "Spades",
    meta: "Card Game",
    players: "2-4",
    image: TV_ARTWORK.spadesGameCard,
    status: "Ready",
  },
  {
    id: "blackjack",
    title: "Blackjack",
    meta: "Casino",
    players: "1-4",
    image: IMG(6),
    status: "Coming Soon",
  },
  {
    id: "bullshit",
    title: "Bullshit",
    meta: "Party Game",
    players: "3-6",
    image: IMG(7),
    status: "Coming Soon",
  },
  {
    id: "truno",
    title: "TRUNO",
    meta: "Card Game",
    players: "2-6",
    image: IMG(4),
    status: "In Development",
  },
  {
    id: "interactive-stories",
    title: "Interactive Stories",
    meta: "Story Mode",
    players: "1",
    image: IMG(2),
    status: "Ready",
  },
];

export const interactiveStories: VideoTile[] = [
  {
    id: "s1",
    title: "Story Journey",
    meta: "Your Choices, Your Legacy",
    badge: "NEW",
    image: IMG(2),
  },
  { id: "s2", title: "Trizzy's Rise", meta: "The Come Up", badge: "NEW", image: IMG(3) },
  { id: "s3", title: "Code of Loyalty", meta: "Trust Is Everything", image: IMG(4) },
  { id: "s4", title: "Love & Betrayal", meta: "A Twisted Romance", image: IMG(5) },
  { id: "s5", title: "Street Dreams", meta: "Build Your Empire", badge: "NEW", image: IMG(6) },
];

export const guideCategories = [
  "All Channels",
  "Creators",
  "Gaming",
  "Music",
  "Interviews",
  "Originals",
  "Late Night",
  "Docuseries",
];

export type GuideChannel = {
  id: string;
  num: string;
  name: string;
  programs: {
    title: string;
    time: string;
    live?: boolean;
    imageUrl?: string;
    description?: string;
    genres?: string[];
  }[];
};
export const guideChannels: GuideChannel[] = [
  {
    id: "ch101",
    num: "101",
    name: "TRIZZY LIVE",
    programs: [
      { title: "TRIZZY LIVE", time: "8:00 - 9:00 PM", live: true },
      { title: "After Hours w/ Trizzy", time: "9:00 - 10:00 PM" },
      { title: "Trizzy Unfiltered", time: "10:00 - 11:00 PM" },
    ],
  },
  {
    id: "ch102",
    num: "102",
    name: "GLITCH GAMING",
    programs: [
      { title: "Ranked Grind", time: "8:00 - 9:00 PM", live: true },
      {
        title: "Late Night Gaming",
        time: "9:00 - 10:00 PM",
        live: true,
        imageUrl: TV_ARTWORK.lateNightGamingGuide,
      },
      { title: "Indie Heat", time: "10:00 - 11:00 PM" },
    ],
  },
  {
    id: "ch103",
    num: "103",
    name: "ON THE ROAD",
    programs: [
      { title: "On The Road: ATL", time: "8:00 - 9:00 PM", live: true },
      { title: "On The Road: Miami", time: "9:00 - 10:00 PM", live: true },
      { title: "On The Road: LA", time: "10:00 - 11:00 PM" },
    ],
  },
  {
    id: "ch104",
    num: "104",
    name: "THE CONNECT",
    programs: [
      { title: "The Connect", time: "8:00 - 9:00 PM", live: true },
      { title: "Icon Talk", time: "9:00 - 10:00 PM" },
      { title: "Real Ones Only", time: "10:00 - 11:00 PM" },
    ],
  },
  {
    id: "ch105",
    num: "105",
    name: "TRIZZY MUSIC",
    programs: [
      { title: "Hit List", time: "8:00 - 9:00 PM", live: true },
      { title: "New Heat", time: "9:00 - 10:00 PM", live: true },
      { title: "Studio Sessions", time: "10:00 - 11:00 PM" },
    ],
  },
  {
    id: "ch106",
    num: "106",
    name: "AFTER DARK",
    programs: [
      { title: "After Dark Freestyle", time: "8:00 - 9:00 PM", live: true },
      { title: "Late Night Vibes", time: "9:00 - 10:00 PM", live: true },
      { title: "Night Cap", time: "10:00 - 11:00 PM" },
    ],
  },
  {
    id: "ch107",
    num: "107",
    name: "DOCU ZONE",
    programs: [
      { title: "Built Different", time: "8:00 - 9:00 PM" },
      { title: "The Come Up", time: "9:00 - 10:00 PM" },
      { title: "From The Mud", time: "10:00 - 11:00 PM" },
    ],
  },
];
export const guideTimes = [
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
  "10:30 PM",
  "11:00 PM",
];

export const episodes: VideoTile[] = [
  { id: "e1", title: "The Come Up", meta: "24m left", progress: 0.6, image: IMG(0) },
  { id: "e2", title: "Mindset Over Everything", meta: "51m", image: IMG(1) },
  { id: "e3", title: "Building Trizzy", meta: "48m", image: IMG(2) },
  { id: "e4", title: "Content is King", meta: "44m", image: IMG(3) },
  { id: "e5", title: "From the Studio", meta: "45m", image: IMG(4) },
  { id: "e6", title: "The Road to More", meta: "50m", image: IMG(5) },
];

export const profile = {
  name: "Trey Trizzy",
  avatar: IMG(0),
  premium: true,
  level: 28,
  rank: "TRIZZY LEGEND",
  xp: 14250,
  xpMax: 20000,
  tagline: "Exclusive content. Raw gameplay. Real life. Welcome to the world of Trey Trizzy.",
};

export const badges = [
  { id: "b1", name: "TRIZZY LEGEND", meta: "Level 28", tone: "magenta" },
  { id: "b2", name: "BINGE KING", meta: "Watched 25 shows", tone: "gold" },
  { id: "b3", name: "EARLY ACCESS", meta: "OG Member", tone: "gold" },
  { id: "b4", name: "TOP 10%", meta: "Most Active", tone: "silver" },
];

export const stats = [
  { label: "Hours Watched", value: "86" },
  { label: "Shows Watched", value: "24" },
  { label: "Games Played", value: "12" },
  { label: "Live Streams", value: "7" },
];

export const quickActions = [
  "Upload Video",
  "Go Live",
  "Manage Content",
  "Analytics",
  "Messages",
  "Monetization",
  "Settings",
];

export const decisions = [
  {
    id: 1,
    title: "SEAL THE DEAL",
    desc: "Lock it in now and secure the bag.",
    risk: "MEDIUM",
    tone: "magenta",
  },
  {
    id: 2,
    title: "CONSULT THE CREW",
    desc: "Get your team's input before making a move.",
    risk: "LOW",
    tone: "green",
  },
  {
    id: 3,
    title: "PLAY BOTH SIDES",
    desc: "Keep your options open and gather more intel.",
    risk: "HIGH",
    tone: "red",
  },
  {
    id: 4,
    title: "WALK AWAY",
    desc: "This isn't worth the risk. Live to fight another day.",
    risk: "EXTREME",
    tone: "purple",
  },
];
