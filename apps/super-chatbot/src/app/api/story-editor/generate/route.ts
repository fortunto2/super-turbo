import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getSuperduperAIConfig,
  ProjectService,
  QualityTypeEnum,
} from "@turbo-super/api";
import {
  validateOperationBalance,
  deductOperationBalance,
} from "@/lib/utils/tools-balance";
import { createBalanceErrorResponse } from "@/lib/utils/balance-error-handler";

interface ProjectVideoCreate {
  template_name: string;
  config: {
    prompt: string;
    aspect_ratio: string;
    image_generation_config_name: string;
    auto_mode: boolean;
    seed: number;
    quality: string;
    entity_ids: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ProjectVideoCreate = await request.json();

    // Валидация входных данных
    if (!body.config.prompt || !body.config.image_generation_config_name) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: prompt and image_generation_config_name",
        },
        { status: 400 }
      );
    }

    // Проверка баланса пользователя
    const userId = session.user.id;

    // Определяем множители качества для расчета стоимости
    const qualityMultipliers = [];
    switch (body.config.quality) {
      case "hd":
        qualityMultipliers.push("hd-quality");
        break;
      case "4k":
        qualityMultipliers.push("4k-quality");
        break;
      default:
        qualityMultipliers.push("standard-quality");
    }

    const balanceValidation = await validateOperationBalance(
      userId,
      "story-editor",
      "project-video",
      qualityMultipliers
    );

    if (!balanceValidation.valid) {
      const errorResponse = createBalanceErrorResponse(
        balanceValidation,
        "project-video"
      );
      return NextResponse.json(errorResponse, { status: 402 });
    }

    console.log(
      `💳 Balance validated: ${balanceValidation.cost} credits required for story editor project`
    );

    // Получение конфигурации SuperDuperAI
    const superduperaiConfig = getSuperduperAIConfig();

    if (!superduperaiConfig.token) {
      return NextResponse.json(
        { error: "SuperDuperAI API token not configured" },
        { status: 500 }
      );
    }

    // Настройка и вызов SuperDuperAI API
    const { OpenAPI } = await import("@turbo-super/api");
    OpenAPI.BASE = superduperaiConfig.url;
    OpenAPI.TOKEN = superduperaiConfig.token;

    const payload = {
      template_name: "story",
      config: {
        prompt: body.config.prompt,
        aspect_ratio: body.config.aspect_ratio,
        image_generation_config_name: body.config.image_generation_config_name,
        auto_mode: body.config.auto_mode,
        seed: body.config.seed,
        quality: (() => {
          switch (body.config.quality) {
            case "4k":
              return QualityTypeEnum.FULL_HD;
            case "hd":
              return QualityTypeEnum.HD;
            case "standard":
              return QualityTypeEnum.SD;
            default:
              return QualityTypeEnum.SD;
          }
        })(),
        entity_ids: body.config.entity_ids,
      },
    };

    console.log("payload", payload);

    const result = await ProjectService.projectVideo({ requestBody: payload });

    // Извлечение ID проекта из ответа
    const projectId = result.id;

    if (!projectId) {
      return NextResponse.json(
        { error: "No project ID returned from SuperDuperAI API" },
        { status: 500 }
      );
    }

    // Списание баланса после успешного создания проекта
    try {
      await deductOperationBalance(
        userId,
        "story-editor",
        "project-video",
        qualityMultipliers,
        {
          projectId: projectId,
          operationType: "project-video",
          quality: body.config.quality,
          aspectRatio: body.config.aspect_ratio,
          timestamp: new Date().toISOString(),
        }
      );
      console.log(
        `💳 Balance deducted for user ${userId} after successful story editor project creation: ${balanceValidation.cost} credits`
      );
    } catch (balanceError) {
      console.error(
        "⚠️ Failed to deduct balance after story editor project creation:",
        balanceError
      );
      // Продолжаем с ответом - проект был создан успешно
    }

    // Сохранение проекта в базу данных пользователя
    try {
      const saveProjectResponse = await fetch(
        `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/user-projects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId: projectId,
          }),
        }
      );

      if (saveProjectResponse.ok) {
        console.log(
          `💾 Project ${projectId} saved to user database for user ${userId}`
        );
      } else {
        console.warn(`⚠️ Failed to save project ${projectId} to user database`);
      }
    } catch (saveError) {
      console.error("⚠️ Error saving project to user database:", saveError);
      // Продолжаем с ответом - проект был создан успешно
    }

    return NextResponse.json({
      success: true,
      projectId,
      message: "Video generation started successfully",
      data: result.data,
      creditsUsed: balanceValidation.cost,
    });
  } catch (error: any) {
    console.error("Story Editor API Error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
