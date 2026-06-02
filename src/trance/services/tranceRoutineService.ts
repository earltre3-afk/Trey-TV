import { supabase } from "@/lib/supabase";
import {
  DanceRoutine,
  DanceStyle,
  RoutineDifficulty,
  EnergyLevel,
  RoutineVisibility,
} from "../types";
import { routines as devRoutines } from "../data/devFixtures";
import { assertConfigured, shouldUseFixtures } from "./config";
import { getTranceCapabilities, rowToIdentity } from "../auth/tranceAuthBridge";

const genRandomUuid = () => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "uuid-" + Math.random().toString(36).substr(2, 9);
};

export interface RoutineQueryFilter {
  query?: string;
  style?: DanceStyle;
  difficulty?: RoutineDifficulty;
  energy?: EnergyLevel;
  choreographerId?: string;
  visibility?: RoutineVisibility;
}

export const rowToDanceRoutine = (row: any): DanceRoutine => {
  const scoringRow = Array.isArray(row.scoring) && row.scoring[0] ? row.scoring[0] : row.scoring;

  return {
    id: row.id,
    title: row.title,
    tagline: row.tagline,
    cover: row.cover,
    choreographerId: row.choreographer_id,
    choreographerName: row.choreographer_name,
    choreographerVerified: !!row.choreographer_verified,
    style: row.style as DanceStyle,
    difficulty: row.difficulty as RoutineDifficulty,
    energy: row.energy as EnergyLevel,
    durationSec: Number(row.duration_sec ?? 0),
    bpm: Number(row.bpm ?? 100),
    formation: row.formation || "Solo",
    plays: Number(row.plays ?? 0),
    saves: Number(row.saves ?? 0),
    students: Number(row.students ?? 0),
    tags: Array.isArray(row.tags) ? row.tags : [],
    trendingRank: row.trending_rank ? Number(row.trending_rank) : undefined,
    visibility: row.visibility as RoutineVisibility,
    countSections: Array.isArray(row.count_sections)
      ? row.count_sections.map((c: any) => ({
          id: c.id,
          index: Number(c.index),
          label: c.label,
          counts: c.counts,
        }))
      : [],
    moveHints: Array.isArray(row.move_hints)
      ? row.move_hints.map((h: any) => ({
          id: h.id,
          timestamp: h.timestamp,
          label: h.label,
          description: h.description,
        }))
      : [],
    directionCues: Array.isArray(row.direction_cues)
      ? row.direction_cues.map((c: any) => ({
          id: c.id,
          timestamp: c.timestamp,
          direction: c.direction,
          facing: c.facing,
        }))
      : [],
    scoring: scoringRow
      ? {
          timing: Number(scoringRow.weight_timing ?? 30),
          execution: Number(scoringRow.weight_execution ?? 30),
          energy: Number(scoringRow.weight_energy ?? 20),
          precision: Number(scoringRow.weight_precision ?? 10),
          creativity: Number(scoringRow.weight_creativity ?? 10),
          scale: scoringRow.scale || "0 - 100 Points",
        }
      : {
          timing: 30,
          execution: 30,
          energy: 20,
          precision: 10,
          creativity: 10,
          scale: "0 - 100 Points",
        },
  };
};

