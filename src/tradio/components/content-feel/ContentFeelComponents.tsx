import React from 'react';
import { AlertTriangle, Brain, Compass, Radar, ShieldQuestion, Sparkles, Tag, Waves, Loader2 } from 'lucide-react';
import { GlassCard } from '../tradio/ui';
import { PRESCRIBE_ME_QUESTION_MAP, getAnswerLabel, type PrescribeMeQuestionKey } from '@/tradio/lib/content-feel/contentFeelQuestions';
import { PRESCRIBE_ME_PRIVACY_NOTICE, safeRecommendationReason } from '@/tradio/lib/content-feel/contentFeelPrivacyRules';
import type { ContentFeelProfile } from '@/tradio/lib/content-feel/contentFeelTypes';
import type { ContentFeelStatus } from './useContentFeelAnalysis';

const humanize = (value: string) => value.replace(/_/g, ' ');

const TONE: Record<string, string> = {
  mood: 'border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-200',
  energy: 'border-cyan-300/25 bg-cyan-500/10 text-cyan-200',
  need: 'border-purple-300/25 bg-purple-500/10 text-purple-200',
  context: 'border-white/12 bg-white/[0.05] text-white/70',
};

// ─── Tag cloud ─────────────────────────────────────────────────────────────────

export const ContentFeelTagCloud: React.FC<{ label: string; tags: string[]; tone?: keyof typeof TONE; icon?: React.ReactNode }> = ({ label, tags, tone = 'context', icon }) => {
  if (!tags.length) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/45">{icon}{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${TONE[tone]}`}>{humanize(tag)}</span>
        ))}
      </div>
    </div>
  );
};

// ─── Confidence badge ───────────────────────────────────────────────────────────

