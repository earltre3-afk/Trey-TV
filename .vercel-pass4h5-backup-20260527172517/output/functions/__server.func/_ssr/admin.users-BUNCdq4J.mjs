import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as ProfilePictureLink, i as isPublicProfileUid } from "./AppShell-BWcCrjwR.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { O as Search, as as BadgeCheck, t as Crown, bN as Ban, c4 as UserCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/zod.mjs";
import "node:crypto";
import "node:async_hooks";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
function UsersAdmin() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  const [q, setQ] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  if (!isAdmin) return null;
  const {
    data,
    isLoading
  } = useQuery({
    queryKey: ["admin", "users", filter, q],
    queryFn: async () => {
      let query = supabase.from("profiles").select("*").order("created_at", {
        ascending: false
      }).limit(200);
      if (filter === "banned") query = query.eq("status", "banned");
      else if (filter === "suspended") query = query.eq("status", "suspended");
      else if (filter === "active") query = query.eq("status", "active");
      else if (filter === "gold") query = query.eq("gold_verified", true);
      else if (filter === "creators") query = query.eq("creator_status", "approved");
      if (q.trim()) query = query.or(`username.ilike.%${q}%,display_name.ilike.%${q}%,email.ilike.%${q}%`);
      const {
        data: data2
      } = await query;
      return data2 ?? [];
    }
  });
  const refetch = () => qc.invalidateQueries({
    queryKey: ["admin", "users"]
  });
  const ban = async (u, days) => {
    const reason = prompt(days ? `Suspend @${u.username} for ${days}d. Reason:` : `Ban @${u.username}. Reason:`);
    if (reason === null) return;
    const banned_until = days ? new Date(Date.now() + days * 864e5).toISOString() : null;
    const {
      error
    } = await supabase.from("profiles").update({
      status: days ? "suspended" : "banned",
      ban_reason: reason,
      banned_at: (/* @__PURE__ */ new Date()).toISOString(),
      banned_until
    }).eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: days ? "user_suspended" : "user_banned",
      target_type: "user",
      target_id: u.id,
      reason,
      metadata: {
        days
      }
    });
    toast.success(days ? `Suspended for ${days}d` : "User banned");
    refetch();
  };
  const unban = async (u) => {
    const {
      error
    } = await supabase.from("profiles").update({
      status: "active",
      ban_reason: null,
      banned_at: null,
      banned_until: null
    }).eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "user_reinstated",
      target_type: "user",
      target_id: u.id
    });
    toast.success("Reinstated");
    refetch();
  };
  const toggleGold = async (u) => {
    const next = !u.gold_verified;
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    const {
      error
    } = await supabase.from("profiles").update({
      gold_verified: next,
      gold_verified_at: next ? (/* @__PURE__ */ new Date()).toISOString() : null,
      gold_verified_by: next ? user?.id : null
    }).eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: next ? "gold_granted" : "gold_revoked",
      target_type: "user",
      target_id: u.id
    });
    toast.success(next ? "Gold granted" : "Gold revoked");
    refetch();
  };
  const toggleCreator = async (u) => {
    const next = u.creator_status === "approved" ? "revoked" : "approved";
    const {
      error
    } = await supabase.from("profiles").update({
      creator_status: next
    }).eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: `creator_${next}`,
      target_type: "user",
      target_id: u.id
    });
    toast.success(next === "approved" ? "Creator approved" : "Creator revoked");
    refetch();
  };
  const FILTERS = [{
    id: "all",
    label: "All"
  }, {
    id: "active",
    label: "Active"
  }, {
    id: "suspended",
    label: "Suspended"
  }, {
    id: "banned",
    label: "Banned"
  }, {
    id: "gold",
    label: "Gold"
  }, {
    id: "creators",
    label: "Creators"
  }];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "User Management", subtitle: "Search, ban, suspend, grant gold, manage creator status.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-white/10 p-4 space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search by username, display name, or email…", className: "flex-1 bg-transparent outline-none text-sm" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5", children: FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFilter(f.id), className: `px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${filter === f.id ? "bg-primary/15 text-primary border-primary/40" : "border-white/10 text-muted-foreground hover:bg-white/5"}`, children: f.label }, f.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      isLoading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground p-6", children: "Loading…" }),
      !isLoading && (data?.length ?? 0) === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground", children: "No users match." }),
      data?.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl liquid-glass border border-white/10 flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePictureLink, { publicProfileUid: u.public_profile_uid, label: `Open @${u.username}'s public profile`, className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`, alt: "", className: "size-10 rounded-full object-cover bg-white/5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold truncate", children: u.display_name || u.username }),
            u.gold_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "size-3.5 text-primary" }),
            u.creator_status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3.5 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[10px] px-2 py-0.5 rounded-full border ${u.status === "active" ? "border-emerald-400/40 text-emerald-300" : u.status === "suspended" ? "border-amber-400/40 text-amber-300" : "border-rose-400/40 text-rose-300"}`, children: u.status })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
            "@",
            u.username,
            " · ",
            u.email
          ] }),
          u.ban_reason && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-rose-300/80 mt-0.5 italic line-clamp-1", children: [
            '"',
            u.ban_reason,
            '"',
            u.banned_until ? ` · until ${new Date(u.banned_until).toLocaleDateString()}` : ""
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-1.5 justify-end", children: [
          isPublicProfileUid(u.public_profile_uid) && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$uid", params: {
            uid: u.public_profile_uid
          }, title: "View profile", className: "grid h-8 place-items-center rounded-lg border border-white/10 px-2 text-[11px] font-semibold glass hover:bg-white/5", children: "View" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleGold(u), title: "Toggle Gold", className: "size-8 grid place-items-center rounded-lg glass border border-white/10 hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: `size-4 ${u.gold_verified ? "text-primary" : "text-muted-foreground"}` }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => toggleCreator(u), title: "Toggle Creator", className: "size-8 grid place-items-center rounded-lg glass border border-white/10 hover:bg-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: `size-4 ${u.creator_status === "approved" ? "text-primary" : "text-muted-foreground"}` }) }),
          u.status === "active" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => ban(u, 7), title: "Suspend 7d", className: "px-2 h-8 rounded-lg text-[11px] font-semibold glass border border-amber-400/30 text-amber-300 hover:bg-amber-400/10", children: "7d" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => ban(u, 30), title: "Suspend 30d", className: "px-2 h-8 rounded-lg text-[11px] font-semibold glass border border-amber-400/30 text-amber-300 hover:bg-amber-400/10", children: "30d" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => ban(u, null), title: "Permanent ban", className: "size-8 grid place-items-center rounded-lg glass border border-rose-400/40 text-rose-300 hover:bg-rose-400/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "size-4" }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => unban(u), title: "Reinstate", className: "px-2 h-8 rounded-lg text-[11px] font-semibold glass border border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/10 inline-flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCheck, { className: "size-3.5" }),
            " Restore"
          ] })
        ] })
      ] }, u.id))
    ] })
  ] });
}
export {
  UsersAdmin as component
};
