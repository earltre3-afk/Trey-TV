import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { L as LegalLayout } from "./LegalLayout-r4GVz4bN.mjs";
import { N as LEGAL_CONTACT_EMAIL, O as getPolicy } from "./router-BtgGywEC.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { aF as Trash2, ax as CircleCheck, U as User, h as Mail, bd as AtSign, aM as MessageSquare, f as Send } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "./AppShell-BWcCrjwR.mjs";
import "./Logo-D0JEzEf4.mjs";
import "./trey-tv-logo-CG7PjBoN.mjs";
import "./PublicFooter-CCf5tIyl.mjs";
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
function DataDeletionPage() {
  const policy = getPolicy("data-deletion");
  const [name, setName] = reactExports.useState("");
  const [email, setEmail] = reactExports.useState("");
  const [profile, setProfile] = reactExports.useState("");
  const [type, setType] = reactExports.useState("delete");
  const [message, setMessage] = reactExports.useState("");
  const [submitted, setSubmitted] = reactExports.useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    try {
      const queue = JSON.parse(localStorage.getItem("treytv_data_requests") || "[]");
      queue.push({
        name,
        email,
        profile,
        type,
        message,
        submittedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      localStorage.setItem("treytv_data_requests", JSON.stringify(queue));
    } catch {
    }
    setSubmitted(true);
    toast.success("Request received. We'll follow up by email.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(LegalLayout, { policy, children: /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "form", className: "scroll-mt-24", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-primary/30 p-5 lg:p-7 relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "absolute -top-24 -right-24 size-64 rounded-full bg-[radial-gradient(closest-side,oklch(0.82_0.16_85/0.18),transparent)] blur-2xl" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] tracking-[0.22em] text-primary", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }),
        " SUBMIT A REQUEST"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-2 text-xl sm:text-2xl font-black", children: "Data Action Form" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-xs text-muted-foreground", children: [
        "We'll respond at the email you provide. You can also email",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/80", children: LEGAL_CONTACT_EMAIL }),
        "."
      ] }),
      submitted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 rounded-2xl border border-[oklch(0.78_0.18_150/0.4)] bg-[oklch(0.78_0.18_150/0.08)] p-5 flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-5 text-[oklch(0.78_0.18_150)] shrink-0 mt-0.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold", children: "Request received" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "Thanks, ",
            name.split(" ")[0] || "friend",
            ". We'll review your request and follow up to",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground/80", children: email }),
            " within a reasonable timeframe."
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setProfile("");
            setType("delete");
            setMessage("");
          }, className: "mt-3 text-xs text-primary font-semibold hover:underline", children: "Submit another request" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: submit, className: "mt-5 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-4 text-muted-foreground" }), label: "Full name", value: name, onChange: setName, placeholder: "Your name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4 text-muted-foreground" }), label: "Email", type: "email", value: email, onChange: setEmail, placeholder: "you@example.com" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AtSign, { className: "size-4 text-muted-foreground" }), label: "Username or profile link", value: profile, onChange: setProfile, placeholder: "@yourhandle or treytv.app/u/..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5", children: "REQUEST TYPE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-2", children: [{
            id: "delete",
            label: "Delete account"
          }, {
            id: "export",
            label: "Export data"
          }, {
            id: "correct",
            label: "Correct data"
          }, {
            id: "other",
            label: "Other"
          }].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setType(t.id), className: `px-3 h-10 rounded-xl text-xs font-semibold border transition ${type === t.id ? "border-primary bg-primary/15 text-primary" : "border-white/10 hover:border-white/25 text-foreground/80"}`, children: t.label }, t.id)) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5", children: "MESSAGE" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-2 rounded-xl glass border border-white/10 px-3 py-2 focus-within:border-primary/50 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "size-4 text-muted-foreground mt-1" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: message, onChange: (e) => setMessage(e.target.value), rows: 4, maxLength: 1e3, placeholder: "Tell us what you'd like us to do.", className: "flex-1 bg-transparent text-sm focus:outline-none resize-none" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] text-muted-foreground text-right", children: [
            message.length,
            " / 1000"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "w-full sm:w-auto px-6 h-12 rounded-xl bg-primary text-primary-foreground font-black glow-gold tilt-press inline-flex items-center justify-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-4" }),
          " Submit request"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "By submitting, you confirm the information is accurate and you have the right to make this request." })
      ] })
    ] })
  ] }) }) });
}
function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  icon
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.22em] text-muted-foreground mb-1.5", children: label.toUpperCase() }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition", children: [
      icon,
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type, value, onChange: (e) => onChange(e.target.value), placeholder, className: "flex-1 bg-transparent text-sm focus:outline-none" })
    ] })
  ] });
}
export {
  DataDeletionPage as component
};
