// src/constants/app.ts
var APP_CONFIG = {
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  // 100MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,
  // 10MB
  MAX_VIDEO_SIZE: 500 * 1024 * 1024,
  // 500MB
  SUPPORTED_IMAGE_FORMATS: ["png", "jpg", "jpeg", "webp"],
  SUPPORTED_VIDEO_FORMATS: ["mp4", "mov", "avi"]
};
var UI_CONFIG = {
  ANIMATION_DURATION: 300,
  // ms
  DEBOUNCE_DELAY: 300,
  // ms
  TOAST_DURATION: 5e3,
  // ms
  PAGINATION_DEFAULT_SIZE: 20
};
var FEATURE_FLAGS = {
  ENABLE_VIDEO_GENERATION: true,
  ENABLE_IMAGE_EDITING: true,
  ENABLE_AI_CHAT: true,
  ENABLE_PAYMENTS: true
};

// src/constants/api.ts
var API_CONFIG = {
  TIMEOUT: 3e4,
  // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1e3
  // 1 second
};
var HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  GATEWAY_TIMEOUT: 504
};
var API_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  USER_AGENT: "User-Agent"
};
var API_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH"
};

// src/constants/common.ts
var APP_NAME = "SuperDuperAI";
var APP_VERSION = "3.0.0";
var ENV = {
  DEVELOPMENT: "development",
  PRODUCTION: "production",
  TEST: "test"
};
var API_ENDPOINTS = {
  // Internal API endpoints
  AUTH: "/api/auth",
  UPLOAD: "/api/files/upload",
  GENERATE: "/api/generate",
  BALANCE: "/api/user/balance",
  // External API base URLs
  SUPERDUPERAI_BASE_URL: process.env.SUPERDUPERAI_API_URL || "https://api.superduperai.co",
  STRIPE_BASE_URL: process.env.STRIPE_API_URL || "https://api.stripe.com",
  UPLOAD_BASE_URL: process.env.UPLOAD_API_URL || "/api/files",
  WEBSOCKET_BASE_URL: process.env.WEBSOCKET_API_URL || "wss://ws.superduperai.co"
};
var FILE_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
  AUDIO: "audio",
  DOCUMENT: "document"
};
var CONTENT_TYPES = {
  IMAGE_PNG: "image/png",
  IMAGE_JPEG: "image/jpeg",
  IMAGE_WEBP: "image/webp",
  VIDEO_MP4: "video/mp4"
};
var STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  PENDING: "pending",
  FAILED: "failed"
};

