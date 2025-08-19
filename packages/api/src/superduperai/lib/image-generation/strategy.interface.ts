// @ts-nocheck
// Base interfaces for image generation
export interface ImageGenerationParams {
  prompt: string;
  model: any;
  style: any;
  resolution: any;
  shotSize: any;
  negativePrompt?: string;
  seed?: number;
  batchSize?: number;
}

export interface ImageToImageParams extends ImageGenerationParams {
  file: File;
  sourceImageId?: string;
  sourceImageUrl?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  projectId?: string;
  requestId?: string;
  fileId?: string;
  message?: string;
  error?: string;
  files?: any[];
  url?: string;
  method?: "sse" | "polling";
  tasks?: any[];
}

// Base strategy interface
export interface ImageGenerationStrategy {
  readonly type: string;
  readonly requiresSourceImage: boolean;
  readonly requiresPrompt: boolean;
  generatePayload(
    params: ImageGenerationParams | ImageToImageParams,
    config?: { url: string; token: string }
  ): Promise<any>;
  validate(params: ImageGenerationParams | ImageToImageParams): {
    valid: boolean;
    error?: string;
  };
}
