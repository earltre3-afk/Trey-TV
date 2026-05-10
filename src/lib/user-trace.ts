export type TraceAction =
  | "auth.sign_in"
  | "auth.sign_out"
  | "profile.update"
  | "profile.banner_update"
  | "feed.react"
  | "feed.save"
  | "feed.share"
  | "social.follow"
  | "social.unfollow"
  | "rewards.redeem"
  | "rewards.gift"
  | "prescribe.filter"
  | "prescribe.open";

export type UserTrace = {
  id: string;
  userUid: string;
  action: TraceAction;
  at: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
};

const KEY = "treytv_user_traces_v1";
const LIMIT = 500;

export function getTraceUid(uid?: string | null) {
  return uid?.trim() || "guest";
}

export function recordUserTrace(trace: Omit<UserTrace, "id" | "at"> & { at?: string }) {
  if (typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(KEY);
    const existing = raw ? (JSON.parse(raw) as UserTrace[]) : [];
    const next: UserTrace = {
      id: crypto.randomUUID(),
      at: trace.at ?? new Date().toISOString(),
      ...trace,
      userUid: getTraceUid(trace.userUid),
    };
    window.localStorage.setItem(KEY, JSON.stringify([next, ...existing].slice(0, LIMIT)));
  } catch {
    // Local trace storage is best-effort; app behavior should never depend on it.
  }
}

export function readUserTraces(userUid?: string) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(KEY);
    const traces = raw ? (JSON.parse(raw) as UserTrace[]) : [];
    return userUid ? traces.filter((trace) => trace.userUid === userUid) : traces;
  } catch {
    return [];
  }
}
