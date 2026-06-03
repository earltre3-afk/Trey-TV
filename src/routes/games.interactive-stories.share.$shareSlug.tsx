import { createFileRoute, useParams } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const SharedEndingScreen = lazy(async () => {
  const mod = await import("@/features/interactive-stories/components/screens/PlaythroughsScreen");
  return { default: mod.SharedEndingScreen };
});

export const Route = createFileRoute("/games/interactive-stories/share/$shareSlug")({
  component: SharedEndingPage,
  head: () => ({
    meta: [
      { title: "Shared Ending · Trey TV Interactive Stories" },
      {
        name: "description",
        content: "Someone shared their story ending with you on Trey TV Interactive Stories.",
      },
    ],
  }),
});

function SharedEndingPage() {
  const { shareSlug } = useParams({ from: "/games/interactive-stories/share/$shareSlug" });

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
                borderColor: "rgba(255,200,87,0.3)",
                boxShadow: "0 0 44px rgba(255,200,87,0.15), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-[10px] font-bold tracking-[0.3em]" style={{ color: "#FFC857" }}>
                TREY TV
              </div>
              <div className="mt-1 text-base font-black">Loading Shared Ending</div>
            </div>
          </div>
        }
      >
        <SharedEndingScreen slug={shareSlug} onBack={() => window.history.back()} />
      </Suspense>
    </div>
  );
}
