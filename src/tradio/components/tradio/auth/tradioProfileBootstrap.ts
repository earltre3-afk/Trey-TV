import type { SupabaseClient, User } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  fetchTradioIdentityParts,
  fetchTradioProfile,
  fetchTradioRoles,
  fetchTreyProfileBridge,
  mapSupabaseToTradioIdentity,
  updateActiveMode,
  type TradioProfileRow,
  type TreyProfileBridge,
} from "./supabaseIdentity";
import type { TradioIdentity, TradioMode, TradioRole, TradioRoleGrant } from "./types";

/**
 * TRADIO PASS 4E — Profile bootstrap service.
 *
 * Safely prepares a Tradio profile / role / active mode for an authenticated
 * Trey TV / Trizzy Hub user on the SHARED Supabase project. Every function is
 * defensive: if Supabase is not configured, a table is missing, or RLS denies
 * the write, it returns a safe fallback and a classified status instead of
 * throwing. The app must never crash because of bootstrap.
 *
 * Identity remains rooted in Trey TV:
 *   auth.users -> Trey TV public.profiles (read-only bridge) -> tradio_profiles
 * This module NEVER writes to Trey TV tables and NEVER self-grants a role
 * other than the default `fan` role (see Task 7 / the bootstrap RLS migration).
 */

const DEFAULT_MODE: TradioMode = "listener";
const DEFAULT_ROLE: TradioRole = "fan";

export type TradioTableIssue = "none" | "missing_table" | "rls_denied" | "network" | "unknown";

export type TradioBootstrapStatus =
  | "not_configured"
  | "signed_out"
  | "connected"
  | "profile_not_created"
  | "database_not_ready"
  | "setup_incomplete"
  | "error";

export type TradioBootstrapPhase =
  | "idle"
  | "fetching_bridge"
  | "creating_profile"
  | "setting_up_mode"
  | "finalizing";

export interface TradioBootstrapResult {
  identity: TradioIdentity | null;
  source: "supabase" | "mock";
  status: TradioBootstrapStatus;
  issue: TradioTableIssue;
  warnings: string[];
}

interface SupabaseErrorLike {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
  name?: string;
}

const asError = (error: unknown): SupabaseErrorLike | null => {
  if (error && typeof error === "object") return error as SupabaseErrorLike;
  if (typeof error === "string") return { message: error };
  return null;
};

/**
 * Classifies a Supabase / PostgREST error so the UI can show the right state
 * (missing table vs RLS denial vs transient network) instead of a raw message.
 */
export const handleMissingTradioTables = (
  error: unknown,
): { issue: TradioTableIssue; message: string } => {
  const err = asError(error);
  if (!err) return { issue: "none", message: "" };

  const code = (err.code || "").toUpperCase();
  const message = (err.message || "").toLowerCase();

  // Missing table / schema cache (PostgREST PGRST205, Postgres 42P01).
  if (
    code === "42P01" ||
    code === "PGRST205" ||
    code.startsWith("PGRST2") ||
    message.includes("does not exist") ||
    message.includes("schema cache") ||
    message.includes("could not find the table")
  ) {
    return {
      issue: "missing_table",
      message: err.message || "Tradio tables are not available yet.",
    };
  }

  // RLS / permission denial (Postgres 42501, PostgREST 403).
  if (
    code === "42501" ||
    message.includes("row-level security") ||
    message.includes("row level security") ||
    message.includes("permission denied") ||
    message.includes("violates row-level")
  ) {
    return {
      issue: "rls_denied",
      message: err.message || "Tradio profile write was blocked by access policy.",
    };
  }

  // Transient network failures.
  if (
    err.name === "TypeError" ||
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  ) {
    return { issue: "network", message: err.message || "Network error reaching Supabase." };
  }

  return { issue: "unknown", message: err.message || "Unknown Supabase error." };
};

const deriveUsername = (
  bridge: TreyProfileBridge | null,
  user: User | null,
  fallback: string,
): string => {
  const base = bridge?.username || user?.user_metadata?.username || fallback;
  const slug = String(base)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24);
  return slug || `tradio_${(user?.id || fallback).slice(0, 8)}`;
};

const deriveDisplayName = (bridge: TreyProfileBridge | null, user: User | null): string =>
  bridge?.display_name ||
  (user?.user_metadata?.display_name as string | undefined) ||
  (user?.user_metadata?.name as string | undefined) ||
  user?.email?.split("@")[0] ||
  "Tradio Listener";

/**
 * Ensures a tradio_profiles extension row exists for the user. Creates one
 * (linked to the Trey TV bridge when known) if missing. Never throws.
 */
