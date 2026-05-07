import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";

export const Route = createFileRoute("/admin/users")({
  component: () => (
    <AdminShell title="Users" subtitle="Manage member accounts.">
      <div className="rounded-3xl glass neon-border p-8 text-center text-sm text-muted-foreground">User management coming soon. {/* TODO: wire to backend */}</div>
    </AdminShell>
  ),
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
});
