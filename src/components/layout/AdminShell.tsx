import { Link, useRouterState, Navigate } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { AppShell } from "./AppShell";
import {
  ShieldCheck, LayoutDashboard, FileCheck2, Crown, Users, Flag, Film, BarChart3, Sparkles, Settings,
} from "lucide-react";

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/content-approval", label: "Content Approval", icon: FileCheck2 },
  { to: "/admin/creators", label: "Creator Applications", icon: Crown },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/videos", label: "Videos", icon: Film },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/recommendations", label: "Recommendations", icon: Sparkles },
  { to: "/settings", label: "Site Settings", icon: Settings },
] as const;

export function AdminShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { isAdmin } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <AppShell wide>
      <div className="space-y-4">
        {/* Top admin banner */}
        <div className="rounded-3xl liquid-glass border border-[oklch(0.7_0.25_340_/_0.4)] p-4 md:p-5 flex items-center gap-3 glow-purple">
          <div className="size-11 rounded-2xl grid place-items-center bg-[oklch(0.7_0.25_340_/_0.2)] text-[oklch(0.78_0.25_340)]">
            <ShieldCheck className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.3em] text-[oklch(0.78_0.25_340)]">ADMIN CONSOLE</div>
            <h1 className="text-xl md:text-2xl font-bold truncate">{title ?? "Site Management"}</h1>
            {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
          </div>
        </div>

        {/* Mobile/desktop unified nav rail (horizontal scroll on mobile) */}
        <nav className="rounded-2xl liquid-glass border border-white/10 p-1.5 flex md:flex-wrap gap-1 overflow-x-auto no-scrollbar">
          {NAV.map((n) => {
            const active = path === n.to || (n.to !== "/admin" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  active ? "bg-primary/15 text-primary border border-primary/40 glow-gold" : "text-muted-foreground hover:bg-white/5 border border-transparent"
                }`}
              >
                <n.icon className="size-3.5" /> {n.label}
              </Link>
            );
          })}
        </nav>

        {children}
      </div>
    </AppShell>
  );
}
