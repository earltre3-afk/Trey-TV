import { PRESCRIBE_ME_QUESTION_MAP } from '@/tradio/lib/content-feel/contentFeelQuestions';
import { analyzeContentFeelMock, MOCK_SCAN_SAMPLES } from '@/tradio/lib/content-feel/contentFeelMockAnalysis';
import { scanResultToProfile } from '@/tradio/lib/content-feel/contentFeelService';
import { safeRecommendationReason } from '@/tradio/lib/content-feel/contentFeelPrivacyRules';
import { IMG, ALL_STATIONS, ARTIST_STATIONS, BEATS, DJ_MIXES, RADIO_SHOWS, TRACKS } from '@/tradio/components/tradio/data';
import type { ContentFeelScanInput } from '@/tradio/lib/content-feel/contentFeelTypes';
import type {
  PrescribeMeAnswer,
  PrescribeMeQuestion,
  PrescribeMeRouteDestination,
  PrescribeMeRouteResult,
  QuietRouteSuggestion,
  RouteMePlatformLane,
  RouteMeUniverseSurface,
} from './routeMeTypes';

export const ROUTE_ME_DAILY_LIMIT = 2;

export const ROUTE_ME_STORAGE_KEY = 'trey-tv-route-me-prescribe-me-v1';

export const ROUTE_ME_USER_ID = 'local-trey-tv-universe-user';

const questionKeys = ['current_need', 'current_energy', 'desired_shift', 'platform_lane', 'content_type_preference'] as const;

export const ROUTE_ME_QUESTIONS: PrescribeMeQuestion[] = questionKeys.map((key) => ({
  key,
  prompt:
    key === 'current_energy'
      ? "What's your current energy?"
      : key === 'desired_shift'
        ? 'What do you want the content to do for you?'
        : key === 'platform_lane'
          ? 'Where do you want to be routed?'
          : key === 'content_type_preference'
            ? 'What kind of experience do you want?'
            : PRESCRIBE_ME_QUESTION_MAP[key].prompt,
  answers: PRESCRIBE_ME_QUESTION_MAP[key].answers.map((answer) => ({
    ...answer,
    label: key === 'platform_lane' && answer.key === 'trance' ? 'Future Trance' : answer.label,
  })),
}));

export const ROUTE_ME_SURFACES: RouteMeUniverseSurface[] = [
  { id: 'trey_tv', label: 'Trey TV', eyebrow: 'Video, rooms, creators', summary: 'Creator episodes, rooms, story arcs, and universe video moments.', accent: 'from-fuchsia-400 to-rose-400', examples: ['Creator room', 'Episode', 'Live drop'] },
  { id: 'tradio', label: 'Tradio', eyebrow: 'Music and radio', summary: 'Stations, tracks, Song Wars, DJ mixes, beats, and hosted shows.', accent: 'from-purple-400 to-cyan-300', examples: ['Station', 'Beat', 'Battle'] },
  { id: 'fwd', label: 'FWD', eyebrow: 'GIFs and reactions', summary: 'Reaction packs for the energy of the conversation.', accent: 'from-cyan-300 to-emerald-300', examples: ['GIF pack', 'Meme set', 'Reply mood'] },
  { id: 'storybook', label: 'Storybook', eyebrow: 'Interactive stories', summary: 'Branching story paths with mood, choice, mystery, and romance arcs.', accent: 'from-amber-300 to-fuchsia-300', examples: ['Mystery path', 'Romance arc', 'Choice scene'] },
  { id: 'games', label: 'Games', eyebrow: 'Challenges', summary: 'Quick games, social rooms, focus challenges, and competition loops.', accent: 'from-lime-300 to-cyan-300', examples: ['Quick challenge', 'Party room', 'Score run'] },
  { id: 'trance', label: 'Future Trance', eyebrow: 'Dance layer', summary: 'Placeholder lane for future dance trends, tutorials, and challenges.', accent: 'from-sky-300 to-violet-300', examples: ['Dance trend', 'Tutorial', 'Challenge'] },
];

