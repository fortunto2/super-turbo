// Media settings factory constants and types

export interface MediaSettingsOption {
  id: string;
  label: string;
  description: string;
  value: string;
  category?: string;
  tags?: string[];
}

export interface ImageGenerationConfig {
  availableModels: MediaSettingsOption[];
  availableResolutions: MediaSettingsOption[];
  availableStyles: MediaSettingsOption[];
  availableShotSizes: MediaSettingsOption[];
  supportedFormats: string[];
  maxBatchSize: number;
  qualityOptions: MediaSettingsOption[];
  defaultSettings: {
    model: string;
    resolution: string;
    style: string;
    shotSize: string;
  };
}

export interface VideoGenerationConfig {
  availableModels: MediaSettingsOption[];
  availableResolutions: MediaSettingsOption[];
  availableStyles: MediaSettingsOption[];
  availableShotSizes: MediaSettingsOption[];
  supportedDurations: number[];
  supportedFps: number[];
  maxDuration: number;
  qualityPresets: MediaSettingsOption[];
  defaultSettings: {
    model: string;
    resolution: string;
    style: string;
    shotSize: string;
    duration: number;
    fps: number;
  };
}

export interface IGenerationConfigRead {
  name: string;
  type: string;
  source: string;
  params?: {
    workflow_path?: string;
    price?: number;
    max_duration?: number;
    max_resolution?: { width: number; height: number };
    supported_frame_rates?: number[];
    supported_aspect_ratios?: string[];
    supported_qualities?: string[];
  };
}

// Shot size enum
export enum ShotSizeEnum {
  EXTREME_LONG_SHOT = "extreme_long_shot",
  LONG_SHOT = "long_shot",
  MEDIUM_SHOT = "medium_shot",
  CLOSE_UP = "close_up",
  EXTREME_CLOSE_UP = "extreme_close_up",
  TWO_SHOT = "two_shot",
  OVER_THE_SHOULDER = "over_the_shoulder",
  POINT_OF_VIEW = "point_of_view"
}

// Default image generation configuration
export const DEFAULT_IMAGE_CONFIG: ImageGenerationConfig = {
  availableModels: [
    { id: "comfyui/flux", label: "FLUX Pro", description: "High-quality image generation", value: "comfyui/flux", category: "pro" },
    { id: "comfyui/flux-dev", label: "FLUX Dev", description: "Development version", value: "comfyui/flux-dev", category: "dev" },
    { id: "comfyui/sdxl", label: "SDXL", description: "Stable Diffusion XL", value: "comfyui/sdxl", category: "standard" }
  ],
  availableResolutions: [
    { id: "1024x1024", label: "1024x1024", description: "Square HD", value: "1024x1024" },
    { id: "1920x1080", label: "1920x1080", description: "Full HD", value: "1920x1080" },
    { id: "1080x1920", label: "1080x1920", description: "Portrait HD", value: "1080x1920" }
  ],
  availableStyles: [
    { id: "realistic", label: "Realistic", description: "Photorealistic style", value: "realistic" },
    { id: "cinematic", label: "Cinematic", description: "Movie-like style", value: "cinematic" },
    { id: "anime", label: "Anime", description: "Japanese animation style", value: "anime" }
  ],
  availableShotSizes: [
    { id: "close-up", label: "Close-up", description: "Tight framing", value: "close-up" },
    { id: "medium-shot", label: "Medium Shot", description: "Balanced framing", value: "medium-shot" },
    { id: "long-shot", label: "Long Shot", description: "Wide framing", value: "long-shot" }
  ],
  supportedFormats: ["PNG", "JPEG", "WEBP"],
  maxBatchSize: 3,
  qualityOptions: [
    { id: "standard", label: "Standard", description: "Good quality, fast generation", value: "standard" },
    { id: "high", label: "High", description: "Better quality, slower generation", value: "high" }
  ],
  defaultSettings: {
    model: "comfyui/flux",
    resolution: "1024x1024",
    style: "realistic",
    shotSize: "medium-shot"
  }
};

