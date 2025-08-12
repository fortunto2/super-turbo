import { ImageGenerationConfig } from "./types";

// Default configuration for image generation
export const DEFAULT_IMAGE_CONFIG: ImageGenerationConfig = {
  defaultModel: "stable-diffusion-xl",
  maxSteps: 50,
  maxCfgScale: 20,
  supportedResolutions: [
    { width: 512, height: 512 },
    { width: 768, height: 768 },
    { width: 1024, height: 1024 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
  ],
  defaultStrength: 0.75,
};

// Image generation types
export type ImageGenType = "text-to-image" | "image-to-image";

// Utility functions for image generation
export class ImageGenerationUtils {
  /**
   * Validate if resolution is supported
   */
  static isResolutionSupported(width: number, height: number): boolean {
    return DEFAULT_IMAGE_CONFIG.supportedResolutions.some(
      (res) => res.width === width && res.height === height
    );
  }

  /**
   * Get closest supported resolution
   */
  static getClosestResolution(
    width: number,
    height: number
  ): { width: number; height: number } {
    let closest = DEFAULT_IMAGE_CONFIG.supportedResolutions[0];
    let minDistance = Infinity;

    for (const res of DEFAULT_IMAGE_CONFIG.supportedResolutions) {
      const distance = Math.sqrt(
        Math.pow(res.width - width, 2) + Math.pow(res.height - height, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = res;
      }
    }

    return closest;
  }

  /**
   * Calculate aspect ratio
   */
  static getAspectRatio(width: number, height: number): number {
    return width / height;
  }

  /**
   * Check if image is square
   */
  static isSquare(width: number, height: number): boolean {
    return width === height;
  }

  /**
   * Check if image is portrait
   */
  static isPortrait(width: number, height: number): boolean {
    return height > width;
  }

  /**
   * Check if image is landscape
   */
  static isLandscape(width: number, height: number): boolean {
    return width > height;
  }

  /**
   * Generate a random seed
   */
  static generateRandomSeed(): number {
    return Math.floor(Math.random() * 2147483647);
  }

  /**
   * Validate prompt length
   */
  static validatePromptLength(
    prompt: string,
    maxLength: number = 1000
  ): boolean {
    return prompt.length <= maxLength;
  }

  /**
   * Sanitize prompt text
   */
  static sanitizePrompt(prompt: string): string {
    return prompt
      .trim()
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .replace(/[^\w\s\-.,!?()]/g, ""); // Remove special characters except basic punctuation
  }

  /**
   * Normalize image generation type
   */
  static normalizeImageGenerationType(value: any): ImageGenType {
    return value === "image-to-image" ? "image-to-image" : "text-to-image";
  }

  /**
   * Ensure non-empty prompt with fallback
   */
  static ensureNonEmptyPrompt(input: any, fallback: string): string {
    const str = typeof input === "string" ? input.trim() : "";
    return str.length > 0 ? str : fallback;
  }

  /**
   * Select image-to-image model
   */
  static async selectImageToImageModel(
    rawModelName: string,
    getAvailableImageModels: () => Promise<any[]>,
    options?: { allowInpainting?: boolean }
  ): Promise<string | null> {
    const allowInpainting = options?.allowInpainting ?? false;
    const allImageModels = await getAvailableImageModels();
    const allI2I = allImageModels.filter(
      (m: any) => m.type === "image_to_image"
    );

    const wants = String(rawModelName || "");
    const baseToken = wants.toLowerCase().includes("flux")
      ? "flux"
      : wants.split("/").pop()?.split("-")[0] || wants.toLowerCase();

    const candidates = allowInpainting
      ? allI2I
      : allI2I.filter((m: any) => !/inpaint/i.test(String(m.name || "")));

    let pick = candidates.find(
      (m: any) =>
        String(m.name || "").toLowerCase() === wants.toLowerCase() ||
        String(m.label || "").toLowerCase() === wants.toLowerCase()
    );
    if (!pick && baseToken) {
      pick = candidates.find(
        (m: any) =>
          String(m.name || "")
            .toLowerCase()
            .includes(baseToken) ||
          String(m.label || "")
            .toLowerCase()
            .includes(baseToken)
      );
    }
    if (!pick && candidates.length > 0) pick = candidates[0];

    return pick?.name || null;
  }
}
