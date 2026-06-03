import { createServerFn } from "@tanstack/react-start";
import { GoogleGenAI, Modality } from "@google/genai";

type TtsInput = {
  text: string;
};

type TtsResult = { audioBase64: string; mimeType: "audio/wav" } | { audioBase64: null };

const DEFAULT_TTS_MODEL = "gemini-2.5-flash-preview-tts";
const DEFAULT_TTS_VOICE = "Algieba";

const validateTtsInput = (input: TtsInput): TtsInput => ({
  text: typeof input?.text === "string" ? input.text : "",
});

function getApiKey(): string {
  return (
    process.env.GOOGLE_GENAI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    ""
  );
}

function cleanForTts(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/Next steps:[\s\S]*$/i, "")
    .replace(/If it still fails[\s\S]*$/i, "")
    .trim()
    .slice(0, 700);
}

function extractAudioBuffer(response: unknown): { bytes: Buffer; mimeType: string } | null {
  const data = response as {
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string; mimeType?: string };
          inline_data?: { data?: string; mime_type?: string };
        }>;
      };
    }>;
  };

  const part = data.candidates?.[0]?.content?.parts?.find(
    (item) => item.inlineData?.data || item.inline_data?.data,
  );
  const inline = (part?.inlineData ?? part?.inline_data) as
    | { data?: string; mimeType?: string; mime_type?: string }
    | undefined;

  if (!inline?.data) return null;

  return {
    bytes: Buffer.from(inline.data, "base64"),
    mimeType: inline.mimeType ?? inline.mime_type ?? "audio/l16",
  };
}

function wavFromPcm(pcm: Buffer, sampleRate = 24_000, channels = 1, bitsPerSample = 16): Buffer {
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

export const treyITts = createServerFn({ method: "POST" })
  .inputValidator(validateTtsInput)
  .handler(async ({ data }): Promise<TtsResult> => {
    try {
      const text = cleanForTts(data.text);
      if (!text) return { audioBase64: null };

      const apiKey = getApiKey();
      if (!apiKey) return { audioBase64: null };

      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
        model: process.env.GEMINI_TREYI_TTS_MODEL || DEFAULT_TTS_MODEL,
        contents: `Say in a warm, smooth, confident, premium, emotionally intelligent, and conversational voice: ${text}`,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: process.env.GEMINI_TREYI_VOICE_NAME || DEFAULT_TTS_VOICE,
              },
            },
          },
        },
      });

      const audio = extractAudioBuffer(response);
      if (!audio) return { audioBase64: null };

      const wav =
        audio.mimeType.includes("wav") || audio.bytes.subarray(0, 4).toString("ascii") === "RIFF"
          ? audio.bytes
          : wavFromPcm(audio.bytes);

      return {
        audioBase64: wav.toString("base64"),
        mimeType: "audio/wav",
      };
    } catch {
      return { audioBase64: null };
    }
  });
