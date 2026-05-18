import { Branch, Choice, Meters, StateDelta, Tone } from './storyTypes';
import { INITIAL_METERS } from './storyData';
import type { StoryCharacterVoices, StoryVoiceConfig, StoryVoiceProvider } from './storyVoiceTypes';
import { cleanText } from '@/lib/text/cleanText';

export const TREY_STORY_FILE_EXTENSION = '.ttstory';
export const TREY_STORY_MIME = 'application/vnd.treytv.interactive-story+json';
export const TREY_STORY_FILE_TYPE = 'trey-tv-interactive-story';
export const TREY_STORY_FORMAT_VERSION = '1.1';

const STORAGE_KEY = 'trey_installed_story_packages_v1';
const ALLOWED_TONES: Tone[] = ['Risky', 'Safe', 'Romantic', 'Funny', 'Bold'];
const CHOICE_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const BUNDLED_STORY_SOURCES = [
 '/interactive-stories/stories/the-god-ram-book-one.ttstory',
];

export interface TreyStoryCharacter {
 character_id: string;
 display_name: string;
 role: string;
 portrait?: string;
 voice_key?: string;
 voice?: StoryVoiceConfig;
 short_description?: string;
}

export interface TreyStoryDialogueLine {
 id?: string;
 type?: 'narration' | 'dialogue';
 character_id?: string;
 characterId?: string;
 speakerId?: string;
 speakerName?: string;
 text: string;
 voice?: StoryVoiceConfig;
 voice_key?: string;
 voiceKey?: string;
 emotion?: string;
 lineIndex?: number;
}

export interface TreyStoryChoice {
 id: string;
 label: string;
 text: string;
 tone: Tone;
 nextSceneId: string;
 stateDelta?: StateDelta;
 affectedCharacterIds?: string[];
 relationshipImpactType?: Choice['relationshipImpactType'];
 impactSummary?: string;
}

export interface TreyStoryScene {
 id: string;
 title: string;
 /** Plain prose version. If omitted, it will be generated from lines/dialogue/beats. */
 narration?: string;
 /** Optional structured narration/dialogue. AI-created .ttstory files can use this instead of one prose block. */
 lines?: TreyStoryDialogueLine[];
 dialogue?: TreyStoryDialogueLine[];
 beats?: TreyStoryDialogueLine[];
 image?: string;
 imageFit?: 'cover' | 'contain';
 imagePosition?: string;
 activeCharacterIds?: string[];
 choices?: TreyStoryChoice[];
 isEnding?: boolean;
 endingTitle?: string;
 endingTagline?: string;
 endingSummary?: string;
}

export interface TreyStoryPackage {
 fileType: typeof TREY_STORY_FILE_TYPE;
 formatVersion: string;
 story: {
 id: string;
 title: string;
 slug: string;
 genre?: string;
 description?: string;
 coverImage?: string;
 initialSceneId: string;
 initialMeters?: Partial<Meters>;
 characterVoices?: StoryCharacterVoices;
 };
 characters: TreyStoryCharacter[];
 scenes: TreyStoryScene[];
}

export class TreyStoryPackageError extends Error {
 constructor(message: string) {
 super(message);
 this.name = 'TreyStoryPackageError';
 }
}

function assertString(value: unknown, label: string): asserts value is string {
 if (typeof value !== 'string' || value.trim().length === 0) {
 throw new TreyStoryPackageError(`${label} must be a non-empty string.`);
 }
}

function clamp(n: number) {
 return Math.max(0, Math.min(100, Math.round(n)));
}

