import React, { useCallback, useEffect, useRef, useState } from "react";
import { TreyLogo } from "../components/Logo";
import { GlassPanel } from "../components/Primitives";
import {
  Smartphone,
  Monitor,
  User,
  Tv,
  Gem,
  Cloud,
  Shield,
  Loader2,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTV } from "../TVContext";

// The TV app loads this shell from file://; API calls must be absolute.
const API_BASE = "https://tv.treytrizzy.com";

type ActStatus = "loading" | "pending" | "approved" | "expired" | "error";

function qrUrl(userCode: string) {
  const target = `${API_BASE}/tv/activate?code=${encodeURIComponent(userCode.replace(/[^A-Za-z0-9]/g, ""))}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&bgcolor=000000&color=FF2BD6&data=${encodeURIComponent(target)}`;
}

export const ActivationScreen: React.FC = () => {
  const { navigate } = useTV();
  const [status, setStatus] = useState<ActStatus>("loading");
  const [userCode, setUserCode] = useState("");
  const [deviceCode, setDeviceCode] = useState("");
  const [expiresAt, setExpiresAt] = useState<number>(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(async () => {
    setStatus("loading");
    setUserCode("");
    try {
      const r = await fetch(`${API_BASE}/api/tv/device/start`, { method: "POST" });
      const d = await r.json();
      if (!r.ok || !d.device_code) {
        setStatus("error");
        return;
      }
      setDeviceCode(d.device_code);
      setUserCode(String(d.user_code || ""));
      setExpiresAt(d.expires_at ? new Date(d.expires_at).getTime() : Date.now() + 10 * 60 * 1000);
      setStatus("pending");
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    start();
  }, [start]);

  // Poll for approval while pending.
  useEffect(() => {
    if (status !== "pending" || !deviceCode) return;
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(
          `${API_BASE}/api/tv/device/status?device_code=${encodeURIComponent(deviceCode)}`,
        );
        const d = await r.json();
        if (d.status === "approved" && d.access_token) {
          try {
            localStorage.setItem("trey_tv_token", d.access_token);
          } catch {}
          (
            window as unknown as { TreyTvNative?: { saveToken?: (t: string) => void } }
          ).TreyTvNative?.saveToken?.(d.access_token);
          setStatus("approved");
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => navigate("home"), 1500);
        } else if (d.status === "expired" || d.status === "denied") {
          setStatus("expired");
          if (pollRef.current) clearInterval(pollRef.current);
        }
      } catch {
        /* keep polling */
      }
    }, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, deviceCode, navigate]);

  // Countdown.
  useEffect(() => {
    if (status !== "pending" || !expiresAt) return;
    const tick = () => {
      const left = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 0) setStatus("expired");
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, expiresAt]);

  const mmss = `${String(Math.floor(secondsLeft / 60)).padStart(2, "0")}:${String(secondsLeft % 60).padStart(2, "0")}`;
  const spacedCode = userCode
    .replace(/[^A-Za-z0-9]/g, "")
    .split("")
    .join(" ");

  return (
    <div className="relative min-h-screen w-full bg-[#05050A] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/3 w-[700px] h-[700px] rounded-full bg-fuchsia-700/20 blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-purple-700/20 blur-[160px]" />
      </div>

      <div className="relative z-10 grid grid-cols-2 gap-10 px-16 py-14 max-w-[1600px] mx-auto">
        {/* Left: logo */}
        <div className="flex flex-col justify-center">
          <TreyLogo size="xl" className="!h-48" />
          <h1 className="mt-10 text-6xl font-black leading-tight">
            Activate Your{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent">
              Device
            </span>
          </h1>
          <p className="mt-4 text-xl text-white/70">Unlock the full Trey TV experience.</p>
        </div>

        {/* Right: code card */}
        <GlassPanel className="p-10">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-fuchsia-400" />
                <div className="text-xl font-bold">Scan to Activate</div>
              </div>
              <p className="text-sm text-white/65 mb-4">
                Open your phone camera <u>and</u> scan this QR code
              </p>
              <div className="relative w-[260px] h-[260px] rounded-2xl border-2 border-fuchsia-400/70 shadow-[0_0_36px_rgba(255,43,214,0.5)] overflow-hidden bg-white grid place-items-center">
                {userCode ? (
                  <img
                    src={qrUrl(userCode)}
                    alt="Activation QR code"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Loader2 className="w-10 h-10 text-black/40 animate-spin" />
                )}
              </div>
            </div>

            <div className="border-l border-white/10 pl-8">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="w-5 h-5 text-fuchsia-400" />
                <div className="text-xl font-bold">Enter Code on Web</div>
              </div>
              <p className="text-sm text-white/65 mb-4">
                Visit <span className="text-fuchsia-300">tv.treytrizzy.com/tv/activate</span> and
                enter this code
              </p>
              <div className="rounded-2xl border border-fuchsia-500/40 bg-black/50 px-6 py-7 text-center shadow-[0_0_30px_rgba(255,43,214,0.3)_inset] min-h-[96px] grid place-items-center">
                {userCode ? (
                  <div className="text-5xl font-black tracking-[0.18em] bg-gradient-to-r from-white to-fuchsia-200 bg-clip-text text-transparent">
                    {spacedCode}
                  </div>
                ) : (
                  <Loader2 className="w-8 h-8 text-fuchsia-300 animate-spin" />
                )}
              </div>
              <div className="mt-4 text-sm text-white/65 text-center">
                {status === "pending" ? (
                  <>
                    Code expires in <span className="text-fuchsia-300 font-bold">{mmss}</span>
                  </>
                ) : status === "expired" ? (
                  <span className="text-amber-300 font-bold">Code expired</span>
                ) : (
                  <>&nbsp;</>
                )}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* Status bar */}
        <GlassPanel className="col-span-2 p-6 flex items-center gap-5">
          {status === "approved" ? (
            <>
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <div>
                <div className="text-xl font-bold">You're signed in!</div>
                <div className="text-sm text-white/60">Taking you to Trey TV…</div>
              </div>
            </>
          ) : status === "expired" || status === "error" ? (
            <>
              <RefreshCw className="w-10 h-10 text-fuchsia-400" />
              <div>
                <div className="text-xl font-bold">
                  {status === "error" ? "Couldn't reach Trey TV" : "This code expired"}
                </div>
                <div className="text-sm text-white/60">Generate a new code to try again.</div>
              </div>
              <button
                autoFocus
                onClick={() => start()}
                className="ml-auto px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold outline-none focus:scale-[1.05] focus:ring-2 focus:ring-fuchsia-400"
              >
                New Code
              </button>
            </>
          ) : (
            <>
              <Loader2 className="w-10 h-10 text-fuchsia-400 animate-spin" />
              <div>
                <div className="text-xl font-bold">Waiting for approval</div>
                <div className="text-sm text-white/60">
                  Approve this TV on your phone or computer to finish signing in.
                </div>
              </div>
              <button
                onClick={() => navigate("home")}
                className="ml-auto px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-fuchsia-400 focus:shadow-[0_0_20px_rgba(255,43,214,0.5)]"
              >
                Browse without signing in →
              </button>
            </>
          )}
        </GlassPanel>

        {/* Benefits */}
        <GlassPanel className="col-span-2 p-8">
          <div className="text-lg font-bold mb-5">
            Signing in gets you <span className="text-fuchsia-300">more</span>
          </div>
          <div className="grid grid-cols-4 gap-6">
            {[
              { Icon: User, t: "Personalized for You", d: "Get recommendations you'll love." },
              { Icon: Tv, t: "Watch Anywhere", d: "Pick up where you left off on any device." },
              { Icon: Gem, t: "Premium Access", d: "Unlock exclusive content and early releases." },
              { Icon: Cloud, t: "Your Watchlist", d: "Save favorites and never lose track." },
            ].map((b) => (
              <div key={b.t} className="flex items-start gap-3">
                <b.Icon className="w-8 h-8 text-fuchsia-400 shrink-0" />
                <div>
                  <div className="font-bold">{b.t}</div>
                  <div className="text-sm text-white/65">{b.d}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="col-span-2 flex items-center justify-between text-sm text-white/60">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Secure. Private. Always Yours. Your data is protected and
            never shared.
          </div>
          <div>
            Need help? Visit <span className="text-fuchsia-300">tv.treytrizzy.com/help</span>
          </div>
        </div>
      </div>
    </div>
  );
};
