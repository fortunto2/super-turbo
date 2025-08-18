// Конфигурация моделей с их возможностями
export interface ModelConfig {
  name: string;
  type: "video" | "image";
  supportsImageToVideo: boolean;
  supportsTextToVideo: boolean;
  maxDuration?: number;
  aspectRatio?: string;
  width?: number;
  height?: number;
  frameRate?: number;
  description?: string;
  generationConfigName?: string;
  imageToVideoConfigName?: string;
}

// Конфигурация всех моделей
export const MODELS_CONFIG: Record<string, ModelConfig> = {
  // Video Models
  Veo2: {
    name: "Veo2",
    type: "video",
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    description:
      "Google VEO2 - Advanced image-to-video and text-to-video generation",
    generationConfigName: "google-cloud/veo2-text2video", // text-to-video
    imageToVideoConfigName: "google-cloud/veo2", // image-to-video
  },
  Veo3: {
    name: "Veo3",
    type: "video",
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    description:
      "Google VEO3 - Latest image-to-video and text-to-video generation",
    generationConfigName: "google-cloud/veo3-text2video", // text-to-video
    imageToVideoConfigName: "google-cloud/veo3", // image-to-video
  },
  Sora: {
    name: "Sora",
    type: "video",
    supportsImageToVideo: false,
    supportsTextToVideo: true,
    maxDuration: 10,
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    frameRate: 30,
    description: "OpenAI Sora - Text-to-video generation",
    generationConfigName: "azure-openai/sora",
  },
  "Kling 2.1": {
    name: "Kling 2.1",
    type: "video",
    supportsImageToVideo: true,
    supportsTextToVideo: true,
    maxDuration: 10,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    description: "KLING 2.1 - Image-to-video and text-to-video generation",
    generationConfigName: "comfyui/kling",
  },
  LTX: {
    name: "LTX",
    type: "video",
    supportsImageToVideo: false,
    supportsTextToVideo: true,
    maxDuration: 5,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
    description: "LTX - Fast text-to-video generation",
    generationConfigName: "comfyui/ltx",
  },

  // Image Models
  "Google Imagen 4": {
    name: "Google Imagen 4",
    type: "image",
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    width: 1024,
    height: 1024,
    description: "Google Imagen 4 - High-quality image generation",
    generationConfigName: "google-cloud/imagen4",
  },
  "GPT-Image-1": {
    name: "GPT-Image-1",
    type: "image",
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    width: 1024,
    height: 1024,
    description: "GPT-Image-1 - OpenAI image generation",
    generationConfigName: "azure-openai/gpt-image-1",
  },
  "Flux Kontext": {
    name: "Flux Kontext",
    type: "image",
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    width: 1024,
    height: 1024,
    description: "Flux Kontext - Creative image generation",
    generationConfigName: "comfyui/flux",
  },
  "Flux Pro": {
    name: "Flux Pro",
    type: "image",
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    width: 1024,
    height: 1024,
    description: "Flux Pro - Professional image generation",
    generationConfigName: "fal-ai/flux-pro/v1.1-ultra",
  },
  "Imagen4 Ultra": {
    name: "Imagen4 Ultra",
    type: "image",
    supportsImageToVideo: false,
    supportsTextToVideo: false,
    width: 1024,
    height: 1024,
    description: "Imagen4 Ultra - Ultra-high quality image generation",
    generationConfigName: "google-cloud/imagen4-ultra",
  },
};

// Функция для получения конфигурации модели по названию
export function getModelConfig(modelName: string): ModelConfig | null {
  return MODELS_CONFIG[modelName] || null;
}

// Функция для проверки, поддерживает ли модель image-to-video
export function supportsImageToVideo(modelName: string): boolean {
  const config = getModelConfig(modelName);
  return config?.supportsImageToVideo || false;
}

// Функция для проверки, поддерживает ли модель text-to-video
export function supportsTextToVideo(modelName: string): boolean {
  const config = getModelConfig(modelName);
  return config?.supportsTextToVideo || false;
}

// Функция для получения типа модели
export function getModelType(modelName: string): "video" | "image" {
  const config = getModelConfig(modelName);
  return config?.type || "image";
}

// Функция для получения всех видео моделей
export function getVideoModels(): ModelConfig[] {
  return Object.values(MODELS_CONFIG).filter((model) => model.type === "video");
}

// Функция для получения всех моделей изображений
export function getImageModels(): ModelConfig[] {
  return Object.values(MODELS_CONFIG).filter((model) => model.type === "image");
}
