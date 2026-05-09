import { Home, Compass, Inbox, User, Plus } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { currentUser } from "@/lib/mock-data";

export function BottomNav() {
  const { pathname } = useLocation();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));

  return (
    <nav 
      className="fixed z-40"
      style={{
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 0,
        width: "100%",
        maxWidth: "520px",
      }}
    >
      <div 
        className="rounded-t-3xl glass-strong border-t border-x border-white/10 shadow-[0_-10px_40px_-10px_oklch(0_0_0_/_0.7)]"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-end justify-between px-3 pt-2 pb-1 relative">
          <NavItem to="/" icon={Home} label="Home" active={isActive("/")} />
          <NavItem to="/explore" icon={Compass} label="Explore" active={isActive("/explore")} />

          <div className="flex-1 flex justify-center">
            <Link
              to="/create"
              aria-label="Create"
              className="-mt-7 size-16 rounded-full grid place-items-center bg-background border-2 border-primary text-primary glow-gold animate-glow-pulse"
            >
              <Plus className="size-7" />
            </Link>
          </div>

          <NavItem to="/inbox" icon={Inbox} label="Inbox" active={isActive("/inbox")} badge={7} />
          <ProfileItem active={pathname.startsWith("/u/")} />
        </div>
      </div>
    </nav>
  );
}

function NavItem({ to, icon: Icon, label, active, badge }: { to: string; icon: typeof Home; label: string; active: boolean; badge?: number }) {
  return (
    <Link to={to} className="relative flex flex-col items-center gap-1 flex-1 py-1.5">
      <div className={`relative grid place-items-center size-9 rounded-xl transition ${active ? "bg-primary/15 text-primary glow-gold" : "text-muted-foreground"}`}>
        <Icon className="size-5" />
        {badge ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-[10px] font-bold grid place-items-center text-primary-foreground">{badge}</span>
        ) : null}
      </div>
      <span className={`text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>{label}</span>
    </Link>
  );
}

function ProfileItem({ active }: { active: boolean }) {
  return (
    <Link to="/u/$uid" params={{ uid: currentUser.uid }} className="relative flex flex-col items-center gap-1 flex-1 py-1.5">
      <div className={`relative size-9 rounded-full ${active ? "conic-ring" : "ring-1 ring-white/15"}`}>
        <img src={currentUser.avatar} alt="" className="size-full rounded-full object-cover" />
      </div>
      <span className={`text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>Profile</span>
    </Link>
  );
}
