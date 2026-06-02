import { createContext, useContext } from 'react';
import type { PushNotificationInput } from './useTradioMessengerBridge';
import type { UniverseNotification } from '@/tradio/lib/universe/messageContext';

/**
 * TREY TV UNIVERSE — Messenger bridge context + hook (no components here).
 *
 * Split out of the provider so the provider file can export only its component
 * (keeps React fast-refresh happy). The provider lives in
 * `MessengerBridgeProvider.tsx`; surfaces consume the bridge via `useMessengerBridge()`.
 */

/**
 * Handlers the PARENT Trey TV app passes into Tradio so the bridge becomes real.
 * All optional — Tradio runs dev-safe without them. Tradio never implements these;
 * it only calls them. This is the explicit handoff surface for the parent repo.
 */
export interface ParentBridgeHandlers {
  /** Open the real Trey TV Messenger at a deep link (thread + return path encoded). */
  onOpenMessenger?: (deepLink: string, notification: UniverseNotification) => void;
  /** Route to the parent Signal Test flow (/signal-test). */
  onOpenSignalTest?: () => void;
  /** Open the parent global notifications surface. */
  onOpenNotifications?: () => void;
  /** Return the user to the Trey TV hub from Tradio. */
  onReturnToTreyTV?: () => void;
}

export interface MessengerBridgeContextValue {
  unreadCount: number;
  notifications: UniverseNotification[];
  notify: (input: PushNotificationInput) => UniverseNotification;
  openPreview: () => void;
  openInMessenger: (n: UniverseNotification) => void;
  /** Parent-provided handlers (undefined fields fall back to dev-safe no-ops). */
  parentHandlers: ParentBridgeHandlers;
}

export const MessengerBridgeContext = createContext<MessengerBridgeContextValue | null>(null);

/** Null-safe accessor so surfaces work even if the provider isn't mounted. */
export const useMessengerBridge = (): MessengerBridgeContextValue | null => useContext(MessengerBridgeContext);
