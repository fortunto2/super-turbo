import { tool } from 'ai';
import { z } from 'zod';
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from '@/lib/utils/ai-tools-balance';
import type { Session } from 'next-auth';
import { analyzeVideoContext } from '@/lib/ai/context';
import { fal } from '@fal-ai/client';

interface CreateVideoDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceVideoUrl?: string;
  defaultSourceImageUrl?: string;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

// Video model types
type VideoModel = 'fal-veo3' | 'vertex-veo3' | 'vertex-veo2';

// Configure Fal.ai client with API key
function configureFalClient() {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error('FAL_KEY environment variable is not configured');
  }
  fal.config({ credentials: falKey });
}

export const falVideoGenerationForChat = (params?: CreateVideoDocumentParams) =>
  tool({
    description:
      'Generate videos using AI models (VEO3 by default). Supports text-to-video generation with multiple providers: Fal.ai VEO3 (recommended), Vertex AI VEO3, and Vertex AI VEO2.',
    inputSchema: z.object({
      prompt: z
        .string()
        .describe('Detailed description of the video to generate'),
      model: z
        .enum(['fal-veo3', 'vertex-veo3', 'vertex-veo2'])
        .optional()
        .default('fal-veo3')
        .describe(
          'AI model to use: fal-veo3 (default, recommended), vertex-veo3 (requires special access), vertex-veo2 (older version)',
        ),
      duration: z
        .enum(['4', '6', '8'])
        .optional()
        .default('8')
        .describe(
          'Video duration in seconds: must be exactly 4, 6, or 8 seconds',
        ),
      resolution: z
        .enum(['720p', '1080p'])
        .optional()
        .default('720p')
        .describe('Video resolution'),
      aspectRatio: z
        .enum(['16:9', '9:16', '1:1'])
        .optional()
        .default('16:9')
        .describe('Aspect ratio'),
      generateAudio: z
        .boolean()
        .optional()
        .default(true)
        .describe('Generate audio for the video'),
      enhancePrompt: z
        .boolean()
        .optional()
        .default(true)
        .describe('AI-enhance the prompt'),
      negativePrompt: z
        .string()
        .optional()
        .describe('What to avoid in the video'),
      seed: z.number().optional().describe('Seed for reproducible results'),
    }),
    execute: async ({
      prompt,
      model,
      duration,
      resolution,
      aspectRatio,
      generateAudio,
      enhancePrompt,
      negativePrompt,
      seed,
    }) => {
      console.log('🎬 falVideoGenerationForChat called with:', {
        prompt,
        model,
        duration,
        resolution,
        aspectRatio,
        generateAudio,
      });

      if (!prompt) {
        console.log('🎬 No prompt provided, returning configuration panel');
        return {
          availableDurations: [
            { id: 4, label: '4 seconds', description: 'Quick clip' },
            { id: 6, label: '6 seconds', description: 'Medium clip' },
            {
              id: 8,
              label: '8 seconds',
              description: 'Standard duration (recommended)',
            },
          ],
          availableResolutions: [
            { id: '720p', label: '720p', description: 'HD (faster, cheaper)' },
            {
              id: '1080p',
              label: '1080p',
              description: 'Full HD (better quality)',
            },
          ],
          availableAspectRatios: [
            {
              id: '16:9',
              label: 'Landscape (16:9)',
              description: 'Widescreen, YouTube',
            },
            {
              id: '9:16',
              label: 'Portrait (9:16)',
              description: 'Stories, Reels',
            },
            { id: '1:1', label: 'Square (1:1)', description: 'Instagram' },
          ],
          availableModels: [
            {
              id: 'fal-veo3',
              label: 'Fal.ai Veo 3',
              description: 'Google Veo 3 via Fal.ai (Recommended)',
              badge: 'Best',
            },
            {
              id: 'vertex-veo3',
              label: 'Vertex AI Veo 3',
              description: 'Direct Google Veo 3.1 (Requires special access)',
              badge: 'Direct',
            },
            {
              id: 'vertex-veo2',
              label: 'Vertex AI Veo 2',
              description: 'Google Veo 2 (Older version)',
            },
          ],
          model: 'fal-veo3',
          provider: 'fal.ai',
          capabilities: [
            'Text-to-video generation',
            'Multiple AI models',
            'Audio generation',
            'Prompt enhancement',
            'Negative prompts',
          ],
        };
      }

      console.log('🎬 ✅ PROMPT PROVIDED, CREATING VIDEO:', prompt);

      try {
        // Analyze video context
        let normalizedSourceUrl: string | undefined;

        if (params?.chatId && params?.userMessage) {
          try {
            console.log('🔍 Analyzing video context...');
            const contextResult = await analyzeVideoContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments,
              params.session?.user?.id,
            );

            if (contextResult.sourceUrl && contextResult.confidence !== 'low') {
              console.log(
                '🔍 Using sourceUrl from context analysis:',
                contextResult.sourceUrl,
              );
              normalizedSourceUrl = contextResult.sourceUrl;
            }
          } catch (error) {
            console.warn('🔍 Error in context analysis, falling back:', error);
          }
        }

        // Determine operation type
        const operationType = normalizedSourceUrl
          ? 'image-to-video'
          : 'text-to-video';

        // Check balance
        const multipliers: string[] = [];
        const durationSeconds = Number(duration || '8');
        if (durationSeconds <= 5) multipliers.push('duration-5s');
        else if (durationSeconds <= 10) multipliers.push('duration-10s');
        else if (durationSeconds <= 15) multipliers.push('duration-15s');

        if (resolution === '1080p') {
          multipliers.push('hd-quality');
        }

        const balanceCheck = await checkBalanceBeforeArtifact(
          params?.session || null,
          'video-generation',
          operationType,
          multipliers,
          getOperationDisplayName(operationType),
        );

        if (!balanceCheck.valid) {
          console.log('🎬 ❌ INSUFFICIENT BALANCE, NOT CREATING ARTIFACT');
          return {
            error:
              balanceCheck.userMessage ||
              'Insufficient funds for video generation',
            balanceError: true,
            requiredCredits: balanceCheck.cost,
          };
        }

        // Use the selected model (default: fal-veo3)
        const selectedModel = model || 'fal-veo3';
        const durationValue = durationSeconds;

        console.log('🎬 Using model:', selectedModel);

        // For now, only support Fal.ai VEO3 (default and recommended)
        // Vertex AI models require different API structure and will be added later
        if (selectedModel !== 'fal-veo3') {
          console.warn(
            `⚠️ Model ${selectedModel} not yet supported in chat, using fal-veo3 instead`,
          );
        }

        // Configure Fal.ai client
        configureFalClient();

        // Prepare duration format for Fal.ai (requires 's' suffix)
        const durationFormatted = `${durationValue}s`;

        // Call Fal.ai Veo3 API directly
        console.log('🚀 Calling Fal.ai Veo3 API...');
        const result = await fal.subscribe('fal-ai/veo3', {
          input: {
            prompt,
            aspect_ratio: (aspectRatio || '16:9') as '16:9' | '9:16' | '1:1',
            duration: durationFormatted as '4s' | '6s' | '8s',
            resolution: (resolution || '720p') as '720p' | '1080p',
            generate_audio: generateAudio ?? true,
            enhance_prompt: enhancePrompt ?? true,
            ...(negativePrompt && { negative_prompt: negativePrompt }),
            ...(seed && { seed }),
          },
          logs: true,
          onQueueUpdate: (update) => {
            console.log('📊 Queue update:', update);
          },
        });

        console.log('✅ Video generation result:', result);

        // Extract video URL from response
        const videoUrl = result.data?.video?.url;
        if (!videoUrl) {
          throw new Error('No video URL in response');
        }

        // Generate unique file ID
        const fileId = `fal-video-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        console.log('🎬 ✅ VIDEO GENERATED:', {
          fileId,
          videoUrl,
          duration: durationFormatted,
          resolution,
        });

        // Return artifact-compatible structure
        return {
          success: true,
          id: fileId, // Required for artifact system
          kind: 'video', // Required for artifact system
          title: `Video: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
          content: videoUrl, // Video URL as content
          fileId,
          videoUrl,
          data: {
            id: fileId,
            url: videoUrl,
            prompt,
            timestamp: Date.now(),
            provider: 'fal.ai',
            model: 'veo3',
            settings: {
              duration: durationValue,
              aspectRatio: aspectRatio || '16:9',
              resolution: resolution || '720p',
              generateAudio: generateAudio ?? true,
              ...(seed && { seed }),
            },
          },
          creditsUsed: balanceCheck.cost,
          provider: 'fal.ai',
          model: 'veo3',
          message: `Video generated successfully using FAL AI VEO3: "${prompt}". Duration: ${durationValue}s, Resolution: ${resolution}, Aspect Ratio: ${aspectRatio}.`,
        };
      } catch (error: any) {
        console.error('🎬 ❌ ERROR IN VIDEO GENERATION:', error);

        // Extract detailed error message from Fal.ai validation errors
        let errorMessage = 'Unknown generation error';
        if (error instanceof Error) {
          errorMessage = error.message;
          // Check if there's a body with validation details
          if (error.body && typeof error.body === 'object') {
            console.error('🎬 ❌ Error body:', error.body);
            if (error.body.detail) {
              errorMessage = `Validation error: ${JSON.stringify(error.body.detail)}`;
            }
          }
        }

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
  });
