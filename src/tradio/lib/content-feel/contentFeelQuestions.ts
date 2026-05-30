/**
 * TREY TV UNIVERSE — Prescribe Me structured question flow (Phase 1).
 *
 * Prescribe Me is NOT a "recommended for you" carousel. It asks structured
 * questions, then routes the user to the best content/creator/experience. These
 * stable question + answer keys are the join between the guided flow and the
 * Content Feel Profile's `prescribe_me.recommended_question_answers`.
 *
 * Keep keys STABLE — they are persisted in route indexes and analytics.
 */

export const PRESCRIBE_ME_DAILY_LIMIT = 2;

export type PrescribeMeQuestionKey =
  | 'current_need'
  | 'current_energy'
  | 'desired_shift'
  | 'familiarity'
  | 'content_type_preference'
  | 'role_context'
  | 'platform_lane'
  | 'intensity_preference'
  | 'time_available'
  | 'social_preference';

export interface PrescribeMeAnswer {
  key: string;
  label: string;
  /** Short, non-clinical helper copy. */
  hint?: string;
}

export interface PrescribeMeQuestion {
  key: PrescribeMeQuestionKey;
  prompt: string;
  /** Whether more than one answer can be selected. */
  multi?: boolean;
  /** Whether this question is part of the short (core) flow. */
  core?: boolean;
  answers: PrescribeMeAnswer[];
}

const a = (key: string, label: string, hint?: string): PrescribeMeAnswer => ({ key, label, hint });

export const PRESCRIBE_ME_QUESTIONS: PrescribeMeQuestion[] = [
  {
    key: 'current_need',
    prompt: 'What do you need right now?',
    core: true,
    answers: [
      a('feel_understood', 'Feel understood'),
      a('turn_up', 'Turn up'),
      a('calm_down', 'Calm down'),
      a('focus', 'Focus'),
      a('discover', 'Discover something'),
      a('motivation', 'Motivation'),
      a('process_something', 'Process something'),
      a('creative_inspiration', 'Creative inspiration'),
      a('background_energy', 'Background energy'),
      a('community_energy', 'Community energy'),
    ],
  },
  {
    key: 'current_energy',
    prompt: 'What is your current energy?',
    core: true,
    answers: [
      a('heavy', 'Heavy'),
      a('restless', 'Restless'),
      a('inspired', 'Inspired'),
      a('numb', 'Numb'),
      a('excited', 'Excited'),
      a('reflective', 'Reflective'),
      a('confident', 'Confident'),
      a('lonely', 'Wanting connection'),
      a('focused', 'Focused'),
      a('social', 'Social'),
    ],
  },
  {
    key: 'desired_shift',
    prompt: 'What do you want it to do for you?',
    core: true,
    answers: [
      a('match_my_mood', 'Match my mood'),
      a('change_my_mood', 'Change my mood'),
      a('challenge_me', 'Challenge me'),
      a('comfort_me', 'Comfort me'),
      a('hype_me_up', 'Hype me up'),
      a('help_me_create', 'Help me create'),
      a('help_me_decide', 'Help me decide'),
      a('help_me_find_my_people', 'Help me find my people'),
    ],
  },
  {
    key: 'familiarity',
    prompt: 'How familiar should it feel?',
    answers: [
      a('familiar', 'Familiar'),
      a('balanced', 'Balanced'),
      a('surprise_me', 'Surprise me'),
      a('underground', 'Underground'),
      a('trending', 'Trending'),
    ],
  },
  {
    key: 'content_type_preference',
    prompt: 'What kind of content?',
    multi: true,
    answers: [
      a('video', 'Video'),
      a('song', 'Song'),
      a('station', 'Station'),
      a('live_show', 'Live show'),
      a('dj_mix', 'DJ mix'),
      a('beat', 'Beat'),
      a('story', 'Story'),
      a('game', 'Game'),
      a('gif', 'GIF / reaction'),
      a('room', 'Room'),
      a('battle', 'Battle'),
      a('episode', 'Episode'),
      a('creator', 'Creator'),
    ],
  },
  {
    key: 'role_context',
    prompt: 'You are looking as a…',
    answers: [
      a('fan', 'Fan / listener'),
      a('artist', 'Artist'),
      a('producer', 'Producer'),
      a('dj', 'DJ / host'),
      a('creator', 'Creator'),
      a('storyteller', 'Storyteller'),
      a('gamer', 'Gamer'),
      a('viewer', 'Viewer'),
    ],
  },
  {
    key: 'platform_lane',
    prompt: 'Which lane of the universe?',
    answers: [
      a('trey_tv', 'Trey TV'),
      a('tradio', 'Tradio'),
      a('fwd', 'FWD'),
      a('storybook', 'Storybook'),
      a('games', 'Games'),
      a('trance', 'Trance'),
      a('any', 'Any'),
    ],
  },
  {
    key: 'intensity_preference',
    prompt: 'How intense?',
    answers: [
      a('gentle', 'Gentle'),
      a('balanced', 'Balanced'),
      a('intense', 'Intense'),
    ],
  },
  {
    key: 'time_available',
    prompt: 'How much time do you have?',
    answers: [
      a('quick', 'A few minutes'),
      a('medium', 'A little while'),
      a('long', 'Settling in'),
    ],
  },
  {
    key: 'social_preference',
    prompt: 'Solo or social?',
    answers: [
      a('solo', 'Just me'),
      a('shared', 'With others'),
      a('community', 'Community / live'),
    ],
  },
];

export const PRESCRIBE_ME_QUESTION_MAP: Record<PrescribeMeQuestionKey, PrescribeMeQuestion> =
  PRESCRIBE_ME_QUESTIONS.reduce((acc, q) => {
    acc[q.key] = q;
    return acc;
  }, {} as Record<PrescribeMeQuestionKey, PrescribeMeQuestion>);

export const isValidAnswer = (questionKey: PrescribeMeQuestionKey, answerKey: string): boolean =>
  Boolean(PRESCRIBE_ME_QUESTION_MAP[questionKey]?.answers.some((ans) => ans.key === answerKey));

export const getAnswerLabel = (questionKey: PrescribeMeQuestionKey, answerKey: string): string =>
  PRESCRIBE_ME_QUESTION_MAP[questionKey]?.answers.find((ans) => ans.key === answerKey)?.label ?? answerKey;
