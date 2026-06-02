import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useState } from "react";
import { useSupabaseSession } from "@/lib/supabase-session";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/settings/verification")({
  component: VerificationApply,
  head: () => ({ meta: [{ title: "Apply for Gold Verification — Trey TV" }] }),
});

const CATEGORIES = [
  "music_artist",
  "content_creator",
  "influencer",
  "business",
  "public_figure",
  "athlete",
  "media_personality",
  "other",
];

function VerificationApply() {
  const { user } = useSupabaseSession();
  const nav = useNavigate();
  const [category, setCategory] = useState("content_creator");
  const [notable, setNotable] = useState("");
  const [explanation, setExplanation] = useState("");
  const [official, setOfficial] = useState("");
  const [refs, setRefs] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in to apply");
    if (!agree) return toast.error("Please confirm the information is accurate");
    setBusy(true);
    const { error } = await supabase.from("verification_applications").insert({
      user_id: user.id,
      category,
      notable_for: notable,
      explanation,
      official_links: official
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      reference_links: refs
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Application submitted");
    nav({ to: "/settings" });
  };

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="rounded-3xl liquid-glass border border-primary/30 p-5 glow-gold flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-primary/15 text-primary grid place-items-center">
            <BadgeCheck className="size-5" />
          </div>
          <div>
            <div className="text-[10px] tracking-[0.3em] text-primary">GOLD VERIFICATION</div>
            <h1 className="text-xl font-bold">Apply for Gold Verification</h1>
            <div className="text-xs text-muted-foreground">
              For notable creators, public figures, businesses, and more.
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-3xl liquid-glass border border-white/10 p-5 space-y-4"
        >
          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-transparent rounded-xl glass border border-white/10 px-3 h-10 text-sm focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-background">
                  {c.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="What are you notable for?">
            <input
              value={notable}
              onChange={(e) => setNotable(e.target.value)}
              className="w-full bg-transparent rounded-xl glass border border-white/10 px-3 h-10 text-sm focus:outline-none focus:border-primary"
            />
          </Field>
          <Field label="Explanation">
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={3}
              className="w-full bg-transparent rounded-xl glass border border-white/10 p-3 text-sm focus:outline-none focus:border-primary"
            />
          </Field>
          <Field label="Official links (one per line)">
            <textarea
              value={official}
              onChange={(e) => setOfficial(e.target.value)}
              rows={3}
              placeholder="https://yourwebsite.com&#10;https://instagram.com/you"
              className="w-full bg-transparent rounded-xl glass border border-white/10 p-3 text-sm focus:outline-none focus:border-primary"
            />
          </Field>
          <Field label="Reference links (press, streaming, etc.)">
            <textarea
              value={refs}
              onChange={(e) => setRefs(e.target.value)}
              rows={3}
              className="w-full bg-transparent rounded-xl glass border border-white/10 p-3 text-sm focus:outline-none focus:border-primary"
            />
          </Field>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5"
            />
            I confirm the submitted information and links are accurate.
          </label>
          <button
            disabled={busy}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold glow-gold disabled:opacity-60"
          >
            {busy ? "Submitting…" : "Submit application"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1">
        {label.toUpperCase()}
      </div>
      {children}
    </label>
  );
}
