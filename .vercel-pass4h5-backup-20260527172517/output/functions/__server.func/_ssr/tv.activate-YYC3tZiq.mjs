import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, g as useSearch, L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { a2 as Tv, az as LoaderCircle, ax as CircleCheck, bs as CircleX } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
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
function normalizeCode(value) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}
function displayCode(value) {
  const normalized = normalizeCode(value);
  return normalized.length > 4 ? `${normalized.slice(0, 4)}-${normalized.slice(4)}` : normalized;
}
function TvActivatePage() {
  const nav = useNavigate();
  const search = useSearch({
    strict: false
  });
  const {
    session,
    user,
    loading
  } = useSupabaseSession();
  const [code, setCode] = reactExports.useState(displayCode(typeof search?.code === "string" ? search.code : ""));
  const [busy, setBusy] = reactExports.useState(false);
  const [message, setMessage] = reactExports.useState("");
  const [approved, setApproved] = reactExports.useState(false);
  const returnPath = reactExports.useMemo(() => {
    const params = new URLSearchParams();
    if (code) params.set("code", normalizeCode(code));
    return `/tv/activate${params.toString() ? `?${params.toString()}` : ""}`;
  }, [code]);
  reactExports.useEffect(() => {
    if (!loading && !session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", returnPath);
      } catch {
      }
    }
  }, [loading, returnPath, session]);
  async function approve(decision) {
    const normalized = normalizeCode(code);
    if (!session || !normalized || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/tv/device/approve", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_code: normalized,
          decision
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(typeof payload.error === "string" ? payload.error : "Could not link that TV device.");
        return;
      }
      setApproved(decision === "approve");
      setMessage(decision === "approve" ? "This TV is linked. You can return to the TV app." : "This TV request was denied.");
    } catch {
      setMessage("Network error. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen overflow-hidden bg-[#05040b] text-white", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,214,255,.22),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,64,190,.18),transparent_34%),linear-gradient(135deg,#05040b,#100822_55%,#030611)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "inline-flex w-fit items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-10 w-10" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black uppercase tracking-[0.28em] text-primary", children: "Trey TV" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "grid flex-1 place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xl rounded-[2rem] border border-white/12 bg-white/[0.07] p-6 shadow-[0_0_60px_rgba(35,215,255,.16)] backdrop-blur-2xl sm:p-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tv, { className: "h-6 w-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black", children: "Activate Your TV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-white/62", children: "Enter the code shown on your Trey TV streaming-box app." })
          ] })
        ] }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-white/70", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
          "Checking your Trey TV sign-in..."
        ] }) : !session ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100", children: "Sign in to Trey TV first, then you can approve this TV device." }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => nav({
            to: "/login"
          }), className: "w-full rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-[0_0_25px_rgba(255,200,87,.22)]", children: "Sign In To Continue" })
        ] }) : approved ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-emerald-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "h-5 w-5" }),
            message
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-white/60", children: [
            "Signed in as ",
            user?.email ?? "your Trey TV account",
            "."
          ] })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/55", children: "TV Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: code, onChange: (event) => setCode(displayCode(event.target.value)), placeholder: "ABCD-1234", inputMode: "text", className: "w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-4 text-center text-4xl font-black tracking-[0.2em] text-white outline-none focus:border-cyan-300/60" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-3 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: busy || normalizeCode(code).length < 8, onClick: () => approve("approve"), className: "rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50", children: busy ? "Linking..." : "Link This TV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", disabled: busy || normalizeCode(code).length < 8, onClick: () => approve("deny"), className: "rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50", children: "Deny" })
          ] }),
          message ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "h-4 w-4" }),
            message
          ] }) : null,
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-white/45", children: "Device codes expire after a few minutes. Restart sign-in on the TV if this code no longer works." })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  TvActivatePage as component
};
