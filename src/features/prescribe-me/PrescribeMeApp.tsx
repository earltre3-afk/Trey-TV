import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import Background from "./components/Background";
import LandingScreen from "./components/LandingScreen";
import MoodSelector from "./components/MoodSelector";
import EnergySelector from "./components/EnergySelector";
import ContentTypeSelector from "./components/ContentTypeSelector";
import MomentNeedSelector from "./components/MomentNeedSelector";
import AnalyzingScreen from "./components/AnalyzingScreen";
import ResultsScreen from "./components/ResultsScreen";
import HistoryScreen from "./components/HistoryScreen";
import { useAuth } from "./components/useAuth";
import { syncOnSignIn, upsertPrescription } from "./components/syncPrescriptions";
import {
  loadPrescriptions,
  savePrescriptions,
  scoreContent,
  generatePrescriptionTitle,
  type Mood,
  type Energy,
  type ContentType,
  type MomentNeed,
  type SavedPrescription,
  type PrescriptionAnswers,
} from "./components/data";
import "./components/no-scroll.css";
import { curatePrescriptionWithAI } from "@/lib/trey-i/vertex.server";

type Step =
  | "landing"
  | "mood"
  | "energy"
  | "content"
  | "moment"
  | "analyzing"
  | "results"
  | "history";

const TOTAL_STEPS = 4;

