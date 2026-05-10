import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Search, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { LegalHubCard } from "@/components/legal/LegalHubCard";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { POLICY_INDEX, LEGAL_LAST_UPDATED } from "@/lib/legal-content";

export const Route = createFileRoute("/legal/")({
  component: LegalHub,
  head: () => ({
    meta: [
      { title: "Legal & Safety — Trey TV" },
      { name: "description", content: "Trey TV's legal and safety center: terms, privacy, community guidelines, content policy, and more." },
      { property: "og:title", content: "Legal & Safety — Trey TV" },
      { property: "og:description", content: "Trey TV's trust and safety center." },
    ],
  }),
});

const CATEGORIES: { id: "core" | "user" | "creator" | "ai" | "support"; label: string }[] = [
  { id: "core", label: "Core" },
  { id: "user", label: "Community" },
  { id: "creator", label: "Creators" },
  { id: "ai", label: "AI" },
  { id: "support", label: "Support" },
];

function LegalHub() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "core" | "user" | "creator" | "ai" | "support">("all");
  const filtered = POLICY_INDEX.filter((p) => {
    if (tab !== "all" && p.category !== tab) return false;
    if (!q.trim()) return true;
    const needle = q.toLowerCase();
    return p.title.toLowerCase().includes(needle) || p.summary.toLowerCase().includes(needle);
  });

  return (
    <AppShell wide>
      <div className="pb-8">
        {/* Hero */}
        <div className="relative overflow-hidden rounded-[28px] liquid-glass neon-border p-6 lg:p-10 mb-6">
          <div aria-hidden className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 left-1/3 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.25),oklch(0.7_0.25_340_/_0.2),oklch(0.82_0.15_215_/_0.25),oklch(0.82_0.16_85_/_0.25))] blur-3xl opacity-50" />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass border border-white/15 text-[10px] tracking-[0.22em]">
              <ShieldCheck className="size-3 text-primary" /> TRUST & SAFETY
            </div>
            <h1 className="font-display mt-3 text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight bg-gradient-to-br from-white via-white/85 to-white/55 bg-clip-text text-transparent">
              Legal & Safety
            </h1>
            <p className="mt-3 text-sm sm:text-base text-foreground/70 max-w-2xl">
              How Trey TV works, what we expect, and the rights you have. Browse policies, request data actions, and learn how we keep the community welcoming.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground">
                <Sparkles className="size-3 text-primary" /> Last updated: {LEGAL_LAST_UPDATED}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full liquid-glass border border-white/10 text-muted-foreground">
                <FileText className="size-3" /> {POLICY_INDEX.length} policies
              </span>
            </div>

            {/* Search + tabs */}
            <div className="mt-6 grid sm:grid-cols-[1fr_auto] gap-3 items-stretch">
              <label className="relative flex items-center gap-2 rounded-2xl liquid-glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition">
                <Search className="size-4 text-muted-foreground" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search policies…"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
              </label>
              <div className="flex flex-wrap gap-1.5">
                <Chip active={tab === "all"} onClick={() => setTab("all")}>All</Chip>
                {CATEGORIES.map((c) => (
                  <Chip key={c.id} active={tab === c.id} onClick={() => setTab(c.id)}>
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <ActionTile to="/legal/data-deletion" title="Data request" body="Delete, export, or correct your data." accent="gold" />
          <ActionTile to="/legal/community-guidelines" title="Report content" body="See what's allowed and how to flag violations." accent="cyan" />
          <ActionTile to="/legal/dmca" title="Copyright complaint" body="File a DMCA takedown notice." accent="magenta" />
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => (
            <LegalHubCard key={p.slug} slug={p.slug} title={p.title} summary={p.summary} icon={p.icon} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-sm text-muted-foreground py-10 rounded-2xl liquid-glass border border-white/10">
              No policies match that search.
            </div>
          )}
        </div>

        <PublicFooter />
      </div>
    </AppShell>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-9 rounded-full text-xs font-semibold border transition ${
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-white/10 text-foreground/70 hover:border-white/25 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ActionTile({ to, title, body, accent }: { to: string; title: string; body: string; accent: "gold" | "cyan" | "magenta" }) {
  const accents: Record<string, string> = {
    gold: "from-[oklch(0.82_0.16_85/0.18)] to-transparent border-[oklch(0.82_0.16_85/0.35)]",
    cyan: "from-[oklch(0.82_0.15_215/0.18)] to-transparent border-[oklch(0.82_0.15_215/0.35)]",
    magenta: "from-[oklch(0.7_0.25_340/0.18)] to-transparent border-[oklch(0.7_0.25_340/0.35)]",
  };
  return (
    <Link
      to={to as any}
      className={`relative block rounded-2xl border bg-gradient-to-br ${accents[accent]} p-5 hover:translate-y-[-1px] transition-all`}
    >
      <div className="text-xs tracking-[0.18em] text-muted-foreground">QUICK ACTION</div>
      <div className="mt-1 text-base font-bold">{title}</div>
      <div className="mt-1 text-xs text-foreground/70">{body}</div>
    </Link>
  );
}
