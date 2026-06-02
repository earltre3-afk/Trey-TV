/**
 * TREY TV UNIVERSE — Parent bridge adapter (parent-side reference implementation).
 *
 * This is the code the PARENT Trey TV app uses to satisfy Tradio's
 * `ParentBridgeHandlers` contract and to feed REAL message/mention events into
 * the Tradio bridge. It only orchestrates parent-owned systems (router,
 * Messenger, notifications, Signal Test) — it never implements them, and never
 * creates a Tradio-local inbox / notification store / Signal Test storage.
 *
 * Mount in the parent:
 *   <MessengerBridgeProvider handlers={createParentBridgeHandlers({ navigate })}>
 *     <TradioShell />
 *   </MessengerBridgeProvider>
 */

import type { ParentBridgeHandlers } from "@/tradio/components/universe/MessengerBridgeContext";
import type { PushNotificationInput } from "@/tradio/components/universe/useTradioMessengerBridge";
import { buildMessengerDeepLink } from "@/tradio/components/universe/useTradioMessengerBridge";
import {
  createTradioMessageContext,
  type MessageContext,
  type MessageSourceSurface,
  type RoleContext,
  type SourceEntityType,
  type UniverseNotification,
} from "./messageContext";

/** Parent-owned navigation + system openers the adapter orchestrates. */
export interface ParentBridgeDeps {
  /** Parent router push (e.g. Next.js router.push / history.push). */
  navigate: (url: string) => void;
  /** Optional: open a specific Messenger thread directly (else deep link is used). */
  openMessengerThread?: (threadId: string, returnTo?: string) => void;
  /** Routes (override to match the real parent app). */
  routes?: {
    messenger?: string;
    signalTest?: string;
    notifications?: string;
    treyTvHome?: string;
  };
}

const DEFAULT_ROUTES = {
  messenger: "/messenger",
  signalTest: "/signal-test",
  notifications: "/notifications",
  treyTvHome: "/",
};

/**
 * Builds the typed handlers Tradio expects. Messenger opening preserves the
 * Tradio return path encoded in the deep link (`return_to`).
 */
export const createParentBridgeHandlers = (deps: ParentBridgeDeps): ParentBridgeHandlers => {
  const routes = { ...DEFAULT_ROUTES, ...(deps.routes ?? {}) };
  return {
    onOpenMessenger: (deepLink: string, notification: UniverseNotification) => {
      if (deps.openMessengerThread && notification.senderId) {
        deps.openMessengerThread(notification.senderId, notification.context.return_to_url);
        return;
      }
      // deepLink already carries ?thread=…&return_to=…&source=…
      deps.navigate(deepLink || routes.messenger);
    },
    onOpenSignalTest: () => deps.navigate(routes.signalTest),
    onOpenNotifications: () => deps.navigate(routes.notifications),
    onReturnToTreyTV: () => deps.navigate(routes.treyTvHome),
  };
};

/**
 * Converts a REAL parent Messenger message event into a bridge notification
 * payload (`notify(...)`). The parent calls this when a message arrives while
 * the user is inside Tradio. Mentions should use `buildMentionNotification`.
 */
export const buildMessageNotification = (event: {
  senderName: string;
  senderId: string;
  body?: string;
  surface: MessageSourceSurface;
  route?: string;
  entityType?: SourceEntityType;
  entityId?: string;
  entityTitle?: string;
  entityOwnerId?: string;
  returnToUrl?: string;
  senderRole?: RoleContext;
  recipientRole?: RoleContext;
}): PushNotificationInput => ({
  kind: "messenger_message",
  senderName: event.senderName,
  senderId: event.senderId,
  body: event.body,
  context: createTradioMessageContext({
    surface: event.surface,
    route: event.route,
    entityType: event.entityType,
    entityId: event.entityId,
    entityTitle: event.entityTitle,
    entityOwnerId: event.entityOwnerId,
    returnToUrl: event.returnToUrl,
    senderRole: event.senderRole,
    recipientRole: event.recipientRole,
  }),
});

/**
 * Converts a REAL mention-on-music-content event into a bridge notification.
 * Mentions are NOTIFICATIONS, not private messages — `kind: 'mention'`.
 */
export const buildMentionNotification = (event: {
  byName: string;
  byId?: string;
  surface: MessageSourceSurface;
  route?: string;
  entityType?: SourceEntityType;
  entityId?: string;
  entityTitle?: string;
  entityOwnerId?: string;
  returnToUrl?: string;
}): PushNotificationInput => ({
  kind: "mention",
  senderName: event.byName,
  senderId: event.byId,
  body: event.entityTitle
    ? `You were mentioned · ${event.entityTitle}`
    : "You were mentioned on Tradio content",
  context: createTradioMessageContext({
    surface: event.surface,
    route: event.route,
    entityType: event.entityType,
    entityId: event.entityId,
    entityTitle: event.entityTitle,
    entityOwnerId: event.entityOwnerId,
    returnToUrl: event.returnToUrl,
  }),
});

/** Re-export for parent convenience (deep-link shape is owned by the bridge). */
export const messengerDeepLinkFor = (notification: UniverseNotification): string =>
  buildMessengerDeepLink(notification);

/** Type guard the parent can use when normalizing incoming context. */
export const isTradioSurface = (context: MessageContext): boolean =>
  context.source_surface !== "trey_tv";
