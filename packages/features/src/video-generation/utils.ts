import { VideoGenerationConfig } from "./types";

// Default configuration for video generation
export const DEFAULT_VIDEO_CONFIG: VideoGenerationConfig = {
  defaultModel: "veo-2",
  maxDuration: 60,
  minDuration: 1,
  supportedFps: [24, 25, 30, 60],
  supportedResolutions: [
    { width: 512, height: 512 },
    { width: 768, height: 768 },
    { width: 1024, height: 1024 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
  ],
  defaultStrength: 0.75,
};

// Utility functions for video generation
export class VideoGenerationUtils {
  /**
   * Validate if resolution is supported
   */
  static isResolutionSupported(width: number, height: number): boolean {
    return DEFAULT_VIDEO_CONFIG.supportedResolutions.some(
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
    let closest = DEFAULT_VIDEO_CONFIG.supportedResolutions[0];
    let minDistance = Infinity;

    for (const res of DEFAULT_VIDEO_CONFIG.supportedResolutions) {
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
   * Validate duration
   */
  static validateDuration(duration: number): boolean {
    return (
      duration >= DEFAULT_VIDEO_CONFIG.minDuration &&
      duration <= DEFAULT_VIDEO_CONFIG.maxDuration
    );
  }

  /**
   * Validate FPS
   */
  static validateFps(fps: number): boolean {
    return DEFAULT_VIDEO_CONFIG.supportedFps.includes(fps);
  }

  /**
   * Get closest supported FPS
   */
  static getClosestFps(fps: number): number {
    let closest = DEFAULT_VIDEO_CONFIG.supportedFps[0];
    let minDistance = Infinity;

    for (const supportedFps of DEFAULT_VIDEO_CONFIG.supportedFps) {
      const distance = Math.abs(supportedFps - fps);
      if (distance < minDistance) {
        minDistance = distance;
        closest = supportedFps;
      }
    }

    return closest;
  }

  /**
   * Calculate video file size estimate
   */
  static estimateFileSize(
    width: number,
    height: number,
    duration: number,
    fps: number
  ): number {
    // Rough estimate: 1 byte per pixel per frame
    const pixelsPerFrame = width * height;
    const totalFrames = duration * fps;
    return pixelsPerFrame * totalFrames;
  }
}
