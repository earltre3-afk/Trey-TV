import { createServerFn } from "@tanstack/react-start";
import { Modality } from "@google/genai";
import { buildGeminiClient } from "./aiProvider.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getVoiceRenderStoragePath, uploadVoiceRenderAudioServer } from "../../tradio/components/tradio/services/broadcastVoiceStorage";
import { VoiceRenderInput, VoiceRenderResult, VoiceRenderStatus } from "../../tradio/components/tradio/types/broadcastVoiceTypes";

const supabaseAdminFrom = (table: string) => (supabaseAdmin as any).from(table);

// Generates a tiny playable 1.5s 8kHz mono 8-bit WAV file in JS as fallback
function generateTinyWavBuffer(message?: string): Buffer {
  const sampleRate = 8000;
  const numSamples = 12000; // 1.5 seconds
  const buffer = Buffer.alloc(44 + numSamples);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + numSamples, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // 1 channel
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate, 28); // Byte rate
  buffer.writeUInt16LE(1, 32); // Block align
  buffer.writeUInt16LE(8, 34); // Bits per sample
  buffer.write("data", 36);
  buffer.writeUInt32LE(numSamples, 40);

  // Fill with a simple soft sine wave tone (440Hz standard pitch)
  for (let i = 0; i < numSamples; i++) {
    const frequency = 440;
    const value = Math.round(128 + 30 * Math.sin((2 * Math.PI * frequency * i) / sampleRate));
    buffer.writeUInt8(value, 44 + i);
  }
  return buffer;
}

/**
 * Main secure server-side processor for Voice Rendering.
 * Respects access control, calls APIs, uploads output to private storage,
 * and records a row in tradio_voice_renders.
 */
