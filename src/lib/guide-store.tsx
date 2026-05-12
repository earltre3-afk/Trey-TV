import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentUser } from "@/hooks/use-current-user";
import { createBrowserClient } from "@/lib/supabase-browser";

const KEY = "treytv_guide_v1";

type GuideKey = "saved" | "watchLater" | "reminders" | "mySchedule" | "watched" | "premiumUnlocked";

type ProgressItem = {
  episodeId: string;
  progress: number;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
  updatedAt: number;
};

type State = Record<GuideKey, string[]> & {
  progress: Record<string, ProgressItem>;
};

const empty: State = {
  saved: [],
  watchLater: [],
  reminders: [],
  mySchedule: [],
  watched: [],
  premiumUnlocked: [],
  progress: {},
};

type Ctx = State & {
  continueWatching: ProgressItem[];
  toggle: (key: GuideKey, id: string) => void;
  has: (key: GuideKey, id: string) => boolean;
  progressOf: (episodeId: string) => ProgressItem | null;
  recordProgress: (input: {
    episodeId: string;
    progress: number;
    progressSeconds?: number;
    durationSeconds?: number;
    showId?: string;
    channelId?: string;
    completed?: boolean;
  }) => void;
  markWatched: (episodeId: string) => void;
};

const C = createContext<Ctx | null>(null);

const guideStateType: Partial<Record<GuideKey, string>> = {
  saved: "saved",
  reminders: "reminder",
  mySchedule: "my_schedule",
  watched: "watched",
  premiumUnlocked: "premium_unlocked",
};

const arrayToggle = (arr: string[], id: string) => arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

