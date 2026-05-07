import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/ComingSoonPage";

export const Route = createFileRoute("/latest")({
  component: () => (
    <ComingSoonPage
      title="Latest Drops"
      tagline="Real-time stream of the freshest posts, episodes and live shows landing on Trey TV right now."
      icon={Zap}
      accent="primary"
      bullets={[
        "Auto-refreshing live timeline",
        "Filter by category, mood, or creator",
        "Get notified the moment a follow drops",
        "Replay anything within 24 hours",
      ]}
      cta={{ label: "Open Explore", to: "/explore" }}
    />
  ),
  head: () => ({ meta: [{ title: "Latest — Trey TV" }] }),
});
