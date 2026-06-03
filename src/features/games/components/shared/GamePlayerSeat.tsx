/**
 * GamePlayerSeat.tsx
 * Premium player seat identity component for Trey TV card games.
 *
 * Seat group layout: [avatar circle] [name] [status line]
 * Avatar is NEVER placed directly on top of Pixi card stacks.
 * Positions are set by the parent via AVATAR_SEAT_NORM (not CARD_STACK positions).
 */
import React, { useId } from "react";
import {
  getBotProfile,
  type BotProfile,
  type HairStyle,
} from "@/features/games/lib/bots/botPlayers";

// ─────────────────────────────────────────────────────────────────────────────
// Size system — CSS clamp() so avatars stay legible on all mobile widths
// ─────────────────────────────────────────────────────────────────────────────

const SIZES = {
  // 'sm' = opponent seats
  sm: {
    dim: "clamp(46px, 12vw, 56px)",
    namePx: "clamp(9px, 2.4vw, 12px)",
    statusPx: "clamp(8px, 2vw, 10px)",
  },
  // 'md' = user/player seat
  md: {
    dim: "clamp(54px, 14vw, 66px)",
    namePx: "clamp(10px, 2.7vw, 13px)",
    statusPx: "clamp(9px, 2.2vw, 11px)",
  },
  // 'lg' = dealer (Blackjack)
  lg: {
    dim: "clamp(50px, 13vw, 60px)",
    namePx: "clamp(10px, 2.5vw, 12px)",
    statusPx: "clamp(8px, 2.2vw, 10px)",
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Bot avatar SVG rendering
// ─────────────────────────────────────────────────────────────────────────────

function renderHairSvg(style: HairStyle, hair: string): React.ReactElement {
  switch (style) {
    case "afro":
      return (
        <path
          d="M11 31C8 20 14 9 25 8c2-5 12-6 16-1 11 1 17 10 14 23-4-6-10-9-23-9-12 0-18 4-21 10Z"
          fill={hair}
        />
      );
    case "short":
      return <path d="M16 26C16 13 25 8 33 8c9 0 16 6 16 18-8-5-22-6-33 0Z" fill={hair} />;
    case "natural":
      return <path d="M12 29C10 16 18 7 32 7s22 9 20 22c-10-8-28-8-40 0Z" fill={hair} />;
    case "mohawk":
      return <path d="M27 5c4-2 8-2 11 0l-1 25H26L27 5Z" fill={hair} />;
    case "long":
      return (
        <>
          <path d="M14 57C8 36 12 8 32 8s24 28 18 49H14Z" fill={hair} />
          <path d="M16 29C19 14 43 14 48 29c-10-7-22-8-32 0Z" fill="rgba(255,255,255,0.10)" />
        </>
      );
    case "braids":
      return (
        <>
          <path d="M15 26C17 13 24 8 32 8s15 5 17 18c-8-5-25-5-34 0Z" fill={hair} />
          {[18, 24, 30, 36, 42].map((x) => (
            <rect key={x} x={x} y="13" width="4" height="34" rx="2" fill={hair} />
          ))}
        </>
      );
    case "waves":
      return (
        <path
          d="M13 25 Q18 13 25 22 Q31 30 38 22 Q44 13 51 25 L51 13 Q42 7 32 7 Q22 7 13 13 Z"
          fill={hair}
        />
      );
    case "locs":
      return (
        <>
          <path d="M15 27C17 14 24 8 32 8s15 6 17 19c-8-6-25-6-34 0Z" fill={hair} />
          {[18, 25, 32, 39, 46].map((x, i) => (
            <rect key={x} x={x} y={14 + (i % 2) * 2} width="5" height="32" rx="2.5" fill={hair} />
          ))}
        </>
      );
    default:
      return <path d="M16 26C17 14 25 8 32 8c9 0 15 6 16 18-8-5-23-5-32 0Z" fill={hair} />;
  }
}

function BotAvatarSvg({ profile }: { profile: BotProfile }) {
  const uid = useId().replace(/:/g, "_");
  return (
    <svg
      viewBox="0 0 64 64"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id={`bg_${uid}`} cx="45%" cy="35%" r="75%">
          <stop offset="0%" stopColor={profile.bgFrom} />
          <stop offset="100%" stopColor={profile.bgTo} />
        </radialGradient>
        <linearGradient id={`skin_${uid}`} x1="22" y1="18" x2="44" y2="55">
          <stop offset="0%" stopColor="#fff6e8" stopOpacity="0.28" />
          <stop offset="36%" stopColor={profile.skin} />
          <stop offset="100%" stopColor="#140806" stopOpacity="0.46" />
        </linearGradient>
        <linearGradient id={`suit_${uid}`} x1="18" y1="50" x2="47" y2="64">
          <stop offset="0%" stopColor="#0c1628" />
          <stop offset="100%" stopColor="#05070d" />
        </linearGradient>
        <filter id={`soft_${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.55" />
        </filter>
        <clipPath id={`clip_${uid}`}>
          <circle cx="32" cy="32" r="31.5" />
        </clipPath>
      </defs>
      <g clipPath={`url(#clip_${uid})`}>
        <circle cx="32" cy="32" r="32" fill={`url(#bg_${uid})`} />
        <circle cx="18" cy="14" r="18" fill="#fff" opacity="0.09" />
        <path
          d="M13 64c2-11 10-17 19-17s17 6 19 17H13Z"
          fill={`url(#suit_${uid})`}
          filter={`url(#soft_${uid})`}
        />
        <path d="M23 49h18l-3 10H26l-3-10Z" fill={profile.skin} opacity="0.92" />
        <g filter={`url(#soft_${uid})`}>
          {renderHairSvg(profile.hairStyle, profile.hair)}
          <path
            d="M19 32c0-12 5-20 13-20s13 8 13 20c0 11-5 20-13 20S19 43 19 32Z"
            fill={`url(#skin_${uid})`}
          />
          <path
            d="M20 31c1-8 5-14 12-14s11 6 12 14c-7-4-16-4-24 0Z"
            fill={profile.hair}
            opacity="0.88"
          />
          <path
            d="M25 35c2-1 4-1 6 0M34 35c2-1 4-1 6 0"
            stroke="#120806"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.62"
          />
          <circle cx="28" cy="38" r="1.35" fill="#080606" />
          <circle cx="37" cy="38" r="1.35" fill="#080606" />
          <path
            d="M32 38.5c-1.2 2.8-1.1 4.1 1 4.4"
            stroke="#2a120c"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.45"
          />
          <path
            d="M28 46c2.6 1.7 5.4 1.7 8 0"
            stroke="#2a0d0d"
            strokeWidth="1.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />
          <path
            d="M21 27c4-5 8-7 12-7"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.12"
          />
        </g>
        <path d="M6 54C18 58 45 58 58 54v10H6V54Z" fill="#000" opacity="0.18" />
        <circle
          cx="32"
          cy="32"
          r="31"
          fill="none"
          stroke={profile.ring}
          strokeWidth="1"
          strokeOpacity="0.16"
        />
      </g>
      <circle
        cx="32"
        cy="32"
        r="30.5"
        fill="none"
        stroke={profile.ring}
        strokeWidth="1.8"
        strokeOpacity="0.62"
      />
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
  publicProfileUid?: string | null;
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
  size?: "sm" | "md" | "lg";
  /** Layout position — used for label placement (unused currently, reserved) */
  position?: "top" | "left" | "right" | "bottom";
  /** Flash gold when this seat wins a trick */
  winFlash?: boolean;
}

const TURN_COLOR = "#FFC857";

export const GamePlayerSeat: React.FC<GamePlayerSeatProps> = ({
  displayName,
  avatarUrl,
  publicProfileUid,
  isBot = false,
  isCurrentTurn = false,
  isDealer = false,
  bid,
  tricks,
  cardCount,
  accentColor = "#00B7FF",
  size = "md",
  position,
  winFlash = false,
}) => {
  const sz = SIZES[size];
  const ringColor = isCurrentTurn ? TURN_COLOR : accentColor;
  const borderWidth = isCurrentTurn ? 3 : 1.5;
  const ringGlow = isCurrentTurn
    ? `0 0 16px ${TURN_COLOR}CC, 0 0 32px ${TURN_COLOR}60`
    : `0 0 10px ${accentColor}50`;

  const initials = displayName
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const botProfile: BotProfile | undefined = isBot ? getBotProfile(displayName) : undefined;

  const profileHref =
    !isBot && publicProfileUid ? `/u/${encodeURIComponent(publicProfileUid)}` : null;
  const Wrapper = profileHref ? "a" : "div";

  return (
    <Wrapper
      {...(profileHref
        ? { href: profileHref, onClick: (event: React.MouseEvent) => event.stopPropagation() }
        : {})}
      data-game-player-seat
      data-seat-name={displayName}
      data-seat-bot={isBot ? "true" : "false"}
      data-seat-position={position}
      style={{
        textDecoration: "none",
        cursor: profileHref ? "pointer" : "default",
        pointerEvents: profileHref ? "auto" : "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        userSelect: "none",
      }}
    >
      {/* Avatar + optional dealer badge */}
      <div style={{ position: "relative", flexShrink: 0, width: sz.dim, height: sz.dim }}>
        {isCurrentTurn && <span className="neon-ring-soft" aria-hidden />}
        {isCurrentTurn && <span className="neon-ring" aria-hidden />}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: winFlash ? `2px solid transparent` : `${borderWidth}px solid ${ringColor}`,
            boxShadow: winFlash ? undefined : isCurrentTurn ? undefined : ringGlow,
            background: winFlash
              ? `conic-gradient(from 0deg, oklch(0.92 0.18 88), oklch(0.84 0.14 82), oklch(0.96 0.10 88), oklch(0.84 0.14 82), oklch(0.92 0.18 88)) border-box`
              : "#05070D",
            overflow: "hidden",
            position: "relative",
            transition: "border-color 0.25s, box-shadow 0.25s",
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
              }}
            />
          ) : botProfile ? (
            <BotAvatarSvg profile={botProfile} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `linear-gradient(135deg, ${accentColor}28, ${accentColor}0e)`,
                fontSize: sz.namePx,
                fontWeight: 900,
                color: accentColor,
                letterSpacing: "-0.02em",
              }}
            >
              {initials}
            </div>
          )}
        </div>

        {isDealer && (
          <div
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "radial-gradient(circle, #FFC857, #C99326)",
              border: "1.5px solid rgba(255,200,87,0.9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 9,
              fontWeight: 900,
              color: "#1A1206",
              boxShadow: "0 0 8px rgba(255,200,87,0.7), inset 0 1px 0 rgba(255,255,255,0.4)",
              zIndex: 2,
            }}
          >
            D
          </div>
        )}
      </div>

      {/* Name — glass chip */}
      <div
        style={{
          fontSize: sz.namePx,
          fontWeight: 700,
          color: isCurrentTurn ? TURN_COLOR : "#CBD5E1",
          maxWidth: `calc(${sz.dim} + 20px)`,
          textAlign: "center",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          lineHeight: 1.2,
          textShadow: isCurrentTurn ? `0 0 10px ${TURN_COLOR}99` : "0 1px 4px rgba(0,0,0,0.95)",
          transition: "color 0.25s, text-shadow 0.25s",
          background: "var(--glass)",
          border: "1px solid var(--glass-border)",
          backdropFilter: "blur(14px) saturate(140%)",
          WebkitBackdropFilter: "blur(14px) saturate(140%)",
          padding: "2.5px 8px",
          borderRadius: 999,
        }}
      >
        {displayName.split(" ")[0]}
      </div>

      {/* Status line */}
      {bid !== null && bid !== undefined && (
        <div
          style={{
            fontSize: sz.statusPx,
            color: "#64748B",
            fontWeight: 700,
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {`B${bid}·T${tricks ?? 0}`}
        </div>
      )}
      {cardCount !== undefined && (
        <div
          style={{
            fontSize: sz.statusPx,
            color: "#64748B",
            fontWeight: 700,
            lineHeight: 1,
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          }}
        >
          {cardCount} cards
        </div>
      )}
    </Wrapper>
  );
};
