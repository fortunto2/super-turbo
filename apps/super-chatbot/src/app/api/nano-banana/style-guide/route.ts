import { type NextRequest, NextResponse } from "next/server";
import { nanoBananaStyleGuide } from "@/lib/ai/tools/nano-banana-style-guide";
import { z } from "zod/v3";

// Схема валидации для запроса руководства по стилям
const styleGuideRequestSchema = z.object({
  category: z
    .enum([
      "realistic",
      "cinematic",
      "artistic",
      "fantasy",
      "sci-fi",
      "portrait",
      "landscape",
      "macro",
    ])
    .optional(),
  technique: z
    .enum([
      "context-aware-editing",
      "surgical-precision",
      "lighting-mastery",
      "physical-logic",
    ])
    .optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  tags: z.array(z.string()).optional(),
  searchQuery: z.string().optional(),
  includeTips: z.boolean().optional().default(true),
  includeExamples: z.boolean().optional().default(true),
  limit: z.number().min(1).max(20).optional().default(10),
});

export async function POST(request: NextRequest) {
  try {
    console.log("🍌 Nano Banana style guide API called");

    // Парсим и валидируем запрос
    const body = await request.json();
    const validatedData = styleGuideRequestSchema.parse(body);

    console.log("🍌 Validated style guide request data:", validatedData);

    // Вызываем инструмент руководства по стилям
    const result = await nanoBananaStyleGuide.execute?.(validatedData, {
      toolCallId: "nano-banana-style-guide",
      messages: [],
    });

    console.log("🍌 Style guide result:", result);

    // Проверяем на ошибки
    if (result.error) {
      return NextResponse.json(
        {
          error: result.error,
          fallback: result.fallback,
        },
        { status: 400 }
      );
    }

    // Возвращаем успешный результат
    return NextResponse.json({
      success: true,
      data: result,
      message: "Руководство по стилям Nano Banana получено",
    });
  } catch (error) {
    console.error("🍌 Error in Nano Banana style guide API:", error);

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

// GET запрос для получения полного руководства по стилям
export async function GET(request: NextRequest) {
  try {
    console.log("🍌 Nano Banana style guide info API called");

    // Получаем полное руководство по стилям
    const result = await nanoBananaStyleGuide.execute?.(
      {
        includeTips: true,
        includeExamples: true,
        limit: 20,
      },
      {
        toolCallId: "nano-banana-style-guide",
        messages: [],
      }
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: "Полное руководство по стилям Nano Banana получено",
    });
  } catch (error) {
    console.error("🍌 Error in Nano Banana style guide info API:", error);

    return NextResponse.json(
      {
        error: "Ошибка получения руководства по стилям",
        details: error instanceof Error ? error.message : "Неизвестная ошибка",
      },
      { status: 500 }
    );
  }
}
