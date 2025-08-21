// Re-export image generation types for easier usage
export type {
  ImageGenerationParams,
  ImageToImageParams,
  ImageGenerationResult,
} from "./superduperai/lib/image-generation/strategy.interface";

// Re-export image generation function
export { generateImageWithStrategy } from "./superduperai/lib/image-generation/generate";
