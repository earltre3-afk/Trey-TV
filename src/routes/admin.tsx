import { Outlet, createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useSupabaseSession } from "@/lib/supabase-session";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminStats } from "@/lib/admin-api";
import {
  Users,
  Flag,
  Crown,
  BadgeCheck,
  FileCheck2,
  ArrowUpRight,
  AlertTriangle,
  Gift,
  Sparkles,
  History,
  ShieldCheck,
  ScrollText,
  Coins,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: Admin,
  head: () => ({
    meta: [
      { title: "Admin Command Center — Trey TV" },
      { name: "description", content: "Owner Admin command center for Trey TV." },
    ],
  }),
});

function Admin() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { isAdmin } = useAuth();
  const { adminRole, user: supaUser } = useSupabaseSession();
  if (!isAdmin) return null;
  if (pathname !== "/admin") return <Outlet />;

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    refetchInterval: 30000,
  });

  const { data: recentAudit } = useQuery({
    queryKey: ["admin", "recent-audit"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      return data ?? [];
    },
    refetchInterval: 30000,
  });

  const tiles = [
    {
      label: "Total users",
      value: stats?.totalUsers ?? "—",
      icon: Users,
      color: "oklch(0.82 0.15 215)",
      to: "/admin/users",
    },
    {
      label: "Pending creators",
      value: stats?.pendingCreators ?? "—",
      icon: Crown,
      color: "oklch(0.82 0.16 85)",
      to: "/admin/applications",
    },
    {
      label: "Pending verification",
      value: stats?.pendingVerifications ?? "—",
      icon: BadgeCheck,
      color: "oklch(0.82 0.16 85)",
      to: "/admin/verification",
    },
    {
      label: "Open reports",
      value: stats?.pendingReports ?? "—",
      icon: Flag,
      color: "oklch(0.65 0.24 15)",
      to: "/admin/reports",
    },
    {
      label: "Banned users",
      value: stats?.activeBans ?? "—",
      icon: AlertTriangle,
      color: "oklch(0.65 0.24 15)",
      to: "/admin/users",
    },
    {
      label: "Gold verified",
      value: stats?.goldVerifiedUsers ?? "—",
      icon: BadgeCheck,
      color: "oklch(0.82 0.16 85)",
      to: "/admin/verification",
    },
    {
      label: "Pending redemptions",
      value: stats?.pendingRedemptions ?? "—",
      icon: Gift,
      color: "oklch(0.7 0.25 340)",
      to: "/admin/rewards",
    },
    {
      label: "Points issued",
      value: stats?.totalPointsIssued ?? "—",
      icon: Coins,
      color: "oklch(0.78 0.18 150)",
      to: "/admin/rewards",
    },
  ] as const;

  return (
    <AdminShell
      title="Owner Command Center"
      subtitle="Platform control · users · creators · content · rewards"
    >
      {/* Owner identity card */}
      <div className="rounded-3xl liquid-glass border border-primary/30 p-5 flex items-center gap-3 glow-gold">
        <div className="size-12 rounded-2xl grid place-items-center bg-primary/15 text-primary">
          <ShieldCheck className="size-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-[0.3em] text-primary">
            {(adminRole ?? "ADMIN").toUpperCase()} MODE
          </div>
          <div className="text-base font-bold truncate">
            {supaUser?.email ?? "Demo admin (mock)"}
          </div>
          <div className="text-[11px] text-muted-foreground">
            All actions are logged to the audit trail.
          </div>
        </div>
        <Link
          to="/admin/audit-log"
          className="hidden md:inline-flex items-center gap-1.5 px-3 h-9 rounded-xl glass border border-white/10 text-xs font-semibold"
        >
          <History className="size-3.5" /> Audit log
        </Link>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tiles.map((k, i) => (
          <Link
            key={k.label}
            to={k.to as any}
            className="group relative rounded-2xl liquid-glass border border-white/10 p-4 block overflow-hidden hover-lift transition"
            style={{ animation: `counter-up 0.5s ${i * 60}ms both` }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at 30% 0%, color-mix(in oklab, ${k.color} 30%, transparent), transparent 60%)`,
              }}
            />
            <div
              aria-hidden
              className="absolute inset-0 shimmer-sweep pointer-events-none opacity-0 group-hover:opacity-100"
            />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div
                  className="size-9 rounded-xl grid place-items-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
                  style={{
                    background: `color-mix(in oklab, ${k.color} 20%, transparent)`,
                    color: k.color,
                    boxShadow: `0 0 20px color-mix(in oklab, ${k.color} 35%, transparent)`,
                  }}
                >
                  <k.icon className="size-4" />
                </div>
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground">
                  {k.label.toUpperCase()}
                </div>
              </div>
              <div
                className="mt-2 text-2xl font-bold animate-counter-up"
                style={{ textShadow: `0 0 18px color-mix(in oklab, ${k.color} 40%, transparent)` }}
              >
                {isLoading ? "…" : k.value}
              </div>
              <ArrowUpRight className="absolute top-0 right-0 size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Quick actions */}
        <section className="rounded-3xl liquid-glass border border-white/10 p-5">
          <h2 className="font-bold flex items-center gap-2 mb-3">
            <Sparkles className="size-4 text-primary" /> Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction
              to="/admin/applications"
              icon={Crown}
              label="Review creators"
              tone="gold"
            />
            <QuickAction
              to="/admin/verification"
              icon={BadgeCheck}
              label="Verification queue"
              tone="gold"
            />
            <QuickAction to="/admin/reports" icon={Flag} label="Reports inbox" tone="red" />
            <QuickAction
              to="/admin/content-approval"
              icon={FileCheck2}
              label="Content approval"
              tone="blue"
            />
            <QuickAction
              to="/admin/site-editor"
              icon={ScrollText}
              label="Edit live site"
              tone="blue"
            />
            <QuickAction
              to="/admin/settings"
              icon={ShieldCheck}
              label="Platform settings"
              tone="purple"
            />
          </div>
        </section>

        {/* Recent audit */}
        <section className="rounded-3xl liquid-glass border border-white/10 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2">
              <History className="size-4 text-[oklch(0.7_0.25_340)]" /> Recent admin activity
            </h2>
            <Link
              to="/admin/audit-log"
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all <ArrowUpRight className="inline size-3" />
            </Link>
          </div>
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {(recentAudit?.length ?? 0) === 0 ? (
              <div className="text-xs text-muted-foreground p-4 text-center">
                No admin actions logged yet.
              </div>
            ) : (
              recentAudit!.map((row: any) => (
                <div key={row.id} className="p-3 rounded-2xl glass border border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold truncate">{row.action}</div>
                    <div className="text-[10px] text-muted-foreground shrink-0">
                      {new Date(row.created_at).toLocaleString()}
                    </div>
                  </div>
                  {row.target_type && (
                    <div className="text-[11px] text-muted-foreground truncate">
                      {row.target_type}: {row.target_id}
                    </div>
                  )}
                  {row.reason && (
                    <div className="text-[11px] text-muted-foreground/80 mt-1 italic">
                      "{row.reason}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

function QuickAction({
  to,
  icon: Icon,
  label,
  tone,
}: {
  to: string;
  icon: any;
  label: string;
  tone: "gold" | "blue" | "red" | "purple";
}) {
  const colors: Record<string, string> = {
    gold: "oklch(0.82 0.16 85)",
    blue: "oklch(0.82 0.15 215)",
    red: "oklch(0.65 0.24 15)",
    purple: "oklch(0.7 0.25 340)",
  };
  return (
    <Link
      to={to as any}
      className="group p-3 rounded-2xl glass border border-white/10 hover:border-white/30 transition flex items-center gap-3"
    >
      <div
        className="size-9 rounded-xl grid place-items-center"
        style={{
          background: `color-mix(in oklab, ${colors[tone]} 18%, transparent)`,
          color: colors[tone],
        }}
      >
        <Icon className="size-4" />
      </div>
      <div className="text-xs font-semibold flex-1">{label}</div>
      <ArrowUpRight className="size-3.5 text-muted-foreground group-hover:text-foreground transition" />
    </Link>
  );
}
