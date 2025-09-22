import { FileTypeEnum } from "../../../api";
import type {
  ImageToImageParams,
  ImageGenerationStrategy,
} from "../strategy.interface";

export class ImageToImageStrategy implements ImageGenerationStrategy {
  readonly type = "image-to-image";
  readonly requiresSourceImage = true;
  readonly requiresPrompt = true;

  validate(params: ImageToImageParams): { valid: boolean; error?: string } {
    if (!params.file && !params.sourceImageId && !params.sourceImageUrl) {
      return {
        valid: false,
        error: "Source image is required for image-to-image generation",
      };
    }
    if (!params.prompt?.trim()) {
      return {
        valid: false,
        error: "Prompt is required for image-to-image generation",
      };
    }
    return { valid: true };
  }

  async handleImageUpload(
    params: ImageToImageParams,
    config: { url: string; token: string }
  ): Promise<{
    imageId?: string;
    imageUrl?: string;
    method: "upload";
    error?: string;
  }> {
    if (!params.file) {
      return {
        error: "No file provided for upload",
        method: "upload",
      };
    }

    try {
      // Проверяем валидность файла
      if (params.file.size === 0) {
        throw new Error("File is empty");
      }

      if (params.file.size > 50 * 1024 * 1024) {
        throw new Error("File is too large (max 50MB)");
      }

      console.log("📤 Starting image upload using direct fetch...");

      // Создаем FormData для загрузки (только payload, type передается как query параметр)
      const formData = new FormData();
      formData.append("payload", params.file);

      // Отладочная информация
      console.log("📤 FormData entries:");
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            `  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`
          );
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }

      // Строим URL с query параметрами
      const queryParams = new URLSearchParams();
      queryParams.set("type", FileTypeEnum.IMAGE);
      if (params.projectId) queryParams.set("project_id", params.projectId);
      if (params.sceneId) queryParams.set("scene_id", params.sceneId);

      const apiUrl = `${config.url.replace(/\/+$/, "")}/api/v1/file/upload?${queryParams.toString()}`;

