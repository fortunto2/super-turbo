import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { writeFile, readFile } from "fs/promises";
import { join } from "path";
import {
  configureSuperduperAI,
  getSuperduperAIConfig,
} from "@/lib/config/superduperai";

// Схема запроса для генерации видео с моделью
const modelVideoGenerationSchema = z.object({
  generationId: z.string(),
  prompt: z.string().min(1, "Prompt is required"),
  modelName: z.string().min(1, "Model name is required"),
  modelConfig: z
    .object({
      maxDuration: z.number().optional(),
      aspectRatio: z.string().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      frameRate: z.number().optional(),
    })
    .optional(),
  videoCount: z.number().min(1).max(3).default(1),
  status: z
    .enum(["pending", "processing", "completed", "error"])
    .default("processing"),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.string(),
  paymentIntentId: z.string().optional(),
  sessionId: z.string().optional(),
  customerEmail: z.string().optional(),
  videos: z
    .array(
      z.object({
        fileId: z.string(),
        url: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        status: z
          .enum(["pending", "processing", "completed", "error"])
          .default("processing"),
      })
    )
    .optional(),
  error: z.string().optional(),
});

type ModelVideoGenerationData = z.infer<typeof modelVideoGenerationSchema>;

// Пути для хранения данных генерации
const STORAGE_DIR = join(process.cwd(), ".model-video-generations");
const getGenerationFilePath = (generationId: string) =>
  join(STORAGE_DIR, `${generationId}.json`);

// Обеспечиваем существование директории хранения
async function ensureStorageDir() {
  try {
    const fs = await import("fs");
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
  } catch (error) {
    console.error("Error creating storage directory:", error);
  }
}

