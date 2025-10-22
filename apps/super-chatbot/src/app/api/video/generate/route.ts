import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { fal } from '@fal-ai/client';
import { z } from 'zod';
import {
  validateOperationBalance,
  deductOperationBalance,
} from '@/lib/utils/tools-balance';
import { createBalanceErrorResponse } from '@/lib/utils/balance-error-handler';

// Zod schema for video generation request validation
const videoGenerationSchema = z.object({
  prompt: z.string().min(1, 'Промпт обязателен'),
  duration: z.enum(['4s', '6s', '8s']).optional().default('8s'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9'),
  resolution: z.enum(['720p', '1080p']).optional().default('720p'),
  generateAudio: z.boolean().optional().default(true),
  enhancePrompt: z.boolean().optional().default(true),
  negativePrompt: z.string().optional(),
  seed: z.number().int().positive().optional(),
});

// Configure Fal.ai client with API key
function configureFalClient() {
  const falKey = process.env.FAL_KEY;
  if (!falKey) {
    throw new Error('FAL_KEY environment variable is not configured');
  }
  fal.config({ credentials: falKey });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Video Generate API called');

    // Проверяем аутентификацию через Auth0
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима аутентификация' },
        { status: 401 },
      );
    }

    // Парсим и валидируем запрос
    const body = await request.json();
    const validatedData = videoGenerationSchema.parse(body);

    console.log('🎬 Validated video request:', {
      prompt: `${validatedData.prompt.substring(0, 50)}...`,
      duration: validatedData.duration,
      aspectRatio: validatedData.aspectRatio,
      resolution: validatedData.resolution,
    });

    // Валидация баланса пользователя
    const userId = session.user.id;
    const generationType = 'text-to-video';

    // Определяем множители стоимости
    const multipliers: string[] = [];
    const durationSeconds = Number.parseInt(validatedData.duration);

    if (durationSeconds <= 5) multipliers.push('duration-5s');
    else if (durationSeconds <= 10) multipliers.push('duration-10s');
    else if (durationSeconds <= 15) multipliers.push('duration-15s');

    // Добавляем множитель за разрешение
    if (validatedData.resolution === '1080p') {
      multipliers.push('hd-quality');
    }

    const balanceValidation = await validateOperationBalance(
      userId,
      'video-generation',
      generationType,
      multipliers,
    );

    if (!balanceValidation.valid) {
      const errorResponse = createBalanceErrorResponse(
        balanceValidation,
        generationType,
      );
      return NextResponse.json(errorResponse, { status: 402 });
    }

    console.log(
      `💳 User ${userId} has sufficient balance for ${generationType} (${balanceValidation.cost} credits)`,
    );

    // Конфигурируем Fal.ai клиент
    configureFalClient();

    // Вызываем Fal.ai Veo3 API
    console.log('🚀 Calling Fal.ai Veo3 API for video generation...');
    const result = await fal.subscribe('fal-ai/veo3', {
      input: {
        prompt: validatedData.prompt,
        aspect_ratio: validatedData.aspectRatio,
        duration: validatedData.duration,
        resolution: validatedData.resolution,
        generate_audio: validatedData.generateAudio,
        enhance_prompt: validatedData.enhancePrompt,
        ...(validatedData.negativePrompt && {
          negative_prompt: validatedData.negativePrompt,
        }),
        ...(validatedData.seed && { seed: validatedData.seed }),
      },
      logs: true,
      onQueueUpdate: (update) => {
        console.log('📊 Video generation queue update:', update);
      },
    });

    console.log('✅ Video generation completed:', result);

    // Извлекаем URL видео из ответа
    const videoUrl = result.data?.video?.url;
    if (!videoUrl) {
      throw new Error('No video URL in Fal.ai response');
    }

    // Генерируем уникальный ID файла
    const fileId = `video-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Списываем баланс после успешной генерации
    try {
      await deductOperationBalance(
        userId,
        'video-generation',
        generationType,
        multipliers,
        {
          fileId,
          operationType: generationType,
          duration: durationSeconds,
          resolution: validatedData.resolution,
          provider: 'fal.ai',
          model: 'veo3',
          aspectRatio: validatedData.aspectRatio,
          timestamp: new Date().toISOString(),
        },
      );
      console.log(
        `💳 Balance deducted for user ${userId} after successful video generation`,
      );
    } catch (balanceError) {
      console.error(
        '⚠️ Failed to deduct balance after video generation:',
        balanceError,
      );
      // Продолжаем - видео уже сгенерировано успешно
    }

    // Возвращаем стандартизированный ответ
    return NextResponse.json({
      success: true,
      fileId,
      videoUrl,
      data: {
        id: fileId,
        url: videoUrl,
        prompt: validatedData.prompt,
        timestamp: Date.now(),
        settings: {
          duration: durationSeconds,
          aspectRatio: validatedData.aspectRatio,
          resolution: validatedData.resolution,
          generateAudio: validatedData.generateAudio,
        },
      },
      creditsUsed: balanceValidation.cost,
      provider: 'fal.ai',
      model: 'veo3',
      message: 'Видео успешно сгенерировано',
    });
  } catch (error) {
    console.error('💥 Video Generate API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Ошибка валидации данных',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Неизвестная ошибка';

    return NextResponse.json(
      {
        success: false,
        error: 'Не удалось сгенерировать видео',
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

// GET запрос для получения информации о доступных настройках
export async function GET() {
  try {
    console.log('🎬 Video info API called');

    return NextResponse.json({
      success: true,
      data: {
        provider: 'fal.ai',
        model: 'veo3',
        durations: ['4s', '6s', '8s'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        resolutions: ['720p', '1080p'],
        features: {
          audioGeneration: true,
          promptEnhancement: true,
          negativePrompts: true,
          seedControl: true,
        },
      },
      message: 'Информация о генерации видео получена',
    });
  } catch (error) {
    console.error('🎬 Video info API error:', error);

    return NextResponse.json(
      {
        error: 'Ошибка получения информации о генерации видео',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
