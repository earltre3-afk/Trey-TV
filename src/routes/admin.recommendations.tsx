import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";

export const Route = createFileRoute("/admin/recommendations")({
  component: () => (
    <AdminShell title="Recommendations" subtitle="Tune the Trey-I recommendation engine.">
      <div className="rounded-3xl glass neon-border p-8 text-center text-sm text-muted-foreground">
        Recommendation tools coming soon. {/* TODO */}
      </div>
    </AdminShell>
  ),
  head: () => ({ meta: [{ title: "Recommendations — Admin" }] }),
});
