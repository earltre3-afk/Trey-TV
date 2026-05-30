import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { L as Logo } from "./Logo-D0JEzEf4.mjs";
import { g as useSupabaseSession } from "./router-BtgGywEC.mjs";
import { O as OAUTH_SCOPES, l as listDeveloperDashboard, u as updateDeveloperApp, c as createDeveloperApp, r as revokeDeveloperApp, a as rotateDeveloperSecret, b as createApiKey, d as revokeApiKey } from "./oauth.server-_zjjG9eD.mjs";
import "./index.mjs";
import "../_libs/react-dom.mjs";
import { bn as Terminal, l as ShieldCheck, P as Plus, aI as TriangleAlert, E as EyeOff, j as Eye, bo as KeyRound, i as Lock, aF as Trash2, v as Copy, b0 as RefreshCw } from "../_libs/lucide-react.mjs";
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
const APP_TYPES = [{
  value: "web_app",
  label: "Web app"
}, {
  value: "mobile_app",
  label: "Mobile app"
}, {
  value: "creator_tool",
  label: "Creator tool"
}, {
  value: "internal_tool",
  label: "Internal tool"
}, {
  value: "other",
  label: "Other"
}];
const emptyForm = {
  appName: "",
  appDescription: "",
  websiteUrl: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  redirectUri: "",
  appType: "web_app",
  scopes: ["profile:read", "public_uid:read"]
};
function DevelopersPage() {
  const nav = useNavigate();
  const {
    session,
    loading
  } = useSupabaseSession();
  const [apps, setApps] = reactExports.useState([]);
  const [apiKeys, setApiKeys] = reactExports.useState([]);
  const [form, setForm] = reactExports.useState(emptyForm);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [oneTimeSecret, setOneTimeSecret] = reactExports.useState("");
  const [oneTimeApiKey, setOneTimeApiKey] = reactExports.useState("");
  const [revealedSecret, setRevealedSecret] = reactExports.useState(false);
  const [busy, setBusy] = reactExports.useState(false);
  const [keyLabel, setKeyLabel] = reactExports.useState("");
  const [keyMode, setKeyMode] = reactExports.useState("test");
  const [keyAppId, setKeyAppId] = reactExports.useState("");
  const token = session?.access_token ?? "";
  reactExports.useEffect(() => {
    if (loading) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/developers");
      } catch {
      }
      nav({
        to: "/login"
      });
    }
  }, [loading, session, nav]);
  const load = async () => {
    if (!token) return;
    const data = await listDeveloperDashboard({
      data: {
        accessToken: token
      }
    });
    setApps(data.apps);
    setApiKeys(data.apiKeys);
  };
  reactExports.useEffect(() => {
    void load().catch((error) => toast.error(error.message ?? "Could not load developer apps"));
  }, [token]);
  const selectedApp = reactExports.useMemo(() => apps.find((app) => app.id === editingId), [apps, editingId]);
  function editApp(app) {
    setEditingId(app.id);
    setOneTimeSecret("");
    setRevealedSecret(false);
    setForm({
      appName: app.app_name ?? "",
      appDescription: app.app_description ?? "",
      websiteUrl: app.website_url ?? "",
      privacyPolicyUrl: app.privacy_policy_url ?? "",
      termsUrl: app.terms_url ?? "",
      redirectUri: Array.isArray(app.redirect_uris) ? app.redirect_uris[0] ?? "" : "",
      appType: app.app_type ?? "web_app",
      scopes: Array.isArray(app.allowed_scopes) ? app.allowed_scopes : ["profile:read"]
    });
  }
  async function saveApp(e) {
    e.preventDefault();
    if (!token) return;
    if (!form.redirectUri.trim()) {
      toast.error("Redirect URI is required.");
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        await updateDeveloperApp({
          data: {
            accessToken: token,
            appId: editingId,
            ...form
          }
        });
        toast.success("Developer app updated");
      } else {
        const result = await createDeveloperApp({
          data: {
            accessToken: token,
            ...form
          }
        });
        setOneTimeSecret(result.clientSecret);
        setRevealedSecret(true);
        toast.success("Developer app created. Save the secret now.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (error) {
      toast.error(error.message ?? "Could not save app");
    } finally {
      setBusy(false);
    }
  }
  async function rotateSecret(appId) {
    if (!token) return;
    const result = await rotateDeveloperSecret({
      data: {
        accessToken: token,
        appId
      }
    });
    setOneTimeSecret(result.clientSecret);
    setRevealedSecret(true);
    toast.success("Secret rotated. Save the new secret now.");
  }
  async function revokeApp(appId) {
    if (!token) return;
    await revokeDeveloperApp({
      data: {
        accessToken: token,
        appId
      }
    });
    toast.success("App revoked");
    await load();
  }
  async function generateKey(e) {
    e.preventDefault();
    if (!token) return;
    if (!keyLabel.trim()) {
      toast.error("Add an API key label.");
      return;
    }
    const result = await createApiKey({
      data: {
        accessToken: token,
        appId: keyAppId || null,
        label: keyLabel,
        mode: keyMode,
        scopes: ["profile:read", "public_uid:read"]
      }
    });
    setOneTimeApiKey(result.apiKey);
    setKeyLabel("");
    await load();
    toast.success("API key generated. Save it now.");
  }
  async function revokeKey(keyId) {
    if (!token) return;
    await revokeApiKey({
      data: {
        accessToken: token,
        keyId
      }
    });
    toast.success("API key revoked");
    await load();
  }
  if (loading || !session) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen grid place-items-center text-sm text-muted-foreground", children: "Loading Trey TV Developers..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "min-h-screen bg-background text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { "aria-hidden": true, className: "fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.22),transparent),radial-gradient(60%_45%_at_100%_20%,oklch(0.82_0.16_85/.12),transparent)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-center justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Logo, { className: "h-12" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/developers/docs", className: "h-10 px-4 rounded-xl liquid-glass border border-white/10 text-sm font-semibold inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Terminal, { className: "size-4" }),
            " Docs"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/settings/connected-apps", className: "h-10 px-4 rounded-xl liquid-glass border border-white/10 text-sm font-semibold inline-flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "size-4" }),
            " Connected Apps"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid lg:grid-cols-[1fr_380px] gap-6 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[28px] liquid-glass neon-border p-6 sm:p-8", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.35em] text-primary", children: "TREY TV DEVELOPERS" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mt-3 text-4xl sm:text-6xl font-black leading-tight", children: "Build With Trey TV" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-muted-foreground max-w-2xl", children: "Let people sign in with their Trey TV identity. Create apps, generate credentials, and connect Trey TV identity to your own projects." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#create-app", className: "h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold glow-gold inline-flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
                " Create Developer App"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/developers/docs", className: "h-11 px-5 rounded-xl liquid-glass border border-white/10 font-semibold inline-flex items-center gap-2", children: "Read OAuth docs" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 xl:grid-cols-4 gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(QuickCard, { title: "Sign in with Trey TV", body: "OAuth authorization-code flow with consent." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(QuickCard, { title: "API Keys", body: "Server integrations only, never user login." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(QuickCard, { title: "Connected Apps", body: "Users can revoke access any time." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(QuickCard, { title: "Documentation", body: "Scopes, URLs, examples, and rules." })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("aside", { className: "rounded-3xl liquid-glass border border-[oklch(0.82_0.16_85/.35)] p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "size-5 text-primary shrink-0" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-bold", children: "Secret safety" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Never share your Client Secret or API keys publicly. Client secrets and keys are stored hashed and only shown once." })
          ] })
        ] }) })
      ] }),
      (oneTimeSecret || oneTimeApiKey) && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-3xl liquid-glass border border-primary/40 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.25em] text-primary", children: "ONE-TIME SECRET" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-bold", children: "Save this now. Trey TV will not show it again." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setRevealedSecret((v) => !v), className: "size-10 rounded-xl liquid-glass border border-white/10 grid place-items-center", children: revealedSecret ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SecretValue, { value: oneTimeSecret || oneTimeApiKey, visible: revealedSecret })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "create-app", className: "grid lg:grid-cols-[420px_1fr] gap-6 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: saveApp, className: "rounded-3xl liquid-glass neon-border p-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.25em] text-primary", children: editingId ? "EDIT APP" : "CREATE APP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: editingId ? selectedApp?.app_name ?? "Developer App" : "Create Developer App" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "App name", value: form.appName, onChange: (v) => setForm((f) => ({
            ...f,
            appName: v
          })), required: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "App description", value: form.appDescription, onChange: (v) => setForm((f) => ({
            ...f,
            appDescription: v
          })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Website URL", value: form.websiteUrl, onChange: (v) => setForm((f) => ({
            ...f,
            websiteUrl: v
          })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Privacy policy URL", value: form.privacyPolicyUrl, onChange: (v) => setForm((f) => ({
            ...f,
            privacyPolicyUrl: v
          })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Terms URL", value: form.termsUrl, onChange: (v) => setForm((f) => ({
            ...f,
            termsUrl: v
          })) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Redirect URI / callback URL", value: form.redirectUri, onChange: (v) => setForm((f) => ({
            ...f,
            redirectUri: v
          })), required: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "App type" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.appType, onChange: (e) => setForm((f) => ({
              ...f,
              appType: e.target.value
            })), className: "w-full h-11 rounded-xl glass border border-white/10 bg-background px-3 text-sm", children: APP_TYPES.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: type.value, children: type.label }, type.value)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Requested scopes" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-2", children: OAUTH_SCOPES.map((scope) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm rounded-xl glass border border-white/10 px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", checked: form.scopes.includes(scope), onChange: () => setForm((f) => ({
                ...f,
                scopes: f.scopes.includes(scope) ? f.scopes.filter((s) => s !== scope) : [...f.scopes, scope]
              })) }),
              scope
            ] }, scope)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: busy, className: "flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold glow-gold disabled:opacity-50", children: editingId ? "Save App" : "Create Developer App" }),
            editingId && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => {
              setEditingId(null);
              setForm(emptyForm);
            }, className: "h-11 px-4 rounded-xl liquid-glass border border-white/10", children: "Cancel" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black", children: "Developer apps" }),
          apps.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground", children: "No developer apps yet." }) : apps.map((app) => /* @__PURE__ */ jsxRuntimeExports.jsx(AppCard, { app, onEdit: () => editApp(app), onRotate: () => rotateSecret(app.id), onRevoke: () => revokeApp(app.id) }, app.id))
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "grid lg:grid-cols-[420px_1fr] gap-6 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: generateKey, className: "rounded-3xl liquid-glass border border-white/10 p-5 space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] tracking-[0.25em] text-[oklch(0.82_0.15_215)]", children: "API KEYS" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: "Generate API key" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-muted-foreground", children: "API keys are for server integrations, not Sign in with Trey TV." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Label", value: keyLabel, onChange: setKeyLabel, required: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Mode" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: keyMode, onChange: (e) => setKeyMode(e.target.value), className: "w-full h-11 rounded-xl glass border border-white/10 bg-background px-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "test", children: "Test key" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "live", children: "Live key" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Developer app" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: keyAppId, onChange: (e) => setKeyAppId(e.target.value), className: "w-full h-11 rounded-xl glass border border-white/10 bg-background px-3 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "No app" }),
              apps.map((app) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: app.id, children: app.app_name }, app.id))
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "w-full h-11 rounded-xl liquid-glass border border-[oklch(0.82_0.15_215/.4)] text-[oklch(0.82_0.15_215)] font-bold inline-flex items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(KeyRound, { className: "size-4" }),
            " Generate API key"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black", children: "API keys" }),
          apiKeys.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground", children: "No API keys yet." }) : apiKeys.map((key) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-white/10 p-4 flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "size-4 text-muted-foreground" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold truncate", children: key.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                key.key_prefix,
                "... · ",
                key.status,
                " · ",
                new Date(key.created_at).toLocaleDateString()
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => revokeKey(key.id), className: "h-9 px-3 rounded-xl border border-red-400/30 text-red-300 text-xs inline-flex items-center gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-3.5" }),
              " Revoke"
            ] })
          ] }, key.id))
        ] })
      ] })
    ] })
  ] });
}
function QuickCard({
  title,
  body
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl liquid-glass border border-white/10 p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold", children: title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: body })
  ] });
}
function AppCard({
  app,
  onEdit,
  onRotate,
  onRevoke
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-3xl liquid-glass border border-white/10 p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold truncate", children: app.app_name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] px-2 py-0.5 rounded-full border border-primary/35 text-primary capitalize", children: app.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm text-muted-foreground line-clamp-2", children: app.app_description || "No description yet." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 grid md:grid-cols-2 gap-2 text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Credential, { label: "Client ID", value: app.client_id }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Credential, { label: "Client Secret", value: "Hidden after creation", muted: true }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Credential, { label: "Redirect URIs", value: (Array.isArray(app.redirect_uris) ? app.redirect_uris : []).join(", ") }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Credential, { label: "Created", value: new Date(app.created_at).toLocaleString() })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onEdit, className: "h-9 px-3 rounded-xl liquid-glass border border-white/10 text-xs", children: "View / Edit" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onRotate, className: "h-9 px-3 rounded-xl liquid-glass border border-white/10 text-xs inline-flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "size-3.5" }),
        " Rotate Secret"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onRevoke, className: "h-9 px-3 rounded-xl border border-red-400/30 text-red-300 text-xs", children: "Revoke App" })
    ] })
  ] }) });
}
function Credential({
  label,
  value,
  muted
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl bg-white/[0.04] border border-white/10 p-3 min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mt-1 flex items-center gap-2 text-xs min-w-0 ${muted ? "text-muted-foreground" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate", children: value || "None" }),
      !muted && value && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        navigator.clipboard?.writeText(value);
        toast.success("Copied");
      }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-3.5" }) })
    ] })
  ] });
}
function SecretValue({
  value,
  visible
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 rounded-2xl bg-black/35 border border-white/10 p-3 flex items-center gap-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "flex-1 min-w-0 truncate text-xs sm:text-sm", children: visible ? value : "••••••••••••••••••••••••••••••••" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
      navigator.clipboard?.writeText(value);
      toast.success("Copied");
    }, className: "size-9 rounded-xl liquid-glass border border-white/10 grid place-items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Copy, { className: "size-4" }) })
  ] });
}
function Label({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5", children });
}
function Field({
  label,
  value,
  onChange,
  required
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value, onChange: (e) => onChange(e.target.value), required, className: "w-full h-11 rounded-xl glass border border-white/10 bg-transparent px-3 text-sm focus:outline-none focus:border-primary/50" })
  ] });
}
export {
  DevelopersPage as component
};
