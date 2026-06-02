import React from "react";
import { useNavigate } from "../hooks/router-compat";
import {
  UploadCloud,
  Play,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Activity,
  Zap,
  Crosshair,
  Star,
  Globe,
  Lock,
  CheckCircle2,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
} from "lucide-react";
import { TranceShell, TranceTopBar, TranceLogo } from "../components/shell";
import { TranceGlassCard, GradientButton, cn } from "../components/primitives";
import { BuilderStepper, builderSteps } from "../components/BuilderStepper";
import { routines, IMG } from "../data/devFixtures";
import { tranceVideoUploadService, tranceRoutineService, shouldUseFixtures } from "../services";
import { TRANCE_ROUTES } from "../routes/manifest";
import { TranceAccountButton } from "../auth/TranceAccountButton";
import { useTranceIdentity } from "../hooks/useTranceIdentity";
import { useTrancePermissions } from "../hooks/useTrancePermissions";

const StepCard: React.FC<{
  n: number;
  title: string;
  sub: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}> = ({ n, title, sub, right, children }) => (
  <TranceGlassCard glow="purple" className="p-4">
    <div className="flex items-start justify-between mb-3">
      <div>
        <span className="text-[9px] font-black text-fuchsia-400 uppercase">Step {n} of 6</span>
        <h3 className="text-xl font-black text-white">{title}</h3>
        <p className="text-[11px] text-white/50">{sub}</p>
      </div>
      {right}
    </div>
    {children}
  </TranceGlassCard>
);

