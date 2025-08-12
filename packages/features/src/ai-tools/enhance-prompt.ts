import { z } from 'zod';
import { superDuperAIClient } from '@turbo-super/api';

// Schema for prompt enhancement
export const enhancePromptSchema = z.object({
  originalPrompt: z.string().describe('The original prompt text that needs enhancement. Can be in any language, simple or complex.'),
  mediaType: z.enum(['image', 'video', 'text', 'general']).optional().describe('The type of content being generated. Helps optimize the prompt for specific AI models.'),
  enhancementLevel: z.enum(['basic', 'detailed', 'creative']).optional().describe('Level of enhancement: basic (translation + cleanup), detailed (add structure + quality terms), creative (add artistic style + composition details)'),
  targetAudience: z.string().optional().describe('Target audience or use case (e.g., "professional presentation", "social media", "artistic portfolio")'),
  includeNegativePrompt: z.boolean().optional().describe('Whether to generate a negative prompt for what to avoid (useful for image/video generation)'),
  modelHint: z.string().optional().describe('Specific AI model being used (e.g., "FLUX", "Sora", "VEO2") to optimize prompt for that model'),
});

export type EnhancePromptParams = z.infer<typeof enhancePromptSchema>;

export interface EnhancedPromptResult {
  originalPrompt: string;
  enhancedPrompt: string;
  negativePrompt?: string;
  mediaType: string;
  enhancementLevel: string;
  modelHint?: string;
  improvements: string[];
  reasoning: string;
  usage: {
    copyPrompt: string;
    negativePrompt?: string;
  };
}

export class PromptEnhancementTool {
  private client = superDuperAIClient;

  /**
   * Enhance a prompt using AI
   */
  async enhancePrompt(params: EnhancePromptParams): Promise<EnhancedPromptResult> {
    try {
      // Validate input
      const validatedParams = enhancePromptSchema.parse(params);

      // Prepare enhancement request
      const enhancementRequest = {
        originalPrompt: validatedParams.originalPrompt,
        mediaType: validatedParams.mediaType || 'general',
        enhancementLevel: validatedParams.enhancementLevel || 'detailed',
        targetAudience: validatedParams.targetAudience,
        includeNegativePrompt: validatedParams.includeNegativePrompt || false,
        modelHint: validatedParams.modelHint
      };

      // Make API request to enhance prompt
      const response = await this.client.request<{
        enhancedPrompt: string;
        negativePrompt?: string;
        improvements: string[];
        reasoning: string;
      }>({
        method: 'POST',
        url: '/ai/enhance-prompt',
        data: enhancementRequest,
      });

      return {
        originalPrompt: validatedParams.originalPrompt,
        enhancedPrompt: response.enhancedPrompt,
        negativePrompt: response.negativePrompt,
        mediaType: validatedParams.mediaType || 'general',
        enhancementLevel: validatedParams.enhancementLevel || 'detailed',
        modelHint: validatedParams.modelHint,
        improvements: response.improvements || [],
        reasoning: response.reasoning || '',
        usage: {
          copyPrompt: 'Copy the enhanced prompt to use in image/video generation tools',
          negativePrompt: response.negativePrompt ? 'Use the negative prompt to avoid unwanted elements' : undefined
        }
      };
    } catch (error) {
      throw new Error(
        `Prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build system prompt for enhancement
   */
  private buildSystemPrompt(mediaType: string, enhancementLevel: string, modelHint?: string): string {
    const basePrompt = `You are a professional prompt engineering expert specializing in improving prompts for AI generation. Your task is to enhance user prompts to achieve the best possible results.

CORE RESPONSIBILITIES:
1. Translate non-English text to English while preserving meaning and intent
2. Apply prompt engineering best practices (specificity, clarity, quality keywords)
3. Optimize for the target media type and AI model
4. Structure prompts for maximum effectiveness

ENHANCEMENT PRINCIPLES:
- Keep the original creative intent intact
- Add relevant technical terms and quality descriptors
- Optimize for the specific AI model if provided
- Consider the target media type requirements
- Maintain natural, readable language`;

    const mediaSpecific = this.getMediaSpecificInstructions(mediaType);
    const levelSpecific = this.getLevelSpecificInstructions(enhancementLevel);
    const modelSpecific = modelHint ? this.getModelSpecificInstructions(modelHint) : '';

    return `${basePrompt}

${mediaSpecific}

${levelSpecific}

${modelSpecific}

RESPONSE FORMAT:
Return a JSON object with:
- enhancedPrompt: The improved prompt
- negativePrompt: What to avoid (if requested)
- improvements: List of specific improvements made
- reasoning: Brief explanation of changes`;
  }

  /**
   * Get media-specific enhancement instructions
   */
  private getMediaSpecificInstructions(mediaType: string): string {
    switch (mediaType) {
      case 'image':
        return `IMAGE GENERATION OPTIMIZATION:
- Add visual descriptors (lighting, composition, style, mood)
- Include technical parameters (resolution, aspect ratio, quality)
- Specify artistic style and technique
- Add environmental and atmospheric details`;
      case 'video':
        return `VIDEO GENERATION OPTIMIZATION:
- Include motion and temporal elements
- Specify camera angles and movement
- Add scene composition and pacing
- Include audio and visual effects considerations`;
      case 'text':
        return `TEXT GENERATION OPTIMIZATION:
- Add structure and organization elements
- Specify tone, style, and voice
- Include context and audience considerations
- Add formatting and presentation details`;
      default:
        return `GENERAL OPTIMIZATION:
- Focus on clarity and specificity
- Add relevant context and details
- Optimize for general AI model understanding`;
    }
  }

  /**
   * Get level-specific enhancement instructions
   */
  private getLevelSpecificInstructions(level: string): string {
    switch (level) {
      case 'basic':
        return `BASIC ENHANCEMENT:
- Translate to English if needed
- Clean up grammar and spelling
- Add basic quality descriptors
- Maintain simplicity and clarity`;
      case 'detailed':
        return `DETAILED ENHANCEMENT:
- Add comprehensive visual/contextual details
- Include technical specifications
- Optimize for professional results
- Balance detail with readability`;
      case 'creative':
        return `CREATIVE ENHANCEMENT:
- Add artistic and stylistic elements
- Include mood and atmosphere details
- Enhance creative expression
- Add inspirational and evocative language`;
      default:
        return `STANDARD ENHANCEMENT:
- Apply balanced improvements
- Focus on clarity and effectiveness
- Maintain original intent`;
    }
  }

  /**
   * Get model-specific optimization instructions
   */
  private getModelSpecificInstructions(model: string): string {
    const modelLower = model.toLowerCase();
    
    if (modelLower.includes('flux')) {
      return `FLUX MODEL OPTIMIZATION:
- Focus on artistic and creative elements
- Include style and technique specifications
- Optimize for visual quality and composition
- Add relevant artistic terminology`;
    } else if (modelLower.includes('veo') || modelLower.includes('sora')) {
      return `VIDEO MODEL OPTIMIZATION:
- Emphasize motion and temporal elements
- Include scene composition details
- Add camera and cinematography elements
- Specify visual effects and transitions`;
    } else if (modelLower.includes('dalle') || modelLower.includes('midjourney')) {
      return `IMAGE MODEL OPTIMIZATION:
- Focus on visual composition and style
- Include artistic and technical details
- Add quality and resolution specifications
- Optimize for visual impact`;
    }
    
    return `GENERAL MODEL OPTIMIZATION:
- Apply standard prompt engineering practices
- Focus on clarity and specificity
- Optimize for general AI understanding`;
  }
}

// Export default instance
export const promptEnhancementTool = new PromptEnhancementTool();
