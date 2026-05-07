import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import { AppShell } from "./AppShell";
import { useAuth } from "@/lib/auth";
import {
  Crown, LayoutDashboard, Upload, Film, BarChart3, Users, MessageSquare, Gem,
  Calendar, Settings, Tv, Lock, Sparkles,
} from "lucide-react";
import { currentUser } from "@/lib/mock-data";
import { CreatorStatusBadge } from "@/components/creator/CreatorPrimitives";

const NAV = [
  { to: "/creator-studio", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/creator-studio/edit", icon: Upload, label: "Upload & Edit" },
  { to: "/creator-studio/submissions", icon: Film, label: "Content" },
  { to: "/creator-studio/fans" as any, icon: Users, label: "Fans" },
  { to: "/creator-studio/interactions" as any, icon: MessageSquare, label: "Interactions" },
  { to: "/creator-studio/analytics" as any, icon: BarChart3, label: "Analytics" },
  { to: "/creator-studio/rewards" as any, icon: Gem, label: "Rewards" },
  { to: "/creator-studio/schedule" as any, icon: Calendar, label: "Schedule" },
  { to: "/creator-studio/channel" as any, icon: Tv, label: "Channel" },
  { to: "/creator-studio/settings" as any, icon: Settings, label: "Settings" },
] as const;

export function CreatorStudioLayout({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { isGuest, isApprovedCreator, creatorStatus, user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    if (isGuest) navigate({ to: "/login" });
  }, [isGuest, navigate]);

  if (isGuest) return null;

  if (!isApprovedCreator) {
    return (
      <AppShell wide>
        <CreatorGate status={creatorStatus} />
      </AppShell>
    );
  }

  const profile = user ?? currentUser;

  return (
    <AppShell wide>
      <div className="space-y-6">
        {/* Studio top bar */}
        <div className="relative overflow-hidden rounded-3xl glass neon-border p-5 md:p-6">
          <div className="absolute -top-20 -right-20 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.16_85_/_0.35),transparent_70%)] blur-2xl" />
          <div className="absolute -bottom-24 -left-12 size-72 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.3),transparent_70%)] blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative size-14 rounded-2xl conic-ring shrink-0">
              <img src={profile.avatar} className="size-full rounded-2xl object-cover" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] text-primary mb-1">
                <Crown className="size-3.5" /> CREATOR STUDIO
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gradient-gold truncate">{title}</h1>
              {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <CreatorStatusBadge status="approved" label="Approved Creator" />
              {actions}
            </div>
          </div>
        </div>

        {/* Studio nav rail */}
        <nav className="rounded-2xl glass neon-border p-1.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 min-w-max">
            {NAV.map((n) => {
              const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to as any}
                  className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                    active
                      ? "bg-primary/15 text-primary ring-1 ring-primary/40 glow-gold font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <n.icon className="size-4" />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {children}
      </div>
    </AppShell>
  );
}

function CreatorGate({ status }: { status: string }) {
  const navigate = useNavigate();
  const copy: Record<string, { title: string; body: string; cta: string; to: string }> = {
    not_applied: {
      title: "Creator Studio is for approved creators",
      body: "Apply to join the Trey TV network and unlock the upload, edit studio, analytics, fans, and rewards tools.",
      cta: "Apply to become a Creator",
      to: "/premium",
    },
    pending: {
      title: "Your creator application is in review",
      body: "Our team is reviewing your channel. You'll be notified the moment you're approved — usually within 48 hours.",
      cta: "View application status",
      to: "/premium",
    },
    rejected: {
      title: "Your application needs updates",
      body: "We left feedback on your application. Update your channel details and submit again.",
      cta: "Update application",
      to: "/premium",
    },
    approved: { title: "", body: "", cta: "", to: "/" },
  };
  const c = copy[status] ?? copy.not_applied;

  return (
    <div className="grid place-items-center min-h-[60vh] px-4">
      <div className="relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden">
        <div className="absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.82_0.16_85_/_0.35),transparent_70%)] blur-2xl" />
        <div className="relative">
          <div className="mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4">
            <Lock className="size-7 text-primary" />
          </div>
          <div className="text-[10px] tracking-[0.3em] text-primary mb-2 flex items-center justify-center gap-2">
            <Crown className="size-3.5" /> CREATOR ACCESS
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold">{c.title}</h1>
          <p className="text-sm text-muted-foreground mt-2">{c.body}</p>
          <div className="mt-3 inline-flex"><CreatorStatusBadge status={status} /></div>
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => navigate({ to: c.to as any })}
              className="px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press"
            >
              <Sparkles className="inline size-4 mr-1" /> {c.cta}
            </button>
            <Link to="/" className="px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 hover:bg-white/5">
              Back to Trey TV
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
