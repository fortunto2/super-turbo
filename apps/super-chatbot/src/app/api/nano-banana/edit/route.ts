import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { nanoBananaImageEditing } from "@/lib/ai/tools/nano-banana-image-editing";
import { createDocument } from "@/lib/ai/tools/create-document";
import { z } from "zod";

// Схема валидации для запроса редактирования
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
  sourceImageUrl: z
    .string()
    .url("URL исходного изображения обязателен")
    .or(z.literal("")),
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
  // Дополнительные параметры для специфичных типов редактирования
  objectToRemove: z.string().optional(),
  newBackground: z.string().optional(),
  textToAdd: z.string().optional(),
  textStyle: z.string().optional(),
  targetStyle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log("🍌 Nano Banana edit API called");

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
    const validatedData = editRequestSchema.parse(body);

    console.log("🍌 Validated edit request data:", validatedData);

    // Проверяем, что sourceImageUrl не пустой
    if (!validatedData.sourceImageUrl || validatedData.sourceImageUrl === "") {
      return NextResponse.json(
        {
          error: "URL исходного изображения обязателен для редактирования",
        },
        { status: 400 }
      );
    }

    // Создаем параметры для инструмента
    const toolParams = {
      createDocument: createDocument,
      session,
      defaultSourceImageUrl: validatedData.sourceImageUrl,
      chatId: "api-request",
      userMessage: validatedData.editPrompt,
      currentAttachments: [{ url: validatedData.sourceImageUrl }],
    };

    // Вызываем инструмент редактирования
    const result = await nanoBananaImageEditing(toolParams).execute(
      validatedData,
      {
        toolCallId: "nano-banana-edit",
        messages: [],
      }
    );

    console.log("🍌 Edit result:", result);

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
      message: "Редактирование изображения с помощью Nano Banana запущено",
    });
  } catch (error) {
    console.error("🍌 Error in Nano Banana edit API:", error);

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

// GET запрос для получения информации о типах редактирования
export async function GET() {
  try {
    console.log("🍌 Nano Banana edit info API called");

    // Создаем параметры для получения конфигурации
    const toolParams = {
      createDocument: createDocument,
      session: null,
    };

    // Получаем конфигурацию без промпта
    const config = await nanoBananaImageEditing(toolParams).execute(
      {
        editType: "background-replacement",
        editPrompt: "Edit the background of the image",
        sourceImageUrl: "https://example.com/image.jpg",
        precisionLevel: "automatic",
        blendMode: "natural",
        preserveOriginalStyle: true,
        enhanceLighting: true,
        preserveShadows: true,
        seed: 0,
        batchSize: 1,
        objectToRemove: "background",
        newBackground: "https://example.com/new-background.jpg",
        textToAdd: "Add text to the image",
        textStyle: "Arial",
        targetStyle: "realistic",
      },
      {
        toolCallId: "nano-banana-edit-info",
        messages: [],
      }
    );

    // Извлекаем нужные данные из конфигурации
    const editTypes = config.nanoBananaEditTypes?.map((t: any) => t.id) || [];
    const precisionLevels =
      config.nanoBananaPrecisionLevels?.map((p: any) => p.id) || [];
    const blendModes = config.nanoBananaBlendModes?.map((b: any) => b.id) || [];

    return NextResponse.json({
      success: true,
      data: {
        editTypes,
        precisionLevels,
        blendModes,
      },
      message: "Информация о типах редактирования Nano Banana получена",
    });
  } catch (error) {
    console.error("🍌 Error in Nano Banana edit info API:", error);

    return NextResponse.json(
      {
        error: "Ошибка получения информации о редактировании Nano Banana",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 }
    );
  }
}
