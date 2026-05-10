import { useSyncExternalStore, useCallback } from "react";
import { creators } from "@/lib/mock-data";
import type { NotificationItem } from "@/hooks/use-notifications";

const STORAGE_KEY = "treytv_notifications_v1";

type StoredNotif = NotificationItem & { ts: number };

function seed(): StoredNotif[] {
  const now = Date.now();
  const m = (n: number) => now - n * 60_000;
  return [
    { id: "n1", kind: "live", who: creators[0], text: "is live now — 'Studio Sessions Vol. 4'", time: "now", unread: true, to: "/explore", ts: m(0) },
    { id: "n2", kind: "trey", text: "Trey-I prescribed 6 fresh picks based on your mood", time: "2m", unread: true, to: "/prescribe-me", ts: m(2) },
    { id: "n3", kind: "like", who: creators[1], text: "and 312 others liked your post", time: "12m", unread: true, ts: m(12) },
    { id: "n4", kind: "comment", who: creators[2], text: "commented on your post", time: "44m", unread: true, to: "/inbox", ts: m(44) },
    { id: "n5", kind: "follow", who: creators[3], text: "started following you", time: "1h", unread: true, ts: m(60) },
    { id: "n6", kind: "boost", text: "Your post hit 10K views — boost unlocked", time: "3h", unread: true, to: "/analytics", ts: m(180) },
    { id: "n7", kind: "comment", who: creators[4], text: "tagged you in a reply", time: "5h", unread: true, to: "/inbox", ts: m(300) },
    { id: "n8", kind: "follow", who: creators[0], text: "shared your show with their audience", time: "1d", unread: false, ts: m(60 * 24) },
  ];
}

function timeAgo(ts: number): string {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function load(): StoredNotif[] {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as StoredNotif[];
  } catch {
    return seed();
  }
}

let state: StoredNotif[] = load();
const listeners = new Set<() => void>();

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}
function emit() {
  persist();
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => { listeners.delete(l); };
};

const getSnapshot = () => state;
const getServerSnapshot = () => state;

// Cross-tab sync
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      try {
        state = JSON.parse(e.newValue);
        listeners.forEach((l) => l());
      } catch {}
    }
  });
}

export function useNotifications() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const markRead = useCallback((id: string) => {
    state = state.map((n) => (n.id === id ? { ...n, unread: false } : n));
    emit();
  }, []);

  const markAllRead = useCallback(() => {
    state = state.map((n) => ({ ...n, unread: false }));
    emit();
  }, []);

  const remove = useCallback((id: string) => {
    state = state.filter((n) => n.id !== id);
    emit();
  }, []);

  const clearAll = useCallback(() => {
    state = [];
    emit();
  }, []);

  const add = useCallback((n: Omit<NotificationItem, "time" | "unread"> & { unread?: boolean }) => {
    const ts = Date.now();
    state = [{ ...n, ts, time: "now", unread: n.unread ?? true } as StoredNotif, ...state];
    emit();
  }, []);

  // Refresh "time" strings from ts
  const notifications: NotificationItem[] = items.map((n) => ({
    ...n,
    time: n.ts ? timeAgo(n.ts) : n.time,
  }));

  const unreadCount = notifications.filter((n) => n.unread).length;

  return { notifications, unreadCount, markRead, markAllRead, remove, clearAll, add, loading: false };
}