      // Отправляем запрос к SuperDuperAI API
      const uploadResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `File upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      const uploadResult = await uploadResponse.json();
      console.log("📤 Image upload result:", uploadResult);

      return {
        imageId: uploadResult?.id,
        imageUrl: uploadResult?.url || undefined,
        method: "upload",
      };
    } catch (error) {
      console.error("Error uploading file", error);
      return {
        error: `Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        method: "upload",
      };
    }
  }

  async handleMaskUpload(
    params: ImageToImageParams,
    config?: { url: string; token: string }
  ): Promise<{
    maskId?: string;
    maskUrl?: string;
    error?: string;
  }> {
    if (!params.mask) {
      return {
        error: "No mask provided for upload",
      };
    }

    if (!config) {
      return {
        error: "Config not provided for mask upload",
      };
    }

    try {
      // Проверяем валидность маски
      if (params.mask.size === 0) {
        throw new Error("Mask file is empty");
      }

      if (params.mask.size > 50 * 1024 * 1024) {
        throw new Error("Mask file is too large (max 50MB)");
      }

      console.log("📤 Starting mask upload using direct fetch...");

      // Создаем FormData для загрузки маски (только payload, type передается как query параметр)
      const formData = new FormData();
      formData.append("payload", params.mask);

      // Строим URL с query параметрами
      const queryParams = new URLSearchParams();
      queryParams.set("type", FileTypeEnum.IMAGE);
      if (params.projectId) queryParams.set("project_id", params.projectId);
      if (params.sceneId) queryParams.set("scene_id", params.sceneId);

      const apiUrl = `${config.url.replace(/\/+$/, "")}/api/v1/file/upload?${queryParams.toString()}`;

      // Отправляем запрос к SuperDuperAI API
      const uploadResponse = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        throw new Error(
          `Mask upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      const uploadResult = await uploadResponse.json();
      console.log("📤 Mask upload result:", uploadResult);

      return {
        maskId: uploadResult?.id,
        maskUrl: uploadResult?.url || undefined,
      };
    } catch (error) {
      console.error("Error uploading mask", error);
      return {
        error: `Mask upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  async generatePayload(
    params: ImageToImageParams,
    config?: { url: string; token: string }
  ): Promise<any> {
    const modelName = params.model?.name || "fal-ai/flux-dev";
    const isGPTImage = String(modelName).includes("gpt-image-1");

    let imageId: string | undefined;
    let imageUrl: string | undefined;
    let maskId: string | undefined;
    let maskUrl: string | undefined;

    if (params.sourceImageId) {
      imageId = params.sourceImageId;
      imageUrl = params.sourceImageUrl;
      console.log("🔍 ImageToImageStrategy: using sourceImageId:", imageId);
      console.log("🔍 ImageToImageStrategy: using sourceImageUrl:", imageUrl);
    } else if (config && params.file) {
      console.log("📤 Starting image upload...");
      const uploadResult = await this.handleImageUpload(params, config);
      console.log("📤 Image upload result:", uploadResult);

      // AICODE-NOTE: Проверяем ошибку загрузки и останавливаем генерацию
      if (uploadResult.error) {
        console.error("❌ Image upload failed:", uploadResult.error);
        throw new Error(`Image upload failed: ${uploadResult.error}`);
      }

      if (!uploadResult.imageId) {
        console.error("❌ No image ID returned from upload");
        throw new Error("Image upload failed: No image ID returned");
      }

      imageId = uploadResult.imageId;
      imageUrl = uploadResult.imageUrl;
    } else {
      console.log("⚠️ No config provided, skipping image upload");
    }

    if (params.mask) {
      console.log("🔍 ImageToImageStrategy: using mask");
      const uploadResult = await this.handleMaskUpload(params, config);

      // AICODE-NOTE: Проверяем ошибку загрузки маски и останавливаем генерацию
      if (uploadResult.error) {
        console.error("❌ Mask upload failed:", uploadResult.error);
        throw new Error(`Mask upload failed: ${uploadResult.error}`);
      }

      if (!uploadResult.maskId) {
        console.error("❌ No mask ID returned from upload");
        throw new Error("Mask upload failed: No mask ID returned");
      }

      maskId = uploadResult.maskId;
      maskUrl = uploadResult.maskUrl;
    }

    // Функция для безопасного экранирования URL для JSON
    const sanitizeUrl = (url: string | undefined): string | undefined => {
      if (!url) return undefined;
      const originalUrl = url;
      // Заменяем обратные слеши на прямые и убираем другие проблемные символы
      const sanitized = url.replace(/\\/g, "/").replace(/[\x00-\x1F\x7F]/g, "");
      if (originalUrl !== sanitized) {
        console.log("🔧 URL sanitized:", { original: originalUrl, sanitized });
      }
      return sanitized;
    };

    let references = [];
    if (imageId) {
      const sanitizedImageUrl = sanitizeUrl(imageUrl);
      references.push({
        type: "source",
        reference_id: imageId,
        reference_url: sanitizedImageUrl,
      });
      console.log("🔍 Added source reference:", {
        imageId,
        imageUrl: sanitizedImageUrl,
      });
    }
    if (maskId) {
      const sanitizedMaskUrl = sanitizeUrl(maskUrl);
      references.push({
        type: "mask",
        reference_id: maskId,
        reference_url: sanitizedMaskUrl,
      });
      console.log("🔍 Added mask reference:", {
        maskId,
        maskUrl: sanitizedMaskUrl,
      });
    }

    // Санитизируем все URL в references перед использованием в payload
    const sanitizedReferences = references.map((ref) => ({
      ...ref,
      reference_url: sanitizeUrl(ref.reference_url),
    }));

    console.log("🔍 Final references array:", sanitizedReferences);

    // Если передан файл, сначала загружаем его и используем reference_id
    // Примечание: загрузку выполним в generate() уровне выше, где доступен config.
    if (isGPTImage) {
      return {
        project_id: params?.projectId,
        scene_id: params?.sceneId,
        config: {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt || "",
          width: params.resolution?.width || 1920,
          height: params.resolution?.height || 1088,
          seed: params.seed || Math.floor(Math.random() * 1000000000000),
          generation_config_name: modelName,
          references: sanitizedReferences,
          entity_ids: [],
        },
        ...(imageId ? { file_ids: [imageId] } : {}),
      };
    }

    const requestedSteps = (params as any)?.steps;

    const payload = {
      project_id: params?.projectId,
      scene_id: params?.sceneId,
      config: {
        prompt: params.prompt,
        negative_prompt: params.negativePrompt || "",
        width: params.resolution?.width || 1920,
        height: params.resolution?.height || 1088,
        steps: typeof requestedSteps === "number" ? requestedSteps : 20,
        shot_size: null,
        seed: params.seed || Math.floor(Math.random() * 1000000000000),
        generation_config_name: modelName,
        style_name: null,
        references: sanitizedReferences,
        entity_ids: [],
      },
      ...(imageId ? { file_ids: [imageId] } : {}),
    };

    console.log(
      "🔍 ImageToImageStrategy: generated payload:",
      {
        modelName,
        imageId,
        resolution: params.resolution,
        payload,
      },
      references
    );

    return payload;
  }
}
