import { Compass, CalendarDays, Plus, Sparkles, Tv } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { currentUser } from "@/lib/mock-data";

export function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <nav
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        transform: "translate3d(-50%, 0, 0)",
        zIndex: 9999,
        width: "min(calc(100vw - 1.5rem), 28rem)",
        contain: "layout paint style",
        backfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      <div className="rounded-3xl glass-strong border border-white/10 shadow-[0_-10px_40px_-10px_oklch(0_0_0_/_0.7)]">
        <div className="flex items-center justify-between px-3 pt-2 pb-1 relative overflow-visible">
          <NavItem to="/" icon={Tv} label="Watch" active={isActive("/")} />
          <NavItem to="/for-you" icon={Sparkles} label="For You" active={isActive("/for-you")} />

          <div className="flex-1 flex justify-center" style={{ overflow: "visible" }}>
            <Link
              to="/create"
              aria-label="Create"
              style={{ marginTop: "-1.75rem", position: "relative", zIndex: 1 }}
              className="size-16 rounded-full grid place-items-center bg-background border-2 border-primary text-primary glow-gold animate-glow-pulse"
            >
              <Plus className="size-7" />
            </Link>
          </div>

          <NavItem to="/explore" icon={Compass} label="Discover" active={isActive("/explore")} />
          <NavItem to="/guide" icon={CalendarDays} label="Guide" active={isActive("/guide")} />
          <ProfileItem active={pathname.startsWith("/u/")} />
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  to,
  icon: Icon,
  label,
  active,
  badge,
}: {
  to: string;
  icon: typeof Tv;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link to={to} className="relative flex flex-col items-center gap-1 flex-1 py-1.5 min-w-0">
      <div
        className="relative grid place-items-center size-9 rounded-xl"
        style={{
          color: active ? "var(--color-primary)" : "var(--color-muted-foreground)",
          background: active ? "oklch(0.82 0.16 85 / 0.15)" : "transparent",
          boxShadow: active ? "var(--shadow-gold)" : "none",
        }}
      >
        <Icon className="size-5" />
        {badge ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold grid place-items-center text-primary-foreground">
            {badge}
          </span>
        ) : null}
      </div>
      <span
        className="text-[10px]"
        style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
    </Link>
  );
}

function ProfileItem({ active }: { active: boolean }) {
  return (
    <Link
      to="/u/$uid"
      params={{ uid: currentUser.uid }}
      className="relative flex flex-col items-center gap-1 flex-1 py-1.5 min-w-0"
    >
      <div
        className="relative size-9 rounded-full overflow-hidden"
        style={{
          boxShadow: active
            ? "0 0 0 2px var(--gold), 0 0 12px oklch(0.82 0.16 85 / 0.55)"
            : "0 0 0 1px oklch(1 0 0 / 15%)",
        }}
      >
        <img src={currentUser.avatar} alt="" className="size-full rounded-full object-cover" />
      </div>
      <span
        className="text-[10px]"
        style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
      >
        Profile
      </span>
    </Link>
  );
}
