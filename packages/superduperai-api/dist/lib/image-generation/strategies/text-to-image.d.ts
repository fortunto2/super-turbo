import type { ImageGenerationParams, ImageGenerationStrategy } from "../strategy.interface";
export declare class TextToImageStrategy implements ImageGenerationStrategy {
    readonly type = "text-to-image";
    readonly requiresSourceImage = false;
    readonly requiresPrompt = true;
    validate(params: ImageGenerationParams): {
        valid: boolean;
        error?: string;
    };
    generatePayload(params: ImageGenerationParams): Promise<any>;
}
//# sourceMappingURL=text-to-image.d.ts.map