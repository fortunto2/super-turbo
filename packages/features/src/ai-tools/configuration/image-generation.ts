import { z } from 'zod';
import { superDuperAIClient } from '@turbo-super/api';
import { AIImageGenerationConfig, MediaOption, ConfigurationResult } from './types';

// Schema for image generation configuration
export const configureImageGenerationSchema = z.object({
  prompt: z.string().optional().describe('Detailed description of the image to generate'),
  sourceImageUrl: z.string().url().optional().describe('Optional source image URL for image-to-image generation'),
  style: z.string().optional().describe('Style of the image (realistic, cinematic, anime, etc.)'),
  resolution: z.string().optional().describe('Image resolution (1920x1080, square, vertical, etc.)'),
  shotSize: z.string().optional().describe('Shot size/camera angle (close-up, medium-shot, etc.)'),
  model: z.string().optional().describe('AI model to use (FLUX, etc.)'),
  seed: z.number().optional().describe('Seed for reproducible results'),
  batchSize: z.number().min(1).max(3).optional().describe('Number of images to generate simultaneously (1-3)'),
});

export type ConfigureImageGenerationParams = z.infer<typeof configureImageGenerationSchema>;

export class ImageGenerationConfigurationTool {
  private client = superDuperAIClient;

  /**
   * Configure image generation settings
   */
  async configureImageGeneration(params: ConfigureImageGenerationParams): Promise<ConfigurationResult> {
    try {
      // Validate input
      const validatedParams = configureImageGenerationSchema.parse(params);

      // If no prompt provided, return configuration panel
      if (!validatedParams.prompt) {
        const config = await this.getImageGenerationConfig();
        return {
          config,
          message: 'Image generation configuration loaded. Please provide a prompt to start generation.',
          suggestions: [
            'Describe the image you want to generate in detail',
            'Choose a style that matches your vision',
            'Select appropriate resolution for your needs',
            'Consider the shot size for composition'
          ],
          nextSteps: [
            'Enter a detailed prompt',
            'Select generation parameters',
            'Click generate to start'
          ]
        };
      }

      // If prompt provided, start generation
      return await this.startImageGeneration(validatedParams);
    } catch (error) {
      throw new Error(
        `Image generation configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get image generation configuration
   */
  async getImageGenerationConfig(): Promise<AIImageGenerationConfig> {
    try {
      const response = await this.client.request<{
        availableModels: any[];
        availableResolutions: any[];
        availableStyles: any[];
        availableShotSizes: any[];
        supportedFormats: string[];
        maxBatchSize: number;
        qualityOptions: any[];
        defaultSettings: any;
      }>({
        method: 'GET',
        url: '/api/config/image-generation',
      });

      return {
        availableModels: this.parseMediaOptions(response.availableModels),
        availableResolutions: this.parseMediaOptions(response.availableResolutions),
        availableStyles: this.parseMediaOptions(response.availableStyles),
        availableShotSizes: this.parseMediaOptions(response.availableShotSizes),
        supportedFormats: response.supportedFormats || ['PNG', 'JPEG', 'WEBP'],
        maxBatchSize: response.maxBatchSize || 3,
        qualityOptions: this.parseMediaOptions(response.qualityOptions),
        defaultSettings: response.defaultSettings || {
          model: 'comfyui/flux',
          resolution: '1024x1024',
          style: 'realistic',
          shotSize: 'medium-shot'
        }
      };
    } catch (error) {
      // Return default configuration if API fails
      return this.getDefaultImageConfig();
    }
  }

  /**
   * Start image generation
   */
  private async startImageGeneration(params: ConfigureImageGenerationParams): Promise<ConfigurationResult> {
    try {
      const generationRequest = {
        prompt: params.prompt,
        sourceImageUrl: params.sourceImageUrl,
        style: params.style || 'realistic',
        resolution: params.resolution || '1024x1024',
        shotSize: params.shotSize || 'medium-shot',
        model: params.model || 'comfyui/flux',
        seed: params.seed,
        batchSize: params.batchSize || 1
      };

      const response = await this.client.request<{
        success: boolean;
        message: string;
        generationId?: string;
      }>({
        method: 'POST',
        url: '/api/generate/image',
        data: generationRequest,
      });

      if (response.success) {
        return {
          config: await this.getImageGenerationConfig(),
          message: response.message || 'Image generation started successfully!',
          suggestions: [
            'Monitor generation progress in real-time',
            'Adjust parameters if needed',
            'Save generated images to your gallery'
          ],
          nextSteps: [
            'Wait for generation to complete',
            'Review and download results',
            'Share or save to gallery'
          ]
        };
      } else {
        throw new Error(response.message || 'Failed to start image generation');
      }
    } catch (error) {
      throw new Error(
        `Failed to start image generation: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse media options from API response
   */
  private parseMediaOptions(options: any[]): MediaOption[] {
    return options.map(option => ({
      id: option.id || option.name || '',
      name: option.name || option.id || '',
      label: option.label || option.name || option.id || '',
      description: option.description || '',
      category: option.category || '',
      tags: option.tags || []
    }));
  }

  /**
   * Get default image generation configuration
   */
  private getDefaultImageConfig(): AIImageGenerationConfig {
    return {
      availableModels: [
        { id: 'comfyui/flux', name: 'FLUX', label: 'FLUX Pro', description: 'High-quality image generation', category: 'pro' },
        { id: 'comfyui/flux-dev', name: 'FLUX Dev', label: 'FLUX Dev', description: 'Development version', category: 'dev' }
      ],
      availableResolutions: [
        { id: '1024x1024', name: '1024x1024', label: 'Square HD', description: 'Standard square format' },
        { id: '1920x1080', name: '1920x1080', label: 'Full HD', description: 'Widescreen format' },
        { id: '1080x1920', name: '1080x1920', label: 'Portrait HD', description: 'Vertical format' }
      ],
      availableStyles: [
        { id: 'realistic', name: 'Realistic', label: 'Realistic', description: 'Photorealistic style' },
        { id: 'cinematic', name: 'Cinematic', label: 'Cinematic', description: 'Movie-like style' },
        { id: 'anime', name: 'Anime', label: 'Anime', description: 'Japanese animation style' }
      ],
      availableShotSizes: [
        { id: 'close-up', name: 'Close-up', label: 'Close-up', description: 'Tight framing' },
        { id: 'medium-shot', name: 'Medium Shot', label: 'Medium Shot', description: 'Balanced framing' },
        { id: 'long-shot', name: 'Long Shot', label: 'Long Shot', description: 'Wide framing' }
      ],
      supportedFormats: ['PNG', 'JPEG', 'WEBP'],
      maxBatchSize: 3,
      qualityOptions: [
        { id: 'standard', name: 'Standard', label: 'Standard', description: 'Good quality, fast generation' },
        { id: 'high', name: 'High', label: 'High', description: 'Better quality, slower generation' }
      ],
      defaultSettings: {
        model: 'comfyui/flux',
        resolution: '1024x1024',
        style: 'realistic',
        shotSize: 'medium-shot'
      }
    };
  }
}

// Export default instance
export const imageGenerationConfigurationTool = new ImageGenerationConfigurationTool();
