import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { posts, currentUser } from "@/lib/mock-data";

// TODO: replace with Supabase / server backend.

export type SubmissionStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "needs_changes"
  | "scheduled"
  | "published";

export type Submission = {
  content_id: string;
  creator_id: string;
  creator_name: string;
  creator_handle: string;
  creator_avatar: string;
  title: string;
  short_description: string;
  full_description: string;
  viewer_context: string;
  what_to_know: string;
  why_it_matters: string;
  creator_note: string;
  show_id: string;
  show_title: string;
  season_number: number;
  episode_number: number;
  episode_type: string;
  category: string[];
  tags: string[];
  mood_tags: string[];
  thumbnail_url: string;
  poster_url: string;
  video_url: string;
  duration: string;
  quality: string;
  visibility: "public" | "subscribers" | "private" | "scheduled";
  access_type: "free" | "subscribers" | "premium" | "gift";
  content_rating: string;
  language: string;
  explicit_content: boolean;
  is_trailer: boolean;
  is_bonus: boolean;
  is_finale: boolean;
  is_premiere: boolean;
  status: SubmissionStatus;
  admin_feedback: string;
  admin_internal_note: string;
  policy_ack: boolean;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  published_at?: string;
  scheduled_at?: string;
  created_at: string;
  updated_at: string;
};

const KEY = "treytv_submissions_v1";

const now = () => new Date().toISOString();

const emptyDraft = (id: string, creator = currentUser): Submission => ({
  content_id: id,
  creator_id: creator.uid,
  creator_name: creator.name,
  creator_handle: creator.handle,
  creator_avatar: creator.avatar,
  title: "",
  short_description: "",
  full_description: "",
  viewer_context: "",
  what_to_know: "",
  why_it_matters: "",
  creator_note: "",
  show_id: "",
  show_title: "",
  season_number: 1,
  episode_number: 1,
  episode_type: "Full Episode",
  category: [],
  tags: [],
  mood_tags: [],
  thumbnail_url: "",
  poster_url: "",
  video_url: "",
  duration: "0:00",
  quality: "AI UHD",
  visibility: "public",
  access_type: "free",
  content_rating: "PG",
  language: "English",
  explicit_content: false,
  is_trailer: false,
  is_bonus: false,
  is_finale: false,
  is_premiere: false,
  status: "draft",
  admin_feedback: "",
  admin_internal_note: "",
  policy_ack: false,
  created_at: now(),
  updated_at: now(),
});

const seed: Submission[] = [
  {
    ...emptyDraft("seed-1"),
    title: "The Come Up",
    short_description: "Where it all begins — the first studio session of the season.",
    full_description:
      "Trey opens up Season 1 with a raw studio session and the story behind the music.",
    viewer_context: "Filmed in one take. No retouching.",
    show_id: "late-night",
    show_title: "Late Night with Trey",
    season_number: 1,
    episode_number: 3,
    episode_type: "Full Episode",
    category: ["Music", "Documentary"],
    tags: ["studio", "raw", "season1"],
    mood_tags: ["Inspired", "Raw"],
    thumbnail_url: posts[0].media,
    video_url: posts[0].media,
    duration: "12:42",
    quality: "4K",
    status: "pending",
    policy_ack: true,
    submitted_at: now(),
  },
  {
    ...emptyDraft("seed-2"),
    title: "City After Dark — Trailer",
    short_description: "A first look at the new docuseries.",
    full_description: "A 90-second teaser for the City After Dark docuseries.",
    show_id: "city",
    show_title: "City After Dark",
    season_number: 3,
    episode_number: 1,
    episode_type: "Trailer",
    category: ["Documentary", "Lifestyle"],
    tags: ["trailer", "neon"],
    mood_tags: ["Reflective", "Cinematic"],
    thumbnail_url: posts[2].media,
    video_url: posts[2].media,
    duration: "1:30",
    quality: "AI UHD",
    status: "needs_changes",
    policy_ack: true,
    admin_feedback: "Audio is hot in the second half — please re-master and resubmit.",
    submitted_at: now(),
    reviewed_at: now(),
  },
  {
    ...emptyDraft("seed-3"),
    title: "Studio Sessions — Episode 8",
    short_description: "Behind the boards with Zay Beats.",
    full_description: "Zay walks through the production of his latest record.",
    show_id: "studio",
    show_title: "Studio Sessions",
    season_number: 1,
    episode_number: 8,
    episode_type: "Full Episode",
    category: ["Music", "Behind the Scenes"],
    tags: ["zay", "production"],
    mood_tags: ["Hype", "Educational"],
    thumbnail_url: posts[1].media,
    video_url: posts[1].media,
    duration: "24:18",
    quality: "4K",
    status: "published",
    policy_ack: true,
    submitted_at: now(),
    reviewed_at: now(),
    approved_at: now(),
    published_at: now(),
  },
];

type Ctx = {
  submissions: Submission[];
  get: (id: string) => Submission | undefined;
  createDraft: (patch?: Partial<Submission>) => string;
  updateDraft: (id: string, patch: Partial<Submission>) => void;
  submit: (id: string) => void;
  approve: (id: string, opts?: { publish?: boolean; scheduleAt?: string; note?: string }) => void;
  requestChanges: (id: string, feedback: string) => void;
  reject: (id: string, reason: string) => void;
  remove: (id: string) => void;
  byCreator: (uid: string) => Submission[];
};

