import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import {
  generateShowRundownServer as generateShowRundownServerBase,
  generateHostScriptsServer as generateHostScriptsServerBase,
  generateStationDropServer as generateStationDropServerBase,
  generateAdReadServer as generateAdReadServerBase
} from "@/lib/trey-i/broadcastAi.server";
import type {
  TradioShow,
  TradioShowEpisode,
  TradioShowBlock,
  TradioVoiceRender,
  TradioShowScript,
  TradioBroadcastSlot,
  TradioAdSlot,
  TradioShowAnalytics,
  BlockType,
  RightsStatus,
  ClearanceStatus
} from "../types/broadcast";

type ServerCaller<TOutput> = (options: { data: unknown }) => Promise<TOutput>;
type RundownServerBlock = {
  blockType: BlockType;
  title: string;
  description?: string;
  scriptText?: string;
  durationSeconds: number;
  approvalStatus?: TradioShowBlock["approval_status"];
  metadata?: Record<string, any>;
};

const generateShowRundownServer = generateShowRundownServerBase as unknown as ServerCaller<{
  blocks: RundownServerBlock[];
}>;
const generateHostScriptsServer = generateHostScriptsServerBase as unknown as ServerCaller<{
  scriptText: string;
}>;
const generateStationDropServer = generateStationDropServerBase as unknown as ServerCaller<string>;
const generateAdReadServer = generateAdReadServerBase as unknown as ServerCaller<string>;

// Provider-neutral voice rendering interface
export interface VoiceProviderAdapter {
  id: string;
  name: string;
  renderVoice(
    text: string,
    voiceId: string
  ): Promise<{
    audioUrl: string;
    durationSeconds: number;
    provider: string;
    metadata: Record<string, any>
  }>;
}

// Concrete OpenAI Mock Voice Adapter
export class OpenAI_VoiceAdapter implements VoiceProviderAdapter {
  id = "openai";
  name = "OpenAI Voice API";
  async renderVoice(text: string, voiceId: string) {
    const textLen = text.length;
    const estDuration = Math.max(3, Math.round(textLen / 15)); // rough estimate: 15 chars per second
    return {
      audioUrl: `/audio/voice-renders/openai-${voiceId}-${Date.now()}.mp3`,
      durationSeconds: estDuration,
      provider: "openai",
      metadata: {
        voiceId,
        model: "tts-1",
        rendered_at: new Date().toISOString(),
        character_count: textLen,
      }
    };
  }
}

// Concrete ElevenLabs Mock Voice Adapter
export class ElevenLabs_VoiceAdapter implements VoiceProviderAdapter {
  id = "elevenlabs";
  name = "ElevenLabs Premium Reader";
  async renderVoice(text: string, voiceId: string) {
    const textLen = text.length;
    const estDuration = Math.max(3, Math.round(textLen / 13)); // rough estimate: 13 chars per second
    return {
      audioUrl: `/audio/voice-renders/elevenlabs-${voiceId}-${Date.now()}.mp3`,
      durationSeconds: estDuration,
      provider: "elevenlabs",
      metadata: {
        voiceId,
        stability: 0.75,
        clarity: 0.85,
        rendered_at: new Date().toISOString(),
      }
    };
  }
}

// Default Voice Adapter manager
export const VOICE_PROVIDERS: Record<string, VoiceProviderAdapter> = {
  openai: new OpenAI_VoiceAdapter(),
  elevenlabs: new ElevenLabs_VoiceAdapter(),
};

export async function renderVoiceWithProvider(
  providerId: string,
  text: string,
  voiceId: string,
  episodeId: string,
  blockId?: string | null
): Promise<TradioVoiceRender> {
  const provider = VOICE_PROVIDERS[providerId] || VOICE_PROVIDERS.openai;
  const result = await provider.renderVoice(text, voiceId);

  let userId = "00000000-0000-0000-0000-000000000000";
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) userId = data.user.id;
  }

  const voiceRender: TradioVoiceRender = {
    id: `vr-${Date.now()}`,
    episode_id: episodeId,
    block_id: blockId,
    user_id: userId,
    provider: result.provider,
    voice_id: voiceId,
    audio_url: result.audioUrl,
    duration_seconds: result.durationSeconds,
    metadata: result.metadata,
    created_at: new Date().toISOString(),
  };

  // Optionally persist in tradio_voice_renders if DB is available
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("tradio_voice_renders").insert({
        episode_id: voiceRender.episode_id,
        block_id: voiceRender.block_id,
        user_id: voiceRender.user_id,
        provider: voiceRender.provider,
        voice_id: voiceRender.voice_id,
        audio_url: voiceRender.audio_url,
        duration_seconds: voiceRender.duration_seconds,
        metadata: voiceRender.metadata,
      });
    } catch (e) {
      console.warn("Failed to persist voice render, proceeding with local object:", e);
    }
  }

  return voiceRender;
}

