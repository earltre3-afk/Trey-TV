import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const InteractiveStoriesPlayer = lazy(
  () => import("@/features/interactive-stories/components/InteractiveStoriesPlayer"),
);

export const Route = createFileRoute("/games/interactive-stories/")({
  component: InteractiveStoriesPage,
  head: () => ({
    meta: [
      { title: "Interactive Stories · Trey TV Games" },
      { name: "description", content: "Browse and play cinematic interactive stories on Trey TV." },
    ],
  }),
});

function InteractiveStoriesPage() {
  return (
    <div
      className="font-sans antialiased"
      style={{ background: "#05070D", color: "#F8FAFC", minHeight: "100vh" }}
    >
      <Suspense
        fallback={
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
              <div className="mt-1 text-base font-black">Loading Interactive Stories</div>
            </div>
          </div>
        }
      >
        <InteractiveStoriesPlayer onBack={() => window.history.back()} />
      </Suspense>
    </div>
  );
}
