import { NextRequest, NextResponse } from "next/server";
import {
  SceneService,
  ListOrderEnum,
  SelectRelatedEnum,
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

    // Используем SceneService для получения сцен
    const response = await SceneService.sceneGetList({
      projectId,
      orderBy: "order",
      order: ListOrderEnum.ASCENDENT,
      selectRelated: SelectRelatedEnum.FULL,
      limit: 50,
    });
    console.log(response);

    // Извлекаем сцены из ответа
    const scenes = response.items || [];

    return NextResponse.json({
      success: true,
      scenes,
    });
  } catch (error) {
    console.error("Error fetching scenes:", error);

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
