// ---------------------------------------------------------------------------
// Playthrough system â€” UID-tied saved playthroughs for Trey TV stories.
//
// A "Playthrough" wraps a Branch (the per-branch narrative state) with all the
// metadata required by the spec: playthrough_name, current_chapter, progress%,
// branch_title, relationship_stats, story_status_stats, share_enabled,
// public_share_slug, etc.
//
// Storage strategy:
//   â€¢ Local-first via localStorage so guests can still play.
//   â€¢ If the user is signed in (UID present), we mirror every save/update to
//     `user_story_playthroughs` in Supabase under their auth.uid().
// ---------------------------------------------------------------------------

import { Branch } from './storyTypes';
import { supabase } from './supabase';
import { loadBranches, saveBranches } from './storyEngine';
import { getInstalledStoryPackage } from './treyStoryPackage';

export interface PlaythroughMeta {
  id: string;
  user_uid: string | null;
  story_id: string;
  story_title: string;
  playthrough_name: string;
  current_scene_id: string | null;
  current_chapter: number;
  current_choice_node: string | null;
  progress_percent: number;
  branch_title: string;
  selected_branch_path: string[];
  status: 'active' | 'completed' | 'archived';
  relationship_stats: Record<string, number>;
  story_status_stats: Record<string, number>;
  unlocked_scenes: string[];
  unlocked_endings: string[];
  created_at: number;
  updated_at: number;
  completed_at: number | null;
  ending_id: string | null;
  ending_title: string | null;
  ending_summary: string | null;
  share_enabled: boolean;
  public_share_slug: string | null;
}

const META_KEY = 'trey_playthroughs_meta_v1';

