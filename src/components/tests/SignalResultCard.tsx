import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import {
  Activity,
  Award,
  Check,
  Loader2,
  Share2,
  Shield,
  Sparkles,
  User,
} from 'lucide-react';
import { PrivacyMode, SignalResult, UserAnswer } from '@/types/naturalAbility';
import { ABILITY_RESULTS } from '@/lib/tests/naturalAbilityResults';
import { buildFeedNamePreview } from '@/lib/tests/naturalAbilityActivation';
import SignalPrivacyControls from './SignalPrivacyControls';
import { Logo } from '@/components/brand/Logo';
import { useSupabaseSession } from '@/lib/supabase-session';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  fetchSignalRecord,
  getOrCreateUserId,
  saveNaturalAbilityResultOnce,
  StoredSignalRow,
} from '@/lib/tests/naturalAbilityStorage';

interface Props {
  result: SignalResult;
  userName?: string;
  answers?: UserAnswer[];
}

const STRENGTH_META: Record<string, { label: string; pct: number; color: string }> = {
  Strong: { label: 'VERY STRONG', pct: 92, color: 'from-emerald-400 to-cyan-400' },
  Mixed: { label: 'MIXED SIGNAL', pct: 64, color: 'from-amber-400 to-fuchsia-400' },
  Emerging: { label: 'EMERGING', pct: 48, color: 'from-violet-400 to-cyan-400' },
  Unreadable: { label: 'UNREADABLE', pct: 22, color: 'from-slate-400 to-slate-600' },
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SignalResultCard: React.FC<Props> = ({
  result,
  userName = 'Trey TV Member',
  answers = [],
}) => {
  const navigate = useNavigate();
  // Key the signal record on the Supabase auth user id — the same id the profile
  // reads (profileUserId) — so a completed test is detected on the profile.
  const { user: supaUser } = useSupabaseSession();
  const currentProfile = useCurrentUser();
  
  const primary = ABILITY_RESULTS[result.primaryAbility];
  const secondary = ABILITY_RESULTS[result.secondaryAbility];
  const strength = STRENGTH_META[result.signalStrength];
  
  const [privacy, setPrivacy] = useState<PrivacyMode>('public');
  const [existingRow, setExistingRow] = useState<StoredSignalRow | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const actualUserName = currentProfile.name || userName;
  const feedNamePreview = existingRow?.feed_name_preview ?? buildFeedNamePreview(actualUserName, result);

  useEffect(() => {
    const id = supaUser?.id || getOrCreateUserId();
    fetchSignalRecord(id).then((row) => {
      if (row) {
        setExistingRow(row);
        setPrivacy(row.privacy_mode as PrivacyMode);
      }
    });
  }, [supaUser]);

  const handleSave = async () => {
    setSaveStatus('saving');
    setStatusMessage('');
    const id = supaUser?.id || getOrCreateUserId();
    const res = await saveNaturalAbilityResultOnce({
      userId: id,
      displayName: actualUserName,
      result,
      privacyMode: privacy,
      answers,
    });

    if (res.ok) {
      setExistingRow(res.row);
      setSaveStatus('saved');
      setStatusMessage(
        privacy === 'public'
          ? 'Your badge is active on your profile and feed.'
          : privacy === 'profile'
          ? 'Your badge is active on your profile only.'
          : 'Your result is saved privately.'
      );
      setTimeout(() => setSaveStatus('idle'), 3200);
    } else {
      setSaveStatus('error');
      setStatusMessage(res.error || 'Could not save. Please refresh and try again.');
    }
  };

  return (
    <div className="signal-test-scroll-safe min-h-[100dvh] w-full bg-[#06030f] text-white relative overflow-x-hidden overflow-y-auto px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8 animate-rise">
      <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-fuchsia-700/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-cyan-700/20 blur-[140px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-violet-700/10 blur-[160px]" />

      <div className="relative max-w-6xl mx-auto">
        <div className="flex justify-center mb-4">
          <Logo className="h-16 w-16" />
        </div>

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 text-amber-300 text-[11px] tracking-[0.4em] font-bold">
            <span>✦</span> ABILITY UNLOCKED <span>✦</span>
          </div>
          <h1
            className="mt-2 text-4xl font-black tracking-tight bg-gradient-to-b from-white via-white to-slate-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.25)] sm:text-6xl md:text-7xl"
            style={{ fontFamily: 'serif' }}
          >
            {primary.ability}
          </h1>
          <p className="mt-2 text-xs tracking-[0.25em] text-amber-300 font-semibold uppercase sm:text-sm sm:tracking-[0.35em]">
            {primary.subtitle}
          </p>
        </div>

        {/* Badge */}
        <div className="relative my-4 flex items-center justify-center sm:my-6">
          <div
            className="absolute w-48 h-48 rounded-full blur-3xl opacity-50 sm:w-64 sm:h-64"
            style={{ background: `radial-gradient(circle, ${primary.glow}, transparent 70%)` }}
          />
          <div
            className="relative w-32 h-32 rounded-full bg-gradient-to-br from-black to-slate-900 border-2 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.5)] animate-glow-pulse sm:w-40 sm:h-40"
            style={{ borderColor: primary.glow }}
          >
            <div
              className="absolute inset-2 rounded-full bg-gradient-to-br opacity-30 blur-sm"
              style={{ background: `radial-gradient(circle, ${primary.glow}40, transparent)` }}
            />
            <span
              className="relative text-6xl font-bold drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] sm:text-7xl"
              style={{ color: primary.glow }}
            >
              {primary.feedSymbol}
            </span>
          </div>
        </div>

        {/* What it means */}
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-fuchsia-500/40 via-violet-500/30 to-cyan-500/40 mb-3">
          <div className="rounded-2xl bg-[#0a0518]/80 backdrop-blur-xl border border-white/5 px-5 py-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/40 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-fuchsia-300" />
            </div>
            <div>
              <p className="text-[11px] tracking-[0.3em] text-fuchsia-300 font-bold">YOUR STRONGEST SIGNAL</p>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed">{primary.explanation}</p>
            </div>
          </div>
        </div>

        {/* AI Interpretation */}
        {result.interpretation && (
          <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-500/40 via-fuchsia-500/30 to-violet-500/40 mb-3">
            <div className="rounded-2xl bg-[#0a0518]/80 backdrop-blur-xl border border-white/5 px-5 py-5 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] tracking-[0.3em] text-amber-300 font-bold">TREY-I PERSONAL READ</p>
                <p className="text-sm text-slate-200 mt-1 leading-relaxed italic">"{result.interpretation}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Secondary + Strength */}
        <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl px-4 py-4">
            <p className="text-[10px] tracking-[0.3em] text-cyan-300 font-bold">SECONDARY SIGNAL</p>
            <p className="text-xl font-bold mt-1" style={{ color: secondary.glow }}>
              {secondary.ability}
            </p>
            <p className="text-xs text-slate-400 mt-1 leading-snug">{secondary.subtitle}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl px-4 py-4">
            <p className="text-[10px] tracking-[0.3em] text-amber-300 font-bold">SIGNAL STRENGTH</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="relative w-12 h-12">
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="url(#sg)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(strength.pct / 100) * 94} 94`}
                  />
                  <defs>
                    <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {strength.pct}%
                </div>
              </div>
              <p className="text-xs font-bold text-amber-300 tracking-wider">{strength.label}</p>
            </div>
          </div>
        </div>

        {/* Signal blend */}
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-violet-500/40 via-amber-500/30 to-cyan-500/40 mb-3">
          <div className="rounded-2xl bg-[#0a0518]/80 backdrop-blur-xl border border-white/5 px-5 py-5">
            <p className="text-[11px] tracking-[0.3em] text-amber-300 font-bold">SIGNAL BLEND</p>
            <p className="text-2xl font-bold text-white mt-1" style={{ fontFamily: 'serif' }}>
              {result.signalBlend}
            </p>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              You blend the {primary.ability.toLowerCase()}'s instincts with the {secondary.ability.toLowerCase()}'s edge.
            </p>
          </div>
        </div>

        {/* Strength / Shadow / Growth */}
        <div className="grid grid-cols-1 gap-2 mb-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.03] border border-amber-400/20 backdrop-blur-xl px-3 py-4">
            <Award className="w-5 h-5 text-amber-300 mx-auto" />
            <p className="text-center text-[10px] tracking-[0.2em] text-amber-300 font-bold mt-2">STRENGTH</p>
            <p className="text-center text-[11px] text-slate-300 mt-1 leading-snug">{primary.strength}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-fuchsia-400/20 backdrop-blur-xl px-3 py-4">
            <div className="w-5 h-5 mx-auto rounded-full bg-fuchsia-400/30 border border-fuchsia-400" />
            <p className="text-center text-[10px] tracking-[0.2em] text-fuchsia-300 font-bold mt-2">SHADOW</p>
            <p className="text-center text-[11px] text-slate-300 mt-1 leading-snug">{primary.shadow}</p>
          </div>
          <div className="rounded-2xl bg-white/[0.03] border border-cyan-400/20 backdrop-blur-xl px-3 py-4">
            <Sparkles className="w-5 h-5 text-cyan-300 mx-auto" />
            <p className="text-center text-[10px] tracking-[0.2em] text-cyan-300 font-bold mt-2">GROWTH</p>
            <p className="text-center text-[11px] text-slate-300 mt-1 leading-snug">{primary.growthPrompt}</p>
          </div>
        </div>

        {/* Badge info */}
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-amber-400/50 via-amber-200/30 to-amber-400/50 mb-3">
          <div className="rounded-2xl bg-[#0a0518]/80 backdrop-blur-xl border border-white/5 px-5 py-4 flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-3xl border-2"
              style={{ borderColor: primary.glow, color: primary.glow, background: `${primary.glow}15` }}
            >
              {primary.feedSymbol}
            </div>
            <div className="flex-1">
              <p className="text-[10px] tracking-[0.3em] text-amber-300 font-bold">— BADGE UNLOCKED —</p>
              <p className="text-lg font-bold text-white" style={{ fontFamily: 'serif' }}>
                {primary.subtitle}
              </p>
              <p className="text-xs text-slate-400">You've earned the {primary.ability} badge. Save to activate it in Trey TV.</p>
            </div>
          </div>
        </div>

        {/* Feed name preview */}
        <div className="rounded-2xl p-[1.5px] bg-gradient-to-r from-fuchsia-500/40 via-violet-500/30 to-cyan-500/40 mb-3">
          <div className="rounded-2xl bg-[#0a0518]/80 backdrop-blur-xl border border-white/5 px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] tracking-[0.3em] text-fuchsia-300 font-bold">YOUR FEED NAME PREVIEW</p>
              <p className="text-xl font-bold mt-1 truncate" style={{ fontFamily: 'serif' }}>
                <span className="text-white">{feedNamePreview}</span>
              </p>
            </div>
            <div
              className="w-11 h-11 rounded-full border flex items-center justify-center shrink-0"
              style={{ borderColor: primary.glow, background: `${primary.glow}15` }}
            >
              <User className="w-5 h-5" style={{ color: primary.glow }} />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl px-5 py-5 mb-3">
          <SignalPrivacyControls value={privacy} onChange={setPrivacy} />
        </div>

        {/* Permanent Result Lock Status */}
        <div className="rounded-2xl bg-white/[0.03] border border-amber-500/20 backdrop-blur-xl px-5 py-4 mb-3 text-center animate-pulse">
          <p className="text-sm text-amber-300 font-bold tracking-wider">
            Your Natural Ability is now locked to your profile.
          </p>
          <p className="text-xs text-slate-300 mt-1">
            This result is permanent. You can control where it appears, but the label itself cannot be changed.
          </p>
        </div>

        {/* Status banner */}
        {saveStatus !== 'idle' && (
          <div
            className={`rounded-2xl px-4 py-3 mb-3 flex items-center gap-2 text-sm border ${
              saveStatus === 'saved'
                ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200'
                : saveStatus === 'error'
                ? 'border-rose-400/30 bg-rose-500/10 text-rose-200'
                : 'border-cyan-400/30 bg-cyan-500/10 text-cyan-200'
            }`}
          >
            {saveStatus === 'saving' && <Loader2 className="w-4 h-4 animate-spin" />}
            {saveStatus === 'saved' && <Check className="w-4 h-4" />}
            {saveStatus === 'error' && <Shield className="w-4 h-4" />}
            <span>
              {saveStatus === 'saving' ? 'Saving your Signal…' : statusMessage}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3 mt-4 sm:grid-cols-3">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className={`group relative rounded-2xl py-4 px-4 font-bold tracking-wider overflow-hidden transition ${
              saveStatus === 'saving' ? 'opacity-70 cursor-wait' : 'active:scale-[0.98]'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-500 via-violet-500 to-cyan-500 blur-md opacity-70" />
            <span className="relative flex items-center justify-center gap-2 text-white">
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  SAVING…
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4" />
                  SAVED
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  SAVE + ACTIVATE BADGE
                </>
              )}
            </span>
          </button>
          <button
            onClick={() => navigate({ to: '/u/$uid', params: { uid: currentProfile.uid } })}
            className="rounded-2xl py-4 px-4 font-bold tracking-wider border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2 text-slate-200">
              <User className="w-4 h-4" />
              VIEW MY PROFILE
            </span>
          </button>
          <button
            onClick={() => navigate({ to: '/' })}
            className="rounded-2xl py-4 px-4 font-bold tracking-wider border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition active:scale-[0.98]"
          >
            <span className="flex items-center justify-center gap-2 text-slate-200">
              <Activity className="w-4 h-4" />
              CONTINUE TO TREY TV
            </span>
          </button>
        </div>

        <p className="text-center text-[11px] tracking-[0.2em] text-slate-500 mt-6">
          ♛ YOU CONTROL YOUR <span className="text-fuchsia-300">SIGNAL.</span>
        </p>
      </div>
    </div>
  );
};

export default SignalResultCard;
