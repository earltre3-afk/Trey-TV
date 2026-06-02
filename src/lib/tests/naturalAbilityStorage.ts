import { supabase } from '@/integrations/supabase/client';
import { PrivacyMode, SignalResult, UserAnswer } from '@/types/naturalAbility';
import {
  buildTreyTVNaturalAbilitySavePayload,
  getVisibilityFlags,
} from './naturalAbilityActivation';

const TABLE = 'natural_ability_results';
const LOCAL_USER_KEY = 'trey_tv_signal_user_id';
const LOCAL_ROW_KEY = 'trey_tv_signal_result_row';

function isSupabaseAvailable(): boolean {
  try {
    return !!supabase.auth;
  } catch {
    return false;
  }
}

export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = localStorage.getItem(LOCAL_USER_KEY);
  if (!id) {
    id = `u_${crypto.randomUUID()}`;
    localStorage.setItem(LOCAL_USER_KEY, id);
  }
  return id;
}

export interface StoredSignalRow {
  id: string;
  user_id: string;
  primary_ability: string;
  secondary_ability: string;
  signal_blend: string;
  signal_strength: string;
  answer_snapshot: UserAnswer[];
  badge_slug: string;
  badge_label: string;
  badge_symbol: string;
  badge_glow: string;
  feed_name_preview: string;
  privacy_mode: PrivacyMode;
  show_on_profile: boolean;
  show_in_feed: boolean;
  badge_activated_at: string;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

function readLocalRow(userId: string): StoredSignalRow | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_ROW_KEY);
    if (!raw) return null;
    const row = JSON.parse(raw) as StoredSignalRow;
    return row.user_id === userId ? row : null;
  } catch {
    return null;
  }
}

function writeLocalRow(row: StoredSignalRow): StoredSignalRow {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_ROW_KEY, JSON.stringify(row));
  }
  return row;
}

function buildRow(params: {
  userId: string;
  displayName: string;
  result: SignalResult;
  privacyMode: PrivacyMode;
  answers: UserAnswer[];
  existing: StoredSignalRow | null;
  now: Date;
}): StoredSignalRow {
  const { userId, displayName, result, privacyMode, answers, existing, now } = params;

  if (!existing) {
    const takenAt = now.toISOString();
    const payload = buildTreyTVNaturalAbilitySavePayload({
      userId,
      displayName,
      result,
      privacyMode,
      answers,
      takenAt,
    });

    return {
      id: crypto.randomUUID(),
      ...payload,
      created_at: takenAt,
    };
  }

  const flags = getVisibilityFlags(privacyMode);

  return {
    ...existing,
    privacy_mode: privacyMode,
    show_on_profile: flags.showOnProfile,
    show_in_feed: flags.showInFeed,
    updated_at: now.toISOString(),
  };
}

export async function fetchSignalRecord(userId: string): Promise<StoredSignalRow | null> {
  if (!isSupabaseAvailable()) return readLocalRow(userId);

  try {
    const { data, error } = await (supabase as any)
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[signal] Supabase fetch failed, using local prototype storage', error.message);
      return readLocalRow(userId);
    }
    return (data as StoredSignalRow) || readLocalRow(userId);
  } catch (err: any) {
    console.warn('[signal] Supabase connection error, using local storage', err?.message || err);
    return readLocalRow(userId);
  }
}

export async function hasCompletedNaturalAbilityTest(userId: string): Promise<boolean> {
  return !!(await fetchSignalRecord(userId));
}

export async function getLockedNaturalAbilityResult(userId: string): Promise<StoredSignalRow | null> {
  return fetchSignalRecord(userId);
}

export async function saveNaturalAbilityVisibility(params: {
  userId: string;
  privacyMode: PrivacyMode;
}): Promise<{ ok: true; row: StoredSignalRow } | { ok: false; error: string }> {
  const existing = await fetchSignalRecord(params.userId);
  if (!existing) {
    return { ok: false, error: 'No completed Natural Ability result exists to update.' };
  }

  const now = new Date();
  const row = buildRow({
    userId: params.userId,
    displayName: '',
    result: {} as SignalResult,
    privacyMode: params.privacyMode,
    answers: existing.answer_snapshot,
    existing,
    now,
  });

  if (!isSupabaseAvailable()) {
    return { ok: true, row: writeLocalRow(row) };
  }

  try {
    const { data, error } = await (supabase as any)
      .from(TABLE)
      .upsert(row, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      console.warn('[signal] Supabase visibility update failed, saving locally instead', error.message);
      return { ok: true, row: writeLocalRow(row) };
    }

    const savedRow = data as StoredSignalRow;
    writeLocalRow(savedRow);
    return { ok: true, row: savedRow };
  } catch (err: any) {
    console.warn('[signal] Supabase update error, saving locally instead', err?.message || err);
    return { ok: true, row: writeLocalRow(row) };
  }
}

export async function saveNaturalAbilityResultOnce(params: {
  userId: string;
  displayName: string;
  result: SignalResult;
  privacyMode: PrivacyMode;
  answers?: UserAnswer[];
}): Promise<{ ok: true; row: StoredSignalRow } | { ok: false; error: string }> {
  const existing = await fetchSignalRecord(params.userId);
  if (existing) {
    return saveNaturalAbilityVisibility({
      userId: params.userId,
      privacyMode: params.privacyMode,
    });
  }

  const now = new Date();
  const row = buildRow({
    userId: params.userId,
    displayName: params.displayName,
    result: params.result,
    privacyMode: params.privacyMode,
    answers: params.answers ?? [],
    existing: null,
    now,
  });

  if (!isSupabaseAvailable()) {
    return { ok: true, row: writeLocalRow(row) };
  }

  try {
    const { data, error } = await (supabase as any)
      .from(TABLE)
      .upsert(row, { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) {
      console.warn('[signal] Supabase save failed, saving locally instead', error.message);
      return { ok: true, row: writeLocalRow(row) };
    }

    const savedRow = data as StoredSignalRow;
    writeLocalRow(savedRow);
    return { ok: true, row: savedRow };
  } catch (err: any) {
    console.warn('[signal] Supabase save error, saving locally instead', err?.message || err);
    return { ok: true, row: writeLocalRow(row) };
  }
}
