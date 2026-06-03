import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Download,
  ShieldAlert,
  Tv,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  HardDrive,
  ShieldCheck,
  Terminal as TerminalIcon,
} from "lucide-react";
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
    <main className="min-h-screen w-full bg-[#030509] text-foreground relative overflow-hidden flex items-center justify-center py-16 px-4 liquid-stage">
      {/* Authentic Trey TV Grid Veil Grid-Veil Background */}
      <div className="grid-veil" />

      {/* Cybernetic Ambient Glow Orbs */}
      <div
        aria-hidden
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 pointer-events-none animate-pulse"
        style={{
          background: "radial-gradient(circle, var(--color-neon-cyan, #00D2FF), transparent 70%)",
          animationDuration: "14s",
        }}
      />
      <div
        aria-hidden
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, var(--color-neon-purple, #A855F7), transparent 70%)",
        }}
      />

      <section className="relative w-full max-w-2xl flex flex-col items-center z-10">
        {/* Back Link as Sleek Cybernetic Badge */}
        <Link
          to="/"
          className="absolute -top-12 left-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/10 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 backdrop-blur-xl transition-all duration-300 group shadow-lg active:scale-95 text-xs font-mono tracking-wider"
          title="Back to home"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-cyan-500" />
          <span>RETURN TO ORBIT</span>
        </Link>

        {/* Premium Neon Border Glow Wrapper */}
        <div className="w-full neon-blue rounded-[32px] p-[1.5px] shadow-[0_0_60px_rgba(30,58,138,0.3)] relative group transition-transform duration-500 hover:scale-[1.015]">
          {/* Inner Liquid Glass Card Core */}
          <div className="w-full h-full bg-[#05070f]/90 backdrop-blur-3xl rounded-[30.5px] p-6 sm:p-12 relative overflow-hidden border border-white/5 flex flex-col items-center">
            {/* Shimmer Sweep Animation */}
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer-sweep pointer-events-none"
              style={{ animationDuration: "5s" }}
            />

            {/* Holographic corner gradients */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/10 to-transparent blur-3xl pointer-events-none" />

            {/* Glowing Brand Logo Container */}
            <div className="relative inline-flex flex-col items-center">
              <div className="absolute inset-0 bg-primary/25 blur-2xl rounded-full scale-75 animate-pulse" />
              <Link
                to="/"
                className="relative inline-flex items-center justify-center transition-all duration-500 hover:scale-105 logo-float"
              >
                <Logo className="h-16 sm:h-20" />
              </Link>
            </div>

            {/* Status Telemetry Badge */}
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-950/40 px-4 py-2 text-[9px] font-black uppercase tracking-[0.25em] text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md animate-float">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              Android TV · Live Server Node
            </div>

            {/* Redesigned Title with Luxury Gradients */}
            <h1 className="font-display mt-6 text-center text-3xl sm:text-5xl font-black leading-tight tracking-tight uppercase">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Download
              </span>
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-gold to-yellow-500 drop-shadow-[0_2px_15px_rgba(255,200,87,0.35)] font-black">
                TV Streaming Client
              </span>
            </h1>

            {/* Refined Premium Subtitle */}
            <p className="mt-4 text-center max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed font-medium">
              Access the official{" "}
              <span className="text-white font-bold">Trey TV Streaming Box</span> build. Stream 4K
              channels, customized widgets, and interactive chat directly on your TV.
            </p>

            {/* Premium Gold Redesigned CTA Button */}
            <div className="mt-10 relative group w-full sm:w-auto flex flex-col items-center">
              <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl group-hover:scale-110 transition-all duration-500 pointer-events-none group-hover:opacity-100 opacity-75 animate-pulse" />

              <a
                href={TV_APP_APK_URL}
                download
                className="relative inline-flex w-full sm:w-auto items-center justify-center gap-3.5 rounded-2xl neon-btn-gold px-10 py-5 font-black text-[#05070D] transition-all duration-300 uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.03] active:scale-[0.97]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 opacity-20 hover:opacity-35 transition duration-300 pointer-events-none" />
                <Download className="size-5 stroke-[2.5px] text-[#05070D] animate-bounce" />
                <span className="relative z-10 font-black tracking-[0.18em]">
                  Download Streaming Box APK
                </span>
              </a>

              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                <CheckCircle2 className="size-3.5 text-emerald-500 animate-pulse" />
                <span>SHA256 verified payload</span>
              </div>
            </div>

            {/* Holographic Warning Panel */}
            <div className="mt-10 w-full rounded-2xl border border-indigo-500/20 bg-indigo-950/25 p-5 text-left relative overflow-hidden backdrop-blur-md shadow-inner group hover:border-indigo-500/40 transition duration-500">
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />
              <div className="absolute inset-y-0 left-0 w-[3px] bg-indigo-500/50 group-hover:bg-indigo-400 transition" />

              <div className="flex items-start gap-4">
                <div className="size-9 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.25)] shrink-0 mt-0.5">
                  <ShieldAlert className="size-4 animate-pulse text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300 flex items-center gap-1.5">
                    Sideloading Protocol
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[8px] tracking-normal font-mono lowercase text-indigo-400">
                      required
                    </span>
                  </h2>
                  <p className="mt-2 text-[11px] text-slate-400 leading-relaxed font-medium">
                    This represents an internal development-signed binary{" "}
                    <code className="font-mono text-indigo-300 text-[10px] bg-indigo-950/60 px-1 py-0.5 rounded border border-indigo-500/10">
                      (.apk)
                    </code>
                    . Complete the installation by enabling{" "}
                    <span className="text-white font-semibold">"Apps from Unknown Sources"</span>{" "}
                    within your TV or Firestick's System settings.
                  </p>
                </div>
              </div>
            </div>

            {/* Hardware Specifications Grid Panel */}
            <div className="mt-8 space-y-2.5 w-full text-xs text-left">
              <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-3 pl-1 flex items-center gap-2">
                <span className="w-1 h-3 bg-amber-400 rounded-full" />
                Package Manifest Telemetry
              </div>

              {[
                { label: "Destination Path", val: TV_APP_APK_URL, icon: TerminalIcon, code: true },
                { label: "Application ID", val: "com.treytv.streamingbox", icon: Cpu, code: true },
                { label: "Manifest Date", val: "May 28, 2026", icon: CheckCircle2, code: false },
                {
                  label: "Binary Footprint",
                  val: "31.7 MB (31,678,061 bytes)",
                  icon: HardDrive,
                  code: false,
                },
                {
                  label: "SHA256 Signature",
                  val: "727c3bc997d91d64c12ff8701e1daec014b2dcd8",
                  icon: ShieldCheck,
                  code: true,
                },
                {
                  label: "Bust Link (Secure)",
                  val: "Force-bypass CDN node",
                  href: TV_APP_APK_VERSIONED_URL,
                  icon: Download,
                  code: false,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:border-cyan-500/20 hover:shadow-[0_0_15px_rgba(6,182,212,0.03)] transition duration-300"
                >
                  {/* Hover subtle glow marker */}
                  <div className="absolute inset-y-0 left-0 w-[2px] bg-transparent group-hover:bg-cyan-400/60 rounded-l-xl transition-all" />

                  <span className="text-slate-500 font-black uppercase tracking-wider text-[8px] font-mono flex items-center gap-1.5">
                    <item.icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    {item.label}
                  </span>

                  {item.href ? (
                    <a
                      href={item.href}
                      download
                      className="text-amber-400 hover:text-amber-300 transition-colors font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 animate-pulse" /> {item.val}
                    </a>
                  ) : (
                    <span
                      className={`font-medium ${item.code ? "font-mono text-cyan-400 break-all bg-cyan-950/30 px-2 py-1 rounded border border-cyan-500/10 text-[10px]" : "text-slate-200"}`}
                    >
                      {item.val}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Back to Home Direct Indicator */}
            <p className="mt-8 text-center text-[10px] text-slate-500">
              Need assistance? Contact the{" "}
              <Link to="/" className="text-cyan-400 hover:underline font-bold">
                Developer Operations Center
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
