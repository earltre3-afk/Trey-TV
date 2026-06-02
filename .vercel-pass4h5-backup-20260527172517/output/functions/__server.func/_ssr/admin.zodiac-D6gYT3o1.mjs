import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as AdminShell } from "./AdminShell-DTn6ktTs.mjs";
import { b as useAuth$1, s as supabase } from "./router-BtgGywEC.mjs";
import { l as logAdminAction } from "./admin-api-D2pvH5CQ.mjs";
import { c as calculateZodiacIdentity } from "./zodiac-BJiAMBSd.mjs";
import { Z as ZodiacBadge } from "./ZodiacBadge-DoSkSIG_.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { S as Sparkles, l as ShieldCheck, aG as Save } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
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
function AdminZodiac() {
  const {
    isAdmin
  } = useAuth$1();
  const qc = useQueryClient();
  const [query, setQuery] = reactExports.useState("");
  const [editing, setEditing] = reactExports.useState(null);
  const [birthLocation, setBirthLocation] = reactExports.useState("");
  const [birthTimePrecision, setBirthTimePrecision] = reactExports.useState("unknown");
  const [birthTimeLocal, setBirthTimeLocal] = reactExports.useState("");
  const [birthTimezone, setBirthTimezone] = reactExports.useState("");
  const [reason, setReason] = reactExports.useState("");
  if (!isAdmin) return null;
  const {
    data
  } = useQuery({
    queryKey: ["admin", "zodiac", query],
    queryFn: async () => {
      let q = supabase.from("profiles").select("id, display_name, username, date_of_birth, location, zodiac_sun_sign, zodiac_is_cusp, zodiac_cusp_label, zodiac_badge_key, zodiac_locked_at, birth_location_label, birth_time_precision, birth_time_local, birth_timezone, birth_chart_json").order("updated_at", {
        ascending: false
      }).limit(100);
      if (query.trim()) q = q.or(`username.ilike.%${query.trim()}%,display_name.ilike.%${query.trim()}%`);
      const {
        data: data2,
        error
      } = await q;
      if (error) throw error;
      return data2 ?? [];
    }
  });
  const beginEdit = (profile) => {
    setEditing(profile);
    setBirthLocation(profile.birth_location_label ?? profile.location ?? "");
    setBirthTimePrecision(profile.birth_time_precision ?? "unknown");
    setBirthTimeLocal(profile.birth_time_local ?? "");
    setBirthTimezone(profile.birth_timezone ?? "");
    setReason("");
  };
  const preview = editing?.date_of_birth ? calculateZodiacIdentity({
    dateOfBirth: editing.date_of_birth,
    birthLocationLabel: birthLocation,
    birthTimePrecision,
    birthTimeLocal,
    birthTimezone
  }) : null;
  const saveCorrection = async () => {
    if (!editing || !preview || !reason.trim()) {
      toast.error("Add a correction reason first");
      return;
    }
    const {
      data: auth
    } = await supabase.auth.getUser();
    const adminUserId = auth.user?.id;
    if (!adminUserId) return;
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const previous = {
      zodiac_sun_sign: editing.zodiac_sun_sign,
      zodiac_is_cusp: editing.zodiac_is_cusp,
      zodiac_cusp_label: editing.zodiac_cusp_label,
      zodiac_badge_key: editing.zodiac_badge_key,
      birth_chart_json: editing.birth_chart_json
    };
    const corrected = {
      zodiac_sun_sign: preview.sunSign,
      zodiac_is_cusp: preview.isCusp,
      zodiac_cusp_label: preview.cuspLabel,
      zodiac_badge_key: preview.badgeKey,
      birth_time_local: birthTimePrecision === "exact" && birthTimeLocal ? birthTimeLocal : null,
      birth_time_precision: birthTimePrecision,
      birth_location_label: birthLocation || null,
      birth_timezone: birthTimezone || null,
      birth_chart_json: preview.chart,
      birth_chart_generated_at: now,
      zodiac_locked_at: editing.zodiac_locked_at ?? now,
      zodiac_corrected_at: now,
      zodiac_corrected_by: adminUserId,
      updated_at: now
    };
    const {
      error
    } = await supabase.from("profiles").update(corrected).eq("id", editing.id);
    if (error) return toast.error(error.message);
    await supabase.from("zodiac_identity_corrections").insert({
      user_id: editing.id,
      admin_user_id: adminUserId,
      reason: reason.trim(),
      previous_identity: previous,
      corrected_identity: corrected
    });
    await logAdminAction({
      action: "zodiac_identity_corrected",
      target_type: "profile",
      target_id: editing.id,
      reason: reason.trim(),
      metadata: {
        previous,
        corrected
      }
    });
    toast.success("Zodiac identity corrected");
    setEditing(null);
    qc.invalidateQueries({
      queryKey: ["admin", "zodiac"]
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { title: "Zodiac Support", subtitle: "Correct locked zodiac identities without opening casual profile editing.", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-5 text-primary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (event) => setQuery(event.target.value), placeholder: "Search by username or display name", className: "h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-primary/50" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid gap-3", children: (data ?? []).map((profile) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl liquid-glass border border-white/10 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black", children: profile.display_name || profile.username || profile.id }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
          "@",
          profile.username ?? "no-handle",
          " · ",
          profile.date_of_birth ? "DOB on file" : "No DOB"
        ] })
      ] }),
      profile.zodiac_sun_sign ? /* @__PURE__ */ jsxRuntimeExports.jsx(ZodiacBadge, { sign: profile.zodiac_sun_sign, isCusp: !!profile.zodiac_is_cusp, cuspLabel: profile.zodiac_cusp_label, size: "sm", showName: true }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "No zodiac" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => beginEdit(profile), className: "h-9 rounded-xl bg-primary px-3 text-xs font-black text-primary-foreground", children: "Correct" })
    ] }) }, profile.id)) }),
    editing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 grid place-items-center bg-black/70 p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xl rounded-3xl liquid-glass border border-primary/30 p-5 shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-5 text-primary" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-black", children: "Support correction" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "This writes an admin correction record and keeps zodiac locked." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: birthLocation, onChange: (event) => setBirthLocation(event.target.value), placeholder: "Birth location label", className: "h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: birthTimezone, onChange: (event) => setBirthTimezone(event.target.value), placeholder: "Birth timezone, e.g. America/Chicago", className: "h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: birthTimePrecision, onChange: (event) => setBirthTimePrecision(event.target.value), className: "h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "unknown", children: "I don't know" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "morning", children: "Morning" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "afternoon", children: "Afternoon" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "evening", children: "Evening" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "night", children: "Night" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "exact", children: "Exact time" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "time", value: birthTimeLocal, onChange: (event) => setBirthTimeLocal(event.target.value), className: "h-10 rounded-xl border border-white/10 bg-white/5 px-3 text-sm outline-none" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: reason, onChange: (event) => setReason(event.target.value), placeholder: "Correction reason required", rows: 3, className: "rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none" })
      ] }),
      preview && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ZodiacBadge, { sign: preview.sunSign, isCusp: preview.isCusp, cuspLabel: preview.cuspLabel, showName: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 text-[11px] text-muted-foreground", children: [
          preview.calculationMethod.replaceAll("_", " "),
          " · ",
          preview.confidence.replace("_", " ")
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setEditing(null), className: "h-10 flex-1 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold", children: "Cancel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: saveCorrection, className: "h-10 flex-1 rounded-xl bg-primary text-sm font-black text-primary-foreground inline-flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "size-4" }),
          " Save Correction"
        ] })
      ] })
    ] }) })
  ] });
}
export {
  AdminZodiac as component
};
