// PrescribeMe service ported from Tradio pass12
// Handles daily usage limits, prescription execution, and refinement.
// localStorage-based — no server/Supabase dependencies.

export type TradioMode = 'listener' | 'fan' | 'artist' | 'producer' | 'dj' | 'admin' | 'owner';

export interface PrescribeMeQuestion {
  id: string;
  category: 'currentNeed' | 'emotionalState' | 'desiredShift' | 'familiarity' | 'contentType';
  text: string;
  options: { label: string; value: string }[];
}

export interface UserAnswers {
  currentNeed: string;
  emotionalState: string;
  desiredShift: string;
  familiarity: string;
  contentType: string;
}

export interface Prescription {
  id: string;
  title: string;
  routeType: string;
  destination: string;
  description: string;
  reason: string;
  confidenceLabel: string;
  primaryCtaLabel: string;
  ctaType: 'start_radio' | 'navigate_screen' | 'open_forge' | 'action_alert';
  timestamp: number;
}

export interface RefinementOption {
  id: string;
  label: string;
  description: string;
}

export interface DailyUsageState {
  prescriptionsLeftToday: number;
  lastPrescription: Prescription | null;
  savedPrescriptions: string[];
}

// ── Questions ────────────────────────────────────────────────
export const PRESCRIBE_ME_QUESTIONS: PrescribeMeQuestion[] = [
  {
    id: 'currentNeed',
    category: 'currentNeed',
    text: 'What do you need right now?',
    options: [
      { label: 'I need to feel understood', value: 'feel_understood' },
      { label: 'I need to turn up', value: 'turn_up' },
      { label: 'I need to calm down', value: 'calm_down' },
      { label: 'I need to focus', value: 'focus' },
      { label: 'I need to discover something new', value: 'discover_new' },
      { label: 'I need motivation', value: 'motivation' },
      { label: 'I need to process something', value: 'process' },
      { label: 'I need creative inspiration', value: 'creative_inspiration' },
      { label: 'I need background energy', value: 'background_energy' },
      { label: 'I need community / live energy', value: 'live_energy' },
    ],
  },
  {
    id: 'emotionalState',
    category: 'emotionalState',
    text: "What's your current energy?",
    options: [
      { label: 'Heavy', value: 'heavy' },
      { label: 'Restless', value: 'restless' },
      { label: 'Inspired', value: 'inspired' },
      { label: 'Numb', value: 'numb' },
      { label: 'Excited', value: 'excited' },
      { label: 'Reflective', value: 'reflective' },
      { label: 'Confident', value: 'confident' },
      { label: 'Lonely', value: 'lonely' },
      { label: 'Focused', value: 'focused' },
      { label: 'Social', value: 'social' },
    ],
  },
  {
    id: 'desiredShift',
    category: 'desiredShift',
    text: 'What do you want the content to do for you?',
    options: [
      { label: 'Match my mood', value: 'match_mood' },
      { label: 'Change my mood', value: 'change_mood' },
      { label: 'Challenge me', value: 'challenge_me' },
      { label: 'Comfort me', value: 'comfort_me' },
      { label: 'Hype me up', value: 'hype_up' },
      { label: 'Help me create', value: 'help_create' },
      { label: 'Help me decide what to play', value: 'help_decide' },
      { label: 'Help me find my people', value: 'find_people' },
    ],
  },
  {
    id: 'familiarity',
    category: 'familiarity',
    text: 'Do you want familiar energy or discovery?',
    options: [
      { label: 'Keep it familiar', value: 'familiar' },
      { label: 'Mix familiar with new', value: 'hybrid' },
      { label: 'Surprise me', value: 'surprise' },
      { label: 'Underground only', value: 'underground' },
      { label: 'Trending only', value: 'trending' },
    ],
  },
  {
    id: 'contentType',
    category: 'contentType',
    text: 'What kind of route do you want?',
    options: [
      { label: 'Song', value: 'song' },
      { label: 'Station', value: 'station' },
      { label: 'Artist station', value: 'artist_station' },
      { label: 'Live radio show', value: 'live_show' },
      { label: 'DJ mix', value: 'dj_mix' },
      { label: 'Producer beat', value: 'producer_beat' },
      { label: 'Song Wars battle', value: 'song_wars' },
      { label: 'Playlist', value: 'playlist' },
      { label: 'Community room', value: 'community' },
      { label: 'Broadcast idea', value: 'broadcast_idea' },
    ],
  },
];

export const REFINEMENT_OPTIONS: RefinementOption[] = [
  { id: 'calmer', label: 'Make it calmer', description: 'Lower the energy levels' },
  { id: 'harder', label: 'Make it harder', description: 'Raise the energy levels' },
  { id: 'familiar', label: 'Make it more familiar', description: 'Tune closer to your current saves' },
  { id: 'surprising', label: 'Make it more surprising', description: 'Infuse high discovery and underground cuts' },
  { id: 'live_only', label: 'Include live content', description: 'Prioritize live streams and interactive slots' },
  { id: 'producer_dj', label: 'Include producer/DJ content', description: 'Incorporate exclusive beat packs' },
];

