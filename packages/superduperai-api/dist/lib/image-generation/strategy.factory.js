import { TextToImageStrategy } from "./strategies/text-to-image";
import { ImageToImageStrategy } from "./strategies/image-to-image";
// Strategy Factory
export class ImageGenerationStrategyFactory {
    constructor() {
        this.strategies = new Map();
        this.registerStrategy(new TextToImageStrategy());
        this.registerStrategy(new ImageToImageStrategy());
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