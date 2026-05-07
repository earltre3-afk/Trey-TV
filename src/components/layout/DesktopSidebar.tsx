import { Link, useLocation } from "@tanstack/react-router";
import {
  Home, Compass, Inbox, Plus, Heart, Crown, BarChart3, Settings,
  Bookmark, Radio, Users, Gem,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { currentUser } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";

const primary = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/prescribe-me", icon: Heart, label: "Prescribe Me" },
  { to: "/inbox", icon: Inbox, label: "Inbox", badge: 8 },
  { to: "/create", icon: Plus, label: "Create" },
] as const;

const creator = [
  { to: "/creator-hub", icon: Crown, label: "Creator Hub" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/settings", icon: Settings, label: "Settings" },
] as const;

const collections = [
  { to: "/inbox", icon: Bookmark, label: "Saved" },
  { to: "/create", icon: Radio, label: "Go Live" },
  { to: "/explore", icon: Users, label: "Following" },
] as const;

export function DesktopSidebar() {
  const { pathname } = useLocation();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-[260px] xl:w-[280px] flex-col glass-strong border-r border-white/10 overflow-y-auto no-scrollbar">
      <Link to="/" className="relative flex items-center justify-center pt-6 pb-4 group">
        <span aria-hidden className="absolute inset-x-6 top-2 h-24 rounded-full blur-3xl opacity-70 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin" />
        <Logo className="relative h-24 transition-transform duration-500 group-hover:scale-105" />
      </Link>

      <Section label="Discover" items={primary} isActive={isActive} />
      <div className="my-3 mx-5 h-px bg-white/10" />
      <Section label="Creator Studio" items={creator} isActive={isActive} accent="gold" />
      <div className="my-3 mx-5 h-px bg-white/10" />
      <Section label="Library" items={collections} isActive={isActive} />

      <div className="mt-auto p-3 space-y-3">
        <div className="p-3 rounded-2xl border border-[oklch(0.65_0.22_300_/_0.4)] bg-[linear-gradient(135deg,oklch(0.25_0.1_300_/_0.6),oklch(0.18_0.05_270_/_0.6))] glow-purple">
          <div className="flex items-center gap-2">
            <Gem className="size-5 text-[oklch(0.7_0.25_340)]" />
            <div className="text-sm font-bold">Trey TV Premium</div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-1">Unlock pro analytics & monetization.</div>
          <button className="mt-2 w-full px-3 py-1.5 rounded-lg text-xs font-semibold border border-[oklch(0.7_0.25_340)] text-[oklch(0.7_0.25_340)] hover:bg-[oklch(0.7_0.25_340_/_0.1)]">
            Upgrade
          </button>
        </div>

        <Link to="/u/$uid" params={{ uid: currentUser.uid }} className="flex items-center gap-3 p-2 rounded-2xl glass neon-border hover-lift">
          <div className="relative size-11 rounded-full conic-ring shrink-0">
            <img src={currentUser.avatar} className="size-11 rounded-full object-cover" alt="" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold flex items-center gap-1 truncate">
              {currentUser.name}
              <VerifiedBadge kind="creator" className="!size-3.5" />
            </div>
            <div className="text-[11px] text-muted-foreground truncate">@{currentUser.handle}</div>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function Section({
  label, items, isActive, accent,
}: {
  label: string;
  items: readonly { to: string; icon: typeof Home; label: string; badge?: number }[];
  isActive: (p: string) => boolean;
  accent?: "gold";
}) {
  return (
    <div className="px-3">
      <div className="px-3 pb-1 text-[10px] tracking-[0.22em] text-muted-foreground">{label.toUpperCase()}</div>
      <div className="space-y-0.5">
        {items.map((i, idx) => {
          const active = isActive(i.to);
          return (
            <Link
              key={i.label}
              to={i.to}
              style={{ animationDelay: `${idx * 40}ms` }}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl animate-rise transition-all duration-300 hover:translate-x-1 ${
                active
                  ? accent === "gold"
                    ? "bg-primary/10 ring-1 ring-primary/40 glow-gold"
                    : "bg-white/8 ring-1 ring-white/15"
                  : "hover:bg-white/5"
              }`}
            >
              <div className={`size-8 rounded-lg grid place-items-center transition ${active ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground group-hover:text-foreground"}`}>
                <i.icon className="size-4" />
              </div>
              <span className={`text-sm flex-1 ${active ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>{i.label}</span>
              {i.badge ? (
                <span className="size-5 grid place-items-center rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold text-white shadow-[0_0_8px_oklch(0.65_0.22_300_/_0.7)]">
                  {i.badge}
                </span>
              ) : null}
              {active && <span className="absolute right-2 size-1.5 rounded-full bg-primary animate-glow-pulse" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
