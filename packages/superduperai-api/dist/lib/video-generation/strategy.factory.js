import { ImageToVideoStrategy } from "./strategies/image-to-video";
import { TextToVideoStrategy } from "./strategies/text-to-video";
// Strategy Factory
export class VideoGenerationStrategyFactory {
    constructor() {
        this.strategies = new Map();
        this.registerStrategy(new TextToVideoStrategy());
        this.registerStrategy(new ImageToVideoStrategy());
    }
    registerStrategy(strategy) {
        this.strategies.set(strategy.type, strategy);
    }
    getStrategy(type) {
        return this.strategies.get(type) || null;
    }
    getAllStrategies() {
        return Array.from(this.strategies.values());
    }
    getSupportedTypes() {
        return Array.from(this.strategies.keys());
    }
}
//# sourceMappingURL=strategy.factory.js.map