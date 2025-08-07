import type { ImageGenerationParams, ImageToImageParams, ImageGenerationResult } from "./strategy.interface";
export declare function generateImageWithStrategy(generationType: string, params: ImageGenerationParams | ImageToImageParams, config: {
    url: string;
    token: string;
}): Promise<ImageGenerationResult>;
//# sourceMappingURL=generate.d.ts.map