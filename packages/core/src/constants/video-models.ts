// Video model constants and utilities

export interface VideoModel {
  name: string;
  label: string;
  type: string;
  source: string;
  params?: {
    price_per_second?: number;
    max_duration?: number;
    max_resolution?: { width: number; height: number };
    supported_frame_rates?: number[];
    workflow_path?: string;
    supported_aspect_ratios?: string[];
    supported_qualities?: string[];
  };
}

export interface EnhancedVideoModel extends VideoModel {
  id?: string;
  description?: string;
  maxDuration?: number;
  maxResolution?: { width: number; height: number };
  supportedFrameRates?: number[];
  pricePerSecond?: number;
  workflowPath?: string;
  supportedAspectRatios?: string[];
  supportedQualities?: string[];
  category: "text_to_video" | "image_to_video" | "video_to_video";
  uiLabel: string;
  uiDescription: string;
  recommendedSettings: any;
  bestFor: string[];
  priceTier: "budget" | "standard" | "premium" | "luxury";
  requiresSourceImage: boolean;
  requiresSourceVideo: boolean;
}

export interface VideoModelMetadata {
  category: "text_to_video" | "image_to_video" | "video_to_video";
  ui_label: string;
  ui_description: string;
  recommended_settings: any;
  best_for: string[];
}

export interface VideoModelsConfig {
  model_metadata: Record<string, VideoModelMetadata>;
}

// Default video models configuration
export const DEFAULT_VIDEO_MODELS: VideoModel[] = [
  {
    name: "comfyui/ltx",
    label: "LTX Video",
    type: "text_to_video",
    source: "superduperai",
    params: {
      price_per_second: 0.4,
      max_duration: 60,
      max_resolution: { width: 1920, height: 1080 },
      supported_frame_rates: [24, 30],
      workflow_path: "/workflows/ltx.json",
      supported_aspect_ratios: ["16:9", "1:1", "9:16"],
      supported_qualities: ["standard", "high"]
    }
  },
  {
    name: "comfyui/veo3",
    label: "VEO3 Video",
    type: "image_to_video",
    source: "superduperai",
    params: {
      price_per_second: 1.2,
      max_duration: 30,
      max_resolution: { width: 1920, height: 1080 },
      supported_frame_rates: [24, 30, 60],
      workflow_path: "/workflows/veo3.json",
      supported_aspect_ratios: ["16:9", "1:1", "9:16"],
      supported_qualities: ["standard", "high", "ultra"]
    }
  },
  {
    name: "comfyui/kling",
    label: "KLING Video",
    type: "image_to_video",
    source: "superduperai",
    params: {
      price_per_second: 0.8,
      max_duration: 45,
      max_resolution: { width: 1920, height: 1080 },
      supported_frame_rates: [24, 30],
      workflow_path: "/workflows/kling.json",
      supported_aspect_ratios: ["16:9", "1:1", "9:16"],
      supported_qualities: ["standard", "high"]
    }
  }
];

// Price tier thresholds
export const PRICE_TIER_THRESHOLDS = {
  BUDGET: 0.5,
  STANDARD: 1.5,
  PREMIUM: 2.5,
  LUXURY: Infinity
} as const;

// Video model categories
export const VIDEO_MODEL_CATEGORIES = {
  TEXT_TO_VIDEO: "text_to_video",
  IMAGE_TO_VIDEO: "image_to_video",
  VIDEO_TO_VIDEO: "video_to_video"
} as const;

// Price tiers
export const PRICE_TIERS = {
  BUDGET: "budget",
  STANDARD: "standard",
  PREMIUM: "premium",
  LUXURY: "luxury"
} as const;

/**
 * Determine price tier based on price per second
 */
export function getPriceTier(pricePerSecond: number): keyof typeof PRICE_TIERS {
  if (pricePerSecond <= PRICE_TIER_THRESHOLDS.BUDGET) return "BUDGET";
  if (pricePerSecond <= PRICE_TIER_THRESHOLDS.STANDARD) return "STANDARD";
  if (pricePerSecond <= PRICE_TIER_THRESHOLDS.PREMIUM) return "PREMIUM";
  return "LUXURY";
}

/**
 * Determine category from model name
 */
export function getModelCategory(modelName: string): keyof typeof VIDEO_MODEL_CATEGORIES {
  const name = modelName.toLowerCase();
  
  if (name.includes("image-to-video") || name.includes("veo") || name.includes("kling")) {
    return "IMAGE_TO_VIDEO";
  } else if (name.includes("lip-sync") || name.includes("video-to-video")) {
    return "VIDEO_TO_VIDEO";
  }
  
  return "TEXT_TO_VIDEO";
}

/**
 * Get default video model by category
 */
export function getDefaultVideoModelByCategory(category: keyof typeof VIDEO_MODEL_CATEGORIES): VideoModel | undefined {
  return DEFAULT_VIDEO_MODELS.find(model => 
    getModelCategory(model.name) === category
  );
}

/**
 * Get video models by price tier
 */
export function getVideoModelsByPriceTier(models: VideoModel[], tier: keyof typeof PRICE_TIERS): VideoModel[] {
  return models.filter(model => {
    const price = model.params?.price_per_second || 0;
    return getPriceTier(price) === tier;
  });
}

/**
 * Get video models by category
 */
export function getVideoModelsByCategory(models: VideoModel[], category: keyof typeof VIDEO_MODEL_CATEGORIES): VideoModel[] {
  return models.filter(model => getModelCategory(model.name) === category);
}
