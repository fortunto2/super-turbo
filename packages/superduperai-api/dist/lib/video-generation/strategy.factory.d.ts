import type { VideoGenerationStrategy } from "./strategy.interface";
export declare class VideoGenerationStrategyFactory {
    private strategies;
    constructor();
    registerStrategy(strategy: VideoGenerationStrategy): void;
    getStrategy(type: string): VideoGenerationStrategy | null;
    getAllStrategies(): VideoGenerationStrategy[];
    getSupportedTypes(): string[];
}
//# sourceMappingURL=strategy.factory.d.ts.map