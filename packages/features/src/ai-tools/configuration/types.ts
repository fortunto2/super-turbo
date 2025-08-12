// AI Tools Configuration types

export interface MediaOption {
  id: string;
  name: string;
  label: string;
  description?: string;
  category?: string;
  tags?: string[];
}

export interface AIGenerationConfig {
  availableModels: MediaOption[];
  availableResolutions: MediaOption[];
  availableStyles: MediaOption[];
  availableShotSizes: MediaOption[];
  defaultSettings: {
    model: string;
    resolution: string;
    style: string;
    shotSize: string;
  };
}

export interface AIImageGenerationConfig extends AIGenerationConfig {
  supportedFormats: string[];
  maxBatchSize: number;
  qualityOptions: MediaOption[];
}

export interface AIVideoGenerationConfig extends AIGenerationConfig {
  supportedDurations: number[];
  supportedFps: number[];
  maxDuration: number;
  qualityPresets: MediaOption[];
}

export interface AIScriptGenerationConfig {
  availableTemplates: MediaOption[];
  availableGenres: MediaOption[];
  availableFormats: MediaOption[];
  maxLength: number;
  defaultSettings: {
    template: string;
    genre: string;
    format: string;
  };
}

export interface ConfigurationResult {
  config: AIGenerationConfig | AIImageGenerationConfig | AIVideoGenerationConfig | AIScriptGenerationConfig;
  message: string;
  suggestions?: string[];
  nextSteps?: string[];
}
