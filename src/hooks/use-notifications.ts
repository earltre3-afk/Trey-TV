import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const NOTIFICATION_SOUND_URL = "https://cdn.builder.io/o/assets%2Fde09f3f7574845d786350acb13c952c1%2F32523e9715b543b19bd8d9c6afcae18d?alt=media&token=84a0b8f2-6544-441c-a3a8-e738cac1510d&apiKey=de09f3f7574845d786350acb13c952c1";

export function playNotificationSound() {
  const audio = new Audio(NOTIFICATION_SOUND_URL);
  audio.volume = 0.55;
  audio.play().catch((err) => {
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
  post_id: string | null;
  metadata: unknown;
  actor: DbActor | null;
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
          id, type, message, read_at, created_at, post_id, metadata,
          actor:profiles!notifications_actor_id_fkey(public_profile_uid, display_name, username, avatar_url)
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

      if (realtimeChannel) {
        realtimeChannel.unsubscribe();
      }

      realtimeChannel = supabase
        .channel(`realtime-notifications-${userId}`)
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
            playNotificationSound();
          }
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
  }, []);

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
