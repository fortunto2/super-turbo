// Video generation constants

export interface MediaResolution {
  width: number;
  height: number;
  label: string;
  aspectRatio: string;
  qualityType: string;
}

export interface MediaOption {
  id: string;
  label: string;
  description: string;
}

/**
 * Shared video generation constants
 * Centralized constants to eliminate duplication across video components
 */

export const VIDEO_RESOLUTIONS: MediaResolution[] = [
  // SORA-COMPATIBLE RESOLUTIONS (16:9, 1:1, 9:16 only)
  {
    width: 1344,
    height: 768,
    label: "1344x768",
    aspectRatio: "16:9",
    qualityType: "hd",
  },
  {
    width: 1024,
    height: 1024,
    label: "1024x1024",
    aspectRatio: "1:1",
    qualityType: "hd",
  },
  {
    width: 768,
    height: 1344,
    label: "768x1344",
    aspectRatio: "9:16",
    qualityType: "hd",
  },
  // Premium Sora-compatible options
  {
    width: 1920,
    height: 1080,
    label: "1920×1080",
    aspectRatio: "16:9",
    qualityType: "full_hd",
  },
  {
    width: 1408,
    height: 1408,
    label: "1408×1408",
    aspectRatio: "1:1",
    qualityType: "full_hd",
  },
  {
    width: 1080,
    height: 1920,
    label: "1080×1920",
    aspectRatio: "9:16",
    qualityType: "full_hd",
  },
  // NON-SORA COMPATIBLE (4:3, 4:5) - for other models only
  {
    width: 1152,
    height: 896,
    label: "1152x896 (Non-Sora)",
    aspectRatio: "4:3",
    qualityType: "hd",
  },
  {
    width: 1024,
    height: 1280,
    label: "1024x1280 (Non-Sora)",
    aspectRatio: "4:5",
    qualityType: "hd",
  },
  {
    width: 1664,
    height: 1216,
    label: "1664x1216 (Non-Sora)",
    aspectRatio: "4:3",
    qualityType: "full_hd",
  },
  {
    width: 1408,
    height: 1760,
    label: "1408×1760 (Non-Sora)",
    aspectRatio: "4:5",
    qualityType: "full_hd",
  },
];

export const SHOT_SIZES: MediaOption[] = [
  {
    id: "extreme_long_shot",
    label: "Extreme Long Shot",
    description: "Shows vast landscapes or cityscapes with tiny subjects",
  },
  {
    id: "long_shot",
    label: "Long Shot",
    description: "Shows full body of subject with surrounding environment",
  },
  {
    id: "medium_shot",
    label: "Medium Shot",
    description: "Shows subject from waist up, good for conversations",
  },
  {
    id: "close_up",
    label: "Close Up",
    description: "Shows subject's face or specific detail",
  },
  {
    id: "extreme_close_up",
    label: "Extreme Close Up",
    description: "Shows very specific detail or emotion",
  },
  {
    id: "two_shot",
    label: "Two Shot",
    description: "Shows two subjects in frame",
  },
  {
    id: "over_the_shoulder",
    label: "Over the Shoulder",
    description: "Shows one subject from behind another's shoulder",
  },
  {
    id: "point_of_view",
    label: "Point of View",
    description: "Shows scene from character's perspective",
  },
];

export const VIDEO_STYLES: MediaOption[] = [
  {
    id: "realistic",
    label: "Realistic",
    description: "Photorealistic, natural appearance",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Movie-like quality with dramatic lighting",
  },
  {
    id: "anime",
    label: "Anime",
    description: "Japanese animation style",
  },
  {
    id: "cartoon",
    label: "Cartoon",
    description: "Simple, colorful cartoon style",
  },
  {
    id: "sketch",
    label: "Sketch",
    description: "Hand-drawn sketch appearance",
  },
  {
    id: "painting",
    label: "Painting",
    description: "Artistic painting style",
  },
  {
    id: "steampunk",
    label: "Steampunk",
    description: "Victorian sci-fi aesthetic",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    description: "Magical, otherworldly appearance",
  },
  {
    id: "sci_fi",
    label: "Sci-Fi",
    description: "Futuristic, technological aesthetic",
  },
  {
    id: "horror",
    label: "Horror",
    description: "Dark, frightening atmosphere",
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Simple, clean design",
  },
  {
    id: "abstract",
    label: "Abstract",
    description: "Non-representational, artistic",
  },
];

export const VIDEO_DURATIONS = [5, 10, 15, 20, 30, 45, 60] as const;
export const VIDEO_FPS = [24, 30, 60] as const;

export const DEFAULT_VIDEO_CONFIG = {
  resolution: VIDEO_RESOLUTIONS[0], // 1344x768
  shotSize: SHOT_SIZES[2], // medium_shot
  style: VIDEO_STYLES[0], // realistic
  duration: VIDEO_DURATIONS[0], // 5 seconds
  fps: VIDEO_FPS[0], // 24 fps
} as const;
