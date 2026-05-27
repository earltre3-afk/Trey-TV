import type { FreeTvGuideChannel, FreeTvProgram, FreeTvProviderStatus } from './freeTvApi.types';

const INTERNAL_FREE_TV_BASE = '/api/free-tv';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function numberString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim().length > 0) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function formatTimeRange(program: JsonRecord): string {
  const directTime = stringValue(program.time);
  if (directTime) return directTime;

  const start = stringValue(program.startTime) || stringValue(program.start) || stringValue(program.airtime);
  const end = stringValue(program.endTime) || stringValue(program.end);

  if (start && end) return `${formatClock(start)} - ${formatClock(end)}`;
  if (start) return formatClock(start);
  return 'Time TBA';
}

function formatClock(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isNaN(parsed)) {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date(parsed));
  }
  return value;
}

function normalizeProgram(value: unknown, index: number): FreeTvProgram | null {
  if (!isRecord(value)) return null;
  const title = stringValue(value.title) || stringValue(value.name) || stringValue(value.programName);
  if (!title) return null;

  return {
    id: stringValue(value.id) || stringValue(value.externalId) || `program-${index}`,
    title,
    time: formatTimeRange(value),
    live: booleanValue(value.live) || booleanValue(value.isLive),
    startTime: stringValue(value.startTime) || stringValue(value.start),
    endTime: stringValue(value.endTime) || stringValue(value.end),
    description: stringValue(value.description) || stringValue(value.summary),
    imageUrl: stringValue(value.imageUrl) || stringValue(value.image) || stringValue(value.thumbnailUrl),
    genres: arrayValue(value.genres).filter((item): item is string => typeof item === 'string'),
  };
}

function normalizeChannel(value: unknown, index: number): FreeTvGuideChannel | null {
  if (!isRecord(value)) return null;
  const name = stringValue(value.name) || stringValue(value.title) || stringValue(value.channelName);
  if (!name) return null;

  const rawPrograms = arrayValue(value.programs).length > 0
    ? arrayValue(value.programs)
    : arrayValue(value.schedule);

  const programs = rawPrograms
    .map((program, programIndex) => normalizeProgram(program, programIndex))
    .filter((program): program is FreeTvProgram => Boolean(program));

  return {
    id: stringValue(value.id) || stringValue(value.externalId) || `channel-${index}`,
    num: numberString(value.num ?? value.number ?? value.channelNumber, String(101 + index)),
    name,
    logoUrl: stringValue(value.logoUrl) || stringValue(value.logo) || stringValue(value.iconUrl),
    category: stringValue(value.category),
    country: stringValue(value.country),
    language: stringValue(value.language),
    programs,
  };
}

function normalizeScheduleItems(items: unknown[]): FreeTvGuideChannel[] {
  const grouped = new Map<string, FreeTvGuideChannel>();

  items.forEach((item, index) => {
    if (!isRecord(item)) return;
    const channelRecord = isRecord(item.channel) ? item.channel : item;
    const programRecord = isRecord(item.program) ? item.program : item;
    const channel = normalizeChannel({ ...channelRecord, programs: [] }, index);
    const program = normalizeProgram(programRecord, index);
    if (!channel || !program) return;

    const existing = grouped.get(channel.id) ?? channel;
    existing.programs = [...existing.programs, program];
    grouped.set(channel.id, existing);
  });

  return Array.from(grouped.values());
}

export function normalizeGuideChannels(payload: unknown): FreeTvGuideChannel[] {
  const root = isRecord(payload) ? payload : {};
  const source =
    arrayValue(root.channels).length > 0 ? arrayValue(root.channels)
    : arrayValue(root.data).length > 0 ? arrayValue(root.data)
    : arrayValue(root.results).length > 0 ? arrayValue(root.results)
    : Array.isArray(payload) ? payload
    : [];

  const channels = source
    .map((channel, index) => normalizeChannel(channel, index))
    .filter((channel): channel is FreeTvGuideChannel => Boolean(channel));

  if (channels.length > 0) return channels;

  const scheduleItems =
    arrayValue(root.schedule).length > 0 ? arrayValue(root.schedule)
    : arrayValue(root.items).length > 0 ? arrayValue(root.items)
    : [];

  return normalizeScheduleItems(scheduleItems);
}

async function readJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${INTERNAL_FREE_TV_BASE}${path}`, {
    headers: { Accept: 'application/json' },
    signal,
  });

  if (!response.ok) {
    throw new Error(`Free TV API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getFreeTvStatus(signal?: AbortSignal): Promise<FreeTvProviderStatus> {
  return readJson<FreeTvProviderStatus>('/status', signal);
}

export async function getFreeTvSchedule(signal?: AbortSignal): Promise<FreeTvGuideChannel[]> {
  const today = new Date().toISOString().slice(0, 10);
  const payload = await readJson<unknown>(`/schedule?country=US&date=${today}`, signal);
  return normalizeGuideChannels(payload);
}
