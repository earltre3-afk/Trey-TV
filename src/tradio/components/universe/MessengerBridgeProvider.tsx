import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTradioMessengerBridge, type PushNotificationInput } from './useTradioMessengerBridge';
import { TradioMessengerPreview, TradioMessengerToast } from './TradioMessengerBridge';
import { MessengerBridgeContext, type MessengerBridgeContextValue, type ParentBridgeHandlers } from './MessengerBridgeContext';
import { createTradioMessageContext, MESSENGER_COPY, type UniverseNotification } from '@/tradio/lib/universe/messageContext';

/**
 * TREY TV UNIVERSE — Tradio Messenger bridge provider (component only).
 *
 * Owns the bridge state, renders the global toast + a read-only preview drawer
 * (opened by the bell), and exposes `notify()` via context so any Tradio surface
 * can raise a "New message in Trey TV Messenger" signal.
 *
 * There is NO local inbox. The parent Trey TV app supplies `handlers` (see
 * `ParentBridgeHandlers`) to make the bridge real; until then it falls back to a
 * dev-safe no-op and the UI clearly states messages live in Trey TV Messenger.
 *
 * Context + hook live in `MessengerBridgeContext.ts` (so this file exports only a
 * component — React fast-refresh friendly).
 */

/** One demo bridge notification so the bell/preview have content (read = not intrusive). */
const seedNotifications = (): UniverseNotification[] => [{
  id: 'bridge-seed-1',
  kind: 'messenger_message',
  livesInTreyTvMessenger: true,
  title: MESSENGER_COPY.fromSender('Mila Rain'),
  body: 'About: Velvet Midnight premiere',
  senderName: 'Mila Rain',
  senderId: 'treytv_artist_mila_rain',
  createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  read: true,
  context: createTradioMessageContext({
    surface: 'artist_profile',
    route: '/tradio/artist/mila-rain',
    entityType: 'artist',
    entityTitle: 'Velvet Midnight premiere',
    returnToUrl: '/tradio',
  }),
}];

export const MessengerBridgeProvider: React.FC<{
  children: React.ReactNode;
  /** Parent Trey TV handlers. Omit during standalone Tradio dev. */
  handlers?: ParentBridgeHandlers;
}> = ({ children, handlers }) => {
  const fallbackOpen = useCallback((deepLink: string) => {
    // Parent Trey TV app wires the real Messenger here. Dev-safe no-op otherwise.
    if (import.meta.env.DEV) console.info('[MessengerBridge] open Trey TV Messenger →', deepLink);
  }, []);

  const handleOpenMessenger = handlers?.onOpenMessenger ?? fallbackOpen;
  const bridge = useTradioMessengerBridge({ onOpenMessenger: handleOpenMessenger, seed: seedNotifications() });
  const [toast, setToast] = useState<UniverseNotification | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const notify = useCallback((input: PushNotificationInput) => {
    const n = bridge.push(input);
    setToast(n);
    return n;
  }, [bridge]);

  // Auto-dismiss the toast after a few seconds.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  const value = useMemo<MessengerBridgeContextValue>(() => ({
    unreadCount: bridge.unreadCount,
    notifications: bridge.notifications,
    notify,
    openPreview: () => setPreviewOpen(true),
    openInMessenger: bridge.openInMessenger,
    parentHandlers: handlers ?? {},
  }), [bridge.unreadCount, bridge.notifications, bridge.openInMessenger, notify, handlers]);

  return (
    <MessengerBridgeContext.Provider value={value}>
      {children}

      {/* Global toast (only for messages raised this session) */}
      {toast && (
        <div className="pointer-events-auto fixed bottom-[calc(13rem+env(safe-area-inset-bottom))] right-4 z-[60] lg:bottom-6 lg:right-6">
          <TradioMessengerToast
            notification={toast}
            onOpen={(n) => { bridge.openInMessenger(n); setToast(null); }}
            onDismiss={() => setToast(null)}
          />
        </div>
      )}

      {/* Read-only preview drawer (NOT an inbox) */}
      {previewOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/70 backdrop-blur-sm" onClick={() => setPreviewOpen(false)}>
          <div className="h-full w-full max-w-sm overflow-y-auto border-l border-white/10 bg-[#0A0A0F]/95 p-4 pt-[max(1.5rem,env(safe-area-inset-top))]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-black uppercase tracking-wider text-white/70">Messenger · Preview</div>
              <button onClick={() => setPreviewOpen(false)} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white hover:border-white/25">
                <X className="h-4 w-4" />
              </button>
            </div>
            <TradioMessengerPreview
              notifications={bridge.notifications}
              onOpen={(n) => { bridge.openInMessenger(n); setPreviewOpen(false); }}
              onOpenMessengerHome={() => { fallbackOpen('/messenger'); setPreviewOpen(false); }}
            />
          </div>
        </div>
      )}
    </MessengerBridgeContext.Provider>
  );
};

export default MessengerBridgeProvider;
