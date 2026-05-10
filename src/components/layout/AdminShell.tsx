import { Link, useRouterState, Navigate } from "@tanstack/react-router";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { AppShell } from "./AppShell";
import {
  ShieldCheck, LayoutDashboard, FileCheck2, Crown, Users, Flag, Film, BarChart3, Sparkles, Settings,
  BadgeCheck, Gift, Palette, FileText, History, Eye, ScrollText, Route as RouteIcon,
} from "lucide-react";

const NAV = [
  { to: "/admin", label: "Command Center", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/creators", label: "Creators", icon: Crown },
  { to: "/admin/applications", label: "Applications", icon: FileCheck2 },
  { to: "/admin/verification", label: "Verification", icon: BadgeCheck },
  { to: "/admin/content-approval", label: "Content", icon: Film },
  { to: "/admin/reports", label: "Reports", icon: Flag },
  { to: "/admin/rewards", label: "Rewards", icon: Gift },
  { to: "/admin/profile-decorations", label: "Decorations", icon: Palette },
  { to: "/admin/site-editor", label: "Site Editor", icon: FileText },
  { to: "/admin/audit-log", label: "Audit Log", icon: History },
  { to: "/admin/view-as", label: "View As", icon: Eye },
  { to: "/admin/settings", label: "Platform", icon: Settings },
] as const;

const APP_ACCESS = [
  { to: "/", label: "Watch Now" },
  { to: "/for-you", label: "For You" },
  { to: "/explore", label: "Discover" },
  { to: "/guide", label: "Guide" },
  { to: "/prescribe-me", label: "Prescribe Me" },
  { to: "/rewards", label: "Rewards" },
  { to: "/onboarding", label: "Onboarding" },
  { to: "/onboarding/manual", label: "Manual Setup" },
  { to: "/onboarding/voice", label: "Voice Setup" },
  { to: "/creator-studio", label: "Creator Studio" },
  { to: "/creator-studio/submit", label: "Submit Content" },
] as const;

export function AdminShell({ children, title, subtitle }: { children: ReactNode; title?: string; subtitle?: string }) {
  const { isAdmin } = useAuth();
  const path = useRouterState({ select: (r) => r.location.pathname });
  if (!isAdmin) return <Navigate to="/login" />;

  return (
    <AppShell wide>
      <div className="space-y-4">
        {/* Top admin banner — animated aurora */}
        <div className="relative rounded-3xl overflow-hidden border border-[oklch(0.7_0.25_340_/_0.4)] glow-purple">
          <div aria-hidden className="absolute inset-0 admin-aurora" />
          <div aria-hidden className="absolute -top-24 -right-16 size-72 rounded-full bg-[oklch(0.7_0.25_340_/_0.35)] blur-3xl animate-float" />
          <div aria-hidden className="absolute -bottom-24 -left-16 size-72 rounded-full bg-[oklch(0.82_0.16_85_/_0.3)] blur-3xl animate-float" style={{ animationDelay: "1.4s" }} />
          <div aria-hidden className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(oklch(1_0_0)_1px,transparent_1px),linear-gradient(90deg,oklch(1_0_0)_1px,transparent_1px)] bg-[size:22px_22px]" />
          <div aria-hidden className="absolute inset-0 shimmer-sweep pointer-events-none" />

          <div className="relative p-4 md:p-5 flex items-center gap-3 backdrop-blur-md">
            <div className="size-12 rounded-2xl grid place-items-center bg-[oklch(0.7_0.25_340_/_0.25)] text-[oklch(0.85_0.2_340)] border border-[oklch(0.7_0.25_340_/_0.5)] glow-purple">
              <ShieldCheck className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] tracking-[0.35em] text-[oklch(0.85_0.2_340)] font-semibold">OWNER · ADMIN CONSOLE</div>
              <h1 className="text-xl md:text-2xl font-bold truncate text-gradient-prescribe">{title ?? "Site Management"}</h1>
              {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full glass border border-white/10 text-[10px] tracking-[0.2em] font-semibold">
              <span className="size-1.5 rounded-full bg-[oklch(0.78_0.18_150)] animate-glow-pulse" />
              SYSTEMS NOMINAL
            </div>
          </div>
        </div>

        {/* Animated nav rail */}
        <nav className="rounded-2xl liquid-glass border border-white/10 p-1.5 flex md:flex-wrap gap-1 overflow-x-auto no-scrollbar relative">
          {NAV.map((n, i) => {
            const active = path === n.to || (n.to !== "/admin" && path.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={`group relative shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/40 glow-gold scale-[1.02]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground border border-transparent hover:scale-[1.03]"
                }`}
                style={{ animation: `counter-up 0.4s ${i * 35}ms both` }}
              >
                <n.icon className={`size-3.5 transition-transform duration-300 ${active ? "" : "group-hover:rotate-12"}`} />
                {n.label}
                {active && (
                  <span aria-hidden className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl liquid-glass border border-primary/20 p-3">
          <div className="flex items-center gap-2 text-[10px] tracking-[0.25em] text-primary mb-2">
            <RouteIcon className="size-3.5" /> ADMIN APP ACCESS
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {APP_ACCESS.map((item) => (
              <Link
                key={item.to}
                to={item.to as any}
                className="shrink-0 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {children}
      </div>
    </AppShell>
  );
}
