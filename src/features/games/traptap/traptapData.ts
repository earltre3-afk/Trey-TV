// Trap Tap — songs, difficulties, and the beat-matched chart generator.
//
// The three playable tracks are Trey Trizzy songs (custom music). BPM + beatOffset
// come from a lightweight beat-grid analysis so generated notes land on musical
// beats instead of random time points. Cover art uses the existing Trey TV CDN art.

import { TrapTapSong, TrapTapDifficulty, TrapTapNote } from './traptapTypes';

/** 4-lane neon palette (pink / purple / blue / green). */
export const LANE_COLORS = ['#FF0080', '#B026FF', '#00B4FF', '#9CFF2E'];
export const LANE_COUNT = 4;

const COVERS = {
  beyondReality: 'https://d64gsuwffb70l.cloudfront.net/6a317071b7acd9121b792dbf_1781758050438_c97dabac.png',
  neonSkyline: 'https://d64gsuwffb70l.cloudfront.net/6a317071b7acd9121b792dbf_1781758050905_b9e476f6.png',
  gateway: 'https://d64gsuwffb70l.cloudfront.net/6a317071b7acd9121b792dbf_1781758049356_168973aa.png',
};

export const SONGS: TrapTapSong[] = [
  {
    id: 'june-nineteenth',
    title: 'JUNE NINETEENTH',
    artist: 'Trey Trizzy',
    bpm: 80.75,
    duration: 273.09,
    beatOffset: 1.767,
    genre: 'TRAP BLUES',
    audioUrl: '/assets/games/traptap/audio/june-nineteenth.m4a',
    coverArtUrl: COVERS.neonSkyline,
  },
  {
    id: 'lmo',
    title: 'LMO',
    artist: 'Trey Trizzy',
    bpm: 136,
    duration: 196.51,
    beatOffset: 2.932,
    genre: 'TRAP R&B',
    audioUrl: '/assets/games/traptap/audio/lmo.m4a',
    coverArtUrl: COVERS.beyondReality,
  },
  {
    id: 'right-here',
    title: 'RIGHT HERE',
    artist: 'Trey Trizzy',
    bpm: 99.38,
    duration: 117.05,
    beatOffset: 3.439,
    genre: 'R&B · 360',
    audioUrl: '/assets/games/traptap/audio/right-here-sony-360-audio.m4a',
    coverArtUrl: COVERS.gateway,
  },
];

export const DIFFICULTIES: TrapTapDifficulty[] = [
  { name: 'Easy', level: 3, speed: 1.0, mult: 1.0, offs: [0, 2], color: '#00F0FF' },
  { name: 'Normal', level: 6, speed: 1.2, mult: 1.15, offs: [0, 1, 2, 3], color: '#0080FF' },
  { name: 'Hard', level: 10, speed: 1.45, mult: 1.35, offs: [0, 1, 1.5, 2, 3, 3.5], color: '#7B2BFF' },
  { name: 'Expert', level: 14, speed: 1.75, mult: 1.6, offs: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5], color: '#FF0080' },
  { name: 'Expert+', level: 18, speed: 2.1, mult: 2.0, offs: [0, 0.25, 0.5, 1, 1.5, 2, 2.25, 2.5, 3, 3.5], color: '#FF2EC0' },
];

const LANE_PATTERN = [0, 2, 1, 3, 2, 0, 3, 1, 2, 3, 0, 1, 3, 2, 1, 0];

/**
 * Deterministic, beat-matched chart. Notes are placed on the difficulty's beat
 * sub-positions within each bar, anchored to the song's beatOffset, so every note
 * reaches the hit line exactly on a musical beat.
 */
export function buildChart(song: TrapTapSong, diff: TrapTapDifficulty): TrapTapNote[] {
  const beat = 60 / song.bpm;
  const bar = beat * 4;
  const start = song.beatOffset || 2.5;
  const end = Math.max(start + bar * 4, song.duration - 1.2);
  const notes: TrapTapNote[] = [];
  let idx = 0;
  let bi = 0;

  for (let bs = start; bs < end; bs += bar, bi++) {
    const phrase = bi % 16;
    diff.offs.forEach((off, oi) => {
      if (bi < 2 && oi > 0) return; // gentle lead-in
      if (diff.level <= 6 && phrase >= 12 && phrase <= 13 && oi % 2 === 1) return; // light rest on easy charts
      const t = +(bs + off * beat).toFixed(3);
      if (t < start || t > end) return;
      const seed = oi + bi * 3 + Math.round(off * 2);
      const lane = LANE_PATTERN[seed % LANE_PATTERN.length];
      
      const isHold = diff.level >= 3 && (off === 0 || off === 2) && seed % 4 === 0;
      const holdDuration = isHold ? +(beat * 1.5).toFixed(3) : undefined;

      if (holdDuration && t + holdDuration <= end) {
        notes.push({ id: idx++, lane, time: t, hit: false, missed: false, holdDuration });
      } else {
        notes.push({ id: idx++, lane, time: t, hit: false, missed: false });
      }
      
      // chords on stronger beats for harder charts
      if (diff.level >= 10 && (off === 0 || off === 2) && phrase >= 8 && phrase <= 11 && seed % 3 === 0) {
        notes.push({ id: idx++, lane: (lane + 2) % LANE_COUNT, time: t, hit: false, missed: false });
      }
    });
  }

  notes.sort((a, b) => a.time - b.time || a.lane - b.lane);
  return notes;
}

export function gradeFor(acc: number): { grade: string; color: string; rank: string } {
  if (acc >= 99) return { grade: 'S+', color: '#3ff0c0', rank: 'FLAWLESS' };
  if (acc >= 96) return { grade: 'S', color: '#5cd0ff', rank: 'MASTERFUL' };
  if (acc >= 92) return { grade: 'A', color: '#9CFF2E', rank: 'EXCELLENT' };
  if (acc >= 85) return { grade: 'B', color: '#ffd23f', rank: 'SOLID RUN' };
  if (acc >= 75) return { grade: 'C', color: '#ff9f43', rank: 'KEEP GOING' };
  return { grade: 'D', color: '#ff5c7a', rank: 'TRY AGAIN' };
}

export function formatTime(s: number): string {
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
