import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { F as STATUS_LABEL, v as posts, H as STATUS_TONE, b as useAuth$1, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { N as getAdminPostQueue, O as reviewAdminPostQueue } from "./index.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { cr as Hourglass, as as BadgeCheck, aI as TriangleAlert, X, bu as Earth, O as Search, j as Eye, ax as CircleCheck, aM as MessageSquare } from "../_libs/lucide-react.mjs";
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
function useAdminPostQueue() {
  const { isAdmin } = useAuth$1();
  const [items, setItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const load = reactExports.useCallback(async () => {
    if (!isAdmin) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const {
        data: { session }
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setItems([]);
        return;
      }
      const result = await getAdminPostQueue({ data: { accessToken: session.access_token } });
      setItems(result);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);
  reactExports.useEffect(() => {
    load();
  }, [load]);
  return { items, loading, reload: load };
}
const FILTERS = ["all", "pending", "approved", "needs_changes", "rejected", "scheduled", "published"];
function queueItemToSubmission(item) {
  return {
    content_id: item.id,
    creator_id: item.creator_id,
    creator_name: "",
    creator_handle: "",
    creator_avatar: "",
    title: item.title,
    short_description: item.description ?? "",
    full_description: "",
    viewer_context: "",
    what_to_know: "",
    why_it_matters: "",
    creator_note: "",
    show_id: item.show_id ?? "",
    show_title: "",
    season_number: 1,
    episode_number: item.episode_number ?? 1,
    episode_type: "Full Episode",
    category: [],
    tags: [],
    mood_tags: [],
    thumbnail_url: item.thumbnail_url ?? "",
    poster_url: "",
    video_url: "",
    duration: "",
    quality: "",
    visibility: item.visibility === "private" || item.visibility === "scheduled" ? item.visibility : "public",
    access_type: item.is_plus_content ? "subscribers" : "free",
    content_rating: "",
    language: "",
    explicit_content: false,
    is_trailer: false,
    is_bonus: false,
    is_finale: false,
    is_premiere: false,
    status: item.approval_status,
    admin_feedback: "",
    admin_internal_note: "",
    policy_ack: true,
    scheduled_at: item.scheduled_at ?? void 0,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}
function AdminContentApproval() {
  const {
    items,
    reload
  } = useAdminPostQueue();
  const navigate = useNavigate();
  const [q, setQ] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("pending");
  const [feedback, setFeedback] = reactExports.useState(null);
  const [feedbackText, setFeedbackText] = reactExports.useState("");
  const submissions = reactExports.useMemo(() => items.map(queueItemToSubmission), [items]);
  const review = async (queueId, approvalStatus, adminNotes) => {
    try {
      const supabase = createBrowserClient();
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Admin access required");
      }
      await reviewAdminPostQueue({
        data: {
          accessToken: session.access_token,
          queueId,
          approvalStatus,
          adminNotes
        }
      });
      toast.success(approvalStatus === "approved" ? "Approved" : "Sent to creator");
      await reload();
      setFeedback(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  };
  const stats = reactExports.useMemo(() => ({
    pending: submissions.filter((s) => s.status === "pending").length,
    approved: submissions.filter((s) => s.status === "approved").length,
    needs_changes: submissions.filter((s) => s.status === "needs_changes").length,
    rejected: submissions.filter((s) => s.status === "rejected").length,
    published: submissions.filter((s) => s.status === "published").length
  }), [submissions]);
  const filtered = submissions.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (q && !`${s.title} ${s.creator_handle} ${s.show_title}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "Content Approval", subtitle: "Review creator episodes before they go live on Trey TV.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Pending", value: stats.pending, icon: Hourglass, tone: "oklch(0.82 0.16 85)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Approved", value: stats.approved, icon: BadgeCheck, tone: "oklch(0.78 0.18 150)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Needs Changes", value: stats.needs_changes, icon: TriangleAlert, tone: "oklch(0.78 0.25 340)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Rejected", value: stats.rejected, icon: X, tone: "oklch(0.78 0.24 15)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Published", value: stats.published, icon: Earth, tone: "oklch(0.82 0.15 215)" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl glass border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search by title, creator, show…", className: "flex-1 bg-transparent text-sm focus:outline-none" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f), className: `px-3 py-1.5 rounded-full text-[11px] font-semibold border ${filter === f ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`, children: f === "all" ? "All" : STATUS_LABEL[f] }, f)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-2 gap-3", children: [
      filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl glass neon-border p-8 text-center text-sm text-muted-foreground col-span-full", children: "Nothing here. Try a different filter." }),
      filtered.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("article", { className: "rounded-3xl glass neon-border overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[140px,1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-video", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.thumbnail_url || posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 mb-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[9px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`, children: STATUS_LABEL[s.status] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10", children: s.quality })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: s.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
              "@",
              s.creator_handle,
              " · ",
              s.show_title,
              " · S",
              s.season_number,
              " E",
              s.episode_number
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex flex-wrap gap-1", children: [
              s.category.slice(0, 2).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-white/5", children: c }, c)),
              s.tags.slice(0, 2).map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary", children: [
                "#",
                t
              ] }, t))
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "px-3 pb-3 flex flex-wrap gap-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => navigate({
            to: "/admin/content-approval/$id",
            params: {
              id: s.content_id
            }
          }), className: "px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "inline size-3 mr-1" }),
            "Review"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            review(s.content_id, "approved", "");
          }, className: "px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-[oklch(0.78_0.18_150_/_0.4)] text-[oklch(0.82_0.18_150)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "inline size-3 mr-1" }),
            "Approve"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setFeedback({
              id: s.content_id,
              mode: "changes"
            });
            setFeedbackText("");
          }, className: "px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-[oklch(0.7_0.25_340_/_0.4)] text-[oklch(0.78_0.25_340)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "inline size-3 mr-1" }),
            "Needs Changes"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            setFeedback({
              id: s.content_id,
              mode: "reject"
            });
            setFeedbackText("");
          }, className: "px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-[oklch(0.65_0.24_15_/_0.4)] text-[oklch(0.78_0.24_15)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "inline size-3 mr-1" }),
            "Reject"
          ] })
        ] })
      ] }, s.content_id))
    ] }),
    feedback && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/80 p-4", onClick: () => setFeedback(null), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md w-full rounded-3xl glass-strong border border-white/10 p-5 space-y-3", onClick: (e) => e.stopPropagation(), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold", children: feedback.mode === "changes" ? "Request changes" : "Reject submission" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: feedbackText, onChange: (e) => setFeedbackText(e.target.value), rows: 4, placeholder: feedback.mode === "changes" ? "What needs to change?" : "Reason for rejection", className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 justify-end", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFeedback(null), className: "px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
          if (!feedbackText.trim()) {
            toast.error("Add a note for the creator.");
            return;
          }
          review(feedback.id, feedback.mode === "changes" ? "needs_changes" : "rejected", feedbackText);
        }, className: "px-3 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground glow-gold", children: "Send" })
      ] })
    ] }) })
  ] });
}
function Stat({
  label,
  value,
  icon: Icon,
  tone
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass border border-white/10 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-lg grid place-items-center", style: {
        background: `color-mix(in oklab, ${tone} 18%, transparent)`,
        color: tone
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground", children: label.toUpperCase() })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-2xl font-bold tabular-nums", children: value })
  ] });
}
export {
  AdminContentApproval as component
};
