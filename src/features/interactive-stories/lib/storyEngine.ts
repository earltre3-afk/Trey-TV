import { Branch, Meters, ChapterRecord, Choice, Ending, StateDelta, Tone } from './storyTypes';
import { CHAPTER_1, INITIAL_METERS, CHAPTER_1_CHOICES, IMAGES } from './storyData';
import { resolveInstalledStoryChoice } from './treyStoryPackage';
import { supabase } from './supabase';

const STORAGE_KEY = 'switchkicks_branches_v1';
const ENDINGS_KEY = 'switchkicks_endings_v1';

export function loadBranches(): Branch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveBranches(branches: Branch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
}

export function loadEndings(): Ending[] {
  try {
    const raw = localStorage.getItem(ENDINGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveEnding(ending: Ending) {
  const endings = loadEndings();
  endings.push(ending);
  localStorage.setItem(ENDINGS_KEY, JSON.stringify(endings));
}

export function createNewBranch(): Branch {
  const chapter1: ChapterRecord = {
    number: 1,
    title: CHAPTER_1.title,
    prose: CHAPTER_1.paragraphs.join('\n\n'),
    image: CHAPTER_1.image,
    sceneId: CHAPTER_1.sceneId,
    summary: 'Malik confesses he ingested edibles and begs Micah to switch places with him for the day. Micah agrees.',
    toneTag: undefined,
  };
  const branch: Branch = {
    id: `branch_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    storyId: 'switch_kicks',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chapters: [chapter1],
    meters: { ...INITIAL_METERS },
    flags: {
      switch_revealed_to_ari: false,
      switch_revealed_to_dante: false,
      switch_revealed_to_coach: false,
      switch_revealed_to_mom: false,
      malik_passed_test: 'pending',
      micah_did_adjudication: false,
    },
    secrets: {
      the_switch: { known_by: ['Malik', 'Micah'], suspected_by: [] },
      malik_party_night: { known_by: ['Malik'], suspected_by: [] },
    },
    toneHistory: [],
    isComplete: false,
    pendingStopPoint: {
      prompt: 'Micah has to decide. What happens next?',
      choices: CHAPTER_1_CHOICES,
    },
  };
  const all = loadBranches();
  all.unshift(branch);
  saveBranches(all);
  return branch;
}

export function getBranch(id: string): Branch | undefined {
  return loadBranches().find(b => b.id === id);
}

export function updateBranch(branch: Branch) {
  const all = loadBranches();
  const idx = all.findIndex(b => b.id === branch.id);
  branch.updatedAt = Date.now();
  if (idx >= 0) all[idx] = branch;
  else all.unshift(branch);
  saveBranches(all);
}

export function deleteBranch(id: string) {
  const all = loadBranches().filter(b => b.id !== id);
  saveBranches(all);
}

export function applyDelta(meters: Meters, delta: StateDelta): Meters {
  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  return {
    trust_ari: clamp(meters.trust_ari + (delta.trust_ari || 0)),
    trust_dante: clamp(meters.trust_dante + (delta.trust_dante || 0)),
    trust_malik_to_micah: clamp(meters.trust_malik_to_micah + (delta.trust_malik_to_micah || 0)),
    trust_micah_to_malik: clamp(meters.trust_micah_to_malik + (delta.trust_micah_to_malik || 0)),
    suspicion_mom: clamp(meters.suspicion_mom + (delta.suspicion_mom || 0)),
    suspicion_coach: clamp(meters.suspicion_coach + (delta.suspicion_coach || 0)),
    suspicion_valentina: clamp(meters.suspicion_valentina + (delta.suspicion_valentina || 0)),
    risk_level: clamp(meters.risk_level + (delta.risk_level || 0)),
  };
}

export interface AIResult {
  prose: string;
  image?: string;
  imageFit?: 'cover' | 'contain';
  imagePosition?: string;
  sceneId?: string;
  state: {
    state_delta: StateDelta;
    tone_tag: Tone;
    chapter_title: string;
    chapter_summary: string;
    is_ending: boolean;
    ending_unlocked: string | null;
    ending_tagline: string | null;
    next_stop_point: { prompt: string; choices: Choice[] } | null;
  };
}

export async function generateNextChapter(branch: Branch, choice: Choice | { text: string; tone?: Tone; label?: string }): Promise<AIResult> {
  const installedResult = resolveInstalledStoryChoice(branch, choice as Choice);
  if (installedResult) {
    return {
      prose: installedResult.prose,
      image: installedResult.image,
      imageFit: installedResult.imageFit,
      imagePosition: installedResult.imagePosition,
      sceneId: installedResult.sceneId,
      state: {
        state_delta: installedResult.state_delta,
        tone_tag: installedResult.tone_tag,
        chapter_title: installedResult.chapter_title,
        chapter_summary: installedResult.chapter_summary,
        is_ending: installedResult.is_ending,
        ending_unlocked: installedResult.ending_unlocked,
        ending_tagline: installedResult.ending_tagline,
        next_stop_point: installedResult.next_stop_point,
      },
    };
  }

  const lastChapter = branch.chapters[branch.chapters.length - 1];
  const summaries = branch.chapters.slice(-3).map(c => c.summary || '').filter(Boolean);
  const context = {
    chapter_number: lastChapter.number,
    meters: branch.meters,
    flags: branch.flags,
    tone_history: branch.toneHistory.slice(-5),
    summaries,
  };

  const { data, error } = await supabase.functions.invoke('switch-kicks-story', {
    body: { choice, context },
  });
  if (error) throw error;
  return data as AIResult;
}

// Helper for chapter image selection based on tone/index
export function pickChapterImage(toneTag?: Tone, index: number = 0, sceneText: string = ''): string {
  const text = sceneText.toLowerCase();
  if (/compliance|test|officer|folder|office/.test(text)) return '/interactive-stories/scenes/compliance_office.png';
  if (/locker|reggie|teammate|football country/.test(text)) return '/interactive-stories/scenes/micah_enters_locker_room.png';
  if (/ari|partner|rehearsal|chemistry|dance with/.test(text)) return '/interactive-stories/scenes/ari_partner_rehearsal.png';
  if (/adjudication|solo|panel|ms\.? valentina|black-box|ballet piece/.test(text)) return '/interactive-stories/scenes/ballet_adjudication.png';
  if (/showcase|scout|route|catch|field|practice|coach/.test(text)) return '/interactive-stories/scenes/football_showcase.png';
  if (/truth|reveal|costume|storage|secret|discover|figured/.test(text)) return '/interactive-stories/scenes/truth_reveal.png';
  if (/denise|mother|mom|consequence|punishment/.test(text)) return '/interactive-stories/scenes/consequences_meeting.png';
  if (/switch|vending|hallway|clothes|identit/.test(text)) return '/interactive-stories/scenes/hallway_switch.png';
  if (/studio b|request|beg|favor/.test(text)) return '/interactive-stories/scenes/studio_b_request.png';

  const pool = [
    IMAGES.lockerRoom,
    IMAGES.ariStudio,
    IMAGES.danteDoorway,
    IMAGES.coachOffice,
    IMAGES.valentinaStudio,
    IMAGES.footballDive,
    IMAGES.adjudication,
    IMAGES.costumeRoom,
    IMAGES.twinsCover,
  ];
  if (toneTag === 'Romantic') return IMAGES.ariStudio;
  if (toneTag === 'Risky') return IMAGES.danteDoorway;
  if (toneTag === 'Bold') return IMAGES.footballDive;
  if (toneTag === 'Safe') return IMAGES.coachOffice;
  if (toneTag === 'Funny') return IMAGES.lockerRoom;
  return pool[index % pool.length];
}

