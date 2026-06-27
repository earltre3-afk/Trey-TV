import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Home, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const TradioStudioDAW = lazy(() => import('@/tradio/components/daw/TradioStudioDAW'));

export const Route = createFileRoute('/tradio/daw')({
  component: TradioDawRoute,
  head: () => ({
    meta: [
      { title: 'Tradio Studio DAW · Trey TV' },
      { name: 'description', content: 'Live inline Tradio Studio DAW inside Trey TV.' },
    ],
  }),
});

function TradioDawRoute() {
  const [mounted, setMounted] = useState(false);
  const { isGuest, authReady } = useAuth();
  const navigate = useNavigate();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && authReady && isGuest) navigate({ to: '/login' });
  }, [mounted, authReady, isGuest, navigate]);

  if (!mounted || !authReady || isGuest) {
    return <div className="min-h-screen w-full bg-[#05040a]" />;
  }

  return (
    <div className="min-h-screen w-full bg-[#05040a] text-white">
      <Link
        to="/tradio"
        className="fixed left-3 top-3 z-[60] hidden items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3 py-2 text-xs font-black uppercase tracking-wider text-white/80 backdrop-blur-xl transition hover:bg-white/10 sm:flex"
      >
        <Home className="h-3.5 w-3.5 text-fuchsia-300" />
        Tradio
      </Link>
      <Suspense
        fallback={
          <div className="grid min-h-screen place-items-center bg-[#05040a] text-white">
            <div className="flex items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-bold text-white/70">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
              Loading Tradio Studio DAW
            </div>
          </div>
        }
      >
        <TradioStudioDAW />
      </Suspense>
    </div>
  );
}