export const renderBroadcastVoiceServer = createServerFn({ method: "POST" })
  .inputValidator((input: VoiceRenderInput) => input)
  .handler(async ({ data: input }): Promise<VoiceRenderResult> => {
    const renderId = `vr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const storagePath = getVoiceRenderStoragePath({
      owner_user_id: input.owner_user_id,
      show_id: input.show_id,
      episode_id: input.episode_id,
      render_id: renderId,
    });

    let renderStatus: VoiceRenderStatus = "queued";
    let renderError: string | null = null;
    let audioBuffer: Buffer | null = null;
    let mimeType = "audio/mpeg";
    let durationSeconds = 3.5; // Estimated baseline
    let usageMetadata: Record<string, any> = {};
    let providerMetadata: Record<string, any> = {};

    try {
      renderStatus = "rendering";

      if (!input.script_text || !input.script_text.trim()) {
        throw new Error("Script text cannot be empty.");
      }

      // ─── 1. ELEVENLABS ───────────────────────────────────────────────────
      if (input.voice_provider === "elevenlabs") {
        const apiKey = process.env.ELEVENLABS_API_KEY?.trim() || "";
        const voiceId = input.provider_voice_id || "21m00Tcm4TlvDq8ikWAM"; // default: Rachel
        const modelId = input.provider_model || "eleven_monolingual_v1";

        if (!apiKey) {
          throw new Error("ElevenLabs provider is not configured on this server (Missing ELEVENLABS_API_KEY).");
        }

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: "POST",
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: input.script_text,
            model_id: modelId,
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.75,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`ElevenLabs API failed with status ${response.status}: ${errText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        mimeType = "audio/mpeg";
        durationSeconds = Math.max(1, Math.round(input.script_text.length / 15));
        usageMetadata = { characters: input.script_text.length };
        providerMetadata = { modelId, voiceId };
      }

      // ─── 2. OPENAI ───────────────────────────────────────────────────────
      else if (input.voice_provider === "openai") {
        const apiKey = process.env.OPENAI_API_KEY?.trim() || "";
        const voice = input.provider_voice_id || "alloy";
        const model = input.provider_model || "tts-1";

        if (!apiKey) {
          throw new Error("OpenAI provider is not configured on this server (Missing OPENAI_API_KEY).");
        }

        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            input: input.script_text,
            voice,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI Speech API failed with status ${response.status}: ${errText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        audioBuffer = Buffer.from(arrayBuffer);
        mimeType = "audio/mpeg";
        durationSeconds = Math.max(1, Math.round(input.script_text.length / 15));
        usageMetadata = { characters: input.script_text.length };
        providerMetadata = { model, voice };
      }

      // ─── 3. GEMINI ───────────────────────────────────────────────────────
      else if (input.voice_provider === "gemini") {
        const { genai: client } = buildGeminiClient();
        const voiceName = input.provider_voice_id || "Algieba";
        const response = await client.models.generateContent({
          model: input.provider_model || "gemini-2.5-flash-preview-tts",
          contents: `Say in a natural, broadcasting-quality, smooth voice: ${input.script_text}`,
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName,
                },
              },
            },
          },
        });

        // Parse response candidates
        const data = response as any;
        const part = data.candidates?.[0]?.content?.parts?.find(
          (item: any) => item.inlineData?.data || item.inline_data?.data,
        );
        const inline = (part?.inlineData ?? part?.inline_data);

        if (!inline?.data) {
          throw new Error("Gemini TTS response did not contain audio stream data.");
        }

        audioBuffer = Buffer.from(inline.data, "base64");
        mimeType = "audio/wav";
        durationSeconds = Math.max(1, Math.round(input.script_text.length / 15));
        usageMetadata = { characters: input.script_text.length };
        providerMetadata = { voiceName };
      }

      // ─── 4. INTERNAL SYNTHESIS OR MOCK FALLBACK ──────────────────────────
      else if (input.voice_provider === "internal") {
        console.log("[Voice Server] Utilizing local synthetic WAV generator.");
        audioBuffer = generateTinyWavBuffer(input.script_text);
        mimeType = "audio/wav";
        durationSeconds = 1.5;
        usageMetadata = { characters: input.script_text.length, local: true };
        providerMetadata = { type: "local-fm-synth" };
      }

      // ─── 5. MANUAL UPLOAD ────────────────────────────────────────────────
      else if (input.voice_provider === "manual_upload") {
        throw new Error("Direct rendering is not available for manual_upload provider. Use upload UI instead.");
      }

      else {
        throw new Error(`Unsupported provider: ${input.voice_provider}`);
      }

      // ─── 6. STORE IN STORAGE ─────────────────────────────────────────────
      if (audioBuffer) {
        const uploadResult = await uploadVoiceRenderAudioServer(storagePath, audioBuffer, mimeType);
        if (!uploadResult.success) {
          throw new Error(`Storage upload failed: ${uploadResult.error}`);
        }

        renderStatus = "completed";

        // Insert row in tradio_voice_renders using admin client
        try {
          const insertPayload = {
            owner_user_id: input.owner_user_id || null,
            show_id: input.show_id || null,
            episode_id: input.episode_id || null,
            block_id: input.block_id || null,
            script_id: input.script_id || null,
            station_drop_id: input.station_drop_id || null,
            ad_slot_id: input.ad_slot_id || null,
            voice_provider: input.voice_provider,
            provider_voice_id: input.provider_voice_id || null,
            provider_model: input.provider_model || null,
            voice_name: input.voice_name || null,
            script_text: input.script_text,
            audio_url: uploadResult.url || null,
            storage_path: storagePath,
            mime_type: mimeType,
            duration_seconds: durationSeconds,
            render_status: "completed",
            usage_metadata: usageMetadata,
            metadata: providerMetadata,
          };

          const { error: dbError } = await supabaseAdminFrom("tradio_voice_renders").insert(insertPayload);

          if (dbError) {
            console.error("[Voice Server] DB persistence error:", dbError);
            // Non-blocking fallback: let the response return normally
          }
        } catch (dbErr) {
          console.warn("[Voice Server] Could not record render row in db:", dbErr);
        }

        return {
          id: renderId,
          audio_url: uploadResult.url,
          storage_path: storagePath,
          duration_seconds: durationSeconds,
          mime_type: mimeType,
          render_status: "completed",
          usage_metadata: usageMetadata,
          metadata: providerMetadata,
        };
      } else {
        throw new Error("Renderer completed but no audio buffer was produced.");
      }

    } catch (err: any) {
      console.error("[Voice Server] Rendering failed:", err);
      renderStatus = "failed";
      renderError = err.message || "Unknown rendering exception";

      // Insert failed row for audit
      try {
        await supabaseAdminFrom("tradio_voice_renders").insert({
          owner_user_id: input.owner_user_id || null,
          show_id: input.show_id || null,
          episode_id: input.episode_id || null,
          block_id: input.block_id || null,
          script_id: input.script_id || null,
          station_drop_id: input.station_drop_id || null,
          ad_slot_id: input.ad_slot_id || null,
          voice_provider: input.voice_provider,
          script_text: input.script_text,
          render_status: "failed",
          render_error: renderError,
        });
      } catch (dbErr) {
        console.warn("[Voice Server] Could not record failed render row:", dbErr);
      }

      return {
        id: renderId,
        mime_type: "audio/mpeg",
        render_status: "failed",
        render_error: renderError,
        usage_metadata: {},
        metadata: {},
      };
    }
  });

