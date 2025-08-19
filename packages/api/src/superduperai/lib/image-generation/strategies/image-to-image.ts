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
      formData.append("payload", params.file);
      formData.append("type", "image");

      console.log(
        "📤 Sending upload request to:",
        `${config.url}/api/v1/file/upload`
      );

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

  async generatePayload(
    params: ImageToImageParams,
    config?: { url: string; token: string }
  ): Promise<any> {
    const modelName = params.model?.name || "fal-ai/flux-dev";
    const isGPTImage = String(modelName).includes("gpt-image-1");

    let imageId: string | undefined;
    let imageUrl: string | undefined;
    if (params.sourceImageId) {
      imageId = params.sourceImageId;
      imageUrl = params.sourceImageUrl;
      console.log("🔍 ImageToImageStrategy: using sourceImageId:", imageId);
      console.log("🔍 ImageToImageStrategy: using sourceImageUrl:", imageUrl);
    } else if (config) {
      console.log("📤 Starting image upload...");
      const uploadResult = await this.handleImageUpload(params, config);
      console.log("📤 Image upload result:", uploadResult);
      imageId = uploadResult.imageId;
      imageUrl = uploadResult.imageUrl;
    } else {
      console.log("⚠️ No config provided, skipping image upload");
    }

    // Если передан файл, сначала загружаем его и используем reference_id
    // Примечание: загрузку выполним в generate() уровне выше, где доступен config.
    if (isGPTImage) {
      return {
        config: {
          prompt: params.prompt,
          negative_prompt: params.negativePrompt || "",
          width: params.resolution?.width || 1920,
          height: params.resolution?.height || 1088,
          seed: params.seed || Math.floor(Math.random() * 1000000000000),
          generation_config_name: modelName,
          references: imageId
            ? [
                {
                  type: "source",
                  reference_id: imageId,
                  reference_url: imageUrl,
                },
              ]
            : [],
          entity_ids: [],
        },
        ...(imageId ? { file_ids: [imageId] } : {}),
      };
    }

    const requestedSteps = (params as any)?.steps;

    const payload = {
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
        references: imageId
          ? [
              {
                type: "source",
                reference_id: imageId,
                reference_url: imageUrl,
              },
            ]
          : [],
        entity_ids: [],
      },
      ...(imageId ? { file_ids: [imageId] } : {}),
    };

    console.log("🔍 ImageToImageStrategy: generated payload:", {
      modelName,
      imageId,
      resolution: params.resolution,
      payload,
    });

    return payload;
  }
}
