import { tool } from 'ai';
import { z } from 'zod';
import type { MediaOption } from '@/lib/types/media-settings';
import {
  checkBalanceBeforeArtifact,
  getOperationDisplayName,
} from '@/lib/utils/ai-tools-balance';
import type { Session } from 'next-auth';
import { analyzeVideoContext } from '@/lib/ai/context';

interface CreateVideoDocumentParams {
  createDocument: any;
  session?: Session | null;
  defaultSourceVideoUrl?: string | undefined;
  defaultSourceImageUrl?: string | undefined;
  chatId?: string;
  userMessage?: string;
  currentAttachments?: any[];
}

export const configureVideoGeneration = (params?: CreateVideoDocumentParams) =>
  tool({
    description:
      'Configure video generation settings or generate a video directly if prompt is provided. Supports text-to-video by default, video-to-video when a video sourceVideoUrl is provided, and image-to-video when an image sourceVideoUrl is provided. When triggered, creates a video artifact that shows generation progress in real-time.',
    inputSchema: z.object({
      prompt: z
        .string()
        .optional()
        .describe(
          'Detailed description of the video to generate. If provided, will immediately create video artifact and start generation',
        ),
      sourceVideoUrl: z
        .string()
        .url()
        .optional()
        .describe(
          'Optional source URL for video generation. Can be a video URL for video-to-video generation, or an image URL for image-to-video generation (e.g., when the user uploaded media in chat). If provided, the system will run the appropriate generation type.',
        ),
      style: z
        .string()
        .optional()
        .describe(
          'Style of the video. Supports many formats: "realistic", "cinematic", "anime", "cartoon", "documentary", "vlog", "tutorial", "promotional", "artistic", "minimalist", "abstract", and many more available styles',
        ),
      resolution: z
        .string()
        .optional()
        .describe(
          'Video resolution. Accepts various formats: "1920x1080", "1920×1080", "1920 x 1080", "full hd", "fhd", "1080p", "4k", "square", "vertical", "horizontal", etc.',
        ),
      duration: z
        .string()
        .optional()
        .describe(
          'Video duration. Accepts: "5s", "10s", "30s", "1m", "2m", "short", "medium", "long", etc.',
        ),
      model: z
        .string()
        .optional()
        .describe(
          'AI model to use. Models are loaded dynamically from SuperDuperAI API. Use model name like "VEO3" or full model ID.',
        ),
      seed: z.number().optional().describe('Seed for reproducible results'),
      batchSize: z
        .number()
        .min(1)
        .max(2)
        .optional()
        .describe(
          'Number of videos to generate simultaneously (1-2). Higher batch sizes generate multiple variations at once.',
        ),
    }),
    execute: async ({
      prompt,
      sourceVideoUrl,
      style,
      resolution,
      duration,
      model,
      seed,
      batchSize,
    }) => {
      console.log('🎬 configureVideoGeneration called with:', {
        prompt,
        style,
        resolution,
        duration,
        model,
        seed,
        batchSize,
      });

      // AICODE-NOTE: Define FAL VEO3 constants at the top of execute function
      const FAL_DURATIONS = [
        { id: '4s', label: '4s', value: '4s' },
        { id: '6s', label: '6s', value: '6s' },
        { id: '8s', label: '8s', value: '8s' },
      ];

      const FAL_RESOLUTIONS = [
        { id: '720p', label: '720p', value: '720p' },
        { id: '1080p', label: '1080p', value: '1080p' },
      ];

      const FAL_ASPECT_RATIOS = [
        { id: '16:9', label: '16:9', value: '16:9' },
        { id: '9:16', label: '9:16', value: '9:16' },
        { id: '1:1', label: '1:1', value: '1:1' },
      ];

      // If no prompt provided, return FAL VEO3 configuration panel
      if (!prompt) {
        console.log('🎬 No prompt provided, returning FAL VEO3 configuration panel');
        return {
          availableDurations: FAL_DURATIONS,
          availableResolutions: FAL_RESOLUTIONS,
          availableAspectRatios: FAL_ASPECT_RATIOS,
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

      console.log('🎬 ✅ PROMPT PROVIDED, GENERATING WITH FAL VEO3:', prompt);

      // Check style for quality multipliers
      const multipliers: string[] = [];
      if (style?.includes('high-quality')) multipliers.push('high-quality');
      if (style?.includes('ultra-quality')) multipliers.push('ultra-quality');

      try {
        // Map old duration format to FAL duration
        const selectedDuration = duration
          ? FAL_DURATIONS.find((d) => d.label === duration || d.id === duration || duration.includes(d.id)) || FAL_DURATIONS[2]
          : FAL_DURATIONS[2]; // default to 8s

        // Map old resolution format to FAL resolution
        const selectedResolution = resolution
          ? FAL_RESOLUTIONS.find((r) => r.label === resolution || resolution.includes(r.id)) || FAL_RESOLUTIONS[0]
          : FAL_RESOLUTIONS[0]; // default to 720p

        // Map old resolution or style to aspect ratio
        const selectedAspectRatio = resolution
          ? FAL_ASPECT_RATIOS.find((a) => resolution.includes(a.id)) || FAL_ASPECT_RATIOS[0]
          : FAL_ASPECT_RATIOS[0]; // default to 16:9

        // Используем новую систему анализа контекста
        let normalizedSourceUrl = sourceVideoUrl;

        console.log('🔍 configureVideoGeneration sourceVideoUrl resolution:', {
          sourceVideoUrl,
          defaultSourceVideoUrl: params?.defaultSourceVideoUrl,
          chatId: params?.chatId,
          userMessage: params?.userMessage,
        });

        // Приоритет 1: новая система анализа контекста (все 4 системы)
        if (params?.chatId && params?.userMessage) {
          try {
            console.log(
              '🔍 Analyzing video context with enhanced system (all 4 systems)...',
            );
            const contextResult = await analyzeVideoContext(
              params.userMessage,
              params.chatId,
              params.currentAttachments,
              params.session?.user?.id,
            );

            console.log('🔍 Enhanced context analysis result:', contextResult);

            if (contextResult.sourceUrl && contextResult.confidence !== 'low') {
              console.log(
                '🔍 Using sourceUrl from enhanced context analysis:',
                contextResult.sourceUrl,
                'confidence:',
                contextResult.confidence,
                'reasoning:',
                contextResult.reasoning,
                'metadata:',
                contextResult.metadata,
              );
              normalizedSourceUrl = contextResult.sourceUrl;
            }
          } catch (error) {
            console.warn(
              '🔍 Error in enhanced context analysis, falling back:',
              error,
            );
          }
        }

        // Приоритет 2: defaultSourceVideoUrl (legacy поддержка) - только если семантический поиск не дал результата
        if (
          !normalizedSourceUrl &&
          params?.defaultSourceVideoUrl &&
          /^https?:\/\//.test(params.defaultSourceVideoUrl)
        ) {
          console.log(
            '🔍 Using defaultSourceVideoUrl from legacy context analysis:',
            params.defaultSourceVideoUrl,
          );
          normalizedSourceUrl = params.defaultSourceVideoUrl;
        }

        // Приоритет 3: AI-provided sourceVideoUrl
        if (
          !normalizedSourceUrl &&
          sourceVideoUrl &&
          /^https?:\/\//.test(sourceVideoUrl) &&
          !sourceVideoUrl.startsWith('attachment://')
        ) {
          console.log('🔍 Using AI-provided sourceVideoUrl:', sourceVideoUrl);
          normalizedSourceUrl = sourceVideoUrl;
        }
        // Fallback: text-to-video
        if (!normalizedSourceUrl) {
          console.log(
            '🔍 No valid source video URL available, will be text-to-video',
          );
        }

        // Determine operation type and check balance
        let operationType = 'text-to-video';
        if (normalizedSourceUrl) {
          // Проверяем, является ли источник изображением или видео
          const isImageSource =
            /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(normalizedSourceUrl) ||
            normalizedSourceUrl.includes('image/') ||
            params?.currentAttachments?.some(
              (att) =>
                att.url === normalizedSourceUrl &&
                String(att.contentType || '').startsWith('image/'),
            );

          operationType = isImageSource ? 'image-to-video' : 'video-to-video';

          console.log('🔍 Operation type determined:', {
            sourceUrl: normalizedSourceUrl,
            isImageSource,
            operationType,
          });
        }

        // Проверяем, был ли найден подходящий источник для семантического поиска
        if (
          params?.userMessage &&
          normalizedSourceUrl &&
          operationType === 'image-to-video'
        ) {
          // Проверяем, содержит ли сообщение запрос на поиск по содержимому
          const semanticSearchPatterns = [
            /(картинк[а-я]+\s+с\s+|изображение\s+с\s+|фото\s+с\s+|image\s+with\s+|picture\s+with\s+|photo\s+with\s+)/i,
            /(картинк[а-я]+\s+где\s+есть|изображение\s+где\s+есть|фото\s+где\s+есть|image\s+that\s+has|picture\s+that\s+contains|photo\s+that\s+shows)/i,
          ];

          const hasSemanticSearchRequest = semanticSearchPatterns.some(
            (pattern) => pattern.test(params.userMessage || ''),
          );

          // Убираем проверку fallback, так как она блокирует создание видео-артефактов
          // Новая система контекста уже правильно определяет источник изображения
          console.log(
            '🔍 Skipping fallback check - new context system handles source selection properly',
          );
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

        // AICODE-NOTE: Use FAL VEO3 provider directly instead of old SuperDuperAI artifact system
        console.log('🎬 ✅ USING FAL VEO3 PROVIDER FOR VIDEO GENERATION');

        try {
          // Configure Fal.ai client
          const { fal } = await import('@fal-ai/client');
          const falKey = process.env.FAL_KEY;
          if (!falKey) {
            throw new Error('FAL_KEY environment variable is not configured');
          }
          fal.config({ credentials: falKey });

          // Call Fal.ai Veo3 API
          console.log('🚀 Calling Fal.ai Veo3 API...');
          const result = await fal.subscribe('fal-ai/veo3', {
            input: {
              prompt,
              aspect_ratio: selectedAspectRatio.value,
              duration: selectedDuration.value,
              resolution: selectedResolution.value,
              generate_audio: true,
              enhance_prompt: true,
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
            duration: selectedDuration.value,
            resolution: selectedResolution.value,
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
                duration: selectedDuration.value,
                aspectRatio: selectedAspectRatio.value,
                resolution: selectedResolution.value,
                generateAudio: true,
              },
            },
            creditsUsed: balanceCheck.cost,
            provider: 'fal.ai',
            model: 'veo3',
            message: `Video generated successfully using FAL AI VEO3: "${prompt}". Duration: ${selectedDuration.label}, Resolution: ${selectedResolution.label}, Aspect Ratio: ${selectedAspectRatio.label}.`,
          };
        } catch (error: any) {
          console.error('🎬 ❌ FAL VIDEO GENERATION ERROR:', error);
          throw error;
        }
      } catch (error: any) {
        console.error('🎬 ❌ ERROR IN VIDEO GENERATION:', error);
        return {
          error: `Failed to generate video: ${error.message}`,
          message: `Unfortunately, video generation failed: "${prompt}". Error: ${error.message}`,
        };
      }
    },
  });

// Helper function to find video style (similar to image style finder)
export function findVideoStyle(
  styleName: string,
  availableStyles: MediaOption[],
): MediaOption | null {
  const normalizedStyleName = styleName.toLowerCase().trim();

  // Direct match by label or id
  let foundStyle = availableStyles.find(
    (style) =>
      style.label.toLowerCase() === normalizedStyleName ||
      style.id.toLowerCase() === normalizedStyleName,
  );

  if (foundStyle) return foundStyle;

  // Partial match
  foundStyle = availableStyles.find(
    (style) =>
      style.label.toLowerCase().includes(normalizedStyleName) ||
      style.id.toLowerCase().includes(normalizedStyleName) ||
      normalizedStyleName.includes(style.label.toLowerCase()) ||
      normalizedStyleName.includes(style.id.toLowerCase()),
  );

  return foundStyle || null;
}
