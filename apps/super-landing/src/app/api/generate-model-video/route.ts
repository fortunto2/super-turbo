import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateVideoWithStrategy } from "@turbo-super/superduperai-api";
import { getSuperduperAIConfig } from "@/lib/config/superduperai";
import { deductOperationBalance } from "@/lib/utils/tools-balance";

// Функция для маппинга названий моделей на правильные конфигурации SuperDuperAI
function mapModelNameToConfig(
  modelName: string,
  generationType: "text-to-video" | "image-to-video"
): string {
  const modelMap: Record<string, Record<string, string>> = {
    Veo2: {
      "text-to-video": "google-cloud/veo2-text2video",
      "image-to-video": "google-cloud/veo2",
    },
    Veo3: {
      "text-to-video": "google-cloud/veo3-text2video",
      "image-to-video": "google-cloud/veo3",
    },
    Sora: {
      "text-to-video": "azure-openai/sora",
      "image-to-video": "azure-openai/sora",
    },
  };

  return modelMap[modelName]?.[generationType] || modelName;
}

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
  // Новые поля для поддержки изображений
  imageFile: z.any().optional(), // File object
  generationType: z
    .enum(["text-to-video", "image-to-video"])
    .default("text-to-video"),
});

type ModelVideoGenerationData = z.infer<typeof modelVideoGenerationSchema>;

// In-memory хранилище для данных генерации (вместо файлов)
const generationStore = new Map<string, ModelVideoGenerationData>();

// Сохраняем данные генерации в память
async function saveGenerationData(data: ModelVideoGenerationData) {
  generationStore.set(data.generationId, data);
  console.log(`💾 Saved generation data for ${data.generationId}`);
}

// Загружаем данные генерации из памяти
async function loadGenerationData(
  generationId: string
): Promise<ModelVideoGenerationData | null> {
  const data = generationStore.get(generationId);
  if (data) {
    console.log(`📂 Loaded generation data for ${generationId}`);
  }
  return data || null;
}

