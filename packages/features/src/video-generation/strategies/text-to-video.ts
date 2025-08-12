import { VideoGenerationParams, VideoGenerationResult } from "../types";
import { superDuperAIClient } from "@turbo-super/api";

export class TextToVideoStrategy {
  private client = superDuperAIClient;

  async generate(
    params: VideoGenerationParams
  ): Promise<VideoGenerationResult> {
    try {
      // Validate parameters
      this.validateParams(params);

      // Prepare request payload
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.width,
        height: params.height,
        duration: params.duration,
        fps: params.fps || 24,
        model: params.model || "veo-2",
        seed: params.seed || -1,
      };

      // Make API request
      const response = await this.client.request<VideoGenerationResult>({
        method: "POST",
        url: "/generation/video",
        data: payload,
      });

      return response;
    } catch (error) {
      throw new Error(
        `Text-to-video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private validateParams(params: VideoGenerationParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }

    if (params.duration <= 0 || params.duration > 60) {
      throw new Error("Duration must be between 0 and 60 seconds");
    }

    if (params.fps && (params.fps < 1 || params.fps > 60)) {
      throw new Error("FPS must be between 1 and 60");
    }
  }
}

// Export default instance
export const textToVideoStrategy = new TextToVideoStrategy();
