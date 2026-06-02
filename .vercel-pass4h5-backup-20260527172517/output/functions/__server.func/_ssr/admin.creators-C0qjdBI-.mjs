import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { P as ProfilePictureLink, i as isPublicProfileUid } from "./AppShell-BWcCrjwR.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { t as Crown, as as BadgeCheck } from "../_libs/lucide-react.mjs";
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
function CreatorsAdmin() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "creators"],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("creator_status", "approved").order("created_at", {
      ascending: false
    }).limit(200)).data ?? []
  });
  const revoke = async (u) => {
    const reason = prompt(`Revoke creator status for @${u.username}? Reason:`);
    if (reason === null) return;
    const {
      error
    } = await supabase.from("profiles").update({
      creator_status: "revoked"
    }).eq("id", u.id);
    if (error) return toast.error(error.message);
    await logAdminAction({
      action: "creator_revoked",
      target_type: "user",
      target_id: u.id,
      reason
    });
    toast.success("Creator revoked");
    qc.invalidateQueries({
      queryKey: ["admin", "creators"]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AdminShell, { title: "Creator Management", subtitle: "All approved creators on Trey TV.", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-4 space-y-2", children: (data?.length ?? 0) === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-sm text-muted-foreground p-6", children: "No approved creators yet." }) : data.map((u) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 p-3 rounded-2xl glass border border-white/10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ProfilePictureLink, { publicProfileUid: u.public_profile_uid, label: `Open @${u.username}'s public profile`, className: "shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: u.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`, className: "size-10 rounded-full object-cover bg-white/5", alt: "" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm font-semibold flex items-center gap-1 truncate", children: [
        u.display_name || u.username,
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Crown, { className: "size-3 text-primary" }),
        " ",
        u.gold_verified && /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "size-3 text-primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
        "@",
        u.username
      ] })
    ] }),
    isPublicProfileUid(u.public_profile_uid) && /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/u/$uid", params: {
      uid: u.public_profile_uid
    }, className: "px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-white/10", children: "View" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => revoke(u), className: "px-3 py-1.5 rounded-lg text-xs font-semibold glass border border-rose-400/40 text-rose-300 hover:bg-rose-400/10", children: "Revoke" })
  ] }, u.id)) }) });
}
export {
  CreatorsAdmin as component
};
