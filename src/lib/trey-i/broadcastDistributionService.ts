import type { DistributionDraftStatus, DistributionDraftType, DistributionPlatform } from './broadcastDistributionTypes';

export const DISTRIBUTION_PLATFORMS: DistributionPlatform[] = [
  'tiktok',
  'instagram',
  'youtube',
  'facebook',
  'x',
  'newsletter',
  'push',
  'website',
  'generic',
];

export const DISTRIBUTION_DRAFT_TYPES: DistributionDraftType[] = [
  'tiktok_caption',
  'instagram_caption',
  'instagram_story',
  'youtube_description',
  'youtube_shorts_caption',
  'facebook_post',
  'x_post',
  'newsletter_blurb',
  'push_notification',
  'website_promo',
  'generic_social',
  'creator_note',
];

export function formatDistributionLabel(value: string): string {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function distributionStatusTone(status: DistributionDraftStatus): string {
  if (status === 'approved') return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100';
  if (status === 'ready') return 'border-cyan-400/40 bg-cyan-400/10 text-cyan-100';
  if (status === 'pending_review') return 'border-amber-400/40 bg-amber-400/10 text-amber-100';
  if (status === 'rejected') return 'border-red-400/40 bg-red-400/10 text-red-100';
  if (status === 'archived') return 'border-slate-400/30 bg-slate-400/10 text-slate-200';
  if (status === 'used') return 'border-violet-400/40 bg-violet-400/10 text-violet-100';
  return 'border-white/15 bg-white/[0.04] text-white/70';
}

export function draftTypeForPlatform(platform: DistributionPlatform): DistributionDraftType {
  if (platform === 'tiktok') return 'tiktok_caption';
  if (platform === 'instagram') return 'instagram_caption';
  if (platform === 'youtube') return 'youtube_description';
  if (platform === 'facebook') return 'facebook_post';
  if (platform === 'x') return 'x_post';
  if (platform === 'newsletter') return 'newsletter_blurb';
  if (platform === 'push') return 'push_notification';
  if (platform === 'website') return 'website_promo';
  return 'generic_social';
}
