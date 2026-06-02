import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import { useAuth } from "@/lib/auth";
import {
  STATUS_LABEL,
  STATUS_TONE,
  type SubmissionStatus,
  type Submission,
} from "@/lib/submissions-store";
import { useCreatorStudio } from "@/hooks/use-creator-studio";
import { useCreatorPostQueue, type QueueRow } from "@/hooks/use-creator-post-queue";
import { posts } from "@/lib/mock-data";
import {
  Pencil,
  Trash2,
  Eye,
  MessageSquare,
  Upload,
  Search,
  LayoutGrid,
  List as ListIcon,
  Filter,
  Film,
  CheckSquare,
  Square,
  Calendar,
  Clock,
  MoreVertical,
  Copy,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/creator-studio/submissions")({
  component: SubmissionsPage,
  head: () => ({
    meta: [
      { title: "Content Library — Trey TV" },
      {
        name: "description",
        content: "Track every Trey TV submission, draft, episode, and approval status.",
      },
    ],
  }),
});

const FILTERS: { id: "all" | SubmissionStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "pending", label: "Pending" },
  { id: "needs_changes", label: "Needs changes" },
  { id: "approved", label: "Approved" },
  { id: "scheduled", label: "Scheduled" },
  { id: "published", label: "Published" },
  { id: "rejected", label: "Rejected" },
];

function queueRowToSubmission(row: QueueRow): Submission {
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
    visibility:
      row.visibility === "private" || row.visibility === "scheduled" ? row.visibility : "public",
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
    scheduled_at: row.scheduled_at ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function SubmissionsPage() {
  const { isGuest } = useAuth();
  const navigate = useNavigate();
  const { submissions } = useCreatorStudio();
  const { queueRows } = useCreatorPostQueue();
  useEffect(() => {
    if (isGuest) navigate({ to: "/login" });
  }, [isGuest, navigate]);

  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const mine = useMemo(() => {
    const queueSubmissions = queueRows.map(queueRowToSubmission);
    const queuedEditProjectIds = new Set(
      queueRows.map((row) => row.edit_project_id).filter(Boolean),
    );
    const episodeOnly = submissions.filter(
      (submission) => !queuedEditProjectIds.has(submission.content_id),
    );
    return [...queueSubmissions, ...episodeOnly];
  }, [submissions, queueRows]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: mine.length };
    mine.forEach((s) => {
      c[s.status] = (c[s.status] ?? 0) + 1;
    });
    return c;
  }, [mine]);

  const filtered = useMemo(() => {
    return mine
      .filter((s) => filter === "all" || s.status === filter)
      .filter(
        (s) =>
          !q ||
          `${s.title} ${s.show_title} ${s.tags.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
      )
      .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  }, [mine, filter, q]);

  const toggleSel = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const clearSel = () => setSelected(new Set());

  const bulkDelete = () => {
    toast.success("Delete not available in this version");
    clearSel();
  };

  return (
    <CreatorStudioLayout
      title="Content Library"
      subtitle="Every draft, submission, and published episode in one place."
      actions={
        <Link
          to="/creator-studio/edit"
          className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold flex items-center gap-2 tilt-press"
        >
          <Upload className="size-4" /> New upload
        </Link>
      }
    >
      {/* Toolbar */}
      <div className="rounded-2xl glass neon-border p-3 flex flex-col md:flex-row gap-3 md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, show, or tag…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("grid")}
            className={`size-9 grid place-items-center rounded-xl border ${view === "grid" ? "bg-primary/15 text-primary border-primary/40 glow-gold" : "border-white/10 text-muted-foreground"}`}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`size-9 grid place-items-center rounded-xl border ${view === "list" ? "bg-primary/15 text-primary border-primary/40 glow-gold" : "border-white/10 text-muted-foreground"}`}
            aria-label="List view"
          >
            <ListIcon className="size-4" />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 py-1">
        <Filter className="size-3.5 text-muted-foreground shrink-0" />
        {FILTERS.map((f) => {
          const active = filter === f.id;
          const n = counts[f.id] ?? 0;
          return (
            <button
              key={f.id}
              onClick={() => {
                setFilter(f.id);
                clearSel();
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border whitespace-nowrap transition ${
                active
                  ? "bg-primary/15 text-primary border-primary/40 glow-gold"
                  : "border-white/10 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
              <span
                className={`ml-1.5 text-[10px] tabular-nums ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {n}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="rounded-2xl glass neon-border p-3 flex items-center gap-3 animate-fade-in">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <button
            onClick={bulkDelete}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[oklch(0.65_0.24_15_/_0.18)] text-[oklch(0.85_0.22_15)] border border-[oklch(0.65_0.24_15_/_0.4)] flex items-center gap-1"
          >
            <Trash2 className="size-3.5" /> Delete drafts
          </button>
          <button
            onClick={clearSel}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10 ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-3xl glass neon-border p-10 text-center space-y-3">
          <div className="mx-auto size-14 rounded-2xl glass grid place-items-center glow-gold">
            <Film className="size-7 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gradient-gold">No content here yet</h3>
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "Upload your first episode and it will live here forever."
              : `No items matching "${FILTERS.find((f) => f.id === filter)?.label}".`}
          </p>
          <Link
            to="/creator-studio/edit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold"
          >
            <Upload className="size-4" /> Upload an episode
          </Link>
        </div>
      )}

      {/* Grid */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((s) => (
            <SubmissionCard
              key={s.content_id}
              s={s}
              selected={selected.has(s.content_id)}
              onSelect={() => toggleSel(s.content_id)}
            />
          ))}
        </div>
      )}

      {/* List */}
      {view === "list" && filtered.length > 0 && (
        <div className="rounded-3xl glass neon-border overflow-hidden divide-y divide-white/5">
          {filtered.map((s) => (
            <SubmissionRow
              key={s.content_id}
              s={s}
              selected={selected.has(s.content_id)}
              onSelect={() => toggleSel(s.content_id)}
            />
          ))}
        </div>
      )}
    </CreatorStudioLayout>
  );
}

