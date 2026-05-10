import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { useState } from "react";
import { ScrollText, Save } from "lucide-react";

export const Route = createFileRoute("/admin/site-editor")({
  component: SiteEditor,
  head: () => ({ meta: [{ title: "Site Editor — Admin" }] }),
});

function SiteEditor() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [edits, setEdits] = useState<Record<string, { title?: string; body?: string }>>({});
  if (!isAdmin) return null;
  const { data } = useQuery({
    queryKey: ["admin", "site-blocks"],
    queryFn: async () => (await supabase.from("site_content_blocks").select("*").order("page")).data ?? [],
  });

  const save = async (block: any) => {
    const e = edits[block.id] ?? {};
    const { error } = await supabase.from("site_content_blocks").update({
      title: e.title ?? block.title,
      body: e.body ?? block.body,
      status: "published",
      updated_at: new Date().toISOString(),
    }).eq("id", block.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: "site_content_edited", target_type: "site_content_blocks", target_id: block.key });
    toast.success("Published");
    setEdits((p) => { const n = { ...p }; delete n[block.id]; return n; });
    qc.invalidateQueries({ queryKey: ["admin", "site-blocks"] });
  };

  return (
    <AdminShell title="Live Site Editor" subtitle="Edit platform copy. Changes go live on save.">
      <div className="space-y-3">
        {(data ?? []).map((b: any) => {
          const e = edits[b.id] ?? {};
          return (
            <div key={b.id} className="p-4 rounded-2xl liquid-glass border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <ScrollText className="size-4 text-primary" />
                <div className="text-[10px] tracking-[0.25em] text-primary uppercase">{b.page}</div>
                <div className="text-[10px] text-muted-foreground">/ {b.key}</div>
              </div>
              <input
                value={e.title ?? b.title ?? ""}
                onChange={(ev) => setEdits((p) => ({ ...p, [b.id]: { ...p[b.id], title: ev.target.value } }))}
                placeholder="Title"
                className="w-full bg-transparent text-sm font-bold border-b border-white/10 pb-1 focus:outline-none focus:border-primary"
              />
              <textarea
                value={e.body ?? b.body ?? ""}
                onChange={(ev) => setEdits((p) => ({ ...p, [b.id]: { ...p[b.id], body: ev.target.value } }))}
                placeholder="Body"
                rows={3}
                className="mt-2 w-full bg-transparent text-xs text-foreground/80 border border-white/10 rounded-xl p-2 focus:outline-none focus:border-primary"
              />
              <button onClick={() => save(b)} className="mt-2 px-3 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1.5 glow-gold">
                <Save className="size-3.5" /> Publish
              </button>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
