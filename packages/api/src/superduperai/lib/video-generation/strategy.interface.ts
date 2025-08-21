// @ts-nocheck
// Base interfaces for video generation
export interface VideoGenerationParams {
  prompt: string;
  model: any;
  style: any;
  resolution: any;
  shotSize: any;
  duration: number;
  frameRate: number;
  negativePrompt?: string;
  seed?: number;
  generationType?: string;
}

export interface ImageToVideoParams extends VideoGenerationParams {
  file: File;
}

export interface VideoGenerationResult {
  success: boolean;
  projectId?: string;
  requestId?: string;
  fileId?: string;
  message?: string;
  error?: string;
  files?: any[];
  url?: string;
  method?: "sse" | "polling";
}

// Base strategy interface
export interface VideoGenerationStrategy {
  readonly type: string;
  readonly requiresSourceImage: boolean;
  readonly requiresPrompt: boolean;
  generatePayload(
    params: VideoGenerationParams | ImageToVideoParams,
    config?: { url: string; token: string }
  ): Promise<any>;
  validate(params: VideoGenerationParams | ImageToVideoParams): {
    valid: boolean;
    error?: string;
  };
}
