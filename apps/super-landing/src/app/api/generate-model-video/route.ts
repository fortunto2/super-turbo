import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Убираем импорт generateVideoWithStrategy и создаем собственную функцию
import {
  getSuperduperAIConfig,
  configureSuperduperAI,
} from "@/lib/config/superduperai";

// Добавляем импорт для работы с session data
import { getSessionData, type SessionData } from "@/lib/kv";

// Функция для генерации видео с SuperDuperAI API
async function generateVideoWithSuperDuperAI(
  prompt: string,
  modelName: string,
  modelConfig?: {
    width?: number;
    height?: number;
    aspectRatio?: string;
    duration?: number;
    frameRate?: number;
    style?: string;
    shotSize?: string;
  },
  imageFile?: File,
  generationType: "text-to-video" | "image-to-video" = "text-to-video"
): Promise<{ success: boolean; fileId?: string; error?: string }> {
  console.log("🎬 Starting video generation with SuperDuperAI:", {
    prompt,
    modelName,
    modelConfig,
  });

  try {
    // Конфигурируем SuperDuperAI клиент
    configureSuperduperAI();
    const config = getSuperduperAIConfig();

    // Получаем конфигурацию модели
    const mappedModelName = mapModelNameToConfig(modelName, generationType);
    const finalConfig = {
      generation_config_name: mappedModelName,
      width: modelConfig?.width || 1280,
      height: modelConfig?.height || 720,
      aspectRatio: modelConfig?.aspectRatio || "16:9",
      duration: modelConfig?.duration || 8,
      frameRate: modelConfig?.frameRate || 30,
      style: modelConfig?.style || "flux_watercolor",
      shotSize: modelConfig?.shotSize || "medium_shot",
    };

    // Если есть изображение, загружаем его в SuperDuperAI
    let imageFileId: string | undefined;
    if (imageFile && generationType === "image-to-video") {
      console.log("🖼️ Image file provided for image-to-video generation:", {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
      });

      try {
        // Загружаем изображение в SuperDuperAI
        const imageFormData = new FormData();
        imageFormData.append("payload", imageFile, imageFile.name);
        imageFormData.append("type", "image");

        const imageUploadResponse = await fetch(
          `${config.url}/api/v1/file/upload`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.token}`,
              "User-Agent": "SuperDuperAI-Landing/1.0",
            },
            body: imageFormData,
          }
        );

        if (imageUploadResponse.ok) {
          const imageUploadResult = await imageUploadResponse.json();
          imageFileId = imageUploadResult.id;
          console.log("✅ Image uploaded successfully, file ID:", imageFileId);
        } else {
          console.error(
            "❌ Failed to upload image:",
            await imageUploadResponse.text()
          );
        }
      } catch (error) {
        console.error("❌ Error uploading image:", error);
      }
    }

    // Создаем payload в правильном формате
    const payload = {
      type: "media",
      template_name: null,
      config: {
        prompt,
        negative_prompt: "",
        width: finalConfig.width || 1280,
        height: finalConfig.height || 720,
        aspect_ratio: finalConfig.aspectRatio || "16:9",
        duration: finalConfig.duration || 8,
        frame_rate: finalConfig.frameRate || 30,
        shot_size: finalConfig.shotSize || "medium_shot",
        style_name: finalConfig.style || "flux_watercolor",
        seed: Math.floor(Math.random() * 1000000000000),
        generation_config_name: finalConfig.generation_config_name,
        entity_ids: [],
        references: imageFileId
          ? [
              {
                type: "source",
                reference_id: imageFileId,
              },
            ]
          : ([] as string[]),
      },
    };

    console.log(
      "📤 Sending video generation request to SuperDuperAI:",
      payload
    );

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
      return { success: false, error: errorText };
    }

    const result = await response.json();
    console.log("📨 Video generation API Response:", result);

    if (result.id) {
      console.log("🎬 Video generation started - FileId:", result.id);
      return { success: true, fileId: result.id };
    } else {
      console.error("❌ No file ID in response:", result);
      return { success: false, error: "No file ID in response" };
    }
  } catch (error) {
    console.error("❌ Video generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
import {
  saveGenerationData as saveToGlobalStore,
  loadGenerationData as loadFromGlobalStore,
  GenerationData,
} from "@/lib/generation-store";

// Функция для маппинга названий моделей на правильные конфигурации SuperDuperAI
function mapModelNameToConfig(
  modelName: string,
  generationType: "text-to-video" | "image-to-video"
): string {
  // Нормализуем название модели для поиска
  const normalizedModelName = modelName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9]/g, "");

  const modelMap: Record<string, Record<string, string>> = {
    veo2: {
      "text-to-video": "google-cloud/veo2-text2video",
      "image-to-video": "google-cloud/veo2",
    },
    veo3: {
      "text-to-video": "google-cloud/veo3-text2video",
      "image-to-video": "google-cloud/veo3",
    },
    sora: {
      "text-to-video": "azure-openai/sora",
      "image-to-video": "azure-openai/sora",
    },
    // Добавляем альтернативные названия
    soravideo: {
      "text-to-video": "azure-openai/sora",
      "image-to-video": "azure-openai/sora",
    },
    veo2video: {
      "text-to-video": "google-cloud/veo2-text2video",
      "image-to-video": "google-cloud/veo2",
    },
    veo3video: {
      "text-to-video": "google-cloud/veo3-text2video",
      "image-to-video": "google-cloud/veo3",
    },
    // Добавляем еще больше вариантов
    soravideogenerator: {
      "text-to-video": "azure-openai/sora",
      "image-to-video": "azure-openai/sora",
    },
    veo2videogenerator: {
      "text-to-video": "google-cloud/veo2-text2video",
      "image-to-video": "google-cloud/veo2",
    },
    veo3videogenerator: {
      "text-to-video": "google-cloud/veo3-text2video",
      "image-to-video": "google-cloud/veo3",
    },
  };

  const mappedConfig = modelMap[normalizedModelName]?.[generationType];
  console.log(
    `🎯 Model mapping: "${modelName}" -> "${normalizedModelName}" -> "${mappedConfig || modelName}"`
  );

  return mappedConfig || modelName;
}

// Схема запроса для генерации видео с моделью
const modelVideoGenerationSchema = z.object({
  generationId: z.string().optional(),
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
    .default("pending"),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.string().optional(),
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
  // Новое поле для прямой оплаты
  paymentSessionId: z.string().optional(),
});

type ModelVideoGenerationData = z.infer<typeof modelVideoGenerationSchema>;

// Функция для преобразования ModelVideoGenerationData в GenerationData и сохранения в глобальное хранилище
async function saveVideoGenerationData(data: ModelVideoGenerationData) {
  if (!data.generationId) {
    console.warn("⚠️ Cannot save generation data: generationId is undefined");
    return;
  }

  const generationData: GenerationData = {
    generationId: data.generationId,
    status: data.status,
    progress: data.progress,
    prompt: data.prompt,
    modelName: data.modelName,
    modelType: "video",
    paymentSessionId: data.paymentSessionId,
    createdAt: data.createdAt || new Date().toISOString(),
    error: data.error,
    videoGeneration: data.videos?.[0]
      ? {
          fileId: data.videos[0].fileId,
          status: data.videos[0].status,
          url: data.videos[0].url,
          thumbnailUrl: data.videos[0].thumbnailUrl,
        }
      : undefined,
    generationType: data.generationType,
  };

  await saveToGlobalStore(generationData);
  console.log(
    `💾 Saved video generation data to global store for ${data.generationId}`
  );
}

// Загружаем данные генерации из глобального хранилища
async function loadVideoGenerationData(
  generationId: string
): Promise<ModelVideoGenerationData | null> {
  if (!generationId) {
    console.warn("⚠️ Cannot load generation data: generationId is undefined");
    return null;
  }

  const globalData = await loadFromGlobalStore(generationId);
  if (!globalData) {
    console.log(
      `📂 No generation data found in global store for ${generationId}`
    );
    return null;
  }

  // Преобразуем обратно в ModelVideoGenerationData
  const localData: ModelVideoGenerationData = {
    generationId: globalData.generationId,
    prompt: globalData.prompt,
    modelName: globalData.modelName,
    status: globalData.status,
    progress: globalData.progress,
    createdAt: globalData.createdAt || new Date().toISOString(),
    paymentSessionId: globalData.paymentSessionId,
    videoCount: 1, // По умолчанию
    generationType:
      (globalData.generationType as "text-to-video" | "image-to-video") ||
      "text-to-video",
    videos: globalData.videoGeneration
      ? [
          {
            fileId: globalData.videoGeneration.fileId,
            status: globalData.videoGeneration.status,
            url: globalData.videoGeneration.url,
            thumbnailUrl: globalData.videoGeneration.thumbnailUrl,
          },
        ]
      : [],
  };

  console.log(
    `📂 Loaded video generation data from global store for ${generationId}`
  );
  return localData;
}

// POST - Создаем/запускаем генерацию видео
export async function POST(request: NextRequest) {
  try {
    let generationId: string;
    let prompt: string;
    let modelName: string;
    let modelConfigStr: string;
    let videoCount: number;
    let status: string;
    let progress: number;
    let createdAt: string;
    let generationType: "text-to-video" | "image-to-video";
    let imageFile: File | null = null;
    let paymentSessionId: string | null = null;

    // Проверяем Content-Type для определения формата данных
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      // Обрабатываем JSON данные
      const jsonData = await request.json();
      generationId = jsonData.generationId || `gen_${Date.now()}`;
      prompt = jsonData.prompt || "";
      modelName = jsonData.modelName || "Unknown Model";
      modelConfigStr = jsonData.modelConfig
        ? JSON.stringify(jsonData.modelConfig)
        : "{}";
      videoCount = jsonData.videoCount || 1;
      status = jsonData.status || "pending";
      progress = jsonData.progress || 0;
      createdAt = jsonData.createdAt || new Date().toISOString();
      generationType = jsonData.generationType || "text-to-video";
      paymentSessionId = jsonData.paymentSessionId || null;
    } else {
      // Обрабатываем FormData (для обратной совместимости)
      const formData = await request.formData();
      generationId = formData.get("generationId") as string;
      prompt = formData.get("prompt") as string;
      modelName = formData.get("modelName") as string;
      modelConfigStr = formData.get("modelConfig") as string;
      videoCount = parseInt(formData.get("videoCount") as string);
      status = formData.get("status") as string;
      progress = parseInt(formData.get("progress") as string);
      createdAt = formData.get("createdAt") as string;
      generationType = formData.get("generationType") as
        | "text-to-video"
        | "image-to-video";
      imageFile = formData.get("imageFile") as File | null;
      paymentSessionId = formData.get("paymentSessionId") as string;
    }

    console.log("🎬 Model video generation request:", {
      generationId,
      prompt,
      modelName,
      generationType,
      hasImageFile: !!imageFile,
    });

    if (imageFile) {
      console.log("🎬 Image file received:", {
        fileName: imageFile.name,
        fileType: imageFile.type,
        fileSize: imageFile.size,
      });
    }

    // Парсим modelConfig
    let modelConfig;
    try {
      modelConfig = JSON.parse(modelConfigStr);
    } catch {
      modelConfig = {};
    }

    // Валидируем данные запроса
    const validatedData = modelVideoGenerationSchema.parse({
      generationId: generationId || `gen_${Date.now()}`,
      prompt,
      modelName,
      modelConfig: modelConfig || {},
      videoCount: isNaN(videoCount) ? 1 : videoCount || 1,
      status: status || "pending",
      progress: isNaN(progress) ? 0 : progress || 0,
      createdAt: createdAt || new Date().toISOString(),
      generationType,
      imageFile,
      paymentSessionId,
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

    // const operationType =
    //   generationType === "image-to-video" ? "image-to-video" : "text-to-video";

    // Стабильный userId: cookie → fallback IP
    const cookieUid = request.cookies.get("superduperai_uid")?.value;
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";
    const userId = cookieUid ? `demo-user-${cookieUid}` : `demo-user-${ip}`;

    console.log(
      `🎬 Video generation API - uid: ${cookieUid ?? "(no-cookie)"}, ip: ${ip}, userId: ${userId}`
    );

    // Проверяем оплату для прямой оплаты
    let sessionData: SessionData | null = null;
    if (paymentSessionId) {
      console.log("💳 Checking payment session:", paymentSessionId);

      // Получаем session data для определения типа генерации
      sessionData = await getSessionData(paymentSessionId);
      if (sessionData) {
        console.log("📊 Retrieved session data:", {
          promptLength: sessionData.prompt.length,
          generationType: sessionData.generationType,
          modelName: sessionData.modelName,
        });

        // Используем информацию о типе генерации из session data, если она доступна
        if (sessionData?.generationType && !generationType) {
          generationType = sessionData.generationType as
            | "text-to-video"
            | "image-to-video";
          console.log(
            "🎯 Using generation type from session data:",
            generationType
          );
        }
      }
    } else {
      console.log(
        "⚠️ No payment session ID provided, but continuing for demo purposes"
      );
    }

    console.log("✅ Starting video generation...");

    // Запускаем генерацию видео с помощью нашей собственной функции
    try {
      const _config = getSuperduperAIConfig();
      let result;

      // Маппим название модели на правильную конфигурацию SuperDuperAI
      const mappedModelName = mapModelNameToConfig(modelName, generationType);
      console.log(`🎬 Model mapping details:`);
      console.log(`   Original: "${modelName}"`);
      console.log(`   Generation type: "${generationType}"`);
      console.log(`   Mapped to: "${mappedModelName}"`);

      // Логируем информацию о типе генерации для отладки
      console.log("🎬 Generation type analysis:", {
        generationType,
        hasImageFile: !!imageFile,
        sessionDataGenerationType: sessionData?.generationType,
      });

      if (generationType === "image-to-video" && imageFile) {
        // Image-to-video генерация
        console.log("🖼️ Starting image-to-video generation with file");
        console.log("📁 File details:", {
          fileName: imageFile.name,
          fileType: imageFile.type,
          fileSize: imageFile.size,
          hasFile: !!imageFile,
        });

        // Для Sora используем только допустимые значения duration: 5, 10, 15, 20
        let duration = modelConfig?.maxDuration || 8;
        if (mappedModelName === "azure-openai/sora") {
          // Ближайшее допустимое значение для Sora
          if (duration <= 5) duration = 5;
          else if (duration <= 10) duration = 10;
          else if (duration <= 15) duration = 15;
          else duration = 20;
        }

        result = await generateVideoWithSuperDuperAI(
          prompt,
          modelName,
          {
            width: modelConfig?.width || 1280,
            height: modelConfig?.height || 720,
            aspectRatio: modelConfig?.aspectRatio || "16:9",
            duration: duration,
            frameRate: modelConfig?.frameRate || 30,
            style: "flux_watercolor",
            shotSize: "medium_shot",
          },
          imageFile,
          "image-to-video"
        );
      } else {
        // Text-to-video генерация
        console.log("📝 Starting text-to-video generation");

        // Для Sora используем только допустимые значения duration: 5, 10, 15, 20
        let duration = modelConfig?.maxDuration || 8;
        if (mappedModelName === "azure-openai/sora") {
          // Ближайшее допустимое значение для Sora
          if (duration <= 5) duration = 5;
          else if (duration <= 10) duration = 10;
          else if (duration <= 15) duration = 15;
          else duration = 20;
        }

        result = await generateVideoWithSuperDuperAI(
          prompt,
          modelName,
          {
            width: modelConfig?.width || 1280,
            height: modelConfig?.height || 720,
            aspectRatio: modelConfig?.aspectRatio || "16:9",
            duration: duration,
            frameRate: modelConfig?.frameRate || 30,
            style: "flux_watercolor",
            shotSize: "medium_shot",
          },
          undefined,
          "text-to-video"
        );
      }

      if (!result.success) {
        throw new Error(result.error);
      }

      // Списываем баланс после успешной генерации
      try {
        // await deductOperationBalance(
        //   userId, // Используем тот же userId на основе IP
        //   "video-generation",
        //   operationType,
        //   multipliers,
        //   {
        //     projectId: result.projectId,
        //     fileId: result.fileId,
        //     prompt: prompt.substring(0, 100),
        //     operationType,
        //     duration,
        //     resolution: `${width}x${modelConfig?.height || 720}`,
        //     timestamp: new Date().toISOString(),
        //   }
        // );
        // console.log(
        //   `💳 Balance deducted for user ${userId} after successful video generation`
        // );
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

      // Сохраняем в общее хранилище
      await saveVideoGenerationData(updatedData);

      // Проверяем, что данные действительно сохранились
      console.log("🔍 Verifying data was saved...");
      if (validatedData.generationId) {
        const savedData = await loadVideoGenerationData(
          validatedData.generationId
        );
        console.log(
          "🔍 Saved data verification:",
          savedData ? "SUCCESS" : "FAILED"
        );
      }

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
        taskId: result.fileId, // Возвращаем реальный fileId как taskId
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

      await saveVideoGenerationData(errorData);

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

    // Загружаем данные генерации из глобального хранилища
    const generationData = await loadVideoGenerationData(generationId);

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

      await saveVideoGenerationData(updatedData);

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
