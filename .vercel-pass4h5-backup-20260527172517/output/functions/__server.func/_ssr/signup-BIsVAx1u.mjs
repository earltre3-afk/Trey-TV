import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { C as CinematicBackdrop, G as GoogleIcon, s as supabase } from "./router-BtgGywEC.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { A as ArrowLeft, h as Mail, i as Lock, E as EyeOff, j as Eye, k as Check, X, l as ShieldCheck, S as Sparkles } from "../_libs/lucide-react.mjs";
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
const RULES = [{
  label: "At least 8 characters",
  test: (p) => p.length >= 8
}, {
  label: "Uppercase letter",
  test: (p) => /[A-Z]/.test(p)
}, {
  label: "Number",
  test: (p) => /[0-9]/.test(p)
}];
function passwordStrength(pw) {
  return RULES.filter((r) => r.test(pw)).length;
}
const STRENGTH_COLORS = ["bg-red-500", "bg-yellow-400", "bg-primary"];
const STRENGTH_LABELS = ["Too weak", "Getting there", "Strong"];
function friendlySignupError(message) {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("user already exists") || m.includes("email_exists")) return "An account with that email already exists. Log in instead.";
  if (m.includes("weak password") || m.includes("password should be")) return "Choose a stronger password — at least 8 characters with a number.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "That doesn't look like a valid email address.";
  if (m.includes("network") || m.includes("fetch")) return "Network error. Check your connection and try again.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Wait a moment and try again.";
  return "Couldn't create your account. Please try again.";
}
function SignupPage() {
  const nav = useNavigate();
  const [email, setEmail] = reactExports.useState("");
  const [pw, setPw] = reactExports.useState("");
  const [confirm, setConfirm] = reactExports.useState("");
  const [showPw, setShowPw] = reactExports.useState(false);
  const [showConfirm, setShowConfirm] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [touched, setTouched] = reactExports.useState(false);
  const strength = passwordStrength(pw);
  const pwMatch = pw && confirm ? pw === confirm : null;
  const canSubmit = email.trim() && strength >= 2 && pw === confirm && confirm.length > 0;
  const handleSignup = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!canSubmit) return;
    setBusy(true);
    try {
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: email.trim(),
        password: pw,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) {
        toast.error(friendlySignupError(error.message));
        return;
      }
      if (data.session) {
        nav({
          to: "/onboarding"
        });
        return;
      }
      nav({
        to: "/confirm-email",
        search: {
          email: email.trim()
        }
      });
    } finally {
      setBusy(false);
    }
  };
  const handleGoogle = async () => {
    setBusy(true);
    const {
      error
    } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) {
      setBusy(false);
      toast.error("Google sign-in failed. Please try another method.");
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CinematicBackdrop, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-[460px] mx-auto px-4 pt-6 pb-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "size-9 grid place-items-center rounded-full liquid-glass border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "size-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 text-center space-y-2 animate-rise", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-14 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Create your account" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Join Trey TV and start building your universe." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-3 animate-rise", style: {
        animationDelay: "60ms"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: handleGoogle, disabled: busy, className: "w-full h-11 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition flex items-center justify-center gap-2.5 tilt-press disabled:opacity-60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(GoogleIcon, {}),
          "Continue with Google"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative my-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-full border-t border-white/10" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "px-2 bg-background/40 text-[10px] tracking-[0.25em] text-muted-foreground", children: "OR" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSignup, className: "rounded-3xl liquid-glass border border-white/10 p-5 space-y-4 animate-rise", style: {
        animationDelay: "100ms"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5", children: "EMAIL" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), type: "email", autoComplete: "email", placeholder: "you@trey.tv", className: "flex-1 bg-transparent text-sm focus:outline-none" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5", children: "PASSWORD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 rounded-xl glass border border-white/10 px-3 h-11 focus-within:border-primary/50 transition", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4 shrink-0 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: pw, onChange: (e) => {
              setPw(e.target.value);
              setTouched(true);
            }, type: showPw ? "text" : "password", autoComplete: "new-password", placeholder: "Create a strong password", className: "flex-1 bg-transparent text-sm focus:outline-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPw((v) => !v), className: "text-muted-foreground hover:text-foreground shrink-0", children: showPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) })
          ] }),
          pw && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-1", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `h-1 flex-1 rounded-full transition-all ${i < strength ? STRENGTH_COLORS[strength - 1] : "bg-white/10"}` }, i)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-[10px] ${strength >= 2 ? "text-primary" : "text-muted-foreground"}`, children: STRENGTH_LABELS[Math.max(0, strength - 1)] ?? "Too weak" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-0.5", children: RULES.map((rule) => {
              const pass = rule.test(pw);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1.5 text-[10px] ${pass ? "text-green-400" : "text-muted-foreground"}`, children: [
                pass ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3 opacity-50" }),
                rule.label
              ] }, rule.label);
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5", children: "CONFIRM PASSWORD" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-2 rounded-xl glass border px-3 h-11 focus-within:border-primary/50 transition ${touched && confirm && pwMatch === false ? "border-red-500/50" : "border-white/10"}`, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: `size-4 shrink-0 ${pwMatch === true ? "text-green-400" : "text-muted-foreground"}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: confirm, onChange: (e) => {
              setConfirm(e.target.value);
              setTouched(true);
            }, type: showConfirm ? "text" : "password", autoComplete: "new-password", placeholder: "Re-enter password", className: "flex-1 bg-transparent text-sm focus:outline-none" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowConfirm((v) => !v), className: "text-muted-foreground hover:text-foreground shrink-0", children: showConfirm ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) })
          ] }),
          touched && confirm && pwMatch === false && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-red-400 mt-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-3" }),
            " Passwords don't match"
          ] }),
          pwMatch === true && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] text-green-400 mt-1 flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3" }),
            " Passwords match"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", disabled: busy || !canSubmit, className: "w-full h-11 rounded-xl text-sm font-bold bg-primary text-primary-foreground glow-gold tilt-press flex items-center justify-center gap-1.5 disabled:opacity-50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
          busy ? "Creating account…" : "Sign Up with Email"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-center text-xs text-muted-foreground pt-1", children: [
          "Already have an account?",
          " ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "text-primary font-semibold hover:underline", children: "Log in" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 text-center text-[10px] text-muted-foreground px-4", children: [
        "By signing up you agree to Trey TV's",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/legal/terms", className: "underline hover:text-foreground", children: "Terms" }),
        " and",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "/legal/privacy", className: "underline hover:text-foreground", children: "Privacy Policy" }),
        "."
      ] })
    ] })
  ] });
}
export {
  SignupPage as component
};
