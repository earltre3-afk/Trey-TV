import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAuth } from "@/lib/auth";
import { useSupabaseSession } from "@/lib/supabase-session";
import { listAdminDeveloperApps } from "@/lib/developers/oauth.server";

export const Route = createFileRoute("/admin/developer-apps")({
  component: AdminDeveloperAppsPage,
  head: () => ({ meta: [{ title: "Developer Apps Admin — Trey TV" }] }),
});

function AdminDeveloperAppsPage() {
  const nav = useNavigate();
  const { isAdmin } = useAuth();
  const { session, loading } = useSupabaseSession();
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !isAdmin) nav({ to: "/" });
  }, [loading, isAdmin, nav]);

  useEffect(() => {
    if (!session?.access_token || !isAdmin) return;
    listAdminDeveloperApps({ data: { accessToken: session.access_token } })
      .then((result) => setApps(result.apps))
      .catch((error) => toast.error(error.message ?? "Could not load developer apps"));
  }, [session?.access_token, isAdmin]);

  return (
    <AdminShell title="Developer Apps" subtitle="Review OAuth clients, app owners, scopes, and redirect URLs.">
      <div className="rounded-3xl liquid-glass border border-primary/30 p-4 mb-5 flex items-start gap-3">
        <ShieldAlert className="size-5 text-primary shrink-0" />
        <p className="text-sm text-muted-foreground">
          Admin controls are staged here for app review. Suspend/revoke workflows should write audit events before public launch.
        </p>
      </div>
      <div className="space-y-3">
        {apps.length === 0 ? (
          <div className="rounded-2xl liquid-glass border border-white/10 p-8 text-center text-sm text-muted-foreground">No developer apps found.</div>
        ) : apps.map((app) => (
          <div key={app.id} className="rounded-2xl liquid-glass border border-white/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-bold">{app.app_name}</div>
                <div className="text-xs text-muted-foreground">{app.client_id}</div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(Array.isArray(app.allowed_scopes) ? app.allowed_scopes : []).map((scope: string) => (
                    <span key={scope} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10">{scope}</span>
                  ))}
                </div>
              </div>
              <span className="text-[10px] px-2 py-1 rounded-full border border-primary/30 text-primary capitalize">{app.status}</span>
            </div>
            <div className="mt-3 text-xs text-muted-foreground">
              Redirect URLs: {(Array.isArray(app.redirect_uris) ? app.redirect_uris : []).join(", ") || "none"}
            </div>
            <Link to="/developers" className="mt-3 inline-flex text-xs text-primary hover:underline">Open developer portal</Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

