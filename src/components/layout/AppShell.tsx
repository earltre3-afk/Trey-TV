import { useState, type ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { SideMenu } from "./SideMenu";

export function AppShell({
  children,
  activeTab,
  onTabChange,
}: {
  children: ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="relative min-h-screen w-full max-w-[520px] mx-auto">
      <AppHeader activeTab={activeTab} onTabChange={onTabChange} onMenuClick={() => setMenuOpen(true)} />
      <main className="relative z-10 px-3 pt-3 pb-32 animate-fade-in">{children}</main>
      <BottomNav />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
