import { useCreateArc } from '@/lib/create-arc-context';
import type { CreateType } from '@/lib/last-create-type';

interface BubblePalette {
  pure: string;
  bright: string;
  soft: string;
}

const BUBBLES: Array<{ id: CreateType; angle: number; palette: BubblePalette }> = [
  { id: 'photo', angle: -72, palette: { pure: '#00FFFF', bright: 'rgba(0,255,255,0.85)', soft: 'rgba(0,200,255,0.35)' } },
  { id: 'video', angle: -24, palette: { pure: '#FF00B8', bright: 'rgba(255,0,184,0.85)', soft: 'rgba(255,40,180,0.35)' } },
  { id: 'story', angle:  24, palette: { pure: '#B800FF', bright: 'rgba(184,0,255,0.85)', soft: 'rgba(160,80,255,0.40)' } },
  { id: 'reel',  angle:  72, palette: { pure: '#00FF88', bright: 'rgba(0,255,136,0.85)', soft: 'rgba(0,255,150,0.35)' } },
];

const ARC_RADIUS_PX = 110;

export function CreateBubbleArc() {
  const { isOpen, hoveredId } = useCreateArc();

  return (
    <div
      aria-hidden={!isOpen}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 60,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 220ms ease',
      }}
    >
      {/* Scrim — dims the underlying feed while the arc is open. */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(2,3,15,0.85) 60%, rgba(0,0,8,0.95) 100%)',
          backdropFilter: 'blur(12px) saturate(0.7)',
          WebkitBackdropFilter: 'blur(12px) saturate(0.7)',
        }}
      />

      {/* Horizon glow — bottom-anchored, behind everything. */}
      <div
        style={{
          position: 'absolute', left: 0, right: 0, bottom: 64, height: 240,
          pointerEvents: 'none',
          background: [
            'radial-gradient(40% 80% at 28% 100%, rgba(0,230,255,0.30) 0%, transparent 60%)',
            'radial-gradient(40% 80% at 72% 100%, rgba(255,40,180,0.26) 0%, transparent 60%)',
            'radial-gradient(60% 65% at 50% 100%, rgba(160,80,255,0.22) 0%, transparent 70%)',
          ].join(','),
          filter: 'blur(18px)',
        }}
      />

      {/* Arc pivot — anchored to top of the bottom nav, centered. */}
      <div
        style={{
          position: 'absolute', left: '50%', bottom: 64, width: 0, height: 0,
        }}
      >
        {BUBBLES.map((b, idx) => (
          <Bubble
            key={b.id}
            bubble={b}
            isHovered={hoveredId === b.id}
            isOpen={isOpen}
            staggerIndex={idx}
          />
        ))}
      </div>
    </div>
  );
}

function Bubble({
  bubble,
  isHovered,
  isOpen,
  staggerIndex,
}: {
  bubble: { id: CreateType; angle: number; palette: BubblePalette };
  isHovered: boolean;
  isOpen: boolean;
  staggerIndex: number;
}) {
  const { angle, palette, id } = bubble;
  // Outside-in stagger: indices 0 and 3 first (Photo + Reel), 1 and 2 next.
  const staggerMs = staggerIndex === 0 || staggerIndex === 3 ? 0 : 60;

  const baseTransform = isOpen
    ? `rotate(${angle}deg) translate(0, ${-ARC_RADIUS_PX}px) rotate(${-angle}deg)`
    : `rotate(${angle}deg) translate(0, -8px) rotate(${-angle}deg) scale(0.4)`;

  return (
    <div
      style={{
        position: 'absolute', left: 0, bottom: 0,
        transformOrigin: '0 0',
        transform: baseTransform,
        opacity: isOpen ? 1 : 0,
        transition: `transform 280ms cubic-bezier(0.22,1.2,0.36,1) ${staggerMs}ms, opacity 200ms ease ${staggerMs}ms`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 40, height: 40, margin: -20,
          borderRadius: '50%',
          position: 'relative',
          background: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.04) 100%)',
          backdropFilter: 'blur(14px) saturate(2.2) brightness(1.15)',
          WebkitBackdropFilter: 'blur(14px) saturate(2.2) brightness(1.15)',
          border: `${isHovered ? 2 : 1.5}px solid ${palette.pure}`,
          boxShadow: [
            '0 10px 22px rgba(0,0,0,0.45)',
            `0 0 ${isHovered ? 8 : 6}px ${palette.pure}`,
            `0 0 ${isHovered ? 22 : 12}px ${palette.bright}`,
            `0 0 ${isHovered ? 55 : 26}px ${palette.bright}`,
            `0 0 ${isHovered ? 100 : 50}px ${palette.soft}`,
            'inset 0 0 0 0.5px rgba(0,0,0,0.22)',
            `inset 0 1.5px 0 rgba(255,255,255,${isHovered ? 0.7 : 0.5})`,
            'inset 0 -3px 8px rgba(0,0,0,0.15)',
          ].join(', '),
          display: 'grid', placeItems: 'center',
          transition: 'all 320ms cubic-bezier(0.22,1.2,0.36,1)',
          transformOrigin: 'center center',
          transform: isHovered ? 'scale(1.4)' : 'scale(1)',
        }}
      >
        {/* Top-left specular */}
        <span
          aria-hidden
          style={{
            position: 'absolute', top: 1, left: 5,
            width: 14, height: 6, borderRadius: '50%',
            background: 'linear-gradient(160deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 50%, transparent 80%)',
            filter: 'blur(1px)', zIndex: 4, pointerEvents: 'none',
          }}
        />
        {/* Top-right satellite */}
        <span
          aria-hidden
          style={{
            position: 'absolute', top: 4, right: 5,
            width: 3.5, height: 3.5, borderRadius: '50%',
            background: 'rgba(255,255,255,0.85)',
            filter: 'blur(0.3px)', opacity: 0.7, zIndex: 4, pointerEvents: 'none',
          }}
        />
        <PictureIcon id={id} />
        {isHovered && (
          <span
            aria-hidden
            style={{
              position: 'absolute', left: '50%', top: -11,
              transform: 'translateX(-50%)',
              width: 4, height: 4, borderRadius: '50%',
              background: palette.pure,
              boxShadow: `0 0 10px ${palette.pure}, 0 0 20px ${palette.bright}`,
              zIndex: 5,
            }}
          />
        )}
      </div>
    </div>
  );
}

