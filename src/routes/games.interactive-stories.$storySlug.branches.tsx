import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const InteractiveStoriesPlayer = lazy(
  () => import("@/features/interactive-stories/components/InteractiveStoriesPlayer"),
);

export const Route = createFileRoute("/games/interactive-stories/$storySlug/branches")({
  component: StoryBranchesPage,
});

function StoryBranchesPage() {
  return (
    <div
      className="font-sans antialiased"
      style={{ background: "#05070D", color: "#F8FAFC", minHeight: "100vh" }}
    >
      <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center text-white">Loading Branch Map</div>
        }
      >
        <InteractiveStoriesPlayer
          initialView="main"
          initialTab="branches"
          onBack={() => window.history.back()}
        />
      </Suspense>
    </div>
  );
}
