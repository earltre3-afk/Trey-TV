import { createFileRoute } from "@tanstack/react-router";
import MusicReviewModule from "@/features/music-review/MusicReviewModule";

export const Route = createFileRoute("/music-review/queue")({
  component: MusicReviewQueuePage,
  head: () => ({
    meta: [
      { title: "Live Queue - Trey TV Music Review" },
      { name: "description", content: "See who is on deck for Trey TV live music review." },
    ],
  }),
});

function MusicReviewQueuePage() {
  return <MusicReviewModule initialRoute="queue" />;
}
