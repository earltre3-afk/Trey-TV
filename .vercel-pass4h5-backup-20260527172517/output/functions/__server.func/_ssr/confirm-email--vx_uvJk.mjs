import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { B as Route$1j, s as supabase } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { bp as CircleCheckBig, h as Mail, S as Sparkles, b0 as RefreshCw, A as ArrowLeft } from "../_libs/lucide-react.mjs";
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
const POLL_INTERVAL_MS = 4e3;
const POLL_TIMEOUT_MS = 3e4;
function ConfirmEmail() {
  const {
    email
  } = Route$1j.useSearch();
  const nav = useNavigate();
  const [checking, setChecking] = reactExports.useState(false);
  const [resending, setResending] = reactExports.useState(false);
  const [timedOut, setTimedOut] = reactExports.useState(false);
  const [confirmed, setConfirmed] = reactExports.useState(false);
  const pollRef = reactExports.useRef(null);
  const timeoutRef = reactExports.useRef(null);
  const checkConfirmation = reactExports.useCallback(async () => {
    try {
      await supabase.auth.refreshSession();
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        return true;
      }
    } catch {
    }
    return false;
  }, []);
  const handleConfirmed = reactExports.useCallback(() => {
    setConfirmed(true);
    if (pollRef.current) clearInterval(pollRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setTimeout(() => nav({
      to: "/onboarding"
    }), 1200);
  }, [nav]);
  reactExports.useEffect(() => {
    pollRef.current = setInterval(async () => {
      const ok = await checkConfirmation();
      if (ok) handleConfirmed();
    }, POLL_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      setTimedOut(true);
    }, POLL_TIMEOUT_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [checkConfirmation, handleConfirmed]);
  const handleManualCheck = async () => {
    setChecking(true);
    const ok = await checkConfirmation();
    setChecking(false);
    if (ok) {
      handleConfirmed();
    } else {
      toast.error("We haven't received your confirmation yet. Check your inbox and click the link.");
    }
  };
  const handleResend = async () => {
    if (!email) {
      toast.error("Email address is missing. Go back and sign up again.");
      return;
    }
    setResending(true);
    try {
      const {
        error
      } = await supabase.auth.resend({
        type: "signup",
        email
      });
      if (error) {
        toast.error("Couldn't resend. If the problem continues, try signing up again.");
      } else {
        toast.success("Confirmation email resent. Check your inbox.");
        setTimedOut(false);
        if (pollRef.current) clearInterval(pollRef.current);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        pollRef.current = setInterval(async () => {
          const ok = await checkConfirmation();
          if (ok) handleConfirmed();
        }, POLL_INTERVAL_MS);
        timeoutRef.current = setTimeout(() => {
          if (pollRef.current) clearInterval(pollRef.current);
          setTimedOut(true);
        }, POLL_TIMEOUT_MS);
      }
    } finally {
      setResending(false);
    }
  };
  if (confirmed) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BackdropGlow, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm w-full mx-auto px-6 text-center space-y-5 animate-rise", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-8 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-16 rounded-full border border-green-400/30 bg-green-400/10 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "size-8 text-green-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Email confirmed!" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Taking you into Trey TV…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackdropGlow, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-[440px] w-full mx-auto px-4 py-10 text-center space-y-6 animate-rise", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-24 h-24", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-30", style: {
            animationDuration: "2s"
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-primary/5 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative size-24 rounded-full border border-primary/30 bg-[oklch(0.13_0.02_270)] flex items-center justify-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-10 text-primary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 size-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-3.5 text-primary-foreground" }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary uppercase", children: "Account Created" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-xl font-bold", children: "Check your inbox" }),
          email ? /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
            "We sent a confirmation link to",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground font-medium break-all", children: email }),
            ". Click the link to activate your Trey TV account."
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "We sent you a confirmation email. Click the link inside to activate your account." })
        ] }),
        !timedOut && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-2 rounded-full bg-primary animate-pulse" }),
          "Waiting for confirmation…"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-muted-foreground space-y-1 text-left", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Check your spam or junk folder if you don't see it" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• The link expires in 24 hours" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "• Opening the link logs you in automatically" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: handleManualCheck, disabled: checking, className: "w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold glow-gold flex items-center justify-center gap-2 disabled:opacity-60", children: checking ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-4 rounded-full border-2 border-current border-t-transparent animate-spin" }),
            "Checking…"
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheckBig, { className: "size-4" }),
            "I confirmed my email"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleResend, disabled: resending || !email, className: "w-full h-10 rounded-xl border border-white/15 text-sm text-muted-foreground hover:text-foreground hover:border-white/30 transition flex items-center justify-center gap-2 disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: `size-4 ${resending ? "animate-spin" : ""}` }),
            resending ? "Resending…" : "Resend confirmation email"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => nav({
            to: "/signup"
          }), className: "inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-3" }),
            "Back to sign up"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function BackdropGlow() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { "aria-hidden": true, className: "pointer-events-none absolute inset-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 left-1/2 -translate-x-1/2 size-[70vmin] rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.4),oklch(0.7_0.25_340_/_0.35),oklch(0.65_0.22_300_/_0.4),oklch(0.82_0.15_215_/_0.35))] blur-3xl opacity-55 animate-conic-spin" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-background to-transparent" })
  ] });
}
export {
  ConfirmEmail as component
};
