import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  configureSuperduperAI,
  getSuperduperAIConfig,
} from "@/lib/config/superduperai";
import { deductOperationBalance } from "@/lib/utils/tools-balance";

// Схема запроса для генерации изображений с моделью
const modelImageGenerationSchema = z.object({
  generationId: z.string(),
  prompt: z.string().min(1, "Prompt is required"),
  modelName: z.string().min(1, "Model name is required"),
  modelConfig: z
    .object({
      width: z.number().optional(),
      height: z.number().optional(),
      aspectRatio: z.string().optional(),
      style: z.string().optional(),
      shotSize: z.string().optional(),
    })
    .optional(),
  imageCount: z.number().min(1).max(3).default(1),
  status: z
    .enum(["pending", "processing", "completed", "error"])
    .default("processing"),
  progress: z.number().min(0).max(100).default(0),
  createdAt: z.string(),
  paymentIntentId: z.string().optional(),
  sessionId: z.string().optional(),
  customerEmail: z.string().optional(),
  images: z
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

type ModelImageGenerationData = z.infer<typeof modelImageGenerationSchema>;

// In-memory хранилище для данных генерации изображений (вместо файлов)
const imageGenerationStore = new Map<string, ModelImageGenerationData>();

// Сохраняем данные генерации в память
async function saveGenerationData(data: ModelImageGenerationData) {
  imageGenerationStore.set(data.generationId, data);
  console.log(`💾 Saved image generation data for ${data.generationId}`);
}

// Загружаем данные генерации из памяти
async function loadGenerationData(
  generationId: string
): Promise<ModelImageGenerationData | null> {
  const data = imageGenerationStore.get(generationId);
  if (data) {
    console.log(`📂 Loaded image generation data for ${generationId}`);
  }
  return data || null;
}

// Конфигурация моделей для изображений
const IMAGE_MODEL_CONFIGS = {
  "Google Imagen 4": {
    generation_config_name: "google-cloud/imagen4",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
    style: "flux_watercolor",
    shotSize: "Medium Shot",
  },
  "GPT-Image-1": {
    generation_config_name: "comfyui/flux",
    width: 1024,
    height: 1024,
    aspectRatio: "1:1",
    style: "flux_realistic",
    shotSize: "Medium Shot",
  },
  "Flux Kontext": {
    generation_config_name: "comfyui/flux",
    width: 1024,
    height: 1024,
    aspectRatio: "1:1",
    style: "flux_steampunk",
    shotSize: "Medium Shot",
  },
  default: {
    generation_config_name: "comfyui/flux",
    width: 1024,
    height: 1024,
    aspectRatio: "1:1",
    style: "flux_watercolor",
    shotSize: "Medium Shot",
  },
};

// Генерируем изображения с помощью SuperDuperAI API
async function generateImageWithModel(
  prompt: string,
  modelName: string,
  imageCount: number,
  modelConfig?: {
    width?: number;
    height?: number;
    aspectRatio?: string;
    style?: string;
    shotSize?: string;
  }
): Promise<string[]> {
  console.log("🎨 Starting model image generation:", {
    prompt,
    modelName,
    imageCount,
  });

  // Конфигурируем SuperDuperAI клиент
  configureSuperduperAI();
  const config = getSuperduperAIConfig();

  // Получаем конфигурацию модели
  const modelSettings =
    IMAGE_MODEL_CONFIGS[modelName as keyof typeof IMAGE_MODEL_CONFIGS] ||
    IMAGE_MODEL_CONFIGS.default;
  const finalConfig = { ...modelSettings, ...modelConfig };

  const fileIds = [];

  for (let i = 0; i < imageCount; i++) {
    try {
      const payload = {
        type: "media",
        template_name: null,
        style_name: finalConfig.style,
        config: {
          prompt,
          negative_prompt: "",
          width: finalConfig.width,
          height: finalConfig.height,
          aspect_ratio: finalConfig.aspectRatio,
          seed:
            Math.floor(Math.random() * 1000000000000) +
            i +
            Date.now() +
            Math.floor(Math.random() * 1000), // Еще более уникальный seed
          generation_config_name: finalConfig.generation_config_name,
          batch_size: 1,
          shot_size: finalConfig.shotSize,
          style_name: finalConfig.style,
          qualityType: "hd",
          entity_ids: [],
          references: [],
        },
      };

      console.log("📤 Sending request to SuperDuperAI:", payload);

      const response = await fetch(`${config.url}/api/v1/file/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
        },
        body: JSON.stringify(payload),
      });

      console.log(`📡 SuperDuperAI API Response Status: ${response.status}`);

      let result: any;

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ SuperDuperAI API Error:", errorText);

        // Обрабатываем ошибку 409 (Integrity error) с повторной попыткой
        if (response.status === 409) {
          console.log("🔄 Retrying due to integrity error...");
          // Ждем немного и повторяем попытку
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Генерируем новый seed для повторной попытки
          const retryPayload = {
            ...payload,
            config: {
              ...payload.config,
              seed: Math.floor(Math.random() * 1000000000000) + Date.now(),
            },
          };

          const retryResponse = await fetch(
            `${config.url}/api/v1/file/generate-image`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${config.token}`,
                "User-Agent": "SuperDuperAI-Landing/1.0",
              },
              body: JSON.stringify(retryPayload),
            }
          );

          if (!retryResponse.ok) {
            const retryErrorText = await retryResponse.text();
            console.error("❌ SuperDuperAI API Retry Error:", retryErrorText);
            throw new Error(
              `SuperDuperAI API failed after retry: ${retryResponse.status} - ${retryErrorText}`
            );
          }

          // Используем результат повторной попытки
          const result = await retryResponse.json();
          console.log("✅ SuperDuperAI retry response:", result);
        } else {
          throw new Error(
            `SuperDuperAI API failed: ${response.status} - ${errorText}`
          );
        }
      } else {
        result = await response.json();
        console.log("✅ SuperDuperAI response:", result);
      }

      // Извлекаем file ID из ответа
      let fileId: string;

      // Проверяем, является ли результат массивом
      if (Array.isArray(result) && result.length > 0) {
        fileId = result[0].id;
      } else if (result.id) {
        fileId = result.id;
      } else {
        throw new Error("No file ID returned from SuperDuperAI API");
      }

      if (!fileId) {
        throw new Error("No file ID returned from SuperDuperAI API");
      }

      fileIds.push(fileId);

      console.log(
        `✅ Image ${i + 1}/${imageCount} generation started with fileId: ${fileId}`
      );
    } catch (error) {
      console.error(`❌ Error generating image ${i + 1}:`, error);
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

// POST - Создаем/запускаем генерацию изображений
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("🎨 Model image generation request:", body);

    // Валидируем данные запроса
    const validatedData = modelImageGenerationSchema.parse(body);

    // Проверяем баланс ПЕРЕД началом генерации
    const multipliers: string[] = [];

    // Множители качества
    const width = validatedData.modelConfig?.width || 1024;
    if (width >= 2048) {
      multipliers.push("ultra-quality");
    } else if (width >= 1536) {
      multipliers.push("high-quality");
    } else {
      multipliers.push("standard-quality"); // Стандартное качество по умолчанию
    }

    // Проверяем баланс перед генерацией
    const { validateOperationBalance } = await import(
      "@/lib/utils/tools-balance"
    );
    const balanceCheck = await validateOperationBalance(
      "demo-user",
      "image-generation",
      "text-to-image",
      multipliers
    );

    if (!balanceCheck.valid) {
      console.log(
        "❌ Insufficient balance for image generation:",
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

    console.log("✅ Balance check passed, starting image generation...");

    // Запускаем генерацию изображений с SuperDuperAI
    try {
      const fileIds = await generateImageWithModel(
        validatedData.prompt,
        validatedData.modelName,
        validatedData.imageCount,
        validatedData.modelConfig
      );

      // Списываем баланс после успешной генерации
      try {
        // Списываем баланс за каждое изображение
        for (const fileId of fileIds) {
          await deductOperationBalance(
            "demo-user", // В демо-версии используем фиксированный ID
            "image-generation",
            "text-to-image",
            multipliers,
            {
              projectId: fileId,
              fileId: fileId,
              prompt: validatedData.prompt.substring(0, 100),
              operationType: "text-to-image",
              resolution: `${width}x${validatedData.modelConfig?.height || 1024}`,
              timestamp: new Date().toISOString(),
            }
          );
        }
        console.log(
          `💳 Balance deducted for demo user after successful image generation (${fileIds.length} images)`
        );
      } catch (balanceError) {
        console.error(
          "⚠️ Failed to deduct balance after image generation:",
          balanceError
        );
        // Продолжаем - генерация изображений уже завершена
      }

      // Создаем записи изображений с fileIds
      const images = fileIds.map((fileId) => ({
        fileId,
        status: "processing" as const,
        url: undefined,
        thumbnailUrl: undefined,
      }));

      // Обновляем данные генерации с file IDs
      const updatedData: ModelImageGenerationData = {
        ...validatedData,
        status: "processing",
        progress: 10, // Начальный прогресс
        images,
      };

      // Сохраняем в файл
      await saveGenerationData(updatedData);

      console.log("🎨 Model image generation started:", {
        success: true,
        generationId: validatedData.generationId,
        modelName: validatedData.modelName,
        fileIds,
        status: "started",
        estimatedTime: validatedData.imageCount * 30, // 30 секунд на изображение
        message: "Model image generation started",
      });

      return NextResponse.json({
        success: true,
        generationId: validatedData.generationId,
        modelName: validatedData.modelName,
        fileIds,
        status: "started",
        estimatedTime: validatedData.imageCount * 30,
        message: "Model image generation started",
      });
    } catch (error) {
      console.error("❌ Model image generation error:", error);

      // Сохраняем состояние ошибки
      const errorData: ModelImageGenerationData = {
        ...validatedData,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      await saveGenerationData(errorData);

      return NextResponse.json(
        {
          success: false,
          error: "Failed to start image generation",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Model image API error:", error);

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
    if (generationData.status === "processing" && generationData.images) {
      let allCompleted = true;
      let totalProgress = 0;
      const updatedImages = [];

      for (const image of generationData.images) {
        const fileStatus = await checkFileStatus(image.fileId);

        if (fileStatus.status === "completed" && fileStatus.url) {
          updatedImages.push({
            ...image,
            url: fileStatus.url,
            thumbnailUrl: fileStatus.thumbnailUrl,
            status: "completed" as const,
          });
          totalProgress += 100;
        } else if (fileStatus.status === "error") {
          updatedImages.push({
            ...image,
            status: "error" as const,
          });
          totalProgress += 0;
          allCompleted = false;
        } else {
          updatedImages.push({
            ...image,
            status: "processing" as const,
          });
          totalProgress += 50; // Все еще обрабатывается
          allCompleted = false;
        }
      }

      const averageProgress = Math.round(
        totalProgress / generationData.images.length
      );

      // Обновляем данные генерации
      const updatedData: ModelImageGenerationData = {
        ...generationData,
        status: allCompleted ? "completed" : "processing",
        progress: averageProgress,
        images: updatedImages,
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
