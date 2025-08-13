// Video generation types
export interface VideoGenerationParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  duration: number; // in seconds
  fps?: number;
  model?: string;
  seed?: number;
}

export interface VideoToVideoParams extends VideoGenerationParams {
  inputVideo: string; // Base64 or URL
  strength?: number; // 0.0 to 1.0
}

export interface VideoGenerationResult {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  metadata: {
    prompt: string;
    negativePrompt?: string;
    width: number;
    height: number;
    duration: number;
    fps: number;
    model: string;
    seed: number;
    generationTime: number;
  };
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  progress?: number; // 0 to 100
}

export interface VideoGenerationConfig {
  defaultModel: string;
  maxDuration: number;
  minDuration: number;
  supportedFps: number[];
  supportedResolutions: Array<{ width: number; height: number }>;
  defaultStrength: number;
}
