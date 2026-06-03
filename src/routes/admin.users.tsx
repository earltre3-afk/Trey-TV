import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logAdminAction } from "@/lib/admin-api";
import { toast } from "sonner";
import { useState } from "react";
import { Search, Shield, ShieldOff, BadgeCheck, Crown, Ban, UserCheck } from "lucide-react";
import { ProfilePictureLink } from "@/components/profile/ProfileAvatarLink";
import { isPublicProfileUid } from "@/lib/profile-links";

export const Route = createFileRoute("/admin/users")({
  component: UsersAdmin,
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
});

function UsersAdmin() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<
    "all" | "active" | "banned" | "suspended" | "gold" | "creators"
  >("all");
  if (!isAdmin) return null;

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", filter, q],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (filter === "banned") query = query.eq("status", "banned");
      else if (filter === "suspended") query = query.eq("status", "suspended");
      else if (filter === "active") query = query.eq("status", "active");
      else if (filter === "gold") query = query.eq("gold_verified", true);
      else if (filter === "creators") query = query.eq("creator_status", "approved");
      if (q.trim())
        query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%,email.ilike.%${q}%`);
      const { data } = await query;
      return data ?? [];
    },
  });

  const refetch = () => qc.invalidateQueries({ queryKey: ["admin", "users"] });

  const ban = async (u: any, days: number | null) => {
    const reason = prompt(
      days ? `Suspend @${u.username} for ${days}d. Reason:` : `Ban @${u.username}. Reason:`,
    );
    if (reason === null) return;
    const banned_until = days ? new Date(Date.now() + days * 86400000).toISOString() : null;
    const { error } = await supabase
      .from("profiles")
      .update({
        status: days ? "suspended" : "banned",
        ban_reason: reason,
        banned_at: new Date().toISOString(),
        banned_until,
      })
      .eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: days ? "user_suspended" : "user_banned",
      target_type: "user",
      target_id: u.id,
      reason,
      metadata: { days },
    });
    toast.success(days ? `Suspended for ${days}d` : "User banned");
    refetch();
  };

  const unban = async (u: any) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        status: "active",
        ban_reason: null,
        banned_at: null,
        banned_until: null,
      })
      .eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: "user_reinstated", target_type: "user", target_id: u.id });
    toast.success("Reinstated");
    refetch();
  };

  const toggleGold = async (u: any) => {
    const next = !u.gold_verified;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({
        gold_verified: next,
        gold_verified_at: next ? new Date().toISOString() : null,
        gold_verified_by: next ? user?.id : null,
      })
      .eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: next ? "gold_granted" : "gold_revoked",
      target_type: "user",
      target_id: u.id,
    });
    toast.success(next ? "Gold granted" : "Gold revoked");
    refetch();
  };

  const toggleCreator = async (u: any) => {
    const next = u.creator_status === "approved" ? "revoked" : "approved";
    const { error } = await supabase
      .from("profiles")
      .update({ creator_status: next })
      .eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({ action: `creator_${next}`, target_type: "user", target_id: u.id });
    toast.success(next === "approved" ? "Creator approved" : "Creator revoked");
    refetch();
  };

  const FILTERS: { id: typeof filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "suspended", label: "Suspended" },
    { id: "banned", label: "Banned" },
    { id: "gold", label: "Gold" },
    { id: "creators", label: "Creators" },
  ];

  return (
    <AdminShell
      title="User Management"
      subtitle="Search, ban, suspend, grant gold, manage creator status."
    >
      <div className="rounded-3xl liquid-glass border border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by username, display name, or email…"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filter === f.id ? "bg-primary/15 text-primary border-primary/40" : "border-white/10 text-muted-foreground hover:bg-white/5"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading && <div className="text-center text-sm text-muted-foreground p-6">Loading…</div>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <div className="rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground">
            No users match.
          </div>
        )}
        {data?.map((u: any) => (
          <div
            key={u.id}
            className="p-4 rounded-2xl liquid-glass border border-white/10 flex items-center gap-3"
          >
            <ProfilePictureLink
              publicProfileUid={u.public_profile_uid}
              label={`Open @${u.username}'s public profile`}
              className="shrink-0"
            >
              <img
                src={u.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`}
                alt=""
                className="size-10 rounded-full object-cover bg-white/5"
              />
            </ProfilePictureLink>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-sm font-bold truncate">{u.display_name || u.username}</div>
                {u.gold_verified && <BadgeCheck className="size-3.5 text-primary" />}
                {u.creator_status === "approved" && <Crown className="size-3.5 text-primary" />}
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${u.status === "active" ? "border-emerald-400/40 text-emerald-300" : u.status === "suspended" ? "border-amber-400/40 text-amber-300" : "border-rose-400/40 text-rose-300"}`}
                >
                  {u.status}
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                @{u.username} · {u.email}
              </div>
              {u.ban_reason && (
                <div className="text-[11px] text-rose-300/80 mt-0.5 italic line-clamp-1">
                  "{u.ban_reason}"
                  {u.banned_until
                    ? ` · until ${new Date(u.banned_until).toLocaleDateString()}`
                    : ""}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {isPublicProfileUid(u.public_profile_uid) && (
                <Link
                  to="/u/$uid"
                  params={{ uid: u.public_profile_uid }}
                  title="View profile"
                  className="grid h-8 place-items-center rounded-lg border border-white/10 px-2 text-[11px] font-semibold glass hover:bg-white/5"
                >
                  View
                </Link>
              )}
              <button
                onClick={() => toggleGold(u)}
                title="Toggle Gold"
                className="size-8 grid place-items-center rounded-lg glass border border-white/10 hover:bg-white/5"
              >
                <BadgeCheck
                  className={`size-4 ${u.gold_verified ? "text-primary" : "text-muted-foreground"}`}
                />
              </button>
              <button
                onClick={() => toggleCreator(u)}
                title="Toggle Creator"
                className="size-8 grid place-items-center rounded-lg glass border border-white/10 hover:bg-white/5"
              >
                <Crown
                  className={`size-4 ${u.creator_status === "approved" ? "text-primary" : "text-muted-foreground"}`}
                />
              </button>
              {u.status === "active" ? (
                <>
                  <button
                    onClick={() => ban(u, 7)}
                    title="Suspend 7d"
                    className="px-2 h-8 rounded-lg text-[11px] font-semibold glass border border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
                  >
                    7d
                  </button>
                  <button
                    onClick={() => ban(u, 30)}
                    title="Suspend 30d"
                    className="px-2 h-8 rounded-lg text-[11px] font-semibold glass border border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
                  >
                    30d
                  </button>
                  <button
                    onClick={() => ban(u, null)}
                    title="Permanent ban"
                    className="size-8 grid place-items-center rounded-lg glass border border-rose-400/40 text-rose-300 hover:bg-rose-400/10"
                  >
                    <Ban className="size-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => unban(u)}
                  title="Reinstate"
                  className="px-2 h-8 rounded-lg text-[11px] font-semibold glass border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10 inline-flex items-center gap-1"
                >
                  <UserCheck className="size-3.5" /> Restore
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
