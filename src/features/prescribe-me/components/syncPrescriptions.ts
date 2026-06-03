import { supabase, hasSupabaseConfig } from "@/lib/supabase";
import type { SavedPrescription } from "./data";

interface DBRow {
  id: string;
  user_id: string;
  client_id: string | null;
  title: string | null;
  selected_moods: string[] | null;
  selected_energy: string | null;
  selected_content_types: string[] | null;
  selected_moment_needs: string[] | null;
  generated_recommendations: unknown;
  top_recommendation_id: string | null;
  match_score: number | null;
  is_saved: boolean | null;
  is_favorite: boolean | null;
  created_at: string;
}

const toRow = (p: SavedPrescription, userId: string) => ({
  user_id: userId,
  client_id: p.id,
  title: p.title,
  selected_moods: p.answers.moods,
  selected_energy: p.answers.energy,
  selected_content_types: p.answers.contentTypes,
  selected_moment_needs: p.answers.momentNeeds,
  generated_recommendations: p.recIds,
  top_recommendation_id: p.topId || null,
  match_score: p.matchScore,
  is_saved: p.isSaved,
  is_favorite: p.isFavorite,
  created_at: new Date(p.createdAt).toISOString(),
});

const fromRow = (row: DBRow): SavedPrescription => {
  const recIds = Array.isArray(row.generated_recommendations)
    ? (row.generated_recommendations as string[])
    : [];
  return {
    id: row.client_id || row.id,
    title: row.title || "My Prescription",
    answers: {
      moods: (row.selected_moods || []) as SavedPrescription["answers"]["moods"],
      energy: (row.selected_energy as SavedPrescription["answers"]["energy"]) ?? null,
      contentTypes: (row.selected_content_types ||
        []) as SavedPrescription["answers"]["contentTypes"],
      momentNeeds: (row.selected_moment_needs || []) as SavedPrescription["answers"]["momentNeeds"],
    },
    topId: row.top_recommendation_id || "",
    recIds,
    matchScore: row.match_score ?? 0,
    createdAt: new Date(row.created_at).getTime(),
    isSaved: !!row.is_saved,
    isFavorite: !!row.is_favorite,
  };
};

const dedupeById = (list: SavedPrescription[]) => {
  const map = new Map<string, SavedPrescription>();
  for (const p of list) {
    const existing = map.get(p.id);
    if (!existing || p.createdAt > existing.createdAt) map.set(p.id, p);
  }
  return [...map.values()].sort((a, b) => b.createdAt - a.createdAt);
};

/** Push every local prescription to DB (upsert on user_id + client_id), then return merged list. */
export async function syncOnSignIn(
  userId: string,
  local: SavedPrescription[],
): Promise<SavedPrescription[]> {
  if (!hasSupabaseConfig || !supabase) return local;

  // 1) push local to DB
  if (local.length > 0) {
    const rows = local.map((p) => toRow(p, userId));
    const { error } = await supabase
      .from("prescribe_me_sessions")
      .upsert(rows, { onConflict: "user_id,client_id" });
    if (error) console.warn("[prescribe] upsert local error", error.message);
  }
  // 2) pull all rows for this user
  const { data, error } = await supabase
    .from("prescribe_me_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) {
    console.warn("[prescribe] fetch error", error.message);
    return local;
  }
  const remote = (data as DBRow[]).map(fromRow);
  return dedupeById([...remote, ...local]);
}

/** Upsert a single prescription for the current user. Silent failure (we keep local copy). */
export async function upsertPrescription(userId: string, p: SavedPrescription): Promise<void> {
  if (!hasSupabaseConfig || !supabase) return;

  const { error } = await supabase
    .from("prescribe_me_sessions")
    .upsert([toRow(p, userId)], { onConflict: "user_id,client_id" });
  if (error) console.warn("[prescribe] upsert error", error.message);
}
