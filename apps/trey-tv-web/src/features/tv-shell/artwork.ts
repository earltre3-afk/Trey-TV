import type { CSSProperties } from 'react';

export type ArtworkCandidate = {
  title?: string;
  label?: string;
  backdropUrl?: string;
  posterUrl?: string;
  thumbnailUrl?: string;
  image?: string;
};

export const TV_ARTWORK = {
  kingmakerHero: '/tv-artwork/kingmaker-the-change-hero-4k.jpg',
  lifeOfCreatorCard: '/tv-artwork/life-of-a-creator-card-4k.jpg',
  afterHoursCard: '/tv-artwork/after-hours-card-4k.jpg',
  lateNightGamingGuide: '/tv-artwork/late-night-gaming-guide-4k.jpg',
  spadesGameCard: '/tv-artwork/spades-game-card-4k.jpg',
  profileCreatorLifestyle: '/tv-artwork/profile-creator-lifestyle-4k.jpg',
} as const;

const unsafeArtworkMarkers = [
  'watch-hours',
  'watch_history',
  'watch-history',
  'manage-profile',
  'old-dashboard',
  'dashboard',
  'concept',
  'mockup',
  'mock-ui',
  'ui-screenshot',
  'screenshot',
  'streamingbox-concept',
  'generated-concept-art',
  'watch-hours',
  'manage-profile',
  'watch-history',
  '1779633005531_44794775',
  '1779633006285_7bc84eb2',
  '1779633007094_15ae4417',
  '1779633009257_cbaff075',
  '1779633011666_0f1b1757',
  '1779633013562_de3cc1a7',
  '1779633015073_e0863541',
  '1779633016331_aa400794',
];

export function isUnsafeHeroArtwork(urlOrLabel?: string | null) {
  if (!urlOrLabel) return true;
  const normalized = decodeURIComponent(urlOrLabel).toLowerCase().replace(/\s+/g, '-');
  return unsafeArtworkMarkers.some((marker) => normalized.includes(marker));
}

function normalizeTitle(title?: string | null) {
  return title?.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim() ?? '';
}

export function selectCardArtwork(content: ArtworkCandidate) {
  const title = normalizeTitle(content.title || content.label);

  if (title === 'kingmaker the change' || title.includes('kingmaker')) {
    return TV_ARTWORK.kingmakerHero;
  }

  if (title === 'life of a creator') {
    return TV_ARTWORK.lifeOfCreatorCard;
  }

  if (title === 'after hours' || title.includes('after hours w trizzy')) {
    return TV_ARTWORK.afterHoursCard;
  }

  if (title === 'late night gaming') {
    return TV_ARTWORK.lateNightGamingGuide;
  }

  if (title === 'spades') {
    return TV_ARTWORK.spadesGameCard;
  }

  const candidates = [
    content.backdropUrl,
    content.posterUrl,
    content.thumbnailUrl,
    content.image,
  ];

  return candidates.find((candidate) => candidate && !isUnsafeHeroArtwork(candidate)) ?? null;
}

export function selectHeroArtwork(content: ArtworkCandidate) {
  const designatedArtwork = selectCardArtwork(content);
  if (designatedArtwork) return designatedArtwork;

  const candidates = [
    content.backdropUrl,
    content.posterUrl,
    content.thumbnailUrl,
    content.image,
  ];

  return candidates.find((candidate) => candidate && !isUnsafeHeroArtwork(candidate)) ?? null;
}

export function getHeroFallbackStyle(title?: string): CSSProperties {
  const normalizedTitle = title?.toLowerCase() ?? '';
  if (normalizedTitle.includes('kingmaker')) {
    return {
      backgroundColor: '#050408',
      backgroundImage: [
        'radial-gradient(circle at 72% 20%, rgba(248, 200, 75, 0.26), transparent 24%)',
        'radial-gradient(circle at 50% 120%, rgba(168, 85, 247, 0.18), transparent 38%)',
        'linear-gradient(115deg, rgba(3, 3, 8, 0.98), rgba(18, 11, 18, 0.92) 46%, rgba(78, 50, 10, 0.76))',
        'repeating-linear-gradient(90deg, transparent 0 56px, rgba(248, 200, 75, 0.055) 57px 58px)',
      ].join(', '),
    };
  }

  return {
    backgroundColor: '#05050a',
    backgroundImage: [
      'radial-gradient(circle at 72% 18%, rgba(248, 200, 75, 0.2), transparent 26%)',
      'radial-gradient(circle at 24% 80%, rgba(255, 43, 214, 0.18), transparent 32%)',
      'linear-gradient(120deg, rgba(3, 3, 8, 0.98), rgba(16, 12, 28, 0.96) 55%, rgba(10, 10, 18, 0.9))',
    ].join(', '),
  };
}
