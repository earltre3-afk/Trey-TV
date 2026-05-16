import { createFileRoute } from "@tanstack/react-router";
import MusicReviewModule from "@/features/music-review/MusicReviewModule";

export const Route = createFileRoute("/admin/music-review")({
  component: AdminMusicReviewPage,
  head: () => ({ meta: [{ title: "Music Review Admin - Trey TV" }] }),
});

function AdminMusicReviewPage() {
  return <MusicReviewModule initialRoute="admin" />;
}
