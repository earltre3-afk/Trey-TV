import { useState, type ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { SideMenu } from "./SideMenu";
import { DesktopSidebar } from "./DesktopSidebar";

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
      <DesktopSidebar />

      <div className="lg:pl-[260px] xl:pl-[280px]">
        <div
          className={`relative mx-auto ${
            wide
              ? "max-w-[1400px] 2xl:max-w-[1600px]"
              : "max-w-[520px] lg:max-w-[820px] xl:max-w-[900px] 2xl:max-w-[960px]"
          }`}
        >
          {/* Mobile-only header */}
          <div className="lg:hidden">
            <AppHeader activeTab={activeTab} onTabChange={onTabChange} onMenuClick={() => setMenuOpen(true)} />
          </div>
          <main
            className="relative z-10 px-3 lg:px-8 xl:px-10 2xl:px-12 pt-3 lg:pt-8 xl:pt-10 lg:pb-12"
            style={{
              paddingBottom: "calc(6rem + env(safe-area-inset-bottom))",
              overflowAnchor: "none",
            }}
          >
            {children}
          </main>
        </div>
      </div>

      <div className="lg:hidden">
        <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </div>
    </div>
  );
}
