import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";

export const Route = createFileRoute("/admin/reports")({
  component: () => (
    <AdminShell title="Reports" subtitle="Moderation queue.">
      <div className="rounded-3xl glass neon-border p-8 text-center text-sm text-muted-foreground">Report management coming soon. {/* TODO */}</div>
    </AdminShell>
  ),
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
});