const extraInputs: ContentFeelScanInput[] = [
  { content_id: 'route-trey-room', content_type: 'episode', source_platform: 'trey_tv', title: 'Trey TV After Hours Room', description: 'A reflective creator room about choices, comedy, and community energy.' },
  { content_id: 'route-fwd-pack', content_type: 'gif', source_platform: 'fwd', title: 'Soft Launch Reaction Pack', description: 'Funny supportive GIF reactions for group chat moments.' },
  { content_id: 'route-game-pulse', content_type: 'game', source_platform: 'games', title: 'Signal Sprint Challenge', description: 'Fast social game challenge with bouncy competitive energy.' },
  { content_id: 'route-trance-placeholder', content_type: 'dance_video', source_platform: 'trance', title: 'Neon Step Starter', description: 'Future dance trend placeholder with confident tutorial energy.' },
  { content_id: 'route-tradio-songwars', content_type: 'song_war_battle', source_platform: 'tradio', title: 'Trey Trizzy vs Kiana Lane', description: 'Live Song Wars battle with explosive crowd energy.' },
];

export const MOCK_ROUTE_PROFILES = [...MOCK_SCAN_SAMPLES, ...extraInputs].map((input) =>
  scanResultToProfile(input, analyzeContentFeelMock(input)),
);

const laneFromAnswer = (answer?: string): RouteMePlatformLane => {
  if (!answer || answer === 'any') return 'all';
  return answer === 'shared_universe' ? 'all' : (answer as RouteMePlatformLane);
};

const answerFor = (answers: PrescribeMeAnswer[], key: string) => answers.find((answer) => answer.questionKey === key);

const destinationFor = (lane: RouteMePlatformLane, preference?: string): PrescribeMeRouteDestination => {
  if (lane === 'tradio') {
    if (preference === 'beat') return 'beat';
    if (preference === 'battle') return 'song_war_battle';
    if (preference === 'dj_mix') return 'dj_mix';
    if (preference === 'live_show') return 'show';
    if (preference === 'song') return 'track';
    return 'station';
  }
  if (lane === 'fwd') return 'gif_pack';
  if (lane === 'storybook') return 'story_path';
  if (lane === 'games') return 'game_challenge';
  if (lane === 'trance') return 'dance_trend';
  if (preference === 'room') return 'room';
  if (preference === 'episode') return 'episode';
  if (preference === 'creator') return 'creator';
  return 'video';
};

const titleFor = (lane: RouteMePlatformLane, destination: PrescribeMeRouteDestination): { title: string; summary: string; imageUrl?: string } => {
  if (lane === 'tradio') {
    if (destination === 'beat') return { title: BEATS[1]?.title ?? 'Soul Connection', summary: 'A producer beat pocket for creating without leaving the music lane.', imageUrl: BEATS[1]?.artwork };
    if (destination === 'dj_mix') return { title: DJ_MIXES[0]?.title ?? 'Late Night Vibes', summary: 'A DJ mix with a clear energy arc for settling into the session.', imageUrl: DJ_MIXES[0]?.artwork };
    if (destination === 'show') return { title: RADIO_SHOWS[0]?.title ?? 'Midnight Therapy', summary: 'A hosted show route with music blocks, talk breaks, and community energy.', imageUrl: IMG.midnightVelvet };
    if (destination === 'song_war_battle') return { title: 'Trey Trizzy vs Kiana Lane', summary: 'A Song Wars battle route for competitive live energy.', imageUrl: IMG.treyTrizzy };
    if (destination === 'track') return { title: TRACKS.afterHours.title, summary: 'A direct track route for a focused listen.', imageUrl: TRACKS.afterHours.art };
    return { title: ALL_STATIONS[0]?.title ?? 'Midnight Velvet', summary: 'A Tradio station route shaped around the answers from this session.', imageUrl: ALL_STATIONS[0]?.image };
  }
  if (lane === 'fwd') return { title: 'FWD Soft Signal Pack', summary: 'A reaction pack for sending the right tone into the conversation.', imageUrl: IMG.flowers };
  if (lane === 'storybook') return { title: 'The Midnight Mansion Path', summary: 'An interactive story route with mystery, romance, and reflective choices.', imageUrl: IMG.midnightDrive };
  if (lane === 'games') return { title: 'Signal Sprint Challenge', summary: 'A quick playable challenge with social energy and a clean session loop.', imageUrl: IMG.outOfOrbit };
  if (lane === 'trance') return { title: 'Neon Step Starter', summary: 'A future Trance placeholder for dance trends and movement challenges.', imageUrl: IMG.aiSphere };
  return { title: 'Trey TV After Hours Room', summary: 'A creator room and video route for moving through the universe with intention.', imageUrl: IMG.treyTrizzy };
};

