import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";
import { useSupabaseSession } from "@/lib/supabase-session";
import { listConnectedApps, revokeConnectedApp } from "@/lib/developers/oauth.server";

export const Route = createFileRoute("/settings/connected-apps")({
  component: ConnectedAppsPage,
  head: () => ({
    meta: [
      { title: "Connected Apps — Trey TV" },
      { name: "description", content: "Review and revoke apps connected to your Trey TV account." },
    ],
  }),
});

function ConnectedAppsPage() {
  const nav = useNavigate();
  const { session, loading } = useSupabaseSession();
  const [consents, setConsents] = useState<any[]>([]);
  const token = session?.access_token ?? "";

  useEffect(() => {
    if (loading) return;
    if (!session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", "/settings/connected-apps");
      } catch {}
      nav({ to: "/login" });
    }
  }, [loading, session, nav]);

  async function load() {
    if (!token) return;
    const result = await listConnectedApps({ data: { accessToken: token } });
    setConsents(result.consents);
  }

  useEffect(() => {
    void load().catch((error) => toast.error(error.message ?? "Could not load connected apps"));
  }, [token]);

  async function revoke(consentId: string) {
    await revokeConnectedApp({ data: { accessToken: token, consentId } });
    toast.success("Access revoked");
    await load();
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">
        Loading connected apps...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div
        aria-hidden
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(70%_55%_at_50%_-10%,oklch(0.82_0.15_215/.18),transparent)]"
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-8 py-8">
        <header className="flex items-center justify-between">
          <Link
            to="/settings"
            className="size-10 rounded-full liquid-glass border border-white/10 grid place-items-center"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <Logo className="h-12" />
        </header>

        <section className="mt-8 rounded-[28px] liquid-glass neon-border p-6 sm:p-8">
          <p className="text-[10px] tracking-[0.35em] text-primary">ACCOUNT SECURITY</p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black">Connected Apps</h1>
          <p className="mt-3 text-muted-foreground">
            Review apps that can use your Trey TV identity and revoke access at any time.
          </p>
        </section>

        <section className="mt-6 space-y-3">
          {consents.length === 0 ? (
            <div className="rounded-3xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground">
              No connected apps yet.
            </div>
          ) : (
            consents.map((consent) => {
              const app = Array.isArray(consent.developer_apps)
                ? consent.developer_apps[0]
                : consent.developer_apps;
              const revoked = Boolean(consent.revoked_at);
              return (
                <div
                  key={consent.id}
                  className="rounded-3xl liquid-glass border border-white/10 p-5 flex flex-wrap items-center gap-4"
                >
                  <div className="size-11 rounded-2xl bg-primary/10 text-primary grid place-items-center">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{app?.app_name ?? "Developer App"}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {app?.website_url ?? "No website"} · Connected{" "}
                      {new Date(consent.granted_at).toLocaleDateString()}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(Array.isArray(consent.scopes) ? consent.scopes : []).map(
                        (scope: string) => (
                          <span
                            key={scope}
                            className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground"
                          >
                            {scope}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <button
                    disabled={revoked}
                    onClick={() => revoke(consent.id)}
                    className="h-10 px-3 rounded-xl border border-red-400/30 text-red-300 text-xs inline-flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Trash2 className="size-3.5" /> {revoked ? "Revoked" : "Revoke Access"}
                  </button>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
