import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { useSubmissions, STATUS_LABEL, STATUS_TONE, type SubmissionStatus } from "@/lib/submissions-store";
import {
  Search, CheckCircle2, MessageSquare, X, Eye, Clock, Hourglass, AlertTriangle, BadgeCheck, CalendarClock, Globe2,
} from "lucide-react";
import { posts } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content-approval")({
  component: AdminContentApproval,
  head: () => ({
    meta: [
      { title: "Content Approval — Trey TV Admin" },
      { name: "description", content: "Review creator episodes before they go live on Trey TV." },
    ],
  }),
});

const FILTERS: ("all" | SubmissionStatus)[] = ["all", "pending", "approved", "needs_changes", "rejected", "scheduled", "published"];

function AdminContentApproval() {
  const store = useSubmissions();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<typeof FILTERS[number]>("pending");
  const [feedback, setFeedback] = useState<{ id: string; mode: "changes" | "reject" } | null>(null);
  const [feedbackText, setFeedbackText] = useState("");

  const stats = useMemo(() => ({
    pending: store.submissions.filter((s) => s.status === "pending").length,
    approved: store.submissions.filter((s) => s.status === "approved").length,
    needs_changes: store.submissions.filter((s) => s.status === "needs_changes").length,
    rejected: store.submissions.filter((s) => s.status === "rejected").length,
    published: store.submissions.filter((s) => s.status === "published").length,
  }), [store.submissions]);

  const filtered = store.submissions.filter((s) => {
    if (filter !== "all" && s.status !== filter) return false;
    if (q && !`${s.title} ${s.creator_handle} ${s.show_title}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <AdminShell title="Content Approval" subtitle="Review creator episodes before they go live on Trey TV.">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        <Stat label="Pending" value={stats.pending} icon={Hourglass} tone="oklch(0.82 0.16 85)" />
        <Stat label="Approved" value={stats.approved} icon={BadgeCheck} tone="oklch(0.78 0.18 150)" />
        <Stat label="Needs Changes" value={stats.needs_changes} icon={AlertTriangle} tone="oklch(0.78 0.25 340)" />
        <Stat label="Rejected" value={stats.rejected} icon={X} tone="oklch(0.78 0.24 15)" />
        <Stat label="Published" value={stats.published} icon={Globe2} tone="oklch(0.82 0.15 215)" />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-2xl glass border border-white/10">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, creator, show…" className="flex-1 bg-transparent text-sm focus:outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border ${filter === f ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`}>
              {f === "all" ? "All" : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="grid lg:grid-cols-2 gap-3">
        {filtered.length === 0 && (
          <div className="rounded-3xl glass neon-border p-8 text-center text-sm text-muted-foreground col-span-full">
            Nothing here. Try a different filter.
          </div>
        )}
        {filtered.map((s) => (
          <article key={s.content_id} className="rounded-3xl glass neon-border overflow-hidden">
            <div className="grid grid-cols-[140px,1fr]">
              <div className="relative aspect-video">
                <img src={s.thumbnail_url || posts[0].media} className="absolute inset-0 size-full object-cover" alt="" />
              </div>
              <div className="p-3 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">{s.quality}</span>
                </div>
                <div className="font-semibold truncate">{s.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">@{s.creator_handle} · {s.show_title} · S{s.season_number} E{s.episode_number}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {s.category.slice(0, 2).map((c) => <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5">{c}</span>)}
                  {s.tags.slice(0, 2).map((t) => <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">#{t}</span>)}
                </div>
              </div>
            </div>
            <div className="px-3 pb-3 flex flex-wrap gap-1.5">
              <button onClick={() => navigate({ to: "/admin/content-approval/$id", params: { id: s.content_id } })} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"><Eye className="inline size-3 mr-1" />Review</button>
              <button onClick={() => { store.approve(s.content_id); toast.success("Approved"); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-[oklch(0.78_0.18_150_/_0.4)] text-[oklch(0.82_0.18_150)]"><CheckCircle2 className="inline size-3 mr-1" />Approve</button>
              <button onClick={() => { setFeedback({ id: s.content_id, mode: "changes" }); setFeedbackText(""); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-[oklch(0.7_0.25_340_/_0.4)] text-[oklch(0.78_0.25_340)]"><MessageSquare className="inline size-3 mr-1" />Needs Changes</button>
              <button onClick={() => { setFeedback({ id: s.content_id, mode: "reject" }); setFeedbackText(""); }} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-[oklch(0.65_0.24_15_/_0.4)] text-[oklch(0.78_0.24_15)]"><X className="inline size-3 mr-1" />Reject</button>
            </div>
          </article>
        ))}
      </div>

      {/* Feedback dialog */}
      {feedback && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setFeedback(null)}>
          <div className="max-w-md w-full rounded-3xl glass-strong border border-white/10 p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold">{feedback.mode === "changes" ? "Request changes" : "Reject submission"}</h3>
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={4} placeholder={feedback.mode === "changes" ? "What needs to change?" : "Reason for rejection"} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setFeedback(null)} className="px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10">Cancel</button>
              <button
                onClick={() => {
                  if (!feedbackText.trim()) { toast.error("Add a note for the creator."); return; }
                  if (feedback.mode === "changes") store.requestChanges(feedback.id, feedbackText);
                  else store.reject(feedback.id, feedbackText);
                  toast.success("Sent to creator");
                  setFeedback(null);
                }}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-primary text-primary-foreground glow-gold"
              >Send</button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: string }) {
  return (
    <div className="rounded-2xl glass border border-white/10 p-3">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-lg grid place-items-center" style={{ background: `color-mix(in oklab, ${tone} 18%, transparent)`, color: tone }}><Icon className="size-4" /></div>
        <div className="text-[10px] tracking-[0.2em] text-muted-foreground">{label.toUpperCase()}</div>
      </div>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}