const SubsCtx = createContext<Ctx | null>(null);

export function SubmissionsProvider({ children }: { children: ReactNode }) {
  const [submissions, setSubs] = useState<Submission[]>(seed);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setSubs(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(submissions));
    } catch {}
  }, [submissions]);

  const value = useMemo<Ctx>(
    () => ({
      submissions,
      get: (id) => submissions.find((s) => s.content_id === id),
      createDraft: (patch = {}) => {
        const id = (typeof crypto !== "undefined" && crypto.randomUUID?.()) || `sub-${Date.now()}`;
        const draft = { ...emptyDraft(id), ...patch, content_id: id, updated_at: now() };
        setSubs((s) => [draft, ...s]);
        return id;
      },
      updateDraft: (id, patch) =>
        setSubs((s) =>
          s.map((x) => (x.content_id === id ? { ...x, ...patch, updated_at: now() } : x)),
        ),
      submit: (id) =>
        setSubs((s) =>
          s.map((x) =>
            x.content_id === id
              ? { ...x, status: "pending", submitted_at: now(), updated_at: now() }
              : x,
          ),
        ),
      approve: (id, opts) =>
        setSubs((s) =>
          s.map((x) => {
            if (x.content_id !== id) return x;
            const ts = now();
            if (opts?.scheduleAt)
              return {
                ...x,
                status: "scheduled",
                scheduled_at: opts.scheduleAt,
                reviewed_at: ts,
                approved_at: ts,
                admin_internal_note: opts.note ?? x.admin_internal_note,
                updated_at: ts,
              };
            if (opts?.publish)
              return {
                ...x,
                status: "published",
                reviewed_at: ts,
                approved_at: ts,
                published_at: ts,
                admin_internal_note: opts.note ?? x.admin_internal_note,
                updated_at: ts,
              };
            return {
              ...x,
              status: "approved",
              reviewed_at: ts,
              approved_at: ts,
              admin_internal_note: opts?.note ?? x.admin_internal_note,
              updated_at: ts,
            };
          }),
        ),
      requestChanges: (id, feedback) =>
        setSubs((s) =>
          s.map((x) =>
            x.content_id === id
              ? {
                  ...x,
                  status: "needs_changes",
                  admin_feedback: feedback,
                  reviewed_at: now(),
                  updated_at: now(),
                }
              : x,
          ),
        ),
      reject: (id, reason) =>
        setSubs((s) =>
          s.map((x) =>
            x.content_id === id
              ? {
                  ...x,
                  status: "rejected",
                  admin_feedback: reason,
                  reviewed_at: now(),
                  updated_at: now(),
                }
              : x,
          ),
        ),
      remove: (id) => setSubs((s) => s.filter((x) => x.content_id !== id)),
      byCreator: (uid) => submissions.filter((x) => x.creator_id === uid),
    }),
    [submissions],
  );

  return <SubsCtx.Provider value={value}>{children}</SubsCtx.Provider>;
}

export function useSubmissions() {
  const ctx = useContext(SubsCtx);
  if (!ctx) throw new Error("useSubmissions must be used inside <SubmissionsProvider>");
  return ctx;
}

export const STATUS_LABEL: Record<SubmissionStatus, string> = {
  draft: "Draft",
  pending: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  needs_changes: "Needs Changes",
  scheduled: "Scheduled",
  published: "Published",
};

export const STATUS_TONE: Record<SubmissionStatus, string> = {
  draft: "bg-white/10 text-muted-foreground border-white/15",
  pending: "bg-[oklch(0.82_0.16_85_/_0.18)] text-primary border-primary/40",
  approved:
    "bg-[oklch(0.78_0.18_150_/_0.18)] text-[oklch(0.82_0.18_150)] border-[oklch(0.78_0.18_150_/_0.4)]",
  rejected:
    "bg-[oklch(0.65_0.24_15_/_0.18)] text-[oklch(0.78_0.24_15)] border-[oklch(0.65_0.24_15_/_0.4)]",
  needs_changes:
    "bg-[oklch(0.7_0.25_340_/_0.18)] text-[oklch(0.78_0.25_340)] border-[oklch(0.7_0.25_340_/_0.4)]",
  scheduled:
    "bg-[oklch(0.65_0.22_300_/_0.18)] text-[oklch(0.78_0.22_300)] border-[oklch(0.65_0.22_300_/_0.4)]",
  published:
    "bg-[oklch(0.82_0.15_215_/_0.18)] text-[oklch(0.82_0.15_215)] border-[oklch(0.82_0.15_215_/_0.4)]",
};

export const SHOWS = [
  { id: "late-night", title: "Late Night with Trey" },
  { id: "studio", title: "Studio Sessions" },
  { id: "city", title: "City After Dark" },
];

export const EPISODE_TYPES = [
  "Full Episode",
  "Clip",
  "Trailer",
  "Behind the Scenes",
  "Promo",
  "Music Video",
  "Interview",
  "Live Replay",
  "Bonus Content",
];

export const CATEGORIES = [
  "Music",
  "Comedy",
  "Motivation",
  "Fashion",
  "Gaming",
  "Lifestyle",
  "Documentary",
  "Behind the Scenes",
  "Live Performance",
  "Interview",
];

export const MOOD_TAGS = [
  "Motivated",
  "Chill",
  "Inspired",
  "Hype",
  "Reflective",
  "Funny",
  "Emotional",
  "Raw",
  "Educational",
  "Cinematic",
];
