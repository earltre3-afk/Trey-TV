import { useEffect, useMemo, useState } from 'react';
import { analyzeContentFeelMock } from '@/tradio/lib/content-feel/contentFeelMockAnalysis';
import { scanResultToProfile } from '@/tradio/lib/content-feel/contentFeelService';
import type {
  ContentFeelProfile,
  ContentFeelScanInput,
  ContentFeelScanResult,
  ContentType,
  SourcePlatform,
} from '@/tradio/lib/content-feel/contentFeelTypes';

/**
 * TREY TV UNIVERSE — Content Feel Pass 2 mock-analysis hook (frontend-only).
 *
 * Runs the deterministic Phase 1 mock analyzer over draft upload metadata and
 * returns a Content Feel Profile + a friendly status. NEVER persists, NEVER calls
 * real AI, and NEVER blocks form submission — purely a creator-facing preview.
 */

export type ContentFeelStatus = 'idle' | 'analyzing' | 'complete' | 'needs_review';

export interface ContentFeelDraft {
  contentId: string;
  contentType: ContentType;
  sourcePlatform: SourcePlatform;
  title: string;
  description?: string;
  creatorTags?: string[];
  explicit?: boolean;
  hints?: Record<string, unknown>;
  creatorUserId?: string | null;
  creatorProfileId?: string | null;
  publicProfileUid?: string | null;
}

/** Builds a full scan input from a lightweight draft. */
export const draftToScanInput = (draft: ContentFeelDraft): ContentFeelScanInput => {
  const description = [draft.description, draft.explicit ? 'Contains explicit content.' : '']
    .filter(Boolean)
    .join(' ');
  return {
    content_id: draft.contentId,
    content_type: draft.contentType,
    source_platform: draft.sourcePlatform,
    title: draft.title,
    description: description || undefined,
    creator_tags: draft.creatorTags,
    creator_user_id: draft.creatorUserId ?? null,
    creator_profile_id: draft.creatorProfileId ?? null,
    public_profile_uid: draft.publicProfileUid ?? null,
    hints: draft.hints,
  };
};

/** Pure helper: run the mock analysis for a draft (no React). */
export const runMockContentFeelAnalysis = (draft: ContentFeelDraft): { result: ContentFeelScanResult; profile: ContentFeelProfile } => {
  const input = draftToScanInput(draft);
  const result = analyzeContentFeelMock(input);
  const profile = scanResultToProfile(input, result);
  return { result, profile };
};

/** One-shot preview helper for non-hook contexts. */
export const getContentFeelPreviewForDraft = (draft: ContentFeelDraft): ContentFeelProfile =>
  runMockContentFeelAnalysis(draft).profile;

export interface UseContentFeelAnalysisResult {
  status: ContentFeelStatus;
  profile: ContentFeelProfile | null;
  result: ContentFeelScanResult | null;
  /** Manually (re)trigger the brief analyzing animation. */
  run: () => void;
}

/**
 * Auto-analyzes a draft (deterministically) whenever its key fields change,
 * with a brief simulated "analyzing" status for UX. `auto: false` requires an
 * explicit `run()` call.
 */
export const useContentFeelAnalysis = (
  draft: ContentFeelDraft,
  options: { auto?: boolean } = {},
): UseContentFeelAnalysisResult => {
  const { auto = true } = options;
  const [status, setStatus] = useState<ContentFeelStatus>(auto ? 'analyzing' : 'idle');
  const [runToken, setRunToken] = useState(0);

  // Deterministic — safe to compute on every relevant change.
  const { result, profile } = useMemo(
    () => runMockContentFeelAnalysis(draft),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draft.contentId, draft.contentType, draft.sourcePlatform, draft.title, draft.description, draft.explicit, JSON.stringify(draft.creatorTags), JSON.stringify(draft.hints), runToken],
  );

  const shouldAnalyze = auto || runToken > 0;

  useEffect(() => {
    if (!shouldAnalyze) {
      setStatus('idle');
      return;
    }
    setStatus('analyzing');
    const timer = setTimeout(() => {
      setStatus(profile.ai.needs_human_review ? 'needs_review' : 'complete');
    }, 480);
    return () => clearTimeout(timer);
  }, [shouldAnalyze, profile, runToken]);

  return {
    status,
    profile: shouldAnalyze ? profile : null,
    result: shouldAnalyze ? result : null,
    run: () => setRunToken((token) => token + 1),
  };
};
