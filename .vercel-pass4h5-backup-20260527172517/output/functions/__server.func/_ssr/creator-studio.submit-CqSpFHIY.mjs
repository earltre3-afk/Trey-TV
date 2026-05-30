import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, g as useSearch, L as Link } from "../_libs/tanstack__react-router.mjs";
import { b as useAuth$1, E as useSubmissions, v as posts, T as SHOWS, U as EPISODE_TYPES, V as CATEGORIES, W as MOOD_TAGS, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as useCreatorStudio } from "./use-creator-studio-BkHsMg4r.mjs";
import { u as useGoBack } from "./use-go-back-DIwqgoNo.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { i as Lock, t as Crown, A as ArrowLeft, b7 as Film, a4 as Play, d as Image, j as Eye, S as Sparkles, a5 as Users, aD as DollarSign, ax as CircleCheck, b$ as Circle, l as ShieldCheck, X, k as Check } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isNewRow(contentId) {
  return contentId.startsWith("seed-") || !uuidPattern.test(contentId);
}
function buildUtilityState(draft) {
  return {
    show_id: draft.show_id,
    show_title: draft.show_title,
    season_number: draft.season_number,
    episode_number: draft.episode_number,
    episode_type: draft.episode_type,
    category: draft.category,
    tags: draft.tags,
    mood_tags: draft.mood_tags,
    visibility: draft.visibility,
    access_type: draft.access_type,
    content_rating: draft.content_rating,
    language: draft.language,
    explicit_content: draft.explicit_content,
    is_trailer: draft.is_trailer,
    is_bonus: draft.is_bonus,
    is_finale: draft.is_finale,
    is_premiere: draft.is_premiere,
    policy_ack: draft.policy_ack,
    full_description: draft.full_description,
    viewer_context: draft.viewer_context,
    what_to_know: draft.what_to_know,
    why_it_matters: draft.why_it_matters,
    creator_note: draft.creator_note,
    scheduled_at: draft.scheduled_at ?? null
  };
}
function mapVisibility(v) {
  if (v === "private") return "private";
  if (v === "scheduled") return "scheduled";
  return "submitted";
}
function isPlusContent(episodeNumber, accessType) {
  if (episodeNumber <= 2) return false;
  return accessType === "subscribers";
}
function useCreatorSubmit() {
  const { channel, isApprovedCreator } = useCreatorStudio();
  const [saving, setSaving] = reactExports.useState(false);
  const getUserId = async () => {
    if (!isApprovedCreator || !channel) {
      toast.error("Creator access required");
      return null;
    }
    try {
      const supabase = createBrowserClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        return null;
      }
      return user.id;
    } catch {
      return null;
    }
  };
  const saveDraft = async (draft) => {
    if (saving) return null;
    setSaving(true);
    try {
      const userId = await getUserId();
      if (!userId) return null;
      const supabase = createBrowserClient();
      const payload = {
        creator_id: userId,
        title: draft.title || null,
        description: draft.short_description || null,
        status: "draft",
        thumbnail_url: draft.thumbnail_url || null,
        utility_state: buildUtilityState(draft)
      };
      if (isNewRow(draft.content_id)) {
        const { data: data2, error: error2 } = await supabase.from("creator_edit_projects").insert(payload).select("id").single();
        if (error2) {
          toast.error("Failed to save draft");
          return null;
        }
        return data2?.id ?? null;
      }
      const { data, error } = await supabase.from("creator_edit_projects").update({ ...payload, updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", draft.content_id).eq("creator_id", userId).select("id").maybeSingle();
      if (error) {
        toast.error("Failed to save draft");
        return null;
      }
      if (!data?.id) {
        const { data: inserted, error: insertError } = await supabase.from("creator_edit_projects").insert({ ...payload, id: draft.content_id }).select("id").single();
        if (insertError) {
          toast.error("Failed to save draft");
          return null;
        }
        return inserted?.id ?? null;
      }
      return draft.content_id;
    } finally {
      setSaving(false);
    }
  };
  const submitForReview = async (draft) => {
    const rowId = await saveDraft(draft);
    if (!rowId) return false;
    const userId = await getUserId();
    if (!userId) return false;
    try {
      const supabase = createBrowserClient();
      const { error } = await supabase.from("creator_edit_projects").update({ status: "submitted", updated_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", rowId).eq("creator_id", userId);
      if (error) {
        toast.error("Failed to submit");
        return false;
      }
      try {
        const { data: project } = await supabase.from("creator_edit_projects").select("stream_uid").eq("id", rowId).eq("creator_id", userId).maybeSingle();
        const streamUid = project?.stream_uid?.trim() || null;
        if (!streamUid) return true;
        const { data: existing } = await supabase.from("creator_post_queue").select("id").eq("creator_id", userId).eq("edit_project_id", rowId).maybeSingle();
        if (existing) return true;
        const episodeNumber = draft.episode_number > 0 ? draft.episode_number : null;
        const { error: queueError } = await supabase.from("creator_post_queue").insert({
          creator_id: userId,
          edit_project_id: rowId,
          channel_id: channel?.id ?? null,
          show_id: draft.show_id || null,
          episode_number: episodeNumber,
          title: draft.title.trim(),
          description: draft.short_description?.trim() || null,
          stream_uid: streamUid,
          thumbnail_url: draft.thumbnail_url || null,
          visibility: mapVisibility(draft.visibility),
          is_plus_content: isPlusContent(draft.episode_number, draft.access_type),
          scheduled_at: draft.visibility === "scheduled" && draft.scheduled_at ? new Date(draft.scheduled_at).toISOString() : null,
          approval_status: "pending"
        });
        if (queueError) {
          toast.error("Submission queued but review entry failed - contact support");
        }
      } catch {
      }
      return true;
    } catch {
      toast.error("Failed to submit");
      return false;
    }
  };
  return { saveDraft, submitForReview, saving };
}
function SubmitPage() {
  const {
    isGuest,
    isCreator,
    user
  } = useAuth$1();
  const navigate = useNavigate();
  const search = useSearch({
    from: "/creator-studio/submit"
  });
  const store = useSubmissions();
  reactExports.useEffect(() => {
    if (isGuest) navigate({
      to: "/login"
    });
  }, [isGuest, navigate]);
  const [id] = reactExports.useState(() => {
    if (search.id) return search.id;
    return store.createDraft({
      creator_id: user?.uid ?? "",
      creator_name: user?.name ?? "Creator",
      creator_handle: user?.handle ?? "creator",
      creator_avatar: user?.avatar ?? ""
    });
  });
  const draft = store.get(id);
  if (isGuest) return null;
  if (!isCreator) return /* @__PURE__ */ jsxRuntimeExports.jsx(LockedScreen, {});
  if (!draft) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Form, { draft });
}
function LockedScreen() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "min-h-dvh grid place-items-center px-6 bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.35),transparent_70%)] blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-7 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] tracking-[0.3em] text-primary mb-1 flex items-center justify-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5" }),
        " CREATOR ACCESS"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold text-gradient-gold", children: "Submissions are creator-only" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-col gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
          to: "/apply/content-creator"
        }), className: "px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold", children: "Apply to become a Creator" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
          to: "/creator-hub"
        }), className: "px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10", children: "Back to Creator Hub" })
      ] })
    ] })
  ] }) });
}
function Form({
  draft
}) {
  const navigate = useNavigate();
  const store = useSubmissions();
  const {
    saveDraft,
    submitForReview
  } = useCreatorSubmit();
  const goBack = useGoBack("/creator-studio/edit");
  const [d, setD] = reactExports.useState(draft);
  const [previewOpen, setPreviewOpen] = reactExports.useState(false);
  const [seriesMode, setSeriesMode] = reactExports.useState("existing");
  const [newShow, setNewShow] = reactExports.useState({
    title: "",
    description: "",
    category: "Music",
    visibility: "public"
  });
  const set = (k, v) => setD((s) => ({
    ...s,
    [k]: v
  }));
  const toggleArr = (k, v) => setD((s) => {
    const arr = s[k];
    return {
      ...s,
      [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
    };
  });
  const saveSilent = () => {
    store.updateDraft(d.content_id, d);
    void saveDraft(d);
  };
  const checklist = reactExports.useMemo(() => [{
    ok: !!d.video_url || !!d.thumbnail_url,
    label: "Video uploaded"
  }, {
    ok: !!d.title.trim(),
    label: "Episode title added"
  }, {
    ok: !!d.show_title.trim() || seriesMode === "new" && !!newShow.title.trim(),
    label: "Show / series selected"
  }, {
    ok: d.season_number > 0 && d.episode_number > 0,
    label: "Season & episode number added"
  }, {
    ok: !!d.short_description.trim(),
    label: "Description added"
  }, {
    ok: !!d.thumbnail_url,
    label: "Thumbnail selected"
  }, {
    ok: d.category.length > 0,
    label: "Category / tags added"
  }, {
    ok: !!d.visibility,
    label: "Visibility selected"
  }, {
    ok: d.policy_ack,
    label: "Content policy acknowledged"
  }], [d, seriesMode, newShow]);
  const canSubmit = checklist.every((c) => c.ok);
  const onSubmit = async () => {
    if (!canSubmit) {
      toast.error("Complete the checklist to submit.");
      return;
    }
    if (seriesMode === "new" && newShow.title) {
      d.show_title = newShow.title;
      d.show_id = newShow.title.toLowerCase().replace(/\s+/g, "-");
    }
    store.updateDraft(d.content_id, d);
    store.submit(d.content_id);
    await submitForReview(d);
    navigate({
      to: "/creator-studio/submitted",
      search: {
        id: d.content_id
      }
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-dvh bg-background text-foreground pb-32", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 px-3 md:px-5 pt-3 pb-3 backdrop-blur-xl bg-background/70 border-b border-white/5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: goBack, className: "size-10 grid place-items-center rounded-xl glass tilt-press", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] text-primary", children: "CONTENT DETAILS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-base md:text-lg font-bold text-gradient-gold truncate", children: "Prepare Your Episode" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          saveSilent();
          toast("Draft saved");
        }, className: "px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10 hidden sm:inline-flex", children: "Save Draft" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "Organize your content for Trey TV before it goes to admin review." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 md:px-5 pt-4 space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Content Preview", icon: Film, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-[1.4fr,1fr] gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-2xl overflow-hidden glass neon-border aspect-video", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.thumbnail_url || posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/15", children: d.quality }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 capitalize", children: d.status.replace("_", " ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/15 tabular-nums", children: d.duration }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPreviewOpen(true), className: "absolute inset-0 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-12 rounded-full bg-white text-black grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "size-5 fill-current" }) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => navigate({
            to: "/creator-studio/edit"
          }), className: "px-3 py-2 rounded-xl glass border border-white/10 text-left", children: "← Back to Edit Studio" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            set("thumbnail_url", posts[Math.floor(Math.random() * posts.length)].media);
            toast("Thumbnail updated");
          }, className: "px-3 py-2 rounded-xl glass border border-white/10 text-left flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "size-4 text-primary" }),
            " Replace thumbnail"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPreviewOpen(true), className: "px-3 py-2 rounded-xl glass border border-white/10 text-left flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4 text-primary" }),
            " Preview episode"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Episode Identity", icon: Sparkles, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Episode title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.title, onChange: (v) => set("title", v), placeholder: "The Come Up" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Show / Series", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: d.show_title, onChange: (v) => {
            set("show_title", v);
            const s = SHOWS.find((x) => x.title === v);
            if (s) set("show_id", s.id);
          }, options: ["", ...SHOWS.map((s) => s.title)] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Episode type", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: d.episode_type, onChange: (v) => set("episode_type", v), options: EPISODE_TYPES }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Season #", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(d.season_number), onChange: (v) => set("season_number", Number(v) || 1), type: "number" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Episode #", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: String(d.episode_number), onChange: (v) => set("episode_number", Number(v) || 1), type: "number" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          "Preview: ",
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-foreground font-semibold", children: [
            "Season ",
            d.season_number,
            ", Episode ",
            d.episode_number,
            ': "',
            d.title || "Untitled",
            '"'
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Viewer Context", icon: Eye, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Short description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: d.short_description, onChange: (v) => set("short_description", v), placeholder: "One-line hook for viewers" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Full episode description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: d.full_description, onChange: (v) => set("full_description", v), rows: 3 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid md:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "What viewers should know", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: d.what_to_know, onChange: (v) => set("what_to_know", v), rows: 2 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Why this episode matters", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: d.why_it_matters, onChange: (v) => set("why_it_matters", v), rows: 2 }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Creator note (optional)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: d.creator_note, onChange: (v) => set("creator_note", v), rows: 2 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Categories", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipGroup, { options: CATEGORIES, selected: d.category, onToggle: (v) => toggleArr("category", v) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Mood tags", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChipGroup, { options: MOOD_TAGS, selected: d.mood_tags, onToggle: (v) => toggleArr("mood_tags", v) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Content tags", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TagInput, { tags: d.tags, onChange: (t) => set("tags", t) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Series Organization", icon: Film, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSeriesMode("existing"), className: `px-3 py-2 rounded-xl text-xs font-semibold border ${seriesMode === "existing" ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`, children: "Use existing show" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSeriesMode("new"), className: `px-3 py-2 rounded-xl text-xs font-semibold border ${seriesMode === "new" ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`, children: "Create new show" })
        ] }),
        seriesMode === "new" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 mt-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Show title", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: newShow.title, onChange: (v) => setNewShow({
            ...newShow,
            title: v
          }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Show description", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TextArea, { value: newShow.description, onChange: (v) => setNewShow({
            ...newShow,
            description: v
          }), rows: 2 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Show category", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: newShow.category, onChange: (v) => setNewShow({
              ...newShow,
              category: v
            }), options: CATEGORIES }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Visibility after approval", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: newShow.visibility, onChange: (v) => setNewShow({
              ...newShow,
              visibility: v
            }), options: ["public", "subscribers", "private"] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Trailer", value: d.is_trailer, onChange: (v) => set("is_trailer", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Bonus", value: d.is_bonus, onChange: (v) => set("is_bonus", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Season finale", value: d.is_finale, onChange: (v) => set("is_finale", v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Premiere", value: d.is_premiere, onChange: (v) => set("is_premiere", v) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Thumbnail & Cover", icon: Image, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Episode thumbnail", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: posts.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => set("thumbnail_url", p.media), className: `relative aspect-video rounded-lg overflow-hidden ring-1 ${d.thumbnail_url === p.media ? "ring-primary glow-gold" : "ring-white/10"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.media, className: "absolute inset-0 size-full object-cover", alt: "" }) }, p.id)) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          set("thumbnail_url", posts[0].media);
          toast("Used current frame");
        }, className: "px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10", children: "Use current video frame" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Audience & Visibility", icon: Users, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Content rating", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: d.content_rating, onChange: (v) => set("content_rating", v), options: ["G", "PG", "PG-13", "TV-14", "TV-MA"] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Language", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { value: d.language, onChange: (v) => set("language", v), options: ["English", "Spanish", "French", "Other"] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Toggle, { label: "Explicit content", value: d.explicit_content, onChange: (v) => set("explicit_content", v) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Visibility after approval", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: ["public", "subscribers", "private", "scheduled"].map((v) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => set("visibility", v), className: `px-3 py-2 rounded-xl text-xs font-semibold capitalize border ${d.visibility === v ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`, children: v }, v)) }) }),
        d.visibility === "scheduled" && /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Scheduled release", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "datetime-local", value: d.scheduled_at ?? "", onChange: (e) => set("scheduled_at", e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" }) }),
        (d.episode_number === 1 || d.episode_number === 2) && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-primary px-3 py-2 rounded-xl bg-primary/10 border border-primary/30", children: [
          "Episode ",
          d.episode_number,
          " can be marked as a free preview for new viewers."
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Monetization / Access", icon: DollarSign, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-2", children: [{
        v: "free",
        label: "Free",
        soon: false
      }, {
        v: "subscribers",
        label: "Subscribers only",
        soon: false
      }, {
        v: "premium",
        label: "Premium purchase",
        soon: true
      }, {
        v: "gift",
        label: "Gift-supported",
        soon: true
      }].map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: o.soon, onClick: () => set("access_type", o.v), className: `relative px-3 py-2 rounded-xl text-xs font-semibold border text-left ${d.access_type === o.v ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"} ${o.soon ? "opacity-50 cursor-not-allowed" : ""}`, children: [
        o.label,
        o.soon && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[9px] text-muted-foreground", children: "Soon" })
      ] }, o.v)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Final Review Checklist", icon: CircleCheck, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2", children: checklist.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-sm", children: [
          c.ok ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-4 text-[oklch(0.78_0.18_150)]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { className: "size-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: c.ok ? "" : "text-muted-foreground", children: c.label })
        ] }, c.label)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 mt-3 text-xs cursor-pointer", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: d.policy_ack, onChange: (e) => set("policy_ack", e.target.checked), className: "mt-0.5" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "I confirm this content follows the Trey TV community guidelines, copyright, and creator policies." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-0 left-0 right-0 z-30 px-3 pb-4 pt-3 backdrop-blur-xl bg-background/80 border-t border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-[1400px] mx-auto flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/creator-studio/submissions", className: "hidden md:inline-flex px-3 py-3 rounded-xl text-xs font-semibold glass border border-white/10", children: "My submissions" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        saveSilent();
        toast("Draft saved");
      }, className: "flex-1 md:flex-none px-3 py-3 rounded-xl text-xs font-semibold glass border border-white/10", children: "Save draft" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !canSubmit, onClick: onSubmit, className: `flex-1 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${canSubmit ? "bg-primary text-primary-foreground glow-gold tilt-press" : "bg-white/10 text-muted-foreground cursor-not-allowed"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-4" }),
        " Submit for Admin Approval"
      ] })
    ] }) }),
    previewOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/80 p-4", onClick: () => setPreviewOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-3xl w-full rounded-3xl glass-strong border border-white/10 overflow-hidden", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPreviewOpen(false), className: "absolute top-3 right-3 z-10 size-9 grid place-items-center rounded-full glass", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-video bg-black grid place-items-center", children: d.video_url?.startsWith("blob:") ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: d.video_url, controls: true, className: "size-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: d.thumbnail_url || posts[0].media, className: "size-full object-cover", alt: "" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-primary", children: "PREVIEW" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: d.title || "Untitled episode" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
          d.show_title,
          " · S",
          d.season_number,
          " E",
          d.episode_number
        ] })
      ] })
    ] }) })
  ] });
}
function Section({
  title,
  icon: Icon,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 md:p-5 space-y-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-xl glass grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-sm font-bold tracking-wide", children: title })
    ] }),
    children
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5", children: label }),
    children
  ] });
}
function Input({
  value,
  onChange,
  placeholder,
  type = "text"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (e) => onChange(e.target.value), placeholder, type, className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60" });
}
function TextArea({
  value,
  onChange,
  rows = 3
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value, onChange: (e) => onChange(e.target.value), rows, className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/60" });
}
function Select({
  value,
  onChange,
  options
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value, onChange: (e) => onChange(e.target.value), className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60", children: options.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: o, children: o || "— select —" }, o)) });
}
function ChipGroup({
  options,
  selected,
  onToggle
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: options.map((o) => {
    const on = selected.includes(o);
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onToggle(o), className: `px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${on ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass hover:bg-white/5"}`, children: [
      on && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "inline size-3 mr-1" }),
      o
    ] }, o);
  }) });
}
function TagInput({
  tags,
  onChange
}) {
  const [v, setV] = reactExports.useState("");
  const add = () => {
    const t = v.trim();
    if (!t) return;
    if (!tags.includes(t)) onChange([...tags, t]);
    setV("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/5 border border-white/10 px-2 py-2 flex flex-wrap gap-1.5", children: [
    tags.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2 py-0.5 rounded-full text-[11px] bg-primary/15 text-primary border border-primary/30 flex items-center gap-1", children: [
      "#",
      t,
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => onChange(tags.filter((x) => x !== t)), children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }) })
    ] }, t)),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: v, onChange: (e) => setV(e.target.value), onKeyDown: (e) => e.key === "Enter" && (e.preventDefault(), add()), placeholder: "add tag…", className: "flex-1 min-w-[80px] bg-transparent text-xs focus:outline-none px-1" })
  ] });
}
function Toggle({
  label,
  value,
  onChange
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => onChange(!value), className: `px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between ${value ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`, children: [
    label,
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `size-4 rounded-full border ${value ? "bg-primary border-primary" : "border-white/30"}` })
  ] });
}
export {
  SubmitPage as component
};