export const ensureTradioProfile = async (
  userId: string,
  profileBridge: TreyProfileBridge | null,
  user: User | null = null,
  client: SupabaseClient | null = supabase,
): Promise<{
  profile: TradioProfileRow | null;
  created: boolean;
  issue: TradioTableIssue;
  warning: string | null;
}> => {
  if (!client)
    return { profile: null, created: false, issue: "none", warning: "Supabase is not configured." };

  const existing = await fetchTradioProfile(client, userId);
  if (existing.data)
    return { profile: existing.data, created: false, issue: "none", warning: existing.warning };
  if (existing.warning) {
    const { issue, message } = handleMissingTradioTables({ message: existing.warning });
    if (issue === "missing_table")
      return { profile: null, created: false, issue, warning: message };
  }

  const displayName = deriveDisplayName(profileBridge, user);
  const username = deriveUsername(profileBridge, user, displayName);

  const buildPayload = (uname: string) => ({
    user_id: userId,
    profile_id: profileBridge?.profile_id ?? null,
    public_profile_uid: profileBridge?.public_profile_uid ?? null,
    trey_tv_uid: profileBridge?.trey_tv_uid ?? null,
    display_name: displayName,
    username: uname,
    avatar_url: profileBridge?.avatar_url ?? null,
    banner_url: profileBridge?.banner_url ?? null,
    active_mode: DEFAULT_MODE,
    default_mode: DEFAULT_MODE,
  });

  let { data, error } = await client
    .from("tradio_profiles")
    .insert(buildPayload(username))
    .select("*")
    .maybeSingle();

  // Retry once on username uniqueness collision (23505) with a short suffix.
  if (error && (error as SupabaseErrorLike).code === "23505") {
    const retryName = `${username}_${userId.slice(0, 4)}`.slice(0, 24);
    ({ data, error } = await client
      .from("tradio_profiles")
      .insert(buildPayload(retryName))
      .select("*")
      .maybeSingle());
  }

  if (error) {
    const { issue, message } = handleMissingTradioTables(error);
    return { profile: null, created: false, issue, warning: message };
  }

  return {
    profile: (data as TradioProfileRow) ?? null,
    created: true,
    issue: "none",
    warning: null,
  };
};

/**
 * Ensures the user has at least one role. Self-grants ONLY the default fan role
 * when no roles exist. Elevated roles are never created here.
 */
export const ensureDefaultTradioRole = async (
  userId: string,
  role: TradioRole = DEFAULT_ROLE,
  client: SupabaseClient | null = supabase,
): Promise<{
  roles: TradioRoleGrant[];
  created: boolean;
  issue: TradioTableIssue;
  warning: string | null;
}> => {
  if (!client)
    return { roles: [], created: false, issue: "none", warning: "Supabase is not configured." };

  // Frontend may only self-grant the fan role. Anything else must come from a
  // protected backend grant path (Pass 4F), so we never attempt to write it.
  const safeRole: TradioRole = role === "fan" ? role : "fan";

  const existing = await fetchTradioRoles(client, userId);
  if (existing.data.length)
    return { roles: existing.data, created: false, issue: "none", warning: existing.warning };
  if (existing.warning) {
    const { issue, message } = handleMissingTradioTables({ message: existing.warning });
    if (issue === "missing_table") return { roles: [], created: false, issue, warning: message };
  }

  const { error } = await client
    .from("tradio_user_roles")
    .insert({ user_id: userId, role: safeRole, role_status: "active" });

  if (error) {
    const { issue, message } = handleMissingTradioTables(error);
    return { roles: [], created: false, issue, warning: message };
  }

  const refreshed = await fetchTradioRoles(client, userId);
  return { roles: refreshed.data, created: true, issue: "none", warning: refreshed.warning };
};

/**
 * Ensures the profile has a valid active/default mode. Only writes when the
 * stored value is missing or invalid, and only for the current user's row.
 */
export const ensureModeDefaults = async (
  userId: string,
  defaultMode: TradioMode = DEFAULT_MODE,
  client: SupabaseClient | null = supabase,
): Promise<{ issue: TradioTableIssue; warning: string | null }> => {
  if (!client) return { issue: "none", warning: "Supabase is not configured." };

  const { data, warning } = await fetchTradioProfile(client, userId);
  if (!data) return { issue: "none", warning };

  const validModes: TradioMode[] = ["listener", "artist", "producer", "dj", "admin"];
  const needsActive = !validModes.includes(data.active_mode as TradioMode);
  const needsDefault = !validModes.includes(data.default_mode as TradioMode);
  if (!needsActive && !needsDefault) return { issue: "none", warning: null };

  const patch: Record<string, TradioMode> = {};
  if (needsActive) patch.active_mode = defaultMode;
  if (needsDefault) patch.default_mode = defaultMode;

  const { error } = await client.from("tradio_profiles").update(patch).eq("user_id", userId);
  if (error) {
    const { issue, message } = handleMissingTradioTables(error);
    return { issue, warning: message };
  }
  return { issue: "none", warning: null };
};

