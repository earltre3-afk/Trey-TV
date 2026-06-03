import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { History } from "lucide-react";

export const Route = createFileRoute("/admin/audit-log")({
  component: AuditLog,
  head: () => ({ meta: [{ title: "Audit Log — Admin" }] }),
});

function AuditLog() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return null;
  const { data } = useQuery({
    queryKey: ["admin", "audit-log"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });
  return (
    <AdminShell title="Audit Log" subtitle="Every admin action, recorded.">
      <div className="rounded-3xl liquid-glass border border-white/10 p-4 space-y-2">
        {(data?.length ?? 0) === 0 ? (
          <div className="text-sm text-muted-foreground p-8 text-center flex flex-col items-center gap-2">
            <History className="size-6 text-muted-foreground" />
            No admin actions logged yet.
          </div>
        ) : (
          data!.map((r: any) => (
            <div key={r.id} className="p-3 rounded-2xl glass border border-white/10">
              <div className="flex items-center justify-between gap-2">
                <div className="text-sm font-semibold">{r.action}</div>
                <div className="text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </div>
              </div>
              {r.target_type && (
                <div className="text-[11px] text-muted-foreground">
                  {r.target_type}: {r.target_id}
                </div>
              )}
              {r.reason && (
                <div className="text-[11px] italic text-muted-foreground/80 mt-1">"{r.reason}"</div>
              )}
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