function loadMetaAll(): Record<string, PlaythroughMeta> {
  try {
    const raw = localStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMetaAll(all: Record<string, PlaythroughMeta>) {
  localStorage.setItem(META_KEY, JSON.stringify(all));
}

const STORY_TITLES: Record<string, string> = {
  switch_kicks: 'Switch Kicks',
};

const STORY_COVERS: Record<string, string> = {
  switch_kicks: '/interactive-stories/scenes/twins_cover.png',
};

export function getStoryCover(storyId: string): string {
  const installed = getInstalledStoryPackage(storyId);
  return installed?.story.coverImage || STORY_COVERS[storyId] || STORY_COVERS.switch_kicks;
}

export function getStoryTitle(storyId: string): string {
  const installed = getInstalledStoryPackage(storyId);
  return installed?.story.title || STORY_TITLES[storyId] || 'Untitled Story';
}

// -- Branch â†’ derived stats --------------------------------------------------

function computeRelationshipStats(b: Branch): Record<string, number> {
  const m = b.meters;
  return {
    twin_bond: Math.round((m.trust_malik_to_micah + m.trust_micah_to_malik) / 2),
    ari_connection: m.trust_ari,
    dante_trust: m.trust_dante,
    denise_suspicion: m.suspicion_mom,
    coach_risk: m.suspicion_coach,
    ms_valentina_confidence: 100 - m.suspicion_valentina,
    reggie_respect: 60 + Math.min(40, Math.round((m.trust_malik_to_micah - 60) * 0.5)),
    compliance_pressure: m.risk_level,
    malik_pressure: m.risk_level,
    micah_stress: Math.round((m.risk_level + m.suspicion_valentina) / 2),
    secret_exposure: Math.round(
      (m.suspicion_mom + m.suspicion_coach + m.suspicion_valentina) / 3
    ),
    school_risk: Math.round((m.suspicion_coach + m.risk_level) / 2),
  };
}

function computeStoryStatusStats(b: Branch): Record<string, number> {
  const tones = b.toneHistory;
  const count = (t: string) => tones.filter((x) => x === t).length;
  return {
    comedy_chaos: Math.min(100, count('Funny') * 18 + count('Bold') * 6),
    honesty_level: Math.max(0, 100 - b.meters.suspicion_mom - b.meters.suspicion_coach / 2),
    romance_heat: Math.min(100, count('Romantic') * 20 + b.meters.trust_ari / 2),
    performance_momentum: Math.min(100, count('Bold') * 18 + (100 - b.meters.risk_level) / 2),
  };
}

function inferBranchTitle(b: Branch): string {
  const last = b.chapters[b.chapters.length - 1];
  if (b.ending) return b.ending.name;
  if (last?.toneTag === 'Romantic') return 'The Soft Path';
  if (last?.toneTag === 'Risky') return 'The Risk Spiral';
  if (last?.toneTag === 'Bold') return 'The Bold Move';
  if (last?.toneTag === 'Funny') return 'The Chaos Route';
  if (last?.toneTag === 'Safe') return 'The Honest Road';
  return 'Day One';
}

// Roughly: 8 chapters of narrative target before an ending.
const TARGET_CHAPTERS = 8;

function computeProgressPercent(b: Branch): number {
  if (b.isComplete) return 100;
  return Math.min(95, Math.round((b.chapters.length / TARGET_CHAPTERS) * 100));
}

// -- Public API --------------------------------------------------------------

export function generateSlug(): string {
  return (
    Math.random().toString(36).slice(2, 8) +
    '-' +
    Math.random().toString(36).slice(2, 6)
  );
}

export function getOrCreateMeta(branch: Branch, userUid: string | null): PlaythroughMeta {
  const all = loadMetaAll();
  const existing = all[branch.id];
  if (existing) return existing;

  const meta: PlaythroughMeta = {
    id: branch.id,
    user_uid: userUid,
    story_id: branch.storyId,
    story_title: getStoryTitle(branch.storyId),
    playthrough_name: 'New Playthrough',
    current_scene_id: branch.chapters[branch.chapters.length - 1]?.sceneId || `chapter_${branch.chapters.length}`,
    current_chapter: branch.chapters.length,
    current_choice_node: branch.pendingStopPoint ? `stop_${branch.chapters.length}` : null,
    progress_percent: computeProgressPercent(branch),
    branch_title: inferBranchTitle(branch),
    selected_branch_path: branch.chapters
      .map((c) => c.choiceMade?.label || '')
      .filter(Boolean),
    status: branch.isComplete ? 'completed' : 'active',
    relationship_stats: computeRelationshipStats(branch),
    story_status_stats: computeStoryStatusStats(branch),
    unlocked_scenes: branch.chapters.map((c, i) => c.sceneId || `chapter_${i + 1}`),
    unlocked_endings: branch.ending ? [branch.ending.name] : [],
    created_at: branch.createdAt,
    updated_at: branch.updatedAt,
    completed_at: branch.isComplete ? branch.updatedAt : null,
    ending_id: branch.ending ? branch.ending.name : null,
    ending_title: branch.ending?.name || null,
    ending_summary: branch.ending?.tagline || null,
    share_enabled: false,
    public_share_slug: null,
  };
  all[branch.id] = meta;
  saveMetaAll(all);
  return meta;
}

export function syncMetaFromBranch(branch: Branch, userUid: string | null): PlaythroughMeta {
  const all = loadMetaAll();
  const prev = all[branch.id] || getOrCreateMeta(branch, userUid);
  const next: PlaythroughMeta = {
    ...prev,
    user_uid: userUid ?? prev.user_uid,
    story_title: getStoryTitle(branch.storyId),
    current_chapter: branch.chapters.length,
    current_scene_id: branch.chapters[branch.chapters.length - 1]?.sceneId || `chapter_${branch.chapters.length}`,
    current_choice_node: branch.pendingStopPoint ? `stop_${branch.chapters.length}` : null,
    progress_percent: computeProgressPercent(branch),
    branch_title: inferBranchTitle(branch),
    selected_branch_path: branch.chapters
      .map((c) => c.choiceMade?.label || '')
      .filter(Boolean),
    status: branch.isComplete ? 'completed' : 'active',
    relationship_stats: computeRelationshipStats(branch),
    story_status_stats: computeStoryStatusStats(branch),
    unlocked_scenes: branch.chapters.map((c, i) => c.sceneId || `chapter_${i + 1}`),
    unlocked_endings: branch.ending ? [branch.ending.name] : prev.unlocked_endings,
    updated_at: branch.updatedAt,
    completed_at: branch.isComplete ? branch.updatedAt : null,
    ending_id: branch.ending?.name || null,
    ending_title: branch.ending?.name || null,
    ending_summary: branch.ending?.tagline || null,
  };
  all[branch.id] = next;
  saveMetaAll(all);
  // Fire-and-forget sync to Supabase if signed in
  if (userUid) pushToSupabase(next).catch(() => {});
  return next;
}

export function listMeta(userUid: string | null): PlaythroughMeta[] {
  const all = loadMetaAll();
  // Hydrate any branches that don't yet have meta records.
  for (const b of loadBranches()) {
    if (!all[b.id]) all[b.id] = getOrCreateMeta(b, userUid);
  }
  saveMetaAll(all);
  return Object.values(all).sort((a, b) => b.updated_at - a.updated_at);
}

export function renamePlaythrough(id: string, name: string, userUid: string | null) {
  const all = loadMetaAll();
  if (!all[id]) return;
  all[id] = { ...all[id], playthrough_name: name, updated_at: Date.now() };
  saveMetaAll(all);
  if (userUid) pushToSupabase(all[id]).catch(() => {});
}

export function deletePlaythroughMeta(id: string, userUid: string | null) {
  const all = loadMetaAll();
  delete all[id];
  saveMetaAll(all);
  if (userUid) {
    (supabase as any).from('user_story_playthroughs').delete().eq('id', id).then(() => {});
  }
}

export async function enableShare(id: string, userUid: string | null): Promise<string> {
  const all = loadMetaAll();
  const meta = all[id];
  if (!meta) throw new Error('Playthrough not found');
  const slug = meta.public_share_slug || generateSlug();
  const next: PlaythroughMeta = {
    ...meta,
    share_enabled: true,
    public_share_slug: slug,
    updated_at: Date.now(),
  };
  all[id] = next;
  saveMetaAll(all);

  if (userUid) {
    await pushToSupabase(next);
    // Also record a shared_story_endings row if ending exists
    if (next.ending_title) {
      await (supabase as any).from('shared_story_endings').upsert({
        id: `share_${id}`,
        playthrough_id: id,
        user_uid: userUid,
        story_id: next.story_id,
        ending_id: next.ending_id,
        ending_title: next.ending_title,
        ending_summary: next.ending_summary,
        ending_card_image: getStoryCover(next.story_id),
        share_slug: slug,
        is_public: true,
      }, { onConflict: 'id' });
    }
  }
  return slug;
}

export async function disableShare(id: string, userUid: string | null) {
  const all = loadMetaAll();
  const meta = all[id];
  if (!meta) return;
  const next: PlaythroughMeta = { ...meta, share_enabled: false, updated_at: Date.now() };
  all[id] = next;
  saveMetaAll(all);
  if (userUid) await pushToSupabase(next);
}

async function pushToSupabase(meta: PlaythroughMeta) {
  if (!meta.user_uid) return;
  await (supabase as any).from('user_story_playthroughs').upsert({
    id: meta.id,
    user_uid: meta.user_uid,
    story_id: meta.story_id,
    story_title: meta.story_title,
    playthrough_name: meta.playthrough_name,
    current_scene_id: meta.current_scene_id,
    current_chapter: meta.current_chapter,
    current_choice_node: meta.current_choice_node,
    progress_percent: meta.progress_percent,
    branch_title: meta.branch_title,
    selected_branch_path: meta.selected_branch_path,
    status: meta.status,
    relationship_stats: meta.relationship_stats,
    story_status_stats: meta.story_status_stats,
    unlocked_scenes: meta.unlocked_scenes,
    unlocked_endings: meta.unlocked_endings,
    created_at: new Date(meta.created_at).toISOString(),
    updated_at: new Date(meta.updated_at).toISOString(),
    completed_at: meta.completed_at ? new Date(meta.completed_at).toISOString() : null,
    ending_id: meta.ending_id,
    ending_title: meta.ending_title,
    ending_summary: meta.ending_summary,
    share_enabled: meta.share_enabled,
    public_share_slug: meta.public_share_slug,
  }, { onConflict: 'id' });
}

export async function recordChoiceEvent(opts: {
  playthroughId: string;
  userUid: string | null;
  chapterNumber: number;
  choiceLabel?: string;
  choiceText: string;
  toneLabel?: string;
  statChanges: Record<string, number>;
}) {
  if (!opts.userUid) return;
  await (supabase as any).from('user_story_choice_events').insert({
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    playthrough_id: opts.playthroughId,
    user_uid: opts.userUid,
    scene_id: `chapter_${opts.chapterNumber}`,
    choice_id: opts.choiceLabel || null,
    choice_text: opts.choiceText,
    chapter_number: opts.chapterNumber,
    stat_changes: opts.statChanges,
    tone_label: opts.toneLabel || null,
  });
}

/** Replay a playthrough from a given chapter index (1-based). Destroys later chapters. */
export function replayFromChapter(branchId: string, chapterNumber: number) {
  const branches = loadBranches();
  const idx = branches.findIndex((b) => b.id === branchId);
  if (idx < 0) return;
  const b = branches[idx];
  const trimmed = b.chapters.slice(0, chapterNumber);
  branches[idx] = {
    ...b,
    chapters: trimmed,
    isComplete: false,
    ending: undefined,
    pendingStopPoint: undefined,
    updatedAt: Date.now(),
    toneHistory: b.toneHistory.slice(0, chapterNumber),
  };
  saveBranches(branches);
}

/** Resolve a shared playthrough by slug from Supabase (public). */
export async function fetchSharedBySlug(slug: string) {
  const { data, error } = await (supabase as any)
    .from('shared_story_endings')
    .select('*')
    .eq('share_slug', slug)
    .maybeSingle();
  if (error || !data) {
    const { data: pt } = await (supabase as any)
      .from('user_story_playthroughs')
      .select('*')
      .eq('public_share_slug', slug)
      .eq('share_enabled', true)
      .maybeSingle();
    return pt;
  }
  return data;
}

