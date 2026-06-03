import { createFileRoute } from "@tanstack/react-router";
import AppLayout from "../../apps/trey-tv-web/src/components/AppLayout";

export const Route = createFileRoute("/tv")({
  component: TvLayout,
  head: () => ({
    meta: [
      { title: "Trey TV - TV Cinematic Shell" },
      {
        name: "description",
        content: "Watch Trey TV on the big screen. A TV-first, 10-foot remote-friendly interface.",
      },
    ],
  }),
});

function TvLayout() {
  return <AppLayout />;
}
