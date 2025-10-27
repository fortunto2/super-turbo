import { tool } from 'ai';
import { z } from 'zod';
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from '@/lib/utils/ai-tools-balance';
import type { Session } from 'next-auth';
import { analyzeVideoContext } from '@/lib/ai/context';
import {
  generateVertexVideo,
  checkVertexVideoStatus,
  type VertexVideoRequest,
} from '@/lib/ai/vertex-video-generation';

interface CreateVideoDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceVideoUrl?: string;
  defaultSourceImageUrl?: string;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

export const falVideoGenerationForChat = (params?: CreateVideoDocumentParams) =>
  tool({
    description:
      'Generate videos using Google Vertex AI VEO 3.1. Supports text-to-video generation with high quality output.',
    inputSchema: z.object({
      prompt: z
        .string()
        .min(1)
        .describe('Detailed description of the video to generate'),
      model: z
        .enum(['veo3'])
        .optional()
        .default('veo3')
        .describe('AI model to use: veo3 (Google VEO 3.1 - latest)'),
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
      negativePrompt: z
        .string()
        .optional()
        .describe('What to avoid in the video'),
    }),
    execute: async ({
      prompt,
      model,
      duration,
      resolution,
      aspectRatio,
      negativePrompt,
    }) => {
      console.log('🎬 falVideoGenerationForChat called with:', {
        prompt,
        model,
        duration,
        resolution,
        aspectRatio,
        negativePrompt,
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
              id: 'veo3',
              label: 'Vertex AI VEO3',
              description: 'Google VEO 3.1 (Latest)',
              badge: 'Best',
            },
          ],
          model: 'veo3',
          provider: 'vertex-ai',
          capabilities: [
            'Text-to-video generation',
            'Google VEO 3.1 model',
            'Negative prompts',
            'High quality output',
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

        // Check session
        if (!params?.session) {
          throw new Error('Session required for Vertex AI video generation');
        }

        // Use Vertex AI VEO3
        const selectedModel = model || 'veo3';
        const durationValue = duration || '8';

        console.log('🎬 Using model: VEO3 (Vertex AI VEO 3.1)');

        // Prepare request for Vertex AI
        const vertexRequest: VertexVideoRequest = {
          prompt,
          duration: durationValue as '4' | '6' | '8',
          aspectRatio: aspectRatio || '16:9',
          resolution: resolution || '720p',
          ...(negativePrompt && { negativePrompt }),
          // Add source image URL for image-to-video transformation (from context analysis)
          ...(normalizedSourceUrl && { sourceImageUrl: normalizedSourceUrl }),
          model: 'veo3',
        };

        console.log('🚀 Calling Vertex AI directly...');

        // Call Vertex AI video generation
        const result = await generateVertexVideo(vertexRequest, params.session);

        if (!result.success) {
          throw new Error(result.error || 'Vertex AI generation failed');
        }

        console.log('✅ Video generation started:', result);

        // Poll for completion (max 180 seconds = 3 minutes)
        let videoUrl: string | undefined;
        const fileId = result.fileId || `video-${Date.now()}`;

        if (result.status === 'processing' && result.operationName) {
          console.log('⏳ Video is processing, polling for completion...');

          const maxAttempts = 36; // 36 * 5s = 180s (3 minutes)
          const pollInterval = 5000; // 5 seconds
          const operationName = result.operationName;

          for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            console.log(`🔄 Polling attempt ${attempt}/${maxAttempts}...`);

            await new Promise((resolve) => setTimeout(resolve, pollInterval));

            const status = await checkVertexVideoStatus(operationName);
            console.log(`📊 Status check result:`, status);

            if (status.status === 'completed' && status.videoUrl) {
              console.log('✅ Video ready!', status.videoUrl);
              // Use proxy URL for Vertex AI videos to handle authentication
              videoUrl = `/api/video/proxy-vertex?url=${encodeURIComponent(status.videoUrl)}`;
              console.log('🔄 Using proxy URL:', videoUrl);
              break;
            }

            if (status.status === 'failed') {
              throw new Error(status.error || 'Video generation failed');
            }
          }

          if (!videoUrl) {
            throw new Error(
              'Video generation timeout. Please try again later.',
            );
          }
        } else if (result.videoUrl) {
          videoUrl = result.videoUrl;
        }

        if (!videoUrl) {
          throw new Error('No video URL returned from Vertex AI');
        }

        console.log('🎬 ✅ VIDEO GENERATED:', {
          fileId,
          videoUrl,
          duration: durationValue,
          resolution,
          model: selectedModel,
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
            provider: result.provider || 'vertex-ai',
            model: result.model || 'veo-3.1',
            settings: {
              duration: Number(durationValue),
              aspectRatio: aspectRatio || '16:9',
              resolution: resolution || '720p',
              ...(negativePrompt && { negativePrompt }),
            },
          },
          creditsUsed: result.creditsUsed || balanceCheck.cost,
          provider: result.provider || 'vertex-ai',
          model: result.model || 'veo-3.1',
          message: `Video generated successfully using Vertex AI VEO 3.1: "${prompt}". Duration: ${durationValue}s, Resolution: ${resolution}, Aspect Ratio: ${aspectRatio}.`,
        };
      } catch (error: any) {
        console.error('🎬 ❌ ERROR IN VIDEO GENERATION:', error);

        // Extract detailed error message
        let errorMessage = 'Unknown generation error';
        if (error) {
          errorMessage = error.message || String(error);
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
