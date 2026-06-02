import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSupabaseSession } from "@/lib/supabase-session";
import { useCurrentUser } from "@/hooks/use-current-user";

import SignalTestIntro from "@/components/tests/SignalTestIntro";
import SignalTestRules from "@/components/tests/SignalTestRules";
import SignalScenarioCard from "@/components/tests/SignalScenarioCard";
import SignalPulseCheckpoint from "@/components/tests/SignalPulseCheckpoint";
import SignalRevealScreen from "@/components/tests/SignalRevealScreen";
import SignalResultCard from "@/components/tests/SignalResultCard";

import { SCENARIOS } from "@/lib/tests/naturalAbilityQuestions";
import { calculateResult } from "@/lib/tests/naturalAbilityScoring";
import { fetchSignalRecord, getOrCreateUserId } from "@/lib/tests/naturalAbilityStorage";
import { SignalResult, UserAnswer, NaturalAbility, SignalStrength } from "@/types/naturalAbility";
import { judgeSignalTest } from "@/lib/trey-i/vertex.server";

type Stage = "intro" | "rules" | "scenario" | "checkpoint" | "reveal" | "result";

export const Route = createFileRoute("/tests/natural-ability")({
  component: NaturalAbilityTestPage,
  head: () => ({
    meta: [
      { title: "The Signal Test — Trey TV" },
      {
        name: "description",
        content:
          "Take the Signal Test to discover your Natural Ability and unlock your profile badge.",
      },
    ],
  }),
});

function NaturalAbilityTestPage() {
  const navigate = useNavigate();
  const { user, authReady } = useAuth();
  const loading = !authReady;
  const { user: supaUser } = useSupabaseSession();
  const currentUser = useCurrentUser();

  const [stage, setStage] = useState<Stage>("intro");
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [result, setResult] = useState<SignalResult | null>(null);
  const [loadingRecord, setLoadingRecord] = useState(true);

  const total = SCENARIOS.length;

  useEffect(() => {
    if (loading) return;

    if (!user) {
      setLoadingRecord(false);
      return;
    }

    fetchSignalRecord(supaUser?.id || getOrCreateUserId()).then((row) => {
      if (row) {
        setAnswers(row.answer_snapshot || []);
        setResult({
          primaryAbility: row.primary_ability as NaturalAbility,
          secondaryAbility: row.secondary_ability as NaturalAbility,
          signalBlend: row.signal_blend,
          signalStrength: row.signal_strength as SignalStrength,
          scores: {} as Record<NaturalAbility, number>,
        });
        setStage("result");
      }
      setLoadingRecord(false);
    });
  }, [user, loading, supaUser]);

  const handleAnswer = (a: UserAnswer) => {
    const next = [...answers, a];
    setAnswers(next);
    const justAnswered = scenarioIndex + 1;

    if (justAnswered === 10) {
      setStage("checkpoint");
    } else if (justAnswered >= total) {
      setStage("reveal");
      // Call Gemini asynchronously
      judgeSignalTest({ data: { answers: next, scenarios: SCENARIOS } })
        .then((aiResult) => {
          setResult(aiResult);
        })
        .catch((err) => {
          console.error("Gemini judgment failed, falling back to local calculation", err);
          const r = calculateResult(next, SCENARIOS);
          setResult({
            ...r,
            interpretation: `Based on your test inputs, you show a primary connection to the path of the ${r.primaryAbility}.`,
          });
        });
    } else {
      setScenarioIndex(justAnswered);
    }
  };

  const continueFromCheckpoint = () => {
    setScenarioIndex(10);
    setStage("scenario");
  };

  const handleReveal = () => {
    if (result) {
      setStage("result");
    } else {
      console.warn("AI result not ready yet on reveal. Calculating local fallback.");
      const r = calculateResult(answers, SCENARIOS);
      setResult({
        ...r,
        interpretation: `Based on your test inputs, you show a primary connection to the path of the ${r.primaryAbility}.`,
      });
      setStage("result");
    }
  };

  if (loading || loadingRecord) {
    return (
      <div className="signal-test-above-mobile-nav w-full bg-[#06030f] text-white flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-fuchsia-500" />
        <span className="text-sm text-slate-400 tracking-wider">Loading your Signal Profile…</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="signal-test-above-mobile-nav w-full bg-[#06030f] text-white flex items-center justify-center px-4 py-6 sm:py-8">
        <div className="max-w-md w-full rounded-[28px] p-[1.5px] bg-gradient-to-b from-fuchsia-500/40 via-violet-500/30 to-cyan-500/40">
          <div className="rounded-[26px] bg-[#0a0518]/90 backdrop-blur-xl border border-white/5 px-6 py-8 text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
              Authentication Required
            </h1>
            <p className="text-slate-300 mt-3 text-sm leading-relaxed">
              You must be signed in to take the Signal Test and unlock your permanent profile badge.
            </p>
            <button
              onClick={() => {
                sessionStorage.setItem("treytv_post_auth_redirect", "/tests/natural-ability");
                navigate({ to: "/login" });
              }}
              className="mt-6 w-full rounded-2xl py-3 px-4 font-semibold text-white bg-gradient-to-r from-fuchsia-600 via-violet-500 to-cyan-500 active:scale-[0.98] transition"
            >
              Sign In to Start
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#06030f] min-h-[100dvh] w-full text-white">
      {stage === "intro" && <SignalTestIntro onStart={() => setStage("rules")} />}
      {stage === "rules" && <SignalTestRules onContinue={() => setStage("scenario")} />}
      {stage === "scenario" && (
        <SignalScenarioCard
          key={scenarioIndex}
          scenario={SCENARIOS[scenarioIndex]}
          index={scenarioIndex}
          total={total}
          onLockIn={handleAnswer}
        />
      )}
      {stage === "checkpoint" && <SignalPulseCheckpoint onContinue={continueFromCheckpoint} />}
      {stage === "reveal" && <SignalRevealScreen onReveal={handleReveal} />}
      {stage === "result" && result && (
        <SignalResultCard result={result} userName={currentUser.name} answers={answers} />
      )}
    </div>
  );
}
