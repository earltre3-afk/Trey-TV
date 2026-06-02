import React from 'react';
import { ArrowUpRight, Bell, CornerUpLeft, MessageCircle, X } from 'lucide-react';
import { GlassCard } from '../tradio/ui';
import { buildAboutLabel, buildDisplayContextLabel, MESSENGER_COPY, type UniverseNotification } from '@/tradio/lib/universe/messageContext';

/**
 * TREY TV UNIVERSE — Tradio Messenger bridge UI (NOT a separate inbox).
 *
 * These presentational components surface Trey TV Messenger / mention events
 * inside Tradio and deep-link into the ONE Messenger while preserving the user's
 * Tradio return path. They explicitly communicate that Tradio has no separate
 * inbox. Wire them to `useTradioMessengerBridge`. Components-only file.
 */

const ContextLabel: React.FC<{ notification: UniverseNotification }> = ({ notification }) => {
  const about = buildAboutLabel(notification.context);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <span className="rounded-full border border-cyan-300/25 bg-cyan-500/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-cyan-200">
        {buildDisplayContextLabel(notification.context)}
      </span>
      {about && (
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/55">
          {about}
        </span>
      )}
    </span>
  );
};

/** Transient toast shown inside Tradio when a new Messenger message arrives. */
export const TradioMessengerToast: React.FC<{
  notification: UniverseNotification;
  onOpen: (n: UniverseNotification) => void;
  onDismiss: (id: string) => void;
}> = ({ notification, onOpen, onDismiss }) => (
  <GlassCard glow className="w-[330px] max-w-[92vw] p-3.5">
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-fuchsia-300/25 bg-fuchsia-500/10 text-fuchsia-200">
        <MessageCircle className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="truncate text-sm font-bold text-white">{notification.title}</div>
          <button onClick={() => onDismiss(notification.id)} aria-label="Dismiss" className="text-white/40 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-0.5 text-[11px] text-white/55">{MESSENGER_COPY.newMessage}</div>
        <div className="mt-2"><ContextLabel notification={notification} /></div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => onOpen(notification)} className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-1.5 text-[11px] font-bold text-white">
            {MESSENGER_COPY.openInMessenger} <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => onDismiss(notification.id)} className="inline-flex items-center gap-1 rounded-full border border-white/12 px-3 py-1.5 text-[11px] font-bold text-white/70 hover:text-white">
            <CornerUpLeft className="h-3.5 w-3.5" /> {MESSENGER_COPY.returnToTradio}
          </button>
        </div>
      </div>
    </div>
  </GlassCard>
);

/** Bell with unread count for the Tradio top bar. */
export const TradioMessengerBell: React.FC<{ unreadCount: number; onClick?: () => void }> = ({ unreadCount, onClick }) => (
  <button
    onClick={onClick}
    aria-label={`Trey TV Messenger${unreadCount ? ` (${unreadCount} new)` : ''}`}
    className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white hover:border-white/25 transition"
  >
    <Bell className="h-4.5 w-4.5" />
    {unreadCount > 0 && (
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-[9px] font-black text-white">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    )}
  </button>
);

/**
 * Lightweight Messenger PREVIEW (read-only bridge) — lists recent bridge
 * notifications and routes into Trey TV Messenger. It is NOT an inbox: it never
 * shows threads or composes; it opens the real Messenger.
 */
export const TradioMessengerPreview: React.FC<{
  notifications: UniverseNotification[];
  onOpen: (n: UniverseNotification) => void;
  onOpenMessengerHome?: () => void;
}> = ({ notifications, onOpen, onOpenMessengerHome }) => (
  <GlassCard className="p-4">
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <MessageCircle className="h-4 w-4 text-fuchsia-300" /> Trey TV Messenger
      </div>
      <button onClick={onOpenMessengerHome} className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 hover:text-cyan-200">
        {MESSENGER_COPY.openInMessenger} <ArrowUpRight className="h-3.5 w-3.5" />
      </button>
    </div>
    <p className="mt-1 text-[11px] text-white/45">{MESSENGER_COPY.noSeparateInbox}</p>
    <div className="mt-3 space-y-2">
      {notifications.length === 0 && (
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-4 text-center text-[11px] text-white/45">No new messages.</div>
      )}
      {notifications.slice(0, 5).map((n) => (
        <button
          key={n.id}
          onClick={() => onOpen(n)}
          className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${n.read ? 'border-white/8 bg-white/[0.02]' : 'border-fuchsia-300/20 bg-fuchsia-500/[0.06]'}`}
        >
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/70">
            <MessageCircle className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-bold text-white">{n.title}</div>
            {n.body && <div className="truncate text-[11px] text-white/55">{n.body}</div>}
            <div className="mt-1.5"><ContextLabel notification={n} /></div>
          </div>
        </button>
      ))}
    </div>
  </GlassCard>
);
