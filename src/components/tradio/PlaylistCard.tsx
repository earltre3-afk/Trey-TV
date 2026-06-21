import React from 'react';
import { Play } from 'lucide-react';

interface PlaylistCardProps {
  title: string;
  subtitle?: string;
  image: string;
  featured?: boolean;
  onClick?: () => void;
}

export default function PlaylistCard({ title, subtitle, image, featured, onClick }: PlaylistCardProps) {
  return (
    <button onClick={onClick} className="w-36 shrink-0 text-left active:scale-[0.97] transition-transform">
      <div className="relative w-36 h-36 rounded-2xl overflow-hidden border border-white/[0.06] shadow-lg">
        <img src={image} alt={title} className="w-full h-full object-cover object-top" />
        {featured ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-[0_0_25px_rgba(236,72,153,0.7)]">
              <Play className="w-6 h-6 text-white" fill="currentColor" />
            </div>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center">
            <Play className="w-4 h-4 text-white" fill="currentColor" />
          </div>
        )}
      </div>
      <p className="text-white font-semibold text-sm mt-2 truncate">{title}</p>
      {subtitle && <p className="text-white/45 text-xs truncate">{subtitle}</p>}
    </button>
  );
}
