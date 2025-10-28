import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { z } from 'zod';
import {
  validateOperationBalance,
  deductOperationBalance,
} from '@/lib/utils/tools-balance';
import { createBalanceErrorResponse } from '@/lib/utils/balance-error-handler';

// Zod schema for video generation request validation
const videoGenerationSchema = z.object({
  prompt: z.string().min(1, 'Промпт обязателен'),
  sourceImageUrl: z.string().optional(),
  duration: z.enum(['4', '6', '8']).optional().default('8'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).optional().default('16:9'),
  resolution: z.enum(['720p', '1080p']).optional().default('720p'),
  negativePrompt: z.string().optional(),
});

function extractBase64FromDataUrl(dataUrl: string): string {
  const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (base64Match && base64Match[1]) return base64Match[1];
  return dataUrl;
}

function getMimeTypeFromDataUrl(dataUrl: string): string {
  const mimeMatch = dataUrl.match(/^data:(image\/[^;]+);base64,/);
  return mimeMatch && mimeMatch[1] ? mimeMatch[1] : 'image/jpeg';
}

/**
 * Vertex AI Video Generation через Google Cloud
 *
 * Использует:
 * - GOOGLE_AI_API_KEY из .env.local
 * - Auth0 для аутентификации пользователей
 * - Vertex AI Veo API
 *
 * ВАЖНО: Этот endpoint пытается использовать прямой Vertex AI API
 * Если вы получите ошибку OAuth2 - используйте /api/video/generate (Fal.ai)
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Vertex AI Video Generate API called');

    // Проверяем аутентификацию через Auth0
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима аутентификация через Auth0' },
        { status: 401 },
      );
    }

    console.log('✅ User authenticated via Auth0:', session.user.email);

    // Проверяем наличие Vertex AI API Key
    const apiKey =
      process.env.GOOGLE_AI_API_KEY || process.env.VERTEXT_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Vertex AI API ключ не настроен',
          hint: 'Добавьте GOOGLE_AI_API_KEY или VERTEX_AI_API_KEY в .env.local',
          auth0Status: 'работает',
          vertexStatus: 'не настроен',
        },
        { status: 500 },
      );
    }

    console.log('✅ API Key found:', `${apiKey.substring(0, 10)}...`);

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
    const generationType = validatedData.sourceImageUrl
      ? 'image-to-video'
      : 'text-to-video';

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

    // Попробуем разные Vertex AI endpoints
    const vertexEndpoints = [
      // Endpoint 1: Generative Language API (для API ключей)
      {
        name: 'Generative Language API',
        url: 'https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
      },
      // Endpoint 2: Vertex AI API (обычно требует OAuth2)
      {
        name: 'Vertex AI API',
        url: 'https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/veo-3.1:predictLongRunning',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      },
    ];

    let lastError: any = null;

    // Пробуем каждый endpoint
    for (const endpoint of vertexEndpoints) {
      try {
        console.log(`🚀 Trying ${endpoint.name}...`);
        console.log(`   URL: ${endpoint.url}`);

        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: endpoint.headers,
          body: JSON.stringify({
            instances: [
              {
                prompt: validatedData.prompt,
                ...(validatedData.sourceImageUrl && {
                  image: {
                    bytesBase64Encoded: extractBase64FromDataUrl(
                      validatedData.sourceImageUrl,
                    ),
                    mimeType: getMimeTypeFromDataUrl(
                      validatedData.sourceImageUrl,
                    ),
                  },
                }),
                ...(validatedData.negativePrompt && {
                  negativePrompt: validatedData.negativePrompt,
                }),
              },
            ],
            parameters: {
              aspectRatio: validatedData.aspectRatio,
              resolution: validatedData.resolution,
              durationSeconds: Number.parseInt(validatedData.duration),
            },
          }),
        });

        const responseText = await response.text();
        console.log(`📋 ${endpoint.name} Response Status:`, response.status);
        console.log(
          `📋 ${endpoint.name} Response:`,
          responseText.substring(0, 200),
        );

        if (response.ok) {
          // Успех! Парсим ответ
          const operationData = JSON.parse(responseText);
          const fileId = `vertex-${Date.now()}-${Math.random().toString(36).substring(7)}`;

          console.log(
            '✅ SUCCESS! Video generation started with',
            endpoint.name,
          );

          // Деduct balance
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
                provider: 'vertex-ai',
                model: 'veo-3.1',
                endpoint: endpoint.name,
                timestamp: new Date().toISOString(),
              },
            );
            console.log(`💳 Balance deducted for user ${userId}`);
          } catch (balanceError) {
            console.error('⚠️ Failed to deduct balance:', balanceError);
          }

          return NextResponse.json({
            success: true,
            fileId,
            operationName: operationData.name,
            status: 'processing',
            message: 'Видео генерируется через Vertex AI',
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
            creditsUsed: balanceValidation.cost,
            provider: 'vertex-ai',
            model: 'veo-3.1',
            endpoint: endpoint.name,
            auth0: 'работает ✅',
            note: `Проверяйте статус через операцию: ${operationData.name}`,
          });
        }

        // Сохраняем ошибку для отчёта
        lastError = {
          endpoint: endpoint.name,
          status: response.status,
          response: responseText,
        };
      } catch (error) {
        console.error(`❌ Error with ${endpoint.name}:`, error);
        lastError = {
          endpoint: endpoint.name,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Все endpoints не сработали
    console.error('❌ All Vertex AI endpoints failed');

    return NextResponse.json(
      {
        success: false,
        error: 'Vertex AI endpoints не сработали',
        details: lastError,
        auth0Status: '✅ Работает (пользователь авторизован)',
        vertexStatus: '❌ Требует OAuth2 или Service Account',
        recommendation: {
          message: 'Используйте /api/video/generate (Fal.ai)',
          reason: 'Google Veo требует сложную OAuth2 аутентификацию',
          alternative: 'Fal.ai предоставляет тот же Veo 3 с простым API ключом',
          link: 'https://fal.ai',
        },
        whatHappened: {
          auth0: 'Пользователь успешно авторизован через Auth0',
          apiKey: 'API ключ найден в переменных окружения',
          vertexApi: 'Vertex AI вернул ошибку (вероятно требует OAuth2)',
        },
      },
      { status: 400 },
    );
  } catch (error) {
    console.error('💥 Vertex Video Generate API error:', error);

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
        error: 'Не удалось сгенерировать видео через Vertex AI',
        details: errorMessage,
        auth0Status: 'проверьте логи выше',
      },
      { status: 500 },
    );
  }
}

// GET запрос для информации о настройке
export async function GET() {
  try {
    console.log('🎬 Vertex Video info API called');

    const hasGoogleApiKey = !!process.env.GOOGLE_AI_API_KEY;
    const hasVertexKey = !!process.env.VERTEXT_AI_API_KEY;
    const hasAuth0 = !!(
      process.env.AUTH_AUTH0_ID &&
      process.env.AUTH_AUTH0_SECRET &&
      process.env.AUTH_AUTH0_ISSUER
    );

    return NextResponse.json({
      success: true,
      status: {
        auth0: hasAuth0 ? '✅ Настроен' : '❌ Не настроен',
        googleApiKey: hasGoogleApiKey ? '✅ Найден' : '❌ Не найден',
        vertexApiKey: hasVertexKey
          ? '✅ Найден (опечатка VERTEXT)'
          : '❌ Не найден',
        recommendation:
          hasGoogleApiKey || hasVertexKey
            ? 'Ключ найден, но может не работать для Veo (требует OAuth2)'
            : 'Добавьте GOOGLE_AI_API_KEY в .env.local',
      },
      configuration: {
        auth0Issuer: process.env.AUTH_AUTH0_ISSUER || 'не настроен',
        auth0Configured: hasAuth0,
        vertexConfigured: hasGoogleApiKey || hasVertexKey,
      },
      endpoints: {
        thisEndpoint: '/api/video/generate-vertex (попытка Vertex AI)',
        recommended: '/api/video/generate (Fal.ai - работает точно)',
        experimental: '/api/video/generate-google (тест Google API)',
      },
      data: {
        provider: 'vertex-ai',
        model: 'veo-3.1',
        durations: ['4', '6', '8'],
        aspectRatios: ['16:9', '9:16', '1:1'],
        resolutions: ['720p', '1080p'],
      },
    });
  } catch (error) {
    console.error('🎬 Vertex Video info API error:', error);

    return NextResponse.json(
      {
        error: 'Ошибка получения информации',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
