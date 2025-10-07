// AICODE-NOTE: Nano Banana API functions for all four main functionalities
// Provides typed interfaces for image generation, editing, prompt enhancement, and style guide

"use client";

// Types for Nano Banana operations
export interface NanoBananaImageGenerationRequest {
  prompt: string;
  sourceImageUrl?: string;
  style?: string;
  quality?: string;
  aspectRatio?: string;
  seed?: number;
  batchSize?: number;
  enableContextAwareness?: boolean;
  enableSurgicalPrecision?: boolean;
  creativeMode?: boolean;
}

export interface NanoBananaImageEditingRequest {
  editType: string;
  editPrompt: string;
  sourceImageUrl: string;
  precisionLevel?: string;
  blendMode?: string;
  preserveOriginalStyle?: boolean;
  enhanceLighting?: boolean;
  preserveShadows?: boolean;
  seed?: number;
  batchSize?: number;
  // Specific parameters for different edit types
  objectToRemove?: string;
  newBackground?: string;
  styleToTransfer?: string;
  targetObject?: string;
  replacementObject?: string;
  lightingDirection?: string;
  colorAdjustments?: string;
  textureDetails?: string;
  compositionChanges?: string;
  artisticEffect?: string;
}

export interface NanoBananaPromptEnhancementRequest {
  originalPrompt: string;
  enhancementTechnique?: string;
  targetStyle?: string;
  includeTechnicalTerms?: boolean;
  includeQualityDescriptors?: boolean;
  enhanceForEditing?: boolean;
  creativeMode?: boolean;
  preserveOriginalIntent?: boolean;
  customInstructions?: string;
}

export interface NanoBananaStyleGuideRequest {
  category?: string;
  technique?: string;
  difficulty?: string;
  tags?: string[];
  searchQuery?: string;
  includeTips?: boolean;
  includeExamples?: boolean;
  limit?: number;
}

// API Response types
export interface NanoBananaApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  projectId?: string;
  requestId?: string;
  fileId?: string;
}

export interface NanoBananaImageResult {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  settings?: {
    style: string;
    quality: string;
    aspectRatio: string;
    seed?: number;
    enableContextAwareness: boolean;
    enableSurgicalPrecision: boolean;
    creativeMode: boolean;
  };
}

export interface NanoBananaEditResult {
  id: string;
  url: string;
  editType: string;
  editPrompt: string;
  originalImageUrl: string;
  timestamp: number;
  settings: {
    precisionLevel: string;
    blendMode: string;
    preserveOriginalStyle: boolean;
    enhanceLighting: boolean;
    preserveShadows: boolean;
  };
}

export interface NanoBananaEnhancedPrompt {
  originalPrompt: string;
  enhancedPrompt: string;
  technique: string;
  improvements: string[];
  technicalTerms: string[];
  qualityDescriptors: string[];
}

export interface NanoBananaStyleInfo {
  category: string;
  technique: string;
  difficulty: string;
  description: string;
  tips: string[];
  examples: string[];
  tags: string[];
}

// API Functions
export async function generateNanoBananaImage(
  request: NanoBananaImageGenerationRequest
): Promise<NanoBananaApiResponse<NanoBananaImageResult>> {
  try {
    // Прямой минимальный вызов: без контекста, сразу Vertex Image
    const response = await fetch("/api/nano-banana/direct-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: request.prompt }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success || !data?.url) {
      return {
        success: false,
        error: data?.error || "Failed to generate image",
      };
    }

    const result: NanoBananaImageResult = {
      id: `vertex-${Date.now()}`,
      url: data.url,
      prompt: request.prompt,
      timestamp: Date.now(),
      settings: {
        style: String(request.style || ""),
        quality: String(request.quality || ""),
        aspectRatio: String(request.aspectRatio || ""),
        ...(typeof request.seed === "number" ? { seed: request.seed } : {}),
        enableContextAwareness: Boolean(request.enableContextAwareness),
        enableSurgicalPrecision: Boolean(request.enableSurgicalPrecision),
        creativeMode: Boolean(request.creativeMode),
      },
    };

    return { success: true, data: result };
  } catch (error) {
    console.error("Nano Banana image generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Generation failed",
    };
  }
}

export async function editNanoBananaImage(
  request: NanoBananaImageEditingRequest
): Promise<NanoBananaApiResponse<NanoBananaEditResult>> {
  try {
    const response = await fetch("/api/nano-banana/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Nano Banana image editing error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Editing failed",
    };
  }
}

export async function enhanceNanoBananaPrompt(
  request: NanoBananaPromptEnhancementRequest
): Promise<NanoBananaApiResponse<NanoBananaEnhancedPrompt>> {
  try {
    const response = await fetch("/api/nano-banana/enhance-prompt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Nano Banana prompt enhancement error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Enhancement failed",
    };
  }
}

export async function getNanoBananaStyleGuide(
  request: NanoBananaStyleGuideRequest = {}
): Promise<NanoBananaApiResponse<any>> {
  try {
    const response = await fetch("/api/nano-banana/style-guide", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Nano Banana style guide error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Style guide fetch failed",
    };
  }
}

// Configuration functions
export async function getNanoBananaConfig(): Promise<{
  styles: string[];
  qualityLevels: string[];
  aspectRatios: string[];
  editTypes: string[];
  precisionLevels: string[];
  blendModes: string[];
  enhancementTechniques: string[];
  techniques: string[];
}> {
  // Минимальная локальная конфигурация, чтобы UI работал без внешних API
  return {
    styles: ["realistic", "photorealistic", "cinematic", "anime", "artistic"],
    qualityLevels: ["high", "standard"],
    aspectRatios: ["1:1", "16:9", "9:16", "4:3", "3:4"],
    editTypes: ["background-replacement", "object-removal", "style-transfer"],
    precisionLevels: ["automatic", "high", "ultra"],
    blendModes: ["natural", "overlay", "multiply"],
    enhancementTechniques: [
      "context-aware-editing",
      "surgical-precision",
      "lighting-mastery",
      "physical-logic",
    ],
    techniques: [
      "context-aware-editing",
      "surgical-precision",
      "lighting-mastery",
      "physical-logic",
    ],
  };
}
