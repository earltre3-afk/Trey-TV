import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/feed/Composer";
import { CreatorRail } from "@/components/feed/CreatorRail";
import { PostCard } from "@/components/feed/PostCard";
import { posts } from "@/lib/mock-data";

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
  return (
    <AppShell activeTab="for-you">
      <div className="space-y-5">
        <Composer />
        <CreatorRail />

        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold flex items-center gap-2">
            <Star className="size-4 text-primary" /> Recommended for you
          </h2>
          <button className="text-sm text-primary">See all</button>
        </div>

        <div className="space-y-5">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
