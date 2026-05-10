import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { Crown, BadgeCheck } from "lucide-react";

export const Route = createFileRoute("/admin/creators")({
  component: CreatorsAdmin,
  head: () => ({ meta: [{ title: "Creators — Admin" }] }),
});

function CreatorsAdmin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  if (!isAdmin) return null;

  const { data } = useQuery({
    queryKey: ["admin", "creators"],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("creator_status", "approved").order("created_at", { ascending: false }).limit(200)).data ?? [],
  });

  const revoke = async (u: any) => {
    const reason = prompt(`Revoke creator status for @${u.username}? Reason:`);
    if (reason === null) return;
    const { error } = await supabase.from("profiles").update({ creator_status: "revoked" }).eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: "creator_revoked", target_type: "user", target_id: u.id, reason });
    toast.success("Creator revoked");
    qc.invalidateQueries({ queryKey: ["admin", "creators"] });
  };

  return (
    <AdminShell title="Creator Management" subtitle="All approved creators on Trey TV.">
      <div className="rounded-3xl liquid-glass border border-white/10 p-4 space-y-2">
        {(data?.length ?? 0) === 0 ? (
          <div className="text-center text-sm text-muted-foreground p-6">No approved creators yet.</div>
        ) : data!.map((u: any) => (
          <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl glass border border-white/10">
            <img src={u.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`} className="size-10 rounded-full object-cover bg-white/5" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold flex items-center gap-1 truncate">
                {u.display_name || u.username} <Crown className="size-3 text-primary" /> {u.gold_verified && <BadgeCheck className="size-3 text-primary" />}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">@{u.username}</div>
            </div>
            <Link to="/u/$uid" params={{ uid: u.id }} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10">View</Link>
            <button onClick={() => revoke(u)} className="px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-rose-400/40 text-rose-300 hover:bg-rose-400/10">Revoke</button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
