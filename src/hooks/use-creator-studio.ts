import { useState, useEffect } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { type Submission, type SubmissionStatus } from "@/lib/submissions-store";
import { useAuth } from "@/lib/auth";

// ── Internal DB shapes (not exported) ──────────────────────────────────────

type ChannelRow = {
  id: string;
  owner_email: string;
  status: string;
  slug: string | null;
  name?: string | null;
  title?: string | null;
  banner_url?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
};

type ShowRow = {
  id: string;
  channel_id: string;
  title: string;
  status: string;
  created_at: string;
};

type EpisodeRow = {
  id: string;
  channel_id: string;
  show_id: string;
  title: string;
  season_number: number;
  episode_number: number;
  thumbnail_url: string | null;
  publish_status: string;
  scheduled_at: string | null;
  published_at: string | null;
  audio_status: string | null;
  created_at: string;
  updated_at: string;
};

// ── Public hook shape ───────────────────────────────────────────────────────

export type CreatorStudioData = {
  channel: ChannelRow | null;
  shows: ShowRow[];
  episodes: EpisodeRow[];
  submissions: Submission[];
  isApprovedCreator: boolean;
  loading: boolean;
};

// ── Pure helper: publish_status → SubmissionStatus ─────────────────────────

function publishStatusToSubmissionStatus(s: string): SubmissionStatus {
  if (s === "draft") return "draft";
  if (s === "scheduled") return "scheduled";
  if (s === "published") return "published";
  if (s === "archived") return "approved";
  return "pending";
}

// ── Pure helper: EpisodeRow → Submission ────────────────────────────────────

function episodeToSubmission(ep: EpisodeRow, shows: ShowRow[]): Submission {
  const show = shows.find((s) => s.id === ep.show_id);
  return {
    content_id: ep.id,
    creator_id: ep.channel_id,
    creator_name: "",
    creator_handle: "",
    creator_avatar: "",
    title: ep.title,
    short_description: "",
    full_description: "",
    viewer_context: "",
    what_to_know: "",
    why_it_matters: "",
    creator_note: "",
    show_id: ep.show_id,
    show_title: show?.title ?? "",
    season_number: ep.season_number,
    episode_number: ep.episode_number,
    episode_type: "Full Episode",
    category: [],
    tags: [],
    mood_tags: [],
    thumbnail_url: ep.thumbnail_url ?? "",
    poster_url: "",
    video_url: "",
    duration: "",
    quality: "",
    visibility: "public",
    access_type: "free",
    content_rating: "",
    language: "",
    explicit_content: false,
    is_trailer: false,
    is_bonus: false,
    is_finale: false,
    is_premiere: false,
    status: publishStatusToSubmissionStatus(ep.publish_status),
    admin_feedback: "",
    admin_internal_note: "",
    policy_ack: true,
    created_at: ep.created_at,
    updated_at: ep.updated_at,
  };
}

// ── Hook ────────────────────────────────────────────────────────────────────

const EMPTY: CreatorStudioData = {
  channel: null,
  shows: [],
  episodes: [],
  submissions: [],
  isApprovedCreator: false,
  loading: false,
};

export function useCreatorStudio(): CreatorStudioData {
  const { isAdmin } = useAuth();
  const [data, setData] = useState<CreatorStudioData>({ ...EMPTY, loading: true });

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (isAdmin) {
        setData({ ...EMPTY, isApprovedCreator: true, loading: false });
        return;
      }

      const supabase = createBrowserClient();

      // Get auth email without relying on profiles schema
      let email: string | null = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        email = authUser?.email?.toLowerCase() ?? null;
      } catch {
        // not signed in or env missing
      }

      if (!email) {
        if (mounted) setData({ ...EMPTY });
        return;
      }

      // Query channels gated by owner_email — RLS enforces this server-side too
      let channel: ChannelRow | null = null;
      try {
        const { data: ch } = await (supabase as any)
          .from("channels")
          .select("id, owner_email, status, slug, name, title, banner_url, avatar_url, created_at, updated_at")
          .eq("owner_email", email)
          .in("status", ["draft", "active"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        channel = ch ?? null;
      } catch {
        if (mounted) setData({ ...EMPTY });
        return;
      }

      if (!channel) {
        if (mounted) setData({ ...EMPTY, loading: false });
        return;
      }

      // Parallel fetch shows + episodes
      let shows: ShowRow[] = [];
      let episodes: EpisodeRow[] = [];

      try {
        const [showsRes, episodesRes] = await Promise.all([
          (supabase as any)
            .from("shows")
            .select("id, channel_id, title, status, created_at")
            .eq("channel_id", channel.id)
            .order("created_at", { ascending: false }),
          (supabase as any)
            .from("episodes")
            .select("id, channel_id, show_id, title, season_number, episode_number, thumbnail_url, publish_status, scheduled_at, published_at, audio_status, created_at, updated_at")
            .eq("channel_id", channel.id)
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

        shows = showsRes.data ?? [];
        episodes = episodesRes.data ?? [];
      } catch {
        // Non-fatal — continue with empty arrays
      }

      const submissions = episodes.map((ep: EpisodeRow) => episodeToSubmission(ep, shows));

      if (mounted) {
        setData({
          channel,
          shows,
          episodes,
          submissions,
          isApprovedCreator: true,
          loading: false,
        });
      }
    }

    load();
    return () => { mounted = false; };
  }, [isAdmin]);

  return data;
}
