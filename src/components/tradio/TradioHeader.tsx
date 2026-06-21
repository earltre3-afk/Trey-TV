import React from 'react';
import { Bell, ArrowLeft } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import TradioLogo from './TradioLogo';
import SegmentedPillNav from './SegmentedPillNav';
import { useTradioIdentity } from '@/tradio/contexts/TradioIdentityContext';

interface TradioHeaderProps {
  tabs?: string[];
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showBack?: boolean;
}

export default function TradioHeader({
  tabs = ['Home', 'Browse'],
  activeTab = 'Home',
  onTabChange = () => {},
}: TradioHeaderProps) {
  const { identity } = useTradioIdentity();
  return (
    <div className="sticky top-0 z-30 px-4 pt-3 pb-3 bg-black/70 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Link
            to="/"
            className="flex items-center justify-center w-9 h-9 rounded-full bg-white/[0.06] border border-white/10 hover:bg-white/[0.12] active:scale-95 transition text-white/80 hover:text-white"
            title="Back to Trey TV"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <TradioLogo />
        </div>
        <SegmentedPillNav tabs={tabs} active={activeTab} onChange={onTabChange} />
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-full text-white/70 active:opacity-60">
            <Bell className="w-5 h-5" />
          </button>
          <img
            src={identity.avatarUrl}
            alt={identity.displayName}
            className="w-9 h-9 rounded-full object-cover border border-white/10 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-fade-in"
          />
        </div>
      </div>
    </div>
  );
}
