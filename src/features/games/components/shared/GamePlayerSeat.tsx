/**
 * GamePlayerSeat.tsx
 * Premium player seat identity component for Trey TV card games.
 *
 * Seat group layout: [avatar circle] [name] [status line]
 * Avatar is NEVER placed directly on top of Pixi card stacks.
 * Positions are set by the parent via AVATAR_SEAT_NORM (not CARD_STACK positions).
 */
import React, { useId } from 'react';
import { getBotProfile, type BotProfile, type HairStyle } from '@/features/games/lib/bots/botPlayers';

// ─────────────────────────────────────────────────────────────────────────────
// Size system — CSS clamp() so avatars stay legible on all mobile widths
// ─────────────────────────────────────────────────────────────────────────────

const SIZES = {
  // 'sm' = opponent seats
  sm:     { dim: 'clamp(46px, 12vw, 56px)', namePx: 'clamp(9px, 2.4vw, 12px)',  statusPx: 'clamp(8px, 2vw, 10px)' },
  // 'md' = user/player seat
  md:     { dim: 'clamp(54px, 14vw, 66px)', namePx: 'clamp(10px, 2.7vw, 13px)', statusPx: 'clamp(9px, 2.2vw, 11px)' },
  // 'lg' = dealer (Blackjack)
  lg:     { dim: 'clamp(50px, 13vw, 60px)', namePx: 'clamp(10px, 2.5vw, 12px)', statusPx: 'clamp(8px, 2.2vw, 10px)' },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Bot avatar SVG rendering
// ─────────────────────────────────────────────────────────────────────────────

function renderHairSvg(style: HairStyle, hair: string): React.ReactElement {
  switch (style) {
    case 'afro':
      return <ellipse cx="32" cy="21" rx="19" ry="14" fill={hair} />;
    case 'short':
      return <ellipse cx="32" cy="17" rx="13" ry="8" fill={hair} />;
    case 'natural':
      return <ellipse cx="32" cy="20" rx="17" ry="13" fill={hair} />;
    case 'mohawk':
      return <rect x="27" y="5" width="10" height="23" rx="5" fill={hair} />;
    case 'long':
      return (
        <>
          <ellipse cx="32" cy="14" rx="16" ry="12" fill={hair} />
          <rect x="11" y="16" width="8" height="44" rx="4" fill={hair} />
          <rect x="45" y="16" width="8" height="44" rx="4" fill={hair} />
        </>
      );
    case 'braids':
      return (
        <>
          <rect x="20" y="6" width="4" height="36" rx="2" fill={hair} />
          <rect x="27" y="4" width="4" height="40" rx="2" fill={hair} />
          <rect x="33" y="4" width="4" height="40" rx="2" fill={hair} />
          <rect x="40" y="6" width="4" height="36" rx="2" fill={hair} />
        </>
      );
    case 'waves':
      return (
        <path
          d="M13 23 Q19 14 25 23 Q31 32 37 23 Q43 14 51 23 L52 8 Q42 2 32 2 Q22 2 12 8 Z"
          fill={hair}
        />
      );
    case 'locs':
      return (
        <>
          <ellipse cx="22" cy="17" rx="5" ry="15" fill={hair} />
          <ellipse cx="32" cy="14" rx="5" ry="18" fill={hair} />
          <ellipse cx="42" cy="17" rx="5" ry="15" fill={hair} />
        </>
      );
    default:
      return <ellipse cx="32" cy="18" rx="14" ry="10" fill={hair} />;
  }
}

function BotAvatarSvg({ profile }: { profile: BotProfile }) {
  const uid = useId().replace(/:/g, '_');
  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id={`bg_${uid}`} cx="45%" cy="35%" r="75%">
          <stop offset="0%" stopColor={profile.bgFrom} />
          <stop offset="100%" stopColor={profile.bgTo} />
        </radialGradient>
        <clipPath id={`clip_${uid}`}>
          <circle cx="32" cy="32" r="31.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip_${uid})`}>
        <circle cx="32" cy="32" r="32" fill={`url(#bg_${uid})`} />
        {renderHairSvg(profile.hairStyle, profile.hair)}
        <ellipse cx="32" cy="41" rx="12" ry="13" fill={profile.skin} />
        <circle cx="27.5" cy="38" r="2.2" fill="#0a0806" />
        <circle cx="36.5" cy="38" r="2.2" fill="#0a0806" />
        <circle cx="26.8" cy="37.2" r="0.9" fill="rgba(255,255,255,0.52)" />
        <circle cx="35.8" cy="37.2" r="0.9" fill="rgba(255,255,255,0.52)" />
        <circle cx="32" cy="32" r="31" fill="none" stroke={profile.ring} strokeWidth="1" strokeOpacity="0.18" />
      </g>
      <circle cx="32" cy="32" r="30.5" fill="none" stroke={profile.ring} strokeWidth="1.8" strokeOpacity="0.62" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GamePlayerSeat component
// ─────────────────────────────────────────────────────────────────────────────

export interface GamePlayerSeatProps {
  displayName: string;
  /** Real player photo URL (Supabase storage, etc.) */
  avatarUrl?: string | null;
  isBot?: boolean;
  isCurrentTurn?: boolean;
  isDealer?: boolean;
  /** Spades: bidded amount */
  bid?: number | null;
  /** Spades: tricks won this round */
  tricks?: number;
  /** Bullshit: cards remaining in hand */
  cardCount?: number;
  /** Team / game accent color hex */
  accentColor?: string;
  /**
   * 'sm' = opponent seats  (clamp 46–56px)
   * 'md' = user/player     (clamp 54–66px)
   * 'lg' = dealer          (clamp 50–60px)
   */
  size?: 'sm' | 'md' | 'lg';
  /** Layout position — used for label placement (unused currently, reserved) */
  position?: 'top' | 'left' | 'right' | 'bottom';
  /** Flash gold when this seat wins a trick */
  winFlash?: boolean;
}

const TURN_COLOR = '#FFC857';

export const GamePlayerSeat: React.FC<GamePlayerSeatProps> = ({
  displayName,
  avatarUrl,
  isBot = false,
  isCurrentTurn = false,
  isDealer = false,
  bid,
  tricks,
  cardCount,
  accentColor = '#00B7FF',
  size = 'md',
  winFlash = false,
}) => {
  const sz = SIZES[size];
  const ringColor = isCurrentTurn ? TURN_COLOR : accentColor;
  const borderWidth = isCurrentTurn ? 3 : 1.5;
  const ringGlow = isCurrentTurn
    ? `0 0 16px ${TURN_COLOR}CC, 0 0 32px ${TURN_COLOR}60`
    : `0 0 10px ${accentColor}50`;

  const initials = displayName
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const botProfile: BotProfile | undefined =
    isBot || !avatarUrl ? getBotProfile(displayName) : undefined;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        userSelect: 'none',
      }}
    >
      {/* Avatar + optional dealer badge */}
      <div style={{ position: 'relative', flexShrink: 0, width: sz.dim, height: sz.dim }}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: `${borderWidth}px solid ${ringColor}`,
            boxShadow: winFlash
              ? `0 0 24px ${TURN_COLOR}, 0 0 48px ${TURN_COLOR}80`
              : ringGlow,
            overflow: 'hidden',
            position: 'relative',
            animation: isCurrentTurn ? 'trey-seat-pulse 1.7s ease-in-out infinite' : undefined,
            transition: 'border-color 0.25s, box-shadow 0.25s',
            background: '#05070D',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                display: 'block',
              }}
            />
          ) : botProfile ? (
            <BotAvatarSvg profile={botProfile} />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${accentColor}28, ${accentColor}0e)`,
                fontSize: sz.namePx,
                fontWeight: 900,
                color: accentColor,
                letterSpacing: '-0.02em',
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {isDealer && (
          <div
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFC857, #C99326)',
              border: '1.5px solid rgba(255,200,87,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              fontWeight: 900,
              color: '#1A1206',
              boxShadow: '0 0 8px rgba(255,200,87,0.7), inset 0 1px 0 rgba(255,255,255,0.4)',
              zIndex: 2,
            }}
          >
            D
          </div>
        )}
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: sz.namePx,
          fontWeight: 700,
          color: isCurrentTurn ? TURN_COLOR : '#CBD5E1',
          maxWidth: `calc(${sz.dim} + 20px)`,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          lineHeight: 1.2,
          textShadow: isCurrentTurn
            ? `0 0 10px ${TURN_COLOR}99`
            : '0 1px 4px rgba(0,0,0,0.95)',
          transition: 'color 0.25s, text-shadow 0.25s',
        }}
      >
        {displayName.split(' ')[0]}
      </div>

      {/* Status line */}
      {bid !== null && bid !== undefined && (
        <div
          style={{
            fontSize: sz.statusPx,
            color: '#64748B',
            fontWeight: 700,
            lineHeight: 1,
            fontVariantNumeric: 'tabular-nums',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {`B${bid}·T${tricks ?? 0}`}
        </div>
      )}
      {cardCount !== undefined && (
        <div
          style={{
            fontSize: sz.statusPx,
            color: '#64748B',
            fontWeight: 700,
            lineHeight: 1,
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
          }}
        >
          {cardCount} cards
        </div>
      )}
    </div>
  );
};
