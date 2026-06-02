import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useSubmissions, STATUS_LABEL, STATUS_TONE } from "@/lib/submissions-store";
import { posts } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/videos")({
  component: () => {
    const store = useSubmissions();
    return (
      <AdminShell title="Videos" subtitle="All content across the platform.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {store.submissions.map((s) => (
            <Link
              key={s.content_id}
              to="/admin/content-approval/$id"
              params={{ id: s.content_id }}
              className="rounded-2xl glass neon-border overflow-hidden hover-lift"
            >
              <div className="relative aspect-video">
                <img
                  src={s.thumbnail_url || posts[0].media}
                  className="absolute inset-0 size-full object-cover"
                  alt=""
                />
                <span
                  className={`absolute top-2 left-2 text-[9px] px-2 py-0.5 rounded-full border ${STATUS_TONE[s.status]}`}
                >
                  {STATUS_LABEL[s.status]}
                </span>
              </div>
              <div className="p-2">
                <div className="text-xs font-semibold truncate">{s.title}</div>
                <div className="text-[10px] text-muted-foreground truncate">
                  @{s.creator_handle}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AdminShell>
    );
  },
  head: () => ({ meta: [{ title: "Videos — Admin" }] }),
});
