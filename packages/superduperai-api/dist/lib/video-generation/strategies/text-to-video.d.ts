import type { VideoGenerationParams, VideoGenerationStrategy } from "../strategy.interface";
export declare class TextToVideoStrategy implements VideoGenerationStrategy {
    readonly type = "text-to-video";
    readonly requiresSourceImage = false;
    readonly requiresPrompt = true;
    validate(params: VideoGenerationParams): {
        valid: boolean;
        error?: string;
    };
    generatePayload(params: VideoGenerationParams, config?: {
        url: string;
        token: string;
    }): any;
}
//# sourceMappingURL=text-to-video.d.ts.map