import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import MusicReviewModule from "@/features/music-review/MusicReviewModule";

export const Route = createFileRoute("/music-review")({
  component: MusicReviewPage,
  head: () => ({
    meta: [
      { title: "Live Music Review - Trey TV" },
      {
        name: "description",
        content: "Submit, queue, skip the line, and join Trey TV live music review.",
      },
    ],
  }),
});

function MusicReviewPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname !== "/music-review") {
    return <Outlet />;
  }

  return <MusicReviewModule />;
}
