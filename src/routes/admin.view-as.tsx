import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { Eye, User, Crown, BadgeCheck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/view-as")({
  component: ViewAs,
  head: () => ({ meta: [{ title: "View As — Admin" }] }),
});

function ViewAs() {
  const { isAdmin, setRole } = useAuth();
  const nav = useNavigate();
  if (!isAdmin) return null;
  const opts = [
    { role: "guest" as const, label: "Guest (signed out)", icon: Eye },
    { role: "user" as const, label: "Normal user", icon: User },
    { role: "creator" as const, label: "Approved creator", icon: Crown },
    { role: "admin" as const, label: "Admin", icon: ShieldCheck },
  ];
  return (
    <AdminShell
      title="View As"
      subtitle="Preview the app from any perspective. Real permissions are unchanged."
    >
      <div className="rounded-3xl liquid-glass border border-primary/30 p-4 mb-3 glow-gold text-xs text-primary">
        Preview mode — your real admin role is preserved on the server.
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {opts.map((o) => (
          <button
            key={o.role}
            onClick={() => {
              setRole(o.role);
              nav({ to: "/" });
            }}
            className="p-4 rounded-2xl liquid-glass border border-white/10 hover:border-primary/40 transition flex items-center gap-3 text-left"
          >
            <div className="size-10 rounded-xl bg-primary/15 text-primary grid place-items-center">
              <o.icon className="size-4" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold">{o.label}</div>
              <div className="text-[11px] text-muted-foreground">Open the app as this role</div>
            </div>
          </button>
        ))}
      </div>
    </AdminShell>
  );
}