// ── Prescription generator ───────────────────────────────────
const ROUTE_MAP: Record<string, { title: string; routeType: string; destination: string; description: string; ctaLabel: string; ctaType: Prescription['ctaType'] }> = {
  feel_understood: { title: 'Soul Therapy Session', routeType: 'Station', destination: 'live', description: 'A curated listening session that mirrors your inner state.', ctaLabel: 'Start Listening', ctaType: 'start_radio' },
  turn_up: { title: 'Gold Confidence', routeType: 'Station', destination: 'live', description: 'Pressure released. Walk in like you own the room.', ctaLabel: 'Turn Up', ctaType: 'start_radio' },
  calm_down: { title: 'After Hours Therapy', routeType: 'Playlist', destination: 'playlist', description: 'Slow it all the way down. Late-night and easy.', ctaLabel: 'Play Now', ctaType: 'start_radio' },
  focus: { title: 'Trizzy Focus', routeType: 'Station', destination: 'live', description: 'Locked in. Studio energy with zero distractions.', ctaLabel: 'Lock In', ctaType: 'start_radio' },
  discover_new: { title: 'Discovery Radio', routeType: 'Station', destination: 'browse', description: 'Fresh sounds from the underground and trending charts.', ctaLabel: 'Explore', ctaType: 'navigate_screen' },
  motivation: { title: 'Pressure Release', routeType: 'Playlist', destination: 'playlist', description: 'Fuel for the come up. Every track hits different.', ctaLabel: 'Get Motivated', ctaType: 'start_radio' },
  process: { title: 'Midnight Recovery', routeType: 'Station', destination: 'live', description: 'Soft sounds to put you back together after hours.', ctaLabel: 'Begin Recovery', ctaType: 'start_radio' },
  creative_inspiration: { title: 'Producer Forge', routeType: 'Show Flow', destination: 'showbuilder', description: 'Beat spotlights, stem packs, and creative energy.', ctaLabel: 'Open Forge', ctaType: 'open_forge' },
  background_energy: { title: 'Ambient Flow', routeType: 'Station', destination: 'live', description: 'Energy that fills the room without demanding attention.', ctaLabel: 'Start Flow', ctaType: 'start_radio' },
  live_energy: { title: 'Community Sessions', routeType: 'Live Room', destination: 'community', description: 'Join friends in the live room. Real-time vibes.', ctaLabel: 'Join Room', ctaType: 'navigate_screen' },
};

export function generatePrescription(answers: UserAnswers): Prescription {
  const route = ROUTE_MAP[answers.currentNeed] || ROUTE_MAP.feel_understood;
  const confidence = 70 + Math.floor(Math.random() * 25);
  return {
    id: `rx_${Date.now()}`,
    title: route.title,
    routeType: route.routeType,
    destination: route.destination,
    description: route.description,
    reason: `Based on your ${answers.emotionalState} energy and desire to ${answers.desiredShift.replace('_', ' ')}.`,
    confidenceLabel: `${confidence}% MATCH`,
    primaryCtaLabel: route.ctaLabel,
    ctaType: route.ctaType,
    timestamp: Date.now(),
  };
}

// ── Daily usage tracking ─────────────────────────────────────
const DAILY_LIMIT_KEY = 'tradio_rx_limit';
const DATE_KEY = 'tradio_rx_date';
const LAST_RX_KEY = 'tradio_rx_last';

export function getDailyUsageState(): DailyUsageState {
  const todayStr = new Date().toLocaleDateString();
  let leftCount = 2;
  let lastRx: Prescription | null = null;

  try {
    const storedDate = localStorage.getItem(DATE_KEY) || '';
    const storedCount = localStorage.getItem(DAILY_LIMIT_KEY);
    if (storedCount !== null) leftCount = parseInt(storedCount, 10);
    const storedLast = localStorage.getItem(LAST_RX_KEY);
    if (storedLast) lastRx = JSON.parse(storedLast);
    if (storedDate !== todayStr) {
      leftCount = 2;
      localStorage.setItem(DATE_KEY, todayStr);
      localStorage.setItem(DAILY_LIMIT_KEY, '2');
    }
  } catch { /* ignore */ }

  return { prescriptionsLeftToday: leftCount, lastPrescription: lastRx, savedPrescriptions: [] };
}

export function executeNewPrescription(answers: UserAnswers): { success: boolean; prescription: Prescription | null; leftCount: number } {
  const state = getDailyUsageState();
  if (state.prescriptionsLeftToday <= 0) return { success: false, prescription: null, leftCount: 0 };
  const prescription = generatePrescription(answers);
  const newLeftCount = state.prescriptionsLeftToday - 1;
  try {
    localStorage.setItem(DAILY_LIMIT_KEY, String(newLeftCount));
    localStorage.setItem(LAST_RX_KEY, JSON.stringify(prescription));
    localStorage.setItem(DATE_KEY, new Date().toLocaleDateString());
  } catch { /* ignore */ }
  return { success: true, prescription, leftCount: newLeftCount };
}

export function resetDailyLimit(): void {
  try {
    localStorage.setItem(DAILY_LIMIT_KEY, '2');
    localStorage.removeItem(LAST_RX_KEY);
  } catch { /* ignore */ }
}