/**
 * 1. generateShowRundown
 * Generates structured blocks for an episode plan.
 * Connects to the real AI server function, falling back to a deterministic planner on failure.
 */
export async function generateShowRundown(input: {
  title: string;
  showType: string;
  mood: string;
  durationMinutes: number;
  hostTone: string;
  musicSourcePref: string;
  commercialBreaks: number;
  includeListenerRequests: boolean;
  includeProducerSpotlight: boolean;
  includeArtistPremiere: boolean;
}): Promise<{ blocks: Partial<TradioShowBlock>[]; warning?: string }> {
  try {
    const res = await generateShowRundownServer({
      data: {
        showTitle: input.title,
        showDescription: "AI Program Curation",
        showType: input.showType,
        moodTags: [input.mood],
        genreTags: [],
        audienceTags: ["Trey TV Broadcast Listeners"],
        episodeTitle: "Draft Compilation",
        episodeDescription: "AI Curated Sequence",
        durationMinutes: input.durationMinutes,
        creatorRole: input.hostTone,
        musicSourcePref: input.musicSourcePref,
        hasAds: input.commercialBreaks > 0,
      }
    });

    const blocks: Partial<TradioShowBlock>[] = res.blocks.map((b) => ({
      block_type: b.blockType,
      title: b.title,
      description: b.description,
      script_text: b.scriptText,
      start_time_seconds: 0,
      duration_seconds: b.durationSeconds,
      sort_order: 0,
      volume_level: 1.0,
      fade_in_seconds: 1.5,
      fade_out_seconds: 1.5,
      approval_status: b.approvalStatus,
      clearance_status: b.blockType === "song" ? "unclear" : "cleared",
      metadata: b.metadata || {},
    }));

    return { blocks };
  } catch (e: any) {
    console.warn("[Tradio Service] Gemini rundown generation failed. Falling back to local generator.", e);

    const blocks: Partial<TradioShowBlock>[] = [];
    let currentTime = 0;

    const addBlock = (
      type: BlockType,
      title: string,
      duration: number,
      description: string,
      scriptText?: string
    ) => {
      blocks.push({
        block_type: type,
        title,
        description,
        script_text: scriptText || "",
        start_time_seconds: currentTime,
        duration_seconds: duration,
        sort_order: blocks.length,
        volume_level: 1.0,
        fade_in_seconds: 1.5,
        fade_out_seconds: 1.5,
        approval_status: "pending",
        clearance_status: type === "song" ? "unclear" : "cleared",
        metadata: {},
      });
      currentTime += duration;
    };

    addBlock(
      "intro",
      "Show Opener",
      120,
      `Dynamic high-vibe intro set in a ${input.hostTone} voice.`,
      `Welcome to ${input.title}! We are live on the airwaves, feeding you those deep ${input.mood} vibrations. Put your seatbelt on.`
    );

    addBlock(
      "voiceover",
      "Host Context Block",
      90,
      `Frame the session for fans.`,
      `Tonight we're diving deep into the sonic universe. This is curated strictly for those who want discovery and high-status drops.`
    );

    const songs = await suggestMusicBlocks({ mood: input.mood, count: 2 });
    songs.forEach((song) => {
      addBlock(
        "song",
        song.title,
        240,
        `Track by ${song.artist}. Source: ${input.musicSourcePref}`,
        ""
      );
    });

    if (input.commercialBreaks > 0) {
      addBlock(
        "ad",
        "Network Sponsor Break",
        60,
        "Trey TV audio ad break placement.",
        "Support for Trey TV comes from the Zodiac Club. Unlock exclusive premium events by holding a verification token."
      );
    }

    if (input.includeListenerRequests) {
      addBlock(
        "submission_block",
        "Fan Request Queue",
        300,
        "Unlocking crowdsourced fan requests requested dynamically.",
        "The queue is unlocked. You select the vibe, we stream it live. Let's see what is trending in the console."
      );
    }

    if (input.includeProducerSpotlight) {
      addBlock(
        "producer_spotlight",
        "Producer Beat Showcase",
        180,
        "Feature fresh loops & beats for vocal pitches.",
        "Calling all artists. This is your producer spotlight block. We are dropping a heavy Memphis loop right now. Record your vocals in the workspace."
      );
    }

    if (input.includeArtistPremiere) {
      addBlock(
        "artist_spotlight",
        "Artist Release Premiere",
        240,
        "Official first-listen track premiere.",
        "Time for our exclusive premiere! First listen, pinned in-studio. Let us know how this feels in the live reactions panel."
      );
    }

    addBlock(
      "outro",
      "Broadcast Signoff",
      120,
      "Closing message and replay packaging.",
      `That is all for our session tonight on ${input.title}. This is your host signing off, leaving you with smooth background frequencies.`
    );

    return { blocks, warning: "Local AI model fallback generated the timeline rundown successfully." };
  }
}

