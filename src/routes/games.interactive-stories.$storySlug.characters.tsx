import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const InteractiveStoriesPlayer = lazy(
  () => import("@/features/interactive-stories/components/InteractiveStoriesPlayer"),
);

export const Route = createFileRoute("/games/interactive-stories/$storySlug/characters")({
  component: StoryCharactersPage,
});

function StoryCharactersPage() {
  return (
    <div
      className="font-sans antialiased"
      style={{ background: "#05070D", color: "#F8FAFC", minHeight: "100vh" }}
    >
      <Suspense
        fallback={
          <div className="min-h-screen grid place-items-center text-white">Loading Cast</div>
        }
      >
        <InteractiveStoriesPlayer
          initialView="main"
          initialTab="characters"
          onBack={() => window.history.back()}
        />
      </Suspense>
    </div>
  );
}
