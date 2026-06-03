import React, { ComponentType, useMemo, useState } from "react";
import { Lock, Drama, Laugh, Skull, Zap, HeartPulse, ArrowLeft } from "lucide-react";
import { Scenario, UserAnswer } from "@/types/naturalAbility";
import SignalProgressBar from "./SignalProgressBar";
import TreyTVLogo from "./TreyTVLogo";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  scenario: Scenario;
  index: number;
  total: number;
  onLockIn: (answer: UserAnswer) => void;
}

const GENRE_META: Record<
  string,
  { icon: ComponentType<{ className?: string }>; color: string; ring: string }
> = {
  Drama: { icon: Drama, color: "text-violet-300", ring: "border-violet-400/40 bg-violet-500/10" },
  Funny: { icon: Laugh, color: "text-amber-300", ring: "border-amber-400/40 bg-amber-500/10" },
  Scary: { icon: Skull, color: "text-rose-400", ring: "border-rose-400/40 bg-rose-500/10" },
  Action: { icon: Zap, color: "text-cyan-300", ring: "border-cyan-400/40 bg-cyan-500/10" },
  "Real Life": {
    icon: HeartPulse,
    color: "text-pink-300",
    ring: "border-pink-400/40 bg-pink-500/10",
  },
};

const choiceLetters: Array<"A" | "B" | "C"> = ["A", "B", "C"];
const choiceTints = [
  "from-cyan-400 to-blue-500",
  "from-violet-400 to-fuchsia-500",
  "from-amber-400 to-orange-500",
];

