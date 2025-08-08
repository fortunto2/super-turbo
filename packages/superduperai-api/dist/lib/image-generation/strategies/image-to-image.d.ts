import type { ImageToImageParams, ImageGenerationStrategy } from "../strategy.interface";
export declare class ImageToImageStrategy implements ImageGenerationStrategy {
    readonly type = "image-to-image";
    readonly requiresSourceImage = true;
    readonly requiresPrompt = true;
    validate(params: ImageToImageParams): {
        valid: boolean;
        error?: string;
    };
    handleImageUpload(params: ImageToImageParams, config: {
        url: string;
        token: string;
    }): Promise<{
        imageId?: string;
        imageUrl?: string;
        method: "upload";
        error?: string;
    }>;
    generatePayload(params: ImageToImageParams, config?: {
        url: string;
        token: string;
    }): Promise<any>;
}
//# sourceMappingURL=image-to-image.d.ts.map