import { supabase } from "@/integrations/supabase/client";

export type AdminStats = {
  totalUsers: number;
  activeBans: number;
  pendingCreators: number;
  pendingVerifications: number;
  pendingReports: number;
  pendingRedemptions: number;
  goldVerifiedUsers: number;
  totalPointsIssued: number;
  recentAuditCount: number;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const counts = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "banned"),
    supabase.from("creator_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("verification_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("user_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("reward_redemptions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("gold_verified", true),
    supabase.from("admin_audit_log").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()),
  ]);
  const ledger = await supabase.rpc as any; // not used
  let totalPoints = 0;
  const { data: pointsData } = await supabase.from("reward_ledger").select("points");
  if (pointsData) totalPoints = pointsData.reduce((s, r) => s + (r.points ?? 0), 0);

  return {
    totalUsers: counts[0].count ?? 0,
    activeBans: counts[1].count ?? 0,
    pendingCreators: counts[2].count ?? 0,
    pendingVerifications: counts[3].count ?? 0,
    pendingReports: counts[4].count ?? 0,
    pendingRedemptions: counts[5].count ?? 0,
    goldVerifiedUsers: counts[6].count ?? 0,
    totalPointsIssued: totalPoints,
    recentAuditCount: counts[7].count ?? 0,
  };
}

export async function logAdminAction(params: {
  action: string;
  target_type?: string;
  target_id?: string;
  metadata?: Record<string, any>;
  reason?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "no session" };
  const { error } = await supabase.from("admin_audit_log").insert({
    admin_user_id: user.id,
    action: params.action,
    target_type: params.target_type ?? null,
    target_id: params.target_id ?? null,
    metadata: params.metadata ?? {},
    reason: params.reason ?? null,
  });
  return { error: error?.message };
}
