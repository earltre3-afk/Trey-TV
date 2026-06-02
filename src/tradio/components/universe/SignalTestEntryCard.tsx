import React from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { GlassCard, PrimaryButton, SecondaryButton } from "../tradio/ui";
import { NaturalAbilityBadge } from "./RoleBadge";
import {
  SIGNAL_TEST_COPY,
  canTakeSignalTest,
  describeAbility,
  type SignalTestState,
} from "@/tradio/lib/universe/signalTest";

/**
 * TREY TV UNIVERSE — Signal Test discoverability card.
 *
 * Drop-in entry point so EXISTING users (not just new signups) can find the
 * Signal Test from profile modules, settings/identity, the Badges area, or a
 * Trey-I suggestion. Optional before taking; once completed the result is
 * permanent and the card shows the result with NO retake offered.
 * Components-only file.
 */

export const SignalTestEntryCard: React.FC<{
  state: SignalTestState;
  onStart?: () => void;
  onViewResult?: () => void;
  compact?: boolean;
}> = ({ state, onStart, onViewResult, compact = false }) => {
  const completed = state.status === "completed" && state.result;

  return (
    <GlassCard glow className={compact ? "p-4" : "p-5"}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> {SIGNAL_TEST_COPY.title}
          </div>
          <h3 className="mt-1 text-xl font-black tracking-tight text-white">
            {SIGNAL_TEST_COPY.subtitle}
          </h3>
          {completed ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <NaturalAbilityBadge ability={state.result!} />
              <span className="text-xs text-white/55">{describeAbility(state.result!)}</span>
            </div>
          ) : (
            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/60">
              {SIGNAL_TEST_COPY.optional}{" "}
              <span className="text-white/45">{SIGNAL_TEST_COPY.permanent}</span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-4">
        {completed ? (
          <SecondaryButton className="px-4 py-2.5 text-xs" onClick={onViewResult}>
            {SIGNAL_TEST_COPY.completedCta} <ArrowUpRight className="h-3.5 w-3.5" />
          </SecondaryButton>
        ) : canTakeSignalTest(state) ? (
          <PrimaryButton className="px-4 py-3 text-xs" onClick={onStart}>
            <Sparkles className="h-4 w-4" /> {SIGNAL_TEST_COPY.cta}
          </PrimaryButton>
        ) : null}
      </div>
    </GlassCard>
  );
};
