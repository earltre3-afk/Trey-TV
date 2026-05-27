import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Tv, XCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { useSupabaseSession } from "@/lib/supabase-session";

export const Route = createFileRoute("/tv/activate")({
  component: TvActivatePage,
  head: () => ({
    meta: [
      { title: "Activate Trey TV - TV App" },
      { name: "description", content: "Link your Trey TV account to an Android TV, Google TV, Chromecast, or Fire TV device." },
    ],
  }),
});

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

function displayCode(value: string) {
  const normalized = normalizeCode(value);
  return normalized.length > 4 ? `${normalized.slice(0, 4)}-${normalized.slice(4)}` : normalized;
}

function TvActivatePage() {
  const nav = useNavigate();
  const search: any = useSearch({ strict: false });
  const { session, user, loading } = useSupabaseSession();
  const [code, setCode] = useState(displayCode(typeof search?.code === "string" ? search.code : ""));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [approved, setApproved] = useState(false);

  const returnPath = useMemo(() => {
    const params = new URLSearchParams();
    if (code) params.set("code", normalizeCode(code));
    return `/tv/activate${params.toString() ? `?${params.toString()}` : ""}`;
  }, [code]);

  useEffect(() => {
    if (!loading && !session) {
      try {
        sessionStorage.setItem("treytv_post_auth_redirect", returnPath);
      } catch {}
    }
  }, [loading, returnPath, session]);

  async function approve(decision: "approve" | "deny") {
    const normalized = normalizeCode(code);
    if (!session || !normalized || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/tv/device/approve", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_code: normalized, decision }),
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#05040b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(31,214,255,.22),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,64,190,.18),transparent_34%),linear-gradient(135deg,#05040b,#100822_55%,#030611)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-8">
        <Link to="/" className="inline-flex w-fit items-center gap-3">
          <Logo className="h-10 w-10" />
          <span className="text-sm font-black uppercase tracking-[0.28em] text-primary">Trey TV</span>
        </Link>

        <section className="grid flex-1 place-items-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-white/12 bg-white/[0.07] p-6 shadow-[0_0_60px_rgba(35,215,255,.16)] backdrop-blur-2xl sm:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
                <Tv className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Activate Your TV</h1>
                <p className="text-sm text-white/62">Enter the code shown on your Trey TV streaming-box app.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 text-white/70">
                <Loader2 className="h-4 w-4 animate-spin" />
                Checking your Trey TV sign-in...
              </div>
            ) : !session ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
                  Sign in to Trey TV first, then you can approve this TV device.
                </div>
                <button
                  type="button"
                  onClick={() => nav({ to: "/login" })}
                  className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground shadow-[0_0_25px_rgba(255,200,87,.22)]"
                >
                  Sign In To Continue
                </button>
              </div>
            ) : approved ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-emerald-100">
                  <CheckCircle2 className="h-5 w-5" />
                  {message}
                </div>
                <p className="text-sm text-white/60">Signed in as {user?.email ?? "your Trey TV account"}.</p>
              </div>
            ) : (
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-white/55">TV Code</span>
                  <input
                    value={code}
                    onChange={(event) => setCode(displayCode(event.target.value))}
                    placeholder="ABCD-1234"
                    inputMode="text"
                    className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-4 text-center text-4xl font-black tracking-[0.2em] text-white outline-none focus:border-cyan-300/60"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    disabled={busy || normalizeCode(code).length < 8}
                    onClick={() => approve("approve")}
                    className="rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? "Linking..." : "Link This TV"}
                  </button>
                  <button
                    type="button"
                    disabled={busy || normalizeCode(code).length < 8}
                    onClick={() => approve("deny")}
                    className="rounded-2xl border border-white/15 bg-white/8 px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Deny
                  </button>
                </div>
                {message ? (
                  <div className="flex items-center gap-3 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
                    <XCircle className="h-4 w-4" />
                    {message}
                  </div>
                ) : null}
                <p className="text-xs text-white/45">Device codes expire after a few minutes. Restart sign-in on the TV if this code no longer works.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
