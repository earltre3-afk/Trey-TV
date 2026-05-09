import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { useSubmissions, STATUS_LABEL, STATUS_TONE, type Submission, type SubmissionStatus } from "@/lib/submissions-store";
import { createBrowserClient } from "@/lib/supabase-browser";
import {
  getAdminPostQueueItem,
  reviewAdminPostQueue,
  type AdminQueueApprovalStatus,
  type AdminQueueItemDetail,
} from "@/lib/admin/post-queue.server";
import { posts } from "@/lib/mock-data";
import { CheckCircle2, MessageSquare, X, Globe2, CalendarClock, ArrowLeft, Eye, FileText, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content-approval/$id")({
  component: ReviewDetail,
  head: () => ({ meta: [{ title: "Review Submission — Trey TV Admin" }] }),
});

const CHECKS = [
  "Video plays correctly",
  "Thumbnail is appropriate",
  "Title is clean",
  "Description is complete",
  "Episode is organized correctly",
  "Content does not violate policy",
  "Audio/video quality is acceptable",
  "Creator access settings are correct",
  "No illegal or unsafe content",
  "Ready to publish",
];

function queueItemToSubmission(item: AdminQueueItemDetail): Submission {
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
    scheduled_at: item.scheduled_at ?? undefined,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

function toQueueApprovalStatus(status: SubmissionStatus): AdminQueueApprovalStatus {
  return status === "approved" || status === "rejected" || status === "needs_changes" ? status : "pending";
}

function ReviewDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const store = useSubmissions();
  const fallbackSub = store.get(id);
  const [queueSub, setQueueSub] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const sub = queueSub ?? fallbackSub;
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState("");
  const [internal, setInternal] = useState(fallbackSub?.admin_internal_note ?? "");
  const [scheduleAt, setScheduleAt] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSubmission() {
      setLoading(true);
      try {
        const supabase = createBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          throw new Error("Admin access required");
        }

        const item = await getAdminPostQueueItem({
          data: {
            accessToken: session.access_token,
            queueId: id,
          },
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

  const review = async (
    approvalStatus: AdminQueueApprovalStatus,
    adminNotes: string,
    message: string,
    navigateAfterReview = true,
  ) => {
    try {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error("Admin access required");
      }

      await reviewAdminPostQueue({
        data: {
          accessToken: session.access_token,
          queueId: id,
          approvalStatus,
          adminNotes,
        },
      });

      toast.success(message);
      if (navigateAfterReview) {
        navigate({ to: "/admin/content-approval" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed");
    }
  };

  if (!sub && !loading) {
    return (
      <AdminShell title="Submission not found">
        <Link to="/admin/content-approval" className="px-3 py-2 rounded-xl glass border border-white/10 text-sm inline-flex items-center gap-2"><ArrowLeft className="size-4" /> Back to queue</Link>
      </AdminShell>
    );
  }

  if (!sub) {
    return (
      <AdminShell title="Loading submission">
        <Link to="/admin/content-approval" className="px-3 py-2 rounded-xl glass border border-white/10 text-sm inline-flex items-center gap-2"><ArrowLeft className="size-4" /> Back to queue</Link>
      </AdminShell>
    );
  }

  const allChecked = CHECKS.every((c) => checks[c]);

  return (
    <AdminShell title={sub.title || "Untitled submission"} subtitle={`@${sub.creator_handle} · ${sub.show_title} · S${sub.season_number} E${sub.episode_number}`}>
      <Link to="/admin/content-approval" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to queue</Link>

      <div className="grid lg:grid-cols-[1.6fr,1fr] gap-4">
        {/* Left: preview + actions */}
        <div className="space-y-4">
          <div className="rounded-3xl glass neon-border overflow-hidden">
            <div className="relative aspect-video bg-black">
              {sub.video_url?.startsWith("blob:") ? (
                <video src={sub.video_url} controls className="absolute inset-0 size-full" />
              ) : (
                <img src={sub.thumbnail_url || posts[0].media} className="absolute inset-0 size-full object-cover" alt="" />
              )}
              <span className={`absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[sub.status]}`}>{STATUS_LABEL[sub.status]}</span>
            </div>
          </div>

          {/* Moderation checklist */}
          <section className="rounded-3xl glass neon-border p-4 space-y-2">
            <h3 className="text-sm font-bold">Admin Moderation Checklist</h3>
            {CHECKS.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!checks[c]} onChange={(e) => setChecks((s) => ({ ...s, [c]: e.target.checked }))} />
                <span>{c}</span>
              </label>
            ))}
          </section>

          {/* Notes */}
          <section className="rounded-3xl glass neon-border p-4 space-y-3">
            <div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">Public feedback to creator</div>
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Visible to the creator if you request changes or reject." />
            </div>
            <div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">Internal admin note</div>
              <textarea value={internal} onChange={(e) => setInternal(e.target.value)} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" placeholder="Only visible to admins." />
              <button onClick={() => { review(toQueueApprovalStatus(sub.status), internal, "Internal note saved", false); }} className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10"><Save className="inline size-3 mr-1" />Save internal note</button>
            </div>
          </section>

          {/* Action bar */}
          <section className="rounded-3xl glass neon-border p-4 flex flex-wrap gap-2">
            <button
              disabled={!allChecked}
              onClick={() => { review("approved", internal, "Approved"); }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1 ${allChecked ? "bg-primary text-primary-foreground glow-gold" : "bg-white/10 text-muted-foreground cursor-not-allowed"}`}
            ><Globe2 className="size-3.5" /> Approve & Publish</button>
            <button onClick={() => { review("approved", internal, "Approved"); }} className="px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.78_0.18_150_/_0.4)] text-[oklch(0.82_0.18_150)] flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Approve</button>
            <div className="flex items-center gap-1">
              <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-xs" />
              <button onClick={() => { if (!scheduleAt) { toast.error("Pick a date"); return; } review("approved", internal, "Approved"); }} className="px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.65_0.22_300_/_0.4)] text-[oklch(0.78_0.22_300)] flex items-center gap-1"><CalendarClock className="size-3.5" /> Schedule</button>
            </div>
            <button onClick={() => { if (!feedback.trim()) { toast.error("Add feedback"); return; } review("needs_changes", feedback, "Sent to creator"); }} className="px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.7_0.25_340_/_0.4)] text-[oklch(0.78_0.25_340)] flex items-center gap-1"><MessageSquare className="size-3.5" /> Request Changes</button>
            <button onClick={() => { if (!feedback.trim()) { toast.error("Add reason"); return; } review("rejected", feedback, "Rejected"); }} className="px-3 py-2 rounded-xl text-xs font-bold glass border border-[oklch(0.65_0.24_15_/_0.4)] text-[oklch(0.78_0.24_15)] flex items-center gap-1"><X className="size-3.5" /> Reject</button>
            <Link to="/watch/$id" params={{ id: sub.content_id }} className="px-3 py-2 rounded-xl text-xs font-bold glass border border-white/10 flex items-center gap-1"><Eye className="size-3.5" /> Preview public page</Link>
          </section>
        </div>

        {/* Right: full metadata */}
        <aside className="space-y-3">
          <Meta title="Episode">
            <Row k="Title" v={sub.title} />
            <Row k="Type" v={sub.episode_type} />
            <Row k="Show" v={sub.show_title} />
            <Row k="Season / Episode" v={`S${sub.season_number} E${sub.episode_number}`} />
            <Row k="Duration" v={sub.duration} />
            <Row k="Quality" v={sub.quality} />
          </Meta>
          <Meta title="Creator">
            <Row k="Name" v={sub.creator_name} />
            <Row k="Handle" v={`@${sub.creator_handle}`} />
          </Meta>
          <Meta title="Descriptions">
            <Row k="Short" v={sub.short_description} />
            <Row k="Full" v={sub.full_description} />
            <Row k="Viewer context" v={sub.viewer_context} />
            <Row k="Why it matters" v={sub.why_it_matters} />
            <Row k="Creator note" v={sub.creator_note} />
          </Meta>
          <Meta title="Tags & Mood">
            <Row k="Categories" v={sub.category.join(", ")} />
            <Row k="Tags" v={sub.tags.map((t) => `#${t}`).join(" ")} />
            <Row k="Moods" v={sub.mood_tags.join(", ")} />
          </Meta>
          <Meta title="Settings">
            <Row k="Visibility" v={sub.visibility} />
            <Row k="Access" v={sub.access_type} />
            <Row k="Rating" v={sub.content_rating} />
            <Row k="Language" v={sub.language} />
            <Row k="Explicit" v={sub.explicit_content ? "Yes" : "No"} />
          </Meta>
          <Meta title="Timeline">
            <Row k="Created" v={fmtDate(sub.created_at)} />
            <Row k="Submitted" v={fmtDate(sub.submitted_at)} />
            <Row k="Reviewed" v={fmtDate(sub.reviewed_at)} />
            <Row k="Approved" v={fmtDate(sub.approved_at)} />
            <Row k="Published" v={fmtDate(sub.published_at)} />
          </Meta>
        </aside>
      </div>
    </AdminShell>
  );
}

function Meta({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl glass border border-white/10 p-3">
      <div className="text-[10px] tracking-[0.2em] text-primary mb-2">{title.toUpperCase()}</div>
      <div className="space-y-1">{children}</div>
    </section>
  );
}
function Row({ k, v }: { k: string; v?: string }) {
  return (
    <div className="grid grid-cols-[110px,1fr] gap-2 text-xs">
      <div className="text-muted-foreground">{k}</div>
      <div className="break-words">{v || <span className="text-muted-foreground">—</span>}</div>
    </div>
  );
}
function fmtDate(s?: string) { return s ? new Date(s).toLocaleString() : ""; }
