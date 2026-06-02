import { Compass, CalendarDays, Home, Inbox, Sparkles, LogIn } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { currentUser } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { haptic } from "@/lib/haptics";
import { CreateWheel } from "./CreateWheel";

export function BottomNav() {
  const { pathname } = useLocation();
  const { isGuest, user } = useAuth();
  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const profileUid = user?.uid ?? currentUser.uid;
  const profileAvatar = user?.avatar ?? currentUser.avatar;
  const onProfile = pathname.startsWith("/u/");

  const hideNav = pathname.startsWith("/apply/") || pathname.startsWith("/onboarding/") || pathname.startsWith("/music-review") || pathname.startsWith("/tradio");
  if (hideNav) return null;

  return (
    <nav
      className="bottom-nav mobile-bottom-nav lg:hidden"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        transform: "translate3d(0, 0, 0)",
        zIndex: 9999,
        width: "100vw",
        contain: "layout style",
        backfaceVisibility: "hidden",
        willChange: "transform",
        paddingTop: "1.75rem",
        paddingLeft: "max(env(safe-area-inset-left), 0.25rem)",
        paddingRight: "max(env(safe-area-inset-right), 0.25rem)",
        background: "#05070D",
      }}
    >
      <div className="rounded-t-3xl rounded-b-none glass-strong border-x-0 border-b-0 border-t border-white/10 shadow-[0_-10px_40px_-10px_oklch(0_0_0_/_0.7)] overflow-visible">
        {isGuest ? (
          <div className="grid grid-cols-5 items-center px-2 pt-2 pb-1 relative overflow-visible">
            <NavItem to="/" icon={Home} label="Home" active={isActive("/")} />
            <NavItem to="/explore" icon={Compass} label="Discover" active={isActive("/explore")} />
            <div className="flex justify-center"><CreateWheel /></div>
            <NavItem to="/guide" icon={CalendarDays} label="Guide" active={isActive("/guide")} />
            <NavItem to="/signup" icon={LogIn} label="Sign up" active={isActive("/login") || isActive("/signup")} />
          </div>
        ) : (
          <div className="grid grid-cols-7 items-center px-2 pt-2 pb-1 relative overflow-visible">
            <NavItem to="/" icon={Home} label="Home" active={isActive("/")} />
            <NavItem to="/for-you" icon={Sparkles} label="For You" active={isActive("/for-you")} />
            <NavItem to="/explore" icon={Compass} label="Discover" active={isActive("/explore")} />
            <div className="flex justify-center"><CreateWheel /></div>
            <NavItem to="/guide" icon={CalendarDays} label="Guide" active={isActive("/guide")} />
            <NavItem to="/inbox" icon={Inbox} label="Inbox" active={isActive("/inbox")} badge={8} />
            <ProfileItem active={onProfile} uid={profileUid} avatar={profileAvatar} />
          </div>
        )}
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
  icon: typeof Home;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      to={to}
      onPointerDown={() => haptic(active ? "light" : "selection")}
      className="group relative flex flex-col items-center justify-center gap-1 min-w-0 -my-2 py-3 px-1 rounded-2xl touch-manipulation select-none active:scale-[0.96] transition-transform"
      style={{ WebkitTapHighlightColor: "transparent", minHeight: 56 }}
      aria-label={label}
    >
      <div
        className="relative grid place-items-center size-10 rounded-xl transition-colors"
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
        className="text-[10px] leading-none"
        style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
      >
        {label}
      </span>
    </Link>
  );
}

function ProfileItem({ active, uid, avatar }: { active: boolean; uid: string; avatar: string }) {
  return (
    <Link
      to="/u/$uid"
      params={{ uid }}
      onPointerDown={() => haptic(active ? "light" : "selection")}
      className="group relative flex flex-col items-center justify-center gap-1 min-w-0 -my-2 py-3 px-1 rounded-2xl touch-manipulation select-none active:scale-[0.96] transition-transform"
      style={{ WebkitTapHighlightColor: "transparent", minHeight: 56 }}
      aria-label="Profile"
    >
      <div
        className="relative size-10 rounded-full overflow-hidden"
        style={{
          boxShadow: active
            ? "0 0 0 2px var(--gold), 0 0 12px oklch(0.82 0.16 85 / 0.55)"
            : "0 0 0 1px oklch(1 0 0 / 15%)",
        }}
      >
        <img src={avatar || undefined} alt="" className="size-full rounded-full object-cover" />
      </div>
      <span
        className="text-[10px] leading-none"
        style={{ color: active ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
      >
        Profile
      </span>
    </Link>
  );
}
