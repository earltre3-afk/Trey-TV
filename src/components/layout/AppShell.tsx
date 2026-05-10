import { useState, type ReactNode } from "react";
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
  return (
    <div className="relative min-h-[100svh] w-full">
      {/* Desktop top navigation (lg+) */}
      <DesktopTopNav />

      <div
        className={`relative mx-auto ${
          wide
            ? "max-w-[1400px] 2xl:max-w-[1600px]"
            : "max-w-[520px] lg:max-w-5xl xl:max-w-6xl 2xl:max-w-[1400px]"
        }`}
      >
        {/* Mobile-only header */}
        <div className="lg:hidden">
          <AppHeader activeTab={activeTab} onTabChange={onTabChange} onMenuClick={() => setMenuOpen(true)} />
        </div>
        <main
          className="relative z-10 px-3 lg:px-8 xl:px-10 2xl:px-12 pt-3 lg:pt-8 xl:pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] lg:!pb-16"
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