// Default video generation configuration
export const DEFAULT_VIDEO_GENERATION_CONFIG: VideoGenerationConfig = {
  availableModels: [
    { id: "comfyui/ltx", label: "LTX Video", description: "Text to video generation", value: "comfyui/ltx", category: "text_to_video" },
    { id: "comfyui/veo3", label: "VEO3 Video", description: "Image to video generation", value: "comfyui/veo3", category: "image_to_video" },
    { id: "comfyui/kling", label: "KLING Video", description: "Advanced video generation", value: "comfyui/kling", category: "image_to_video" }
  ],
  availableResolutions: [
    { id: "1344x768", label: "1344x768", description: "HD Widescreen", value: "1344x768" },
    { id: "1024x1024", label: "1024x1024", description: "Square HD", value: "1024x1024" },
    { id: "768x1344", label: "768x1344", description: "Portrait HD", value: "768x1344" }
  ],
  availableStyles: [
    { id: "realistic", label: "Realistic", description: "Photorealistic style", value: "realistic" },
    { id: "cinematic", label: "Cinematic", description: "Movie-like style", value: "cinematic" },
    { id: "anime", label: "Anime", description: "Japanese animation style", value: "anime" }
  ],
  availableShotSizes: [
    { id: "close-up", label: "Close-up", description: "Tight framing", value: "close-up" },
    { id: "medium-shot", label: "Medium Shot", description: "Balanced framing", value: "medium-shot" },
    { id: "long-shot", label: "Long Shot", description: "Wide framing", value: "long-shot" }
  ],
  supportedDurations: [5, 10, 15, 20, 30, 45, 60],
  supportedFps: [24, 30, 60],
  maxDuration: 60,
  qualityPresets: [
    { id: "standard", label: "Standard", description: "Good quality, fast generation", value: "standard" },
    { id: "high", label: "High", description: "Better quality, slower generation", value: "high" }
  ],
  defaultSettings: {
    model: "comfyui/ltx",
    resolution: "1344x768",
    style: "realistic",
    shotSize: "medium-shot",
    duration: 5,
    fps: 24
  }
};

// Cache configuration
export const CACHE_CONFIG = {
  DURATION: 60 * 60 * 1000, // 1 hour
  IMAGE_CONFIG_KEY: "image_config_cache",
  VIDEO_CONFIG_KEY: "video_config_cache"
} as const;

// Priority fallback models
export const PRIORITY_MODELS = {
  IMAGE: ["comfyui/flux", "comfyui/sdxl", "flux-dev", "sdxl"],
  VIDEO: ["comfyui/ltx", "comfyui/veo3", "comfyui/kling"]
} as const;

/**
 * Adapter function to convert OpenAPI model to MediaSettings format
 */
export function adaptModelForMediaSettings(
  model: IGenerationConfigRead
): IGenerationConfigRead & {
  id: string;
  label: string;
  description: string;
  value: string;
  workflowPath: string;
  price: number;
} {
  return {
    ...model,
    id: model.name, // Use name as id for compatibility
    label: model.name, // Use name as label for display
    description: `${model.type} - ${model.source}`,
    value: model.name,
    workflowPath: model.params?.workflow_path || "",
    price: model.params?.price || 0,
  };
}

/**
 * Get default model by priority
 */
export function getDefaultModelByPriority(
  models: IGenerationConfigRead[],
  priorityList: string[]
): IGenerationConfigRead | undefined {
  for (const modelName of priorityList) {
    const model = models.find((m) => m.name === modelName);
    if (model) return model;
  }
  return undefined;
}

/**
 * Validate media settings configuration
 */
export function validateMediaSettingsConfig(config: ImageGenerationConfig | VideoGenerationConfig): boolean {
  return !!(
    config.availableModels?.length > 0 &&
    config.availableResolutions?.length > 0 &&
    config.availableStyles?.length > 0 &&
    config.availableShotSizes?.length > 0
  );
}
