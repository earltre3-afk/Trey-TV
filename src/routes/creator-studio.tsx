import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreatorStudioLayout } from "@/components/layout/CreatorStudioLayout";
import {
  CreatorMetricCard, CreatorActionButton, SectionHeader, CreatorStatusBadge,
} from "@/components/creator/CreatorPrimitives";
import { useAuth } from "@/lib/auth";
import { useSubmissions } from "@/lib/submissions-store";
import {
  Eye, Clock, Users, Heart, Gem, FileClock, CheckCircle2, Trophy,
  Upload, Wand2, Tv, BarChart3, Calendar, Sparkles, MessageSquare,
  Film, Plus, ArrowUpRight, Bell, ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/creator-studio")({
  component: CreatorStudioDashboard,
  head: () => ({
    meta: [
      { title: "Creator Studio — Trey TV" },
      { name: "description", content: "Your premium creator command center: upload, edit, analyze, and grow your channel on Trey TV." },
    ],
  }),
});

function CreatorStudioDashboard() {
  const { user } = useAuth();
  const { submissions } = useSubmissions();
  const navigate = useNavigate();

  const myName = user?.name?.split(" ")[0] ?? "Creator";
  const channelHandle = user?.handle ?? "you";
  const pending = submissions.filter((s) => s.status === "pending").length;
  const approved = submissions.filter((s) => s.status === "approved" || s.status === "published").length;
  const needsChanges = submissions.filter((s) => s.status === "needs_changes").length;
  const top = submissions.find((s) => s.status === "published") ?? submissions[0];

  return (
    <CreatorStudioLayout
      title={`Welcome back, ${myName}.`}
      subtitle="Your channel is live. Your audience is watching."
      actions={
        <>
          <button
            onClick={() => navigate({ to: "/creator-studio/edit" })}
            className="px-3.5 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press hover-lift inline-flex items-center gap-1.5"
          >
            <Upload className="size-4" /> Upload Episode
          </button>
          <Link
            to="/u/$uid"
            params={{ uid: user?.uid ?? "trey" }}
            className="px-3 py-2 rounded-xl text-sm font-semibold glass border border-white/15 hover:bg-white/5 inline-flex items-center gap-1.5"
          >
            <Tv className="size-4" /> View Channel
          </Link>
        </>
      }
    >
      {/* Metrics */}
      <section>
        <SectionHeader icon={BarChart3} title="Channel performance" action={
          <Link to={"/creator-studio/analytics" as any} className="text-sm text-primary inline-flex items-center gap-1">
            Analytics <ArrowUpRight className="size-3.5" />
          </Link>
        } />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <CreatorMetricCard label="Total Views" value="184.2K" delta="+12.4% this week" icon={Eye} tone="cyan" />
          <CreatorMetricCard label="Watch Time" value="9,420h" delta="+8.1%" icon={Clock} tone="purple" />
          <CreatorMetricCard label="Followers" value="32.7K" delta="+1,204 new" icon={Users} tone="magenta" />
          <CreatorMetricCard label="Engagement" value="9.7%" delta="+1.3%" icon={Heart} tone="gold" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-3">
          <CreatorMetricCard label="Rewards Earned" value="12,480 pts" sub="≈ $312 in tips" icon={Gem} tone="gold" />
          <CreatorMetricCard label="Pending Submissions" value={String(pending)} sub="In admin review" icon={FileClock} tone="purple" />
          <CreatorMetricCard label="Approved Episodes" value={String(approved)} sub="Live on the network" icon={CheckCircle2} tone="green" />
          <CreatorMetricCard label="Best Performer" value={top?.title?.slice(0, 18) ?? "—"} sub="Last 30 days" icon={Trophy} tone="cyan" />
        </div>
      </section>

      {/* Two-column: Today + Quick actions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today on your channel */}
        <div className="lg:col-span-2 rounded-3xl glass neon-border p-4 md:p-5">
          <SectionHeader icon={Sparkles} title="Today on your channel" action={
            <Link to={"/creator-studio/interactions" as any} className="text-sm text-primary inline-flex items-center gap-1">
              Open inbox <ChevronRight className="size-3.5" />
            </Link>
          } />
          <ul className="divide-y divide-white/5">
            <TodayRow icon={MessageSquare} title="14 new comments" desc="Across 3 episodes — 4 mention you directly." tone="magenta" />
            <TodayRow icon={Users} title="+128 new followers" desc="Up 22% vs yesterday's pace." tone="purple" />
            <TodayRow icon={Gem} title="3 new gifts received" desc="Top supporter: @nightowl — 500 pts." tone="gold" />
            {needsChanges > 0 && (
              <TodayRow
                icon={FileClock}
                title={`${needsChanges} episode${needsChanges > 1 ? "s" : ""} need changes`}
                desc="Admin left feedback. Open content to review."
                tone="magenta"
                href="/creator-studio/submissions"
              />
            )}
            <TodayRow icon={Trophy} title="Performance spike" desc='"Studio Sessions E8" hit Top 10 in Music.' tone="cyan" />
            <TodayRow icon={Wand2} title="Trey-I suggestion" desc="Your behind-the-scenes clips are saving 2.3× higher — make a series." tone="gold" />
          </ul>
        </div>

        {/* Quick actions */}
        <div className="rounded-3xl glass neon-border p-4 md:p-5">
          <SectionHeader icon={Plus} title="Quick actions" />
          <div className="grid grid-cols-2 gap-3">
            <CreatorActionButton icon={Upload} label="Upload" desc="New video / episode" to="/creator-studio/edit" accent />
            <CreatorActionButton icon={Film} label="New Show" desc="Set up a series" to={"/creator-studio/schedule"} />
            <CreatorActionButton icon={Tv} label="Edit Channel" desc="Banner, bio, links" to={"/creator-studio/channel"} />
            <CreatorActionButton icon={Users} label="View Fans" desc="Top supporters" to={"/creator-studio/fans"} />
            <CreatorActionButton icon={Calendar} label="Schedule" desc="Premiere setup" to={"/creator-studio/schedule"} />
            <CreatorActionButton icon={Wand2} label="Ask Trey-I" desc="Growth ideas" onClick={() => {}} />
          </div>
        </div>
      </section>

      {/* Submissions snapshot */}
      <section className="rounded-3xl glass neon-border p-4 md:p-5">
        <SectionHeader icon={Film} title="Recent submissions" action={
          <Link to="/creator-studio/submissions" className="text-sm text-primary inline-flex items-center gap-1">
            All content <ChevronRight className="size-3.5" />
          </Link>
        } />
        <ul className="space-y-2">
          {submissions.slice(0, 4).map((s) => (
            <li key={s.content_id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition">
              <div className="relative size-14 rounded-xl overflow-hidden shrink-0 bg-white/5">
                {s.thumbnail_url && <img src={s.thumbnail_url} className="size-full object-cover" alt="" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{s.title || "Untitled draft"}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {s.show_title || "—"} · S{s.season_number} E{s.episode_number} · {s.duration}
                </div>
              </div>
              <CreatorStatusBadge status={s.status} />
            </li>
          ))}
          {submissions.length === 0 && (
            <li className="text-sm text-muted-foreground text-center py-6">
              No submissions yet. <Link to="/creator-studio/edit" className="text-primary font-semibold">Upload your first episode →</Link>
            </li>
          )}
        </ul>
      </section>

      {/* Channel link strip */}
      <section className="rounded-3xl glass neon-border p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4">
        <Bell className="size-5 text-primary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold">Your public channel link</div>
          <div className="text-xs text-muted-foreground truncate">trey.tv/@{channelHandle}</div>
        </div>
        <Link
          to="/u/$uid"
          params={{ uid: user?.uid ?? "trey" }}
          className="px-3 py-2 rounded-xl text-sm font-semibold border border-primary/40 text-primary hover:bg-primary/10 inline-flex items-center gap-1.5"
        >
          <ArrowUpRight className="size-4" /> Open channel
        </Link>
      </section>
    </CreatorStudioLayout>
  );
}

function TodayRow({
  icon: Icon, title, desc, tone, href,
}: { icon: typeof Eye; title: string; desc: string; tone: "gold" | "cyan" | "purple" | "magenta"; href?: string }) {
  const toneCls = {
    gold: "text-primary bg-primary/10 ring-primary/30",
    cyan: "text-[oklch(0.82_0.15_215)] bg-[oklch(0.82_0.15_215_/_0.1)] ring-[oklch(0.82_0.15_215_/_0.3)]",
    purple: "text-[oklch(0.78_0.22_300)] bg-[oklch(0.65_0.22_300_/_0.1)] ring-[oklch(0.65_0.22_300_/_0.3)]",
    magenta: "text-[oklch(0.78_0.25_340)] bg-[oklch(0.7_0.25_340_/_0.1)] ring-[oklch(0.7_0.25_340_/_0.3)]",
  }[tone];
  const content = (
    <>
      <div className={`size-10 rounded-xl grid place-items-center ring-1 ${toneCls}`}>
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {href && <ChevronRight className="size-4 text-muted-foreground" />}
    </>
  );
  if (href) {
    return (
      <li>
        <Link to={href} className="flex items-center gap-3 py-3 px-1 hover:bg-white/5 rounded-xl transition">
          {content}
        </Link>
      </li>
    );
  }
  return <li className="flex items-center gap-3 py-3 px-1">{content}</li>;
}
