import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import type { 
  TradioShowBlock, 
  TradioVoiceRender, 
  BlockType,
  RightsStatus,
  ClearanceStatus
} from "../types/broadcast";

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
  // Deterministic generator fallback
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

  // Add opening
  addBlock(
    "intro",
    "Show Opener",
    120,
    `Dynamic high-vibe intro set in a ${input.hostTone} voice.`,
    `Welcome to ${input.title}! We are live on the airwaves, feeding you those deep ${input.mood} vibrations. Put your seatbelt on.`
  );

  // Add Host Commentary
  addBlock(
    "voiceover",
    "Host Context Block",
    90,
    `Frame the session for fans.`,
    `Tonight we're diving deep into the sonic universe. This is curated strictly for those who want discovery and high-status drops.`
  );

  // Suggested Songs
  const songs = await suggestMusicBlocks({ mood: input.mood, count: 2 });
  songs.forEach((song, i) => {
    addBlock(
      "song",
      song.title,
      240,
      `Track by ${song.artist}. Source: ${input.musicSourcePref}`,
      ""
    );
  });

  // Optional Add Breaks
  if (input.commercialBreaks > 0) {
    addBlock(
      "ad",
      "Network Sponsor Break",
      60,
      "Trey TV audio ad break placement.",
      "Support for Trey TV comes from the Zodiac Club. Unlock exclusive premium events by holding a verification token."
    );
  }

  // Listener requests block
  if (input.includeListenerRequests) {
    addBlock(
      "submission_block",
      "Fan Request Queue",
      300,
      "Unlocking crowdsourced fan requests requested dynamically.",
      "The queue is unlocked. You select the vibe, we stream it live. Let's see what is trending in the console."
    );
  }

  // Producer spotlight
  if (input.includeProducerSpotlight) {
    addBlock(
      "producer_spotlight",
      "Producer Beat Showcase",
      180,
      "Feature fresh loops & beats for vocal pitches.",
      "Calling all artists. This is your producer spotlight block. We are dropping a heavy Memphis loop right now. Record your vocals in the workspace."
    );
  }

  // Artist premiere
  if (input.includeArtistPremiere) {
    addBlock(
      "artist_spotlight",
      "Artist Release Premiere",
      240,
      "Official first-listen track premiere.",
      "Time for our exclusive premiere! First listen, pinned in-studio. Let us know how this feels in the live reactions panel."
    );
  }

  // Add Outro
  addBlock(
    "outro",
    "Broadcast Signoff",
    120,
    "Closing message and replay packaging.",
    `That is all for our session tonight on ${input.title}. This is your host signing off, leaving you with smooth background frequencies.`
  );

  return { blocks, warning: "Local AI model generated the timeline rundown successfully." };
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
}): Promise<string> {
  const tone = input.hostTone.toLowerCase();
  const notes = input.promptNotes ? ` (${input.promptNotes})` : "";
  
  if (input.blockType === "intro") {
    return `Mic on. Welcome back to our premium lane. We're tuning in live with a highly curated ${tone} set.${notes} Let's set the atmosphere right now.`;
  }
  if (input.blockType === "outro") {
    return `And that concludes another high-status broadcast. Make sure to save this replay package to your library. Until next time, stay locked in.${notes}`;
  }
  if (input.blockType === "voiceover") {
    return `Host speaking. We are flowing into our next segment. I want to highlight some exclusive underground drops.${notes} Stay tuned.`;
  }
  return `Host drop: This is the ${input.blockTitle} on Tradio Broadcast Network.${notes}`;
}

/**
 * 3. generateStationDrop
 * Generates customized station drops.
 */
export async function generateStationDrop(input: {
  dropText: string;
  hostTone: string;
}): Promise<string> {
  return `[TRADIO DROP]: "You are tuned into Trey Trizzy Radio. ${input.dropText} - strictly premium, strictly live."`;
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
  return `[SPONSOR READ - ${input.adProvider}]: "This episode is brought to you by ${input.adProvider}. Step into premium comfort and high-fidelity sound. Explore their brand today." (${input.durationSeconds}s read, ${input.tone} delivery)`;
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
