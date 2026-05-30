import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { A as AppShell } from "./AppShell-BWcCrjwR.mjs";
import { g as useSupabaseSession, s as supabase } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { as as BadgeCheck } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
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
const CATEGORIES = ["music_artist", "content_creator", "influencer", "business", "public_figure", "athlete", "media_personality", "other"];
function VerificationApply() {
  const {
    user
  } = useSupabaseSession();
  const nav = useNavigate();
  const [category, setCategory] = reactExports.useState("content_creator");
  const [notable, setNotable] = reactExports.useState("");
  const [explanation, setExplanation] = reactExports.useState("");
  const [official, setOfficial] = reactExports.useState("");
  const [refs, setRefs] = reactExports.useState("");
  const [agree, setAgree] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (!user) return toast.error("Sign in to apply");
    if (!agree) return toast.error("Please confirm the information is accurate");
    setBusy(true);
    const {
      error
    } = await supabase.from("verification_applications").insert({
      user_id: user.id,
      category,
      notable_for: notable,
      explanation,
      official_links: official.split("\n").map((s) => s.trim()).filter(Boolean),
      reference_links: refs.split("\n").map((s) => s.trim()).filter(Boolean)
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Application submitted");
    nav({
      to: "/settings"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AppShell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-2xl mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-primary/30 p-5 glow-gold flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-2xl bg-primary/15 text-primary grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BadgeCheck, { className: "size-5" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.3em] text-primary", children: "GOLD VERIFICATION" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Apply for Gold Verification" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: "For notable creators, public figures, businesses, and more." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "rounded-3xl liquid-glass border border-white/10 p-5 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), className: "w-full bg-transparent rounded-xl glass border border-white/10 px-3 h-10 text-sm focus:outline-none focus:border-primary", children: CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c, className: "bg-background", children: c.replace(/_/g, " ") }, c)) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "What are you notable for?", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: notable, onChange: (e) => setNotable(e.target.value), className: "w-full bg-transparent rounded-xl glass border border-white/10 px-3 h-10 text-sm focus:outline-none focus:border-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Explanation", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: explanation, onChange: (e) => setExplanation(e.target.value), rows: 3, className: "w-full bg-transparent rounded-xl glass border border-white/10 p-3 text-sm focus:outline-none focus:border-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Official links (one per line)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: official, onChange: (e) => setOfficial(e.target.value), rows: 3, placeholder: "https://yourwebsite.com\nhttps://instagram.com/you", className: "w-full bg-transparent rounded-xl glass border border-white/10 p-3 text-sm focus:outline-none focus:border-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Reference links (press, streaming, etc.)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: refs, onChange: (e) => setRefs(e.target.value), rows: 3, className: "w-full bg-transparent rounded-xl glass border border-white/10 p-3 text-sm focus:outline-none focus:border-primary" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: agree, onChange: (e) => setAgree(e.target.checked), className: "mt-0.5" }),
        "I confirm the submitted information and links are accurate."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, className: "w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold glow-gold disabled:opacity-60", children: busy ? "Submitting…" : "Submit application" })
    ] })
  ] }) });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-1", children: label.toUpperCase() }),
    children
  ] });
}
export {
  VerificationApply as component
};
