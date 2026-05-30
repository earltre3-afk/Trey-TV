import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { s as supabase } from "./router-BtgGywEC.mjs";
import { L as saveOnboardingProfile, M as finalizeOnboarding } from "./index.mjs";
import "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { S as Sparkles } from "../_libs/lucide-react.mjs";
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
async function resolvePostAuthDestination(nav, userId, accessToken) {
  let voiceProfile = null;
  try {
    const raw = sessionStorage.getItem("treytv_voice_profile");
    if (raw) {
      voiceProfile = JSON.parse(raw);
      sessionStorage.removeItem("treytv_voice_profile");
    }
  } catch {
  }
  if (voiceProfile?.display_name && voiceProfile?.username) {
    try {
      await saveOnboardingProfile({
        data: {
          accessToken,
          fields: voiceProfile
        }
      });
      const {
        publicProfileUid
      } = await finalizeOnboarding({
        data: {
          accessToken,
          method: "voice"
        }
      });
      nav({
        to: `/u/${publicProfileUid}`
      });
      return;
    } catch {
    }
  }
  const {
    data: profile
  } = await supabase.from("profiles").select("onboarding_completed, public_profile_uid").eq("id", userId).maybeSingle();
  if (!profile || !profile.onboarding_completed) {
    nav({
      to: "/onboarding"
    });
    return;
  }
  let next = null;
  try {
    next = sessionStorage.getItem("treytv_post_auth_redirect");
    sessionStorage.removeItem("treytv_post_auth_redirect");
  } catch {
  }
  nav({
    to: next ?? (profile.public_profile_uid ? `/u/${profile.public_profile_uid}` : "/")
  });
}
function AuthCallback() {
  const nav = useNavigate();
  const [error, setError] = reactExports.useState(null);
  reactExports.useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("error")) {
        const desc = params.get("error_description") ?? "";
        if (desc.toLowerCase().includes("expired") || desc.toLowerCase().includes("invalid")) {
          setError("This link has expired or is invalid. Please request a new one.");
        } else {
          setError("Authentication failed. Please try logging in again.");
        }
        setTimeout(() => nav({
          to: "/login"
        }), 3e3);
        return;
      }
      const code = params.get("code");
      const tokenHash = params.get("token_hash");
      const otpType = params.get("type");
      let userId;
      let accessToken;
      if (tokenHash && otpType) {
        const {
          data,
          error: verifyError
        } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType
        });
        if (!verifyError && data.session) {
          userId = data.session.user.id;
          accessToken = data.session.access_token;
        } else {
          setError("This magic link has expired. Request a new one to log in.");
          setTimeout(() => nav({
            to: "/login"
          }), 3e3);
          return;
        }
      } else if (code) {
        const {
          data,
          error: codeError
        } = await supabase.auth.exchangeCodeForSession(code);
        if (!codeError && data.session) {
          userId = data.session.user.id;
          accessToken = data.session.access_token;
        } else {
          const {
            data: {
              user
            }
          } = await supabase.auth.getUser();
          const {
            data: {
              session
            }
          } = await supabase.auth.getSession();
          if (user) userId = user.id;
          if (session) accessToken = session.access_token;
        }
      } else {
        const {
          data: {
            user
          }
        } = await supabase.auth.getUser();
        const {
          data: {
            session
          }
        } = await supabase.auth.getSession();
        if (user) userId = user.id;
        if (session) accessToken = session.access_token;
      }
      if (!userId || !accessToken) {
        setError("We couldn't sign you in. Please try again.");
        setTimeout(() => nav({
          to: "/login"
        }), 3e3);
        return;
      }
      await resolvePostAuthDestination(nav, userId, accessToken);
    };
    run();
  }, []);
  if (error) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden flex items-center justify-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(BackdropGlow, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm w-full mx-auto px-6 text-center space-y-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-10 mx-auto" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass border border-red-500/20 p-8 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-red-400 text-xl font-bold", children: "!" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Link expired" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Redirecting you to login…" })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative min-h-screen w-full overflow-hidden flex items-center justify-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(BackdropGlow, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-sm w-full mx-auto px-6 text-center space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-10 mx-auto" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-3xl liquid-glass neon-border p-8 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto w-16 h-16", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 rounded-full bg-primary/10 animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative size-16 rounded-full border border-primary/30 bg-background flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-7 text-primary" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary uppercase", children: "Trey TV" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-1 text-lg font-bold", children: "Signing you in…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Just a moment." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-5 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" })
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
  AuthCallback as component
};
