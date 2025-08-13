import { VideoToVideoParams, VideoGenerationResult } from "../types";
import { superDuperAIClient } from "@turbo-super/api";

export class VideoToVideoStrategy {
  private client = superDuperAIClient;

  async generate(params: VideoToVideoParams): Promise<VideoGenerationResult> {
    try {
      // Validate parameters
      this.validateParams(params);

      // Prepare request payload
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_video: params.inputVideo,
        width: params.width,
        height: params.height,
        duration: params.duration,
        fps: params.fps || 24,
        model: params.model || "veo-2",
        seed: params.seed || -1,
        strength: params.strength || 0.75,
      };

      // Make API request
      const response = await this.client.request<VideoGenerationResult>({
        method: "POST",
        url: "/generation/video-to-video",
        data: payload,
      });

      return response;
    } catch (error) {
      throw new Error(
        `Video-to-video generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private validateParams(params: VideoToVideoParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    if (!params.inputVideo) {
      throw new Error("Input video is required");
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

    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }
  }
}

// Export default instance
export const videoToVideoStrategy = new VideoToVideoStrategy();
