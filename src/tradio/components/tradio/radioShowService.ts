import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { handleMissingTradioTables } from "./auth/tradioProfileBootstrap";
import { generateShowPlan, type ShowBuilderFormState } from "./showPlan";
import { generateRadioShow } from "@/lib/trey-i/vertex.server";
import type { RadioShow } from "./data";

export type ShowServiceSource = "ai" | "local" | "supabase" | "mock";
export interface ShowServiceResult<T> {
  source: ShowServiceSource;
  data: T | null;
  warning: string | null;
}

const rowToShow = (row: Record<string, any>): RadioShow => ({
  id: String(row.id),
  title: row.title ?? "Untitled Show",
  duration: Number(row.duration_min ?? 0),
  mood: row.mood ?? "",
  targetAudience: row.target_audience ?? "",
  hostTone: row.host_tone ?? "",
  musicSource: row.music_source ?? "",
  selectedStation: row.settings?.selectedStation,
  commercialBreaks: Number(row.settings?.commercialBreaks ?? 0),
  fanInteractionStyle: row.settings?.fanInteractionStyle ?? "",
  includeProducerSpotlight: Boolean(row.settings?.includeProducerSpotlight),
  includeArtistPremiere: Boolean(row.settings?.includeArtistPremiere),
  includeListenerRequests: Boolean(row.settings?.includeListenerRequests),
  segments: Array.isArray(row.segments) ? row.segments : [],
  status: row.status ?? "draft",
  aiGenerated: Boolean(row.ai_generated),
});

const showToRow = (show: RadioShow, userId: string) => ({
  user_id: userId,
  title: show.title,
  mood: show.mood,
  duration_min: show.duration,
  target_audience: show.targetAudience,
  host_tone: show.hostTone,
  music_source: show.musicSource,
  status: show.status === "template" ? "template" : show.status,
  is_template: show.status === "template",
  ai_generated: show.aiGenerated,
  segments: show.segments,
  settings: {
    selectedStation: show.selectedStation,
    commercialBreaks: show.commercialBreaks,
    fanInteractionStyle: show.fanInteractionStyle,
    includeProducerSpotlight: show.includeProducerSpotlight,
    includeArtistPremiere: show.includeArtistPremiere,
    includeListenerRequests: show.includeListenerRequests,
  },
});

/** Generate a show plan via Gemini; falls back to the local generator. */
export async function generateShow(
  form: ShowBuilderFormState,
): Promise<ShowServiceResult<RadioShow>> {
  try {
    const show = await generateRadioShow({ data: { form } });
    return { source: show.aiGenerated ? "ai" : "local", data: show, warning: null };
  } catch (err) {
    return {
      source: "local",
      data: generateShowPlan(form),
      warning: err instanceof Error ? err.message : "AI unavailable",
    };
  }
}

async function currentUserId(): Promise<string | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export async function saveShow(show: RadioShow): Promise<ShowServiceResult<RadioShow>> {
  if (!isSupabaseConfigured || !supabase)
    return { source: "mock", data: show, warning: "Supabase not configured; show kept locally." };
  const uid = await currentUserId();
  if (!uid) return { source: "mock", data: show, warning: "Sign in to save shows." };
  try {
    const { data, error } = await supabase
      .from("tradio_radio_shows")
      .insert(showToRow(show, uid))
      .select("*")
      .maybeSingle();
    if (error)
      return { source: "mock", data: show, warning: handleMissingTradioTables(error).message };
    return { source: "supabase", data: data ? rowToShow(data) : show, warning: null };
  } catch (err) {
    return { source: "mock", data: show, warning: handleMissingTradioTables(err).message };
  }
}

export async function listMyShows(): Promise<ShowServiceResult<RadioShow[]>> {
  if (!isSupabaseConfigured || !supabase) return { source: "mock", data: null, warning: null };
  const uid = await currentUserId();
  if (!uid) return { source: "mock", data: null, warning: null };
  try {
    const { data, error } = await supabase
      .from("tradio_radio_shows")
      .select("*")
      .eq("user_id", uid)
      .order("updated_at", { ascending: false });
    if (error)
      return { source: "mock", data: null, warning: handleMissingTradioTables(error).message };
    return {
      source: "supabase",
      data: (Array.isArray(data) ? data : []).map(rowToShow),
      warning: null,
    };
  } catch (err) {
    return { source: "mock", data: null, warning: handleMissingTradioTables(err).message };
  }
}

export async function listTemplates(): Promise<ShowServiceResult<RadioShow[]>> {
  if (!isSupabaseConfigured || !supabase) return { source: "mock", data: null, warning: null };
  try {
    const { data, error } = await supabase
      .from("tradio_radio_shows")
      .select("*")
      .eq("is_template", true)
      .order("updated_at", { ascending: false });
    if (error)
      return { source: "mock", data: null, warning: handleMissingTradioTables(error).message };
    return {
      source: "supabase",
      data: (Array.isArray(data) ? data : []).map(rowToShow),
      warning: null,
    };
  } catch (err) {
    return { source: "mock", data: null, warning: handleMissingTradioTables(err).message };
  }
}

export async function deleteShow(id: string): Promise<ShowServiceResult<null>> {
  if (!isSupabaseConfigured || !supabase) return { source: "mock", data: null, warning: null };
  try {
    const { error } = await supabase.from("tradio_radio_shows").delete().eq("id", id);
    if (error)
      return { source: "mock", data: null, warning: handleMissingTradioTables(error).message };
    return { source: "supabase", data: null, warning: null };
  } catch (err) {
    return { source: "mock", data: null, warning: handleMissingTradioTables(err).message };
  }
}
