import { createFileRoute, useParams } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const InteractiveStoriesPlayer = lazy(
  () => import("@/features/interactive-stories/components/InteractiveStoriesPlayer")
);

export const Route = createFileRoute("/games/interactive-stories/$storySlug/play")({
  component: StoryPlayPage,
});

function StoryPlayPage() {
  const { storySlug } = useParams({ from: "/games/interactive-stories/$storySlug/play" });

  return (
    <div className="font-sans antialiased" style={{ background: "#05070D", color: "#F8FAFC", minHeight: "100vh" }}>
      <Suspense fallback={<RouteLoader label="Loading Story" />}>
        <InteractiveStoriesPlayer storySlug={storySlug} initialView="main" onBack={() => window.history.back()} />
      </Suspense>
    </div>
  );
}

function RouteLoader({ label }: { label: string }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6">
      <div
        className="rounded-3xl border px-6 py-5 text-center"
        style={{
          background: "rgba(8,17,31,0.78)",
          borderColor: "rgba(168,85,247,0.3)",
          boxShadow: "0 0 44px rgba(168,85,247,0.18), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="text-[10px] font-bold tracking-[0.3em]" style={{ color: "#A855F7" }}>
          TREY TV
        </div>
        <div className="mt-1 text-base font-black">{label}</div>
      </div>
    </div>
  );
}
