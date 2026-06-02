import { supabase } from "@/lib/supabase";
import { DanceRoutine } from "../types";
import { routines as devRoutines } from "../data/devFixtures";
import { assertConfigured, shouldUseFixtures } from "./config";

export const tranceSupabaseService = {
  getRoutines: async (): Promise<DanceRoutine[]> => {
    assertConfigured("SupabaseService");
    if (shouldUseFixtures()) {
      return devRoutines;
    }
    const { data, error } = await supabase
      .from("trance_routines")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as DanceRoutine[]) || [];
  },

  getRoutine: async (id: string): Promise<DanceRoutine | undefined> => {
    assertConfigured("SupabaseService");
    if (shouldUseFixtures()) {
      return devRoutines.find((r) => r.id === id);
    }
    const { data, error } = await supabase
      .from("trance_routines")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return (data as DanceRoutine) || undefined;
  },

  saveRoutine: async (routine: Partial<DanceRoutine>): Promise<void> => {
    assertConfigured("SupabaseService");
    if (shouldUseFixtures()) {
      console.log("[Dev Fixture Mode] Mock saving routine:", routine);
      return;
    }
    const { error } = await supabase.from("trance_routines").upsert(routine);

    if (error) throw error;
  },
};