/**
 * 2. generateHostScripts
 * Generates script text for a voiceover block.
 */
export async function generateHostScripts(input: {
  blockTitle: string;
  blockType: string;
  hostTone: string;
  promptNotes?: string;
  showContext?: string;
  styleModifier?: string;
}): Promise<string> {
  try {
    const res = await generateHostScriptsServer({
      data: {
        blockTitle: input.blockTitle,
        blockType: input.blockType,
        styleMode: input.hostTone,
        promptNotes: input.promptNotes,
        showContext: input.showContext,
        styleModifier: input.styleModifier,
      }
    });
    return res.scriptText;
  } catch (e: any) {
    console.warn("[Tradio Service] Gemini script generation failed. Falling back to local script templates.", e);
    const tone = input.hostTone.toLowerCase();
    const notes = input.promptNotes ? ` (${input.promptNotes})` : "";

    if (input.blockType === "intro") {
      return `Mic on. Welcome back to our premium lane. We're tuning in live with a highly curated ${tone} set.${notes} Let's set the atmosphere right now.`;
    }
    if (input.blockType === "outro") {
      return `And that concludes another high-status broadcast. Make sure to save this replay package to your library. Until next time, stay locked in.${notes}`;
    }
    if (input.blockType === "voiceover" || input.blockType === "transition") {
      return `Host speaking. We are flowing into our next segment. I want to highlight some exclusive underground drops.${notes} Stay tuned.`;
    }
    return `Host drop: This is the ${input.blockTitle} on Tradio Broadcast Network.${notes}`;
  }
}

/**
 * 3. generateStationDrop
 * Generates customized station drops.
 */
export async function generateStationDrop(input: {
  dropText: string;
  hostTone: string;
}): Promise<string> {
  try {
    return await generateStationDropServer({ data: input });
  } catch (e) {
    console.warn("[Tradio Service] Gemini drop generation failed, using local fallback.", e);
    return `[TRADIO DROP]: "You are tuned into Trey Trizzy Radio. ${input.dropText} - strictly premium, strictly live."`;
  }
}

/**
 * 4. generateAdRead
 * Generates an ad script.
 */
export async function generateAdRead(input: {
  adProvider: string;
  durationSeconds: number;
  tone: string;
}): Promise<string> {
  try {
    return await generateAdReadServer({ data: input });
  } catch (e) {
    console.warn("[Tradio Service] Gemini ad read generation failed, using local fallback.", e);
    return `[SPONSOR READ - ${input.adProvider}]: "This episode is brought to you by ${input.adProvider}. Step into premium comfort and high-fidelity sound. Explore their brand today." (${input.durationSeconds}s read, ${input.tone} delivery)`;
  }
}

/**
 * 5. suggestMusicBlocks
 * Suggests songs based on mood.
 */
