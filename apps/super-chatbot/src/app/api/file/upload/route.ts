import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { FileTypeEnum } from "@turbo-super/api";

/**
 * API endpoint для загрузки файлов
 */
export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Получаем query параметры
    const { searchParams } = new URL(request.url);
    const type =
      (searchParams.get("type") as FileTypeEnum) || FileTypeEnum.IMAGE;
    const projectId = searchParams.get("project_id");
    const entityId = searchParams.get("entity_id");
    const sceneId = searchParams.get("scene_id");

    // Получаем файл из FormData
    const formData = await request.formData();
    const file = formData.get("payload") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Создаем FormData для SuperDuperAI API
    const uploadFormData = new FormData();
    uploadFormData.append("payload", file);
    uploadFormData.append("type", type);

    // Строим URL с дополнительными параметрами
    const queryParams = new URLSearchParams();
    if (projectId) queryParams.set("project_id", projectId);
    if (entityId) queryParams.set("entity_id", entityId);
    if (sceneId) queryParams.set("scene_id", sceneId);

    const apiUrl = `${process.env.SUPERDUPERAI_URL}/api/v1/file/upload?${queryParams.toString()}`;

    // Отправляем запрос к SuperDuperAI API
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPERDUPERAI_TOKEN}`,
        Accept: "application/json",
      },
      body: uploadFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Upload failed: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("File upload error:", error);

    if (error.status === 422) {
      return NextResponse.json(
        { error: "Validation Error", details: error.body || error.message },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Upload failed", details: error.message },
      { status: 500 }
    );
  }
}
