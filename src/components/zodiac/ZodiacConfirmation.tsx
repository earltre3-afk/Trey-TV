import { useState } from "react";
import { Lock, Share2, Sparkles } from "lucide-react";

interface ZodiacConfirmationProps {
  sign: string;
  symbol: string;
  isCusp?: boolean;
  cuspNote?: string;
  onConfirm?: () => void;
  onShare?: () => void;
}

export function ZodiacConfirmation({
  sign,
  symbol,
  isCusp = false,
  cuspNote,
  onConfirm,
  onShare,
}: ZodiacConfirmationProps) {
  const [isLocked, setIsLocked] = useState(true);
  const [unlockProgress, setUnlockProgress] = useState(0);

  const handleUnlock = (clientX: number, width: number, left: number) => {
    const progress = Math.max(0, Math.min(1, (clientX - left) / width));
    setUnlockProgress(progress);
    if (progress > 0.8) setIsLocked(false);
  };

  const resetIfLocked = () => {
    if (isLocked) setUnlockProgress(0);
  };

  return (
    <div className="zodiac-confirmation relative flex min-h-screen w-full flex-col items-center justify-center space-y-8 px-4">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/2 top-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, oklch(0.82 0.16 85 / 0.3), transparent 25%, transparent 75%, oklch(0.65 0.22 300 / 0.3))",
            filter: "blur(60px)",
            animation: "conic-spin 8s linear infinite",
          }}
        />
        <div
          className="absolute right-20 top-20 size-72 rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.25 340 / 0.25), transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-20 left-20 size-72 rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.82 0.15 215 / 0.2), transparent 70%)", filter: "blur(80px)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-8 text-center">
        <div className="relative mx-auto size-40">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, oklch(0.82 0.16 85), oklch(0.7 0.25 340), oklch(0.65 0.22 300), oklch(0.82 0.15 215), oklch(0.82 0.16 85))",
              padding: "2px",
              animation: "conic-spin 6s linear infinite",
            }}
          >
            <div className="glass-strong absolute inset-1 flex items-center justify-center rounded-full">
              <span className="text-7xl">{symbol}</span>
            </div>
          </div>
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle, oklch(0.82 0.16 85 / 0.4), transparent 70%)", filter: "blur(20px)" }}
          />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{sign}</h1>
          <p className="text-muted-foreground">Your Cosmic Identity Unlocked</p>
          {isCusp && (
            <div className="inline-block rounded-full bg-gradient-to-r from-[#ffc857] via-[#a855f7] to-[#06b6d4] px-3 py-1.5 text-xs font-bold text-black">
              Cusp Soul
            </div>
          )}
        </div>

        <div className="glass-strong space-y-4 rounded-2xl p-6">
          <div className="space-y-3 text-left">
            {isCusp ? (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Two Energies</p>
                  <p className="text-sm font-medium">The Between Worlds Badge</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {cuspNote ?? "Your birth falls on the threshold between two signs. You embody dual cosmic energies, granting access to both zodiac groups and rare cusp-only experiences."}
                </p>
              </>
            ) : (
              <>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Elemental</p>
                  <p className="text-sm font-medium">Connected to Your Sign's Energy</p>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  You're now linked to your cosmic community. Receive daily personalized readings and join groups matched by Trey TV.
                </p>
              </>
            )}
          </div>
        </div>

        {isLocked ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Drag to confirm your identity</p>
            <div
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                handleUnlock(event.clientX, rect.width, rect.left);
              }}
              onTouchMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                handleUnlock(event.touches[0]?.clientX ?? rect.left, rect.width, rect.left);
              }}
              onMouseUp={resetIfLocked}
              onMouseLeave={resetIfLocked}
              onTouchEnd={resetIfLocked}
              className="glass-strong group relative h-14 cursor-grab overflow-hidden rounded-full active:cursor-grabbing"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#ffc857] via-[#a855f7] to-[#06b6d4] opacity-30 transition-all" style={{ width: `${unlockProgress * 100}%` }} />
              <div
                className="absolute top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#ffc857] to-[#a855f7] shadow-lg transition-all"
                style={{ left: `${unlockProgress * (100 - 12)}%` }}
              >
                <Lock className="size-5 text-black" />
              </div>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                {unlockProgress < 0.8 ? (
                  <Sparkles className="size-4 text-muted-foreground opacity-50" />
                ) : (
                  <span className="bg-gradient-to-r from-[#ffc857] to-[#a855f7] bg-clip-text text-xs font-bold text-transparent">
                    Confirmed!
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ffc857] to-[#a855f7] px-4 py-3 font-semibold text-black">
              <Sparkles className="size-4" />
              Identity Confirmed
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={onShare} className="glass flex items-center justify-center gap-2 rounded-xl px-4 py-3 transition-colors hover:bg-[oklch(1_0_0_/_0.08)]">
                <Share2 className="size-4" />
                Share
              </button>
              <button onClick={onConfirm} className="rounded-xl border border-[oklch(1_0_0_/_0.15)] px-4 py-3 font-medium transition-colors hover:bg-[oklch(1_0_0_/_0.05)]">
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
