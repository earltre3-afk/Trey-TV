import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/ComingSoonPage";

export const Route = createFileRoute("/following")({
  component: () => (
    <ComingSoonPage
      title="Following"
      tagline="Your hand-picked feed of every creator you follow — sorted by what's fresh, live, and trending."
      icon={Users}
      accent="purple"
      bullets={[
        "Live-first ordering when creators go on air",
        "Quiet mode: mute without unfollowing",
        "Pin favorites to the top of your feed",
        "Smart resurfacing of missed episodes",
      ]}
      cta={{ label: "Browse the For You feed", to: "/" }}
    />
  ),
  head: () => ({ meta: [{ title: "Following — Trey TV" }] }),
});
