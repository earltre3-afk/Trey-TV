import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mic, Sparkles, ArrowRight, Wand2, Compass, Crown, Eye } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({
    meta: [
      { title: "Welcome to Trey TV" },
      { name: "description", content: "Choose your path into the Trey TV universe — voice setup with Trey-I or manual signup." },
    ],
  }),
});

function Onboarding() {
  const nav = useNavigate();
  const { signIn } = useAuth();

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Cinematic backdrop */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[80vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.45),oklch(0.7_0.25_340_/_0.4),oklch(0.65_0.22_300_/_0.45),oklch(0.82_0.15_215_/_0.4),oklch(0.82_0.16_85_/_0.45))] blur-3xl opacity-70 animate-conic-spin" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 lg:px-8 pt-10 pb-16">
        <div className="text-center space-y-3 animate-rise">
          <Logo className="h-20 mx-auto" />
          <div className="text-[10px] tracking-[0.4em] text-primary">ENTER THE UNIVERSE</div>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            Choose your path into <span className="text-gradient-prescribe">Trey TV</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Talk it out with Trey-I or set things up the classic way. Either road takes you to the same premium universe.
          </p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-5">
          {/* Voice path */}
          <button
            onClick={() => nav({ to: "/onboarding/voice" })}
            className="group relative text-left rounded-3xl liquid-glass liquid-hover neon-border overflow-hidden p-6 sm:p-8"
          >
            <div className="absolute -top-16 -right-16 size-56 rounded-full bg-[oklch(0.7_0.25_340_/_0.35)] blur-3xl group-hover:bg-[oklch(0.7_0.25_340_/_0.5)] transition" />
            <div className="relative">
              <div className="size-14 rounded-2xl conic-ring grid place-items-center bg-background">
                <Mic className="size-6 text-primary" />
              </div>
              <div className="mt-4 text-[10px] tracking-[0.3em] text-primary">RECOMMENDED · VOICE</div>
              <h3 className="mt-1 text-2xl font-bold">Setup with Trey-I</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Have a natural conversation. Trey-I asks the right questions and builds your profile while you talk.
                Cinematic, fast, and zero forms.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Sparkles className="size-3 text-primary" /> Voice-first onboarding</li>
                <li className="flex items-center gap-2"><Wand2 className="size-3 text-[oklch(0.7_0.25_340)]" /> Auto-generated bio + accent</li>
                <li className="flex items-center gap-2"><Eye className="size-3 text-[oklch(0.82_0.15_215)]" /> Live profile preview</li>
              </ul>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold text-sm glow-gold">
                Start voice setup <ArrowRight className="size-4" />
              </div>
            </div>
          </button>

          {/* Manual path */}
          <button
            onClick={() => nav({ to: "/login" })}
            className="group relative text-left rounded-3xl liquid-glass liquid-hover neon-border overflow-hidden p-6 sm:p-8"
          >
            <div className="absolute -top-16 -right-16 size-56 rounded-full bg-[oklch(0.82_0.15_215_/_0.3)] blur-3xl group-hover:bg-[oklch(0.82_0.15_215_/_0.5)] transition" />
            <div className="relative">
              <div className="size-14 rounded-2xl border border-white/15 grid place-items-center bg-white/5">
                <Compass className="size-6 text-[oklch(0.82_0.15_215)]" />
              </div>
              <div className="mt-4 text-[10px] tracking-[0.3em] text-[oklch(0.82_0.15_215)]">CLASSIC · MANUAL</div>
              <h3 className="mt-1 text-2xl font-bold">Manual Setup</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The familiar flow. Enter your info, upload a photo, pick your interests, finish setup. Just polished.
              </p>
              <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><Sparkles className="size-3 text-[oklch(0.82_0.15_215)]" /> Step-by-step form</li>
                <li className="flex items-center gap-2"><Crown className="size-3 text-primary" /> Choose your role on signup</li>
                <li className="flex items-center gap-2"><Eye className="size-3 text-[oklch(0.7_0.25_340)]" /> Visual preview at the end</li>
              </ul>
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full liquid-glass border border-white/15 font-semibold text-sm">
                Sign up manually <ArrowRight className="size-4" />
              </div>
            </div>
          </button>
        </div>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
          <span className="mx-2">·</span>
          <button onClick={() => { signIn("user"); nav({ to: "/" }); }} className="hover:text-foreground underline">Continue as demo viewer</button>
        </div>
      </div>
    </div>
  );
}
