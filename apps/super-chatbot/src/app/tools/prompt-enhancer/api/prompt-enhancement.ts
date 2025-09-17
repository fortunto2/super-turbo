import { API_NEXT_ROUTES } from "@/lib/config/next-api-routes";

export interface EnhancementParams {
  originalPrompt: string;
  mediaType?: "image" | "video" | "text" | "general";
  enhancementLevel?: "basic" | "detailed" | "creative";
  targetAudience?: string;
  includeNegativePrompt?: boolean;
  modelHint?: string;
}

export interface EnhancementResult {
  success: boolean;
  originalPrompt?: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  mediaType?: string;
  enhancementLevel?: string;
  modelHint?: string;
  improvements?: string[];
  reasoning?: string;
  usage?: {
    copyPrompt: string;
    negativePrompt?: string;
  };
  error?: string;
  fallback?: boolean;
}

export async function enhancePromptApi(
  params: EnhancementParams
): Promise<EnhancementResult> {
  try {
    const payload = {
      originalPrompt: params.originalPrompt,
      mediaType: params.mediaType || "general",
      enhancementLevel: params.enhancementLevel || "detailed",
      targetAudience: params.targetAudience || "general audience",
      includeNegativePrompt: params.includeNegativePrompt || false,
      modelHint: params.modelHint || "",
    };

    const response = await fetch(API_NEXT_ROUTES.ENHANCE_PROMPT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error:
          errorData.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Enhancement failed",
      };
    }

    return {
      success: true,
      originalPrompt: result.originalPrompt,
      enhancedPrompt: result.enhancedPrompt,
      negativePrompt: result.negativePrompt,
      mediaType: result.mediaType,
      enhancementLevel: result.enhancementLevel,
      modelHint: result.modelHint,
      improvements: result.improvements || [],
      reasoning: result.reasoning,
      usage: result.usage,
      fallback: result.fallback,
    };
  } catch (error) {
    console.error("Prompt enhancement API error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
