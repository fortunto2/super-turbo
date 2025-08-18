import { NextRequest, NextResponse } from "next/server";
import { getSuperduperAIConfig } from "@/lib/config/superduperai";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ generationId: string }> }
) {
  try {
    const { generationId } = await params;
    const config = getSuperduperAIConfig();

    // Получаем fileId из generationId
    // В нашем случае generationId это fileId из SuperDuperAI
    const fileId = generationId;

    console.log(`🔄 Checking status for file: ${fileId}`);

    try {
      // Получаем статус файла из SuperDuperAI API
      const response = await fetch(`${config.url}/api/v1/file/${fileId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
        },
      });

      if (!response.ok) {
        console.error(`❌ Failed to get file status: ${response.status}`);

        // Если файл не найден (404), он может еще генерироваться
        if (response.status === 404) {
          return NextResponse.json({
            status: "in_progress",
            progress: 50,
            message: "File not found - may still be processing",
            estimatedTime: 30,
          });
        }

        // Для других ошибок возвращаем in_progress
        return NextResponse.json({
          status: "in_progress",
          progress: 50,
          message: "Checking generation status...",
          estimatedTime: 30,
        });
      }

      const fileData = await response.json();
      console.log(`📁 File ${fileId} status:`, fileData);

      // Проверяем, завершен ли файл
      if (fileData.url) {
        // Файл готов
        return NextResponse.json({
          status: "completed",
          result: {
            videoUrl: fileData.url,
            thumbnailUrl: fileData.thumbnail_url,
            duration: fileData.duration,
            width: fileData.video_generation?.width || 1280,
            height: fileData.video_generation?.height || 720,
          },
        });
      }

      // Проверяем статус задачи
      if (fileData.tasks && fileData.tasks.length > 0) {
        const latestTask = fileData.tasks[fileData.tasks.length - 1];

        if (latestTask.status === "error") {
          return NextResponse.json({
            status: "failed",
            error: "File generation failed",
          });
        }

        if (latestTask.status === "in_progress") {
          return NextResponse.json({
            status: "in_progress",
            progress: 75,
            message: "Generating video...",
            estimatedTime: 15,
          });
        }

        if (latestTask.status === "completed") {
          // Если задача завершена, но URL еще нет, файл может быть в процессе обработки
          return NextResponse.json({
            status: "in_progress",
            progress: 90,
            message: "Finalizing video...",
            estimatedTime: 5,
          });
        }
      }

      // Если нет задач или они не завершены, файл все еще обрабатывается
      return NextResponse.json({
        status: "in_progress",
        progress: 50,
        message: "Processing video...",
        estimatedTime: 30,
      });
    } catch (error) {
      console.error("Error getting file status from SuperDuperAI:", error);

      // Fallback к заглушке если не удалось получить статус
      return NextResponse.json({
        status: "in_progress",
        progress: 50,
        message: "Checking generation status...",
        estimatedTime: 30,
      });
    }
  } catch (error) {
    console.error("Error getting generation status:", error);
    return NextResponse.json(
      { error: "Failed to get generation status" },
      { status: 500 }
    );
  }
}
