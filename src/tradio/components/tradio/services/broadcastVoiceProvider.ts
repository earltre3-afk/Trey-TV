import { VoiceProfile, VoiceRenderInput, VoiceRenderResult } from "../types/broadcastVoiceTypes";

export const VOICE_STYLE_MODES = [
  { id: "late-night-smooth", name: "Late-night smooth", description: "Deep, quiet, velvety nighttime FM delivery" },
  { id: "street-polished", name: "Street polished", description: "Slick, urban tastemaker pacing" },
  { id: "luxury-station", name: "Luxury station", description: "High-end, elegant, sophisticated broadcast voice" },
  { id: "dj-hype", name: "DJ hype", description: "High-octane, energetic club and mixtape style" },
  { id: "professional-broadcast", name: "Professional broadcast", description: "Clear, authoritative, newsroom articulation" },
  { id: "intimate-podcast", name: "Intimate podcast", description: "Conversational, dry, close-mic authenticity" },
];

export const AVAILABLE_VOICES: VoiceProfile[] = [
  // OpenAI Voices
  { id: "alloy", name: "Alloy (OpenAI)", provider: "openai", gender: "neutral", description: "Balanced, versatile voice" },
  { id: "echo", name: "Echo (OpenAI)", provider: "openai", gender: "male", description: "Warm, athletic voice" },
  { id: "fable", name: "Fable (OpenAI)", provider: "openai", gender: "neutral", description: "Narrative, dramatic voice" },
  { id: "onyx", name: "Onyx (OpenAI)", provider: "openai", gender: "male", description: "Deep, authoritative voice" },
  { id: "nova", name: "Nova (OpenAI)", provider: "openai", gender: "female", description: "Energetic, bright voice" },
  { id: "shimmer", name: "Shimmer (OpenAI)", provider: "openai", gender: "female", description: "Professional, clear voice" },

  // ElevenLabs Voices
  { id: "rachel", name: "Rachel (ElevenLabs)", provider: "elevenlabs", gender: "female", description: "Conversational, standard reading voice" },
  { id: "drew", name: "Drew (ElevenLabs)", provider: "elevenlabs", gender: "male", description: "News reader, narrative style" },
  { id: "clyde", name: "Clyde (ElevenLabs)", provider: "elevenlabs", gender: "male", description: "Video game narration, gravelly" },
  { id: "paul", name: "Paul (ElevenLabs)", provider: "elevenlabs", gender: "male", description: "Deep cinematic trailer voice" },

  // Gemini Voices
  { id: "puck", name: "Puck (Gemini)", provider: "gemini", gender: "male", description: "Gemini smooth male TTS" },
  { id: "charon", name: "Charon (Gemini)", provider: "gemini", gender: "male", description: "Gemini warm conversational male" },
  { id: "kore", name: "Kore (Gemini)", provider: "gemini", gender: "female", description: "Gemini professional female" },
  { id: "fenrir", name: "Fenrir (Gemini)", provider: "gemini", gender: "male", description: "Gemini deep narrative male" },
  { id: "aoede", name: "Aoede (Gemini)", provider: "gemini", gender: "female", description: "Gemini high-fidelity soft female" },

  // Internal and Fallbacks
  { id: "internal-synthesizer", name: "Web Speech Synth (Browser)", provider: "internal", gender: "neutral", description: "Local browser voice synthesizer fallback" },
  { id: "manual-drop", name: "Manual Audio Upload", provider: "manual_upload", gender: "neutral", description: "Upload a pre-recorded WAV or MP3 audio file" },
];

export function listAvailableVoices(provider?: string): VoiceProfile[] {
  if (provider) {
    return AVAILABLE_VOICES.filter((v) => v.provider === provider);
  }
  return AVAILABLE_VOICES;
}

export function estimateVoiceRenderCost(text: string, provider: string): number {
  const charCount = text.length;
  // Fictional cost estimation credits
  switch (provider) {
    case "elevenlabs":
      return Math.round(charCount * 0.1 * 100) / 100; // 0.1 credits per char
    case "openai":
      return Math.round(charCount * 0.05 * 100) / 100; // 0.05 credits per char
    case "gemini":
      return Math.round(charCount * 0.02 * 100) / 100; // 0.02 credits per char
    case "internal":
    case "manual_upload":
      return 0.00;
    default:
      return 0.00;
  }
}

export function validateVoiceRenderInput(input: VoiceRenderInput): { valid: boolean; error?: string } {
  if (!input.script_text || !input.script_text.trim()) {
    return { valid: false, error: "Script text cannot be empty." };
  }
  if (input.script_text.length > 5000) {
    return { valid: false, error: "Script is too long (maximum 5,000 characters per render clip)." };
  }
  if (!input.voice_provider) {
    return { valid: false, error: "A voice provider must be selected." };
  }
  const validProviders = ["elevenlabs", "openai", "gemini", "internal", "manual_upload"];
  if (!validProviders.includes(input.voice_provider)) {
    return { valid: false, error: `Unsupported voice provider: ${input.voice_provider}` };
  }
  return { valid: true };
}
