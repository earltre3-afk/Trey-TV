import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Tier = "regular" | "skip" | "super" | "turbo";
export type Status = "queued" | "now_playing" | "reviewed" | "skipped";

export type Submission = {
  id: string;
  userUid: string;
  userName: string;
  userEmail: string;
  title: string;
  artist: string;
  genre: string;
  notes: string;
  source: "file" | "drive";
  fileName?: string;
  driveLink?: string;
  tier: Tier;
  paymentStatus: "none" | "pending" | "verified";
  status: Status;
  topOfDay?: boolean;
  aiFirstImpression?: AIInsight;
  review?: { body: string; score: number; sentAt: number };
  createdAt: number;
};

export type AIInsight = {
  vibe: string;
  strengths: string[];
  hook: string;
  hypeScore: number;
  predictedMood: string;
};

export const TIER_META: Record<
  Tier,
  { label: string; price: number; weight: number; color: string; ring: string }
> = {
  regular: {
    label: "Regular Queue",
    price: 0,
    weight: 0,
    color: "text-foreground",
    ring: "border-white/15",
  },
  skip: {
    label: "Skip the Line",
    price: 5,
    weight: 1,
    color: "text-[oklch(0.82_0.15_215)]",
    ring: "ring-neon-cyan",
  },
  super: {
    label: "Super Skip",
    price: 10,
    weight: 2,
    color: "text-[oklch(0.7_0.25_340)]",
    ring: "ring-neon-magenta",
  },
  turbo: {
    label: "Turbo Skip",
    price: 15,
    weight: 3,
    color: "text-[oklch(0.82_0.16_85)]",
    ring: "ring-neon-gold",
  },
};

type Ctx = {
  submissions: Submission[];
  add: (s: Omit<Submission, "id" | "createdAt" | "status">) => Submission;
  update: (id: string, patch: Partial<Submission>) => void;
  remove: (id: string) => void;
  reorder: (ids: string[]) => void;
  byId: (id: string) => Submission | undefined;
  positionOf: (id: string) => number;
  publicQueue: () => Submission[];
  topThree: () => Submission[];
};

const KEY = "treytv_music_review_v1";
const C = createContext<Ctx | null>(null);

function load(): Submission[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Submission[];
  } catch {}
  return seed();
}

function seed(): Submission[] {
  const now = Date.now();
  return [
    {
      id: "demo-1",
      userUid: "demo",
      userName: "KaiWave",
      userEmail: "kai@trey.tv",
      title: "Midnight Bloom",
      artist: "KaiWave",
      genre: "R&B",
      notes: "Late-night cruise vibe",
      source: "drive",
      driveLink: "https://drive.google.com/file/d/x",
      tier: "turbo",
      paymentStatus: "verified",
      status: "now_playing",
      createdAt: now - 60000,
      aiFirstImpression: {
        vibe: "Velvety after-hours R&B",
        strengths: ["Atmosphere", "Vocal texture"],
        hook: "Listen for the chorus drop at 1:12.",
        hypeScore: 8,
        predictedMood: "Reflective",
      },
    },
    {
      id: "demo-2",
      userUid: "demo",
      userName: "808 Saint",
      userEmail: "saint@trey.tv",
      title: "Pressure Cooker",
      artist: "808 Saint",
      genre: "Hip-Hop",
      notes: "Heavy 808s",
      source: "file",
      fileName: "pressure.mp3",
      tier: "super",
      paymentStatus: "verified",
      status: "queued",
      createdAt: now - 30000,
    },
    {
      id: "demo-3",
      userUid: "demo",
      userName: "Lyric",
      userEmail: "lyric@trey.tv",
      title: "Glass House",
      artist: "Lyric",
      genre: "Pop",
      notes: "Anthemic",
      source: "file",
      fileName: "glass.wav",
      tier: "skip",
      paymentStatus: "verified",
      status: "queued",
      createdAt: now - 20000,
    },
    {
      id: "demo-4",
      userUid: "demo",
      userName: "Verse",
      userEmail: "verse@trey.tv",
      title: "First Light",
      artist: "Verse",
      genre: "Indie",
      notes: "",
      source: "file",
      fileName: "first.mp3",
      tier: "regular",
      paymentStatus: "none",
      status: "queued",
      createdAt: now - 10000,
    },
  ];
}

