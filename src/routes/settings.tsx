import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { currentUser } from "@/lib/mock-data";
import { VerifiedBadge } from "@/components/brand/Badge";
import {
  Settings as SettingsIcon, User, Bell, Lock, Palette, CreditCard, Shield,
  Globe, LogOut, ChevronRight, Sparkles, Crown, Wand2, Mail, Smartphone, FileText,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  head: () => ({
    meta: [
      { title: "Settings — Trey TV" },
      { name: "description", content: "Manage your Trey TV account, appearance, notifications and privacy." },
    ],
  }),
});

const sections = [
  { id: "account", label: "Account", icon: User, color: "oklch(0.82 0.16 85)" },
  { id: "appearance", label: "Appearance", icon: Palette, color: "oklch(0.7 0.25 340)" },
  { id: "notifications", label: "Notifications", icon: Bell, color: "oklch(0.82 0.15 215)" },
  { id: "privacy", label: "Privacy & Safety", icon: Shield, color: "oklch(0.65 0.22 300)" },
  { id: "billing", label: "Billing", icon: CreditCard, color: "oklch(0.78 0.18 150)" },
  { id: "language", label: "Language & Region", icon: Globe, color: "oklch(0.82 0.15 215)" },
  { id: "legal", label: "Legal & Safety", icon: FileText, color: "oklch(0.82 0.16 85)" },
];

const LEGAL_LINKS: { to: string; label: string; desc: string }[] = [
  { to: "/legal", label: "Legal Hub", desc: "Browse every Trey TV policy in one place." },
  { to: "/legal/terms", label: "Terms of Service", desc: "The agreement between you and Trey TV." },
  { to: "/legal/privacy", label: "Privacy Policy", desc: "What we collect and how it's used." },
  { to: "/legal/community-guidelines", label: "Community Guidelines", desc: "How we keep Trey TV safe." },
  { to: "/legal/data-deletion", label: "Data Deletion", desc: "Request deletion, export, or correction." },
  { to: "/legal/dmca", label: "Copyright / DMCA", desc: "File a copyright complaint." },
  { to: "/legal/ai-disclosure", label: "AI Disclosure", desc: "How Trey-I works and its limits." },
];

type Toggle = { id: string; label: string; desc: string; icon: typeof Bell; on: boolean };

