import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  GenerationConfigService,
  GenerationTypeEnum,
  getSuperduperAIConfig,
  ListOrderEnum,
} from "@turbo-super/api";

export async function GET(request: NextRequest) {
  try {
    // Проверка аутентификации
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Получение конфигурации SuperDuperAI
    const superduperaiConfig = getSuperduperAIConfig();

    if (!superduperaiConfig.token) {
      return NextResponse.json(
        { error: "SuperDuperAI API token not configured" },
        { status: 500 }
      );
    }

    // Настройка и использование сгенерированного API клиента
    const { OpenAPI } = await import("@turbo-super/api");
    OpenAPI.BASE = superduperaiConfig.url;
    OpenAPI.TOKEN = superduperaiConfig.token;

    const result = await GenerationConfigService.generationConfigGetList({
      limit: 100,
    });
    console.log("result", result);

    // Фильтрация только видео конфигураций
    const videoConfigs =
      result?.items.filter((model) =>
        [GenerationTypeEnum.TEXT_TO_IMAGE].includes(model.type)
      ) ?? [];

    return NextResponse.json({
      success: true,
      configs: videoConfigs,
      total: videoConfigs.length,
    });
  } catch (error: any) {
    console.error("Story Editor Configs API Error:", error);

    // Возвращаем моковые данные в случае ошибки
    const mockConfigs = [
      { id: "1", name: "VEO3 Standard", type: "video", source: "superduperai" },
      { id: "2", name: "VEO3 HD", type: "video", source: "superduperai" },
      { id: "3", name: "VEO3 4K", type: "video", source: "superduperai" },
      {
        id: "4",
        name: "KLING Standard",
        type: "video",
        source: "superduperai",
      },
      { id: "5", name: "LTX Standard", type: "video", source: "superduperai" },
    ];

    return NextResponse.json({
      success: true,
      configs: mockConfigs,
      total: mockConfigs.length,
      note: "Using mock data due to API error",
    });
  }
}
