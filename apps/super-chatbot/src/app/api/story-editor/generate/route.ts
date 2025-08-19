import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getSuperduperAIConfig,
  ProjectService,
  QualityTypeEnum,
} from "@turbo-super/api";
import { validateOperationBalance } from "@/lib/utils/tools-balance";
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
    // const userId = session.user.id;
    // const balanceValidation = await validateOperationBalance(
    //   userId,
    //   "video-generation",
    //   "project-video",
    //   []
    // );

    // if (!balanceValidation.valid) {
    //   const errorResponse = createBalanceErrorResponse(
    //     balanceValidation,
    //     "project-video"
    //   );
    //   return NextResponse.json(errorResponse, { status: 402 });
    // }

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

    return NextResponse.json({
      success: true,
      projectId,
      message: "Video generation started successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Story Editor API Error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