function PictureIcon({ id }: { id: CreateType }) {
  const sharedFilter =
    'drop-shadow(0 0 3px rgba(0,0,0,0.25)) drop-shadow(0 1px 2px rgba(0,0,0,0.55))';
  const svgStyle = { width: 28, height: 28, position: 'relative' as const, zIndex: 3, filter: sharedFilter };

  if (id === 'photo') {
    return (
      <svg viewBox="0 0 24 24" style={svgStyle}>
        <defs>
          <linearGradient id="ph-body" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#00B8E0" />
            <stop offset="100%" stopColor="#007A99" />
          </linearGradient>
        </defs>
        <path d="M5 7h3l1.3-1.8a1.2 1.2 0 0 1 1-.5h5.4a1.2 1.2 0 0 1 1 .5L18 7h1a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" fill="url(#ph-body)" />
        <circle cx="12" cy="13.5" r="3.6" fill="#00D4F5" />
        <circle cx="12" cy="13.5" r="2.4" fill="#005C7A" />
        <circle cx="11" cy="12.5" r="0.7" fill="#ffffff" fillOpacity="0.95" />
        <rect x="16.5" y="8.5" width="1.6" height="1" rx="0.3" fill="#ffffff" fillOpacity="0.9" />
      </svg>
    );
  }
  if (id === 'video') {
    return (
      <svg viewBox="0 0 24 24" style={svgStyle}>
        <defs>
          <linearGradient id="vd-body" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C2008C" />
            <stop offset="100%" stopColor="#8B0066" />
          </linearGradient>
        </defs>
        <rect x="2.5" y="7" width="13" height="10" rx="2" fill="url(#vd-body)" />
        <path d="M15.5 9.5 21 6.5v11l-5.5-3z" fill="#FF1FB0" />
        <circle cx="6.5" cy="12" r="2.2" fill="#5C0044" />
        <circle cx="6.5" cy="12" r="1.2" fill="#FF52C2" />
        <circle cx="6" cy="11.5" r="0.4" fill="#ffffff" fillOpacity="0.95" />
        <circle cx="11.5" cy="10" r="0.6" fill="#ffffff" fillOpacity="0.95" />
      </svg>
    );
  }
  if (id === 'story') {
    return (
      <svg viewBox="0 0 24 24" style={svgStyle}>
        <defs>
          <linearGradient id="st-ring" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C24DFF" />
            <stop offset="100%" stopColor="#7A00C2" />
          </linearGradient>
          <linearGradient id="st-core" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7A00C2" />
            <stop offset="100%" stopColor="#4D008A" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="9.5" fill="url(#st-ring)" />
        <circle cx="12" cy="12" r="7.8" fill="#1a0033" />
        <circle cx="12" cy="12" r="6.8" fill="url(#st-core)" />
        <path d="M10 8.5v7l5.5-3.5z" fill="#ffffff" />
      </svg>
    );
  }
  // reel
  return (
    <svg viewBox="0 0 24 24" style={svgStyle}>
      <defs>
        <linearGradient id="rl-body" x1="0" y1="0" x2="0" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00B377" />
          <stop offset="100%" stopColor="#006644" />
        </linearGradient>
      </defs>
      <rect x="5.5" y="2.5" width="13" height="19" rx="3" fill="url(#rl-body)" />
      <rect x="10" y="3.5" width="4" height="0.8" rx="0.4" fill="#003322" />
      <rect x="7" y="5" width="10" height="15" rx="1.5" fill="#00875C" />
      <path d="M10 9.5v7l6-3.5z" fill="#ffffff" />
      <circle cx="7.5" cy="3.5" r="0.4" fill="#00FFB4" />
      <circle cx="16.5" cy="3.5" r="0.4" fill="#00FFB4" />
    </svg>
  );
}
