// @ts-nocheck
import type {
  ImageToVideoParams,
  VideoGenerationStrategy,
} from "../strategy.interface";

// Simple snake_case converter
function snakeCase(str: string | undefined | null): string | undefined {
  if (!str) return undefined;
  return str.trim().replace(/\s+/g, "_").toLowerCase();
}

// Helper function to extract string value from object or string
function getStringValue(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value.id) return value.id;
  if (typeof value === "object" && value.label) return value.label;
  return undefined;
}

// Simple resolution parser
function parseResolution(resolution: any): {
  width: number;
  height: number;
  aspectRatio: string;
} {
  if (typeof resolution === "string") {
    // Handle string format like "1920x1080" or "16:9"
    if (resolution.includes("x")) {
      const [width, height] = resolution.split("x").map(Number);
      return { width, height, aspectRatio: `${width}:${height}` };
    } else if (resolution.includes(":")) {
      const [width, height] = resolution.split(":").map(Number);
      return { width, height, aspectRatio: resolution };
    }
  }

  // Handle object format
  if (resolution && typeof resolution === "object") {
    const width = resolution.width || 1920;
    const height = resolution.height || 1080;
    const aspectRatio = resolution.aspectRatio || "16:9";
    return { width, height, aspectRatio };
  }

  // Default values
  return { width: 1920, height: 1080, aspectRatio: "16:9" };
}

export class ImageToVideoStrategy implements VideoGenerationStrategy {
  readonly type = "image-to-video";
  readonly requiresSourceImage = true;
  readonly requiresPrompt = false; // Animation description is optional

  validate(params: ImageToVideoParams): { valid: boolean; error?: string } {
    if (!params.file) {
      return {
        valid: false,
        error: "Source image is required for image-to-video generation",
      };
    }
    return { valid: true };
  }

  /**
   * Handle image upload to SuperDuperAI
   */
  async handleImageUpload(
    params: ImageToVideoParams,
    config: { url: string; token: string }
  ): Promise<{
    imageId?: string;
    imageUrl?: string;
    method: "upload" | "url";
    error?: string;
  }> {
    console.log("🔍 handleImageUpload called with:", {
      hasFile: !!params.file,
      fileType: typeof params.file === "string" ? "URL" : params.file?.type,
      fileSize: typeof params.file === "string" ? "N/A" : params.file?.size,
      uploadUrl: `${config.url}/api/v1/file/upload`,
    });

    if (!params.file) {
      console.log("❌ No file provided for upload");
      return {
        error: "No file provided for upload",
        method: "upload",
      };
    }

    // ✅ Если file это URL строка, создаем File объект
    let fileToUpload: File;
    if (typeof params.file === "string") {
      try {
        console.log("📤 Converting URL to File object:", params.file);
        const resp = await fetch(params.file);
        if (!resp.ok) {
          throw new Error(`Failed to fetch source image: ${resp.status}`);
        }
        const blob = await resp.blob();
        const filename = params.file.split("/").pop() || "source-image.jpg";
        fileToUpload = new File([blob], filename, { type: blob.type });
        console.log("✅ Created File object from URL:", {
          filename,
          size: fileToUpload.size,
          type: fileToUpload.type,
        });
      } catch (error) {
        console.error("❌ Failed to create File from URL:", error);
        return {
          error: `Failed to fetch image from URL: ${error}`,
          method: "upload",
        };
      }
    } else {
      fileToUpload = params.file;
    }

    try {
      const formData = new FormData();
      formData.append("payload", fileToUpload);
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
        method: typeof params.file === "string" ? "url" : "upload",
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
    params: ImageToVideoParams,
    config?: { url: string; token: string }
  ): Promise<any> {
    let imageId: string | undefined;

    console.log("🔍 ImageToVideoStrategy.generatePayload called with:", {
      hasConfig: !!config,
      hasFile: !!params.file,
      fileType: params.file?.type,
      fileSize: params.file?.size,
    });

    if (config) {
      console.log("📤 Starting image upload...");
      const uploadResult = await this.handleImageUpload(params, config);
      console.log("📤 Image upload result:", uploadResult);
      imageId = uploadResult.imageId;
    } else {
      console.log("⚠️ No config provided, skipping image upload");
    }

    const { width, height, aspectRatio } = parseResolution(params.resolution);

    const modelName =
      typeof params.model === "string"
        ? params.model
        : params.model?.name || "azure-openai/sora";

    const payload: any = {
      project_id: params?.projectId,
      scene_id: params?.sceneId,
      config: {
        prompt: params.prompt || "animate this image naturally", // Default for image-to-video
        generation_config_name: modelName,
        duration: params.duration,
        aspect_ratio: aspectRatio || "16:9",
        seed: params.seed || Math.floor(Math.random() * 1000000000000),
        negative_prompt: params.negativePrompt || "",
        width: width,
        height: height,
        frame_rate: params.frameRate,
        shot_size: snakeCase(getStringValue(params.shotSize)), // Extract string from object/string
        style_name: snakeCase(getStringValue(params.style)), // Extract string from object/string
        references: imageId
          ? [
              {
                type: "source",
                reference_id: imageId,
              },
            ]
          : [],
      },
    };

    console.log("📦 Final payload references:", {
      imageId,
      references: payload.config.references,
      referencesLength: payload.config.references.length,
    });

    return payload;
  }
}
