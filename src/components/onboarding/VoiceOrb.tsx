import { Loader2, Mic, Sparkles, Volume2, CheckCircle2 } from "lucide-react";

export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "captured"
  | "completed"
  | "unavailable";

export function VoiceOrb({ state, size = 192 }: { state: VoiceState; size?: number }) {
  const spin = state === "listening" || state === "speaking" || state === "processing";
  const Icon =
    state === "processing" ? Loader2
    : state === "speaking" ? Volume2
    : state === "listening" ? Mic
    : state === "captured" || state === "completed" ? CheckCircle2
    : Sparkles;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* outer rotating conic */}
      <div
        aria-hidden
        className={`absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85),oklch(0.7_0.25_340),oklch(0.65_0.22_300),oklch(0.82_0.15_215),oklch(0.82_0.16_85))] blur-md ${
          spin ? "animate-conic-spin" : "opacity-60"
        }`}
      />
      {/* inner glass core */}
      <div className="absolute inset-2 rounded-full bg-background grid place-items-center liquid-glass border border-white/10">
        <Icon
          className={`size-12 ${
            state === "processing" ? "text-primary animate-spin" :
            state === "captured" || state === "completed" ? "text-[oklch(0.78_0.18_150)]" :
            "text-primary"
          } ${state === "listening" ? "animate-glow-pulse" : ""}`}
        />
      </div>
      {/* halo */}
      <div aria-hidden className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-glow-pulse" />

      {/* listening waveform ring */}
      {state === "listening" && (
        <div aria-hidden className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="size-full rounded-full border border-primary/30 animate-ping" />
        </div>
      )}
    </div>
  );
}