export async function suggestMusicBlocks(input: {
  mood: string;
  count: number;
}): Promise<{ title: string; artist: string; rightsStatus: RightsStatus }[]> {
  const allSongs = [
    { title: "Midnight Velvet", artist: "Mila Rain", rightsStatus: "creator_owned" as const },
    { title: "6AM Thoughts", artist: "Jordan Host", rightsStatus: "licensed_catalog" as const },
    { title: "Persuasion", artist: "Trey Trizzy", rightsStatus: "tradio_native" as const },
    { title: "City Lights", artist: "Darius", rightsStatus: "approved_submission" as const },
    { title: "After Hours", artist: "Mila Rain", rightsStatus: "creator_owned" as const },
    { title: "Neon Heartbreak", artist: "Kiana", rightsStatus: "unclear" as const },
  ];

  const moodSongs = allSongs.filter(s => {
    const isLate = input.mood.toLowerCase().includes("late") || input.mood.toLowerCase().includes("chill");
    if (isLate) return s.title === "Midnight Velvet" || s.title === "6AM Thoughts" || s.title === "After Hours";
    return true;
  });

  const selected = moodSongs.length > 0 ? moodSongs : allSongs;
  return selected.slice(0, input.count);
}

/**
 * 6. validateShowReadiness
 * Performs a sanity checklist on an episode before allowing publication.
 */
export async function validateShowReadiness(
  episodeId: string,
  blocks: TradioShowBlock[]
): Promise<{ ready: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  if (blocks.length === 0) {
    warnings.push("Episode timeline is completely empty. Please add some segments.");
  }

  // Check that we have an intro and outro
  const hasIntro = blocks.some(b => b.block_type === "intro");
  const hasOutro = blocks.some(b => b.block_type === "outro");

  if (!hasIntro) warnings.push("Missing an 'intro' segment block to open the show.");
  if (!hasOutro) warnings.push("Missing an 'outro' segment block to close the show.");

  // Check music rights clearance
  const unclearSongs = blocks.filter(b => b.block_type === "song" && b.clearance_status !== "cleared");
  if (unclearSongs.length > 0) {
    warnings.push(`${unclearSongs.length} music track(s) do not have cleared broadcast rights yet.`);
  }

  // Check script readiness for voiceovers
  const missingScripts = blocks.filter(
    b => (b.block_type === "intro" || b.block_type === "voiceover" || b.block_type === "outro") && !b.script_text?.trim()
  );
  if (missingScripts.length > 0) {
    warnings.push(`${missingScripts.length} host-talk segment(s) are missing their script texts.`);
  }

  return {
    ready: warnings.length === 0,
    warnings,
  };
}

/**
 * 7. Database Operations Service Layer
 * Fully queries and mutates public.tradio_ tables.
 * Safely falls back to local memory simulation if Supabase is unconfigured or offline.
 */

export async function listMyShows(): Promise<TradioShow[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("[Tradio Service] Supabase not connected. Returning local shows.");
    return [];
  }
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("tradio_shows")
      .select("*")
      .eq("owner_user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[Tradio Service] listMyShows error:", e);
    throw e;
  }
}

export async function getShowById(id: string): Promise<TradioShow | null> {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from("tradio_shows")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] getShowById error:", e);
    throw e;
  }
}

export async function createShow(show: Omit<TradioShow, "id" | "created_at" | "updated_at">): Promise<TradioShow> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot insert show in cloud DB.");
  }
  try {
    const { data, error } = await supabase
      .from("tradio_shows")
      .insert(show)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] createShow error:", e);
    throw e;
  }
}

export async function updateShow(id: string, updates: Partial<TradioShow>): Promise<TradioShow> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot update show in cloud DB.");
  }
  try {
    const { data, error } = await supabase
      .from("tradio_shows")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] updateShow error:", e);
    throw e;
  }
}

export async function listEpisodesForShow(showId: string): Promise<TradioShowEpisode[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from("tradio_show_episodes")
      .select("*")
      .eq("show_id", showId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[Tradio Service] listEpisodesForShow error:", e);
    throw e;
  }
}

export async function createEpisode(episode: Omit<TradioShowEpisode, "id" | "created_at" | "updated_at">): Promise<TradioShowEpisode> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot insert episode in cloud DB.");
  }
  try {
    const { data, error } = await supabase
      .from("tradio_show_episodes")
      .insert(episode)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] createEpisode error:", e);
    throw e;
  }
}

