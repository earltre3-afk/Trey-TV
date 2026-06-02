import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { a3 as Route$6, E as useSubmissions, v as posts, F as STATUS_LABEL, H as STATUS_TONE, c as createBrowserClient } from "./router-BtgGywEC.mjs";
import { P as getAdminPostQueueItem, O as reviewAdminPostQueue } from "./index.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, aG as Save, bu as Earth, ax as CircleCheck, g as CalendarClock, aM as MessageSquare, X, j as Eye } from "../_libs/lucide-react.mjs";
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
const CHECKS = ["Video plays correctly", "Thumbnail is appropriate", "Title is clean", "Description is complete", "Episode is organized correctly", "Content does not violate policy", "Audio/video quality is acceptable", "Creator access settings are correct", "No illegal or unsafe content", "Ready to publish"];
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
    admin_feedback: item.admin_notes ?? "",
    admin_internal_note: item.admin_notes ?? "",
    policy_ack: true,
    scheduled_at: item.scheduled_at ?? void 0,
    created_at: item.created_at,
    updated_at: item.updated_at
  };
}
function toQueueApprovalStatus(status) {
  return status === "approved" || status === "rejected" || status === "needs_changes" ? status : "pending";
}
function ReviewDetail() {
  const {
    id
  } = Route$6.useParams();
  const navigate = useNavigate();
  const store = useSubmissions();
  const fallbackSub = store.get(id);
  const [queueSub, setQueueSub] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  const sub = queueSub ?? fallbackSub;
  const [checks, setChecks] = reactExports.useState({});
  const [feedback, setFeedback] = reactExports.useState("");
  const [internal, setInternal] = reactExports.useState(fallbackSub?.admin_internal_note ?? "");
  const [scheduleAt, setScheduleAt] = reactExports.useState("");
  reactExports.useEffect(() => {
    let mounted = true;
    async function loadSubmission() {
      setLoading(true);
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
        const item = await getAdminPostQueueItem({
          data: {
            accessToken: session.access_token,
            queueId: id
          }
        });
        if (!mounted) return;
        if (item) {
          const mapped = queueItemToSubmission(item);
          setQueueSub(mapped);
          setFeedback(item.admin_notes ?? "");
          setInternal(item.admin_notes ?? "");
        } else {
          setQueueSub(null);
        }
      } catch (error) {
        if (mounted) {
          toast.error(error instanceof Error ? error.message : "Failed to load submission");
          setQueueSub(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadSubmission();
    return () => {
      mounted = false;
    };
  }, [id]);
  const review = async (approvalStatus, adminNotes, message, navigateAfterReview = true) => {
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
          queueId: id,
          approvalStatus,
          adminNotes
        }
      });
      toast.success(message);
      if (navigateAfterReview) {
        navigate({
          to: "/admin/content-approval"
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  };
  if (!sub && !loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Submission not found", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/content-approval", className: "px-3 py-2 rounded-xl glass border border-white/10 text-sm inline-flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
      " Back to queue"
    ] }) });
  }
  if (!sub) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Loading submission", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/content-approval", className: "px-3 py-2 rounded-xl glass border border-white/10 text-sm inline-flex items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
      " Back to queue"
    ] }) });
  }
  const allChecked = CHECKS.every((c) => checks[c]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: sub.title || "Untitled submission", subtitle: `@${sub.creator_handle} · ${sub.show_title} · S${sub.season_number} E${sub.episode_number}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/content-approval", className: "inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }),
      " Back to queue"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1.6fr,1fr] gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl glass neon-border overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-video bg-black", children: [
          sub.video_url?.startsWith("blob:") ? /* @__PURE__ */ jsxRuntimeExports.jsx("video", { src: sub.video_url, controls: true, className: "absolute inset-0 size-full" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: sub.thumbnail_url || posts[0].media, className: "absolute inset-0 size-full object-cover", alt: "" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[sub.status]}`, children: STATUS_LABEL[sub.status] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-bold", children: "Admin Moderation Checklist" }),
          CHECKS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: !!checks[c], onChange: (e) => setChecks((s) => ({
              ...s,
              [c]: e.target.checked
            })) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: c })
          ] }, c))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5", children: "Public feedback to creator" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: feedback, onChange: (e) => setFeedback(e.target.value), rows: 3, className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm", placeholder: "Visible to the creator if you request changes or reject." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5", children: "Internal admin note" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: internal, onChange: (e) => setInternal(e.target.value), rows: 2, className: "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm", placeholder: "Only visible to admins." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              review(toQueueApprovalStatus(sub.status), internal, "Internal note saved", false);
            }, className: "mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "inline size-3 mr-1" }),
              "Save internal note"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl glass neon-border p-4 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !allChecked, onClick: () => {
            review("approved", internal, "Approved");
          }, className: `px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 ${allChecked ? "bg-primary text-primary-foreground glow-gold" : "bg-white/10 text-muted-foreground cursor-not-allowed"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Earth, { className: "size-3.5" }),
            " Approve & Publish"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            review("approved", internal, "Approved");
          }, className: "px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.78_0.18_150_/_0.4)] text-[oklch(0.82_0.18_150)] flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-3.5" }),
            " Approve"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "datetime-local", value: scheduleAt, onChange: (e) => setScheduleAt(e.target.value), className: "bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
              if (!scheduleAt) {
                toast.error("Pick a date");
                return;
              }
              review("approved", internal, "Approved");
            }, className: "px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.65_0.22_300_/_0.4)] text-[oklch(0.78_0.22_300)] flex items-center gap-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "size-3.5" }),
              " Schedule"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            if (!feedback.trim()) {
              toast.error("Add feedback");
              return;
            }
            review("needs_changes", feedback, "Sent to creator");
          }, className: "px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.7_0.25_340_/_0.4)] text-[oklch(0.78_0.25_340)] flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-3.5" }),
            " Request Changes"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
            if (!feedback.trim()) {
              toast.error("Add reason");
              return;
            }
            review("rejected", feedback, "Rejected");
          }, className: "px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.65_0.24_15_/_0.4)] text-[oklch(0.78_0.24_15)] flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3.5" }),
            " Reject"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/watch/$id", params: {
            id: sub.content_id
          }, className: "px-3 py-2 rounded-xl text-xs font-bold glass border border-white/10 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-3.5" }),
            " Preview public page"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Meta, { title: "Episode", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Title", v: sub.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Type", v: sub.episode_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Show", v: sub.show_title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Season / Episode", v: `S${sub.season_number} E${sub.episode_number}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Duration", v: sub.duration }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Quality", v: sub.quality })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Meta, { title: "Creator", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Name", v: sub.creator_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Handle", v: `@${sub.creator_handle}` })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Meta, { title: "Descriptions", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Short", v: sub.short_description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Full", v: sub.full_description }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Viewer context", v: sub.viewer_context }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Why it matters", v: sub.why_it_matters }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Creator note", v: sub.creator_note })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Meta, { title: "Tags & Mood", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Categories", v: sub.category.join(", ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Tags", v: sub.tags.map((t) => `#${t}`).join(" ") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Moods", v: sub.mood_tags.join(", ") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Meta, { title: "Settings", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Visibility", v: sub.visibility }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Access", v: sub.access_type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Rating", v: sub.content_rating }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Language", v: sub.language }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Explicit", v: sub.explicit_content ? "Yes" : "No" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Meta, { title: "Timeline", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Created", v: fmtDate(sub.created_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Submitted", v: fmtDate(sub.submitted_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Reviewed", v: fmtDate(sub.reviewed_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Approved", v: fmtDate(sub.approved_at) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { k: "Published", v: fmtDate(sub.published_at) })
        ] })
      ] })
    ] })
  ] });
}
function Meta({
  title,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl glass border border-white/10 p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-primary mb-2", children: title.toUpperCase() }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children })
  ] });
}
function Row({
  k,
  v
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[110px,1fr] gap-2 text-xs", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-muted-foreground", children: k }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "break-words", children: v || /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) })
  ] });
}
function fmtDate(s) {
  return s ? new Date(s).toLocaleString() : "";
}
export {
  ReviewDetail as component
};
