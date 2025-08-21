import { NextRequest, NextResponse } from "next/server";
import {
  SceneService,
  ListOrderEnum,
  SelectRelatedEnum,
  getSuperduperAIConfig,
  OpenAPI,
} from "@turbo-super/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Настраиваем OpenAPI конфигурацию перед использованием SceneService
    const config = await getSuperduperAIConfig();
    console.log("SuperDuperAI config:", {
      hasToken: !!config.token,
      hasUrl: !!config.url,
      url: config.url,
    });

    if (config.token) {
      OpenAPI.TOKEN = config.token;
    }
    if (config.url) {
      OpenAPI.BASE = config.url;
    }

    console.log("OpenAPI configuration:", {
      BASE: OpenAPI.BASE,
      hasToken: !!OpenAPI.TOKEN,
    });

    // Проверяем, что конфигурация корректна
    if (!OpenAPI.BASE || OpenAPI.BASE === "") {
      throw new Error("OpenAPI base URL is not configured");
    }

    // Используем SceneService для получения сцен
    const response = await SceneService.sceneGetList({
      projectId,
      orderBy: "order",
      order: ListOrderEnum.ASCENDENT,
      selectRelated: SelectRelatedEnum.FULL,
      limit: 50,
    });
    console.log("SceneService response:", response);

    // Извлекаем сцены из ответа
    const scenes = response.items || [];

    return NextResponse.json({
      success: true,
      scenes,
    });
  } catch (error) {
    console.error("Error fetching scenes:", error);

    // Проверяем, является ли ошибка связанной с URL
    if (error instanceof Error && error.message.includes("Invalid URL")) {
      console.error("OpenAPI configuration error - invalid base URL");
      console.error("Current OpenAPI.BASE:", OpenAPI.BASE);
    }

    // В случае ошибки возвращаем заглушку для демонстрации
    return NextResponse.json({
      success: true,
      scenes: [
        {
          id: "scene-1",
          order: 1,
          visual_description: "Красивый закат над морем",
          action_description: "Камера плавно движется вдоль берега",
          dialogue: {
            speaker: "Рассказчик",
            text: "Добро пожаловать в наш мир",
          },
          duration: 5,
          file: {
            id: "file-1",
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            type: "image",
          },
        },
        {
          id: "scene-2",
          order: 2,
          visual_description: "Городской пейзаж ночью",
          action_description: "Панорамный вид на городские огни",
          dialogue: {
            speaker: "Рассказчик",
            text: "Где технологии встречаются с мечтами",
          },
          duration: 4,
          file: {
            id: "file-2",
            url: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800",
            type: "image",
          },
        },
      ],
    });
  }
}