export const ContentFeelConfidenceBadge: React.FC<{ profile: ContentFeelProfile }> = ({ profile }) => {
  const { confidence_label, confidence_score } = profile.ai;
  const tone = confidence_label === 'high' || confidence_label === 'very_high'
    ? 'border-emerald-300/30 bg-emerald-500/10 text-emerald-200'
    : confidence_label === 'medium'
      ? 'border-amber-300/30 bg-amber-500/10 text-amber-200'
      : 'border-white/12 bg-white/[0.05] text-white/60';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${tone}`}>
      <Brain className="h-3 w-3" /> {humanize(confidence_label)} confidence · {Math.round(confidence_score * 100)}%
    </span>
  );
};

// ─── Prescribe Me route hints ─────────────────────────────────────────────────

export const ContentFeelRouteHints: React.FC<{ profile: ContentFeelProfile }> = ({ profile }) => {
  const hints = profile.prescribe_me.recommended_question_answers.slice(0, 4);
  if (!hints.length) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/45"><Compass className="h-3 w-3" /> Prescribe Me route hints</div>
      <div className="space-y-1.5">
        {hints.map((hint, i) => {
          const question = PRESCRIBE_ME_QUESTION_MAP[hint.question_key as PrescribeMeQuestionKey];
          const answerLabel = getAnswerLabel(hint.question_key as PrescribeMeQuestionKey, hint.answer_key);
          return (
            <div key={`${hint.question_key}-${hint.answer_key}-${i}`} className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
              <span className="min-w-0 text-[11px] text-white/70">
                May route well for users who choose <span className="font-bold text-white">“{answerLabel}”</span>
                {question ? <span className="text-white/40"> · {question.prompt}</span> : null}
              </span>
              <span className="shrink-0 rounded-full border border-cyan-300/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">{Math.round(hint.route_score * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Quiet feed placement hints ───────────────────────────────────────────────

export const ContentFeelQuietHints: React.FC<{ profile: ContentFeelProfile }> = ({ profile }) => {
  const contexts = Array.from(new Set([...profile.quiet.feed_boost_contexts, ...profile.prescribe_me.prescription_contexts])).slice(0, 6);
  if (!contexts.length) return null;
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/45"><Radar className="h-3 w-3" /> Quiet feed placement hints</div>
      <div className="flex flex-wrap gap-1.5">
        {contexts.map((ctx) => (
          <span key={ctx} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/65">{humanize(ctx)}</span>
        ))}
      </div>
    </div>
  );
};

// ─── Safety / rights review flags ──────────────────────────────────────────────

export const ContentFeelReviewFlags: React.FC<{ profile: ContentFeelProfile }> = ({ profile }) => {
  const { safety_review_needed, rights_review_needed } = profile.quiet;
  if (!safety_review_needed && !rights_review_needed) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {rights_review_needed && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-200">
          <ShieldQuestion className="h-3.5 w-3.5" /> Rights review suggested
        </span>
      )}
      {safety_review_needed && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300/30 bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-200">
          <AlertTriangle className="h-3.5 w-3.5" /> Safety review suggested
        </span>
      )}
    </div>
  );
};

// ─── Creator summary ───────────────────────────────────────────────────────────

export const ContentFeelCreatorSummary: React.FC<{ profile: ContentFeelProfile }> = ({ profile }) => (
  <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3">
    <p className="text-sm leading-relaxed text-white/75">{profile.summary}</p>
    <p className="mt-1.5 text-[11px] leading-relaxed text-cyan-200/70">{safeRecommendationReason(undefined, 'current_route')}</p>
  </div>
);

// ─── Analysis (re)run button ─────────────────────────────────────────────────

export const ContentFeelAnalysisButton: React.FC<{ status: ContentFeelStatus; onRun: () => void }> = ({ status, onRun }) => (
  <button
    onClick={onRun}
    disabled={status === 'analyzing'}
    className="inline-flex items-center gap-1.5 rounded-full border border-fuchsia-300/30 bg-fuchsia-500/10 px-3 py-1.5 text-[11px] font-bold text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:opacity-50"
  >
    {status === 'analyzing' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
    {status === 'analyzing' ? 'Analyzing…' : 'Re-run Content Feel'}
  </button>
);

const STATUS_COPY: Record<ContentFeelStatus, string> = {
  idle: 'Analysis pending',
  analyzing: 'Analyzing content feel…',
  complete: 'Content feel ready',
  needs_review: 'Ready · review suggested',
};

// ─── Full analysis panel ─────────────────────────────────────────────────────

export const ContentFeelAnalysisPanel: React.FC<{
  profile: ContentFeelProfile | null;
  status: ContentFeelStatus;
  onRun?: () => void;
  compact?: boolean;
}> = ({ profile, status, onRun, compact = false }) => (
  <GlassCard glow className="p-4 sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <Sparkles className="h-4 w-4 text-fuchsia-300" /> Content Feel
          <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-200">AI preview · mock</span>
        </div>
        <div className="mt-0.5 text-[11px] text-white/45">{STATUS_COPY[status]}</div>
      </div>
      {profile && <ContentFeelConfidenceBadge profile={profile} />}
    </div>

    {status === 'analyzing' && !profile && (
      <div className="mt-4 flex items-center gap-2 text-sm text-white/50"><Loader2 className="h-4 w-4 animate-spin" /> Reading the feel of your content…</div>
    )}

    {profile && (
      <div className="mt-4 space-y-4">
        <ContentFeelCreatorSummary profile={profile} />
        <div className="grid gap-4 sm:grid-cols-2">
          <ContentFeelTagCloud label="Mood tags" tags={profile.mood_tags} tone="mood" icon={<Tag className="h-3 w-3" />} />
          <ContentFeelTagCloud label="Energy tags" tags={profile.energy_tags} tone="energy" icon={<Waves className="h-3 w-3" />} />
        </div>
        <ContentFeelTagCloud label="Behavioral need tags" tags={profile.behavioral_need_tags} tone="need" icon={<Brain className="h-3 w-3" />} />
        {!compact && <ContentFeelRouteHints profile={profile} />}
        {!compact && <ContentFeelQuietHints profile={profile} />}
        <ContentFeelReviewFlags profile={profile} />
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-3">
          <p className="max-w-md text-[10px] leading-relaxed text-white/35">{PRESCRIBE_ME_PRIVACY_NOTICE}</p>
          {onRun && <ContentFeelAnalysisButton status={status} onRun={onRun} />}
        </div>
      </div>
    )}
  </GlassCard>
);

// ─── Compact mini card (for tight contexts) ────────────────────────────────────

export const ContentFeelMiniCard: React.FC<{ profile: ContentFeelProfile }> = ({ profile }) => (
  <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-white/55"><Sparkles className="h-3 w-3 text-fuchsia-300" /> Content Feel</div>
      <ContentFeelConfidenceBadge profile={profile} />
    </div>
    <div className="mt-2 flex flex-wrap gap-1.5">
      {[...profile.mood_tags.slice(0, 3), ...profile.energy_tags.slice(0, 2)].map((tag) => (
        <span key={tag} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/65">{humanize(tag)}</span>
      ))}
    </div>
  </div>
);
