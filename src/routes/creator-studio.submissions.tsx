import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/lib/auth";
import { useSubmissions, STATUS_LABEL, STATUS_TONE } from "@/lib/submissions-store";
import { Crown, Pencil, Trash2, Eye, MessageSquare, Upload } from "lucide-react";
import { posts } from "@/lib/mock-data";

export const Route = createFileRoute("/creator-studio/submissions")({
  component: SubmissionsPage,
  head: () => ({
    meta: [
      { title: "My Submissions — Trey TV" },
      { name: "description", content: "Track your Trey TV submissions, admin feedback, and approval status." },
    ],
  }),
});

function SubmissionsPage() {
  const { isGuest, isCreator, user } = useAuth();
  const navigate = useNavigate();
  const store = useSubmissions();

  useEffect(() => { if (isGuest) navigate({ to: "/login" }); }, [isGuest, navigate]);
  if (isGuest) return null;
  if (!isCreator) return (
    <AppShell wide><div className="rounded-3xl glass neon-border p-8 text-center"><Crown className="mx-auto size-8 text-primary mb-3" /><h1 className="text-xl font-bold">Creator-only area</h1></div></AppShell>
  );

  const mine = user ? store.byCreator(user.uid) : store.submissions;

  return (
    <AppShell wide>
      <div className="space-y-5">
        <div className="rounded-3xl glass neon-border p-5 flex items-center gap-3">
          <div className="size-12 rounded-2xl glass grid place-items-center glow-gold"><Crown className="size-6 text-primary" /></div>
          <div className="flex-1">
            <div className="text-[10px] tracking-[0.3em] text-primary">CREATOR SUBMISSIONS</div>
            <h1 className="text-2xl font-bold text-gradient-gold">My Submissions</h1>
            <p className="text-xs text-muted-foreground">Approval status, admin feedback, and revision history.</p>
          </div>
          <Link to="/creator-studio/edit" className="px-4 py-2 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold flex items-center gap-2"><Upload className="size-4" /> New</Link>
        </div>

        {mine.length === 0 && (
          <div className="rounded-3xl glass neon-border p-8 text-center text-sm text-muted-foreground">
            You haven't submitted anything yet. Head to the <Link to="/creator-studio/edit" className="text-primary">Edit Studio</Link> to create your first episode.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-3">
          {mine.map((s) => (
            <article key={s.content_id} className="rounded-3xl glass neon-border overflow-hidden hover-lift">
              <div className="relative aspect-video">
                <img src={s.thumbnail_url || posts[0].media} className="absolute inset-0 size-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`}>{STATUS_LABEL[s.status]}</span>
                <span className="absolute bottom-2 left-2 text-xs font-semibold drop-shadow">{s.title || "Untitled"}</span>
              </div>
              <div className="p-3 space-y-2">
                <div className="text-xs text-muted-foreground">{s.show_title || "—"} · S{s.season_number} E{s.episode_number}</div>
                {s.admin_feedback && (
                  <div className="text-xs rounded-xl bg-[oklch(0.7_0.25_340_/_0.1)] border border-[oklch(0.7_0.25_340_/_0.3)] p-2 flex gap-2">
                    <MessageSquare className="size-3.5 text-[oklch(0.78_0.25_340)] shrink-0 mt-0.5" />
                    <div><span className="font-semibold text-[oklch(0.78_0.25_340)]">Admin: </span>{s.admin_feedback}</div>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {s.status === "needs_changes" && (
                    <Link to="/creator-studio/submit" search={{ id: s.content_id } as any} className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground"><Pencil className="inline size-3 mr-1" />Edit & resubmit</Link>
                  )}
                  {s.status === "draft" && (
                    <Link to="/creator-studio/submit" search={{ id: s.content_id } as any} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10"><Pencil className="inline size-3 mr-1" />Continue draft</Link>
                  )}
                  {(s.status === "approved" || s.status === "published") && (
                    <Link to="/watch/$id" params={{ id: s.content_id }} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10"><Eye className="inline size-3 mr-1" />View</Link>
                  )}
                  {s.status === "draft" && (
                    <button onClick={() => store.remove(s.content_id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10 text-muted-foreground hover:text-[oklch(0.78_0.24_15)]"><Trash2 className="inline size-3 mr-1" />Delete</button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