function normalizeMachineId(value: unknown, fallback = 'item'): string {
 const raw = typeof value === 'string' ? value : fallback;
 const normalized = raw
 .trim()
 .toLowerCase()
 .replace(/['"’]/g, '')
 .replace(/[^a-z0-9]+/g, '_')
 .replace(/^_+|_+$/g, '');
 return normalized || fallback;
}

function normalizeTone(value: unknown): Tone {
 if (typeof value === 'string') {
 const match = ALLOWED_TONES.find((tone) => tone.toLowerCase() === value.trim().toLowerCase());
 if (match) return match;
 }
 return 'Bold';
}

function normalizeAssetPath(value: unknown, kind: 'characters' | 'scenes'): string | undefined {
 if (typeof value !== 'string' || value.trim().length === 0) return undefined;
 const raw = value.trim();
 if (/^(https?:|data:image\/|\/)/i.test(raw)) return raw;
 if (raw.includes('/')) return raw.startsWith('/') ? raw : `/${raw}`;
 const hasExtension = /\.(png|jpe?g|webp|gif|svg)$/i.test(raw);
 return `/interactive-stories/${kind}/${hasExtension ? raw : `${raw}.png`}`;
}

function normalizeVoiceProvider(value: unknown): StoryVoiceProvider {
 const provider = typeof value === 'string' ? value.trim().toLowerCase() : 'system';
 if (provider === 'elevenlabs' || provider === 'openai' || provider === 'uploaded' || provider === 'none') return provider;
 return 'system';
}

function normalizeVoiceConfig(value: unknown): StoryVoiceConfig | undefined {
 if (!value || typeof value !== 'object') return undefined;
 const raw = value as Record<string, unknown>;
 return {
 voiceProvider: normalizeVoiceProvider(raw.voiceProvider || raw.voice_provider || raw.provider),
 voiceId: typeof raw.voiceId === 'string' ? raw.voiceId : (typeof raw.voice_id === 'string' ? raw.voice_id : null),
 voiceName: typeof raw.voiceName === 'string' ? raw.voiceName : (typeof raw.voice_name === 'string' ? raw.voice_name : null),
 audioStyle: typeof raw.audioStyle === 'string' ? raw.audioStyle : (typeof raw.audio_style === 'string' ? raw.audio_style : null),
 settings: raw.settings && typeof raw.settings === 'object' ? raw.settings as Record<string, unknown> : null,
 };
}

function normalizeCharacterVoices(value: unknown, characters: TreyStoryCharacter[]): StoryCharacterVoices | undefined {
 const raw = value && typeof value === 'object' ? value as Record<string, unknown> : {};
 const rawCharacters = raw.characters && typeof raw.characters === 'object'
 ? raw.characters as Record<string, unknown>
 : {};
 const characterVoiceMap: Record<string, StoryVoiceConfig> = {};

 for (const character of characters) {
 const explicit = normalizeVoiceConfig(rawCharacters[character.character_id]) || character.voice;
 if (explicit) characterVoiceMap[character.character_id] = explicit;
 }

 const narrator = normalizeVoiceConfig(raw.narrator) || {
 voiceProvider: 'system' as const,
 voiceId: null,
 voiceName: 'Narrator',
 audioStyle: 'cinematic narrator',
 settings: null,
 };

 if (!Object.keys(characterVoiceMap).length && !narrator) return undefined;
 return {
 narrator,
 characters: characterVoiceMap,
 };
}

function decodeBase64Url(payload: string): string {
 const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
 const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
 if (typeof atob === 'function') return decodeURIComponent(escape(atob(padded)));
 // Node/build-time fallback for tests or tooling.
 return Buffer.from(padded, 'base64').toString('utf8');
}

/**
 * Decodes every supported Trey TV story package wrapper into JSON text.
 * Supported .ttstory payloads:
 * 1. Raw JSON object text.
 * 2. TTS1:<base64url(JSON)> for safer copy/paste or transport.
 * 3. data:application/vnd.treytv.interactive-story+json;base64,<base64(JSON)>.
 */
export function decodeTreyStoryText(raw: string): string {
 const text = raw.replace(/^\uFEFF/, '').trim();
 if (!text) throw new TreyStoryPackageError('This .ttstory file is empty.');

 if (text.startsWith('TTS1:')) return decodeBase64Url(text.slice(5).trim());

 if (/^data:/i.test(text)) {
 const comma = text.indexOf(',');
 if (comma === -1) throw new TreyStoryPackageError('Invalid .ttstory data URI.');
 const header = text.slice(0, comma).toLowerCase();
 const body = text.slice(comma + 1).trim();
 if (header.includes(';base64')) return decodeBase64Url(body);
 return decodeURIComponent(body);
 }

 return text;
}

function getSceneLines(scene: Partial<TreyStoryScene>): TreyStoryDialogueLine[] {
 const lines = scene.lines || scene.dialogue || scene.beats || [];
 if (!Array.isArray(lines)) return [];
 return lines
 .filter((line) => line && typeof line === 'object' && typeof line.text === 'string' && line.text.trim())
 .map((line, index) => ({
 ...line,
 id: line.id || `line_${index + 1}`,
 text: line.text.trim(),
 voice: normalizeVoiceConfig(line.voice),
 lineIndex: typeof line.lineIndex === 'number' ? line.lineIndex : index,
 }))
 .sort((a, b) => (a.lineIndex || 0) - (b.lineIndex || 0));
}

export function sceneToProse(scene: Partial<TreyStoryScene>): string {
 if (typeof scene.narration === 'string' && scene.narration.trim()) return scene.narration.trim();

 const lines = getSceneLines(scene);
 if (!lines.length) return '';

 return lines
 .map((line) => {
 const speaker = line.character_id || line.characterId || line.speakerId || line.speakerName;
 const isDialogue = line.type === 'dialogue' || (!!speaker && speaker !== 'narrator');
 if (!isDialogue) return line.text.trim();
 const label = line.speakerName || speaker;
 return `${label}: "${line.text.trim()}"`;
 })
 .join('\n\n');
}

function normalizeCharacters(characters: unknown): TreyStoryCharacter[] {
 if (!Array.isArray(characters) || characters.length === 0) {
 throw new TreyStoryPackageError('A .ttstory file needs at least one character.');
 }

 const seen = new Set<string>();
 return characters.map((raw, index) => {
 const item = raw as Partial<TreyStoryCharacter> & { id?: string; name?: string; image?: string; voice?: unknown };
 const characterId = normalizeMachineId(item.character_id || item.id || item.name, `character_${index + 1}`);
 if (seen.has(characterId)) throw new TreyStoryPackageError(`Duplicate character_id: ${characterId}.`);
 seen.add(characterId);

 const displayName = item.display_name || item.name || characterId.replace(/_/g, ' ');
 return {
 character_id: characterId,
 display_name: cleanText(String(displayName)),
 role: cleanText(String(item.role || 'Character')),
 portrait: normalizeAssetPath(item.portrait || item.image || characterId, 'characters'),
 voice_key: item.voice_key,
 voice: normalizeVoiceConfig(item.voice),
 short_description: item.short_description ? cleanText(item.short_description) : undefined,
 };
 });
}

function normalizeChoice(rawChoice: unknown, sceneId: string, index: number, sceneIds: Set<string>): TreyStoryChoice {
 const choice = rawChoice as Partial<TreyStoryChoice> & { next_scene_id?: string; next?: string; impact_summary?: string };
 const id = normalizeMachineId(choice.id || choice.text || `choice_${index + 1}`, `${sceneId}_choice_${index + 1}`);
 const nextSceneId = String(choice.nextSceneId || choice.next_scene_id || choice.next || '').trim();
 assertString(nextSceneId, `choice ${id}.nextSceneId`);
 if (!sceneIds.has(nextSceneId)) {
 throw new TreyStoryPackageError(`choice ${id} points to missing scene ${nextSceneId}.`);
 }

 return {
    id,
    label: typeof choice.label === 'string' && choice.label.trim() ? choice.label.trim() : CHOICE_LABELS[index] || String(index + 1),
    text: cleanText(String(choice.text || 'Continue')),
    tone: normalizeTone(choice.tone),
    nextSceneId,
    stateDelta: normalizeStateDelta(choice.stateDelta),
    affectedCharacterIds: Array.isArray(choice.affectedCharacterIds)
      ? choice.affectedCharacterIds.map((idValue) => normalizeMachineId(idValue)).filter(Boolean)
      : undefined,
    relationshipImpactType: choice.relationshipImpactType,
    impactSummary: choice.impactSummary || choice.impact_summary
      ? cleanText(String(choice.impactSummary || choice.impact_summary))
      : undefined,
  };
}

function normalizeStateDelta(value: unknown): StateDelta | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const delta = value as Record<string, unknown>;
  const normalized: StateDelta = {};
  for (const key of Object.keys(INITIAL_METERS) as Array<keyof Meters>) {
    const n = Number(delta[key]);
    if (Number.isFinite(n) && n !== 0) normalized[key] = n;
  }
  return Object.keys(normalized).length ? normalized : undefined;
}

function normalizeScenes(scenes: unknown, initialSceneId: string): TreyStoryScene[] {
  if (!Array.isArray(scenes) || scenes.length === 0) {
    throw new TreyStoryPackageError('A .ttstory file needs at least one scene.');
  }

  const sceneIds = new Set<string>();
  const firstPass = scenes.map((raw, index) => {
    const item = raw as Partial<TreyStoryScene> & { scene_id?: string; image_key?: string; image_fit?: string; image_position?: string; active_characters?: string[] };
    const id = String(item.id || item.scene_id || `scene_${index + 1}`).trim();
    assertString(id, `scene ${index + 1}.id`);
    if (sceneIds.has(id)) throw new TreyStoryPackageError(`Duplicate scene id: ${id}.`);
    sceneIds.add(id);
    return { item, id };
  });

  if (!sceneIds.has(initialSceneId)) {
    throw new TreyStoryPackageError('story.initialSceneId does not match any scene id.');
  }

  return firstPass.map(({ item, id }, index) => {
    const title = cleanText(String(item.title || `Scene ${index + 1}`));
    const lines = getSceneLines(item);
    const narrationRaw = sceneToProse(item);
    const narration = cleanText(narrationRaw);
    if (!narration) throw new TreyStoryPackageError(`scene ${id} needs narration or lines.`);

    return {
      id,
      title,
      narration,
      lines: lines.length ? lines.map((l) => ({ ...l, text: cleanText(l.text) })) : undefined,
      image: normalizeAssetPath(item.image || item.image_key || id, 'scenes'),
      imageFit: item.imageFit || (item.image_fit as 'cover' | 'contain') || 'cover',
      imagePosition: item.imagePosition || item.image_position || 'center 35%',
      activeCharacterIds: Array.isArray(item.activeCharacterIds || item.active_characters)
        ? (item.activeCharacterIds || item.active_characters || []).map((v) => normalizeMachineId(v)).filter(Boolean)
        : undefined,
      choices: Array.isArray(item.choices)
        ? item.choices.map((choice, choiceIndex) => normalizeChoice(choice, id, choiceIndex, sceneIds))
        : undefined,
      isEnding: !!item.isEnding,
      endingTitle: item.endingTitle ? cleanText(item.endingTitle) : undefined,
      endingTagline: item.endingTagline ? cleanText(item.endingTagline) : undefined,
      endingSummary: item.endingSummary ? cleanText(item.endingSummary) : undefined,
    };
  });
}

export function parseTreyStoryPackage(raw: string): TreyStoryPackage {
 let data: unknown;
 try {
 data = JSON.parse(decodeTreyStoryText(raw));
 } catch (error) {
 if (error instanceof TreyStoryPackageError) throw error;
 throw new TreyStoryPackageError('This is not a valid .ttstory file. It must be valid JSON or a TTS1 encoded JSON package.');
 }

 const pkg = data as Partial<TreyStoryPackage> & { type?: string; file_type?: string };
 const fileType = pkg.fileType || pkg.file_type || pkg.type;
 if (fileType !== TREY_STORY_FILE_TYPE) {
 throw new TreyStoryPackageError(`Invalid fileType. Expected "${TREY_STORY_FILE_TYPE}".`);
 }

 if (!pkg.story || typeof pkg.story !== 'object') throw new TreyStoryPackageError('Missing story object.');
 assertString(pkg.story.id, 'story.id');
 assertString(pkg.story.title, 'story.title');
 assertString(pkg.story.initialSceneId, 'story.initialSceneId');

 const storyRecord = pkg.story as typeof pkg.story & {
 characters?: unknown;
 scenes?: unknown;
 character_voices?: unknown;
 };
 const characters = normalizeCharacters(pkg.characters || storyRecord.characters);
 const scenes = normalizeScenes(pkg.scenes || storyRecord.scenes, pkg.story.initialSceneId);
 const characterVoices = normalizeCharacterVoices(pkg.story.characterVoices || storyRecord.character_voices, characters);

 return {
  fileType: TREY_STORY_FILE_TYPE,
  formatVersion: String(pkg.formatVersion || TREY_STORY_FORMAT_VERSION),
  story: {
    id: normalizeMachineId(pkg.story.id, 'story'),
    title: cleanText(pkg.story.title),
    slug: normalizeMachineId(pkg.story.slug || pkg.story.title || pkg.story.id, pkg.story.id).replace(/_/g, '-'),
    genre: pkg.story.genre ? cleanText(pkg.story.genre) : undefined,
    description: pkg.story.description ? cleanText(pkg.story.description) : undefined,
    coverImage: normalizeAssetPath(pkg.story.coverImage || scenes[0]?.image, 'scenes'),
    initialSceneId: pkg.story.initialSceneId,
    initialMeters: normalizeInitialMeters(pkg.story.initialMeters),
    characterVoices,
  },
  characters,
  scenes,
 };
}

function normalizeInitialMeters(value: unknown): Partial<Meters> | undefined {
 if (!value || typeof value !== 'object') return undefined;
 const meters = value as Record<string, unknown>;
 const normalized: Partial<Meters> = {};
 for (const key of Object.keys(INITIAL_METERS) as Array<keyof Meters>) {
 const n = Number(meters[key]);
 if (Number.isFinite(n)) normalized[key] = clamp(n);
 }
 return Object.keys(normalized).length ? normalized : undefined;
}

export function loadInstalledStoryPackages(): TreyStoryPackage[] {
 try {
 const raw = localStorage.getItem(STORAGE_KEY);
 const list = raw ? JSON.parse(raw) : [];
 if (!Array.isArray(list)) return [];
 return list.filter((x) => x?.fileType === TREY_STORY_FILE_TYPE) as TreyStoryPackage[];
 } catch {
 return [];
 }
}

export function saveInstalledStoryPackages(list: TreyStoryPackage[]) {
 localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function normalizeStorySlug(slug: string): string {
 const normalized = normalizeMachineId(slug, 'story').replace(/_/g, '-');
 if (normalized === 'the-god-ram') return 'the-god-ram-book-one';
 return normalized;
}

export function findInstalledStoryPackageBySlug(slug: string): TreyStoryPackage | null {
 const normalized = normalizeStorySlug(slug);
 return loadInstalledStoryPackages().find((pkg) => pkg.story.slug === normalized) || null;
}

export async function loadBundledStoryPackages(): Promise<TreyStoryPackage[]> {
 const packages: TreyStoryPackage[] = [];
 for (const source of BUNDLED_STORY_SOURCES) {
 const response = await fetch(source);
 if (!response.ok) {
 throw new TreyStoryPackageError(`Bundled story package could not be loaded: ${source}`);
 }
 packages.push(parseTreyStoryPackage(await response.text()));
 }
 return packages;
}

export async function ensureBundledStoryPackagesInstalled(): Promise<TreyStoryPackage[]> {
 const bundled = await loadBundledStoryPackages();
 const installed = loadInstalledStoryPackages();
 const merged = [
 ...bundled,
 ...installed.filter((pkg) => !bundled.some((story) => story.story.id === pkg.story.id)),
 ];
 saveInstalledStoryPackages(merged);
 return merged;
}

export function installTreyStoryPackage(pkg: TreyStoryPackage): TreyStoryPackage[] {
 const current = loadInstalledStoryPackages();
 const next = [pkg, ...current.filter((x) => x.story.id !== pkg.story.id)];
 saveInstalledStoryPackages(next);
 return next;
}

export function getInstalledStoryPackage(storyId: string): TreyStoryPackage | null {
 return loadInstalledStoryPackages().find((pkg) => pkg.story.id === storyId) || null;
}

export async function installTreyStoryFile(file: File): Promise<TreyStoryPackage[]> {
 if (!file.name.toLowerCase().endsWith(TREY_STORY_FILE_EXTENSION)) {
 throw new TreyStoryPackageError(`Upload a ${TREY_STORY_FILE_EXTENSION} story package.`);
 }
 const raw = await file.text();
 const pkg = parseTreyStoryPackage(raw);
 return installTreyStoryPackage(pkg);
}

function toBranchChoice(choice: TreyStoryChoice): Choice {
 return {
 id: choice.id,
 label: choice.label,
 text: choice.text,
 tone: choice.tone,
 nextSceneId: choice.nextSceneId,
 stateDelta: choice.stateDelta,
 affectedCharacterIds: choice.affectedCharacterIds,
 relationshipImpactType: choice.relationshipImpactType,
 };
}

function continueChoiceForScene(pkg: TreyStoryPackage, scene: TreyStoryScene): Choice[] | undefined {
 const currentIndex = pkg.scenes.findIndex((candidate) => candidate.id === scene.id);
 const nextScene = currentIndex >= 0 ? pkg.scenes[currentIndex + 1] : undefined;
 if (!nextScene) return undefined;
 return [
 {
 id: `${scene.id}_continue`,
 label: 'Continue',
 text: 'Step deeper into the story.',
 tone: 'Bold',
 nextSceneId: nextScene.id,
 },
 ];
}

export function createBranchFromStoryPackage(pkg: TreyStoryPackage): Branch {
 const first = pkg.scenes.find((scene) => scene.id === pkg.story.initialSceneId) || pkg.scenes[0];
 const now = Date.now();
 const meters: Meters = {
 ...INITIAL_METERS,
 ...pkg.story.initialMeters,
 } as Meters;

 for (const key of Object.keys(meters) as Array<keyof Meters>) {
 meters[key] = clamp(Number(meters[key]));
 }

 const branchId = `branch_${pkg.story.id}_${now}_${Math.floor(Math.random() * 1000)}`;

 return {
 id: branchId,
 storyId: pkg.story.id,
 createdAt: now,
 updatedAt: now,
 chapters: [
 {
 number: 1,
 title: `Chapter 1 — ${first.title}`,
 prose: first.narration || sceneToProse(first),
 image: first.image || pkg.story.coverImage,
 imageFit: first.imageFit,
 imagePosition: first.imagePosition,
 sceneId: first.id,
 voiceLines: first.lines,
 characterVoices: pkg.story.characterVoices,
 storyCharacters: pkg.characters,
 summary: (first.endingSummary || first.narration || sceneToProse(first)).slice(0, 220),
 },
 ],
 meters,
 flags: {
 installed_story: true,
 current_scene_id: first.id,
 story_slug: pkg.story.slug,
 },
 secrets: {},
 toneHistory: [],
 isComplete: !!first.isEnding,
 ending: first.isEnding
 ? {
 name: first.endingTitle || first.title,
 tagline: first.endingTagline || first.endingSummary || 'Your story reached an ending.',
 unlockedAt: now,
 branchId,
 }
 : undefined,
 pendingStopPoint: first.choices?.length
 ? {
 prompt: 'What happens next?',
 choices: first.choices.map(toBranchChoice),
 }
 : continueChoiceForScene(pkg, first)
 ? {
 prompt: 'Keep going.',
 choices: continueChoiceForScene(pkg, first) || [],
 }
 : undefined,
 };
}

export function resolveInstalledStoryChoice(
 branch: Branch,
 choice: Choice
): { prose: string; image?: string; imageFit?: 'cover' | 'contain'; imagePosition?: string; sceneId?: string; voiceLines?: TreyStoryDialogueLine[]; characterVoices?: StoryCharacterVoices; storyCharacters?: TreyStoryCharacter[]; state_delta: StateDelta; tone_tag: Tone; chapter_title: string; chapter_summary: string; is_ending: boolean; ending_unlocked: string | null; ending_tagline: string | null; next_stop_point: { prompt: string; choices: Choice[] } | null } | null {
 const pkg = getInstalledStoryPackage(branch.storyId);
 if (!pkg) return null;
 const targetSceneId = choice.nextSceneId || String(branch.flags.current_scene_id || pkg.story.initialSceneId);
 const scene = pkg.scenes.find((s) => s.id === targetSceneId);
 if (!scene) return null;

 const prose = scene.narration || sceneToProse(scene);

 return {
 prose,
 image: scene.image || pkg.story.coverImage,
 imageFit: scene.imageFit,
 imagePosition: scene.imagePosition,
 sceneId: scene.id,
 voiceLines: scene.lines,
 characterVoices: pkg.story.characterVoices,
 storyCharacters: pkg.characters,
 state_delta: choice.stateDelta || {},
 tone_tag: choice.tone || 'Bold',
 chapter_title: scene.title,
 chapter_summary: scene.endingSummary || prose.slice(0, 220),
 is_ending: !!scene.isEnding || (!scene.choices?.length && !continueChoiceForScene(pkg, scene)?.length),
 ending_unlocked: scene.isEnding ? scene.endingTitle || scene.title : null,
 ending_tagline: scene.isEnding ? scene.endingTagline || scene.endingSummary || null : null,
 next_stop_point: scene.choices?.length
 ? { prompt: 'What happens next?', choices: scene.choices.map(toBranchChoice) }
 : continueChoiceForScene(pkg, scene)?.length
 ? { prompt: 'Keep going.', choices: continueChoiceForScene(pkg, scene) || [] }
 : null,
 };
}

export function exportTreyStoryPackage(pkg: TreyStoryPackage): string {
 return JSON.stringify(pkg, null, 2);
}

export function encodeTreyStoryPackage(pkg: TreyStoryPackage): string {
 const json = exportTreyStoryPackage(pkg);
 const base64 = typeof btoa === 'function'
 ? btoa(unescape(encodeURIComponent(json)))
 : Buffer.from(json, 'utf8').toString('base64');
 return `TTS1:${base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')}`;
}

