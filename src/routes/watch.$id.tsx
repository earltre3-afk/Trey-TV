import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useSubmissions, STATUS_LABEL, STATUS_TONE } from "@/lib/submissions-store";
import { posts } from "@/lib/mock-data";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Heart, MessageCircle, Bookmark, Share2, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { channelById, episodeById, showById } from "@/lib/watch-data";
import { useGuide } from "@/lib/guide-store";

export const Route = createFileRoute("/watch/$id")({
  component: WatchPage,
  head: () => ({ meta: [{ title: "Watch — Trey TV" }] }),
});

function WatchPage() {
  const { id } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const guide = useGuide();
  const lastProgressWrite = useRef(0);
  const store = useSubmissions();
  const s = store.get(id);
  const staticEpisode = episodeById(id);

  useEffect(() => {
    if (s || !staticEpisode) return;
    guide.recordProgress({
      episodeId: staticEpisode.id,
      showId: staticEpisode.showId,
      channelId: staticEpisode.channelId,
      progress: Math.max(0.03, guide.progressOf(staticEpisode.id)?.progress ?? 0),
      durationSeconds: staticEpisode.duration * 60,
    });
  }, [s?.content_id, staticEpisode?.id]);

  if (!s && staticEpisode) {
    return <StaticWatchPage ep={staticEpisode} />;
  }

  if (!s) {
    return (
      <AppShell>
        <div className="rounded-3xl glass neon-border p-8 text-center">
          <h1 className="text-xl font-bold">Episode not found</h1>
          <Link to="/" className="text-sm text-primary mt-2 inline-block">Back home</Link>
        </div>
      </AppShell>
    );
  }

  const isOwner = user?.uid === s.creator_id;
  const visible = s.status === "approved" || s.status === "published" || isOwner || isAdmin;

  if (!visible) {
    return (
      <AppShell>
        <div className="rounded-3xl glass neon-border p-8 text-center">
          <Lock className="mx-auto size-8 text-primary mb-3" />
          <h1 className="text-xl font-bold">Episode unavailable</h1>
          <p className="text-sm text-muted-foreground mt-1">This episode is awaiting admin approval.</p>
        </div>
      </AppShell>
    );
  }

  const related = store.submissions.filter((x) => x.content_id !== s.content_id && (x.status === "approved" || x.status === "published"));
  const moreFromCreator = related.filter((x) => x.creator_id === s.creator_id);

  return (
    <AppShell wide>
      <div className="grid lg:grid-cols-[1.6fr,1fr] gap-4">
        <div>
          <div className="rounded-3xl overflow-hidden glass neon-border">
            <div className="relative aspect-video bg-black">
              <VideoPlayer
                src={s.video_url?.startsWith("blob:") ? s.video_url : undefined}
                poster={s.thumbnail_url}
                fallbackImg={s.thumbnail_url || posts[0].media}
                className="size-full"
                onProgress={({ currentTime, duration, ratio }) => {
                  if (Date.now() - lastProgressWrite.current < 10_000 && ratio < 0.92) return;
                  lastProgressWrite.current = Date.now();
                  guide.recordProgress({
                    episodeId: s.content_id,
                    showId: s.show_id,
                    channelId: s.creator_id,
                    progress: ratio,
                    progressSeconds: currentTime,
                    durationSeconds: duration,
                  });
                }}
                onEnded={() => guide.recordProgress({
                  episodeId: s.content_id,
                  showId: s.show_id,
                  channelId: s.creator_id,
                  progress: 1,
                  completed: true,
                })}
              />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`}>{STATUS_LABEL[s.status]}</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10">{s.quality}</span>
              <span className="text-[10px] text-muted-foreground">{s.show_title} · S{s.season_number} E{s.episode_number}</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient-gold">{s.title}</h1>
            <Link to="/channel/$handle" params={{ handle: s.creator_handle }} className="inline-flex items-center gap-2 hover:opacity-90">
              <img src={s.creator_avatar} className="size-9 rounded-full object-cover" alt="" />
              <div>
                <div className="text-sm font-semibold flex items-center gap-1">{s.creator_name} <Crown className="size-3 text-primary" /></div>
                <div className="text-[11px] text-muted-foreground">@{s.creator_handle} · View channel</div>
              </div>
            </Link>
            <div className="flex gap-2 pt-1">
              {[
                { icon: Heart, label: "Like" }, { icon: MessageCircle, label: "Comment" },
                { icon: Bookmark, label: "Save" }, { icon: Share2, label: "Share" },
              ].map((b) => (
                <button key={b.label} onClick={() => toast(b.label)} className="px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5"><b.icon className="size-3.5" /> {b.label}</button>
              ))}
            </div>
            {s.short_description && <p className="text-sm">{s.short_description}</p>}
            {s.full_description && <p className="text-sm text-muted-foreground">{s.full_description}</p>}
            {s.viewer_context && (
              <div className="rounded-2xl glass border border-white/10 p-3 text-xs">
                <div className="text-[10px] tracking-[0.2em] text-primary mb-1">VIEWER CONTEXT</div>
                {s.viewer_context}
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {s.tags.map((t) => <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary">#{t}</span>)}
            </div>
          </div>
        </div>

        <aside className="space-y-3">
          <Rail title="More from this creator" items={moreFromCreator} />
          <Rail title="Related episodes" items={related} />
        </aside>
      </div>
    </AppShell>
  );
}

function StaticWatchPage({ ep }: { ep: NonNullable<ReturnType<typeof episodeById>> }) {
  const guide = useGuide();
  const show = showById(ep.showId);
  const channel = channelById(ep.channelId);
  const saved = guide.has("saved", ep.id);
  const later = guide.has("watchLater", ep.id);
  const progress = guide.progressOf(ep.id);

  return (
    <AppShell wide>
      <div className="grid lg:grid-cols-[1.6fr,1fr] gap-4">
        <div>
          <div className="rounded-3xl overflow-hidden glass neon-border">
            <div className="relative aspect-video bg-black">
              <VideoPlayer
                poster={ep.thumb}
                fallbackImg={ep.thumb}
                className="size-full object-cover"
              />
              {progress && progress.progress > 0 && (
                <div className="absolute bottom-0 inset-x-0 h-1.5 bg-white/15">
                  <div className="h-full bg-primary" style={{ width: `${Math.min(100, progress.progress * 100)}%` }} />
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {ep.isLive && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500 text-white">LIVE</span>}
              {ep.premium && <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary text-primary">PREMIUM</span>}
              <span className="text-[10px] text-muted-foreground">{show?.title} · S{ep.season} E{ep.number} · {ep.duration}m</span>
            </div>
            <h1 className="text-2xl font-bold text-gradient-gold">{ep.title}</h1>
            <Link to="/channel/$handle" params={{ handle: channel?.handle ?? "trey" }} className="inline-flex items-center gap-2 hover:opacity-90">
              <img src={channel?.avatar} className="size-9 rounded-full object-cover" alt="" />
              <div>
                <div className="text-sm font-semibold flex items-center gap-1">{channel?.name ?? "Trey TV"} <Crown className="size-3 text-primary" /></div>
                <div className="text-[11px] text-muted-foreground">@{channel?.handle ?? "trey"} · View channel</div>
              </div>
            </Link>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => { guide.markWatched(ep.id); toast.success("Marked watched"); }} className="px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5"><Heart className="size-3.5" /> Mark watched</button>
              <button onClick={() => { guide.toggle("saved", ep.id); toast(saved ? "Removed from saves" : "Saved"); }} className="px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5"><Bookmark className="size-3.5" /> {saved ? "Saved" : "Save"}</button>
              <button onClick={() => { guide.toggle("watchLater", ep.id); toast(later ? "Removed from Watch Later" : "Added to Watch Later"); }} className="px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5"><Lock className="size-3.5" /> {later ? "Watch Later" : "Watch Later"}</button>
              <button onClick={() => toast("Link copied")} className="px-3 py-2 rounded-xl glass border border-white/10 text-xs flex items-center gap-1.5"><Share2 className="size-3.5" /> Share</button>
            </div>
            <p className="text-sm text-muted-foreground">{show?.description}</p>
          </div>
        </div>

        <aside className="space-y-3">
          <section className="rounded-3xl glass neon-border p-3">
            <h3 className="text-sm font-bold mb-2">More episodes</h3>
            <div className="space-y-2">
              {(show?.episodes ?? []).filter((item) => item.id !== ep.id).slice(0, 5).map((item) => (
                <Link key={item.id} to="/watch/$id" params={{ id: item.id }} className="flex gap-2 hover:bg-white/5 rounded-xl p-1 transition">
                  <div className="relative aspect-video w-28 rounded-lg overflow-hidden shrink-0">
                    <img src={item.thumb} className="absolute inset-0 size-full object-cover" alt="" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{item.title}</div>
                    <div className="text-[10px] text-muted-foreground truncate">S{item.season} E{item.number} · {item.duration}m</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </AppShell>
  );
}

function Rail({ title, items }: { title: string; items: any[] }) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-3xl glass neon-border p-3">
      <h3 className="text-sm font-bold mb-2">{title}</h3>
      <div className="space-y-2">
        {items.slice(0, 5).map((s) => (
          <Link key={s.content_id} to="/watch/$id" params={{ id: s.content_id }} className="flex gap-2 hover:bg-white/5 rounded-xl p-1 transition">
            <div className="relative aspect-video w-28 rounded-lg overflow-hidden shrink-0">
              <img src={s.thumbnail_url || posts[0].media} className="absolute inset-0 size-full object-cover" alt="" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold truncate">{s.title}</div>
              <div className="text-[10px] text-muted-foreground truncate">@{s.creator_handle} · S{s.season_number} E{s.episode_number}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
