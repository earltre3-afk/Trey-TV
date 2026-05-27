import React from 'react';
import { GlassPanel, FocusButton } from './Primitives';
import { Loader2, WifiOff, AlertTriangle, Inbox } from 'lucide-react';

// Loading shimmer row (TV-safe)
export const LoadingRow: React.FC<{ title?: string }> = ({ title = 'Loading...' }) => (
  <section className="mb-8">
    <div className="text-2xl font-bold mb-3">{title}</div>
    <div className="flex gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="w-[280px] h-[160px] rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-fuchsia-500/15 to-transparent" />
        </div>
      ))}
    </div>
    <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
  </section>
);

export const EmptyState: React.FC<{ title?: string; message?: string }> = ({
  title = 'Nothing here yet',
  message = 'Start watching or playing to see your activity here.',
}) => (
  <GlassPanel className="p-10 text-center">
    <Inbox className="w-14 h-14 text-fuchsia-400 mx-auto mb-3" />
    <div className="text-xl font-black">{title}</div>
    <div className="text-sm text-white/60 mt-1">{message}</div>
  </GlassPanel>
);

export const ErrorState: React.FC<{ onRetry?: () => void; title?: string; message?: string }> = ({
  onRetry,
  title = 'Content unavailable',
  message = 'We hit a snag loading this. Check your connection and try again.',
}) => (
  <GlassPanel className="p-10 text-center max-w-xl mx-auto">
    <WifiOff className="w-14 h-14 text-red-400 mx-auto mb-3" />
    <div className="text-xl font-black">{title}</div>
    <div className="text-sm text-white/60 mt-1 mb-4">{message}</div>
    <FocusButton variant="primary" onClick={onRetry} autoFocus>Retry</FocusButton>
  </GlassPanel>
);

export const LoadingSpinner: React.FC<{ label?: string }> = ({ label = 'Loading Trey TV...' }) => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-[#05050A] text-white">
    <Loader2 className="w-14 h-14 text-fuchsia-400 animate-spin" />
    <div className="mt-4 text-lg font-bold">{label}</div>
  </div>
);

export const RestrictedState: React.FC = () => (
  <GlassPanel className="p-10 text-center max-w-xl mx-auto">
    <AlertTriangle className="w-14 h-14 text-amber-300 mx-auto mb-3" />
    <div className="text-xl font-black">Sign in to continue</div>
    <div className="text-sm text-white/60 mt-1 mb-4">This area requires an active Trey TV account.</div>
    <FocusButton variant="primary" autoFocus>Activate Device</FocusButton>
  </GlassPanel>
);
