import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Crown, User, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  component: Signup,
  head: () => ({
    meta: [
      { title: "Sign up — Trey TV" },
      { name: "description", content: "Create your Trey TV account. Pick viewer or creator." },
    ],
  }),
});

function Signup() {
  const nav = useNavigate();
  const { signIn, updateUser } = useAuth();
  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [role, setRole] = useState<Exclude<Role, "guest" | "admin">>("user");
  const [form, setForm] = useState({ email: "", password: "", name: "", handle: "", bio: "" });
  const update = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    signIn(role);
    updateUser({
      name: form.name || "New User",
      handle: form.handle || form.email.split("@")[0] || "user",
      bio: form.bio || "Newly minted on Trey TV ✨",
    });
    nav({ to: "/" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-60 animate-conic-spin" />
      </div>

      <div className="relative max-w-[520px] mx-auto px-4 pt-6 pb-12">
        <div className="flex items-center justify-between">
          <Link to="/onboarding" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"><ArrowLeft className="size-4" /></Link>
          <div className="text-[10px] tracking-[0.3em] text-muted-foreground">STEP {step + 1} / 3</div>
          <div className="size-9" />
        </div>

        <div className="mt-6 text-center">
          <Logo className="h-16 mx-auto" />
          <h1 className="mt-2 text-2xl font-bold">Create your account</h1>
        </div>

        <div className="mt-6 rounded-3xl liquid-glass border border-white/10 p-5 space-y-4">
          {step === 0 && (
            <>
              <Field icon={<Mail className="size-4 text-muted-foreground" />} label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} placeholder="you@trey.tv" />
              <Field
                icon={<Lock className="size-4 text-muted-foreground" />}
                label="Password"
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(v) => update("password", v)}
                placeholder="••••••••"
                trailing={
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              />
            </>
          )}
          {step === 1 && (
            <>
              <Field icon={<User className="size-4 text-muted-foreground" />} label="Display name" value={form.name} onChange={(v) => update("name", v)} placeholder="Your name" />
              <Field icon={<span className="text-muted-foreground text-sm">@</span>} label="Username" value={form.handle} onChange={(v) => update("handle", v.replace(/\s+/g, "").toLowerCase())} placeholder="handle" />
              <label className="block">
                <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">BIO</div>
                <textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={3} className="w-full rounded-xl glass border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-none" placeholder="Tell us what you create…" />
              </label>
            </>
          )}
          {step === 2 && (
            <>
              <div className="text-[10px] tracking-[0.2em] text-muted-foreground">CHOOSE YOUR ROLE</div>
              <div className="grid grid-cols-2 gap-3">
                <RoleCard label="Viewer" desc="Watch, react, save, and follow creators." Icon={User} active={role === "user"} onClick={() => setRole("user")} />
                <RoleCard label="Creator" desc="Upload, manage shows, see analytics, earn." Icon={Crown} active={role === "creator"} onClick={() => setRole("creator")} accent />
              </div>
              <div className="text-[11px] text-muted-foreground text-center pt-2">You can switch later in Settings.</div>
            </>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            <button onClick={back} disabled={step === 0} className="px-4 h-10 rounded-xl text-sm font-semibold liquid-glass border border-white/10 disabled:opacity-40">Back</button>
            {step < 2 ? (
              <button onClick={next} className="px-4 h-10 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press flex items-center gap-1.5">
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button onClick={finish} className="px-5 h-10 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold tilt-press">Enter Trey TV</button>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Already a member? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, icon, trailing }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; icon?: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">{label.toUpperCase()}</div>
      <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
        {icon}
        <input value={value} onChange={(e) => onChange(e.target.value)} type={type} placeholder={placeholder} className="flex-1 bg-transparent text-sm focus:outline-none" />
        {trailing}
      </div>
    </label>
  );
}

function RoleCard({ label, desc, Icon, active, onClick, accent }: { label: string; desc: string; Icon: typeof User; active: boolean; onClick: () => void; accent?: boolean }) {
  return (
    <button onClick={onClick} className={`text-left p-4 rounded-2xl border transition ${active ? (accent ? "border-primary/60 bg-primary/10 glow-gold" : "border-white/40 bg-white/5") : "border-white/10 hover:bg-white/5"}`}>
      <div className={`size-9 rounded-xl grid place-items-center mb-2 ${active && accent ? "bg-primary text-primary-foreground" : "bg-white/5"}`}>
        <Icon className="size-4" />
      </div>
      <div className="text-sm font-semibold">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-0.5">{desc}</div>
    </button>
  );
}
