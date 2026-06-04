import { isSupabaseConfigured, supabase } from "@/tradio/lib/supabaseClient";
import { TradioLiveSfxDrop } from "../types/broadcastLiveMicTypes";
import { triggerSfxDropServer } from "../../../../lib/trey-i/broadcastLiveMic.server";

// Reusable Web Audio API synthesizer for mock fallbacks
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Generates custom synthesized SFX using Web Audio API for high-fidelity offline fallbacks
 */
export function playSynthesizedSfx(type: string) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === "airhorn") {
      // Classic multi-oscillator airhorn blast
      const duration = 0.8;
      const freqs = [330, 349, 392]; // dissonant brassy notes

      freqs.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(f, now);

        // Quick attack, sustain, rapid decay
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
        gain.gain.setValueAtTime(0.15, now + duration - 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } else if (type === "applause") {
      // White noise synthesis for clapping crowd
      const duration = 1.5;
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate random white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter to model applause sweeps
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1000;
      filter.Q.value = 1.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.2);
      gain.gain.linearRampToValueAtTime(0.2, now + duration - 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration);
    } else if (type === "riser") {
      // Frequency sweep riser
      const duration = 2.0;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + duration);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.5);
      gain.gain.setValueAtTime(0.2, now + duration - 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } else {
      // Default alert/bell sweep
      const duration = 0.4;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + duration);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    }
  } catch (err) {
    console.error("Audio Context playback error:", err);
  }
}

/**
 * Triggers a sound drop event on the server and executes local playback fallback
 */
export async function triggerSfxDrop(
  sessionId: string,
  roomId: string,
  channelId: string,
  drop: TradioLiveSfxDrop,
  playbackPositionSeconds: number | null = null,
): Promise<void> {
  // 1. Play locally for instant auditory feedback
  if (drop.audio_url) {
    try {
      const audio = new Audio(drop.audio_url);
      audio.volume = 0.5;
      await audio.play();
    } catch {
      // Local fallback playout
      playSynthesizedSfx(drop.sfx_type);
    }
  } else {
    playSynthesizedSfx(drop.sfx_type);
  }

  // 2. Transmit to server to log the trigger event
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await triggerSfxDropServer({
        data: {
          sessionId,
          roomId,
          channelId,
          sfxDropId: drop.id,
          userId: data.user.id,
          playbackPositionSeconds,
        },
      });
    }
  } else {
    console.log(`[Offline SFX] Triggered drop: ${drop.title} (${drop.sfx_type})`);
  }
}

/**
 * Fetches configured reusable SFX drops for a room/creator
 */
export async function listSfxDrops(roomId: string | null = null): Promise<TradioLiveSfxDrop[]> {
  const defaultSfx: TradioLiveSfxDrop[] = [
    {
      id: "sfx-default-airhorn",
      owner_user_id: "00000000-0000-0000-0000-000000000000",
      channel_id: null,
      room_id: null,
      title: "Tradio Airhorn 📢",
      audio_url: null,
      storage_path: null,
      sfx_type: "airhorn",
      visibility: "public",
      duration_seconds: 1.0,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sfx-default-applause",
      owner_user_id: "00000000-0000-0000-0000-000000000000",
      channel_id: null,
      room_id: null,
      title: "Crowd Cheers 👏",
      audio_url: null,
      storage_path: null,
      sfx_type: "applause",
      visibility: "public",
      duration_seconds: 2.0,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sfx-default-riser",
      owner_user_id: "00000000-0000-0000-0000-000000000000",
      channel_id: null,
      room_id: null,
      title: "Tension Riser 📈",
      audio_url: null,
      storage_path: null,
      sfx_type: "riser",
      visibility: "public",
      duration_seconds: 2.0,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "sfx-default-bell",
      owner_user_id: "00000000-0000-0000-0000-000000000000",
      channel_id: null,
      room_id: null,
      title: "Broadcast Bell 🔔",
      audio_url: null,
      storage_path: null,
      sfx_type: "custom",
      visibility: "public",
      duration_seconds: 0.5,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("tradio_live_sfx_drops")
      .select("*")
      .or(`visibility.eq.public,owner_user_id.eq.${(await supabase.auth.getUser()).data.user?.id || ""}`);

    if (error) {
      console.warn("Could not query custom drops, returning defaults:", error.message);
      return defaultSfx;
    }

    return [...defaultSfx, ...(data || [])] as TradioLiveSfxDrop[];
  } else {
    return defaultSfx;
  }
}
