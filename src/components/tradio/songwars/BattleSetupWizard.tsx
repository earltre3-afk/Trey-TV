import React, { useState } from 'react';
import {
  ChevronLeft,
  Swords,
  Sparkles,
  Shield,
  Users,
  Clock,
  Settings,
  MessageSquare,
  Smile,
  Radio,
  Calendar,
  Trophy,
  Check,
  Play,
  Zap,
} from 'lucide-react';
import { BATTLE_TYPES, CONTESTANT_POOL, VIBE_TAGS, IMAGES, type BattleType, type ContestantSeed, type BattleStatus } from '@/data/mockData';
import { useSongWars } from '@/contexts/SongWarsContext';

interface Props {
  onClose: () => void;
}

type WizardStep = 'type' | 'contestants' | 'rounds' | 'settings' | 'schedule' | 'review';

export default function BattleSetupWizard({ onClose }: Props) {
  const { addWar } = useSongWars();

  const [step, setStep] = useState<WizardStep>('type');
  const [battleType, setBattleType] = useState<BattleType | null>(null);
  const [title, setTitle] = useState('');
  const [leftContestant, setLeftContestant] = useState<ContestantSeed | null>(null);
  const [rightContestant, setRightContestant] = useState<ContestantSeed | null>(null);
  const [roundCount, setRoundCount] = useState(3);
  const [roundDuration, setRoundDuration] = useState(60);
  const [voteDuration, setVoteDuration] = useState(30);
  const [allowChat, setAllowChat] = useState(true);
  const [allowGIFs, setAllowGIFs] = useState(true);
  const [allowReactions, setAllowReactions] = useState(true);
  const [allowRequests, setAllowRequests] = useState(false);
  const [vibe, setVibe] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [goLiveNow, setGoLiveNow] = useState(false);

  const back = () => {
    const steps: WizardStep[] = ['type', 'contestants', 'rounds', 'settings', 'schedule', 'review'];
    const idx = steps.indexOf(step);
    if (idx <= 0) onClose();
    else setStep(steps[idx - 1]);
  };
  const next = () => {
    const steps: WizardStep[] = ['type', 'contestants', 'rounds', 'settings', 'schedule', 'review'];
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };

  const handleCreate = () => {
    if (!battleType || !leftContestant || !rightContestant) return;
    addWar({
      title: title || `${leftContestant.name} vs ${rightContestant.name}`,
      type: battleType,
      status: goLiveNow ? 'active' as BattleStatus : 'scheduled' as BattleStatus,
      hype: `Best of ${roundCount}`,
      schedule: goLiveNow ? 'Live now' : `${scheduleDate} at ${scheduleTime}`,
      vibe: vibe || undefined,
      left: {
        id: leftContestant.id,
        name: leftContestant.name,
        handle: leftContestant.handle,
        role: leftContestant.role,
        image: leftContestant.image,
        track: leftContestant.track,
        src: leftContestant.src,
        votes: 0,
        wins: 0,
        losses: 0,
        approved: true,
      },
      right: {
        id: rightContestant.id,
        name: rightContestant.name,
        handle: rightContestant.handle,
        role: rightContestant.role,
        image: rightContestant.image,
        track: rightContestant.track,
        src: rightContestant.src,
        votes: 0,
        wins: 0,
        losses: 0,
        approved: true,
      },
    });
    onClose();
  };

  const allSteps: WizardStep[] = ['type', 'contestants', 'rounds', 'settings', 'schedule', 'review'];
  const currentIdx = allSteps.indexOf(step);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-black">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-3 pb-2 shrink-0">
        <button
          onClick={back}
          className="w-9 h-9 rounded-full bg-white/[0.06] border border-fuchsia-400/20 flex items-center justify-center text-white active:scale-95 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-fuchsia-400" />
          <span className="tradio-chrome font-bold tracking-wide text-sm">BATTLE SETUP</span>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5 mx-5 mb-5 mt-1">
        {allSteps.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              currentIdx >= i
                ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-300'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step: Battle Type */}
      {step === 'type' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-fuchsia-300/70 text-xs font-semibold tracking-widest mb-2">STEP 1 OF 6</p>
            <h2 className="text-white text-2xl font-black leading-tight">Battle type</h2>
          </div>

          <input
            className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder-white/30 text-sm font-semibold focus:border-fuchsia-400/40 focus:outline-none transition"
            placeholder="Battle title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2">
            {BATTLE_TYPES.map((bt) => (
              <button
                key={bt}
                onClick={() => setBattleType(bt)}
                className={`px-3 py-3 rounded-xl border text-xs font-bold transition text-left ${
                  battleType === bt
                    ? 'border-fuchsia-400/50 text-fuchsia-100 bg-fuchsia-500/15'
                    : 'bg-white/[0.04] border-white/10 text-white/60'
                }`}
              >
                {bt}
              </button>
            ))}
          </div>

          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">VIBE TAG (for Prescribe Me matching)</label>
            <div className="flex flex-wrap gap-2">
              {VIBE_TAGS.map((v) => (
                <button
                  key={v}
                  onClick={() => setVibe(vibe === v ? null : v)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-bold transition ${
                    vibe === v
                      ? 'border-cyan-400/50 text-cyan-200 bg-cyan-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white/50'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            disabled={!battleType}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg disabled:opacity-50"
          >
            Next: Contestants
          </button>
        </div>
      )}

      {/* Step: Contestants */}
      {step === 'contestants' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-fuchsia-300/70 text-xs font-semibold tracking-widest mb-2">STEP 2 OF 6</p>
            <h2 className="text-white text-2xl font-black leading-tight">Pick your fighters</h2>
          </div>

          <div>
            <p className="text-white/60 text-xs font-bold mb-2">LEFT CORNER</p>
            <div className="space-y-2">
              {CONTESTANT_POOL.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setLeftContestant(c)}
                  disabled={rightContestant?.id === c.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left disabled:opacity-30 ${
                    leftContestant?.id === c.id
                      ? 'border-fuchsia-400/50 bg-fuchsia-500/10'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <img src={c.image} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm truncate">{c.name}</p>
                    <p className="text-white/45 text-[11px]">{c.role} • {c.track}</p>
                  </div>
                  {leftContestant?.id === c.id && <Check className="w-5 h-5 text-fuchsia-400" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white/60 text-xs font-bold mb-2">RIGHT CORNER</p>
            <div className="space-y-2">
              {CONTESTANT_POOL.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setRightContestant(c)}
                  disabled={leftContestant?.id === c.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border transition text-left disabled:opacity-30 ${
                    rightContestant?.id === c.id
                      ? 'border-cyan-400/50 bg-cyan-500/10'
                      : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <img src={c.image} alt="" className="w-10 h-10 rounded-full object-cover border border-white/20" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white font-bold text-sm truncate">{c.name}</p>
                    <p className="text-white/45 text-[11px]">{c.role} • {c.track}</p>
                  </div>
                  {rightContestant?.id === c.id && <Check className="w-5 h-5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            disabled={!leftContestant || !rightContestant}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg disabled:opacity-50"
          >
            Next: Rounds
          </button>
        </div>
      )}

      {/* Step: Rounds */}
      {step === 'rounds' && (
        <div className="flex-1 px-5 pb-8 space-y-6 animate-tradio-fade-in">
          <div>
            <p className="text-fuchsia-300/70 text-xs font-semibold tracking-widest mb-2">STEP 3 OF 6</p>
            <h2 className="text-white text-2xl font-black leading-tight">Round settings</h2>
          </div>

          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">NUMBER OF ROUNDS</label>
            <div className="flex gap-2">
              {[1, 3, 5, 7].map((n) => (
                <button
                  key={n}
                  onClick={() => setRoundCount(n)}
                  className={`flex-1 py-3.5 rounded-xl border text-sm font-bold transition ${
                    roundCount === n
                      ? 'border-fuchsia-400/50 text-fuchsia-100 bg-fuchsia-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white/60'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">ROUND DURATION (seconds)</label>
            <div className="flex gap-2">
              {[30, 60, 90, 120].map((n) => (
                <button
                  key={n}
                  onClick={() => setRoundDuration(n)}
                  className={`flex-1 py-3.5 rounded-xl border text-sm font-bold transition ${
                    roundDuration === n
                      ? 'border-fuchsia-400/50 text-fuchsia-100 bg-fuchsia-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white/60'
                  }`}
                >
                  {n}s
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">VOTING DURATION (seconds)</label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((n) => (
                <button
                  key={n}
                  onClick={() => setVoteDuration(n)}
                  className={`flex-1 py-3.5 rounded-xl border text-sm font-bold transition ${
                    voteDuration === n
                      ? 'border-fuchsia-400/50 text-fuchsia-100 bg-fuchsia-500/15'
                      : 'bg-white/[0.04] border-white/10 text-white/60'
                  }`}
                >
                  {n}s
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg"
          >
            Next: Settings
          </button>
        </div>
      )}

      {/* Step: Chat/Reaction Settings */}
      {step === 'settings' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-fuchsia-300/70 text-xs font-semibold tracking-widest mb-2">STEP 4 OF 6</p>
            <h2 className="text-white text-2xl font-black leading-tight">Chat & reactions</h2>
          </div>

          {([
            [allowChat, setAllowChat, 'Fan Chat', '💬'],
            [allowGIFs, setAllowGIFs, 'Allow GIFs', '🎞️'],
            [allowReactions, setAllowReactions, 'Emoji Reactions', '🔥'],
            [allowRequests, setAllowRequests, 'Fan Song Requests', '📩'],
          ] as [boolean, (v: boolean) => void, string, string][]).map(([val, setter, label, icon]) => (
            <button
              key={label}
              onClick={() => setter(!val)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border transition ${
                val
                  ? 'border-fuchsia-400/40 bg-fuchsia-500/10 text-white'
                  : 'border-white/10 bg-white/[0.04] text-white/50'
              }`}
            >
              <span className="text-lg">{icon}</span>
              <span className="font-bold text-sm flex-1 text-left">{label}</span>
              <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                val ? 'border-fuchsia-400 bg-fuchsia-400' : 'border-white/30'
              }`}>
                {val && <span className="w-2 h-2 rounded-full bg-black" />}
              </span>
            </button>
          ))}

          <button
            onClick={next}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg"
          >
            Next: Schedule
          </button>
        </div>
      )}

      {/* Step: Schedule */}
      {step === 'schedule' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-fuchsia-300/70 text-xs font-semibold tracking-widest mb-2">STEP 5 OF 6</p>
            <h2 className="text-white text-2xl font-black leading-tight">When does it start?</h2>
          </div>

          <button
            onClick={() => setGoLiveNow(true)}
            className={`w-full py-4 rounded-2xl border font-bold text-sm transition ${
              goLiveNow
                ? 'border-red-400/50 bg-red-500/15 text-red-300'
                : 'border-white/10 bg-white/[0.04] text-white/60'
            }`}
          >
            🔴 Start Battle Live Now
          </button>

          <div className="text-center text-white/30 text-xs font-bold">OR SCHEDULE</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">DATE</label>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-fuchsia-400" />
                <input
                  type="date"
                  className="bg-transparent text-white text-sm font-semibold flex-1 focus:outline-none"
                  value={scheduleDate}
                  onChange={(e) => { setScheduleDate(e.target.value); setGoLiveNow(false); }}
                />
              </div>
            </div>
            <div>
              <label className="text-white/60 text-xs font-bold tracking-wide block mb-2">TIME</label>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3.5 flex items-center gap-2">
                <Clock className="w-4 h-4 text-fuchsia-400" />
                <input
                  type="time"
                  className="bg-transparent text-white text-sm font-semibold flex-1 focus:outline-none"
                  value={scheduleTime}
                  onChange={(e) => { setScheduleTime(e.target.value); setGoLiveNow(false); }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={next}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg"
          >
            Next: Review
          </button>
        </div>
      )}

      {/* Step: Review */}
      {step === 'review' && (
        <div className="flex-1 px-5 pb-8 space-y-5 animate-tradio-fade-in">
          <div>
            <p className="text-fuchsia-300/70 text-xs font-semibold tracking-widest mb-2">STEP 6 OF 6</p>
            <h2 className="text-white text-2xl font-black leading-tight">Review & Create</h2>
          </div>

          {/* VS Card */}
          {leftContestant && rightContestant && (
            <div className="relative rounded-3xl overflow-hidden border border-fuchsia-400/30 p-5">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-700/25 via-slate-950 to-black" />
              <div className="relative flex items-center justify-between">
                <div className="text-center flex-1">
                  <img src={leftContestant.image} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-fuchsia-400/40 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">{leftContestant.name}</p>
                  <p className="text-white/45 text-[10px]">{leftContestant.track}</p>
                </div>
                <div className="px-4">
                  <span className="text-2xl font-black bg-gradient-to-r from-fuchsia-400 to-cyan-300 bg-clip-text text-transparent">VS</span>
                </div>
                <div className="text-center flex-1">
                  <img src={rightContestant.image} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-cyan-400/40 mx-auto mb-2" />
                  <p className="text-white font-bold text-sm">{rightContestant.name}</p>
                  <p className="text-white/45 text-[10px]">{rightContestant.track}</p>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="tradio-glass rounded-2xl p-4 space-y-2">
            <SummaryRow label="Type" value={battleType || '—'} />
            <SummaryRow label="Rounds" value={`Best of ${roundCount}`} />
            <SummaryRow label="Round Duration" value={`${roundDuration}s`} />
            <SummaryRow label="Voting" value={`${voteDuration}s per round`} />
            <SummaryRow label="Chat" value={allowChat ? 'On' : 'Off'} />
            <SummaryRow label="GIFs" value={allowGIFs ? 'On' : 'Off'} />
            <SummaryRow label="Reactions" value={allowReactions ? 'On' : 'Off'} />
            {vibe && <SummaryRow label="Vibe" value={vibe} />}
            <SummaryRow label="Schedule" value={goLiveNow ? '🔴 Live Now' : `${scheduleDate} at ${scheduleTime}`} />
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition shadow-lg text-lg"
          >
            {goLiveNow ? (
              <>
                <Zap className="w-5 h-5" />
                Create & Go Live
              </>
            ) : (
              <>
                <Trophy className="w-5 h-5" />
                Create Battle
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/45 text-[11px] font-semibold tracking-wide">{label}</span>
      <span className="text-white font-bold text-sm">{value}</span>
    </div>
  );
}
