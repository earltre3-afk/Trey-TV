/**
 * NormalUserProfileModules.tsx
 * All profile content sections for a NORMAL USER profile.
 * Shown in the main content column.
 * Adapts between owner and public/guest views.
 *
 * Sections:
 * - About / bio (desktop)
 * - Top 3 (MySpace-style top friends)
 * - Interests / categories
 * - Content tabs: Posts | Liked | Saved | About
 * - Content grid
 * - Profile completion guidance (owner only)
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Play, Grid3x3, Heart, BookmarkCheck, Sparkles,
  CheckCircle2, Tag,
} from "lucide-react";
import { prescribed } from "@/lib/mock-data";
import { ProfileSectionCard, ProfileEmptyState } from "./ProfileSectionCard";
import type { ProfileContext } from "./ProfileTypes";
import { ProfileZodiacCard } from "@/components/zodiac";
import { ProfileTopThree } from "./ProfileTopThree";

const TABS = ["Posts", "Liked", "Saved", "About"] as const;
type Tab = (typeof TABS)[number];

interface Props extends ProfileContext {}

export function NormalUserProfileModules({ profile, isOwner, viewerRole, topThree = [] }: Props) {
  const [tab, setTab] = useState<Tab>("Posts");
  const isGuest = viewerRole === "guest";

  return (
    <div className="space-y-5 min-w-0">
      {/* ── Desktop bio card ─────────────────────────────────── */}
      <div className={`hidden lg:block rounded-3xl ${isOwner ? "owner-neon owner-glass" : "glass neon-border"} p-5`}>
        <h3 className="text-xs tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
          {isOwner && <Sparkles className="size-3 text-primary" />} ABOUT
        </h3>
        <p className="text-sm whitespace-pre-line leading-relaxed">
          {profile.bio || "No bio yet."}
        </p>
        {profile.joinedDate && (
          <p className="text-[11px] text-muted-foreground mt-2">Joined {profile.joinedDate}</p>
        )}
      </div>

      {/* ── Profile completion (owner incomplete) ────────────── */}
      {isOwner && !profile.bio && (
        <div className="rounded-3xl liquid-glass border border-primary/25 p-4 flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">Complete your profile</div>
            <div className="text-xs text-muted-foreground">Add a bio to help others discover you.</div>
          </div>
          <Link
            to="/edit-profile"
            className="text-xs text-primary font-semibold shrink-0 hover:underline"
          >
            Edit →
          </Link>
        </div>
      )}

      {/* ── Interests / categories ───────────────────────────── */}
      {profile.interests && profile.interests.length > 0 && (
        <ProfileSectionCard title="Interests" icon={Tag} isOwner={isOwner}>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full glass border border-white/10 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        </ProfileSectionCard>
      )}

      {/* ── Top 3 friends ─────────────────────────────────────── */}
      {profile.zodiacSunSign && (
        <ProfileZodiacCard
          sign={profile.zodiacSunSign}
          isCusp={profile.zodiacIsCusp}
          cuspLabel={profile.zodiacCuspLabel}
          moonSign={profile.zodiacMoonSign}
          risingSign={profile.zodiacRisingSign}
        />
      )}

      <ProfileTopThree topThree={topThree} isOwner={isOwner} />

      {/* ── Content tabs ──────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-white/10">
        {TABS.map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              id={`profile-tab-${t.toLowerCase()}`}
              className={`relative px-4 py-2.5 text-sm whitespace-nowrap transition ${
                active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
              {active && (
                <span className="absolute left-3 right-3 -bottom-px h-0.5 bg-primary rounded-full shadow-[0_0_8px_var(--gold)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ──────────────────────────────────────── */}
      {tab === "Posts" && (
        <PostsGrid isOwner={isOwner} isGuest={isGuest} uid={profile.uid} />
      )}
      {tab === "Liked" && (
        isGuest ? (
          <GuestTabWall label="Sign up to see liked content" />
        ) : (
          <PostsGrid isOwner={isOwner} isGuest={false} uid={profile.uid} slice={[6, 12]} />
        )
      )}
      {tab === "Saved" && (
        isGuest ? (
          <GuestTabWall label="Sign up to see saved content" />
        ) : (
          <PostsGrid isOwner={isOwner} isGuest={false} uid={profile.uid} slice={[3, 9]} />
        )
      )}
      {tab === "About" && (
        <AboutTab profile={profile} isOwner={isOwner} />
      )}
    </div>
  );
}

// ─── Top 3 ──────────────────────────────────────────────────────────────────

// ─── Posts grid ─────────────────────────────────────────────────────────────

