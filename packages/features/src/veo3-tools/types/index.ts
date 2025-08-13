export interface Character {
  id: string;
  name: string;
  description: string;
  speech: string;
}

export interface PromptData {
  scene: string;
  style: string;
  camera: string;
  characters: Character[];
  action: string;
  lighting: string;
  mood: string;
  language: string;
}

export interface EnhancementInfo {
  model: string;
  modelName: string;
  length: string;
  actualCharacters: number;
  targetCharacters: number;
}

export interface MoodboardImage {
  id: string;
  file?: File;
  url?: string;
  base64?: string;
  tags: string[];
  description: string;
  weight: number;
}

export interface PresetOptions {
  styles: string[];
  cameras: string[];
  lighting: string[];
  moods: string[];
  languages: string[];
}

export interface HistoryItem {
  id: string;
  timestamp: Date;
  basicPrompt: string;
  enhancedPrompt: string;
  length: string;
  model: string;
  promptData: PromptData;
}

// Export types as values for JavaScript compatibility
export const PromptDataType = {} as PromptData;
export const MoodboardImageType = {} as MoodboardImage;
export const CharacterType = {} as Character;
export const EnhancementInfoType = {} as EnhancementInfo;
export const PresetOptionsType = {} as PresetOptions;
export const HistoryItemType = {} as HistoryItem;
