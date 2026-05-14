import { useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "./AppHeader";
import { SideMenu } from "./SideMenu";
import { DesktopTopNav } from "./DesktopTopNav";

export function AppShell({
  children,
  activeTab,
  onTabChange,
  wide = false,
}: {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  /** When true, content area uses full desktop width (e.g. dashboards). */
  wide?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipeRoutes = ["/", "/for-you", "/explore", "/guide", "/prescribe-me", "/rewards", "/games"];
  const currentSwipeIndex = swipeRoutes.findIndex((route) => route === "/" ? location.pathname === "/" : location.pathname.startsWith(route));
  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || currentSwipeIndex < 0) return;
    const touch = event.changedTouches[0];
    if (!touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < 70 || Math.abs(dx) < Math.abs(dy) * 1.25) return;
    const nextIndex = dx < 0 ? currentSwipeIndex + 1 : currentSwipeIndex - 1;
    const nextRoute = swipeRoutes[nextIndex];
    if (nextRoute) navigate({ to: nextRoute as any });
  };
  return (
    <div
      className="app-shell trey-tv-shell mobile-shell relative min-h-screen min-h-[100dvh] w-full overflow-x-hidden bg-[#05070D]"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (touch) touchStart.current = { x: touch.clientX, y: touch.clientY };
      }}
      onTouchEnd={onTouchEnd}
    >
      {/* Desktop top navigation (lg+) */}
      <DesktopTopNav />

      <div
        className={`relative mx-auto w-full max-w-none ${
          wide
            ? "lg:max-w-[1400px] 2xl:max-w-[1600px]"
            : "lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px]"
        }`}
      >
        {/* Mobile-only header */}
        <div className="lg:hidden">
          <AppHeader activeTab={activeTab} onTabChange={onTabChange} onMenuClick={() => setMenuOpen(true)} />
        </div>
        <main
          className="relative z-10 px-0 sm:px-3 lg:px-8 xl:px-10 2xl:px-12 pt-1 sm:pt-3 lg:pt-8 xl:pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:!pb-16"
          style={{ overflowAnchor: "none" }}
        >
          {children}
        </main>
      </div>

      <div className="lg:hidden">
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </div>
  );
}
