// AI Tools types

export interface AIToolConfig {
  id: string;
  name: string;
  description: string;
  category: "generation" | "enhancement" | "utility";
  iconName: string;
  features: string[];
}

export interface GenerationRequest {
  prompt: string;
  model?: string;
  parameters?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface GenerationResponse {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
  progress?: number;
}

export interface PromptEnhancementRequest {
  prompt: string;
  language?: string;
  style?: string;
  length?: "short" | "medium" | "long";
}

export interface PromptEnhancementResponse {
  enhancedPrompt: string;
  suggestions: string[];
  confidence: number;
}

export interface ScriptGenerationRequest {
  topic: string;
  genre?: string;
  length?: "short" | "medium" | "long";
  format?: "markdown" | "plain" | "structured";
}

export interface ScriptGenerationResponse {
  script: string;
  outline: string[];
  metadata: {
    genre: string;
    estimatedDuration: string;
    scenes: number;
  };
}

// UI Component Types
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
