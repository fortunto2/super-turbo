import { tool } from 'ai';
import { z } from 'zod';
import {
  createVeo3Video,
  generateVeo3Ideas,
} from '@/lib/ai/veo3-api';

export const createVeo3VideoTool = tool({
  description: 'Creates video using VEO3 (Google Video Generation) via Fal.ai',
  inputSchema: z.object({
    prompt: z.string().describe('Video description for generation'),
    duration: z
      .enum(['4s', '6s', '8s'])
      .optional()
      .describe('Video duration (4s, 6s, or 8s)'),
    resolution: z
      .enum(['720p', '1080p'])
      .optional()
      .describe('Video resolution'),
    aspectRatio: z
      .enum(['16:9', '9:16', '1:1'])
      .optional()
      .describe('Aspect ratio'),
    generateAudio: z
      .boolean()
      .optional()
      .describe('Generate audio for the video'),
    enhancePrompt: z
      .boolean()
      .optional()
      .describe('AI-enhance the prompt'),
    negativePrompt: z
      .string()
      .optional()
      .describe('What to avoid in the video'),
    seed: z
      .number()
      .optional()
      .describe('Seed for reproducible results'),
  }),
  execute: async ({
    prompt,
    duration,
    resolution,
    aspectRatio,
    generateAudio,
    enhancePrompt,
    negativePrompt,
    seed,
  }) => {
    try {
      console.log('🎬 Creating VEO3 video:', {
        prompt,
        duration,
        resolution,
      });

      const result = await createVeo3Video({
        prompt,
        ...(duration && { duration }),
        ...(resolution && { resolution }),
        ...(aspectRatio && { aspectRatio }),
        ...(generateAudio !== undefined && { generateAudio }),
        ...(enhancePrompt !== undefined && { enhancePrompt }),
        ...(negativePrompt && { negativePrompt }),
        ...(seed !== undefined && { seed }),
      });

      if (result.status === 'failed') {
        return {
          success: false,
          error: result.error,
          videoId: result.id,
        };
      }

      return {
        success: true,
        videoId: result.id,
        status: result.status,
        videoUrl: result.videoUrl,
        prompt: result.prompt,
        duration: result.duration,
        resolution: result.resolution,
        createdAt: result.createdAt,
        message:
          result.status === 'completed'
            ? `Video generated successfully! URL: ${result.videoUrl}`
            : 'Video generation failed',
      };
    } catch (error) {
      console.error('🎬 VEO3 video creation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});

export const generateVeo3IdeasTool = tool({
  description: 'Generates video ideas for VEO3 based on a prompt',
  inputSchema: z.object({
    prompt: z.string().describe('Base prompt for generating video ideas'),
  }),
  execute: async ({ prompt }) => {
    try {
      console.log('🎬 Generating VEO3 video ideas:', { prompt });

      const ideas = generateVeo3Ideas(prompt);

      return {
        success: true,
        originalPrompt: prompt,
        ideas,
        totalIdeas: ideas.length,
        suggestions: [
          'Try different durations: 4s, 6s, or 8s',
          'Experiment with aspect ratios: 16:9, 9:16, 1:1',
          'Use different resolutions: 720p or 1080p',
          'Enable audio generation for more immersive videos',
          'Use negative prompts to avoid unwanted elements',
        ],
      };
    } catch (error) {
      console.error('🎬 VEO3 ideas generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
});
