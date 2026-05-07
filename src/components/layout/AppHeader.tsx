import { Menu, Search, Bell, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { currentUser } from "@/lib/mock-data";
import { toast } from "sonner";
import { NotificationsPopover } from "./NotificationsPopover";

const tabs = [
  { id: "for-you", label: "For You" },
  { id: "following", label: "Following" },
  { id: "latest", label: "Latest" },
  { id: "prescribe", label: "Prescribe Me" },
] as const;

export function AppHeader({
  activeTab = "for-you",
  onTabChange,
  onMenuClick,
}: {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  onMenuClick?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
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

        <Link
          to="/"
          className="shrink-0 relative group"
          aria-label="Trey TV home"
        >
          {/* Aurora glow halo */}
          <span
            aria-hidden
            className="absolute inset-0 -m-3 rounded-full blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
          />
          {/* Inner soft glow */}
          <span
            aria-hidden
            className="absolute inset-0 -m-1 rounded-full bg-primary/30 blur-xl animate-glow-pulse"
          />
          <Logo className="relative h-20 transition-transform duration-500 group-hover:scale-110 group-active:scale-95 drop-shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.7)]" />
        </Link>

        <div className="flex items-center gap-2">
          <button onClick={() => navigate({ to: "/explore" })} aria-label="Search" className="size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition">
            <Search className="size-5" />
          </button>
          <button onClick={() => navigate({ to: "/inbox" })} aria-label="Notifications" className="relative size-10 grid place-items-center rounded-xl glass hover:bg-white/5 transition">
            <Bell className="size-5" />
            <span className="absolute -top-1 -right-1 size-5 rounded-full bg-[oklch(0.65_0.22_300)] text-[10px] font-bold grid place-items-center text-white shadow-[0_0_10px_oklch(0.65_0.22_300_/_0.8)]">8</span>
          </button>
          <Link to="/u/$uid" params={{ uid: currentUser.uid }} className="relative size-10 rounded-full conic-ring shrink-0">
            <img src={currentUser.avatar} alt="profile" className="size-full rounded-full object-cover" loading="lazy" />
          </Link>
        </div>
      </div>

      <nav className="flex items-center gap-1 px-2 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((t) => {
          const active = computed === t.id;
          const handleClick = () => {
            if (t.id === "prescribe") {
              navigate({ to: "/prescribe-me" });
            } else {
              if (location.pathname !== "/") navigate({ to: "/" });
              onTabChange?.(t.id);
            }
          };
          return (
            <button
              key={t.id}
              onClick={handleClick}
              className={`relative px-3 py-2 text-sm whitespace-nowrap transition ${
                active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {active && (
                <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-primary shadow-[0_0_8px_oklch(0.82_0.16_85_/_0.9)]" />
              )}
            </button>
          );
        })}
        <button onClick={() => toast("Filters coming soon")} className="ml-auto size-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground" aria-label="Filters">
          <SlidersHorizontal className="size-5" />
        </button>
      </nav>
    </header>
  );
}
