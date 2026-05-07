import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Crown, ArrowRight, Upload, Eye } from "lucide-react";

export const Route = createFileRoute("/creator-studio/submitted")({
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) || undefined }),
  component: Submitted,
  head: () => ({
    meta: [
      { title: "Submitted for Review — Trey TV" },
      { name: "description", content: "Your episode has been submitted for admin approval." },
    ],
  }),
});

function Submitted() {
  const { id } = useSearch({ from: "/creator-studio/submitted" });
  return (
    <main className="min-h-screen grid place-items-center px-4 bg-background">
      <div className="relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden">
        <div className="absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.78_0.18_150_/_0.4),transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-20 -left-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.65_0.22_300_/_0.35),transparent_70%)] blur-2xl" />
        <div className="relative">
          <div className="mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4">
            <CheckCircle2 className="size-8 text-[oklch(0.82_0.18_150)]" />
          </div>
          <div className="text-[10px] tracking-[0.3em] text-primary mb-1 flex items-center justify-center gap-2">
            <Crown className="size-3.5" /> SUBMITTED
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold">Off to the admins</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Your episode has been submitted for admin approval. You'll be notified when it's approved, rejected, or needs changes.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            <Link to="/creator-studio/submissions" className="px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold flex items-center justify-center gap-2">
              <Eye className="size-4" /> View Submission Status
            </Link>
            <Link to="/creator-studio/edit" className="px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 flex items-center justify-center gap-2">
              <Upload className="size-4" /> Upload Another Episode
            </Link>
            <Link to="/creator-hub" className="px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10 flex items-center justify-center gap-2">
              Back to Creator Hub <ArrowRight className="size-4" />
            </Link>
          </div>
          {id && <div className="mt-4 text-[10px] text-muted-foreground">ID: {id}</div>}
        </div>
      </div>
    </main>
  );
}
