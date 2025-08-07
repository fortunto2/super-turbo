import type { ImageToVideoParams, VideoGenerationParams, VideoGenerationResult } from "./strategy.interface";
export declare function generateVideoWithStrategy(generationType: string, params: VideoGenerationParams | ImageToVideoParams, config: {
    url: string;
    token: string;
}): Promise<VideoGenerationResult>;
//# sourceMappingURL=generate.d.ts.map