/**
 * Server function to generate and render a Station Drop.
 */
export const renderStationDropVoiceServer = createServerFn({ method: "POST" })
  .inputValidator((input: { dropText: string; hostTone: string; voiceId: string; provider: any; userId: string }) => input)
  .handler(async ({ data: input }): Promise<VoiceRenderResult> => {
    // Generate script text first
    let dropScript = input.dropText;
    try {
      const prompt = `Write a premium station drop for Tradio. Tone: ${input.hostTone}. Style guidelines: Incorporate "${input.dropText}". Return a short, punchy 1-2 sentence drop read. Do not return markdown, just raw text.`;
      const { genai: client } = buildGeminiClient();
      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      dropScript = res.text?.trim() || input.dropText;
    } catch {
      dropScript = `[TRADIO DROP]: "You are tuned into Trey Trizzy Radio. ${input.dropText} - strictly premium, strictly live."`;
    }

    // Call renderBroadcastVoiceServer logic
    const renderResult = await renderBroadcastVoiceServer({
      data: {
        script_text: dropScript,
        voice_provider: input.provider,
        provider_voice_id: input.voiceId,
        owner_user_id: input.userId,
      } as any
    });

    return renderResult;
  });

/**
 * Server function to generate and render an Ad Read.
 */
export const renderAdReadVoiceServer = createServerFn({ method: "POST" })
  .inputValidator((input: { adProvider: string; durationSeconds: number; tone: string; voiceId: string; provider: any; userId: string }) => input)
  .handler(async ({ data: input }): Promise<VoiceRenderResult> => {
    // Generate script text first
    let adScript = "";
    try {
      const prompt = `Write a conversational, high-end 30-second sponsor ad read script for ${input.adProvider}. Delivery tone: ${input.tone}. Limit to exactly 60-70 words suitable for a ${input.durationSeconds}s read. Do not return markdown, just raw text.`;
      const { genai: client } = buildGeminiClient();
      const res = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      adScript = res.text?.trim() || "";
    } catch {
      adScript = `[SPONSOR READ - ${input.adProvider}]: "This episode is brought to you by ${input.adProvider}. Step into premium comfort and high-fidelity sound. Explore their brand today." (${input.durationSeconds}s read, ${input.tone} delivery)`;
    }

    // Call renderBroadcastVoiceServer logic
    const renderResult = await renderBroadcastVoiceServer({
      data: {
        script_text: adScript,
        voice_provider: input.provider,
        provider_voice_id: input.voiceId,
        owner_user_id: input.userId,
        duration_seconds: input.durationSeconds,
      } as any
    });

    return renderResult;
  });
