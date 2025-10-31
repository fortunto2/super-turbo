/**
 * Типы для Google Gemini 2.5 Flash Image API
 * Nano Banana - это Gemini-2.5-Flash-Image модель
 */

export interface GeminiImageParams {
  prompt: string;
  sourceImageUrl?: string; // Для image-to-image операций
  style: string;
  quality: string;
  aspectRatio: string;
  seed?: number;
  nanoBananaFeatures: {
    enableContextAwareness: boolean;
    enableSurgicalPrecision: boolean;
    creativeMode: boolean;
  };
}

export interface GeminiEditParams {
  editPrompt: string;
  sourceImageUrl: string; // Обязательно для редактирования
  imageData?: string; // Base64 данные изображения
  editType: string;
  precisionLevel: string;
  blendMode: string;
  preserveOriginalStyle: boolean;
  enhanceLighting: boolean;
  preserveShadows: boolean;
  nanoBananaEditFeatures: {
    enableContextAwareness: boolean;
    enableSurgicalPrecision: boolean;
    creativeMode: boolean;
    preserveOriginalStyle: boolean;
    enhanceLighting: boolean;
    preserveShadows: boolean;
  };
}

export interface GeminiImageResult {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  settings: {
    style: string;
    quality: string;
    aspectRatio: string;
    seed?: number | undefined;
    enableContextAwareness: boolean;
    enableSurgicalPrecision: boolean;
    creativeMode: boolean;
  };
  nanoBananaInfo: {
    model: 'gemini-2.5-flash-image';
    capabilities: string[];
    style: {
      id: string;
      label: string;
      description: string;
    };
    quality: {
      id: string;
      label: string;
      multiplier: number;
      description: string;
    };
    aspectRatio: {
      id: string;
      label: string;
      width: number;
      height: number;
      description: string;
    };
  };
  geminiResponse?: string; // Ответ от Gemini API
}

export interface GeminiEditResult {
  id: string;
  url: string;
  editType: string;
  editPrompt: string;
  timestamp: number;
  settings: {
    precisionLevel: string;
    blendMode: string;
    preserveOriginalStyle: boolean;
    enhanceLighting: boolean;
    preserveShadows: boolean;
  };
  nanoBananaEditInfo: {
    model: 'gemini-2.5-flash-image';
    editType: {
      id: string;
      label: string;
      description: string;
    };
    precisionLevel: {
      id: string;
      label: string;
      description: string;
    };
    blendMode: {
      id: string;
      label: string;
      description: string;
    };
    capabilities: string[];
  };
  geminiResponse?: string; // Ответ от Gemini API
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface GeminiGenerationConfig {
  responseModalities: ('Text' | 'Image')[];
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
}
