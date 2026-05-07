import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Sparkles, Crown, ShieldCheck, User } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth, type Role } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [
      { title: "Log in — Trey TV" },
      { name: "description", content: "Log into your Trey TV account." },
    ],
  }),
});

function Login() {
  const nav = useNavigate();
  const { signIn } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  const quick = (r: Exclude<Role, "guest">) => { signIn(r); nav({ to: "/" }); };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-60 animate-conic-spin" />
      </div>

      <div className="relative max-w-[460px] mx-auto px-4 pt-6 pb-12">
        <Link to="/" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"><ArrowLeft className="size-4" /></Link>

        <div className="mt-6 text-center">
          <Logo className="h-16 mx-auto" />
          <h1 className="mt-2 text-2xl font-bold">Welcome back</h1>
          <div className="text-xs text-muted-foreground">Log in to keep building your universe.</div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); quick("creator"); }} className="mt-6 rounded-3xl liquid-glass border border-white/10 p-5 space-y-4">
          <label className="block">
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">EMAIL</div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
              <Mail className="size-4 text-muted-foreground" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@trey.tv" className="flex-1 bg-transparent text-sm focus:outline-none" />
            </div>
          </label>
          <label className="block">
            <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">PASSWORD</div>
            <div className="flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-10 focus-within:border-primary/50 transition">
              <Lock className="size-4 text-muted-foreground" />
              <input value={pw} onChange={(e) => setPw(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" className="flex-1 bg-transparent text-sm focus:outline-none" />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="text-muted-foreground hover:text-foreground">{showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
            </div>
          </label>
          <button type="submit" className="w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center justify-center gap-1.5">
            <Sparkles className="size-4" /> Log in
          </button>
          <div className="text-center text-xs text-muted-foreground">
            New here? <Link to="/onboarding" className="text-primary font-semibold hover:underline">Start onboarding</Link>
          </div>
        </form>

        {/* Demo quick-login (mock backend) */}
        <div className="mt-5 rounded-2xl liquid-glass border border-dashed border-white/15 p-4">
          <div className="text-[10px] tracking-[0.25em] text-muted-foreground mb-2">DEMO · QUICK LOGIN</div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => quick("user")} className="flex flex-col items-center gap-1 p-3 rounded-xl glass border border-white/10 hover:bg-white/5">
              <User className="size-4" /><span className="text-xs font-semibold">Viewer</span>
            </button>
            <button onClick={() => quick("creator")} className="flex flex-col items-center gap-1 p-3 rounded-xl glass border border-primary/40 bg-primary/10 text-primary">
              <Crown className="size-4" /><span className="text-xs font-semibold">Creator</span>
            </button>
            <button onClick={() => quick("admin")} className="flex flex-col items-center gap-1 p-3 rounded-xl glass border border-[oklch(0.7_0.25_340_/_0.5)] bg-[oklch(0.7_0.25_340_/_0.1)] text-[oklch(0.7_0.25_340)]">
              <ShieldCheck className="size-4" /><span className="text-xs font-semibold">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
