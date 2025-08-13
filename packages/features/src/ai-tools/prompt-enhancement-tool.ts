import { PromptEnhancer } from './prompt-enhancement/enhancer';

// Create a tool function for prompt enhancement
export const enhancePrompt = (config?: any) => ({
  description: "Enhance and improve prompts for better AI generation results",
  parameters: {
    originalPrompt: { type: "string", description: "The original prompt text to enhance" },
    mediaType: { type: "string", enum: ["image", "video", "text", "general"], optional: true },
    enhancementLevel: { type: "string", enum: ["basic", "detailed", "creative"], optional: true },
    targetAudience: { type: "string", optional: true },
    includeNegativePrompt: { type: "boolean", optional: true },
    modelHint: { type: "string", optional: true }
  },
  execute: async (params: any) => {
    try {
      const enhancer = new PromptEnhancer();
      const result = await enhancer.enhancePrompt(params);
      return result;
    } catch (error) {
      throw new Error(`Prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
});
