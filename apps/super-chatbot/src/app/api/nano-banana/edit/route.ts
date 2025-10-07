import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { nanoBananaImageEditing } from "@/lib/ai/tools/nano-banana-image-editing";
import { createDocument } from "@/lib/ai/tools/create-document";
import { z } from "zod";

// Схема валидации запроса редактирования
const editRequestSchema = z.object({
  editType: z.enum([
    "background-replacement",
    "object-addition",
    "object-removal",
    "style-transfer",
    "color-correction",
    "resolution-upscale",
    "face-enhancement",
    "text-addition",
    "composition-improvement",
    "lighting-adjustment",
  ]),
  editPrompt: z.string().min(1, "Описание изменений обязательно"),
  sourceImageUrl: z.string().url("URL исходного изображения обязателен"),
  precisionLevel: z
    .enum(["automatic", "precise", "surgical"])
    .optional()
    .default("automatic"),
  blendMode: z
    .enum(["natural", "seamless", "artistic", "realistic"])
    .optional()
    .default("natural"),
  preserveOriginalStyle: z.boolean().optional().default(true),
  enhanceLighting: z.boolean().optional().default(true),
  preserveShadows: z.boolean().optional().default(true),
  seed: z.number().optional(),
  batchSize: z.number().min(1).max(3).optional().default(1),
  objectToRemove: z.string().optional(),
  newBackground: z.string().optional(),
  textToAdd: z.string().optional(),
  textStyle: z.string().optional(),
  targetStyle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Проверка авторизации
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Необходима аутентификация" },
        { status: 401 }
      );
    }

    // Чтение тела запроса и валидация
    const body = await request.json();
    const validated = editRequestSchema.parse(body);

    // Проверка, что URL исходного изображения предоставлен
    if (!validated.sourceImageUrl) {
      return NextResponse.json(
        { error: "URL исходного изображения обязателен" },
        { status: 400 }
      );
    }

    // Формируем параметры для инструмента редактирования
    const toolParams = {
      createDocument,
      session,
      defaultSourceImageUrl: validated.sourceImageUrl,
      chatId: "api-request",
      userMessage: validated.editPrompt,
      currentAttachments: [{ url: validated.sourceImageUrl }],
    };

    // Выполняем сам редактор
    const result = await nanoBananaImageEditing(toolParams).execute(validated, {
      toolCallId: "nano-banana-edit",
      messages: [],
    });

    console.log("🍌 Edit result:", result);

    if (result.error) {
      // Если есть ошибка в результате, возвращаем её
      return NextResponse.json(
        {
          error: result.error,
          balanceError: result.balanceError,
          requiredCredits: result.requiredCredits,
        },
        { status: result.balanceError ? 402 : 400 }
      );
    }

    // Успешный результат
    return NextResponse.json({
      success: true,
      data: result,
      message: "Редактирование изображения запущено",
    });
  } catch (err) {
    console.error("🍌 Error in Nano Banana edit API:", err);

    if (err instanceof z.ZodError) {
      // Ошибка валидации
      return NextResponse.json(
        {
          error: "Ошибка валидации данных",
          details: err.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Внутренняя ошибка сервера",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// Можно также добавить GET, если нужно отдавать конфигурацию
export async function GET(request: NextRequest) {
  try {
    const session = await auth(); // если нужна авторизация, можно проверить или нет

    const toolParams = {
      createDocument,
      session,
    };

    // Вызываем инструмент “без промта”, чтобы получить доступные типы
    const config = await nanoBananaImageEditing(toolParams).execute(
      {
        editType: "background-replacement",
        editPrompt: "",
        sourceImageUrl: "", // dummy
        precisionLevel: "automatic",
        blendMode: "natural",
        preserveOriginalStyle: true,
        enhanceLighting: true,
        preserveShadows: true,
        seed: 0,
        batchSize: 1,
      },
      {
        toolCallId: "nano-banana-edit-info",
        messages: [],
      }
    );

    const editTypes = config.nanoBananaEditTypes?.map((t: any) => t.id) ?? [];
    const precisionLevels =
      config.nanoBananaPrecisionLevels?.map((p: any) => p.id) ?? [];
    const blendModes = config.nanoBananaBlendModes?.map((b: any) => b.id) ?? [];

    return NextResponse.json({
      success: true,
      data: { editTypes, precisionLevels, blendModes },
      message: "Информация о возможностях редактирования получена",
    });
  } catch (err) {
    console.error("🍌 Error in Nano Banana edit info API:", err);
    return NextResponse.json(
      {
        error: "Ошибка получения информации",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