export async function updateEpisode(id: string, updates: Partial<TradioShowEpisode>): Promise<TradioShowEpisode> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot update episode in cloud DB.");
  }
  try {
    const { data, error } = await supabase
      .from("tradio_show_episodes")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] updateEpisode error:", e);
    throw e;
  }
}

export async function listBlocksForEpisode(episodeId: string): Promise<TradioShowBlock[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from("tradio_show_blocks")
      .select("*")
      .eq("episode_id", episodeId)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[Tradio Service] listBlocksForEpisode error:", e);
    throw e;
  }
}

export async function createBlock(block: Omit<TradioShowBlock, "id" | "created_at" | "updated_at">): Promise<TradioShowBlock> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot insert block in cloud DB.");
  }
  try {
    const { data, error } = await supabase
      .from("tradio_show_blocks")
      .insert(block)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] createBlock error:", e);
    throw e;
  }
}

export async function updateBlock(id: string, updates: Partial<TradioShowBlock>): Promise<TradioShowBlock> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot update block in cloud DB.");
  }
  try {
    const { data, error } = await supabase
      .from("tradio_show_blocks")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] updateBlock error:", e);
    throw e;
  }
}

export async function reorderEpisodeBlocks(blocks: { id: string; sort_order: number }[]): Promise<void> {
  if (!isSupabaseConfigured || !supabase) return;
  try {
    const { error } = await supabase
      .from("tradio_show_blocks")
      .upsert(blocks);

    if (error) throw error;
  } catch (e) {
    console.error("[Tradio Service] reorderEpisodeBlocks error:", e);
    throw e;
  }
}

export async function deleteBlock(id: string): Promise<void> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot delete block from cloud DB.");
  }
  try {
    const { error } = await supabase
      .from("tradio_show_blocks")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (e) {
    console.error("[Tradio Service] deleteBlock error:", e);
    throw e;
  }
}

export async function validateEpisodeDraft(episodeId: string, blocks: TradioShowBlock[]): Promise<{ ready: boolean; warnings: string[] }> {
  const warnings: string[] = [];

  let episode: TradioShowEpisode | null = null;
  let show: TradioShow | null = null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: epData } = await supabase
        .from("tradio_show_episodes")
        .select("*")
        .eq("id", episodeId)
        .maybeSingle();
      episode = epData;

      if (episode) {
        const { data: showData } = await supabase
          .from("tradio_shows")
          .select("*")
          .eq("id", episode.show_id)
          .maybeSingle();
        show = showData;
      }
    } catch {
      // ignore, fall back
    }
  }

  // 1. Check episode exists
  if (isSupabaseConfigured && supabase && !episode) {
    warnings.push("Episode does not exist in the database.");
  }

  // 2. Check parent show exists
  if (episode && !show && isSupabaseConfigured && supabase) {
    warnings.push("Parent Show Lane does not exist or has been deleted.");
  }

  // 3. User owns the episode or is admin/owner
  if (episode && isSupabaseConfigured && supabase) {
    try {
      const { data: authUser } = await supabase.auth.getUser();
      if (authUser?.user && episode.user_id !== authUser.user.id) {
        const { data: roles } = await supabase
          .from("tradio_user_roles")
          .select("role")
          .eq("user_id", authUser.user.id)
          .maybeSingle();

        const isAdmin = roles && (roles.role === "admin" || roles.role === "owner");
        if (!isAdmin) {
          warnings.push("You do not have permission to manage this episode. Ownership verification failed.");
        }
      }
    } catch {
      // ignore auth error in local
    }
  }

  // 4. Episode has at least one block
  if (blocks.length === 0) {
    warnings.push("Episode timeline is completely empty. Please generate a rundown or add segments manually.");
  }

  // 5. All required block durations are valid (e.g. positive)
  const invalidDurations = blocks.filter((b) => b.duration_seconds <= 0);
  if (invalidDurations.length > 0) {
    warnings.push(`${invalidDurations.length} segment(s) have invalid durations. Durations must be strictly positive.`);
  }

  // 6. Public-ready episodes do not include unclear external music rights
  const unclearSongs = blocks.filter(
    (b) => b.block_type === "song" && ((b as any).rights_status === "unclear" || b.approval_status === "rejected")
  );
  if (unclearSongs.length > 0) {
    warnings.push(`${unclearSongs.length} music track(s) do not have cleared broadcast rights yet.`);
  }

  // 7. Script blocks have script_text or attached voice render when required (intro, voiceover, transition, outro)
  const scriptTypes = ["intro", "voiceover", "transition", "outro"];
  const missingScripts = blocks.filter(
    (b) => scriptTypes.includes(b.block_type) && !b.script_text?.trim() && !b.media_url
  );
  if (missingScripts.length > 0) {
    warnings.push(`${missingScripts.length} host script(s) are empty and have no attached voice renders. Please generate or write host scripts.`);
  }

  // 8. If voiceover blocks have attached media_url, verify they are valid/completed renders
  const failedRenders = blocks.filter(
    (b) => scriptTypes.includes(b.block_type) && b.media_url && (b.media_url.includes("fail") || b.metadata?.render_status === "failed" || b.metadata?.render_status === "canceled")
  );
  if (failedRenders.length > 0) {
    warnings.push(`${failedRenders.length} attached voice render(s) have failed or been canceled. Please regenerate them.`);
  }

  // 9. Unclear audio source on custom segments does not count as approved
  const unclearAudio = blocks.filter(
    (b) => (b.block_type === "station_drop" || b.block_type === "ad") && b.media_url && b.clearance_status === "unclear"
  );
  if (unclearAudio.length > 0) {
    warnings.push(`${unclearAudio.length} segment(s) have unclear audio sources. Please clear rights or verify audio sources.`);
  }

  return {
    ready: warnings.length === 0,
    warnings,
  };
}

