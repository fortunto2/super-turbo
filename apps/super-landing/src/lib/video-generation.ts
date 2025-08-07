import { getSuperduperAIConfig } from "@/lib/config/superduperai";

export interface VideoGenerationResult {
  success: boolean;
  fileId?: string;
  error?: string;
  message?: string;
}

export interface VideoGenerationParams {
  prompt: string;
  modelName: string;
  modelConfig?: {
    maxDuration?: number;
    aspectRatio?: string;
    width?: number;
    height?: number;
    frameRate?: number;
  };
  videoCount?: number;
}

export interface ImageToVideoParams extends VideoGenerationParams {
  file: File;
}

// Упрощенная функция для генерации видео
export async function generateVideoWithStrategy(
  generationType: "text-to-video" | "image-to-video",
  params: VideoGenerationParams | ImageToVideoParams
): Promise<VideoGenerationResult> {
  try {
    const config = getSuperduperAIConfig();

    console.log("🎬 Starting video generation:", {
      generationType,
      modelName: params.modelName,
      hasFile: "file" in params,
    });

    let payload: Record<string, unknown>;

    if (generationType === "image-to-video" && "file" in params) {
      // Image-to-video генерация
      console.log("🖼️ Preparing image-to-video payload");

      // Сначала загружаем файл на SuperDuperAI
      const formData = new FormData();
      formData.append("payload", params.file);

      console.log("📤 Uploading file to SuperDuperAI:", {
        fileName: params.file.name,
        fileSize: params.file.size,
        fileType: params.file.type,
        formDataKeys: Array.from(formData.keys()),
      });

      const uploadResponse = await fetch(`${config.url}/api/v1/file/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": "SuperDuperAI-Landing/1.0",
        },
        body: formData,
      });

      console.log("📥 Upload response status:", uploadResponse.status);
      console.log(
        "📥 Upload response headers:",
        Object.fromEntries(uploadResponse.headers.entries())
      );

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error("❌ File upload error:", errorText);
        throw new Error(
          `File upload failed: ${uploadResponse.status} - ${errorText}`
        );
      }

      const uploadResult = await uploadResponse.json();
      console.log("✅ File uploaded:", uploadResult);

      // Создаем payload для image-to-video
      payload = {
        type: "media",
        template_name: null,
        style_name: "flux_watercolor",
        config: {
          prompt: params.prompt,
          negative_prompt: "",
          width: params.modelConfig?.width || 1280,
          height: params.modelConfig?.height || 720,
          aspect_ratio: params.modelConfig?.aspectRatio || "16:9",
          seed: Math.floor(Math.random() * 1000000000000),
          generation_config_name: "google-cloud/veo2",
          duration: params.modelConfig?.maxDuration || 8,
          frame_rate: params.modelConfig?.frameRate || 30,
          batch_size: 1,
          shot_size: "medium_shot",
          style_name: "flux_watercolor",
          qualityType: "hd",
          entity_ids: [],
          references: [
            {
              type: "source",
              reference_url: uploadResult.url,
              reference_id: uploadResult.id,
            },
          ],
        },
      };
    } else {
      // Text-to-video генерация
      console.log("📝 Preparing text-to-video payload");

      payload = {
        type: "media",
        template_name: null,
        style_name: "flux_watercolor",
        config: {
          prompt: params.prompt,
          negative_prompt: "",
          width: params.modelConfig?.width || 1280,
          height: params.modelConfig?.height || 720,
          aspect_ratio: params.modelConfig?.aspectRatio || "16:9",
          seed: Math.floor(Math.random() * 1000000000000),
          generation_config_name: "google-cloud/veo2-text2video",
          duration: params.modelConfig?.maxDuration || 8,
          frame_rate: params.modelConfig?.frameRate || 30,
          batch_size: 1,
          shot_size: "medium_shot",
          style_name: "flux_watercolor",
          qualityType: "hd",
          entity_ids: [],
          references: [],
        },
      };
    }

    console.log(
      "📤 Sending payload to SuperDuperAI:",
      JSON.stringify(payload, null, 2)
    );

    // Отправляем запрос на генерацию видео
    const response = await fetch(`${config.url}/api/v1/file/generate-video`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Video generation error:", errorText);
      throw new Error(
        `Video generation failed: ${response.status} - ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ Video generation response:", result);

    const fileId = result.id;
    if (!fileId) {
      throw new Error("No file ID returned from API");
    }

    return {
      success: true,
      fileId,
      message: `${generationType} generation started! FileId: ${fileId}`,
    };
  } catch (error: unknown) {
    console.error(`❌ ${generationType} generation error:`, error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : `Unknown ${generationType} generation error`,
    };
  }
}
