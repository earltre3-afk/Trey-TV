import { useEffect, useState } from "react";

/**
 * Tradio release platform store.
 *
 * Artists release music to the Tradio catalog — either instantly or scheduled for a future
 * date/time — from the Studio DAW or their Tradio profile. Persisted to localStorage (no
 * Supabase). A release whose `releaseAt` has passed is "live"; otherwise "scheduled".
 */

export type ReleaseStatus = "scheduled" | "live";
export type ReleaseOrigin = "studio" | "profile" | "tradio";

export interface Release {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  /** audio stream/file URL */
  src: string;
  /** epoch ms; <= now means it's live */
  releaseAt: number;
  createdAt: number;
  origin: ReleaseOrigin;
}

export interface NewRelease {
  title: string;
  artist?: string;
  artwork?: string;
  src?: string;
  releaseAt?: number; // omit / past = instant
  origin?: ReleaseOrigin;
}

const KEY = "tradio.platform.releases";
const EVENT = "tradio:releases-changed";

const DEFAULT_ART =
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80&auto=format&fit=crop";
const DEFAULT_SRC = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3";

function load(): Release[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Release[]) : [];
  } catch {
    return [];
  }
}

function save(rows: Release[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore quota */
  }
}

export function statusOf(r: Release): ReleaseStatus {
  return r.releaseAt <= Date.now() ? "live" : "scheduled";
}

/** Newest-first; live releases ranked by release time, scheduled by soonest. */
export function listReleases(): Release[] {
  return load().sort((a, b) => b.releaseAt - a.releaseAt);
}

export function addRelease(input: NewRelease): Release {
  const now = Date.now();
  const release: Release = {
    id: "rel_" + now.toString(36) + Math.random().toString(36).slice(2, 7),
    title: input.title.trim() || "Untitled",
    artist: input.artist?.trim() || "Tradio Artist",
    artwork: input.artwork?.trim() || DEFAULT_ART,
    src: input.src?.trim() || DEFAULT_SRC,
    releaseAt: input.releaseAt && input.releaseAt > now ? input.releaseAt : now,
    createdAt: now,
    origin: input.origin || "tradio",
  };
  const rows = load();
  rows.push(release);
  save(rows);
  return release;
}

export function deleteRelease(id: string) {
  save(load().filter((r) => r.id !== id));
}

/** Reactive hook: re-reads whenever a release is added/removed (any component/tab). */
export function useReleases() {
  const [releases, setReleases] = useState<Release[]>([]);
  useEffect(() => {
    const sync = () => setReleases(listReleases());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return {
    releases,
    live: releases.filter((r) => statusOf(r) === "live"),
    scheduled: releases.filter((r) => statusOf(r) === "scheduled"),
    add: addRelease,
    remove: deleteRelease,
  };
}
