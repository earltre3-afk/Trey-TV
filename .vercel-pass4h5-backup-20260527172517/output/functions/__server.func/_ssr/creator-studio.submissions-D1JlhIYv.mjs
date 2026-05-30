import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as CreatorStudioLayout } from "./CreatorStudioLayout-DnMAX3C9.mjs";
import { b as useAuth$1, v as posts, F as STATUS_LABEL, H as STATUS_TONE, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { u as useCreatorStudio } from "./use-creator-studio-BkHsMg4r.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { O as Search, c0 as LayoutGrid, c1 as List, aR as Funnel, aF as Trash2, b7 as Film, an as Upload, c2 as SquareCheckBig, c3 as Square, aM as MessageSquare, aY as Calendar, a9 as Clock, ao as Pencil, j as Eye, ae as Share2 } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
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
function useCreatorPostQueue() {
  const { isApprovedCreator } = useCreatorStudio();
  const [queueRows, setQueueRows] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!isApprovedCreator) {
      setQueueRows([]);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);
    async function loadQueueRows() {
      try {
        const supabase = createBrowserClient();
        const {
          data: { user }
        } = await supabase.auth.getUser();
        if (!user) {
          if (mounted) setQueueRows([]);
          return;
        }
        const { data, error } = await supabase.from("creator_post_queue").select(
          "id, edit_project_id, channel_id, show_id, episode_number, title, description, stream_uid, thumbnail_url, visibility, is_plus_content, scheduled_at, approval_status, created_at, updated_at"
        ).eq("creator_id", user.id).order("created_at", { ascending: false }).limit(50);
        if (error) {
          if (mounted) setQueueRows([]);
          return;
        }
        if (mounted) setQueueRows(data ?? []);
      } catch {
        if (mounted) setQueueRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadQueueRows();
    return () => {
      mounted = false;
    };
  }, [isApprovedCreator]);
  return { queueRows, loading };
}
const FILTERS = [{
  id: "all",
  label: "All"
}, {
  id: "draft",
  label: "Drafts"
}, {
  id: "pending",
  label: "Pending"
}, {
  id: "needs_changes",
  label: "Needs changes"
}, {
  id: "approved",
  label: "Approved"
}, {
  id: "scheduled",
  label: "Scheduled"
}, {
  id: "published",
  label: "Published"
}, {
  id: "rejected",
  label: "Rejected"
}];
function queueRowToSubmission(row) {
  return {
    content_id: row.id,
    creator_id: row.channel_id ?? "",
    creator_name: "",
    creator_handle: "",
    creator_avatar: "",
    title: row.title,
    short_description: row.description ?? "",
    full_description: "",
    viewer_context: "",
    what_to_know: "",
    why_it_matters: "",
    creator_note: "",
    show_id: row.show_id ?? "",
    show_title: "",
    season_number: 1,
    episode_number: row.episode_number ?? 1,
    episode_type: "Full Episode",
    category: [],
    tags: [],
    mood_tags: [],
    thumbnail_url: row.thumbnail_url ?? "",
    poster_url: "",
    video_url: "",
    duration: "",
    quality: "",
    visibility: row.visibility === "private" || row.visibility === "scheduled" ? row.visibility : "public",
    access_type: row.is_plus_content ? "subscribers" : "free",
    content_rating: "",
    language: "",
    explicit_content: false,
    is_trailer: false,
    is_bonus: false,
    is_finale: false,
    is_premiere: false,
    status: row.approval_status,
    admin_feedback: "",
    admin_internal_note: "",
    policy_ack: true,
    scheduled_at: row.scheduled_at ?? void 0,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}
function SubmissionsPage() {
  const {
    isGuest
  } = useAuth$1();
  const navigate = useNavigate();
  const {
    submissions
  } = useCreatorStudio();
  const {
    queueRows
  } = useCreatorPostQueue();
  reactExports.useEffect(() => {
    if (isGuest) navigate({
      to: "/login"
    });
  }, [isGuest, navigate]);
  const [filter, setFilter] = reactExports.useState("all");
  const [q, setQ] = reactExports.useState("");
  const [view, setView] = reactExports.useState("grid");
  const [selected, setSelected] = reactExports.useState(/* @__PURE__ */ new Set());
  const mine = reactExports.useMemo(() => {
    const queueSubmissions = queueRows.map(queueRowToSubmission);
    const queuedEditProjectIds = new Set(queueRows.map((row) => row.edit_project_id).filter(Boolean));
    const episodeOnly = submissions.filter((submission) => !queuedEditProjectIds.has(submission.content_id));
    return [...queueSubmissions, ...episodeOnly];
  }, [submissions, queueRows]);
  const counts = reactExports.useMemo(() => {
    const c = {
      all: mine.length
    };
    mine.forEach((s) => {
      c[s.status] = (c[s.status] ?? 0) + 1;
    });
    return c;
  }, [mine]);
  const filtered = reactExports.useMemo(() => {
    return mine.filter((s) => filter === "all" || s.status === filter).filter((s) => !q || `${s.title} ${s.show_title} ${s.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  }, [mine, filter, q]);
  const toggleSel = (id) => setSelected((s) => {
    const n = new Set(s);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const clearSel = () => setSelected(/* @__PURE__ */ new Set());
  const bulkDelete = () => {
    toast.success("Delete not available in this version");
    clearSel();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(CreatorStudioLayout, { title: "Content Library", subtitle: "Every draft, submission, and published episode in one place.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/edit", className: "px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold flex items-center gap-2 tilt-press", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4" }),
    " New upload"
  ] }), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass neon-border p-3 flex flex-col md:flex-row gap-3 md:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search by title, show, or tag…", className: "w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("grid"), className: `size-9 grid place-items-center rounded-xl border ${view === "grid" ? "bg-primary/15 text-primary border-primary/40 glow-gold" : "border-white/10 text-muted-foreground"}`, "aria-label": "Grid view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setView("list"), className: `size-9 grid place-items-center rounded-xl border ${view === "list" ? "bg-primary/15 text-primary border-primary/40 glow-gold" : "border-white/10 text-muted-foreground"}`, "aria-label": "List view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "size-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: "flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 py-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "size-3.5 text-muted-foreground shrink-0" }),
      FILTERS.map((f) => {
        const active = filter === f.id;
        const n = counts[f.id] ?? 0;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setFilter(f.id);
          clearSel();
        }, className: `shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition ${active ? "bg-primary/15 text-primary border-primary/40 glow-gold" : "border-white/10 text-muted-foreground hover:text-foreground"}`, children: [
          f.label,
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `ml-1.5 text-[10px] tabular-nums ${active ? "text-primary" : "text-muted-foreground"}`, children: n })
        ] }, f.id);
      })
    ] }),
    selected.size > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass neon-border p-3 flex items-center gap-3 animate-fade-in", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-semibold", children: [
        selected.size,
        " selected"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: bulkDelete, className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-[oklch(0.65_0.24_15_/_0.18)] text-[oklch(0.85_0.22_15)] border border-[oklch(0.65_0.24_15_/_0.4)] flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }),
        " Delete drafts"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearSel, className: "px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10 ml-auto", children: "Clear" })
    ] }),
    filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl glass neon-border p-10 text-center space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto size-14 rounded-2xl glass grid place-items-center glow-gold", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Film, { className: "size-7 text-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-gradient-gold", children: "No content here yet" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: filter === "all" ? "Upload your first episode and it will live here forever." : `No items matching "${FILTERS.find((f) => f.id === filter)?.label}".` }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/edit", className: "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "size-4" }),
        " Upload an episode"
      ] })
    ] }),
    view === "grid" && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 xl:grid-cols-3 gap-3", children: filtered.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SubmissionCard, { s, selected: selected.has(s.content_id), onSelect: () => toggleSel(s.content_id) }, s.content_id)) }),
    view === "list" && filtered.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl glass neon-border overflow-hidden divide-y divide-white/5", children: filtered.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(SubmissionRow, { s, selected: selected.has(s.content_id), onSelect: () => toggleSel(s.content_id) }, s.content_id)) })
  ] });
}
function SubmissionCard({
  s,
  selected,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: `group relative rounded-3xl glass neon-border overflow-hidden hover-lift transition ${selected ? "ring-2 ring-primary glow-gold" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSelect, "aria-label": "Select", className: "absolute top-2 left-2 z-10 size-7 rounded-md grid place-items-center bg-black/50 backdrop-blur opacity-0 group-hover:opacity-100 transition data-[on=true]:opacity-100", "data-on": selected, children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "size-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "size-4 text-white" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url || posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`, children: STATUS_LABEL[s.status] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold drop-shadow truncate", children: s.title || "Untitled" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-white/70 truncate", children: [
            s.show_title || "—",
            " · S",
            s.season_number,
            " E",
            s.episode_number
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] tabular-nums px-1.5 py-0.5 rounded bg-black/50 border border-white/10", children: s.duration })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-2", children: [
      s.admin_feedback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs rounded-xl bg-[oklch(0.7_0.25_340_/_0.1)] border border-[oklch(0.7_0.25_340_/_0.3)] p-2 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-3.5 text-[oklch(0.78_0.25_340)] shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "line-clamp-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-[oklch(0.78_0.25_340)]", children: "Admin: " }),
          s.admin_feedback
        ] })
      ] }),
      s.scheduled_at && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-[oklch(0.78_0.22_300)] flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-3" }),
        " Scheduled ",
        new Date(s.scheduled_at).toLocaleString()
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RowActions, { s })
    ] })
  ] });
}
function SubmissionRow({
  s,
  selected,
  onSelect
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-3 p-3 hover:bg-white/5 transition ${selected ? "bg-primary/5" : ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onSelect, "aria-label": "Select", className: "size-7 grid place-items-center rounded-md hover:bg-white/5", children: selected ? /* @__PURE__ */ jsxRuntimeExports.jsx(SquareCheckBig, { className: "size-4 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { className: "size-4 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-16 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url || posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold truncate", children: s.title || "Untitled" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`, children: STATUS_LABEL[s.status] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          s.show_title || "—",
          " · S",
          s.season_number,
          " E",
          s.episode_number
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3" }),
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.duration }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-50", children: "·" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: new Date(s.updated_at).toLocaleDateString() })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(RowActions, { s, compact: true })
  ] });
}
function RowActions({
  s,
  compact
}) {
  const cls = compact ? "px-2.5 py-1.5 rounded-lg text-[11px]" : "px-3 py-1.5 rounded-lg text-xs";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5", children: [
    s.status === "needs_changes" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/submit", search: {
      id: s.content_id
    }, className: `${cls} font-semibold bg-primary text-primary-foreground glow-gold`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "inline size-3 mr-1" }),
      "Edit & resubmit"
    ] }),
    s.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/creator-studio/submit", search: {
      id: s.content_id
    }, className: `${cls} font-semibold glass border border-white/10`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "inline size-3 mr-1" }),
      "Continue"
    ] }),
    (s.status === "approved" || s.status === "published" || s.status === "scheduled") && /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
      id: s.content_id
    }, className: `${cls} font-semibold glass border border-white/10`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "inline size-3 mr-1" }),
      "View"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
      navigator.clipboard?.writeText(`${location.origin}/watch/${s.content_id}`);
      toast.success("Link copied");
    }, className: `${cls} font-semibold glass border border-white/10 text-muted-foreground hover:text-foreground`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "inline size-3 mr-1" }),
      "Share"
    ] }),
    s.status === "draft" && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toast.error("Delete not available in this version"), className: `${cls} font-semibold glass border border-white/10 text-muted-foreground hover:text-[oklch(0.78_0.24_15)]`, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3" }) })
  ] });
}
export {
  SubmissionsPage as component
};
