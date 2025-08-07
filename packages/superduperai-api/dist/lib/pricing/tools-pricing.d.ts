/**
 * Tool operation types and their costs
 */
export interface ToolOperation {
    id: string;
    name: string;
    description: string;
    baseCost: number;
    costMultipliers?: {
        [key: string]: number;
    };
}
/**
 * Pricing configuration for different tools
 */
export declare const TOOLS_PRICING: {
    readonly "image-generation": {
        readonly "text-to-image": {
            readonly id: "text-to-image";
            readonly name: "Text to Image";
            readonly description: "Generate image from text prompt";
            readonly baseCost: 5;
            readonly costMultipliers: {
                readonly "standard-quality": 1;
                readonly "high-quality": 1.5;
                readonly "ultra-quality": 2;
            };
        };
        readonly "image-to-image": {
            readonly id: "image-to-image";
            readonly name: "Image to Image";
            readonly description: "Transform existing image";
            readonly baseCost: 7;
            readonly costMultipliers: {
                readonly "standard-quality": 1;
                readonly "high-quality": 1.5;
                readonly "ultra-quality": 2;
            };
        };
    };
    readonly "video-generation": {
        readonly "text-to-video": {
            readonly id: "text-to-video";
            readonly name: "Text to Video";
            readonly description: "Generate video from text prompt";
            readonly baseCost: 7.5;
            readonly costMultipliers: {
                readonly "duration-5s": 1;
                readonly "duration-10s": 2;
                readonly "duration-15s": 3;
                readonly "duration-30s": 6;
                readonly "hd-quality": 1;
                readonly "4k-quality": 2;
            };
        };
        readonly "image-to-video": {
            readonly id: "image-to-video";
            readonly name: "Image to Video";
            readonly description: "Convert image to video";
            readonly baseCost: 11.25;
            readonly costMultipliers: {
                readonly "duration-5s": 1;
                readonly "duration-10s": 2;
                readonly "duration-15s": 3;
                readonly "duration-30s": 6;
                readonly "hd-quality": 1;
                readonly "4k-quality": 2;
            };
        };
    };
    readonly "script-generation": {
        readonly "basic-script": {
            readonly id: "basic-script";
            readonly name: "Script Generation";
            readonly description: "Generate script or text content";
            readonly baseCost: 1;
            readonly costMultipliers: {
                readonly "long-form": 2;
            };
        };
    };
    readonly "prompt-enhancement": {
        readonly "basic-enhancement": {
            readonly id: "basic-enhancement";
            readonly name: "Prompt Enhancement";
            readonly description: "Enhance and improve prompts";
            readonly baseCost: 1;
        };
        readonly "veo3-enhancement": {
            readonly id: "veo3-enhancement";
            readonly name: "VEO3 Prompt Enhancement";
            readonly description: "Advanced prompt enhancement for VEO3";
            readonly baseCost: 2;
        };
    };
};
/**
 * Free balance allocations for different user types
 */
export declare const FREE_BALANCE_BY_USER_TYPE: {
    readonly guest: 50;
    readonly regular: 100;
    readonly demo: 100;
};
export type UserType = keyof typeof FREE_BALANCE_BY_USER_TYPE;
/**
 * Calculate cost for a specific operation
 */
export declare function calculateOperationCost(toolCategory: keyof typeof TOOLS_PRICING, operationType: string, multipliers?: string[]): number;
/**
 * Get all available operations for a tool category
 */
export declare function getToolOperations(toolCategory: keyof typeof TOOLS_PRICING): ToolOperation[];
/**
 * Get human-readable pricing info for UI display
 */
export declare function getToolPricingDisplay(toolCategory: keyof typeof TOOLS_PRICING, operationType: string): {
    baseCost: number;
    description: string;
    multipliers?: Record<string, string>;
};
/**
 * Examples of common operations and their costs
 */
export declare const PRICING_EXAMPLES: {
    readonly "Basic image generation": number;
    readonly "High-quality image": number;
    readonly "Short video (5s)": number;
    readonly "HD video (10s)": number;
    readonly "Script generation": number;
    readonly "Prompt enhancement": number;
};
//# sourceMappingURL=tools-pricing.d.ts.map