import { 
  ScriptGenerationParams, 
  GeneratedScript, 
  ScriptOutline, 
  ScriptMetadata,
  ScriptTemplate 
} from './types';
import { superDuperAIClient } from '@turbo-super/api';

export class ScriptGenerator {
  private client = superDuperAIClient;

  // Default script templates
  private static readonly DEFAULT_TEMPLATES: ScriptTemplate[] = [
    {
      id: 'educational',
      name: 'Educational Script',
      description: 'Structured format for educational content',
      structure: ['Introduction', 'Main Content', 'Examples', 'Summary', 'Quiz/Questions'],
      examples: ['Science lesson', 'History documentary', 'Tutorial video'],
      genre: ['educational', 'documentary'],
      suitableFor: ['children', 'teens', 'adults']
    },
    {
      id: 'storytelling',
      name: 'Storytelling Script',
      description: 'Narrative format for engaging stories',
      structure: ['Hook', 'Setup', 'Conflict', 'Rising Action', 'Climax', 'Resolution'],
      examples: ['Fairy tale', 'Adventure story', 'Mystery tale'],
      genre: ['drama', 'adventure', 'mystery'],
      suitableFor: ['children', 'teens', 'adults']
    },
    {
      id: 'commercial',
      name: 'Commercial Script',
      description: 'Persuasive format for marketing content',
      structure: ['Attention', 'Interest', 'Desire', 'Action'],
      examples: ['Product advertisement', 'Service promotion', 'Brand story'],
      genre: ['commercial', 'marketing'],
      suitableFor: ['teens', 'adults']
    }
  ];

  /**
   * Generate a script using AI
   */
  async generateScript(params: ScriptGenerationParams): Promise<GeneratedScript> {
    try {
      // Validate input
      this.validateParams(params);

      // Prepare generation request
      const generationRequest = {
        topic: params.topic,
        genre: params.genre || 'educational',
        length: params.length || 'medium',
        format: params.format || 'markdown',
        targetAudience: params.targetAudience || 'general',
        tone: params.tone || 'informative',
        includeDialogue: params.includeDialogue || false,
        includeStageDirections: params.includeStageDirections || false
      };

      // Make API request to generate script
      const response = await this.client.request<{
        script: string;
        outline: any[];
        metadata: any;
      }>({
        method: 'POST',
        url: '/ai/generate-script',
        data: generationRequest,
      });

      // Generate unique ID
      const id = this.generateId();

      // Create script object
      const generatedScript: GeneratedScript = {
        id,
        topic: params.topic,
        script: response.script,
        outline: this.parseOutline(response.outline),
        metadata: this.parseMetadata(response.metadata, params),
        createdAt: new Date().toISOString(),
        status: 'draft'
      };

      return generatedScript;
    } catch (error) {
      throw new Error(
        `Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get available script templates
   */
  getScriptTemplates(): ScriptTemplate[] {
    return ScriptGenerator.DEFAULT_TEMPLATES;
  }

  /**
   * Get template by ID
   */
  getTemplateById(templateId: string): ScriptTemplate | undefined {
    return ScriptGenerator.DEFAULT_TEMPLATES.find(template => template.id === templateId);
  }

  /**
   * Get templates by genre
   */
  getTemplatesByGenre(genre: string): ScriptTemplate[] {
    return ScriptGenerator.DEFAULT_TEMPLATES.filter(template => 
      template.genre.includes(genre)
    );
  }

  /**
   * Get templates suitable for target audience
   */
  getTemplatesByAudience(audience: string): ScriptTemplate[] {
    return ScriptGenerator.DEFAULT_TEMPLATES.filter(template => 
      template.suitableFor.includes(audience)
    );
  }

  /**
   * Validate generation parameters
   */
  private validateParams(params: ScriptGenerationParams): void {
    if (!params.topic || params.topic.trim().length === 0) {
      throw new Error('Topic is required');
    }

    if (params.topic.length > 500) {
      throw new Error('Topic is too long (max 500 characters)');
    }

    if (params.genre && !this.isValidGenre(params.genre)) {
      throw new Error(`Invalid genre: ${params.genre}`);
    }

    if (params.length && !this.isValidLength(params.length)) {
      throw new Error(`Invalid length: ${params.length}`);
    }

    if (params.format && !this.isValidFormat(params.format)) {
      throw new Error(`Invalid format: ${params.format}`);
    }
  }

  /**
   * Check if genre is valid
   */
  private isValidGenre(genre: string): boolean {
    const validGenres = ['drama', 'comedy', 'action', 'romance', 'thriller', 'documentary', 'educational'];
    return validGenres.includes(genre);
  }

  /**
   * Check if length is valid
   */
  private isValidLength(length: string): boolean {
    const validLengths = ['short', 'medium', 'long'];
    return validLengths.includes(length);
  }

  /**
   * Check if format is valid
   */
  private isValidFormat(format: string): boolean {
    const validFormats = ['markdown', 'plain', 'structured', 'screenplay'];
    return validFormats.includes(format);
  }

  /**
   * Parse outline from API response
   */
  private parseOutline(outlineData: any[]): ScriptOutline[] {
    return outlineData.map((item, index) => ({
      section: item.section || `Section ${index + 1}`,
      title: item.title || `Title ${index + 1}`,
      description: item.description || '',
      duration: item.duration,
      keyPoints: Array.isArray(item.keyPoints) ? item.keyPoints : []
    }));
  }

  /**
   * Parse metadata from API response and params
   */
  private parseMetadata(metadataData: any, params: ScriptGenerationParams): ScriptMetadata {
    return {
      genre: params.genre || 'educational',
      estimatedDuration: metadataData.estimatedDuration || '5-10 minutes',
      scenes: metadataData.scenes || 3,
      characters: metadataData.characters || 2,
      wordCount: this.countWords(metadataData.script || ''),
      targetAudience: params.targetAudience || 'general',
      tone: params.tone || 'informative',
      format: params.format || 'markdown',
      language: 'en'
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
}

// Export default instance
export const scriptGenerator = new ScriptGenerator();