const chooseProfile = (lane: RouteMePlatformLane, answers: PrescribeMeAnswer[]) => {
  const allowedLane = lane === 'all' ? undefined : lane;
  const scored = MOCK_ROUTE_PROFILES.map((profile) => {
    let score = allowedLane && profile.source_platform === allowedLane ? 3 : lane === 'all' ? 1 : 0;
    profile.prescribe_me.recommended_question_answers.forEach((mapping) => {
      if (answers.some((answer) => answer.questionKey === mapping.question_key && answer.answerKey === mapping.answer_key)) {
        score += mapping.route_score;
      }
    });
    return { profile, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0]?.profile;
};

export const generateMockRouteResult = (answers: PrescribeMeAnswer[]): PrescribeMeRouteResult => {
  const laneAnswer = answerFor(answers, 'platform_lane');
  const selectedLane = laneFromAnswer(laneAnswer?.answerKey);
  const effectiveLane = selectedLane === 'all' ? 'trey_tv' : selectedLane;
  const preference = answerFor(answers, 'content_type_preference')?.answerKey;
  const destinationType = destinationFor(effectiveLane, preference);
  const profile = chooseProfile(effectiveLane, answers);
  const need = answerFor(answers, 'current_need');
  const energy = answerFor(answers, 'current_energy');
  const shift = answerFor(answers, 'desired_shift');
  const route = titleFor(effectiveLane, destinationType);
  const contentFeelHints = [
    ...(profile?.mood_tags.slice(0, 2) ?? []),
    ...(profile?.energy_tags.slice(0, 1) ?? []),
    ...(profile?.prescribe_me.prescription_contexts.slice(0, 1) ?? []),
  ];

  const proposedReason = `Based on what you selected in this session, this route fits the energy you chose${need ? ` and the ${need.label.toLowerCase()} need` : ''}.`;

  return {
    id: `route-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: route.title,
    platformLane: effectiveLane,
    destinationType,
    summary: route.summary,
    reason: {
      headline: safeRecommendationReason(proposedReason, 'selected_answer'),
      detail: `You asked for ${need?.label.toLowerCase() ?? 'a route'} with ${energy?.label.toLowerCase() ?? 'the selected'} energy${shift ? `, and wanted it to ${shift.label.toLowerCase()}` : ''}. This lane matches your current route without making private assumptions.`,
      matchedAnswers: answers,
      contentFeelHints,
    },
    confidence: profile?.ai.confidence_label ?? 'medium',
    primaryCta: destinationType === 'station' ? 'Start Station' : destinationType === 'song_war_battle' ? 'Enter Battle' : 'Open Route',
    secondaryCta: 'Refine Route',
    imageUrl: route.imageUrl,
    sourceProfile: profile,
    createdAt: new Date().toISOString(),
  };
};

export const QUIET_ROUTE_SUGGESTIONS: QuietRouteSuggestion[] = [
  {
    id: 'quiet-tradio-late-night',
    title: 'Midnight Velvet Station',
    lane: 'tradio',
    summary: 'A smooth station pool from the current Tradio lane.',
    feelTags: ['smooth', 'reflective', 'late_night_music'],
    reason: safeRecommendationReason('This route fits the energy of your current lane.', 'current_route'),
    cta: 'Preview',
  },
  {
    id: 'quiet-trey-room',
    title: 'After Hours Creator Room',
    lane: 'trey_tv',
    summary: 'A universe room surfaced as a quiet route, not an active prescription.',
    feelTags: ['cinematic', 'social', 'creator_discovery'],
    reason: safeRecommendationReason('This route fits broad Content Feel tags for the current lane.', 'chosen_mood'),
    cta: 'Open',
  },
  {
    id: 'quiet-fwd-reactions',
    title: 'Soft Signal Reactions',
    lane: 'fwd',
    summary: 'Reaction GIFs for lower-friction conversation energy.',
    feelTags: ['funny', 'supportive', 'fwd_reactions'],
    reason: safeRecommendationReason('Because this lane has matching Content Feel tags.', 'selected_answer'),
    cta: 'View Pack',
  },
];

export const TRADIO_CHILD_RELATIONSHIP_COPY =
  'Tradio is one Route Me lane here. The child Tradio Prescribe Me flow will eventually live inside the Prescription Radio bottom-nav popout, while this page remains the parent universe router.';

export const ARTIST_ROUTE_LABEL = ARTIST_STATIONS[0]?.name ?? 'Kiana Lane';
