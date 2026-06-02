export type StoryVoiceProvider = 'system' | 'elevenlabs' | 'openai' | 'uploaded' | 'none';

export interface StoryVoiceConfig {
  voiceProvider: StoryVoiceProvider;
  voiceId: string | null;
  voiceName: string | null;
  audioStyle: string | null;
  settings: Record<string, any> | null;
}

export interface StoryCharacterVoices {
  narrator?: StoryVoiceConfig;
  characters?: Record<string, StoryVoiceConfig>;
}

export interface StoryVoiceCharacter {
  character_id: string;
  display_name: string;
  portrait?: string;
  voice?: StoryVoiceConfig;
  voice_key?: string;
}

export interface StoryBeatVoiceLine {
  id?: string;
  type?: 'narration' | 'dialogue';
  character_id?: string;
  characterId?: string;
  speakerId?: string;
  speakerName?: string;
  text: string;
  voice?: StoryVoiceConfig;
  voice_key?: string;
  voiceKey?: string;
  emotion?: string;
  lineIndex?: number;
}
