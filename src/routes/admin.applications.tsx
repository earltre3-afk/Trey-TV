import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { Crown, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/applications")({
  component: Applications,
  head: () => ({ meta: [{ title: "Creator Applications — Admin" }] }),
});

function Applications() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  if (!isAdmin) return null;
  const { data } = useQuery({
    queryKey: ["admin", "creator-apps"],
    queryFn: async () => {
      const { data } = await supabase.from("creator_applications").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const review = async (id: string, userId: string, status: "approved" | "rejected" | "needs_more_info") => {
    const reason = status !== "approved" ? prompt("Reason / notes:") ?? "" : "";
    const { error } = await supabase.from("creator_applications").update({
      status, review_notes: reason, reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) return toast.error(error.message);
    if (status === "approved") {
      await supabase.from("profiles").update({ creator_status: "approved" }).eq("id", userId);
    } else if (status === "rejected") {
      await supabase.from("profiles").update({ creator_status: "rejected" }).eq("id", userId);
    }
    await logAdminAction({ action: `creator_application_${status}`, target_type: "creator_application", target_id: id, reason });
    toast.success(`Application ${status}`);
    qc.invalidateQueries({ queryKey: ["admin", "creator-apps"] });
  };

  return (
    <AdminShell title="Creator Applications" subtitle="Approve, reject, or request more info.">
      <div className="space-y-2">
        {(data?.length ?? 0) === 0 ? (
          <div className="rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <Crown className="size-6 text-muted-foreground" />
            No pending applications.
          </div>
        ) : data!.map((a: any) => (
          <div key={a.id} className="p-4 rounded-2xl liquid-glass border border-white/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] tracking-[0.25em] text-primary">{a.status.toUpperCase()}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-bold mt-1 truncate">User {a.user_id.slice(0, 8)}…</div>
                {a.niche && <div className="text-xs text-muted-foreground">Niche: {a.niche}</div>}
                {a.bio && <div className="text-xs text-foreground/80 mt-1 line-clamp-2">{a.bio}</div>}
                {a.reason && <div className="text-xs text-muted-foreground mt-1 italic">"{a.reason}"</div>}
              </div>
              {a.status === "pending" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => review(a.id, a.user_id, "approved")} className="size-9 rounded-xl bg-primary/15 text-primary border border-primary/40 grid place-items-center hover:bg-primary/25"><Check className="size-4" /></button>
                  <button onClick={() => review(a.id, a.user_id, "rejected")} className="size-9 rounded-xl bg-[oklch(0.65_0.24_15_/_0.15)] text-[oklch(0.65_0.24_15)] border border-[oklch(0.65_0.24_15_/_0.4)] grid place-items-center hover:bg-[oklch(0.65_0.24_15_/_0.25)]"><X className="size-4" /></button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