function rank(a: Submission, b: Submission) {
  // Now playing first
  if (a.status === "now_playing" && b.status !== "now_playing") return -1;
  if (b.status === "now_playing" && a.status !== "now_playing") return 1;
  // Higher tier weight first
  const wa = TIER_META[a.tier].weight;
  const wb = TIER_META[b.tier].weight;
  if (wa !== wb) return wb - wa;
  // FIFO
  return a.createdAt - b.createdAt;
}

export function MusicReviewProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubmissions] = useState<Submission[]>(() =>
    typeof window !== "undefined" ? load() : [],
  );

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(submissions));
    } catch {}
  }, [submissions]);

  const value = useMemo<Ctx>(
    () => ({
      submissions,
      add: (s) => {
        const sub: Submission = {
          ...s,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          status: "queued",
        };
        setSubmissions((prev) => [...prev, sub]);
        return sub;
      },
      update: (id, patch) =>
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      remove: (id) => setSubmissions((prev) => prev.filter((s) => s.id !== id)),
      reorder: (ids) =>
        setSubmissions((prev) => {
          const map = new Map(prev.map((s) => [s.id, s] as const));
          const ordered = ids.map((i) => map.get(i)).filter(Boolean) as Submission[];
          const rest = prev.filter((s) => !ids.includes(s.id));
          return [...ordered, ...rest];
        }),
      byId: (id) => submissions.find((s) => s.id === id),
      positionOf: (id) => {
        const live = [...submissions]
          .filter((s) => s.status === "queued" || s.status === "now_playing")
          .sort(rank);
        return live.findIndex((s) => s.id === id) + 1;
      },
      publicQueue: () =>
        [...submissions]
          .filter((s) => s.status === "queued" || s.status === "now_playing")
          .sort(rank),
      topThree: () => submissions.filter((s) => s.topOfDay).slice(0, 3),
    }),
    [submissions],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useMusicReview() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useMusicReview must be used inside <MusicReviewProvider>");
  return ctx;
}

/** ---------- AI vibe-check (mock, deterministic-ish, instant) ---------- */
const VIBES = [
  "Velvety after-hours R&B",
  "Cinematic neon-soul",
  "Anthemic stadium-pop",
  "Late-night freeway hip-hop",
  "Dreamy alt-bedroom-pop",
  "High-octane trap energy",
  "Warm sunset indie",
  "Glittery hyperpop euphoria",
  "Smoky lounge jazz-rap",
  "Crisp Afro-fusion bounce",
];
const STRENGTHS = [
  "Atmosphere",
  "Hook potential",
  "Vocal texture",
  "Rhythmic pocket",
  "Production polish",
  "Lyric imagery",
  "Dynamic range",
  "Genre crossover appeal",
];
const MOODS = ["Reflective", "Hyped", "Romantic", "Defiant", "Euphoric", "Pensive", "Confident"];

function hashStr(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function generateAIInsight(input: {
  title: string;
  artist: string;
  genre: string;
  notes: string;
}): AIInsight {
  const seed = hashStr(`${input.title}|${input.artist}|${input.genre}|${input.notes}`);
  const pick = <T,>(arr: T[], salt: number) => arr[(seed + salt) % arr.length];
  const vibe = pick(VIBES, 0);
  const strengths = [pick(STRENGTHS, 1), pick(STRENGTHS, 7), pick(STRENGTHS, 13)].filter(
    (s, i, a) => a.indexOf(s) === i,
  );
  const mood = pick(MOODS, 3);
  const hypeScore = 6 + (seed % 5); // 6..10
  const second = 20 + (seed % 90);
  const hook = `Listen for the moment around 0:${second.toString().padStart(2, "0")} — the ${pick(["bridge", "drop", "switch-up", "second verse", "outro"], 9)} hits clean.`;
  return { vibe, strengths, hook, hypeScore, predictedMood: mood };
}

export function generateAIReviewDraft(s: Submission): string {
  const v = s.aiFirstImpression?.vibe ?? "fresh and confident";
  return `"${s.title}" by ${s.artist} lands as ${v}. The ${s.genre.toLowerCase()} foundation gives it a clear identity, and the production carries weight without crowding the vocal. Strongest moments live in the hook — there's real replay value once the chorus opens up. To take it to the next level, tighten the transition into the second verse and let the low end breathe a touch more in the mix. Overall: a confident submission with commercial DNA.

Score: ${s.aiFirstImpression?.hypeScore ?? 8}/10.

— Reviewed live on Trey TV`;
}
