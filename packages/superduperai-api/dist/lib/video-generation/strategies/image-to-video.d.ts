import type { ImageToVideoParams, VideoGenerationStrategy } from "../strategy.interface";
export declare class ImageToVideoStrategy implements VideoGenerationStrategy {
    readonly type = "image-to-video";
    readonly requiresSourceImage = true;
    readonly requiresPrompt = false;
    validate(params: ImageToVideoParams): {
        valid: boolean;
        error?: string;
    };
    /**
     * Handle image upload to SuperDuperAI
     */
    handleImageUpload(params: ImageToVideoParams, config: {
        url: string;
        token: string;
    }): Promise<{
        imageId?: string;
        imageUrl?: string;
        method: "upload";
        error?: string;
    }>;
    generatePayload(params: ImageToVideoParams, config?: {
        url: string;
        token: string;
    }): Promise<any>;
}
//# sourceMappingURL=image-to-video.d.ts.map