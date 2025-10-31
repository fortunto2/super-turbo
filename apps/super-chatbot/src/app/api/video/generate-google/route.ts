import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import { validateOperationBalance } from '@/lib/utils/tools-balance';
import { createBalanceErrorResponse } from '@/lib/utils/balance-error-handler';

// Zod schema for video generation request validation
const videoGenerationSchema = z.object({
  prompt: z.string().min(1, 'Промпт обязателен'),
  duration: z.enum(['4s', '6s', '8s']).optional().default('8s'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9'),
  resolution: z.enum(['720p', '1080p']).optional().default('720p'),
  negativePrompt: z.string().optional(),
});

/**
 * Попытка использовать Google AI API Key напрямую для Veo 3.1
 *
 * ВАЖНО: Google Veo API требует OAuth2 токен, а не API ключ.
 * Этот endpoint создан для тестирования - скорее всего вернет ошибку
 * "API keys are not supported by this API. Expected OAuth2 access token"
 *
 * Если получите эту ошибку - используйте /api/video/generate (Fal.ai)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Video Generate Google API called');

    // Проверяем аутентификацию через Auth0
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима аутентификация' },
        { status: 401 },
      );
    }

    // Проверяем наличие Google AI API Key
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GOOGLE_AI_API_KEY не настроен',
          hint: 'Добавьте GOOGLE_AI_API_KEY в .env.local',
        },
        { status: 500 },
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

    // Попытка вызвать Google Veo 3.1 API напрямую
    const GOOGLE_VEO_API =
      'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning';

    console.log(
      '🚀 Attempting to call Google Veo 3.1 API with GOOGLE_AI_API_KEY...',
    );
    console.log(
      '⚠️ Вероятно получим ошибку - Google требует OAuth2, а не API ключ',
    );

    const response = await fetch(GOOGLE_VEO_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        instances: [
          {
            prompt: validatedData.prompt,
            ...(validatedData.negativePrompt && {
              negativePrompt: validatedData.negativePrompt,
            }),
          },
        ],
        parameters: {
          aspectRatio: validatedData.aspectRatio,
          resolution: validatedData.resolution,
          durationSeconds: durationSeconds,
        },
      }),
    });

    const responseText = await response.text();
    console.log('📋 Google API Response Status:', response.status);
    console.log('📋 Google API Response:', responseText);

    if (!response.ok) {
      // Вероятно получим ошибку про OAuth2
      let errorDetails = responseText;
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.error?.message || responseText;
      } catch {
        // Игнорируем ошибки парсинга
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Google Veo API не поддерживает API ключи',
          details: errorDetails,
          recommendation: {
            message: 'Используйте /api/video/generate вместо этого endpoint',
            reason: 'Google Veo требует OAuth2 токен, а не API ключ',
            solution:
              'Получите Fal.ai ключ на https://fal.ai - он работает с простыми API ключами',
          },
        },
        { status: 400 },
      );
    }

    // Если каким-то чудом сработало - парсим ответ
    const operationData = JSON.parse(responseText);

    // Генерируем уникальный ID файла
    const fileId = `google-direct-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Возвращаем ответ с информацией об операции
    return NextResponse.json({
      success: true,
      fileId,
      operationName: operationData.name,
      status: 'processing',
      message: '🎉 Неожиданно сработало! Видео генерируется...',
      data: {
        id: fileId,
        operationName: operationData.name,
        prompt: validatedData.prompt,
        timestamp: Date.now(),
        settings: {
          duration: durationSeconds,
          aspectRatio: validatedData.aspectRatio,
          resolution: validatedData.resolution,
        },
      },
      provider: 'google-direct',
      model: 'veo-3.1',
      note: 'Проверяйте статус через /api/video/status/:operationName',
    });
  } catch (error) {
    console.error('💥 Video Generate Google API error:', error);

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
        error: 'Не удалось сгенерировать видео через Google API',
        details: errorMessage,
        recommendation: {
          message: 'Используйте /api/video/generate (Fal.ai) вместо',
          reason: 'Google Veo API требует сложную OAuth2 аутентификацию',
        },
      },
      { status: 500 },
    );
  }
}

// GET запрос для информации о возможностях
export async function GET() {
  try {
    console.log('🎬 Video Generate Google info API called');

    const hasApiKey = !!process.env.GOOGLE_AI_API_KEY;

    return NextResponse.json({
      success: true,
      configured: hasApiKey,
      warning: 'Этот endpoint использует GOOGLE_AI_API_KEY напрямую',
      expectedResult: 'Скорее всего вернет ошибку OAuth2',
      recommendation: {
        use: '/api/video/generate',
        provider: 'Fal.ai',
        reason: 'Google Veo требует OAuth2, а не API ключ',
        setup: 'Получите Fal.ai ключ на https://fal.ai',
      },
      data: {
        provider: 'google-direct',
        model: 'veo-3.1',
        durations: ['4s', '6s', '8s'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        resolutions: ['720p', '1080p'],
      },
    });
  } catch (error) {
    console.error('🎬 Video Generate Google info API error:', error);

    return NextResponse.json(
      {
        error: 'Ошибка получения информации',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
