import type { ImageGenerationStrategy } from "./strategy.interface";
export declare class ImageGenerationStrategyFactory {
    private strategies;
    constructor();
    registerStrategy(strategy: ImageGenerationStrategy): void;
    getStrategy(type: string): ImageGenerationStrategy | null;
    getAllStrategies(): ImageGenerationStrategy[];
    getSupportedTypes(): string[];
}
//# sourceMappingURL=strategy.factory.d.ts.map