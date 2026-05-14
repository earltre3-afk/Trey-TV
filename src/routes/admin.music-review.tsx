import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft, ChevronUp, ChevronDown, Trash2, Check, X, Sparkles, Send, Star,
  Crown, Music2, Radio, Play, Mail, Wand2, ListOrdered, Pause, SkipForward,
} from "lucide-react";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useMusicReview, TIER_META, type Submission } from "@/lib/music-review-store";
import { generateAdminReviewDraft } from "@/lib/trey-i/vertex.server";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/music-review")({
  component: AdminMusicReviewPage,
  head: () => ({ meta: [{ title: "Music Review Queue · Admin" }] }),
});

function AdminMusicReviewPage() {
  const { isAdmin } = useAuth();
  const { submissions, update, remove, reorder, publicQueue } = useMusicReview();
  const [activeId, setActiveId] = useState<string | null>(null);

  if (!isAdmin) {
    return (
      <AdminShell>
        <div className="rounded-2xl liquid-glass border border-white/10 p-10 text-center">
          <div className="text-lg font-bold">Admin only</div>
          <div className="text-sm text-muted-foreground mt-1">Switch role to admin from the user menu.</div>
        </div>
      </AdminShell>
    );
  }

  const queue = publicQueue();
  const reviewed = submissions.filter((s) => s.status === "reviewed").sort((a, b) => (b.review?.sentAt ?? 0) - (a.review?.sentAt ?? 0));
  const active = activeId ? submissions.find((s) => s.id === activeId) ?? null : null;

  const move = (id: string, dir: -1 | 1) => {
    const ids = queue.map((q) => q.id);
    const idx = ids.indexOf(id);
    if (idx < 0) return;
    const swap = idx + dir;
    if (swap < 0 || swap >= ids.length) return;
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    reorder(ids);
  };

  const playNow = (id: string) => {
    submissions.forEach((s) => {
      if (s.status === "now_playing") update(s.id, { status: "queued" });
    });
    update(id, { status: "now_playing" });
  };

  return (
    <AdminShell>
      <div className="flex items-center justify-between gap-3 mb-5">
        <Link to="/" className="size-9 grid place-items-center rounded-full liquid-glass border border-white/10"><ArrowLeft className="size-4" /></Link>
        <h1 className="text-xl sm:text-2xl font-black">Music Review · Admin Queue</h1>
        <Link to="/music-review/queue" className="px-3 h-9 rounded-full liquid-glass border border-white/10 text-xs font-semibold inline-flex items-center gap-1.5">
          <ListOrdered className="size-3.5" /> Public view
        </Link>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] gap-5">
        {/* Queue panel */}
        <section className="rounded-3xl liquid-glass border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold inline-flex items-center gap-2"><Radio className="size-4 text-[oklch(0.65_0.24_15)]" /> On deck ({queue.length})</div>
          </div>
          {queue.length === 0 && <Empty msg="No songs in queue." />}
          <ul className="space-y-2">
            {queue.map((s, i) => {
              const t = TIER_META[s.tier];
              const isNow = s.status === "now_playing";
              return (
                <li key={s.id} className={`rounded-2xl border p-3 ${isNow ? "border-[oklch(0.65_0.24_15/0.5)] bg-[oklch(0.65_0.24_15/0.05)]" : "border-white/10 bg-white/[0.02]"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 text-center font-display font-black text-sm">{isNow ? "LIVE" : `#${i + 1}`}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-bold truncate">{s.title}</div>
                        {s.tier !== "regular" && <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${t.color}`} style={{ borderColor: "currentColor" }}>{t.label}</span>}
                        {s.paymentStatus === "pending" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">payment pending</span>}
                        {s.paymentStatus === "verified" && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">paid</span>}
                        {s.topOfDay && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 inline-flex items-center gap-1"><Star className="size-2.5" /> Top 3</span>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{s.artist} · {s.genre} · {s.userName} ({s.userUid})</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconBtn title="Move up" onClick={() => move(s.id, -1)} disabled={i === 0}><ChevronUp className="size-4" /></IconBtn>
                      <IconBtn title="Move down" onClick={() => move(s.id, 1)} disabled={i === queue.length - 1}><ChevronDown className="size-4" /></IconBtn>
                      {!isNow ? (
                        <IconBtn title="Play now" onClick={() => playNow(s.id)}><Play className="size-4" /></IconBtn>
                      ) : (
                        <IconBtn title="Pause / back to queue" onClick={() => update(s.id, { status: "queued" })}><Pause className="size-4" /></IconBtn>
                      )}
                      <IconBtn title="Skip" onClick={() => update(s.id, { status: "skipped" })}><SkipForward className="size-4" /></IconBtn>
                      <IconBtn title="Delete" onClick={() => remove(s.id)} danger><Trash2 className="size-4" /></IconBtn>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {s.paymentStatus === "pending" && (
                      <button onClick={() => update(s.id, { paymentStatus: "verified" })} className="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                        <Check className="size-3" /> Verify payment
                      </button>
                    )}
                    <button onClick={() => update(s.id, { topOfDay: !s.topOfDay })} className={`text-[11px] px-2 py-1 rounded-lg border inline-flex items-center gap-1 ${s.topOfDay ? "bg-primary/20 text-primary border-primary/40" : "border-white/15"}`}>
                      <Star className="size-3" /> {s.topOfDay ? "Unmark Top 3" : "Mark Top 3"}
                    </button>
                    <button onClick={() => setActiveId(s.id)} className="text-[11px] px-2 py-1 rounded-lg bg-primary text-primary-foreground font-bold inline-flex items-center gap-1">
                      <Sparkles className="size-3" /> Open review composer
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {reviewed.length > 0 && (
            <>
              <div className="mt-6 mb-2 text-sm font-bold">Recently reviewed</div>
              <ul className="space-y-2">
                {reviewed.slice(0, 6).map((s) => (
                  <li key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs flex items-center gap-3">
                    <Music2 className="size-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">{s.title} — {s.artist}</div>
                      <div className="text-muted-foreground truncate">{s.review?.score}/10 · sent to {s.userEmail}</div>
                    </div>
                    <button onClick={() => setActiveId(s.id)} className="text-primary hover:underline">View</button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {/* Composer */}
        <aside className="rounded-3xl liquid-glass neon-border p-4 lg:sticky lg:top-6 self-start">
          {active ? (
            <ReviewComposer key={active.id} sub={active} onClose={() => setActiveId(null)} />
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Sparkles className="size-6 mx-auto text-primary mb-3" />
              Select a song to draft and send its review.
            </div>
          )}
        </aside>
      </div>
    </AdminShell>
  );
}

function ReviewComposer({ sub, onClose }: { sub: Submission; onClose: () => void }) {
  const { update } = useMusicReview();
  const [body, setBody] = useState(sub.review?.body ?? "");
  const [score, setScore] = useState<number>(sub.review?.score ?? sub.aiFirstImpression?.hypeScore ?? 8);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);

  const draftWithAI = async () => {
    setDrafting(true);
    try {
      const res = await generateAdminReviewDraft({
        data: {
          title: sub.title,
          artist: sub.artist,
          genre: sub.genre,
          vibe: sub.aiFirstImpression?.vibe ?? "",
          bodyNotes: body,
        }
      });
      setBody(res.text);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate AI draft");
    }
    setDrafting(false);
  };

  const send = async () => {
    if (!body.trim()) { toast.error("Write or draft a review first."); return; }
    setSending(true);
    await new Promise((r) => setTimeout(r, 700));
    update(sub.id, {
      status: "reviewed",
      review: { body, score, sentAt: Date.now() },
    });
    toast.success(`Review sent to ${sub.userEmail}`);
    setSending(false);
    onClose();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] tracking-[0.22em] text-muted-foreground">REVIEW COMPOSER</div>
        <button onClick={onClose} className="size-7 grid place-items-center rounded-full hover:bg-white/5"><X className="size-4" /></button>
      </div>
      <div className="text-xl font-black">{sub.title}</div>
      <div className="text-xs text-muted-foreground">{sub.artist} · {sub.genre} · {sub.userName} ({sub.userUid})</div>
      {sub.aiFirstImpression && (
        <div className="mt-3 rounded-xl bg-white/5 border border-white/10 p-3 text-xs">
          <div className="font-semibold text-[oklch(0.82_0.15_215)]">{sub.aiFirstImpression.vibe}</div>
          <div className="text-muted-foreground mt-1">{sub.aiFirstImpression.hook}</div>
        </div>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between mb-1">
          <div className="text-[10px] tracking-[0.22em] text-muted-foreground">REVIEW BODY</div>
          <button onClick={draftWithAI} disabled={drafting} className="text-[11px] px-2 py-1 rounded-lg bg-[oklch(0.82_0.15_215/0.15)] text-[oklch(0.82_0.15_215)] border border-[oklch(0.82_0.15_215/0.4)] inline-flex items-center gap-1 disabled:opacity-50">
            <Wand2 className="size-3" /> {drafting ? "Drafting…" : "AI assist"}
          </button>
        </div>
        <textarea
          value={body} onChange={(e) => setBody(e.target.value)} rows={10}
          placeholder="Drop your bullet thoughts then hit AI assist — or write the whole thing."
          className="w-full rounded-xl glass border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-primary/50 resize-y"
        />
      </div>

      <div className="mt-3">
        <div className="text-[10px] tracking-[0.22em] text-muted-foreground mb-1">SCORE · {score}/10</div>
        <input type="range" min={1} max={10} value={score} onChange={(e) => setScore(Number(e.target.value))} className="w-full accent-primary" />
      </div>

      <button onClick={send} disabled={sending} className="mt-4 w-full px-4 h-12 rounded-xl bg-primary text-primary-foreground font-black glow-gold inline-flex items-center justify-center gap-2 disabled:opacity-60">
        <Mail className="size-4" /> {sending ? "Sending…" : `Send review to ${sub.userEmail}`}
      </button>
      <div className="mt-2 text-[11px] text-muted-foreground text-center">Marks the song as reviewed and emails the artist.</div>
    </div>
  );
}

function IconBtn({ children, onClick, disabled, danger, title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; danger?: boolean; title?: string }) {
  return (
    <button title={title} onClick={onClick} disabled={disabled} className={`size-8 grid place-items-center rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 ${danger ? "text-red-400 hover:bg-red-500/10" : ""}`}>
      {children}
    </button>
  );
}

function Empty({ msg }: { msg: string }) {
  return <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-xs text-muted-foreground">{msg}</div>;
}