export async function generateTransitionScript(input: {
  blockTitle: string;
  hostTone: string;
  promptNotes?: string;
}): Promise<string> {
  try {
    const res = await generateHostScriptsServer({
      data: {
        blockTitle: input.blockTitle,
        blockType: "transition",
        styleMode: input.hostTone,
        promptNotes: input.promptNotes,
      }
    });
    return res.scriptText;
  } catch {
    return `[Transition]: Smooth transition flowing from our previous selection into the next block. Tuning the dials.`;
  }
}

export async function generateArtistSpotlight(input: {
  artistName: string;
  trackTitle: string;
  hostTone: string;
  promptNotes?: string;
}): Promise<string> {
  try {
    const res = await generateHostScriptsServer({
      data: {
        blockTitle: `${input.artistName} Artist Spotlight`,
        blockType: "artist_spotlight",
        styleMode: input.hostTone,
        promptNotes: `Feature the track "${input.trackTitle}" by ${input.artistName}. ${input.promptNotes || ""}`,
      }
    });
    return res.scriptText;
  } catch {
    return `[Artist Spotlight]: Time to spotlight a major release. This is "${input.trackTitle}" from the extremely talented ${input.artistName}. Let's dive into the master cut.`;
  }
}

export async function generateProducerSpotlight(input: {
  producerName: string;
  bpm: number;
  hostTone: string;
  promptNotes?: string;
}): Promise<string> {
  try {
    const res = await generateHostScriptsServer({
      data: {
        blockTitle: `${input.producerName} Beat Spotlight`,
        blockType: "producer_spotlight",
        styleMode: input.hostTone,
        promptNotes: `Feature a ${input.bpm} BPM beat by ${input.producerName}. ${input.promptNotes || ""}`,
      }
    });
    return res.scriptText;
  } catch {
    return `[Producer Spotlight]: Shouting out the architects of the sound. Dropping a premium ${input.bpm} BPM loop from the catalog by ${input.producerName}. Record your pitches.`;
  }
}

export async function generateEpisodeOutro(input: {
  showTitle: string;
  hostTone: string;
  promptNotes?: string;
}): Promise<string> {
  try {
    const res = await generateHostScriptsServer({
      data: {
        blockTitle: "Broadcast Outro",
        blockType: "outro",
        styleMode: input.hostTone,
        promptNotes: `Closing signoff for the show "${input.showTitle}". ${input.promptNotes || ""}`,
      }
    });
    return res.scriptText;
  } catch {
    return `[Outro]: That concludes our broadcast session tonight on ${input.showTitle}. We are floating into background noise. Stay tuned to Tradio.`;
  }
}

