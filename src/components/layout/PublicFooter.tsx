import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { SUPPORT_CONTACT } from "@/lib/legal-content";

const links = [
  { to: "/about", label: "About" },
  { to: "/legal/terms", label: "Terms" },
  { to: "/legal/privacy", label: "Privacy" },
  { to: "/legal/community-guidelines", label: "Community Guidelines" },
  { to: "/legal/dmca", label: "Copyright" },
  { to: "/legal/accessibility", label: "Accessibility" },
  { to: "/legal", label: "Legal Hub" },
];

export function PublicFooter() {
  return (
    <footer className="mt-12 rounded-[28px] liquid-glass border border-white/10 p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="flex items-center gap-3">
          <Logo className="h-8" />
          <div>
            <div className="text-sm font-bold">Trey TV</div>
            <div className="text-[11px] text-muted-foreground">Creator-first entertainment.</div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to as any}
              className="text-muted-foreground hover:text-foreground transition"
            >
              {l.label}
            </Link>
          ))}
          <span className="text-muted-foreground">
            Support: <span className="text-foreground/70">{SUPPORT_CONTACT}</span>
          </span>
        </nav>
      </div>
      <div className="mt-5 pt-4 border-t border-white/5 text-[11px] text-muted-foreground flex flex-wrap items-center justify-between gap-2">
        <span>© {new Date().getFullYear()} Trey TV. All rights reserved.</span>
        <span>Made for creators and the people who love them.</span>
      </div>
    </footer>
  );
}
