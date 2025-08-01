export interface ToolConfig {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  iconName:
    | "image"
    | "video"
    | "wand"
    | "sparkles"
    | "zap"
    | "play"
    | "languages"
    | "gallery";
  href: string;
  category: "generation" | "enhancement" | "utility" | "gallery";
  features: {
    iconName: "sparkles" | "zap" | "play" | "languages";
    label: string;
  }[];
  primaryColor: string;
  hoverColor: string;
  bgColor: string;
  hoverBgColor: string;
}

export interface GenerationStatus {
  status: "idle" | "generating" | "completed" | "error";
  message: string;
  progress?: number;
  error?: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  model: string;
  createdAt: string;
  duration?: number;
  metadata?: Record<string, any>;
}

// Media settings types based on super-chatbot
export interface MediaOption {
  id: string;
  label: string;
  description?: string;
  thumbnail?: string | null;
}

export interface MediaResolution {
  width: number;
  height: number;
  label: string;
  aspectRatio?: string;
  qualityType?: "hd" | "full_hd";
}

export interface AdaptedModel {
  id: string;
  label: string;
  description: string;
  value: string;
  workflowPath: string;
  price: number;
}

// Image generation types based on super-chatbot
export interface ImageGenerationParams {
  prompt: string;
  style?: string;
  resolution?: string;
  shotSize?: string;
  model?: string;
  seed?: number;
}

// Video generation types based on super-chatbot
export interface VideoGenerationParams {
  prompt: string;
  negativePrompt?: string;
  style?: string;
  resolution?: string;
  shotSize?: string;
  model?: string;
  frameRate?: number;
  duration?: number;
  seed?: number;
  generationType?: 'text-to-video' | 'image-to-video';
  file?: File;
}

// Prompt enhancement types based on super-chatbot
export interface PromptEnhancementParams {
  originalPrompt: string;
  mediaType?: "image" | "video" | "text" | "general";
  enhancementLevel?: "basic" | "detailed" | "creative";
  targetAudience?: string;
  includeNegativePrompt?: boolean;
  modelHint?: string;
}

export interface EnhancementResult {
  originalPrompt: string;
  enhancedPrompt: string;
  negativePrompt?: string;
  mediaType: string;
  enhancementLevel: string;
  modelHint?: string;
  improvements: string[];
  reasoning: string;
  usage?: {
    copyPrompt: string;
    negativePrompt?: string;
  };
  error?: string;
  fallback?: boolean;
}

// Script generation types based on super-chatbot
export interface ScriptGenerationParams {
  prompt: string;
}

export interface ToolNavigationItem {
  id: string;
  name: string;
  shortName: string;
  iconName: ToolConfig["iconName"];
  href: string;
}