/**
 * Persists the active mode for the current user only. Safe no-op (with a
 * warning) when Supabase is unconfigured or the write is blocked.
 */
export const syncActiveModeToSupabase = async (
  userId: string,
  mode: TradioMode,
  client: SupabaseClient | null = supabase,
): Promise<{ issue: TradioTableIssue; warning: string | null }> => {
  if (!client)
    return { issue: "none", warning: "Supabase is not configured; active mode stored locally." };
  const warning = await updateActiveMode(client, userId, mode);
  if (!warning) return { issue: "none", warning: null };
  const classified = handleMissingTradioTables({ message: warning });
  return { issue: classified.issue, warning: classified.message || warning };
};

/**
 * Full bootstrap orchestration for an authenticated session user. Loads the
 * Trey TV bridge, ensures a Tradio profile + default role + mode, then returns
 * a complete TradioIdentity. Always returns a usable identity (never throws);
 * the status field tells the UI what actually happened.
 */
export const bootstrapTradioIdentity = async (
  sessionUser: User | null,
  onProgress?: (phase: TradioBootstrapPhase) => void,
  client: SupabaseClient | null = supabase,
): Promise<TradioBootstrapResult> => {
  const progress = (phase: TradioBootstrapPhase) => onProgress?.(phase);

  if (!isSupabaseConfigured || !client) {
    return {
      identity: null,
      source: "mock",
      status: "not_configured",
      issue: "none",
      warnings: [],
    };
  }
  if (!sessionUser) {
    return { identity: null, source: "mock", status: "signed_out", issue: "none", warnings: [] };
  }

  const warnings: string[] = [];
  const pushWarning = (warning: string | null | undefined) => {
    if (warning) warnings.push(warning);
  };

  try {
    progress("fetching_bridge");
    const bridgeResult = await fetchTreyProfileBridge(client, sessionUser.id);
    pushWarning(bridgeResult.warning);

    progress("creating_profile");
    const profileResult = await ensureTradioProfile(
      sessionUser.id,
      bridgeResult.data,
      sessionUser,
      client,
    );
    pushWarning(profileResult.warning);

    // Roles + mode only make sense once a profile row is reachable.
    progress("setting_up_mode");
    const roleResult = await ensureDefaultTradioRole(sessionUser.id, DEFAULT_ROLE, client);
    pushWarning(roleResult.warning);

    const modeResult = await ensureModeDefaults(sessionUser.id, DEFAULT_MODE, client);
    pushWarning(modeResult.warning);

    // Re-read the full identity so the mapped result reflects any writes above.
    progress("finalizing");
    const parts = await fetchTradioIdentityParts(client, sessionUser.id);
    parts.warnings.forEach(pushWarning);
    const identity = mapSupabaseToTradioIdentity(sessionUser, parts);

    const issue: TradioTableIssue =
      profileResult.issue !== "none"
        ? profileResult.issue
        : roleResult.issue !== "none"
          ? roleResult.issue
          : modeResult.issue;

    let status: TradioBootstrapStatus;
    if (issue === "missing_table") {
      status = "database_not_ready";
    } else if (!parts.tradioProfile) {
      status = "profile_not_created";
    } else if (!parts.roles.length) {
      status = "setup_incomplete";
    } else {
      status = "connected";
    }

    return {
      identity,
      source: "supabase",
      status,
      issue,
      warnings: Array.from(new Set(warnings)),
    };
  } catch (error) {
    const { issue, message } = handleMissingTradioTables(error);
    pushWarning(message);
    // Never crash: fall back to a mapped identity with whatever the user carries.
    const identity = mapSupabaseToTradioIdentity(sessionUser, {
      treyProfile: null,
      tradioProfile: null,
      roles: [],
      roleProfiles: {},
      badges: [],
      warnings: [message],
    });
    return {
      identity,
      source: "supabase",
      status: issue === "missing_table" ? "database_not_ready" : "error",
      issue,
      warnings: Array.from(new Set(warnings)),
    };
  }
};
