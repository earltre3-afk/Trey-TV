// Re-export from the local front-end store. Keeps the NotificationItem type
// stable for consumers (NotificationsPopover, etc.) while swapping the
// implementation away from the broken Supabase wiring.
export type NotificationItem = {
  id: string;
  kind: "like" | "comment" | "follow" | "live" | "trey" | "boost";
  who?: { name: string; avatar: string; handle: string };
  text: string;
  time: string;
  unread: boolean;
  to?: string;
};

export { useNotifications } from "@/lib/notifications-store";
