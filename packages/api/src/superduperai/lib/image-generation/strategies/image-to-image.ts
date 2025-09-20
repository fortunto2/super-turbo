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
      // AICODE-NOTE: Проверяем тип файла и создаем правильный File объект
      let fileToUpload = params.file;

      // Если это не File объект, создаем его
      if (fileToUpload && !(fileToUpload instanceof File)) {
        console.log("⚠️ File is not a File instance, creating File object");
        const fileAsBlob = fileToUpload as any;
        if (fileAsBlob instanceof Blob) {
          fileToUpload = new File(
            [fileAsBlob],
            params.file?.name || "uploaded-file",
            {
              type: params.file?.type || "image/jpeg",
            }
          );
        } else {
          throw new Error(`Invalid file type: ${typeof fileToUpload}`);
        }
      }

      // AICODE-NOTE: Исправляем MIME тип на основе расширения файла
      const fileName = fileToUpload.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      let correctMimeType = fileToUpload.type;
      if (fileExtension) {
        switch (fileExtension) {
          case "jpg":
          case "jpeg":
            correctMimeType = "image/jpeg";
            break;
          case "png":
            correctMimeType = "image/png";
            break;
          case "webp":
            correctMimeType = "image/webp";
            break;
          case "gif":
            correctMimeType = "image/gif";
            break;
          default:
            console.warn(
              `⚠️ Unknown file extension: ${fileExtension}, keeping original MIME type: ${fileToUpload.type}`
            );
        }
      }

      // Если MIME тип не соответствует расширению, создаем новый File объект
      if (correctMimeType !== fileToUpload.type) {
        console.log(
          `🔧 Fixing MIME type: ${fileToUpload.type} → ${correctMimeType}`
        );
        fileToUpload = new File([fileToUpload], fileName, {
          type: correctMimeType,
          lastModified: fileToUpload.lastModified,
        });
      }

      // AICODE-NOTE: Проверяем валидность файла
      if (fileToUpload.size === 0) {
        throw new Error("File is empty");
      }

      if (fileToUpload.size > 50 * 1024 * 1024) {
        // 50MB limit
        throw new Error("File is too large (max 50MB)");
      }

      console.log("📁 File object details:", {
        isFile: fileToUpload instanceof File,
        isBlob: fileToUpload instanceof Blob,
        name: fileToUpload.name,
        size: fileToUpload.size,
        type: fileToUpload.type,
        constructor: fileToUpload.constructor.name,
      });

      // AICODE-NOTE: Создаем файл с правильным именем и расширением
      const correctFileName = `${fileName.split(".")[0]}.${fileExtension}`;

      // AICODE-NOTE: Попробуем создать файл с правильным MIME типом и именем
      let finalFile: File;
      try {
        // Создаем новый File объект с правильными параметрами
        finalFile = new File([fileToUpload], correctFileName, {
          type: correctMimeType,
          lastModified: fileToUpload.lastModified,
        });

        console.log("🔧 Created final file:", {
          name: finalFile.name,
          type: finalFile.type,
          size: finalFile.size,
          lastModified: finalFile.lastModified,
        });
      } catch (error) {
        console.error("❌ Error creating final file:", error);
        // Fallback: используем оригинальный файл
        finalFile = fileToUpload;
      }

      console.log("📤 File details:", {
        fileName: finalFile.name,
        fileSize: finalFile.size,
        fileType: finalFile.type,
      });

      // AICODE-NOTE: Попробуем создать файл заново с правильными данными
      const fileBlob = await finalFile.arrayBuffer();
      const newFile = new File([fileBlob], finalFile.name, {
        type: finalFile.type,
        lastModified: finalFile.lastModified,
      });

      console.log("🔧 Created new file from ArrayBuffer:", {
        name: newFile.name,
        type: newFile.type,
        size: newFile.size,
        lastModified: newFile.lastModified,
      });

      // AICODE-NOTE: Создаем FormData правильно для загрузки файла
      const formData = new FormData();
      formData.append("payload", newFile, newFile.name);
      formData.append("type", FileTypeEnum.IMAGE);

      console.log(
        "📤 Sending upload request to:",
        `${config.url}/api/v1/file/upload`
      );

      // AICODE-NOTE: Дополнительная отладка FormData
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

      const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
          Accept: "application/json",
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
      console.log("📤 Upload result:", {
        id: uploadResult?.id,
        url: uploadResult?.url,
        type: uploadResult?.type,
        fullResult: uploadResult,
      });

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
    console.log("🔍 handleMaskUpload called with:", {
      hasMask: !!params.mask,
      maskType: params.mask?.type,
      maskSize: params.mask?.size,
      uploadUrl: `${config?.url}/api/v1/file/upload`,
    });

    if (!params.mask) {
      console.log("❌ No mask provided for upload");
      return {
        error: "No mask provided for upload",
      };
    }

    let maskId: string | undefined;
    let maskUrl: string | undefined;

    try {
      // AICODE-NOTE: Исправляем MIME тип маски на основе расширения файла
      let maskToUpload = params.mask;
      const maskFileName = maskToUpload.name;
      const maskFileExtension = maskFileName.split(".").pop()?.toLowerCase();

      let correctMaskMimeType = maskToUpload.type;
      if (maskFileExtension) {
        switch (maskFileExtension) {
          case "jpg":
          case "jpeg":
            correctMaskMimeType = "image/jpeg";
            break;
          case "png":
            correctMaskMimeType = "image/png";
            break;
          case "webp":
            correctMaskMimeType = "image/webp";
            break;
          case "gif":
            correctMaskMimeType = "image/gif";
            break;
          default:
            console.warn(
              `⚠️ Unknown mask file extension: ${maskFileExtension}, keeping original MIME type: ${maskToUpload.type}`
            );
        }
      }

      // Если MIME тип не соответствует расширению, создаем новый File объект
      if (correctMaskMimeType !== maskToUpload.type) {
        console.log(
          `🔧 Fixing mask MIME type: ${maskToUpload.type} → ${correctMaskMimeType}`
        );
        maskToUpload = new File([maskToUpload], maskFileName, {
          type: correctMaskMimeType,
          lastModified: maskToUpload.lastModified,
        });
      }

      // AICODE-NOTE: Проверяем валидность маски
      if (maskToUpload.size === 0) {
        throw new Error("Mask file is empty");
      }

      if (maskToUpload.size > 50 * 1024 * 1024) {
        // 50MB limit
        throw new Error("Mask file is too large (max 50MB)");
      }

      // AICODE-NOTE: Создаем маску с правильным именем и расширением
      const correctMaskFileName = `${maskFileName.split(".")[0]}.${maskFileExtension}`;

      // AICODE-NOTE: Попробуем создать маску с правильным MIME типом и именем
      let finalMaskFile: File;
      try {
        // Создаем новый File объект с правильными параметрами
        finalMaskFile = new File([maskToUpload], correctMaskFileName, {
          type: correctMaskMimeType,
          lastModified: maskToUpload.lastModified,
        });

        console.log("🔧 Created final mask file:", {
          name: finalMaskFile.name,
          type: finalMaskFile.type,
          size: finalMaskFile.size,
          lastModified: finalMaskFile.lastModified,
        });
      } catch (error) {
        console.error("❌ Error creating final mask file:", error);
        // Fallback: используем оригинальную маску
        finalMaskFile = maskToUpload;
      }

      console.log("📤 Mask file details:", {
        fileName: finalMaskFile.name,
        fileSize: finalMaskFile.size,
        fileType: finalMaskFile.type,
      });

      // AICODE-NOTE: Попробуем создать маску заново с правильными данными
      const maskBlob = await finalMaskFile.arrayBuffer();
      const newMaskFile = new File([maskBlob], finalMaskFile.name, {
        type: finalMaskFile.type,
        lastModified: finalMaskFile.lastModified,
      });

      console.log("🔧 Created new mask file from ArrayBuffer:", {
        name: newMaskFile.name,
        type: newMaskFile.type,
        size: newMaskFile.size,
        lastModified: newMaskFile.lastModified,
      });

      // AICODE-NOTE: Создаем FormData для загрузки маски
      const formData = new FormData();
      formData.append("payload", newMaskFile, newMaskFile.name);
      formData.append("type", FileTypeEnum.IMAGE);

      console.log(
        "📤 Sending mask upload request to:",
        `${config?.url}/api/v1/file/upload`
      );

      const uploadResponse = await fetch(`${config?.url}/api/v1/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config?.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
          Accept: "application/json",
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