function PostsGrid({
  isOwner,
  isGuest,
  slice = [0, 12],
}: {
  isOwner: boolean;
  isGuest: boolean;
  uid: string;
  slice?: [number, number];
}) {
  const items = prescribed.concat(prescribed).concat(prescribed).slice(...slice);

  if (items.length === 0) {
    return (
      <ProfileEmptyState
        icon={Grid3x3}
        label="No posts yet"
        subLabel={isOwner ? "Start sharing content to fill your profile." : undefined}
        action={
          isOwner ? (
            <Link
              to="/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold"
            >
              Create first post
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 lg:gap-3">
        {items.map((p, i) => (
          <div
            key={i}
            className="group relative aspect-[3/4] rounded-xl lg:rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
          >
            <img
              src={p.media}
              alt=""
              className="size-full object-cover transition duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
            {i === 0 && isOwner && (
              <span className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-[oklch(0.65_0.22_300)] text-white">
                Pinned
              </span>
            )}
            <span className="absolute bottom-1.5 left-1.5 text-[10px] flex items-center gap-1 text-white/90">
              <Play className="size-3 fill-white" /> {(p as any).duration ?? (p as any).viewers ?? "8.7K"}
            </span>
            <div className="absolute inset-0 grid place-items-center opacity-0 group-hover:opacity-100 transition">
              <div className="size-12 rounded-full bg-primary/90 grid place-items-center glow-gold">
                <Play className="size-5 fill-primary-foreground text-primary-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 pt-2 text-muted-foreground text-xs">
        <Grid3x3 className="size-3" /> End of public posts
      </div>
    </>
  );
}

// ─── About tab ───────────────────────────────────────────────────────────────

function AboutTab({
  profile,
  isOwner,
}: Pick<ProfileContext, "profile"> & { isOwner: boolean }) {
  const pillClass = "rounded-xl bg-white/5 ring-1 ring-white/10 p-2.5";
  return (
    <div className={`rounded-3xl ${isOwner ? "owner-neon owner-glass" : "glass neon-border"} p-5 space-y-4`}>
      <div>
        <div className="text-[10px] tracking-[0.3em] text-primary mb-1">BIO</div>
        <p className="text-sm">{profile.bio || "No bio set."}</p>
        {profile.tagline && <p className="mt-2 text-sm text-primary font-semibold">{profile.tagline}</p>}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <InfoPill label="UID" value={profile.uid} />
        <InfoPill label="Visibility" value={profile.profileVisibility?.replace("_", " ") ?? "public"} />
        {profile.pronouns && profile.pronouns !== "-" && <InfoPill label="Pronouns" value={profile.pronouns} />}
        {profile.showBirthday && profile.birthday && profile.birthday !== "-" && (
          <InfoPill label="Birthday" value={profile.birthday} />
        )}
        <div className={pillClass}>
          <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Joined</div>
          <div className="text-sm font-bold mt-0.5">{profile.joinedDate ?? "—"}</div>
        </div>
        {profile.showLocation && profile.location && profile.location !== "-" && (
          <div className={pillClass}>
            <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Location</div>
            <div className="text-sm font-bold mt-0.5">{profile.location}</div>
          </div>
        )}
        <div className={pillClass}>
          <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Posts</div>
          <div className="text-sm font-bold mt-0.5">{profile.stats.posts}</div>
        </div>
        {profile.stats.prescriptions !== undefined && profile.stats.prescriptions !== 0 && (
          <div className={pillClass}>
            <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Prescriptions</div>
            <div className="text-sm font-bold mt-0.5">{profile.stats.prescriptions}</div>
          </div>
        )}
      </div>
      {(profile.favoriteGenres || profile.favoriteCreators || profile.socialInstagram || profile.socialTikTok || profile.socialYouTube) && (
        <div className="grid grid-cols-2 gap-2">
          {profile.favoriteGenres && profile.favoriteGenres !== "-" && <InfoPill label="Genres" value={profile.favoriteGenres} />}
          {profile.favoriteCreators && profile.favoriteCreators !== "-" && <InfoPill label="Creators" value={profile.favoriteCreators} />}
          {profile.socialInstagram && profile.socialInstagram !== "-" && <InfoPill label="Instagram" value={profile.socialInstagram} />}
          {profile.socialTikTok && profile.socialTikTok !== "-" && <InfoPill label="TikTok" value={profile.socialTikTok} />}
          {profile.socialYouTube && profile.socialYouTube !== "-" && <InfoPill label="YouTube" value={profile.socialYouTube} />}
        </div>
      )}
      {isOwner && (
        <div className="flex items-center gap-1.5 pt-1">
          <Heart className="size-3 text-[oklch(0.7_0.25_340)]" />
          <BookmarkCheck className="size-3 text-primary" />
          <span className="text-[11px] text-muted-foreground ml-1">
            Saved &amp; liked content visible to you only.
          </span>
        </div>
      )}
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/5 ring-1 ring-white/10 p-2.5 min-w-0">
      <div className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</div>
      <div className="text-sm font-bold mt-0.5 truncate">{value}</div>
    </div>
  );
}

// ─── Guest wall ──────────────────────────────────────────────────────────────

function GuestTabWall({ label }: { label: string }) {
  return (
    <div className="rounded-3xl glass neon-border p-10 text-center space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Link
        to="/signup"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold"
      >
        Sign up free
      </Link>
    </div>
  );
}
