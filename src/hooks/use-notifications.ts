import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getNotificationDuckingCallbacks } from "@/tradio/lib/notificationDuckingHelper";

export const NOTIFICATION_SOUND_URL = "/sounds/trey-notification.m4a";

const NOTIFICATION_SOUND_ENABLED_KEY = "treytv_notification_sound_enabled";
const NOTIFICATION_SOUND_DEDUPE_MS = 1200;

let lastNotificationSoundAt = 0;

function soundPreferenceKey(userId?: string | null) {
  return userId ? `${NOTIFICATION_SOUND_ENABLED_KEY}:${userId}` : NOTIFICATION_SOUND_ENABLED_KEY;
}

export function setNotificationSoundEnabled(enabled: boolean, userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(soundPreferenceKey(userId), String(enabled));
    localStorage.setItem(NOTIFICATION_SOUND_ENABLED_KEY, String(enabled));
  } catch {}
}

export function getNotificationSoundEnabled(userId?: string | null) {
  if (typeof window === "undefined") return true;
  try {
    const scoped = localStorage.getItem(soundPreferenceKey(userId));
    if (scoped === "true" || scoped === "false") return scoped === "true";
    const global = localStorage.getItem(NOTIFICATION_SOUND_ENABLED_KEY);
    if (global === "true" || global === "false") return global === "true";
  } catch {}
  return true;
}

export function playNotificationSound({
  enabled,
  userId,
  onDuck,
  onUnduck,
}: { enabled?: boolean; userId?: string | null; onDuck?: () => void; onUnduck?: () => void } = {}) {
  if (enabled === false || !getNotificationSoundEnabled(userId) || typeof Audio === "undefined") {
    return;
  }
  const now = Date.now();
  if (now - lastNotificationSoundAt < NOTIFICATION_SOUND_DEDUPE_MS) return;
  lastNotificationSoundAt = now;

  const audio = new Audio(NOTIFICATION_SOUND_URL);
  audio.volume = 0.55;

  if (onDuck) onDuck();

  audio.addEventListener(
    "ended",
    () => {
      if (onUnduck) onUnduck();
    },
    { once: true },
  );

  audio.addEventListener(
    "error",
    () => {
      if (onUnduck) onUnduck();
    },
    { once: true },
  );

  const timeoutId = window.setTimeout(() => {
    if (onUnduck) onUnduck();
  }, 3000);

  audio.play().catch((err) => {
    window.clearTimeout(timeoutId);
    if (onUnduck) onUnduck();
    console.warn("Failed to play notification sound:", err);
  });
}

export type NotificationItem = {
  id: string;
  kind: "like" | "comment" | "follow" | "live" | "trey" | "boost";
  who?: { name: string; avatar: string; handle: string; publicProfileUid?: string | null };
  text: string;
  time: string;
  unread: boolean;
  to?: string;
};

type DbActor = {
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  public_profile_uid: string | null;
};

type DbRow = {
  id: string;
  type: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
  post_id?: string | null;
  metadata?: unknown;
  actor?: DbActor | null;
};

// Cast to any for tables not in generated Database types

const db = supabase as any;

const KIND_MAP: Record<string, NotificationItem["kind"]> = {
  new_follower: "follow",
  user_followed: "follow",
  post_liked: "like",
  like_on_video: "like",
  post_commented: "comment",
  comment_on_video: "comment",
  reply_to_comment: "comment",
  post_saved: "boost",
};

function toKind(type: string): NotificationItem["kind"] {
  return KIND_MAP[type] ?? "trey";
}

function timeAgo(iso: string): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function deriveLink(row: DbRow, kind: NotificationItem["kind"]): string | undefined {
  const meta = row.metadata as Record<string, unknown> | null;
  if (meta && typeof meta.link === "string") return meta.link;
  if (row.post_id) return `/watch/${row.post_id}`;
  if (kind === "comment") return "/inbox";
  return undefined;
}

function mapRow(row: DbRow): NotificationItem {
  const kind = toKind(row.type);
  const actor = row.actor;
  const who =
    actor && actor.username
      ? {
          name: actor.display_name ?? actor.username,
          avatar: actor.avatar_url ?? "",
          handle: actor.username,
          publicProfileUid: actor.public_profile_uid ?? null,
        }
      : undefined;

  return {
    id: row.id,
    kind,
    who,
    text: row.message ?? "",
    time: timeAgo(row.created_at),
    unread: row.read_at === null,
    to: deriveLink(row, kind),
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const soundEnabledRef = useRef(true);
  const realtimeInstanceIdRef = useRef(Math.random().toString(36).slice(2));
  const realtimeSubscribeCountRef = useRef(0);

  const loadSoundPreference = useCallback(async (userId: string) => {
    soundEnabledRef.current = getNotificationSoundEnabled(userId);
    try {
      const { data, error } = await db
        .from("user_preferences")
        .select("app_settings")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) return;
      const appSettings = data?.app_settings as Record<string, unknown> | null | undefined;
      const notificationSettings = appSettings?.notifications as
        | Record<string, unknown>
        | null
        | undefined;
      const soundEnabled = notificationSettings?.sound;
      if (typeof soundEnabled === "boolean") {
        soundEnabledRef.current = soundEnabled;
        setNotificationSoundEnabled(soundEnabled, userId);
      }
    } catch {}
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe = () => {};

    const fetchForUser = async (userId: string) => {
      if (!mounted) return;
      setLoading(true);
      const { data, error } = await db
        .from("notifications")
        .select(
          `
          id, type, message, read_at, created_at
        `,
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!mounted) return;
      setLoading(false);
      if (!error && data) {
        setNotifications((data as DbRow[]).map(mapRow));
      }
    };

    let currentSubscribedUserId: string | null = null;
    let realtimeChannel: any = null;

    const subscribeToRealtimeNotifications = (userId: string) => {
      if (currentSubscribedUserId === userId) return;
      currentSubscribedUserId = userId;
      void loadSoundPreference(userId);

      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
      }

      realtimeSubscribeCountRef.current += 1;
      const topic = `realtime-notifications-${userId}-${realtimeInstanceIdRef.current}-${realtimeSubscribeCountRef.current}`;

      realtimeChannel = supabase
        .channel(topic)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchForUser(userId);
            const { onDuck, onUnduck } = getNotificationDuckingCallbacks();
            playNotificationSound({
              enabled: soundEnabledRef.current,
              userId,
              onDuck: onDuck || undefined,
              onUnduck: onUnduck || undefined,
            });
          },
        )
        .subscribe();
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchForUser(session.user.id);
        subscribeToRealtimeNotifications(session.user.id);
      }
    });

    const { data: authSub } = supabase.auth.onAuthStateChange((_event, sess) => {
      if (!mounted) return;
      if (sess?.user) {
        fetchForUser(sess.user.id);
        subscribeToRealtimeNotifications(sess.user.id);
      } else {
        setNotifications([]);
        setLoading(false);
        if (realtimeChannel) {
          realtimeChannel.unsubscribe();
          realtimeChannel = null;
        }
      }
    });

    unsubscribe = () => authSub.subscription.unsubscribe();

    return () => {
      mounted = false;
      unsubscribe();
      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
      }
    };
  }, [loadSoundPreference]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));
    await db.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id);
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    await db
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .is("read_at", null);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return { notifications, unreadCount, markRead, markAllRead, loading };
}
