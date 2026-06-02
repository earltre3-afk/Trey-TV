// TRANCE — Seed Data Definition
// This file serves as the blueprint for populating the remote databases (e.g. Supabase tables)
// with standard initial records (e.g. core system badges) and baseline configurations.
// It also provides a development seeding function to cleanly isolate dummy test data from production.

import { Badge, DanceRoutine } from "../types";
import {
  badges as fixtureBadges,
  dancer as devDancer,
  choreographers as devChoreographers,
  routines as fixtureRoutines,
  studioProfiles as devStudioProfiles,
  studios as devStudios,
  assignments as devAssignments,
  teacherComments as devTeacherComments,
  leaderboard as devLeaderboard,
} from "./devFixtures";

// Production system badges (baseline constants)
export const seedBadges: Badge[] = fixtureBadges.map((b) => ({
  ...b,
  earned: false, // Baseline badges are initialized as locked
}));

/**
 * Deterministic shortId to UUID generator.
 * Fills requirement of valid UUID constraints in the DB for local dev fixture lookups.
 */
export const toUuid = (shortId: string): string => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(shortId)) return shortId;

  const clean = shortId.replace(/[^a-f0-9]/gi, "").toLowerCase();
  const padded = clean.padEnd(12, "0").slice(0, 12);

  let prefix = "99999999-9999-9999-9999-";
  if (shortId.startsWith("u")) prefix = "11111111-1111-1111-1111-";
  else if (shortId.startsWith("c")) prefix = "22222222-2222-2222-2222-";
  else if (shortId.startsWith("rt")) prefix = "33333333-3333-3333-3333-";
  else if (shortId.startsWith("s")) prefix = "44444444-4444-4444-4444-";

  return prefix + padded;
};

interface SupabaseUpsertClient {
  from: (table: string) => {
    upsert: (data: Record<string, unknown>) => Promise<{ error: unknown }>;
  };
}

/**
 * Seeding for PRODUCTION-safe environment configuration.
 * Seeds standard badges needed for platform gamification hooks.
 */
export async function seedSystemDatabase(
  supabaseClient: SupabaseUpsertClient,
): Promise<{ success: boolean; error?: unknown }> {
  try {
    for (const badge of seedBadges) {
      const { error } = await supabaseClient.from("trance_badges").upsert({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        tier: badge.tier,
        icon: badge.icon,
      });
      if (error) throw error;
    }
    return { success: true };
  } catch (e) {
    console.error("System database seeding failed:", e);
    return { success: false, error: e };
  }
}

/**
 * Seeding for LOCAL DEVELOPMENT or STAGING mock configurations.
 * Seeds dancer, choreographer profiles, studio rooms, assignments, sample routines,
 * and teacher feedback to create a robust play-ready development workspace.
 */