const SignalScenarioCard: React.FC<Props> = ({ scenario, index, total, onLockIn }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<"A" | "B" | "C" | null>(null);
  const [custom, setCustom] = useState("");
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [drawerInput, setDrawerInput] = useState("");

  const customActive = custom.trim().length > 0;
  const customValid = custom.trim().length >= 8;
  const choicesDisabled = customActive;
  const customDisabled = selected !== null;

  const canLock = useMemo(() => Boolean(selected || customValid), [selected, customValid]);

  const handleSelect = (id: "A" | "B" | "C") => {
    if (customActive) return;
    setSelected((current) => (current === id ? null : id));
  };

  const handleCustom = (v: string) => {
    setCustom(v);
    if (v.trim().length > 0) setSelected(null);
  };

  const openDrawer = () => {
    if (customDisabled) return;
    setDrawerInput(custom);
    setIsCustomOpen(true);
  };

  const handleSaveCustom = () => {
    if (drawerInput.trim().length < 8) return;
    handleCustom(drawerInput);
    setIsCustomOpen(false);
  };

  const handleCancelCustom = () => {
    setIsCustomOpen(false);
  };

  const handleLock = () => {
    if (!canLock) return;
    if (selected) {
      onLockIn({ scenarioId: scenario.id, selectedChoiceId: selected });
    } else if (customValid) {
      onLockIn({ scenarioId: scenario.id, customText: custom.trim() });
    }
    setSelected(null);
    setCustom("");
  };

  const genre = GENRE_META[scenario.genre];
  const GenreIcon = genre.icon;

  // Programmatic brief and pressure line split helper
  const { sceneBrief, pressureLine } = useMemo(() => {
    if (scenario.sceneBrief && scenario.pressureLine) {
      return {
        sceneBrief: scenario.sceneBrief,
        pressureLine: scenario.pressureLine,
      };
    }

    const cleaned = scenario.scenarioBody.trim().replace(/\s+/g, " ");
    const sentences = cleaned.match(/[^.!?]+[.!?]+/g) || [cleaned];
    const trimmed = sentences.map((s) => s.trim());

    if (trimmed.length <= 1) {
      return {
        sceneBrief: trimmed,
        pressureLine: "",
      };
    }

    return {
      sceneBrief: trimmed.slice(0, trimmed.length - 1),
      pressureLine: trimmed[trimmed.length - 1],
    };
  }, [scenario]);

  const renderCustomTrigger = (isDesktop = false) => {
    const isSelected = customActive;
    const paddingClass = isDesktop ? "px-4 py-4" : "px-3.5 py-2.5";
    const heightClass = isDesktop ? "h-11 w-11" : "h-8 w-8";
    const textClass = isDesktop ? "text-xs" : "text-[10px] leading-snug mt-0.5";
    const labelClass = isDesktop ? "text-sm" : "text-xs";

    return (
      <button
        onClick={openDrawer}
        disabled={customDisabled}
        className={`group relative w-full text-left rounded-xl p-[1.5px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 ${
          isSelected
            ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_20px_-5px_rgba(245,158,11,0.55)]"
            : customDisabled
              ? "bg-white/5 opacity-40 cursor-not-allowed"
              : "bg-white/10 hover:bg-white/15"
        }`}
      >
        <div
          className={`flex items-center gap-3 rounded-xl border border-white/5 bg-[#0a0518]/85 ${paddingClass} backdrop-blur-xl`}
        >
          <div
            className={`flex ${heightClass} shrink-0 items-center justify-center rounded-lg text-sm font-black ${
              isSelected
                ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white"
                : "border border-white/10 bg-black/40 text-slate-300"
            }`}
          >
            ✎
          </div>
          <div className="min-w-0 flex-1">
            <div className={`${labelClass} font-bold text-white`}>
              {isSelected ? "My Custom Action" : "I’d do something else…"}
            </div>
            <p className={`${textClass} text-slate-400`}>
              {isSelected ? `"${custom}"` : "Type your own custom reaction to this scene."}
            </p>
          </div>
          {isSelected ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCustom("");
              }}
              className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 transition"
            >
              Clear
            </button>
          ) : (
            <Lock className="h-4 w-4 shrink-0 text-slate-500" />
          )}
        </div>
      </button>
    );
  };

  return (
    <div className="signal-test-fit-above-mobile-nav w-full bg-[#06030f] text-white relative overflow-hidden flex flex-col px-4 py-3 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-violet-700/20 blur-[120px] lg:h-[620px] lg:w-[620px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-cyan-700/20 blur-[120px] lg:h-[620px] lg:w-[620px]" />

      <div className="relative mx-auto w-full max-w-6xl flex-1 flex flex-col overflow-hidden">
        {/* Compact Header Bar */}
        <header className="flex items-center justify-between gap-4 py-2 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/" })}
              className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-white/10 transition shrink-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <TreyTVLogo size="sm" className="hidden sm:inline-flex" />
            <span className="text-xs font-black tracking-widest text-cyan-300/80 sm:hidden">
              SIGNAL TEST
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-300">
              Scene <span className="text-white font-extrabold">{index + 1}</span> of {total}
            </div>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 ${genre.ring}`}
            >
              <GenreIcon className={`h-3 w-3 ${genre.color}`} />
              <span className={`text-[9px] font-bold uppercase tracking-wider ${genre.color}`}>
                {scenario.genre}
              </span>
            </div>
          </div>
        </header>

        {/* Global Progress Bar */}
        <div className="my-2.5 shrink-0">
          <SignalProgressBar current={index + 1} total={total} />
        </div>

        {/* MOBILE LAYOUT (Viewports < 1024px) */}
        <div className="flex-1 min-h-0 flex flex-col gap-2.5 overflow-y-auto pr-0.5 pb-2 lg:hidden animate-rise">
          {/* Scenario Image Frame */}
          {scenario.imageSrc && (
            <figure className="relative h-[20dvh] min-h-[118px] max-h-[160px] overflow-hidden rounded-[20px] border border-white/10 bg-[#06030f]/60 shadow-[0_8px_30px_rgba(0,0,0,0.7)] shrink-0 flex items-center justify-center">
              {/* Blurred background glow */}
              <div className="absolute inset-0 filter blur-xl scale-110 opacity-30 pointer-events-none">
                <img src={scenario.imageSrc} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Contain image so no faces or details are cropped */}
              <img
                src={scenario.imageSrc}
                alt={scenario.imageAlt ?? scenario.title}
                loading="eager"
                className="w-full h-full object-contain relative z-10"
              />
            </figure>
          )}

          {/* Compressed Scene Brief & Pressure Line */}
          <div className="my-2 shrink-0 space-y-1 px-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-200">
                Scene {scenario.id}
              </span>
              <h2 className="text-sm font-black leading-tight tracking-tight text-white">
                {scenario.title}
              </h2>
            </div>
            {sceneBrief.map((line, idx) => (
              <p key={idx} className="text-[11px] leading-snug text-slate-300">
                {line}
              </p>
            ))}
            {pressureLine && (
              <p className="text-[11px] font-black text-amber-300 leading-snug">{pressureLine}</p>
            )}
            <p className="text-[10px] font-extrabold text-cyan-300 tracking-widest uppercase">
              What do you do?
            </p>
          </div>

          {/* Answer Choice Container */}
          <div className="shrink-0 space-y-2.5 py-1">
            {scenario.choices.map((c, i) => {
              const isSelected = selected === c.id;
              const isDisabled = choicesDisabled;
              return (
                <button
                  key={c.id}
                  onClick={() => handleSelect(c.id)}
                  disabled={isDisabled}
                  className={`group relative w-full text-left rounded-xl p-[1px] transition focus-visible:outline-none ${
                    isSelected
                      ? `bg-gradient-to-r ${choiceTints[i]} shadow-[0_0_15px_-5px_rgba(34,211,238,0.5)]`
                      : isDisabled
                        ? "bg-white/5 opacity-40 cursor-not-allowed"
                        : "bg-white/10 hover:bg-white/15"
                  }`}
                >
                  <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0a0518]/90 px-3.5 py-2.5 backdrop-blur-md">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-black ${
                        isSelected
                          ? `bg-gradient-to-br ${choiceTints[i]} text-white`
                          : "border border-white/10 bg-black/40 text-slate-300"
                      }`}
                    >
                      {choiceLetters[i]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-white leading-tight">{c.label}</div>
                      <p className="text-[10px] leading-snug text-slate-400 mt-0.5">{c.body}</p>
                    </div>
                    {isSelected && (
                      <div className="h-4 w-4 shrink-0 rounded-full border border-cyan-300 bg-cyan-400/20 flex items-center justify-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
            {renderCustomTrigger(false)}
          </div>

          {/* Lock button follows the answer stack on mobile. */}
          <div className="pt-1 pb-2 shrink-0">
            <button
              onClick={handleLock}
              disabled={!canLock}
              className={`group relative w-full overflow-hidden rounded-xl py-3.5 font-black tracking-[0.18em] text-xs transition active:scale-[0.98] ${
                canLock ? "opacity-100" : "cursor-not-allowed opacity-40"
              }`}
            >
              <div
                className={`absolute inset-0 ${canLock ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" : "bg-white/10"}`}
              />
              {canLock && (
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 opacity-70 blur-sm" />
              )}
              <span className="relative flex items-center justify-center gap-2 text-white">
                <Lock className="h-4 w-4" />
                LOCK IT IN
              </span>
            </button>
          </div>
        </div>

        {/* DESKTOP LAYOUT (Viewports >= 1024px) */}
        <div className="hidden lg:grid lg:grid-cols-[0.95fr_1.05fr] lg:gap-8 lg:flex-1 lg:overflow-hidden lg:py-4 animate-rise">
          {/* Left Column: Context Card */}
          <section className="relative rounded-[26px] p-[1.5px] bg-gradient-to-br from-violet-500/50 via-fuchsia-500/30 to-cyan-500/40 shadow-[0_0_40px_-10px_rgba(168,85,247,0.4)] flex flex-col overflow-hidden h-full">
            <div className="rounded-[24px] border border-white/5 bg-gradient-to-b from-white/[0.06] to-white/[0.025] p-6 backdrop-blur-xl flex flex-col justify-between overflow-hidden h-full">
              {scenario.imageSrc && (
                <figure className="overflow-hidden rounded-[20px] border border-white/10 bg-[#06030f]/60 shadow-[0_12px_36px_-15px_rgba(0,0,0,0.8)] h-[40dvh] max-h-[320px] shrink-0 relative flex items-center justify-center">
                  {/* Blurred background glow */}
                  <div className="absolute inset-0 filter blur-xl scale-110 opacity-30 pointer-events-none">
                    <img src={scenario.imageSrc} alt="" className="w-full h-full object-cover" />
                  </div>
                  {/* Contain image so no faces or details are cropped */}
                  <img
                    src={scenario.imageSrc}
                    alt={scenario.imageAlt ?? scenario.title}
                    className="w-full h-full object-contain relative z-10"
                  />
                </figure>
              )}

              <div className="mt-4 flex-1 flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="mb-2 inline-flex rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200">
                    Read the scene
                  </div>
                  <h2 className="text-2xl font-black leading-tight tracking-tight bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
                    {scenario.title}
                  </h2>
                  <div className="my-3 h-px w-20 bg-gradient-to-r from-fuchsia-400 via-amber-300 to-transparent" />
                  <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                    {sceneBrief.map((line, idx) => (
                      <p key={idx} className="text-sm leading-relaxed text-slate-300">
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 mt-3 shrink-0">
                  {pressureLine && (
                    <p className="text-sm font-extrabold text-amber-300 leading-snug">
                      {pressureLine}
                    </p>
                  )}
                  <p className="mt-2 text-sm font-black text-cyan-300 tracking-wider uppercase">
                    What do you do?
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Choices and Actions */}
          <section className="flex flex-col justify-between overflow-hidden h-full">
            <div className="space-y-3 flex-1 overflow-y-auto pr-1 py-1">
              {scenario.choices.map((c, i) => {
                const isSelected = selected === c.id;
                const isDisabled = choicesDisabled;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c.id)}
                    disabled={isDisabled}
                    className={`group relative w-full text-left rounded-xl p-[1.5px] transition focus-visible:outline-none ${
                      isSelected
                        ? `bg-gradient-to-r ${choiceTints[i]} shadow-[0_0_20px_-5px_rgba(34,211,238,0.55)]`
                        : isDisabled
                          ? "bg-white/5 opacity-40 cursor-not-allowed"
                          : "bg-white/10 hover:bg-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-4 rounded-xl border border-white/5 bg-[#0a0518]/85 px-4 py-3.5 backdrop-blur-xl">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base font-black ${
                          isSelected
                            ? `bg-gradient-to-br ${choiceTints[i]} text-white`
                            : "border border-white/10 bg-black/40 text-slate-300"
                        }`}
                      >
                        {choiceLetters[i]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white leading-tight">{c.label}</div>
                        <p className="mt-1 text-xs leading-normal text-slate-400">{c.body}</p>
                      </div>
                      {isSelected && (
                        <div className="mt-1 h-5 w-5 shrink-0 rounded-full border border-cyan-300 bg-cyan-400/20 flex items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-cyan-300" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
              {renderCustomTrigger(true)}
            </div>

            <div className="pt-4 mt-4 border-t border-white/5 shrink-0">
              <button
                onClick={handleLock}
                disabled={!canLock}
                className={`group relative w-full overflow-hidden rounded-xl py-3.5 font-black tracking-[0.18em] text-sm transition active:scale-[0.98] ${
                  canLock ? "opacity-100" : "cursor-not-allowed opacity-40"
                }`}
              >
                <div
                  className={`absolute inset-0 ${canLock ? "bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" : "bg-white/10"}`}
                />
                {canLock && (
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 opacity-70 blur-md" />
                )}
                <span className="relative flex items-center justify-center gap-2 text-white">
                  <Lock className="h-5 w-5" />
                  LOCK IT IN
                </span>
              </button>
              <p className="text-center text-[10px] tracking-[0.2em] text-slate-500 mt-3.5">
                BE REAL. STAY TRUE. THAT&apos;S THE <span className="text-cyan-300">SIGNAL.</span>
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Drawer Overlay & Content for Custom Response */}
      {isCustomOpen && (
        <>
          <div
            onClick={handleCancelCustom}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 animate-fade-in"
          />
          <div className="signal-test-drawer-above-mobile-nav fixed inset-x-0 bg-[#0c081e] border-t-2 border-violet-500/40 rounded-t-[24px] p-5 z-50 shadow-[0_-10px_40px_rgba(168,85,247,0.35)] max-w-2xl mx-auto flex flex-col gap-4 animate-slide-up sm:p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(232,121,249,1)] animate-pulse" />
                <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                  Custom Action Mode
                </h3>
              </div>
              <button
                onClick={handleCancelCustom}
                className="text-slate-400 hover:text-white text-xs bg-white/5 border border-white/10 rounded-full w-7 h-7 flex items-center justify-center transition"
                aria-label="Close custom input drawer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-normal">
              Type your own move if none of the answers fit. Your response must be at least 8
              characters long to be locked in.
            </p>

            <textarea
              value={drawerInput}
              onChange={(e) => setDrawerInput(e.target.value)}
              placeholder="What would you actually do in this situation?"
              rows={4}
              maxLength={300}
              autoFocus
              className="w-full rounded-2xl bg-black/40 border border-white/10 p-4 text-white placeholder-slate-500 focus:border-fuchsia-500/60 focus:ring-1 focus:ring-fuchsia-500/30 outline-none resize-none text-sm leading-relaxed"
            />

            <div className="flex items-center justify-between text-xs">
              <span
                className={
                  drawerInput.trim().length >= 8
                    ? "text-cyan-300 font-semibold"
                    : "text-rose-400 font-semibold"
                }
              >
                {drawerInput.trim().length >= 8
                  ? "✓ Ready to use"
                  : `Requires at least ${8 - drawerInput.trim().length} more characters`}
              </span>
              <span className="text-slate-400 font-mono">{drawerInput.length} / 300</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={handleCancelCustom}
                className="rounded-xl py-3.5 font-bold text-xs border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustom}
                disabled={drawerInput.trim().length < 8}
                className={`rounded-xl py-3.5 font-bold text-xs text-black bg-primary transition ${
                  drawerInput.trim().length >= 8
                    ? "glow-gold active:scale-[0.98]"
                    : "opacity-40 cursor-not-allowed"
                }`}
              >
                Use Custom Answer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SignalScenarioCard;
