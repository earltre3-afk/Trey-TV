import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/feed/Composer";
import { CreatorRail } from "@/components/feed/CreatorRail";
import { PostCard } from "@/components/feed/PostCard";
import { posts } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "Trey TV — Premium Creator Network" },
      { name: "description", content: "A futuristic creator-TV network. Watch shows, follow creators, and get mood-based picks with Prescribe Me." },
    ],
  }),
});

function Home() {
  const [tab, setTab] = useState("for-you");

  const filtered =
    tab === "following"
      ? posts.slice(0, 2)
      : tab === "latest"
        ? [...posts].reverse()
        : posts;

  const heading =
    tab === "following" ? "From creators you follow"
      : tab === "latest" ? "Latest drops"
      : "Recommended for you";

  return (
    <AppShell activeTab={tab} onTabChange={setTab}>
      <div className="space-y-5">
        <Composer />
        <CreatorRail />

        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Star className="size-4 text-primary" /> {heading}
          </h2>
          <button onClick={() => toast("Loading more…")} className="text-sm text-primary">See all</button>
        </div>

        <div className="space-y-5">
          {filtered.map((p, i) => (
            <PostCard key={p.id} post={p} index={i} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