export function GuideProvider({ children }: { children: ReactNode }) {
  const { user: supabaseUser } = useAuth();
  const currentUser = useCurrentUser();
  const [state, setState] = useState<State>(empty);
  const storageKey = `${KEY}:${currentUser.uid}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setState(raw ? { ...empty, ...JSON.parse(raw) } : empty);
    } catch {
      setState(empty);
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, storageKey]);

  useEffect(() => {
    if (!supabaseUser) return;
    let cancelled = false;

    const load = async () => {
      try {
        const supabase = createBrowserClient();
        const [guideResult, laterResult, savedResult, progressResult] = await Promise.all([
          (supabase as any)
            .from("user_guide_items")
            .select("episode_id, state_type")
            .eq("user_id", supabaseUser.id),
          (supabase as any)
            .from("user_watch_later")
            .select("episode_id")
            .eq("user_id", supabaseUser.id),
          (supabase as any)
            .from("user_saved_items")
            .select("target_id")
            .eq("user_id", supabaseUser.id)
            .eq("target_type", "episode"),
          (supabase as any)
            .from("user_video_progress")
            .select("episode_id, progress_seconds, duration_seconds, progress_ratio, completed, updated_at, last_watched_at")
            .eq("user_id", supabaseUser.id)
            .order("last_watched_at", { ascending: false }),
        ]);

        if (guideResult.error || laterResult.error || savedResult.error || progressResult.error) {
          throw guideResult.error || laterResult.error || savedResult.error || progressResult.error;
        }
        if (cancelled) return;

        const next: State = { ...empty, progress: {} };
        ((guideResult.data ?? []) as any[]).forEach((row) => {
          if (row.state_type === "saved") next.saved.push(row.episode_id);
          if (row.state_type === "reminder") next.reminders.push(row.episode_id);
          if (row.state_type === "my_schedule") next.mySchedule.push(row.episode_id);
          if (row.state_type === "watched") next.watched.push(row.episode_id);
          if (row.state_type === "premium_unlocked") next.premiumUnlocked.push(row.episode_id);
        });
        ((laterResult.data ?? []) as any[]).forEach((row) => next.watchLater.push(row.episode_id));
        ((savedResult.data ?? []) as any[]).forEach((row) => {
          if (!next.saved.includes(row.target_id)) next.saved.push(row.target_id);
        });
        ((progressResult.data ?? []) as any[]).forEach((row) => {
          next.progress[row.episode_id] = {
            episodeId: row.episode_id,
            progress: Number(row.progress_ratio ?? 0),
            progressSeconds: Number(row.progress_seconds ?? 0),
            durationSeconds: Number(row.duration_seconds ?? 0),
            completed: !!row.completed,
            updatedAt: new Date(row.last_watched_at ?? row.updated_at).getTime(),
          };
          if (row.completed && !next.watched.includes(row.episode_id)) next.watched.push(row.episode_id);
        });

        setState(next);
      } catch (error) {
        console.error("Failed to load UID guide/watch state:", error);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabaseUser?.id]);

  const persistToggle = async (key: GuideKey, id: string, active: boolean) => {
    if (!supabaseUser) return;
    const supabase = createBrowserClient();

    if (key === "watchLater") {
      const result = active
        ? await (supabase as any).from("user_watch_later").upsert({ user_id: supabaseUser.id, episode_id: id }, { onConflict: "user_id,episode_id" })
        : await (supabase as any).from("user_watch_later").delete().eq("user_id", supabaseUser.id).eq("episode_id", id);
      if (result.error) throw result.error;
      return;
    }

    if (key === "saved") {
      const savedResult = active
        ? await (supabase as any).from("user_saved_items").upsert({ user_id: supabaseUser.id, target_type: "episode", target_id: id }, { onConflict: "user_id,target_type,target_id" })
        : await (supabase as any).from("user_saved_items").delete().eq("user_id", supabaseUser.id).eq("target_type", "episode").eq("target_id", id);
      if (savedResult.error) throw savedResult.error;
    }

    const stateType = guideStateType[key];
    if (!stateType) return;

    const guideResult = active
      ? await (supabase as any).from("user_guide_items").upsert({ user_id: supabaseUser.id, episode_id: id, state_type: stateType }, { onConflict: "user_id,episode_id,state_type" })
      : await (supabase as any).from("user_guide_items").delete().eq("user_id", supabaseUser.id).eq("episode_id", id).eq("state_type", stateType);
    if (guideResult.error) throw guideResult.error;
  };

  const value = useMemo<Ctx>(() => {
    const continueWatching = Object.values(state.progress)
      .filter((item) => !item.completed && item.progress > 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 12);

    const toggle: Ctx["toggle"] = (key, id) => {
      const active = !state[key].includes(id);
      setState((s) => ({ ...s, [key]: arrayToggle(s[key], id) }));
      void persistToggle(key, id, active).catch((error) => console.error("Failed to persist guide item:", error));
    };

    const recordProgress: Ctx["recordProgress"] = (input) => {
      const ratio = Math.min(1, Math.max(0, input.completed ? 1 : input.progress));
      const completed = input.completed || ratio >= 0.92;
      const item: ProgressItem = {
        episodeId: input.episodeId,
        progress: ratio,
        progressSeconds: Math.max(0, Math.round(input.progressSeconds ?? ratio * (input.durationSeconds ?? 0))),
        durationSeconds: Math.max(0, Math.round(input.durationSeconds ?? 0)),
        completed,
        updatedAt: Date.now(),
      };

      setState((s) => ({
        ...s,
        watched: completed && !s.watched.includes(input.episodeId) ? [...s.watched, input.episodeId] : s.watched,
        progress: { ...s.progress, [input.episodeId]: item },
      }));

      if (!supabaseUser) return;
      void (async () => {
        try {
          const supabase = createBrowserClient();
          const payload = {
            user_id: supabaseUser.id,
            episode_id: input.episodeId,
            show_id: input.showId ?? null,
            channel_id: input.channelId ?? null,
            progress_seconds: item.progressSeconds,
            duration_seconds: item.durationSeconds,
            progress_ratio: item.progress,
            completed,
            last_watched_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          const { error } = await (supabase as any)
            .from("user_video_progress")
            .upsert(payload, { onConflict: "user_id,episode_id" });
          if (error) throw error;

          await (supabase as any).from("user_watch_history").insert({
            user_id: supabaseUser.id,
            episode_id: input.episodeId,
            show_id: input.showId ?? null,
            channel_id: input.channelId ?? null,
            progress_seconds: item.progressSeconds,
            duration_seconds: item.durationSeconds,
            progress_ratio: item.progress,
            completed_at: completed ? new Date().toISOString() : null,
          });

          if (completed) {
            await persistToggle("watched", input.episodeId, true);
          }
        } catch (error) {
          console.error("Failed to persist watch progress:", error);
        }
      })();
    };

    return {
      ...state,
      continueWatching,
      toggle,
      has: (key, id) => state[key].includes(id),
      progressOf: (episodeId) => state.progress[episodeId] ?? null,
      recordProgress,
      markWatched: (episodeId) => recordProgress({ episodeId, progress: 1, completed: true }),
    };
  }, [state, supabaseUser?.id]);

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useGuide() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("useGuide must be inside <GuideProvider>");
  return ctx;
}