export async function seedDevelopmentFixtures(
  supabaseClient: SupabaseUpsertClient,
): Promise<{ success: boolean; errors?: unknown[] }> {
  const errors: unknown[] = [];

  try {
    // 1. Seed Dancer Profile
    const { error: dancerErr } = await supabaseClient.from("trance_profiles").upsert({
      id: toUuid(devDancer.id),
      handle: devDancer.handle,
      display_name: devDancer.displayName,
      avatar: devDancer.avatar,
      cover: devDancer.cover,
      bio: devDancer.bio,
      verified: devDancer.verified,
      level: devDancer.level,
      xp: devDancer.xp,
      xp_to_next: devDancer.xpToNext,
      rank_title: devDancer.rankTitle,
      day_streak: devDancer.dayStreak,
      total_points: devDancer.totalPoints,
      routines_mastered: devDancer.routinesMastered,
      global_rank: devDancer.globalRank,
      trance_energy: devDancer.tranceEnergy,
      roles: ["dancer"],
      permissions: [
        "browse_public_routines",
        "practice_routines",
        "view_own_scores",
        "join_studio_rooms",
      ],
    });
    if (dancerErr) errors.push({ table: "trance_profiles (dancer)", error: dancerErr });

    // 2. Seed Choreographer Profiles
    for (const c of devChoreographers) {
      const { error: pErr } = await supabaseClient.from("trance_profiles").upsert({
        id: toUuid(c.id),
        handle: c.handle,
        display_name: c.displayName,
        avatar: c.avatar,
        cover: c.cover,
        bio: c.tagline,
        verified: c.verified,
        roles: ["choreographer"],
        permissions: [
          "browse_public_routines",
          "practice_routines",
          "view_own_scores",
          "create_sessions",
          "manage_own_channel",
        ],
      });
      if (pErr) errors.push({ table: "trance_profiles (choreo)", error: pErr });

      const { error: cErr } = await supabaseClient.from("trance_choreographer_profiles").upsert({
        id: toUuid(c.id),
        tagline: c.tagline,
        cover: c.cover,
        sessions_count: c.sessions,
        students_count: c.students,
        plays_count: c.plays,
        quote: c.quote || "",
        moderation_status: "approved",
      });
      if (cErr) errors.push({ table: "trance_choreographer_profiles", error: cErr });
    }

    // 3. Seed Studio Profiles & Memberships
    for (const s of devStudioProfiles) {
      const { error: sErr } = await supabaseClient.from("trance_studio_profiles").upsert({
        id: toUuid(s.id),
        owner_id: toUuid(s.ownerId),
        name: s.name,
        handle: s.handle,
        avatar: s.avatar,
        cover: s.cover,
        bio: s.bio,
        verified: s.verified,
      });
      if (sErr) errors.push({ table: "trance_studio_profiles", error: sErr });

      // Owner membership
      const { error: memErr } = await supabaseClient.from("trance_studio_memberships").upsert({
        id: toUuid("mem-" + s.id + "-" + s.ownerId),
        studio_id: toUuid(s.id),
        user_id: toUuid(s.ownerId),
        role: "studio_owner",
      });
      if (memErr) errors.push({ table: "trance_studio_memberships", error: memErr });
    }

    // 4. Seed Studio Rooms (Association to sample studio)
    for (const room of devStudios) {
      const { error: rErr } = await supabaseClient.from("trance_studio_rooms").upsert({
        id: toUuid(room.id),
        studio_id: toUuid("s001"),
        name: room.name,
        cover: room.cover,
        locked: room.locked,
        capacity: room.capacity,
        status: room.status === "LIVE" ? "LIVE" : room.status === "LOCKED" ? "LOCKED" : "OPEN",
        tagline: room.tagline,
      });
      if (rErr) errors.push({ table: "trance_studio_rooms", error: rErr });
    }

    // 5. Seed Routines
    for (const r of fixtureRoutines) {
      const { error: rtErr } = await supabaseClient.from("trance_routines").upsert({
        id: toUuid(r.id),
        title: r.title,
        tagline: r.tagline,
        cover: r.cover,
        choreographer_id: toUuid(r.choreographerId),
        choreographer_name: r.choreographerName,
        choreographer_verified: r.choreographerVerified,
        style: r.style,
        difficulty: r.difficulty,
        energy: r.energy,
        duration_sec: r.durationSec,
        bpm: r.bpm,
        formation: r.formation || "Solo",
        plays: r.plays || 0,
        saves: r.saves || 0,
        students: r.students || 0,
        tags: r.tags || [],
        trending_rank: r.trendingRank || null,
        visibility: r.visibility || "Public",
        moderation_status: "approved",
      });
      if (rtErr) errors.push({ table: "trance_routines", error: rtErr });

      // Count Sections
      if (r.countSections && r.countSections.length > 0) {
        for (const cs of r.countSections) {
          const { error: csErr } = await supabaseClient.from("trance_count_sections").upsert({
            id: toUuid(cs.id),
            routine_id: toUuid(r.id),
            index: cs.index,
            label: cs.label,
            counts: cs.counts,
          });
          if (csErr) errors.push({ table: "trance_count_sections", error: csErr });
        }
      }

      // Move Hints
      if (r.moveHints && r.moveHints.length > 0) {
        for (const mh of r.moveHints) {
          const { error: mhErr } = await supabaseClient.from("trance_move_hints").upsert({
            id: toUuid(mh.id),
            routine_id: toUuid(r.id),
            timestamp: mh.timestamp,
            label: mh.label,
            description: mh.description,
          });
          if (mhErr) errors.push({ table: "trance_move_hints", error: mhErr });
        }
      }

      // Direction Cues
      if (r.directionCues && r.directionCues.length > 0) {
        for (const dc of r.directionCues) {
          const { error: dcErr } = await supabaseClient.from("trance_direction_cues").upsert({
            id: toUuid(dc.id),
            routine_id: toUuid(r.id),
            timestamp: dc.timestamp,
            direction: dc.direction,
            facing: dc.facing,
          });
          if (dcErr) errors.push({ table: "trance_direction_cues", error: dcErr });
        }
      }

      // Scoring Rules
      if (r.scoring) {
        const { error: scErr } = await supabaseClient.from("trance_scoring_rules").upsert({
          routine_id: toUuid(r.id),
          weight_timing: r.scoring.timing,
          weight_execution: r.scoring.execution,
          weight_energy: r.scoring.energy,
          weight_precision: r.scoring.precision,
          weight_creativity: r.scoring.creativity,
          scale: r.scoring.scale,
        });
        if (scErr) errors.push({ table: "trance_scoring_rules", error: scErr });
      }
    }

    // 6. Seed Leaderboard Users and Entries
    for (const entry of devLeaderboard) {
      // Leaderboard user profiles
      const { error: lpErr } = await supabaseClient.from("trance_profiles").upsert({
        id: toUuid(entry.user.id),
        handle: entry.user.handle,
        display_name: entry.user.displayName,
        avatar: entry.user.avatar,
        verified: entry.user.verified,
        roles: ["dancer"],
        permissions: [
          "browse_public_routines",
          "practice_routines",
          "view_own_scores",
          "join_studio_rooms",
        ],
      });
      if (lpErr) errors.push({ table: "trance_profiles (leaderboard user)", error: lpErr });

      // Leaderboard entry
      const { error: leErr } = await supabaseClient.from("trance_leaderboard_entries").upsert({
        routine_id: toUuid("rt001"), // Seed leaderboard entries for first routine
        user_id: toUuid(entry.user.id),
        score: entry.score,
        accuracy: entry.accuracy,
        streak: entry.streak,
        badge_tier: entry.badgeTier,
        anti_cheat_status: "passed",
      });
      if (leErr) errors.push({ table: "trance_leaderboard_entries", error: leErr });
    }

    // 7. Seed Studio Rehearsal Assignments
    for (const ass of devAssignments) {
      const { error: aErr } = await supabaseClient.from("trance_rehearsal_assignments").upsert({
        id: toUuid(ass.id),
        studio_id: toUuid("s001"),
        room_id: toUuid("s001"),
        title: ass.title,
        focus: ass.focus,
        due_date: new Date(Date.now() + 86400000).toISOString(), // Mock tomorrow
      });
      if (aErr) errors.push({ table: "trance_rehearsal_assignments", error: aErr });
    }

    // 8. Seed Teacher Comments
    for (const comm of devTeacherComments) {
      const { error: tcErr } = await supabaseClient.from("trance_teacher_comments").upsert({
        id: toUuid(comm.id),
        studio_id: toUuid(comm.studioId),
        room_id: toUuid(comm.roomId),
        choreographer_id: toUuid(comm.choreographerId),
        comment: comm.comment,
        audio_url: comm.audioUrl || null,
      });
      if (tcErr) errors.push({ table: "trance_teacher_comments", error: tcErr });
    }

    // 9. Seed Follow relation
    const { error: fErr } = await supabaseClient.from("trance_follows").upsert({
      id: toUuid("f-u001-c001"),
      follower_id: toUuid("u001"),
      choreographer_id: toUuid("c001"),
    });
    if (fErr) errors.push({ table: "trance_follows", error: fErr });
  } catch (e) {
    console.error("Fixture seeding crashed:", e);
    errors.push(e);
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
