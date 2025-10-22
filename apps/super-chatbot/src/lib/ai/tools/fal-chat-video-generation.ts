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

// Configure Fal.ai client with API key
function configureFalClient() {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error('FAL_KEY environment variable is not configured');
  }
  fal.config({ credentials: falKey });
}

export const falVideoGenerationForChat = (
  params?: CreateVideoDocumentParams,
) =>
  tool({
    description:
      'Generate videos using FAL AI VEO3 model. Supports text-to-video generation with advanced AI capabilities.',
    inputSchema: z.object({
      prompt: z
        .string()
        .describe('Detailed description of the video to generate'),
      duration: z
        .enum(['4s', '6s', '8s'])
        .optional()
        .default('8s')
        .describe('Video duration (4s, 6s, or 8s)'),
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
      console.log('🎬 falVideoGenerationForChat called with:', {
        prompt,
        duration,
        resolution,
        aspectRatio,
        generateAudio,
      });

      if (!prompt) {
        console.log('🎬 No prompt provided, returning configuration panel');
        return {
          availableDurations: ['4s', '6s', '8s'],
          availableResolutions: ['720p', '1080p'],
          availableAspectRatios: ['16:9', '9:16', '1:1'],
          model: 'fal-ai/veo3',
          provider: 'fal-ai',
          capabilities: [
            'Text-to-video generation',
            'Audio generation',
            'Prompt enhancement',
            'Negative prompts',
          ],
        };
      }

      console.log('🎬 ✅ PROMPT PROVIDED, CREATING FAL VIDEO:', prompt);

      if (!params?.createDocument) {
        console.log(
          '🎬 ❌ createDocument not available, returning basic config',
        );
        return {
          error: 'Video creation not available in this context',
        };
      }

      try {
        // Analyze video context
        let normalizedSourceUrl: string | undefined;

        if (params?.chatId && params?.userMessage) {
          try {
            console.log('🔍 Analyzing video context for FAL AI...');
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
        const durationSeconds = Number.parseInt(duration || '8s');
        if (durationSeconds <= 5) multipliers.push('duration-5s');
        else if (durationSeconds <= 10) multipliers.push('duration-10s');
        else if (durationSeconds <= 15) multipliers.push('duration-15s');

        if (resolution === '1080p') {
          multipliers.push('hd-quality');
        }

        const balanceCheck = await checkBalanceBeforeArtifact(
          params.session || null,
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

        // Configure Fal.ai client
        configureFalClient();

        // Call Fal.ai Veo3 API
        console.log('🚀 Calling Fal.ai Veo3 API...');
        const result = await fal.subscribe('fal-ai/veo3', {
          input: {
            prompt,
            aspect_ratio: aspectRatio,
            duration,
            resolution,
            generate_audio: generateAudio,
            enhance_prompt: enhancePrompt,
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

        console.log('🎬 ✅ FAL VIDEO GENERATED:', {
          fileId,
          videoUrl,
          duration,
          resolution,
        });

        return {
          success: true,
          fileId,
          videoUrl,
          data: {
            id: fileId,
            url: videoUrl,
            prompt,
            timestamp: Date.now(),
            settings: {
              duration: durationSeconds,
              aspectRatio,
              resolution,
              generateAudio,
            },
          },
          creditsUsed: balanceCheck.cost,
          provider: 'fal.ai',
          model: 'veo3',
          message: `Video generated successfully using FAL AI VEO3: "${prompt}". Duration: ${duration}, Resolution: ${resolution}, Aspect Ratio: ${aspectRatio}.`,
        };
      } catch (error: any) {
        console.error('🎬 ❌ ERROR IN FAL VIDEO GENERATION:', error);
        throw error;
      }
    },
  });
