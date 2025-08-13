import { ImageToImageParams, ImageGenerationResult } from "../types";
import { superDuperAIClient } from "@turbo-super/api";

export class ImageToImageStrategy {
  private client = superDuperAIClient;

  async generate(params: ImageToImageParams): Promise<ImageGenerationResult> {
    try {
      // Validate parameters
      this.validateParams(params);

      // Prepare request payload
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_image: params.inputImage,
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl",
        strength: params.strength || 0.75,
        denoising_strength: params.denoisingStrength || 0.75,
      };

      // Make API request
      const response = await this.client.request<ImageGenerationResult>({
        method: "POST",
        url: "/generation/image-to-image",
        data: payload,
      });

      return response;
    } catch (error) {
      throw new Error(
        `Image-to-image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private validateParams(params: ImageToImageParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    if (!params.inputImage) {
      throw new Error("Input image is required");
    }

    if (params.width <= 0 || params.height <= 0) {
      throw new Error("Width and height must be positive numbers");
    }

    if (params.steps && (params.steps < 1 || params.steps > 100)) {
      throw new Error("Steps must be between 1 and 100");
    }

    if (params.cfgScale && (params.cfgScale < 1 || params.cfgScale > 20)) {
      throw new Error("CFG Scale must be between 1 and 20");
    }

    if (params.strength && (params.strength < 0 || params.strength > 1)) {
      throw new Error("Strength must be between 0 and 1");
    }

    if (
      params.denoisingStrength &&
      (params.denoisingStrength < 0 || params.denoisingStrength > 1)
    ) {
      throw new Error("Denoising strength must be between 0 and 1");
    }
  }
}

// Export default instance
export const imageToImageStrategy = new ImageToImageStrategy();
