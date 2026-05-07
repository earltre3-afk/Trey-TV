import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  useSubmissions, SHOWS, EPISODE_TYPES, CATEGORIES, MOOD_TAGS,
  type Submission,
} from "@/lib/submissions-store";
import { posts } from "@/lib/mock-data";
import {
  ArrowLeft, Crown, Lock, Image as ImageIcon, Play, Eye, Sparkles, Check,
  CheckCircle2, Circle, Film, Clock, Tag, Users, ShieldCheck, DollarSign, Calendar, X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/creator-studio/submit")({
  validateSearch: (s: Record<string, unknown>) => ({ id: (s.id as string) || undefined }),
  component: SubmitPage,
  head: () => ({
    meta: [
      { title: "Prepare Your Episode — Trey TV" },
      { name: "description", content: "Organize your content for Trey TV before it goes to admin review." },
    ],
  }),
});

function SubmitPage() {
  const { isGuest, isCreator, user } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/creator-studio/submit" });
  const store = useSubmissions();

  useEffect(() => { if (isGuest) navigate({ to: "/login" }); }, [isGuest, navigate]);

  // ensure draft id exists
  const [id] = useState<string>(() => {
    if (search.id) return search.id;
    return store.createDraft({
      creator_id: user?.uid ?? "",
      creator_name: user?.name ?? "Creator",
      creator_handle: user?.handle ?? "creator",
      creator_avatar: user?.avatar ?? "",
    });
  });

  const draft = store.get(id);

  if (isGuest) return null;
  if (!isCreator) return <LockedScreen />;
  if (!draft) return null;

  return <Form draft={draft} />;
}

