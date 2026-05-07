import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useSubmissions } from "@/lib/submissions-store";
import { Users, Flag, Crown, BarChart3, FileCheck2, ArrowUpRight, ShieldCheck, Wand2, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({
    meta: [
      { title: "Admin — Trey TV" },
      { name: "description", content: "Trey TV admin console: moderation, roles, creator review." },
    ],
  }),
});

const reports = [
  { id: "r1", target: "@zaybeats", reason: "Copyrighted audio", priority: "high" },
  { id: "r2", target: "post #2841", reason: "Spam in comments", priority: "med" },
  { id: "r3", target: "@maya", reason: "Profile impersonation", priority: "high" },
];
const pendingCreators = [
  { id: "c1", handle: "noah.films", followers: "8.4K" },
  { id: "c2", handle: "the.studio", followers: "21K" },
];

function Admin() {
  const { isAdmin } = useAuth();
  const store = useSubmissions();
  if (!isAdmin) return null;
  const pendingCount = store.submissions.filter((s) => s.status === "pending").length;

  return (
    <AdminShell title="Site Management" subtitle="Moderation queue · creator review · role ops">
      {/* Quick action: Content approval */}
      <Link to="/admin/content-approval" className="block rounded-3xl glass neon-border p-4 hover-lift">
        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl glass grid place-items-center glow-gold"><FileCheck2 className="size-5 text-primary" /></div>
          <div className="flex-1">
            <div className="text-[10px] tracking-[0.3em] text-primary">CONTENT APPROVAL</div>
            <div className="text-base font-bold">{pendingCount} episode{pendingCount === 1 ? "" : "s"} pending review</div>
            <div className="text-xs text-muted-foreground">Approve, reject, or request changes from creators.</div>
          </div>
          <ArrowUpRight className="size-5" />
        </div>
      </Link>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total users", value: "284,931", icon: Users, color: "oklch(0.82 0.15 215)" },
          { label: "Open reports", value: reports.length, icon: Flag, color: "oklch(0.65 0.24 15)" },
          { label: "Pending creators", value: pendingCreators.length, icon: Crown, color: "oklch(0.82 0.16 85)" },
          { label: "Daily watch hours", value: "1.2M", icon: BarChart3, color: "oklch(0.7 0.25 340)" },
        ].map((k) => (
          <div key={k.label} className="rounded-2xl liquid-glass liquid-hover border border-white/10 p-4">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl grid place-items-center" style={{ background: `color-mix(in oklab, ${k.color} 18%, transparent)`, color: k.color }}>
                <k.icon className="size-4" />
              </div>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">{k.label.toUpperCase()}</div>
            </div>
            <div className="mt-2 text-2xl font-bold">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <section className="rounded-3xl liquid-glass border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2"><Flag className="size-4 text-[oklch(0.65_0.24_15)]" /> Moderation queue</h2>
            <Link to="/admin/reports" className="text-xs text-muted-foreground hover:text-foreground">View all <ArrowUpRight className="inline size-3" /></Link>
          </div>
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-3 rounded-2xl glass border border-white/10">
                <div className={`size-8 rounded-lg grid place-items-center ${r.priority === "high" ? "bg-[oklch(0.65_0.24_15_/_0.15)] text-[oklch(0.65_0.24_15)]" : "bg-white/5 text-muted-foreground"}`}>
                  <AlertTriangle className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{r.target}</div>
                  <div className="text-[11px] text-muted-foreground">{r.reason}</div>
                </div>
                <button className="size-8 rounded-lg grid place-items-center text-muted-foreground hover:text-[oklch(0.78_0.18_150)]"><CheckCircle2 className="size-4" /></button>
                <button className="size-8 rounded-lg grid place-items-center text-muted-foreground hover:text-[oklch(0.65_0.24_15)]"><Trash2 className="size-4" /></button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl liquid-glass border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2"><Crown className="size-4 text-primary" /> Creator applications</h2>
            <Link to="/admin/creators" className="text-xs text-muted-foreground hover:text-foreground">Review all <ArrowUpRight className="inline size-3" /></Link>
          </div>
          <div className="space-y-2">
            {pendingCreators.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-2xl glass border border-white/10">
                <div className="size-9 rounded-full conic-ring bg-background grid place-items-center text-xs font-bold">{c.handle.slice(0, 2).toUpperCase()}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">@{c.handle}</div>
                  <div className="text-[11px] text-muted-foreground">{c.followers} followers</div>
                </div>
                <button className="px-3 h-8 rounded-lg text-xs font-semibold bg-primary text-primary-foreground glow-gold">Approve</button>
                <button className="px-3 h-8 rounded-lg text-xs font-semibold liquid-glass border border-white/10">Deny</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <Link to="/settings" className="rounded-2xl liquid-glass liquid-hover border border-white/10 p-4 flex items-center gap-3">
        <Wand2 className="size-5 text-primary" />
        <div className="flex-1">
          <div className="text-sm font-semibold">Site settings & feature flags</div>
          <div className="text-[11px] text-muted-foreground">Toggle modules, manage roles, configure billing.</div>
        </div>
        <ArrowUpRight className="size-4" />
      </Link>
    </AdminShell>
  );
}
