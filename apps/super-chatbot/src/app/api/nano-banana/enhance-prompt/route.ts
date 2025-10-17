import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { nanoBananaPromptEnhancer } from '@/lib/ai/tools/nano-banana-prompt-enhancer';
import { z } from 'zod';

// Схема валидации для запроса улучшения промпта
const enhancePromptRequestSchema = z.object({
  originalPrompt: z.string().min(1, 'Исходный промпт обязателен'),
  enhancementTechnique: z
    .enum([
      'context-awareness',
      'surgical-precision',
      'physical-logic',
      'lighting-mastery',
      'composition-expertise',
      'creative-partnership',
    ])
    .optional(),
  targetStyle: z
    .enum([
      'realistic',
      'cinematic',
      'artistic',
      'minimalist',
      'dramatic',
      'soft',
      'vibrant',
      'moody',
    ])
    .optional(),
  includeTechnicalTerms: z.boolean().optional().default(true),
  includeQualityDescriptors: z.boolean().optional().default(true),
  enhanceForEditing: z.boolean().optional().default(false),
  creativeMode: z.boolean().optional().default(false),
  preserveOriginalIntent: z.boolean().optional().default(true),
  customInstructions: z.string().optional(),
});

const normalizeInput = (body: any) => {
  if (body.enhancementTechnique === 'context_awareness') {
    body.enhancementTechnique = 'context-awareness';
  }
  if (body.targetStyle === 'photorealistic') {
    body.targetStyle = 'realistic'; // или добавь новый стиль в enum
  }
  return body;
};

export async function POST(request: NextRequest) {
  try {
    console.log('🍌 Nano Banana enhance prompt API called');

    // Проверяем аутентификацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Необходима аутентификация' },
        { status: 401 },
      );
    }

    // Парсим и валидируем запрос
    const rawBody = await request.json();
    const normalizedBody = normalizeInput(rawBody);
    const validatedData = enhancePromptRequestSchema.parse(normalizedBody);

    console.log('🍌 Validated enhance prompt request data:', validatedData);

    // Вызываем инструмент улучшения промпта
    if (!nanoBananaPromptEnhancer?.execute) {
      throw new Error('nanoBananaPromptEnhancer tool is not properly initialized');
    }

    const result = await nanoBananaPromptEnhancer.execute(validatedData, {
      toolCallId: 'nano-banana-enhance',
      messages: [],
    });

    console.log('🍌 Enhance prompt result:', result);

    // Проверяем на ошибки
    if ('error' in result && result.error) {
      return NextResponse.json(
        {
          error: result.error,
          fallback: (result as any).fallback,
        },
        { status: 400 },
      );
    }

    // Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Промпт успешно улучшен для Nano Banana',
    });
  } catch (error) {
    console.error('🍌 Error in Nano Banana enhance prompt API:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Ошибка валидации данных',
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: 'Внутренняя ошибка сервера',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}

// GET запрос для получения информации о техниках улучшения
export async function GET() {
  try {
    console.log('🍌 Nano Banana enhance prompt info API called');

    // Получаем информацию о техниках и стилях
    if (!nanoBananaPromptEnhancer?.execute) {
      throw new Error('nanoBananaPromptEnhancer tool is not properly initialized');
    }

    const techniquesInfo = await nanoBananaPromptEnhancer.execute(
      {
        originalPrompt: 'info',
        includeTechnicalTerms: true,
        includeQualityDescriptors: true,
        enhanceForEditing: false,
        creativeMode: false,
        preserveOriginalIntent: true,
      },
      {
        toolCallId: 'nano-banana-config',
        messages: [],
      },
    );

    // Извлекаем нужные данные из конфигурации
    const techniques =
      'appliedTechniques' in techniquesInfo
        ? (techniquesInfo as any).appliedTechniques?.map((t: any) => t.id) || []
        : [];

    return NextResponse.json({
      success: true,
      data: {
        techniques,
      },
      message: 'Информация о техниках улучшения промптов Nano Banana получена',
    });
  } catch (error) {
    console.error('🍌 Error in Nano Banana enhance prompt info API:', error);

    return NextResponse.json(
      {
        error: 'Ошибка получения информации о техниках улучшения промптов',
        details: error instanceof Error ? error.message : 'Неизвестная ошибка',
      },
      { status: 500 },
    );
  }
}
