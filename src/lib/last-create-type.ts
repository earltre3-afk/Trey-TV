export const CREATE_TYPES = ['photo', 'video', 'story', 'reel'] as const;
export type CreateType = typeof CREATE_TYPES[number];
export const DEFAULT_CREATE_TYPE: CreateType = 'photo';

const STORAGE_KEY = 'treytv.create.lastType';

function isCreateType(value: unknown): value is CreateType {
  return typeof value === 'string' && (CREATE_TYPES as readonly string[]).includes(value);
}

export function readLastCreateType(): CreateType {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isCreateType(raw) ? raw : DEFAULT_CREATE_TYPE;
  } catch {
    return DEFAULT_CREATE_TYPE;
  }
}

export function writeLastCreateType(type: CreateType): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, type);
  } catch {
    // localStorage blocked (private mode, quota, etc.) — silently no-op.
  }
}
