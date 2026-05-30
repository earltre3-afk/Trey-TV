import { c as createServerRpc, a as createServerFn } from "./index.mjs";
import { G as GoogleGenAI, M as Modality } from "../_libs/google__genai.mjs";
import "../_libs/react.mjs";
import "node:crypto";
import "node:async_hooks";
import "node:stream";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/supabase__supabase-js.mjs";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/livekit__protocol.mjs";
import "../_libs/bufbuild__protobuf.mjs";
import "../_libs/livekit-server-sdk.mjs";
import "../_libs/jose.mjs";
import "node:buffer";
import "node:util";
import "node:fs";
import "node:path";
import "../_libs/p-retry.mjs";
import "../_libs/retry.mjs";
import "../_libs/google-auth-library.mjs";
import "child_process";
import "querystring";
import "fs";
import "../_libs/gaxios.mjs";
import "https";
import "../_libs/extend.mjs";
import "../_libs/gcp-metadata.mjs";
import "os";
import "../_libs/json-bigint.mjs";
import "../_libs/bignumber.js.mjs";
import "../_libs/google-logging-utils.mjs";
import "events";
import "process";
import "path";
import "../_libs/base64-js.mjs";
import "../_libs/ecdsa-sig-formatter.mjs";
import "../_libs/safe-buffer.mjs";
import "buffer";
import "../_libs/jws.mjs";
import "../_libs/jwa.mjs";
import "../_libs/buffer-equal-constant-time.mjs";
import "fs/promises";
import "node:stream/promises";
import "../_libs/ws.mjs";
import "zlib";
import "http";
import "net";
import "tls";
import "url";
const DEFAULT_TTS_MODEL = "gemini-2.5-flash-preview-tts";
const DEFAULT_TTS_VOICE = "Algieba";
const validateTtsInput = (input) => ({
  text: typeof input?.text === "string" ? input.text : ""
});
function getApiKey() {
  return process.env.GOOGLE_GENAI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim() || "";
}
function cleanForTts(text) {
  return text.replace(/\s+/g, " ").replace(/Next steps:[\s\S]*$/i, "").replace(/If it still fails[\s\S]*$/i, "").trim().slice(0, 700);
}
function extractAudioBuffer(response) {
  const data = response;
  const part = data.candidates?.[0]?.content?.parts?.find((item) => item.inlineData?.data || item.inline_data?.data);
  const inline = part?.inlineData ?? part?.inline_data;
  if (!inline?.data) return null;
  return {
    bytes: Buffer.from(inline.data, "base64"),
    mimeType: inline.mimeType ?? inline.mime_type ?? "audio/l16"
  };
}
function wavFromPcm(pcm, sampleRate = 24e3, channels = 1, bitsPerSample = 16) {
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
const treyITts_createServerFn_handler = createServerRpc({
  id: "a521bd0c0f9b13430bd87e32d02f2b3fa1fca84e9b3342ce415da37ebfecf808",
  name: "treyITts",
  filename: "src/lib/trey-i/tts.server.ts"
}, (opts) => treyITts.__executeServer(opts));
const treyITts = createServerFn({
  method: "POST"
}).inputValidator(validateTtsInput).handler(treyITts_createServerFn_handler, async ({
  data
}) => {
  try {
    const text = cleanForTts(data.text);
    if (!text) return {
      audioBase64: null
    };
    const apiKey = getApiKey();
    if (!apiKey) return {
      audioBase64: null
    };
    const client = new GoogleGenAI({
      apiKey
    });
    const response = await client.models.generateContent({
      model: process.env.GEMINI_TREYI_TTS_MODEL || DEFAULT_TTS_MODEL,
      contents: `Say in a warm, smooth, confident, premium, emotionally intelligent, and conversational voice: ${text}`,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: process.env.GEMINI_TREYI_VOICE_NAME || DEFAULT_TTS_VOICE
            }
          }
        }
      }
    });
    const audio = extractAudioBuffer(response);
    if (!audio) return {
      audioBase64: null
    };
    const wav = audio.mimeType.includes("wav") || audio.bytes.subarray(0, 4).toString("ascii") === "RIFF" ? audio.bytes : wavFromPcm(audio.bytes);
    return {
      audioBase64: wav.toString("base64"),
      mimeType: "audio/wav"
    };
  } catch {
    return {
      audioBase64: null
    };
  }
});
export {
  treyITts_createServerFn_handler
};
