import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { useState } from "react";
import { Flag, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: ReportsAdmin,
  head: () => ({ meta: [{ title: "Reports — Admin" }] }),
});

function ReportsAdmin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "resolved" | "dismissed" | "all">("pending");
  if (!isAdmin) return null;

  const { data } = useQuery({
    queryKey: ["admin", "reports", tab],
    queryFn: async () => {
      let userReports = supabase.from("user_reports").select("*").order("created_at", { ascending: false }).limit(200);
      let groupReports = (supabase as any).from("zodiac_group_reports").select("*, group:zodiac_group_threads(group_name, group_key)").order("created_at", { ascending: false }).limit(200);
      if (tab !== "all") {
        userReports = userReports.eq("status", tab);
        groupReports = groupReports.eq("status", tab);
      }
      const [users, groups] = await Promise.all([userReports, groupReports]);
      return [
        ...((users.data ?? []) as any[]).map((row) => ({ ...row, report_table: "user_reports" })),
        ...((groups.data ?? []) as any[]).map((row) => ({
          ...row,
          report_table: "zodiac_group_reports",
          target_type: row.message_id ? "zodiac_group_message" : "zodiac_group",
          target_id: row.message_id ?? row.group_thread_id,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  const resolve = async (r: any, status: "resolved" | "dismissed") => {
    const reason = prompt(`Notes for ${status}:`) ?? "";
    const { data: { user } } = await supabase.auth.getUser();
    const table = r.report_table === "zodiac_group_reports" ? "zodiac_group_reports" : "user_reports";
    const { error } = await (supabase as any).from(table).update({
      status, resolved_at: new Date().toISOString(), resolved_by: user?.id,
    }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: `report_${status}`, target_type: table, target_id: r.id, reason, metadata: { target_type: r.target_type, target_id: r.target_id } });
    toast.success(`Report ${status}`);
    qc.invalidateQueries({ queryKey: ["admin", "reports"] });
  };

  const TABS = ["pending", "resolved", "dismissed", "all"] as const;

  return (
    <AdminShell title="Reports Center" subtitle="Investigate and act on user reports.">
      <div className="rounded-2xl liquid-glass border border-white/10 p-1.5 flex gap-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold capitalize ${tab === t ? "bg-primary/15 text-primary border border-primary/40" : "text-muted-foreground hover:bg-white/5 border border-transparent"}`}>
            {t}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {(data?.length ?? 0) === 0 ? (
          <div className="rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Flag className="size-6" /> No reports.
          </div>
        ) : data!.map((r: any) => (
          <div key={r.id} className="p-4 rounded-2xl liquid-glass border border-white/10">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] tracking-[0.25em] px-2 py-0.5 rounded uppercase ${r.status === "pending" ? "bg-amber-400/10 text-amber-300" : r.status === "resolved" ? "bg-emerald-400/10 text-emerald-300" : "bg-white/5 text-muted-foreground"}`}>{r.status}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
                </div>
                <div className="text-sm font-bold mt-1">{r.reason}</div>
                <div className="text-[11px] text-muted-foreground">{r.target_type} · {r.group?.group_name ?? r.target_id}</div>
                {r.details && <div className="text-xs text-foreground/80 mt-1 line-clamp-3">{r.details}</div>}
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => resolve(r, "resolved")} className="size-9 rounded-xl bg-primary/15 text-primary border border-primary/40 grid place-items-center"><Check className="size-4" /></button>
                  <button onClick={() => resolve(r, "dismissed")} className="size-9 rounded-xl glass border border-white/10 grid place-items-center"><X className="size-4" /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
