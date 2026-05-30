import { r as reactExports } from "../_libs/react.mjs";
import { b as useAuth$1, c as createBrowserClient } from "./router-BtgGywEC.mjs";
function publishStatusToSubmissionStatus(s) {
  if (s === "draft") return "draft";
  if (s === "scheduled") return "scheduled";
  if (s === "published") return "published";
  if (s === "archived") return "approved";
  return "pending";
}
function episodeToSubmission(ep, shows) {
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
    updated_at: ep.updated_at
  };
}
const EMPTY = {
  channel: null,
  shows: [],
  episodes: [],
  submissions: [],
  isApprovedCreator: false,
  loading: false
};
function useCreatorStudio() {
  const { isAdmin } = useAuth$1();
  const [data, setData] = reactExports.useState({ ...EMPTY, loading: true });
  reactExports.useEffect(() => {
    let mounted = true;
    async function load() {
      if (isAdmin) {
        setData({ ...EMPTY, isApprovedCreator: true, loading: false });
        return;
      }
      const supabase = createBrowserClient();
      let email = null;
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        email = authUser?.email?.toLowerCase() ?? null;
      } catch {
      }
      if (!email) {
        if (mounted) setData({ ...EMPTY });
        return;
      }
      let channel = null;
      try {
        const { data: ch } = await supabase.from("channels").select("id, owner_email, status, slug, name, title, banner_url, avatar_url, created_at, updated_at").eq("owner_email", email).in("status", ["draft", "active"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
        channel = ch ?? null;
      } catch {
        if (mounted) setData({ ...EMPTY });
        return;
      }
      if (!channel) {
        if (mounted) setData({ ...EMPTY, loading: false });
        return;
      }
      let shows = [];
      let episodes = [];
      try {
        const [showsRes, episodesRes] = await Promise.all([
          supabase.from("shows").select("id, channel_id, title, status, created_at").eq("channel_id", channel.id).order("created_at", { ascending: false }),
          supabase.from("episodes").select("id, channel_id, show_id, title, season_number, episode_number, thumbnail_url, publish_status, scheduled_at, published_at, audio_status, created_at, updated_at").eq("channel_id", channel.id).order("created_at", { ascending: false }).limit(50)
        ]);
        shows = showsRes.data ?? [];
        episodes = episodesRes.data ?? [];
      } catch {
      }
      const submissions = episodes.map((ep) => episodeToSubmission(ep, shows));
      if (mounted) {
        setData({
          channel,
          shows,
          episodes,
          submissions,
          isApprovedCreator: true,
          loading: false
        });
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isAdmin]);
  return data;
}
export {
  useCreatorStudio as u
};