export async function saveGeneratedRundownToBlocks(
  showId: string,
  episodeId: string,
  blocks: Partial<TradioShowBlock>[]
): Promise<TradioShowBlock[]> {
  if (!isSupabaseConfigured || !supabase) {
    return blocks.map((b, i) => ({
      ...b,
      id: b.id || `local-block-${i}-${Date.now()}`,
      show_id: showId,
      episode_id: episodeId,
      user_id: "00000000-0000-0000-0000-000000000000",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })) as TradioShowBlock[];
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || "00000000-0000-0000-0000-000000000000";

    await supabase.from("tradio_show_blocks").delete().eq("episode_id", episodeId);

    let cumulativeTime = 0;
    const recordsToInsert = blocks.map((b, index) => {
      const duration = b.duration_seconds || 180;
      const record = {
        show_id: showId,
        episode_id: episodeId,
        owner_user_id: userId,
        block_type: b.block_type || "voiceover",
        title: b.title || `Segment ${index + 1}`,
        description: b.description || "",
        script_text: b.script_text || "",
        media_url: b.media_url || null,
        asset_id: b.asset_id || null,
        start_time_seconds: cumulativeTime,
        duration_seconds: duration,
        sort_order: index,
        volume_level: b.volume_level !== undefined ? b.volume_level : 1.0,
        fade_in_seconds: b.fade_in_seconds !== undefined ? b.fade_in_seconds : 1.5,
        fade_out_seconds: b.fade_out_seconds !== undefined ? b.fade_out_seconds : 1.5,
        approval_status: b.approval_status || "pending",
        rights_status: (b as any).rights_status || "unclear",
        metadata: b.metadata || {},
      };
      cumulativeTime += duration;
      return record;
    });

    const { data, error } = await supabase
      .from("tradio_show_blocks")
      .insert(recordsToInsert)
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[Tradio Service] saveGeneratedRundownToBlocks error:", e);
    throw e;
  }
}

export async function saveGeneratedScriptRevision(input: {
  episodeId: string;
  blockId?: string | null;
  scriptText: string;
  revisionNumber: number;
  scriptType: string;
  promptInput?: string;
  status?: "draft" | "final";
}): Promise<TradioShowScript> {
  let userId = "00000000-0000-0000-0000-000000000000";
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data?.user) userId = data.user.id;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("tradio_show_scripts")
        .insert({
          episode_id: input.episodeId,
          block_id: input.blockId,
          owner_user_id: userId,
          script_type: input.scriptType || "voiceover",
          prompt_input: input.promptInput || "Regenerate block",
          script_text: input.scriptText,
          revision_number: input.revisionNumber,
          status: input.status || "draft",
          metadata: {
            wordCount: input.scriptText.split(/\s+/).length,
            saved_at: new Date().toISOString(),
          }
        })
        .select("*")
        .single();

      if (error) throw error;
      return {
        id: data.id,
        episode_id: data.episode_id,
        block_id: data.block_id,
        user_id: data.owner_user_id,
        script_text: data.script_text,
        generated_by_ai: true,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
    } catch (e) {
      console.warn("Failed to insert script revision into DB, returning local schema", e);
    }
  }

  return {
    id: `local-script-${Date.now()}`,
    episode_id: input.episodeId,
    block_id: input.blockId,
    user_id: userId,
    script_text: input.scriptText,
    generated_by_ai: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function listBroadcastSlots(showId: string): Promise<TradioBroadcastSlot[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase
      .from("tradio_broadcast_slots")
      .select("*")
      .eq("show_id", showId)
      .order("start_time", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error("[Tradio Service] listBroadcastSlots error:", e);
    throw e;
  }
}

export async function createBroadcastSlot(slot: Omit<TradioBroadcastSlot, "id" | "created_at">): Promise<TradioBroadcastSlot> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Supabase is offline. Cannot insert broadcast slot in cloud DB.");
  }
  try {
    const { data, error } = await supabase
      .from("tradio_broadcast_slots")
      .insert(slot)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  } catch (e) {
    console.error("[Tradio Service] createBroadcastSlot error:", e);
    throw e;
  }
}
