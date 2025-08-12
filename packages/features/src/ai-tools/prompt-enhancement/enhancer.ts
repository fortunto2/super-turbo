import { PromptEnhancementParams, EnhancedPrompt, PromptStyle, LanguageSupport } from './types';
import { superDuperAIClient } from '@turbo-super/api';

export class PromptEnhancer {
  private client = superDuperAIClient;

  // Default prompt styles
  private static readonly DEFAULT_STYLES: PromptStyle[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Formal, business-like language with clear structure',
      examples: [
        'A high-quality, professional photograph of a modern office space',
        'A sophisticated, elegant design suitable for corporate use'
      ],
      keywords: ['professional', 'business', 'corporate', 'formal', 'sophisticated']
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Artistic, imaginative language with vivid descriptions',
      examples: [
        'A whimsical, dreamlike scene with vibrant colors and magical elements',
        'An artistic masterpiece with bold brushstrokes and dramatic lighting'
      ],
      keywords: ['creative', 'artistic', 'imaginative', 'vibrant', 'dramatic']
    },
    {
      id: 'technical',
      name: 'Technical',
      description: 'Precise, detailed language with specific parameters',
      examples: [
        'A technical diagram with precise measurements and clear labeling',
        'A schematic illustration with detailed specifications and annotations'
      ],
      keywords: ['technical', 'precise', 'detailed', 'specific', 'accurate']
    },
    {
      id: 'casual',
      name: 'Casual',
      description: 'Relaxed, friendly language with natural expressions',
      examples: [
        'A cozy, relaxed scene that feels warm and inviting',
        'A friendly, approachable design with a welcoming atmosphere'
      ],
      keywords: ['casual', 'friendly', 'relaxed', 'warm', 'inviting']
    }
  ];

  // Supported languages
  private static readonly SUPPORTED_LANGUAGES: LanguageSupport[] = [
    { code: 'en', name: 'English', nativeName: 'English', supported: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', supported: true },
    { code: 'fr', name: 'French', nativeName: 'Français', supported: true },
    { code: 'de', name: 'German', nativeName: 'Deutsch', supported: true },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', supported: true },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', supported: true },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', supported: true },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', supported: true },
    { code: 'ko', name: 'Korean', nativeName: '한국어', supported: true },
    { code: 'zh', name: 'Chinese', nativeName: '中文', supported: true }
  ];

  /**
   * Enhance a prompt using AI
   */
  async enhancePrompt(params: PromptEnhancementParams): Promise<EnhancedPrompt> {
    try {
      // Validate input
      this.validateParams(params);

      // Prepare enhancement request
      const enhancementRequest = {
        prompt: params.prompt,
        style: params.style || 'professional',
        language: params.language || 'en',
        targetModel: params.targetModel || 'image',
        length: params.length || 'medium',
        includeExamples: params.includeExamples || false
      };

      // Make API request to enhance prompt
      const response = await this.client.request<{
        enhancedPrompt: string;
        suggestions: string[];
        confidence: number;
        metadata: any;
      }>({
        method: 'POST',
        url: '/ai/enhance-prompt',
        data: enhancementRequest,
      });

      // Calculate metadata
      const metadata = {
        language: params.language || 'en',
        style: params.style || 'professional',
        length: params.length || 'medium',
        targetModel: params.targetModel || 'image',
        wordCount: this.countWords(response.enhancedPrompt),
        estimatedTokens: this.estimateTokens(response.enhancedPrompt)
      };

      return {
        original: params.prompt,
        enhanced: response.enhancedPrompt,
        suggestions: response.suggestions,
        confidence: response.confidence,
        metadata
      };
    } catch (error) {
      throw new Error(
        `Prompt enhancement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get available prompt styles
   */
  getPromptStyles(): PromptStyle[] {
    return PromptEnhancer.DEFAULT_STYLES;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): LanguageSupport[] {
    return PromptEnhancer.SUPPORTED_LANGUAGES;
  }

  /**
   * Get style by ID
   */
  getStyleById(styleId: string): PromptStyle | undefined {
    return PromptEnhancer.DEFAULT_STYLES.find(style => style.id === styleId);
  }

  /**
   * Get language by code
   */
  getLanguageByCode(code: string): LanguageSupport | undefined {
    return PromptEnhancer.SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  /**
   * Validate enhancement parameters
   */
  private validateParams(params: PromptEnhancementParams): void {
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error('Prompt is required');
    }

    if (params.prompt.length > 1000) {
      throw new Error('Prompt is too long (max 1000 characters)');
    }

    if (params.style && !this.getStyleById(params.style)) {
      throw new Error(`Invalid style: ${params.style}`);
    }

    if (params.language && !this.getLanguageByCode(params.language)) {
      throw new Error(`Unsupported language: ${params.language}`);
    }
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Estimate token count (rough approximation)
   */
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters for English
    return Math.ceil(text.length / 4);
  }
}

// Export default instance
export const promptEnhancer = new PromptEnhancer();
