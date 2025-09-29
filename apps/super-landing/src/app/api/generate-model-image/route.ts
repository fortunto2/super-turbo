import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  configureSuperduperAI,
  getSuperduperAIConfig,
} from "@/lib/config/superduperai";

// Схема запроса для генерации изображений с моделью
const modelImageGenerationSchema = z.object({
  generationId: z.string().optional(), // Делаем необязательным
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
  createdAt: z.string().optional(), // Делаем необязательным
  paymentSessionId: z.string().optional(), // ID сессии оплаты для прямой оплаты
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
  // Новые поля для поддержки image-to-image
  imageFile: z.unknown().optional(), // File object
  generationType: z
    .enum([
      "text-to-image",
      "image-to-image",
      "text-to-video",
      "image-to-video",
    ])
    .default("text-to-image"),
});

type ModelImageGenerationData = z.infer<typeof modelImageGenerationSchema>;

import {
  saveGenerationData,
  loadGenerationData,
  type GenerationData,
} from "@/lib/generation-store";

// Функция для преобразования ModelImageGenerationData в GenerationData
function saveImageGenerationData(data: ModelImageGenerationData) {
  // Проверяем, что generationId существует
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
    modelType: "image",
    paymentSessionId: data.paymentSessionId,
    createdAt: data.createdAt ?? new Date().toISOString(),
    error: data.error,
    images: data.images?.map((img) => ({
      fileId: img.fileId,
      status: img.status,
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
    })),
    generationType: data.generationType,
  };

  saveGenerationData(generationData);
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
    generation_config_name: "azure-openai/gpt-image-1",
    width: 1024,
    height: 1024,
    aspectRatio: "1:1",
    // OpenAI GPT-Image-1 не требует style/shot_size — не отправляем эти поля
    // style: undefined,
    // shotSize: undefined,
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
  },
  generationType = "text-to-image",
  imageFile?: File
): Promise<string[]> {
  console.log("🎨 Starting model image generation:", {
    prompt,
    modelName,
    imageCount,
    generationType,
    hasImageFile: !!imageFile,
  });

  // Конфигурируем SuperDuperAI клиент
  configureSuperduperAI();
  const config = getSuperduperAIConfig();

  // Получаем конфигурацию модели
  const modelSettings =
    IMAGE_MODEL_CONFIGS[modelName as keyof typeof IMAGE_MODEL_CONFIGS] ??
    IMAGE_MODEL_CONFIGS.default;
  const finalConfig = { ...modelSettings, ...modelConfig };

  const fileIds = [];

  for (let i = 0; i < imageCount; i++) {
    try {
      let payload: {
        type: string;
        template_name: string | null;
        config: {
          prompt: string;
          negative_prompt: string;
          width: number;
          height: number;
          aspect_ratio: string;
          seed: number;
          generation_config_name: string;
          entity_ids: string[];
          references: { type: string; reference_id: string }[];
          shot_size?: string;
          qualityType?: string;
          style_name?: string;
        };
      };

      if (generationType === "image-to-image" && imageFile) {
        // Для image-to-image нужно загрузить файл и использовать его ID
        console.log("📤 Uploading image file for image-to-image generation...");

        // Создаем FormData для загрузки изображения
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.token}`,
            "User-Agent": "SuperDuperAI-Landing/1.0",
          },
          body: uploadFormData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload image: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();
        const referenceImageId = uploadResult.id;

        // console.log("✅ Image uploaded successfully, ID:", referenceImageId);

        // Создаем payload для image-to-image
        payload = {
          type: "media",
          template_name: null,
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
              Math.floor(Math.random() * 1000),
            generation_config_name: finalConfig.generation_config_name,
            entity_ids: [],
            references: referenceImageId
              ? [
                  {
                    type: "source",
                    reference_id: referenceImageId,
                  },
                ]
              : [],
            ...(finalConfig.shotSize && { shot_size: finalConfig.shotSize }),
            ...(finalConfig.style && { style_name: finalConfig.style }),
            ...(finalConfig.style && { qualityType: "hd" }),
          },
        };
      } else {
        // Для text-to-image используем стандартный payload
        payload = {
          type: "media",
          template_name: null,
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
              Math.floor(Math.random() * 1000),
            generation_config_name: finalConfig.generation_config_name,
            entity_ids: [],
            references: [],
            ...(finalConfig.shotSize && { shot_size: finalConfig.shotSize }),
            ...(finalConfig.style && { style_name: finalConfig.style }),
            ...(finalConfig.style && { qualityType: "hd" }),
          },
        };
      }

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

      let result: { id?: string } | { id: string }[];

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
          result = await retryResponse.json();
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
        fileId = result[0]?.id ?? "";
      } else if (!Array.isArray(result) && result.id) {
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
      if (latestTask.status === "completed") {
        // Если задача завершена, но URL еще нет, файл может быть в процессе обработки
        return { status: "processing" };
      }
    }

    // Для изображений без задач или с пустыми тасками
    // Проверяем тип файла и другие признаки
    if (fileData.type === "image") {
      // Если это изображение и нет URL, но есть ID, значит оно еще обрабатывается
      if (fileData.id && !fileData.url) {
        return { status: "processing" };
      }
    }

    // Если нет задач или они не завершены, файл все еще обрабатывается
    return { status: "processing" };
  } catch (error) {
    console.error(`❌ Error checking file ${fileId}:`, error);
    return { status: "error" };
  }
}

// POST - Создаем/запускаем генерацию изображений
export async function POST(request: NextRequest) {
  try {
    let body: {
      modelName: string;
      prompt: string;
      paymentSessionId?: string;
      generationType?: string;
      imageCount?: number;
      [key: string]: string | number | undefined;
    };
    let imageFile: File | undefined;

    // Проверяем Content-Type для определения типа запроса
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Обрабатываем FormData
      const formData = await request.formData();
      body = {
        modelName: formData.get("modelName") as string,
        prompt: formData.get("prompt") as string,
        paymentSessionId: formData.get("paymentSessionId") as string,
        generationType: formData.get("generationType") as string,
        imageCount: 1,
      };

      // Получаем файл изображения
      const file = formData.get("imageFile") as File;
      imageFile = file;
      console.log("📁 Received image file:", file.name, file.size, file.type);
    } else {
      // Обрабатываем JSON
      body = await request.json();
    }

    console.log("🎨 Model image generation request:", body);

    // Валидируем данные запроса
    const validatedData = modelImageGenerationSchema.parse(body);

    // Автоматически генерируем недостающие поля
    const finalData = {
      ...validatedData,
      generationId: validatedData.generationId ?? `gen_${Date.now()}`,
      createdAt: validatedData.createdAt ?? new Date().toISOString(),
      imageFile: imageFile ?? validatedData.imageFile,
    };

    // Проверяем оплату для прямой оплаты
    if (finalData.paymentSessionId) {
      console.log("💳 Checking payment session:", finalData.paymentSessionId);

      // Здесь можно добавить проверку статуса оплаты через Stripe API
      // Пока что просто логируем и продолжаем
      console.log("✅ Payment session provided, proceeding with generation...");
    } else {
      console.log(
        "⚠️ No payment session ID provided, but continuing for demo purposes"
      );
    }

    // Стабильный userId: cookie → fallback IP
    const cookieUid = request.cookies.get("superduperai_uid")?.value;
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
    const _userId = cookieUid ? `demo-user-${cookieUid}` : `demo-user-${ip}`;

    // console.log("✅ Starting image generation...");

    // Запускаем генерацию изображений с SuperDuperAI
    try {
      const fileIds = await generateImageWithModel(
        finalData.prompt,
        finalData.modelName,
        finalData.imageCount,
        finalData.modelConfig,
        finalData.generationType,
        finalData.imageFile
      );

      // Логируем успешную генерацию для прямой оплаты
      console.log(
        `✅ Image generation completed for payment session: ${finalData.paymentSessionId ?? "demo"}`
      );

      // Создаем записи изображений с fileIds
      const images = fileIds.map((fileId) => ({
        fileId,
        status: "processing" as const,
        url: undefined,
        thumbnailUrl: undefined,
      }));

      // Обновляем данные генерации с file IDs
      const updatedData: ModelImageGenerationData = {
        ...finalData,
        status: "processing",
        progress: 10, // Начальный прогресс
        images,
      };

      // Сохраняем в общее хранилище
      saveImageGenerationData(updatedData);

      console.log("🎨 Model image generation started:", {
        success: true,
        generationId: finalData.generationId,
        modelName: finalData.modelName,
        fileIds,
        status: "started",
        estimatedTime: finalData.imageCount * 30, // 30 секунд на изображение
        message: "Model image generation started",
      });

      return NextResponse.json({
        success: true,
        generationId: finalData.generationId,
        taskId: fileIds[0], // Возвращаем первый fileId как taskId
        modelName: finalData.modelName,
        fileIds,
        status: "started",
        estimatedTime: finalData.imageCount * 30,
        message: "Model image generation started",
      });
    } catch (error) {
      console.error("❌ Model image generation error:", error);

      // Сохраняем состояние ошибки
      const errorData: ModelImageGenerationData = {
        ...finalData,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      };

      saveImageGenerationData(errorData);

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

    // Загружаем данные генерации из общего хранилища
    const generationData = loadGenerationData(generationId);

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
        imageCount: generationData.images?.length ?? 1, // Добавляем недостающее поле
        modelConfig: generationData.modelConfig ?? {}, // Добавляем недостающее поле
        // Убеждаемся, что generationType имеет правильный тип для изображений
        generationType:
          (generationData.generationType as
            | "text-to-image"
            | "image-to-image") ?? "text-to-image",
      };

      saveImageGenerationData(updatedData);

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
    // console.error("❌ Status check error:", error);

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
