import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, ShieldAlert, Tv } from "lucide-react";
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
    <main className="min-h-screen w-full bg-background text-foreground">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <Link to="/" className="inline-flex items-center justify-center">
          <Logo className="h-20" />
        </Link>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full liquid-glass border border-white/15 px-3 py-1 text-[11px] tracking-[0.22em] text-muted-foreground">
          <Tv className="size-3.5 text-primary" />
          ANDROID TV / GOOGLE TV TEST BUILD
        </div>

        <h1 className="font-display mt-6 text-4xl font-black leading-tight sm:text-6xl">
          Download TV App
        </h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
          Install the current Trey TV debug build on Android TV, Google TV, or Fire Stick devices for internal testing.
        </p>

        <a
          href={TV_APP_APK_URL}
          download
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground glow-gold sm:w-auto"
        >
          <Download className="size-4" /> Download TV App
        </a>
        <p className="mt-3 max-w-xl text-xs text-muted-foreground">
          If download does not start, long-press or click and choose Open Link.
        </p>

        <div className="mt-5 w-full rounded-2xl liquid-glass neon-border p-5 text-left">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-sm font-bold">Test build only</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This is a debug-signed build for Android TV / Google TV devices. You may need to allow installs from unknown sources on your device.
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-5 grid w-full gap-3 rounded-2xl border border-white/10 p-5 text-left text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">File</dt>
            <dd className="mt-1 break-all font-mono text-xs">{TV_APP_APK_URL}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Package</dt>
            <dd className="mt-1 font-mono text-xs">com.treytv.streamingbox</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Build date</dt>
            <dd className="mt-1">May 28, 2026</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Size</dt>
            <dd className="mt-1">31,678,061 bytes</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">SHA256</dt>
            <dd className="mt-1 font-mono text-xs">727C3BC9...</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-widest text-muted-foreground">Cache-bust link</dt>
            <dd className="mt-1 break-all font-mono text-xs">
              <a href={TV_APP_APK_VERSIONED_URL} download className="text-primary underline">
                {TV_APP_APK_VERSIONED_URL}
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