// src/constants/config.ts
var API_NEXT_ROUTES = {
  GENERATE_IMAGE: "/api/generate/image",
  GENERATE_VIDEO: "/api/generate/video",
  FILE: (id) => `/api/file/${id}`,
  FILE_UPLOAD: "/api/file/upload",
  PROJECT: (id) => `/api/project/${id}`,
  PROJECT_VIDEO: "/api/project/video",
  ENHANCE_PROMPT: "/api/enhance-prompt",
  MODELS: "/api/config/models",
  SUPERDUPERAI: "/api/config/superduperai",
  EVENTS_FILE: (fileId) => `/api/events/file.${fileId}`,
  GENERATE_SCRIPT: "/api/generate/script"
};
var TOOLS_CONFIG = [
  {
    id: "image-generator",
    name: "Image Generator",
    description: "Generate high-quality images using AI models like FLUX Pro, FLUX Dev, and more from SuperDuperAI",
    shortDescription: "AI Image Generator",
    iconName: "image",
    href: "/tools/image-generator",
    category: "generation",
    features: [
      { iconName: "sparkles", label: "Professional Quality" },
      { iconName: "zap", label: "Real-time Progress" }
    ],
    primaryColor: "blue-600",
    hoverColor: "blue-600",
    bgColor: "blue-100",
    hoverBgColor: "blue-200"
  },
  {
    id: "video-generator",
    name: "Video Generator",
    description: "Generate high-quality videos using AI models like VEO3, KLING, LTX, and more from SuperDuperAI",
    shortDescription: "AI Video Generator",
    iconName: "video",
    href: "/tools/video-generator",
    category: "generation",
    features: [
      { iconName: "play", label: "Professional Quality" },
      { iconName: "zap", label: "Real-time Progress" }
    ],
    primaryColor: "purple-600",
    hoverColor: "purple-600",
    bgColor: "purple-100",
    hoverBgColor: "purple-200"
  },
  {
    id: "prompt-enhancer",
    name: "Prompt Enhancer",
    description: "Transform simple prompts into detailed, professional descriptions for better AI generation results",
    shortDescription: "AI Prompt Enhancer",
    iconName: "wand",
    href: "/tools/prompt-enhancer",
    category: "enhancement",
    features: [
      { iconName: "languages", label: "Auto Translation" },
      { iconName: "sparkles", label: "Smart Enhancement" }
    ],
    primaryColor: "pink-600",
    hoverColor: "pink-600",
    bgColor: "pink-100",
    hoverBgColor: "pink-200"
  },
  {
    id: "prompt-enhancer-veo3",
    name: "Prompt Enhancer Veo3",
    description: "Transform simple prompts into detailed, professional descriptions for better AI generation results",
    shortDescription: "AI Prompt Enhancer VEO3",
    iconName: "wand",
    href: "/tools/prompt-enhancer-veo3",
    category: "enhancement",
    features: [
      { iconName: "languages", label: "Auto Translation" },
      { iconName: "sparkles", label: "Smart Enhancement" }
    ],
    primaryColor: "pink-600",
    hoverColor: "pink-600",
    bgColor: "pink-100",
    hoverBgColor: "pink-200"
  },
  {
    id: "script-generator",
    name: "Script Generator",
    description: "Generate detailed scripts and scenarios in Markdown format using AI. Edit and refine your script with a powerful Markdown editor.",
    shortDescription: "AI Script Generator",
    iconName: "wand",
    href: "/tools/script-generator",
    category: "generation",
    features: [
      { iconName: "sparkles", label: "Markdown Output" },
      { iconName: "sparkles", label: "Script Structuring" }
    ],
    primaryColor: "green-600",
    hoverColor: "green-600",
    bgColor: "green-100",
    hoverBgColor: "green-200"
  }
];
var TOOL_CATEGORIES = {
  GENERATION: "generation",
  ENHANCEMENT: "enhancement",
  UTILITY: "utility",
  GALLERY: "gallery"
};
var TOOL_ICONS = {
  IMAGE: "image",
  VIDEO: "video",
  WAND: "wand",
  SPARKLES: "sparkles",
  ZAP: "zap",
  PLAY: "play",
  LANGUAGES: "languages",
  GALLERY: "gallery"
};

// src/constants/video.ts
var VIDEO_RESOLUTIONS = [
  // SORA-COMPATIBLE RESOLUTIONS (16:9, 1:1, 9:16 only)
  {
    width: 1344,
    height: 768,
    label: "1344x768",
    aspectRatio: "16:9",
    qualityType: "hd"
  },
  {
    width: 1024,
    height: 1024,
    label: "1024x1024",
    aspectRatio: "1:1",
    qualityType: "hd"
  },
  {
    width: 768,
    height: 1344,
    label: "768x1344",
    aspectRatio: "9:16",
    qualityType: "hd"
  },
  // Premium Sora-compatible options
  {
    width: 1920,
    height: 1080,
    label: "1920\xD71080",
    aspectRatio: "16:9",
    qualityType: "full_hd"
  },
  {
    width: 1408,
    height: 1408,
    label: "1408\xD71408",
    aspectRatio: "1:1",
    qualityType: "full_hd"
  },
  {
    width: 1080,
    height: 1920,
    label: "1080\xD71920",
    aspectRatio: "9:16",
    qualityType: "full_hd"
  },
  // NON-SORA COMPATIBLE (4:3, 4:5) - for other models only
  {
    width: 1152,
    height: 896,
    label: "1152x896 (Non-Sora)",
    aspectRatio: "4:3",
    qualityType: "hd"
  },
  {
    width: 1024,
    height: 1280,
    label: "1024x1280 (Non-Sora)",
    aspectRatio: "4:5",
    qualityType: "hd"
  },
  {
    width: 1664,
    height: 1216,
    label: "1664x1216 (Non-Sora)",
    aspectRatio: "4:3",
    qualityType: "full_hd"
  },
  {
    width: 1408,
    height: 1760,
    label: "1408\xD71760 (Non-Sora)",
    aspectRatio: "4:5",
    qualityType: "full_hd"
  }
];
var SHOT_SIZES = [
  {
    id: "extreme_long_shot",
    label: "Extreme Long Shot",
    description: "Shows vast landscapes or cityscapes with tiny subjects"
  },
  {
    id: "long_shot",
    label: "Long Shot",
    description: "Shows full body of subject with surrounding environment"
  },
  {
    id: "medium_shot",
    label: "Medium Shot",
    description: "Shows subject from waist up, good for conversations"
  },
  {
    id: "close_up",
    label: "Close Up",
    description: "Shows subject's face or specific detail"
  },
  {
    id: "extreme_close_up",
    label: "Extreme Close Up",
    description: "Shows very specific detail or emotion"
  },
  {
    id: "two_shot",
    label: "Two Shot",
    description: "Shows two subjects in frame"
  },
  {
    id: "over_the_shoulder",
    label: "Over the Shoulder",
    description: "Shows one subject from behind another's shoulder"
  },
  {
    id: "point_of_view",
    label: "Point of View",
    description: "Shows scene from character's perspective"
  }
];
var VIDEO_STYLES = [
  {
    id: "realistic",
    label: "Realistic",
    description: "Photorealistic, natural appearance"
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Movie-like quality with dramatic lighting"
  },
  {
    id: "anime",
    label: "Anime",
    description: "Japanese animation style"
  },
  {
    id: "cartoon",
    label: "Cartoon",
    description: "Simple, colorful cartoon style"
  },
  {
    id: "sketch",
    label: "Sketch",
    description: "Hand-drawn sketch appearance"
  },
  {
    id: "painting",
    label: "Painting",
    description: "Artistic painting style"
  },
  {
    id: "steampunk",
    label: "Steampunk",
    description: "Victorian sci-fi aesthetic"
  },
  {
    id: "fantasy",
    label: "Fantasy",
    description: "Magical, otherworldly appearance"
  },
  {
    id: "sci_fi",
    label: "Sci-Fi",
    description: "Futuristic, technological aesthetic"
  },
  {
    id: "horror",
    label: "Horror",
    description: "Dark, frightening atmosphere"
  },
  {
    id: "minimalist",
    label: "Minimalist",
    description: "Simple, clean design"
  },
  {
    id: "abstract",
    label: "Abstract",
    description: "Non-representational, artistic"
  }
];
var VIDEO_DURATIONS = [5, 10, 15, 20, 30, 45, 60];
var VIDEO_FPS = [24, 30, 60];
var DEFAULT_VIDEO_CONFIG = {
  resolution: VIDEO_RESOLUTIONS[0],
  // 1344x768
  shotSize: SHOT_SIZES[2],
  // medium_shot
  style: VIDEO_STYLES[0],
  // realistic
  duration: VIDEO_DURATIONS[0],
  // 5 seconds
  fps: VIDEO_FPS[0]
  // 24 fps
};

