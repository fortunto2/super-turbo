// Image generation types
export interface ImageGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps?: number;
  cfgScale?: number;
  seed?: number;
  model?: string;
}

export interface ImageToImageParams extends ImageGenerationParams {
  inputImage: string; // Base64 or URL
  strength?: number; // 0.0 to 1.0
  denoisingStrength?: number;
}

export interface ImageGenerationResult {
  id: string;
  imageUrl: string;
  metadata: {
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    steps: number;
    cfgScale: number;
    seed: number;
    model: string;
    generationTime: number;
  };
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

export interface ImageGenerationConfig {
  defaultModel: string;
  maxSteps: number;
  maxCfgScale: number;
  supportedResolutions: Array<{ width: number; height: number }>;
  defaultStrength: number;
}
