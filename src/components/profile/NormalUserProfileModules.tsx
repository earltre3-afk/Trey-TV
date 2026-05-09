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
  Star, Play, Grid3x3, Heart, BookmarkCheck, Sparkles,
  CheckCircle2, Tag,
} from "lucide-react";
import { prescribed } from "@/lib/mock-data";
import { useFollow } from "@/lib/follow-store";
import { ProfileSectionCard, ProfileEmptyState } from "./ProfileSectionCard";
import type { ProfileContext } from "./ProfileTypes";

const TABS = ["Posts", "Liked", "Saved", "About"] as const;
type Tab = (typeof TABS)[number];

interface Props extends ProfileContext {}

export function NormalUserProfileModules({ profile, isOwner, viewerRole }: Props) {
  const [tab, setTab] = useState<Tab>("Posts");
  const { topThree } = useFollow();
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
      <TopThreeCard isOwner={isOwner} topThree={topThree} />

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

function TopThreeCard({
  isOwner,
  topThree,
}: {
  isOwner: boolean;
  topThree: Array<{ handle: string; name: string; avatar: string }>;
}) {
  const slots = [0, 1, 2];
  return (
    <section
      className={`rounded-3xl p-5 relative overflow-hidden ${isOwner ? "owner-neon owner-glass" : "glass neon-border"}`}
    >
      <div aria-hidden className="absolute -top-16 -right-16 size-40 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="relative flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Star className="size-4 text-primary fill-primary/30" /> Top 3
          {isOwner && (
            <span className="text-[9px] tracking-[0.25em] px-1.5 py-0.5 rounded-full owner-ribbon text-black">
              OWNER PICKS
            </span>
          )}
        </h3>
        <span className="text-[10px] tracking-[0.25em] text-muted-foreground">MOST WATCHED</span>
      </div>
      <div className="relative grid grid-cols-3 gap-3">
        {slots.map((i) => {
          const f = topThree[i];
          if (!f) {
            return (
              <div
                key={i}
                className="rounded-2xl border border-dashed border-white/10 aspect-square flex flex-col items-center justify-center text-muted-foreground"
              >
                <span className="text-xs font-bold">#{i + 1}</span>
                <span className="text-[10px] mt-1">Empty</span>
              </div>
            );
          }
          return (
            <Link
              key={f.handle}
              to="/channel/$handle"
              params={{ handle: f.handle }}
              className="group rounded-2xl glass border border-white/10 p-3 flex flex-col items-center gap-2 hover-lift relative"
            >
              <span className="absolute top-1.5 left-1.5 size-5 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold glow-gold">
                {i + 1}
              </span>
              <div className="size-14 rounded-full conic-ring">
                <img src={f.avatar} alt="" className="size-full rounded-full object-cover" />
              </div>
              <div className="text-xs font-semibold truncate w-full text-center">{f.name}</div>
              <div className="text-[10px] text-muted-foreground truncate w-full text-center">
                @{f.handle}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

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
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className={pillClass}>
          <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Joined</div>
          <div className="text-sm font-bold mt-0.5">{profile.joinedDate ?? "—"}</div>
        </div>
        <div className={pillClass}>
          <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Location</div>
          <div className="text-sm font-bold mt-0.5">{profile.location ?? "—"}</div>
        </div>
        <div className={pillClass}>
          <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Posts</div>
          <div className="text-sm font-bold mt-0.5">{profile.stats.posts}</div>
        </div>
        <div className={pillClass}>
          <div className="text-[10px] tracking-wider text-muted-foreground uppercase">Prescriptions</div>
          <div className="text-sm font-bold mt-0.5">{profile.stats.prescriptions ?? "—"}</div>
        </div>
      </div>
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

// ─── Guest wall ──────────────────────────────────────────────────────────────

function GuestTabWall({ label }: { label: string }) {
  return (
    <div className="rounded-3xl glass neon-border p-10 text-center space-y-3">
      <p className="text-sm text-muted-foreground">{label}</p>
      <Link
        to="/onboarding"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-primary-foreground glow-gold"
      >
        Sign up free
      </Link>
    </div>
  );
}
