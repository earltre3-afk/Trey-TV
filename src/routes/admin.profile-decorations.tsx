import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { useState } from "react";
import { Palette, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/profile-decorations")({
  component: Decorations,
  head: () => ({ meta: [{ title: "Profile Decorations — Admin" }] }),
});

const TYPES = ["border", "frame", "glow", "banner", "badge"] as const;
const RARITIES = ["common", "rare", "epic", "legendary"] as const;

function Decorations() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "border",
    rarity: "common",
    point_cost: 100,
    gold_only: false,
    creator_only: false,
  });
  if (!isAdmin) return null;

  const { data } = useQuery({
    queryKey: ["admin", "decorations"],
    queryFn: async () =>
      (await supabase.from("profile_decoration_items").select("*").order("rarity")).data ?? [],
  });

  const refetch = () => qc.invalidateQueries({ queryKey: ["admin", "decorations"] });

  const create = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    const { data: row, error } = await supabase
      .from("profile_decoration_items")
      .insert({ ...form })
      .select()
      .single();
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "decoration_created",
      target_type: "decoration",
      target_id: row.id,
    });
    toast.success("Decoration created");
    setCreating(false);
    setForm({
      name: "",
      description: "",
      type: "border",
      rarity: "common",
      point_cost: 100,
      gold_only: false,
      creator_only: false,
    });
    refetch();
  };

  const toggle = async (d: any) => {
    const { error } = await supabase
      .from("profile_decoration_items")
      .update({ enabled: !d.enabled })
      .eq("id", d.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: d.enabled ? "decoration_disabled" : "decoration_enabled",
      target_type: "decoration",
      target_id: d.id,
    });
    refetch();
  };

  const remove = async (d: any) => {
    if (!confirm(`Delete "${d.name}"?`)) return;
    const { error } = await supabase.from("profile_decoration_items").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "decoration_deleted",
      target_type: "decoration",
      target_id: d.id,
    });
    toast.success("Deleted");
    refetch();
  };

  return (
    <AdminShell title="Profile Decorations" subtitle="Borders, frames, glows, banners, badges.">
      <div className="rounded-3xl liquid-glass border border-white/10 p-4">
        {!creating ? (
          <button
            onClick={() => setCreating(true)}
            className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 glow-gold"
          >
            <Plus className="size-4" /> New decoration
          </button>
        ) : (
          <div className="space-y-2">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Name"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
            />
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
            />
            <div className="grid grid-cols-3 gap-2">
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={form.rarity}
                onChange={(e) => setForm({ ...form, rarity: e.target.value })}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={form.point_cost}
                onChange={(e) => setForm({ ...form, point_cost: Number(e.target.value) })}
                placeholder="Cost"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
              />
            </div>
            <div className="flex gap-3 text-xs">
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={form.gold_only}
                  onChange={(e) => setForm({ ...form, gold_only: e.target.checked })}
                />{" "}
                Gold only
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={form.creator_only}
                  onChange={(e) => setForm({ ...form, creator_only: e.target.checked })}
                />{" "}
                Creator only
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={create}
                className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm glow-gold"
              >
                Create
              </button>
              <button
                onClick={() => setCreating(false)}
                className="px-4 py-2 rounded-xl glass border border-white/10 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(data?.length ?? 0) === 0 && (
          <div className="col-span-full text-center text-sm text-muted-foreground p-6">
            No decorations yet.
          </div>
        )}
        {(data ?? []).map((d: any) => (
          <div key={d.id} className="p-4 rounded-2xl liquid-glass border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="size-4 text-primary" />
              <div className="text-[10px] tracking-[0.25em] text-primary uppercase">{d.rarity}</div>
              <div className="ml-auto text-xs font-bold text-primary">{d.point_cost} pts</div>
            </div>
            <div className="text-sm font-bold">{d.name}</div>
            <div className="text-[11px] text-muted-foreground line-clamp-2">{d.description}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/10">
                {d.type}
              </span>
              {d.gold_only && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary">
                  gold
                </span>
              )}
              {d.creator_only && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-primary/15 text-primary">
                  creator
                </span>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => toggle(d)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-semibold border ${d.enabled ? "border-emerald-400/40 text-emerald-300" : "border-white/10 text-muted-foreground"}`}
              >
                {d.enabled ? "Enabled" : "Disabled"}
              </button>
              <button
                onClick={() => remove(d)}
                className="size-8 grid place-items-center rounded-lg glass border border-rose-400/40 text-rose-300"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
