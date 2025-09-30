import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { nanoBananaImageGeneration } from "@/lib/ai/tools/nano-banana-image-generation";
import { createDocument } from "@/lib/ai/tools/create-document";
import { z } from "zod";

// Схема валидации для запроса
const generateRequestSchema = z.object({
  prompt: z.string().min(1, "Промпт обязателен"),
  sourceImageUrl: z.string().url().optional().or(z.literal("")).optional(),
  style: z.string().optional(),
  quality: z
    .enum(["standard", "high", "ultra", "masterpiece"])
    .optional()
    .default("high"),
  aspectRatio: z
    .enum(["1:1", "4:3", "16:9", "3:2", "9:16", "21:9"])
    .optional()
    .default("1:1"),
  seed: z.number().optional(),
  batchSize: z.number().min(1).max(4).optional().default(1),
  enableContextAwareness: z.boolean().optional().default(true),
  enableSurgicalPrecision: z.boolean().optional().default(true),
  creativeMode: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    console.log("🍌 Nano Banana generate API called");

    // Проверяем аутентификацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима аутентификация" },
        { status: 401 }
      );
    }

    // Парсим и валидируем запрос
    const body = await request.json();
    const validatedData = generateRequestSchema.parse(body);

    console.log("🍌 Validated request data:", validatedData);

    // Создаем параметры для инструмента
    const sourceImageUrl =
      validatedData.sourceImageUrl && validatedData.sourceImageUrl !== ""
        ? validatedData.sourceImageUrl
        : undefined;

    const toolParams = {
      createDocument: createDocument,
      session,
      defaultSourceImageUrl: sourceImageUrl || "",
      chatId: "api-request",
      userMessage: validatedData.prompt,
      currentAttachments: sourceImageUrl ? [{ url: sourceImageUrl }] : [],
    };

    // Вызываем инструмент генерации
    const result = await nanoBananaImageGeneration(toolParams).execute(
      validatedData,
      {
        toolCallId: "nano-banana-generate",
        messages: [],
      }
    );

    console.log("🍌 Generation result:", result);

    // Проверяем на ошибки
    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          balanceError: result.balanceError,
          requiredCredits: result.requiredCredits,
        },
        { status: result.balanceError ? 402 : 400 }
      );
    }

    // Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      data: result,
      message: "Генерация изображения с помощью Nano Banana запущена",
    });
  } catch (error) {
    console.error("🍌 Error in Nano Banana generate API:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Ошибка валидации данных",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 }
    );
  }
}

// GET запрос для получения информации о доступных стилях и настройках
export async function GET() {
  try {
    console.log("🍌 Nano Banana info API called");

    // Создаем параметры для получения конфигурации
    const toolParams = {
      createDocument: createDocument,
      session: null,
    };

    // Получаем конфигурацию без промпта
    const config = await nanoBananaImageGeneration(toolParams).execute(
      {
        prompt: "info",
        style: "realistic",
        quality: "high",
        aspectRatio: "1:1",
        batchSize: 1,
        enableContextAwareness: true,
        enableSurgicalPrecision: true,
        creativeMode: false,
      },
      {
        toolCallId: "nano-banana-config",
        messages: [],
      }
    );

    // Извлекаем нужные данные из конфигурации
    const styles = config.nanoBananaStyles?.map((s: any) => s.id) || [];
    const qualityLevels =
      config.nanoBananaQualityLevels?.map((q: any) => q.id) || [];
    const aspectRatios =
      config.nanoBananaAspectRatios?.map((a: any) => a.id) || [];

    return NextResponse.json({
      success: true,
      data: {
        styles,
        qualityLevels,
        aspectRatios,
      },
      message: "Информация о Nano Banana получена",
    });
  } catch (error) {
    console.error("🍌 Error in Nano Banana info API:", error);

    return NextResponse.json(
      {
        error: "Ошибка получения информации о Nano Banana",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 }
    );
  }
}
