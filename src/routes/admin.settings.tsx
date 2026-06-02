import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: PlatformSettings,
  head: () => ({ meta: [{ title: "Platform Settings — Admin" }] }),
});

function PlatformSettings() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  if (!isAdmin) return null;
  const { data } = useQuery({
    queryKey: ["admin", "platform-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*").order("key");
      return data ?? [];
    },
  });

  const toggle = async (key: string, current: any) => {
    const next = !(current === true);
    const { error } = await supabase
      .from("platform_settings")
      .update({ value: next, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "platform_setting_changed",
      target_type: "platform_settings",
      target_id: key,
      metadata: { from: current, to: next },
    });
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["admin", "platform-settings"] });
  };

  return (
    <AdminShell title="Platform Settings" subtitle="Toggle modules and platform-level controls.">
      <div className="rounded-3xl liquid-glass border border-white/10 p-2 divide-y divide-white/5">
        {(data ?? []).map((row: any) => {
          const isBool = row.value === true || row.value === false;
          return (
            <div key={row.key} className="flex items-center gap-3 p-3">
              <SettingsIcon className="size-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{row.key}</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {JSON.stringify(row.value)}
                </div>
              </div>
              {isBool && (
                <button
                  onClick={() => toggle(row.key, row.value)}
                  className={`px-3 h-8 rounded-lg text-xs font-bold ${row.value ? "bg-primary text-primary-foreground glow-gold" : "glass border border-white/10 text-muted-foreground"}`}
                >
                  {row.value ? "ON" : "OFF"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
