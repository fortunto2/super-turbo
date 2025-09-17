// @ts-nocheck
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
    console.log("🔍 handleImageUpload called with:", {
      hasFile: !!params.file,
      fileType: params.file?.type,
      fileSize: params.file?.size,
      uploadUrl: `${config.url}/api/v1/file/upload`,
    });

    if (!params.file) {
      console.log("❌ No file provided for upload");
      return {
        error: "No file provided for upload",
        method: "upload",
      };
    }

    try {
      const formData = new FormData();
      formData.append("payload", params.file, params.file.name);
      formData.append("type", "image");

      console.log(
        "📤 Sending upload request to:",
        `${config.url}/api/v1/file/upload`
      );
      console.log("📤 FormData contents:", {
        hasPayload: formData.has("payload"),
        hasType: formData.has("type"),
        fileName: params.file.name,
        fileSize: params.file.size,
        fileType: params.file.type,
      });

      const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
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
      console.log("uploadResult", uploadResult);

      return {
        imageId: uploadResult?.id,
        imageUrl: uploadResult?.url || undefined,
        method: "upload",
      };
    } catch (error) {
      console.error("Error uploading file", error);
      return {
        error: "Image upload failed",
        method: "upload",
      };
    }
  }

  async handleMaskUpload(
    params: ImageToImageParams,
    config: { url: string; token: string }
  ): Promise<{
    maskId?: string;
    maskUrl?: string;
  }> {
    console.log("🔍 handleMaskUpload called with:", {
      hasMask: !!params.mask,
      maskType: params.mask?.type,
      maskSize: params.mask?.size,
      uploadUrl: `${config.url}/api/v1/file/upload`,
    });

    if (!params.mask) {
      console.log("❌ No mask provided for upload");
      return {
        error: "No mask provided for upload",
        method: "upload",
      };
    }

    let maskId: string | undefined;
    let maskUrl: string | undefined;

    try {
      const formData = new FormData();
      formData.append("payload", params.mask, params.mask.name);
      formData.append("type", "image");

      console.log(
        "📤 Sending mask upload request to:",
        `${config.url}/api/v1/file/upload`
      );
      console.log("📤 Mask FormData contents:", {
        hasPayload: formData.has("payload"),
        hasType: formData.has("type"),
        fileName: params.mask.name,
        fileSize: params.mask.size,
        fileType: params.mask.type,
      });

      const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
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
      console.log("uploadResult", uploadResult);
      maskId = uploadResult?.id;
      maskUrl = uploadResult?.url || undefined;

      return {
        maskId,
        maskUrl,
      };
    } catch (error) {
      console.error("Error uploading mask", error);
      return {
        error: "Mask upload failed",
        method: "upload",
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
      imageId = uploadResult.imageId;
      imageUrl = uploadResult.imageUrl;
    } else {
      console.log("⚠️ No config provided, skipping image upload");
    }

    if (params.mask) {
      console.log("🔍 ImageToImageStrategy: using mask");
      const uploadResult = await this.handleMaskUpload(params, config);
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
