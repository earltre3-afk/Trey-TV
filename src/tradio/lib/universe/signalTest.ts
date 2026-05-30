/**
 * TREY TV UNIVERSE — Signal Test (Natural Ability) metadata + discoverability.
 *
 * The Signal Test is a Trey TV (parent) feature. This module gives the Tradio
 * world a shared, type-safe reference so Trey-I, badges, and discoverability
 * cards stay consistent. The test is OPTIONAL before taking it; once completed
 * the result is PERMANENT — there are no retakes.
 */

export type NaturalAbility =
  | 'Diviner' | 'Reaper' | 'Empath' | 'Charmer' | 'Alchemist' | 'Herbalist'
  | 'Seer' | 'Shapeshifter' | 'Healer' | 'Dreamer' | 'Prophet' | 'Manifestor'
  | 'Creative' | 'Ungifted';

export const NATURAL_ABILITIES: NaturalAbility[] = [
  'Diviner', 'Reaper', 'Empath', 'Charmer', 'Alchemist', 'Herbalist',
  'Seer', 'Shapeshifter', 'Healer', 'Dreamer', 'Prophet', 'Manifestor',
  'Creative', 'Ungifted',
];

export type SignalTestStatus = 'not_taken' | 'in_progress' | 'completed';

export interface SignalTestState {
  status: SignalTestStatus;
  /** Permanent once set. */
  result?: NaturalAbility;
  completed_at?: string;
}

/** The test is permanent once completed — never offer a retake. */
export const canTakeSignalTest = (state: SignalTestState): boolean => state.status !== 'completed';

/** Where existing (not just new) users should be able to find the Signal Test. */
export const SIGNAL_TEST_ENTRY_POINTS = [
  { id: 'profile_module', label: 'Profile page module/card', surface: 'trey_tv' as const },
  { id: 'settings_identity', label: 'Settings → Identity section', surface: 'trey_tv' as const },
  { id: 'trey_i_suggestion', label: 'Trey-I suggestion / action', surface: 'trey_tv' as const },
  { id: 'onboarding_prompt', label: 'Onboarding completion prompt (optional)', surface: 'trey_tv' as const },
  { id: 'badges_identity', label: 'Badges / Identity area', surface: 'trey_tv' as const },
];

export const SIGNAL_TEST_COPY = {
  title: 'Signal Test',
  subtitle: 'Discover your Natural Ability',
  optional: 'Optional — take it whenever you’re ready.',
  permanent: 'Your result is permanent once completed. No retakes.',
  cta: 'Take the Signal Test',
  completedCta: 'View your Natural Ability',
  route: '/signal-test',
} as const;

export const describeAbility = (ability: NaturalAbility): string => {
  const map: Partial<Record<NaturalAbility, string>> = {
    Diviner: 'Reads patterns and senses what’s coming.',
    Reaper: 'Cuts through noise and closes loops.',
    Empath: 'Feels the room and connects deeply.',
    Charmer: 'Moves people with presence.',
    Alchemist: 'Transforms raw ideas into gold.',
    Herbalist: 'Heals and grounds through natural rhythm.',
    Seer: 'Sees beyond the surface.',
    Shapeshifter: 'Adapts to any lane effortlessly.',
    Healer: 'Restores and uplifts others.',
    Dreamer: 'Imagines worlds others can’t.',
    Prophet: 'Speaks truth that lands ahead of its time.',
    Manifestor: 'Wills things into existence.',
    Creative: 'Builds and expresses without limits.',
    Ungifted: 'A grounded baseline — every gift starts somewhere.',
  };
  return map[ability] ?? '';
};
