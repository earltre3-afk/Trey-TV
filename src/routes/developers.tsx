import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { useSupabaseSession } from "@/lib/supabase-session";
import {
  OAUTH_SCOPES,
  createApiKey,
  createDeveloperApp,
  listDeveloperDashboard,
  revokeApiKey,
  revokeDeveloperApp,
  rotateDeveloperSecret,
  updateDeveloperApp,
} from "@/lib/developers/oauth.server";

export const Route = createFileRoute("/developers")({
  component: DevelopersPage,
  head: () => ({
    meta: [
      { title: "Trey TV Developers" },
      {
        name: "description",
        content:
          "Create apps, generate credentials, and connect Trey TV identity to your own projects.",
      },
    ],
  }),
});

const APP_TYPES = [
  { value: "web_app", label: "Web app" },
  { value: "mobile_app", label: "Mobile app" },
  { value: "creator_tool", label: "Creator tool" },
  { value: "internal_tool", label: "Internal tool" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  appName: "",
  appDescription: "",
  websiteUrl: "",
  privacyPolicyUrl: "",
  termsUrl: "",
  redirectUri: "",
  appType: "web_app",
  scopes: ["profile:read", "public_uid:read"],
};

function DevelopersPage() {
  const nav = useNavigate();
  const { session, loading } = useSupabaseSession();
  const [apps, setApps] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [oneTimeSecret, setOneTimeSecret] = useState("");
  const [oneTimeApiKey, setOneTimeApiKey] = useState("");
  const [revealedSecret, setRevealedSecret] = useState(false);
  const [busy, setBusy] = useState(false);
  const [keyLabel, setKeyLabel] = useState("");
  const [keyMode, setKeyMode] = useState<"live" | "test">("test");
  const [keyAppId, setKeyAppId] = useState("");

  const token = session?.access_token ?? "";

  useEffect(() => {
    if (loading) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/developers");
      } catch {}
      nav({ to: "/login" });
    }
  }, [loading, session, nav]);

  const load = async () => {
    if (!token) return;
    const data = await listDeveloperDashboard({ data: { accessToken: token } });
    setApps(data.apps);
    setApiKeys(data.apiKeys);
  };

  useEffect(() => {
    void load().catch((error) => toast.error(error.message ?? "Could not load developer apps"));
  }, [token]);

  const selectedApp = useMemo(() => apps.find((app) => app.id === editingId), [apps, editingId]);

  function editApp(app: any) {
    setEditingId(app.id);
    setOneTimeSecret("");
    setRevealedSecret(false);
    setForm({
      appName: app.app_name ?? "",
      appDescription: app.app_description ?? "",
      websiteUrl: app.website_url ?? "",
      privacyPolicyUrl: app.privacy_policy_url ?? "",
      termsUrl: app.terms_url ?? "",
      redirectUri: Array.isArray(app.redirect_uris) ? (app.redirect_uris[0] ?? "") : "",
      appType: app.app_type ?? "web_app",
      scopes: Array.isArray(app.allowed_scopes) ? app.allowed_scopes : ["profile:read"],
    });
  }

  async function saveApp(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.redirectUri.trim()) {
      toast.error("Redirect URI is required.");
      return;
    }
    setBusy(true);
    try {
      if (editingId) {
        await updateDeveloperApp({ data: { accessToken: token, appId: editingId, ...form } });
        toast.success("Developer app updated");
      } else {
        const result = await createDeveloperApp({ data: { accessToken: token, ...form } });
        setOneTimeSecret(result.clientSecret);
        setRevealedSecret(true);
        toast.success("Developer app created. Save the secret now.");
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (error: any) {
      toast.error(error.message ?? "Could not save app");
    } finally {
      setBusy(false);
    }
  }

  async function rotateSecret(appId: string) {
    if (!token) return;
    const result = await rotateDeveloperSecret({ data: { accessToken: token, appId } });
    setOneTimeSecret(result.clientSecret);
    setRevealedSecret(true);
    toast.success("Secret rotated. Save the new secret now.");
  }

  async function revokeApp(appId: string) {
    if (!token) return;
    await revokeDeveloperApp({ data: { accessToken: token, appId } });
    toast.success("App revoked");
    await load();
  }

  async function generateKey(e: React.FormEvent) {
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
        scopes: ["profile:read", "public_uid:read"],
      },
    });
    setOneTimeApiKey(result.apiKey);
    setKeyLabel("");
    await load();
    toast.success("API key generated. Save it now.");
  }

  async function revokeKey(keyId: string) {
    if (!token) return;
    await revokeApiKey({ data: { accessToken: token, keyId } });
    toast.success("API key revoked");
    await load();
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading Trey TV Developers...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.22),transparent),radial-gradient(60%_45%_at_100%_20%,oklch(0.82_0.16_85/.12),transparent)]"
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo className="h-12" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/developers/docs"
              className="h-10 px-4 rounded-xl liquid-glass border border-white/10 text-sm font-semibold inline-flex items-center gap-2"
            >
              <Terminal className="size-4" /> Docs
            </Link>
            <Link
              to="/settings/connected-apps"
              className="h-10 px-4 rounded-xl liquid-glass border border-white/10 text-sm font-semibold inline-flex items-center gap-2"
            >
              <ShieldCheck className="size-4" /> Connected Apps
            </Link>
          </div>
        </header>

        <section className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-5">
            <div className="rounded-[28px] liquid-glass neon-border p-6 sm:p-8">
              <p className="text-[10px] tracking-[0.35em] text-primary">TREY TV DEVELOPERS</p>
              <h1 className="mt-3 text-4xl sm:text-6xl font-black leading-tight">
                Build With Trey TV
              </h1>
              <p className="mt-3 text-muted-foreground max-w-2xl">
                Let people sign in with their Trey TV identity. Create apps, generate credentials,
                and connect Trey TV identity to your own projects.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#create-app"
                  className="h-11 px-5 rounded-xl bg-primary text-primary-foreground font-bold glow-gold inline-flex items-center gap-2"
                >
                  <Plus className="size-4" /> Create Developer App
                </a>
                <Link
                  to="/developers/docs"
                  className="h-11 px-5 rounded-xl liquid-glass border border-white/10 font-semibold inline-flex items-center gap-2"
                >
                  Read OAuth docs
                </Link>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <QuickCard
                title="Sign in with Trey TV"
                body="OAuth authorization-code flow with consent."
              />
              <QuickCard title="API Keys" body="Server integrations only, never user login." />
              <QuickCard title="Connected Apps" body="Users can revoke access any time." />
              <QuickCard title="Documentation" body="Scopes, URLs, examples, and rules." />
            </div>
          </div>

          <aside className="rounded-3xl liquid-glass border border-[oklch(0.82_0.16_85/.35)] p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-primary shrink-0" />
              <div>
                <h2 className="font-bold">Secret safety</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Never share your Client Secret or API keys publicly. Client secrets and keys are
                  stored hashed and only shown once.
                </p>
              </div>
            </div>
          </aside>
        </section>

        {(oneTimeSecret || oneTimeApiKey) && (
          <section className="rounded-3xl liquid-glass border border-primary/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] tracking-[0.25em] text-primary">ONE-TIME SECRET</p>
                <h2 className="text-lg font-bold">
                  Save this now. Trey TV will not show it again.
                </h2>
              </div>
              <button
                onClick={() => setRevealedSecret((v) => !v)}
                className="size-10 rounded-xl liquid-glass border border-white/10 grid place-items-center"
              >
                {revealedSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <SecretValue value={oneTimeSecret || oneTimeApiKey} visible={revealedSecret} />
          </section>
        )}

        <section id="create-app" className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
          <form onSubmit={saveApp} className="rounded-3xl liquid-glass neon-border p-5 space-y-4">
            <div>
              <p className="text-[10px] tracking-[0.25em] text-primary">
                {editingId ? "EDIT APP" : "CREATE APP"}
              </p>
              <h2 className="text-xl font-bold">
                {editingId ? (selectedApp?.app_name ?? "Developer App") : "Create Developer App"}
              </h2>
            </div>
            <Field
              label="App name"
              value={form.appName}
              onChange={(v) => setForm((f) => ({ ...f, appName: v }))}
              required
            />
            <Field
              label="App description"
              value={form.appDescription}
              onChange={(v) => setForm((f) => ({ ...f, appDescription: v }))}
            />
            <Field
              label="Website URL"
              value={form.websiteUrl}
              onChange={(v) => setForm((f) => ({ ...f, websiteUrl: v }))}
            />
            <Field
              label="Privacy policy URL"
              value={form.privacyPolicyUrl}
              onChange={(v) => setForm((f) => ({ ...f, privacyPolicyUrl: v }))}
            />
            <Field
              label="Terms URL"
              value={form.termsUrl}
              onChange={(v) => setForm((f) => ({ ...f, termsUrl: v }))}
            />
            <Field
              label="Redirect URI / callback URL"
              value={form.redirectUri}
              onChange={(v) => setForm((f) => ({ ...f, redirectUri: v }))}
              required
            />
            <div>
              <Label>App type</Label>
              <select
                value={form.appType}
                onChange={(e) => setForm((f) => ({ ...f, appType: e.target.value }))}
                className="w-full h-11 rounded-xl glass border border-white/10 bg-background px-3 text-sm"
              >
                {APP_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Requested scopes</Label>
              <div className="grid grid-cols-1 gap-2">
                {OAUTH_SCOPES.map((scope) => (
                  <label
                    key={scope}
                    className="flex items-center gap-2 text-sm rounded-xl glass border border-white/10 px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={form.scopes.includes(scope)}
                      onChange={() =>
                        setForm((f) => ({
                          ...f,
                          scopes: f.scopes.includes(scope)
                            ? f.scopes.filter((s) => s !== scope)
                            : [...f.scopes, scope],
                        }))
                      }
                    />
                    {scope}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                disabled={busy}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground font-bold glow-gold disabled:opacity-50"
              >
                {editingId ? "Save App" : "Create Developer App"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                  className="h-11 px-4 rounded-xl liquid-glass border border-white/10"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="space-y-4">
            <h2 className="text-2xl font-black">Developer apps</h2>
            {apps.length === 0 ? (
              <div className="rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground">
                No developer apps yet.
              </div>
            ) : (
              apps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onEdit={() => editApp(app)}
                  onRotate={() => rotateSecret(app.id)}
                  onRevoke={() => revokeApp(app.id)}
                />
              ))
            )}
          </div>
        </section>

        <section className="grid lg:grid-cols-[420px_1fr] gap-6 items-start">
          <form
            onSubmit={generateKey}
            className="rounded-3xl liquid-glass border border-white/10 p-5 space-y-4"
          >
            <div>
              <p className="text-[10px] tracking-[0.25em] text-[oklch(0.82_0.15_215)]">API KEYS</p>
              <h2 className="text-xl font-bold">Generate API key</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                API keys are for server integrations, not Sign in with Trey TV.
              </p>
            </div>
            <Field label="Label" value={keyLabel} onChange={setKeyLabel} required />
            <div>
              <Label>Mode</Label>
              <select
                value={keyMode}
                onChange={(e) => setKeyMode(e.target.value as "live" | "test")}
                className="w-full h-11 rounded-xl glass border border-white/10 bg-background px-3 text-sm"
              >
                <option value="test">Test key</option>
                <option value="live">Live key</option>
              </select>
            </div>
            <div>
              <Label>Developer app</Label>
              <select
                value={keyAppId}
                onChange={(e) => setKeyAppId(e.target.value)}
                className="w-full h-11 rounded-xl glass border border-white/10 bg-background px-3 text-sm"
              >
                <option value="">No app</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.app_name}
                  </option>
                ))}
              </select>
            </div>
            <button className="w-full h-11 rounded-xl liquid-glass border border-[oklch(0.82_0.15_215/.4)] text-[oklch(0.82_0.15_215)] font-bold inline-flex items-center justify-center gap-2">
              <KeyRound className="size-4" /> Generate API key
            </button>
          </form>

          <div className="space-y-4">
            <h2 className="text-2xl font-black">API keys</h2>
            {apiKeys.length === 0 ? (
              <div className="rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground">
                No API keys yet.
              </div>
            ) : (
              apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="rounded-2xl liquid-glass border border-white/10 p-4 flex flex-wrap items-center gap-3"
                >
                  <Lock className="size-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{key.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {key.key_prefix}... · {key.status} ·{" "}
                      {new Date(key.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="h-9 px-3 rounded-xl border border-red-400/30 text-red-300 text-xs inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="size-3.5" /> Revoke
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function QuickCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl liquid-glass border border-white/10 p-4">
      <div className="font-bold">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{body}</div>
    </div>
  );
}

function AppCard({
  app,
  onEdit,
  onRotate,
  onRevoke,
}: {
  app: any;
  onEdit: () => void;
  onRotate: () => void;
  onRevoke: () => void;
}) {
  return (
    <div className="rounded-3xl liquid-glass border border-white/10 p-5">
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold truncate">{app.app_name}</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-primary/35 text-primary capitalize">
              {app.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {app.app_description || "No description yet."}
          </p>
          <div className="mt-3 grid md:grid-cols-2 gap-2 text-xs">
            <Credential label="Client ID" value={app.client_id} />
            <Credential label="Client Secret" value="Hidden after creation" muted />
            <Credential
              label="Redirect URIs"
              value={(Array.isArray(app.redirect_uris) ? app.redirect_uris : []).join(", ")}
            />
            <Credential label="Created" value={new Date(app.created_at).toLocaleString()} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onEdit}
            className="h-9 px-3 rounded-xl liquid-glass border border-white/10 text-xs"
          >
            View / Edit
          </button>
          <button
            onClick={onRotate}
            className="h-9 px-3 rounded-xl liquid-glass border border-white/10 text-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className="size-3.5" /> Rotate Secret
          </button>
          <button
            onClick={onRevoke}
            className="h-9 px-3 rounded-xl border border-red-400/30 text-red-300 text-xs"
          >
            Revoke App
          </button>
        </div>
      </div>
    </div>
  );
}

function Credential({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 min-w-0">
      <div className="text-[10px] tracking-[0.2em] text-muted-foreground">{label}</div>
      <div
        className={`mt-1 flex items-center gap-2 text-xs min-w-0 ${muted ? "text-muted-foreground" : ""}`}
      >
        <span className="truncate">{value || "None"}</span>
        {!muted && value && (
          <button
            onClick={() => {
              navigator.clipboard?.writeText(value);
              toast.success("Copied");
            }}
          >
            <Copy className="size-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function SecretValue({ value, visible }: { value: string; visible: boolean }) {
  return (
    <div className="mt-4 rounded-2xl bg-black/35 border border-white/10 p-3 flex items-center gap-3">
      <code className="flex-1 min-w-0 truncate text-xs sm:text-sm">
        {visible ? value : "••••••••••••••••••••••••••••••••"}
      </code>
      <button
        onClick={() => {
          navigator.clipboard?.writeText(value);
          toast.success("Copied");
        }}
        className="size-9 rounded-xl liquid-glass border border-white/10 grid place-items-center"
      >
        <Copy className="size-4" />
      </button>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] tracking-[0.2em] text-muted-foreground mb-1.5">{children}</div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full h-11 rounded-xl glass border border-white/10 bg-transparent px-3 text-sm focus:outline-none focus:border-primary/50"
      />
    </div>
  );
}
