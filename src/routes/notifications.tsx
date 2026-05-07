import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { ComingSoonPage } from "@/components/layout/ComingSoonPage";

export const Route = createFileRoute("/notifications")({
  component: () => (
    <ComingSoonPage
      title="Notifications"
      tagline="Every like, comment, follow and live drop — in one beautifully sorted stream."
      icon={Bell}
      accent="primary"
      bullets={[
        "Smart grouping by creator and topic",
        "Live alerts the second a follow goes on air",
        "Mute or pin specific notification types",
        "Sync read state across all your devices",
      ]}
      cta={{ label: "Open Inbox", to: "/inbox" }}
    />
  ),
  head: () => ({ meta: [{ title: "Notifications — Trey TV" }] }),
});
