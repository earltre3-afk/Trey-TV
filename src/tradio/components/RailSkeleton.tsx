import React from 'react';

export const CardSkeleton: React.FC = () => (
  <div className="shrink-0">
    <div className="w-[clamp(120px,11vw,180px)] aspect-square rounded-2xl bg-white/5 animate-pulse" />
    <div className="mt-2 h-3 w-3/4 rounded bg-white/5 animate-pulse" />
    <div className="mt-1.5 h-2.5 w-1/2 rounded bg-white/5 animate-pulse" />
  </div>
);

export const RailSkeleton: React.FC<{ title: string; count?: number }> = ({ title, count = 6 }) => (
  <section className="mb-6">
    <h2 className="text-white font-semibold text-[clamp(18px,1.8vw,28px)] mb-3">{title}</h2>
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  </section>
);

export const EmptyState: React.FC<{ message?: string }> = ({ message = 'No content yet' }) => (
  <div className="flex items-center justify-center py-16">
    <p className="text-white/40 text-[clamp(14px,1.3vw,20px)]">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <p className="text-white/60 text-[clamp(14px,1.3vw,20px)]">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="bg-white text-black font-semibold rounded-full px-6 py-2 hover:bg-white/90 transition">
        Retry
      </button>
    )}
  </div>
);
