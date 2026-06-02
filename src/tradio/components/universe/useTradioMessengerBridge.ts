import { useCallback, useMemo, useState } from "react";
import {
  buildAboutLabel,
  buildDisplayContextLabel,
  MESSENGER_COPY,
  type MessageContext,
  type UniverseNotification,
} from "@/tradio/lib/universe/messageContext";

/**
 * TREY TV UNIVERSE — Tradio Messenger bridge (state only; no separate inbox).
 *
 * Holds the lightweight bridge notifications shown INSIDE Tradio for new Trey TV
 * Messenger messages / mentions. It never stores conversations — it only signals
 * "you have a new Trey TV Messenger message" and deep-links into Messenger while
 * preserving the Tradio page the user was on. Mock/local; the parent wires the
 * real Messenger + notification backbone behind `onOpenMessenger`.
 */

let bridgeIdCounter = 0;
const nextId = () => `bridge-${Date.now()}-${(bridgeIdCounter += 1)}`;

export interface PushNotificationInput {
  kind?: UniverseNotification["kind"];
  senderName?: string;
  senderId?: string;
  body?: string;
  context: MessageContext;
}

/** Builds the Trey TV Messenger deep link, preserving where to return in Tradio. */
export const buildMessengerDeepLink = (notification: UniverseNotification): string => {
  const params = new URLSearchParams();
  if (notification.senderId) params.set("thread", notification.senderId);
  if (notification.context.return_to_url)
    params.set("return_to", notification.context.return_to_url);
  if (notification.context.source_surface)
    params.set("source", notification.context.source_surface);
  const query = params.toString();
  return `/messenger${query ? `?${query}` : ""}`;
};

export interface TradioMessengerBridge {
  notifications: UniverseNotification[];
  unreadCount: number;
  /** Newest unread notification — drives the toast. */
  latest: UniverseNotification | null;
  push: (input: PushNotificationInput) => UniverseNotification;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  /** Opens Trey TV Messenger (via the provided navigate fn) and marks read. */
  openInMessenger: (notification: UniverseNotification) => void;
}

export const useTradioMessengerBridge = (
  options: {
    onOpenMessenger?: (deepLink: string, notification: UniverseNotification) => void;
    seed?: UniverseNotification[];
  } = {},
): TradioMessengerBridge => {
  const [notifications, setNotifications] = useState<UniverseNotification[]>(options.seed ?? []);

  const push = useCallback((input: PushNotificationInput): UniverseNotification => {
    const aboutLabel = buildAboutLabel(input.context);
    const notification: UniverseNotification = {
      id: nextId(),
      kind: input.kind ?? "messenger_message",
      livesInTreyTvMessenger: true,
      title: input.senderName
        ? MESSENGER_COPY.fromSender(input.senderName)
        : MESSENGER_COPY.newMessage,
      body: input.body ?? aboutLabel ?? buildDisplayContextLabel(input.context),
      senderName: input.senderName,
      senderId: input.senderId,
      createdAt: new Date().toISOString(),
      read: false,
      context: input.context,
    };
    setNotifications((current) => [notification, ...current]);
    return notification;
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((current) => current.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((current) => current.filter((n) => n.id !== id));
  }, []);

  const openInMessenger = useCallback(
    (notification: UniverseNotification) => {
      markRead(notification.id);
      options.onOpenMessenger?.(buildMessengerDeepLink(notification), notification);
    },
    [markRead, options],
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
  const latest = useMemo(() => notifications.find((n) => !n.read) ?? null, [notifications]);

  return {
    notifications,
    unreadCount,
    latest,
    push,
    markRead,
    markAllRead,
    dismiss,
    openInMessenger,
  };
};