function SettingsPage() {
  const [active, setActive] = useState<string>("account");
  const [theme, setTheme] = useState<"midnight" | "aurora" | "gold">("midnight");
  const [accent, setAccent] = useState<"gold" | "magenta" | "cyan" | "purple">("gold");
  const [toggles, setToggles] = useState<Toggle[]>([
    { id: "live", label: "Live Alerts", desc: "Notify me when followed creators go live", icon: Sparkles, on: true },
    { id: "drops", label: "New Episode Drops", desc: "Push when new episodes are released", icon: Wand2, on: true },
    { id: "email", label: "Weekly Email", desc: "Highlights, stats and creator picks", icon: Mail, on: false },
    { id: "sms", label: "SMS for Streams", desc: "Text me before tonight's show starts", icon: Smartphone, on: false },
  ]);

  const flip = (id: string) => setToggles((t) => t.map((x) => (x.id === id ? { ...x, on: !x.on } : x)));

  return (
    <AppShell wide>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="text-[10px] tracking-[0.3em] text-primary flex items-center gap-2"><SettingsIcon className="size-3.5" /> SETTINGS</div>
          <h1 className="text-2xl md:text-4xl font-bold mt-1"><span className="text-gradient-gold">Control Center</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Tune Trey TV exactly the way you want it.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
          {/* Side nav */}
          <nav className="rounded-3xl glass neon-border p-3 h-fit lg:sticky lg:top-6">
            {sections.map((s, i) => {
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  style={{ animationDelay: `${i * 50}ms` }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl animate-rise text-left transition-all duration-300 hover:translate-x-1 ${
                    isActive ? "bg-white/10 ring-1 ring-white/15" : "hover:bg-white/5"
                  }`}
                >
                  <div className="size-8 rounded-lg grid place-items-center" style={{ background: `${s.color.replace(")", " / 0.15)")}` }}>
                    <s.icon className="size-4" style={{ color: s.color }} />
                  </div>
                  <span className={`text-sm flex-1 ${isActive ? "font-semibold" : "text-muted-foreground"}`}>{s.label}</span>
                  <ChevronRight className={`size-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                </button>
              );
            })}
            <div className="mt-3 pt-3 border-t border-white/5 px-1">
              <button onClick={() => toast("Logged out (demo)")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-destructive/10 text-destructive">
                <LogOut className="size-4" /> <span className="text-sm">Sign out</span>
              </button>
            </div>
          </nav>

          {/* Panel */}
          <div className="space-y-4">
            {active === "account" && (
              <div className="space-y-4 animate-fade-in">
                <Panel>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="relative size-20 rounded-full conic-ring shrink-0">
                      <img src={currentUser.avatar} className="size-20 rounded-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-lg font-semibold flex items-center gap-1">{currentUser.name} <VerifiedBadge kind="creator" /></div>
                      <div className="text-xs text-muted-foreground">@{currentUser.handle} · UID {currentUser.uid}</div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-full border border-primary/40 text-primary bg-primary/10"><Crown className="size-3" /> Creator Tier</div>
                    </div>
                    <button onClick={() => toast.success("Avatar uploader opened")} className="px-4 py-2 rounded-xl text-sm border border-primary text-primary glow-gold hover-lift tilt-press">Change avatar</button>
                  </div>
                </Panel>

                <Panel>
                  <FieldRow label="Display name" value={currentUser.name} />
                  <FieldRow label="Username" value={`@${currentUser.handle}`} />
                  <FieldRow label="Bio" value={currentUser.bio.split("\n")[0]} />
                  <FieldRow label="Location" value={currentUser.location} />
                  <FieldRow label="Website" value={currentUser.link} last />
                </Panel>

                <Panel>
                  <Row icon={Lock} title="Two-Factor Authentication" desc="Extra layer of security on sign-in" action={<button onClick={() => toast.success("2FA enabled")} className="px-3 py-1.5 rounded-lg text-xs border border-primary text-primary">Enable</button>} />
                  <Row icon={Mail} title="Email" desc="trey@trey.tv" action={<button className="text-xs text-primary">Change</button>} />
                  <Row icon={Smartphone} title="Connected devices" desc="3 active sessions" action={<ChevronRight className="size-4 text-muted-foreground" />} last />
                </Panel>
              </div>
            )}

            {active === "appearance" && (
              <div className="space-y-4 animate-fade-in">
                <Panel>
                  <div className="text-sm font-semibold mb-3">Theme</div>
                  <div className="grid grid-cols-3 gap-3">
                    {(["midnight", "aurora", "gold"] as const).map((t) => (
                      <button key={t} onClick={() => setTheme(t)} className={`relative rounded-2xl p-3 ring-1 ${theme === t ? "ring-primary glow-gold" : "ring-white/10"} hover-lift tilt-press text-left`}>
                        <div className={`h-16 rounded-xl mb-2 ${
                          t === "midnight" ? "bg-[radial-gradient(ellipse_at_top,oklch(0.2_0.07_290),oklch(0.1_0.02_270))]" :
                          t === "aurora" ? "bg-[linear-gradient(135deg,oklch(0.3_0.18_300),oklch(0.25_0.15_215),oklch(0.2_0.18_340))]" :
                          "bg-[linear-gradient(135deg,oklch(0.7_0.18_60),oklch(0.86_0.17_90))]"
                        }`} />
                        <div className="text-xs font-semibold capitalize">{t}</div>
                      </button>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <div className="text-sm font-semibold mb-3">Accent</div>
                  <div className="flex gap-3">
                    {([
                      { id: "gold", c: "oklch(0.82 0.16 85)" },
                      { id: "magenta", c: "oklch(0.7 0.25 340)" },
                      { id: "cyan", c: "oklch(0.82 0.15 215)" },
                      { id: "purple", c: "oklch(0.65 0.22 300)" },
                    ] as const).map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setAccent(a.id)}
                        className={`size-10 rounded-full transition hover:scale-110 ${accent === a.id ? "ring-2 ring-white/80 scale-110" : ""}`}
                        style={{ background: a.c, boxShadow: `0 0 16px ${a.c}` }}
                        aria-label={a.id}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <Row icon={Palette} title="Reduce motion" desc="Limit animations across the app" action={<Switch on={false} onClick={() => toast("Motion preference saved")} />} />
                  <Row icon={Sparkles} title="Liquid glass intensity" desc="Tune blur and translucency" action={<input type="range" defaultValue={75} className="w-32 accent-[oklch(0.82_0.16_85)]" />} last />
                </Panel>
              </div>
            )}

            {active === "notifications" && (
              <div className="space-y-4 animate-fade-in">
                <Panel>
                  {toggles.map((t, i) => (
                    <Row key={t.id} icon={t.icon} title={t.label} desc={t.desc} last={i === toggles.length - 1}
                      action={<Switch on={t.on} onClick={() => flip(t.id)} />} />
                  ))}
                </Panel>
              </div>
            )}

            {active === "privacy" && (
              <Panel>
                <Row icon={Shield} title="Private account" desc="Only approved fans can see your posts" action={<Switch on={false} onClick={() => toast("Private mode toggled")} />} />
                <Row icon={Lock} title="Block list" desc="0 accounts blocked" action={<ChevronRight className="size-4 text-muted-foreground" />} />
                <Row icon={User} title="Who can DM you" desc="Followers only" action={<ChevronRight className="size-4 text-muted-foreground" />} last />
              </Panel>
            )}

            {active === "billing" && (
              <Panel>
                <Row icon={Crown} title="Trey TV Premium" desc="Active · renews Dec 4" action={<button className="px-3 py-1.5 rounded-lg text-xs border border-primary text-primary">Manage</button>} />
                <Row icon={CreditCard} title="Payment method" desc="•••• 4242" action={<button className="text-xs text-primary">Update</button>} last />
              </Panel>
            )}

            {active === "language" && (
              <Panel>
                <Row icon={Globe} title="Language" desc="English (US)" action={<ChevronRight className="size-4 text-muted-foreground" />} />
                <Row icon={Globe} title="Region" desc="United States" action={<ChevronRight className="size-4 text-muted-foreground" />} last />
              </Panel>
            )}

            {active === "legal" && (
              <div className="space-y-4 animate-fade-in">
                <Panel>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="size-4 text-primary" />
                    <div className="text-sm font-semibold">Legal & Safety</div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {LEGAL_LINKS.map((l) => (
                      <Link key={l.to} to={l.to as any} className="group flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition">
                        <div className="size-9 rounded-lg bg-primary/15 text-primary grid place-items-center shrink-0"><FileText className="size-4" /></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold flex items-center justify-between gap-2">
                            <span>{l.label}</span>
                            <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition" />
                          </div>
                          <div className="text-[11px] text-muted-foreground">{l.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </Panel>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl glass neon-border p-4 md:p-5 hover-lift overflow-hidden relative">
      {children}
    </div>
  );
}

function Row({
  icon: Icon, title, desc, action, last,
}: { icon: typeof Bell; title: string; desc: string; action: React.ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-3 ${last ? "" : "border-b border-white/5"}`}>
      <div className="size-9 rounded-xl bg-white/5 grid place-items-center"><Icon className="size-4 text-primary" /></div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-[11px] text-muted-foreground">{desc}</div>
      </div>
      <div>{action}</div>
    </div>
  );
}

function FieldRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex items-center gap-3 py-3 ${last ? "" : "border-b border-white/5"}`}>
      <div className="text-xs text-muted-foreground w-32 shrink-0">{label}</div>
      <input defaultValue={value} className="flex-1 bg-transparent text-sm focus:outline-none border-b border-transparent focus:border-primary/40 transition pb-0.5" />
    </div>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition ${on ? "bg-primary glow-gold" : "bg-white/10"}`}
      aria-pressed={on}
    >
      <span className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform ${on ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );
}
