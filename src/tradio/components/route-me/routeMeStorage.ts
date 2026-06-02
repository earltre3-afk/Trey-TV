import type { PrescribeMeDailyUsage, PrescribeMeRouteResult, PrescribeMeSavedRoute } from './routeMeTypes';
import { ROUTE_ME_DAILY_LIMIT, ROUTE_ME_STORAGE_KEY } from './routeMeData';

const todayKey = () => new Date().toISOString().slice(0, 10);

const emptyUsage = (): PrescribeMeDailyUsage => ({
  date: todayKey(),
  limit: ROUTE_ME_DAILY_LIMIT,
  used: 0,
  remaining: ROUTE_ME_DAILY_LIMIT,
  savedRoutes: [],
});

const sanitizeUsage = (value: unknown): PrescribeMeDailyUsage => {
  if (!value || typeof value !== 'object') return emptyUsage();
  const candidate = value as Partial<PrescribeMeDailyUsage>;
  if (candidate.date !== todayKey()) return emptyUsage();
  const savedRoutes = Array.isArray(candidate.savedRoutes) ? candidate.savedRoutes.slice(0, 8) : [];
  const used = Math.min(ROUTE_ME_DAILY_LIMIT, Math.max(0, Number(candidate.used) || savedRoutes.length || 0));
  return {
    date: todayKey(),
    limit: ROUTE_ME_DAILY_LIMIT,
    used,
    remaining: Math.max(0, ROUTE_ME_DAILY_LIMIT - used),
    savedRoutes,
  };
};

export const getRouteMeDailyUsage = (): PrescribeMeDailyUsage => {
  if (typeof window === 'undefined') return emptyUsage();
  try {
    return sanitizeUsage(JSON.parse(window.localStorage.getItem(ROUTE_ME_STORAGE_KEY) ?? 'null'));
  } catch {
    return emptyUsage();
  }
};

export const saveRouteMeDailyUsage = (usage: PrescribeMeDailyUsage): PrescribeMeDailyUsage => {
  const sanitized = sanitizeUsage(usage);
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ROUTE_ME_STORAGE_KEY, JSON.stringify(sanitized));
  }
  return sanitized;
};

export const recordRoutePrescription = (result: PrescribeMeRouteResult): PrescribeMeDailyUsage => {
  const current = getRouteMeDailyUsage();
  if (current.remaining <= 0) return current;
  const savedRoute: PrescribeMeSavedRoute = {
    id: `saved-${result.id}`,
    savedAt: new Date().toISOString(),
    result,
  };
  return saveRouteMeDailyUsage({
    ...current,
    used: Math.min(current.limit, current.used + 1),
    remaining: Math.max(0, current.limit - current.used - 1),
    savedRoutes: [savedRoute, ...current.savedRoutes].slice(0, 8),
  });
};

export const saveRouteAgain = (result: PrescribeMeRouteResult): PrescribeMeDailyUsage => {
  const current = getRouteMeDailyUsage();
  if (current.savedRoutes.some((route) => route.result.id === result.id)) return current;
  return saveRouteMeDailyUsage({
    ...current,
    savedRoutes: [
      { id: `saved-${result.id}`, savedAt: new Date().toISOString(), result },
      ...current.savedRoutes,
    ].slice(0, 8),
  });
};

export const debugResetRouteMeDailyUsage = (): PrescribeMeDailyUsage => {
  const usage = emptyUsage();
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ROUTE_ME_STORAGE_KEY, JSON.stringify(usage));
  }
  return usage;
};