// POST - Создаем/запускаем генерацию видео
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Извлекаем данные из FormData
    const generationId = formData.get("generationId") as string;
    const prompt = formData.get("prompt") as string;
    const modelName = formData.get("modelName") as string;
    const modelConfigStr = formData.get("modelConfig") as string;
    const videoCount = parseInt(formData.get("videoCount") as string);
    const status = formData.get("status") as string;
    const progress = parseInt(formData.get("progress") as string);
    const createdAt = formData.get("createdAt") as string;
    const generationType = formData.get("generationType") as
      | "text-to-video"
      | "image-to-video";
    const imageFile = formData.get("imageFile") as File | null;

    console.log("🎬 Model video generation request:", {
      generationId,
      prompt,
      modelName,
      generationType,
      hasImageFile: !!imageFile,
    });

    // Парсим modelConfig
    let modelConfig;
    try {
      modelConfig = JSON.parse(modelConfigStr);
    } catch {
      modelConfig = {};
    }

    // Валидируем данные запроса
    const validatedData = modelVideoGenerationSchema.parse({
      generationId,
      prompt,
      modelName,
      modelConfig,
      videoCount,
      status,
      progress,
      createdAt,
      generationType,
      imageFile,
    });

    console.log("✅ Validated data:", {
      generationType: validatedData.generationType,
      hasImageFile: !!validatedData.imageFile,
    });

    // Проверяем баланс ПЕРЕД началом генерации
    const multipliers: string[] = [];

    // Множители длительности
    const duration = modelConfig?.maxDuration || 8;
    if (duration <= 5) multipliers.push("duration-5s");
    else if (duration <= 10) multipliers.push("duration-10s");
    else if (duration <= 15) multipliers.push("duration-15s");
    else if (duration <= 30) multipliers.push("duration-30s");

    // Множители качества
    const width = modelConfig?.width || 1280;
    if (width >= 2160) {
      multipliers.push("4k-quality");
    } else {
      multipliers.push("hd-quality"); // HD по умолчанию
    }

    const operationType =
      generationType === "image-to-video" ? "image-to-video" : "text-to-video";

    // Генерируем стабильный userId на основе IP адреса
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0] || realIp || "unknown";
    const userId = `demo-user-${ip}`;

    console.log(`🎬 Video generation API - IP: ${ip}, userId: ${userId}`);

    // Проверяем баланс перед генерацией
    const { validateOperationBalance } = await import(
      "@/lib/utils/tools-balance"
    );
    const balanceCheck = await validateOperationBalance(
      userId,
      "video-generation",
      operationType,
      multipliers
    );

    if (!balanceCheck.valid) {
      console.log(
        "❌ Insufficient balance for video generation:",
        balanceCheck.error
      );
      return NextResponse.json(
        {
          success: false,
          error: balanceCheck.error || "Insufficient balance",
          balanceRequired: balanceCheck.cost,
        },
        { status: 402 } // Payment Required
      );
    }

    console.log("✅ Balance check passed, starting video generation...");

    // Запускаем генерацию видео с помощью generateVideoWithStrategy
    try {
      const config = getSuperduperAIConfig();
      let result;

      // Маппим название модели на правильную конфигурацию SuperDuperAI
      const mappedModelName = mapModelNameToConfig(modelName, generationType);
      console.log(`🎬 Mapped model name: ${modelName} → ${mappedModelName}`);

      if (generationType === "image-to-video" && imageFile) {
        // Image-to-video генерация
        console.log("🖼️ Starting image-to-video generation with file");
        console.log("📁 File details:", {
          fileName: imageFile.name,
          fileType: imageFile.type,
          fileSize: imageFile.size,
          hasFile: !!imageFile,
        });

        result = await generateVideoWithStrategy(
          "image-to-video",
          {
            prompt,
            file: imageFile,
            model: mappedModelName,
            style: "flux_watercolor",
            resolution: {
              width: modelConfig?.width || 1280,
              height: modelConfig?.height || 720,
            },
            shotSize: "medium_shot",
            duration: modelConfig?.maxDuration || 8,
            frameRate: modelConfig?.frameRate || 30,
            negativePrompt: "",
            seed: Math.floor(Math.random() * 1000000000000),
          },
          config
        );
      } else {
        // Text-to-video генерация
        console.log("📝 Starting text-to-video generation");

        result = await generateVideoWithStrategy(
          "text-to-video",
          {
            prompt,
            model: mappedModelName,
            style: "flux_watercolor",
            resolution: {
              width: modelConfig?.width || 1280,
              height: modelConfig?.height || 720,
            },
            shotSize: "medium_shot",
            duration: modelConfig?.maxDuration || 8,
            frameRate: modelConfig?.frameRate || 30,
            negativePrompt: "",
            seed: Math.floor(Math.random() * 1000000000000),
          },
          config
        );
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      // Списываем баланс после успешной генерации
      try {
        await deductOperationBalance(
          userId, // Используем тот же userId на основе IP
          "video-generation",
          operationType,
          multipliers,
          {
            projectId: result.projectId,
            fileId: result.fileId,
            prompt: prompt.substring(0, 100),
            operationType,
            duration,
            resolution: `${width}x${modelConfig?.height || 720}`,
            timestamp: new Date().toISOString(),
          }
        );
        console.log(
          `💳 Balance deducted for user ${userId} after successful video generation`
        );
      } catch (balanceError) {
        console.error(
          "⚠️ Failed to deduct balance after video generation:",
          balanceError
        );
        // Продолжаем - генерация видео уже запущена
      }

      // Создаем записи видео с fileIds
      const videos = [
        {
          fileId: result.fileId!,
          status: "processing" as const,
          url: undefined,
          thumbnailUrl: undefined,
        },
      ];

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
        fileId: result.fileId,
        status: "started",
        estimatedTime: validatedData.videoCount * 50, // 50 секунд на видео
        message: "Model video generation started",
      });

      return NextResponse.json({
        success: true,
        generationId: validatedData.generationId,
        modelName: validatedData.modelName,
        fileIds: [result.fileId],
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
        // Используем существующую логику проверки статуса из generateVideoWithStrategy
        try {
          const { getSuperduperAIConfig } = await import(
            "@/lib/config/superduperai"
          );
          const config = getSuperduperAIConfig();

          const response = await fetch(
            `${config.url}/api/v1/file/${video.fileId}`,
            {
              headers: {
                Authorization: `Bearer ${config.token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            console.error(
              `❌ Failed to check file ${video.fileId} status:`,
              response.status
            );
            updatedVideos.push({
              ...video,
              status: "error" as const,
            });
            totalProgress += 0;
            allCompleted = false;
            continue;
          }

          const fileData = await response.json();
          console.log(`📁 File ${video.fileId} status:`, fileData);

          // Проверяем, завершен ли файл
          if (fileData.url) {
            updatedVideos.push({
              ...video,
              url: fileData.url,
              thumbnailUrl: fileData.thumbnail_url,
              status: "completed" as const,
            });
            totalProgress += 100;
          } else {
            // Проверяем статус задачи
            if (fileData.tasks && fileData.tasks.length > 0) {
              const latestTask = fileData.tasks[fileData.tasks.length - 1];
              if (latestTask.status === "error") {
                updatedVideos.push({
                  ...video,
                  status: "error" as const,
                });
                totalProgress += 0;
                allCompleted = false;
              } else if (latestTask.status === "in_progress") {
                updatedVideos.push({
                  ...video,
                  status: "processing" as const,
                });
                totalProgress += 50; // Все еще обрабатывается
                allCompleted = false;
              } else {
                updatedVideos.push({
                  ...video,
                  status: "processing" as const,
                });
                totalProgress += 50;
                allCompleted = false;
              }
            } else {
              updatedVideos.push({
                ...video,
                status: "processing" as const,
              });
              totalProgress += 50;
              allCompleted = false;
            }
          }
        } catch (error) {
          console.error(`❌ Error checking file ${video.fileId}:`, error);
          updatedVideos.push({
            ...video,
            status: "error" as const,
          });
          totalProgress += 0;
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
