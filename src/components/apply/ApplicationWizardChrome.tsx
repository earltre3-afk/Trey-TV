import { Link } from "@tanstack/react-router";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

type Variant = "creator" | "gold";

export function ApplicationWizardChrome({
  variant,
  titleA,
  titleB,
  steps,
  current,
  onSaveDraft,
  draftSaved,
  sectionTitle,
  sectionSubtitle,
  children,
  side,
}: {
  variant: Variant;
  titleA: string;
  titleB: string;
  steps: { label: string }[];
  current: number;
  onSaveDraft?: () => void;
  draftSaved?: boolean;
  sectionTitle: string;
  sectionSubtitle?: string;
  children: ReactNode;
  side?: ReactNode;
}) {
  const isGold = variant === "gold";
  const outer = isGold ? "neon-gold" : "neon-blue";
  const accentText = isGold ? "text-[oklch(0.92_0.18_88)]" : "text-[oklch(0.85_0.2_240)]";
  const titleSplit = isGold ? "title-split-gold" : "title-split-blue";
  const stepActive = isGold ? "is-active-gold" : "is-active-blue";
  const pct = Math.round(((current - 1) / (steps.length - 1)) * 100);

  return (
    <div className={`apply-scroll-page liquid-stage min-h-screen min-h-[100dvh] ${isGold ? "gold" : ""}`}>
      <div className="grid-veil" aria-hidden />
      <div className="orb-extra" aria-hidden />

      {/* ── Top nav bar ── */}
      <div className="sticky top-0 z-30 border-b border-white/[0.06] backdrop-blur-xl pt-[env(safe-area-inset-top)]"
        style={{ background: "oklch(0.08 0.02 262 / 0.85)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 md:px-6">
          {/* Back */}
          <Link to="/apply" className={`neon-btn-ghost ${isGold ? "gold" : ""} text-xs md:text-sm`}>
            <ChevronLeft className="h-4 w-4" /> Back
          </Link>

          {/* Centre: Logo + title */}
          <div className="hidden items-center gap-3 md:flex">
            <Logo className="h-7" />
            <span className="text-sm font-semibold text-foreground/80">
              {titleA}{" "}<span className={titleSplit}>{titleB}</span>
            </span>
          </div>

          {/* Save draft */}
          {onSaveDraft && (
            <button onClick={onSaveDraft} className={`neon-btn-ghost ${isGold ? "gold" : ""} text-xs md:text-sm`}>
              <Save className="h-4 w-4" />
              <span>{draftSaved ? "Saved ✓" : "Save Draft"}</span>
            </button>
          )}
          {!onSaveDraft && <div className="w-20" />}
        </div>

        {/* Progress bar */}
        <div className="h-[2px] w-full bg-white/[0.05]">
          <div
            className={`h-full transition-all duration-500 ease-out ${isGold ? "bg-[oklch(0.88_0.2_88)]" : "bg-[oklch(0.75_0.25_245)]"}`}
            style={{
              width: `${pct}%`,
              boxShadow: isGold
                ? "0 0 12px oklch(0.88 0.2 88 / 0.8)"
                : "0 0 12px oklch(0.75 0.25 245 / 0.8)",
            }}
          />
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="mx-auto max-w-7xl px-3 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-6 md:px-6 md:pb-10 md:pt-8 lg:pt-10">

        {/* ── Hero card (full-width outer neon card) ── */}
        <div className={`relative ${outer} p-4 md:p-8 wizard-outer-pad`}>
          <div className="swoosh-bg" />
          <div className="liquid-sheen" />
          <div className="relative">

            {/* Header: Logo + Title + Steps */}
            <div className="mb-5 flex flex-col items-center text-center md:mb-8">
              <Logo className="logo-float h-10 md:h-14 lg:h-16" />
              <h1 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl md:mt-4 md:text-3xl lg:text-4xl">
                <span className="text-foreground">{titleA} </span>
                <span className={titleSplit}>{titleB}</span>
              </h1>
            </div>

            {/* Step tracker */}
            <div className="no-scrollbar mx-auto mb-6 max-w-4xl overflow-x-auto md:mb-8">
              <ol className="flex min-w-fit items-center justify-center gap-1 px-2 sm:gap-1.5 md:gap-2">
                {steps.map((s, i) => {
                  const n = i + 1;
                  const state = n === current ? stepActive : n < current ? "is-done" : "";
                  const isActive = n === current;
                  const isDone = n < current;
                  return (
                    <li key={s.label} className="flex min-w-fit items-center gap-1 sm:gap-1.5 md:gap-2">
                      <div className="flex flex-col items-center gap-1.5">
                        <span className={`step-circle ${state}`}>{isDone ? "✓" : n}</span>
                        <span className={`whitespace-nowrap text-[9px] font-medium sm:text-[10px] md:text-xs ${isActive ? accentText : isDone ? "text-foreground/60" : "text-muted-foreground"}`}>
                          {s.label}
                        </span>
                      </div>
                      {n < steps.length && <span className="step-line -mt-5 w-3 sm:w-6 md:w-10 lg:w-16" />}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* ── Content grid: form | sidebar ── */}
            <div className={`grid min-w-0 gap-5 ${side ? "lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]" : ""}`}>
              {/* Form panel */}
              <section className={`relative min-w-0 ${outer} p-4 md:p-7 wizard-section-pad`}>
                <div className="liquid-sheen" />
                <div key={current} className="step-enter relative">
                  <div className="mb-5 border-b border-white/[0.08] pb-4">
                    <h2 className="text-lg font-semibold md:text-xl lg:text-2xl">{sectionTitle}</h2>
                    {sectionSubtitle && (
                      <p className="mt-1 text-sm text-muted-foreground">{sectionSubtitle}</p>
                    )}
                  </div>
                  <div className="space-y-5">{children}</div>
                </div>
              </section>

              {/* Sidebar — sticky on desktop */}
              {side && (
                <aside className="order-last min-w-0 space-y-5 lg:order-none lg:self-start lg:sticky lg:top-[72px]">
                  {side}
                </aside>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function WizardNav({
  variant,
  onBack,
  onNext,
  nextLabel = "Next Step",
  backDisabled,
  submitting,
}: {
  variant: Variant;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backDisabled?: boolean;
  submitting?: boolean;
}) {
  const isGold = variant === "gold";
  return (
    <div className="wizard-cta-bar mx-auto mt-5 grid max-w-7xl grid-cols-[auto_1fr] items-center gap-2 px-3 pb-[calc(1rem+env(safe-area-inset-bottom))] md:gap-3 md:px-6">
      <button
        onClick={onBack}
        disabled={backDisabled}
        className={`neon-btn-ghost ${isGold ? "gold" : ""} px-5 py-3 disabled:opacity-40`}
      >
        <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span>
      </button>
      <button
        onClick={onNext}
        disabled={submitting}
        className={`${isGold ? "neon-btn-gold" : "neon-btn-blue"} w-full text-base disabled:opacity-60`}
      >
        {submitting ? "Submitting…" : nextLabel}
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export function Field({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-foreground/95">
        {label} {required && <span className="text-[oklch(0.85_0.2_240)]">*</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>}
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function NeonInput(
  props: InputHTMLAttributes<HTMLInputElement> & { trailingIcon?: ReactNode }
) {
  const { trailingIcon, className = "", ...rest } = props;
  return (
    <div className="relative">
      <input {...rest} className={`neon-input w-full px-4 py-3 pr-11 text-base ${className}`} />
      {trailingIcon && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.7_0.18_245)]">
          {trailingIcon}
        </span>
      )}
    </div>
  );
}

export function NeonTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & { trailingIcon?: ReactNode }
) {
  const { trailingIcon, className = "", ...rest } = props;
  return (
    <div className="relative">
      <textarea {...rest} className={`neon-input w-full px-4 py-3 pr-11 text-base leading-relaxed ${className}`} />
      {trailingIcon && (
        <span className="pointer-events-none absolute right-3 top-4 text-[oklch(0.7_0.18_245)]">
          {trailingIcon}
        </span>
      )}
    </div>
  );
}

export function NeonSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  const { className = "", children, ...rest } = props;
  return (
    <select
      {...rest}
      className={`neon-input w-full appearance-none bg-no-repeat px-4 py-3 text-base ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2384b8ff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundPosition: "right 1rem center",
        backgroundSize: "1rem",
      }}
    >
      {children}
    </select>
  );
}

export function TileChoice<T extends string>({
  value,
  options,
  onChange,
  variant = "creator",
}: {
  value: T;
  options: readonly { value: T; label: string; icon: ReactNode }[];
  onChange: (v: T) => void;
  variant?: Variant;
}) {
  const activeClass = variant === "gold" ? "active-gold" : "active-blue";
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`tile relative ${active ? activeClass : ""}`}
          >
            <span className="text-[oklch(0.85_0.2_240)]">{o.icon}</span>
            <span>{o.label}</span>
            {active && (
              <span className="absolute right-1.5 top-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[oklch(0.7_0.22_245)] text-[11px] font-bold text-[oklch(0.05_0.02_265)] shadow-[0_0_12px_oklch(0.7_0.3_245/0.7)]">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function ChipPicker<T extends string>({
  value,
  options,
  onChange,
  variant = "creator",
  multi = false,
}: {
  value: T | T[];
  options: readonly { value: T; label: string }[];
  onChange: (v: T | T[]) => void;
  variant?: Variant;
  multi?: boolean;
}) {
  const isActive = (v: T) => (multi ? (value as T[]).includes(v) : value === v);
  const toggle = (v: T) => {
    if (multi) {
      const arr = value as T[];
      onChange(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      onChange(v);
    }
  };
  const activeClass =
    variant === "gold"
      ? "bg-[oklch(0.13_0.05_80/0.85)] text-[oklch(0.95_0.05_90)] shadow-[inset_0_0_0_1px_oklch(0.95_0.2_88),0_0_18px_oklch(0.85_0.2_85/0.4)]"
      : "bg-[oklch(0.13_0.07_252/0.85)] text-[oklch(0.95_0.02_250)] shadow-[inset_0_0_0_1px_oklch(0.85_0.2_240),0_0_18px_oklch(0.65_0.3_245/0.45)]";
  const baseClass =
    "bg-[oklch(0.09_0.03_262/0.6)] text-muted-foreground shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08),0_0_0_1px_oklch(0.5_0.05_260/0.15)]";

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => toggle(o.value)}
          className={`rounded-full px-3.5 py-2 text-xs transition-all sm:text-sm ${isActive(o.value) ? activeClass : baseClass}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function NeonCheckList({
  items,
  value,
  onToggle,
  variant = "creator",
}: {
  items: string[];
  value: boolean[];
  onToggle: (i: number) => void;
  variant?: Variant;
}) {
  const isGold = variant === "gold";
  return (
    <div className="space-y-2.5">
      {items.map((labelText, i) => {
        const active = value[i];
        return (
          <label
            key={labelText}
            className={`flex cursor-pointer items-start gap-3 rounded-2xl p-4 transition ${
              active
                ? isGold
                  ? "bg-[oklch(0.13_0.05_80/0.6)] shadow-[inset_0_0_0_1px_oklch(0.95_0.2_88/0.8),0_0_18px_oklch(0.85_0.2_85/0.35)]"
                  : "bg-[oklch(0.13_0.07_252/0.6)] shadow-[inset_0_0_0_1px_oklch(0.85_0.2_240/0.8),0_0_18px_oklch(0.65_0.3_245/0.4)]"
                : "bg-[oklch(0.09_0.03_262/0.55)] shadow-[inset_0_0_0_1px_oklch(1_0_0/0.08)]"
            }`}
          >
            <input type="checkbox" checked={active} onChange={() => onToggle(i)} className="sr-only" />
            <span
              className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-md text-[12px] font-bold ${
                active
                  ? isGold
                    ? "bg-[oklch(0.85_0.2_85)] text-[oklch(0.18_0.04_70)] shadow-[0_0_12px_oklch(0.85_0.2_85/0.7)]"
                    : "bg-[oklch(0.7_0.22_245)] text-[oklch(0.05_0.02_265)] shadow-[0_0_12px_oklch(0.7_0.3_245/0.7)]"
                  : "bg-transparent shadow-[inset_0_0_0_1.5px_oklch(0.5_0.05_260/0.6)]"
              }`}
            >
              {active ? "✓" : ""}
            </span>
            <span className="text-sm text-foreground/95">{labelText}</span>
          </label>
        );
      })}
    </div>
  );
}