export const tranceRoutineService = {
  getRoutines: async (filters?: RoutineQueryFilter): Promise<DanceRoutine[]> => {
    assertConfigured("RoutineService");
    if (shouldUseFixtures()) {
      let filtered = [...devRoutines];
      if (filters) {
        if (filters.query) {
          const q = filters.query.toLowerCase();
          filtered = filtered.filter(
            (r) => r.title.toLowerCase().includes(q) || r.tagline.toLowerCase().includes(q),
          );
        }
        if (filters.style) {
          filtered = filtered.filter((r) => r.style === filters.style);
        }
        if (filters.difficulty) {
          filtered = filtered.filter((r) => r.difficulty === filters.difficulty);
        }
        if (filters.energy) {
          filtered = filtered.filter((r) => r.energy === filters.energy);
        }
        if (filters.choreographerId) {
          filtered = filtered.filter((r) => r.choreographerId === filters.choreographerId);
        }
        if (filters.visibility) {
          filtered = filtered.filter((r) => r.visibility === filters.visibility);
        }
      }
      return filtered;
    }

    let query = supabase.from("trance_routines").select(`
      *,
      count_sections:trance_count_sections(*),
      move_hints:trance_move_hints(*),
      direction_cues:trance_direction_cues(*),
      scoring:trance_scoring_rules(*)
    `);

    if (filters) {
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,tagline.ilike.%${filters.query}%`);
      }
      if (filters.style) {
        query = query.eq("style", filters.style);
      }
      if (filters.difficulty) {
        query = query.eq("difficulty", filters.difficulty);
      }
      if (filters.energy) {
        query = query.eq("energy", filters.energy);
      }
      if (filters.choreographerId) {
        query = query.eq("choreographer_id", filters.choreographerId);
      }
      if (filters.visibility) {
        query = query.eq("visibility", filters.visibility);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(rowToDanceRoutine);
  },

  getPublicRoutines: async (): Promise<DanceRoutine[]> => {
    return tranceRoutineService.getRoutines({ visibility: "Public" });
  },

  getRoutineDetails: async (routineId: string): Promise<DanceRoutine | undefined> => {
    assertConfigured("RoutineService");
    if (shouldUseFixtures()) {
      return devRoutines.find((r) => r.id === routineId);
    }

    const { data, error } = await supabase
      .from("trance_routines")
      .select(
        `
        *,
        count_sections:trance_count_sections(*),
        move_hints:trance_move_hints(*),
        direction_cues:trance_direction_cues(*),
        scoring:trance_scoring_rules(*)
      `,
      )
      .eq("id", routineId)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(`Routine details not found for id: ${routineId}`);
    return rowToDanceRoutine(data);
  },

  getRoutineById: async (id: string): Promise<DanceRoutine | undefined> => {
    return tranceRoutineService.getRoutineDetails(id);
  },

  createRoutineDraft: async (routine: Partial<DanceRoutine>): Promise<DanceRoutine> => {
    assertConfigured("RoutineService");

    // Resolve choreographer ID
    let finalChoreographerId = routine.choreographerId || "c001";
    let finalChoreographerName = routine.choreographerName || "Jaxx Blaze";
    let finalChoreographerVerified = routine.choreographerVerified || false;

    if (!shouldUseFixtures()) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        finalChoreographerId = user.id;

        // Get user profile details
        const { data: profile } = await supabase
          .from("trance_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          throw new Error("User profile not found in database.");
        }

        finalChoreographerName = profile.display_name;
        finalChoreographerVerified = !!profile.verified;

        // Verify capabilities
        const identity = rowToIdentity(profile);
        const capabilities = getTranceCapabilities(identity);

        if (!capabilities.canCreateRoutine) {
          throw new Error(
            "Unauthorized: You are not authorized to create routine drafts on TRANCE.",
          );
        }

        // Ensure choreographer profile exists in the DB
        const { data: existingChoreo } = await supabase
          .from("trance_choreographer_profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!existingChoreo) {
          await supabase.from("trance_choreographer_profiles").insert({
            id: user.id,
            tagline: "Choreographer on TRANCE",
            cover: "",
            quote: "Let the dance begin.",
            moderation_status: "approved",
          });
        }
      } else {
        throw new Error("Must be logged in to create a routine draft.");
      }
    }

    const defaultDraft: DanceRoutine = {
      id: routine.id || genRandomUuid(),
      title: routine.title || "Untitled Routine",
      tagline: routine.tagline || "New Choreography",
      cover:
        routine.cover ||
        "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop",
      choreographerId: finalChoreographerId,
      choreographerName: finalChoreographerName,
      choreographerVerified: finalChoreographerVerified,
      style: routine.style || "Hip-Hop",
      difficulty: routine.difficulty || "Intermediate",
      energy: routine.energy || "Medium",
      durationSec: routine.durationSec || 167, // Default to ~2:47
      bpm: routine.bpm || 108,
      formation: routine.formation || "Solo",
      plays: 0,
      saves: 0,
      students: 0,
      tags: routine.tags || ["original"],
      visibility: "Private",
      countSections: [],
      moveHints: [],
      directionCues: [],
      scoring: {
        timing: 30,
        execution: 30,
        energy: 20,
        precision: 10,
        creativity: 10,
        scale: "0 - 100 Points",
      },
    };

    if (shouldUseFixtures()) {
      return defaultDraft;
    }

    const { error: insertError } = await supabase.from("trance_routines").insert({
      id: defaultDraft.id,
      title: defaultDraft.title,
      tagline: defaultDraft.tagline,
      cover: defaultDraft.cover,
      choreographer_id: defaultDraft.choreographerId,
      choreographer_name: defaultDraft.choreographerName,
      choreographer_verified: defaultDraft.choreographerVerified,
      style: defaultDraft.style,
      difficulty: defaultDraft.difficulty,
      energy: defaultDraft.energy,
      duration_sec: defaultDraft.durationSec,
      bpm: defaultDraft.bpm,
      formation: defaultDraft.formation,
      plays: defaultDraft.plays,
      saves: defaultDraft.saves,
      students: defaultDraft.students,
      tags: defaultDraft.tags,
      visibility: "Private",
      moderation_status: "pending",
    });

    if (insertError) throw insertError;

    // Insert default scoring rules
    const { error: rulesError } = await supabase.from("trance_scoring_rules").insert({
      routine_id: defaultDraft.id,
      weight_timing: defaultDraft.scoring.timing,
      weight_execution: defaultDraft.scoring.execution,
      weight_energy: defaultDraft.scoring.energy,
      weight_precision: defaultDraft.scoring.precision,
      weight_creativity: defaultDraft.scoring.creativity,
      scale: defaultDraft.scoring.scale,
    });

    if (rulesError) {
      console.warn("Failed to insert default scoring rules, proceeding:", rulesError);
    }

    // Insert mock count sections, cues, hints so that the draft has some default content
    await supabase.from("trance_count_sections").insert([
      { routine_id: defaultDraft.id, index: 1, label: "Groove In", counts: "8 Counts x 2" },
      {
        routine_id: defaultDraft.id,
        index: 2,
        label: "Chest Hit & Travel",
        counts: "8 Counts x 2",
      },
    ]);

    await supabase.from("trance_move_hints").insert([
      {
        routine_id: defaultDraft.id,
        timestamp: "00:00",
        label: "Groove In",
        description: "Relax into the beat. Feel the bounce.",
      },
      {
        routine_id: defaultDraft.id,
        timestamp: "00:16",
        label: "Chest Hit",
        description: "Hit chest forward on 5, clean & sharp.",
      },
    ]);

    await supabase.from("trance_direction_cues").insert([
      { routine_id: defaultDraft.id, timestamp: "00:00", direction: "up", facing: "Front" },
      { routine_id: defaultDraft.id, timestamp: "00:16", direction: "right", facing: "Right" },
    ]);

    const { data, error: selectError } = await supabase
      .from("trance_routines")
      .select(
        `
        *,
        count_sections:trance_count_sections(*),
        move_hints:trance_move_hints(*),
        direction_cues:trance_direction_cues(*),
        scoring:trance_scoring_rules(*)
      `,
      )
      .eq("id", defaultDraft.id)
      .maybeSingle();

    if (selectError) throw selectError;
    return data ? rowToDanceRoutine(data) : defaultDraft;
  },

  updateRoutineDraft: async (routineId: string, patch: Partial<DanceRoutine>): Promise<void> => {
    assertConfigured("RoutineService");
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] Mock update routine ${routineId}:`, patch);
      return;
    }
    const dbPatch: Record<string, unknown> = {};
    if (patch.title) dbPatch.title = patch.title;
    if (patch.tagline) dbPatch.tagline = patch.tagline;
    if (patch.cover) dbPatch.cover = patch.cover;
    if (patch.style) dbPatch.style = patch.style;
    if (patch.difficulty) dbPatch.difficulty = patch.difficulty;
    if (patch.energy) dbPatch.energy = patch.energy;
    if (patch.durationSec) dbPatch.duration_sec = patch.durationSec;
    if (patch.bpm) dbPatch.bpm = patch.bpm;

    const { error } = await supabase.from("trance_routines").update(dbPatch).eq("id", routineId);

    if (error) throw error;
  },

  publishRoutine: async (routineId: string): Promise<void> => {
    assertConfigured("RoutineService");
    if (shouldUseFixtures()) {
      console.log(`[Dev Mode] Mock publish routine ${routineId}`);
      return;
    }
    const { error } = await supabase
      .from("trance_routines")
      .update({ visibility: "Public", moderation_status: "approved" })
      .eq("id", routineId);

    if (error) throw error;
  },

  incrementPlayCount: async (routineId: string): Promise<void> => {
    assertConfigured("RoutineService");
    if (shouldUseFixtures()) return;
    const { error } = await supabase.rpc("increment_routine_plays", { routine_id: routineId });
    if (error) throw error;
  },
};
