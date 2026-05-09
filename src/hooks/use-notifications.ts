import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { createBrowserClient } from "@/lib/supabase-browser";

export type NotificationItem = {
  id: string;
  kind: "like" | "comment" | "follow" | "live" | "trey" | "boost";
  who?: { name: string; avatar: string; handle: string };
  text: string;
  time: string;
  unread: boolean;
  to?: string;
};

type SupabaseNotificationRow = {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: string;
  message: string | null;
  read_at: string | null;
  created_at: string;
  post_id: string | null;
  comment_id: string | null;
  video_id: string | null;
  metadata?: Record<string, unknown> | null;
};

type ActorProfile = {
  id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  verification_type: string | null;
};

type UseNotificationsReturn = {
  notifications: NotificationItem[];
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  loading: boolean;
};

const notificationColumns =
  "id, user_id, actor_id, type, message, read_at, created_at, post_id, comment_id, video_id, metadata";

const profileColumns = "id, display_name, username, avatar_url, verification_type";

function notificationsTable(supabase: ReturnType<typeof createBrowserClient>) {
  return (supabase as any).from("notifications");
}

export function typeToKind(type: string): NotificationItem["kind"] {
  if (type === "new_follower" || type === "user_followed") return "follow";
  if (type === "post_liked" || type === "like_on_video") return "like";
  if (type === "post_commented" || type === "comment_on_video" || type === "reply_to_comment") return "comment";
  if (type === "post_saved") return "boost";
  return "trey";
}

export function deriveText(row: SupabaseNotificationRow): string {
  if (row.message) return row.message;
  if (row.type === "post_liked" || row.type === "like_on_video") return "liked your post";
  if (row.type === "post_commented" || row.type === "comment_on_video") return "commented on your post";
  if (row.type === "reply_to_comment") return "replied to your comment";
  if (row.type === "new_follower" || row.type === "user_followed") return "started following you";
  if (row.type === "post_saved") return "saved your post";
  return "sent you a notification";
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

function actorToWho(actor?: ActorProfile): NotificationItem["who"] | undefined {
  if (!actor) return undefined;

  return {
    name: actor.display_name || actor.username || "Someone",
    avatar: actor.avatar_url || "",
    handle: actor.username || actor.id,
  };
}

function notificationToPath(row: SupabaseNotificationRow): NotificationItem["to"] {
  if (row.video_id) return `/watch/${row.video_id}`;
  if (row.post_id || row.comment_id) return "/feed";
  return undefined;
}

function mapNotification(row: SupabaseNotificationRow, actor?: ActorProfile): NotificationItem {
  return {
    id: row.id,
    kind: typeToKind(row.type),
    who: actorToWho(actor),
    text: deriveText(row),
    time: timeAgo(row.created_at),
    unread: row.read_at === null,
    to: notificationToPath(row),
  };
}

export function useNotifications(): UseNotificationsReturn {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadNotifications() {
      if (authLoading) return;

      if (!user) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const supabase = createBrowserClient();
        const { data: rows, error } = await notificationsTable(supabase)
          .select(notificationColumns)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(30);

        if (error || !rows) {
          if (mounted) setNotifications([]);
          return;
        }

        const typedRows = rows as SupabaseNotificationRow[];
        const actorIds = Array.from(
          new Set(typedRows.map((row) => row.actor_id).filter((actorId): actorId is string => Boolean(actorId))),
        );

        let actorsById = new Map<string, ActorProfile>();
        if (actorIds.length > 0) {
          const { data: actors } = await supabase.from("profiles").select(profileColumns).in("id", actorIds);
          actorsById = new Map(((actors ?? []) as ActorProfile[]).map((actor) => [actor.id, actor]));
        }

        if (mounted) {
          setNotifications(typedRows.map((row) => mapNotification(row, row.actor_id ? actorsById.get(row.actor_id) : undefined)));
        }
      } catch {
        if (mounted) setNotifications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  const unreadCount = useMemo(() => notifications.filter((notification) => notification.unread).length, [notifications]);

  const markRead = useCallback(
    (id: string) => {
      if (!user) return;

      setNotifications((current) =>
        current.map((notification) => (notification.id === id ? { ...notification, unread: false } : notification)),
      );

      const readAt = new Date().toISOString();
      void (async () => {
        try {
          await notificationsTable(createBrowserClient()).update({ read_at: readAt }).eq("id", id).eq("user_id", user.id);
        } catch {
          // Non-critical optimistic update.
        }
      })();
    },
    [user],
  );

  const markAllRead = useCallback(() => {
    if (!user) return;

    setNotifications((current) => current.map((notification) => ({ ...notification, unread: false })));

    const readAt = new Date().toISOString();
    void (async () => {
      try {
        await notificationsTable(createBrowserClient()).update({ read_at: readAt }).eq("user_id", user.id).is("read_at", null);
      } catch {
        // Non-critical optimistic update.
      }
    })();
  }, [user]);

  if (!user && !authLoading) {
    return {
      notifications: [],
      unreadCount: 0,
      markRead,
      markAllRead,
      loading: false,
    };
  }

  return {
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    loading: authLoading || loading,
  };
}
