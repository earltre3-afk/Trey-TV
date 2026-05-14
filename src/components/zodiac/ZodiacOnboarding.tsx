import { useState } from "react";
import { AlertCircle, ArrowRight, Calendar } from "lucide-react";
import { ZODIAC_SIGNS, zodiacSymbol } from "@/lib/zodiac";

const SIGN_DATES: Record<string, string> = {
  Aries: "Mar 21 - Apr 19",
  Taurus: "Apr 20 - May 20",
  Gemini: "May 21 - Jun 20",
  Cancer: "Jun 21 - Jul 22",
  Leo: "Jul 23 - Aug 22",
  Virgo: "Aug 23 - Sep 22",
  Libra: "Sep 23 - Oct 22",
  Scorpio: "Oct 23 - Nov 21",
  Sagittarius: "Nov 22 - Dec 21",
  Capricorn: "Dec 22 - Jan 19",
  Aquarius: "Jan 20 - Feb 18",
  Pisces: "Feb 19 - Mar 20",
};

interface ZodiacOnboardingProps {
  onSelect?: (sign: string, birthDate?: string, isCusp?: boolean) => void;
}

export function ZodiacOnboarding({ onSelect }: ZodiacOnboardingProps) {
  const [selectedSign, setSelectedSign] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState("");
  const [isCusp, setIsCusp] = useState(false);
  const [step, setStep] = useState<"select-sign" | "confirm-date">("select-sign");

  const handleSignSelect = (sign: string) => {
    setSelectedSign(sign);
    setStep("confirm-date");
  };

  const handleConfirm = () => {
    if (selectedSign && birthDate) onSelect?.(selectedSign, birthDate, isCusp);
  };

  const handleBack = () => {
    setStep("select-sign");
    setBirthDate("");
    setIsCusp(false);
  };

  return (
    <div className="zodiac-onboarding space-y-6">
      {step === "select-sign" ? (
        <>
          <div className="space-y-2 text-center">
            <h1 className="bg-gradient-to-r from-[#ffc857] via-[#a855f7] to-[#06b6d4] bg-clip-text text-3xl font-bold text-transparent">
              Discover Your Cosmic Identity
            </h1>
            <p className="text-muted-foreground">
              Your zodiac sign unlocks personalized readings, matched souls, and exclusive group access.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {ZODIAC_SIGNS.map((sign) => (
              <button
                key={sign}
                onClick={() => handleSignSelect(sign)}
                className={`zodiac-sign-card glass group relative rounded-2xl p-4 transition-all duration-300 ${
                  selectedSign === sign ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="space-y-1 text-center">
                  <div className="text-4xl">{zodiacSymbol(sign)}</div>
                  <div className="text-sm font-semibold">{sign}</div>
                  <div className="text-xs text-muted-foreground">{SIGN_DATES[sign]}</div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/0 to-white/0 opacity-0 transition-opacity group-hover:opacity-5" />
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Final sign assignment should come from your birth details, not a guess.
          </p>
        </>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">Confirm Your Birth Date</h2>
            <p className="text-muted-foreground">This helps Trey TV calculate your zodiac identity.</p>
          </div>

          <div className="glass space-y-4 rounded-2xl p-6 text-center">
            <div className="text-5xl">{selectedSign ? zodiacSymbol(selectedSign) : null}</div>
            <div>
              <h3 className="text-xl font-bold">{selectedSign}</h3>
              <p className="text-sm text-muted-foreground">{selectedSign ? SIGN_DATES[selectedSign] : ""}</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Birth Date</label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="date"
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className="glass-input w-full pl-10"
              />
            </div>
          </div>

          <div className="glass space-y-3 rounded-2xl border-[oklch(0.82_0.16_85_/_0.25)] p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 size-5 shrink-0 text-[oklch(0.82_0.16_85)]" />
              <div className="space-y-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isCusp}
                    onChange={() => setIsCusp((value) => !value)}
                    className="size-4 rounded border-[oklch(1_0_0_/_0.2)]"
                  />
                  <span className="text-sm font-medium">I'm born on a cusp</span>
                </label>
                <p className="text-xs text-muted-foreground">Unlock rare Cusp Soul status and dual-sign readings.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className="flex-1 rounded-xl border border-[oklch(1_0_0_/_0.15)] px-4 py-3 transition-colors hover:bg-[oklch(1_0_0_/_0.05)]"
            >
              Back
            </button>
            <button
              onClick={handleConfirm}
              disabled={!birthDate}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ffc857] to-[#a855f7] px-4 py-3 font-semibold text-black transition-all hover:shadow-[0_0_24px_oklch(0.82_0.16_85_/_0.5)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Unlock Identity <ArrowRight className="size-4" />
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Exact birth details stay private. Only your zodiac identity can be public.
          </p>
        </>
      )}
    </div>
  );
}