const BuilderScreen: React.FC = () => {
  const navigate = useNavigate();
  const { identity, loading: authLoading } = useTranceIdentity();
  const { capabilities } = useTrancePermissions();
  const canCreate = capabilities.canCreateRoutine;

  const [active, setActive] = React.useState(1);
  const [uploaded, setUploaded] = React.useState(true); // mock upload state
  const [vis, setVis] = React.useState<"Public" | "Private">("Public");
  const [scores, setScores] = React.useState({
    Timing: 30,
    Execution: 30,
    Energy: 20,
    Precision: 10,
    Creativity: 10,
  });
  const [publishing, setPublishing] = React.useState(false);

  const hints = [
    { t: "00:00", label: "Groove In", d: "Relax into the beat. Feel the bounce." },
    { t: "00:16", label: "Chest Hit", d: "Hit chest forward on 5, clean & sharp." },
    { t: "00:32", label: "Travel Right", d: "Push off left foot, stay low." },
  ];
  const arrows: [string, any][] = [
    ["Front", ArrowUp],
    ["Right", ArrowRight],
    ["Back", ArrowDown],
    ["Left", ArrowLeft],
    ["Front", ArrowUp],
    ["Diagonal R", ArrowUpRight],
  ];

  const handlePublish = async () => {
    try {
      setPublishing(true);
      if (shouldUseFixtures()) {
        navigate(TRANCE_ROUTES.routine("rt001"));
        return;
      }

      // Create draft first
      const draft = await tranceRoutineService.createRoutineDraft({
        title: "Vibes Only Final",
        tagline: "Express yourself through high-energy groove hits.",
        style: "Hip-Hop",
        difficulty: "Intermediate",
        energy: "Medium",
        bpm: 108,
        durationSec: 167,
      });

      // Update visibility/moderation if it's set to Public
      if (vis === "Public") {
        await tranceRoutineService.publishRoutine(draft.id);
      }

      navigate(TRANCE_ROUTES.routine(draft.id));
    } catch (err) {
      console.error("Failed to publish routine draft:", err);
      // Fallback
      navigate(TRANCE_ROUTES.routine("rt001"));
    } finally {
      setPublishing(false);
    }
  };

  if (authLoading) {
    return (
      <TranceShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="w-8 h-8 rounded-full border-4 border-fuchsia-500 border-t-transparent animate-spin" />
        </div>
      </TranceShell>
    );
  }

  if (!canCreate) {
    return (
      <TranceShell>
        <TranceTopBar
          title={
            <div>
              <TranceLogo size="sm" />
            </div>
          }
          right={<TranceAccountButton />}
        />
        <div className="max-w-md mx-auto mt-12 text-center px-4">
          <TranceGlassCard glow="magenta" className="p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/40 flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-fuchsia-400 animate-pulse" />
            </div>
            <span className="text-[10px] font-black text-yellow-300 uppercase tracking-[0.35em] mb-2">
              Choreographer Mode
            </span>
            <h2 className="text-2xl font-black text-white mb-3">Choreographer Access Required</h2>
            <p className="text-xs text-white/60 leading-relaxed mb-6">
              To create and publish dance routines on TRANCE, you must be registered as an approved
              Choreographer, Studio Owner, or Administrator.
            </p>
            <GradientButton
              onClick={() => navigate(TRANCE_ROUTES.home)}
              className="w-full py-3 text-sm font-bold uppercase tracking-wider"
            >
              Back to Home
            </GradientButton>
          </TranceGlassCard>
        </div>
      </TranceShell>
    );
  }

  return (
    <TranceShell>
      <TranceTopBar
        title={
          <div>
            <TranceLogo size="sm" />
          </div>
        }
        right={<TranceAccountButton />}
      />

      <div className="text-center mb-6 flex flex-col items-center">
        <div className="relative group mb-3 cursor-pointer">
          <span
            aria-hidden="true"
            className="absolute inset-0 -m-3 rounded-full blur-2xl opacity-60 group-hover:opacity-85 transition-opacity duration-500 bg-[conic-gradient(from_0deg,oklch(0.82_0.16_85_/_0.55),oklch(0.7_0.25_340_/_0.45),oklch(0.65_0.22_300_/_0.5),oklch(0.82_0.15_215_/_0.45),oklch(0.82_0.16_85_/_0.55))] animate-conic-spin"
          />
          <span
            aria-hidden="true"
            className="absolute inset-0 -m-1 rounded-full bg-primary/25 blur-xl animate-glow-pulse"
          />
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fde09f3f7574845d786350acb13c952c1%2F1cda4b14c56149b7bf48c746db026821?format=webp&width=800&height=1200"
            alt="Trance Logo"
            className="w-16 h-16 relative z-10 rounded-full object-contain border border-white/10 bg-black/45 backdrop-blur-md p-1 transition-all duration-500 group-hover:scale-110 shadow-[0_0_20px_rgba(0,0,0,0.8)]"
          />
        </div>
        <span className="text-[10px] font-black text-yellow-300 uppercase tracking-[0.35em]">
          Choreographer Tool
        </span>
        <h1
          className="text-4xl font-black tracking-tight mt-1 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-300 to-cyan-400"
          style={{ filter: "drop-shadow(0 0 15px rgba(217,70,239,0.3))" }}
        >
          New Dance Session
        </h1>
        <p className="text-xs text-white/50 tracking-wider mt-1">
          Upload · Annotate · Train · Elevate
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5 w-full min-w-0 overflow-hidden">
        {/* Stepper */}
        <div className="md:sticky md:top-4 h-max min-w-0 w-full overflow-hidden">
          <BuilderStepper active={active} onSelect={setActive} />
        </div>

        {/* Step content */}
        <div className="space-y-4 min-w-0 w-full">
          <StepCard n={1} title="Upload Video" sub="Upload your choreography (Recommended: 1080p+)">
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  tranceVideoUploadService.uploadRoutineVideo(new File([], "mock.mp4"));
                  setUploaded(true);
                }}
                className="rounded-2xl border-2 border-dashed border-fuchsia-400/40 bg-fuchsia-500/5 p-6 flex flex-col items-center gap-2 text-center"
              >
                <UploadCloud className="w-8 h-8 text-fuchsia-300" />
                <span className="text-xs text-white/60">
                  Drag & drop your video here
                  <br />
                  or tap to browse
                </span>
                <span className="text-[11px] font-bold text-fuchsia-300 border border-fuchsia-400/40 rounded-lg px-3 py-1.5">
                  BROWSE FILES
                </span>
              </button>
              <div className="rounded-2xl overflow-hidden border border-white/10">
                <div className="relative h-28">
                  <img src={IMG.r1} className="w-full h-full object-cover" alt="preview" />
                  <span className="absolute top-2 left-2 text-[8px] bg-black/60 px-2 py-0.5 rounded uppercase">
                    Preview
                  </span>
                  <button className="absolute inset-0 m-auto w-9 h-9 rounded-full bg-white/20 grid place-items-center">
                    <Play className="w-4 h-4 fill-white" />
                  </button>
                </div>
                <div className="p-2">
                  <div className="text-xs font-bold text-white">VIBES_ONLY_FINAL.mp4</div>
                  <div className="text-[10px] text-white/50">02:47 · 1080p · 120 MB</div>
                  {uploaded && (
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Upload complete
                    </div>
                  )}
                </div>
              </div>
            </div>
          </StepCard>

          <StepCard
            n={2}
            title="Mark 8-Counts"
            sub="Tap the timeline to mark each 8-count phrase"
            right={
              <GradientButton
                variant="outline"
                className="text-[10px] px-3 py-2 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Auto Detect (AI)
              </GradientButton>
            }
          >
            <div className="flex items-center gap-2">
              <button className="w-9 h-9 rounded-full bg-white/10 grid place-items-center shrink-0">
                <Play className="w-4 h-4 fill-white" />
              </button>
              <div className="flex-1 flex gap-1 overflow-x-auto no-scrollbar">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border border-white/10"
                  >
                    <img src={IMG.r2} className="w-full h-full object-cover" alt="" />
                    <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-fuchsia-500 grid place-items-center text-[8px] font-black">
                      {n}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-white/40 mt-2">00:00 / 02:47</div>
          </StepCard>

          <StepCard
            n={3}
            title="Add Move Hints"
            sub="Add coaching cues to help dancers learn & perform."
            right={
              <GradientButton
                variant="outline"
                className="text-[10px] px-3 py-2 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Hint
              </GradientButton>
            }
          >
            <div className="grid sm:grid-cols-3 gap-2">
              {hints.map((h) => (
                <div key={h.t} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black text-fuchsia-300 flex items-center gap-1">
                      ● {h.t}
                    </span>
                    <div className="flex gap-1 text-white/40">
                      <Pencil className="w-3 h-3" />
                      <Trash2 className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="text-xs font-bold text-white">{h.label}</div>
                  <div className="text-[10px] text-white/50">{h.d}</div>
                </div>
              ))}
            </div>
          </StepCard>

          <StepCard n={4} title="Set Direction Arrows" sub="Define dancer facing and transitions.">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {arrows.map(([label, Icon], i) => (
                <div
                  key={i}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-500/5 p-2 text-center"
                >
                  <Icon
                    className="w-6 h-6 mx-auto text-cyan-300"
                    style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }}
                  />
                  <div className="text-[9px] text-white/50 mt-1">
                    {["00:00", "00:16", "00:32", "00:48", "01:04", "01:20"][i]}
                  </div>
                  <div className="text-[10px] font-bold text-white">{label}</div>
                </div>
              ))}
            </div>
          </StepCard>

          <StepCard
            n={5}
            title="Define Scoring Rules"
            sub="Customize how the AI evaluates performance."
          >
            <div className="space-y-3">
              {(Object.keys(scores) as (keyof typeof scores)[]).map((k) => {
                const icons: Record<
                  keyof typeof scores,
                  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
                > = {
                  Timing: Clock,
                  Execution: Activity,
                  Energy: Zap,
                  Precision: Crosshair,
                  Creativity: Star,
                };
                const Icon = icons[k];
                return (
                  <div key={k} className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-cyan-300 shrink-0" />
                    <span className="text-xs font-bold text-white w-20">{k}</span>
                    <input
                      type="range"
                      min={0}
                      max={50}
                      value={scores[k]}
                      onChange={(e) => setScores({ ...scores, [k]: +e.target.value })}
                      className="flex-1 accent-fuchsia-500"
                    />
                    <span className="text-xs font-black text-fuchsia-300 w-10 text-right">
                      {scores[k]}%
                    </span>
                  </div>
                );
              })}
            </div>
          </StepCard>

          <StepCard
            n={6}
            title="Choose Privacy & Publish"
            sub="Control who can access and train with your session."
          >
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setVis("Public")}
                className={cn(
                  "rounded-xl border p-3 text-left",
                  vis === "Public" ? "border-fuchsia-400/60 bg-fuchsia-500/10" : "border-white/10",
                )}
              >
                <div className="flex items-center justify-between">
                  <Globe className="w-5 h-5 text-fuchsia-300" />
                  {vis === "Public" && <CheckCircle2 className="w-4 h-4 text-fuchsia-300" />}
                </div>
                <div className="font-black text-white text-sm mt-1">PUBLIC</div>
                <div className="text-[10px] text-white/50">
                  Anyone on TRANCE can discover & train.
                </div>
              </button>
              <button
                onClick={() => setVis("Private")}
                className={cn(
                  "rounded-xl border p-3 text-left",
                  vis === "Private" ? "border-cyan-400/60 bg-cyan-500/10" : "border-white/10",
                )}
              >
                <div className="flex items-center justify-between">
                  <Lock className="w-5 h-5 text-cyan-300" />
                  {vis === "Private" && <CheckCircle2 className="w-4 h-4 text-cyan-300" />}
                </div>
                <div className="font-black text-white text-sm mt-1">PRIVATE</div>
                <div className="text-[10px] text-white/50">
                  Only people with the link can access.
                </div>
              </button>
            </div>
          </StepCard>

          <button
            onClick={handlePublish}
            disabled={publishing}
            className={cn(
              "w-full rounded-2xl py-4 font-black text-lg tracking-widest text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 border border-fuchsia-400/50 shadow-[0_0_30px_-6px_rgba(217,70,239,0.7)] active:scale-95 transition flex items-center justify-center gap-2",
              publishing && "opacity-75 cursor-not-allowed",
            )}
          >
            {publishing ? (
              <>
                <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                PUBLISHING...
              </>
            ) : (
              "PUBLISH SESSION →"
            )}
          </button>
          <p className="text-center text-[10px] text-white/40">
            By publishing, you agree to TRANCE Terms of Use and Community Guidelines.
          </p>
        </div>
      </div>
    </TranceShell>
  );
};

export default BuilderScreen;