// Сохраняем данные генерации в файл
async function saveGenerationData(data: ModelVideoGenerationData) {
  await ensureStorageDir();
  const filePath = getGenerationFilePath(data.generationId);
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

// Загружаем данные генерации из файла
async function loadGenerationData(
  generationId: string
): Promise<ModelVideoGenerationData | null> {
  try {
    const filePath = getGenerationFilePath(generationId);
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Конфигурация моделей - используем правильные названия из SuperDuperAI
const MODEL_CONFIGS = {
  Sora: {
    generation_config_name: "azure-openai/sora",
    maxDuration: 10,
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    frameRate: 30,
  },
  Veo2: {
    generation_config_name: "google-cloud/veo2-text2video",
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
  },
  Veo3: {
    generation_config_name: "google-cloud/veo3-text2video",
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
  },
  default: {
    generation_config_name: "google-cloud/veo3-text2video",
    maxDuration: 8,
    aspectRatio: "16:9",
    width: 1280,
    height: 720,
    frameRate: 30,
  },
};

// Генерируем видео с помощью SuperDuperAI API
async function generateVideoWithModel(
  prompt: string,
  modelName: string,
  videoCount: number,
  modelConfig?: {
    maxDuration?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;
    frameRate?: number;
  }
): Promise<string[]> {
  console.log("🎬 Starting model video generation:", {
    prompt,
    modelName,
    videoCount,
  });

  // Конфигурируем SuperDuperAI клиент
  configureSuperduperAI();
  const config = getSuperduperAIConfig();

  // Получаем конфигурацию модели
  const modelSettings =
    MODEL_CONFIGS[modelName as keyof typeof MODEL_CONFIGS] ||
    MODEL_CONFIGS.default;
  const finalConfig = { ...modelSettings, ...modelConfig };

  const fileIds = [];

  for (let i = 0; i < videoCount; i++) {
    try {
      const payload = {
        type: "media", // CRITICAL: Always use this format
        template_name: null,
        style_name: "flux_watercolor", // Use working style
        config: {
          prompt,
          negative_prompt: "",
          width: finalConfig.width,
          height: finalConfig.height,
          aspect_ratio: finalConfig.aspectRatio,
          seed: Math.floor(Math.random() * 1000000000000),
          generation_config_name: finalConfig.generation_config_name,
          duration: finalConfig.maxDuration,
          frame_rate: finalConfig.frameRate,
          batch_size: 1,
          shot_size: "medium_shot", // Default shot size
          style_name: "flux_watercolor", // Use working style
          qualityType: "hd",
          entity_ids: [],
          references: [],
        },
      };

      console.log("📤 Sending request to SuperDuperAI:", payload);

      const response = await fetch(`${config.url}/api/v1/file/generate-video`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
        },
        body: JSON.stringify(payload),
      });

      console.log(`📡 SuperDuperAI API Response Status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ SuperDuperAI API Error:", errorText);
        throw new Error(
          `SuperDuperAI API failed: ${response.status} - ${errorText}`
        );
      }

      const result = await response.json();
      console.log("✅ SuperDuperAI response:", result);

      // Извлекаем file ID из ответа
      const fileId = result.id;
      if (!fileId) {
        throw new Error("No file ID returned from SuperDuperAI API");
      }

      fileIds.push(fileId);

      console.log(
        `✅ Video ${i + 1}/${videoCount} generation started with fileId: ${fileId}`
      );
    } catch (error) {
      console.error(`❌ Error generating video ${i + 1}:`, error);
      throw error;
    }
  }

  return fileIds;
}

// Проверяем статус файла через SuperDuperAI API
async function checkFileStatus(
  fileId: string
): Promise<{ url?: string; thumbnailUrl?: string; status: string }> {
  try {
    configureSuperduperAI();
    const config = getSuperduperAIConfig();

    const response = await fetch(`${config.url}/api/v1/file/${fileId}`, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        `❌ Failed to check file ${fileId} status:`,
        response.status
      );
      return { status: "error" };
    }

    const fileData = await response.json();
    console.log(`📁 File ${fileId} status:`, fileData);

    // Проверяем, завершен ли файл
    if (fileData.url) {
      return {
        url: fileData.url,
        thumbnailUrl: fileData.thumbnail_url,
        status: "completed",
      };
    }

    // Проверяем статус задачи
    if (fileData.tasks && fileData.tasks.length > 0) {
      const latestTask = fileData.tasks[fileData.tasks.length - 1];
      if (latestTask.status === "error") {
        return { status: "error" };
      }
      if (latestTask.status === "in_progress") {
        return { status: "processing" };
      }
    }

    return { status: "processing" };
  } catch (error) {
    console.error(`❌ Error checking file ${fileId}:`, error);
    return { status: "error" };
  }
}

// POST - Создаем/запускаем генерацию видео
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🎬 Model video generation request:", body);

    // Валидируем данные запроса
    const validatedData = modelVideoGenerationSchema.parse(body);

    // Запускаем генерацию видео с SuperDuperAI
    try {
      const fileIds = await generateVideoWithModel(
        validatedData.prompt,
        validatedData.modelName,
        validatedData.videoCount,
        validatedData.modelConfig
      );

      // Создаем записи видео с fileIds
      const videos = fileIds.map((fileId) => ({
        fileId,
        status: "processing" as const,
        url: undefined,
        thumbnailUrl: undefined,
      }));

      // Обновляем данные генерации с file IDs
      const updatedData: ModelVideoGenerationData = {
        ...validatedData,
        status: "processing",
        progress: 10, // Начальный прогресс
        videos,
      };

      // Сохраняем в файл
      await saveGenerationData(updatedData);

      console.log("🎬 Model video generation started:", {
        success: true,
        generationId: validatedData.generationId,
        modelName: validatedData.modelName,
        fileIds,
        status: "started",
        estimatedTime: validatedData.videoCount * 50, // 50 секунд на видео
        message: "Model video generation started",
      });

      return NextResponse.json({
        success: true,
        generationId: validatedData.generationId,
        modelName: validatedData.modelName,
        fileIds,
        status: "started",
        estimatedTime: validatedData.videoCount * 50,
        message: "Model video generation started",
      });
    } catch (error) {
      console.error("❌ Model video generation error:", error);

      // Сохраняем состояние ошибки
      const errorData: ModelVideoGenerationData = {
        ...validatedData,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      await saveGenerationData(errorData);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to start video generation",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Model video API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request data",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET - Проверяем статус генерации
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const generationId = searchParams.get("generationId");

    if (!generationId) {
      return NextResponse.json(
        {
          success: false,
          error: "Generation ID is required",
        },
        { status: 400 }
      );
    }

    // Загружаем данные генерации
    const generationData = await loadGenerationData(generationId);

    if (!generationData) {
      return NextResponse.json(
        {
          success: false,
          error: "Generation not found",
        },
        { status: 404 }
      );
    }

    // Если генерация все еще обрабатывается, проверяем статус через SuperDuperAI API
    if (generationData.status === "processing" && generationData.videos) {
      let allCompleted = true;
      let totalProgress = 0;
      const updatedVideos = [];

      for (const video of generationData.videos) {
        const fileStatus = await checkFileStatus(video.fileId);

        if (fileStatus.status === "completed" && fileStatus.url) {
          updatedVideos.push({
            ...video,
            url: fileStatus.url,
            thumbnailUrl: fileStatus.thumbnailUrl,
            status: "completed" as const,
          });
          totalProgress += 100;
        } else if (fileStatus.status === "error") {
          updatedVideos.push({
            ...video,
            status: "error" as const,
          });
          totalProgress += 0;
          allCompleted = false;
        } else {
          updatedVideos.push({
            ...video,
            status: "processing" as const,
          });
          totalProgress += 50; // Все еще обрабатывается
          allCompleted = false;
        }
      }

      const averageProgress = Math.round(
        totalProgress / generationData.videos.length
      );

      // Обновляем данные генерации
      const updatedData: ModelVideoGenerationData = {
        ...generationData,
        status: allCompleted ? "completed" : "processing",
        progress: averageProgress,
        videos: updatedVideos,
      };

      await saveGenerationData(updatedData);

      return NextResponse.json({
        success: true,
        ...updatedData,
      });
    }

    return NextResponse.json({
      success: true,
      ...generationData,
    });
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