// src/constants/video-models.ts
var DEFAULT_VIDEO_MODELS = [
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
var PRICE_TIER_THRESHOLDS = {
  BUDGET: 0.5,
  STANDARD: 1.5,
  PREMIUM: 2.5,
  LUXURY: Infinity
};
var VIDEO_MODEL_CATEGORIES = {
  TEXT_TO_VIDEO: "text_to_video",
  IMAGE_TO_VIDEO: "image_to_video",
  VIDEO_TO_VIDEO: "video_to_video"
};
var PRICE_TIERS = {
  BUDGET: "budget",
  STANDARD: "standard",
  PREMIUM: "premium",
  LUXURY: "luxury"
};
function getPriceTier(pricePerSecond) {
  if (pricePerSecond <= PRICE_TIER_THRESHOLDS.BUDGET) return "BUDGET";
  if (pricePerSecond <= PRICE_TIER_THRESHOLDS.STANDARD) return "STANDARD";
  if (pricePerSecond <= PRICE_TIER_THRESHOLDS.PREMIUM) return "PREMIUM";
  return "LUXURY";
}
function getModelCategory(modelName) {
  const name = modelName.toLowerCase();
  if (name.includes("image-to-video") || name.includes("veo") || name.includes("kling")) {
    return "IMAGE_TO_VIDEO";
  } else if (name.includes("lip-sync") || name.includes("video-to-video")) {
    return "VIDEO_TO_VIDEO";
  }
  return "TEXT_TO_VIDEO";
}
function getDefaultVideoModelByCategory(category) {
  return DEFAULT_VIDEO_MODELS.find(
    (model) => getModelCategory(model.name) === category
  );
}
function getVideoModelsByPriceTier(models, tier) {
  return models.filter((model) => {
    const price = model.params?.price_per_second || 0;
    return getPriceTier(price) === tier;
  });
}
function getVideoModelsByCategory(models, category) {
  return models.filter((model) => getModelCategory(model.name) === category);
}

// src/constants/media-settings.ts
var ShotSizeEnum = /* @__PURE__ */ ((ShotSizeEnum2) => {
  ShotSizeEnum2["EXTREME_LONG_SHOT"] = "extreme_long_shot";
  ShotSizeEnum2["LONG_SHOT"] = "long_shot";
  ShotSizeEnum2["MEDIUM_SHOT"] = "medium_shot";
  ShotSizeEnum2["CLOSE_UP"] = "close_up";
  ShotSizeEnum2["EXTREME_CLOSE_UP"] = "extreme_close_up";
  ShotSizeEnum2["TWO_SHOT"] = "two_shot";
  ShotSizeEnum2["OVER_THE_SHOULDER"] = "over_the_shoulder";
  ShotSizeEnum2["POINT_OF_VIEW"] = "point_of_view";
  return ShotSizeEnum2;
})(ShotSizeEnum || {});
var DEFAULT_IMAGE_CONFIG = {
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
var DEFAULT_VIDEO_GENERATION_CONFIG = {
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
var CACHE_CONFIG = {
  DURATION: 60 * 60 * 1e3,
  // 1 hour
  IMAGE_CONFIG_KEY: "image_config_cache",
  VIDEO_CONFIG_KEY: "video_config_cache"
};
var PRIORITY_MODELS = {
  IMAGE: ["comfyui/flux", "comfyui/sdxl", "flux-dev", "sdxl"],
  VIDEO: ["comfyui/ltx", "comfyui/veo3", "comfyui/kling"]
};
function adaptModelForMediaSettings(model) {
  return {
    ...model,
    id: model.name,
    // Use name as id for compatibility
    label: model.name,
    // Use name as label for display
    description: `${model.type} - ${model.source}`,
    value: model.name,
    workflowPath: model.params?.workflow_path || "",
    price: model.params?.price || 0
  };
}
function getDefaultModelByPriority(models, priorityList) {
  for (const modelName of priorityList) {
    const model = models.find((m) => m.name === modelName);
    if (model) return model;
  }
  return void 0;
}
function validateMediaSettingsConfig(config) {
  return !!(config.availableModels?.length > 0 && config.availableResolutions?.length > 0 && config.availableStyles?.length > 0 && config.availableShotSizes?.length > 0);
}

// src/utils/validation.ts
import { z } from "zod";
var emailSchema = z.string().email();
var urlSchema = z.string().url();
function isValidEmail(email) {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}
function isValidUrl(url) {
  try {
    urlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}
function validateFileSize(size, maxSize) {
  return size <= maxSize;
}
function validateFileType(type, allowedTypes) {
  return allowedTypes.includes(type);
}

// src/utils/formatting.ts
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatDateTime(date) {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// src/utils/files.ts
function getFileExtension(filename) {
  return filename.split(".").pop()?.toLowerCase() || "";
}
function getFileNameWithoutExtension(filename) {
  return filename.replace(/\.[^/.]+$/, "");
}
function isImageFile(filename) {
  const ext = getFileExtension(filename);
  return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
}
function isVideoFile(filename) {
  const ext = getFileExtension(filename);
  return ["mp4", "mov", "avi", "mkv", "webm"].includes(ext);
}
export {
  API_CONFIG,
  API_ENDPOINTS,
  API_HEADERS,
  API_METHODS,
  API_NEXT_ROUTES,
  APP_CONFIG,
  APP_NAME,
  APP_VERSION,
  CACHE_CONFIG,
  CONTENT_TYPES,
  DEFAULT_IMAGE_CONFIG,
  DEFAULT_VIDEO_CONFIG,
  DEFAULT_VIDEO_GENERATION_CONFIG,
  DEFAULT_VIDEO_MODELS,
  ENV,
  FEATURE_FLAGS,
  FILE_TYPES,
  HTTP_STATUS,
  PRICE_TIERS,
  PRICE_TIER_THRESHOLDS,
  PRIORITY_MODELS,
  SHOT_SIZES,
  STATUS,
  ShotSizeEnum,
  TOOLS_CONFIG,
  TOOL_CATEGORIES,
  TOOL_ICONS,
  UI_CONFIG,
  VIDEO_DURATIONS,
  VIDEO_FPS,
  VIDEO_MODEL_CATEGORIES,
  VIDEO_RESOLUTIONS,
  VIDEO_STYLES,
  adaptModelForMediaSettings,
  emailSchema,
  formatDate,
  formatDateTime,
  formatFileSize,
  getDefaultModelByPriority,
  getDefaultVideoModelByCategory,
  getFileExtension,
  getFileNameWithoutExtension,
  getModelCategory,
  getPriceTier,
  getVideoModelsByCategory,
  getVideoModelsByPriceTier,
  isImageFile,
  isValidEmail,
  isValidUrl,
  isVideoFile,
  urlSchema,
  validateFileSize,
  validateFileType,
  validateMediaSettingsConfig
};
//# sourceMappingURL=index.mjs.map