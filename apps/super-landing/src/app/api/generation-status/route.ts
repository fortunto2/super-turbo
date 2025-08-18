import { NextRequest, NextResponse } from "next/server";
import { getSuperduperAIConfig } from "@/lib/config/superduperai";

// Функция для проверки статуса файла в SuperDuperAI
async function checkFileStatus(fileId: string) {
  const config = getSuperduperAIConfig();

  try {
    const response = await fetch(`${config.url}/api/v1/file/${fileId}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
        "User-Agent": "SuperDuperAI-Landing/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`📊 File status response:`, data);

    // Определяем статус на основе ответа
    if (data.url) {
      return {
        status: "completed",
        url: data.url,
        thumbnailUrl: data.thumbnail_url,
      };
    } else if (data.tasks && data.tasks.length > 0) {
      const task = data.tasks[0];
      if (task.status === "in_progress") {
        return { status: "processing" };
      } else if (task.status === "error") {
        return { status: "error" };
      }
    }

    return { status: "processing" };
  } catch (error) {
    console.error("❌ Error checking file status:", error);
    return { status: "error" };
  }
}

// GET - Проверяем статус генерации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        {
          success: false,
          error: "Task ID is required",
        },
        { status: 400 }
      );
    }

    console.log(`🔍 Checking generation status for taskId: ${taskId}`);

    // Извлекаем fileId из taskId
    // Теперь taskId должен быть реальным fileId из SuperDuperAI
    const fileId = taskId;

    // Проверяем статус файла в SuperDuperAI
    const fileStatus = await checkFileStatus(fileId);

    console.log(`📊 File status:`, fileStatus);

    if (fileStatus.status === "completed") {
      return NextResponse.json({
        success: true,
        status: "completed",
        result: {
          url: fileStatus.url,
          thumbnailUrl: fileStatus.thumbnailUrl,
        },
      });
    } else if (fileStatus.status === "error") {
      return NextResponse.json({
        success: true,
        status: "failed",
        error: "Generation failed",
      });
    } else {
      return NextResponse.json({
        success: true,
        status: "processing",
        progress: 50, // Примерный прогресс
      });
    }
  } catch (error) {
    console.error("❌ Status check error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to check generation status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