const PrescribeMeApp: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("landing");
  const [moods, setMoods] = useState<Mood[]>([]);
  const [energy, setEnergy] = useState<Energy | null>(null);
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [momentNeeds, setMomentNeeds] = useState<MomentNeed[]>([]);
  const [prescriptions, setPrescriptions] = useState<SavedPrescription[]>([]);
  const [currentPrescriptionId, setCurrentPrescriptionId] = useState<string | null>(null);

  const { user } = useAuth();
  const syncedForUserRef = useRef<string | null>(null);

  const [aiResult, setAiResult] = useState<{
    title: string;
    explanation: string;
    rankedIds: string[];
  } | null>(null);

  const answers: PrescriptionAnswers = useMemo(
    () => ({
      moods,
      energy,
      contentTypes,
      momentNeeds,
    }),
    [moods, energy, contentTypes, momentNeeds],
  );

  const scored = useMemo(() => scoreContent(answers), [answers]);

  useEffect(() => {
    if (step === "analyzing") {
      setAiResult(null);
      curatePrescriptionWithAI({ data: { answers } })
        .then((res) => {
          setAiResult(res);
        })
        .catch((err) => {
          console.error("AI curation failed, falling back to local scoring:", err);
          const scoredLocal = scoreContent(answers);
          setAiResult({
            title: generatePrescriptionTitle(answers),
            explanation: `Curated based on your active choices for ${answers.moods.slice(0, 2).join(" & ")}.`,
            rankedIds: scoredLocal.slice(0, 6).map((x) => x.id),
          });
        });
    }
  }, [step, answers]);

  useEffect(() => {
    setPrescriptions(loadPrescriptions());
  }, []);

  // When a user signs in, sync local prescriptions to DB and merge in remote ones.
  useEffect(() => {
    if (!user) return;
    if (syncedForUserRef.current === user.id) return;
    syncedForUserRef.current = user.id;
    const local = loadPrescriptions();
    syncOnSignIn(user.id, local).then((merged) => {
      setPrescriptions(merged);
      savePrescriptions(merged);
    });
  }, [user]);

  const currentPrescription = useMemo(
    () => prescriptions.find((p) => p.id === currentPrescriptionId) || null,
    [prescriptions, currentPrescriptionId],
  );

  const updatePrescriptions = (updater: (list: SavedPrescription[]) => SavedPrescription[]) => {
    setPrescriptions((prev) => {
      const next = updater(prev);
      savePrescriptions(next);
      return next;
    });
  };

  const syncOne = (p: SavedPrescription | undefined) => {
    if (!user || !p) return;
    void upsertPrescription(user.id, p);
  };

  const createPrescription = (
    saved = false,
    aiData?: { title: string; explanation: string; rankedIds: string[] },
  ): SavedPrescription => {
    const title = aiData?.title || generatePrescriptionTitle(answers);
    const explanation =
      aiData?.explanation ||
      `Curated based on your active choices for ${answers.moods.slice(0, 2).join(" & ")}.`;
    const recIds = aiData?.rankedIds || scored.slice(0, 6).map((x) => x.id);
    const topId = recIds[0] || "";
    const matchScore = Math.round(
      scored.slice(0, 5).reduce((s, x) => s + x.score, 0) / Math.max(1, Math.min(5, scored.length)),
    );
    const p: SavedPrescription = {
      id: `rx_${Date.now()}`,
      title,
      answers,
      topId,
      recIds,
      matchScore,
      createdAt: Date.now(),
      isSaved: saved,
      isFavorite: false,
      explanation,
    };
    updatePrescriptions((prev) => [p, ...prev].slice(0, 50));
    setCurrentPrescriptionId(p.id);
    if (user) syncOne(p);
    return p;
  };

  const goStart = () => {
    setMoods([]);
    setEnergy(null);
    setContentTypes([]);
    setMomentNeeds([]);
    setCurrentPrescriptionId(null);
    setStep("mood");
  };

  const onAnalyzeDone = () => {
    if (aiResult) {
      createPrescription(false, aiResult);
      setStep("results");
    } else {
      console.warn("AI result not ready yet on done. Calculating local fallback.");
      const scoredLocal = scoreContent(answers);
      const fallback = {
        title: generatePrescriptionTitle(answers),
        explanation: `Curated based on your active choices for ${answers.moods.slice(0, 2).join(" & ")}.`,
        rankedIds: scoredLocal.slice(0, 6).map((x) => x.id),
      };
      createPrescription(false, fallback);
      setStep("results");
    }
  };

  const onSaveToggle = () => {
    if (!currentPrescriptionId) return;
    let updated: SavedPrescription | undefined;
    updatePrescriptions((prev) =>
      prev.map((p) => {
        if (p.id !== currentPrescriptionId) return p;
        updated = { ...p, isSaved: !p.isSaved };
        return updated;
      }),
    );
    syncOne(updated);
  };

  const onShare = async (titleHint?: string) => {
    const title = titleHint || (currentPrescription?.title ?? "My Trey TV Prescription");
    const text = `${title} — curated by Trey TV Prescribe Me`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        window.alert("Link copied to clipboard");
      }
    } catch {
      /* dismissed */
    }
  };

  const onToggleFavorite = (id: string) => {
    let updated: SavedPrescription | undefined;
    updatePrescriptions((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        updated = { ...p, isFavorite: !p.isFavorite };
        return updated;
      }),
    );
    syncOne(updated);
  };

  const onGoWatch = () => {
    const top = scored[0];
    void navigate({ to: top?.contentKind === "music-review" ? "/music-review" : "/" });
  };

  const onReplay = (p: SavedPrescription) => {
    setMoods(p.answers.moods);
    setEnergy(p.answers.energy);
    setContentTypes(p.answers.contentTypes);
    setMomentNeeds(p.answers.momentNeeds);
    setCurrentPrescriptionId(p.id);
    setStep("analyzing");
  };

  return (
    <div
      className="prescribe-me-root fixed inset-0 h-[100dvh] overflow-hidden text-white antialiased font-sans"
      style={{ fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }}
    >
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
      />
      <style>{`
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
        .font-sans { font-family: 'Inter', system-ui, sans-serif; }
        ::selection { background: rgba(251,191,36,0.35); }
      `}</style>

      <Background />

      <main className="relative z-0 h-full overflow-hidden">
        {step === "landing" && (
          <LandingScreen onStart={goStart} onOpenHistory={() => setStep("history")} />
        )}
        {step === "mood" && (
          <MoodSelector
            value={moods}
            onChange={setMoods}
            onNext={() => setStep("energy")}
            onBack={() => setStep("landing")}
            step={1}
            total={TOTAL_STEPS}
          />
        )}
        {step === "energy" && (
          <EnergySelector
            value={energy}
            onChange={setEnergy}
            onNext={() => setStep("content")}
            onBack={() => setStep("mood")}
            step={2}
            total={TOTAL_STEPS}
          />
        )}
        {step === "content" && (
          <ContentTypeSelector
            value={contentTypes}
            onChange={setContentTypes}
            onNext={() => setStep("moment")}
            onBack={() => setStep("energy")}
            step={3}
            total={TOTAL_STEPS}
          />
        )}
        {step === "moment" && (
          <MomentNeedSelector
            value={momentNeeds}
            onChange={setMomentNeeds}
            onNext={() => setStep("analyzing")}
            onBack={() => setStep("content")}
            step={4}
            total={TOTAL_STEPS}
          />
        )}
        {step === "analyzing" && <AnalyzingScreen moods={moods} onDone={onAnalyzeDone} />}
        {step === "results" && (
          <ResultsScreen
            answers={answers}
            scored={scored}
            prescriptionTitle={currentPrescription?.title || generatePrescriptionTitle(answers)}
            onTryAgain={() => setStep("analyzing")}
            onAdjustMood={() => setStep("mood")}
            onSave={onSaveToggle}
            onShare={() => void onShare(currentPrescription?.title)}
            onOpenHistory={() => setStep("history")}
            onGoWatch={onGoWatch}
            isSaved={!!currentPrescription?.isSaved}
            explanation={currentPrescription?.explanation}
          />
        )}
        {step === "history" && (
          <HistoryScreen
            prescriptions={prescriptions}
            onBack={() => setStep("landing")}
            onReplay={onReplay}
            onShare={(p) => void onShare(p.title)}
            onToggleFavorite={onToggleFavorite}
            onNewPrescription={goStart}
          />
        )}
      </main>
    </div>
  );
};

export default PrescribeMeApp;
