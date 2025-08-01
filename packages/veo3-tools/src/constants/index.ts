import { PresetOptions } from "../types";

export const PRESET_OPTIONS: PresetOptions = {
  styles: ["Cinematic", "Documentary", "Anime", "Realistic", "Artistic", "Vintage", "Modern"],
  cameras: ["Close-up", "Wide shot", "Over-the-shoulder", "Drone view", "Handheld", "Static"],
  lighting: ["Natural", "Golden hour", "Blue hour", "Dramatic", "Soft", "Neon", "Candlelight"],
  moods: ["Peaceful", "Energetic", "Mysterious", "Romantic", "Tense", "Joyful", "Melancholic"],
  languages: ["English", "Spanish", "French", "German", "Italian", "Russian", "Japanese", "Chinese"]
};

export const STORAGE_KEYS = {
  PROMPT_HISTORY: 'veo3-prompt-history',
  CUSTOM_CHARACTER_LIMIT: 'veo3-custom-character-limit',
  INCLUDE_AUDIO: 'veo3-include-audio',
  MOODBOARD_ENABLED: 'veo3-moodboard-enabled'
} as const;

export const DEFAULT_VALUES = {
  CHARACTER_LIMIT: 4000,
  LANGUAGE: 'English',
  INCLUDE_AUDIO: true,
  MOODBOARD_ENABLED: true,
  HISTORY_LIMIT: 10
} as const; 