import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ShieldAlert, Tv, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const TV_APP_APK_URL = "/downloads/trey-tv-streamingbox-debug.apk";
const TV_APP_APK_VERSIONED_URL = `${TV_APP_APK_URL}?v=727C3BC9`;

export const Route = createFileRoute("/download-tv-app")({
  component: DownloadTvApp,
  head: () => ({
    meta: [
      { title: "Download TV App - Trey TV" },
      {
        name: "description",
        content: "Download the Trey TV Android TV test build for owner/internal device testing.",
      },
    ],
  }),
});

function DownloadTvApp() {
  return (
    <main className="min-h-screen w-full bg-[#05070D] text-foreground relative overflow-hidden flex items-center justify-center py-10">
      {/* Ambient background glows */}
      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full blur-3xl opacity-35 animate-pulse" style={{ background: "radial-gradient(circle, #FFC857, transparent 70%)", animationDuration: "12s" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #A855F7, transparent 70%)" }} />
      </div>

      <section className="relative w-full max-w-2xl px-4 flex flex-col items-center">
        {/* Floating Glass Container */}
        <div className="w-full liquid-glass border border-white/10 rounded-[32px] p-6 sm:p-10 backdrop-blur-xl relative overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
          <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer-sweep pointer-events-none" style={{ animationDuration: "4s" }} />
          
          {/* Back Home Button */}
          <Link
            to="/"
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 active:scale-95 transition"
            title="Back to home"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300" />
          </Link>

          <div className="flex flex-col items-center text-center">
            <Link to="/" className="inline-flex items-center justify-center transition-transform hover:scale-[1.03]">
              <Logo className="h-16" />
            </Link>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-primary shadow-[0_0_15px_rgba(255,200,87,0.1)]">
              <Tv className="size-3.5 animate-pulse" />
              Android TV / Google TV Build
            </div>

            <h1 className="font-display mt-5 text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight text-white">
              Download TV App
            </h1>
            <p className="mt-3 max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed">
              Install the current Trey TV developer build on your Android TV, Google TV, or Fire Stick device for internal preview and network testing.
            </p>

            {/* Premium Gold Action Button */}
            <a
              href={TV_APP_APK_URL}
              download
              className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-300 via-gold to-amber-500 px-8 py-4 font-black text-black hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-[0_0_30px_rgba(255,200,87,0.45)] uppercase tracking-[0.15em] text-[11px]"
            >
              <Download className="size-4 stroke-[3px]" /> Download TV App (APK)
            </a>
            
            <p className="mt-3 text-[10px] text-slate-500">
              If download does not start, long-press or tap and choose <span className="text-slate-400 font-bold">Open Link</span>.
            </p>

            {/* Sideload Warning Card */}
            <div className="mt-8 w-full rounded-2xl border border-primary/20 bg-primary/5 p-5 text-left relative overflow-hidden">
              <span className="absolute inset-y-0 left-0 w-1 bg-primary" />
              <div className="flex items-start gap-3">
                <ShieldAlert className="size-5 shrink-0 text-primary drop-shadow-[0_0_8px_rgba(255,200,87,0.5)]" />
                <div>
                  <h2 className="text-xs font-black uppercase tracking-wider text-primary">Sideloading Instructions</h2>
                  <p className="mt-1 text-xs text-slate-300 leading-relaxed">
                    This is a debug-signed build (.apk) for test environments. You will need to allow installation of apps from unknown sources in your TV's developer settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Clean Specifications Grid */}
            <div className="mt-6 space-y-2.5 w-full text-xs text-left">
              {[
                { label: "File Path", val: TV_APP_APK_URL, code: true },
                { label: "Package ID", val: "com.treytv.streamingbox", code: true },
                { label: "Build Date", val: "May 28, 2026", code: false },
                { label: "File Size", val: "31.7 MB (31,678,061 bytes)", code: false },
                { label: "SHA256 Hash", val: "727C3BC9...", code: true },
                { label: "Alternative Link", val: "Cache-bust download", href: TV_APP_APK_VERSIONED_URL, code: false }
              ].map((item) => (
                <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-3.5 rounded-xl border border-white/5 bg-white/[0.015] hover:bg-white/[0.035] hover:border-white/10 transition duration-300">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{item.label}</span>
                  {item.href ? (
                    <a href={item.href} download className="text-primary hover:underline font-bold text-xs flex items-center gap-1">
                      <Download className="w-3 h-3" /> {item.val}
                    </a>
                  ) : (
                    <span className={`font-medium ${item.code ? 'font-mono text-slate-300 break-all bg-black/40 px-2 py-0.5 rounded border border-white/5 text-[10px]' : 'text-white'}`}>
                      {item.val}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
