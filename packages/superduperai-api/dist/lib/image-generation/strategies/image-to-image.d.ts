import type { ImageToImageParams, ImageGenerationStrategy } from "../strategy.interface";
export declare class ImageToImageStrategy implements ImageGenerationStrategy {
    readonly type = "image-to-image";
    readonly requiresSourceImage = true;
    readonly requiresPrompt = true;
    validate(params: ImageToImageParams): {
        valid: boolean;
        error?: string;
    };
    generatePayload(params: ImageToImageParams): Promise<any>;
}
//# sourceMappingURL=image-to-image.d.ts.map