function SubmissionCard({
  s,
  selected,
  onSelect,
}: {
  s: Submission;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={`group relative rounded-3xl glass neon-border overflow-hidden hover-lift transition ${selected ? "ring-2 ring-primary glow-gold" : ""}`}
    >
      <button
        onClick={onSelect}
        aria-label="Select"
        className="absolute top-2 left-2 z-10 size-7 rounded-md grid place-items-center bg-black/50 backdrop-blur opacity-0 group-hover:opacity-100 transition data-[on=true]:opacity-100"
        data-on={selected}
      >
        {selected ? (
          <CheckSquare className="size-4 text-primary" />
        ) : (
          <Square className="size-4 text-white" />
        )}
      </button>
      <div className="relative aspect-video">
        <img
          src={s.thumbnail_url || posts[0].media}
          className="absolute inset-0 size-full object-cover"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <span
          className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`}
        >
          {STATUS_LABEL[s.status]}
        </span>
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm font-semibold drop-shadow truncate">
              {s.title || "Untitled"}
            </div>
            <div className="text-[11px] text-white/70 truncate">
              {s.show_title || "—"} · S{s.season_number} E{s.episode_number}
            </div>
          </div>
          <span className="text-[10px] tabular-nums px-1.5 py-0.5 rounded bg-black/50 border border-white/10">
            {s.duration}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-2">
        {s.admin_feedback && (
          <div className="text-xs rounded-xl bg-[oklch(0.7_0.25_340_/_0.1)] border border-[oklch(0.7_0.25_340_/_0.3)] p-2 flex gap-2">
            <MessageSquare className="size-3.5 text-[oklch(0.78_0.25_340)] shrink-0 mt-0.5" />
            <div className="line-clamp-2">
              <span className="font-semibold text-[oklch(0.78_0.25_340)]">Admin: </span>
              {s.admin_feedback}
            </div>
          </div>
        )}
        {s.scheduled_at && (
          <div className="text-[11px] text-[oklch(0.78_0.22_300)] flex items-center gap-1.5">
            <Calendar className="size-3" /> Scheduled {new Date(s.scheduled_at).toLocaleString()}
          </div>
        )}
        <RowActions s={s} />
      </div>
    </article>
  );
}

function SubmissionRow({
  s,
  selected,
  onSelect,
}: {
  s: Submission;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 hover:bg-white/5 transition ${selected ? "bg-primary/5" : ""}`}
    >
      <button
        onClick={onSelect}
        aria-label="Select"
        className="size-7 grid place-items-center rounded-md hover:bg-white/5"
      >
        {selected ? (
          <CheckSquare className="size-4 text-primary" />
        ) : (
          <Square className="size-4 text-muted-foreground" />
        )}
      </button>
      <div className="relative size-16 rounded-lg overflow-hidden shrink-0 ring-1 ring-white/10">
        <img
          src={s.thumbnail_url || posts[0].media}
          className="absolute inset-0 size-full object-cover"
          alt=""
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold truncate">{s.title || "Untitled"}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`}>
            {STATUS_LABEL[s.status]}
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
          <span>
            {s.show_title || "—"} · S{s.season_number} E{s.episode_number}
          </span>
          <span className="opacity-50">·</span>
          <Clock className="size-3" /> <span>{s.duration}</span>
          <span className="opacity-50">·</span>
          <span>{new Date(s.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
      <RowActions s={s} compact />
    </div>
  );
}

function RowActions({ s, compact }: { s: Submission; compact?: boolean }) {
  const cls = compact ? "px-2.5 py-1.5 rounded-lg text-[11px]" : "px-3 py-1.5 rounded-lg text-xs";
  return (
    <div className="flex flex-wrap gap-1.5">
      {s.status === "needs_changes" && (
        <Link
          to="/creator-studio/submit"
          search={{ id: s.content_id } as any}
          className={`${cls} font-semibold bg-primary text-primary-foreground glow-gold`}
        >
          <Pencil className="inline size-3 mr-1" />
          Edit & resubmit
        </Link>
      )}
      {s.status === "draft" && (
        <Link
          to="/creator-studio/submit"
          search={{ id: s.content_id } as any}
          className={`${cls} font-semibold glass border border-white/10`}
        >
          <Pencil className="inline size-3 mr-1" />
          Continue
        </Link>
      )}
      {(s.status === "approved" || s.status === "published" || s.status === "scheduled") && (
        <Link
          to="/watch/$id"
          params={{ id: s.content_id }}
          className={`${cls} font-semibold glass border border-white/10`}
        >
          <Eye className="inline size-3 mr-1" />
          View
        </Link>
      )}
      <button
        onClick={() => {
          navigator.clipboard?.writeText(`${location.origin}/watch/${s.content_id}`);
          toast.success("Link copied");
        }}
        className={`${cls} font-semibold glass border border-white/10 text-muted-foreground hover:text-foreground`}
      >
        <Share2 className="inline size-3 mr-1" />
        Share
      </button>
      {s.status === "draft" && (
        <button
          onClick={() => toast.error("Delete not available in this version")}
          className={`${cls} font-semibold glass border border-white/10 text-muted-foreground hover:text-[oklch(0.78_0.24_15)]`}
        >
          <Trash2 className="size-3" />
        </button>
      )}
    </div>
  );
}
