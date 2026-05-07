import { Menu, Search, Bell, SlidersHorizontal } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Link, useLocation } from "@tanstack/react-router";
import { currentUser } from "@/lib/mock-data";

const tabs = [
  { id: "for-you", label: "For You", to: "/" },
  { id: "following", label: "Following", to: "/" },
  { id: "latest", label: "Latest", to: "/" },
  { id: "prescribe", label: "Prescribe Me", to: "/prescribe-me" },
] as const;

export function AppHeader({
  activeTab = "for-you",
  onMenuClick,
}: {
  activeTab?: string;
  onMenuClick?: () => void;
}) {
  const location = useLocation();
  const computed =
    location.pathname === "/prescribe-me" ? "prescribe" : activeTab;

  return (
    <header className="sticky top-0 z-30 w-full glass-strong border-b border-white/5">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <button
          onClick={onMenuClick}
          aria-label="Open menu"
          className="size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition"
        >
          <Menu className="size-5" />
        </button>

        <Link to="/" className="shrink-0"><Logo className="h-14" /></Link>

        <div className="flex items-center gap-2">
          <button aria-label="Search" className="size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition">
            <Search className="size-5" />
          </button>
          <button aria-label="Notifications" className="relative size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition">
            <Bell className="size-5" />
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold grid place-items-center text-white shadow-[0_0_10px_oklch(0.65_0.22_300_/_0.8)]">8</span>
          </button>
          <Link to="/u/$uid" params={{ uid: currentUser.uid }} className="size-10 rounded-full overflow-hidden ring-neon-purple shrink-0">
            <img src={currentUser.avatar} alt="profile" className="size-full object-cover" loading="lazy" />
          </Link>
        </div>
      </div>

      <nav className="flex items-center gap-1 px-2 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const active = computed === t.id || (computed === "for-you" && t.id === "for-you" && location.pathname === "/");
          return (
            <Link
              key={t.id}
              to={t.to}
              className={`relative px-3 py-2 text-sm whitespace-nowrap transition ${
                active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {active && (
                <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" />
              )}
            </Link>
          );
        })}
        <button className="ml-auto size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground" aria-label="Filters">
          <SlidersHorizontal className="size-5" />
        </button>
      </nav>
    </header>
  );
}