function LockedScreen() {
  const navigate = useNavigate();
  return (
    <main className="min-h-screen grid place-items-center px-6 bg-background">
      <div className="relative max-w-md w-full rounded-3xl glass neon-border p-8 text-center overflow-hidden">
        <div className="absolute -top-20 -right-20 size-56 rounded-full bg-[radial-gradient(circle,oklch(0.7_0.25_340_/_0.35),transparent_70%)] blur-2xl" />
        <div className="relative">
          <div className="mx-auto size-16 rounded-2xl glass grid place-items-center glow-gold mb-4">
            <Lock className="size-7 text-primary" />
          </div>
          <div className="text-[10px] tracking-[0.3em] text-primary mb-1 flex items-center justify-center gap-2">
            <Crown className="size-3.5" /> CREATOR ACCESS
          </div>
          <h1 className="text-2xl font-bold text-gradient-gold">Submissions are creator-only</h1>
          <div className="mt-6 flex flex-col gap-2">
            <button onClick={() => navigate({ to: "/premium" })} className="px-4 py-3 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold">Apply to become a Creator</button>
            <button onClick={() => navigate({ to: "/creator-hub" })} className="px-4 py-3 rounded-xl text-sm font-semibold glass border border-white/10">Back to Creator Hub</button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Form({ draft }: { draft: Submission }) {
  const navigate = useNavigate();
  const store = useSubmissions();
  const [d, setD] = useState<Submission>(draft);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [seriesMode, setSeriesMode] = useState<"existing" | "new">("existing");
  const [newShow, setNewShow] = useState({ title: "", description: "", category: "Music", visibility: "public" });

  const set = <K extends keyof Submission>(k: K, v: Submission[K]) => setD((s) => ({ ...s, [k]: v }));
  const toggleArr = (k: "category" | "tags" | "mood_tags", v: string) =>
    setD((s) => {
      const arr = s[k] as string[];
      return { ...s, [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] };
    });

  const saveSilent = () => store.updateDraft(d.content_id, d);

  const checklist = useMemo(() => [
    { ok: !!d.video_url || !!d.thumbnail_url, label: "Video uploaded" },
    { ok: !!d.title.trim(), label: "Episode title added" },
    { ok: !!d.show_title.trim() || (seriesMode === "new" && !!newShow.title.trim()), label: "Show / series selected" },
    { ok: d.season_number > 0 && d.episode_number > 0, label: "Season & episode number added" },
    { ok: !!d.short_description.trim(), label: "Description added" },
    { ok: !!d.thumbnail_url, label: "Thumbnail selected" },
    { ok: d.category.length > 0, label: "Category / tags added" },
    { ok: !!d.visibility, label: "Visibility selected" },
    { ok: d.policy_ack, label: "Content policy acknowledged" },
  ], [d, seriesMode, newShow]);

  const canSubmit = checklist.every((c) => c.ok);

  const onSubmit = () => {
    if (!canSubmit) { toast.error("Complete the checklist to submit."); return; }
    if (seriesMode === "new" && newShow.title) {
      d.show_title = newShow.title; d.show_id = newShow.title.toLowerCase().replace(/\s+/g, "-");
    }
    store.updateDraft(d.content_id, d);
    store.submit(d.content_id);
    navigate({ to: "/creator-studio/submitted", search: { id: d.content_id } as any });
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <header className="sticky top-0 z-30 px-3 md:px-5 pt-3 pb-3 backdrop-blur-xl bg-background/70 border-b border-white/5">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate({ to: "/creator-studio/edit" })} className="size-10 grid place-items-center rounded-xl glass tilt-press">
            <ArrowLeft className="size-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] tracking-[0.3em] text-primary">CONTENT DETAILS</div>
            <h1 className="text-base md:text-lg font-bold text-gradient-gold truncate">Prepare Your Episode</h1>
          </div>
          <button
            onClick={() => { saveSilent(); toast("Draft saved"); }}
            className="px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10 hidden sm:inline-flex"
          >Save Draft</button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Organize your content for Trey TV before it goes to admin review.</p>
      </header>

      <div className="px-3 md:px-5 pt-4 space-y-5">
        {/* 1. Preview card */}
        <Section title="Content Preview" icon={Film}>
          <div className="grid md:grid-cols-[1.4fr,1fr] gap-3">
            <div className="relative rounded-2xl overflow-hidden glass neon-border aspect-video">
              <img src={d.thumbnail_url || posts[0].media} className="absolute inset-0 size-full object-cover" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
              <span className="absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/15">{d.quality}</span>
              <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/40 capitalize">{d.status.replace("_", " ")}</span>
              <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/60 border border-white/15 tabular-nums">{d.duration}</span>
              <button onClick={() => setPreviewOpen(true)} className="absolute inset-0 grid place-items-center"><span className="size-12 rounded-full bg-white text-black grid place-items-center"><Play className="size-5 fill-current" /></span></button>
            </div>
            <div className="flex flex-col gap-2 text-sm">
              <button onClick={() => navigate({ to: "/creator-studio/edit" })} className="px-3 py-2 rounded-xl glass border border-white/10 text-left">← Back to Edit Studio</button>
              <button onClick={() => { set("thumbnail_url", posts[Math.floor(Math.random() * posts.length)].media); toast("Thumbnail updated"); }} className="px-3 py-2 rounded-xl glass border border-white/10 text-left flex items-center gap-2"><ImageIcon className="size-4 text-primary" /> Replace thumbnail</button>
              <button onClick={() => setPreviewOpen(true)} className="px-3 py-2 rounded-xl glass border border-white/10 text-left flex items-center gap-2"><Eye className="size-4 text-primary" /> Preview episode</button>
            </div>
          </div>
        </Section>

        {/* 2. Episode identity */}
        <Section title="Episode Identity" icon={Sparkles}>
          <Field label="Episode title">
            <Input value={d.title} onChange={(v) => set("title", v)} placeholder="The Come Up" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Show / Series">
              <Select value={d.show_title} onChange={(v) => { set("show_title", v); const s = SHOWS.find((x) => x.title === v); if (s) set("show_id", s.id); }} options={["", ...SHOWS.map((s) => s.title)]} />
            </Field>
            <Field label="Episode type">
              <Select value={d.episode_type} onChange={(v) => set("episode_type", v)} options={EPISODE_TYPES} />
            </Field>
            <Field label="Season #">
              <Input value={String(d.season_number)} onChange={(v) => set("season_number", Number(v) || 1)} type="number" />
            </Field>
            <Field label="Episode #">
              <Input value={String(d.episode_number)} onChange={(v) => set("episode_number", Number(v) || 1)} type="number" />
            </Field>
          </div>
          <div className="text-xs text-muted-foreground">
            Preview: <span className="text-foreground font-semibold">Season {d.season_number}, Episode {d.episode_number}: "{d.title || "Untitled"}"</span>
          </div>
        </Section>

        {/* 3. Viewer context */}
        <Section title="Viewer Context" icon={Eye}>
          <Field label="Short description">
            <Input value={d.short_description} onChange={(v) => set("short_description", v)} placeholder="One-line hook for viewers" />
          </Field>
          <Field label="Full episode description">
            <TextArea value={d.full_description} onChange={(v) => set("full_description", v)} rows={3} />
          </Field>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="What viewers should know"><TextArea value={d.what_to_know} onChange={(v) => set("what_to_know", v)} rows={2} /></Field>
            <Field label="Why this episode matters"><TextArea value={d.why_it_matters} onChange={(v) => set("why_it_matters", v)} rows={2} /></Field>
          </div>
          <Field label="Creator note (optional)"><TextArea value={d.creator_note} onChange={(v) => set("creator_note", v)} rows={2} /></Field>
          <Field label="Categories">
            <ChipGroup options={CATEGORIES} selected={d.category} onToggle={(v) => toggleArr("category", v)} />
          </Field>
          <Field label="Mood tags">
            <ChipGroup options={MOOD_TAGS} selected={d.mood_tags} onToggle={(v) => toggleArr("mood_tags", v)} />
          </Field>
          <Field label="Content tags">
            <TagInput tags={d.tags} onChange={(t) => set("tags", t)} />
          </Field>
        </Section>

        {/* 4. Series organization */}
        <Section title="Series Organization" icon={Film}>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setSeriesMode("existing")} className={`px-3 py-2 rounded-xl text-xs font-semibold border ${seriesMode === "existing" ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`}>Use existing show</button>
            <button onClick={() => setSeriesMode("new")} className={`px-3 py-2 rounded-xl text-xs font-semibold border ${seriesMode === "new" ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`}>Create new show</button>
          </div>
          {seriesMode === "new" && (
            <div className="space-y-3 mt-3">
              <Field label="Show title"><Input value={newShow.title} onChange={(v) => setNewShow({ ...newShow, title: v })} /></Field>
              <Field label="Show description"><TextArea value={newShow.description} onChange={(v) => setNewShow({ ...newShow, description: v })} rows={2} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Show category"><Select value={newShow.category} onChange={(v) => setNewShow({ ...newShow, category: v })} options={CATEGORIES} /></Field>
                <Field label="Visibility after approval"><Select value={newShow.visibility} onChange={(v) => setNewShow({ ...newShow, visibility: v })} options={["public", "subscribers", "private"]} /></Field>
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
            <Toggle label="Trailer" value={d.is_trailer} onChange={(v) => set("is_trailer", v)} />
            <Toggle label="Bonus" value={d.is_bonus} onChange={(v) => set("is_bonus", v)} />
            <Toggle label="Season finale" value={d.is_finale} onChange={(v) => set("is_finale", v)} />
            <Toggle label="Premiere" value={d.is_premiere} onChange={(v) => set("is_premiere", v)} />
          </div>
        </Section>

        {/* 5. Thumbnail & cover */}
        <Section title="Thumbnail & Cover" icon={ImageIcon}>
          <Field label="Episode thumbnail">
            <div className="grid grid-cols-3 gap-2">
              {posts.map((p) => (
                <button key={p.id} onClick={() => set("thumbnail_url", p.media)} className={`relative aspect-video rounded-lg overflow-hidden ring-1 ${d.thumbnail_url === p.media ? "ring-primary glow-gold" : "ring-white/10"}`}>
                  <img src={p.media} className="absolute inset-0 size-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </Field>
          <button onClick={() => { set("thumbnail_url", posts[0].media); toast("Used current frame"); }} className="px-3 py-2 rounded-xl text-xs font-semibold glass border border-white/10">Use current video frame</button>
          {/* TODO: wire vertical poster + series cover uploads */}
        </Section>

        {/* 6. Audience & visibility */}
        <Section title="Audience & Visibility" icon={Users}>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Content rating"><Select value={d.content_rating} onChange={(v) => set("content_rating", v)} options={["G", "PG", "PG-13", "TV-14", "TV-MA"]} /></Field>
            <Field label="Language"><Select value={d.language} onChange={(v) => set("language", v)} options={["English", "Spanish", "French", "Other"]} /></Field>
          </div>
          <Toggle label="Explicit content" value={d.explicit_content} onChange={(v) => set("explicit_content", v)} />
          <Field label="Visibility after approval">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(["public", "subscribers", "private", "scheduled"] as const).map((v) => (
                <button key={v} onClick={() => set("visibility", v)} className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border ${d.visibility === v ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`}>{v}</button>
              ))}
            </div>
          </Field>
          {d.visibility === "scheduled" && (
            <Field label="Scheduled release">
              <input type="datetime-local" value={d.scheduled_at ?? ""} onChange={(e) => set("scheduled_at", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm" />
            </Field>
          )}
          {(d.episode_number === 1 || d.episode_number === 2) && (
            <div className="text-[11px] text-primary px-3 py-2 rounded-xl bg-primary/10 border border-primary/30">
              Episode {d.episode_number} can be marked as a free preview for new viewers.
            </div>
          )}
        </Section>

        {/* 7. Monetization */}
        <Section title="Monetization / Access" icon={DollarSign}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {([
              { v: "free", label: "Free" },
              { v: "subscribers", label: "Subscribers only" },
              { v: "premium", label: "Premium purchase", soon: true },
              { v: "gift", label: "Gift-supported", soon: true },
            ] as const).map((o) => (
              <button
                key={o.v}
                disabled={o.soon}
                onClick={() => set("access_type", o.v)}
                className={`relative px-3 py-2 rounded-xl text-xs font-semibold border text-left ${d.access_type === o.v ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"} ${o.soon ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {o.label}
                {o.soon && <span className="ml-1 text-[9px] text-muted-foreground">Soon</span>}
              </button>
            ))}
          </div>
          {/* TODO: payments */}
        </Section>

        {/* 8. Final review checklist */}
        <Section title="Final Review Checklist" icon={CheckCircle2}>
          <ul className="space-y-2">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2 text-sm">
                {c.ok ? <CheckCircle2 className="size-4 text-[oklch(0.78_0.18_150)]" /> : <Circle className="size-4 text-muted-foreground" />}
                <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
              </li>
            ))}
          </ul>
          <label className="flex items-start gap-2 mt-3 text-xs cursor-pointer">
            <input type="checkbox" checked={d.policy_ack} onChange={(e) => set("policy_ack", e.target.checked)} className="mt-0.5" />
            <span>I confirm this content follows the Trey TV community guidelines, copyright, and creator policies.</span>
          </label>
        </Section>
      </div>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-3 pb-4 pt-3 backdrop-blur-xl bg-background/80 border-t border-white/10">
        <div className="max-w-[1400px] mx-auto flex items-center gap-2">
          <Link to="/creator-studio/submissions" className="hidden md:inline-flex px-3 py-3 rounded-xl text-xs font-semibold glass border border-white/10">My submissions</Link>
          <button onClick={() => { saveSilent(); toast("Draft saved"); }} className="flex-1 md:flex-none px-3 py-3 rounded-xl text-xs font-semibold glass border border-white/10">Save draft</button>
          <button
            disabled={!canSubmit}
            onClick={onSubmit}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${canSubmit ? "bg-primary text-primary-foreground glow-gold tilt-press" : "bg-white/10 text-muted-foreground cursor-not-allowed"}`}
          >
            <ShieldCheck className="size-4" /> Submit for Admin Approval
          </button>
        </div>
      </div>

      {/* Preview dialog */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="relative max-w-3xl w-full rounded-3xl glass-strong border border-white/10 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewOpen(false)} className="absolute top-3 right-3 z-10 size-9 grid place-items-center rounded-full glass"><X className="size-4" /></button>
            <div className="aspect-video bg-black grid place-items-center">
              {d.video_url?.startsWith("blob:") ? (
                <video src={d.video_url} controls className="size-full" />
              ) : (
                <img src={d.thumbnail_url || posts[0].media} className="size-full object-cover" alt="" />
              )}
            </div>
            <div className="p-4">
              <div className="text-[10px] tracking-[0.2em] text-primary">PREVIEW</div>
              <div className="font-bold">{d.title || "Untitled episode"}</div>
              <div className="text-xs text-muted-foreground">{d.show_title} · S{d.season_number} E{d.episode_number}</div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl glass neon-border p-4 md:p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="size-8 rounded-xl glass grid place-items-center"><Icon className="size-4 text-primary" /></div>
        <h2 className="text-sm font-bold tracking-wide">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={type} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60" />;
}
function TextArea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/60" />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary/60">
      {options.map((o) => <option key={o} value={o}>{o || "— select —"}</option>)}
    </select>
  );
}
function ChipGroup({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button key={o} onClick={() => onToggle(o)} className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition ${on ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass hover:bg-white/5"}`}>
            {on && <Check className="inline size-3 mr-1" />}{o}
          </button>
        );
      })}
    </div>
  );
}
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [v, setV] = useState("");
  const add = () => { const t = v.trim(); if (!t) return; if (!tags.includes(t)) onChange([...tags, t]); setV(""); };
  return (
    <div className="rounded-xl bg-white/5 border border-white/10 px-2 py-2 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span key={t} className="px-2 py-0.5 rounded-full text-[11px] bg-primary/15 text-primary border border-primary/30 flex items-center gap-1">
          #{t} <button onClick={() => onChange(tags.filter((x) => x !== t))}><X className="size-3" /></button>
        </span>
      ))}
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder="add tag…" className="flex-1 min-w-[80px] bg-transparent text-xs focus:outline-none px-1" />
    </div>
  );
}
function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left flex items-center justify-between ${value ? "bg-primary/15 border-primary text-primary glow-gold" : "border-white/10 glass"}`}>
      {label}<span className={`size-4 rounded-full border ${value ? "bg-primary border-primary" : "border-white/30"}`} />
    </button>
  );
}
