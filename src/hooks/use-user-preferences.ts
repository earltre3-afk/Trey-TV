import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-current-user";

type JsonObject = Record<string, unknown>;

export type UserPreferences = {
  profile_preferences: JsonObject;
  feed_preferences: JsonObject;
  inbox_preferences: JsonObject;
  rewards_preferences: JsonObject;
  prescribe_preferences: JsonObject;
  app_settings: JsonObject;
};

const emptyPreferences: UserPreferences = {
  profile_preferences: {},
  feed_preferences: {},
  inbox_preferences: {},
  rewards_preferences: {},
  prescribe_preferences: {},
  app_settings: {},
};

const KEY = "treytv_user_preferences_v1";

export function useUserPreferences() {
  const { user: supabaseUser, authReady } = useAuth();
  const loading = !authReady;
  const currentUser = useCurrentUser();
  const [preferences, setPreferences] = useState<UserPreferences>(emptyPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const storageKey = `${KEY}:${currentUser.uid}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setPreferences(raw ? { ...emptyPreferences, ...JSON.parse(raw) } : emptyPreferences);
    } catch {
      setPreferences(emptyPreferences);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {}
  }, [preferences, storageKey]);

  const load = useCallback(async () => {
    if (loading || !supabaseUser) return;
    setIsLoading(true);
    try {
      const supabase = createBrowserClient();
      try {
        await (supabase as any).rpc("ensure_user_preferences", { _user_id: supabaseUser.id });
      } catch (rpcError: any) {
        console.warn(
          "RPC ensure_user_preferences failed, proceeding with direct query:",
          rpcError?.message || rpcError,
        );
      }
      const { data, error } = await (supabase as any)
        .from("user_preferences")
        .select(
          "profile_preferences, feed_preferences, inbox_preferences, rewards_preferences, prescribe_preferences, app_settings",
        )
        .eq("user_id", supabaseUser.id)
        .maybeSingle();

      if (error) throw error;
      setPreferences({ ...emptyPreferences, ...(data ?? {}) });
    } catch (error: any) {
      console.error("Failed to load UID preferences:", error?.message || error);
    } finally {
      setIsLoading(false);
    }
  }, [loading, supabaseUser?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateSection = useCallback(
    async <K extends keyof UserPreferences>(section: K, patch: JsonObject) => {
      setPreferences((prev) => ({
        ...prev,
        [section]: { ...(prev[section] ?? {}), ...patch },
      }));

      if (!supabaseUser) return;

      try {
        const supabase = createBrowserClient();
        const nextSection = { ...(preferences[section] ?? {}), ...patch };
        const { error } = await (supabase as any).from("user_preferences").upsert(
          {
            user_id: supabaseUser.id,
            public_profile_uid: currentUser.uid,
            [section]: nextSection,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (error) throw error;
      } catch (error: any) {
        console.error("Failed to save UID preferences:", error?.message || error);
      }
    },
    [currentUser.uid, preferences, supabaseUser?.id],
  );

  return { preferences, updateSection, loading: loading || isLoading, reload: load };
}
