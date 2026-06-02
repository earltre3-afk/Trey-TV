import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { useState } from "react";
import { Gift, Plus, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/rewards")({
  component: Rewards,
  head: () => ({ meta: [{ title: "Rewards — Admin" }] }),
});

function Rewards() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    action_key: "",
    description: "",
    points: 10,
    daily_cap: 0,
    lifetime_cap: 0,
  });
  if (!isAdmin) return null;

  const { data: rules } = useQuery({
    queryKey: ["admin", "reward-rules"],
    queryFn: async () =>
      (await supabase.from("reward_rules").select("*").order("action_key")).data ?? [],
  });
  const { data: redemptions } = useQuery({
    queryKey: ["admin", "redemptions"],
    queryFn: async () =>
      (
        await supabase
          .from("reward_redemptions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(100)
      ).data ?? [],
  });

  const refetchRules = () => qc.invalidateQueries({ queryKey: ["admin", "reward-rules"] });
  const refetchRedeem = () => qc.invalidateQueries({ queryKey: ["admin", "redemptions"] });

  const createRule = async () => {
    if (!form.action_key.trim()) return toast.error("Action key required");
    const payload: any = {
      action_key: form.action_key,
      description: form.description,
      points: form.points,
    };
    if (form.daily_cap > 0) payload.daily_cap = form.daily_cap;
    if (form.lifetime_cap > 0) payload.lifetime_cap = form.lifetime_cap;
    const { data: row, error } = await supabase
      .from("reward_rules")
      .insert(payload)
      .select()
      .single();
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "reward_rule_created",
      target_type: "reward_rule",
      target_id: row.id,
    });
    toast.success("Rule created");
    setCreating(false);
    setForm({ action_key: "", description: "", points: 10, daily_cap: 0, lifetime_cap: 0 });
    refetchRules();
  };

  const toggleRule = async (r: any) => {
    const { error } = await supabase
      .from("reward_rules")
      .update({ enabled: !r.enabled })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: r.enabled ? "reward_rule_disabled" : "reward_rule_enabled",
      target_type: "reward_rule",
      target_id: r.id,
    });
    refetchRules();
  };

  const updatePoints = async (r: any) => {
    const v = prompt("New point value:", String(r.points));
    if (v === null) return;
    const points = Number(v);
    if (Number.isNaN(points)) return toast.error("Invalid number");
    const { error } = await supabase.from("reward_rules").update({ points }).eq("id", r.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "reward_rule_updated",
      target_type: "reward_rule",
      target_id: r.id,
      metadata: { points },
    });
    refetchRules();
  };

  const reviewRedeem = async (r: any, status: "fulfilled" | "rejected") => {
    const reason = status === "rejected" ? (prompt("Rejection reason:") ?? "") : "";
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("reward_redemptions")
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq("id", r.id);
    if (error) return toast.error(error.message);
    if (status === "rejected") {
      // refund points
      await supabase.from("reward_ledger").insert({
        user_id: r.user_id,
        action_key: "redeem_refund",
        points: r.points_spent,
        source_type: "redemption",
        source_id: r.id,
        reason: "Rejected",
      });
    }
    await logAdminAction({
      action: `redemption_${status}`,
      target_type: "redemption",
      target_id: r.id,
      reason,
    });
    toast.success(`Redemption ${status}`);
    refetchRedeem();
  };

  return (
    <AdminShell title="Rewards Control" subtitle="Earning rules and redemption review.">
      <section className="rounded-3xl liquid-glass border border-white/10 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold flex items-center gap-2">
            <Gift className="size-4 text-primary" /> Earning rules
          </h2>
          {!creating && (
            <button
              onClick={() => setCreating(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-primary-foreground glow-gold flex items-center gap-1"
            >
              <Plus className="size-3" /> New
            </button>
          )}
        </div>
        {creating && (
          <div className="rounded-2xl glass border border-white/10 p-3 mb-3 space-y-2">
            <input
              value={form.action_key}
              onChange={(e) => setForm({ ...form, action_key: e.target.value })}
              placeholder="action_key (e.g. daily_login)"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
            />
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description"
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                type="number"
                value={form.points}
                onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
                placeholder="Points"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
              />
              <input
                type="number"
                value={form.daily_cap}
                onChange={(e) => setForm({ ...form, daily_cap: Number(e.target.value) })}
                placeholder="Daily cap"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
              />
              <input
                type="number"
                value={form.lifetime_cap}
                onChange={(e) => setForm({ ...form, lifetime_cap: Number(e.target.value) })}
                placeholder="Lifetime cap"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={createRule}
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
        <div className="space-y-2">
          {(rules ?? []).map((r: any) => (
            <div
              key={r.id}
              className="p-3 rounded-2xl glass border border-white/10 flex items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{r.action_key}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1">
                  {r.description}
                </div>
              </div>
              <button
                onClick={() => updatePoints(r)}
                className="text-xs font-bold text-primary px-2 py-1 rounded-lg hover:bg-primary/10"
              >
                +{r.points} pts
              </button>
              {r.daily_cap && (
                <div className="text-[10px] text-muted-foreground">cap {r.daily_cap}/d</div>
              )}
              <button
                onClick={() => toggleRule(r)}
                className={`text-[10px] px-2 py-1 rounded ${r.enabled ? "bg-primary/15 text-primary" : "bg-white/5 text-muted-foreground"}`}
              >
                {r.enabled ? "ON" : "OFF"}
              </button>
            </div>
          ))}
          {(rules?.length ?? 0) === 0 && (
            <div className="text-xs text-muted-foreground text-center p-4">No rules yet.</div>
          )}
        </div>
      </section>

      <section className="rounded-3xl liquid-glass border border-white/10 p-5">
        <h2 className="font-bold mb-3">Redemption queue</h2>
        {(redemptions?.length ?? 0) === 0 ? (
          <div className="text-xs text-muted-foreground text-center p-6">No redemptions yet.</div>
        ) : (
          <div className="space-y-2">
            {redemptions!.map((r: any) => (
              <div
                key={r.id}
                className="p-3 rounded-2xl glass border border-white/10 flex items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{r.redemption_type}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-xs font-bold text-primary">−{r.points_spent} pts</div>
                <div className="text-[10px] text-muted-foreground capitalize">{r.status}</div>
                {r.status === "pending" && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => reviewRedeem(r, "fulfilled")}
                      className="size-8 rounded-lg bg-primary/15 text-primary border border-primary/40 grid place-items-center"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      onClick={() => reviewRedeem(r, "rejected")}
                      className="size-8 rounded-lg glass border border-rose-400/40 text-rose-300 grid place-items-center"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}
