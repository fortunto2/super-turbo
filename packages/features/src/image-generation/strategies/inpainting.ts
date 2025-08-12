import { ImageToImageParams, ImageGenerationResult } from "../types";
import { superDuperAIClient } from "@turbo-super/api";

export interface InpaintingParams extends ImageToImageParams {
  mask: string; // Base64 or URL of the mask
  maskBlur?: number; // Blur radius for the mask edges
}

export class InpaintingStrategy {
  private client = superDuperAIClient;

  async generate(params: InpaintingParams): Promise<ImageGenerationResult> {
    try {
      // Validate parameters
      this.validateParams(params);

      // Prepare request payload
      const payload = {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        input_image: params.inputImage,
        mask: params.mask,
        width: params.width,
        height: params.height,
        steps: params.steps || 20,
        cfg_scale: params.cfgScale || 7.5,
        seed: params.seed || -1,
        model: params.model || "stable-diffusion-xl",
        strength: params.strength || 0.75,
        mask_blur: params.maskBlur || 4,
      };

      // Make API request
      const response = await this.client.request<ImageGenerationResult>({
        method: "POST",
        url: "/generation/inpainting",
        data: payload,
      });

      return response;
    } catch (error) {
      throw new Error(
        `Inpainting generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private validateParams(params: InpaintingParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("Prompt is required");
    }

    if (!params.inputImage) {
      throw new Error("Input image is required");
    }

    if (!params.mask) {
      throw new Error("Mask is required for inpainting");
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

    if (params.maskBlur && (params.maskBlur < 0 || params.maskBlur > 64)) {
      throw new Error("Mask blur must be between 0 and 64");
    }
  }
}

// Export default instance
export const inpaintingStrategy = new InpaintingStrategy();
