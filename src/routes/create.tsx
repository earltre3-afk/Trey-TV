import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useGoBack } from "@/hooks/use-go-back";
import { AppShell } from "@/components/layout/AppShell";
import { Composer } from "@/components/feed/Composer";

export const Route = createFileRoute("/create")({
  component: Create,
  head: () => ({ meta: [{ title: "Create — Trey TV" }] }),
  validateSearch: (search): { type?: string } => ({
    type: (search.type as string) || undefined,
  }),
});

function Create() {
  const goBack = useGoBack("/");
  const { type } = Route.useSearch();

  return (
    <AppShell>
      <div className="space-y-4">
        <div className="flex items-center">
          <button
            onClick={goBack}
            className="size-9 grid place-items-center rounded-full glass"
            aria-label="Back"
          >
            <ArrowLeft className="size-4" />
          </button>
        </div>
        <Composer initialPostType={type} />
      </div>
    </AppShell>
  );
}
